// Semantic Component: DonorCandidate
// Evaluated facility candidate for stock redistribution
import React from 'react';
import { CheckCircle2, XCircle, Truck, Thermometer, Shield } from 'lucide-react';
import { DonorCandidate as DonorCandidateType } from '../../types/decision';

interface DonorCandidateProps {
  donor: DonorCandidateType;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export const DonorCandidate: React.FC<DonorCandidateProps> = ({
  donor,
  isSelected = false,
  onSelect,
  className = '',
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'bg-[var(--sage-50)] border-[var(--sage-600)] ring-1 ring-[var(--sage-600)]'
          : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:bg-[var(--card-hover)]'
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-xs text-[var(--ink-900)] flex items-center gap-1.5">
            <span>{donor.phcName}</span>
            {donor.isSafe ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--status-healthy-bg)] text-[var(--status-healthy)] border border-[var(--status-healthy-border)] font-semibold">
                <CheckCircle2 className="w-2.5 h-2.5" /> SAFE: YES
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--status-critical-bg)] text-[var(--status-critical)] border border-[var(--status-critical-border)] font-semibold">
                <XCircle className="w-2.5 h-2.5" /> SAFE: NO
              </span>
            )}
          </div>

          <div className="text-[11px] text-[var(--ink-500)] font-mono mt-0.5 flex items-center gap-2">
            <span>
              Safe Surplus: <strong className="text-[var(--status-surplus)]">+{donor.surplusAvailable}</strong>
            </span>
            <span>·</span>
            <span>
              Distance: {donor.distanceKm} km ({donor.transitMinutes}m)
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-[11px] shrink-0">
          <span className="text-[var(--ink-700)] block font-medium">Stock: {donor.currentStock}</span>
          <span className="text-[var(--ink-400)] text-[10px]">Min Reserve: {donor.minBuffer}</span>
        </div>
      </div>

      {/* Honest Causal Rationale: Why safe or why unsafe */}
      <div
        className={`mt-2 p-2 rounded text-[11px] border ${
          donor.isSafe
            ? 'bg-[var(--paper-50)] border-[var(--card-border)] text-[var(--ink-700)]'
            : 'bg-[var(--status-critical-bg)] border-[var(--status-critical-border)] text-[var(--status-critical)]'
        }`}
      >
        <span className="font-semibold text-[var(--ink-900)]">Constraint Rationale: </span>
        {donor.reason}
      </div>

      {/* Logistics & Cold-Chain attributes */}
      <div className="mt-2 pt-2 border-t border-[var(--card-border)]/60 flex items-center justify-between text-[10px] font-mono text-[var(--ink-500)]">
        <span className="flex items-center gap-1">
          <Truck className="w-3 h-3 text-[var(--sage-600)]" />
          {donor.transportMode}
        </span>
        <span className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 text-[var(--sage-600)]" />
          {donor.coldChainCompliant ? 'Cold-Chain 2-8°C Verified' : 'Standard Ambient Only'}
        </span>
      </div>
    </div>
  );
};
