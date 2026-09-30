// 04 Resolve Shortage (Full Canvas Mode): The Signature Decision Surface
import React, { useState } from 'react';
import {
  GitMerge,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Clock,
  Layers,
  FileCheck2,
  Check,
} from 'lucide-react';
import { useResilienceStore } from '../../../store/useResilienceStore';
import { DecisionStep } from '../../../types/decision';

export const ResolveShortageScreen: React.FC = () => {
  const {
    getCurrentPHC,
    getDonorsList,
    getRecommendation,
    getGeminiExplanation,
    decisionStep,
    approveAllocation,
    rejectAllocation,
    connectionState,
    currentRole,
    setScreen,
  } = useResilienceStore();

  const [activeQuestion, setActiveQuestion] = useState<'why_donor' | 'why_not_more' | 'what_caused'>('why_donor');
  const [officerNote, setOfficerNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const phc = getCurrentPHC();
  const donors = getDonorsList();
  const recommendation = getRecommendation();
  const gemini = getGeminiExplanation();

  const isApprovalBlocked =
    connectionState === 'STALE_CRITICAL' ||
    connectionState === 'OFFLINE' ||
    connectionState === 'SOLVER_FAILURE' ||
    connectionState === 'NO_SAFE_DONOR' ||
    currentRole === 'auditor';

  const handleApprove = () => {
    approveAllocation(officerNote);
  };

  const handleReject = () => {
    if (!rejectReason) {
      alert('Statutory reason required to reject plan.');
      return;
    }
    rejectAllocation(rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <div className="space-y-4 select-none animate-in fade-in duration-200">
      {/* 1. Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--sage-700)] font-bold">
              Screen 04 · Action Layer · Decision Surface
            </span>
            <span className="text-[10px] font-mono text-[var(--ink-500)]">
              Multi-Commodity Linear Programming
            </span>
          </div>
          <h1 className="font-heading font-bold text-lg text-[var(--ink-900)] mt-0.5">
            Resolve Shortage — {phc.id} / {phc.primaryMedicine}
          </h1>
          <p className="text-xs text-[var(--ink-700)] mt-0.5 max-w-2xl">
            Calculates the optimal donor-to-receiver corridor that satisfies all clinical buffers, route viability, and cold-chain constraints before requesting officer authorization.
          </p>
        </div>

        {/* Solver Badge */}
        <div className="flex items-center gap-2 font-mono shrink-0">
          <div className="px-3 py-2 rounded-lg bg-[var(--sage-50)] border border-[var(--sage-200)] text-center">
            <span className="text-[10px] text-[var(--ink-500)] uppercase block">Solver Status</span>
            <span
              className={`font-bold text-sm ${
                recommendation.solverStatus === 'OPTIMAL'
                  ? 'text-[var(--status-healthy)]'
                  : 'text-[var(--status-critical)]'
              }`}
            >
              {recommendation.solverStatus}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Failure State Warning Banners */}
      {connectionState === 'STALE_CRITICAL' && (
        <div className="p-3.5 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--status-critical)] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[var(--status-critical)] font-heading block">
              APPROVAL BLOCKED: Stale Critical Input
            </span>
            <p className="text-[var(--ink-900)] mt-0.5 leading-relaxed">
              Target facility reporting age is {phc.freshnessMinutes}m old (&gt;4 hours). You cannot legally authorize physical medicine transfers on stale unconfirmed telemetry.
            </p>
          </div>
        </div>
      )}

      {connectionState === 'NO_SAFE_DONOR' && (
        <div className="p-3.5 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[var(--status-critical)] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[var(--status-critical)] font-heading block">
              NO SAFE DONOR AVAILABLE
            </span>
            <p className="text-[var(--ink-900)] mt-0.5 leading-relaxed">
              District-wide epidemic surge has consumed all surplus buffers. Donating from any local PHC would breach their mandatory reserve. Residual shortage: 410 units.
            </p>
          </div>
        </div>
      )}

      {connectionState === 'SOLVER_FAILURE' && (
        <div className="p-3.5 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-start gap-3">
          <XCircle className="w-5 h-5 text-[var(--status-critical)] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[var(--status-critical)] font-heading block">
              SOLVER FAILED: Route Infeasible
            </span>
            <p className="text-[var(--ink-900)] mt-0.5 leading-relaxed">
              Bridge washed out at Chakan tributary. Cold transit duration exceeds maximum allowable 4-hour window. The deterministic solver refused to fabricate a recommendation.
            </p>
          </div>
        </div>
      )}

      {/* 3. Section A: Need Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
          <span className="text-[10px] font-mono text-[var(--ink-500)] uppercase block">Current Stock</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono font-bold text-2xl text-[var(--ink-900)]">{phc.currentStock}</span>
            <span className="text-xs text-[var(--ink-500)] font-mono">units</span>
          </div>
          <span className="text-xs font-mono text-[var(--ink-500)] block mt-1">
            Coverage: {phc.coverageDays} days left
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
          <span className="text-[10px] font-mono text-[var(--ink-500)] uppercase block">15-Day Demand Forecast</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono font-bold text-2xl text-[var(--ink-900)]">{phc.forecastDemand15d}</span>
            <span className="text-xs text-[var(--ink-500)] font-mono">units</span>
          </div>
          <span className="text-xs font-mono text-[var(--status-critical)] block mt-1 font-semibold">
            +42% pediatric ARI surge
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] shadow-xs">
          <span className="text-[10px] font-mono text-[var(--status-critical)] uppercase font-bold block">
            Net Deficit Shortage
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono font-bold text-2xl text-[var(--status-critical)]">{phc.shortageUnits}</span>
            <span className="text-xs text-[var(--status-critical)] font-mono font-medium">units needed</span>
          </div>
          <span className="text-xs font-mono text-[var(--status-critical)] block mt-1 font-medium">
            Depletion in 4.0 days
          </span>
        </div>
      </div>

      {/* 4. Section B: Evaluated Donor Candidates (Comparison Table) */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-xs text-[var(--ink-900)]">
              Evaluated Donor Candidates (Radius &le; 50 km)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--sage-100)] text-[var(--ink-700)]">
              {donors.length} Analyzed
            </span>
          </div>
          <span className="text-[11px] text-[var(--ink-500)] font-mono">
            Safety Rule: Retained stock &gt; 10d demand
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--paper-50)] text-[10px] font-mono uppercase tracking-wider text-[var(--ink-700)]">
                <th className="py-2.5 px-4 font-semibold">Facility</th>
                <th className="py-2.5 px-4 font-semibold">Current Stock</th>
                <th className="py-2.5 px-4 font-semibold">Min Buffer</th>
                <th className="py-2.5 px-4 font-semibold">Surplus Available</th>
                <th className="py-2.5 px-4 font-semibold">Distance / Transit</th>
                <th className="py-2.5 px-4 font-semibold">Feasibility</th>
                <th className="py-2.5 px-4 font-semibold">Algorithmic Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/60 font-mono">
              {donors.map((d) => (
                <tr key={d.id} className="hover:bg-[var(--card-hover)] transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--ink-900)]">{d.phcName}</td>
                  <td className="py-3 px-4">{d.currentStock} u</td>
                  <td className="py-3 px-4 text-[var(--ink-500)]">{d.minBuffer} u</td>
                  <td className="py-3 px-4 font-bold text-[var(--sage-700)]">{d.surplusAvailable} u</td>
                  <td className="py-3 px-4 text-[var(--ink-700)]">{d.distanceKm} km ({d.transitMinutes}m)</td>
                  <td className="py-3 px-4">
                    {d.isSafe ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--status-healthy-bg)] text-[var(--status-healthy)] border border-[var(--status-healthy-border)]">
                        <CheckCircle2 className="w-3 h-3" /> SAFE: YES
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--status-critical-bg)] text-[var(--status-critical)] border border-[var(--status-critical-border)]">
                        <XCircle className="w-3 h-3" /> SAFE: NO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans text-[11px] text-[var(--ink-700)] max-w-xs leading-snug">
                    {d.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Section C: Constrained Recommendation + 4 Constraint Checks */}
      <div className="p-4 rounded-xl border border-[var(--sage-600)]/40 bg-[var(--sage-50)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--sage-200)] pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--sage-700)]" />
            <div>
              <h3 className="font-heading font-bold text-sm text-[var(--sage-800)] uppercase tracking-wide">
                Optimal Reallocation Corridor
              </h3>
              <p className="text-[11px] text-[var(--ink-500)] font-mono">
                {recommendation.corridor} · Validated by OR-Tools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span>Residual Shortage: <strong className="text-[var(--status-healthy)] font-bold">{recommendation.residualShortage} units</strong></span>
            <span>Est. Cost: ₹{recommendation.estLogisticsCostINR}</span>
            <span>CO₂: {recommendation.estCo2Kg} kg</span>
          </div>
        </div>

        {/* Transfer Visualization */}
        <div className="p-3.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[10px] text-[var(--ink-500)] uppercase block">Origin Donor</span>
            <span className="font-bold text-sm text-[var(--ink-900)]">{recommendation.donorName}</span>
            <span className="text-[10px] text-[var(--status-healthy)] block">560 units retained post-transfer</span>
          </div>

          <div className="flex flex-col items-center px-4">
            <span className="text-[10px] text-[var(--sage-700)] font-bold uppercase mb-0.5">
              Transfer Amount
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--sage-100)] text-[var(--sage-800)] font-bold text-sm">
              <ArrowRight className="w-4 h-4" />
              <span>{recommendation.transferQuantity} Units Amoxicillin</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--ink-500)] mt-0.5">
              ETA: {recommendation.transitMinutes} min via NH-48 Cold Van
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[var(--ink-500)] uppercase block">Destination Receiver</span>
            <span className="font-bold text-sm text-[var(--ink-900)]">{recommendation.receiverName}</span>
            <span className="text-[10px] text-[var(--status-healthy)] block">Deficit eliminated completely</span>
          </div>
        </div>

        {/* The 4 Verifiable Constraint Checks */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-700)] font-bold flex items-center justify-between">
            <span>Verifiable Constraint Checks (Required Before Approval)</span>
            <span className="text-[var(--sage-700)]">4/4 Validated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendation.constraints.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-lg border text-xs flex items-start justify-between ${
                  c.passed
                    ? 'bg-[var(--card-bg)] border-[var(--card-border)]'
                    : 'bg-[var(--status-critical-bg)] border-[var(--status-critical-border)]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {c.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--status-healthy)] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[var(--status-critical)] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-[var(--ink-900)] block">{c.name}</span>
                    <p className="text-[11px] text-[var(--ink-500)] mt-0.5 leading-snug">
                      {c.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3 font-mono text-[11px]">
                  <span
                    className={`font-bold block ${
                      c.passed ? 'text-[var(--status-healthy)]' : 'text-[var(--status-critical)]'
                    }`}
                  >
                    {c.metricValue}
                  </span>
                  <span className="text-[var(--ink-300)] text-[10px]">{c.thresholdValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Section D: Grounded Gemini Explanation Card */}
      {gemini && (
        <div className="p-4 rounded-xl border border-[var(--cream-100)] bg-[var(--cream-50)] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--sage-200)]/60 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--status-warning)]" />
              <h3 className="font-heading font-bold text-xs uppercase tracking-wide text-[var(--ink-900)]">
                Explainable AI Synthesis (Google Gemini Grounded Brief)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--ink-700)]">
              Model Confidence: {gemini.confidenceScore}%
            </span>
          </div>

          {/* Quick Questions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveQuestion('why_donor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeQuestion === 'why_donor'
                  ? 'bg-[var(--card-bg)] text-[var(--ink-900)] border-[var(--sage-600)] shadow-xs font-semibold'
                  : 'bg-[var(--cream-100)] text-[var(--ink-700)] border-transparent hover:bg-[var(--card-bg)]'
              }`}
            >
              Why this donor?
            </button>
            <button
              onClick={() => setActiveQuestion('why_not_more')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeQuestion === 'why_not_more'
                  ? 'bg-[var(--card-bg)] text-[var(--ink-900)] border-[var(--sage-600)] shadow-xs font-semibold'
                  : 'bg-[var(--cream-100)] text-[var(--ink-700)] border-transparent hover:bg-[var(--card-bg)]'
              }`}
            >
              Why not more?
            </button>
            <button
              onClick={() => setActiveQuestion('what_caused')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeQuestion === 'what_caused'
                  ? 'bg-[var(--card-bg)] text-[var(--ink-900)] border-[var(--sage-600)] shadow-xs font-semibold'
                  : 'bg-[var(--cream-100)] text-[var(--ink-700)] border-transparent hover:bg-[var(--card-bg)]'
              }`}
            >
              What caused this risk?
            </button>
          </div>

          {/* Answer Box */}
          <div className="p-3.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--ink-700)] leading-relaxed">
            {activeQuestion === 'why_donor' && (
              <p>
                <strong className="text-[var(--ink-900)]">Why Baramati (PHC 072): </strong>
                {gemini.whyThisDonor}
              </p>
            )}
            {activeQuestion === 'why_not_more' && (
              <p>
                <strong className="text-[var(--ink-900)]">Capacity Limitation: </strong>
                {gemini.whyNotMore}
              </p>
            )}
            {activeQuestion === 'what_caused' && (
              <p>
                <strong className="text-[var(--ink-900)]">Epidemiological Spike: </strong>
                {gemini.whatCausedRisk}
              </p>
            )}
          </div>

          <div className="text-[10px] text-[var(--ink-500)] font-mono flex items-center justify-between pt-1">
            <span>Standard: {gemini.regulatoryCompliance}</span>
            <span className="text-[var(--sage-700)] font-bold">Cold Chain Audit: PQS Certified</span>
          </div>
        </div>
      )}

      {/* 7. Section E: Statutory Human Authorization Bar */}
      <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--surface-elevated)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[var(--sage-700)]" />
            <div>
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--ink-900)]">
                Statutory Officer Sign-off &amp; Dispatch Order
              </h3>
              <p className="text-[11px] text-[var(--ink-500)]">
                Role: {currentRole.replace('_', ' ').toUpperCase()} · Immutable record committed to audit chain
              </p>
            </div>
          </div>

          {decisionStep === 'APPROVED' && (
            <span className="px-3 py-1 rounded-md bg-[var(--status-healthy)] text-white text-xs font-bold font-mono">
              APPROVED &amp; DISPATCHED
            </span>
          )}
          {decisionStep === 'REJECTED' && (
            <span className="px-3 py-1 rounded-md bg-[var(--status-critical)] text-white text-xs font-bold font-mono">
              REJECTED
            </span>
          )}
        </div>

        {decisionStep === 'APPROVED' ? (
          <div className="p-3 rounded-lg bg-[var(--status-healthy-bg)] border border-[var(--status-healthy-border)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--status-healthy)]" />
              <span>
                Dispatch Order <strong>#DSP-2026-0914-184</strong> signed. Carrier vehicle #MH-12-CZ-4412 dispatched.
              </span>
            </div>
            <button
              onClick={() => setScreen('audit')}
              className="px-3 py-1.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-mono font-semibold text-[var(--sage-700)] hover:underline"
            >
              Inspect Audit Timeline &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] block mb-1">
                Executive Authorization Note
              </label>
              <input
                type="text"
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="e.g. Priority corridor approved via NH-48; local medical superintendent notified."
                className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-xs text-[var(--ink-900)] placeholder:text-[var(--ink-300)] focus:ring-1 focus:ring-[var(--sage-600)]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={currentRole === 'auditor'}
                className="px-4 py-2 rounded-lg border border-[var(--status-critical-border)] bg-[var(--card-bg)] text-[var(--status-critical)] hover:bg-[var(--status-critical-bg)] text-xs font-semibold transition-colors disabled:opacity-40"
              >
                Reject Proposed Plan
              </button>

              <button
                onClick={handleApprove}
                disabled={isApprovalBlocked}
                className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors ${
                  isApprovalBlocked
                    ? 'bg-[var(--sage-200)] text-[var(--ink-500)] cursor-not-allowed opacity-60'
                    : 'bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Authorize &amp; Dispatch 420 Units</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-elevated p-5 space-y-3">
            <h3 className="font-heading font-semibold text-sm text-[var(--ink-900)]">
              Statutory Rejection Rationale
            </h3>
            <p className="text-xs text-[var(--ink-700)] leading-relaxed">
              Every rejection requires an operational explanation that is cryptographically sealed into the official audit bundle.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Inclement weather warning issued for Baramati corridor."
              className="w-full p-2.5 rounded-lg border border-[var(--card-border)] text-xs bg-[var(--paper-50)] text-[var(--ink-900)] focus:ring-1 focus:ring-[var(--sage-600)]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs text-[var(--ink-700)] hover:bg-[var(--sage-100)] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-1.5 text-xs bg-[var(--status-critical)] text-white rounded-md font-medium hover:opacity-90"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
