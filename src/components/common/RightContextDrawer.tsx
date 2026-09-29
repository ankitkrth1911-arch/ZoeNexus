import React from 'react';
import {
  X,
  Building2,
  AlertTriangle,
  Repeat,
  Sparkles,
  ExternalLink,
  Thermometer,
  ShieldCheck,
  UserCheck,
  Check,
  TrendingDown,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { MOCK_DISTRICTS, MOCK_PHCS, MOCK_ALERTS } from '../../data/mockData';
import { StatusPill } from './StatusPill';
import { RiskBar } from './RiskBar';
import { ResilienceRing } from './ResilienceRing';

export const RightContextDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    drawerType,
    closeDrawer,
    selectedDistrictId,
    selectedPHCId,
    selectedAlertId,
    openDrawer,
    setActiveScreen,
    approveTransfer,
    transfers,
    resolveAlert,
  } = useCommandStore();

  if (!isDrawerOpen || !drawerType) return null;

  // Retrieve selected item data
  const district = MOCK_DISTRICTS.find((d) => d.id === selectedDistrictId);
  const phc = MOCK_PHCS.find((p) => p.id === selectedPHCId);
  const alert = MOCK_ALERTS.find((a) => a.id === selectedAlertId);

  // Relevant transfers for district
  const relatedTransfers = transfers.filter(
    (t) =>
      t.receiverDistrictId === selectedDistrictId ||
      t.donorDistrictId === selectedDistrictId
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#111722] border-l border-[#2a3a52] shadow-[-12px_0_30px_rgba(0,0,0,0.6)] flex flex-col justify-between text-slate-200 animate-in slide-in-from-right duration-250">
      {/* Top Drawer Header */}
      <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0b0f17]/60">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            {drawerType} CONTEXT
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ID: {drawerType === 'district' ? district?.id : drawerType === 'phc' ? phc?.id : alert?.id}
          </span>
        </div>
        <button
          onClick={closeDrawer}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close drawer (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* DISTRICT VIEW */}
        {drawerType === 'district' && district && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-white tracking-tight">
                  {district.name}
                </h2>
                <StatusPill status={district.riskLevel} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {district.state}, {district.country} • Population: {district.populationServed.toLocaleString()}
              </p>
            </div>

            {/* Resilience Ring & Key Vital Signs */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-[#0b0f17] border border-[#1e293b]">
              <ResilienceRing score={district.resilienceScore} size={90} strokeWidth={8} />
              <div className="flex flex-col justify-center space-y-2 mono-data text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">PHC REPORTING</div>
                  <div className="font-bold text-emerald-400">{district.reportingRate}% ({district.totalPHCs} centres)</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">BED OCCUPANCY</div>
                  <div className="font-bold text-amber-300">{district.bedOccupancy}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">STAFF ATTENDANCE</div>
                  <div className="font-bold text-slate-200">{district.staffAttendance}%</div>
                </div>
              </div>
            </div>

            {/* Risk Gauge */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300">Aggregate Stock-out Risk Score</span>
                <span className="mono-data font-bold text-red-400">{district.stockoutRiskScore}%</span>
              </div>
              <RiskBar score={district.stockoutRiskScore} />
            </div>

            {/* Critical Shortages Notice */}
            {district.criticalMedicines.length > 0 ? (
              <div className="p-3 rounded-lg bg-red-950/20 border border-red-800/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Immediate Supply Gaps Detected</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {district.criticalMedicines.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded text-[11px] mono-data bg-red-900/40 text-red-200 border border-red-700/50"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  Average days of stock: <span className="mono-data text-red-300 font-bold">{district.daysOfStockAvg} days</span>. Projected zero stock date in 72 hours.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>All essential emergency EDL medicines maintained above buffer threshold.</span>
              </div>
            )}

            {/* Primary Health Centres under District */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-200">Monitored PHCs in Sector</span>
                <span className="mono-data text-slate-400">{MOCK_PHCS.filter((p) => p.districtId === district.id).length} Active</span>
              </div>
              <div className="space-y-2">
                {MOCK_PHCS.filter((p) => p.districtId === district.id).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => openDrawer('phc', p.id)}
                    className="p-2.5 rounded-lg bg-[#0b0f17] hover:bg-[#161f2e] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-[#00e5bc] transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {p.type} • {p.occupiedBeds}/{p.totalBeds} Beds • Stock: {p.avgDaysOfStock}d
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Cross-District Corridors */}
            {relatedTransfers.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-200">Optimized Transfer Corridors</span>
                  <span className="mono-data text-[#00e5bc]">{relatedTransfers.length} Actionable</span>
                </div>
                <div className="space-y-2">
                  {relatedTransfers.map((trf) => (
                    <div
                      key={trf.id}
                      className="p-3 rounded-lg bg-teal-950/20 border border-teal-800/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-teal-400 font-semibold">{trf.id}</span>
                        <StatusPill status={trf.status} size="sm" />
                      </div>
                      <div className="text-slate-200 font-medium">
                        {trf.quantity.toLocaleString()} {trf.unit} of {trf.medicineName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        From: {trf.donorDistrictName} → To: {trf.receiverDistrictName} ({trf.distanceKm} km, {trf.estTransitHours}h)
                      </div>
                      {trf.status === 'proposed' && (
                        <button
                          onClick={() => approveTransfer(trf.id)}
                          className="mt-2 w-full py-1.5 rounded bg-[#00e5bc] hover:bg-[#00d2aa] text-[#0b0f17] font-semibold font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Dispatch Corridor
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHC VIEW */}
        {drawerType === 'phc' && phc && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-white tracking-tight">
                  {phc.name}
                </h2>
                <StatusPill status={phc.avgDaysOfStock < 3 ? 'critical' : phc.avgDaysOfStock < 7 ? 'warning' : 'healthy'} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {phc.districtName} • Type: {phc.type} • Pop: {phc.populationServed.toLocaleString()}
              </p>
            </div>

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#0b0f17] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">MEDICAL OFFICER</span>
                <span className={`font-semibold ${phc.doctorPresent ? 'text-emerald-400' : 'text-red-400'}`}>
                  {phc.doctorPresent ? 'Doctor On Duty' : 'Vacant / Absent'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0b0f17] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">COLD CHAIN (ILR)</span>
                <span className={`font-semibold ${phc.coldChainStatus === 'optimal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {phc.coldChainStatus.toUpperCase()} (3.4°C)
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0b0f17] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">BED OCCUPANCY</span>
                <span className="font-semibold text-slate-200">
                  {phc.occupiedBeds} / {phc.totalBeds} ({((phc.occupiedBeds / phc.totalBeds) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0b0f17] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">LAST TELEMETRY</span>
                <span className="font-semibold text-slate-400">{phc.lastReportingTime}</span>
              </div>
            </div>

            {/* On-site Medicine Inventory */}
            <div>
              <div className="text-xs font-semibold text-slate-200 mb-2">
                Essential Medicine Stock & Burn Rate
              </div>
              <div className="space-y-2">
                {phc.inventory.map((item) => (
                  <div
                    key={item.code}
                    className="p-3 rounded-lg bg-[#0b0f17] border border-slate-800 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-bold">{item.name}</span>
                      <StatusPill status={item.riskLevel} size="sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400">
                      <div>Stock: <span className="text-white font-bold">{item.currentStock} {item.unit}</span></div>
                      <div>Burn: <span className="text-white">{item.dailyBurnRate}/day</span></div>
                      <div>Buffer: <span className={item.daysOfStockLeft < 3 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{item.daysOfStockLeft}d</span></div>
                    </div>
                    {item.coldChainRequired && (
                      <div className="text-[10px] text-teal-400 flex items-center gap-1">
                        <Thermometer className="w-3 h-3" /> Cold-chain validated (WHO PQS)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ALERT VIEW */}
        {drawerType === 'alert' && alert && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-red-400 tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Stock-out Warning
                </h2>
                <StatusPill status={alert.severity} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Timestamp: {alert.timestamp} • Code: {alert.id}
              </p>
            </div>

            {/* Alert Summary Box */}
            <div className="p-4 rounded-lg bg-red-950/30 border border-red-700/50 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-red-300 font-semibold block">CRITICAL MEDICINE</span>
                <span className="text-base font-bold text-white">{alert.medicineName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px]">CURRENT STOCK:</span>
                  <div className="text-red-300 font-bold text-sm">{alert.currentStock} units</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">RUNOUT ESTIMATE:</span>
                  <div className="text-red-300 font-bold text-sm">{alert.daysRemaining} Days ({alert.predictedDepletionDate})</div>
                </div>
              </div>
              <div className="pt-2 border-t border-red-800/40 text-xs text-slate-300">
                <span className="text-[10px] text-red-300 font-mono block">AFFECTED HEALTH NETWORK:</span>
                {alert.phcName} ({alert.districtName}) — Population catchment: {alert.affectedPopulation.toLocaleString()}
              </div>
            </div>

            {/* Suggested Action */}
            <div className="p-3.5 rounded-lg bg-[#0b0f17] border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-[#00e5bc] uppercase tracking-wide block">
                Algorithmic Mitigation Plan
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {alert.suggestedAction}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveScreen('redistribution');
                  closeDrawer();
                }}
                className="w-full py-2.5 rounded-lg bg-[#00e5bc] hover:bg-[#00d2aa] text-[#0b0f17] font-bold text-xs font-mono flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#00e5bc]/20"
              >
                <Repeat className="w-4 h-4" />
                Launch Redistribution Optimizer for this Corridor
              </button>

              {alert.status === 'active' && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Alert Resolved / Acknowledged
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-[#1e293b] bg-[#0b0f17]/90 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            setActiveScreen('explain');
            closeDrawer();
          }}
          className="flex-1 py-2 px-3 rounded-lg bg-[#161f2e] hover:bg-[#1c2638] border border-[#2a3a52] text-xs font-mono text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00e5bc]" />
          Gemini Explain
        </button>
        <button
          onClick={() => {
            setActiveScreen('reports');
            closeDrawer();
          }}
          className="flex-1 py-2 px-3 rounded-lg bg-[#161f2e] hover:bg-[#1c2638] border border-[#2a3a52] text-xs font-mono text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          Briefing PDF
        </button>
      </div>
    </div>
  );
};
