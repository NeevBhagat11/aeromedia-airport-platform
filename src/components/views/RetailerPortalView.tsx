'use client';

import React, { useState, useMemo } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { generateCreativeDraft, STARTER_PROMPTS } from '@/engine/genaiCreative';
import { GenAiCreativeDraft } from '@/types';
import { 
  Store, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Sparkles, 
  AlertTriangle, 
  Ticket, 
  Tag, 
  ExternalLink,
  Sliders,
  Send,
  Globe,
  CheckCircle2,
  RefreshCw,
  BarChart2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';
import Link from 'next/link';

interface PastCampaignStat {
  id: string;
  name: string;
  status: 'ACTIVE' | 'COMPLETED';
  spend: number;
  impressions: number;
  ctr: number;
  redemptions: number;
  roi: string;
  targetGate: string;
}

export function RetailerPortalView() {
  const {
    selectedRetailerOutlet,
    setSelectedRetailerOutlet,
    campaigns,
    redemptions,
    flights,
    simTimeFormatted,
    injectDelay,
    deployGeneratedCampaign,
    currency,
  } = useAirportSimulation();

  const xy501 = flights.find(f => f.flightNumber === 'XY501');
  const isDelayed = Boolean(xy501?.delayMinutes && xy501.delayMinutes > 0);

  // Currency multiplier
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'AED ';
  const currencyRate = currency === 'USD' ? 1.0 : currency === 'EUR' ? 0.92 : 3.67;

  // Filter campaigns belonging to this outlet
  const outletCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const adv = c.advertiserName.toLowerCase();
      if (selectedRetailerOutlet === 'Costa Coffee') return adv.includes('costa');
      if (selectedRetailerOutlet === 'Metropolis Duty Free') return adv.includes('duty free') || adv.includes('rolex');
      if (selectedRetailerOutlet === 'Shake Shack') return adv.includes('shake shack') || adv.includes('burger');
      if (selectedRetailerOutlet === 'TUMI') return adv.includes('tumi') || adv.includes('luggage');
      return true;
    });
  }, [campaigns, selectedRetailerOutlet]);

  const outletRedemptions = useMemo(() => {
    return redemptions.filter(r => {
      const adv = r.advertiserName.toLowerCase();
      if (selectedRetailerOutlet === 'Costa Coffee') return adv.includes('costa') || r.promoCode.includes('GATE42') || r.promoCode.includes('COSTA');
      if (selectedRetailerOutlet === 'Metropolis Duty Free') return adv.includes('duty free') || adv.includes('rolex');
      if (selectedRetailerOutlet === 'Shake Shack') return adv.includes('shake shack');
      if (selectedRetailerOutlet === 'TUMI') return adv.includes('tumi');
      return true;
    });
  }, [redemptions, selectedRetailerOutlet]);

  const totalRevenue = outletRedemptions.reduce((acc, r) => acc + (r.attributedRevenue * currencyRate), 0);
  const totalScans = Math.max(148, outletRedemptions.length * 5 + 42);
  const totalImpressions = outletCampaigns.reduce((acc, c) => acc + c.impressionsDelivered, 6420);
  const conversionRate = totalScans > 0 ? ((outletRedemptions.length / totalScans) * 100).toFixed(1) : '2.8';

  // 2-Hour Passenger Footfall & Dwell Forecast
  // Generated based on scheduled flight departure times in next 120 mins
  const footfallForecast = useMemo(() => {
    const intervals = [
      { time: '14:00', label: '14:00 - 14:15', pax: 280, businessPct: 65, holidayPct: 35, surge: false },
      { time: '14:15', label: '14:15 - 14:30', pax: isDelayed ? 490 : 340, businessPct: 58, holidayPct: 42, surge: isDelayed },
      { time: '14:30', label: '14:30 - 14:45', pax: isDelayed ? 620 : 410, businessPct: 45, holidayPct: 55, surge: true },
      { time: '14:45', label: '14:45 - 15:00', pax: 540, businessPct: 40, holidayPct: 60, surge: true },
      { time: '15:00', label: '15:00 - 15:15', pax: 380, businessPct: 52, holidayPct: 48, surge: false },
      { time: '15:15', label: '15:15 - 15:30', pax: 290, businessPct: 60, holidayPct: 40, surge: false },
      { time: '15:30', label: '15:30 - 15:45', pax: 310, businessPct: 55, holidayPct: 45, surge: false },
      { time: '15:45', label: '15:45 - 16:00', pax: 430, businessPct: 48, holidayPct: 52, surge: false },
    ];
    return intervals;
  }, [isDelayed]);

  // Campaign Builder State
  const [targetBusiness, setTargetBusiness] = useState<number>(60);
  const [targetHoliday, setTargetHoliday] = useState<number>(40);
  const [targetFamily, setTargetFamily] = useState<number>(30);
  const [minPax, setMinPax] = useState<number>(150);
  const [intlOnly, setIntlOnly] = useState<boolean>(true);
  const [delayOnly, setDelayOnly] = useState<boolean>(false);
  const [dailyBudget, setDailyBudget] = useState<number>(1200);
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([
    'Gate 42 Holdroom Totem',
    'Concourse B Food Hall',
  ]);

  // Calculate live audience fit score based on sliders
  const audienceFitScore = useMemo(() => {
    let score = 50;
    if (targetBusiness > 50) score += 12;
    if (delayOnly) score += isDelayed ? 25 : -10;
    if (minPax <= 180) score += 10;
    if (intlOnly) score += 8;
    return Math.min(98, Math.max(25, score));
  }, [targetBusiness, delayOnly, minPax, intlOnly, isDelayed]);

  const predictedImpressions = useMemo(() => {
    return Math.round((dailyBudget / 24) * (audienceFitScore / 100) * 85);
  }, [dailyBudget, audienceFitScore]);

  // GenAI Creative Studio State
  const [showGenAiModal, setShowGenAiModal] = useState<boolean>(false);
  const [briefPrompt, setBriefPrompt] = useState<string>(
    'Festive sweets, 20% off for families flying international'
  );
  const [previewLanguage, setPreviewLanguage] = useState<'EN' | 'ES' | 'AR' | 'HI'>('EN');
  const [generatedDraft, setGeneratedDraft] = useState<GenAiCreativeDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState<string | null>(null);

  // Past Campaigns History Table Data
  const [pastCampaigns, setPastCampaigns] = useState<PastCampaignStat[]>([
    {
      id: 'PC-01',
      name: `${selectedRetailerOutlet} Morning Rush Exclusive`,
      status: 'COMPLETED',
      spend: 450,
      impressions: 18400,
      ctr: 4.2,
      redemptions: 64,
      roi: '3.8x',
      targetGate: 'Gates 40-44',
    },
    {
      id: 'PC-02',
      name: `${selectedRetailerOutlet} Gate 42 Delay Care Flash`,
      status: 'ACTIVE',
      spend: 320,
      impressions: 11200,
      ctr: 5.8,
      redemptions: 48,
      roi: '4.6x',
      targetGate: 'Gate 42',
    },
    {
      id: 'PC-03',
      name: `${selectedRetailerOutlet} Weekend Getaway Special`,
      status: 'COMPLETED',
      spend: 600,
      impressions: 22800,
      ctr: 3.6,
      redemptions: 72,
      roi: '3.2x',
      targetGate: 'Concourse Central',
    },
  ]);

  const handleGenerateDraft = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const draft = generateCreativeDraft({
        brandName: selectedRetailerOutlet,
        brief: briefPrompt,
        category: selectedRetailerOutlet === 'Costa Coffee' ? 'Grab & Go F&B' : 'Retail',
        discountPercent: 20,
        language: previewLanguage,
      });
      setGeneratedDraft(draft);
      setIsGenerating(false);
    }, 400);
  };

  const handleDeployCampaign = () => {
    if (!generatedDraft) return;
    const newCamp = deployGeneratedCampaign(generatedDraft, dailyBudget, minPax);
    setDeploymentSuccess(`Campaign "${newCamp.title}" deployed to active DOOH rotation! (ID: ${newCamp.id})`);
    
    // Also prepend to past campaigns table
    setPastCampaigns(prev => [
      {
        id: newCamp.id,
        name: newCamp.title,
        status: 'ACTIVE',
        spend: dailyBudget,
        impressions: 0,
        ctr: 0.0,
        redemptions: 0,
        roi: 'Calculating...',
        targetGate: 'Gate 42 / Concourse B',
      },
      ...prev,
    ]);

    setTimeout(() => {
      setShowGenAiModal(false);
      setDeploymentSuccess(null);
    }, 2000);
  };

  const handleRunAgain = (campaign: PastCampaignStat) => {
    setDailyBudget(campaign.spend);
    alert(`Loaded settings for "${campaign.name}". Ready to re-launch.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Outlet Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-700/60 flex items-center justify-center text-purple-300 shadow-lg">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>CONCESSIONAIRE PORTAL</span>
                <span className="text-slate-500">•</span>
                <span className="text-purple-400">{selectedRetailerOutlet.toUpperCase()}</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                ATTRIBUTION ENGINE LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Terminal 1 Concourse B • Direct Passenger Screen Attribution & Autonomous Flight Triggers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Outlet Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Outlet:</span>
            <select
              value={selectedRetailerOutlet}
              onChange={e => setSelectedRetailerOutlet(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="Metropolis Duty Free">Metropolis Duty Free</option>
              <option value="Costa Coffee">Costa Coffee</option>
              <option value="Shake Shack">Shake Shack</option>
              <option value="TUMI">TUMI Travel Luxury</option>
            </select>
          </div>

          {/* Quick delay surge injector */}
          <button
            onClick={() => injectDelay('XY501', isDelayed ? 0 : 45)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all shadow"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{isDelayed ? 'Reset Delay' : 'Simulate Delay (+45m)'}</span>
          </button>

          {/* GenAI Launch Button */}
          <button
            onClick={() => {
              setShowGenAiModal(true);
              if (!generatedDraft) handleGenerateDraft();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-lg shadow-purple-900/40 transition-all"
          >
            <Sparkles className="h-4 w-4 text-purple-200 animate-spin" style={{ animationDuration: '4s' }} />
            <span>GenAI Creative Studio</span>
          </button>
        </div>
      </div>

      {/* 2. Live Concession Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Delivered Impressions</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 flex items-center gap-1">
            <Users className="h-5 w-5 text-cyan-500" />
            <span>{totalImpressions.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Screens at Gates 40-45</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">QR Voucher Scans</div>
          <div className="text-2xl font-bold text-purple-300 mt-1 flex items-center gap-1">
            <Tag className="h-5 w-5 text-purple-400" />
            <span>{totalScans.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-purple-400/90 mt-1">Passenger screen scans</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">In-Store Redemptions</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1">
            <Ticket className="h-5 w-5 text-amber-400" />
            <span>{outletRedemptions.length}</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">+12 in last 30 mins</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Conversion Rate</div>
          <div className="text-2xl font-bold text-indigo-300 mt-1 flex items-center gap-1">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <span>{conversionRate}%</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Scans to register checkout</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Attributed Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <span>{currencySymbol}{totalRevenue.toFixed(2)}</span>
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Verified POS redemptions</div>
        </div>
      </div>

      {/* 3. 2-Hour Passenger Footfall & Dwell Forecast */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                2-Hour Passenger Footfall & Dwell Forecast (Next 120 Mins)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Predictive crowd model based on AODB scheduled departures & gate walking buffers
            </p>
          </div>

          {/* Demographic callout box */}
          <div className="bg-cyan-950/60 border border-cyan-800/80 rounded-xl px-4 py-2 font-mono text-xs text-cyan-200">
            <span className="font-bold text-white">Next 60 min:</span> 1,240 pax • <span className="text-amber-300 font-bold">58% holiday</span> • Top destinations: <span className="text-cyan-300 font-bold">DXB, LHR, MLE</span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 items-end h-36 border-b border-slate-800 pb-2">
            {footfallForecast.map((bar, idx) => {
              const heightPct = Math.min(100, (bar.pax / 650) * 100);
              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.pax} pax
                  </div>
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 relative ${
                      bar.surge
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-gradient-to-t from-cyan-700 to-cyan-500'
                    }`}
                  >
                    {bar.surge && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-300 bg-amber-950 px-1 rounded border border-amber-800">
                        SURGE
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-[11px] font-mono font-bold text-slate-300 block">{bar.time}</span>
                    <span className="text-[9px] font-mono text-slate-500 block">{bar.pax}p</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-cyan-600 inline-block" /> Regular Baseline
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-amber-500 inline-block" /> Gate Delay High-Dwell Surge (&gt;500 pax)
              </span>
            </div>
            <div className="text-slate-500">
              Current Simulation Reference: <span className="text-slate-300 font-bold">{simTimeFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Campaign Builder & Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Controls */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Audience-Triggered Campaign Builder
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              AUTONOMOUS ENGINE
            </span>
          </div>

          {/* Demographic Sliders */}
          <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wide">
              Target Demographic Mix Weights
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Business Travelers:</span>
                  <span className="font-bold text-cyan-400">{targetBusiness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={targetBusiness}
                  onChange={e => setTargetBusiness(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Holiday Travelers:</span>
                  <span className="font-bold text-amber-400">{targetHoliday}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={targetHoliday}
                  onChange={e => setTargetHoliday(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Family Groups:</span>
                  <span className="font-bold text-emerald-400">{targetFamily}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={targetFamily}
                  onChange={e => setTargetFamily(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Hard Filters & Triggers */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wide">
              Deterministic Hard Triggers & Gating Rules
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={intlOnly}
                  onChange={e => setIntlOnly(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900 h-4 w-4"
                />
                <span>International Flights Only</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={delayOnly}
                  onChange={e => setDelayOnly(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950 h-4 w-4"
                />
                <span className="text-amber-300">Trigger on Gate Delay &gt; 30m</span>
              </label>

              <div className="sm:col-span-2 flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span className="text-slate-400">Minimum Gate Passenger Load:</span>
                <select
                  value={minPax}
                  onChange={e => setMinPax(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                >
                  <option value={100}>100+ Passengers</option>
                  <option value={150}>150+ Passengers</option>
                  <option value={200}>200+ Passengers</option>
                  <option value={250}>250+ Passengers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Daily Budget Cap */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs">
            <div>
              <span className="text-slate-300 font-bold block">Daily Budget Cap</span>
              <span className="text-slate-500 text-[11px]">Maximum allocated ad spend per 24 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-400">{currencySymbol}{dailyBudget}</span>
              <input
                type="range"
                min="400"
                max="5000"
                step="100"
                value={dailyBudget}
                onChange={e => setDailyBudget(Number(e.target.value))}
                className="w-28 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Audience Fit Preview & Quick Launch */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Live Audience Fit Preview</span>
              </h3>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                audienceFitScore >= 70 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {audienceFitScore}% MATCH
              </span>
            </div>

            {/* Match Dial & Status */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-center space-y-2">
              <div className="text-3xl font-black font-mono text-cyan-300">
                {predictedImpressions.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-slate-400">
                Predicted 6-hour impressions across targeted gate zones
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${audienceFitScore}%` }}
                />
              </div>
            </div>

            {/* Dynamic Audience Breakdown Notes */}
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 font-mono text-xs space-y-2">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Holdroom Target:</span>
                <span className="text-slate-200 font-bold">Gate 42–45 Concourse B</span>
              </div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Flight Criteria:</span>
                <span className="text-cyan-400 font-bold">
                  {intlOnly ? 'Intl Only' : 'All'} • Pax ≥ {minPax} {delayOnly ? '• Delay Trigger' : ''}
                </span>
              </div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Effective CPM:</span>
                <span className="text-emerald-400 font-bold">$22.50 base</span>
              </div>
              <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800/60 flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>Matches 68% of Gate 40–45 crowd; predicted 2,800 impressions</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setShowGenAiModal(true);
                if (!generatedDraft) handleGenerateDraft();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-mono text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch in GenAI Creative Studio</span>
            </button>
            <p className="text-[10px] font-mono text-center text-slate-500">
              Generates multilingual copy & instant digital screen mockup
            </p>
          </div>
        </div>
      </div>

      {/* 5. Campaign Performance History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Campaign Performance History & Re-Activation
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Running: <strong className="text-emerald-400">{outletCampaigns.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Campaign Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Target Gate</th>
                <th className="py-2.5 px-3">Spend</th>
                <th className="py-2.5 px-3">Impressions</th>
                <th className="py-2.5 px-3">CTR</th>
                <th className="py-2.5 px-3">Redemptions</th>
                <th className="py-2.5 px-3">ROI</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pastCampaigns.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">
                    {c.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      c.status === 'ACTIVE' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{c.targetGate}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{currencySymbol}{c.spend}</td>
                  <td className="py-3 px-3 text-slate-300">{c.impressions.toLocaleString()}</td>
                  <td className="py-3 px-3 text-cyan-300">{c.ctr}%</td>
                  <td className="py-3 px-3 text-amber-300 font-bold">{c.redemptions}</td>
                  <td className="py-3 px-3 text-purple-300 font-bold">{c.roi}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleRunAgain(c)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Run Again</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. GenAI Creative Assistant Modal */}
      {showGenAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-900/80 border border-purple-600 flex items-center justify-center text-purple-300 shadow">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>GenAI Creative Studio</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      OFFLINE ENGINE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Instant multilingual visual asset synthesis & DOOH template generator
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGenAiModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            {/* Prompt Box with Starter Chips */}
            <div className="space-y-3 font-mono">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                Describe Your Campaign Concept / Promotional Offer:
              </label>

              {/* Starter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((promptText: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBriefPrompt(promptText)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
                  >
                    💡 {promptText}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={briefPrompt}
                  onChange={e => setBriefPrompt(e.target.value)}
                  placeholder="e.g., Festive sweets, 20% off, families flying domestic"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={isGenerating}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center gap-2 transition-all shadow"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Synthesizing...' : 'Generate Mockup'}</span>
                </button>
              </div>
            </div>

            {/* Generated Mockup & Dual-Language Toggle */}
            {generatedDraft && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Preview Language:</span>
                    <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-mono font-bold">
                      {(['EN', 'ES', 'AR', 'HI'] as const).map(lang => (
                        <button
                          key={lang}
                          onClick={() => setPreviewLanguage(lang)}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            previewLanguage === lang
                              ? 'bg-purple-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lang === 'EN' ? 'English' : lang === 'ES' ? 'Español' : lang === 'AR' ? 'العربية' : 'हिन्दी'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>Palette Swatch:</span>
                    <div 
                      className="h-4 w-8 rounded border border-white/20" 
                      style={{ backgroundColor: generatedDraft.accentColor }} 
                      title={generatedDraft.accentColor}
                    />
                  </div>
                </div>

                {/* Visual DOOH Display Card Mockup */}
                <div 
                  className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-6 flex flex-col justify-between min-h-[260px]"
                  style={{
                    background: `linear-gradient(135deg, #090d16 0%, ${generatedDraft.accentColor}33 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span 
                        className="inline-block text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full mb-3"
                        style={{
                          backgroundColor: generatedDraft.accentColor,
                          color: '#ffffff',
                        }}
                      >
                        {generatedDraft.localizedContent?.[previewLanguage]?.badgeText || generatedDraft.badgeText}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight max-w-xl">
                        {generatedDraft.localizedContent?.[previewLanguage]?.headline || generatedDraft.headline}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg">
                        {generatedDraft.localizedContent?.[previewLanguage]?.subheadline || generatedDraft.subheadline}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center font-mono">
                      <div className="text-xl font-black text-emerald-400">{generatedDraft.discountPercent || 20}% OFF</div>
                      <div className="text-[9px] text-slate-400">BOARDING PASS PERK</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Advertiser: <strong>{selectedRetailerOutlet}</strong></span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-bold text-white">
                      {generatedDraft.localizedContent?.[previewLanguage]?.callToAction || generatedDraft.callToAction}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {deploymentSuccess && (
              <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-xl font-mono text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{deploymentSuccess}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setShowGenAiModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeployCampaign}
                disabled={!generatedDraft || Boolean(deploymentSuccess)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-mono text-xs font-black shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
              >
                <Play className="h-4 w-4" />
                <span>Deploy Campaign to Active Rotation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
