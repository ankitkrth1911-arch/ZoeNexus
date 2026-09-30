// Judge Walkthrough Assistant (60-Second Guided Tour for Hackathon Judges)
import React from 'react';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Brain,
  FileCheck2,
  ArrowRight,
  Network,
  Activity,
  AlertTriangle,
  GitMerge,
  BarChart3,
} from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';

interface TourStepContent {
  stepNumber: number;
  screenTitle: string;
  questionAnswered: string;
  badge: string;
  judgeKeyInsight: string;
  technicalMechanism: string;
  actionPrompt: string;
}

const TOUR_STEPS: TourStepContent[] = [
  {
    stepNumber: 1,
    screenTitle: '01 Network Pulse',
    questionAnswered: 'Where is the problem across the district?',
    badge: 'SCAN LAYER',
    judgeKeyInsight:
      'The command canvas immediately highlights operational exceptions before clicking any facility. PHC 184 (Shirur) pulses in critical red because its coverage has dropped below 4 days, while PHC 072 (Baramati) shows safe surplus.',
    technicalMechanism:
      'Telemetry aggregates daily consumption, local stock counts, and bed occupancy from all 98 district PHCs with data-freshness timestamps.',
    actionPrompt: 'Click on PHC 184 to focus its contextual metrics.'
  },
  {
    stepNumber: 2,
    screenTitle: '02 Risk Radar',
    questionAnswered: 'Which PHC needs attention first?',
    badge: 'PRIORITIZATION',
    judgeKeyInsight:
      'Exception-first operational triage queue. Instead of forcing the officer to hunt through hundreds of tables, risks are ranked by Days of Coverage Left.',
    technicalMechanism:
      'Early-warning risk classifier flags acute stock depletion thresholds (<5.0 days) and identifies candidate donors with surplus buffers.',
    actionPrompt: 'Observe PHC 184 at top of queue with 3.8 days coverage.'
  },
  {
    stepNumber: 3,
    screenTitle: '03 PHC Workspace',
    questionAnswered: 'Why is this specific PHC at risk?',
    badge: 'UNDERSTAND LAYER',
    judgeKeyInsight:
      'Decision evidence in human context: Stock (420) sits directly next to 15-Day Demand (830) revealing a 410-unit deficit. Capacity data (18/24 beds) explains why: a 42% pediatric ARI surge caused the depletion.',
    technicalMechanism:
      'Edge XGBoost model trained with Differential Privacy predicts 15-day forward demand curves with 95.7% accuracy and confidence bands.',
    actionPrompt: 'Click "Open Resolve Shortage" to inspect the allocation plan.'
  },
  {
    stepNumber: 4,
    screenTitle: '04 Resolve: Donor Candidates',
    questionAnswered: 'Where can we safely source the required medicine?',
    badge: 'ACTION LAYER',
    judgeKeyInsight:
      'Evaluates nearby facilities within a 50km radius. Critically, PHC 115 is rejected because donating would deplete its own reserve below statutory safety standards. PHC 072 is safe because it maintains 14.8 days coverage post-transfer.',
    technicalMechanism:
      'Multi-commodity constraint evaluation guarantees no donor is pushed into secondary risk.',
    actionPrompt: 'Review the SAFE: YES vs SAFE: NO comparison table.'
  },
  {
    stepNumber: 5,
    screenTitle: '04 Resolve: Mathematical Optimization',
    questionAnswered: 'Can I verify all constraints before approving?',
    badge: 'DETERMINISTIC SOLVER',
    judgeKeyInsight:
      'The OR-Tools solver recommends: Transfer exactly 420 units from PHC 072 → PHC 184. Residual shortage is reduced to 0 units. Transit is 42 min via NH-48.',
    technicalMechanism:
      '4 verifiable constraint checks (Donor Safety, Receiver Need, Route Feasibility, and Active Cold Chain) must ALL pass.',
    actionPrompt: 'Inspect the 4/4 passed constraint badges.'
  },
  {
    stepNumber: 6,
    screenTitle: '04 Resolve: Grounded Gemini Explanation',
    questionAnswered: 'Why this donor and not another?',
    badge: 'EXPLAINABLE AI',
    judgeKeyInsight:
      'Google Gemini synthesizes a plain-language briefing grounded exclusively in structured solver outputs. It never invents medicine numbers or routes.',
    technicalMechanism:
      'Few-shot prompt grounded in IPHS 2022 standards and WHO PQS cold-chain storage parameters.',
    actionPrompt: 'Click "Why not more?" to see capacity bounds explanation.'
  },
  {
    stepNumber: 7,
    screenTitle: '04 Resolve: Human-in-the-Loop Sign-off',
    questionAnswered: 'Who authorizes the transfer and takes statutory responsibility?',
    badge: 'GOVERNANCE',
    judgeKeyInsight:
      'AI proposes; the authorized District Health Officer decides. Stale inputs (>4h) or offline facilities physically block the button to prevent erroneous dispatches.',
    technicalMechanism:
      'Role-based permission matrix enforces statutory accountability.',
    actionPrompt: 'Click "Approve & Dispatch" to generate the dispatch order.'
  },
  {
    stepNumber: 8,
    screenTitle: '07 Audit Trail',
    questionAnswered: 'Can we reconstruct and verify this decision later?',
    badge: 'IMMUTABLE PROOF',
    judgeKeyInsight:
      'Every single step — input snapshot, risk trigger, solver run, explanation, and human sign-off — is permanently recorded with SHA-256 state hashes and model versions.',
    technicalMechanism:
      'Cryptographically linked audit bundle ready for statutory health ministry export.',
    actionPrompt: 'Notice the SHA-256 state hash for the approval event.'
  },
  {
    stepNumber: 9,
    screenTitle: '05 Federation & Emergency Resilience',
    questionAnswered: 'How does the model learn without pooling patient data?',
    badge: 'FEDERATED INTELLIGENCE',
    judgeKeyInsight:
      'Raw patient health records stay 100% on the local PHC clinic server. Only differential-private model gradients cross the perimeter to create Global Model v75.',
    technicalMechanism:
      'Differential Privacy budget (ε = 1.84) ensures zero sensitive patient telemetry leakage across borders.',
    actionPrompt: 'Inspect the strict Federation Perimeter boundary diagram.'
  }
];

