'use client';

import React from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { UserRole } from '@/types';
import { 
  Plane, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  ArrowLeftRight, 
  Zap, 
  Skull, 
  UserCheck, 
  Store, 
  BarChart3, 
  Tv, 
  SplitSquareVertical,
  ChevronDown
} from 'lucide-react';

export function SimControlBar() {
  const {
    simTimeFormatted,
    isPlaying,
    speed,
    setSpeed,
    togglePlay,
    resetDemoState,
    currentRole,
    setCurrentRole,
    selectedRetailerOutlet,
    setSelectedRetailerOutlet,
    selectedAirline,
    setSelectedAirline,
    injectDelay,
    swapGate,
    killScreen,
    flights,
    screens,
  } = useAirportSimulation();

  const xy501 = flights.find(f => f.flightNumber === 'XY501');
  const scrG42 = screens.find(s => s.id === 'SCR-G42-01');
  const isG42Offline = scrG42?.status === 'OFFLINE';

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 px-3 lg:px-6 py-2.5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Airport Hub info */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Plane className="h-5 w-5 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                AERO<span className="text-cyan-400">MEDIA</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold">
                PITCH DEMO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MET HUB</span>
              <span className="text-slate-600">•</span>
              <span>14:00 UTC BASE</span>
            </p>
          </div>
        </div>

        {/* Center: Quick 1-Click Action Injectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Action 1: Delay XY501 (+45m) */}
          <button
            onClick={() => injectDelay('XY501', xy501?.delayMinutes ? 0 : 45)}
            className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all transform active:scale-95 ${
              xy501?.delayMinutes && xy501.delayMinutes > 0
                ? 'bg-amber-950/80 text-amber-200 border-amber-600 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-500 hover:text-white'
            }`}
            title="Inject or toggle 45-min delay on flight XY501 to DXB at Gate 42"
          >
            <AlertTriangle className="h-3 w-3 text-amber-400 animate-bounce" />
            <span>🚨 Delay XY501 (+45m)</span>
            {xy501?.delayMinutes ? <span className="text-[10px] text-amber-400">ACTIVE</span> : null}
          </button>

          {/* Action 2: Swap Gate 42 -> 18 */}
          <button
            onClick={() => swapGate('XY501', xy501?.gate === 'Gate 42' ? 'Gate 18' : 'Gate 42')}
            className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all transform active:scale-95 ${
              xy501?.gate === 'Gate 18'
                ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500 hover:text-white'
            }`}
            title="Swap Gate for flight XY501 between Gate 42 and Gate 18"
          >
            <ArrowLeftRight className="h-3 w-3 text-cyan-400" />
            <span>🔄 Swap Gate {xy501?.gate === 'Gate 42' ? '42 → 18' : '18 → 42'}</span>
          </button>

          {/* Action 3: Kill Screen SCR-G42-01 */}
          <button
            onClick={() => {
              if (isG42Offline) {
                // Restore
                const g42 = screens.find(s => s.id === 'SCR-G42-01');
                if (g42) {
                  g42.status = 'ONLINE';
                  useAirportSimulation;
                }
              } else {
                killScreen('SCR-G42-01');
              }
            }}
            className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all transform active:scale-95 ${
              isG42Offline
                ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-md ring-1 ring-rose-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-rose-500 hover:text-white'
            }`}
            title="Set screen SCR-G42-01 status to OFFLINE or restore"
          >
            <Skull className="h-3 w-3 text-rose-400" />
            <span>{isG42Offline ? '⚡ Restore SCR-G42' : '💥 Kill SCR-G42-01'}</span>
          </button>

          {/* Action 4: Reset Demo State */}
          <button
            onClick={resetDemoState}
            className="flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200 transition-all"
            title="Restore baseline 14:00 demo conditions"
          >
            <Zap className="h-3 w-3 text-yellow-400" />
            <span>⚡ Reset Demo</span>
          </button>
        </div>

        {/* Right: Clock & Role Navigation Switcher */}
        <div className="flex items-center gap-2">
          {/* Simulation Clock & Speeds */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              {simTimeFormatted}
            </span>
            <button
              onClick={togglePlay}
              className={`h-5 w-5 rounded flex items-center justify-center text-xs transition-colors ${
                isPlaying ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
            <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5 text-[10px] font-mono">
              {([1, 10, 60] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1 rounded ${speed === s ? 'text-cyan-300 font-bold bg-cyan-950' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Role Navigation Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <div className="relative">
              <select
                id="role-switcher"
                name="role-switcher"
                value={currentRole}
                onChange={e => setCurrentRole(e.target.value as UserRole)}
                className="bg-slate-950 border border-cyan-800/80 text-cyan-300 font-mono text-xs font-bold rounded-md pl-2 pr-7 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer appearance-none shadow"
              >
                <option value="SPLIT_SCREEN_DEMO">🎯 Split-Screen Demo (Judge Pitch)</option>
                <option value="PASSENGER_SCREEN">📺 Passenger Screen (Full-Screen Player)</option>
                <option value="PLATFORM_ADMIN">🛡️ Platform Admin Dashboard</option>
                <option value="RETAILER">🛍️ Retailer Concessionaire Portal</option>
                <option value="MEDIA_MANAGER">📊 Media Manager & Campaign Studio</option>
                <option value="AIRLINE_REP">✈️ Airline Representative Hub</option>
              </select>
              <ChevronDown className="h-3 w-3 text-cyan-400 absolute right-2 top-2 pointer-events-none" />
            </div>

            {/* Contextual Sub-Selector for Retailer */}
            {currentRole === 'RETAILER' && (
              <select
                value={selectedRetailerOutlet}
                onChange={e => setSelectedRetailerOutlet(e.target.value)}
                className="bg-slate-950 border border-purple-800/80 text-purple-300 font-mono text-[11px] font-bold rounded-md px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="Metropolis Duty Free">Metropolis Duty Free</option>
                <option value="Costa Coffee">Costa Coffee</option>
                <option value="Shake Shack">Shake Shack</option>
                <option value="TUMI">TUMI Travel Luxury</option>
              </select>
            )}

            {/* Contextual Sub-Selector for Airline Rep */}
            {currentRole === 'AIRLINE_REP' && (
              <select
                value={selectedAirline}
                onChange={e => setSelectedAirline(e.target.value)}
                className="bg-slate-950 border border-indigo-800/80 text-indigo-300 font-mono text-[11px] font-bold rounded-md px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="Emirates/FlyMetropolis">Emirates / FlyMetropolis</option>
                <option value="SkyLeisure">SunVacation / SkyLeisure</option>
              </select>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
