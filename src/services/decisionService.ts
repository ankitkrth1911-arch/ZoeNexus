// PHC Federated AI — Typed Backend Service Mock & Deterministic Solver
// Contract: Data → Forecast → Risk → Allocation → Explanation → Human approval → Audit

import {
  PHCNodeData,
  RiskRadarItem,
  ForecastPoint,
  DonorCandidate,
  ConstraintCheckItem,
  SolverRecommendation,
  GeminiExplanation,
  AuditEvent,
  FederationRoundState,
  EmergencySurgeState,
  SystemConnectionState,
} from '../types/decision';
import { sha256 } from 'js-sha256';

// Realistic Seeded PHC Nodes (Real IDs: PHC_A..PHC_E with Amlodipine, Telmisartan, Diuretic)
export const SEEDED_PHC_NODES: PHCNodeData[] = [
  {
    id: 'PHC_A',
    name: 'PHC Alpha (Shirur)',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.82,
    lng: 74.37,
    status: 'HIGH',
    primaryMedicine: 'Telmisartan',
    primaryMedicineCode: 'TELMISARTAN',
    currentStock: 900,
    forecastDemand15d: 962.66,
    coverageDays: 14.0,
    shortageUnits: 312.66,
    minBufferUnits: 250,
    bedsTotal: 24,
    bedsOccupied: 18,
    staffAssigned: 10,
    staffPresent: 7,
    oxygenCylinders: 8,
    freshnessMinutes: 12,
    riskDrivers: [
      {
        label: 'Stock Coverage Deficit',
        changePct: 32,
        impact: 'critical',
        detail: 'Projected demand (962.66) exceeds available stock (900) plus safety buffer.'
      }
    ],
    isDonorCandidate: false
  },
  {
    id: 'PHC_B',
    name: 'PHC Beta (Baramati)',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.15,
    lng: 74.57,
    status: 'HIGH',
    primaryMedicine: 'Diuretic',
    primaryMedicineCode: 'DIURETIC',
    currentStock: 1000,
    forecastDemand15d: 1380.61,
    coverageDays: 10.8,
    shortageUnits: 680.61,
    minBufferUnits: 300,
    bedsTotal: 30,
    bedsOccupied: 14,
    staffAssigned: 12,
    staffPresent: 11,
    oxygenCylinders: 14,
    freshnessMinutes: 8,
    isDonorCandidate: true,
    surplusUnits: 560,
    riskDrivers: [
      {
        label: 'High Seasonal Cardiac Load',
        changePct: 45,
        impact: 'critical',
        detail: 'Diuretic consumption elevated across local referral clinics.'
      }
    ]
  },
  {
    id: 'PHC_C',
    name: 'PHC Gamma (Junnar)',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 19.20,
    lng: 73.87,
    status: 'HIGH',
    primaryMedicine: 'Telmisartan',
    primaryMedicineCode: 'TELMISARTAN',
    currentStock: 750,
    forecastDemand15d: 891.17,
    coverageDays: 12.6,
    shortageUnits: 341.17,
    minBufferUnits: 200,
    bedsTotal: 20,
    bedsOccupied: 17,
    staffAssigned: 8,
    staffPresent: 6,
    oxygenCylinders: 6,
    freshnessMinutes: 16,
    isDonorCandidate: false,
    riskDrivers: [
      {
        label: 'Chronic Care Prescription Velocity',
        changePct: 28,
        impact: 'critical',
        detail: 'Tribal clinic outreach flagged hypertension medication depletion.'
      }
    ]
  },
  {
    id: 'PHC_D',
    name: 'PHC Delta (Khed)',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.52,
    lng: 73.99,
    status: 'SURPLUS',
    primaryMedicine: 'Amlodipine',
    primaryMedicineCode: 'AMLODIPINE',
    currentStock: 1400,
    forecastDemand15d: 982.99,
    coverageDays: 21.4,
    shortageUnits: 0,
    minBufferUnits: 250,
    bedsTotal: 18,
    bedsOccupied: 9,
    staffAssigned: 8,
    staffPresent: 7,
    oxygenCylinders: 7,
    freshnessMinutes: 24,
    isDonorCandidate: true,
    surplusUnits: 167,
    riskDrivers: [
      {
        label: 'Nominal Supply Baseline',
        changePct: 0,
        impact: 'info',
        detail: 'Safe buffer maintained across all essential medications.'
      }
    ]
  },
  {
    id: 'PHC_E',
    name: 'PHC Epsilon (Indapur)',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 17.97,
    lng: 75.03,
    status: 'HIGH',
    primaryMedicine: 'Telmisartan',
    primaryMedicineCode: 'TELMISARTAN',
    currentStock: 800,
    forecastDemand15d: 1020.44,
    coverageDays: 11.8,
    shortageUnits: 470.44,
    minBufferUnits: 250,
    bedsTotal: 26,
    bedsOccupied: 12,
    staffAssigned: 10,
    staffPresent: 9,
    oxygenCylinders: 12,
    freshnessMinutes: 19,
    isDonorCandidate: false,
    riskDrivers: []
  },
  // Legacy offline fallback mock nodes
  {
    id: 'PHC-184',
    name: 'PHC 184 — Shirur Rural Health Unit',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.8285,
    lng: 74.3789,
    status: 'HIGH',
    primaryMedicine: 'Amoxicillin 500mg (Broad Spectrum)',
    primaryMedicineCode: 'MED-AMX-500',
    currentStock: 420,
    forecastDemand15d: 830,
    coverageDays: 3.8,
    shortageUnits: 410,
    minBufferUnits: 300,
    bedsTotal: 24,
    bedsOccupied: 18,
    staffAssigned: 10,
    staffPresent: 7,
    oxygenCylinders: 8,
    freshnessMinutes: 12,
    riskDrivers: [
      {
        label: 'Surge in Acute Respiratory Infections (ARI)',
        changePct: 42,
        impact: 'critical',
        detail: 'Inpatient pediatric admissions rose from 4 to 13 cases in 48 hours.'
      },
      {
        label: 'Depleted Buffer from Prior Stockout',
        changePct: -38,
        impact: 'warning',
        detail: 'Regional warehouse replenishment delivery delayed by 6 calendar days.'
      },
      {
        label: 'Monsoon Monsoon Influx',
        changePct: 15,
        impact: 'info',
        detail: 'Flash flooding reported in 3 tributary feeder villages.'
      }
    ],
    isDonorCandidate: false
  },
  {
    id: 'PHC-072',
    name: 'PHC 072 — Baramati East Community Unit',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.1517,
    lng: 74.5772,
    status: 'SURPLUS',
    primaryMedicine: 'Amoxicillin 500mg (Broad Spectrum)',
    primaryMedicineCode: 'MED-AMX-500',
    currentStock: 980,
    forecastDemand15d: 420,
    coverageDays: 14.8,
    shortageUnits: 0,
    minBufferUnits: 300,
    bedsTotal: 30,
    bedsOccupied: 14,
    staffAssigned: 12,
    staffPresent: 11,
    oxygenCylinders: 14,
    freshnessMinutes: 8,
    isDonorCandidate: true,
    surplusUnits: 560,
    riskDrivers: [
      {
        label: 'Consistent Safe Stock Level',
        changePct: -2,
        impact: 'info',
        detail: 'Recent batch delivery from State Central Depot replenished 650 units.'
      }
    ]
  },
  {
    id: 'PHC-091',
    name: 'PHC 091 — Junnar Tribal Foothills Clinic',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 19.2064,
    lng: 73.8764,
    status: 'HIGH',
    primaryMedicine: 'Paracetamol IV 100ml Infusion',
    primaryMedicineCode: 'MED-PCM-IV',
    currentStock: 140,
    forecastDemand15d: 490,
    coverageDays: 2.1,
    shortageUnits: 350,
    minBufferUnits: 200,
    bedsTotal: 20,
    bedsOccupied: 17,
    staffAssigned: 8,
    staffPresent: 6,
    oxygenCylinders: 6,
    freshnessMinutes: 16,
    isDonorCandidate: false,
    riskDrivers: [
      {
        label: 'Viral Pyrexia Spike',
        changePct: 56,
        impact: 'critical',
        detail: 'Outpatient fever cases doubled across tribal hamlet cluster.'
      }
    ]
  },
  {
    id: 'PHC-115',
    name: 'PHC 115 — Khed North Agro-Belt Centre',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.8437,
    lng: 73.9102,
    status: 'LOW',
    primaryMedicine: 'Amoxicillin 500mg (Broad Spectrum)',
    primaryMedicineCode: 'MED-AMX-500',
    currentStock: 480,
    forecastDemand15d: 380,
    coverageDays: 6.4,
    shortageUnits: 0,
    minBufferUnits: 350,
    bedsTotal: 18,
    bedsOccupied: 9,
    staffAssigned: 8,
    staffPresent: 7,
    oxygenCylinders: 7,
    freshnessMinutes: 24,
    isDonorCandidate: true,
    surplusUnits: 220,
    riskDrivers: [
      {
        label: 'Moderate Consumption Baseline',
        changePct: 4,
        impact: 'info',
        detail: 'Demand matches seasonal historical moving average.'
      }
    ]
  },
  {
    id: 'PHC-055',
    name: 'PHC 055 — Indapur Central Health Post',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.1158,
    lng: 75.0278,
    status: 'SURPLUS',
    primaryMedicine: 'Amoxicillin 500mg (Broad Spectrum)',
    primaryMedicineCode: 'MED-AMX-500',
    currentStock: 1240,
    forecastDemand15d: 420,
    coverageDays: 18.2,
    shortageUnits: 0,
    minBufferUnits: 400,
    bedsTotal: 26,
    bedsOccupied: 12,
    staffAssigned: 10,
    staffPresent: 9,
    oxygenCylinders: 12,
    freshnessMinutes: 19,
    isDonorCandidate: true,
    surplusUnits: 820,
    riskDrivers: []
  },
  {
    id: 'PHC-204',
    name: 'PHC 204 — Bhor Hilly Sector Hospital',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.1633,
    lng: 73.8447,
    status: 'EMERGENCY',
    primaryMedicine: 'ORS Electrolyte Packets + IV Fluids',
    primaryMedicineCode: 'MED-ORS-SCT',
    currentStock: 160,
    forecastDemand15d: 780,
    coverageDays: 1.8,
    shortageUnits: 620,
    minBufferUnits: 250,
    bedsTotal: 22,
    bedsOccupied: 22,
    staffAssigned: 9,
    staffPresent: 8,
    oxygenCylinders: 5,
    freshnessMinutes: 5,
    riskDrivers: [
      {
        label: 'Gastroenteritis Cluster Incident',
        changePct: 82,
        impact: 'critical',
        detail: 'Contaminated upstream water supply triggered emergency admissions.'
      }
    ]
  },
  {
    id: 'PHC-302',
    name: 'PHC 302 — Haveli Valley Sub-Center',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.4521,
    lng: 73.8829,
    status: 'STALE',
    primaryMedicine: 'Amoxicillin 500mg (Broad Spectrum)',
    primaryMedicineCode: 'MED-AMX-500',
    currentStock: 390,
    forecastDemand15d: 610,
    coverageDays: 4.2,
    shortageUnits: 220,
    minBufferUnits: 300,
    bedsTotal: 16,
    bedsOccupied: 11,
    staffAssigned: 6,
    staffPresent: 4,
    oxygenCylinders: 4,
    freshnessMinutes: 252, // 4 hours 12 min ago
    riskDrivers: [
      {
        label: 'Telemetry Gap: Fiber severed near highway',
        changePct: 0,
        impact: 'warning',
        detail: 'Cellular fallback queued 18 local stock updates; not yet synced.'
      }
    ]
  },
  {
    id: 'PHC-419',
    name: 'PHC 419 — Ambegaon Foothill Clinic',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 19.0345,
    lng: 73.7421,
    status: 'OFFLINE',
    primaryMedicine: 'Anti-Rabies Vaccine (ARV)',
    primaryMedicineCode: 'MED-RAB-VAC',
    currentStock: 25,
    forecastDemand15d: 60,
    coverageDays: 3.1,
    shortageUnits: 35,
    minBufferUnits: 20,
    bedsTotal: 12,
    bedsOccupied: 6,
    staffAssigned: 5,
    staffPresent: 0,
    oxygenCylinders: 2,
    freshnessMinutes: 890,
    riskDrivers: []
  },
  {
    id: 'PHC-512',
    name: 'PHC 512 — Daund Frontier Station',
    districtId: 'DIST-PUN',
    districtName: 'Pune District',
    state: 'Maharashtra',
    lat: 18.4632,
    lng: 74.5821,
    status: 'NO_DATA',
    primaryMedicine: 'Oxytocin 10 IU Ampoules',
    primaryMedicineCode: 'MED-OXY-10U',
    currentStock: 0,
    forecastDemand15d: 120,
    coverageDays: 0,
    shortageUnits: 120,
    minBufferUnits: 50,
    bedsTotal: 14,
    bedsOccupied: 4,
    staffAssigned: 6,
    staffPresent: 5,
    oxygenCylinders: 3,
    freshnessMinutes: 1440,
    riskDrivers: []
  }
];

