// 02 Risk Radar: "Which PHC needs attention first?"
import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  GitMerge,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useResilienceStore } from '../../../store/useResilienceStore';
import { RiskRadarItem } from '../../../types/decision';

export const RiskRadarScreen: React.FC = () => {
  const {
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
    setScreen('phc');
  };

  const handleResolveClick = (e: React.MouseEvent, item: RiskRadarItem) => {
    e.stopPropagation();
    setSelectedPHCId(item.phcId);
    openDrawer(item.phcId);
    setScreen('resolve');
  };

  return (
    <div className="space-y-4 select-none animate-in fade-in duration-200">
      {/* 1. Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--sage-700)] font-bold">
              Screen 02 · Prioritization Queue
            </span>
            <span className="text-[10px] font-mono text-[var(--ink-500)]">
              Operational Exception Queue
            </span>
          </div>
          <h1 className="font-heading font-bold text-lg text-[var(--ink-900)] mt-0.5">
            Risk Radar — "Which PHC needs attention first?"
          </h1>
          <p className="text-xs text-[var(--ink-700)] mt-0.5 max-w-2xl">
            Strictly ranked by days of stock left. Prioritizes facilities at imminent risk of stock-out so health officers act on the critical exception rather than scrolling unranked raw inventory.
          </p>
        </div>

        {/* Quick Queue Stats */}
        <div className="flex items-center gap-2 font-mono shrink-0">
          <div className="px-3 py-2 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] text-center">
            <span className="text-[10px] text-[var(--status-critical)] uppercase font-semibold block">Critical Queue</span>
            <span className="font-bold text-base text-[var(--status-critical)]">2 Sites</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] text-center">
            <span className="text-[10px] text-[var(--ink-500)] uppercase block">Average Lead Time</span>
            <span className="font-bold text-base text-[var(--ink-900)]">42 min</span>
          </div>
        </div>
      </div>

      {/* 2. Operational Filter Strip */}
      <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        {/* Risk Level Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-[var(--ink-500)] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Priority:
          </span>

          <button
            onClick={() => setRiskFilter('ALL')}
            className={`px-3 py-1 rounded-md font-mono text-xs transition-colors ${
              riskFilter === 'ALL'
                ? 'bg-[var(--sage-600)] text-white font-semibold'
                : 'bg-[var(--paper-50)] text-[var(--ink-700)] hover:bg-[var(--card-hover)]'
            }`}
          >
            All Severities ({allRisks.length})
          </button>

          <button
            onClick={() => setRiskFilter('HIGH')}
            className={`px-3 py-1 rounded-md font-mono text-xs transition-colors ${
              riskFilter === 'HIGH'
                ? 'bg-[var(--status-critical)] text-white font-semibold'
                : 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] hover:opacity-80'
            }`}
          >
            HIGH (&lt;5d)
          </button>

          <button
            onClick={() => setRiskFilter('MED')}
            className={`px-3 py-1 rounded-md font-mono text-xs transition-colors ${
              riskFilter === 'MED'
                ? 'bg-[var(--status-warning)] text-white font-semibold'
                : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] hover:opacity-80'
            }`}
          >
            MED (5–10d)
          </button>

          <button
            onClick={() => setRiskFilter('LOW')}
            className={`px-3 py-1 rounded-md font-mono text-xs transition-colors ${
              riskFilter === 'LOW'
                ? 'bg-[var(--status-healthy)] text-white font-semibold'
                : 'bg-[var(--status-healthy-bg)] text-[var(--status-healthy)] hover:opacity-80'
            }`}
          >
            LOW / Safe Donors
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[var(--ink-500)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PHC or medicine..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[var(--card-border)] bg-[var(--paper-50)] text-xs text-[var(--ink-900)] placeholder:text-[var(--ink-500)] focus:outline-none focus:ring-1 focus:ring-[var(--sage-600)]"
            />
          </div>
        </div>
      </div>

      {/* 3. The Operational Queue Table (Exception-First) */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Header Columns: PHC → Medicine → Coverage → Risk → Freshness → Action */}
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--surface-elevated)] text-[10px] font-mono uppercase tracking-wider text-[var(--ink-700)]">
                <th className="py-3 px-4 font-semibold">PHC Facility</th>
                <th className="py-3 px-4 font-semibold">Target Medicine</th>
                <th className="py-3 px-4 font-semibold">Current Stock</th>
                <th className="py-3 px-4 font-semibold">Coverage Runway</th>
                <th className="py-3 px-4 font-semibold">Risk Level</th>
                <th className="py-3 px-4 font-semibold">Freshness</th>
                <th className="py-3 px-4 font-semibold text-right">Operational Action</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-[var(--card-border)]/60">
              {filteredRisks.map((row) => {
                const isSelected = row.phcId === selectedPHCId;

                return (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--sage-50)] hover:bg-[var(--sage-100)]/60'
                        : 'hover:bg-[var(--card-hover)]'
                    }`}
                  >
                    {/* 1. PHC Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-bold text-[var(--ink-900)] text-sm">
                          {row.phcId}
                        </div>
                        <span className="text-[11px] text-[var(--ink-500)] truncate">
                          {row.phcName.replace(row.phcId, '').replace(/[()]/g, '').trim()}
                        </span>
                      </div>
                    </td>

                    {/* 2. Medicine Column */}
                    <td className="py-3.5 px-4 font-medium text-[var(--ink-900)]">
                      <div className="truncate max-w-[200px]" title={row.medicineName}>
                        {row.medicineName}
                      </div>
                      <span className="text-[10px] font-mono text-[var(--ink-500)] block">
                        {row.medicineCode}
                      </span>
                    </td>

                    {/* 3. Current Stock */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-[var(--ink-900)]">{row.currentStock}</span>
                      <span className="text-[10px] text-[var(--ink-500)] ml-1">units</span>
                      {row.shortageUnits > 0 && (
                        <span className="block text-[10px] text-[var(--status-critical)] font-semibold">
                          Deficit: -{row.shortageUnits}
                        </span>
                      )}
                    </td>

                    {/* 4. Coverage Runway */}
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`font-bold text-sm ${
                          row.coverageDays < 5
                            ? 'text-[var(--status-critical)]'
                            : row.coverageDays < 10
                            ? 'text-[var(--status-warning)]'
                            : 'text-[var(--status-healthy)]'
                        }`}
                      >
                        {row.coverageDays}d
                      </span>
                      <span className="text-[10px] text-[var(--ink-500)] block">
                        {row.coverageDays < 5 ? 'Critical runway' : 'Buffer active'}
                      </span>
                    </td>

                    {/* 5. Risk Level */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          row.riskLevel === 'HIGH'
                            ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
                            : row.riskLevel === 'MED'
                            ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                            : 'bg-[var(--status-healthy-bg)] text-[var(--status-healthy)] border-[var(--status-healthy-border)]'
                        }`}
                      >
                        {row.riskLevel === 'HIGH' && <AlertTriangle className="w-3 h-3" />}
                        {row.riskLevel === 'LOW' && <ShieldCheck className="w-3 h-3" />}
                        <span>{row.riskLevel}</span>
                      </span>
                      {row.isDonorCandidate && (
                        <span className="block text-[9px] font-mono text-[var(--status-surplus)] font-semibold mt-0.5">
                          Safe Donor Candidate
                        </span>
                      )}
                    </td>

                    {/* 6. Freshness */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--ink-700)]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[var(--ink-500)]" />
                        <span>
                          {row.freshnessMinutes > 60
                            ? `${Math.floor(row.freshnessMinutes / 60)}h ${row.freshnessMinutes % 60}m`
                            : `${row.freshnessMinutes}m ago`}
                        </span>
                      </div>
                      {row.freshnessMinutes > 120 && (
                        <span className="text-[9px] text-[var(--status-critical)] font-bold block uppercase">
                          Stale Telemetry
                        </span>
                      )}
                    </td>

                    {/* 7. Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRowClick(row)}
                          className="px-2.5 py-1.5 rounded-md border border-[var(--card-border)] bg-[var(--paper-50)] text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:bg-[var(--card-hover)] font-medium text-xs transition-colors"
                          title="Open PHC Workspace evidence"
                        >
                          Workspace
                        </button>

                        <button
                          onClick={(e) => handleResolveClick(e, row)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs ${
                            row.riskLevel === 'HIGH'
                              ? 'bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white'
                              : 'bg-[var(--cream-100)] hover:bg-[var(--cream-50)] text-[var(--ink-900)] border border-[var(--sage-200)]'
                          }`}
                        >
                          <GitMerge className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
