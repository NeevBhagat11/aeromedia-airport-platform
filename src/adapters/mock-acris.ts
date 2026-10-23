import { AcrisZoneMeasurement, CrowdDemographics } from '@/types';
import { MOCK_ZONES } from '@/data/mock/zones';

export class MockAcrisAdapter {
  private measurements: Map<string, AcrisZoneMeasurement> = new Map();
  private rushHourMode = false;

  constructor() {
    this.refreshMeasurements('2026-10-23T14:00:00Z');
  }

  /**
   * Refreshes ACRIS telemetry for all airport zones given a simulation time
   * and optional rush-hour factor
   */
  public refreshMeasurements(simTimeStr: string): AcrisZoneMeasurement[] {
    const list: AcrisZoneMeasurement[] = [];

    for (const zone of MOCK_ZONES) {
      const multiplier = this.rushHourMode ? 1.45 : 1.0;
      const basePax = zone.totalPax;
      const totalPax = Math.round(basePax * multiplier);

      // Dwell time increases when zones are congested or when Gate 42 has delayed flights
      const dwellBase = zone.zoneId === 'Z-G42' ? 52 : zone.dwellMinutesAvg;
      const dwellTime = Math.round(dwellBase * (this.rushHourMode ? 1.3 : 1.0));

      const queueLength = zone.zoneId === 'Z-G42' 
        ? Math.round(65 * multiplier) 
        : Math.round(25 * multiplier);

      const waitTime = Math.round(queueLength / 6); // ~10-15 mins

      const measurement: AcrisZoneMeasurement = {
        id: `urn:ngsi-ld:PassengerFlowMeasurement:MET:${zone.terminal.replace(/\s+/g, '')}:${zone.zoneId}:${simTimeStr}`,
        type: 'PassengerFlowMeasurement',
        observedAt: simTimeStr,
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        terminal: zone.terminal,
        concourse: zone.concourse,
        queueLengthPax: queueLength,
        waitTimeMinutes: waitTime,
        dwellTimeMinutes: dwellTime,
        flowRatePaxPerHour: Math.round(totalPax * 1.8),
        confidenceLevel: 0.94,
        demographicEstimate: { ...zone.demographicShares },
      };

      this.measurements.set(zone.zoneId, measurement);
      list.push(measurement);
    }

    return list;
  }

  public getMeasurementForZone(zoneId: string): AcrisZoneMeasurement | undefined {
    return this.measurements.get(zoneId);
  }

  public getAllMeasurements(): AcrisZoneMeasurement[] {
    return Array.from(this.measurements.values());
  }

  public setRushHour(enabled: boolean, simTimeStr = '2026-10-23T14:00:00Z'): AcrisZoneMeasurement[] {
    this.rushHourMode = enabled;
    return this.refreshMeasurements(simTimeStr);
  }

  public isRushHour(): boolean {
    return this.rushHourMode;
  }

  /**
   * Produce valid NGSI-LD JSON payload for export or telemetry inspection
   */
  public getNgsiLdPayload(zoneId: string): Record<string, unknown> | null {
    const m = this.measurements.get(zoneId);
    if (!m) return null;

    return {
      '@context': [
        'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld',
        'https://airport-acris.org/context/passenger-flow.jsonld'
      ],
      id: m.id,
      type: m.type,
      observedAt: {
        type: 'Property',
        value: m.observedAt,
      },
      zoneIdentifier: {
        type: 'Property',
        value: m.zoneId,
      },
      terminal: {
        type: 'Property',
        value: m.terminal,
      },
      concourse: {
        type: 'Property',
        value: m.concourse,
      },
      passengerDensity: {
        type: 'Property',
        value: m.queueLengthPax,
        unitCode: 'PAX',
      },
      averageDwellTime: {
        type: 'Property',
        value: m.dwellTimeMinutes,
        unitCode: 'MIN',
      },
      queueWaitTime: {
        type: 'Property',
        value: m.waitTimeMinutes,
        unitCode: 'MIN',
      },
      flowThroughput: {
        type: 'Property',
        value: m.flowRatePaxPerHour,
        unitCode: 'PAX/H',
      },
      demographicEstimate: {
        type: 'Property',
        value: m.demographicEstimate,
      },
      confidenceScore: {
        type: 'Property',
        value: m.confidenceLevel,
      },
    };
  }
}

export const mockAcris = new MockAcrisAdapter();
