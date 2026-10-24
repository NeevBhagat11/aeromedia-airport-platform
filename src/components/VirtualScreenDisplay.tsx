'use client';

import React from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { 
  Tv, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Tag, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  Maximize2 
} from 'lucide-react';

export function VirtualScreenDisplay() {
  const {
    screens,
    selectedScreenId,
    setSelectedScreenId,
    selectedScreen,
    campaigns,
    selectedDecisionLog,
    setScreenStatus,
    selectedAudience,
  } = useAirportSimulation();

  if (!selectedScreen) return null;

  const winningCampaign = campaigns.find(c => c.id === selectedScreen.currentAdId);
  const isPortrait = selectedScreen.orientation === '9:16';
  const isOffline = selectedScreen.status === 'OFFLINE';
  const isDegraded = selectedScreen.status === 'DEGRADED';

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 flex flex-col gap-4 backdrop-blur-sm">
      {/* Screen Selector & Status Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-400">
            <Tv className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedScreenId}
                onChange={e => setSelectedScreenId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs font-semibold rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-cyan-500 focus:outline-none cursor-pointer shadow-sm"
              >
                {screens.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100 py-1.5">
                    {s.code} • {s.name} ({s.orientation})
                  </option>
                ))}
              </select>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                selectedScreen.orientation === '16:9'
                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                  : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
              }`}>
                {selectedScreen.orientation}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {selectedScreen.terminal} • {selectedScreen.concourse} {selectedScreen.gateId ? `• ${selectedScreen.gateId}` : ''}
            </p>
          </div>
        </div>

        {/* Physical Status Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['ONLINE', 'DEGRADED', 'OFFLINE'] as const).map(status => (
            <button
              key={status}
              onClick={() => setScreenStatus(selectedScreen.id, status)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedScreen.status === status
                  ? status === 'ONLINE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm'
                    : status === 'DEGRADED'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700/60 shadow-sm'
                    : 'bg-rose-950 text-rose-300 border border-rose-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Physical Frame / Virtual Screen Bezel */}
      <div className="relative flex items-center justify-center bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 shadow-2xl min-h-[380px] overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {isOffline ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono">
            <WifiOff className="h-12 w-12 text-rose-500/80 mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-slate-300">SCREEN OFFLINE</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Hardware heartbeat lost for {selectedScreen.code}. Ad rendering halted. Falling back to default airport standby test card.
            </p>
            <div className="mt-4 px-3 py-1 bg-rose-950/40 border border-rose-800/60 rounded text-rose-400 text-xs">
              ERROR: NO_COMMUNICATION_ACK
            </div>
          </div>
        ) : winningCampaign ? (
          <div
            className={`relative rounded-xl overflow-hidden border-2 border-slate-700/80 shadow-2xl transition-all duration-500 flex flex-col justify-between ${
              isPortrait
                ? 'w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16]'
                : 'w-full max-w-2xl aspect-[16/9]'
            }`}
            style={{
              boxShadow: `0 0 35px -5px ${winningCampaign.accentColor || '#06b6d4'}40`,
            }}
          >
            {/* Background Creative Image with Gradient Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center filter brightness-90 transition-transform duration-700 scale-105"
              style={{ backgroundImage: `url(${winningCampaign.creativeUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

            {/* Degraded mode overlay badge */}
            {isDegraded && (
              <div className="absolute top-2 left-2 z-20 bg-amber-500/90 text-slate-950 text-[10px] font-bold font-mono px-2 py-0.5 rounded shadow">
                HARDWARE STATUS: DEGRADED (LOW RESOLUTION)
              </div>
            )}

            {/* Top Bar of the Screen: Brand Badge & Target Segment */}
            <div className="relative z-10 p-4 flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono tracking-wider font-bold uppercase px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/20 shadow">
                  {winningCampaign.advertiserName}
                </span>
                {winningCampaign.badgeText && (
                  <span 
                    className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-1 rounded-md shadow backdrop-blur-md text-black"
                    style={{ backgroundColor: winningCampaign.accentColor || '#38bdf8' }}
                  >
                    {winningCampaign.badgeText}
                  </span>
                )}
              </div>

              {/* Dynamic Flight Context pill */}
              {selectedAudience?.dominantFlight && (
                <div className="hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-[10px] font-mono text-cyan-300">
                  <Sparkles className="h-3 w-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>
                    {selectedAudience.dominantFlight.flightNumber} ({selectedAudience.dominantFlight.destination})
                    {selectedAudience.dominantFlight.delayMinutes > 0 && ` +${selectedAudience.dominantFlight.delayMinutes}m`}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Content Area: Headline, Subheadline, CTA, and Promo Code */}
            <div className="relative z-10 p-4 sm:p-6 flex flex-col gap-2">
              <h2 className="text-base sm:text-xl lg:text-2xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                {winningCampaign.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 drop-shadow leading-relaxed">
                {winningCampaign.subheadline}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button 
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 transition-all transform active:scale-95 shadow-lg flex items-center gap-1.5"
                    style={{ backgroundColor: winningCampaign.accentColor || '#38bdf8' }}
                  >
                    <span>{winningCampaign.callToAction}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  {winningCampaign.promoCode && (
                    <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/20 text-xs font-mono text-amber-300 font-bold">
                      <Tag className="h-3 w-3 text-amber-400" />
                      <span>{winningCampaign.promoCode}</span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-1 rounded border border-white/10">
                  CPM: ${winningCampaign.cpm.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 font-mono text-xs">
            No active campaign matched criteria for this screen.
          </div>
        )}
      </div>

      {/* Screen Telemetry Quick Footnote */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Estimated Pax</div>
          <div className="text-sm font-bold text-cyan-400">{selectedAudience?.totalPax || 0} pax</div>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Gate Dwell Avg</div>
          <div className="text-sm font-bold text-amber-400">{selectedAudience?.dwellMinutesAvg || 0} mins</div>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Business Share</div>
          <div className="text-sm font-bold text-indigo-400">{selectedAudience?.demographics.businessPct || 0}%</div>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Holiday Share</div>
          <div className="text-sm font-bold text-emerald-400">{selectedAudience?.demographics.holidayPct || 0}%</div>
        </div>
      </div>
    </div>
  );
}
