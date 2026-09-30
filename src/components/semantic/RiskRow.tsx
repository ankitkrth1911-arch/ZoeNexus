// Semantic Component: RiskRow
// Operational queue row for exception prioritization
import React from 'react';
import { ArrowRight, AlertTriangle, ShieldCheck, GitMerge } from 'lucide-react';
import { RiskRadarItem } from '../../types/decision';
import { FreshnessLabel } from './FreshnessLabel';

interface RiskRowProps {
  item: RiskRadarItem;
  isSelected?: boolean;
  onSelect: () => void;
  onResolve: (e: React.MouseEvent) => void;
  className?: string;
}

export const RiskRow: React.FC<RiskRowProps> = ({
  item,
  isSelected = false,
  onSelect,
  onResolve,
  className = '',
}) => {
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-[var(--status-critical-bg)]',
          text: 'text-[var(--status-critical)]',
          border: 'border-[var(--status-critical-border)]',
          label: 'CRITICAL',
        };
      case 'MED':
        return {
          bg: 'bg-[var(--status-warning-bg)]',
          text: 'text-[var(--status-warning)]',
          border: 'border-[var(--status-warning-border)]',
          label: 'ELEVATED',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-[var(--status-healthy-bg)]',
          text: 'text-[var(--status-healthy)]',
          border: 'border-[var(--status-healthy-border)]',
          label: 'NOMINAL',
        };
    }
  };

  const badge = getRiskBadge(item.riskLevel);

  return (
    <tr
      onClick={onSelect}
      className={`border-b border-[var(--card-border)]/60 text-xs transition-colors cursor-pointer select-none ${
        isSelected
          ? 'bg-[var(--sage-50)]'
          : 'hover:bg-[var(--card-hover)]'
      } ${className}`}
    >
      {/* 1. PHC Facility Identity */}
      <td className="py-2.5 px-3">
        <div className="font-heading font-semibold text-[var(--ink-900)]">
          {item.phcId}
        </div>
        <div className="text-[11px] text-[var(--ink-500)] truncate max-w-[180px]">
          {item.phcName.split('—')[1] || item.phcName}
        </div>
      </td>

      {/* 2. Target Medicine */}
      <td className="py-2.5 px-3">
        <div className="font-medium text-[var(--ink-900)] truncate max-w-[200px]">
          {item.medicineName}
        </div>
        <div className="font-mono text-[10px] text-[var(--ink-400)]">
          {item.medicineCode}
        </div>
      </td>

      {/* 3. Coverage Runway */}
      <td className="py-2.5 px-3 font-mono">
        <div
          className={`font-bold text-sm ${
            item.coverageDays < 5
              ? 'text-[var(--status-critical)]'
              : item.coverageDays < 8
              ? 'text-[var(--status-warning)]'
              : 'text-[var(--status-healthy)]'
          }`}
        >
          {item.coverageDays}d
        </div>
        <div className="text-[10px] text-[var(--ink-500)]">
          {item.currentStock} in stock
        </div>
      </td>

      {/* 4. Risk Priority Badge */}
      <td className="py-2.5 px-3 font-mono">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          {badge.label}
        </span>
        {item.shortageUnits > 0 && (
          <div className="text-[10px] text-[var(--status-critical)] font-semibold mt-0.5">
            -{item.shortageUnits} deficit
          </div>
        )}
      </td>

      {/* 5. Freshness Stamp */}
      <td className="py-2.5 px-3">
        <FreshnessLabel minutes={item.freshnessMinutes} />
      </td>

      {/* 6. Action */}
      <td className="py-2.5 px-3 text-right">
        <button
          onClick={onResolve}
          className="px-2.5 py-1 rounded-md bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition-colors"
        >
          <GitMerge className="w-3 h-3" />
          <span>Resolve</span>
        </button>
      </td>
    </tr>
  );
};
