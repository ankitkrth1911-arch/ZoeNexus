// PHC Federated AI — Unified Domain Types & Contracts
// Product Contract: Data → Forecast → Risk → Allocation → Explanation → Human approval → Audit

export type DecisionStep =
  | 'OBSERVED'
  | 'FORECASTED'
  | 'AT_RISK'
  | 'RESOLUTION_AVAILABLE'
  | 'RECOMMENDATION_GENERATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export type SystemConnectionState =
  | 'ONLINE'
  | 'SLOW'
  | 'OFFLINE'
  | 'PENDING_SYNC'
  | 'STALE_CRITICAL'
  | 'NO_SAFE_DONOR'
  | 'GEMINI_UNAVAILABLE'
  | 'SOLVER_FAILURE';

export type UserRole =
  | 'district_officer'      // District / State Officer: read network + evidence, approve/reject transfer
  | 'phc_operator'          // PHC Operator: read own PHC, update stock/beds/staff
  | 'emergency_controller'  // Emergency Controller: read emergency scope, trigger emergency state/approve
  | 'federation_admin'      // Federation Admin: read federation metadata, control round
  | 'auditor';              // Auditor: read evidence, no modification

export type ScreenId =
  | 'pulse'        // 01 Network Pulse: "Where is the problem?"
  | 'risks'        // 02 Risk Radar: "Which PHC needs attention first?"
  | 'phc'          // 03 PHC Workspace: "Why is this PHC at risk?"
  | 'resolve'      // 04 Resolve Drawer / Full Allocation: Signature decision surface
  | 'federation'   // 05 Federation: "How does the model learn without pooling data?"
  | 'emergency'    // 06 Emergency Mode: "Emergency changes priority"
  | 'audit';       // 07 Audit Trail: "Trust is a visible state"

export type NodeOperationalStatus =
  | 'HIGH'         // High stock-out risk (< 5 days coverage)
  | 'LOW'          // Healthy/Low risk (> 10 days coverage)
  | 'SURPLUS'      // Available safe surplus donor (> 15 days coverage)
  | 'EMERGENCY'    // Priority surge/outbreak zone
  | 'STALE'        // Reporting telemetry delayed > 4h
  | 'OFFLINE'      // Clinic connectivity completely down
  | 'NO_DATA';     // Incomplete sensor feed

export interface PHCNodeData {
  id: string;               // e.g. "PHC-184"
  name: string;             // e.g. "PHC 184 — Shirur Rural Health Unit"
  districtId: string;       // e.g. "DIST-PUN"
  districtName: string;     // e.g. "Pune District"
  state: string;            // e.g. "Maharashtra"
  lat: number;
  lng: number;
  status: NodeOperationalStatus;
  primaryMedicine: string;  // e.g. "Amoxicillin 500mg"
  primaryMedicineCode: string; // e.g. "MED-AMX-500"
  currentStock: number;     // e.g. 420
  forecastDemand15d: number;// e.g. 830
  coverageDays: number;     // e.g. 3.8
  shortageUnits: number;    // e.g. 410
  minBufferUnits: number;   // e.g. 300
  bedsTotal: number;        // e.g. 24
  bedsOccupied: number;     // e.g. 18
  staffAssigned: number;    // e.g. 10
  staffPresent: number;     // e.g. 7
  oxygenCylinders: number;  // e.g. 8
  freshnessMinutes: number; // e.g. 12 (or 260 for stale)
  riskDrivers: {
    label: string;
    changePct: number;
    impact: 'critical' | 'warning' | 'info';
    detail: string;
  }[];
  isDonorCandidate?: boolean;
  surplusUnits?: number;
}

export interface RiskRadarItem {
  id: string;
  phcId: string;
  phcName: string;
  districtName: string;
  medicineCode: string;
  medicineName: string;
  currentStock: number;
  forecast15d: number;
  coverageDays: number;
  riskLevel: 'HIGH' | 'MED' | 'LOW';
  freshnessMinutes: number;
  shortageUnits: number;
  isDonorCandidate: boolean;
  suggestedAction: string;
}

export interface ForecastPoint {
  dayLabel: string;
  dateStr: string;
  isToday?: boolean;
  stockTrajectory: number;
  actualDemand?: number;
  predictedDemand: number;
  lowerConfidence: number;
  upperConfidence: number;
  safetyThreshold: number;
}

export interface DonorCandidate {
  id: string;
  phcId: string;
  phcName: string;
  distanceKm: number;
  currentStock: number;
  minBuffer: number;
  surplusAvailable: number;
  isSafe: boolean;
  reason: string;
  transitMinutes: number;
  coldChainCompliant: boolean;
  transportMode: string;
}

export interface ConstraintCheckItem {
  id: string;
  name: string;
  passed: boolean;
  category: 'donor_safety' | 'receiver_need' | 'route_feasibility' | 'cold_chain';
  description: string;
  metricLabel: string;
  metricValue: string;
  thresholdValue: string;
}

export interface SolverRecommendation {
  id: string;
  donorId: string;
  donorName: string;
  receiverId: string;
  receiverName: string;
  medicineCode: string;
  medicineName: string;
  transferQuantity: number;
  residualShortage: number;
  corridor: string;
  transitMinutes: number;
  distanceKm: number;
  estLogisticsCostINR: number;
  estLogisticsCostUSD: number;
  estCo2Kg: number;
  constraints: ConstraintCheckItem[];
  generatedTimestamp: string;
  solverType: string;
  solverStatus: 'OPTIMAL' | 'INFEASIBLE' | 'DEGRADED' | 'NOT_YET_RUN';
}

export interface GeminiExplanation {
  phcId: string;
  medicineName: string;
  headline: string;
  whyThisDonor: string;
  whyNotMore: string;
  whatCausedRisk: string;
  groundedFacts: {
    label: string;
    value: string;
    verifiedSource: string;
  }[];
  regulatoryCompliance: string; // e.g. "IPHS 2022 §4.2 & WHO PQS E003/01"
  confidenceScore: number;      // e.g. 96.4%
  source?: 'gemini' | 'cached';
  rawExplanation?: string;
  modelUsed?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  stepName: string;
  actor: string;
  role: string;
  action: string;
  stateHash: string;
  modelVersion: string;
  payloadSummary: string;
  status: 'COMMITTED' | 'VERIFIED' | 'FLAGGED';
}

export interface FederationNodeClient {
  id: string;
  name: string;
  location: string;
  status: 'Training' | 'Complete' | 'Offline';
  samplesCount: number;
  localAccuracy: number | null;
  weightGradientsKB: number;
  latencyMs: number;
  lastRoundLoss: number;
  differentialPrivacyEpsilon: number | null;
}

export interface FederationRoundState {
  currentRound: number;
  status: 'AGGREGATING' | 'ROUND_COMPLETE' | 'TRAINING_LOCAL';
  globalModelVersion: string;
  participatingClients: number;
  totalClients: number;
  globalAccuracyPct: number | null;
  convergenceDelta: number;
  epsilonBudgetTotal: number;
  epsilonBudgetConsumed: number | null;
  lastAggregatedAt: string;
  clients: FederationNodeClient[];
}

export interface EmergencySurgeState {
  active: boolean;
  incidentName: string;
  incidentLocation: string;
  incidentType: string;
  declaredAt: string;
  surgeMultiplier: number;
  affectedPHCsCount: number;
  highRiskSitesCount: number;
  availableSafeSurplus: number;
  residualShortageUnits: number;
  priorityMedicine: string;
  status: 'TRIAGE' | 'ALLOCATING' | 'EXECUTING' | 'RESOLVED';
}
