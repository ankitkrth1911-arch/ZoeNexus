// Operations Rail (Left Collapsible Navigation)
import React from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  GitMerge,
  Network,
  ShieldAlert,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';
import { ScreenId } from '../../types/decision';

interface NavItem {
  id: ScreenId;
  label: string;
  badge?: string;
  badgeColor?: string;
  shortcut: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'pulse',
    label: 'Network Pulse',
    shortcut: '1',
    icon: Activity,
    description: 'Where is the problem? Geo & schematic state of all PHC nodes.'
  },
  {
    id: 'risks',
    label: 'Risk Radar',
    badge: '2 Critical',
    badgeColor: 'bg-[var(--status-critical)] text-white',
    shortcut: '2',
    icon: AlertTriangle,
    description: 'Which PHC needs attention first? Exception-first operational queue.'
  },
  {
    id: 'phc',
    label: 'PHC Workspace',
    shortcut: '3',
    icon: BarChart3,
    description: 'Why is this PHC at risk? Deep-dive forecast, stock trajectory & capacity.'
  },
  {
    id: 'resolve',
    label: 'Resolve Shortage',
    badge: 'Plan Ready',
    badgeColor: 'bg-[var(--status-surplus)] text-white',
    shortcut: '4',
    icon: GitMerge,
    description: 'Signature decision surface: Donors, OR-Tools constraints, Gemini & Approval.'
  },
  {
    id: 'federation',
    label: 'Federation Engine',
    badge: 'Round 75',
    badgeColor: 'bg-[var(--cream-100)] text-[var(--ink-900)]',
    shortcut: '5',
    icon: Network,
    description: 'Privacy-preserving edge learning across clinics without raw data pooling.'
  },
  {
    id: 'emergency',
    label: 'Emergency Mode',
    badge: 'Surge L2',
    badgeColor: 'bg-[var(--status-warning)] text-white',
    shortcut: '6',
    icon: ShieldAlert,
    description: 'Concentric surge rings & priority override for disaster allocations.'
  },
  {
    id: 'audit',
    label: 'Audit Trail',
    shortcut: '7',
    icon: FileCheck2,
    description: 'Trust is a visible state. Cryptographic evidence reconstruction chain.'
  }
];

export const OperationsRail: React.FC = () => {
  const { screen, setScreen, isRailCollapsed, toggleRail, openTour } = useResilienceStore();

  return (
    <aside
      className={`h-full bg-[var(--card-bg)] border-r border-[var(--card-border)] flex flex-col justify-between transition-all duration-200 z-30 select-none ${
        isRailCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Operations Rail"
    >
      {/* Top Header / Brand */}
      <div>
        <div className="h-14 border-b border-[var(--card-border)] flex items-center justify-between px-3.5">
          {!isRailCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-md bg-[var(--sage-600)] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0 shadow-sm">
                PHC
              </div>
              <div className="flex flex-col truncate">
                <span className="font-heading font-semibold text-xs text-[var(--ink-900)] tracking-tight truncate">
                  PHC FEDERATED AI
                </span>
                <span className="text-[10px] text-[var(--ink-500)] tracking-normal uppercase font-mono">
                  BRICS Resilience v2.4
                </span>
              </div>
            </div>
          )}

          {isRailCollapsed && (
            <div className="w-8 h-8 rounded-md bg-[var(--sage-600)] text-white flex items-center justify-center font-heading font-bold text-xs mx-auto shadow-sm">
              P
            </div>
          )}

          <button
            onClick={toggleRail}
            title={isRailCollapsed ? 'Expand operations rail' : 'Collapse operations rail'}
            className="p-1 rounded text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[var(--sage-100)] transition-colors"
          >
            {isRailCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = screen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                title={isRailCollapsed ? `${item.label} (${item.shortcut})` : item.description}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-xs transition-all relative ${
                  isActive
                    ? 'bg-[var(--sage-50)] text-[var(--sage-800)] font-semibold border border-[var(--sage-600)]/30 shadow-xs'
                    : 'text-[var(--ink-700)] hover:bg-[var(--card-hover)] hover:text-[var(--ink-900)] border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[var(--sage-600)]' : 'text-[var(--ink-500)]'
                  }`}
                />

                {!isRailCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium leading-none ${
                            item.badgeColor || 'bg-[var(--sage-100)] text-[var(--ink-700)]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[var(--ink-300)] opacity-70">
                        {item.shortcut}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Walkthrough Assistant CTA & Operational Freshness */}
      <div className="p-2.5 border-t border-[var(--card-border)] bg-[var(--surface-elevated)]/60">
        {!isRailCollapsed ? (
          <div className="space-y-2">
            <button
              onClick={openTour}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>60s Judge Walkthrough</span>
            </button>
            <div className="px-1 pt-1 flex items-center justify-between text-[10px] text-[var(--ink-500)] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-healthy)] animate-pulse" />
                Edge Mesh Live
              </span>
              <span>Pune Sector</span>
            </div>
          </div>
        ) : (
          <button
            onClick={openTour}
            title="Start 60s Judge Walkthrough"
            className="w-full p-2 flex items-center justify-center rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
