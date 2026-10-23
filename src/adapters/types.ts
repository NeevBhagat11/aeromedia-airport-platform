import { Flight, FlightEvent } from '@/types';

export interface FlightSource {
  getFlights(): Promise<Flight[]>;
  streamEvents(): AsyncIterable<FlightEvent>;
}

export interface FlightEventListener {
  (event: FlightEvent): void;
}
