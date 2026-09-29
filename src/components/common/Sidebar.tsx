import React, { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Repeat,
  Network,
  ShieldAlert,
  Sparkles,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useCommandStore, ScreenId } from '../../store/useCommandStore';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  subtext?: string;
}

export const Sidebar: React.FC = () => {
  const { activeScreen, setActiveScreen, alerts, transfers, anomalies } = useCommandStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;
  const proposedTransfersCount = transfers.filter((t) => t.status === 'proposed').length;
  const pendingAnomaliesCount = anomalies.filter((a) => !a.reviewed).length;

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Command Overview',
      icon: LayoutDashboard,
      subtext: 'Situational picture',
    },
    {
      id: 'map',
      label: 'Geospatial Grid',
      icon: MapPin,
      subtext: 'Choropleth & flows',
    },
    {
      id: 'forecast',
      label: 'Demand Forecasts',
      icon: TrendingUp,
      subtext: 'XGBoost & early warning',
    },
    {
      id: 'alerts',
      label: 'Stock-out Alerts',
      icon: AlertTriangle,
      badge: activeAlertsCount,
      badgeColor: 'bg-[#ef4444] text-white',
      subtext: 'Days-to-zero countdown',
    },
    {
      id: 'redistribution',
      label: 'Redistribution AI',
      icon: Repeat,
      badge: proposedTransfersCount,
      badgeColor: 'bg-[#00e5bc] text-[#0b0f17] font-bold',
      subtext: 'Donor → Receiver engine',
    },
    {
      id: 'federated',
      label: 'Federated Network',
      icon: Network,
      badge: '5/5',
      badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-500/40',
      subtext: 'Privacy-preserving sync',
    },
    {
      id: 'anomalies',
      label: 'Anomalies & Integrity',
      icon: ShieldAlert,
      badge: pendingAnomaliesCount,
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-500/40',
      subtext: 'Spike & leakage detection',
    },
    {
      id: 'explain',
      label: 'Explain (Gemini AI)',
      icon: Sparkles,
      subtext: 'Grounded intelligence',
    },
    {
      id: 'reports',
      label: 'Briefing Reports',
      icon: FileText,
      subtext: 'Printable executive summary',
    },
    {
      id: 'settings',
      label: 'System & Protocols',
      icon: Settings,
      subtext: 'EDL thresholds & API keys',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-[#0b0f17] border-r border-[#1e293b] select-none transition-all duration-300 z-30 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-[#161f2e] text-white border border-[#2a3a52] shadow-[0_0_12px_rgba(0,229,188,0.1)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
              }`}
              title={isCollapsed ? `${item.label} (${item.subtext})` : undefined}
            >
              {/* Active left indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00e5bc] rounded-r shadow-[0_0_8px_#00e5bc]" />
              )}

              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#00e5bc]'
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                {!isCollapsed && (
                  <div className="text-left truncate">
                    <div className="leading-tight truncate">{item.label}</div>
                    {item.subtext && (
                      <div className="text-[10px] font-mono text-slate-500 truncate">
                        {item.subtext}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Badge */}
              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`mono-data text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info & Collapse Toggle */}
      <div className="p-3 border-t border-[#1e293b] space-y-2">
        {!isCollapsed && (
          <div className="p-2.5 rounded-lg bg-[#111722]/80 border border-slate-800 text-[10px] space-y-1 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#00e5bc]" /> PROTOCOL
              </span>
              <span className="text-[#00e5bc]">IPHS-2024</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>DP EPSILON</span>
              <span className="text-emerald-400">ε = 1.84</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>AGGREGATION</span>
              <span className="text-slate-300">FedProx (μ=0.01)</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded-md hover:bg-slate-800/80 text-slate-500 hover:text-slate-300 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-1 text-[11px]">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
