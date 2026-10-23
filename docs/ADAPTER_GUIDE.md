# AeroMedia Aviation Data Adapter Guide

## 1. Architectural Philosophy: Decoupled Data Isolation

Airports rely on mission-critical, heterogeneous, legacy systems. A platform serving digital out-of-home (DOOH) advertising must **never tightly couple** its business logic, audience calculation, or auction engines to proprietary airport message formats.

AeroMedia adheres strictly to the **Adapter Pattern (Ports and Adapters / Hexagonal Architecture)**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Aviation Data Feeds                                    │
│  [Airport Operational Database]     [IATA AIDX XML Bus]     [ACI ACRIS Sensor Queues]  │
└───────────────────────────────┬──────────────────────┬─────────────────────────────────┘
                                │                      │
                                ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              AeroMedia Adapter Layer                                   │
│  • AodbAdapter                • AidxXmlAdapter       • AcrisNgsiLdAdapter              │
│  • Transforms vendor formats into Normalized Canonical TypeScript Domain Models        │
└──────────────────────────────────────────────┬─────────────────────────────────────────┘
                                               │
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Canonical Domain Core                                    │
│  • Flight (ID, Origin, Dest, STD, ETD, Gate, Pax, Demographics, DelayMinutes)         │
│  • Screen (Orientation, Pod Location, Resolution, Hardware Status)                     │
│  • ZonePresence (Queue Pax, Dwell Time, Flow Rate)                                     │
└──────────────────────────────────────────────┬─────────────────────────────────────────┘
                                               │
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    AeroMedia Deterministic Scoring & Rules Engine                      │
│  • Demographic Match + Surge Multiplier + Dwell Boost + Flight Status Gating           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Code Contract: `FlightSource`

