'use client';

import React, { useState, useMemo } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { Screen, ScreenOrientation } from '@/types';
import { SvgQrCode } from '@/components/common/SvgQrCode';
import { 
  Tv, 
  Sparkles, 
  Tag, 
  Share2, 
  HelpCircle, 
  Clock, 
  Plane, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  X, 
  TrendingUp, 
  ShieldAlert, 
  Copy, 
  Check, 
  Maximize, 
  Smartphone,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// ─── Fallback data shapes used when context data is not yet hydrated ─────────
const DEFAULT_SCREEN: Screen = {
  id: 'SCR-G42-01',
  code: 'SCR-G42-01',
  name: 'Gate 42 Holdroom Totem A',
  zoneId: 'ZONE-G42',
  gateId: 'Gate 42',
  terminal: 'Terminal 1',
  concourse: 'Concourse B',
  orientation: '16:9',
  status: 'ONLINE',
  currentAdId: null,
};

const FALLBACK_CAMPAIGN = {
  id: 'FALLBACK',
  advertiserName: 'Metropolis Airport',
  title: 'Welcome to Metropolis Airport',
  category: 'Airport Services',
  targetSegments: [],
  hardFilters: {},
  boostRules: [],
  creativeUrl: '',
  headline: 'Welcome to Metropolis Hub',
  subheadline: 'Your gateway to the world. Discover duty-free, dining, and more.',
  callToAction: 'Explore Terminal',
  badgeText: 'LIVE DEMO',
  promoCode: 'METROFLY',
  accentColor: '#06b6d4',
  budget: 0,
  cpm: 0,
  impressionsDelivered: 0,
  status: 'ACTIVE' as const,
};
// ─────────────────────────────────────────────────────────────────────────────

interface PassengerScreenProps {
  customScreenId?: string;
  allowOrientationToggle?: boolean;
  className?: string;
}

export function PassengerScreen({
  customScreenId,
  allowOrientationToggle = true,
  className = '',
}: PassengerScreenProps) {
  const {
    screens = [],
    selectedScreenId,
    setSelectedScreenId,
    campaigns = [],
    flights = [],
    decisionLogs,
    simTime,
    selectedAudience,
  } = useAirportSimulation();

  // ── Resolve active screen with multi-tier fallback ──────────────────────────
  const activeScreenId = customScreenId || selectedScreenId;
  const screen: Screen =
    screens.find(s => s?.id === activeScreenId) ??
    screens.find(s => s?.id === 'SCR-G42-01') ??
    screens[0] ??
    DEFAULT_SCREEN;

  // Local orientation toggle state for demo flexibility
  const [forcedOrientation, setForcedOrientation] = useState<ScreenOrientation | null>(null);
  const currentOrientation: ScreenOrientation = forcedOrientation ?? screen.orientation ?? '16:9';
  const isPortrait = currentOrientation === '9:16';

  // "Why this ad?" modal state
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // ── Resolve winning campaign with null-safe fallback ─────────────────────────
  const winningCampaign =
    (screen.currentAdId ? campaigns.find(c => c?.id === screen.currentAdId) : null) ??
    campaigns[0] ??
    FALLBACK_CAMPAIGN;

  const decisionLog = decisionLogs?.[screen.id];
  const isOffline = screen.status === 'OFFLINE';

  // ── FIDS strip: null-safe flight array ──────────────────────────────────────
  const gateFlights = useMemo(() => {
    return (flights || [])
      .filter(f => f?.gate === screen.gateId || f?.flightNumber === 'XY501' || f?.flightNumber === 'ZQ88')
      .slice(0, 3);
  }, [flights, screen.gateId]);

  // Main flight for countdown bar (e.g. XY501)
  const primaryFlight = gateFlights.find(f => f?.flightNumber === 'XY501') ?? gateFlights[0] ?? null;
  const promoCode = winningCampaign?.promoCode ?? 'METROFLY';
  const claimUrl = `/claim?code=${encodeURIComponent(promoCode)}&screen=${encodeURIComponent(screen.code ?? screen.id)}`;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${claimUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // ── Safe audience metrics for the modal ────────────────────────────────────
  const audienceHolidayPct  = selectedAudience?.demographics?.holidayPct  ?? 45;
  const audienceBusinessPct = selectedAudience?.demographics?.businessPct ?? 35;
  const audienceFamilyPct   = selectedAudience?.demographics?.familyPct   ?? 20;
  const audienceDwell       = selectedAudience?.dwellMinutesAvg            ?? 48;
  const audiencePax         = selectedAudience?.totalPax                   ?? 420;
  const audienceMaxDelay    = selectedAudience?.maxDelayMinutes             ?? 0;

  // Safe accent color
  const accentColor = winningCampaign?.accentColor ?? '#06b6d4';

  return (
    <div className={`relative flex flex-col gap-3 ${className}`}>
      {/* Top Simulator Control Bar */}
      {allowOrientationToggle && (
        <div className="flex items-center justify-between gap-2 px-1 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">{screen.code ?? screen.id}</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold">{screen.name ?? 'Unknown Screen'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setForcedOrientation(isPortrait ? '16:9' : '9:16')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500 transition-colors font-mono text-[11px]"
              title="Toggle between 16:9 Landscape and 9:16 Portrait totem"
            >
              <Smartphone className={`h-3 w-3 ${isPortrait ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>Format: {isPortrait ? '9:16 PORTRAIT TOTEM' : '16:9 LANDSCAPE'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Virtual Screen Display Outer Bezel */}
      <div className="relative bg-slate-950 rounded-2xl p-3 sm:p-5 border-2 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden min-h-[460px]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        {isOffline ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono">
            <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-800/80 flex items-center justify-center mb-4">
              <Tv className="h-8 w-8 text-rose-500 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">SCREEN OFFLINE - DIAGNOSTIC MODE</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Hardware node <span className="text-rose-400 font-bold">{screen.code ?? screen.id}</span> has lost carrier signal.
              Failover watchdog initiated.
            </p>
            <div className="mt-4 px-3 py-1.5 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-xs font-mono">
              ERR_AIRPORT_HEARTBEAT_TIMEOUT
            </div>
          </div>
        ) : (
          <div
            className={`relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl transition-all duration-500 flex flex-col justify-between select-none ${
              isPortrait
                ? 'w-full max-w-[340px] aspect-[9/16]'
                : 'w-full max-w-4xl aspect-[16/9]'
            }`}
            style={{
              boxShadow: `0 0 45px -8px ${accentColor}45`,
            }}
          >
            {/* Background Creative Image with Deep Cinematic Gradients */}
            <div
              className="absolute inset-0 bg-cover bg-center filter brightness-95 transition-transform duration-1000 scale-100 hover:scale-105"
              style={{ backgroundImage: winningCampaign.creativeUrl ? `url(${winningCampaign.creativeUrl})` : undefined }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50" />

            {/* SCREEN TOP HEADER: Concession Badge & Live Gate Status */}
            <div className="relative z-10 p-3 sm:p-4 flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-mono tracking-wider font-extrabold uppercase px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white border border-white/20 shadow">
                  {winningCampaign.advertiserName}
                </span>
                {winningCampaign.badgeText && (
                  <span
                    className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-1 rounded-md shadow backdrop-blur-md text-slate-950"
                    style={{ backgroundColor: accentColor }}
                  >
                    {winningCampaign.badgeText}
                  </span>
                )}
              </div>

              {/* Dominant Flight context badge */}
              {primaryFlight && (
                <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-mono text-cyan-300 shadow">
                  <Plane className="h-3 w-3 text-cyan-400" />
                  <span className="font-bold">
                    {primaryFlight.flightNumber ?? '—'} to {primaryFlight.destination ?? '—'}
                  </span>
                  {(primaryFlight.delayMinutes ?? 0) > 0 ? (
                    <span className="text-amber-300 font-bold bg-amber-950/80 px-1 py-0.2 rounded border border-amber-700/60">
                      +{primaryFlight.delayMinutes}m DELAY
                    </span>
                  ) : (
                    <span className="text-emerald-300 font-bold bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-700/60">
                      ON TIME
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* SCREEN MIDDLE/BOTTOM: Ad Creative Copy, Live Scannable QR & Countdown */}
            <div className="relative z-10 p-4 sm:p-6 flex flex-col justify-end gap-3 mt-auto">
              {/* Dynamic Flight Callout Banner */}
              {primaryFlight && (primaryFlight.delayMinutes ?? 0) > 0 && winningCampaign.category === 'Grab & Go F&B' && (
                <div className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950 text-xs font-mono font-extrabold shadow-lg animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>FLIGHT XY501 DELAY VOUCHER ACTIVE</span>
                </div>
              )}

              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                  {winningCampaign.headline}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl drop-shadow line-clamp-2 leading-relaxed font-sans">
                  {winningCampaign.subheadline}
                </p>
              </div>

              {/* Action Strip & Scannable QR Code */}
              <div className="flex flex-wrap items-end justify-between gap-3 pt-2 border-t border-white/15">
                {/* Left: Button, Promo Code, Share Action */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={claimUrl}
                      target="_blank"
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 shadow-xl flex items-center gap-1.5 transition-transform transform active:scale-95"
                      style={{ backgroundColor: accentColor }}
                    >
                      <span>{winningCampaign.callToAction}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>

                    {winningCampaign.promoCode && (
                      <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono text-amber-300 font-bold shadow">
                        <Tag className="h-3 w-3 text-amber-400" />
                        <span>CODE: {winningCampaign.promoCode}</span>
                      </div>
                    )}

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1 bg-black/60 hover:bg-black/90 px-2.5 py-1.5 rounded-xl border border-white/20 text-xs font-mono text-slate-200 transition-colors shadow"
                      title="Generate shareable companion link for friends & family traveling together"
                    >
                      {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Share2 className="h-3 w-3" />}
                      <span>{copiedLink ? 'LINK COPIED' : 'SHARE VOUCHER'}</span>
                    </button>
                  </div>

                  {/* Countdown bar */}
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-slate-300 bg-black/70 px-2.5 py-1 rounded-lg border border-white/10 max-w-fit">
                    <Clock className="h-3 w-3 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>Offer expires when flight XY501 boarding closes (~38m remaining)</span>
                  </div>
                </div>

                {/* Right: Dynamic Scannable Promo QR */}
                <div className="flex items-center gap-2.5 bg-black/85 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-2xl">
                  <Link href={claimUrl} target="_blank" title="Scan or click to claim promo voucher on mobile">
                    <SvgQrCode value={claimUrl} size={64} accentColor={accentColor} />
                  </Link>
                  <div className="text-left font-mono">
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">SCAN PHONE</div>
                    <div className="text-xs font-extrabold text-cyan-300">CLAIM 20%</div>
                    <Link
                      href={claimUrl}
                      target="_blank"
                      className="text-[9px] text-slate-300 underline hover:text-white flex items-center gap-0.5 mt-0.5"
                    >
                      <span>Simulate Scan</span>
                      <ChevronRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* FIDS Flight Departure Strip at the bottom of the screen */}
              <div className="bg-black/80 backdrop-blur-md -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 px-4 py-2 border-t border-white/15 flex items-center justify-between gap-3 text-[11px] font-mono overflow-x-auto">
                <div className="flex items-center gap-1 text-slate-400 uppercase text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>GATE 42 FIDS:</span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {(gateFlights || []).map(f => {
                    if (!f) return null;
                    const delay = f.delayMinutes ?? 0;
                    return (
                      <div key={f.id ?? f.flightNumber} className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{f.flightNumber ?? '—'}</span>
                        <span className="text-slate-400">{f.destination ?? '—'}</span>
                        <span className={delay > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                          {delay > 0 ? `+${delay}m` : 'ON-TIME'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* "WHY THIS AD?" Floating Button */}
            <button
              onClick={() => setShowWhyModal(true)}
              className="absolute top-3 right-3 z-30 flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/80 hover:bg-black text-cyan-300 border border-cyan-500/40 shadow-lg backdrop-blur-md transition-all hover:scale-105"
            >
              <HelpCircle className="h-3 w-3 text-cyan-400" />
              <span>Why this ad?</span>
            </button>
          </div>
        )}
      </div>

      {/* "WHY THIS AD?" TRANSPARENCY MODAL */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto font-sans">
            <button
              onClick={() => setShowWhyModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Why Was This Ad Displayed?</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Autonomous Decision Engine Audit • Screen {screen.code ?? screen.id}
                </p>
              </div>
            </div>

            {/* Crowd Profile Bars */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold mb-2">
                Current Holdroom Audience Telemetry (Gate 42)
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Holiday / Leisure</span>
                    <span className="font-bold text-emerald-400">{audienceHolidayPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${audienceHolidayPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Business Executive</span>
                    <span className="font-bold text-indigo-400">{audienceBusinessPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${audienceBusinessPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Family Travelers</span>
                    <span className="font-bold text-amber-400">{audienceFamilyPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${audienceFamilyPct}%` }} />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
                  <span>Median Dwell: <strong className="text-white">{audienceDwell} mins</strong></span>
                  <span>Total Pax: <strong className="text-cyan-400">{audiencePax} pax</strong></span>
                </div>
              </div>
            </div>

            {/* Top Ranked Candidates */}
            {decisionLog && Array.isArray(decisionLog.candidateScores) && decisionLog.candidateScores.length > 0 && (
              <div className="mb-4">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold mb-2">
                  Top Ranked Candidate Campaigns
                </div>
                <div className="space-y-2 font-mono text-xs">
                  {decisionLog.candidateScores.slice(0, 3).map((c, i) => (
                    <div
                      key={c.campaignId ?? i}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        i === 0
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                          i === 0 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{i + 1}
                        </span>
                        <div>
                          <div className="font-bold">{c.advertiserName}</div>
                          <div className="text-[10px] text-slate-400">{c.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cyan-300">{(c.finalScore ?? 0).toFixed(1)} pts</div>
                        <div className="text-[10px] text-slate-500">base: {(c.baseScore ?? 0).toFixed(1)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Winning Reason & Evidence Trail */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="text-[11px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                <span>Deterministic Winning Reason</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {audienceMaxDelay > 0
                  ? `Flight XY501 is delayed by +${audienceMaxDelay}m at Gate 42. Concession delay surge boost triggered +85% priority for comfort dining and grab & go concessions within walking proximity.`
                  : `Audience profile matched high-dwell holiday travelers departing Gate 42. Campaign qualified with the highest CPM demographic affinity index.`}
              </p>
            </div>

            <button
              onClick={() => setShowWhyModal(false)}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Close Transparency Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
