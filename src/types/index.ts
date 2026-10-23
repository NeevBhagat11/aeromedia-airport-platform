/**
 * Airport Retail Media Platform - Canonical Data Models
 * Standards compliant with AODB, IATA AIDX, and ACI ACRIS (NGSI-LD)
 */

export type FlightStatus = 'ON_TIME' | 'DELAYED' | 'BOARDING' | 'DEPARTED';

export type ScreenOrientation = '16:9' | '9:16';

export type ScreenStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export type CampaignStatus = 'ACTIVE' | 'PENDING';

export interface CrowdDemographics {
  businessPct: number;      // 0 - 100
  holidayPct: number;       // 0 - 100
  familyPct: number;        // 0 - 100
  internationalPct: number; // 0 - 100
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  scheduledTime: string;    // ISO 8601 string, e.g. "2026-10-23T14:35:00Z"
  estimatedTime: string;    // ISO 8601 string, e.g. "2026-10-23T15:20:00Z"
  actualTime?: string;
  gate: string;             // e.g. "Gate 42"
  terminal: string;         // e.g. "Terminal 1"
  concourse: string;        // e.g. "Concourse B"
  paxCount: number;         // e.g. 240
  status: FlightStatus;
  delayMinutes: number;     // e.g. 45
  crowdDemographics: CrowdDemographics;
  aircraftType?: string;    // e.g. "B777-300ER", "A321neo"
  flightType?: 'DEPARTURE' | 'ARRIVAL';
}

export interface Screen {
  id: string;
  code: string;             // e.g. "SCR-G42-01"
  name: string;             // e.g. "Gate 42 Holdroom Totem A"
  zoneId: string;           // e.g. "ZONE-G42"
  gateId?: string;          // e.g. "Gate 42"
  terminal: string;         // e.g. "Terminal 1"
  concourse: string;        // e.g. "Concourse B"
  orientation: ScreenOrientation;
  status: ScreenStatus;
  currentAdId?: string | null;
  resolution?: string;      // e.g. "3840x2160"
  physicalLocation?: string;
}

export interface CampaignHardFilters {
  minPax?: number;
  allowedZones?: string[];
  allowedTerminals?: string[];
  minDwellMinutes?: number;
  requiredOrientation?: ScreenOrientation | 'ANY';
  onlyIfDelayed?: boolean;
  minBusinessPct?: number;
  minHolidayPct?: number;
  minInternationalPct?: number;
}

export type BoostConditionType = 
  | 'HIGH_DELAY' 
  | 'HIGH_BUSINESS' 
  | 'HIGH_LEISURE' 
  | 'HIGH_DWELL' 
  | 'DESTINATION_MATCH' 
  | 'QUEUE_CONGESTION';

export interface CampaignBoostRule {
  id: string;
  conditionType: BoostConditionType;
  description: string;
  threshold?: number;
  multiplier: number;       // e.g. 1.5 (+50% score)
  targetValue?: string | string[];
}

export interface Campaign {
  id: string;
  advertiserName: string;
  title: string;
  category: string;         // e.g. "Luxury Retail", "Grab & Go F&B", "Travel & Resorts"
  targetSegments: string[]; // e.g. ["Delayed Passengers", "Business Frequent Flyers"]
  hardFilters: CampaignHardFilters;
  boostRules: CampaignBoostRule[];
  creativeUrl: string;
  headline: string;
  subheadline: string;
  callToAction: string;
  badgeText?: string;
  promoCode?: string;
  accentColor?: string;     // for UI rendering
  budget: number;           // e.g. 25000 USD
  cpm: number;              // Cost per mille impressions
  impressionsDelivered: number;
  status: CampaignStatus;
}

export interface ZonePresence {
  zoneId: string;
  zoneName: string;
  terminal: string;
  concourse: string;
  totalPax: number;
  dwellMinutesAvg: number;
  demographicShares: CrowdDemographics;
  associatedGates: string[];
  activeFlightIds: string[];
}

export interface CandidateScore {
  campaignId: string;
  advertiserName: string;
  title: string;
  baseScore: number;
  finalScore: number;
  disqualified: boolean;
  disqualificationReason?: string;
  appliedBoosts: Array<{
    ruleId: string;
    description: string;
    multiplier: number;
    pointsAdded: number;
  }>;
  reasons: string[];
}

export interface DecisionLog {
  id: string;
  screenId: string;
  screenCode: string;
  zoneId: string;
  timestamp: string;        // ISO string
  simTime: string;          // Simulation clock at decision
  winningCampaignId: string;
  winningCampaignName: string;
  score: number;
  evidenceTrail: string[];  // source events, timestamps, trigger reasons
  candidateScores: CandidateScore[];
  audienceSnapshot: {
    totalPax: number;
    dwellMinutesAvg: number;
    demographics: CrowdDemographics;
    dominantFlightNumber?: string;
    dominantDestination?: string;
    flightDelayMinutes?: number;
  };
}

