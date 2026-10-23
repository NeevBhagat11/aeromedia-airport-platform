'use client';

import React, { useState } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { Screen, ScreenStatus } from '@/types';
import { 
  Tv, 
  MapPin, 
  X, 
  Activity, 
  Clock, 
  Wifi, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Skull,
  Layers,
  Sparkles
} from 'lucide-react';

interface ScreenMapCoords {
  screenId: string;
  x: number; // percentage in SVG viewBox
  y: number;
  label: string;
}

const SCREEN_COORDS: ScreenMapCoords[] = [
  { screenId: 'SCR-G42-01', x: 740, y: 160, label: 'Gate 42 (16:9)' },
  { screenId: 'SCR-G42-02', x: 770, y: 200, label: 'Gate 42 (9:16 Totem)' },
  { screenId: 'SCR-DUTYFREE-01', x: 480, y: 280, label: 'Central Duty Free Wall' },
  { screenId: 'SCR-LOUNGE-01', x: 220, y: 170, label: 'VIP Lounge Gate 11' },
  { screenId: 'SCR-G18-01', x: 290, y: 220, label: 'Gate 18 Holdroom' },
  { screenId: 'SCR-FOOD-01', x: 480, y: 440, label: 'T2 Food Court Pillar' },
];

export function TerminalFloorMap() {
  const {
    screens,
    campaigns,
    setScreenStatus,
    selectedAudience,
    flights,
  } = useAirportSimulation();

  const [activeScreenId, setActiveScreenId] = useState<string | null>('SCR-G42-01');
  const [showHeatmap, setShowHeatmap] = useState(true);

  const activeScreen = screens.find(s => s.id === activeScreenId);
  const activeCampaign = campaigns.find(c => c.id === activeScreen?.currentAdId);
  const xy501 = flights.find(f => f.flightNumber === 'XY501');
  const isDelayed = Boolean(xy501?.delayMinutes && xy501.delayMinutes > 0);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 lg:p-5 flex flex-col gap-4 backdrop-blur-sm relative">
      {/* Header & Map Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                TERMINAL NETWORK FLOOR MAP & DENSITY HEATMAP
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                METROPOLIS T1 & T2
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Concourses A, B & C • Real-time Node Health and Footfall Congestion
            </p>
          </div>
        </div>

        {/* Heatmap Toggle & Map Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Degraded
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Offline
            </span>
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1 rounded-xl font-mono text-xs font-bold border transition-colors ${
              showHeatmap
                ? 'bg-purple-950 text-purple-300 border-purple-700/60 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {showHeatmap ? 'HEATMAP: ACTIVE' : 'HEATMAP: OFF'}
          </button>
        </div>
      </div>

      {/* Interactive Stylized Terminal Floor SVG */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800/80 p-2 overflow-hidden shadow-inner flex items-center justify-center">
        <svg
          viewBox="0 0 960 520"
          className="w-full h-auto max-h-[480px] block select-none"
        >
          <defs>
            {/* Heatmap gradients */}
            <radialGradient id="heatGate42" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={isDelayed ? "0.6" : "0.3"} />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity={isDelayed ? "0.35" : "0.15"} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatDutyFree" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatLounge" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Terminal Background Architectural Footprint */}
          {/* Concourse A (West Wing) */}
          <path
            d="M 120 120 L 340 120 L 340 260 L 260 260 L 260 300 L 120 300 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <text x="180" y="150" fill="#64748b" fontSize="12" fontFamily="monospace" fontWeight="bold">
            CONCOURSE A (GATES 01–20)
          </text>

          {/* Central Duty Free Galleria Atrium */}
          <rect
            x="360"
            y="180"
            width="240"
            height="180"
            rx="20"
            fill="#131c31"
            stroke="#334155"
            strokeWidth="2"
          />
          <text x="390" y="275" fill="#94a3b8" fontSize="14" fontFamily="monospace" fontWeight="bold">
            CENTRAL DUTY FREE
          </text>
          <text x="430" y="295" fill="#64748b" fontSize="11" fontFamily="monospace">
            PIAZZA & GALLERIA
          </text>

          {/* Concourse B (East Wing - Gate 42) */}
          <path
            d="M 620 120 L 880 120 L 880 300 L 740 300 L 740 260 L 620 260 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <text x="680" y="150" fill="#64748b" fontSize="12" fontFamily="monospace" fontWeight="bold">
            CONCOURSE B (GATES 31–50)
          </text>

          {/* Concourse C / Terminal 2 (South Wing) */}
          <rect
            x="360"
            y="380"
            width="240"
            height="110"
            rx="14"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="2"
          />
          <text x="400" y="425" fill="#64748b" fontSize="12" fontFamily="monospace" fontWeight="bold">
            TERMINAL 2 (CONCOURSE C)
          </text>
          <text x="420" y="445" fill="#475569" fontSize="10" fontFamily="monospace">
            FOOD PROMENADE
          </text>

          {/* Connecting Walkway Corridors */}
          <line x1="340" y1="210" x2="360" y2="210" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 3" />
          <line x1="600" y1="210" x2="620" y2="210" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 3" />
          <line x1="480" y1="360" x2="480" y2="380" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 3" />

          {/* Gate Markings */}
          <text x="760" y="140" fill="#38bdf8" fontSize="12" fontFamily="monospace" fontWeight="bold">
            GATE 42
          </text>
          <text x="240" y="140" fill="#94a3b8" fontSize="11" fontFamily="monospace">
            GATE 11
          </text>
          <text x="290" y="250" fill="#94a3b8" fontSize="11" fontFamily="monospace">
            GATE 18
          </text>

          {/* Heatmap Overlays */}
          {showHeatmap && (
            <>
              {/* Gate 42 delay congestion heatmap */}
              <circle cx="755" cy="180" r={isDelayed ? "110" : "75"} fill="url(#heatGate42)" pointerEvents="none" />
              {/* Central duty free footfall heatmap */}
              <circle cx="480" cy="270" r="105" fill="url(#heatDutyFree)" pointerEvents="none" />
              {/* VIP Lounge */}
              <circle cx="230" cy="180" r="65" fill="url(#heatLounge)" pointerEvents="none" />
            </>
          )}

          {/* Screen Nodes */}
          {SCREEN_COORDS.map(coord => {
            const screen = screens.find(s => s.id === coord.screenId);
            const status: ScreenStatus = screen?.status || 'ONLINE';
            const isSelected = coord.screenId === activeScreenId;

            let dotColor = '#10b981'; // emerald
            let ringColor = 'rgba(16, 185, 129, 0.4)';
            if (status === 'DEGRADED') {
              dotColor = '#f59e0b'; // amber
              ringColor = 'rgba(245, 158, 11, 0.4)';
            } else if (status === 'OFFLINE') {
              dotColor = '#f43f5e'; // rose
              ringColor = 'rgba(244, 63, 94, 0.4)';
            }

            return (
              <g
                key={coord.screenId}
                className="cursor-pointer group"
                onClick={() => setActiveScreenId(coord.screenId)}
              >
                {/* Pulse Ring */}
                {status !== 'OFFLINE' && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isSelected ? "18" : "13"}
                    fill={ringColor}
                    className="animate-ping"
                    style={{ transformOrigin: `${coord.x}px ${coord.y}px`, animationDuration: '3s' }}
                  />
                )}

                {/* Selection indicator */}
                {isSelected && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="15"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                )}

                {/* Main Node Point */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r="7"
                  fill={dotColor}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-transform transform group-hover:scale-125"
                />

                {/* Label text */}
                <text
                  x={coord.x}
                  y={coord.y - 12}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow"
                >
                  {screen?.code || coord.screenId}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Screen Quick Detail Drawer (Floating Bottom Card) */}
        {activeScreen && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Tv className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-white">{activeScreen.code}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                      activeScreen.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      activeScreen.status === 'DEGRADED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {activeScreen.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{activeScreen.name}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveScreenId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Hardware Spec</div>
                <div className="font-bold text-slate-300">{activeScreen.orientation} • {activeScreen.resolution || '4K UHD'}</div>
              </div>

              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Latency Ping</div>
                <div className="font-bold text-emerald-400">14ms (Carrier OK)</div>
              </div>

              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 col-span-2">
                <div className="text-[10px] text-slate-500 uppercase">Current Playing Creative</div>
                <div className="font-bold text-cyan-300 truncate mt-0.5">
                  {activeCampaign ? `${activeCampaign.advertiserName} - ${activeCampaign.title}` : 'Airport Standby Loop'}
                </div>
              </div>
            </div>

            {/* Quick Status Override Buttons */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 font-mono text-[10px]">
              <span className="text-slate-500">Toggle Status:</span>
              {(['ONLINE', 'DEGRADED', 'OFFLINE'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setScreenStatus(activeScreen.id, st)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    activeScreen.status === st
                      ? 'bg-slate-800 text-white border border-slate-600'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
