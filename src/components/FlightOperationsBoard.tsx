'use client';

import React, { useState, useMemo } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { 
  Plane, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  SlidersHorizontal,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Flight } from '@/types';

export function FlightOperationsBoard() {
  const { flights, injectDelay, swapGate, simTime } = useAirportSimulation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'GATE42' | 'DELAYED' | 'ACTIVE_NOW'>('GATE42');

  const filteredFlights = useMemo(() => {
    return flights.filter(f => {
      // Search query filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = 
          f.flightNumber.toLowerCase().includes(term) ||
          f.destination.toLowerCase().includes(term) ||
          f.destinationCity.toLowerCase().includes(term) ||
          f.gate.toLowerCase().includes(term) ||
          f.airline.toLowerCase().includes(term);
        if (!matches) return false;
      }

      // Category filter
      if (filterMode === 'GATE42') {
        return f.gate === 'Gate 42' || f.flightNumber === 'XY501' || f.flightNumber === 'ZQ88';
      }
      if (filterMode === 'DELAYED') {
        return f.delayMinutes > 0;
      }
      if (filterMode === 'ACTIVE_NOW') {
        const estMs = new Date(f.estimatedTime).getTime();
        const simMs = simTime.getTime();
        const diffMins = (estMs - simMs) / (60 * 1000);
        return diffMins >= -30 && diffMins <= 120;
      }
      return true;
    });
  }, [flights, searchTerm, filterMode, simTime]);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 flex flex-col gap-4 backdrop-blur-sm">
      {/* Table Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-400">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                AODB LIVE FLIGHT OPERATIONS
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-semibold">
                {filteredFlights.length} of {flights.length} flights
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Metropolis Hub • Real-time Gate & Passenger Feeds
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
          {(['GATE42', 'DELAYED', 'ACTIVE_NOW', 'ALL'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === mode
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'GATE42' ? 'GATE 42 (DEMO CORE)' : mode === 'DELAYED' ? 'DELAYED' : mode === 'ACTIVE_NOW' ? 'NEAR SIM TIME' : 'ALL (~300)'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search flight number (e.g. XY501, ZQ88), destination (DXB, MLE), or gate..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Flight Operations Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Flight / Carrier</th>
              <th className="py-2.5 px-3">Destination</th>
              <th className="py-2.5 px-3">STD / ETD</th>
              <th className="py-2.5 px-3">Gate</th>
              <th className="py-2.5 px-3">Pax & Demographics</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Quick Injector</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {filteredFlights.slice(0, 30).map(f => {
              const isXY501 = f.flightNumber === 'XY501';
              const isZQ88 = f.flightNumber === 'ZQ88';
              const isHighlighted = isXY501 || isZQ88;

              const schedFormatted = f.scheduledTime.split('T')[1]?.substring(0, 5) || '14:00';
              const estFormatted = f.estimatedTime.split('T')[1]?.substring(0, 5) || '14:00';

              return (
                <tr
                  key={f.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isHighlighted ? 'bg-cyan-950/20' : ''
                  }`}
                >
                  {/* Flight & Airline */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isHighlighted ? 'text-cyan-300' : 'text-white'}`}>
                        {f.flightNumber}
                      </span>
                      {isHighlighted && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          KEY DEMO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {f.airline}
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{f.destination}</span>
                      <span className="text-slate-500 text-[10px]">({f.destinationCity})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{f.aircraftType || 'A320'}</div>
                  </td>

                  {/* Times */}
                  <td className="py-2.5 px-3">
                    <div className="text-white">{schedFormatted}</div>
                    <div className={f.delayMinutes > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {estFormatted} {f.delayMinutes > 0 ? `(+${f.delayMinutes}m)` : ''}
                    </div>
                  </td>

                  {/* Gate */}
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                      {f.gate}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{f.terminal}</div>
                  </td>

                  {/* Pax & Demographics */}
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white flex items-center gap-1">
                      <Users className="h-3 w-3 text-slate-400" />
                      <span>{f.paxCount} pax</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] mt-0.5">
                      <span className="text-indigo-400">Biz {f.crowdDemographics.businessPct}%</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400">Leis {f.crowdDemographics.holidayPct}%</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        f.status === 'DELAYED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : f.status === 'BOARDING'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                          : f.status === 'DEPARTED'
                          ? 'bg-slate-900 text-slate-400 border border-slate-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {f.status === 'DELAYED' && <AlertTriangle className="h-2.5 w-2.5" />}
                      {f.status === 'ON_TIME' && <CheckCircle className="h-2.5 w-2.5" />}
                      {f.status}
                    </span>
                  </td>

                  {/* Action / Injector */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => injectDelay(f.flightNumber, f.delayMinutes > 0 ? 0 : 45)}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                          f.delayMinutes > 0
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                        }`}
                        title={f.delayMinutes > 0 ? 'Clear delay to on-time' : 'Inject 45m delay'}
                      >
                        {f.delayMinutes > 0 ? 'Clear Delay' : '+45m Delay'}
                      </button>

                      <button
                        onClick={() => swapGate(f.flightNumber, f.gate === 'Gate 42' ? 'Gate 18' : 'Gate 42')}
                        className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
                        title="Swap gate assignment"
                      >
                        Swap
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredFlights.length > 30 && (
        <div className="text-center font-mono text-xs text-slate-500">
          Showing first 30 of {filteredFlights.length} matching flights. Use search box to filter any flight.
        </div>
      )}
    </div>
  );
}