export const JudgeWalkthroughModal: React.FC = () => {
  const { isTourOpen, closeTour, tourStep, nextTourStep, prevTourStep, jumpToTourStep } =
    useResilienceStore();

  if (!isTourOpen) return null;

  const current = TOUR_STEPS[tourStep] || TOUR_STEPS[0];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-elevated overflow-hidden flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--cream-100)] border border-[var(--sage-200)] flex items-center justify-center text-[var(--ink-900)]">
              <Sparkles className="w-4 h-4 text-[var(--status-warning)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm text-[var(--ink-900)]">
                  60-Second Judge Walkthrough
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--sage-600)] text-white font-semibold">
                  Step {current.stepNumber} of {TOUR_STEPS.length}
                </span>
              </div>
              <p className="text-[11px] text-[var(--ink-500)] mt-0.5">
                BRICS Hackathon Track 3: Resilience · Operational Command Flow
              </p>
            </div>
          </div>

          <button
            onClick={closeTour}
            className="p-1 rounded-md text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[var(--sage-100)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Step Meta Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-[var(--sage-50)] text-[var(--sage-800)] border border-[var(--sage-200)]">
              {current.badge}
            </span>
            <span className="text-xs font-heading font-semibold text-[var(--ink-700)]">
              {current.screenTitle}
            </span>
          </div>

          {/* Question / Hook */}
          <div>
            <h4 className="font-heading font-bold text-base text-[var(--ink-900)]">
              "{current.questionAnswered}"
            </h4>
          </div>

          {/* Key Insight */}
          <div className="p-3.5 rounded-xl bg-[var(--paper-50)] border border-[var(--card-border)] space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--sage-600)] shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--ink-900)] leading-relaxed">
                <strong className="text-[var(--ink-900)]">Judge Key Insight: </strong>
                {current.judgeKeyInsight}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-[var(--card-border)]/60">
              <Brain className="w-4 h-4 text-[var(--ink-500)] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[var(--ink-700)] leading-relaxed">
                <strong className="text-[var(--ink-700)]">Technical Foundation: </strong>
                {current.technicalMechanism}
              </div>
            </div>
          </div>

          {/* Screen Interaction Prompt */}
          <div className="p-2.5 rounded-lg bg-[var(--cream-100)]/50 border border-[var(--cream-100)] flex items-center justify-between text-xs text-[var(--ink-900)]">
            <span className="font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-warning)] animate-ping" />
              {current.actionPrompt}
            </span>
            <span className="font-mono text-[10px] text-[var(--ink-500)]">Screen synced</span>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                onClick={() => jumpToTourStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === tourStep ? 'w-6 bg-[var(--sage-600)]' : 'w-2 bg-[var(--sage-200)] hover:bg-[var(--sage-600)]/60'
                }`}
                title={`Jump to Step ${s.stepNumber}: ${s.screenTitle}`}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <button
            onClick={prevTourStep}
            disabled={tourStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-xs text-[var(--ink-700)] hover:bg-[var(--card-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-[var(--ink-500)] font-mono">
            {tourStep + 1} / {TOUR_STEPS.length}
          </div>

          <button
            onClick={nextTourStep}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>{tourStep === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
