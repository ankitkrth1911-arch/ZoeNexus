import React from 'react';

interface RiskBarProps {
  score: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const RiskBar: React.FC<RiskBarProps> = ({
  score,
  showLabel = true,
  size = 'md',
}) => {
  const clamped = Math.max(0, Math.min(100, score));

  // Determine color based on threshold
  let barColor = 'bg-[#10b981]';
  let textColor = 'text-[#10b981]';
  let glowColor = 'shadow-[0_0_8px_rgba(16,185,129,0.4)]';

  if (clamped >= 70) {
    barColor = 'bg-[#ef4444]';
    textColor = 'text-[#ef4444]';
    glowColor = 'shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  } else if (clamped >= 35) {
    barColor = 'bg-[#f59e0b]';
    textColor = 'text-[#f59e0b]';
    glowColor = 'shadow-[0_0_8px_rgba(245,158,11,0.4)]';
  }

  const height = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className={`flex-1 bg-slate-800/80 rounded-full overflow-hidden ${height} border border-slate-700/50`}>
        <div
          className={`${height} ${barColor} ${glowColor} transition-all duration-500 rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className={`mono-data text-xs font-semibold ${textColor} w-10 text-right`}>
          {clamped.toFixed(1)}%
        </span>
      )}
    </div>
  );
};
