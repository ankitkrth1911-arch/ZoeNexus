import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, BarChart3, Info, Sparkles } from 'lucide-react';
import { MOCK_FORECAST_DATA } from '../../data/mockData';
import { useCommandStore } from '../../store/useCommandStore';

export const ForecastMiniChart: React.FC = () => {
  const { timeRange, setTimeRange, setActiveScreen } = useCommandStore();
  const [selectedMedicine, setSelectedMedicine] = useState('Paracetamol 500mg');

  const series = MOCK_FORECAST_DATA.forecastSeries;

  return (
    <div className="flex flex-col h-full rounded-xl border border-[#1e293b] bg-[#111722]/90 backdrop-blur-md overflow-hidden">
      {/* Chart Header */}
      <div className="p-3.5 border-b border-[#1e293b] flex items-center justify-between bg-[#0b0f17]/60">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00e5bc]" />
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
              Federated Demand Forecast
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Satara Hilly Belt • {selectedMedicine} • Model: XGBoost Ensemble
          </p>
        </div>

        {/* Horizon picker */}
        <div className="flex items-center bg-[#0b0f17] border border-[#1e293b] rounded-md p-0.5 mono-data">
          {(['7d', '14d', '30d'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setTimeRange(h)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                timeRange === h
                  ? 'bg-[#00e5bc]/20 text-[#00e5bc] border border-[#00e5bc]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Model Performance Accuracy Strip */}
      <div className="px-3.5 py-2 bg-[#0b0f17]/40 border-b border-[#1e293b] flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <span>
            MAE: <strong className="text-emerald-400">14.2</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            MAPE: <strong className="text-emerald-400">4.8%</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            RMSE: <strong className="text-slate-200">18.6</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-teal-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5bc]" />
          <span>95% Confidence Band</span>
        </div>
      </div>

      {/* Recharts Chart Area */}
      <div className="flex-1 p-3 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5bc" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00e5bc" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0b0f17] border border-[#2a3a52] p-2.5 rounded-lg shadow-2xl text-[11px] font-mono space-y-1">
                      <div className="text-white font-bold">{label} ({data.dayLabel})</div>
                      {data.actualDemand && (
                        <div className="text-slate-300">
                          Actual Recorded Demand: <span className="text-white font-bold">{data.actualDemand}</span>
                        </div>
                      )}
                      <div className="text-[#00e5bc]">
                        XGBoost Forecast: <span className="font-bold">{data.predictedDemand}</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        95% CI: [{data.lowerConfidence} – {data.upperConfidence}]
                      </div>
                      <div className="text-amber-400 text-[10px]">
                        Available Stock: {data.stockAvailable} units
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Shaded Confidence Band */}
            <Area
              type="monotone"
              dataKey="upperConfidence"
              stroke="transparent"
              fill="url(#confidenceBand)"
            />
            {/* Historical Baseline */}
            <Line
              type="monotone"
              dataKey="baselineDemand"
              stroke="#64748b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              name="Baseline M.A."
            />
            {/* Actual Recorded Line */}
            <Line
              type="monotone"
              dataKey="actualDemand"
              stroke="#f1f5f9"
              strokeWidth={2}
              dot={{ r: 3, fill: '#f1f5f9' }}
              name="Actual Demand"
            />
            {/* Predicted Curve */}
            <Line
              type="monotone"
              dataKey="predictedDemand"
              stroke="#00e5bc"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#00e5bc' }}
              name="XGBoost Predicted"
            />
            {/* Vertical Marker for TODAY */}
            <ReferenceLine
              x="Sep 29"
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                value: 'TODAY',
                position: 'top',
                fill: '#ef4444',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Feature Importance Preview */}
      <div className="p-3 border-t border-[#1e293b] bg-[#0b0f17]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-[#00e5bc]" />
          <span>Top driver: Seasonal Monsoon Surge (+34%)</span>
        </div>
        <button
          onClick={() => setActiveScreen('forecast')}
          className="text-[11px] font-mono text-[#00e5bc] hover:text-white font-semibold transition-colors"
        >
          Detailed Feature Analysis →
        </button>
      </div>
    </div>
  );
};
