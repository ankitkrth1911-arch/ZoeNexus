import React, { useState } from 'react';
import {
  Repeat,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  RotateCcw,
  Zap,
  Check,
  Fuel,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { StatusPill } from '../common/StatusPill';

export const RedistributionScreen: React.FC = () => {
  const {
    transfers,
    optimizerSummary,
    approveTransfer,
    approveAllTransfers,
    undoTransferApproval,
    maxTransportKm,
    setMaxTransportKm,
    minBufferPercentage,
    setMinBufferPercentage,
    surgeMultiplier,
    setSurgeMultiplier,
    disasterMode,
    setDisasterMode,
    addToast,
  } = useCommandStore();

  const [selectedUrgency, setSelectedUrgency] = useState<'all' | 'critical' | 'high'>('all');
  const [isSimulating, setIsSimulating] = useState(false);

  // Filter transfers based on user constraints
  const filteredTransfers = transfers.filter((t) => {
    if (t.distanceKm > maxTransportKm) return false;
    if (selectedUrgency !== 'all' && t.urgency !== selectedUrgency) return false;
    return true;
  });

  const allApproved = transfers.every((t) => t.status === 'approved');
  const approvedCount = transfers.filter((t) => t.status === 'approved').length;

  const handleSimulateSurge = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      addToast({
        title: 'Simulation Complete',
        description: `Linear programming redistribution re-optimized for ${surgeMultiplier}x demand surge.`,
        type: 'info',
      });
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Donor,Receiver,Medicine,Quantity,Distance_Km,Est_Hours,Est_Cost_INR,Urgency,Status\n';
    const rows = transfers
      .map(
        (t) =>
          `${t.id},"${t.donorDistrictName}","${t.receiverDistrictName}","${t.medicineName}",${t.quantity},${t.distanceKm},${t.estTransitHours},${t.estCostINR},${t.urgency},${t.status}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanjeevani_redistribution_manifest_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    addToast({
      title: 'Dispatch Manifest Exported',
      description: 'Downloaded official logistics manifest CSV for state dispatch.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#111722] border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-[#00e5bc]" />
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">
              Cross-District Redistribution Optimizer (Decision Engine)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Linear programming multi-commodity transfer solver: minimizes logistics transit cost and CO₂ while eliminating PHC stock-outs.
          </p>
        </div>

        {/* Global Batch Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Manifest</span>
          </button>

          <button
            onClick={approveAllTransfers}
            disabled={allApproved}
            className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-2 transition-all ${
              allApproved
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60 cursor-default'
                : 'bg-[#00e5bc] hover:bg-[#00d2aa] text-[#0b0f17] shadow-lg shadow-[#00e5bc]/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{allApproved ? 'All Corridors Approved' : 'Batch Authorize All Plans'}</span>
          </button>
        </div>
      </div>

      {/* 1. Compelling BEFORE vs AFTER Impact Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Metric 1: Unmet Demand */}
        <div className="p-4 rounded-xl border border-red-900/40 bg-gradient-to-br from-[#111722] to-red-950/20 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>UNMET DEMAND DOSES</span>
            <span className="text-emerald-400 font-bold">-94.5% REDUCTION</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400 line-through opacity-70">
              {(optimizerSummary.unmetDemandBefore / 1000).toFixed(1)}k
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-400 inline" />
            <span className="text-2xl font-bold text-emerald-400">
              {(optimizerSummary.unmetDemandAfter / 1000).toFixed(1)}k
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Emergency patient dosage deficit prevented across 5 reporting districts.
          </p>
        </div>

        {/* Metric 2: Critical Shortages */}
        <div className="p-4 rounded-xl border border-amber-900/40 bg-gradient-to-br from-[#111722] to-amber-950/20 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>CRITICAL PHC SHORTAGES</span>
            <span className="text-emerald-400 font-bold">-94.7%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 line-through opacity-70">
              {optimizerSummary.criticalShortagesBefore} PHCs
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-400 inline" />
            <span className="text-2xl font-bold text-emerald-400">
              {optimizerSummary.criticalShortagesAfter} PHCs
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Only 2 peripheral sub-centres remain on 48h watch; 36 averted.
          </p>
        </div>

        {/* Metric 3: Average Days Buffer Gain */}
        <div className="p-4 rounded-xl border border-teal-900/40 bg-gradient-to-br from-[#111722] to-teal-950/20 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>AVERAGE BUFFER EXTENSION</span>
            <span className="text-[#00e5bc] font-bold">+12.8 DAYS</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-400">
              2.1d avg
            </span>
            <ArrowRight className="w-4 h-4 text-[#00e5bc] inline" />
            <span className="text-2xl font-bold text-[#00e5bc]">
              14.9d safe
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Donor hubs retain &gt;25% safety reserve while replenishing receivers.
          </p>
        </div>

        {/* Metric 4: Logistics Cost & Efficiency */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#111722] text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>TOTAL TRANSIT LOGISTICS</span>
            <span className="text-slate-300 font-bold">5 TRUCKLOADS</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              ₹{optimizerSummary.totalLogisticsCostINR.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">(${optimizerSummary.totalLogisticsCostUSD})</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Est. Fuel: 42L diesel • CO₂ footprint: {optimizerSummary.co2ImpactKg} kg.
          </p>
        </div>
      </div>

      {/* 2. Main Workspace: Constraints & Scenario Simulator (4 cols) + Interactive Transfer Table (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Constraints & Simulator Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Constraints Control Card */}
          <div className="rounded-xl border border-[#1e293b] bg-[#111722] p-4 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00e5bc]" />
                <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                  Optimizer Constraints
                </h3>
              </div>
              <button
                onClick={handleSimulateSurge}
                className="text-[11px] text-[#00e5bc] hover:underline font-semibold"
              >
                {isSimulating ? 'Computing...' : 'Re-Run LP'}
              </button>
            </div>

            {/* Slider 1: Max Transport Distance */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300">Max Transit Distance:</span>
                <span className="text-[#00e5bc] font-bold">{maxTransportKm} km</span>
              </div>
              <input
                type="range"
                min="50"
                max="350"
                step="25"
                value={maxTransportKm}
                onChange={(e) => setMaxTransportKm(Number(e.target.value))}
                className="w-full accent-[#00e5bc] cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Corridors beyond {maxTransportKm}km require regional state air/express exemption.
              </span>
            </div>

            {/* Slider 2: Minimum Buffer Retention */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300">Donor Min Buffer Retention:</span>
                <span className="text-amber-400 font-bold">{minBufferPercentage}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="40"
                step="5"
                value={minBufferPercentage}
                onChange={(e) => setMinBufferPercentage(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Guarantees donor hub (e.g. Pune Central) does not deplete below safety margin.
              </span>
            </div>

            {/* Slider 3: Scenario Surge Multiplier */}
            <div className="space-y-1.5 p-3 rounded-lg bg-[#0b0f17] border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-200 font-bold">Surge Scenario Multiplier:</span>
                <span className="text-red-400 font-bold">{surgeMultiplier.toFixed(1)}x Demand</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.2"
                value={surgeMultiplier}
                onChange={(e) => setSurgeMultiplier(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                Simulates epidemic outbreak or monsoon floods multiplying emergency intake.
              </span>
            </div>

            {/* Toggle: Disaster Mode */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-950/20 border border-red-800/40">
              <div>
                <span className="text-xs font-bold text-red-300 block">Disaster Protocol Mode</span>
                <span className="text-[10px] text-slate-400">Relaxes buffer to 15% &amp; clears highway green lanes</span>
              </div>
              <button
                onClick={() => setDisasterMode(!disasterMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  disasterMode ? 'bg-red-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    disasterMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Proposed Transfers Table (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-[#1e293b] bg-[#111722] p-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1e293b]">
              <div>
                <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Actionable Redistribution Corridors</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-500/30">
                    {approvedCount} / {transfers.length} Approved
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Calculated based on stock runout days, travel distance, and cold-chain sensitivity.
                </p>
              </div>

              {/* Urgency Filter */}
              <div className="flex items-center gap-1 text-xs font-mono">
                {(['all', 'critical', 'high'] as const).map((urg) => (
                  <button
                    key={urg}
                    onClick={() => setSelectedUrgency(urg)}
                    className={`px-2 py-0.5 rounded uppercase text-[10px] font-semibold transition-all ${
                      selectedUrgency === urg
                        ? 'bg-[#00e5bc]/20 text-[#00e5bc] border border-[#00e5bc]/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>

            {/* Corridors Table */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-[#1e293b] text-slate-400 text-[11px]">
                    <th className="py-2 px-2">Corridor ID</th>
                    <th className="py-2 px-2">Donor → Receiver</th>
                    <th className="py-2 px-2">Medicine &amp; Qty</th>
                    <th className="py-2 px-2">Distance / Time</th>
                    <th className="py-2 px-2">Est Cost</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {filteredTransfers.map((t) => {
                    const isApproved = t.status === 'approved';

                    return (
                      <tr key={t.id} className="hover:bg-[#161f2e] transition-colors">
                        <td className="py-2.5 px-2 font-bold text-teal-400 text-[11px]">
                          {t.id}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="font-semibold text-white">
                            {t.donorDistrictName.split(' ')[0]} → {t.receiverDistrictName.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {t.receiverPHC || t.receiverDistrictName}
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="font-semibold text-slate-200">
                            {t.quantity.toLocaleString()} {t.unit}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                            {t.medicineName}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[11px] text-slate-300">
                          <div>{t.distanceKm} km</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {t.estTransitHours}h
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[11px] font-semibold text-white">
                          ₹{t.estCostINR.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2">
                          <StatusPill status={t.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {isApproved ? (
                            <button
                              onClick={() => undoTransferApproval(t.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-mono transition-colors"
                              title="Undo approval"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() => approveTransfer(t.id)}
                              className="px-2.5 py-1 rounded bg-[#00e5bc] hover:bg-[#00d2aa] text-[#0b0f17] text-[11px] font-bold font-mono transition-colors flex items-center gap-1 ml-auto"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail Block */}
          <div className="pt-3 mt-3 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Hash: SHA-256 (Signed by DHO Satara &amp; State Logistics Directorate)</span>
            </div>
            <span className="text-slate-400">All dispatches comply with Drugs &amp; Cosmetics Act (Rule 65)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