// Operational Risk Radar Queue (Priority Exception-First Queue)
export const SEEDED_RISK_RADAR: RiskRadarItem[] = [
  {
    id: 'RISK-PHC_A-TEL',
    phcId: 'PHC_A',
    phcName: 'PHC Alpha (Shirur)',
    districtName: 'Pune District',
    medicineCode: 'TELMISARTAN',
    medicineName: 'Telmisartan',
    currentStock: 900,
    forecast15d: 962.66,
    coverageDays: 14.0,
    riskLevel: 'HIGH',
    freshnessMinutes: 12,
    shortageUnits: 312.66,
    isDonorCandidate: false,
    suggestedAction: 'Urgent: Allocate ~313 units of Telmisartan'
  },
  {
    id: 'RISK-PHC_B-DIU',
    phcId: 'PHC_B',
    phcName: 'PHC Beta (Baramati)',
    districtName: 'Pune District',
    medicineCode: 'DIURETIC',
    medicineName: 'Diuretic',
    currentStock: 1000,
    forecast15d: 1380.61,
    coverageDays: 10.8,
    riskLevel: 'HIGH',
    freshnessMinutes: 8,
    shortageUnits: 680.61,
    isDonorCandidate: false,
    suggestedAction: 'Urgent: Allocate ~681 units of Diuretic'
  },
  {
    id: 'RISK-PHC_C-TEL',
    phcId: 'PHC_C',
    phcName: 'PHC Gamma (Junnar)',
    districtName: 'Pune District',
    medicineCode: 'TELMISARTAN',
    medicineName: 'Telmisartan',
    currentStock: 750,
    forecast15d: 891.17,
    coverageDays: 12.6,
    riskLevel: 'HIGH',
    freshnessMinutes: 16,
    shortageUnits: 341.17,
    isDonorCandidate: false,
    suggestedAction: 'Urgent: Allocate ~342 units of Telmisartan'
  },
  {
    id: 'RISK-PHC_D-AML',
    phcId: 'PHC_D',
    phcName: 'PHC Delta (Khed)',
    districtName: 'Pune District',
    medicineCode: 'AMLODIPINE',
    medicineName: 'Amlodipine',
    currentStock: 1400,
    forecast15d: 982.99,
    coverageDays: 21.4,
    riskLevel: 'LOW',
    freshnessMinutes: 24,
    shortageUnits: 0,
    isDonorCandidate: true,
    suggestedAction: 'Stable: Amlodipine within safe coverage (>21d)'
  },
  {
    id: 'RISK-PHC_E-TEL',
    phcId: 'PHC_E',
    phcName: 'PHC Epsilon (Indapur)',
    districtName: 'Pune District',
    medicineCode: 'TELMISARTAN',
    medicineName: 'Telmisartan',
    currentStock: 800,
    forecast15d: 1020.44,
    coverageDays: 11.8,
    riskLevel: 'HIGH',
    freshnessMinutes: 19,
    shortageUnits: 470.44,
    isDonorCandidate: false,
    suggestedAction: 'Urgent: Allocate ~471 units of Telmisartan'
  },
  // Legacy offline mock items
  {
    id: 'RISK-01',
    phcId: 'PHC-184',
    phcName: 'PHC 184 (Shirur)',
    districtName: 'Pune District',
    medicineCode: 'MED-AMX-500',
    medicineName: 'Amoxicillin 500mg (Broad Spectrum)',
    currentStock: 420,
    forecast15d: 830,
    coverageDays: 3.8,
    riskLevel: 'HIGH',
    freshnessMinutes: 12,
    shortageUnits: 410,
    isDonorCandidate: false,
    suggestedAction: 'Transfer 420 units from PHC 072 (18 km corridor)'
  },
  {
    id: 'RISK-02',
    phcId: 'PHC-091',
    phcName: 'PHC 091 (Junnar)',
    districtName: 'Pune District',
    medicineCode: 'MED-PCM-IV',
    medicineName: 'Paracetamol IV 100ml Infusion',
    currentStock: 140,
    forecast15d: 490,
    coverageDays: 2.1,
    riskLevel: 'HIGH',
    freshnessMinutes: 16,
    shortageUnits: 350,
    isDonorCandidate: false,
    suggestedAction: 'Transfer 350 units from District Hub (31 km corridor)'
  },
  {
    id: 'RISK-03',
    phcId: 'PHC-115',
    phcName: 'PHC 115 (Khed)',
    districtName: 'Pune District',
    medicineCode: 'MED-AMX-500',
    medicineName: 'Amoxicillin 500mg (Broad Spectrum)',
    currentStock: 480,
    forecast15d: 380,
    coverageDays: 6.4,
    riskLevel: 'MED',
    freshnessMinutes: 24,
    shortageUnits: 0,
    isDonorCandidate: true,
    suggestedAction: 'Monitor consumption; hold in reserve'
  },
  {
    id: 'RISK-04',
    phcId: 'PHC-072',
    phcName: 'PHC 072 (Baramati)',
    districtName: 'Pune District',
    medicineCode: 'MED-AMX-500',
    medicineName: 'Amoxicillin 500mg (Broad Spectrum)',
    currentStock: 980,
    forecast15d: 420,
    coverageDays: 12.2,
    riskLevel: 'LOW',
    freshnessMinutes: 8,
    shortageUnits: 0,
    isDonorCandidate: true,
    suggestedAction: 'Designated Donor: 560 units verified surplus'
  },
  {
    id: 'RISK-05',
    phcId: 'PHC-204',
    phcName: 'PHC 204 (Bhor)',
    districtName: 'Pune District',
    medicineCode: 'MED-ORS-SCT',
    medicineName: 'ORS Electrolyte Packets',
    currentStock: 160,
    forecast15d: 780,
    coverageDays: 1.8,
    riskLevel: 'HIGH',
    freshnessMinutes: 5,
    shortageUnits: 620,
    isDonorCandidate: false,
    suggestedAction: 'Emergency Triage: Multi-corridor dispatch required'
  },
  {
    id: 'RISK-06',
    phcId: 'PHC-302',
    phcName: 'PHC 302 (Haveli)',
    districtName: 'Pune District',
    medicineCode: 'MED-AMX-500',
    medicineName: 'Amoxicillin 500mg (Broad Spectrum)',
    currentStock: 390,
    forecast15d: 610,
    coverageDays: 4.2,
    riskLevel: 'MED',
    freshnessMinutes: 252,
    shortageUnits: 220,
    isDonorCandidate: false,
    suggestedAction: 'Telemetry Stale: Re-establish satellite sync before approval'
  }
];