Every flight data provider in AeroMedia implements the canonical `FlightSource` contract defined in [`src/adapters/types.ts`](file:///c:/airport/src/adapters/types.ts):

```typescript
import { Flight, FlightEvent } from '@/types';

export interface FlightSource {
  /**
   * Snapshot query for all currently scheduled/active flights at the airport.
   */
  getFlights(): Promise<Flight[]>;

  /**
   * Asynchronous event stream broadcasting live flight leg state changes.
   * Emits updates for gate swaps, delays, boarding status, and cancellations.
   */
  streamEvents(): AsyncIterable<FlightEvent>;

  /**
   * Push-based event subscription callback alternative.
   */
  subscribe?(listener: (event: FlightEvent) => void): () => void;
}
```

---

## 3. How Airport IT Swaps Mocks for Live Production Feeds

In a production deployment, airport engineers do **not** touch the ad decision engine, UI components, or scoring rules. They simply point the adapter factory to their live enterprise broker or endpoint using environment variables:

```bash
# In .env.production:
FLIGHT_SOURCE=sita-ams
SITA_AMS_WS_URL=wss://ams.metropolis-airport.com/feed/v2
SITA_AMS_API_KEY=sec_live_948839201948194
AIDX_BROKER_URL=amqps://aidx.metropolis-airport.com:5671/flights
ACRIS_NGSI_LD_ENDPOINT=https://acris.metropolis-airport.com/ngsi-ld/v1/entities
```

### Factory Initialization Pattern

```typescript
// src/adapters/factory.ts
import { FlightSource } from './types';
import { MockAodbAdapter } from './mock-aodb';
import { SitaAmsLiveAdapter } from './vendor/sita-ams-adapter';
import { AmadeusLiveAdapter } from './vendor/amadeus-adapter';

export function getFlightSource(): FlightSource {
  const source = process.env.FLIGHT_SOURCE || 'mock';

  switch (source) {
    case 'sita-ams':
      return new SitaAmsLiveAdapter({
        endpoint: process.env.SITA_AMS_WS_URL!,
        apiKey: process.env.SITA_AMS_API_KEY!,
      });

    case 'amadeus-aodb':
      return new AmadeusLiveAdapter({
        url: process.env.AMADEUS_AODB_URL!,
      });

    case 'mock':
    default:
      return new MockAodbAdapter();
  }
}
```

---

## 4. Vendor Adapter Implementation Example: Live SITA / WebSocket

Below is a production-grade template implementing `FlightSource` for an enterprise streaming WebSocket feed:

```typescript
// src/adapters/vendor/sita-ams-adapter.ts
import { FlightSource } from '../types';
import { Flight, FlightEvent } from '@/types';

export class SitaAmsLiveAdapter implements FlightSource {
  private ws: WebSocket | null = null;
  private listeners: Set<(event: FlightEvent) => void> = new Set();

  constructor(private config: { endpoint: string; apiKey: string }) {}

  async getFlights(): Promise<Flight[]> {
    const res = await fetch(`${this.config.endpoint}/snapshot`, {
      headers: { Authorization: `Bearer ${this.config.apiKey}` }
    });
    const vendorPayload = await res.json();
    return vendorPayload.flights.map(this.mapVendorToFlight);
  }

  async *streamEvents(): AsyncIterable<FlightEvent> {
    const queue: FlightEvent[] = [];
    let resolveNext: (() => void) | null = null;

    this.subscribe(event => {
      queue.push(event);
      if (resolveNext) {
        resolveNext();
        resolveNext = null;
      }
    });

    while (true) {
      if (queue.length > 0) {
        yield queue.shift()!;
      } else {
        await new Promise<void>(res => { resolveNext = res; });
      }
    }
  }

  subscribe(listener: (event: FlightEvent) => void): () => void {
    this.listeners.add(listener);
    this.ensureConnected();
    return () => this.listeners.delete(listener);
  }

  private ensureConnected() {
    if (this.ws) return;
    this.ws = new WebSocket(this.config.endpoint);
    this.ws.onmessage = (msg) => {
      const vendorEvent = JSON.parse(msg.data.toString());
      const canonicalEvent = this.mapVendorEventToCanonical(vendorEvent);
      this.listeners.forEach(cb => cb(canonicalEvent));
    };
  }

  private mapVendorToFlight(raw: any): Flight {
    return {
      id: raw.flight_id,
      flightNumber: raw.ident,
      airline: raw.operator_name,
      airlineCode: raw.iata_code,
      origin: raw.dep_iata,
      originCity: raw.dep_city,
      destination: raw.arr_iata,
      destinationCity: raw.arr_city,
      scheduledTime: raw.std_utc,
      estimatedTime: raw.etd_utc || raw.std_utc,
      gate: `Gate ${raw.departure_gate}`,
      terminal: raw.terminal_name,
      concourse: raw.concourse_id,
      paxCount: raw.booked_passengers || 180,
      status: raw.delay_minutes > 15 ? 'DELAYED' : 'ON_TIME',
      delayMinutes: raw.delay_minutes || 0,
      crowdDemographics: {
        businessPct: raw.biz_class_ratio * 100,
        holidayPct: raw.leisure_ratio * 100,
        familyPct: raw.group_ratio * 100,
        internationalPct: raw.is_intl ? 100 : 0,
      },
    };
  }

  private mapVendorEventToCanonical(raw: any): FlightEvent {
    return {
      id: `EVT-${Date.now()}`,
      flightNumber: raw.flight_number,
      timestamp: new Date().toISOString(),
      type: raw.event_type === 'GATE_CHG' ? 'GATE_CHANGE' : 'DELAY',
      details: raw.description,
      previousValue: raw.old_val,
      newValue: raw.new_val,
    };
  }
}
```

---

## 5. Supported Industry Standards

| Aviation Standard | Message Version | AeroMedia Adapter Implementation | Real-World Application |
| :--- | :--- | :--- | :--- |
| **AODB (Airport Operational DB)** | Custom REST / SQL / CDC | [`src/adapters/mock-aodb.ts`](file:///c:/airport/src/adapters/mock-aodb.ts) | Canonical source of master flight schedule, gate podium assignments, and passenger bookings. |
| **IATA AIDX** | v16.1 XML / JSON Schema | [`src/adapters/mock-aidx.ts`](file:///c:/airport/src/adapters/mock-aidx.ts) | High-speed push updates for operational status, delay reason codes (IATA 93, 41), and off-block timings. |
| **ACI ACRIS** | NGSI-LD Context Entities | [`src/adapters/mock-acris.ts`](file:///c:/airport/src/adapters/mock-acris.ts) | LiDAR / Bluetooth BLE crowd queue sensors, holdroom dwell meters, and passenger flow velocity. |
