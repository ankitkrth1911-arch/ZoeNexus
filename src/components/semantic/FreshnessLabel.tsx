// Semantic Component: FreshnessLabel
// Statutory data-freshness indicator required across all medical command centre surfaces.
import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface FreshnessLabelProps {
  minutes: number;
  className?: string;
  showIcon?: boolean;
  warnIfStale?: boolean;
}

export const FreshnessLabel: React.FC<FreshnessLabelProps> = ({
  minutes,
  className = '',
  showIcon = true,
  warnIfStale = true,
}) => {
  const isStale = warnIfStale && minutes > 240; // >4 hours per statutory threshold
  const isWarning = warnIfStale && minutes > 60 && minutes <= 240;

  const formattedTime =
    minutes < 60
      ? `${minutes}m ago`
      : `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs tabular-nums ${
        isStale
          ? 'text-[var(--status-critical)] font-semibold'
          : isWarning
          ? 'text-[var(--status-warning)]'
          : 'text-[var(--ink-500)]'
      } ${className}`}
      title={
        isStale
          ? `Telemetry age (${formattedTime}) exceeds 4-hour statutory freshness limit. Authoritative actions blocked.`
          : `Last sensor/HIS synchronization timestamp: ${formattedTime}`
      }
    >
      {showIcon && (
        isStale ? (
          <AlertTriangle className="w-3 h-3 text-[var(--status-critical)] shrink-0" />
        ) : (
          <Clock className="w-3 h-3 text-[var(--ink-500)] shrink-0" />
        )
      )}
      <span>Updated {formattedTime}</span>
      {isStale && (
        <span className="text-[10px] px-1 py-0.2 rounded bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)]">
          STALE
        </span>
      )}
    </span>
  );
};
