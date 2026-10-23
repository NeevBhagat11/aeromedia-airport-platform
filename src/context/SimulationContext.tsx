'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Flight, 
  Screen, 
  Campaign, 
  ZonePresence, 
  DecisionLog, 
  FlightEvent, 
  AidxMessage, 
  ScreenStatus,
  UserRole,
  Redemption,
  CurrencyType,
  IncidentAlert,
  RetailOutlet,
  AirlineProfile,
  GenAiCreativeDraft,
  CreativeApprovalItem,
  DelayGoodwillRule,
  CoMarketingPartnerOffer
} from '@/types';
import { MOCK_SCREENS } from '@/data/mock/screens';
import { MOCK_CAMPAIGNS } from '@/data/mock/campaigns';
import { MOCK_ZONES } from '@/data/mock/zones';
import { 
  INITIAL_INCIDENTS,
  INITIAL_RETAIL_OUTLETS,
  INITIAL_AIRLINES,
  INITIAL_CREATIVE_APPROVALS,
  INITIAL_GOODWILL_RULE,
  INITIAL_CO_MARKETING_OFFERS
} from '@/data/mock/admin-data';
import { mockAodb } from '@/adapters/mock-aodb';
import { mockAidx, AidxFlightLegUpdateInput } from '@/adapters/mock-aidx';
import { mockAcris } from '@/adapters/mock-acris';
import { calculateAudienceForScreen, CalculatedAudience } from '@/engine/audience';
import { scoreCampaignsForScreen } from '@/engine/scorer';

export type SimSpeed = 1 | 10 | 60;

export interface SimulationContextValue {
  // Clock & playback
  simTime: Date;
  simTimeFormatted: string;
  isPlaying: boolean;
  speed: SimSpeed;
  setSpeed: (speed: SimSpeed) => void;
  togglePlay: () => void;
  resetSimulation: () => void;
  resetDemoState: () => void;
  setSimTimeDirect: (hours: number, minutes: number) => void;

  // Role & Persona Switcher
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedRetailerOutlet: string;
  setSelectedRetailerOutlet: (outlet: string) => void;
  selectedAirline: string;
  setSelectedAirline: (airline: string) => void;

  // Domain Entities
  flights: Flight[];
  screens: Screen[];
  campaigns: Campaign[];
  zones: ZonePresence[];
  redemptions: Redemption[];
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  incidents: IncidentAlert[];
  acknowledgeIncident: (id: string) => void;
  retailOutlets: RetailOutlet[];
  addRetailOutlet: (outlet: RetailOutlet) => void;
  airlineProfiles: AirlineProfile[];
  addAirlineProfile: (airline: AirlineProfile) => void;
  creativeApprovals: CreativeApprovalItem[];
  approveCreative: (id: string) => void;
  rejectCreative: (id: string, reason: string) => void;
  delayGoodwillRule: DelayGoodwillRule;
  toggleGoodwillRule: () => void;
  triggerGoodwillVoucher: () => void;
  coMarketingOffers: CoMarketingPartnerOffer[];
  toggleCoMarketingOffer: (id: string) => void;
  deployGeneratedCampaign: (draft: GenAiCreativeDraft, budget: number, minPax?: number) => Campaign;
  addScreen: (screen: Screen) => void;
  
  // Selection
  selectedScreenId: string;
  setSelectedScreenId: (id: string) => void;
  selectedScreen: Screen | undefined;
  selectedAudience: CalculatedAudience | undefined;
  selectedDecisionLog: DecisionLog | undefined;

  // Logs & Telemetry
  decisionLogs: Record<string, DecisionLog>; // screenId -> latest DecisionLog
  eventLogs: FlightEvent[];
  aidxLogs: AidxMessage[];
  isRushHour: boolean;