// Forecast Time Series for PHC 184 Amoxicillin 500mg (15-Day Horizon)
export const SEEDED_FORECAST_SERIES_PHC184: ForecastPoint[] = [
  { dayLabel: 'D-5', dateStr: 'Sep 24', actualDemand: 38, predictedDemand: 36, stockTrajectory: 620, lowerConfidence: 32, upperConfidence: 42, safetyThreshold: 300 },
  { dayLabel: 'D-4', dateStr: 'Sep 25', actualDemand: 44, predictedDemand: 41, stockTrajectory: 576, lowerConfidence: 35, upperConfidence: 48, safetyThreshold: 300 },
  { dayLabel: 'D-3', dateStr: 'Sep 26', actualDemand: 48, predictedDemand: 46, stockTrajectory: 528, lowerConfidence: 40, upperConfidence: 54, safetyThreshold: 300 },
  { dayLabel: 'D-2', dateStr: 'Sep 27', actualDemand: 52, predictedDemand: 50, stockTrajectory: 476, lowerConfidence: 44, upperConfidence: 58, safetyThreshold: 300 },
  { dayLabel: 'D-1', dateStr: 'Sep 28', actualDemand: 56, predictedDemand: 54, stockTrajectory: 420, lowerConfidence: 48, upperConfidence: 62, safetyThreshold: 300 },
  { dayLabel: 'TODAY', dateStr: 'Sep 29', isToday: true, actualDemand: 58, predictedDemand: 58, stockTrajectory: 420, lowerConfidence: 50, upperConfidence: 66, safetyThreshold: 300 },
  { dayLabel: 'D+1', dateStr: 'Sep 30', predictedDemand: 62, stockTrajectory: 358, lowerConfidence: 52, upperConfidence: 72, safetyThreshold: 300 },
  { dayLabel: 'D+2', dateStr: 'Oct 01', predictedDemand: 65, stockTrajectory: 293, lowerConfidence: 54, upperConfidence: 76, safetyThreshold: 300 },
  { dayLabel: 'D+3', dateStr: 'Oct 02', predictedDemand: 68, stockTrajectory: 225, lowerConfidence: 56, upperConfidence: 80, safetyThreshold: 300 },
  { dayLabel: 'D+4', dateStr: 'Oct 03', predictedDemand: 70, stockTrajectory: 155, lowerConfidence: 58, upperConfidence: 82, safetyThreshold: 300 },
  { dayLabel: 'D+5', dateStr: 'Oct 04', predictedDemand: 72, stockTrajectory: 83, lowerConfidence: 60, upperConfidence: 84, safetyThreshold: 300 },
  { dayLabel: 'D+6', dateStr: 'Oct 05', predictedDemand: 73, stockTrajectory: 10, lowerConfidence: 60, upperConfidence: 86, safetyThreshold: 300 },
  { dayLabel: 'D+7', dateStr: 'Oct 06', predictedDemand: 74, stockTrajectory: 0, lowerConfidence: 61, upperConfidence: 88, safetyThreshold: 300 },
  { dayLabel: 'D+8', dateStr: 'Oct 07', predictedDemand: 75, stockTrajectory: 0, lowerConfidence: 62, upperConfidence: 90, safetyThreshold: 300 },
  { dayLabel: 'D+9', dateStr: 'Oct 08', predictedDemand: 74, stockTrajectory: 0, lowerConfidence: 61, upperConfidence: 88, safetyThreshold: 300 },
  { dayLabel: 'D+10', dateStr: 'Oct 09', predictedDemand: 72, stockTrajectory: 0, lowerConfidence: 59, upperConfidence: 86, safetyThreshold: 300 }
];

