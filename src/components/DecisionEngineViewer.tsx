'use client';

import React, { useState } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Layers, 
  Clock, 
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export function DecisionEngineViewer() {
  const {
    selectedScreen,
    selectedDecisionLog,
    selectedAudience,
    runEngineForScreen,
  } = useAirportSimulation();

  const [activeTab, setActiveTab] = useState<'RANKING' | 'EVIDENCE' | 'BREAKDOWN'>('RANKING');

  if (!selectedScreen || !selectedDecisionLog) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 font-mono text-xs">
        <Cpu className="h-8 w-8 mx-auto mb-2 text-slate-600 animate-pulse" />
        No active decision log recorded for this screen.
      </div>
    );
  }

  const { candidateScores, evidenceTrail, winningCampaignName, score, simTime } = selectedDecisionLog;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 flex flex-col gap-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-950/70 border border-indigo-800/50 text-indigo-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                DETERMINISTIC DECISION ENGINE
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                SCORE: {score.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Winner: <span className="text-cyan-300 font-semibold">{winningCampaignName}</span>
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['RANKING', 'BREAKDOWN', 'EVIDENCE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'RANKING' ? 'CANDIDATE RANKING' : tab === 'BREAKDOWN' ? 'SCORE DECOMPOSITION' : 'EVIDENCE TRAIL'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Candidate Ranking */}
      {activeTab === 'RANKING' && (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {candidateScores.map((c, idx) => {
            const isWinner = !c.disqualified && idx === 0;
            return (
              <div
                key={c.campaignId}
                className={`p-3 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-md shadow-cyan-950/30'
                    : c.disqualified
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                      isWinner 
                        ? 'bg-cyan-500 text-slate-950' 
                        : c.disqualified 
                        ? 'bg-slate-800 text-slate-500' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {c.disqualified ? '✕' : `#${idx + 1}`}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">
                          {c.advertiserName}
                        </span>
                        {isWinner && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            WINNER
                          </span>
                        )}
                        {c.disqualified && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            DISQUALIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {c.title}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className={`text-sm font-bold ${isWinner ? 'text-cyan-300' : c.disqualified ? 'text-slate-500' : 'text-slate-300'}`}>
                      {c.disqualified ? '0.0' : c.finalScore.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      base: {c.baseScore.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Score bar preview */}
                {!c.disqualified && (
                  <div className="mt-2 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isWinner ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.min((c.finalScore / 150) * 100, 100)}%` }}
                    />
                  </div>
                )}

                {/* Boost Pills or Disqualification Reason */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.disqualified ? (
                    <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      {c.disqualificationReason}
                    </span>
                  ) : (
                    c.appliedBoosts.map(b => (
                      <span
                        key={b.ruleId}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold flex items-center gap-1"
                      >
                        <TrendingUp className="h-3 w-3" />
                        {b.description} (+{b.pointsAdded}pts)
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Score Decomposition */}
      {activeTab === 'BREAKDOWN' && (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {candidateScores.filter(c => !c.disqualified).map(c => (
            <div key={c.campaignId} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-white font-mono">{c.advertiserName}</span>
                <span className="text-xs font-mono font-bold text-cyan-400">Total: {c.finalScore.toFixed(1)} pts</span>
              </div>
              <ul className="space-y-1.5 font-mono text-xs">
                {c.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Evidence Trail */}
      {activeTab === 'EVIDENCE' && (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 font-mono text-xs">
          <div className="text-[11px] text-slate-400 mb-2">
            Deterministic audit record stamped at: <span className="text-cyan-300">{simTime}</span>
          </div>
          {evidenceTrail.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/80 text-slate-300 flex items-start gap-2 hover:border-slate-700 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