  // Injections & Actions
  injectDelay: (flightNumber: string, delayMinutes: number) => void;
  swapGate: (flightNumber: string, newGate: string) => void;
  setScreenStatus: (screenId: string, status: ScreenStatus) => void;
  killScreen: (screenId: string) => void;
  toggleRushHour: () => void;
  triggerAidxXmlInjection: (input: AidxFlightLegUpdateInput) => void;
  runEngineForScreen: (screenId: string) => DecisionLog | null;
  addRedemption: (data: Omit<Redemption, 'id' | 'timestamp' | 'simTime'>) => Redemption;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

// Initial start time: 14:00 on 2026-10-23
const INITIAL_DATE = new Date('2026-10-23T14:00:00Z');

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [simTime, setSimTime] = useState<Date>(new Date(INITIAL_DATE));
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<SimSpeed>(1);

  // Role navigation state
  const [currentRole, setCurrentRole] = useState<UserRole>('SPLIT_SCREEN_DEMO');
  const [selectedRetailerOutlet, setSelectedRetailerOutlet] = useState<string>('Metropolis Duty Free');
  const [selectedAirline, setSelectedAirline] = useState<string>('Emirates/FlyMetropolis');

  // Currency
  const [currency, setCurrency] = useState<CurrencyType>('USD');

