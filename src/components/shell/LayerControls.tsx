// Shell Zone 3: Floating Layer Controls
// Spec: FLOATING LAYER CONTROLS (top-right, compact icons with tooltips): map layers (risk / stock / surplus / emergency), theme, role switcher.
import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Map,
  Sun,
  Moon,
  UserCheck,
  Sparkles,
  Filter,
  Check,
  ChevronDown,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';
import { UserRole } from '../../types/decision';

export const LayerControls: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currentRole,
    setCurrentRole,
    openTour,
    mapLayerFilter,
    setMapLayerFilter,
    mapViewMode,
    setMapViewMode,
    isDrawerOpen,
  } = useResilienceStore();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const layersMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (layersMenuRef.current && !layersMenuRef.current.contains(e.target as Node)) {
        setShowLayersMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ROLES: { id: UserRole; title: string; subtitle: string }[] = [
    {
      id: 'district_officer',
      title: 'District / State Officer',
      subtitle: 'Read network + evidence, approve/reject transfers',
    },
    {
      id: 'phc_operator',
      title: 'PHC Operator',
      subtitle: 'Read own PHC, update stock / beds / staff',
    },
    {
      id: 'emergency_controller',
      title: 'Emergency Controller',
      subtitle: 'Read emergency scope, trigger emergency state / approve',
    },
    {
      id: 'federation_admin',
      title: 'Federation Admin',
      subtitle: 'Read federation metadata, control round',
    },
    {
      id: 'auditor',
      title: 'Auditor (Read-Only)',
      subtitle: 'Read evidence & hashes, strictly no modifications',
    },
  ];

  const LAYER_OPTIONS: { id: 'ALL' | 'HIGH' | 'SURPLUS' | 'EMERGENCY' | 'STALE' | 'OFFLINE'; label: string; dot: string }[] = [
    { id: 'ALL', label: 'All PHC Nodes (98)', dot: 'bg-[var(--sage-600)]' },
    { id: 'HIGH', label: 'Critical Risk Only (<5d)', dot: 'bg-[var(--status-critical)]' },
    { id: 'SURPLUS', label: 'Safe Surplus Donors (>15d)', dot: 'bg-[var(--status-surplus)]' },
    { id: 'EMERGENCY', label: 'Surge Incident Zone', dot: 'bg-[var(--status-warning)]' },
    { id: 'STALE', label: 'Stale Telemetry (>4h)', dot: 'bg-[var(--cream-100)]' },
    { id: 'OFFLINE', label: 'Offline Clinics', dot: 'bg-[var(--ink-300)]' },
  ];

  return (
    <div
      className={`absolute top-4 z-30 transition-all duration-300 flex items-center gap-1.5 select-none ${
        isDrawerOpen ? 'right-[490px] lg:right-[530px]' : 'right-4'
      }`}
    >
      {/* 1. 60-Second Judge Tour Launcher */}
      <button
        onClick={openTour}
        className="px-3 py-1.5 rounded-full bg-[var(--cream-100)] hover:bg-[var(--cream-50)] text-[var(--ink-900)] border border-[var(--sage-200)] shadow-elevated text-xs font-heading font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Launch 60-second guided judge walkthrough"
      >
        <Sparkles className="w-3.5 h-3.5 text-[var(--status-warning)] animate-spin" />
        <span className="hidden sm:inline">60s Demo Tour</span>
        <span className="sm:hidden">Tour</span>
      </button>

      {/* 2. Map Layer Filter Menu */}
      <div ref={layersMenuRef} className="relative">
        <button
          onClick={() => setShowLayersMenu(!showLayersMenu)}
          className={`p-2 rounded-full border shadow-elevated transition-colors cursor-pointer ${
            mapLayerFilter !== 'ALL'
              ? 'bg-[var(--sage-600)] text-white border-[var(--sage-600)]'
              : 'bg-[var(--card-bg)] text-[var(--ink-700)] border-[var(--card-border)] hover:bg-[var(--card-hover)]'
          }`}
          title="Filter Canvas Layers"
          aria-label="Filter Layers"
        >
          <Filter className="w-4 h-4" />
        </button>

        {showLayersMenu && (
          <div className="absolute right-0 top-11 w-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-elevated p-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] border-b border-[var(--card-border)]/60">
              Filter Active Map Canvas
            </div>
            {LAYER_OPTIONS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => {
                  setMapLayerFilter(layer.id);
                  setShowLayersMenu(false);
                }}
                className={`w-full p-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                  mapLayerFilter === layer.id
                    ? 'bg-[var(--sage-50)] text-[var(--ink-900)] font-semibold border border-[var(--sage-600)]/40'
                    : 'hover:bg-[var(--card-hover)] text-[var(--ink-700)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${layer.dot}`} />
                  <span>{layer.label}</span>
                </div>
                {mapLayerFilter === layer.id && (
                  <Check className="w-3.5 h-3.5 text-[var(--sage-600)]" />
                )}
              </button>
            ))}

            {/* View Mode (Schematic vs Geo GIS) */}
            <div className="pt-1.5 border-t border-[var(--card-border)]/60 flex items-center justify-between text-[11px] px-1 font-mono">
              <span className="text-[var(--ink-500)]">View:</span>
              <button
                onClick={() => setMapViewMode(mapViewMode === 'schematic' ? 'geo' : 'schematic')}
                className="px-2 py-0.5 rounded bg-[var(--paper-50)] hover:bg-[var(--card-hover)] text-[var(--sage-700)] font-bold border border-[var(--card-border)]"
              >
                {mapViewMode === 'schematic' ? 'Switch to GIS Map' : 'Switch to Schematic'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Role Switcher */}
      <div ref={roleMenuRef} className="relative">
        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="px-2.5 py-1.5 rounded-full bg-[var(--card-bg)] text-[var(--ink-700)] border border-[var(--card-border)] shadow-elevated hover:bg-[var(--card-hover)] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Switch User Role Persona"
          aria-label="Switch User Role"
        >
          <UserCheck className="w-3.5 h-3.5 text-[var(--sage-600)]" />
          <span className="hidden md:inline font-bold">
            {currentRole === 'district_officer'
              ? 'Officer'
              : currentRole === 'phc_operator'
              ? 'Operator'
              : currentRole === 'emergency_controller'
              ? 'Surge Lead'
              : currentRole === 'federation_admin'
              ? 'Fed Admin'
              : 'Auditor'}
          </span>
          <ChevronDown className="w-3 h-3 text-[var(--ink-400)]" />
        </button>

        {showRoleMenu && (
          <div className="absolute right-0 top-11 w-72 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-elevated p-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] border-b border-[var(--card-border)]/60">
              Role-Based UI Contract
            </div>
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setCurrentRole(r.id);
                  setShowRoleMenu(false);
                }}
                className={`w-full p-2 rounded-lg text-left transition-colors flex items-start gap-2 ${
                  currentRole === r.id
                    ? 'bg-[var(--sage-50)] border border-[var(--sage-600)]/40 shadow-xs'
                    : 'hover:bg-[var(--card-hover)]'
                }`}
              >
                <div className="mt-0.5">
                  {currentRole === r.id ? (
                    <Check className="w-3.5 h-3.5 text-[var(--sage-600)]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[var(--card-border)]" />
                  )}
                </div>
                <div>
                  <div className="font-heading font-semibold text-[11px] text-[var(--ink-900)]">
                    {r.title}
                  </div>
                  <div className="text-[10px] text-[var(--ink-500)] leading-tight">
                    {r.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Theme Toggle (Light / Night Ops) */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-[var(--card-bg)] text-[var(--ink-700)] border border-[var(--card-border)] shadow-elevated hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
        title={theme === 'light' ? 'Switch to Night Ops Theme' : 'Switch to Daylight Medical Theme'}
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4 text-[var(--ink-700)]" />
        ) : (
          <Sun className="w-4 h-4 text-[var(--status-warning)]" />
        )}
      </button>
    </div>
  );
};
