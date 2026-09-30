// Semantic Component: SolverResult
// Displays deterministic Multi-Commodity Linear Programming output from OR-Tools LP
import React from 'react';
import { ArrowRight, Truck, ShieldCheck, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { SolverRecommendation } from '../../types/decision';

interface SolverResultProps {
  recommendation: SolverRecommendation;
  className?: string;
}

export const SolverResult: React.FC<SolverResultProps> = ({
  recommendation,
  className = '',
}) => {
  return (
    <div
      className={`p-3.5 rounded-lg border border-[var(--sage-600)]/40 bg-[var(--sage-50)] text-xs shadow-xs space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-[var(--sage-700)]" />
          <span className="font-heading font-bold text-xs uppercase tracking-wide text-[var(--sage-800)]">
            Optimal Transfer Corridor
          </span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            recommendation.solverStatus === 'OPTIMAL'
              ? 'bg-[var(--status-healthy)] text-white'
              : 'bg-[var(--status-critical)] text-white'
          }`}
        >
          {recommendation.solverStatus}
        </span>
      </div>

      {/* Corridor Visualization */}
      <div className="p-3 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
        <div className="flex items-center justify-between font-mono">
          <div className="truncate max-w-[140px]">
            <span className="text-[10px] text-[var(--ink-500)] uppercase block">Donor Origin</span>
            <span className="font-bold text-[var(--ink-900)] text-xs truncate block">
              {recommendation.donorName.split('—')[0]}
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-[10px] font-mono text-[var(--sage-700)] font-bold">
              Dispatch
            </span>
            <div className="flex items-center gap-1 text-[var(--sage-600)] font-bold">
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="text-sm font-bold text-[var(--ink-900)]">
                {recommendation.transferQuantity} units
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] text-[var(--ink-500)] font-mono">
              via {recommendation.corridor}
            </span>
          </div>

          <div className="text-right truncate max-w-[140px]">
            <span className="text-[10px] text-[var(--ink-500)] uppercase block">Receiver Destination</span>
            <span className="font-bold text-[var(--ink-900)] text-xs truncate block">
              {recommendation.receiverName.split('—')[0]}
            </span>
          </div>
        </div>

        {/* Impact Metrics Row */}
        <div className="pt-2 border-t border-[var(--card-border)]/60 grid grid-cols-3 gap-2 font-mono text-[11px]">
          <div>
            <span className="text-[10px] text-[var(--ink-500)] block">Residual Shortage</span>
            <span className="font-bold text-[var(--status-healthy)]">
              {recommendation.residualShortage} units (0%)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--ink-500)] block">Transit / Distance</span>
            <span className="font-medium text-[var(--ink-700)]">
              {recommendation.transitMinutes}m ({recommendation.distanceKm} km)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--ink-500)] block">Logistics Cost</span>
            <span className="font-medium text-[var(--ink-700)]">
              ₹{recommendation.estLogisticsCostINR} (~${recommendation.estLogisticsCostUSD})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
