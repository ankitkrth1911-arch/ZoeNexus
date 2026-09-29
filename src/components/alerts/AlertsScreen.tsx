import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  ShieldAlert,
  Building2,
  Pill,
  Repeat,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { StatusPill } from '../common/StatusPill';

export const AlertsScreen: React.FC = () => {
  const { alerts, resolveAlert, openDrawer, setActiveScreen } = useCommandStore();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.medicineName.toLowerCase().includes(q) ||
        a.districtName.toLowerCase().includes(q) ||
        (a.phcName && a.phcName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#111722] border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">
              Early Stock-out Warnings &amp; Countdown Queue
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Machine-learning ranked alert feed tracking days-to-zero stock exhaustion across essential public health medicines.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {(['all', 'critical', 'warning'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-3 py-1 rounded-lg uppercase font-semibold transition-all ${
                filterSeverity === s
                  ? s === 'critical'
                    ? 'bg-red-950 text-red-300 border border-red-500/50'
                    : 'bg-teal-950 text-teal-300 border border-teal-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s} ({alerts.filter((a) => s === 'all' || a.severity === s).length})
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2.5 rounded-xl bg-[#111722] border border-[#1e293b] flex items-center gap-2 text-xs font-mono">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter alerts by medicine, district, or PHC name..."
          className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const isCritical = alert.severity === 'critical';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all text-xs font-mono space-y-3 ${
                alert.status === 'resolved'
                  ? 'bg-[#111722]/50 border-slate-800 opacity-70'
                  : isCritical
                  ? 'bg-[#111722] border-red-800/60 shadow-[0_0_15px_rgba(239,68,68,0.06)]'
                  : 'bg-[#111722] border-[#1e293b]'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{alert.id}</span>
                  <span className="text-white font-bold text-sm tracking-tight">{alert.medicineName}</span>
                  <StatusPill status={alert.severity} size="sm" />
                </div>
                <span className="text-[11px] text-slate-400">{alert.timestamp}</span>
              </div>

              {/* Facility & Depletion Details */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-[#0b0f17] border border-slate-800 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-500 block">FACILITY:</span>
                  <span className="text-white font-semibold">{alert.phcName || alert.districtName}</span>
                  <span className="text-slate-400 block text-[10px]">{alert.districtName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CURRENT STOCK:</span>
                  <span className="text-white font-bold">{alert.currentStock} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">DAYS-TO-ZERO:</span>
                  <span className={`font-bold text-sm ${isCritical ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
                    {alert.daysRemaining} Days
                  </span>
                  <span className="text-slate-500 block text-[10px]">Zero by: {alert.predictedDepletionDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">POPULATION AT RISK:</span>
                  <span className="text-slate-300 font-bold">{alert.affectedPopulation.toLocaleString()}</span>
                </div>
              </div>

              {/* Algorithmic Suggested Action */}
              <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-800/40 text-[11px] text-slate-300 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[#00e5bc] uppercase font-bold block mb-0.5">
                    Recommended Algorithmic Action
                  </span>
                  {alert.suggestedAction}
                </div>

                <button
                  onClick={() => setActiveScreen('redistribution')}
                  className="px-3 py-1.5 rounded bg-[#00e5bc]/20 hover:bg-[#00e5bc] text-[#00e5bc] hover:text-[#0b0f17] font-bold text-[11px] border border-[#00e5bc]/40 transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Launch Transfer</span>
                </button>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => openDrawer('alert', alert.id)}
                  className="text-[#00e5bc] hover:underline text-[11px] font-semibold"
                >
                  View Full Clinical Context →
                </button>

                {alert.status === 'active' && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acknowledge / Mark Handled</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
