// Context Strip (Top Global Operational Control Bar)
import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  UserCheck,
  Search,
  Sun,
  Moon,
  AlertOctagon,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';
import { SystemConnectionState, UserRole } from '../../types/decision';

export const ContextStrip: React.FC = () => {
  const {
    selectedState,
    selectedDistrict,
    selectedPHCId,
    setSelectedPHCId,
    connectionState,
    setConnectionState,
    currentRole,
    setCurrentRole,
    theme,
    toggleTheme,
    setCommandPaletteOpen,
    openTour,
    getCurrentPHC,
    getPHCList,
  } = useResilienceStore();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showStateMenu, setShowStateMenu] = useState(false);
  const [showPHCMenu, setShowPHCMenu] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const stateMenuRef = useRef<HTMLDivElement>(null);
  const phcMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (stateMenuRef.current && !stateMenuRef.current.contains(e.target as Node)) {
        setShowStateMenu(false);
      }
      if (phcMenuRef.current && !phcMenuRef.current.contains(e.target as Node)) {
        setShowPHCMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPHC = getCurrentPHC();
  const allPHCs = getPHCList();

  const ROLE_OPTIONS: { id: UserRole; title: string; subtitle: string }[] = [
    {
      id: 'district_officer',
      title: 'District/State Officer',
      subtitle: 'Full statutory authority: review evidence, approve/reject transfers'
    },
    {
      id: 'phc_operator',
      title: 'PHC Operator',
      subtitle: 'Read facility state, report local stock & bed occupancy'
    },
    {
      id: 'emergency_controller',
      title: 'Emergency Controller',
      subtitle: 'Priority surge override: mass corridor reallocation'
    },
    {
      id: 'federation_admin',
      title: 'Federation Admin',
      subtitle: 'Federated learning monitor: privacy budget & rounds'
    },
    {
      id: 'auditor',
      title: 'Statutory Auditor',
      subtitle: 'Read-only inspection: export immutable proof bundles'
    }
  ];

  const SCENARIO_STATES: { id: SystemConnectionState; label: string; tag: string }[] = [
    { id: 'ONLINE', label: 'ONLINE (Normal Ops)', tag: 'Verified Real-time' },
    { id: 'SLOW', label: 'SLOW (Degraded Sync)', tag: 'Latency > 2.4s' },
    { id: 'OFFLINE', label: 'OFFLINE (Last Confirmed)', tag: 'Approval Disabled' },
    { id: 'PENDING_SYNC', label: 'PENDING SYNC', tag: 'Queued on edge' },
    { id: 'STALE_CRITICAL', label: 'STALE CRITICAL (>4h)', tag: 'APPROVAL BLOCKED' },
    { id: 'NO_SAFE_DONOR', label: 'NO SAFE DONOR', tag: 'Deficit Unbridgeable' },
    { id: 'GEMINI_UNAVAILABLE', label: 'GEMINI UNAVAILABLE', tag: 'Deterministic Fallback' },
    { id: 'SOLVER_FAILURE', label: 'SOLVER FAILURE', tag: 'Route Infeasible' }
  ];

  return (
    <header className="h-14 bg-[var(--card-bg)] border-b border-[var(--card-border)] px-4 flex items-center justify-between z-20 shrink-0 select-none">
      {/* 1. Scope Selector: State → District → PHC */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[var(--ink-700)] bg-[var(--paper-50)] px-2.5 py-1.5 rounded-md border border-[var(--card-border)] shadow-xs">
          <MapPin className="w-3.5 h-3.5 text-[var(--sage-600)] shrink-0" />
          <span className="font-medium text-[var(--ink-900)]">{selectedState}</span>
          <span className="text-[var(--ink-300)]">/</span>
          <span>{selectedDistrict === 'DIST-PUN' ? 'Pune District' : selectedDistrict}</span>
          <span className="text-[var(--ink-300)]">/</span>

          {/* PHC Dropdown Switcher */}
          <div className="relative" ref={phcMenuRef}>
            <button
              onClick={() => setShowPHCMenu(!showPHCMenu)}
              className="flex items-center gap-1 font-mono font-semibold text-[var(--sage-800)] hover:text-[var(--sage-600)] transition-colors"
            >
              <span>{currentPHC.id}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showPHCMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-elevated py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-[var(--ink-500)] border-b border-[var(--card-border)]">
                  Select PHC Node Target
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {allPHCs.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPHCId(p.id);
                        setShowPHCMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[var(--card-hover)] ${
                        p.id === selectedPHCId ? 'bg-[var(--sage-50)] font-semibold' : ''
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-mono text-[var(--ink-900)]">{p.id}</div>
                        <div className="text-[11px] text-[var(--ink-500)] truncate">{p.name}</div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                          p.status === 'HIGH'
                            ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] border border-[var(--status-critical-border)]'
                            : p.status === 'SURPLUS'
                            ? 'bg-[var(--status-surplus-bg)] text-[var(--status-surplus)] border border-[var(--status-surplus-border)]'
                            : 'bg-[var(--sage-100)] text-[var(--ink-700)]'
                        }`}
                      >
                        {p.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Freshness Stamp (Human-written, government grade) */}
        <div
          title={`Telemetric synchronization timestamp for ${currentPHC.id}`}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono transition-colors ${
            currentPHC.freshnessMinutes > 120
              ? 'bg-[var(--status-critical-bg)] border-[var(--status-critical-border)] text-[var(--status-critical)]'
              : 'bg-[var(--paper-50)] border-[var(--card-border)] text-[var(--ink-700)]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            {currentPHC.freshnessMinutes > 60
              ? `Freshness ${Math.floor(currentPHC.freshnessMinutes / 60)}h ${currentPHC.freshnessMinutes % 60}m`
              : `Freshness ${currentPHC.freshnessMinutes}m`}
          </span>
          {currentPHC.freshnessMinutes > 120 && (
            <span className="text-[9px] font-bold uppercase bg-[var(--status-critical)] text-white px-1 rounded">
              STALE
            </span>
          )}
        </div>
      </div>

      {/* 2. Middle: Real UI State / Scenario Tester Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={stateMenuRef}>
          <button
            onClick={() => setShowStateMenu(!showStateMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all shadow-xs ${
              connectionState === 'ONLINE'
                ? 'bg-[var(--status-healthy-bg)] text-[var(--status-healthy)] border-[var(--status-healthy-border)]'
                : connectionState === 'STALE_CRITICAL' || connectionState === 'SOLVER_FAILURE'
                ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] border-[var(--status-critical-border)] animate-pulse'
                : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
            }`}
          >
            {connectionState === 'ONLINE' ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : connectionState === 'OFFLINE' ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : (
              <AlertOctagon className="w-3.5 h-3.5" />
            )}
            <span className="font-semibold">{connectionState}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showStateMenu && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-elevated py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-[var(--ink-500)] border-b border-[var(--card-border)] flex items-center justify-between">
                <span>Simulate Real UI States</span>
                <span className="text-[9px] text-[var(--sage-600)]">Judge Testing Tool</span>
              </div>
              <div className="divide-y divide-[var(--card-border)]/50 max-h-72 overflow-y-auto">
                {SCENARIO_STATES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setConnectionState(s.id);
                      setShowStateMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[var(--card-hover)] ${
                      s.id === connectionState ? 'bg-[var(--sage-50)] font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="text-[var(--ink-900)] font-medium">{s.label}</div>
                      <div className="text-[10px] text-[var(--ink-500)]">{s.tag}</div>
                    </div>
                    {s.id === connectionState && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage-600)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Right: Role Switcher · ⌘K Search · Theme Toggle · 60s Tour */}
      <div className="flex items-center gap-2">
        {/* Role Selector Badge */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--card-border)] bg-[var(--paper-50)] text-xs text-[var(--ink-900)] hover:bg-[var(--card-hover)] transition-colors shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-[var(--sage-600)]" />
            <span className="font-medium capitalize">
              {currentRole.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-elevated py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-[var(--ink-500)] border-b border-[var(--card-border)]">
                Role-Based Interface Contract
              </div>
              <div className="divide-y divide-[var(--card-border)]/50">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setCurrentRole(r.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[var(--card-hover)] ${
                      r.id === currentRole ? 'bg-[var(--sage-50)] font-semibold' : ''
                    }`}
                  >
                    <div className="pr-2">
                      <div className="text-[var(--ink-900)]">{r.title}</div>
                      <div className="text-[10px] text-[var(--ink-500)] leading-snug">{r.subtitle}</div>
                    </div>
                    {r.id === currentRole && (
                      <span className="text-[10px] text-[var(--sage-600)] font-bold">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 60s Tour Button */}
        <button
          onClick={openTour}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--cream-100)] border border-[var(--card-border)] text-[var(--ink-900)] hover:bg-[var(--cream-50)] text-xs font-medium shadow-xs transition-colors"
          title="Start 60-Second Guided Tour for Hackathon Judges"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--status-warning)]" />
          <span className="font-heading font-medium">Judges: 60s Tour</span>
        </button>

        {/* ⌘K Command Search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[var(--card-border)] bg-[var(--paper-50)] text-xs text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[var(--card-hover)] transition-colors shadow-xs"
          title="Search PHCs, medicines, corridors (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <kbd className="font-mono text-[10px] bg-[var(--card-bg)] px-1.5 py-0.5 rounded border border-[var(--card-border)]">
            ⌘K
          </kbd>
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md border border-[var(--card-border)] bg-[var(--paper-50)] text-[var(--ink-700)] hover:text-[var(--ink-900)] hover:bg-[var(--card-hover)] transition-colors shadow-xs"
          title={theme === 'light' ? 'Switch to Night Ops (Dark)' : 'Switch to Primary (Light)'}
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
