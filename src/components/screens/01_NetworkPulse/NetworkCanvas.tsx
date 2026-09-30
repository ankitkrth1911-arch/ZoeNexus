// Shell Zone 1: Network Canvas (Network Pulse)
// Spec: NETWORK CANVAS fills the viewport (home = Network Pulse).
// Node states: HIGH, LOW, SURPLUS, emergency, stale, offline, no-data.
// Selecting a node keeps network context and opens the drawer: "PHC 184 · HIGH RISK · Coverage 3.8d · Shortage 410" with [Open PHC] [Open Resolve].
import React, { useState } from 'react';
import {
  Compass,
  Map,
  Layers,
  ArrowRight,
  GitMerge,
  BarChart3,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
} from 'lucide-react';
import { useResilienceStore } from '../../../store/useResilienceStore';
import { PHCNodeData, NodeOperationalStatus } from '../../../types/decision';
import { PHCNode } from '../../semantic/PHCNode';

export const NetworkCanvas: React.FC = () => {
  const {
    getPHCList,
    selectedPHCId,
    setSelectedPHCId,
    openDrawer,
    setScreen,
    mapLayerFilter,
    mapViewMode,
    setMapViewMode,
    isDrawerOpen,
  } = useResilienceStore();

  const [hoveredNode, setHoveredNode] = useState<PHCNodeData | null>(null);

  const phcs = getPHCList();
  const selectedPHC = phcs.find((p) => p.id === selectedPHCId) || phcs[0];

  // Filter nodes based on active layer filter from Floating Layer Controls
  const filteredPHCs = phcs.filter((p) => {
    if (mapLayerFilter === 'ALL') return true;
    return p.status === mapLayerFilter;
  });

  const handleNodeClick = (node: PHCNodeData) => {
    setSelectedPHCId(node.id);
    openDrawer(node.id);
  };

  // Node coordinate mappings on SVG grid (700 x 500)
  const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
    'PHC-184': { x: 380, y: 150 }, // Shirur (Receiver - Critical)
    'PHC-072': { x: 520, y: 380 }, // Baramati (Donor - Surplus)
    'PHC-091': { x: 180, y: 100 }, // Junnar (Tribal - High Risk)
    'PHC-115': { x: 260, y: 250 }, // Khed (Low/Nominal)
    'PHC-055': { x: 670, y: 410 }, // Indapur (Surplus)
    'PHC-204': { x: 190, y: 400 }, // Bhor (Emergency Surge)
    'PHC-302': { x: 330, y: 440 }, // Haveli (Stale >4h)
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[var(--paper-50)] select-none">
      {/* Subtle Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--sage-200) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {mapViewMode === 'schematic' ? (
        /* 1. Vector Schematic Canvas */
        <div className="w-full h-full flex items-center justify-center relative">
          <svg
            viewBox="0 0 850 560"
            className="w-full h-full max-w-[1400px] max-h-[850px] p-4 transition-transform duration-300"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Base Geographic Districts Boundary Indicator */}
            <path
              d="M 120,80 Q 300,40 500,70 T 800,120 Q 820,350 720,490 T 350,520 Q 150,480 100,320 Z"
              fill="none"
              stroke="var(--sage-200)"
              strokeWidth="1.2"
              strokeDasharray="6 6"
              opacity="0.6"
            />
            <text
              x="130"
              y="65"
              fill="var(--ink-300)"
              fontSize="10"
              fontFamily="JetBrains Mono"
              className="uppercase"
            >
              Maharashtra Health Sector · Pune Health District Perimeter
            </text>

            {/* CORRIDORS / HIGHWAYS */}
            {/* Corridor 1: Baramati (PHC-072) to Shirur (PHC-184) — ACTIVE LP DISPATCH ROUTE */}
            <g className="cursor-pointer group">
              {/* Outer Glow */}
              <line
                x1={NODE_COORDINATES['PHC-072'].x}
                y1={NODE_COORDINATES['PHC-072'].y}
                x2={NODE_COORDINATES['PHC-184'].x}
                y2={NODE_COORDINATES['PHC-184'].y}
                stroke="var(--sage-600)"
                strokeWidth="7"
                opacity="0.15"
              />
              {/* Animated Dashed Flow Line */}
              <line
                x1={NODE_COORDINATES['PHC-072'].x}
                y1={NODE_COORDINATES['PHC-072'].y}
                x2={NODE_COORDINATES['PHC-184'].x}
                y2={NODE_COORDINATES['PHC-184'].y}
                stroke="var(--sage-600)"
                strokeWidth="2.5"
                strokeDasharray="8 5"
                className="animate-pulse"
              />
              {/* Corridor Highway Pill */}
              <g transform="translate(440, 260)">
                <rect
                  x="-55"
                  y="-12"
                  width="110"
                  height="24"
                  rx="6"
                  fill="var(--card-bg)"
                  stroke="var(--sage-600)"
                  strokeWidth="1.25"
                  className="shadow-xs"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="var(--ink-900)"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="700"
                >
                  NH-48 · 18km (42m)
                </text>
              </g>
            </g>

            {/* Corridor 2: Junnar (PHC-091) to Khed (PHC-115) */}
            <g>
              <line
                x1={NODE_COORDINATES['PHC-091'].x}
                y1={NODE_COORDINATES['PHC-091'].y}
                x2={NODE_COORDINATES['PHC-115'].x}
                y2={NODE_COORDINATES['PHC-115'].y}
                stroke="var(--card-border)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text
                x="210"
                y="180"
                fill="var(--ink-500)"
                fontSize="9"
                fontFamily="JetBrains Mono"
              >
                SH-11 · 31km
              </text>
            </g>

            {/* Corridor 3: Khed to Shirur */}
            <g>
              <line
                x1={NODE_COORDINATES['PHC-115'].x}
                y1={NODE_COORDINATES['PHC-115'].y}
                x2={NODE_COORDINATES['PHC-184'].x}
                y2={NODE_COORDINATES['PHC-184'].y}
                stroke="var(--card-border)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text
                x="310"
                y="210"
                fill="var(--ink-500)"
                fontSize="9"
                fontFamily="JetBrains Mono"
              >
                44km (Infeasible Buffer)
              </text>
            </g>

            {/* Corridor 4: Baramati to Indapur */}
            <line
              x1={NODE_COORDINATES['PHC-072'].x}
              y1={NODE_COORDINATES['PHC-072'].y}
              x2={NODE_COORDINATES['PHC-055'].x}
              y2={NODE_COORDINATES['PHC-055'].y}
              stroke="var(--card-border)"
              strokeWidth="1.5"
            />
            <text
              x="585"
              y="405"
              fill="var(--ink-500)"
              fontSize="9"
              fontFamily="JetBrains Mono"
            >
              26km
            </text>

            {/* Corridor 5: Bhor (Emergency) */}
            <line
              x1={NODE_COORDINATES['PHC-204'].x}
              y1={NODE_COORDINATES['PHC-204'].y}
              x2={NODE_COORDINATES['PHC-072'].x}
              y2={NODE_COORDINATES['PHC-072'].y}
              stroke="var(--status-warning)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* NODES RENDERING */}
            {filteredPHCs.map((node) => {
              const coords = NODE_COORDINATES[node.id] || { x: 400, y: 300 };
              return (
                <PHCNode
                  key={node.id}
                  node={node}
                  x={coords.x}
                  y={coords.y}
                  isSelected={node.id === selectedPHCId}
                  onSelect={handleNodeClick}
                />
              );
            })}
          </svg>
        </div>
      ) : (
        /* 2. Cartographic GIS Map View */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--sage-100)] flex items-center justify-center text-[var(--sage-700)] mb-3 shadow-xs">
            <Map className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-base text-[var(--ink-900)]">
            GIS Cartographic Layer (Leaflet OpenStreetMap Tiles)
          </h3>
          <p className="text-xs text-[var(--ink-700)] max-w-lg mt-1 leading-relaxed">
            Geospatial coordinates centered on Pune Health District (18.5204° N, 73.8567° E). Node latitude/longitude points and road routing corridors rendered to scale.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setMapViewMode('schematic')}
              className="px-4 py-2 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Switch to High-Density Schematic Network
            </button>
          </div>
        </div>
      )}

      {/* 3. Floating Bottom-Left Node Summary Bar (Context persistence) */}
      <div
        className={`absolute bottom-6 left-6 z-30 transition-all duration-300 pointer-events-auto ${
          isDrawerOpen ? 'max-w-md' : 'max-w-lg'
        }`}
      >
        <div className="p-3 rounded-2xl bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--card-border)] shadow-elevated flex items-center justify-between gap-4">
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-[var(--ink-900)]">
                {selectedPHC.id}
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                  selectedPHC.status === 'HIGH'
                    ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] border border-[var(--status-critical-border)]'
                    : selectedPHC.status === 'SURPLUS'
                    ? 'bg-[var(--status-surplus-bg)] text-[var(--status-surplus)] border border-[var(--status-surplus-border)]'
                    : 'bg-[var(--status-healthy-bg)] text-[var(--status-healthy)] border border-[var(--status-healthy-border)]'
                }`}
              >
                {selectedPHC.status} RISK
              </span>
            </div>

            <div className="text-[11px] text-[var(--ink-700)] font-mono truncate mt-0.5">
              Coverage: <strong>{selectedPHC.coverageDays}d</strong> · Shortage: <strong>{selectedPHC.shortageUnits} units</strong> ({selectedPHC.primaryMedicine.split('(')[0]})
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setScreen('phc')}
              className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--paper-50)] text-xs text-[var(--ink-900)] font-medium hover:bg-[var(--card-hover)] flex items-center gap-1 transition-colors cursor-pointer"
              title="Inspect demand forecast, bed occupancy and capacity"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[var(--sage-600)]" />
              <span>Open PHC</span>
            </button>

            <button
              onClick={() => openDrawer(selectedPHC.id)}
              className="px-3 py-1.5 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              title="Inspect donor candidates, OR-Tools constraints, and Gemini rationale"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Open Resolve</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
