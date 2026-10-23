'use client';

import React from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { 
  Plane, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Radio, 
  AlertTriangle, 
  Users, 
  Zap,
  SlidersHorizontal
} from 'lucide-react';

export function HeaderBar() {
  const {
    simTimeFormatted,
    isPlaying,
    speed,
    setSpeed,
    togglePlay,
    resetSimulation,
    isRushHour,
    toggleRushHour,
    injectDelay,
    swapGate,
    flights,
  } = useAirportSimulation();

  const xy501 = flights.find(f => f.flightNumber === 'XY501');

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Airport Hub info */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Plane className="h-5 w-5 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                AERO<span className="text-cyan-400">MEDIA</span> PLATFORM
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                PHASE 1 CORE
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>METROPOLIS INTL (MET)</span>
              <span className="text-slate-600">•</span>
              <span>AODB/AIDX/ACRIS FEED ONLINE</span>
            </p>
          </div>
        </div>

        {/* Quick Simulation Trigger Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => injectDelay('XY501', xy501?.delayMinutes ? 0 : 45)}
            className={`flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1.5 rounded-lg border transition-all ${
              xy501?.delayMinutes && xy501.delayMinutes > 0
                ? 'bg-amber-950/60 text-amber-300 border-amber-700/60 hover:bg-amber-900/60 shadow-sm shadow-amber-900/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
            title="Toggle 45m Delay on Flight XY501 to Dubai"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>XY501 {xy501?.delayMinutes ? `(+${xy501.delayMinutes}m DELAYED)` : '(ON-TIME)'}</span>
          </button>

          <button
            onClick={() => swapGate('XY501', xy501?.gate === 'Gate 42' ? 'Gate 18' : 'Gate 42')}
            className="flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-all"
            title="Swap XY501 gate between Gate 42 and Gate 18"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
            <span>Gate: {xy501?.gate || 'Gate 42'}</span>
          </button>

          <button
            onClick={toggleRushHour}
            className={`flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1.5 rounded-lg border transition-all ${
              isRushHour
                ? 'bg-rose-950/70 text-rose-300 border-rose-700/60 shadow-sm shadow-rose-900/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
            title="Toggle ACRIS passenger rush hour flow surge (+45% traffic)"
          >
            <Users className="h-3.5 w-3.5 text-purple-400" />
            <span>Rush Hour: {isRushHour ? 'SURGE' : 'NORMAL'}</span>
          </button>
        </div>

        {/* Master Clock & Playback controls */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span className="font-mono text-sm font-bold text-white tracking-wider">
              {simTimeFormatted}
            </span>
          </div>

          <button
            onClick={togglePlay}
            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-sm shadow-cyan-500/30' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={isPlaying ? 'Pause Simulation Clock' : 'Play Simulation Clock'}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>

          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
            {([1, 10, 60] as const).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  speed === s
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={resetSimulation}
            className="h-7 w-7 rounded-lg bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700 flex items-center justify-center transition-all"
            title="Reset to 14:00 Initial Baseline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
