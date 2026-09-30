/**
 * backendAdapter.ts
 * Pure mapping layer: BackendForecast[] → PHCNodeData[], RiskRadarItem[], ForecastPoint[]
 *
 * Backend real IDs:   PHC_A, PHC_B, PHC_C, PHC_D, PHC_E
 * Backend medicines:  Amlodipine, Telmisartan, Diuretic
 *
 * All 5 PHCs are SIMULATED (training data seed 42, 1000 days).
 * This is the SINGLE place where backend ↔ frontend shape mapping lives.
 */

import type { BackendForecast } from './apiService';
import type {
  PHCNodeData,
  RiskRadarItem,
  ForecastPoint,
  NodeOperationalStatus,
} from '../types/decision';

// ─── Real IDs and Medicines ──────────────────────────────────────────────────
export const REAL_PHC_IDS = ['PHC_A', 'PHC_B', 'PHC_C', 'PHC_D', 'PHC_E'] as const;
export type RealPHCId = (typeof REAL_PHC_IDS)[number];

export const REAL_MEDICINES = ['Amlodipine', 'Telmisartan', 'Diuretic'] as const;
export type RealMedicine = (typeof REAL_MEDICINES)[number];

// ─── Static labels for the 5 simulated PHC IDs ────────────────────────────────
export const PHC_META: Record<
  string,
  {
    name: string;
    lat: number;
    lng: number;
    districtId: string;
    districtName: string;
    state: string;
  }
