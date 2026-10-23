import { AidxMessage, FlightEvent } from '@/types';
import { mockAodb } from './mock-aodb';

export interface AidxFlightLegUpdateInput {
  flightNumber: string;
  airlineCode?: string;
  airlineName?: string;
  origin?: string;
  destination?: string;
  scheduledTime?: string;
  estimatedTime?: string;
  gate?: string;
  terminal?: string;
  delayMinutes?: number;
  delayReasonCode?: string;
  delayReasonText?: string;
  statusCode?: 'DEL' | 'SCH' | 'BRD' | 'DEP' | 'CNL';
  simTimeStr?: string;
}

export class MockAidxAdapter {
  private messageHistory: AidxMessage[] = [];
  private listeners: Set<(msg: AidxMessage) => void> = new Set();

  public subscribe(listener: (msg: AidxMessage) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getRecentMessages(limit = 20): AidxMessage[] {
    return this.messageHistory.slice(-limit);
  }

  /**
   * Generates authentic IATA AIDX XML format string
   * standard: IATA Aviation Information Data Exchange (AIDX) FlightLegNotifRQ
   */
  public generateAidxXml(input: AidxFlightLegUpdateInput): string {
    const timestamp = input.simTimeStr || '2026-10-23T14:00:00Z';
    const flight = mockAodb.getFlightByNumber(input.flightNumber);

    const airlineCode = input.airlineCode || flight?.airlineCode || input.flightNumber.substring(0, 2);
    const flightNumOnly = input.flightNumber.replace(/^[A-Z0-9]{2}/, '');
    const origin = input.origin || flight?.origin || 'MET';
    const destination = input.destination || flight?.destination || 'DXB';
    const originDate = (input.scheduledTime || flight?.scheduledTime || '2026-10-23').split('T')[0];
    const sbt = input.scheduledTime || flight?.scheduledTime || '2026-10-23T14:35:00Z';
    const est = input.estimatedTime || flight?.estimatedTime || '2026-10-23T15:20:00Z';
    const gate = input.gate || flight?.gate || 'Gate 42';
    const gateId = gate.replace(/[^0-9]/g, '');
    const terminal = input.terminal || flight?.terminal || 'Terminal 1';
    const statusCode = input.statusCode || (input.delayMinutes && input.delayMinutes > 0 ? 'DEL' : 'SCH');
    const delayReasonCode = input.delayReasonCode || '93';
    const delayReasonText = input.delayReasonText || 'AIRCRAFT ROTATION LATE ARRIVAL';
    const delayMinutes = input.delayMinutes ?? (flight?.delayMinutes || 0);

    return `<?xml version="1.0" encoding="UTF-8"?>
<IATA_AIDX_FlightLegNotifRQ xmlns="http://www.iata.org/IATA/2007/00" 
                           TimeStamp="${timestamp}" 
                           Version="16.1">
  <FlightLeg>
    <LegIdentifier>
      <Airline CodeContext="3">${airlineCode}</Airline>
      <FlightNumber>${flightNumOnly}</FlightNumber>
      <DepartureAirport CodeContext="3">${origin}</DepartureAirport>
      <ArrivalAirport CodeContext="3">${destination}</ArrivalAirport>
      <OriginDate>${originDate}</OriginDate>
    </LegIdentifier>
    <LegData>
      <PublicDepartureStatus>${statusCode}</PublicDepartureStatus>
      <OperationStatus>${statusCode === 'DEL' ? 'Delayed' : statusCode === 'BRD' ? 'Boarding' : 'Operational'}</OperationStatus>
      <DepartureInformation>
        <AirportFacilityStatus>
          <FacilityType>Gate</FacilityType>
          <FacilityIdentifier>${gateId}</FacilityIdentifier>
          <TerminalIdentifier>${terminal}</TerminalIdentifier>
        </AirportFacilityStatus>
        <DepartureTimes>
          <Time Type="SBT">${sbt}</Time>
          <Time Type="EST">${est}</Time>
        </DepartureTimes>
        ${delayMinutes > 0 ? `
        <DelayInformation>
          <DelayReason Code="${delayReasonCode}">${delayReasonText}</DelayReason>
          <DelayDuration>PT${delayMinutes}M</DelayDuration>
        </DelayInformation>` : ''}
      </DepartureInformation>
    </LegData>
  </FlightLeg>
</IATA_AIDX_FlightLegNotifRQ>`.trim();
  }

  /**
   * Broadcasts an AIDX flight update notification message into the platform
   * and synchronizes with AODB and downstream systems
   */
  public emitFlightLegNotif(input: AidxFlightLegUpdateInput): { message: AidxMessage; event: FlightEvent } {
    const flight = mockAodb.getFlightByNumber(input.flightNumber);
    const rawXml = this.generateAidxXml(input);
    const messageId = `AIDX-MSG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = input.simTimeStr || '2026-10-23T14:00:00Z';

    const estTime = input.estimatedTime || (
      input.delayMinutes !== undefined && flight
        ? (() => {
            const d = new Date(flight.scheduledTime);
            d.setMinutes(d.getMinutes() + input.delayMinutes);
            return d.toISOString();
          })()
        : flight?.estimatedTime || timestamp
    );

    const aidxMsg: AidxMessage = {
      messageId,
      timestamp,
      messageType: 'IATA_AIDX_FlightLegNotifRQ',
      flightNumber: input.flightNumber,
      airline: input.airlineName || flight?.airline || 'Airline',
      airlineCode: input.airlineCode || flight?.airlineCode || input.flightNumber.substring(0, 2),
      origin: input.origin || flight?.origin || 'MET',
      destination: input.destination || flight?.destination || 'DXB',
      scheduledDeparture: input.scheduledTime || flight?.scheduledTime || timestamp,
      estimatedDeparture: estTime,
      gate: input.gate || flight?.gate || 'Gate 42',
      terminal: input.terminal || flight?.terminal || 'Terminal 1',
      statusCode: input.statusCode || (input.delayMinutes ? 'DEL' : 'SCH'),
      delayReasonCode: input.delayReasonCode || (input.delayMinutes ? '93' : undefined),
      delayReasonText: input.delayReasonText || (input.delayMinutes ? 'AIRCRAFT ROTATION LATE ARRIVAL' : undefined),
      rawXml,
    };

    this.messageHistory.push(aidxMsg);

    // Synchronize to AODB
    if (input.delayMinutes !== undefined || input.gate) {
      mockAodb.updateFlight(input.flightNumber, {
        ...(input.delayMinutes !== undefined ? {
          delayMinutes: input.delayMinutes,
          estimatedTime: estTime,
          status: input.delayMinutes > 15 ? 'DELAYED' : 'ON_TIME',
        } : {}),
        ...(input.gate ? { gate: input.gate } : {}),
      });
    }

    // Generate FlightEvent
    const event: FlightEvent = {
      id: `EV-AIDX-${Date.now()}`,
      timestamp,
      simTime: input.simTimeStr || '2026-10-23T14:00:00Z',
      eventType: input.gate ? 'GATE_CHANGE' : 'FLIGHT_DELAY',
      flightNumber: input.flightNumber,
      previousValue: flight ? (input.gate ? flight.gate : `${flight.delayMinutes}m`) : 'unknown',
      newValue: input.gate ? input.gate : `${input.delayMinutes}m`,
      source: 'AIDX',
      details: input.gate 
        ? `AIDX IATA_AIDX_FlightLegNotifRQ: Gate swapped to ${input.gate} for ${input.flightNumber}.`
        : `AIDX IATA_AIDX_FlightLegNotifRQ: Flight ${input.flightNumber} delay set to ${input.delayMinutes}m (ETA: ${estTime}) - Reason: ${aidxMsg.delayReasonText}.`,
      rawPayload: rawXml,
    };

    mockAodb.emitEvent(event);

    // Notify listeners
    for (const listener of this.listeners) {
      listener(aidxMsg);
    }

    return { message: aidxMsg, event };
  }

  /**
   * Helper specifically for the required demo scenario:
   * Delay Flight XY501 to DXB by 45 minutes
   */
  public triggerXY501Delay(delayMinutes = 45, simTimeStr = '2026-10-23T14:00:00Z') {
    return this.emitFlightLegNotif({
      flightNumber: 'XY501',
      airlineCode: 'XY',
      airlineName: 'Metropolis Airways',
      destination: 'DXB',
      gate: 'Gate 42',
      terminal: 'Terminal 1',
      delayMinutes,
      delayReasonCode: '93',
      delayReasonText: 'INBOUND AIRCRAFT LATE ARRIVAL FROM LHR DUE TO ATC SECTOR CONGESTION',
      statusCode: 'DEL',
      simTimeStr,
    });
  }

  /**
   * Helper to trigger a gate swap for XY501 (e.g. swap from Gate 42 to Gate 18)
   */
  public triggerGateSwap(flightNumber: string, newGate: string, simTimeStr = '2026-10-23T14:00:00Z') {
    return this.emitFlightLegNotif({
      flightNumber,
      gate: newGate,
      simTimeStr,
    });
  }
}

export const mockAidx = new MockAidxAdapter();
