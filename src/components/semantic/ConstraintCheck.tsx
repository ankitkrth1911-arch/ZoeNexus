// Semantic Component: ConstraintCheck
// Displays mathematical pass/fail status of an optimization constraint (OR-Tools LP).
import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ConstraintCheckItem } from '../../types/decision';

interface ConstraintCheckProps {
  constraint: ConstraintCheckItem;
  className?: string;
}

export const ConstraintCheck: React.FC<ConstraintCheckProps> = ({
  constraint,
  className = '',
}) => {
  return (
    <div
      className={`p-2.5 rounded-lg border text-xs flex items-start justify-between transition-colors ${
        constraint.passed
          ? 'bg-[var(--card-bg)] border-[var(--card-border)]'
          : 'bg-[var(--status-critical-bg)] border-[var(--status-critical-border)]'
      } ${className}`}
    >
      <div className="flex items-start gap-2 pr-2">
        {constraint.passed ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--status-healthy)] shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-[var(--status-critical)] shrink-0 mt-0.5" />
        )}
        <div>
          <div className="font-medium text-[var(--ink-900)] leading-tight">
            {constraint.name}
          </div>
          <div className="text-[10px] text-[var(--ink-500)] leading-normal mt-0.5">
            {constraint.description}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0 font-mono text-[11px]">
        <span
          className={`font-semibold block ${
            constraint.passed ? 'text-[var(--status-healthy)]' : 'text-[var(--status-critical)]'
          }`}
        >
          {constraint.metricValue}
        </span>
        <span className="text-[var(--ink-300)] text-[9px] block">
          Limit: {constraint.thresholdValue}
        </span>
      </div>
    </div>
  );
};
