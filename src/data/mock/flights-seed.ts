import { Flight, CrowdDemographics } from '@/types';

// Seed date matching local time: 2026-10-23
const BASE_DATE = '2026-10-23';

interface AirlineMeta {
  code: string;
  name: string;
  type: 'FLAG' | 'LEISURE' | 'LOW_COST' | 'REGIONAL';
  hubs: string[];
}

const AIRLINES: AirlineMeta[] = [
  { code: 'XY', name: 'Metropolis Airways', type: 'FLAG', hubs: ['DXB', 'LHR', 'JFK', 'SIN', 'HND', 'FRA'] },
  { code: 'ZQ', name: 'SunVacation Air', type: 'LEISURE', hubs: ['MLE', 'CUN', 'PMI', 'HKT', 'HNL', 'IBZ'] },
  { code: 'BA', name: 'Global British', type: 'FLAG', hubs: ['LHR', 'EDI', 'MAN', 'DUB'] },
  { code: 'LH', name: 'EuroLufthansa', type: 'FLAG', hubs: ['FRA', 'MUC', 'ZRH', 'VIE'] },
  { code: 'EK', name: 'Emirates SkyLink', type: 'FLAG', hubs: ['DXB', 'DOH', 'AUH'] },
  { code: 'AF', name: 'SkyFrance Express', type: 'FLAG', hubs: ['CDG', 'NCE', 'LYS'] },
  { code: 'DL', name: 'Delta Atlantic', type: 'FLAG', hubs: ['ATL', 'JFK', 'BOS', 'DTW'] },
  { code: 'SQ', name: 'Pacific Singapore', type: 'FLAG', hubs: ['SIN', 'BKK', 'DPS'] },
  { code: 'U2', name: 'EuroHop Jet', type: 'LOW_COST', hubs: ['AMS', 'BCN', 'MXP', 'BER'] },
  { code: 'KL', name: 'Royal Orange Line', type: 'FLAG', hubs: ['AMS', 'CPH', 'ARN'] },
];

const DESTINATIONS: Record<string, { city: string; beach: boolean; luxury: boolean; business: boolean }> = {
  DXB: { city: 'Dubai', beach: true, luxury: true, business: true },
  MLE: { city: 'Malé (Maldives)', beach: true, luxury: true, business: false },
  LHR: { city: 'London Heathrow', beach: false, luxury: true, business: true },
  JFK: { city: 'New York JFK', beach: false, luxury: true, business: true },
  CDG: { city: 'Paris Charles de Gaulle', beach: false, luxury: true, business: true },
  SIN: { city: 'Singapore Changi', beach: false, luxury: true, business: true },
  HND: { city: 'Tokyo Haneda', beach: false, luxury: true, business: true },
  FRA: { city: 'Frankfurt Main', beach: false, luxury: false, business: true },
  CUN: { city: 'Cancún', beach: true, luxury: false, business: false },
  HKT: { city: 'Phuket', beach: true, luxury: false, business: false },
  PMI: { city: 'Palma de Mallorca', beach: true, luxury: false, business: false },
  HNL: { city: 'Honolulu', beach: true, luxury: true, business: false },
  AMS: { city: 'Amsterdam Schiphol', beach: false, luxury: false, business: true },
  BCN: { city: 'Barcelona El Prat', beach: true, luxury: false, business: true },
  ZRH: { city: 'Zürich', beach: false, luxury: true, business: true },
  DOH: { city: 'Doha Hamad', beach: false, luxury: true, business: true },
  SYD: { city: 'Sydney Kingsford', beach: true, luxury: true, business: true },
  MIA: { city: 'Miami International', beach: true, luxury: true, business: true },
  SFO: { city: 'San Francisco', beach: false, luxury: false, business: true },
  ORD: { city: 'Chicago O\'Hare', beach: false, luxury: false, business: true },
};

