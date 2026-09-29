import React from 'react';
import { TrendingDown, TrendingUp, HelpCircle, LucideIcon } from 'lucide-react';

interface KpiTileProps {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string | number;
    isPositiveGood?: boolean;
    isIncrease?: boolean;
    label?: string;
  };
  sparklineData?: number[];
  status?: 'critical' | 'warning' | 'healthy' | 'info';
  icon?: LucideIcon;
  subtext?: string;
  tooltip?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const KpiTile: React.FC<KpiTileProps> = ({
  title,
  value,
  unit,
  delta,
  sparklineData = [24, 28, 26, 32, 35, 30, 38],
  status = 'info',
  icon: Icon,
  subtext,
  tooltip,
  onClick,
  isActive = false,
}) => {
  // Status-driven accent styles
  let borderColor = 'border-slate-800 hover:border-slate-700';
  let accentDot = 'bg-slate-500';
  let valueColor = 'text-white';

  if (status === 'critical') {
    borderColor = 'border-red-900/40 hover:border-red-600/60 bg-red-950/10';
    accentDot = 'bg-[#ef4444] shadow-[0_0_8px_#ef4444]';
    valueColor = 'text-red-400';
  } else if (status === 'warning') {
    borderColor = 'border-amber-900/40 hover:border-amber-600/60 bg-amber-950/10';
    accentDot = 'bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]';
    valueColor = 'text-amber-300';
  } else if (status === 'healthy') {
    borderColor = 'border-emerald-900/40 hover:border-emerald-600/60 bg-emerald-950/10';
    accentDot = 'bg-[#10b981] shadow-[0_0_8px_#10b981]';
    valueColor = 'text-emerald-300';
  } else if (status === 'info') {
    borderColor = 'border-slate-800 hover:border-teal-500/40';
    accentDot = 'bg-[#00e5bc] shadow-[0_0_8px_#00e5bc]';
    valueColor = 'text-white';
  }

  if (isActive) {
    borderColor = 'border-[#00e5bc] bg-[#00e5bc]/5 shadow-[0_0_15px_rgba(0,229,188,0.15)]';
  }

  // Generate SVG path for mini sparkline
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 80;
  const height = 24;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-3.5 rounded-lg border bg-[#111722]/90 backdrop-blur-sm transition-all duration-200 ${borderColor} ${
        onClick ? 'cursor-pointer hover:translate-y-[-1px]' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full ${accentDot} flex-shrink-0`} />
          <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />}
          {tooltip && (
            <div className="relative group/tooltip">
              <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 transition-colors" />
              <div className="absolute right-0 top-5 hidden group-hover/tooltip:block z-50 w-48 p-2 text-[10px] rounded bg-slate-900 border border-slate-700 text-slate-200 shadow-xl pointer-events-none">
                {tooltip}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Value & Sparkline */}
      <div className="flex items-baseline justify-between gap-2 my-1">
        <div className="flex items-baseline gap-1">
          <span className={`mono-data text-2xl font-bold tracking-tight ${valueColor}`}>
            {value}
          </span>
          {unit && <span className="mono-data text-xs text-slate-400 font-medium">{unit}</span>}
        </div>

        {/* Mini Sparkline */}
        <div className="w-[80px] h-[24px] flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke={
                status === 'critical'
                  ? '#ef4444'
                  : status === 'warning'
                  ? '#f59e0b'
                  : status === 'healthy'
                  ? '#10b981'
                  : '#00e5bc'
              }
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Delta & Subtext */}
      <div className="flex items-center justify-between text-[11px] mt-1 pt-1.5 border-t border-slate-800/80">
        {delta ? (
          <div
            className={`flex items-center gap-1 font-medium mono-data ${
              delta.isIncrease
                ? delta.isPositiveGood
                  ? 'text-emerald-400'
                  : 'text-red-400'
                : delta.isPositiveGood
                ? 'text-red-400'
                : 'text-emerald-400'
            }`}
          >
            {delta.isIncrease ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{delta.value}</span>
            <span className="text-slate-400 text-[10px] font-normal">{delta.label || 'vs last week'}</span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 mono-data">{subtext || 'Telemetry verified'}</span>
        )}
      </div>
    </div>
  );
};
