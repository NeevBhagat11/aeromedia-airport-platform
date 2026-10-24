import { Flight, FlightEvent } from '@/types';
import { FlightSource } from './types';
import { generateSeedFlights } from '@/data/mock/flights-seed';

export class MockAodbAdapter implements FlightSource {
  private flights: Map<string, Flight> = new Map();
  private eventListeners: Set<(event: FlightEvent) => void> = new Set();
  private eventQueue: FlightEvent[] = [];
  private queueResolvers: Array<() => void> = [];

  constructor() {
    this.init();
  }

  public init(): void {
    const seeds = generateSeedFlights();
    this.flights.clear();
    for (const flight of seeds) {
      this.flights.set(flight.flightNumber, flight);
    }
    this.eventQueue = [];
  }

  public async getFlights(): Promise<Flight[]> {
    return Array.from(this.flights.values());
  }

  public getFlightByNumber(flightNumber: string): Flight | undefined {
    return this.flights.get(flightNumber);
  }

  public getFlightsByGate(gate: string): Flight[] {
    return Array.from(this.flights.values()).filter(f => f.gate === gate);
  }

  public updateFlight(flightNumber: string, updates: Partial<Flight>): Flight | undefined {
    const existing = this.flights.get(flightNumber);
    if (!existing) return undefined;

    const updated: Flight = {
      ...existing,
      ...updates,
    };
    this.flights.set(flightNumber, updated);
    return updated;
  }

  public emitEvent(event: FlightEvent): void {
    this.eventQueue.push(event);
    for (const listener of this.eventListeners) {
      listener(event);
    }
    // Wake up any waiting async iterators
    const resolvers = [...this.queueResolvers];
    this.queueResolvers = [];
    for (const resolve of resolvers) {
      resolve();
    }
  }

  public subscribe(listener: (event: FlightEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  public async *streamEvents(): AsyncIterable<FlightEvent> {
    while (true) {
      if (this.eventQueue.length > 0) {
        yield this.eventQueue.shift()!;
      } else {
        await new Promise<void>(resolve => {
          this.queueResolvers.push(resolve);
        });
      }
    }
  }

  /**
   * Directly inject a delay into AODB and emit flight delay event
   */
  public injectDelay(flightNumber: string, delayMinutes: number, simTimeStr = '2026-10-23T14:00:00Z'): FlightEvent | null {
    const flight = this.flights.get(flightNumber);
    if (!flight) return null;

    const previousDelay = flight.delayMinutes;
    const previousEst = flight.estimatedTime;

    const schedDate = new Date(flight.scheduledTime);
    schedDate.setMinutes(schedDate.getMinutes() + delayMinutes);
    const newEst = schedDate.toISOString();

    const newStatus = delayMinutes > 15 ? 'DELAYED' : 'ON_TIME';

    this.updateFlight(flightNumber, {
      delayMinutes,
      estimatedTime: newEst,
      status: newStatus,
    });

    const event: FlightEvent = {
      id: `EV-AODB-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: simTimeStr,
      simTime: simTimeStr,
      eventType: 'FLIGHT_DELAY',
      flightNumber,
      previousValue: `${previousDelay}m (${previousEst})`,
      newValue: `${delayMinutes}m (${newEst})`,
      source: 'AODB',
      details: `AODB schedule update: Flight ${flightNumber} delay changed from ${previousDelay}m to ${delayMinutes}m. Status: ${newStatus}.`,
    };

    this.emitEvent(event);
    return event;
  }

  /**
   * Trigger a gate swap in AODB
   */
  public swapGate(flightNumber: string, newGate: string, simTimeStr = '2026-10-23T14:00:00Z'): FlightEvent | null {
    const flight = this.flights.get(flightNumber);
    if (!flight) return null;

    const previousGate = flight.gate;
    this.updateFlight(flightNumber, { gate: newGate });

    const event: FlightEvent = {
      id: `EV-AODB-GATE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: simTimeStr,
      simTime: simTimeStr,
      eventType: 'GATE_CHANGE',
      flightNumber,
      previousValue: previousGate,
      newValue: newGate,
      source: 'AODB',
      details: `AODB Gate Assignment update: Flight ${flightNumber} reassigned from ${previousGate} to ${newGate}.`,
    };

    this.emitEvent(event);
    return event;
  }
}

// Export singleton instance for app-wide decoupled data feed
export const mockAodb = new MockAodbAdapter();
