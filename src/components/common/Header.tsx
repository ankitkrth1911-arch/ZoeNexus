import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  Clock,
  Sparkles,
  Command,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { BRICS_MEMBERS } from '../../data/bricsData';
import { MOCK_DISTRICTS } from '../../data/mockData';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    selectedCountry,
    setSelectedCountry,
    selectedDistrictId,
    setSelectedDistrictId,
    timeRange,
    setTimeRange,
    setCommandPaletteOpen,
    setActiveScreen,
    alerts,
    openDrawer,
    lastDataFreshnessSeconds,
    resetFreshness,
  } = useCommandStore();

  const [utcTime, setUtcTime] = useState('');
  const [istTime, setIstTime] = useState('');
  const [freshnessCounter, setFreshnessCounter] = useState(lastDataFreshnessSeconds);

  // Live clocks update every second
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setUtcTime(
        now.toUTCString().slice(17, 25) + ' UTC'
      );
      // IST is UTC + 5:30
      const istOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setIstTime(new Intl.DateTimeFormat('en-GB', istOptions).format(now) + ' IST');
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Data freshness counter
  useEffect(() => {
    const freshTimer = setInterval(() => {
      setFreshnessCounter((prev) => (prev > 90 ? 12 : prev + 1));
    }, 1000);
    return () => clearInterval(freshTimer);
  }, []);

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-[#0b0f17]/95 backdrop-blur-md border-b border-[#1e293b] px-4 flex items-center justify-between gap-3 text-xs select-none">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveScreen('overview')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5bc]/20 to-[#00a884]/10 border border-[#00e5bc]/40 flex items-center justify-center relative shadow-[0_0_12px_rgba(0,229,188,0.2)] group-hover:border-[#00e5bc] transition-all">
            <Activity className="w-4 h-4 text-[#00e5bc]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00e5bc] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-sm tracking-tight text-white group-hover:text-[#00e5bc] transition-colors">
                SANJEEVANI<span className="text-[#00e5bc]">.GRID</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-teal-950/70 border border-teal-500/30 text-teal-300 rounded font-semibold">
                BRICS RESILIENCE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider hidden sm:block">
              Data → Forecast → Risk → Allocate → Explain
            </p>
          </div>
        </button>
      </div>

      {/* Center Controls: Global Search + Scope Selectors */}
      <div className="flex items-center gap-2">
        {/* Global Search / Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-[#111722] hover:bg-[#161f2e] border border-[#1e293b] hover:border-[#2a3a52] rounded-md text-slate-400 hover:text-slate-200 transition-all group"
          title="Open Command Palette (⌘K or Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00e5bc] transition-colors" />
          <span className="text-[11px] hidden md:inline">Quick Jump...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.5 text-[9px] font-mono bg-slate-800 border border-slate-700 text-slate-400 rounded">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* BRICS Country Selector */}
        <div className="relative group">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="appearance-none bg-[#111722] hover:bg-[#161f2e] border border-[#1e293b] hover:border-[#2a3a52] rounded-md pl-2.5 pr-6 py-1.5 text-slate-200 font-medium text-xs cursor-pointer focus:outline-none focus:border-[#00e5bc]/50"
          >
            {BRICS_MEMBERS.map((m) => (
              <option key={m.code} value={m.code} className="bg-slate-900 text-white">
                {m.flagEmoji} {m.shortName}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* District Selector */}
        <div className="relative group hidden lg:block">
          <select
            value={selectedDistrictId || ''}
            onChange={(e) => setSelectedDistrictId(e.target.value || null)}
            className="appearance-none bg-[#111722] hover:bg-[#161f2e] border border-[#1e293b] hover:border-[#2a3a52] rounded-md pl-2.5 pr-6 py-1.5 text-slate-200 font-medium text-xs cursor-pointer focus:outline-none focus:border-[#00e5bc]/50"
          >
            <option value="" className="bg-slate-900 text-slate-400">
              National Health Grid (All Districts)
            </option>
            {MOCK_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                {d.name} {d.riskLevel === 'critical' ? '⚠️' : '✓'}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Horizon Picker */}
        <div className="hidden xl:flex items-center bg-[#111722] border border-[#1e293b] rounded-md p-0.5 mono-data">
          {(['7d', '14d', '30d'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setTimeRange(h)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                timeRange === h
                  ? 'bg-[#00e5bc]/20 text-[#00e5bc] border border-[#00e5bc]/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Right Strip: Live Status, Dual Clocks, Freshness, Bell, Theme, Profile */}
      <div className="flex items-center gap-3">
        {/* Federated Nodes Live Pill */}
        <div
          onClick={() => setActiveScreen('federated')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 mono-data text-[11px] cursor-pointer hover:bg-emerald-900/40 transition-colors"
          title="Click to view live Federated Network topology"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>NODES ONLINE: 5/5</span>
        </div>

        {/* Clocks: UTC & IST */}
        <div className="hidden 2xl:flex items-center gap-2 px-2 py-1 bg-slate-900/60 border border-slate-800 rounded font-mono text-[11px] text-slate-300">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{istTime}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{utcTime}</span>
        </div>

        {/* Data Freshness */}
        <button
          onClick={() => {
            setFreshnessCounter(0);
            resetFreshness();
          }}
          className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          title="Click to force reload fresh telemetry"
        >
          <RefreshCw className="w-3 h-3 text-[#00e5bc]" />
          <span>Sync {freshnessCounter}s ago</span>
        </button>

        {/* Alert Bell */}
        <button
          onClick={() => {
            if (alerts.length > 0) {
              openDrawer('alert', alerts[0].id);
            } else {
              setActiveScreen('alerts');
            }
          }}
          className="relative p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors"
          title={`${activeAlertsCount} Active Stockout Alerts`}
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-[9px] font-bold text-white flex items-center justify-center border-2 border-[#0b0f17]">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Role Badge */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-[#00e5bc]">
            HC
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold text-slate-200 leading-tight">
              Dr. R. Deshmukh
            </div>
            <div className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-[#00e5bc]" />
              Commissioner L4
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
