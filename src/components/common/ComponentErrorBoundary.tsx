'use client';

import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  /** Optional label shown in the recovery card, e.g. "Passenger Screen" */
  viewName?: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ComponentErrorBoundary
 *
 * Wraps any role view component. If a render error occurs during role
 * transitions (e.g. a null-dereference before state settles), this boundary
 * catches it and renders an inline recovery card with a "Reload View" button
 * rather than triggering a full Next.js page crash that resets the simulation
 * clock and redemptions.
 *
 * Usage:
 *   <ComponentErrorBoundary viewName="Passenger Screen">
 *     <PassengerScreenView />
 *   </ComponentErrorBoundary>
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `[ComponentErrorBoundary] "${this.props.viewName ?? 'View'}" crashed:`,
      error,
      info.componentStack,
    );
  }

  handleReset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      const label = this.props.viewName ?? 'View';
      return (
        <div className="min-h-[280px] flex flex-col items-center justify-center gap-5 bg-slate-900 border border-rose-900/50 rounded-2xl p-10 font-mono shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shadow-inner">
            <AlertTriangle className="h-7 w-7 text-rose-400" />
          </div>

          <div className="text-center space-y-1.5 max-w-sm">
            <p className="text-sm font-bold text-rose-300 uppercase tracking-wide">
              {label} — Render Error
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              A transient error occurred during the role transition. Your simulation
              state and redemptions are intact. Click below to reload this view.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] text-slate-600 mt-1 font-mono">
                {this.state.error.message}
              </p>
            )}
          </div>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 hover:border-slate-500 transition-colors shadow"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