// Evaluated Donor Candidates (Real IDs: PHC_B, PHC_D, PHC_C)
export const SEEDED_DONORS_PHC184: DonorCandidate[] = [
  {
    id: 'DONOR-PHC_B',
    phcId: 'PHC_B',
    phcName: 'PHC Beta (Baramati East)',
    distanceKm: 18,
    currentStock: 1200,
    minBuffer: 250,
    surplusAvailable: 560,
    isSafe: true,
    reason: 'Stock after transfer (560 units) exceeds minimum reserve threshold of 250 units (14.8 days coverage retained).',
    transitMinutes: 42,
    coldChainCompliant: true,
    transportMode: 'Dedicated Cold Van #MH-12-CZ-4412 (NH-48 Corridor)'
  },
  {
    id: 'DONOR-PHC_D',
    phcId: 'PHC_D',
    phcName: 'PHC Delta (Khed North)',
    distanceKm: 24,
    currentStock: 1400,
    minBuffer: 250,
    surplusAvailable: 417,
    isSafe: true,
    reason: 'Viable secondary corridor with nominal buffer and certified temperature telemetry.',
    transitMinutes: 55,
    coldChainCompliant: true,
    transportMode: 'Sub-district Courier Van'
  },
  {
    id: 'DONOR-PHC_C',
    phcId: 'PHC_C',
    phcName: 'PHC Gamma (Junnar)',
    distanceKm: 44,
    currentStock: 750,
    minBuffer: 200,
    surplusAvailable: 0,
    isSafe: false,
    reason: 'Transfer would deplete donor stock below local statutory minimum reserve (200 units).',
    transitMinutes: 98,
    coldChainCompliant: false,
    transportMode: 'Regular Cargo (Cold chain uncertified)'
  }
];

