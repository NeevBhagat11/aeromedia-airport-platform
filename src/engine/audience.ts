import { Flight, Screen, ZonePresence, CrowdDemographics } from '@/types';
import { mockAcris } from '@/adapters/mock-acris';

export interface CalculatedAudience {
  zoneId: string;
  totalPax: number;
  dwellMinutesAvg: number;
  demographics: CrowdDemographics;
  activeFlights: Flight[];
  dominantFlight?: Flight;
  maxDelayMinutes: number;
  queueCongestion: number;
}

/**
 * Deterministically calculates audience presence for a screen or zone
 * combining flight schedules, gate dwell amplification, and ACRIS telemetry
 */
export function calculateAudienceForScreen(
  screen: Screen,
  simTime: Date,
  flights: Flight[],
  zones: ZonePresence[]
): CalculatedAudience {
  const zone = zones.find(z => z.zoneId === screen.zoneId);
  const acrisTelemetry = mockAcris.getMeasurementForZone(screen.zoneId);

  // Find flights relevant to this screen's gate or zone
  const associatedGates = new Set<string>();
  if (screen.gateId) {
    associatedGates.add(screen.gateId);
  }
  if (zone?.associatedGates) {
    for (const g of zone.associatedGates) {
      associatedGates.add(g);
    }
  }

  // Active time window: flights departing within -30 mins (just departed) to +120 mins
  const simTimeMs = simTime.getTime();
  const activeFlights = flights.filter(flight => {
    if (!associatedGates.has(flight.gate)) return false;

    const estTimeMs = new Date(flight.estimatedTime).getTime();
    const diffMinutes = (estTimeMs - simTimeMs) / (60 * 1000);

    // Active audience window: between 120 mins before departure and 15 mins after departure
    return diffMinutes >= -15 && diffMinutes <= 120;
  });

  // Calculate passenger counts and weighted demographics
  let totalPax = 0;
  let weightedBusiness = 0;
  let weightedHoliday = 0;
  let weightedFamily = 0;
  let weightedIntl = 0;
  let maxDelayMinutes = 0;

  for (const f of activeFlights) {
    totalPax += f.paxCount;
    weightedBusiness += f.paxCount * f.crowdDemographics.businessPct;
    weightedHoliday += f.paxCount * f.crowdDemographics.holidayPct;
    weightedFamily += f.paxCount * f.crowdDemographics.familyPct;
    weightedIntl += f.paxCount * f.crowdDemographics.internationalPct;
    if (f.delayMinutes > maxDelayMinutes) {
      maxDelayMinutes = f.delayMinutes;
    }
  }

  // Fallback to zone baseline or ACRIS measurement if no active flights at gate
  let demographics: CrowdDemographics;
  if (totalPax > 0) {
    demographics = {
      businessPct: Math.round(weightedBusiness / totalPax),
      holidayPct: Math.round(weightedHoliday / totalPax),
      familyPct: Math.round(weightedFamily / totalPax),
      internationalPct: Math.round(weightedIntl / totalPax),
    };
  } else if (acrisTelemetry) {
    totalPax = acrisTelemetry.queueLengthPax * 3;
    demographics = { ...acrisTelemetry.demographicEstimate };
  } else if (zone) {
    totalPax = zone.totalPax;
    demographics = { ...zone.demographicShares };
  } else {
    totalPax = 120;
    demographics = { businessPct: 30, holidayPct: 50, familyPct: 20, internationalPct: 70 };
  }

  // Calculate dwell time: base dwell + delay impact
  let dwellMinutesAvg = zone ? zone.dwellMinutesAvg : 35;
  if (acrisTelemetry) {
    dwellMinutesAvg = acrisTelemetry.dwellTimeMinutes;
  }
  // Delay amplification: 70% of delay time directly lengthens gate dwell
  if (maxDelayMinutes > 0) {
    dwellMinutesAvg += Math.round(maxDelayMinutes * 0.7);
  }

  // Find dominant flight (highest passenger count)
  const dominantFlight = activeFlights.length > 0 
    ? [...activeFlights].sort((a, b) => b.paxCount - a.paxCount)[0]
    : undefined;

  return {
    zoneId: screen.zoneId,
    totalPax,
    dwellMinutesAvg,
    demographics,
    activeFlights,
    dominantFlight,
    maxDelayMinutes,
    queueCongestion: acrisTelemetry ? acrisTelemetry.queueLengthPax : 30,
  };
}