export type FlightEventType = 
  | 'FLIGHT_DELAY' 
  | 'GATE_CHANGE' 
  | 'STATUS_CHANGE' 
  | 'PAX_UPDATE' 
  | 'NEW_FLIGHT';

export interface FlightEvent {
  id: string;
  timestamp: string;
  simTime: string;
  eventType: FlightEventType;
  flightNumber: string;
  previousValue: string | number;
  newValue: string | number;
  source: 'AODB' | 'AIDX' | 'ACRIS' | 'OPERATOR_OVERRIDE';
  details: string;
  rawPayload?: string;
}

export interface AidxMessage {
  messageId: string;
  timestamp: string;
  messageType: 'IATA_AIDX_FlightLegNotifRQ';
  flightNumber: string;
  airline: string;
  airlineCode: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  estimatedDeparture: string;
  gate: string;
  terminal: string;
  statusCode: string;
  delayReasonCode?: string;
  delayReasonText?: string;
  rawXml: string;
}

/**
 * ACRIS NGSI-LD Entity Model
 * ACI (Airports Council International) Passenger Flow & Queue Metric Standards
 */
export interface AcrisZoneMeasurement {
  id: string;               // urn:ngsi-ld:PassengerFlowMeasurement:MET:T1:Z-G42:2026-10-23T14:00:00Z
  type: 'PassengerFlowMeasurement' | 'QueueWaitTime';
  observedAt: string;
  zoneId: string;
  zoneName: string;
  terminal: string;
  concourse: string;
  queueLengthPax: number;
  waitTimeMinutes: number;
  dwellTimeMinutes: number;
  flowRatePaxPerHour: number;
  confidenceLevel: number;  // 0.0 - 1.0
  demographicEstimate: CrowdDemographics;
}

export type UserRole = 
  | 'PLATFORM_ADMIN' 
  | 'RETAILER' 
  | 'MEDIA_MANAGER' 
  | 'AIRLINE_REP' 
  | 'PASSENGER_SCREEN' 
  | 'SPLIT_SCREEN_DEMO';

export interface Redemption {
  id: string;
  promoCode: string;
  campaignId: string;
  campaignTitle: string;
  advertiserName: string;
  screenId: string;
  timestamp: string;
  simTime: string;
  discountValue: string;
  attributedRevenue: number;
  status: 'CLAIMED' | 'REDEEMED';
}

export type CurrencyType = 'USD' | 'EUR' | 'AED';

export interface IncidentAlert {
  id: string;
  screenId?: string;
  title: string;
  description: string;
  severity: 'P1' | 'P2' | 'P3';
  category: 'HARDWARE' | 'FEED' | 'CREATIVE' | 'NETWORK';
  timestamp: string;
  acknowledged: boolean;
  assignedTo?: string;
}

export interface RetailOutlet {
  id: string;
  name: string;
  category: string;
  terminal: string;
  concourse: string;
  zoneId: string;
  nearestGate: string;
  status: 'OPEN' | 'BUSY' | 'CLOSED';
  footfallIndex: number;
}

export interface AirlineProfile {
  code: string;
  name: string;
  terminal: string;
  concourse: string;
  fleetTier: string;
  dailyFlights: number;
  partnershipStatus: 'ACTIVE' | 'PENDING';
}

export interface GenAiCreativeDraft {
  headline: string;
  subheadline: string;
  callToAction: string;
  badgeText: string;
  promoCode: string;
  accentColor: string;
  imageUrl: string;
  language: 'EN' | 'ES' | 'AR' | 'HI';
  fitScore: number;
  audienceReasoning: string;
  discountPercent?: number;
  localizedContent?: Record<'EN' | 'ES' | 'AR' | 'HI', {
    headline: string;
    subheadline: string;
    callToAction: string;
    badgeText: string;
  }>;
}

export interface CreativeApprovalItem {
  id: string;
  campaignId: string;
  campaignTitle: string;
  advertiserName: string;
  category: string;
  creativeUrl: string;
  zoneId: string;
  submittedAt: string;
  brandSafetyStatus: 'PASSED' | 'WARNING' | 'FAILED';
  safetyCheckNotes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DelayGoodwillRule {
  enabled: boolean;
  delayThresholdMinutes: number;
  voucherDiscount: string;
  sponsorPartner: string;
  targetGateScreens: string[];
  costSplit: string;
}

export interface CoMarketingPartnerOffer {
  id: string;
  retailerName: string;
  category: string;
  offerTitle: string;
  commissionPct: number;
  exclusiveAirlineBonus: string;
  authorized: boolean;
}
