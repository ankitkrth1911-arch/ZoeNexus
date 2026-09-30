// 01 Network Pulse: "Where is the problem?"
import React, { useState } from 'react';
import {
  Layers,
  Map,
  Compass,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useResilienceStore } from '../../../store/useResilienceStore';
import { NodeOperationalStatus } from '../../../types/decision';

export const NetworkPulseScreen: React.FC = () => {
  const {
    getPHCList,
    selectedPHCId,
    setSelectedPHCId,
    openDrawer,
    setScreen,
  } = useResilienceStore();

  const [viewMode, setViewMode] = useState<'schematic' | 'geo'>('schematic');
  const [statusFilter, setStatusFilter] = useState<'ALL' | NodeOperationalStatus>('ALL');

  const phcs = getPHCList();
  const selectedPHC = phcs.find((p) => p.id === selectedPHCId) || phcs[0];

  const filteredPHCs = statusFilter === 'ALL' ? phcs : phcs.filter((p) => p.status === statusFilter);

  // Status Colors & Badges mapping
  const getStatusBadge = (status: NodeOperationalStatus) => {
    switch (status) {
      case 'HIGH':
        return {
          bg: 'bg-[var(--status-critical-bg)]',
          border: 'border-[var(--status-critical-border)]',
          text: 'text-[var(--status-critical)]',
          dot: 'bg-[var(--status-critical)]',
          label: 'High Risk'
        };
      case 'SURPLUS':
        return {
          bg: 'bg-[var(--status-surplus-bg)]',
          border: 'border-[var(--status-surplus-border)]',
          text: 'text-[var(--status-surplus)]',
          dot: 'bg-[var(--status-surplus)]',
          label: 'Safe Surplus'
        };
      case 'EMERGENCY':
        return {
          bg: 'bg-[var(--status-warning-bg)]',
          border: 'border-[var(--status-warning-border)]',
          text: 'text-[var(--status-warning)]',
          dot: 'bg-[var(--status-warning)]',
          label: 'Emergency Zone'
        };
      case 'STALE':
        return {
          bg: 'bg-[var(--cream-100)]',
          border: 'border-[var(--sage-200)]',
          text: 'text-[var(--ink-700)]',
          dot: 'bg-[var(--status-warning)]',
          label: 'Stale (>4h)'
        };
      case 'OFFLINE':
        return {
          bg: 'bg-[var(--sage-100)]',
          border: 'border-[var(--card-border)]',
          text: 'text-[var(--ink-500)]',
          dot: 'bg-[var(--ink-300)]',
          label: 'Offline'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-[var(--status-healthy-bg)]',
          border: 'border-[var(--status-healthy-border)]',
          text: 'text-[var(--status-healthy)]',
          dot: 'bg-[var(--status-healthy)]',
          label: 'Safe / Low Risk'
        };
    }
  };

  return (
    <div className="space-y-4 select-none animate-in fade-in duration-200">
      {/* 1. Header Strip: Question + KPI Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--sage-700)] font-bold">
              Screen 01 · Scan Layer
            </span>
            <span className="text-[10px] font-mono text-[var(--ink-500)]">
              Pune Health District Network
            </span>
          </div>
          <h1 className="font-heading font-bold text-lg text-[var(--ink-900)] mt-0.5">
            Network Pulse — "Where is the problem?"
          </h1>
          <p className="text-xs text-[var(--ink-700)] mt-0.5 max-w-2xl">
            Real-time supply chain telemetry across all monitored Primary Health Centres. Exceptions, stock-outs, and surplus buffers are visible at a glance before opening any facility.
          </p>
        </div>

        {/* Top 4 Honest KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono shrink-0">
          <div className="p-2 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] text-center">
            <span className="text-[10px] text-[var(--ink-500)] uppercase block">Monitored PHCs</span>
            <span className="font-bold text-sm text-[var(--ink-900)]">98 / 98</span>
          </div>
          <div className="p-2 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] text-center">
            <span className="text-[10px] text-[var(--status-critical)] uppercase font-semibold block">Critical Risks</span>
            <span className="font-bold text-sm text-[var(--status-critical)]">2 Sites</span>
          </div>
          <div className="p-2 rounded-lg bg-[var(--status-surplus-bg)] border border-[var(--status-surplus-border)] text-center">
            <span className="text-[10px] text-[var(--status-surplus)] uppercase font-semibold block">Safe Donors</span>
            <span className="font-bold text-sm text-[var(--status-surplus)]">3 Nodes</span>
          </div>
          <div className="p-2 rounded-lg bg-[var(--cream-100)] border border-[var(--sage-200)] text-center">
            <span className="text-[10px] text-[var(--ink-900)] uppercase font-semibold block">Deficit Units</span>
            <span className="font-bold text-sm text-[var(--ink-900)]">410 req.</span>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Filter Pills + Schematic / Geo View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-xs shadow-xs">
        {/* Exception Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-[var(--ink-500)] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Exceptions:
          </span>

          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-[var(--sage-600)] text-white font-semibold'
                : 'bg-[var(--paper-50)] text-[var(--ink-700)] hover:bg-[var(--card-hover)]'
            }`}
          >
            All ({phcs.length})
          </button>

          <button
            onClick={() => setStatusFilter('HIGH')}
            className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
              statusFilter === 'HIGH'
                ? 'bg-[var(--status-critical)] text-white font-semibold'
                : 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] hover:opacity-80'
            }`}
          >
            High Risk (2)
          </button>

          <button
            onClick={() => setStatusFilter('SURPLUS')}
            className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
              statusFilter === 'SURPLUS'
                ? 'bg-[var(--status-surplus)] text-white font-semibold'
                : 'bg-[var(--status-surplus-bg)] text-[var(--status-surplus)] hover:opacity-80'
            }`}
          >
            Safe Surplus (2)
          </button>

          <button
            onClick={() => setStatusFilter('EMERGENCY')}
            className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
              statusFilter === 'EMERGENCY'
                ? 'bg-[var(--status-warning)] text-white font-semibold'
                : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] hover:opacity-80'
            }`}
          >
            Emergency (1)
          </button>

          <button
            onClick={() => setStatusFilter('STALE')}
            className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
              statusFilter === 'STALE'
                ? 'bg-[var(--sage-700)] text-white font-semibold'
                : 'bg-[var(--cream-100)] text-[var(--ink-900)] hover:opacity-80'
            }`}
          >
            Stale &gt;4h (1)
          </button>

          <button
            onClick={() => setStatusFilter('OFFLINE')}
            className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
              statusFilter === 'OFFLINE'
                ? 'bg-[var(--ink-700)] text-white font-semibold'
                : 'bg-[var(--sage-100)] text-[var(--ink-700)] hover:opacity-80'
            }`}
          >
            Offline (1)
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[var(--paper-50)] p-1 rounded-md border border-[var(--card-border)]">
          <button
            onClick={() => setViewMode('schematic')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'schematic'
                ? 'bg-[var(--card-bg)] text-[var(--ink-900)] shadow-xs font-semibold'
                : 'text-[var(--ink-500)] hover:text-[var(--ink-900)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[var(--sage-600)]" />
            <span>Schematic Network</span>
          </button>

          <button
            onClick={() => setViewMode('geo')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'geo'
                ? 'bg-[var(--card-bg)] text-[var(--ink-900)] shadow-xs font-semibold'
                : 'text-[var(--ink-500)] hover:text-[var(--ink-900)]'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-[var(--sage-600)]" />
            <span>GIS Map View</span>
          </button>
        </div>
      </div>

      {/* 3. Main Network Canvas Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Interactive Schematic / Map Canvas */}
        <div className="lg:col-span-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xs overflow-hidden flex flex-col min-h-[520px]">
          {/* Canvas Sub-header */}
          <div className="px-4 py-2.5 border-b border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[var(--sage-600)]" />
              <span className="font-heading font-semibold text-[var(--ink-900)]">
                {viewMode === 'schematic'
                  ? 'Topology & Inter-Facility Transit Corridors'
                  : 'Geospatial PHC Coordinates (Maharashtra Grid)'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--ink-500)]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--status-critical)] animate-ping" />
                Active Shortage
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--status-surplus)]" />
                Safe Donor
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--status-healthy)]" />
                Nominal Stock
              </span>
            </div>
          </div>

          {/* Canvas Content */}
          <div className="flex-1 p-4 relative bg-[var(--paper-50)]/50 flex items-center justify-center overflow-auto">
            {viewMode === 'schematic' ? (
              /* High-Density SVG Schematic Network Topology */
              <div className="w-full max-w-2xl aspect-[4/3] relative flex items-center justify-center">
                <svg viewBox="0 0 700 480" className="w-full h-full drop-shadow-xs">
                  {/* Road Corridors / Arcs */}
                  {/* Corridor 1: Baramati (PHC-072) to Shirur (PHC-184) - ACTIVE ALLOCATION */}
                  <g className="cursor-pointer">
                    <line
                      x1="450"
                      y1="360"
                      x2="320"
                      y2="140"
                      stroke="var(--sage-600)"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                    <rect x="365" y="240" width="84" height="20" rx="4" fill="var(--card-bg)" stroke="var(--sage-600)" strokeWidth="1" />
                    <text x="407" y="254" textAnchor="middle" fill="var(--ink-900)" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
                      NH-48 · 18km
                    </text>
                  </g>

                  {/* Corridor 2: Junnar (PHC-091) to Khed (PHC-115) */}
                  <line x1="160" y1="90" x2="220" y2="240" stroke="var(--card-border)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="180" y="170" fill="var(--ink-500)" fontSize="9" fontFamily="JetBrains Mono">
                    SH-11 · 31km
                  </text>

                  {/* Corridor 3: Khed to Shirur */}
                  <line x1="220" y1="240" x2="320" y2="140" stroke="var(--card-border)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="260" y="195" fill="var(--ink-500)" fontSize="9" fontFamily="JetBrains Mono">
                    44km
                  </text>

                  {/* Corridor 4: Baramati to Indapur (PHC-055) */}
                  <line x1="450" y1="360" x2="590" y2="390" stroke="var(--card-border)" strokeWidth="1.5" />
                  <text x="515" y="370" fill="var(--ink-500)" fontSize="9" fontFamily="JetBrains Mono">
                    26km
                  </text>

                  {/* Corridor 5: Bhor (PHC-204 Emergency) */}
                  <line x1="170" y1="380" x2="450" y2="360" stroke="var(--status-warning)" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Nodes Rendering */}
                  {/* 1. PHC-184 (Shirur - CRITICAL RECEIVER) */}
                  <g
                    transform="translate(320, 140)"
                    onClick={() => {
                      setSelectedPHCId('PHC-184');
                      openDrawer('PHC-184');
                    }}
                    className="cursor-pointer group"
                  >
                    <circle r="26" fill="var(--status-critical-bg)" stroke="var(--status-critical)" strokeWidth="2" />
                    <circle r="34" fill="none" stroke="var(--status-critical)" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" />
                    <circle r="8" fill="var(--status-critical)" />
                    <text y="-32" textAnchor="middle" fill="var(--ink-900)" fontSize="11" fontWeight="700" fontFamily="Sora">
                      PHC 184 (Shirur)
                    </text>
                    <text y="44" textAnchor="middle" fill="var(--status-critical)" fontSize="10" fontWeight="600" fontFamily="JetBrains Mono">
                      Coverage 3.8d · -410 units
                    </text>
                  </g>

                  {/* 2. PHC-072 (Baramati - SAFE SURPLUS DONOR) */}
                  <g
                    transform="translate(450, 360)"
                    onClick={() => {
                      setSelectedPHCId('PHC-072');
                      openDrawer('PHC-072');
                    }}
                    className="cursor-pointer group"
                  >
                    <circle r="24" fill="var(--status-surplus-bg)" stroke="var(--status-surplus)" strokeWidth="2" />
                    <circle r="7" fill="var(--status-surplus)" />
                    <text y="-30" textAnchor="middle" fill="var(--ink-900)" fontSize="11" fontWeight="700" fontFamily="Sora">
                      PHC 072 (Baramati)
                    </text>
                    <text y="40" textAnchor="middle" fill="var(--status-surplus)" fontSize="10" fontWeight="600" fontFamily="JetBrains Mono">
                      Surplus +560 · 14.8d
                    </text>
                  </g>

                  {/* 3. PHC-091 (Junnar - HIGH RISK) */}
                  <g
                    transform="translate(160, 90)"
                    onClick={() => {
                      setSelectedPHCId('PHC-091');
                      openDrawer('PHC-091');
                    }}
                    className="cursor-pointer group"
                  >
                    <circle r="20" fill="var(--status-critical-bg)" stroke="var(--status-critical)" strokeWidth="1.5" />
                    <circle r="6" fill="var(--status-critical)" />
                    <text y="-25" textAnchor="middle" fill="var(--ink-900)" fontSize="10" fontWeight="600" fontFamily="Sora">
                      PHC 091 (Junnar)
                    </text>
                    <text y="34" textAnchor="middle" fill="var(--status-critical)" fontSize="9" fontFamily="JetBrains Mono">
                      2.1d coverage
                    </text>
                  </g>

                  {/* 4. PHC-115 (Khed - LOW) */}
                  <g
                    transform="translate(220, 240)"
                    onClick={() => {
                      setSelectedPHCId('PHC-115');
                      openDrawer('PHC-115');
                    }}
                    className="cursor-pointer group"
                  >
                    <circle r="18" fill="var(--sage-100)" stroke="var(--sage-600)" strokeWidth="1.5" />
                    <circle r="5" fill="var(--sage-600)" />
                    <text y="-22" textAnchor="middle" fill="var(--ink-900)" fontSize="10" fontWeight="500" fontFamily="Sora">
                      PHC 115 (Khed)
                    </text>
                    <text y="30" textAnchor="middle" fill="var(--ink-700)" fontSize="9" fontFamily="JetBrains Mono">
                      6.4d stock
                    </text>
                  </g>

                  {/* 5. PHC-055 (Indapur - SURPLUS) */}
                  <g
                    transform="translate(590, 390)"
                    onClick={() => {
                      setSelectedPHCId('PHC-055');
                      openDrawer('PHC-055');
                    }}
                    className="cursor-pointer group"
                  >
                    <circle r="18" fill="var(--status-surplus-bg)" stroke="var(--status-surplus)" strokeWidth="1.5" />
                    <circle r="5" fill="var(--status-surplus)" />
                    <text y="-22" textAnchor="middle" fill="var(--ink-900)" fontSize="10" fontWeight="500" fontFamily="Sora">
                      PHC 055 (Indapur)
                    </text>
                    <text y="30" textAnchor="middle" fill="var(--status-surplus)" fontSize="9" fontFamily="JetBrains Mono">
                      Surplus +820
                    </text>
                  </g>

                  {/* 6. PHC-204 (Bhor - EMERGENCY) */}
                  <g
                    transform="translate(170, 380)"
                    onClick={() => {
                      setSelectedPHCId('PHC-204');
                      openDrawer('PHC-204');
                    }}
                    className="cursor-pointer group"
                  >
                    <circle r="22" fill="var(--status-warning-bg)" stroke="var(--status-warning)" strokeWidth="2" strokeDasharray="2 2" />
                    <circle r="6" fill="var(--status-warning)" />
                    <text y="-26" textAnchor="middle" fill="var(--ink-900)" fontSize="10" fontWeight="600" fontFamily="Sora">
                      PHC 204 (Bhor)
                    </text>
                    <text y="32" textAnchor="middle" fill="var(--status-warning)" fontSize="9" fontFamily="JetBrains Mono">
                      Emergency Surge
                    </text>
                  </g>

                  {/* 7. PHC-302 (Haveli - STALE) */}
                  <g
                    transform="translate(280, 420)"
                    onClick={() => {
                      setSelectedPHCId('PHC-302');
                      openDrawer('PHC-302');
                    }}
                    className="cursor-pointer group"
                  >
                    <circle r="16" fill="var(--cream-100)" stroke="var(--sage-200)" strokeWidth="1.5" />
                    <circle r="4" fill="var(--status-warning)" />
                    <text y="-20" textAnchor="middle" fill="var(--ink-700)" fontSize="9" fontFamily="Sora">
                      PHC 302 (Haveli)
                    </text>
                    <text y="28" textAnchor="middle" fill="var(--ink-500)" fontSize="8" fontFamily="JetBrains Mono">
                      Stale 4h 12m
                    </text>
                  </g>
                </svg>
              </div>
            ) : (
              /* GIS Map View representation */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--sage-100)] flex items-center justify-center text-[var(--sage-700)] mb-3">
                  <Map className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-[var(--ink-900)]">
                  Geospatial Cartographic Layer
                </h3>
                <p className="text-xs text-[var(--ink-700)] max-w-md mt-1 leading-relaxed">
                  Displaying Leaflet tiles centered on coordinates 18.5204° N, 73.8567° E with custom subdued light tiles conforming to the approved palette.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('schematic')}
                    className="px-3 py-1.5 rounded-md bg-[var(--sage-600)] text-white text-xs font-medium hover:bg-[var(--sage-700)] transition-colors"
                  >
                    Switch Back to Schematic Network
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Facility Telemetry & Action Strip */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Facility Card */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-[var(--ink-500)] uppercase block">
                  Active Facility Telemetry
                </span>
                <h3 className="font-heading font-bold text-base text-[var(--ink-900)] mt-0.5">
                  {selectedPHC.name}
                </h3>
                <span className="text-xs text-[var(--ink-700)] font-mono">
                  District: {selectedPHC.districtName}
                </span>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  getStatusBadge(selectedPHC.status).bg
                } ${getStatusBadge(selectedPHC.status).text} ${
                  getStatusBadge(selectedPHC.status).border
                }`}
              >
                {selectedPHC.status}
              </span>
            </div>

            {/* Coverage & Shortage Block */}
            <div className="p-3 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--ink-700)]">Target Medicine:</span>
                <span className="font-semibold text-[var(--ink-900)] truncate max-w-[180px]">
                  {selectedPHC.primaryMedicine}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--ink-700)]">Current Stock:</span>
                <span className="font-bold text-[var(--ink-900)]">{selectedPHC.currentStock} units</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--ink-700)]">Coverage Runway:</span>
                <span
                  className={`font-bold ${
                    selectedPHC.coverageDays < 5
                      ? 'text-[var(--status-critical)]'
                      : 'text-[var(--status-healthy)]'
                  }`}
                >
                  {selectedPHC.coverageDays} days left
                </span>
              </div>
              {selectedPHC.shortageUnits > 0 && (
                <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-[var(--card-border)]/60">
                  <span className="text-[var(--status-critical)] font-bold">Unmet Deficit:</span>
                  <span className="text-[var(--status-critical)] font-bold text-sm">
                    {selectedPHC.shortageUnits} units
                  </span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setScreen('phc')}
                className="py-2 px-3 rounded-lg border border-[var(--card-border)] bg-[var(--paper-50)] text-xs text-[var(--ink-900)] font-medium hover:bg-[var(--card-hover)] flex items-center justify-center gap-1 transition-colors"
              >
                <span>Open PHC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setScreen('resolve');
                  openDrawer(selectedPHC.id);
                }}
                className="py-2 px-3 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <span>Open Resolve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Exception Queue Preview */}
          <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold text-[var(--ink-900)]">
                Network Exceptions ({filteredPHCs.length})
              </span>
              <button
                onClick={() => setScreen('risks')}
                className="text-[11px] font-mono text-[var(--sage-700)] hover:underline"
              >
                View Full Queue &rarr;
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {filteredPHCs.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPHCId(p.id);
                    openDrawer(p.id);
                  }}
                  className={`w-full p-2 rounded-lg text-left text-xs border flex items-center justify-between transition-colors ${
                    p.id === selectedPHCId
                      ? 'bg-[var(--sage-50)] border-[var(--sage-600)] shadow-xs'
                      : 'bg-[var(--paper-50)] border-[var(--card-border)] hover:bg-[var(--card-hover)]'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-mono font-semibold text-[var(--ink-900)]">{p.id}</div>
                    <div className="text-[11px] text-[var(--ink-500)] truncate">{p.name.split('—')[1]}</div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px]">
                    <span
                      className={`block font-bold ${
                        p.coverageDays < 5
                          ? 'text-[var(--status-critical)]'
                          : p.status === 'SURPLUS'
                          ? 'text-[var(--status-surplus)]'
                          : 'text-[var(--ink-700)]'
                      }`}
                    >
                      {p.coverageDays}d
                    </span>
                    <span className="text-[10px] text-[var(--ink-500)]">{p.currentStock} units</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
