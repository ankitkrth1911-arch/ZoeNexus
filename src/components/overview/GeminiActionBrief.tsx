import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { useCommandStore } from '../../store/useCommandStore';

export const GeminiActionBrief: React.FC = () => {
  const [briefs, setBriefs] = useState(geminiService.getExecutiveBrief());
  const { approveTransfer, setActiveScreen, openDrawer } = useCommandStore();

  const handleAction = (item: (typeof briefs)[0]) => {
    if (item.corridorId) {
      approveTransfer(item.corridorId);
    } else if (item.anomalyId) {
      setActiveScreen('anomalies');
    }
  };

  return (
    <div className="rounded-xl border border-[#00e5bc]/30 bg-gradient-to-br from-[#111722]/95 via-[#111722] to-teal-950/20 p-4 backdrop-blur-md shadow-[0_0_20px_rgba(0,229,188,0.07)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#00e5bc]/20 border border-[#00e5bc]/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#00e5bc]" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>What Should I Do Now?</span>
              <span className="text-[10px] font-mono font-normal text-teal-400 bg-teal-950/80 px-1.5 py-0.2 rounded border border-teal-500/30">
                AI EXECUTIVE BRIEF
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Ranked situational actions synthesized by Google Gemini &amp; Federated Forecasts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" /> Grounded in EDL &amp; IDSP
          </span>
          <button
            onClick={() => setActiveScreen('explain')}
            className="text-[11px] font-mono text-[#00e5bc] hover:underline flex items-center gap-1 font-semibold"
          >
            Ask Gemini Q&amp;A →
          </button>
        </div>
      </div>

      {/* 3 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {briefs.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col justify-between p-3 rounded-lg bg-[#0b0f17]/80 border border-slate-800 hover:border-teal-500/40 transition-all text-xs"
          >
            <div className="space-y-1.5">
              {/* Badge & Confidence */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold border ${
                    item.urgency === 'critical'
                      ? 'bg-red-950/60 text-red-300 border-red-500/40'
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  }`}
                >
                  PRIORITY #{index + 1}
                </span>
                <span className="mono-data text-[10px] text-teal-400 font-semibold">
                  {item.confidence}% Confidence
                </span>
              </div>

              {/* Title & Reason */}
              <div className="font-semibold text-white tracking-tight leading-snug">
                {item.title}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.reason}
              </p>

              {/* Impact */}
              <div className="text-[10px] text-emerald-400 font-mono pt-1">
                ✓ Impact: {item.impact}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2.5 mt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleAction(item)}
                className="w-full py-1.5 px-2 rounded bg-[#00e5bc]/15 hover:bg-[#00e5bc] text-[#00e5bc] hover:text-[#0b0f17] border border-[#00e5bc]/40 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>{item.corridorId ? 'Approve Transfer' : 'Investigate Anomaly'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
