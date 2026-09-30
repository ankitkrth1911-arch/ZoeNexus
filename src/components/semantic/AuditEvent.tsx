// Semantic Component: AuditEvent
// Immutable step in post-hoc reconstruction chain with SHA-256 cryptographic verification
import React from 'react';
import { ShieldCheck, Clock, Key, CheckCircle2 } from 'lucide-react';
import { AuditEvent as AuditEventType } from '../../types/decision';

interface AuditEventProps {
  event: AuditEventType;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export const AuditEvent: React.FC<AuditEventProps> = ({
  event,
  isSelected = false,
  onSelect,
  className = '',
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 select-none ${
        isSelected
          ? 'bg-[var(--sage-50)] border-[var(--sage-600)] ring-1 ring-[var(--sage-600)] shadow-xs'
          : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:bg-[var(--card-hover)]'
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--sage-700)] font-bold block">
            {event.stepName}
          </span>
          <h4 className="font-heading font-semibold text-xs text-[var(--ink-900)] mt-0.5">
            {event.action}
          </h4>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--status-healthy-bg)] text-[var(--status-healthy)] border border-[var(--status-healthy-border)]">
          <ShieldCheck className="w-3 h-3" />
          {event.status}
        </span>
      </div>

      <p className="text-[11px] text-[var(--ink-700)] leading-relaxed">
        {event.payloadSummary}
      </p>

      {/* Actor & Timestamp */}
      <div className="pt-2 border-t border-[var(--card-border)]/60 flex items-center justify-between text-[10px] font-mono text-[var(--ink-500)]">
        <div>
          Actor: <strong className="text-[var(--ink-900)]">{event.actor}</strong> ({event.role})
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-[var(--ink-400)]" />
          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Cryptographic SHA-256 Hash */}
      <div className="p-1.5 rounded bg-[var(--paper-50)] border border-[var(--card-border)]/60 flex items-center justify-between text-[9px] font-mono text-[var(--ink-500)]">
        <span className="flex items-center gap-1 truncate max-w-[280px]">
          <Key className="w-2.5 h-2.5 text-[var(--sage-600)] shrink-0" />
          SHA-256: <span className="text-[var(--ink-900)] truncate font-semibold">{event.stateHash}</span>
        </span>
        <span className="shrink-0 text-[var(--sage-700)] font-medium">
          Model: {event.modelVersion}
        </span>
      </div>
    </div>
  );
};
