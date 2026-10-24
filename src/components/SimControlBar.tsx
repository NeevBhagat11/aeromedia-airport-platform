'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Check
} from 'lucide-react';

interface RoleOption {
  value: UserRole;
  label: string;
  secondary: string;
  badge: string;
  icon: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'SPLIT_SCREEN_DEMO',
    label: 'Split-Screen Demo',
    secondary: '(Judge Pitch)',
    badge: '15-MIN PITCH',
    icon: '🎯',
  },
  {
    value: 'PASSENGER_SCREEN',
    label: 'Passenger Screen',
    secondary: '(Full-Screen Player)',
    badge: 'TOTEM',
    icon: '📺',
  },
  {
    value: 'PLATFORM_ADMIN',
    label: 'Platform Admin Dashboard',
    secondary: '(Operations & NOC)',
    badge: 'OPS',
    icon: '🛡️',
  },
  {
    value: 'RETAILER',
    label: 'Retailer Concessionaire Portal',
    secondary: '(Campaign Studio & ROAS)',
    badge: 'CONCESSION',
    icon: '🛍️',
  },
  {
    value: 'MEDIA_MANAGER',
    label: 'Media Manager & Studio',
    secondary: '(Inventory & Yield Mgmt)',
    badge: 'AD-OPS',
    icon: '📊',
  },
  {
    value: 'AIRLINE_REP',
    label: 'Airline Representative Hub',
    secondary: '(Passenger Care & IRROPS)',
    badge: 'AIRLINE',
    icon: '✈️',
  },
];

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
    selectedScreenId,
    setSelectedScreenId,
    setScreenStatus,
    resetFeedback,
  } = useAirportSimulation();

  const xy501 = flights.find(f => f.flightNumber === 'XY501');
  const scrG42 = screens.find(s => s.id === 'SCR-G42-01');
  const isG42Offline = scrG42?.status === 'OFFLINE';

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const activeRoleConfig = ROLE_OPTIONS.find(r => r.value === currentRole) ?? ROLE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsRoleDropdownOpen(false);
      }
    }

    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRoleDropdownOpen]);

  const handleRoleChange = (role: UserRole) => {
    if (role === 'PASSENGER_SCREEN') {
      const isValid = screens && screens.length > 0 && screens.some(s => s && s.id === selectedScreenId);
      if (!isValid) {
        setSelectedScreenId('SCR-G42-01');
      }
    }
    setCurrentRole(role);
  };

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
                setScreenStatus('SCR-G42-01', 'ONLINE');
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
            className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all transform active:scale-95 ${
              resetFeedback
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200'
            }`}
            title="Restore baseline 14:00 demo conditions (XY501 On-Time • Rolex Active • 0 Redemptions)"
          >
            <Zap className={`h-3 w-3 ${resetFeedback ? 'text-cyan-300 animate-pulse' : 'text-yellow-400'}`} />
            <span>{resetFeedback ? '⚡ Baseline Restored' : '⚡ Reset Demo'}</span>
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
            <div className="relative" ref={roleDropdownRef}>
              {/* High-Contrast Interactive Custom Role Trigger Button */}
              <button
                id="role-switcher"
                data-testid="role-switcher"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isRoleDropdownOpen}
                aria-label={`Current role: ${activeRoleConfig.label} ${activeRoleConfig.secondary}. Click to switch role.`}
                onClick={() => setIsRoleDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800/90 border border-slate-700 hover:border-cyan-500/80 text-slate-100 font-mono text-xs font-bold rounded-md px-2.5 py-1.5 transition-all shadow-md active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                title="Select Demo Persona / Role Viewpoint"
              >
                <span className="text-sm select-none">{activeRoleConfig.icon}</span>
                <span className="text-slate-100 font-bold tracking-tight">{activeRoleConfig.label}</span>
                <span className="text-slate-400 text-[10px] hidden md:inline font-normal">{activeRoleConfig.secondary}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-cyan-400 transition-transform duration-200 shrink-0 ${isRoleDropdownOpen ? 'rotate-180 text-cyan-300' : ''}`} />
              </button>

              {/* Accessible Synchronized Native Select */}
              <select
                id="role-switcher-native"
                name="role-switcher"
                value={currentRole}
                onChange={e => handleRoleChange(e.target.value as UserRole)}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
              >
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                    {opt.icon} {opt.label} {opt.secondary}
                  </option>
                ))}
              </select>

              {/* High-Contrast Popover Container & Menu Items */}
              {isRoleDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Demo Persona Roles"
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-800 shadow-xl rounded-lg z-50 p-1.5 focus:outline-none backdrop-blur-md ring-1 ring-slate-800/80 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="px-3 py-1.5 mb-1 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <span>SWITCH DEMO ROLE</span>
                    <span className="text-emerald-400 font-semibold tracking-normal text-[9px] bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                      HIGH CONTRAST
                    </span>
                  </div>

                  <div className="space-y-1">
                    {ROLE_OPTIONS.map(role => {
                      const isActive = currentRole === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            handleRoleChange(role.value);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left py-2.5 px-3 rounded-md flex items-center justify-between gap-3 transition-colors ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                              : 'text-slate-100 hover:text-white hover:bg-slate-800 border-l-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base shrink-0 select-none">{role.icon}</span>
                            <div className="min-w-0">
                              <div className={`text-xs font-bold truncate ${isActive ? 'text-emerald-300' : 'text-slate-100'}`}>
                                {role.label}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate font-mono">
                                {role.secondary}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                                isActive
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                              }`}
                            >
                              {role.badge}
                            </span>
                            {isActive && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Contextual Sub-Selector for Retailer */}
            {currentRole === 'RETAILER' && (
              <select
                value={selectedRetailerOutlet}
                onChange={e => setSelectedRetailerOutlet(e.target.value)}
                className="bg-slate-900 border border-purple-700/80 text-purple-200 font-mono text-xs font-bold rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-sm"
              >
                <option value="Metropolis Duty Free" className="bg-slate-900 text-slate-100 py-1.5">Metropolis Duty Free</option>
                <option value="Costa Coffee" className="bg-slate-900 text-slate-100 py-1.5">Costa Coffee</option>
                <option value="Shake Shack" className="bg-slate-900 text-slate-100 py-1.5">Shake Shack</option>
                <option value="TUMI" className="bg-slate-900 text-slate-100 py-1.5">TUMI Travel Luxury</option>
              </select>
            )}

            {/* Contextual Sub-Selector for Airline Rep */}
            {currentRole === 'AIRLINE_REP' && (
              <select
                value={selectedAirline}
                onChange={e => setSelectedAirline(e.target.value)}
                className="bg-slate-900 border border-indigo-700/80 text-indigo-200 font-mono text-xs font-bold rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                <option value="Emirates/FlyMetropolis" className="bg-slate-900 text-slate-100 py-1.5">Emirates / FlyMetropolis</option>
                <option value="SkyLeisure" className="bg-slate-900 text-slate-100 py-1.5">SunVacation / SkyLeisure</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Floating Demo Reset Confirmation Toast */}
      {resetFeedback && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-cyan-500/80 text-cyan-200 text-xs font-mono shadow-2xl shadow-cyan-950/80 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-6 w-6 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shrink-0">
            <Zap className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{resetFeedback}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Clock: 14:00 UTC • Flight XY501: ON_TIME • Screen SCR-G42: ONLINE • Redemptions: $0.00
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
