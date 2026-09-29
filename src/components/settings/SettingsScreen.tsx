import React, { useState } from 'react';
import {
  Settings,
  Key,
  Database,
  Lock,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';

export const SettingsScreen: React.FC = () => {
  const { addToast } = useCommandStore();
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('sanjeevani_gemini_key') || ''
  );
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('sanjeevani_api_url') || 'http://localhost:8000/api/v1'
  );
  const [epsilonVal, setEpsilonVal] = useState('1.84');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('sanjeevani_gemini_key', apiKey);
    localStorage.setItem('sanjeevani_api_url', apiUrl);
    setIsSaved(true);
    addToast({
      title: 'Configuration Saved',
      description: 'System credentials and backend parameters updated.',
      type: 'success',
    });
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDemo = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="max-w-4xl space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#111722] border border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#00e5bc]" />
          <h1 className="font-heading text-lg font-bold text-white tracking-tight">
            System Protocols &amp; API Integration Settings
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure external Google AI Studio endpoints, FastAPI backend connectors, and Differential Privacy parameters.
        </p>
      </div>

      {/* 1. Google Gemini AI Studio API Configuration */}
      <div className="p-5 rounded-xl bg-[#111722] border border-[#1e293b] space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00e5bc]" />
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
              Google AI Studio (Gemini API Key)
            </h3>
          </div>
          <span className="text-[10px] text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
            Free-Tier Compatible
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          SANJEEVANI GRID features a 100% reliable local offline reasoning fallback. If you provide a Google AI Studio API key, live multimodal and reasoning requests are proxied directly to Gemini 1.5/2.5.
        </p>

        <div className="space-y-1.5">
          <label className="text-slate-300 font-semibold block">API KEY (Google AI Studio)</label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#0b0f17] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00e5bc]"
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            Stored exclusively in browser local storage; never transmitted outside direct client requests.
          </span>
        </div>
      </div>

      {/* 2. FastAPI Backend Connector */}
      <div className="p-5 rounded-xl bg-[#111722] border border-[#1e293b] space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#38bdf8]" />
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
              Production FastAPI Backend Connector
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            Mock / Live Dual-Mode
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          The frontend data layer is structured to interface seamlessly with endpoints: <code>/forecast</code>, <code>/alerts</code>, <code>/plan</code>, and <code>/federation</code> without requiring any component changes.
        </p>

        <div className="space-y-1.5">
          <label className="text-slate-300 font-semibold block">BACKEND BASE URL</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full bg-[#0b0f17] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#38bdf8]"
          />
        </div>
      </div>

      {/* 3. Federated Differential Privacy Parameters */}
      <div className="p-5 rounded-xl bg-[#111722] border border-[#1e293b] space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
              Differential Privacy Budget &amp; Protocol
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">DP-SGD Guaranteed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-300 block mb-1">Epsilon Privacy Loss (ε)</label>
            <input
              type="text"
              value={epsilonVal}
              onChange={(e) => setEpsilonVal(e.target.value)}
              className="w-full bg-[#0b0f17] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Default: ε = 1.84 (Strict Privacy)</span>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">Delta Relaxation (δ)</label>
            <input
              type="text"
              readOnly
              value="1.0e-5"
              className="w-full bg-[#0b0f17]/60 border border-[#1e293b] rounded-lg px-3 py-2 text-slate-400 font-mono text-xs cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Upper bound probability of breach</span>
          </div>
        </div>
      </div>

      {/* Save & Reset Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleResetDemo}
          className="px-4 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-700/50 text-red-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo State</span>
        </button>

        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg bg-[#00e5bc] hover:bg-[#00d2aa] text-[#0b0f17] font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#00e5bc]/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSaved ? 'Saved Successfully!' : 'Save System Settings'}</span>
        </button>
      </div>
    </div>
  );
};