  // Domain state
  const [flights, setFlights] = useState<Flight[]>([]);
  const [screens, setScreens] = useState<Screen[]>(MOCK_SCREENS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [zones, setZones] = useState<ZonePresence[]>(MOCK_ZONES);
  const [incidents, setIncidents] = useState<IncidentAlert[]>(INITIAL_INCIDENTS);
  const [retailOutlets, setRetailOutlets] = useState<RetailOutlet[]>(INITIAL_RETAIL_OUTLETS);
  const [airlineProfiles, setAirlineProfiles] = useState<AirlineProfile[]>(INITIAL_AIRLINES);
  const [creativeApprovals, setCreativeApprovals] = useState<CreativeApprovalItem[]>(INITIAL_CREATIVE_APPROVALS);
  const [delayGoodwillRule, setDelayGoodwillRule] = useState<DelayGoodwillRule>(INITIAL_GOODWILL_RULE);
  const [coMarketingOffers, setCoMarketingOffers] = useState<CoMarketingPartnerOffer[]>(INITIAL_CO_MARKETING_OFFERS);

  const [redemptions, setRedemptions] = useState<Redemption[]>([
    {
      id: 'RED-INIT-01',
      promoCode: 'GATE42DELAY',
      campaignId: 'CAMP-COSTA-DELAY',
      campaignTitle: 'Flight Delayed? Enjoy Artisan Brew & Fresh Pastry',
      advertiserName: 'Costa Coffee & Express Bites',
      screenId: 'SCR-G42-01',
      timestamp: '2026-10-23T14:02:15Z',
      simTime: '2026-10-23T14:02:15Z',
      discountValue: '20% OFF',
      attributedRevenue: 14.80,
      status: 'REDEEMED',
    }
  ]);

  const [selectedScreenId, setSelectedScreenId] = useState<string>('SCR-G42-01');
  const [decisionLogs, setDecisionLogs] = useState<Record<string, DecisionLog>>({});
  const [eventLogs, setEventLogs] = useState<FlightEvent[]>([]);
  const [aidxLogs, setAidxLogs] = useState<AidxMessage[]>([]);
  const [isRushHour, setIsRushHour] = useState<boolean>(false);

  // Synchronous evaluator across all screens given current flights and time
  const evaluateAllScreens = useCallback((currentFlights: Flight[], currentSimTime: Date, currentScreensList: Screen[], currentCampaigns: Campaign[] = campaigns) => {
    if (currentFlights.length === 0) return;

    const timeStr = currentSimTime.toISOString();
    const newLogs: Record<string, DecisionLog> = {};
    const updatedScreens: Screen[] = [];

    for (const screen of currentScreensList) {
      if (screen.status === 'OFFLINE') {
        updatedScreens.push({ ...screen, currentAdId: null });
        continue;
      }

      const audience = calculateAudienceForScreen(screen, currentSimTime, currentFlights, zones);
      const result = scoreCampaignsForScreen(screen, audience, currentCampaigns, timeStr);

      if (result) {
        newLogs[screen.id] = result.decisionLog;
        updatedScreens.push({
          ...screen,
          currentAdId: result.winningCampaign.id,
        });
      } else {
        updatedScreens.push(screen);
      }
    }

    setDecisionLogs(prev => ({ ...prev, ...newLogs }));
    setScreens(updatedScreens);
  }, [campaigns, zones]);

  // Initialize data on mount
  useEffect(() => {
    mockAodb.init();
    mockAodb.getFlights().then(f => {
      setFlights(f);
      evaluateAllScreens(f, INITIAL_DATE, MOCK_SCREENS, MOCK_CAMPAIGNS);
    });

    // Subscribe to AODB flight events
    const unsubAodb = mockAodb.subscribe(event => {
      setEventLogs(prev => [event, ...prev.slice(0, 49)]);
      mockAodb.getFlights().then(f => {
        setFlights([...f]);
      });
    });

    // Subscribe to AIDX messages
    const unsubAidx = mockAidx.subscribe(msg => {
      setAidxLogs(prev => [msg, ...prev.slice(0, 29)]);
    });

    // Seed initial AIDX log with XY501 delay
    const initialAidx = mockAidx.triggerXY501Delay(45, INITIAL_DATE.toISOString());
    setAidxLogs([initialAidx.message]);

    return () => {
      unsubAodb();
      unsubAidx();
    };
  }, [evaluateAllScreens]);

  // Sync role from URL query param if present (?role=RETAILER etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role') || params.get('view');
      if (roleParam) {
        const upper = roleParam.toUpperCase();
        if (upper === 'RETAILER' || upper === 'PLATFORM_ADMIN' || upper === 'MEDIA_MANAGER' || upper === 'AIRLINE_REP' || upper === 'PASSENGER_SCREEN' || upper === 'SPLIT_SCREEN_DEMO') {
          setCurrentRole(upper as UserRole);
        } else if (upper.includes('ADMIN')) {
          setCurrentRole('PLATFORM_ADMIN');
        } else if (upper.includes('RETAIL')) {
          setCurrentRole('RETAILER');
        } else if (upper.includes('MEDIA')) {
          setCurrentRole('MEDIA_MANAGER');
        } else if (upper.includes('AIRLINE')) {
          setCurrentRole('AIRLINE_REP');
        }
      }
    }
  }, []);

  // Format Sim Time string
  const simTimeFormatted = useMemo(() => {
    const hours = simTime.getUTCHours().toString().padStart(2, '0');
    const mins = simTime.getUTCMinutes().toString().padStart(2, '0');
    const secs = simTime.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${mins}:${secs} UTC`;
  }, [simTime]);

  // Clock progression ticker
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 1000;
    const timer = setInterval(() => {
      setSimTime(prev => {
        const next = new Date(prev.getTime() + speed * 1000);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Periodic re-evaluation when flights change or minute increments
  useEffect(() => {
    if (flights.length > 0) {
      evaluateAllScreens(flights, simTime, screens, campaigns);
    }
  }, [flights, simTime.getMinutes(), isRushHour, campaigns]);

  // Injections with IMMEDIATE reactive re-scoring (< 100ms)
  const injectDelay = useCallback((flightNumber: string, delayMinutes: number) => {
    const timeStr = simTime.toISOString();
    mockAidx.emitFlightLegNotif({
      flightNumber,
      delayMinutes,
      simTimeStr: timeStr,
      delayReasonCode: delayMinutes > 30 ? '93' : '41',
      delayReasonText: delayMinutes > 30 
        ? 'AIRCRAFT ROTATION DELAY DUE TO LATE ARRIVING INBOUND' 
        : 'GROUND HANDLING & CARGO LOADING DELAY',
      statusCode: delayMinutes > 15 ? 'DEL' : 'SCH',
    });

    // Immediate reactive update
    mockAodb.getFlights().then(updatedFlights => {
      setFlights([...updatedFlights]);
      evaluateAllScreens(updatedFlights, simTime, screens, campaigns);
    });
  }, [simTime, screens, campaigns, evaluateAllScreens]);

  const swapGate = useCallback((flightNumber: string, newGate: string) => {
    const timeStr = simTime.toISOString();
    mockAidx.triggerGateSwap(flightNumber, newGate, timeStr);

    // Immediate reactive update
    mockAodb.getFlights().then(updatedFlights => {
      setFlights([...updatedFlights]);
      evaluateAllScreens(updatedFlights, simTime, screens, campaigns);
    });
  }, [simTime, screens, campaigns, evaluateAllScreens]);

  const setScreenStatus = useCallback((screenId: string, status: ScreenStatus) => {
    setScreens(prev => {
      const updated = prev.map(s => s.id === screenId ? { ...s, status } : s);
      evaluateAllScreens(flights, simTime, updated, campaigns);
      return updated;
    });

    // Raise alert if screen went offline
    if (status === 'OFFLINE') {
      const newAlert: IncidentAlert = {
        id: `INC-${Date.now()}`,
        screenId,
        title: `Screen ${screenId} Offline - Watchdog Alert`,
        description: `Hardware heartbeat lost on node ${screenId}. Standby failover active.`,
        severity: 'P1',
        category: 'HARDWARE',
        timestamp: simTime.toISOString(),
        acknowledged: false,
        assignedTo: 'NOC Hardware Ops',
      };
      setIncidents(prev => [newAlert, ...prev]);
    }
  }, [flights, simTime, campaigns, evaluateAllScreens]);

  const killScreen = useCallback((screenId: string) => {
    setScreenStatus(screenId, 'OFFLINE');
  }, [setScreenStatus]);

  const toggleRushHour = useCallback(() => {
    const next = !isRushHour;
    setIsRushHour(next);
    mockAcris.setRushHour(next, simTime.toISOString());
    evaluateAllScreens(flights, simTime, screens, campaigns);
  }, [isRushHour, simTime, flights, screens, campaigns, evaluateAllScreens]);

  const triggerAidxXmlInjection = useCallback((input: AidxFlightLegUpdateInput) => {
    mockAidx.emitFlightLegNotif({
      ...input,
      simTimeStr: simTime.toISOString(),
    });
    mockAodb.getFlights().then(updatedFlights => {
      setFlights([...updatedFlights]);
      evaluateAllScreens(updatedFlights, simTime, screens, campaigns);
    });
  }, [simTime, screens, campaigns, evaluateAllScreens]);

  const runEngineForScreen = useCallback((screenId: string): DecisionLog | null => {
    const screen = screens.find(s => s.id === screenId);
    if (!screen) return null;

    const audience = calculateAudienceForScreen(screen, simTime, flights, zones);
    const result = scoreCampaignsForScreen(screen, audience, campaigns, simTime.toISOString());

    if (result) {
      setDecisionLogs(prev => ({ ...prev, [screen.id]: result.decisionLog }));
      setScreens(prev => prev.map(s => s.id === screenId ? { ...s, currentAdId: result.winningCampaign.id } : s));
      return result.decisionLog;
    }
    return null;
  }, [screens, simTime, flights, zones, campaigns]);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const resetSimulation = useCallback(() => {
    const freshDate = new Date(INITIAL_DATE);
    setSimTime(freshDate);
    setIsPlaying(false);
    mockAodb.init();
    mockAodb.getFlights().then(f => {
      setFlights(f);
      evaluateAllScreens(f, freshDate, MOCK_SCREENS, MOCK_CAMPAIGNS);
    });
    mockAcris.setRushHour(false);
    setIsRushHour(false);
    setScreens(MOCK_SCREENS);
    setIncidents(INITIAL_INCIDENTS);
  }, [evaluateAllScreens]);

  const resetDemoState = useCallback(() => {
    resetSimulation();
    setSelectedScreenId('SCR-G42-01');
  }, [resetSimulation]);

  const setSimTimeDirect = useCallback((hours: number, minutes: number) => {
    setSimTime(prev => {
      const next = new Date(prev);
      next.setUTCHours(hours, minutes, 0, 0);
      return next;
    });
  }, []);

  const addRedemption = useCallback((data: Omit<Redemption, 'id' | 'timestamp' | 'simTime'>): Redemption => {
    const newRedemption: Redemption = {
      ...data,
      id: `RED-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: simTime.toISOString(),
      simTime: simTimeFormatted,
    };

    setRedemptions(prev => [newRedemption, ...prev]);

    // Also increment campaign impressions / performance
    setCampaigns(prev => prev.map(c => {
      if (c.id === data.campaignId) {
        return {
          ...c,
          impressionsDelivered: c.impressionsDelivered + 1,
        };
      }
      return c;
    }));

    return newRedemption;
  }, [simTime, simTimeFormatted]);

  // Phase 3 Actions: Incidents, Master Data, Approvals, Goodwill
  const acknowledgeIncident = useCallback((id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, acknowledged: true } : inc));
  }, []);

  const addRetailOutlet = useCallback((outlet: RetailOutlet) => {
    setRetailOutlets(prev => [outlet, ...prev]);
  }, []);

  const addAirlineProfile = useCallback((airline: AirlineProfile) => {
    setAirlineProfiles(prev => [airline, ...prev]);
  }, []);

  const addScreen = useCallback((screen: Screen) => {
    setScreens(prev => {
      const updated = [screen, ...prev];
      evaluateAllScreens(flights, simTime, updated, campaigns);
      return updated;
    });
  }, [flights, simTime, campaigns, evaluateAllScreens]);

  const approveCreative = useCallback((id: string) => {
    setCreativeApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED' } : item));
  }, []);

  const rejectCreative = useCallback((id: string, reason: string) => {
    setCreativeApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'REJECTED', safetyCheckNotes: `Rejected: ${reason}` } : item));
  }, []);

  const toggleGoodwillRule = useCallback(() => {
    setDelayGoodwillRule(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const triggerGoodwillVoucher = useCallback(() => {
    // Inject delay on flight XY501 to test Goodwill Care
    injectDelay('XY501', 50);
  }, [injectDelay]);

  const toggleCoMarketingOffer = useCallback((id: string) => {
    setCoMarketingOffers(prev => prev.map(o => o.id === id ? { ...o, authorized: !o.authorized } : o));
  }, []);

  const deployGeneratedCampaign = useCallback((draft: GenAiCreativeDraft, budget: number, minPax = 100): Campaign => {
    const newCampaign: Campaign = {
      id: `CAMP-AI-${Date.now()}`,
      advertiserName: draft.badgeText.includes('FAMILY') ? 'Sweet Delights Confectionery' : 'Metropolis Retail Merchant',
      title: draft.headline,
      category: 'Confectionery & Family',
      targetSegments: ['Leisure Holidaymakers', 'Family Travelers', 'Domestic Flights'],
      hardFilters: {
        minPax,
      },
      boostRules: [
        {
          id: `BR-AI-${Date.now()}`,
          conditionType: 'HIGH_LEISURE',
          description: 'Holiday demographic exceeds 45%',
          threshold: 45,
          multiplier: 1.6,
        },
      ],
      creativeUrl: draft.imageUrl,
      headline: draft.headline,
      subheadline: draft.subheadline,
      callToAction: draft.callToAction,
      badgeText: draft.badgeText,
      promoCode: draft.promoCode,
      accentColor: draft.accentColor,
      budget,
      cpm: 25.00,
      impressionsDelivered: 0,
      status: 'ACTIVE',
    };

    setCampaigns(prev => {
      const updated = [newCampaign, ...prev];
      evaluateAllScreens(flights, simTime, screens, updated);
      return updated;
    });

    return newCampaign;
  }, [flights, simTime, screens, evaluateAllScreens]);

  // Selected screen telemetry
  const selectedScreen = useMemo(() => {
    return screens.find(s => s.id === selectedScreenId) || screens[0];
  }, [screens, selectedScreenId]);

  const selectedAudience = useMemo(() => {
    if (!selectedScreen) return undefined;
    return calculateAudienceForScreen(selectedScreen, simTime, flights, zones);
  }, [selectedScreen, simTime, flights, zones]);

  const selectedDecisionLog = useMemo(() => {
    return selectedScreen ? decisionLogs[selectedScreen.id] : undefined;
  }, [selectedScreen, decisionLogs]);

  const value: SimulationContextValue = {
    simTime,
    simTimeFormatted,
    isPlaying,
    speed,
    setSpeed,
    togglePlay,
    resetSimulation,
    resetDemoState,
    setSimTimeDirect,
    currentRole,
    setCurrentRole,
    selectedRetailerOutlet,
    setSelectedRetailerOutlet,
    selectedAirline,
    setSelectedAirline,
    flights,
    screens,
    campaigns,
    zones,
    redemptions,
    currency,
    setCurrency,
    incidents,
    acknowledgeIncident,
    retailOutlets,
    addRetailOutlet,
    airlineProfiles,
    addAirlineProfile,
    creativeApprovals,
    approveCreative,
    rejectCreative,
    delayGoodwillRule,
    toggleGoodwillRule,
    triggerGoodwillVoucher,
    coMarketingOffers,
    toggleCoMarketingOffer,
    deployGeneratedCampaign,
    addScreen,
    selectedScreenId,
    setSelectedScreenId,
    selectedScreen,
    selectedAudience,
    selectedDecisionLog,
    decisionLogs,
    eventLogs,
    aidxLogs,
    isRushHour,
    injectDelay,
    swapGate,
    setScreenStatus,
    killScreen,
    toggleRushHour,
    triggerAidxXmlInjection,
    runEngineForScreen,
    addRedemption,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

const defaultFallbackValue: SimulationContextValue = {
  simTime: new Date(INITIAL_DATE),
  simTimeFormatted: '14:00:00 UTC',
  isPlaying: false,
  speed: 1,
  setSpeed: () => {},
  togglePlay: () => {},
  resetSimulation: () => {},
  resetDemoState: () => {},
  setSimTimeDirect: () => {},
  currentRole: 'SPLIT_SCREEN_DEMO',
  setCurrentRole: () => {},
  selectedRetailerOutlet: 'Metropolis Duty Free',
  setSelectedRetailerOutlet: () => {},
  selectedAirline: 'Emirates/FlyMetropolis',
  setSelectedAirline: () => {},
  flights: [],
  screens: MOCK_SCREENS,
  campaigns: MOCK_CAMPAIGNS,
  zones: MOCK_ZONES,
  redemptions: [],
  currency: 'USD',
  setCurrency: () => {},
  incidents: INITIAL_INCIDENTS,
  acknowledgeIncident: () => {},
  retailOutlets: INITIAL_RETAIL_OUTLETS,
  addRetailOutlet: () => {},
  airlineProfiles: INITIAL_AIRLINES,
  addAirlineProfile: () => {},
  creativeApprovals: INITIAL_CREATIVE_APPROVALS,
  approveCreative: () => {},
  rejectCreative: () => {},
  delayGoodwillRule: INITIAL_GOODWILL_RULE,
  toggleGoodwillRule: () => {},
  triggerGoodwillVoucher: () => {},
  coMarketingOffers: INITIAL_CO_MARKETING_OFFERS,
  toggleCoMarketingOffer: () => {},
  deployGeneratedCampaign: () => MOCK_CAMPAIGNS[0],
  addScreen: () => {},
  selectedScreenId: 'SCR-G42-01',
  setSelectedScreenId: () => {},
  selectedScreen: MOCK_SCREENS[0],
  selectedAudience: undefined,
  selectedDecisionLog: undefined,
  decisionLogs: {},
  eventLogs: [],
  aidxLogs: [],
  isRushHour: false,
  injectDelay: () => {},
  swapGate: () => {},
  setScreenStatus: () => {},
  killScreen: () => {},
  toggleRushHour: () => {},
  triggerAidxXmlInjection: () => {},
  runEngineForScreen: () => null,
  addRedemption: () => ({
    id: 'RED-FALLBACK',
    promoCode: 'GATE42DELAY',
    campaignId: 'CAMP-COSTA-DELAY',
    campaignTitle: 'Costa Coffee',
    advertiserName: 'Costa Coffee',
    screenId: 'SCR-G42-01',
    timestamp: '2026-10-23T14:00:00Z',
    simTime: '14:00:00 UTC',
    discountValue: '20% OFF',
    attributedRevenue: 15,
    status: 'REDEEMED',
  }),
};

export function useAirportSimulation(): SimulationContextValue {
  const context = useContext(SimulationContext);
  if (!context) {
    return defaultFallbackValue;
  }
  return context;
}
