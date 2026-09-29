import React from 'react';
import {
  Printer,
  Download,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  Repeat,
  CheckCircle2,
} from 'lucide-react';
import { NATIONAL_STATS, MOCK_ALERTS, MOCK_TRANSFERS } from '../../data/mockData';
import { useCommandStore } from '../../store/useCommandStore';

export const ReportsScreen: React.FC = () => {
  const { transfers, alerts } = useCommandStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Action Toolbar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#111722] border border-[#1e293b] print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00e5bc]" />
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">
              Executive Situation &amp; Allocation Briefing
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Print-ready standardized dossier generated for the State Health Commissioner and District Health Officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-[#00e5bc] hover:bg-[#00d2aa] text-[#0b0f17] font-mono text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[#00e5bc]/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Document Container (Styled like a formal Government Briefing) */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 font-sans border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-600 font-bold">
              GOVERNMENT OF INDIA • NATIONAL HEALTH MISSION (NHM)
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-950 mt-1 tracking-tight">
              SANJEEVANI HEALTH RESILIENCE GRID
            </h2>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              Directorate of Health Services • Western Regional Health Corridor
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-600 space-y-0.5">
            <div className="text-[10px] font-bold text-red-600 uppercase border border-red-600 px-2 py-0.5 rounded inline-block mb-1">
              OFFICIAL USE ONLY
            </div>
            <div>Ref: NHM/GRID/2026/0929-B</div>
            <div>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div>Time: 12:00 IST (Telemetry Round #5)</div>
          </div>
        </div>

        {/* 1. Executive Summary & KPIs */}
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-mono">
            1. Executive Telemetry Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            As of 12:00 IST today, the SANJEEVANI federated network is actively monitoring <strong>4,382 Primary Health Centres (PHCs)</strong> across the state corridor with a <strong>98.6% live reporting rate</strong>. The aggregate resilience score stands at <strong>78.4 / 100</strong>. High-confidence epidemiological machine learning models predict <strong>14 critical stock-out hotspots</strong> within the next 7-day forecast horizon if redistributive action is not ratified.
          </p>

          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-100 rounded-lg text-center font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Active PHCs</span>
              <span className="text-sm font-bold text-slate-900">4,382</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Predicted Stockouts</span>
              <span className="text-sm font-bold text-red-600">14 Centres</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Unmet Demand</span>
              <span className="text-sm font-bold text-slate-900">274.5k Units</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Optimized Demand</span>
              <span className="text-sm font-bold text-emerald-700">15.2k Units (-94.5%)</span>
            </div>
          </div>
        </div>

        {/* 2. Critical Stockout Incidents */}
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-mono">
            2. High Priority Depletion Alerts
          </h3>

          <table className="w-full text-xs font-mono text-left border border-slate-300">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="py-2 px-3 border-b border-slate-300">District / PHC</th>
                <th className="py-2 px-3 border-b border-slate-300">Medicine Description</th>
                <th className="py-2 px-3 border-b border-slate-300">Stock Remaining</th>
                <th className="py-2 px-3 border-b border-slate-300">Runout ETA</th>
                <th className="py-2 px-3 border-b border-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {MOCK_ALERTS.slice(0, 4).map((a) => (
                <tr key={a.id}>
                  <td className="py-2 px-3">
                    <strong className="text-slate-900">{a.districtName}</strong>
                    <span className="block text-[10px] text-slate-600">{a.phcName}</span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{a.medicineName}</td>
                  <td className="py-2 px-3 font-bold text-red-600">{a.daysRemaining} Days ({a.currentStock} units)</td>
                  <td className="py-2 px-3 text-slate-700">{a.predictedDepletionDate}</td>
                  <td className="py-2 px-3 font-bold uppercase text-[10px] text-red-700">URGENT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Recommended Cross-District Redistribution Corridors */}
        <div className="mb-8 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-mono">
            3. Authorized Cross-District Redistribution Schedule
          </h3>

          <table className="w-full text-xs font-mono text-left border border-slate-300">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="py-2 px-3 border-b border-slate-300">Corridor ID</th>
                <th className="py-2 px-3 border-b border-slate-300">Source Depot → Destination PHC</th>
                <th className="py-2 px-3 border-b border-slate-300">Medicine &amp; Quantity</th>
                <th className="py-2 px-3 border-b border-slate-300">Distance</th>
                <th className="py-2 px-3 border-b border-slate-300">Cost (INR)</th>
                <th className="py-2 px-3 border-b border-slate-300">Dispatch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transfers.map((t) => (
                <tr key={t.id}>
                  <td className="py-2 px-3 font-bold text-slate-900">{t.id}</td>
                  <td className="py-2 px-3">
                    <strong>{t.donorDistrictName.split(' ')[0]}</strong> → {t.receiverDistrictName.split(' ')[0]} ({t.receiverPHC || 'Hub'})
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-900">
                    {t.quantity.toLocaleString()} {t.unit} of {t.medicineName}
                  </td>
                  <td className="py-2 px-3 text-slate-700">{t.distanceKm} km ({t.estTransitHours}h)</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">₹{t.estCostINR.toLocaleString()}</td>
                  <td className="py-2 px-3 font-bold text-emerald-700 uppercase">
                    {t.status === 'approved' ? '✓ APPROVED' : 'PROPOSED'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Statutory Audit & Sign-off Block */}
        <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-6 font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">PREPARED BY:</div>
            <div className="mt-8 pt-1 border-t border-slate-400 font-bold text-slate-900">
              AI Algorithmic Logistics Desk
            </div>
            <div className="text-[10px] text-slate-500">SANJEEVANI Autonomous Grid</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">VERIFIED BY DHO:</div>
            <div className="mt-8 pt-1 border-t border-slate-400 font-bold text-slate-900">
              Dr. V. Rao, MBBS, MD
            </div>
            <div className="text-[10px] text-slate-500">District Health Officer, Satara</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">CONFIRMED COMMISSIONER:</div>
            <div className="mt-8 pt-1 border-t border-slate-400 font-bold text-slate-900">
              Dr. R. Deshmukh, IAS
            </div>
            <div className="text-[10px] text-slate-500">Commissioner of Health &amp; Mission Director</div>
          </div>
        </div>
      </div>
    </div>
  );
};
