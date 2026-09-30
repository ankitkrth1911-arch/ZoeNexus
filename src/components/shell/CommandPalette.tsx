// Command Palette (⌘K Global Fast Access)
import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Activity,
  AlertTriangle,
  BarChart3,
  GitMerge,
  Network,
  ShieldAlert,
  FileCheck2,
  Sparkles,
  MapPin,
  Pill,
  ArrowRight,
} from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';
import { ScreenId } from '../../types/decision';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setScreen,
    setSelectedPHCId,
    openDrawer,
    openTour,
    getPHCList,
  } = useResilienceStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const phcs = getPHCList();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const SCREEN_COMMANDS = [
    { id: 'pulse' as ScreenId, title: '01 Network Pulse', subtitle: 'View district geo & schematic network', icon: Activity },
    { id: 'risks' as ScreenId, title: '02 Risk Radar', subtitle: 'Priority stockout exception queue', icon: AlertTriangle },
    { id: 'phc' as ScreenId, title: '03 PHC Workspace', subtitle: 'Inspect demand forecast & facility capacity', icon: BarChart3 },
    { id: 'resolve' as ScreenId, title: '04 Resolve Shortage', subtitle: 'Signature decision surface & optimizer', icon: GitMerge },
    { id: 'federation' as ScreenId, title: '05 Federation Engine', subtitle: 'Privacy-preserving edge learning rounds', icon: Network },
    { id: 'emergency' as ScreenId, title: '06 Emergency Mode', subtitle: 'Disaster surge rings & mass allocation', icon: ShieldAlert },
    { id: 'audit' as ScreenId, title: '07 Audit Trail', subtitle: 'Immutable SHA-256 evidence reconstruction', icon: FileCheck2 },
  ];

  const filteredScreens = SCREEN_COMMANDS.filter(
    (s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPHCs = phcs.filter(
    (p) =>
      p.id.toLowerCase().includes(query.toLowerCase()) ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.primaryMedicine.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4 z-50 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-elevated overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[var(--card-border)] flex items-center gap-3 bg-[var(--surface-elevated)]">
          <Search className="w-4 h-4 text-[var(--ink-500)] shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a screen, PHC ID, or action..."
            className="flex-1 bg-transparent text-sm text-[var(--ink-900)] placeholder:text-[var(--ink-500)] focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--ink-500)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[var(--card-border)]/40 text-xs">
          {/* Quick Tour Trigger */}
          <div className="p-1">
            <button
              onClick={() => {
                setCommandPaletteOpen(false);
                openTour();
              }}
              className="w-full p-2.5 rounded-lg flex items-center justify-between hover:bg-[var(--card-hover)] text-left group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[var(--status-warning)] shrink-0" />
                <div>
                  <span className="font-heading font-semibold text-[var(--ink-900)] block">
                    Start 60-Second Judge Walkthrough
                  </span>
                  <span className="text-[11px] text-[var(--ink-500)]">
                    Step-by-step interactive inspection of the entire product contract
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--ink-300)] group-hover:text-[var(--ink-900)] transition-colors" />
            </button>
          </div>

          {/* Screens Section */}
          <div className="p-1">
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)]">
              Operational Screens
            </div>
            {filteredScreens.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setScreen(s.id);
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full p-2 rounded-lg flex items-center justify-between hover:bg-[var(--card-hover)] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[var(--sage-600)] shrink-0" />
                    <div>
                      <span className="font-medium text-[var(--ink-900)] block">{s.title}</span>
                      <span className="text-[11px] text-[var(--ink-500)]">{s.subtitle}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--ink-300)]">Navigate</span>
                </button>
              );
            })}
          </div>

          {/* PHC Facilities Section */}
          {filteredPHCs.length > 0 && (
            <div className="p-1">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)]">
                Primary Health Centres (PHCs)
              </div>
              {filteredPHCs.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPHCId(p.id);
                    openDrawer(p.id);
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full p-2 rounded-lg flex items-center justify-between hover:bg-[var(--card-hover)] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[var(--ink-500)] shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[var(--ink-900)]">{p.id}</span>
                        <span className="text-[11px] text-[var(--ink-700)]">{p.name.split('—')[1]}</span>
                      </div>
                      <span className="text-[10px] text-[var(--ink-500)] font-mono">
                        {p.primaryMedicine} · {p.coverageDays}d stock left
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                      p.status === 'HIGH'
                        ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)]'
                        : p.status === 'SURPLUS'
                        ? 'bg-[var(--status-surplus-bg)] text-[var(--status-surplus)]'
                        : 'bg-[var(--sage-100)] text-[var(--ink-700)]'
                    }`}
                  >
                    {p.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
