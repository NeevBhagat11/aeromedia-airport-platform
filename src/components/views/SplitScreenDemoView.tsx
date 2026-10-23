'use client';

import React, { useState } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { PassengerScreen } from '@/components/screens/PassengerScreen';
import { 
  Tv, 
  Store, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Ticket,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export function SplitScreenDemoView() {
  const {
    flights,
    screens,
    campaigns,
    redemptions,
    selectedDecisionLog,
    selectedAudience,
    simTimeFormatted,
    injectDelay,
  } = useAirportSimulation();

  const [activeRightTab, setActiveRightTab] = useState<'RETAILER' | 'ADMIN'>('RETAILER');

  const xy501 = flights.find(f => f.flightNumber === 'XY501');
  const isDelayed = Boolean(xy501?.delayMinutes && xy501.delayMinutes > 0);

  // Filter redemptions for Gate 42 concession
  const gateRedemptions = redemptions.filter(r => r.screenId === 'SCR-G42-01' || r.promoCode.includes('GATE42'));
  const totalAttributedRevenue = gateRedemptions.reduce((sum, r) => sum + r.attributedRevenue, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* 15-Minute Judge Pitch Guidance Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-800/60 rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white font-mono">
                  15-MINUTE JUDGE PITCH: ZERO-LATENCY AODB-TRIGGERED RETAIL MEDIA
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 font-semibold">
                  LIVE 50/50 SPLIT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-sans">
                Observe the left passenger display react in real-time when AODB reports a delay or gate swap, while the right dashboard attributes sales conversions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => injectDelay('XY501', isDelayed ? 0 : 45)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                isDelayed
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{isDelayed ? 'Clear Delay (On-Time)' : 'Inject 45m Delay on XY501'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 50 / 50 Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Passenger Screen Simulator (Gate 42) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Tv className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-mono">
                  PHYSICAL DIGITAL SCREEN • GATE 42
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  Hardware Node SCR-G42-01 (Concourse B)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">LIVE BROADCAST</span>
            </div>
          </div>

          <PassengerScreen customScreenId="SCR-G42-01" allowOrientationToggle={true} />
        </div>

        {/* Right Column: Role Dashboard Preview (Retailer Portal vs Platform Admin) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* Right Header & Tab Switcher */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
                {activeRightTab === 'RETAILER' ? <Store className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-mono uppercase">
                  {activeRightTab === 'RETAILER' ? 'Retail Concessionaire Telemetry' : 'Platform Decision Audit Log'}
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  {activeRightTab === 'RETAILER' ? 'Costa Coffee / Duty Free Gate 42 Outlet' : 'AODB/AIDX Deterministic Engine Trail'}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveRightTab('RETAILER')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeRightTab === 'RETAILER'
                    ? 'bg-purple-950 text-purple-300 border border-purple-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RETAILER VIEW
              </button>
              <button
                onClick={() => setActiveRightTab('ADMIN')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeRightTab === 'ADMIN'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ADMIN AUDIT
              </button>
            </div>
          </div>

          {/* Right Content Body */}
          {activeRightTab === 'RETAILER' ? (
            /* Retailer View Content */
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 backdrop-blur-sm">
              {/* Retailer KPI Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Concession Footfall</div>
                  <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span>{selectedAudience?.totalPax || 420} pax</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">
                    {isDelayed ? '▲ +45% delay surge' : '● normal flow'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Avg Holdroom Dwell</div>
                  <div className="text-lg font-bold text-amber-300 mt-0.5 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span>{selectedAudience?.dwellMinutesAvg || 48} mins</span>
                  </div>
                  <div className="text-[10px] text-amber-400/90 mt-1">
                    {isDelayed ? '+31m over scheduled' : 'standard boarding'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-400 uppercase">Attributed Sales</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${totalAttributedRevenue.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {gateRedemptions.length} QR vouchers
                  </div>
                </div>
              </div>

              {/* Dynamic Surge Status Box */}
              <div className={`p-3.5 rounded-xl border font-mono text-xs ${
                isDelayed
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    {isDelayed ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    <span>{isDelayed ? 'ACTIVE DELAY SURGE RULE (XY501)' : 'BASELINE AD SCHEDULE'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60">
                    {isDelayed ? '+85% MULTIPLIER' : '1.0x NORMAL'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {isDelayed
                    ? 'Costa Coffee & Express Bites has overtaken the Gate 42 screen slot because the delay trigger rule BR-DELAY-SURGE detected Flight XY501 is delayed by 45 minutes.'
                    : 'Flight XY501 is on-time. Screen slots are allocated based on baseline CPM and demographic affinity.'}
                </p>
              </div>

              {/* Live Voucher Redemption Feed */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="uppercase font-bold">Attributed Voucher Redemptions ({gateRedemptions.length})</span>
                  <Link href="/claim?code=GATE42DELAY" target="_blank" className="text-cyan-400 hover:underline flex items-center gap-0.5">
                    <span>Simulate Mobile Scan</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-xs pr-1">
                  {gateRedemptions.map(r => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 font-bold">
                          <Ticket className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{r.campaignTitle}</div>
                          <div className="text-[10px] text-slate-400">
                            Code: <strong className="text-amber-300">{r.promoCode}</strong> • {r.screenId}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-emerald-400">+${r.attributedRevenue.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">{r.simTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Admin Audit View Content */
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 uppercase font-bold">Real-time Decision Log Audit</span>
                <span className="text-cyan-400 font-bold">{simTimeFormatted}</span>
              </div>

              {selectedDecisionLog ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Selected Winner</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {selectedDecisionLog.winningCampaignName}
                    </div>
                    <div className="text-xs text-cyan-300 font-bold mt-1">
                      Final Deterministic Score: {selectedDecisionLog.score.toFixed(1)} pts
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">
                      Telemetry Evidence Trail:
                    </div>
                    {selectedDecisionLog.evidenceTrail.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2"
                      >
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  Awaiting decision log...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
