// Semantic Component: ForecastPanel
// Time-series forecast with confidence intervals, stock trajectory, and "today" marker.
import React from 'react';
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
import { ForecastPoint } from '../../types/decision';

interface ForecastPanelProps {
  data: ForecastPoint[];
  medicineName?: string;
  className?: string;
}

export const ForecastPanel: React.FC<ForecastPanelProps> = ({
  data,
  medicineName = 'Amlodipine',
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--card-border)] pb-2.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--sage-700)] font-bold block">
            Federated XGBoost Ensemble (v75.4)
          </span>
          <h3 className="font-heading font-semibold text-xs text-[var(--ink-900)]">
            15-Day Demand Surge &amp; Stock Trajectory
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--ink-500)] flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[var(--status-critical)]" />
            Stock Depletion Trajectory
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[var(--sage-600)]" />
            Predicted Demand
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 bg-[var(--cream-100)] opacity-60 rounded-xs" />
            95% Confidence Band
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-[var(--status-warning)] border-b border-dashed" />
            Min Buffer (300 units)
          </span>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" opacity={0.6} />

            <XAxis
              dataKey="dayLabel"
              stroke="var(--ink-500)"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              stroke="var(--ink-500)"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload as ForecastPoint;
                  return (
                    <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow-elevated text-xs font-mono space-y-1">
                      <div className="font-bold text-[var(--ink-900)] border-b border-[var(--card-border)] pb-1">
                        {label} {p.isToday ? '(TODAY)' : ''} · {p.dateStr}
                      </div>
                      <div className="text-[var(--status-critical)]">
                        Stock Remaining: <strong>{p.stockTrajectory} units</strong>
                      </div>
                      <div className="text-[var(--sage-700)]">
                        Predicted Daily Demand: <strong>{p.predictedDemand} units</strong>
                      </div>
                      <div className="text-[var(--ink-500)] text-[10px]">
                        Confidence Range: [{p.lowerConfidence} – {p.upperConfidence}]
                      </div>
                      {p.stockTrajectory < p.safetyThreshold && (
                        <div className="text-[var(--status-critical)] font-bold text-[10px] pt-1">
                          ⚠️ Below 300-unit safety buffer
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Confidence Band Area */}
            <Area
              type="monotone"
              dataKey="upperConfidence"
              stroke="transparent"
              fill="var(--cream-100)"
              fillOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="lowerConfidence"
              stroke="transparent"
              fill="var(--paper-50)"
              fillOpacity={0.8}
            />

            {/* Safety Threshold Reference Line */}
            <ReferenceLine
              y={300}
              stroke="var(--status-warning)"
              strokeDasharray="4 4"
              label={{
                value: 'Min Safety Buffer (300)',
                fill: 'var(--status-warning)',
                fontSize: 9,
                position: 'insideBottomRight',
                fontFamily: 'JetBrains Mono'
              }}
            />

            {/* Today Marker */}
            <ReferenceLine
              x="Day 0"
              stroke="var(--ink-900)"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              label={{
                value: 'TODAY',
                fill: 'var(--ink-900)',
                fontSize: 9,
                position: 'top',
                fontFamily: 'JetBrains Mono',
                fontWeight: 'bold'
              }}
            />

            {/* Predicted Demand Line */}
            <Line
              type="monotone"
              dataKey="predictedDemand"
              stroke="var(--sage-600)"
              strokeWidth={2}
              dot={{ r: 2.5, fill: 'var(--sage-600)' }}
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

      <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] flex items-center justify-between text-[11px] font-mono text-[var(--ink-700)]">
        <span>
          Depletion Velocity: <strong className="text-[var(--status-critical)]">-42 units/day</strong>
        </span>
        <span>
          Critical Stockout ETA: <strong className="text-[var(--status-critical)]">3.8 days (Saturday 14:00)</strong>
        </span>
      </div>
    </div>
  );
};
