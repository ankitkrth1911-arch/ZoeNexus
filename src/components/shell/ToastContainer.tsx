// Toast Notifications (Plain-language operational microcopy)
import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useResilienceStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full select-none pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-elevated flex items-start gap-2.5 text-xs animate-in slide-in-from-bottom-2 duration-200"
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[var(--status-healthy)] shrink-0 mt-0.5" />}
          {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[var(--status-warning)] shrink-0 mt-0.5" />}
          {t.type === 'critical' && <AlertOctagon className="w-4 h-4 text-[var(--status-critical)] shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-[var(--status-info)] shrink-0 mt-0.5" />}

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-[var(--ink-900)] leading-tight">{t.title}</span>
              <span className="text-[10px] font-mono text-[var(--ink-300)] ml-2">{t.timestamp}</span>
            </div>
            {t.detail && <p className="text-[11px] text-[var(--ink-700)] mt-0.5 leading-snug">{t.detail}</p>}
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="text-[var(--ink-300)] hover:text-[var(--ink-900)] p-0.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
