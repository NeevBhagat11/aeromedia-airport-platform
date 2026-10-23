'use client';

import React, { useState } from 'react';
import { useAirportSimulation } from '@/context/SimulationContext';
import { 
  FileCode, 
  Copy, 
  Check, 
  Send, 
  Radio, 
  Code2, 
  Terminal as TerminalIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function AidxInspector() {
  const { aidxLogs, triggerAidxXmlInjection, simTime } = useAirportSimulation();
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [customFlightNum, setCustomFlightNum] = useState('XY501');
  const [customDelay, setCustomDelay] = useState(60);
  const [customGate, setCustomGate] = useState('Gate 42');

  const selectedMessage = aidxLogs[selectedMessageIndex] || aidxLogs[0];

  const handleCopy = () => {
    if (selectedMessage?.rawXml) {
      navigator.clipboard.writeText(selectedMessage.rawXml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCustomInject = () => {
    triggerAidxXmlInjection({
      flightNumber: customFlightNum,
      delayMinutes: Number(customDelay),
      gate: customGate,
      delayReasonCode: '93',
      delayReasonText: 'AIRCRAFT ROTATION AND AIR TRAFFIC REGULATION',
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 flex flex-col gap-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-400">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                IATA AIDX MESSAGE BUS
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                STREAMING LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              IATA_AIDX_FlightLegNotifRQ (v16.1 Standard XML & JSON)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'COPIED XML' : 'COPY RAW XML'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Message Log Stream list */}
        <div className="lg:col-span-5 flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Recent AIDX Broadcasts ({aidxLogs.length})</span>
            <span className="text-emerald-400">● REAL-TIME</span>
          </div>

          {aidxLogs.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-500 font-mono text-xs">
              No AIDX packets logged yet.
            </div>
          ) : (
            aidxLogs.map((msg, idx) => {
              const isSelected = idx === selectedMessageIndex;
              return (
                <div
                  key={msg.messageId}
                  onClick={() => setSelectedMessageIndex(idx)}
                  className={`p-3 rounded-xl border cursor-pointer font-mono text-xs transition-all ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md shadow-emerald-950/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                      {msg.flightNumber} ({msg.destination})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {msg.timestamp.split('T')[1]?.substring(0, 8)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-slate-400">Gate: {msg.gate}</span>
                    <span className={msg.statusCode === 'DEL' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      Status: {msg.statusCode} {msg.delayReasonCode ? `(Code ${msg.delayReasonCode})` : ''}
                    </span>
                  </div>

                  {msg.delayReasonText && (
                    <div className="text-[10px] text-amber-300/80 truncate mt-1">
                      {msg.delayReasonText}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Raw XML Payload Viewer */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>RAW XML PAYLOAD VIEWER</span>
            <span className="text-cyan-400">{selectedMessage?.messageId || 'NO MESSAGE'}</span>
          </div>

          <div className="relative rounded-xl bg-slate-950 p-4 border border-slate-800/80 font-mono text-[11px] text-slate-300 h-[280px] overflow-auto shadow-inner leading-relaxed">
            <pre className="text-emerald-400/90 whitespace-pre">
              {selectedMessage?.rawXml || '<!-- Waiting for incoming AIDX broadcast -->'}
            </pre>
          </div>

          {/* Interactive AIDX Generator Form */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 text-[11px]">Simulate AIDX Push:</span>
              <input
                type="text"
                value={customFlightNum}
                onChange={e => setCustomFlightNum(e.target.value.toUpperCase())}
                placeholder="Flight"
                className="w-16 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs font-bold"
              />
              <input
                type="number"
                value={customDelay}
                onChange={e => setCustomDelay(Number(e.target.value))}
                placeholder="Delay m"
                className="w-16 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-amber-300 text-xs font-bold"
              />
              <input
                type="text"
                value={customGate}
                onChange={e => setCustomGate(e.target.value)}
                placeholder="Gate"
                className="w-20 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-cyan-300 text-xs"
              />
            </div>

            <button
              onClick={handleCustomInject}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg transition-colors shadow-sm shadow-emerald-600/30 text-xs"
            >
              <Send className="h-3 w-3" />
              <span>Broadcast AIDX</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
