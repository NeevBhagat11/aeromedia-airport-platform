'use client';

import React, { useState } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { mockAcris } from '@/adapters/mock-acris';
import { 
  Activity, 
  Users, 
  Clock, 
  MapPin, 
  Code, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

export function AcrisTelemetryPanel() {
  const { zones, isRushHour, toggleRushHour, simTime } = useAirportSimulation();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('Z-G42');
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);

  const measurements = mockAcris.getAllMeasurements();
  const selectedMeasurement = mockAcris.getMeasurementForZone(selectedZoneId) || measurements[0];
  const ngsiLdPayload = mockAcris.getNgsiLdPayload(selectedZoneId);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 flex flex-col gap-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-950/70 border border-purple-800/50 text-purple-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                ACI ACRIS PASSENGER FLOW & QUEUE TELEMETRY
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                NGSI-LD STANDARD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live Sensor & Camera Dwell Time Measurement Feeds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonModal(!showJsonModal)}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Code className="h-3.5 w-3.5 text-purple-400" />
            <span>{showJsonModal ? 'HIDE NGSI-LD' : 'VIEW NGSI-LD JSON'}</span>
          </button>
        </div>
      </div>

      {/* Zone Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {zones.map(zone => {
          const m = mockAcris.getMeasurementForZone(zone.zoneId);
          const isSelected = zone.zoneId === selectedZoneId;

          return (
            <div
              key={zone.zoneId}
              onClick={() => setSelectedZoneId(zone.zoneId)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all font-mono text-xs ${
                isSelected
                  ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{zone.zoneId}</span>
                <span className="text-[10px] text-purple-300 px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800/50">
                  {zone.terminal}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {zone.zoneName}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Total Pax</div>
                  <div className="font-bold text-white">{m?.queueLengthPax ? m.queueLengthPax * 3 : zone.totalPax}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">Avg Dwell</div>
                  <div className="font-bold text-amber-400">{m?.dwellTimeMinutes || zone.dwellMinutesAvg}m</div>
                </div>
              </div>

              {/* Demographics bar */}
              <div className="mt-2 flex h-1.5 rounded-full overflow-hidden bg-slate-800">
                <div 
                  className="bg-indigo-500" 
                  style={{ width: `${zone.demographicShares.businessPct}%` }} 
                  title={`Business: ${zone.demographicShares.businessPct}%`} 
                />
                <div 
                  className="bg-emerald-500" 
                  style={{ width: `${zone.demographicShares.holidayPct}%` }} 
                  title={`Holiday: ${zone.demographicShares.holidayPct}%`} 
                />
                <div 
                  className="bg-amber-500" 
                  style={{ width: `${zone.demographicShares.familyPct}%` }} 
                  title={`Family: ${zone.demographicShares.familyPct}%`} 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Zone NGSI-LD Payload Drawer */}
      {showJsonModal && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-2 border-b border-slate-800 pb-2">
            <span className="text-purple-300 font-bold">NGSI-LD ENTITY DATA: {selectedZoneId}</span>
            <span className="text-[10px]">Context: https://airport-acris.org/context/passenger-flow.jsonld</span>
          </div>
          <pre className="text-purple-400/90 whitespace-pre overflow-x-auto max-h-[220px]">
            {JSON.stringify(ngsiLdPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
