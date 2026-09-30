// Semantic Component: FederationClient
// Edge facility client in privacy-preserving federated training
import React from 'react';
import { Server, Lock, CheckCircle2, Clock, XCircle, Cpu } from 'lucide-react';
import { FederationNodeClient } from '../../types/decision';

interface FederationClientProps {
  client: FederationNodeClient;
  className?: string;
}

export const FederationClient: React.FC<FederationClientProps> = ({
  client,
  className = '',
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
        return {
          bg: 'bg-[var(--status-healthy-bg)]',
          text: 'text-[var(--status-healthy)]',
          border: 'border-[var(--status-healthy-border)]',
          icon: CheckCircle2,
        };
      case 'Training':
        return {
          bg: 'bg-[var(--cream-100)]',
          text: 'text-[var(--ink-900)]',
          border: 'border-[var(--sage-200)]',
          icon: Cpu,
        };
      case 'Offline':
      default:
        return {
          bg: 'bg-[var(--status-critical-bg)]',
          text: 'text-[var(--status-critical)]',
          border: 'border-[var(--status-critical-border)]',
          icon: XCircle,
        };
    }
  };

  const badge = getStatusBadge(client.status);
  const StatusIcon = badge.icon;

  return (
    <div
      className={`p-3 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs text-xs space-y-2 select-none hover:border-[var(--sage-600)] transition-colors ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] flex items-center justify-center text-[var(--sage-700)]">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-heading font-semibold text-[var(--ink-900)] leading-tight">
              {client.id}
            </div>
            <div className="text-[10px] text-[var(--ink-500)] leading-tight">
              {client.name.split('—')[1] || client.name}
            </div>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <StatusIcon className="w-2.5 h-2.5" />
          {client.status}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="p-2 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]/60 grid grid-cols-3 gap-1 font-mono text-[10px]">
        <div>
          <span className="text-[var(--ink-500)] block">Local Records</span>
          <span className="font-bold text-[var(--ink-900)]">{client.samplesCount.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[var(--ink-500)] block">Local Accuracy</span>
          <span className="font-bold text-[var(--status-healthy)]">{client.localAccuracy}%</span>
        </div>
        <div>
          <span className="text-[var(--ink-500)] block">Model Update</span>
          <span className="font-bold text-[var(--ink-900)]">{client.weightGradientsKB} KB</span>
        </div>
      </div>

      {/* Privacy Guarantee Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ink-500)] pt-1">
        <span className="flex items-center gap-1">
          <Lock className="w-2.5 h-2.5 text-[var(--sage-600)]" />
          DP Budget: &epsilon; = {client.differentialPrivacyEpsilon}
        </span>
        <span>Loss: {client.lastRoundLoss}</span>
      </div>
    </div>
  );
};
