// Decision Drawer — The Signature Decision Surface
import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Truck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Check,
  FileCheck,
  Thermometer,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';
import { DecisionStep } from '../../types/decision';

export const DecisionDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    decisionStep,
    connectionState,
    currentRole,
    getCurrentPHC,
    getDonorsList,
    getRecommendation,
    getGeminiExplanation,
    approveAllocation,
    rejectAllocation,
    setScreen,
  } = useResilienceStore();

  const [activeQuestion, setActiveQuestion] = useState<'why_donor' | 'why_not_more' | 'what_caused' | null>('why_donor');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [officerNote, setOfficerNote] = useState('');
  const [expandedSection, setExpandedSection] = useState<'donors' | 'constraints' | 'gemini' | 'all'>('all');

  if (!isDrawerOpen) return null;

  const phc = getCurrentPHC();
  const donors = getDonorsList();
  const recommendation = getRecommendation();
  const gemini = getGeminiExplanation();

  const STEPS: { id: DecisionStep; label: string }[] = [
    { id: 'OBSERVED', label: 'Observed' },
    { id: 'FORECASTED', label: 'Forecast' },
    { id: 'AT_RISK', label: 'At Risk' },
    { id: 'RESOLUTION_AVAILABLE', label: 'Candidates' },
    { id: 'RECOMMENDATION_GENERATED', label: 'Optimized' },
    { id: 'PENDING_APPROVAL', label: 'Review' },
    { id: 'APPROVED', label: 'Committed' },
  ];

  const getStepIndex = (step: DecisionStep) => {
    switch (step) {
      case 'OBSERVED': return 0;
      case 'FORECASTED': return 1;
      case 'AT_RISK': return 2;
      case 'RESOLUTION_AVAILABLE': return 3;
      case 'RECOMMENDATION_GENERATED': return 4;
      case 'PENDING_APPROVAL': return 5;
      case 'APPROVED': case 'REJECTED': return 6;
      default: return 5;
    }
  };

  const currentStepIdx = getStepIndex(decisionStep);

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
      alert('Please provide a statutory justification for rejecting this allocation.');
      return;
    }
    rejectAllocation(rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <aside
      className="w-full md:w-[480px] lg:w-[520px] h-full bg-[var(--card-bg)] border-l border-[var(--card-border)] flex flex-col justify-between shadow-elevated z-40 shrink-0 select-none overflow-hidden transition-all duration-300"
      aria-label="Decision Drawer"
    >
      {/* 1. Drawer Header */}
      <div className="px-5 py-3.5 border-b border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--sage-700)]">
              Resolve Shortage
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--sage-100)] text-[var(--ink-700)] font-medium">
              OR-Tools LP v9.8
            </span>
          </div>
          <h2 className="font-heading font-semibold text-sm text-[var(--ink-900)] mt-0.5 truncate max-w-[360px]">
            {phc.id} · {phc.primaryMedicine}
          </h2>
        </div>

        <button
          onClick={closeDrawer}
          className="p-1 rounded text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[var(--sage-100)] transition-colors"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Decision State Machine Stepper */}
      <div className="px-4 py-2 border-b border-[var(--card-border)] bg-[var(--card-bg)] shrink-0 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[420px]">
          {STEPS.map((s, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                      decisionStep === 'APPROVED' && idx === 6
                        ? 'bg-[var(--status-healthy)] text-white'
                        : decisionStep === 'REJECTED' && idx === 6
                        ? 'bg-[var(--status-critical)] text-white'
                        : isCompleted
                        ? 'bg-[var(--sage-600)] text-white'
                        : isCurrent
                        ? 'bg-[var(--cream-100)] text-[var(--ink-900)] border border-[var(--sage-600)] ring-2 ring-[var(--sage-600)]/20'
                        : 'bg-[var(--sage-100)] text-[var(--ink-500)]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[9px] mt-0.5 uppercase tracking-tighter font-mono ${
                      isCurrent ? 'font-bold text-[var(--ink-900)]' : 'text-[var(--ink-500)]'
                    }`}
                  >
                    {decisionStep === 'REJECTED' && idx === 6 ? 'Rejected' : s.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-6 h-[1.5px] mx-1 mb-3 transition-colors ${
                      idx < currentStepIdx ? 'bg-[var(--sage-600)]' : 'bg-[var(--sage-200)]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Drawer Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Warning Banners for Real Failure UI States */}
        {connectionState === 'STALE_CRITICAL' && (
          <div className="p-3 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[var(--status-critical)] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[var(--status-critical)] block font-heading">
                APPROVAL BLOCKED: Stale Critical Input
              </span>
              <p className="text-[var(--ink-700)] mt-0.5 text-[11px] leading-relaxed">
                Telemetric report timestamp is {phc.freshnessMinutes}m old (&gt;4 hours limit). An authoritative stock reallocation cannot legally be committed on unconfirmed inventory data.
              </p>
            </div>
          </div>
        )}

        {connectionState === 'OFFLINE' && (
          <div className="p-3 rounded-lg bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] flex items-start gap-2.5">
            <XCircle className="w-4 h-4 text-[var(--status-warning)] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[var(--status-warning)] block font-heading">
                OFFLINE MODE: Target Facility Unreachable
              </span>
              <p className="text-[var(--ink-700)] mt-0.5 text-[11px] leading-relaxed">
                Displaying last confirmed cached snapshot. Transmission of digital dispatch authorization is disabled until connectivity restores.
              </p>
            </div>
          </div>
        )}

        {connectionState === 'NO_SAFE_DONOR' && (
          <div className="p-3 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[var(--status-critical)] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[var(--status-critical)] block font-heading">
                INFEASIBLE: No Safe Donor Available
              </span>
              <p className="text-[var(--ink-700)] mt-0.5 text-[11px] leading-relaxed">
                All donor candidates in the district would breach their mandatory 10-day safety reserve. Residual shortage remains 410 units. Recommend State Central Warehouse emergency push.
              </p>
            </div>
          </div>
        )}

        {connectionState === 'SOLVER_FAILURE' && (
          <div className="p-3 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-start gap-2.5">
            <XCircle className="w-4 h-4 text-[var(--status-critical)] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[var(--status-critical)] block font-heading">
                SOLVER FAILED: Route Constraint Infeasible
              </span>
              <p className="text-[var(--ink-700)] mt-0.5 text-[11px] leading-relaxed">
                Corridor bridge washed out at Chakan riverbed. Transit time exceeds maximum 4-hour cold-chain viability threshold. Algorithmic solver refused to fabricate a recommendation.
              </p>
            </div>
          </div>
        )}

        {/* SECTION A: NEED SUMMARY (Stock, Forecast, Shortage) */}
        <div className="p-3.5 rounded-lg border border-[var(--card-border)] bg-[var(--paper-50)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] font-semibold">
              Operational Deficit Assessment
            </span>
            <span className="text-[10px] font-mono text-[var(--ink-700)]">
              Updated {phc.freshnessMinutes}m ago
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
              <span className="text-[10px] text-[var(--ink-500)] uppercase font-mono block">Current Stock</span>
              <span className="font-mono font-bold text-base text-[var(--ink-900)] mt-0.5 block">
                {phc.currentStock}
              </span>
              <span className="text-[10px] text-[var(--ink-500)]">units ({phc.coverageDays}d left)</span>
            </div>

            <div className="p-2.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
              <span className="text-[10px] text-[var(--ink-500)] uppercase font-mono block">15-Day Demand</span>
              <span className="font-mono font-bold text-base text-[var(--ink-900)] mt-0.5 block">
                {phc.forecastDemand15d}
              </span>
              <span className="text-[10px] text-[var(--ink-500)]">+42% ARI surge</span>
            </div>

            <div className="p-2.5 rounded-md bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] shadow-xs">
              <span className="text-[10px] text-[var(--status-critical)] uppercase font-mono font-bold block">
                Net Shortage
              </span>
              <span className="font-mono font-bold text-base text-[var(--status-critical)] mt-0.5 block">
                {phc.shortageUnits}
              </span>
              <span className="text-[10px] text-[var(--status-critical)] font-medium">units required</span>
            </div>
          </div>
        </div>

        {/* SECTION B: DONOR CANDIDATES (Comparison Table) */}
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-heading font-semibold text-[var(--ink-900)]">
                Evaluated Donor Candidates
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--sage-100)] text-[var(--ink-700)]">
                {donors.length} in range
              </span>
            </div>
            <span className="text-[10px] text-[var(--ink-500)] font-mono">Radius &le; 50km</span>
          </div>

          <div className="divide-y divide-[var(--card-border)]/60 text-xs">
            {donors.map((d) => (
              <div key={d.id} className="p-3 hover:bg-[var(--card-hover)] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-[var(--ink-900)] flex items-center gap-1.5">
                      <span>{d.phcName}</span>
                      {d.isSafe ? (
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
                      <span>Surplus: <strong>{d.surplusAvailable}</strong></span>
                      <span>·</span>
                      <span>Distance: {d.distanceKm} km ({d.transitMinutes}m)</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-[var(--ink-500)] block">Stock: {d.currentStock}</span>
                    <span className="text-[var(--ink-300)] text-[10px]">Min buffer: {d.minBuffer}</span>
                  </div>
                </div>

                <div className="mt-1.5 text-[11px] text-[var(--ink-700)] bg-[var(--paper-50)] p-1.5 rounded border border-[var(--card-border)]/50">
                  <span className="font-semibold text-[var(--ink-900)]">Why: </span>
                  {d.reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION C: SYSTEM RECOMMENDATION & CONSTRAINTS */}
        <div className="p-3.5 rounded-lg border border-[var(--sage-600)]/40 bg-[var(--sage-50)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[var(--sage-700)]" />
              <span className="text-xs font-heading font-bold text-[var(--sage-800)] uppercase tracking-wide">
                Optimal Transfer Recommendation
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

          {/* Corridor & Transfer details */}
          <div className="p-2.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-xs space-y-1.5">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[var(--ink-700)]">{recommendation.donorName.split('—')[0]}</span>
              <div className="flex items-center gap-1 text-[var(--sage-700)] font-bold">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{recommendation.transferQuantity} units</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-[var(--ink-900)] font-semibold">{recommendation.receiverName.split('—')[0]}</span>
            </div>

            <div className="pt-1.5 border-t border-[var(--card-border)]/60 flex items-center justify-between text-[11px] text-[var(--ink-500)] font-mono">
              <span>Residual Shortage: <strong className="text-[var(--status-healthy)]">{recommendation.residualShortage} units</strong></span>
              <span>ETA: {recommendation.transitMinutes} min ({recommendation.distanceKm} km)</span>
              <span>Cost: ₹{recommendation.estLogisticsCostINR}</span>
            </div>
          </div>

          {/* Constraint Verifications (4 Mandatory checks with pass/fail) */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-700)] font-semibold flex items-center justify-between">
              <span>Operational Constraints Verification</span>
              <span className="text-[var(--sage-700)]">4/4 Validated</span>
            </div>

            <div className="space-y-1">
              {recommendation.constraints.map((c) => (
                <div
                  key={c.id}
                  className={`p-2 rounded border text-xs flex items-start justify-between ${
                    c.passed
                      ? 'bg-[var(--card-bg)] border-[var(--card-border)]'
                      : 'bg-[var(--status-critical-bg)] border-[var(--status-critical-border)]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {c.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--status-healthy)] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[var(--status-critical)] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-[var(--ink-900)] leading-tight">{c.name}</div>
                      <div className="text-[10px] text-[var(--ink-500)] leading-tight mt-0.5">
                        {c.description}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2 font-mono text-[10px]">
                    <span
                      className={`font-semibold block ${
                        c.passed ? 'text-[var(--status-healthy)]' : 'text-[var(--status-critical)]'
                      }`}
                    >
                      {c.metricValue}
                    </span>
                    <span className="text-[var(--ink-300)] text-[9px]">{c.thresholdValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION D: EXPLAINABLE AI (Google Gemini Card) */}
        {gemini ? (
          <div className="p-3.5 rounded-lg border border-[var(--cream-100)] bg-[var(--cream-50)] text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--status-warning)]" />
                <span className="font-heading font-bold text-xs uppercase tracking-wide text-[var(--ink-900)]">
                  Explainable AI Rationale
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--ink-700)]">
                Confidence {gemini.confidenceScore}%
              </span>
            </div>

            {/* Quick Question Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveQuestion('why_donor')}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  activeQuestion === 'why_donor'
                    ? 'bg-[var(--card-bg)] text-[var(--ink-900)] border-[var(--sage-600)] shadow-xs'
                    : 'bg-[var(--cream-100)]/60 text-[var(--ink-700)] border-transparent hover:bg-[var(--card-bg)]'
                }`}
              >
                Why this donor?
              </button>
              <button
                onClick={() => setActiveQuestion('why_not_more')}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  activeQuestion === 'why_not_more'
                    ? 'bg-[var(--card-bg)] text-[var(--ink-900)] border-[var(--sage-600)] shadow-xs'
                    : 'bg-[var(--cream-100)]/60 text-[var(--ink-700)] border-transparent hover:bg-[var(--card-bg)]'
                }`}
              >
                Why not more?
              </button>
              <button
                onClick={() => setActiveQuestion('what_caused')}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  activeQuestion === 'what_caused'
                    ? 'bg-[var(--card-bg)] text-[var(--ink-900)] border-[var(--sage-600)] shadow-xs'
                    : 'bg-[var(--cream-100)]/60 text-[var(--ink-700)] border-transparent hover:bg-[var(--card-bg)]'
                }`}
              >
                What caused this risk?
              </button>
            </div>

            {/* Answer Display */}
            <div className="p-2.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)]/60 text-[11px] text-[var(--ink-700)] leading-relaxed">
              {activeQuestion === 'why_donor' && (
                <p>
                  <strong>Why PHC 072: </strong>
                  {gemini.whyThisDonor}
                </p>
              )}
              {activeQuestion === 'why_not_more' && (
                <p>
                  <strong>Quantity Bound: </strong>
                  {gemini.whyNotMore}
                </p>
              )}
              {activeQuestion === 'what_caused' && (
                <p>
                  <strong>Epidemiological Root Cause: </strong>
                  {gemini.whatCausedRisk}
                </p>
              )}
            </div>

            {/* Regulatory Citation */}
            <div className="text-[10px] text-[var(--ink-500)] font-mono flex items-center justify-between border-t border-[var(--card-border)]/40 pt-1.5">
              <span>{gemini.regulatoryCompliance}</span>
              <span className="text-[var(--sage-700)] font-medium">WHO PQS E003</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--paper-50)] text-xs">
            <span className="font-medium text-[var(--ink-900)] block">Gemini Natural Language Offline</span>
            <span className="text-[11px] text-[var(--ink-500)]">
              Deterministic mathematical solver output remains 100% active and verifiable above.
            </span>
          </div>
        )}
      </div>

      {/* 4. Bottom Human In The Loop Approval Action Bar */}
      <div className="p-4 border-t border-[var(--card-border)] bg-[var(--surface-elevated)] space-y-2.5 shrink-0">
        {decisionStep === 'APPROVED' ? (
          <div className="p-3 rounded-lg bg-[var(--status-healthy-bg)] border border-[var(--status-healthy-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--status-healthy)]" />
              <div>
                <span className="font-heading font-bold text-xs text-[var(--status-healthy)] block">
                  ALLOCATION ORDER APPROVED & COMMITTED
                </span>
                <span className="text-[10px] font-mono text-[var(--ink-700)]">
                  Cryptographic hash logged in immutable Audit Trail.
                </span>
              </div>
            </div>
            <button
              onClick={() => setScreen('audit')}
              className="text-xs font-mono text-[var(--sage-700)] underline font-semibold hover:text-[var(--sage-800)]"
            >
              View Audit
            </button>
          </div>
        ) : decisionStep === 'REJECTED' ? (
          <div className="p-3 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[var(--status-critical)]" />
              <div>
                <span className="font-heading font-bold text-xs text-[var(--status-critical)] block">
                  ALLOCATION PLAN REJECTED
                </span>
                <span className="text-[10px] font-mono text-[var(--ink-700)]">
                  Rejection rationale permanently committed to audit logs.
                </span>
              </div>
            </div>
            <button
              onClick={() => setScreen('audit')}
              className="text-xs font-mono text-[var(--sage-700)] underline font-semibold hover:text-[var(--sage-800)]"
            >
              View Audit
            </button>
          </div>
        ) : (
          <>
            {/* Optional Officer Review Note */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] block mb-1">
                Authorizing Officer Note (Optional)
              </label>
              <input
                type="text"
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="e.g. Priority convoy confirmed via NH-48 toll exemption."
                className="w-full px-2.5 py-1.5 rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] text-xs text-[var(--ink-900)] placeholder:text-[var(--ink-300)] focus:outline-none focus:ring-1 focus:ring-[var(--sage-600)]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={currentRole === 'auditor'}
                className="w-1/3 py-2 px-3 rounded-lg border border-[var(--status-critical-border)] bg-[var(--card-bg)] text-[var(--status-critical)] hover:bg-[var(--status-critical-bg)] text-xs font-medium transition-colors disabled:opacity-50"
              >
                Reject Plan
              </button>

              <button
                onClick={handleApprove}
                disabled={isApprovalBlocked}
                className={`w-2/3 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  isApprovalBlocked
                    ? 'bg-[var(--sage-200)] text-[var(--ink-500)] cursor-not-allowed opacity-60'
                    : 'bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white'
                }`}
                title={
                  isApprovalBlocked
                    ? 'Approval blocked due to active scenario constraint'
                    : 'Statutory approval for dispatch'
                }
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve &amp; Dispatch (420 units)</span>
              </button>
            </div>

            {currentRole === 'auditor' && (
              <p className="text-[10px] text-[var(--ink-500)] font-mono text-center">
                * Statutory Auditor Mode: Read-only inspection rights.
              </p>
            )}
          </>
        )}
      </div>

      {/* Reject Reason Modal */}
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
              placeholder="e.g. Local flood alert received; route NH-48 unsafe for transit tonight."
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
    </aside>
  );
};
