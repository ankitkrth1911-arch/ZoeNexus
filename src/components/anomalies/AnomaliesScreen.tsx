import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Check,
  Building2,
  Calendar,
  Thermometer,
  Pill,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { StatusPill } from '../common/StatusPill';

export const AnomaliesScreen: React.FC = () => {
  const { anomalies, markAnomalyReviewed, openDrawer, setSelectedDistrictId } = useCommandStore();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');

  const filtered = anomalies.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    return true;
  });

  const handleReviewSubmit = (id: string) => {
    markAnomalyReviewed(id, reviewerNote || 'Verified on-site by District Drug Inspector');
    setActiveReviewId(null);
    setReviewerNote('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#111722] border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">
              Supply Chain Integrity &amp; Anomaly Detection
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Isolation-Forest unsupervised models flag suspicious consumption surges, ghost dispensing gaps, and cold-chain excursions.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {(['all', 'critical', 'warning'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg uppercase font-semibold transition-all ${
                filterSeverity === sev
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Metric Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl border border-red-900/40 bg-[#111722] space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">CONSUMPTION SPIKES</span>
          <div className="text-2xl font-bold text-red-400">+744% Peak</div>
          <p className="text-[11px] text-slate-400">1 potential private market diversion flagged.</p>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-900/40 bg-[#111722] space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">REPORTING GHOST GAPS</span>
          <div className="text-2xl font-bold text-amber-400">0 Logged / 6 Days</div>
          <p className="text-[11px] text-slate-400">OPD register divergence at Koregaon Sub-centre.</p>
        </div>

        <div className="p-3.5 rounded-xl border border-teal-900/40 bg-[#111722] space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">COLD CHAIN EXCURSIONS</span>
          <div className="text-2xl font-bold text-[#00e5bc]">14.2°C Excursion</div>
          <p className="text-[11px] text-slate-400">ILR backup generator failure; batch quarantined.</p>
        </div>
      </div>

      {/* 2. Anomaly Feed Cards */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all text-xs font-mono space-y-3 ${
              item.reviewed
                ? 'bg-[#111722]/50 border-slate-800 opacity-80'
                : item.severity === 'critical'
                ? 'bg-[#111722] border-red-800/60 shadow-[0_0_15px_rgba(239,68,68,0.08)]'
                : 'bg-[#111722] border-amber-800/60'
            }`}
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">{item.id}</span>
                <span className="text-white font-bold text-sm tracking-tight">{item.anomalyType}</span>
                <StatusPill status={item.severity} size="sm" />
                {item.reviewed && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Reviewed &amp; Signed
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400">Timestamp: {item.timestamp}</span>
            </div>

            {/* Location & Medicine details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-[#0b0f17] border border-slate-800 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 block">FACILITY &amp; SECTOR:</span>
                <span className="text-white font-semibold">{item.phcName}</span>
                <span className="text-slate-400 block text-[10px]">{item.districtName}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">MEDICINE CODE:</span>
                <span className="text-teal-300 font-bold">{item.medicineName}</span>
                <span className="text-slate-500 block text-[10px]">[{item.medicineCode}]</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">ISOLATION FOREST SCORE:</span>
                <span className="text-red-400 font-bold">{item.isolationForestScore}</span>
                <span className="text-slate-400 block text-[10px]">Confidence: {item.confidenceScore}%</span>
              </div>
            </div>

            {/* Consumption Deviation Comparison */}
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-500 text-[10px]">Expected Baseline: </span>
                <span className="text-white font-bold">{item.expectedConsumption} units</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Reported Log: </span>
                <span className={item.deviationPercentage > 0 ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                  {item.reportedConsumption} units ({item.deviationPercentage > 0 ? `+${item.deviationPercentage}%` : `${item.deviationPercentage}%`})
                </span>
              </div>
            </div>

            {/* Notes & Audit Block */}
            {item.reviewerNotes && (
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Vigilance Notes:</span>
                {item.reviewerNotes}
              </div>
            )}

            {/* Review Flow Actions */}
            {!item.reviewed && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                {activeReviewId === item.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={reviewerNote}
                      onChange={(e) => setReviewerNote(e.target.value)}
                      placeholder="Enter verification notes (e.g. physical stock tallied, doctor confirmed)..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5bc]"
                    />
                    <button
                      onClick={() => handleReviewSubmit(item.id)}
                      className="px-3 py-1 rounded bg-[#00e5bc] text-[#0b0f17] font-bold text-xs"
                    >
                      Sign &amp; Submit
                    </button>
                    <button
                      onClick={() => setActiveReviewId(null)}
                      className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={() => {
                        setSelectedDistrictId(item.districtId);
                        openDrawer('district', item.districtId);
                      }}
                      className="text-[#00e5bc] hover:underline text-[11px] font-semibold"
                    >
                      Inspect District Telemetry →
                    </button>
                    <button
                      onClick={() => setActiveReviewId(item.id)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-[#00e5bc]" />
                      Mark Reviewed &amp; Resolve
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
