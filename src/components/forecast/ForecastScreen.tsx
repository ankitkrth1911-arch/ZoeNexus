import React, { useState } from 'react';
import {
  TrendingUp,
  Sliders,
  Filter,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  MOCK_DISTRICTS,
  ESSENTIAL_MEDICINES_CATALOG,
  MOCK_FORECAST_DATA,
} from '../../data/mockData';
import { useCommandStore } from '../../store/useCommandStore';
import { StatusPill } from '../common/StatusPill';

export const ForecastScreen: React.FC = () => {
  const { timeRange, setTimeRange, openDrawer } = useCommandStore();
  const [selectedDistrict, setSelectedDistrict] = useState(MOCK_DISTRICTS[2].id); // Satara
  const [selectedMedicine, setSelectedMedicine] = useState('MED-PCM-500'); // Paracetamol
  const [modelType, setModelType] = useState<'xgboost' | 'arima' | 'baseline'>('xgboost');
  const [thresholdDays, setThresholdDays] = useState(3);
  const [bufferRetention, setBufferRetention] = useState(25);

  const forecast = MOCK_FORECAST_DATA;

  // Medicine x District Heatmap Matrix calculation
  const heatmapData = ESSENTIAL_MEDICINES_CATALOG.slice(0, 7).map((med) => {
    return {
      medicine: med,
      districtStockDays: MOCK_DISTRICTS.map((dist) => {
        // Seeded realistic days of stock
        let days = 14.5;
        if (dist.id === 'DIST-STR' && med.code === 'MED-PCM-500') days = 2.1;
        if (dist.id === 'DIST-STR' && med.code === 'MED-OXY-10U') days = 1.7;
        if (dist.id === 'DIST-SLP' && med.code === 'MED-ORS-SCT') days = 1.4;
        if (dist.id === 'DIST-SLP' && med.code === 'MED-INS-REG') days = 1.7;
        if (dist.id === 'DIST-PUN') days = 42.0;
        if (dist.id === 'DIST-AHM') days = 28.5;
        if (dist.id === 'DIST-NSK') days = 11.2;
        return {
          districtId: dist.id,
          districtName: dist.name,
          days,
        };
      }),
    };
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#111722] border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00e5bc]" />
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">
              Federated Demand Forecasting &amp; Early Warning System
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Privacy-preserving edge models predict PHC consumption, stock-out hazards, and epidemic surges before patients arrive.
          </p>
        </div>

        {/* Global Horizon & Metric Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#0b0f17] border border-[#1e293b] rounded-lg p-0.5 mono-data text-xs">
            {(['7d', '14d', '30d'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setTimeRange(h)}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  timeRange === h
                    ? 'bg-[#00e5bc]/20 text-[#00e5bc] border border-[#00e5bc]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h} Forecast
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-300 font-mono text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#00e5bc]" />
            <span>MAPE: 4.8% (XGBoost Ensemble)</span>
          </div>
        </div>
      </div>

      {/* 1. Medicine x District Heatmap Matrix */}
      <div className="rounded-xl border border-[#1e293b] bg-[#111722] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00e5bc]" />
              Days-of-Stock Risk Heatmap (Essential Drug List)
            </h2>
            <p className="text-[11px] text-slate-400">
              Color coded: Red (&lt; 3 days), Amber (3–7 days), Green (&gt; 7 days buffer). Click any cell to inspect corridor.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2.5 h-2.5 rounded bg-[#ef4444]" /> &lt;3d Critical
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded bg-[#f59e0b]" /> 3–7d Warning
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-[#10b981]" /> &gt;7d Healthy
            </span>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto rounded-lg border border-[#1e293b]">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="bg-[#0b0f17] border-b border-[#1e293b] text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Essential Medicine</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                {MOCK_DISTRICTS.map((d) => (
                  <th key={d.id} className="py-2.5 px-3 font-semibold text-center">
                    {d.name.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {heatmapData.map((row) => (
                <tr key={row.medicine.code} className="hover:bg-[#161f2e] transition-colors">
                  <td className="py-2 px-3 font-bold text-slate-200">
                    {row.medicine.name}
                    <span className="text-[10px] text-slate-500 block font-normal">
                      [{row.medicine.code}]
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400 text-[11px]">
                    {row.medicine.category}
                  </td>
                  {row.districtStockDays.map((col) => {
                    const days = col.days;
                    let cellBg = 'bg-emerald-950/25 text-emerald-300 border-emerald-800/30';
                    if (days < 3) {
                      cellBg = 'bg-red-950/40 text-red-300 border-red-700/50 font-bold';
                    } else if (days < 7) {
                      cellBg = 'bg-amber-950/30 text-amber-300 border-amber-700/40 font-semibold';
                    }

                    return (
                      <td key={col.districtId} className="py-1.5 px-2 text-center">
                        <button
                          onClick={() => {
                            setSelectedDistrict(col.districtId);
                            setSelectedMedicine(row.medicine.code);
                            openDrawer('district', col.districtId);
                          }}
                          className={`w-full py-1 rounded border text-xs transition-all hover:scale-105 cursor-pointer ${cellBg}`}
                        >
                          {days.toFixed(1)}d
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Drill-Down Model Comparison & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Model Curve Drilldown (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-[#1e293b] bg-[#111722] p-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1e293b]">
            <div>
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                Model Comparison: Federated XGBoost vs. Baseline ARIMA
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Target: Paracetamol 500mg in Satara Hilly Belt (ID: DIST-STR)
              </p>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                onClick={() => setModelType('xgboost')}
                className={`px-2.5 py-1 rounded font-semibold ${
                  modelType === 'xgboost'
                    ? 'bg-[#00e5bc] text-[#0b0f17]'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                XGBoost Ensemble
              </button>
              <button
                onClick={() => setModelType('baseline')}
                className={`px-2.5 py-1 rounded font-semibold ${
                  modelType === 'baseline'
                    ? 'bg-[#00e5bc] text-[#0b0f17]'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Historical Baseline
              </button>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.forecastSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5bc" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e5bc" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0b0f17] border border-[#2a3a52] p-3 rounded-lg shadow-2xl font-mono text-xs space-y-1">
                          <div className="text-white font-bold">{label} ({d.dayLabel})</div>
                          <div className="text-[#00e5bc]">Predicted: {d.predictedDemand} units/day</div>
                          <div className="text-slate-400">Baseline Moving Avg: {d.baselineDemand} units</div>
                          {d.actualDemand && <div className="text-white font-bold">Actual: {d.actualDemand} units</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="upperConfidence" stroke="transparent" fill="url(#forecastArea)" />
                <Line type="monotone" dataKey="baselineDemand" stroke="#64748b" strokeDasharray="3 3" strokeWidth={1.5} />
                <Line type="monotone" dataKey="predictedDemand" stroke="#00e5bc" strokeWidth={2.5} />
                {forecast.forecastSeries.map((pt, i) => (
                  pt.isToday ? (
                    <ReferenceLine
                      key={i}
                      x={pt.date}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{ value: 'TODAY', fill: '#ef4444', fontSize: 10, position: 'top' }}
                    />
                  ) : null
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Model Metrics Table */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#1e293b] text-center font-mono text-xs">
            <div className="p-2 rounded bg-[#0b0f17]">
              <span className="text-[10px] text-slate-500 block">MEAN ABSOLUTE ERROR</span>
              <span className="text-emerald-400 font-bold text-sm">14.2 units</span>
            </div>
            <div className="p-2 rounded bg-[#0b0f17]">
              <span className="text-[10px] text-slate-500 block">MAPE ERROR RATE</span>
              <span className="text-emerald-400 font-bold text-sm">4.8%</span>
            </div>
            <div className="p-2 rounded bg-[#0b0f17]">
              <span className="text-[10px] text-slate-500 block">ROOT MEAN SQ ERROR</span>
              <span className="text-slate-200 font-bold text-sm">18.6 units</span>
            </div>
            <div className="p-2 rounded bg-[#0b0f17]">
              <span className="text-[10px] text-slate-500 block">TRAINING SAMPLES</span>
              <span className="text-teal-300 font-bold text-sm">184,200 local pts</span>
            </div>
          </div>
        </div>

        {/* Feature Importance & Alert Thresholds Editor (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Feature Importance Bars */}
          <div className="rounded-xl border border-[#1e293b] bg-[#111722] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00e5bc]" />
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                Why This Prediction? (Feature Weights)
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              SHAP feature attributions explaining the +34% demand acceleration in Satara.
            </p>

            <div className="space-y-2.5 font-mono text-xs pt-1">
              {forecast.featureImportance.map((f) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 truncate max-w-[200px]" title={f.feature}>
                      {f.feature}
                    </span>
                    <span className="text-teal-400 font-bold">{(f.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#00e5bc] h-1.5 rounded-full"
                      style={{ width: `${f.weight * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">{f.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simple Human-Friendly Alert Rules Editor */}
          <div className="rounded-xl border border-[#1e293b] bg-[#111722] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                Early Warning Threshold Rules
              </h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Critical Stockout Trigger:</span>
                  <span className="text-red-400 font-bold">&lt; {thresholdDays} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={thresholdDays}
                  onChange={(e) => setThresholdDays(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Minimum Buffer Retention:</span>
                  <span className="text-[#00e5bc] font-bold">{bufferRetention}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  value={bufferRetention}
                  onChange={(e) => setBufferRetention(Number(e.target.value))}
                  className="w-full accent-[#00e5bc] cursor-pointer"
                />
              </div>

              <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-800">
                Rule status: <span className="text-emerald-400">Active across 4,382 PHCs</span>. Changes are verified by DHO signature.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
