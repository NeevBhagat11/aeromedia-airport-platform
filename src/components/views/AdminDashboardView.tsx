'use client';

import React, { useState, useMemo } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { TerminalFloorMap } from '@/components/admin/TerminalFloorMap';
import { CurrencyType, Screen, RetailOutlet, AirlineProfile, IncidentAlert } from '@/types';
import { 
  ShieldCheck, 
  Activity, 
  Radio, 
  Cpu, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Tv, 
  Store, 
  Plane, 
  Layers, 
  FileText,
  DollarSign,
  Zap,
  Check
} from 'lucide-react';

export function AdminDashboardView() {
  const {
    screens,
    campaigns,
    incidents,
    acknowledgeIncident,
    retailOutlets,
    addRetailOutlet,
    airlineProfiles,
    addAirlineProfile,
    addScreen,
    currency,
    setCurrency,
    redemptions,
    simTimeFormatted,
  } = useAirportSimulation();

  const [activeTab, setActiveTab] = useState<'MAP' | 'SCREENS' | 'VENDORS' | 'AIRLINES' | 'INCIDENTS'>('MAP');

  // Search terms for master data
  const [screenSearch, setScreenSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [airlineSearch, setAirlineSearch] = useState('');

  // Modals
  const [showAddScreenModal, setShowAddScreenModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddAirlineModal, setShowAddAirlineModal] = useState(false);

  // New item form states
  const [newScreenCode, setNewScreenCode] = useState('');
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenGate, setNewScreenGate] = useState('Gate 43');
  const [newScreenOrientation, setNewScreenOrientation] = useState<'16:9' | '9:16'>('16:9');

  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState('Gourmet Cafe');
  const [newVendorGate, setNewVendorGate] = useState('Gate 43');

  const [newAirlineCode, setNewAirlineCode] = useState('');
  const [newAirlineName, setNewAirlineName] = useState('');
  const [newAirlineFleet, setNewAirlineFleet] = useState('Long-Haul Fleet');

  // Network KPIs
  const totalScreens = screens.length;
  const onlineScreens = screens.filter(s => s.status === 'ONLINE').length;
  const networkHealthPct = ((onlineScreens / totalScreens) * 100).toFixed(1);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressionsDelivered, 48200);

  // Currency multiplier
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'AED ';
  const currencyRate = currency === 'USD' ? 1.0 : currency === 'EUR' ? 0.92 : 3.67;
  const grossAdRevenue = (campaigns.reduce((acc, c) => acc + (c.budget * 0.65), 184000) * currencyRate);

  const handleCreateScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenCode) return;
    addScreen({
      id: `SCR-${newScreenCode.toUpperCase()}`,
      code: `SCR-${newScreenCode.toUpperCase()}`,
      name: newScreenName || `Terminal Screen ${newScreenCode}`,
      zoneId: 'Z-G42',
      gateId: newScreenGate,
      terminal: 'Terminal 1',
      concourse: 'Concourse B',
      orientation: newScreenOrientation,
      status: 'ONLINE',
      currentAdId: 'CAMP-COSTA-DELAY',
      resolution: newScreenOrientation === '16:9' ? '3840x2160' : '2160x3840',
      physicalLocation: `Podium at ${newScreenGate}`,
    });
    setNewScreenCode('');
    setNewScreenName('');
    setShowAddScreenModal(false);
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName) return;
    addRetailOutlet({
      id: `OUT-${Date.now()}`,
      name: newVendorName,
      category: newVendorCategory,
      terminal: 'Terminal 1',
      concourse: 'Concourse B',
      zoneId: 'Z-G42',
      nearestGate: newVendorGate,
      status: 'OPEN',
      footfallIndex: 80,
    });
    setNewVendorName('');
    setShowAddVendorModal(false);
  };

  const handleCreateAirline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAirlineCode || !newAirlineName) return;
    addAirlineProfile({
      code: newAirlineCode.toUpperCase(),
      name: newAirlineName,
      terminal: 'Terminal 1',
      concourse: 'Concourse B',
      fleetTier: newAirlineFleet,
      dailyFlights: 12,
      partnershipStatus: 'ACTIVE',
    });
    setNewAirlineCode('');
    setNewAirlineName('');
    setShowAddAirlineModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Platform Admin Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono">
                PLATFORM NOC OPERATIONS CONSOLE
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                NETWORK CONTROLLER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Metropolis Airport MET • Central Media Distribution & Hardware Telemetry
            </p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
          <span className="text-slate-400 text-[11px] px-1.5">Currency:</span>
          {(['USD', 'EUR', 'AED'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                currency === c
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Network KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-[10px] text-slate-400 uppercase">Network Health</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>{networkHealthPct}%</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hardware uptime</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-[10px] text-slate-400 uppercase">Active Screens</div>
          <div className="text-xl font-bold text-white mt-1 flex items-center gap-1">
            <Tv className="h-4 w-4 text-cyan-400" />
            <span>{onlineScreens}/{totalScreens}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">T1 & T2 online</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-[10px] text-slate-400 uppercase">Total Impressions</div>
          <div className="text-xl font-bold text-cyan-300 mt-1">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">▲ +12% today</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-[10px] text-slate-400 uppercase">Gross Ad Revenue</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-0.5">
            <span>{currencySymbol}{Math.round(grossAdRevenue).toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">DOOH billing cycle</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-[10px] text-slate-400 uppercase">Decision Latency</div>
          <div className="text-xl font-bold text-amber-300 mt-1 flex items-center gap-1">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>18ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target &lt; 50ms</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-[10px] text-slate-400 uppercase">Active Alerts</div>
          <div className="text-xl font-bold text-rose-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>{incidents.filter(i => !i.acknowledged).length}</span>
          </div>
          <div className="text-[10px] text-rose-400 mt-0.5">Requires NOC review</div>
        </div>
      </div>

      {/* Data Feed Health Indicator Strip */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="text-slate-400 font-bold uppercase text-[11px] flex items-center gap-2">
          <Database className="h-4 w-4 text-cyan-400" />
          <span>AIRPORT DATA INGESTION BUS:</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">AODB FEED</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">142 msg/min</span>
            <span className="text-[10px] text-slate-500">Sync: {simTimeFormatted}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">IATA AIDX BUS</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-bold">88 msg/min</span>
            <span className="text-[10px] text-slate-500">v16.1 XML</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-bold text-white">ACI ACRIS QUEUES</span>
            <span className="text-slate-500">|</span>
            <span className="text-purple-300 font-bold">210 sensors</span>
            <span className="text-[10px] text-slate-500">NGSI-LD</span>
          </div>
        </div>
      </div>

      {/* Master Tabs Switcher */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto">
        {(['MAP', 'INCIDENTS', 'SCREENS', 'VENDORS', 'AIRLINES'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === tab
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'MAP' ? 'TERMINAL MAP & HEATMAP' :
             tab === 'INCIDENTS' ? `INCIDENTS (${incidents.filter(i => !i.acknowledged).length})` :
             tab === 'SCREENS' ? `SCREEN FLEET (${screens.length})` :
             tab === 'VENDORS' ? `VENDORS & OUTLETS (${retailOutlets.length})` :
             `AIRLINE CARRIERS (${airlineProfiles.length})`}
          </button>
        ))}
      </div>

      {/* Tab 1: Terminal Floor Map */}
      {activeTab === 'MAP' && <TerminalFloorMap />}

      {/* Tab 2: Live Incident & Bug Tracker */}
      {activeTab === 'INCIDENTS' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                ACTIVE HARDWARE & TELEMETRY ALERTS
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-time automated incident detection for screens, sensor feeds, and codecs
              </p>
            </div>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {incidents.map(inc => (
              <div
                key={inc.id}
                className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-colors ${
                  inc.acknowledged
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : inc.severity === 'P1'
                    ? 'bg-rose-950/30 border-rose-600/60'
                    : inc.severity === 'P2'
                    ? 'bg-amber-950/30 border-amber-600/60'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    inc.severity === 'P1' ? 'bg-rose-950 text-rose-300 border border-rose-700' :
                    inc.severity === 'P2' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {inc.severity}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{inc.title}</span>
                      <span className="text-[10px] text-slate-500">• {inc.category}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{inc.description}</p>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Assigned: {inc.assignedTo || 'Unassigned'} • Stamped: {inc.timestamp}
                    </div>
                  </div>
                </div>

                <div>
                  {inc.acknowledged ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>ACKNOWLEDGED</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeIncident(inc.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Master Screens Directory */}
      {activeTab === 'SCREENS' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                MASTER SCREEN INVENTORY & NODE DIRECTORY
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Hardware registry of digital signs, ribbon displays, and totems
              </p>
            </div>

            <button
              onClick={() => setShowAddScreenModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold rounded-xl transition-colors shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Screen</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Screen Code</th>
                  <th className="py-2.5 px-3">Name / Location</th>
                  <th className="py-2.5 px-3">Orientation</th>
                  <th className="py-2.5 px-3">Terminal / Concourse</th>
                  <th className="py-2.5 px-3">Nearest Gate</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {screens.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-cyan-300">{s.code}</td>
                    <td className="py-2.5 px-3 text-white">{s.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {s.orientation}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{s.terminal} • {s.concourse}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-300">{s.gateId || 'Central'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        s.status === 'DEGRADED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Vendors & Outlets */}
      {activeTab === 'VENDORS' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                CONCESSIONAIRE OUTLETS & MERCHANTS
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Retail stores, dining outlets, and duty-free concessionaires
              </p>
            </div>

            <button
              onClick={() => setShowAddVendorModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl transition-colors shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Concession</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Concession Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Zone ID</th>
                  <th className="py-2.5 px-3">Nearest Gate</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {retailOutlets.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-white">{v.name}</td>
                    <td className="py-2.5 px-3 text-purple-300">{v.category}</td>
                    <td className="py-2.5 px-3 text-slate-400">{v.terminal} • {v.concourse}</td>
                    <td className="py-2.5 px-3 text-slate-500">{v.zoneId}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-300">{v.nearestGate}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Airlines */}
      {activeTab === 'AIRLINES' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                AIRLINE CARRIERS & FLEET PROFILES
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Operating carriers with AODB integration & automated goodwill rules
              </p>
            </div>

            <button
              onClick={() => setShowAddAirlineModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition-colors shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Register Airline Carrier</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">IATA Code</th>
                  <th className="py-2.5 px-3">Carrier Name</th>
                  <th className="py-2.5 px-3">Hub Terminal</th>
                  <th className="py-2.5 px-3">Fleet Tier</th>
                  <th className="py-2.5 px-3">Daily Flights</th>
                  <th className="py-2.5 px-3">Partnership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {airlineProfiles.map(a => (
                  <tr key={a.code} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-cyan-300">{a.code}</td>
                    <td className="py-2.5 px-3 text-white font-bold">{a.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{a.terminal}</td>
                    <td className="py-2.5 px-3 text-slate-300">{a.fleetTier}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-300">{a.dailyFlights} / day</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {a.partnershipStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {showAddScreenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleCreateScreen} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">ADD DIGITAL SCREEN NODE</span>
              <button type="button" onClick={() => setShowAddScreenModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Screen Code (e.g. G43-01)</label>
              <input
                type="text"
                required
                value={newScreenCode}
                onChange={e => setNewScreenCode(e.target.value)}
                placeholder="G43-01"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Friendly Name</label>
              <input
                type="text"
                value={newScreenName}
                onChange={e => setNewScreenName(e.target.value)}
                placeholder="Gate 43 Main Holdroom"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Gate Assignment</label>
                <input
                  type="text"
                  value={newScreenGate}
                  onChange={e => setNewScreenGate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Orientation</label>
                <select
                  value={newScreenOrientation}
                  onChange={e => setNewScreenOrientation(e.target.value as '16:9' | '9:16')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Portrait Totem</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors">
              Deploy Screen Node
            </button>
          </form>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleCreateVendor} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">ADD RETAIL CONCESSION</span>
              <button type="button" onClick={() => setShowAddVendorModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Concession Name</label>
              <input
                type="text"
                required
                value={newVendorName}
                onChange={e => setNewVendorName(e.target.value)}
                placeholder="Paul Bakery Express"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Category</label>
              <input
                type="text"
                value={newVendorCategory}
                onChange={e => setNewVendorCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Nearest Gate</label>
              <input
                type="text"
                value={newVendorGate}
                onChange={e => setNewVendorGate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
              Register Concession Outlet
            </button>
          </form>
        </div>
      )}

      {/* Add Airline Modal */}
      {showAddAirlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleCreateAirline} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">REGISTER AIRLINE CARRIER</span>
              <button type="button" onClick={() => setShowAddAirlineModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">IATA Code (e.g. QR)</label>
                <input
                  type="text"
                  required
                  value={newAirlineCode}
                  onChange={e => setNewAirlineCode(e.target.value)}
                  placeholder="QR"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Fleet Tier</label>
                <input
                  type="text"
                  value={newAirlineFleet}
                  onChange={e => setNewAirlineFleet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Carrier Full Name</label>
              <input
                type="text"
                required
                value={newAirlineName}
                onChange={e => setNewAirlineName(e.target.value)}
                placeholder="Qatar Airways"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors">
              Authorize Airline Carrier
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
