'use client';

import React from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { PassengerScreen } from '@/components/screens/PassengerScreen';
import { ComponentErrorBoundary } from '@/components/common/ComponentErrorBoundary';
import { Tv } from 'lucide-react';

export function PassengerScreenView() {
  const { screens = [], selectedScreenId, setSelectedScreenId } = useAirportSimulation();

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Screen selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Tv className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase">
              PHYSICAL SCREEN PLAYER SIMULATOR
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live airport display terminal output with synchronized FIDS & dynamic promo QR
            </p>
          </div>
        </div>

        <select
          value={selectedScreenId}
          onChange={e => setSelectedScreenId(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer shadow-sm"
        >
          {(screens || []).map(s => (
            <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100 py-1.5">
              {s.code} • {s.name} ({s.orientation})
            </option>
          ))}
        </select>
      </div>

      <ComponentErrorBoundary viewName="Passenger Screen Player">
        <PassengerScreen allowOrientationToggle={true} />
      </ComponentErrorBoundary>
    </div>
  );
}
