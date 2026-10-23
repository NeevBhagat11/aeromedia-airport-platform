'use client';

import React, { useState, useMemo } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { CreativeApprovalItem } from '@/types';
import { 
  BarChart3, 
  Layers, 
  DollarSign, 
  Tag, 
  PlusCircle, 
  TrendingUp, 
  Sparkles, 
  CheckCircle,
  Clock,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Tv,
  Check,
  X,
  Sliders,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export function MediaManagerView() {
  const { 
    campaigns, 
    screens, 
    decisionLogs, 
    creativeApprovals, 
    approveCreative,
    rejectCreative,
    currency,
    flights,
    simTimeFormatted,
    injectDelay
  } = useAirportSimulation();

  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.94); // $18 -> ~$35
  const [selectedSlot, setSelectedSlot] = useState<{ screen: string; hour: string; status: string; cpm: number; pax: number } | null>(null);
  const [rejectFeedbackId, setRejectFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('Creative image requires higher contrast for direct airport sunlight.');

  const xy501 = flights.find(f => f.flightNumber === 'XY501');
  const isDelayed = Boolean(xy501?.delayMinutes && xy501.delayMinutes > 0);

  // Currency multiplier
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'AED ';
  const currencyRate = currency === 'USD' ? 1.0 : currency === 'EUR' ? 0.92 : 3.67;

  const baseCpm = 18.0;
  const surgeCpm = Number((baseCpm * surgeMultiplier).toFixed(2));
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget * currencyRate), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressionsDelivered, 48200);

  // Time hours for occupancy calendar
  const timeSlots = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  // Occupancy matrix data
  const occupancyMatrix = useMemo(() => {
    return screens.map(scr => {
      const isGate42 = scr.gateId === 'Gate 42' || scr.id.includes('G42');
      const isDutyFree = scr.id.includes('DUTYFREE');

      return {
        screenId: scr.id,
        screenName: scr.name,
        gate: scr.gateId || 'Central',
        orientation: scr.orientation,
        slots: timeSlots.map((time, idx) => {
          // Surge during 14:00 - 16:00 if delayed or at duty free
          const isSurgeTime = (time === '14:00' || time === '15:00') && (isGate42 && isDelayed);
          const isBooked = !isSurgeTime && (idx % 2 === 0 || isDutyFree);
          const paxForecast = isSurgeTime ? 620 : isBooked ? 380 : 190;
          const slotStatus: 'SURGE' | 'BOOKED' | 'AVAILABLE' = isSurgeTime ? 'SURGE' : isBooked ? 'BOOKED' : 'AVAILABLE';
          const slotCpm = isSurgeTime ? surgeCpm : baseCpm;

          return {
            time,
            status: slotStatus,
            cpm: slotCpm,
            pax: paxForecast,
            campaign: isSurgeTime 
              ? 'Costa Coffee Delay Special' 
              : isBooked 
                ? (isDutyFree ? 'Metropolis Luxury Rolex' : 'TUMI Travel Luggage')
                : 'Unsold Spot',
          };
        }),
      };
    });
  }, [screens, isDelayed, surgeCpm]);

  // Pricing curve points
  const yieldCurvePoints = [
    { dwell: '15m (Fast Walk)', footfall: 150, cpm: baseCpm, label: 'Base Pass-Through' },
    { dwell: '30m (Standard Gate)', footfall: 280, cpm: baseCpm * 1.25, label: 'Boarding Queue' },
    { dwell: '45m (Flight Delay)', footfall: 490, cpm: baseCpm * 1.6, label: 'Holdroom Captive' },
    { dwell: '60m+ (Extended Surge)', footfall: 640, cpm: surgeCpm, label: 'High Dwell Monetization' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-900 to-cyan-900 border border-blue-700/60 flex items-center justify-center text-cyan-300 shadow-lg">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>MEDIA MANAGER & YIELD ENGINE</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                PROGRAMMATIC AD SERVER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Terminal Screen Inventory, Dynamic Surge CPM Yield & Automated Brand Safety Verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => injectDelay('XY501', isDelayed ? 0 : 45)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all shadow"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{isDelayed ? 'Reset Gate Delay' : 'Simulate Surge (+45m Delay)'}</span>
          </button>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Active Screens: <strong className="text-emerald-400">{screens.filter(s => s.status === 'ONLINE').length} / {screens.length}</strong>
          </span>
        </div>
      </div>

      {/* 2. KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Network Occupancy (7-Day)</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1 flex items-center gap-1.5">
            <Calendar className="h-5 w-5 text-cyan-400" />
            <span>88.4%</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">+4.2% vs last week bank</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Effective Dynamic CPM</div>
          <div className="text-2xl font-bold text-amber-300 mt-1 flex items-center gap-1.5">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <span>{currencySymbol}{surgeCpm.toFixed(2)}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Base: ${baseCpm.toFixed(2)} • Surge active at Gate 42</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Projected Monthly Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <span>{currencySymbol}{(248500 * currencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">+18.5% with flight delay triggers</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Brand Safety Approvals</div>
          <div className="text-2xl font-bold text-purple-300 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-purple-400" />
            <span>{creativeApprovals.filter(a => a.status === 'PENDING').length} Pending</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Automated category separation active</div>
        </div>
      </div>

      {/* 3. Screen Inventory & Occupancy Calendar Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Screen Inventory & Occupancy Calendar Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live DOOH time-slot allocation across terminal totems. Amber slots highlight delay passenger surge (&gt;500 pax).
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-3 w-3 rounded bg-slate-800 border border-slate-700 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-3 w-3 rounded bg-cyan-900 border border-cyan-500 inline-block" /> Booked
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-3 w-3 rounded bg-amber-500 border border-amber-300 animate-pulse inline-block" /> Premium Surge (&gt;500 pax)
            </span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3 min-w-[200px]">Screen / Physical Pod</th>
                <th className="py-2.5 px-2 text-center">Format</th>
                {timeSlots.map(time => (
                  <th key={time} className={`py-2.5 px-2 text-center min-w-[90px] ${time === '14:00' ? 'text-cyan-400 font-bold bg-slate-950/60 rounded-t' : ''}`}>
                    {time} {time === '14:00' ? '• NOW' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {occupancyMatrix.map(row => (
                <tr key={row.screenId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Tv className="h-3.5 w-3.5 text-slate-400" />
                      <span>{row.screenId}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{row.screenName}</div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {row.orientation}
                    </span>
                  </td>
                  {row.slots.map((slot, sIdx) => {
                    const isSelected = selectedSlot?.screen === row.screenId && selectedSlot?.hour === slot.time;
                    return (
                      <td key={sIdx} className="py-2 px-1.5 text-center">
                        <button
                          onClick={() => setSelectedSlot({
                            screen: row.screenId,
                            hour: slot.time,
                            status: slot.status,
                            cpm: slot.cpm,
                            pax: slot.pax,
                          })}
                          className={`w-full py-2 px-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                            slot.status === 'SURGE'
                              ? 'bg-amber-950/80 text-amber-200 border-amber-500 shadow-md shadow-amber-950/40 ring-1 ring-amber-400 animate-pulse'
                              : slot.status === 'BOOKED'
                                ? 'bg-cyan-950/70 text-cyan-200 border-cyan-800 hover:border-cyan-600'
                                : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
                          } ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
                        >
                          <div>{slot.status === 'SURGE' ? 'SURGE' : slot.status === 'BOOKED' ? 'BOOKED' : 'OPEN'}</div>
                          <div className="text-[9px] opacity-80">{currencySymbol}{slot.cpm.toFixed(0)}</div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Slot Drawer */}
        {selectedSlot && (
          <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 font-bold">
                {selectedSlot.hour}
              </div>
              <div>
                <div className="text-white font-bold flex items-center gap-2">
                  <span>Slot Details: Screen {selectedSlot.screen} at {selectedSlot.hour}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    selectedSlot.status === 'SURGE' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-cyan-950 text-cyan-300'
                  }`}>
                    {selectedSlot.status}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Predicted Pax Flow: <strong className="text-slate-200">{selectedSlot.pax} travelers</strong> • Dynamic Clearing Price: <strong className="text-emerald-400">{currencySymbol}{selectedSlot.cpm.toFixed(2)} CPM</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedSlot(null)}
              className="text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-900 border border-slate-800"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* 4. Dynamic Pricing & Yield Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Yield Curve Visualizer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Dynamic Pricing & Delay Yield Curve
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              REAL-TIME CPM CLEARING
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            Automated programmatic multiplier escalates CPM based on passenger dwell and delay severity.
          </p>

          {/* Pricing Step Visualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {yieldCurvePoints.map((pt, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border font-mono ${
                  idx === 3 && isDelayed 
                    ? 'bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-400/50' 
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase">{pt.dwell}</div>
                <div className="text-xl font-black text-white mt-1">
                  {currencySymbol}{(pt.cpm * currencyRate).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{pt.footfall} pax captive</div>
                <div className="text-[10px] text-cyan-400 font-bold mt-2 pt-1 border-t border-slate-800/80">
                  {pt.label}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Surge Multiplier Slider */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-bold">Delay Surge Multiplier Tuning:</span>
              <span className="text-amber-400 font-bold text-sm">{surgeMultiplier}x (${(baseCpm * surgeMultiplier).toFixed(2)} CPM)</span>
            </div>
            <input
              type="range"
              min="1.2"
              max="2.5"
              step="0.05"
              value={surgeMultiplier}
              onChange={e => setSurgeMultiplier(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Standard 1.2x ($21.60)</span>
              <span>Balanced 1.9x ($34.20)</span>
              <span>Aggressive 2.5x ($45.00)</span>
            </div>
          </div>
        </div>

        {/* 7-Day Revenue & Demand Projection */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span>Weekly Yield Forecast</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">+22% MoM</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Scheduled Flight Baseline:</span>
                <span className="text-white font-bold">{currencySymbol}{(42000 * currencyRate).toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Delay-Triggered Premium Surge:</span>
                <span className="text-amber-400 font-bold">+{currencySymbol}{(16200 * currencyRate).toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Concession QR Attributed Share:</span>
                <span className="text-purple-300 font-bold">+{currencySymbol}{(8400 * currencyRate).toLocaleString()}</span>
              </div>
              <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-800/80 flex justify-between items-center">
                <span className="text-emerald-300 font-bold">Gross Projected Weekly Ad Revenue:</span>
                <span className="text-emerald-200 font-black text-base">
                  {currencySymbol}{(66600 * currencyRate).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Smart ad server recalculates bids every 60 seconds matching AIDX passenger load updates.</span>
          </div>
        </div>
      </div>

      {/* 5. Creative Review & Brand Safety Approval Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Creative Review & Brand Safety Approval Queue ({creativeApprovals.length})
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Automated category conflict detection (e.g. adjacent luxury watch/fragrance competitors) and brand compliance
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Pending Queue: <strong className="text-amber-400">{creativeApprovals.filter(a => a.status === 'PENDING').length}</strong>
          </div>
        </div>

        {/* Approval Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creativeApprovals.map(item => (
            <div 
              key={item.id}
              className={`bg-slate-950 rounded-2xl border p-4 flex flex-col justify-between gap-4 transition-all ${
                item.status === 'APPROVED' 
                  ? 'border-emerald-800/80' 
                  : item.status === 'REJECTED' 
                    ? 'border-rose-900/80 opacity-70' 
                    : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header tag & status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.category}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : item.status === 'REJECTED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Campaign info */}
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">{item.campaignTitle}</h4>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    By <strong>{item.advertiserName}</strong> • Target: {item.zoneId}
                  </div>
                </div>

                {/* Brand Safety Verification Pill */}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5">
                    {item.brandSafetyStatus === 'PASSED' ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span className={`font-bold ${item.brandSafetyStatus === 'PASSED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      Safety: {item.brandSafetyStatus}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    {item.safetyCheckNotes}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {item.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => setRejectFeedbackId(item.id)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-800 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => approveCreative(item.id)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-black transition-colors flex items-center justify-center gap-1 shadow"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center text-xs font-mono text-slate-500 py-1">
                    Decision logged at {item.submittedAt}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject with Feedback Modal */}
      {rejectFeedbackId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 font-mono">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>Reject Creative with Feedback</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Audit Feedback Notes for Advertiser:</label>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectFeedbackId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectCreative(rejectFeedbackId, feedbackText);
                  setRejectFeedbackId(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
