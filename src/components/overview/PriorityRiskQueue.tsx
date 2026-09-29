import React from 'react';
import { AlertCircle, Clock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { MOCK_ALERTS } from '../../data/mockData';
import { StatusPill } from '../common/StatusPill';
import { RiskBar } from '../common/RiskBar';

export const PriorityRiskQueue: React.FC = () => {
  const { openDrawer, setSelectedDistrictId, setActiveScreen } = useCommandStore();

  return (
    <div className="flex flex-col h-full rounded-xl border border-[#1e293b] bg-[#111722]/90 backdrop-blur-md overflow-hidden">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#1e293b] flex items-center justify-between bg-[#0b0f17]/60">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
          <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
            Critical Risk Queue
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 font-semibold">
          {MOCK_ALERTS.length} High Priority
        </span>
      </div>

      {/* Ranked Alert Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e293b]/70 p-1">
        {MOCK_ALERTS.map((alert, index) => {
          const isExtreme = alert.daysRemaining < 2;

          return (
            <div
              key={alert.id}
              onClick={() => {
                setSelectedDistrictId(alert.districtId);
                openDrawer('alert', alert.id);
              }}
              className="p-3 hover:bg-[#161f2e] transition-colors cursor-pointer group flex flex-col gap-2 rounded-lg"
            >
              {/* Top row: Rank, Medicine, Severity Pill */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="mono-data text-[11px] font-bold text-slate-500 w-4">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-xs text-white group-hover:text-[#00e5bc] transition-colors truncate">
                    {alert.medicineName}
                  </span>
                </div>
                <StatusPill status={alert.severity} size="sm" />
              </div>

              {/* Middle row: District & PHC location */}
              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>{alert.phcName || alert.districtName}</span>
                <span className="text-slate-500">{alert.districtName.split(' ')[0]}</span>
              </div>

              {/* Bottom row: Countdown, Risk Bar & Action */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 mono-data text-xs">
                  <Clock className={`w-3.5 h-3.5 ${isExtreme ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                  <span className={`font-bold ${isExtreme ? 'text-red-400' : 'text-amber-300'}`}>
                    {alert.daysRemaining} days left
                  </span>
                  <span className="text-[10px] text-slate-500">({alert.currentStock} units)</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDrawer('alert', alert.id);
                  }}
                  className="text-[11px] font-mono font-semibold text-[#00e5bc] hover:text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Quick Action */}
      <div className="p-2.5 border-t border-[#1e293b] bg-[#0b0f17]/40 flex items-center justify-between">
        <button
          onClick={() => setActiveScreen('alerts')}
          className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
        >
          View all 14 forecasted alerts →
        </button>
        <button
          onClick={() => setActiveScreen('redistribution')}
          className="px-2 py-1 rounded bg-[#00e5bc]/15 border border-[#00e5bc]/40 text-[#00e5bc] font-mono text-[11px] font-semibold hover:bg-[#00e5bc]/25 transition-colors"
        >
          Auto-Mitigate
        </button>
      </div>
    </div>
  );
};
