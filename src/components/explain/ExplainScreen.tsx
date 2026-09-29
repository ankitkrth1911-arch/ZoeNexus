import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Repeat,
  AlertTriangle,
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { GeminiExplainResponse } from '../../types';
import { useCommandStore } from '../../store/useCommandStore';

export const ExplainScreen: React.FC = () => {
  const { setActiveScreen, approveTransfer } = useCommandStore();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<GeminiExplainResponse | null>(() =>
    // Default initial response for Satara
    geminiService.explainDistrictRisk('Satara Hilly Belt') as unknown as GeminiExplainResponse
  );

  const suggestedPrompts = [
    { label: 'Why is Satara at critical stock-out risk?', district: 'Satara Hilly Belt' },
    { label: 'Why is Solapur suffering an acute ORS shortage?', district: 'Solapur Semi-Arid Corridor' },
    { label: 'Why did the optimizer select Pune as donor over Nashik?', district: 'Pune Health District' },
    { label: 'Explain how Differential Privacy (ε=1.84) guards patient records', district: 'National Grid' },
  ];

  const handleRunQuery = async (targetDistrict: string, promptText?: string) => {
    setIsLoading(true);
    try {
      const res = await geminiService.explainDistrictRisk(targetDistrict, promptText);
      setExplanation(res);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#111722] border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00e5bc]" />
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">
              Explainable Clinical &amp; Supply Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded reasoning powered by Google Gemini: queries telemetry, disease surveillance signals, and logistics bottlenecks.
          </p>
        </div>

        {/* Gemini Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-950/60 border border-teal-500/40 text-teal-300 font-mono text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#00e5bc] animate-pulse" />
          <span className="font-bold">Powered by Google Gemini</span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(p.label);
              handleRunQuery(p.district, p.label);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#111722] hover:bg-[#161f2e] border border-[#1e293b] hover:border-[#00e5bc]/50 text-slate-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <HelpCircle className="w-3 h-3 text-[#00e5bc]" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Query Bar */}
      <div className="p-2 rounded-xl bg-[#111722] border border-[#1e293b] flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              handleRunQuery(query, query);
            }
          }}
          placeholder="Ask anything (e.g. Why is Paracetamol depleting in Karad? How to solve cold chain bottlenecks?)..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
        />
        <button
          onClick={() => {
            if (query.trim()) handleRunQuery(query, query);
          }}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-[#00e5bc] hover:bg-[#00d2aa] text-[#0b0f17] font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isLoading ? 'Analyzing...' : 'Ask AI'}</span>
        </button>
      </div>

      {/* Explanation Structured Output */}
      {explanation && (
        <div className="rounded-xl border border-[#00e5bc]/30 bg-[#111722] p-5 space-y-5 shadow-[0_0_25px_rgba(0,229,188,0.06)] font-mono text-xs">
          {/* Executive Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#00e5bc] uppercase font-bold tracking-wider">
                EXECUTIVE CLINICAL DIAGNOSIS
              </span>
              <span className="text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                Confidence: {explanation.confidence}%
              </span>
            </div>
            <p className="text-sm font-sans font-medium text-white leading-relaxed">
              {explanation.summary}
            </p>
          </div>

          {/* Grounded Factors Breakdown */}
          <div className="space-y-2.5 pt-3 border-t border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Grounded Epidemiological &amp; Supply Chain Signals
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {explanation.groundedFactors.map((gf, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg bg-[#0b0f17] border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-xs truncate">{gf.factor}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                        gf.impactLevel === 'high'
                          ? 'bg-red-950 text-red-300 border border-red-700/50'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                      }`}
                    >
                      {gf.impactLevel} Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{gf.dataPoint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Step-by-Step Action Plan */}
          <div className="space-y-2.5 pt-3 border-t border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Recommended Administrative Mitigation Plan
            </span>

            <div className="space-y-2">
              {explanation.recommendedActions.map((rec) => (
                <div
                  key={rec.step}
                  className="p-3.5 rounded-lg bg-teal-950/20 border border-teal-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00e5bc] text-[#0b0f17] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {rec.step}
                    </div>
                    <div className="space-y-1">
                      <div className="text-white font-semibold">{rec.action}</div>
                      <div className="text-[11px] text-slate-400">
                        Target Timeframe: <span className="text-amber-300">{rec.timeframe}</span> • Outcome: <span className="text-emerald-400">{rec.expectedOutcome}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveScreen('redistribution')}
                    className="px-3 py-1.5 rounded bg-[#00e5bc]/20 hover:bg-[#00e5bc] text-[#00e5bc] hover:text-[#0b0f17] border border-[#00e5bc]/40 font-bold text-[11px] whitespace-nowrap transition-colors flex items-center gap-1.5 self-end sm:self-center"
                  >
                    <span>Execute in Optimizer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Citation & Compliance Stamp */}
          <div className="p-3 rounded-lg bg-[#0b0f17] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00e5bc] flex-shrink-0" />
              <span>{explanation.regulatoryContext}</span>
            </div>
            <span className="text-teal-400 font-semibold">{explanation.auditBadge}</span>
          </div>
        </div>
      )}
    </div>
  );
};