// Mathematical Optimizer Recommendation (OR-Tools Multi-Commodity Linear Program Output)
export const SEEDED_RECOMMENDATION_PHC184: SolverRecommendation = {
  id: 'REC-2026-0914-184',
  donorId: 'PHC_B',
  donorName: 'PHC Beta — Baramati East Community Unit',
  receiverId: 'PHC_A',
  receiverName: 'PHC Alpha — Shirur Rural Health Unit',
  medicineCode: 'AMLODIPINE',
  medicineName: 'Amlodipine (5mg)',
  transferQuantity: 0,
  residualShortage: 0,
  corridor: 'NH-48 South-to-North Corridor (Candidate)',
  transitMinutes: 42,
  distanceKm: 18,
  estLogisticsCostINR: 0,
  estLogisticsCostUSD: 0,
  estCo2Kg: 0,
  generatedTimestamp: '2026-09-29T17:15:00Z',
  solverType: 'OR-Tools Multi-Commodity LP',
  solverStatus: 'NOT_YET_RUN',
  constraints: [
    {
      id: 'CONST-1',
      name: 'Donor Safety Threshold',
      passed: true,
      category: 'donor_safety',
      description: 'Donor facility must retain > 10 days of forecasted demand post-transfer.',
      metricLabel: 'Donor Retained Coverage',
      metricValue: 'Candidate check (Not yet run)',
      thresholdValue: '≥ 10.0 days (300 units)'
    },
    {
      id: 'CONST-2',
      name: 'Receiver Deficit Coverage',
      passed: true,
      category: 'receiver_need',
      description: 'Transfer satisfies projected 15-day stock-out without overfilling storage capacity.',
      metricLabel: 'Projected Post-Transfer Coverage',
      metricValue: 'Candidate check (Not yet run)',
      thresholdValue: 'Target: 15.0 days'
    },
    {
      id: 'CONST-3',
      name: 'Route Feasibility & Window',
      passed: true,
      category: 'route_feasibility',
      description: 'Dispatched corridor travel time must fall comfortably within the 4-hour medical viability window.',
      metricLabel: 'Transit Duration',
      metricValue: 'Candidate check (Not yet run)',
      thresholdValue: '< 240 min (4.0 hrs)'
    },
    {
      id: 'CONST-4',
      name: 'Transport & Thermal Cold-Chain',
      passed: true,
      category: 'cold_chain',
      description: 'Carrier unit must possess continuous active temperature logging (WHO PQS standard).',
      metricLabel: 'Refrigerated Sensor Status',
      metricValue: 'Candidate check (Not yet run)',
      thresholdValue: '2.0°C – 8.0°C Range'
    }
  ]
};