export function generateSeedFlights(): Flight[] {
  const flights: Flight[] = [];

  // 1. Mandatory Flight XY501 to DXB (240 pax, Gate 42, delayed 45 min)
  flights.push({
    id: 'FL-XY501',
    flightNumber: 'XY501',
    airline: 'Metropolis Airways',
    airlineCode: 'XY',
    origin: 'MET',
    originCity: 'Metropolis Hub',
    destination: 'DXB',
    destinationCity: 'Dubai',
    scheduledTime: `${BASE_DATE}T14:35:00Z`,
    estimatedTime: `${BASE_DATE}T15:20:00Z`,
    gate: 'Gate 42',
    terminal: 'Terminal 1',
    concourse: 'Concourse B',
    paxCount: 240,
    status: 'DELAYED',
    delayMinutes: 45,
    crowdDemographics: {
      businessPct: 48,
      holidayPct: 32,
      familyPct: 20,
      internationalPct: 88,
    },
    aircraftType: 'B777-300ER',
    flightType: 'DEPARTURE',
  });

  // 2. Mandatory Flight ZQ88 to leisure beach destination (180 pax, Gate 42, on time)
  flights.push({
    id: 'FL-ZQ88',
    flightNumber: 'ZQ88',
    airline: 'SunVacation Air',
    airlineCode: 'ZQ',
    origin: 'MET',
    originCity: 'Metropolis Hub',
    destination: 'MLE',
    destinationCity: 'Malé (Maldives)',
    scheduledTime: `${BASE_DATE}T15:45:00Z`,
    estimatedTime: `${BASE_DATE}T15:45:00Z`,
    gate: 'Gate 42',
    terminal: 'Terminal 1',
    concourse: 'Concourse B',
    paxCount: 180,
    status: 'ON_TIME',
    delayMinutes: 0,
    crowdDemographics: {
      businessPct: 12,
      holidayPct: 76,
      familyPct: 12,
      internationalPct: 94,
    },
    aircraftType: 'A330-300',
    flightType: 'DEPARTURE',
  });

  // 3. Generate remaining ~300 flights covering full schedule from 06:00 to 23:45
  const destKeys = Object.keys(DESTINATIONS);
  let flightCounter = 100;

  // We generate 305 more flights across the day
  for (let hour = 6; hour <= 23; hour++) {
    const flightsInHour = hour >= 13 && hour <= 18 ? 22 : 14; // Peak bank around afternoon demo time (14:00)

    for (let f = 0; f < flightsInHour; f++) {
      flightCounter++;
      const minute = (f * 60 / flightsInHour + (flightCounter % 5)) % 60;
      const minuteStr = Math.floor(minute).toString().padStart(2, '0');
      const hourStr = hour.toString().padStart(2, '0');

      const airline = AIRLINES[flightCounter % AIRLINES.length];
      const destCode = destKeys[(flightCounter + f) % destKeys.length];
      const destInfo = DESTINATIONS[destCode];

      // Assign terminal & gates: 1-15: Concourse A (T1), 16-30: Concourse C (T2), 31-50: Concourse B (T1)
      const gateNum = (flightCounter % 50) + 1;
      // Skip Gate 42 around 14:00-16:00 to avoid conflicting with our two key demo flights
      let assignedGate = `Gate ${gateNum}`;
      if (gateNum === 42 && hour >= 14 && hour <= 16) {
        assignedGate = `Gate ${43 + (flightCounter % 5)}`;
      }

      let terminal = 'Terminal 1';
      let concourse = 'Concourse B';
      if (gateNum <= 15) {
        terminal = 'Terminal 1';
        concourse = 'Concourse A';
      } else if (gateNum <= 30) {
        terminal = 'Terminal 2';
        concourse = 'Concourse C';
      }

      // Demographics based on destination type & airline
      let businessPct = 25;
      let holidayPct = 45;
      let familyPct = 20;
      let internationalPct = 60;

      if (destInfo.business) {
        businessPct = 40 + (flightCounter % 35);
        holidayPct = 100 - businessPct - 15;
        familyPct = 15;
      } else if (destInfo.beach) {
        holidayPct = 60 + (flightCounter % 25);
        businessPct = 10 + (flightCounter % 15);
        familyPct = 100 - holidayPct - businessPct;
      }

      if (destCode !== 'ORD' && destCode !== 'ATL' && destCode !== 'JFK') {
        internationalPct = 75 + (flightCounter % 25);
      }

      // Aircraft and capacity
      const isWidebody = destCode === 'DXB' || destCode === 'SIN' || destCode === 'HND' || destCode === 'SYD' || destCode === 'JFK';
      const paxCount = isWidebody 
        ? 220 + (flightCounter % 160) 
        : 90 + (flightCounter % 110);

      // Delay profile: ~15% of flights have minor delays (10-35m), ~3% have major delays (40-90m)
      let delayMinutes = 0;
      let status: Flight['status'] = 'ON_TIME';

      if (flightCounter % 7 === 0) {
        delayMinutes = 15 + (flightCounter % 25);
        status = 'DELAYED';
      } else if (flightCounter % 29 === 0) {
        delayMinutes = 45 + (flightCounter % 55);
        status = 'DELAYED';
      } else if (hour < 14) {
        status = 'DEPARTED';
      } else if (hour === 14 && minute < 20) {
        status = 'BOARDING';
      }

      const scheduledTime = `${BASE_DATE}T${hourStr}:${minuteStr}:00Z`;
      const estDate = new Date(`${scheduledTime}`);
      estDate.setMinutes(estDate.getMinutes() + delayMinutes);
      const estimatedTime = estDate.toISOString();

      const flightNumber = `${airline.code}${200 + (flightCounter % 790)}`;

      flights.push({
        id: `FL-${flightNumber}-${flightCounter}`,
        flightNumber,
        airline: airline.name,
        airlineCode: airline.code,
        origin: 'MET',
        originCity: 'Metropolis Hub',
        destination: destCode,
        destinationCity: destInfo.city,
        scheduledTime,
        estimatedTime,
        gate: assignedGate,
        terminal,
        concourse,
        paxCount,
        status,
        delayMinutes,
        crowdDemographics: {
          businessPct,
          holidayPct,
          familyPct,
          internationalPct,
        },
        aircraftType: isWidebody ? 'A350-900' : 'A321neo',
        flightType: 'DEPARTURE',
      });
    }
  }

  // Sort chronologically by scheduled time
  flights.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

  return flights;
}
