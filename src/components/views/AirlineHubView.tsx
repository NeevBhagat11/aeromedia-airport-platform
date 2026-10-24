'use client';

import React, { useState, useMemo } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { CoMarketingPartnerOffer } from '@/types';
import { 
  Plane, 
  AlertTriangle, 
  Clock, 
  Users, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  Coffee,
  Calendar,
  Send,
  Radio,
  Sliders,
  DollarSign,
  ShieldCheck,
  Check,
  Percent,
  Play
} from 'lucide-react';

export function AirlineHubView() {
  const {
    selectedAirline,
    setSelectedAirline,
    flights,
    simTimeFormatted,
    injectDelay,
    delayGoodwillRule,
    toggleGoodwillRule,
    triggerGoodwillVoucher,
    coMarketingOffers,
    toggleCoMarketingOffer,
  } = useAirportSimulation();

  // Sponsored messaging state
  const [targetFlightNumber, setTargetFlightNumber] = useState<string>('XY501');
  const [messageType, setMessageType] = useState<string>('Lounge Day Pass ($45)');
  const [customHeadline, setCustomHeadline] = useState<string>('Relax in Style before Departure: Business Lounge Access Available at Gate 42');
  const [broadcastActive, setBroadcastActive] = useState<boolean>(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  // Filter flights for this airline
  const airlineFlights = useMemo(() => {
    return (flights || []).filter(f => {
      if (!f) return false;
      if (selectedAirline?.toLowerCase().includes('skyleisure')) {
        return f.airlineCode === 'ZQ';
      }
      return f.airlineCode === 'XY' || f.airlineCode === 'EK';
    });
  }, [flights, selectedAirline]);

  const xy501 = (flights || []).find(f => f?.flightNumber === 'XY501');
  const isDelayed = Boolean(xy501?.delayMinutes && xy501.delayMinutes > 0);

  const handleBroadcastMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastActive(true);
    setBroadcastFeedback(`Broadcast dispatched to ${targetFlightNumber} gate screens for the boarding window.`);
    setTimeout(() => {
      setBroadcastFeedback(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Airline Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-900 to-blue-900 border border-indigo-700/60 flex items-center justify-center text-indigo-300 shadow-lg">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>STATION MANAGER HUB</span>
                <span className="text-slate-500">•</span>
                <span className="text-indigo-400">{selectedAirline.toUpperCase()}</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                AODB PASSENGER CARE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Metropolis Hub Operations • Boarding Holdroom Screens & Automated Delay Mitigation Protocols
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Airline Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Airline:</span>
            <select
              value={selectedAirline}
              onChange={e => setSelectedAirline(e.target.value)}
              className="bg-slate-900 text-slate-100 text-xs font-mono font-bold focus:outline-none cursor-pointer rounded px-1.5 py-0.5"
            >
              <option value="Emirates/FlyMetropolis" className="bg-slate-900 text-slate-100 py-1">FlyMetropolis (XY / EK)</option>
              <option value="SkyLeisure" className="bg-slate-900 text-slate-100 py-1">SkyLeisure Airways (ZQ)</option>
            </select>
          </div>

          <button
            onClick={() => injectDelay('XY501', isDelayed ? 0 : 45)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all shadow"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{isDelayed ? 'Clear XY501 Delay' : 'Simulate Delay (+45m)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Automated Delay Goodwill Protocol Banner & Configurator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Autonomous Delay Goodwill Automation (IRROPS)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
              delayGoodwillRule?.enabled
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {delayGoodwillRule?.enabled ? 'AUTOMATION ACTIVE' : 'RULE PAUSED'}
            </span>
            <button
              onClick={toggleGoodwillRule}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                delayGoodwillRule?.enabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {delayGoodwillRule?.enabled ? 'Pause Rule' : 'Enable Rule'}
            </button>
          </div>
        </div>

        {/* Rule explanation & Instant Test Trigger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs">
          <div className="lg:col-span-8 space-y-1">
            <div className="text-white font-bold flex items-center gap-2">
              <span>Rule Contract:</span>
              <span className="text-indigo-400">
                When Flight Delay &gt; {delayGoodwillRule?.delayThresholdMinutes ?? 30} mins → Trigger {delayGoodwillRule?.voucherDiscount ?? '20% OFF'} {delayGoodwillRule?.sponsorPartner ?? 'Costa Coffee'} Voucher
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Cost Split: <strong>{delayGoodwillRule?.costSplit ?? '50% Airline / 50% Concession'}</strong> • Target: Holdroom screens at affected departure gate • Passenger satisfaction lift: +42 NPS
            </p>
          </div>

          <div className="lg:col-span-4 flex items-center justify-end gap-2">
            <button
              onClick={triggerGoodwillVoucher}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Coffee className="h-4 w-4" />
              <span>Test Trigger Goodwill Voucher</span>
            </button>
          </div>
        </div>

        {isDelayed && (
          <div className="bg-amber-950/40 border border-amber-500/60 text-amber-200 p-3.5 rounded-xl font-mono text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 animate-bounce" />
              <span>
                <strong>Flight XY501 is currently delayed 45 minutes!</strong> Goodwill voucher successfully deployed to Gate 42 screen SCR-G42-01.
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-amber-300">
              CO-FUNDED 50/50 ACTIVE
            </span>
          </div>
        )}
      </div>

      {/* 3. My Flights Today Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                My Flights Today Operations Timeline ({airlineFlights.length} Flights)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live AODB departures, gate allocations, passenger load factors, and DOOH messaging status
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Current Hub Clock: <strong className="text-slate-200">{simTimeFormatted}</strong>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Flight #</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">Gate</th>
                <th className="py-2.5 px-3">STD / ETD</th>
                <th className="py-2.5 px-3">Pax Count</th>
                <th className="py-2.5 px-3">Load Factor</th>
                <th className="py-2.5 px-3">Flight Status</th>
                <th className="py-2.5 px-3">Screen Broadcast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {airlineFlights.slice(0, 10).map((f, idx) => {
                const isFlightDelayed = f.delayMinutes > 0;
                // Synthetic load factor
                const loadFactor = [94, 88, 92, 79, 96, 85, 91][idx % 7];
                return (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{f.flightNumber}</td>
                    <td className="py-3 px-3 text-slate-200">{f.destination} ({f.destinationCity})</td>
                    <td className="py-3 px-3 text-cyan-300 font-bold">{f.gate}</td>
                    <td className="py-3 px-3">
                      <div>{(f.scheduledTime?.includes('T') ? f.scheduledTime.split('T')[1]?.substring(0, 5) : f.scheduledTime) ?? '14:00'} UTC</div>
                      <div className={isFlightDelayed ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                        {(f.estimatedTime?.includes('T') ? f.estimatedTime.split('T')[1]?.substring(0, 5) : f.estimatedTime) ?? '14:00'} UTC {isFlightDelayed ? `(+${f.delayMinutes}m)` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-3">{f.paxCount} pax</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{loadFactor}%</span>
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full" 
                            style={{ width: `${loadFactor}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFlightDelayed 
                          ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                          : f.status === 'BOARDING'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isFlightDelayed ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Coffee className="h-3 w-3" />
                          <span>Costa Care Voucher</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Radio className="h-3 w-3 text-cyan-400" />
                          <span>Priority Boarding Window</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Gate-Area Sponsored Messaging Scheduler */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scheduler Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Gate Holdroom Sponsored Messaging Scheduler
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
              BOARDING WINDOW SLOT
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            Broadcast targeted airline ancillary offers (Lounge Passes, Priority Boarding, Upgrades) during passenger boarding dwell.
          </p>

          <form onSubmit={handleBroadcastMessage} className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Target Flight & Gate:</label>
                <select
                  value={targetFlightNumber}
                  onChange={e => setTargetFlightNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  {airlineFlights.slice(0, 6).map(f => (
                    <option key={f.id} value={f.flightNumber}>
                      {f.flightNumber} to {f.destination} ({f.gate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ancillary Campaign Template:</label>
                <select
                  value={messageType}
                  onChange={e => {
                    setMessageType(e.target.value);
                    if (e.target.value.includes('Lounge')) {
                      setCustomHeadline('Relax in Style before Departure: Business Lounge Day Pass Available ($45)');
                    } else if (e.target.value.includes('Priority')) {
                      setCustomHeadline('Skip the Queue: Zone 1 Priority Boarding Add-On via Airline App');
                    } else {
                      setCustomHeadline('Last-Minute Cabin Upgrade to Dubai Business Suite Available at Gate Podium');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Lounge Day Pass ($45)">Lounge Day Pass ($45)</option>
                  <option value="Priority Boarding Zone 1">Priority Boarding Zone 1</option>
                  <option value="Destination Upgrade Offers">Destination Business Upgrade Offers</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Custom Digital Screen Copy:</label>
              <textarea
                value={customHeadline}
                onChange={e => setCustomHeadline(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500 text-[11px]">
                Broadcast automatically schedules for T-45m boarding window
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Broadcast to Gate Screens</span>
              </button>
            </div>
          </form>

          {broadcastFeedback && (
            <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 px-4 py-2.5 rounded-xl font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{broadcastFeedback}</span>
            </div>
          )}
        </div>

        {/* Live Gate Preview */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Screen Mockup Preview</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                16:9 Gate Totem
              </span>
            </div>

            {/* Simulated Totem Card */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 p-4 rounded-xl border border-indigo-800/80 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                  AIRLINE SPONSORED MESSAGE
                </span>
                <span className="text-[10px] font-mono text-indigo-300">
                  {targetFlightNumber} • Holdroom
                </span>
              </div>

              <h4 className="text-sm font-bold text-white font-mono leading-snug">
                {customHeadline}
              </h4>

              <div className="flex items-center justify-between border-t border-indigo-800/60 pt-2 text-[11px] font-mono text-slate-400">
                <span>Scan QR on Screen to Claim</span>
                <span className="text-indigo-400 font-bold">App Sync Active</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Compliant with IATA holdroom display frequency guidelines.</span>
          </div>
        </div>
      </div>

      {/* 5. Partner Co-Marketing Marketplace */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Partner Co-Marketing Marketplace ({(coMarketingOffers || []).length} Offers)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Concessionaire revenue-share offers targeting arriving & departing airline passengers
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Authorized Deals: <strong className="text-emerald-400">{(coMarketingOffers || []).filter(o => o.authorized).length}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(coMarketingOffers || []).map(offer => (
            <div 
              key={offer.id}
              className={`bg-slate-950 rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                offer.authorized ? 'border-emerald-800/80 ring-1 ring-emerald-500/30' : 'border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {offer.category}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    offer.authorized ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {offer.authorized ? 'PARTNERSHIP ACTIVE' : 'PENDING APPROVAL'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white font-mono">{offer.offerTitle}</h4>
                <div className="text-xs text-slate-400 font-mono">
                  By <strong>{offer.retailerName}</strong>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Airline Commission Split:</span>
                    <strong className="text-emerald-400">{offer.commissionPct}% Rev Share</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Passenger Bonus: <span className="text-cyan-300">{offer.exclusiveAirlineBonus}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => toggleCoMarketingOffer(offer.id)}
                  className={`w-full py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    offer.authorized
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  <span>{offer.authorized ? 'De-Authorize Partnership' : 'Authorize Partnership (1-Click)'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
