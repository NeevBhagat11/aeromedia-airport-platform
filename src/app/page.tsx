'use client';

import React from 'react';
import { SimulationProvider, useAirportSimulation } from '@/context/SimulationContext';
import { SimControlBar } from '@/components/SimControlBar';
import { SplitScreenDemoView } from '@/components/views/SplitScreenDemoView';
import { PassengerScreenView } from '@/components/views/PassengerScreenView';
import { AdminDashboardView } from '@/components/views/AdminDashboardView';
import { RetailerPortalView } from '@/components/views/RetailerPortalView';
import { MediaManagerViewBoundary } from '@/components/views/MediaManagerView';
import { AirlineHubView } from '@/components/views/AirlineHubView';
import { FlightOperationsBoard } from '@/components/FlightOperationsBoard';
import { AidxInspector } from '@/components/AidxInspector';
import { AcrisTelemetryPanel } from '@/components/AcrisTelemetryPanel';
import { ComponentErrorBoundary } from '@/components/common/ComponentErrorBoundary';

function AppContent() {
  const { currentRole } = useAirportSimulation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Global Simulation Control Bar */}
      <SimControlBar />

      {/* 2. Main Role-Aware Workspace */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-8">
        {currentRole === 'SPLIT_SCREEN_DEMO' && (
          <ComponentErrorBoundary viewName="Split Screen Demo">
            <div className="space-y-8">
              <SplitScreenDemoView />

              {/* Supplemental Platform Telemetry Drawer for Judges */}
              <div className="pt-6 border-t border-slate-800/80 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                      DECOUPLED DATA FEEDS & ACI ACRIS SENSORS
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Underlying streaming telemetry powering autonomous screen decisions
                    </p>
                  </div>
                </div>

                <FlightOperationsBoard />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AidxInspector />
                  <AcrisTelemetryPanel />
                </div>
              </div>
            </div>
          </ComponentErrorBoundary>
        )}

        {currentRole === 'PASSENGER_SCREEN' && (
          <ComponentErrorBoundary viewName="Passenger Screen">
            <PassengerScreenView />
          </ComponentErrorBoundary>
        )}
        {currentRole === 'PLATFORM_ADMIN' && (
          <ComponentErrorBoundary viewName="Platform Admin Dashboard">
            <AdminDashboardView />
          </ComponentErrorBoundary>
        )}
        {currentRole === 'RETAILER' && (
          <ComponentErrorBoundary viewName="Retailer Portal">
            <RetailerPortalView />
          </ComponentErrorBoundary>
        )}
        {currentRole === 'MEDIA_MANAGER' && (
          <ComponentErrorBoundary viewName="Media Manager">
            <MediaManagerViewBoundary />
          </ComponentErrorBoundary>
        )}
        {currentRole === 'AIRLINE_REP' && (
          <ComponentErrorBoundary viewName="Airline Hub">
            <AirlineHubView />
          </ComponentErrorBoundary>
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 px-6 py-4 text-center text-xs font-mono text-slate-500">
        <div className="flex flex-wrap items-center justify-between max-w-7xl mx-auto gap-2">
          <div>
            AeroMedia Platform • Phase 2 Interactive Demo
          </div>
          <div className="flex items-center gap-3">
            <span>IATA AIDX 16.1 Standard</span>
            <span>•</span>
            <span>ACI ACRIS NGSI-LD</span>
            <span>•</span>
            <span>AODB Live Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AirportMediaPlatformPage() {
  return <AppContent />;
}
