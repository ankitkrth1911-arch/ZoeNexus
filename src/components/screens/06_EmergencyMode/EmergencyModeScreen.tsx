// 06 Emergency Mode: "Emergency changes priority"
import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  ArrowRight,
  Layers,
  CheckCircle2,
  FileCheck2,
  Clock,
  Truck,
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useResilienceStore } from '../../../store/useResilienceStore';

export const EmergencyModeScreen: React.FC = () => {
  const {
    getEmergencyState,
    toggleEmergencyActive,
    currentRole,
    addToast,
    setScreen,
    screen,
  } = useResilienceStore();

  // Support ESC key to return to canvas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'emergency') {
        setScreen('pulse');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, setScreen]);

  const emergency = getEmergencyState();
  const [allocationRun, setAllocationRun] = useState(false);
  const [signedOff, setSignedOff] = useState(false);

  const handleRunAllocation = () => {
    setAllocationRun(true);
    addToast({
      type: 'warning',
      title: 'Mass Emergency Allocation Computed',
      detail: 'Generated 3 emergency convoys. Sourced 3,580 units from external perimeter donors.'
    });
  };

  const handleSignOff = () => {
    setSignedOff(true);
    addToast({
      type: 'success',
      title: 'Emergency Multi-Corridor Convoys Dispatched',
      detail: 'Statutory emergency declaration #EMG-2026-09 signed. Police escort authorized for medical corridors.'
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-[var(--paper-50)] overflow-y-auto p-4 md:p-8 select-none animate-in fade-in duration-200">
      <div className="max-w-6xl mx-auto space-y-4 pb-12">
        {/* Breadcrumb & Return to Canvas Bar */}
        <div className="flex items-center justify-between pb-1 border-b border-[var(--card-border)]/60">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-500)]">
            <button
              onClick={() => setScreen('pulse')}
              className="flex items-center gap-1 hover:text-[var(--ink-900)] text-[var(--sage-700)] font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Network Canvas</span>
            </button>
            <ChevronRight className="w-3 h-3 text-[var(--ink-300)]" />
            <span className="text-[var(--ink-900)] font-semibold">Incident Surge Command</span>
            <ChevronRight className="w-3 h-3 text-[var(--ink-300)]" />
            <span className="text-[var(--status-critical)]">{emergency.incidentName}</span>
          </div>

          <button
            onClick={() => setScreen('pulse')}
            className="px-2.5 py-1 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-xs text-[var(--ink-700)] hover:bg-[var(--card-hover)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Close Layer</span>
            <kbd className="text-[10px] font-mono px-1 rounded bg-[var(--paper-50)] border border-[var(--card-border)] text-[var(--ink-500)]">
              ESC
            </kbd>
          </button>
        </div>
      {/* 1. Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--status-warning-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--status-warning)] font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Screen 06 · Incident Surge Command
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--status-warning-bg)] text-[var(--status-warning)] font-bold">
              {emergency.status}
            </span>
          </div>
          <h1 className="font-heading font-bold text-lg text-[var(--ink-900)] mt-0.5">
            Emergency Mode — "Emergency changes priority"
          </h1>
          <p className="text-xs text-[var(--ink-700)] mt-0.5 max-w-2xl">
            {emergency.incidentName}. Reconfigures logistics priorities from cost optimization to rapid surge relief with concentric hazard rings.
          </p>
        </div>

        {/* Emergency Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleEmergencyActive}
            disabled={currentRole === 'auditor'}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-colors shadow-xs ${
              emergency.active
                ? 'bg-[var(--status-critical)] text-white hover:opacity-90'
                : 'bg-[var(--sage-100)] text-[var(--ink-700)] hover:bg-[var(--sage-200)]'
            }`}
          >
            {emergency.active ? 'Surge Active (Deactivate)' : 'Activate Surge Mode'}
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metrics Panel (Required by Spec) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
        <div className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
          <span className="text-[10px] text-[var(--ink-500)] uppercase block">Affected PHCs</span>
          <span className="font-bold text-2xl text-[var(--ink-900)] block mt-0.5">
            {emergency.affectedPHCsCount}
          </span>
          <span className="text-[10px] text-[var(--status-warning)]">Sector Basin</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] shadow-xs">
          <span className="text-[10px] text-[var(--status-critical)] uppercase font-semibold block">High-Risk Sites</span>
          <span className="font-bold text-2xl text-[var(--status-critical)] block mt-0.5">
            {emergency.highRiskSitesCount}
          </span>
          <span className="text-[10px] text-[var(--status-critical)]">&lt; 3 days stock</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--status-surplus-bg)] border border-[var(--status-surplus-border)] shadow-xs">
          <span className="text-[10px] text-[var(--status-surplus)] uppercase font-semibold block">Available Surplus</span>
          <span className="font-bold text-2xl text-[var(--status-surplus)] block mt-0.5">
            {emergency.availableSafeSurplus.toLocaleString()}
          </span>
          <span className="text-[10px] text-[var(--status-surplus)]">Perimeter Donors</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--cream-100)] border border-[var(--sage-200)] shadow-xs">
          <span className="text-[10px] text-[var(--ink-900)] uppercase font-semibold block">Residual Shortage</span>
          <span className="font-bold text-2xl text-[var(--ink-900)] block mt-0.5">
            {allocationRun ? '0' : emergency.residualShortageUnits.toLocaleString()}
          </span>
          <span className="text-[10px] text-[var(--ink-700)]">
            {allocationRun ? 'Deficit Bridged' : 'Post-local transfer'}
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center">
          <button
            onClick={handleRunAllocation}
            disabled={allocationRun}
            className={`w-full h-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
              allocationRun
                ? 'bg-[var(--status-healthy)] text-white cursor-default'
                : 'bg-[var(--status-warning)] hover:bg-[var(--status-warning)]/90 text-white'
            }`}
          >
            {allocationRun ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Allocation Solved</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>Run Allocation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Five-Step Strip: Change → Pressure → Options → Result → Decision */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2.5">
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--ink-900)]">
            Emergency Operational Flow (5-Step Resilience Protocol)
          </span>
          <span className="text-[10px] font-mono text-[var(--status-critical)] font-semibold">
            * Approval remains human-controlled at all stages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {/* STEP 1: CHANGE */}
          <div className="p-3 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[var(--sage-700)] uppercase block">
              1. Change Signal
            </span>
            <span className="font-bold text-[var(--ink-900)] block">Flash Flood Surge</span>
            <p className="text-[11px] text-[var(--ink-700)] leading-snug">
              Surge signal +58% spike in gastro &amp; trauma admissions. Freshness: 4m.
            </p>
          </div>

          {/* STEP 2: PRESSURE */}
          <div className="p-3 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[var(--status-critical)] uppercase block">
              2. Facility Pressure
            </span>
            <span className="font-bold text-[var(--status-critical)] block">3 Acute Bottlenecks</span>
            <p className="text-[11px] text-[var(--ink-700)] leading-snug">
              PHC 184 (3.8d), PHC 091 (2.1d), and PHC 204 (1.8d) face imminent stock-out.
            </p>
          </div>

          {/* STEP 3: OPTIONS */}
          <div className="p-3 rounded-lg bg-[var(--status-surplus-bg)] border border-[var(--status-surplus-border)] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[var(--status-surplus)] uppercase block">
              3. Safe Donors
            </span>
            <span className="font-bold text-[var(--status-surplus)] block">4,700 Units Surplus</span>
            <p className="text-[11px] text-[var(--ink-700)] leading-snug">
              PHC 072 (+560u) &amp; PHC 055 (+820u) identified outside flood inundation zone.
            </p>
          </div>

          {/* STEP 4: RESULT */}
          <div className="p-3 rounded-lg bg-[var(--sage-50)] border border-[var(--sage-200)] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[var(--sage-800)] uppercase block">
              4. Post-Transfer State
            </span>
            <span className="font-bold text-[var(--sage-800)] block">Deficit: 0 Units</span>
            <p className="text-[11px] text-[var(--ink-700)] leading-snug">
              Multi-corridor transit eliminates all 3 shortages while preserving 12d donor reserves.
            </p>
          </div>

          {/* STEP 5: DECISION */}
          <div className="p-3 rounded-lg bg-[var(--cream-100)] border border-[var(--sage-200)] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[var(--ink-900)] uppercase block">
              5. Officer Decision
            </span>
            <span className="font-bold text-[var(--ink-900)] block">Explicit Sign-off</span>
            <p className="text-[11px] text-[var(--ink-700)] leading-snug">
              No automatic dispatch. Statutory authorization required by DHO controller.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Concentric Surge Rings Visual Map (Schematic Radius) */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--status-warning)]" />
            <h3 className="font-heading font-semibold text-xs text-[var(--ink-900)]">
              Concentric Surge Rings &amp; Evacuation Corridor Map
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[var(--ink-500)]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-critical)]" />
              Zone 1 (0–15 km: Epicenter)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-warning)]" />
              Zone 2 (15–30 km: Transit)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-surplus)]" />
              Zone 3 (30–50 km: Donors)
            </span>
          </div>
        </div>

        {/* Concentric Rings Schematic Canvas */}
        <div className="w-full aspect-[21/9] bg-[var(--paper-50)] rounded-xl border border-[var(--card-border)] flex items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 800 340" className="w-full h-full drop-shadow-xs">
            {/* Zone 3 Outer Ring */}
            <circle cx="400" cy="170" r="150" fill="var(--status-surplus-bg)" stroke="var(--status-surplus)" strokeWidth="1" strokeDasharray="4 4" />
            <text x="400" y="30" textAnchor="middle" fill="var(--status-surplus)" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
              ZONE 3: Safe Donor Peripheral Buffer (30–50 km)
            </text>

            {/* Zone 2 Middle Ring */}
            <circle cx="400" cy="170" r="100" fill="var(--status-warning-bg)" stroke="var(--status-warning)" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="400" y="80" textAnchor="middle" fill="var(--status-warning)" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
              ZONE 2: Triage Corridor (15–30 km)
            </text>

            {/* Zone 1 Epicenter Ring */}
            <circle cx="400" cy="170" r="45" fill="var(--status-critical-bg)" stroke="var(--status-critical)" strokeWidth="2" className="animate-pulse" />
            <text x="400" y="160" textAnchor="middle" fill="var(--status-critical)" fontSize="11" fontFamily="Sora" fontWeight="700">
              EPICENTER
            </text>
            <text x="400" y="180" textAnchor="middle" fill="var(--ink-900)" fontSize="9" fontFamily="JetBrains Mono">
              Shirur Basin Flood
            </text>

            {/* Donor Nodes */}
            {/* PHC 072 */}
            <g transform="translate(540, 240)">
              <circle r="14" fill="var(--status-surplus)" />
              <text y="-18" textAnchor="middle" fill="var(--ink-900)" fontSize="10" fontWeight="600" fontFamily="Sora">
                PHC 072 (Baramati)
              </text>
              <text y="24" textAnchor="middle" fill="var(--status-surplus)" fontSize="9" fontFamily="JetBrains Mono">
                +560u Donated
              </text>
            </g>

            {/* PHC 055 */}
            <g transform="translate(250, 230)">
              <circle r="14" fill="var(--status-surplus)" />
              <text y="-18" textAnchor="middle" fill="var(--ink-900)" fontSize="10" fontWeight="600" fontFamily="Sora">
                PHC 055 (Indapur)
              </text>
              <text y="24" textAnchor="middle" fill="var(--status-surplus)" fontSize="9" fontFamily="JetBrains Mono">
                +820u Donated
              </text>
            </g>

            {/* Inflow Arcs */}
            <line x1="540" y1="240" x2="420" y2="185" stroke="var(--sage-700)" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="250" y1="230" x2="380" y2="185" stroke="var(--sage-700)" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
        </div>
      </div>

      {/* 5. Statutory Emergency Sign-off */}
      <div className="p-4 rounded-xl border border-[var(--status-warning-border)] bg-[var(--surface-elevated)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="font-heading font-bold text-xs uppercase tracking-wide text-[var(--ink-900)] block">
            Emergency Priority Human Authorization
          </span>
          <p className="text-xs text-[var(--ink-700)] mt-0.5">
            Overrides commercial carrier contracts to requisition state transport and emergency cold vans.
          </p>
        </div>

        {signedOff ? (
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--status-healthy)] font-bold">
            <CheckCircle2 className="w-5 h-5 text-[var(--status-healthy)]" />
            <span>Emergency Allocation Dispatched (#EMG-2026-09)</span>
          </div>
        ) : (
          <button
            onClick={handleSignOff}
            disabled={!allocationRun || currentRole === 'auditor'}
            className="px-5 py-2.5 rounded-lg bg-[var(--status-warning)] hover:bg-[var(--status-warning)]/90 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-40"
          >
            <Check className="w-4 h-4" />
            <span>Authorize Emergency Mass Dispatch</span>
          </button>
        )}
      </div>
    </div>
  </div>
  );
};
