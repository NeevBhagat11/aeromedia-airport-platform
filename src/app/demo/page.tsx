'use client';

import React from 'react';
import { SimulationProvider } from '@/context/SimulationContext';
import { SimControlBar } from '@/components/SimControlBar';
import { SplitScreenDemoView } from '@/components/views/SplitScreenDemoView';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <SimControlBar />
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        <SplitScreenDemoView />
      </main>
    </div>
  );
}
