// Shell Zone 2: Floating Context Chip
// Spec: FLOATING CONTEXT CHIP (top-left, small): State / District / PHC scope · Freshness 12m · connection state. Click to change scope. A chip, not a full-width bar.
import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';
import { SystemConnectionState } from '../../types/decision';

export const ContextChip: React.FC = () => {
  const {
    selectedState,
    selectedDistrict,
    selectedPHCId,
    setSelectedPHCId,
    connectionState,
    setConnectionState,
    getCurrentPHC,
    getPHCList,
  } = useResilienceStore();

  const [isOpen, setIsOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);

  const phc = getCurrentPHC();
  const allPHCs = getPHCList();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chipRef.current && !chipRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getConnectionVisuals = (state: SystemConnectionState) => {
    switch (state) {
      case 'ONLINE':
        return {
          dot: 'bg-[var(--status-healthy)]',
          label: 'ONLINE',
          text: 'text-[var(--status-healthy)]',
          icon: Wifi,
        };
      case 'SLOW':
        return {
          dot: 'bg-[var(--status-warning)]',
          label: 'SLOW / DEGRADED',
          text: 'text-[var(--status-warning)]',
          icon: Wifi,
        };
      case 'OFFLINE':
        return {
          dot: 'bg-[var(--status-critical)]',
          label: 'OFFLINE',
          text: 'text-[var(--status-critical)]',
          icon: WifiOff,
        };
      case 'STALE_CRITICAL':
        return {
          dot: 'bg-[var(--status-critical)]',
          label: 'STALE CRITICAL (>4h)',
          text: 'text-[var(--status-critical)]',
          icon: AlertTriangle,
        };
      case 'NO_SAFE_DONOR':
        return {
          dot: 'bg-[var(--status-critical)]',
          label: 'NO SAFE DONOR',
          text: 'text-[var(--status-critical)]',
          icon: ShieldAlert,
        };
      case 'SOLVER_FAILURE':
        return {
          dot: 'bg-[var(--status-critical)]',
          label: 'SOLVER INFEASIBLE',
          text: 'text-[var(--status-critical)]',
          icon: AlertTriangle,
        };
      case 'GEMINI_UNAVAILABLE':
        return {
          dot: 'bg-[var(--status-warning)]',
          label: 'AI FALLBACK',
          text: 'text-[var(--status-warning)]',
          icon: AlertTriangle,
        };
      case 'PENDING_SYNC':
      default:
        return {
          dot: 'bg-[var(--status-info)]',
          label: 'PENDING SYNC',
          text: 'text-[var(--status-info)]',
          icon: Wifi,
        };
    }
  };

  const conn = getConnectionVisuals(connectionState);
  const ConnIcon = conn.icon;

  const SCENARIO_STATES: { id: SystemConnectionState; label: string; desc: string }[] = [
    { id: 'ONLINE', label: 'Online (Nominal)', desc: 'Live telemetric HIS feeds, authoritative approvals enabled' },
    { id: 'SLOW', label: 'Slow (Degraded)', desc: 'High latency backhaul; fresh writes delayed' },
    { id: 'STALE_CRITICAL', label: 'Stale Critical (>4h)', desc: 'Reporting telemetry age >4h; statutory approval BLOCKED' },
    { id: 'OFFLINE', label: 'Facility Offline', desc: 'Connectivity severed; local cached data only, approvals disabled' },
    { id: 'NO_SAFE_DONOR', label: 'No Safe Donor', desc: 'Regional epidemic surge; donor margins exhausted' },
    { id: 'SOLVER_FAILURE', label: 'Solver Infeasible', desc: 'Bridge washed out; route constraints violated' },
    { id: 'GEMINI_UNAVAILABLE', label: 'Gemini Unavailable', desc: 'Google AI proxy offline; deterministic math fallback active' },
    { id: 'PENDING_SYNC', label: 'Pending Sync', desc: 'Local edge writes queued for central consensus' },
  ];

  return (
    <div ref={chipRef} className="absolute top-4 left-4 z-30 select-none">
      {/* Small Floating Context Chip */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--card-border)] shadow-elevated flex items-center gap-2.5 text-xs hover:border-[var(--sage-600)] transition-all cursor-pointer group"
        aria-label="Scope and Connection State"
      >
        {/* Scope breadcrumb */}
        <div className="flex items-center gap-1.5 font-medium text-[var(--ink-900)]">
          <MapPin className="w-3.5 h-3.5 text-[var(--sage-600)] shrink-0" />
          <span className="font-heading font-semibold text-[var(--ink-900)]">
            {selectedState}
          </span>
          <span className="text-[var(--ink-300)]">/</span>
          <span className="text-[var(--ink-700)]">Pune</span>
          <span className="text-[var(--ink-300)]">/</span>
          <span className="font-mono font-bold text-[var(--sage-700)]">
            {phc.id}
          </span>
        </div>

        <span className="text-[var(--card-border)]">|</span>

        {/* Freshness */}
        <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--ink-500)]">
          <Clock className="w-3 h-3 text-[var(--ink-400)] shrink-0" />
          <span>{phc.freshnessMinutes}m ago</span>
        </div>

        <span className="text-[var(--card-border)]">|</span>

        {/* Connection State Badge */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${conn.dot} animate-pulse`} />
          <span className={`font-mono text-[10px] font-bold tracking-tight uppercase ${conn.text}`}>
            {conn.label}
          </span>
        </div>

        <ChevronDown className="w-3 h-3 text-[var(--ink-400)] group-hover:text-[var(--ink-900)] transition-transform duration-150" />
      </button>

      {/* Floating Popover: Scope Selector & Connection State Switcher */}
      {isOpen && (
        <div className="absolute top-11 left-0 w-80 sm:w-96 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-elevated p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wide text-[var(--ink-900)]">
              Operational Scope &amp; Scenario Simulator
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--paper-50)] text-[var(--ink-700)]">
              Judge Playground
            </span>
          </div>

          {/* Scope Facility Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] mb-1">
              Select Primary Monitored Facility
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-[var(--paper-50)] rounded-lg border border-[var(--card-border)]/60">
              {allPHCs.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPHCId(p.id);
                  }}
                  className={`p-1.5 rounded text-left text-[11px] font-mono transition-colors truncate ${
                    p.id === selectedPHCId
                      ? 'bg-[var(--sage-600)] text-white font-bold'
                      : 'hover:bg-[var(--card-hover)] text-[var(--ink-900)]'
                  }`}
                >
                  <div className="truncate font-semibold">{p.id}</div>
                  <div className="truncate text-[9px] opacity-80">{p.name.split('—')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scenario State Switcher (Judge test) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)]">
                System Connection &amp; Failure States
              </label>
              <span className="text-[9px] font-mono text-[var(--sage-700)]">
                Test Trust Boundaries
              </span>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto p-1 bg-[var(--paper-50)] rounded-lg border border-[var(--card-border)]/60">
              {SCENARIO_STATES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setConnectionState(s.id);
                  }}
                  className={`w-full p-2 rounded text-left transition-colors flex items-start gap-2 ${
                    connectionState === s.id
                      ? 'bg-[var(--card-bg)] border border-[var(--sage-600)] shadow-xs'
                      : 'hover:bg-[var(--card-hover)] border border-transparent'
                  }`}
                >
                  <div className="mt-0.5">
                    {connectionState === s.id ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--sage-600)]" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[var(--card-border)]" />
                    )}
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-[11px] text-[var(--ink-900)]">
                      {s.label}
                    </div>
                    <div className="text-[10px] text-[var(--ink-500)] leading-tight">
                      {s.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] font-mono text-[var(--ink-500)] text-center pt-1 border-t border-[var(--card-border)]/60">
            Press <kbd className="px-1 py-0.2 rounded border bg-[var(--card-bg)] text-[var(--ink-900)]">ESC</kbd> to close
          </div>
        </div>
      )}
    </div>
  );
};
