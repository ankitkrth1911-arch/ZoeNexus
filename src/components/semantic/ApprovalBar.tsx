// Semantic Component: ApprovalBar
// Human approval surface ensuring statutory human-in-the-loop control
import React, { useState } from 'react';
import { ShieldCheck, XCircle, CheckCircle2, AlertOctagon, FileCheck, Lock } from 'lucide-react';
import { SystemConnectionState, UserRole, DecisionStep } from '../../types/decision';

interface ApprovalBarProps {
  decisionStep: DecisionStep;
  connectionState: SystemConnectionState;
  currentRole: UserRole;
  onApprove: (officerNote?: string) => void;
  onReject: (reason: string) => void;
  className?: string;
}

export const ApprovalBar: React.FC<ApprovalBarProps> = ({
  decisionStep,
  connectionState,
  currentRole,
  onApprove,
  onReject,
  className = '',
}) => {
  const [officerNote, setOfficerNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isAuditor = currentRole === 'auditor';
  const isStale = connectionState === 'STALE_CRITICAL';
  const isOffline = connectionState === 'OFFLINE';
  const isInfeasible = connectionState === 'SOLVER_FAILURE' || connectionState === 'NO_SAFE_DONOR';

  const isBlocked = isAuditor || isStale || isOffline || isInfeasible;

  const getBlockedReason = () => {
    if (isAuditor) return 'Statutory Auditor mode: strictly read-only inspection.';
    if (isStale) return 'Stale critical telemetry (>4h): live HIS re-sync required before approval.';
    if (isOffline) return 'Facility disconnected: dispatch order transmission disabled.';
    if (connectionState === 'NO_SAFE_DONOR') return 'Infeasible: no donor can safely fulfill deficit without breaching safety reserve.';
    if (connectionState === 'SOLVER_FAILURE') return 'Solver error: route or cold-chain constraints violated.';
    return '';
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Statutory audit justification required to reject an allocation plan.');
      return;
    }
    onReject(rejectReason.trim());
    setShowRejectModal(false);
    setRejectReason('');
  };

  if (decisionStep === 'APPROVED') {
    return (
      <div className={`p-3.5 rounded-xl bg-[var(--status-healthy-bg)] border border-[var(--status-healthy-border)] flex items-center justify-between text-xs ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--status-healthy)] shrink-0" />
          <div>
            <span className="font-heading font-bold text-[var(--status-healthy)] block">
              ALLOCATION ORDER COMMITTED &amp; SIGNED
            </span>
            <span className="text-[11px] text-[var(--ink-700)]">
              Signed with SHA-256 state hash. Dispatch manifests dispatched to cold-van transport unit.
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-[var(--status-healthy)] text-white text-[10px] font-mono font-bold uppercase shrink-0">
          DISPATCH ACTIVE
        </span>
      </div>
    );
  }

  if (decisionStep === 'REJECTED') {
    return (
      <div className={`p-3.5 rounded-xl bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-center justify-between text-xs ${className}`}>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-[var(--status-critical)] shrink-0" />
          <div>
            <span className="font-heading font-bold text-[var(--status-critical)] block">
              TRANSFER PLAN REJECTED BY OFFICER
            </span>
            <span className="text-[11px] text-[var(--ink-700)]">
              Decision permanently archived in Audit Trail with statutory rationale.
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-[var(--status-critical)] text-white text-[10px] font-mono font-bold uppercase shrink-0">
          REJECTED
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 ${className}`}>
      {/* Officer Optional Note Input */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] mb-1">
          Statutory Authorization Note (Appended to Audit Trail)
        </label>
        <input
          type="text"
          value={officerNote}
          onChange={(e) => setOfficerNote(e.target.value)}
          placeholder="e.g. Priority dispatch verified via NH-48 corridor; pediatric clinic notified."
          className="w-full px-2.5 py-1.5 text-xs bg-[var(--paper-50)] border border-[var(--card-border)] rounded-md text-[var(--ink-900)] placeholder:text-[var(--ink-300)] focus:outline-none focus:border-[var(--sage-600)]"
          disabled={isBlocked}
        />
      </div>

      {/* Blocked Alert Banner if applicable */}
      {isBlocked && (
        <div className="p-2.5 rounded-md bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 text-[var(--status-critical)] shrink-0" />
          <span className="text-[11px] text-[var(--status-critical)] font-medium">
            {getBlockedReason()}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={isAuditor}
          className="flex-1 py-2 px-3 rounded-lg border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] hover:opacity-85 text-[var(--status-critical)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Reject Plan</span>
        </button>

        <button
          onClick={() => onApprove(officerNote)}
          disabled={isBlocked}
          className="flex-2 py-2 px-4 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Authorize Stock Transfer</span>
        </button>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-elevated p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--status-critical)]">
              <AlertOctagon className="w-4 h-4" />
              <h4 className="font-heading font-bold text-sm">
                Record Statutory Rejection
              </h4>
            </div>

            <p className="text-xs text-[var(--ink-700)]">
              Health regulations require an immutable rationale before overriding or canceling an algorithmically verified redistribution order.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Scheduled district supply arrives in 18 hours; patient inflow stabilized; donor buffer required locally."
              className="w-full p-2.5 text-xs bg-[var(--paper-50)] border border-[var(--card-border)] rounded-md text-[var(--ink-900)] focus:outline-none focus:border-[var(--sage-600)]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 rounded-md border border-[var(--card-border)] text-xs text-[var(--ink-700)] hover:bg-[var(--card-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3 py-1.5 rounded-md bg-[var(--status-critical)] text-white text-xs font-semibold hover:opacity-90"
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
