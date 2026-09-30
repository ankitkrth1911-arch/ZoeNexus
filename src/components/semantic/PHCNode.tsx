// Semantic Component: PHCNode
// Visual canvas node with operational status, exception badges, and corridor connections.
import React from 'react';
import { PHCNodeData, NodeOperationalStatus } from '../../types/decision';

interface PHCNodeProps {
  node: PHCNodeData;
  isSelected?: boolean;
  onSelect: (node: PHCNodeData) => void;
  x: number;
  y: number;
}

export const PHCNode: React.FC<PHCNodeProps> = ({
  node,
  isSelected = false,
  onSelect,
  x,
  y,
}) => {
  const getNodeVisuals = (status: NodeOperationalStatus) => {
    switch (status) {
      case 'HIGH':
        return {
          fillBg: 'var(--status-critical-bg)',
          stroke: 'var(--status-critical)',
          dot: 'var(--status-critical)',
          radius: 26,
          pulse: true,
          labelColor: 'var(--status-critical)',
        };
      case 'SURPLUS':
        return {
          fillBg: 'var(--status-surplus-bg)',
          stroke: 'var(--status-surplus)',
          dot: 'var(--status-surplus)',
          radius: 24,
          pulse: false,
          labelColor: 'var(--status-surplus)',
        };
      case 'EMERGENCY':
        return {
          fillBg: 'var(--status-warning-bg)',
          stroke: 'var(--status-warning)',
          dot: 'var(--status-warning)',
          radius: 22,
          pulse: true,
          labelColor: 'var(--status-warning)',
        };
      case 'STALE':
        return {
          fillBg: 'var(--cream-100)',
          stroke: 'var(--sage-200)',
          dot: 'var(--status-warning)',
          radius: 18,
          pulse: false,
          labelColor: 'var(--ink-700)',
        };
      case 'OFFLINE':
        return {
          fillBg: 'var(--sage-100)',
          stroke: 'var(--card-border)',
          dot: 'var(--ink-300)',
          radius: 18,
          pulse: false,
          labelColor: 'var(--ink-500)',
        };
      case 'LOW':
      default:
        return {
          fillBg: 'var(--status-healthy-bg)',
          stroke: 'var(--status-healthy)',
          dot: 'var(--status-healthy)',
          radius: 19,
          pulse: false,
          labelColor: 'var(--status-healthy)',
        };
    }
  };

  const visuals = getNodeVisuals(node.status);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => onSelect(node)}
      className="cursor-pointer group select-none transition-transform duration-150 hover:scale-105"
      role="button"
      aria-label={`PHC Node ${node.id} ${node.name}`}
    >
      {/* Outer selection ring if selected */}
      {isSelected && (
        <circle
          r={visuals.radius + 8}
          fill="none"
          stroke="var(--sage-600)"
          strokeWidth="2"
          strokeDasharray="4 2"
          className="animate-spin"
        />
      )}

      {/* Pulsing warning aura for critical / emergency nodes */}
      {visuals.pulse && (
        <circle
          r={visuals.radius + 6}
          fill="none"
          stroke={visuals.stroke}
          strokeWidth="1.5"
          opacity="0.4"
          className="animate-ping"
        />
      )}

      {/* Main Node Background Circle */}
      <circle
        r={visuals.radius}
        fill={visuals.fillBg}
        stroke={visuals.stroke}
        strokeWidth={isSelected ? 2.5 : 1.75}
        className="transition-colors drop-shadow-xs"
      />

      {/* Center status dot */}
      <circle r={6} fill={visuals.dot} />

      {/* Title above */}
      <text
        y={-(visuals.radius + 8)}
        textAnchor="middle"
        fill="var(--ink-900)"
        fontSize="11"
        fontWeight="700"
        fontFamily="Sora, sans-serif"
        className="drop-shadow-xs"
      >
        {node.id} ({node.name.split('—')[1]?.trim().split(' ')[0] || node.name})
      </text>

      {/* Metric below */}
      <text
        y={visuals.radius + 15}
        textAnchor="middle"
        fill={visuals.labelColor}
        fontSize="10"
        fontWeight="600"
        fontFamily="JetBrains Mono, monospace"
      >
        {node.status === 'HIGH'
          ? `${node.coverageDays}d · -${node.shortageUnits}u`
          : node.status === 'SURPLUS'
          ? `Surplus +${node.surplusUnits}u`
          : node.status === 'STALE'
          ? `Stale ${Math.floor(node.freshnessMinutes / 60)}h ${node.freshnessMinutes % 60}m`
          : node.status === 'OFFLINE'
          ? 'Offline'
          : `${node.coverageDays}d runway`}
      </text>
    </g>
  );
};
