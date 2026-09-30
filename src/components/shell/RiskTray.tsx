// Shell Layer: Risk Radar as Bottom Slide-Up Tray
// Spec: Views open as layers over the canvas: Risk Radar as a bottom slide-up tray (always showing a count like "7 high-risk")
// Exception-first operational queue: PHC → Medicine → Coverage → Risk → Action, plus Freshness.
import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  X,
  Filter,
  Search,
  ShieldCheck,
  GitMerge,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';
import { RiskRadarItem } from '../../types/decision';
import { RiskRow } from '../semantic/RiskRow';

export const RiskTray: React.FC = () => {
  const {
    isRiskTrayOpen,
    setRiskTrayOpen,
    toggleRiskTray,
    getRiskRadarList,
    setSelectedPHCId,
    setScreen,
    openDrawer,
    selectedPHCId,
  } = useResilienceStore();

  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MED' | 'LOW'>('ALL');
  const [medicineFilter, setMedicineFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const allRisks = getRiskRadarList();
  const highRiskCount = allRisks.filter((r) => r.riskLevel === 'HIGH').length;

  const filteredRisks = allRisks.filter((item) => {
    if (riskFilter !== 'ALL' && item.riskLevel !== riskFilter) return false;
    if (medicineFilter && !item.medicineCode.includes(medicineFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPHC = item.phcId.toLowerCase().includes(q) || item.phcName.toLowerCase().includes(q);
      const matchMed = item.medicineName.toLowerCase().includes(q);
      if (!matchPHC && !matchMed) return false;
    }
    return true;
  });

  const handleRowClick = (item: RiskRadarItem) => {
    setSelectedPHCId(item.phcId);
    setScreen('phc'); // opens PHC Workspace sheet
  };

  const handleResolveClick = (e: React.MouseEvent, item: RiskRadarItem) => {
    e.stopPropagation();
    setSelectedPHCId(item.phcId);
    openDrawer(item.phcId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none select-none">
      {/* 1. Collapsed Docked Bar (Always visible count: "7 high-risk") */}
      {!isRiskTrayOpen && (
        <div className="p-3 flex items-center justify-center pointer-events-auto">
          <button
            onClick={() => setRiskTrayOpen(true)}
            className="px-4 py-2 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--status-critical-border)] shadow-elevated text-xs flex items-center gap-3 hover:bg-[var(--card-hover)] transition-all cursor-pointer group"
            title="Open Risk Radar Operational Queue"
            aria-label="Expand Risk Radar Tray"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-critical)] animate-ping" />
              <span className="font-heading font-bold text-[var(--status-critical)]">
                {highRiskCount} High-Risk Exceptions
              </span>
            </div>

            <span className="text-[var(--ink-300)]">·</span>

            <span className="text-[var(--ink-700)] hidden sm:inline text-[11px] font-mono">
              PHC 184 (3.8d) · PHC 091 (2.1d)
            </span>

            <div className="flex items-center gap-1 text-[var(--sage-700)] font-semibold text-[11px] group-hover:translate-y-[-1px] transition-transform">
              <span>Inspect Queue</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* 2. Expanded Slide-Up Tray (55-65vh) */}
      {isRiskTrayOpen && (
        <div className="pointer-events-auto bg-[var(--card-bg)] border-t border-[var(--card-border)] shadow-elevated rounded-t-2xl max-h-[62vh] h-[58vh] flex flex-col animate-in slide-in-from-bottom duration-250">
          {/* Tray Handle & Header */}
          <div className="px-5 py-3 border-b border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-center justify-center text-[var(--status-critical)]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-sm text-[var(--ink-900)]">
                    Risk Radar — Operational Exception Queue
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--status-critical-bg)] text-[var(--status-critical)] font-bold">
                    {highRiskCount} CRITICAL
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-500)] mt-0.5">
                  Ranked by days of stock left. Surface exceptions and consequences before opening any facility.
                </p>
              </div>
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => setRiskTrayOpen(false)}
              className="p-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
              title="Collapse Risk Radar Tray"
              aria-label="Collapse Tray"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Tray Filter Bar */}
          <div className="px-5 py-2.5 border-b border-[var(--card-border)]/60 bg-[var(--card-bg)] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            {/* Priority Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-[var(--ink-500)] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Priority:
              </span>

              <button
                onClick={() => setRiskFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
                  riskFilter === 'ALL'
                    ? 'bg-[var(--sage-600)] text-white font-bold'
                    : 'bg-[var(--paper-50)] text-[var(--ink-700)] hover:bg-[var(--card-hover)]'
                }`}
              >
                All ({allRisks.length})
              </button>

              <button
                onClick={() => setRiskFilter('HIGH')}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
                  riskFilter === 'HIGH'
                    ? 'bg-[var(--status-critical)] text-white font-bold'
                    : 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] hover:opacity-80'
                }`}
              >
                High Risk ({highRiskCount})
              </button>

              <button
                onClick={() => setRiskFilter('MED')}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
                  riskFilter === 'MED'
                    ? 'bg-[var(--status-warning)] text-white font-bold'
                    : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] hover:opacity-80'
                }`}
              >
                Elevated (2)
              </button>

              <button
                onClick={() => setRiskFilter('LOW')}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
                  riskFilter === 'LOW'
                    ? 'bg-[var(--status-healthy)] text-white font-bold'
                    : 'bg-[var(--status-healthy-bg)] text-[var(--status-healthy)] hover:opacity-80'
                }`}
              >
                Nominal (3)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--ink-400)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PHC or medicine..."
                className="pl-8 pr-3 py-1 text-xs bg-[var(--paper-50)] border border-[var(--card-border)] rounded-md text-[var(--ink-900)] placeholder:text-[var(--ink-400)] focus:outline-none focus:border-[var(--sage-600)]"
              />
            </div>
          </div>

          {/* Operational Queue Table */}
          <div className="flex-1 overflow-y-auto px-5 py-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)]">
                  <th className="py-2 px-3">PHC Facility</th>
                  <th className="py-2 px-3">Target Medicine</th>
                  <th className="py-2 px-3">Coverage Runway</th>
                  <th className="py-2 px-3">Risk Level</th>
                  <th className="py-2 px-3">Freshness</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((item) => (
                  <RiskRow
                    key={item.id}
                    item={item}
                    isSelected={item.phcId === selectedPHCId}
                    onSelect={() => handleRowClick(item)}
                    onResolve={(e) => handleResolveClick(e, item)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