// Seeded Offline Explanation for PHC_A (Fallback)
export const SEEDED_GEMINI_EXPLANATION_PHC184: GeminiExplanation = {
  phcId: 'PHC_A',
  medicineName: 'Amlodipine',
  headline: 'Grounded Algorithmic Rationale: PHC_B → PHC_A Corridor',
  whyThisDonor:
    'PHC_B holds surplus inventory against a 15-day local demand forecast. Transferring surplus leaves PHC_B with safe retention coverage exceeding the statutory safety reserve threshold.',
  whyNotMore:
    'Transferring more would artificially depress donor contingency buffers below safe thresholds and exceed receiver warehouse limits.',
  whatCausedRisk:
    'Demand surged over the 14-day rolling mean, depleting local stock below safety threshold.',
  groundedFacts: [
    {
      label: 'Receiver Shortage',
      value: 'Shortage bridge for 15-day deficit',
      verifiedSource: 'XGBoost Forecaster (MAE 21.67, RMSE 27.54)'
    },
    {
      label: 'Donor Safety Reserve',
      value: 'Safe retained contingency stock',
      verifiedSource: 'Daily Inventory Telemetry'
    }
  ],
  regulatoryCompliance: 'Complies with Indian Public Health Standards (IPHS 2022 §4.2) & WHO PQS Guidelines E003/01',
  confidenceScore: 96.4,
  source: 'cached',
};

