import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useCommandStore, ToastItem } from '../../store/useCommandStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCommandStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderColor = 'border-teal-500/40 bg-[#111722]/95 text-slate-200';
        let iconColor = 'text-[#00e5bc]';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderColor = 'border-emerald-500/40 bg-[#111722]/95 text-emerald-200';
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderColor = 'border-amber-500/40 bg-[#111722]/95 text-amber-200';
          iconColor = 'text-amber-400';
        } else if (toast.type === 'critical') {
          Icon = AlertCircle;
          borderColor = 'border-red-500/50 bg-red-950/90 text-red-200';
          iconColor = 'text-red-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${borderColor}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs">
              <div className="font-semibold tracking-tight">{toast.title}</div>
              {toast.description && (
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
