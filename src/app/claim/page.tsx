'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAirportSimulation } from '@/context/SimulationContext';
import { 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  ShoppingBag, 
  Clock, 
  Plane, 
  ArrowLeft, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { MOCK_CAMPAIGNS } from '@/data/mock/campaigns';

function ClaimContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || 'GATE42DELAY';
  const screenParam = searchParams.get('screen') || 'SCR-G42-01';

  const { campaigns, addRedemption, simTimeFormatted } = useAirportSimulation();

  // Find matching campaign by promo code or fallback
  const campaign = campaigns.find(c => c.promoCode?.toUpperCase() === codeParam.toUpperCase()) 
    || campaigns.find(c => c.id === 'CAMP-COSTA-DELAY') 
    || campaigns[0];

  const [isRedeemed, setIsRedeemed] = useState(false);
  const [redemptionId, setRedemptionId] = useState<string | null>(null);

  const handleRedeem = () => {
    if (isRedeemed) return;

    const discountStr = campaign.promoCode?.includes('DELAY') ? '20% OFF' : '15% OFF';
    const revenueEst = campaign.cpm * 0.8; // Estimated concession ticket size

    const record = addRedemption({
      promoCode: campaign.promoCode || codeParam,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      advertiserName: campaign.advertiserName,
      screenId: screenParam,
      discountValue: discountStr,
      attributedRevenue: Number(revenueEst.toFixed(2)),
      status: 'REDEEMED',
    });

    setRedemptionId(record.id);
    setIsRedeemed(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Mobile Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow">
            <Plane className="h-4 w-4 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white tracking-wider">
              AEROMEDIA • PASSENGER PASS
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Metropolis Airport MET • {screenParam}
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Demo Hub</span>
        </Link>
      </div>

      {/* Main Voucher Pass Card */}
      <div className="max-w-md mx-auto w-full my-6">
        <div 
          className="relative bg-slate-900 border-2 rounded-3xl overflow-hidden shadow-2xl"
          style={{ borderColor: campaign.accentColor || '#06b6d4' }}
        >
          {/* Top Brand Banner Image */}
          <div className="relative h-44 w-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center filter brightness-90"
              style={{ backgroundImage: `url(${campaign.creativeUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-black/80 text-white border border-white/20">
                {campaign.advertiserName}
              </span>
              {campaign.badgeText && (
                <span 
                  className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md text-slate-950"
                  style={{ backgroundColor: campaign.accentColor || '#38bdf8' }}
                >
                  {campaign.badgeText}
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-4 right-4 z-10">
              <h2 className="text-lg font-black text-white leading-tight drop-shadow">
                {campaign.headline}
              </h2>
            </div>
          </div>

          {/* Ticket Body with Cutout Notches */}
          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {campaign.subheadline}
            </p>

            {/* Promo Code Box */}
            <div className="bg-slate-950 border border-dashed border-slate-700 rounded-2xl p-4 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                PROMO VOUCHER CODE
              </div>
              <div className="text-2xl font-mono font-black text-amber-300 tracking-wider my-1">
                {campaign.promoCode || codeParam}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Verified Flight Delay Concession Special</span>
              </div>
            </div>

            {/* Redemption Location & Flight Info */}
            <div className="space-y-1.5 text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Valid At:</span>
                </span>
                <span className="font-bold text-white">Concourse B • Near Gate 42</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Expiry Window:</span>
                </span>
                <span className="font-bold text-amber-300">Flight XY501 Final Call (~38m)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Origin Screen:</span>
                </span>
                <span className="font-bold text-slate-400">{screenParam}</span>
              </div>
            </div>

            {/* Redeem Action Button */}
            {isRedeemed ? (
              <div className="bg-emerald-950/70 border border-emerald-500/60 rounded-2xl p-4 text-center animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-1.5" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  VOUCHER REDEEMED IN STORE!
                </h3>
                <p className="text-xs text-emerald-300/80 mt-1 font-mono">
                  Attributed to Screen {screenParam} • Ref: {redemptionId}
                </p>
                <div className="mt-3 text-[11px] font-mono text-slate-400">
                  Transaction logged to Master Attribution Store at {simTimeFormatted}.
                </div>
              </div>
            ) : (
              <button
                onClick={handleRedeem}
                className="w-full py-3.5 px-4 rounded-2xl font-mono text-sm font-black text-slate-950 shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 hover:brightness-110"
                style={{ backgroundColor: campaign.accentColor || '#38bdf8' }}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>REDEEM IN STORE (SIMULATE SCAN)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="max-w-md mx-auto w-full text-center text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-3">
        Metropolis Airport Retail Media Ecosystem • Powered by AODB/AIDX Context
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono">Loading voucher pass...</div>}>
      <ClaimContent />
    </Suspense>
  );
}