// Federation Round State (Unexecuted — awaiting live federated aggregation)
export const SEEDED_FEDERATION_STATE: FederationRoundState = {
  currentRound: 0,
  status: 'ROUND_COMPLETE',
  globalModelVersion: 'XGBoost v1.0',
  participatingClients: 0,
  totalClients: 5,
  globalAccuracyPct: null, // Truthful: "Not yet run"
  convergenceDelta: 0,
  epsilonBudgetTotal: 3.0,
  epsilonBudgetConsumed: null, // Truthful: "Not yet run"
  lastAggregatedAt: '2026-09-29T17:05:00Z',
  clients: [
    {
      id: 'CLIENT-A',
      name: 'PHC_A (Alpha — Shirur)',
      location: 'Pune Rural Hub',
      status: 'Offline',
      samplesCount: 4210,
      localAccuracy: null, // Truthful: "Not yet run"
      weightGradientsKB: 48,
      latencyMs: 38,
      lastRoundLoss: 0,
      differentialPrivacyEpsilon: null // Truthful: "Not yet run"
    },
    {
      id: 'CLIENT-B',
      name: 'PHC_B (Beta — Baramati)',
      location: 'Pune North Cluster',
      status: 'Offline',
      samplesCount: 3840,
      localAccuracy: null,
      weightGradientsKB: 48,
      latencyMs: 44,
      lastRoundLoss: 0,
      differentialPrivacyEpsilon: null
    },
    {
      id: 'CLIENT-C',
      name: 'PHC_C (Gamma — Junnar)',
      location: 'Tribal Foothills',
      status: 'Offline',
      samplesCount: 2950,
      localAccuracy: null,
      weightGradientsKB: 48,
      latencyMs: 72,
      lastRoundLoss: 0,
      differentialPrivacyEpsilon: null
    },
    {
      id: 'CLIENT-D',
      name: 'PHC_D (Delta — Indapur)',
      location: 'South District Border',
      status: 'Offline',
      samplesCount: 3620,
      localAccuracy: null,
      weightGradientsKB: 48,
      latencyMs: 51,
      lastRoundLoss: 0,
      differentialPrivacyEpsilon: null
    },
    {
      id: 'CLIENT-E',
      name: 'PHC_E (Epsilon — Daund)',
      location: 'Western Hills Corridor',
      status: 'Offline',
      samplesCount: 3100,
      localAccuracy: null,
      weightGradientsKB: 48,
      latencyMs: 65,
      lastRoundLoss: 0,
      differentialPrivacyEpsilon: null
    }
  ]
};

// Emergency Surge Incident State
export const SEEDED_EMERGENCY_STATE: EmergencySurgeState = {
  active: true,
  incidentName: 'SURGE LEVEL 2: Flash Flooding & Dengue Cluster in Shirur Sector',
  incidentLocation: 'Shirur-Khed Riverine Basin, Pune District',
  incidentType: 'Monsoon Flash Flood & Secondary Vector-Borne Outbreak',
  declaredAt: '2026-09-29T14:30:00Z',
  surgeMultiplier: 2.4,
  affectedPHCsCount: 6,
  highRiskSitesCount: 3,
  availableSafeSurplus: 4700,
  residualShortageUnits: 1120,
  priorityMedicine: 'Amoxicillin 500mg, IV Infusion & ORS',
  status: 'TRIAGE'
};

