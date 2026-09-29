import React from 'react';
import {
  Building2,
  AlertTriangle,
  Calendar,
  Bed,
  Users,
  Package,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { NATIONAL_STATS } from '../../data/mockData';
import { useCommandStore } from '../../store/useCommandStore';
import { KpiTile } from '../common/KpiTile';
import { ResilienceRing } from '../common/ResilienceRing';
import { InteractiveMap } from './InteractiveMap';
import { PriorityRiskQueue } from './PriorityRiskQueue';
import { ForecastMiniChart } from './ForecastMiniChart';
import { GeminiActionBrief } from './GeminiActionBrief';

export const OverviewScreen: React.FC = () => {
  const { setActiveScreen, selectedDistrictId, openDrawer, optimizerSummary } = useCommandStore();

  return (
    <div className="space-y-4">
      {/* 1. Top KPI Strip with Resilience Gauge */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* KPI 1: PHCs Monitored */}
        <KpiTile
          id="kpi-phcs"
          title="PHCs Monitored"
          value="4,382"
          unit="centres"
          delta={{ value: '+18', isIncrease: true, isPositiveGood: true, label: 'onboarded' }}
          sparklineData={[4280, 4310, 4325, 4350, 4364, 4370, 4382]}
          status="healthy"
          icon={Building2}
          tooltip="Total Primary Health Centres and Sub-Centres transmitting real-time stock & bed data."
          onClick={() => setActiveScreen('map')}
        />

        {/* KPI 2: Critical Stockouts Predicted (7 Days) */}
        <KpiTile
          id="kpi-stockouts"
          title="Predicted Stock-Outs"
          value="14"
          unit="hotspots"
          delta={{ value: '-3', isIncrease: false, isPositiveGood: true, label: 'resolved today' }}
          sparklineData={[22, 20, 19, 17, 18, 16, 14]}
          status="critical"
          icon={AlertTriangle}
          tooltip="High-confidence stock-outs forecasted by Federated XGBoost within 7 days."
          onClick={() => setActiveScreen('alerts')}
        />

        {/* KPI 3: Average Days of Stock */}
        <KpiTile
          id="kpi-stock-days"
          title="Avg Days of Stock"
          value="16.8"
          unit="days buffer"
          delta={{ value: '+1.4d', isIncrease: true, isPositiveGood: true }}
          sparklineData={[14.2, 14.8, 15.0, 15.4, 15.9, 16.2, 16.8]}
          status="warning"
          icon={Calendar}
          tooltip="Median days before critical Essential Drug List depletion across all reporting blocks."
          onClick={() => setActiveScreen('forecast')}
        />

        {/* KPI 4: Bed Occupancy */}
        <KpiTile
          id="kpi-beds"
          title="Bed Occupancy"
          value="74.2"
          unit="%"
          delta={{ value: '+2.1%', isIncrease: true, isPositiveGood: false }}
          sparklineData={[68, 70, 71, 72, 73, 75, 74.2]}
          status="info"
          icon={Bed}
          tooltip="Current inpatient and maternity bed utilization across 24x7 PHCs and CHCs."
          onClick={() => setActiveScreen('map')}
        />

        {/* KPI 5: Staff Attendance */}
        <KpiTile
          id="kpi-staff"
          title="Staff Attendance"
          value="91.6"
          unit="%"
          delta={{ value: '+0.8%', isIncrease: true, isPositiveGood: true }}
          sparklineData={[89.2, 89.8, 90.4, 90.9, 91.1, 91.4, 91.6]}
          status="healthy"
          icon={Users}
          tooltip="Biometric and mobile attendance compliance for medical officers and ANM nurses."
          onClick={() => setActiveScreen('map')}
        />

        {/* KPI 6: Unmet Demand Units */}
        <KpiTile
          id="kpi-demand"
          title="Unmet Demand"
          value={`${(optimizerSummary.unmetDemandBefore / 1000).toFixed(1)}k`}
          unit="→ 15.2k"
          delta={{ value: '-94.5%', isIncrease: false, isPositiveGood: true, label: 'with AI plan' }}
          sparklineData={[310, 298, 290, 282, 278, 275, 274.5]}
          status="critical"
          icon={Package}
          tooltip="Total emergency patient doses at risk; reduced to 15.2k upon approving recommended transfers."
          onClick={() => setActiveScreen('redistribution')}
        />

        {/* KPI 7: Resilience Score Gauge */}
        <div
          onClick={() => setActiveScreen('federated')}
          className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#00e5bc]/30 bg-[#111722]/90 hover:border-[#00e5bc] transition-all cursor-pointer group shadow-[0_0_15px_rgba(0,229,188,0.08)]"
          title="Click to view Federated Resilience model details"
        >
          <ResilienceRing score={NATIONAL_STATS.resilienceScore} size={80} strokeWidth={7} />
        </div>
      </div>

      {/* 2. Central Canvas: Geospatial Map + Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Central Map (8 cols on large screens) */}
        <div className="lg:col-span-8 flex flex-col">
          <InteractiveMap />
        </div>

        {/* Priority Risk Queue (4 cols on large screens) */}
        <div className="lg:col-span-4 flex flex-col">
          <PriorityRiskQueue />
        </div>
      </div>

      {/* 3. Bottom Row: Demand Forecast Panel + Gemini Executive Action Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Forecast Panel (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <ForecastMiniChart />
        </div>

        {/* Gemini Situational Brief (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <GeminiActionBrief />
        </div>
      </div>
    </div>
  );
};
