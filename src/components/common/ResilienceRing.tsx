import React from 'react';

interface ResilienceRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const ResilienceRing: React.FC<ResilienceRingProps> = ({
  score,
  size = 110,
  strokeWidth = 9,
  label = 'RESILIENCE',
  sublabel = 'INDEX',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // healthy
  let ratingText = 'HIGH';
  let badgeColor = 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30';

  if (score < 60) {
    strokeColor = '#ef4444'; // critical
    ratingText = 'VULNERABLE';
    badgeColor = 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30';
  } else if (score < 75) {
    strokeColor = '#f59e0b'; // warning
    ratingText = 'MODERATE';
    badgeColor = 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30';
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90 transition-all duration-700"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/80"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 6px ${strokeColor}44)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="mono-data text-2xl font-bold tracking-tight text-white leading-none">
            {score.toFixed(1)}
          </span>
          <span className="text-[9px] tracking-widest text-slate-400 uppercase font-medium mt-1">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span
          className={`inline-block text-[10px] mono-data font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}
        >
          {ratingText}
        </span>
        <div className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
          {label} {sublabel}
        </div>
      </div>
    </div>
  );
};
