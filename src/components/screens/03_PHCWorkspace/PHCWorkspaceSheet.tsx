// Shell Layer: PHC Workspace as Large Overlay Sheet
// Spec: PHC Workspace as a large overlay sheet with breadcrumbs (Network › District X › PHC 184)
// Reading order: identity → freshness → current stock → forecast → coverage → beds/staff/equipment → risk drivers → Resolve.
import React, { useEffect } from 'react';
import {
  X,
  Clock,
  AlertTriangle,
  GitMerge,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Bed,
  Users,
  Activity,
  ShieldAlert,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useResilienceStore } from '../../../store/useResilienceStore';
import { SEEDED_FORECAST_SERIES_PHC184 } from '../../../services/decisionService';
import { ForecastPanel } from '../../semantic/ForecastPanel';
import { FreshnessLabel } from '../../semantic/FreshnessLabel';

export const PHCWorkspaceSheet: React.FC = () => {
  const {
    getCurrentPHC,
    setScreen,
    openDrawer,
    connectionState,
    screen,
  } = useResilienceStore();

  const phc = getCurrentPHC();
  const forecastData = SEEDED_FORECAST_SERIES_PHC184;

  const isStale = phc.freshnessMinutes > 240 || connectionState === 'STALE_CRITICAL';

  // Support closing with Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'phc') {
        setScreen('pulse');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, setScreen]);

  return (
    <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[92vh] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-elevated flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* 1. Header with Breadcrumbs & Close */}
        <div className="px-6 py-4 border-b border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between shrink-0">
          <div>
            {/* Breadcrumbs: Network › District X › PHC 184 */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-500)] mb-1">
              <button
                onClick={() => setScreen('pulse')}
                className="hover:text-[var(--ink-900)] transition-colors hover:underline cursor-pointer"
              >
                Network
              </button>
              <ChevronRight className="w-3 h-3 text-[var(--ink-400)]" />
              <span className="text-[var(--ink-700)]">{phc.districtName}</span>
              <ChevronRight className="w-3 h-3 text-[var(--ink-400)]" />
              <span className="font-bold text-[var(--sage-700)]">{phc.id}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="font-heading font-bold text-lg text-[var(--ink-900)]">
                {phc.name}
              </h1>
              <FreshnessLabel minutes={phc.freshnessMinutes} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct CTA to Resolve */}
            <button
              onClick={() => {
                setScreen('resolve');
                openDrawer(phc.id);
              }}
              className="px-4 py-2 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <GitMerge className="w-4 h-4" />
              <span>Resolve Shortage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Close Sheet button */}
            <button
              onClick={() => setScreen('pulse')}
              className="p-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
              title="Return to Network Canvas (ESC)"
              aria-label="Close Workspace Sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Workspace Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Stale Warning Banner if applicable */}
          {isStale && (
            <div className="p-3.5 rounded-xl bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[var(--status-critical)] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[var(--status-critical)] font-heading block">
                  STALE CRITICAL INPUT DETECTED (&gt;4 HOURS)
                </span>
                <p className="text-[var(--ink-700)] mt-0.5 leading-relaxed">
                  Last verified inventory reporting timestamp is {phc.freshnessMinutes} minutes old. Under Ministry statutory health guidelines, authoritative inter-PHC stock transfers are BLOCKED until a refreshed physical count is logged.
                </p>
              </div>
            </div>
          )}

          {/* Cards Row: CURRENT STOCK 420 · 15-DAY DEMAND 830 · COVERAGE 3.8d */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Current Stock */}
            <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] font-semibold block">
                Current On-Hand Stock
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono font-bold text-2xl text-[var(--ink-900)]">
                  {phc.currentStock}
                </span>
                <span className="text-xs text-[var(--ink-500)] font-mono">units</span>
              </div>
              <span className="text-[11px] text-[var(--ink-500)] mt-0.5 block">
                Batch #AMX-2026-08 (Exp: 2027-11)
              </span>
            </div>

            {/* 2. 15-Day Demand */}
            <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] font-semibold block">
                15-Day Forecast Demand
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono font-bold text-2xl text-[var(--ink-900)]">
                  {phc.forecastDemand15d}
                </span>
                <span className="text-xs text-[var(--status-critical)] font-mono font-bold">
                  +42% surge
                </span>
              </div>
              <span className="text-[11px] text-[var(--ink-500)] mt-0.5 block">
                Driven by ARI pediatric admissions
              </span>
            </div>

            {/* 3. Coverage Runway */}
            <div className="p-4 rounded-xl bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--status-critical)] font-bold block">
                Coverage Runway (Runout Risk)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono font-bold text-2xl text-[var(--status-critical)]">
                  {phc.coverageDays} days
                </span>
                <span className="text-xs text-[var(--status-critical)] font-mono">remaining</span>
              </div>
              <span className="text-[11px] text-[var(--status-critical)] font-medium mt-0.5 block">
                Depletes Saturday 14:00 (Shortage: 410 units)
              </span>
            </div>
          </div>

          {/* Time-Series Forecast Chart Component */}
          <ForecastPanel data={forecastData} medicineName={phc.primaryMedicine} />

          {/* CAPACITY & RISK DRIVERS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CAPACITY: Beds 18/24, Staff 7/10, Cold-chain, Oxygen */}
            <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
                <span className="font-heading font-semibold text-xs text-[var(--ink-900)] uppercase tracking-wide">
                  Clinical Capacity &amp; Resource Availability
                </span>
                <span className="text-[10px] font-mono text-[var(--ink-500)]">
                  Facility Audit Grade A
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                {/* Inpatient Beds */}
                <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
                  <div className="flex items-center gap-1.5 text-[var(--ink-500)] mb-1">
                    <Bed className="w-3.5 h-3.5 text-[var(--sage-600)]" />
                    <span className="text-[10px] uppercase">Bed Occupancy</span>
                  </div>
                  <div className="font-bold text-base text-[var(--ink-900)]">
                    {phc.bedsOccupied} / {phc.bedsTotal} beds
                  </div>
                  <span className="text-[10px] text-[var(--status-warning)] font-semibold">
                    75% occupied (Surge load)
                  </span>
                </div>

                {/* Clinical Staff */}
                <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
                  <div className="flex items-center gap-1.5 text-[var(--ink-500)] mb-1">
                    <Users className="w-3.5 h-3.5 text-[var(--sage-600)]" />
                    <span className="text-[10px] uppercase">Clinical Staff</span>
                  </div>
                  <div className="font-bold text-base text-[var(--ink-900)]">
                    {phc.staffPresent} / {phc.staffAssigned} present
                  </div>
                  <span className="text-[10px] text-[var(--status-healthy)] font-semibold">
                    Doctor on duty (Dr. Patil)
                  </span>
                </div>

                {/* Oxygen Cylinders */}
                <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
                  <div className="flex items-center gap-1.5 text-[var(--ink-500)] mb-1">
                    <Activity className="w-3.5 h-3.5 text-[var(--sage-600)]" />
                    <span className="text-[10px] uppercase">Oxygen Buffer</span>
                  </div>
                  <div className="font-bold text-base text-[var(--ink-900)]">
                    {phc.oxygenCylinders} B-type cylinders
                  </div>
                  <span className="text-[10px] text-[var(--status-healthy)] font-semibold">
                    94 hours runway
                  </span>
                </div>

                {/* Cold Chain Storage */}
                <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
                  <div className="flex items-center gap-1.5 text-[var(--ink-500)] mb-1">
                    <Layers className="w-3.5 h-3.5 text-[var(--sage-600)]" />
                    <span className="text-[10px] uppercase">Cold Chain</span>
                  </div>
                  <div className="font-bold text-base text-[var(--ink-900)]">
                    +4.2°C Stable
                  </div>
                  <span className="text-[10px] text-[var(--status-healthy)] font-semibold">
                    WHO PQS ILR verified
                  </span>
                </div>
              </div>
            </div>

            {/* RISK DRIVERS: Demand rising, stock declining, emergency pressure */}
            <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
                <span className="font-heading font-semibold text-xs text-[var(--ink-900)] uppercase tracking-wide">
                  Causal Evidence &amp; Risk Drivers
                </span>
                <span className="text-[10px] font-mono text-[var(--sage-700)]">
                  Federated SHAP Analysis
                </span>
              </div>

              <div className="space-y-2">
                {phc.riskDrivers.map((driver, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--ink-900)]">
                        {driver.label}
                      </span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          driver.changePct > 0
                            ? 'text-[var(--status-critical)]'
                            : 'text-[var(--status-healthy)]'
                        }`}
                      >
                        {driver.changePct > 0 ? `+${driver.changePct}%` : `${driver.changePct}%`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--ink-700)] leading-tight">
                      {driver.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