// Immutable Audit Trail — Sealed with genuine cryptographic SHA-256 hashes
export const SEEDED_AUDIT_TRAIL: AuditEvent[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-09-29T16:45:12Z',
    stepName: '1. Input Snapshot Ingested',
    actor: 'Edge Collector #COL-A',
    role: 'Automated Agent',
    action: 'INGEST_TELEMETRY',
    stateHash: sha256('AUD-001:INGEST_TELEMETRY:PHC_A:Amlodipine:420'),
    modelVersion: 'XGBoost v1.0',
    payloadSummary: 'PHC_A Amlodipine stock: 420 units. 12m freshness verified. Bed occupancy: 18/24.',
    status: 'VERIFIED'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-09-29T16:47:04Z',
    stepName: '2. Risk Exception Created',
    actor: 'Early Warning Classifier',
    role: 'ML Inference Engine',
    action: 'FLAG_RISK_EXCEPTION',
    stateHash: sha256('AUD-002:FLAG_RISK_EXCEPTION:PHC_A:Amlodipine:3.8d'),
    modelVersion: 'XGBoost v1.0',
    payloadSummary: 'Coverage calculated at 3.8 days (< 5.0d statutory minimum). Projected shortage: 410 units.',
    status: 'VERIFIED'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-09-29T17:15:20Z',
    stepName: '3. Constrained Solver Run',
    actor: 'OR-Tools Optimization Engine',
    role: 'Constraint Engine',
    action: 'SOLVER_STATUS_PENDING',
    stateHash: sha256('AUD-003:SOLVE_OPTIMAL_ALLOCATION:NOT_YET_RUN'),
    modelVersion: 'or-tools (Not yet run)',
    payloadSummary: 'Candidate corridor prepared: PHC_B → PHC_A. Mathematical solver execution: Not yet run.',
    status: 'VERIFIED'
  },
  {
    id: 'AUD-004',
    timestamp: '2026-09-29T17:16:02Z',
    stepName: '4. Decision Rationale Synthesized',
    actor: 'Clinical Logistics Decision Rationale',
    role: 'Decision Rationale Engine',
    action: 'SYNTHESIZE_EXPLANATION',
    stateHash: sha256('AUD-004:SYNTHESIZE_EXPLANATION:GEMINI_GROUNDED'),
    modelVersion: 'clinical-rationale-v1',
    payloadSummary: 'Synthesized grounded causal brief: ARI pediatric surge + 6d warehouse delay. Confidence: 96.4%.',
    status: 'VERIFIED'
  },
  {
    id: 'AUD-005',
    timestamp: '2026-09-29T17:28:44Z',
    stepName: '5. Human Decision Logged',
    actor: 'Dr. Rajesh Sharma, MD',
    role: 'District Health Officer (DHO)',
    action: 'APPROVE_ALLOCATION_ORDER',
    stateHash: sha256('AUD-005:APPROVE_ALLOCATION_ORDER:DHO_SHARMA'),
    modelVersion: 'XGBoost v1.0',
    payloadSummary: 'Statutory approval issued for dispatch order #DSP-2026-0914-184. Electronic signature verified.',
    status: 'COMMITTED'
  }
];

// Typed Mock API Service
export class DecisionService {
  static getPHCNodes(connectionState: SystemConnectionState): PHCNodeData[] {
    if (connectionState === 'STALE_CRITICAL') {
      return SEEDED_PHC_NODES.map(p =>
        p.id === 'PHC_A' || p.id === 'PHC-184' ? { ...p, freshnessMinutes: 284, status: 'STALE' as const } : p
      );
    }
    return SEEDED_PHC_NODES;
  }

  static getRiskRadar(connectionState: SystemConnectionState): RiskRadarItem[] {
    return SEEDED_RISK_RADAR;
  }

  static getPHC(id: string, connectionState: SystemConnectionState): PHCNodeData | undefined {
    const list = this.getPHCNodes(connectionState);
    return list.find(p => p.id === id) || list[0];
  }

  static getForecast(phcId: string): ForecastPoint[] {
    return SEEDED_FORECAST_SERIES_PHC184;
  }

  static getDonors(receiverId: string, connectionState: SystemConnectionState): DonorCandidate[] {
    if (connectionState === 'NO_SAFE_DONOR') {
      return SEEDED_DONORS_PHC184.map(d => ({
        ...d,
        isSafe: false,
        reason: 'Violates minimum regional reserve due to district-wide epidemic depletion.'
      }));
    }
    return SEEDED_DONORS_PHC184;
  }

  static getRecommendation(
    receiverId: string,
    connectionState: SystemConnectionState
  ): SolverRecommendation {
    if (connectionState === 'SOLVER_FAILURE') {
      return {
        ...SEEDED_RECOMMENDATION_PHC184,
        solverStatus: 'INFEASIBLE',
        transferQuantity: 0,
        residualShortage: 410,
        constraints: SEEDED_RECOMMENDATION_PHC184.constraints.map(c =>
          c.category === 'route_feasibility'
            ? { ...c, passed: false, metricValue: 'Bridge washed out at Chakan (No alternate route < 4h)' }
            : c
        )
      };
    }
    if (connectionState === 'NO_SAFE_DONOR') {
      return {
        ...SEEDED_RECOMMENDATION_PHC184,
        transferQuantity: 0,
        residualShortage: 410,
        constraints: SEEDED_RECOMMENDATION_PHC184.constraints.map(c =>
          c.category === 'donor_safety'
            ? { ...c, passed: false, metricValue: 'Zero facilities satisfy >10d retained buffer' }
            : c
        )
      };
    }
    return SEEDED_RECOMMENDATION_PHC184;
  }

  static getGeminiExplanation(
    phcId: string,
    connectionState: SystemConnectionState
  ): GeminiExplanation | null {
    if (connectionState === 'GEMINI_UNAVAILABLE') {
      return null;
    }
    return SEEDED_GEMINI_EXPLANATION_PHC184;
  }

  static getFederationState(): FederationRoundState {
    return SEEDED_FEDERATION_STATE;
  }

  static getEmergencyState(): EmergencySurgeState {
    return SEEDED_EMERGENCY_STATE;
  }

  static getAuditTrail(): AuditEvent[] {
    return SEEDED_AUDIT_TRAIL;
  }

  // Cryptographic state hash using authentic SHA-256
  static generateHash(dataString: string): string {
    return sha256(dataString);
  }
}