> = {
  PHC_A: { name: 'PHC Alpha (Shirur)',    lat: 18.82, lng: 74.37, districtId: 'DIST-PUN', districtName: 'Pune District', state: 'Maharashtra' },
  PHC_B: { name: 'PHC Beta (Baramati)',   lat: 18.15, lng: 74.57, districtId: 'DIST-PUN', districtName: 'Pune District', state: 'Maharashtra' },
  PHC_C: { name: 'PHC Gamma (Junnar)',    lat: 19.20, lng: 73.87, districtId: 'DIST-PUN', districtName: 'Pune District', state: 'Maharashtra' },
  PHC_D: { name: 'PHC Delta (Khed)',      lat: 18.52, lng: 73.99, districtId: 'DIST-PUN', districtName: 'Pune District', state: 'Maharashtra' },
  PHC_E: { name: 'PHC Epsilon (Indapur)', lat: 17.97, lng: 75.03, districtId: 'DIST-PUN', districtName: 'Pune District', state: 'Maharashtra' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toNodeStatus(
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW',
  daysToStockout: number
): NodeOperationalStatus {
  if (riskLevel === 'HIGH') return 'HIGH';
  if (daysToStockout > 20) return 'SURPLUS';
  if (riskLevel === 'MEDIUM') return 'LOW';
  return 'LOW';
}

function toRiskLevel(raw: 'HIGH' | 'MEDIUM' | 'LOW'): 'HIGH' | 'MED' | 'LOW' {
  if (raw === 'MEDIUM') return 'MED';
  return raw;
}

function suggestedAction(riskLevel: string, shortage: number, med: string): string {
  if (riskLevel === 'HIGH')   return `Urgent: Allocate ~${Math.ceil(shortage)} units of ${med}`;
  if (riskLevel === 'MEDIUM') return `Monitor: ${med} buffer below safety threshold`;
  return `Stable: ${med} within safe coverage`;
}

// ─── Main adapter ─────────────────────────────────────────────────────────────
export function adaptForecastObjects(forecasts: BackendForecast[]): {
  phcList: PHCNodeData[];
  riskList: RiskRadarItem[];
} {
  const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

  // Group by PHC ID
  const phcMap = new Map<string, BackendForecast[]>();
  for (const f of forecasts) {
    if (!phcMap.has(f.phc_id)) phcMap.set(f.phc_id, []);
    phcMap.get(f.phc_id)!.push(f);
  }

  // Build PHCNodeData list — one node per PHC, using the highest-risk medicine as primary
  const phcList: PHCNodeData[] = [];
  for (const [phcId, items] of phcMap.entries()) {
    const primary = items
      .slice()
      .sort((a, b) => riskOrder[b.risk_level] - riskOrder[a.risk_level])[0];

    const meta = PHC_META[phcId] ?? {
      name: `PHC ${phcId}`,
      lat: 18.5,
      lng: 74.0,
      districtId: 'SIM-DIST',
      districtName: 'Simulated District',
      state: 'Simulated',
    };

    const daysToStockout = primary.days_to_stockout ?? 0;

    phcList.push({
      id: phcId,
      name: meta.name,
      districtId: meta.districtId,
      districtName: meta.districtName,
      state: meta.state,
      lat: meta.lat,
      lng: meta.lng,
      status: toNodeStatus(primary.risk_level, daysToStockout),
      primaryMedicine: primary.medicine_id,
      primaryMedicineCode: primary.medicine_id.toUpperCase().replace(/ /g, '_'),
      currentStock: primary.current_stock,
      forecastDemand15d: primary.predicted_15_day_demand,
      coverageDays: daysToStockout,
      shortageUnits: Math.max(0, primary.expected_shortage),
      minBufferUnits: primary.safety_stock,
      // Below fields have NO real sensor data in the simulated dataset — shown as 0
      bedsTotal: 30,
      bedsOccupied: 0,
      staffAssigned: 10,
      staffPresent: 10,
      oxygenCylinders: 0,
      freshnessMinutes: 0,
      riskDrivers: primary.top_model_drivers.slice(0, 3).map((d) => ({
        label: d.feature,
        changePct: Math.round(d.impact),
        impact: (Math.abs(d.impact) > 30 ? 'critical' : Math.abs(d.impact) > 10 ? 'warning' : 'info') as
          | 'critical'
          | 'warning'
          | 'info',
        detail: `ML signal: ${d.direction} (SHAP impact: ${d.impact.toFixed(2)})`,
      })),
      isDonorCandidate: primary.risk_level === 'LOW' && daysToStockout > 18,
      surplusUnits:
        primary.risk_level === 'LOW'
          ? Math.max(
              0,
              primary.current_stock - primary.predicted_15_day_demand - primary.safety_stock
            )
          : 0,
    });
  }

  // Build RiskRadarItem list — one row per forecast object (all 15)
  const riskList: RiskRadarItem[] = forecasts.map((f) => {
    const meta = PHC_META[f.phc_id];
    const daysToStockout = f.days_to_stockout ?? 0;
    return {
      id: `RISK-${f.phc_id}-${f.medicine_id}`,
      phcId: f.phc_id,
      phcName: meta?.name ?? f.phc_id,
      districtName: meta?.districtName ?? 'Simulated District',
      medicineCode: f.medicine_id.toUpperCase().replace(/ /g, '_'),
      medicineName: f.medicine_id,
      currentStock: f.current_stock,
      forecast15d: f.predicted_15_day_demand,
      coverageDays: daysToStockout,
      riskLevel: toRiskLevel(f.risk_level),
      freshnessMinutes: 0,
      shortageUnits: Math.max(0, f.expected_shortage),
      isDonorCandidate: f.risk_level === 'LOW' && daysToStockout > 18,
      suggestedAction: suggestedAction(f.risk_level, f.expected_shortage, f.medicine_id),
    };
  });

  return { phcList, riskList };
}

// ─── Risk Results Adapter ───────────────────────────────────────────────────
/** Converts backend risk results or CSV rows into { phcList, riskList } */
export function adaptRiskResults(records: BackendForecast[] | any[]): {
  phcList: PHCNodeData[];
  riskList: RiskRadarItem[];
} {
  return adaptForecastObjects(records as BackendForecast[]);
}

// ─── ForecastPoint adapter ────────────────────────────────────────────────────
// The backend gives one aggregated 15-day demand figure. We distribute it
// linearly to produce chart points — labelled "Simulated" in the UI.
export function adaptForecastToPoints(
  forecast?: Partial<BackendForecast> | null
): ForecastPoint[] {
  const predicted15d = Number(forecast?.predicted_15_day_demand ?? 850);
  const currentStock = Number(forecast?.current_stock ?? 400);
  const safetyStock = Number(forecast?.safety_stock ?? 250);

  const dailyDemand = predicted15d / 15;
  const points: ForecastPoint[] = [];
  let stock = currentStock;
  const today = new Date();

  for (let day = 0; day <= 15; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    points.push({
      dayLabel: day === 0 ? 'Today' : `D+${day}`,
      dateStr: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      isToday: day === 0,
      stockTrajectory: Math.max(0, Math.round(stock)),
      predictedDemand: Math.round(dailyDemand),
      lowerConfidence: Math.round(dailyDemand * 0.85),
      upperConfidence: Math.round(dailyDemand * 1.15),
      safetyThreshold: safetyStock,
    });
    stock = Math.max(0, stock - dailyDemand);
  }
  return points;
}

