// 03 PHC Workspace: "Why is this PHC at risk?"
import React from 'react';
import {
  BarChart3,
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
  Info,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useResilienceStore } from '../../../store/useResilienceStore';
import { SEEDED_FORECAST_SERIES_PHC184 } from '../../../services/decisionService';

export const PHCWorkspaceScreen: React.FC = () => {
  const {
    getCurrentPHC,
    setScreen,
    openDrawer,
    connectionState,
  } = useResilienceStore();

  const phc = getCurrentPHC();
  const forecastData = SEEDED_FORECAST_SERIES_PHC184;

  const isStale = phc.freshnessMinutes > 120 || connectionState === 'STALE_CRITICAL';

  return (
    <div className="space-y-4 select-none animate-in fade-in duration-200">
      {/* 1. Header: Identity → Freshness → Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--sage-700)] font-bold">
              Screen 03 · Understand Layer
            </span>
            <span className="text-[10px] font-mono text-[var(--ink-500)]">
              Causal Evidence &amp; Capacity
            </span>
          </div>

          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="font-heading font-bold text-lg text-[var(--ink-900)]">
              {phc.name}
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--paper-50)] border border-[var(--card-border)] text-[var(--ink-700)]">
              District: {phc.districtName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[var(--ink-700)] mt-1 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--ink-500)]" />
              Updated {phc.freshnessMinutes > 60 ? `${Math.floor(phc.freshnessMinutes / 60)}h ${phc.freshnessMinutes % 60}m` : `${phc.freshnessMinutes}m`} ago
            </span>
            <span>·</span>
            <span>Medicine Target: <strong>{phc.primaryMedicine}</strong></span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setScreen('resolve');
              openDrawer(phc.id);
            }}
            className="px-4 py-2 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <GitMerge className="w-4 h-4" />
            <span>Open Resolve Shortage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Stale Warning Banner (If Stale Critical) */}
      {isStale && (
        <div className="p-3.5 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[var(--status-critical)] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[var(--status-critical)] font-heading block">
              STALE CRITICAL INPUT DETECTED
            </span>
            <p className="text-[var(--ink-900)] mt-0.5 leading-relaxed">
              This facility last synced {phc.freshnessMinutes}m ago. Under Indian Public Health Standards (IPHS), authoritative inter-facility reallocation approval is blocked until fresh local inventory telemetry is received.
            </p>
          </div>
        </div>
      )}

      {/* 3. Core Metric Cards: Current Stock & 15-Day Demand sit directly next to each other */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CURRENT STOCK */}
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--ink-500)] font-mono uppercase">
            <span>Current Stock</span>
            <span className="text-[10px] text-[var(--ink-700)]">On-Shelf Count</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono font-bold text-3xl text-[var(--ink-900)]">
              {phc.currentStock}
            </span>
            <span className="text-xs font-mono text-[var(--ink-500)]">units</span>
          </div>
          <div className="mt-2 text-xs font-mono text-[var(--status-critical)] flex items-center gap-1 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Depleted from 620 units in 5 days (-38%)</span>
          </div>
        </div>

        {/* 15-DAY PREDICTED DEMAND */}
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--ink-500)] font-mono uppercase">
            <span>15-Day Forward Demand</span>
            <span className="text-[10px] font-mono text-[var(--sage-700)] font-bold">Edge XGBoost</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono font-bold text-3xl text-[var(--ink-900)]">
              {phc.forecastDemand15d}
            </span>
            <span className="text-xs font-mono text-[var(--ink-500)]">units needed</span>
          </div>
          <div className="mt-2 text-xs font-mono text-[var(--status-critical)] flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Surge: +42% Acute Respiratory Infection (ARI)</span>
          </div>
        </div>

        {/* COVERAGE RUNWAY & DEFICIT */}
        <div className="p-4 rounded-xl bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--status-critical)] font-mono uppercase font-bold">
            <span>Coverage Runway</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--status-critical)] text-white">
              HIGH RISK
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono font-bold text-3xl text-[var(--status-critical)]">
              {phc.coverageDays}
            </span>
            <span className="text-xs font-mono text-[var(--status-critical)]">days remaining</span>
          </div>
          <div className="mt-2 text-xs font-mono text-[var(--status-critical)] font-bold">
            Projected Net Shortage: {phc.shortageUnits} units (Depletes in 4 days)
          </div>
        </div>
      </div>

      {/* 4. Demand Forecast & Stock Trajectory Chart (Confidence Band + Today Marker) */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--card-border)] pb-3">
          <div>
            <h3 className="font-heading font-semibold text-sm text-[var(--ink-900)]">
              Stock Depletion Trajectory vs. Forward Demand Curve
            </h3>
            <p className="text-[11px] text-[var(--ink-500)] font-mono mt-0.5">
              Historical actuals (D-5 to Today) + 10-day forward forecast with 95% confidence interval
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[var(--status-critical)] inline-block" />
              <span className="text-[var(--ink-700)]">Stock Trajectory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[var(--sage-600)] inline-block" />
              <span className="text-[var(--ink-700)]">Predicted Demand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 bg-[var(--sage-100)] border border-[var(--sage-200)] inline-block" />
              <span className="text-[var(--ink-500)]">Confidence Band</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[var(--ink-300)] inline-block" />
              <span className="text-[var(--ink-500)]">Buffer Threshold (300u)</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--sage-200)" opacity={0.6} />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'var(--ink-700)' }}
                stroke="var(--card-border)"
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'var(--ink-700)' }}
                stroke="var(--card-border)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-soft)',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono',
                  color: 'var(--ink-900)'
                }}
              />

              {/* Confidence Band */}
              <Area
                type="monotone"
                dataKey="upperConfidence"
                stroke="none"
                fill="var(--sage-100)"
                opacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="lowerConfidence"
                stroke="none"
                fill="var(--card-bg)"
                opacity={1}
              />

              {/* Safety Buffer Reference Line */}
              <ReferenceLine
                y={300}
                stroke="var(--ink-500)"
                strokeDasharray="4 4"
                label={{
                  value: 'Min Safety Buffer (300 units)',
                  position: 'insideTopRight',
                  fill: 'var(--ink-500)',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono'
                }}
              />

              {/* Today Marker */}
              <ReferenceLine
                x="TODAY"
                stroke="var(--sage-700)"
                strokeWidth={2}
                label={{
                  value: 'TODAY (Sep 29)',
                  position: 'top',
                  fill: 'var(--sage-800)',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 'bold'
                }}
              />

              {/* Predicted Demand Line */}
              <Line
                type="monotone"
                dataKey="predictedDemand"
                stroke="var(--sage-600)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--sage-600)' }}
              />

              {/* Stock Trajectory Line */}
              <Line
                type="monotone"
                dataKey="stockTrajectory"
                stroke="var(--status-critical)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--status-critical)' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Bottom Two Panels: CAPACITY & RISK DRIVERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CAPACITY AS CONTEXTUAL EVIDENCE */}
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[var(--sage-600)]" />
              <h3 className="font-heading font-semibold text-xs text-[var(--ink-900)]">
                Facility Bed &amp; Personnel Capacity
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--ink-500)]">IPHS Tier 2 PHC</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--ink-500)] uppercase block">Inpatient Beds</span>
              <span className="font-bold text-base text-[var(--ink-900)] mt-0.5 block">
                {phc.bedsOccupied} / {phc.bedsTotal}
              </span>
              <span className="text-[9px] text-[var(--status-warning)] font-semibold">75% Occupancy</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--ink-500)] uppercase block">Staff Present</span>
              <span className="font-bold text-base text-[var(--ink-900)] mt-0.5 block">
                {phc.staffPresent} / {phc.staffAssigned}
              </span>
              <span className="text-[9px] text-[var(--status-healthy)] font-semibold">Doctor On Duty</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--ink-500)] uppercase block">Cold Storage</span>
              <span className="font-bold text-base text-[var(--status-healthy)] mt-0.5 block">
                4.2°C
              </span>
              <span className="text-[9px] text-[var(--ink-500)]">ILR Functional</span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--ink-700)] leading-relaxed bg-[var(--paper-50)] p-2.5 rounded-lg border border-[var(--card-border)]/60">
            <strong>Capacity Note: </strong> High pediatric bed occupancy correlates directly with antibiotic consumption rate. Adequate staff is on site to handle reconstituted IV infusions.
          </p>
        </div>

        {/* RISK DRIVERS */}
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[var(--status-critical)]" />
              <h3 className="font-heading font-semibold text-xs text-[var(--ink-900)]">
                Underlying Risk Drivers &amp; Outbreak Signals
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--ink-500)]">3 Factors</span>
          </div>

          <div className="space-y-2 text-xs">
            {phc.riskDrivers.map((driver, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--ink-900)]">{driver.label}</span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      driver.impact === 'critical'
                        ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)]'
                        : driver.impact === 'warning'
                        ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
                        : 'bg-[var(--sage-100)] text-[var(--ink-700)]'
                    }`}
                  >
                    {driver.changePct > 0 ? `+${driver.changePct}%` : `${driver.changePct}%`}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-500)] leading-snug">{driver.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
