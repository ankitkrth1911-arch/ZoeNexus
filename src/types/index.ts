// SANJEEVANI GRID - Core TypeScript Domain Types

export type RiskLevel = 'critical' | 'warning' | 'healthy' | 'info';

export type MedicineCategory = 
  | 'Essential Antibiotic'
  | 'Maternal Health'
  | 'Emergency Care'
  | 'Vaccine'
  | 'Chronic Care'
  | 'IV Fluids';

export interface MedicineInventory {
  code: string;
  name: string;
  category: MedicineCategory;
  unit: string;
  currentStock: number;
  minBufferStock: number;
  dailyBurnRate: number;
  daysOfStockLeft: number;
  riskLevel: RiskLevel;
  trend: 'depleting_fast' | 'stable' | 'surplus';
  lastRestocked: string;
  batchNumber: string;
  coldChainRequired: boolean;
}

export interface PHCCentre {
  id: string;
  name: string;
  districtId: string;
  districtName: string;
  lat: number;
  lng: number;
  type: '24x7 PHC' | 'Sub-Centre' | 'Community Health Centre (CHC)';
  populationServed: number;
  doctorPresent: boolean;
  powerBackup: boolean;
  coldChainStatus: 'optimal' | 'warning' | 'failure';
  totalBeds: number;
  occupiedBeds: number;
  staffAssigned: number;
  staffPresent: number;
  criticalStockoutsCount: number;
  avgDaysOfStock: number;
  resilienceScore: number; // 0 - 100
  inventory: MedicineInventory[];
  lastReportingTime: string;
}

export interface District {
  id: string;
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  totalPHCs: number;
  reportingRate: number; // e.g. 98.4%
  resilienceScore: number; // 0 - 100
  riskLevel: RiskLevel;
  stockoutRiskScore: number; // 0 - 100
  bedOccupancy: number; // percentage
  staffAttendance: number; // percentage
  populationServed: number;
  criticalMedicines: string[];
  daysOfStockAvg: number;
  unmetDemandUnits: number;
  donorCapable: boolean;
}

export interface ForecastDataPoint {
  date: string;
  dayLabel: string;
  isToday?: boolean;
  actualDemand?: number;
  predictedDemand: number;
  upperConfidence: number;
  lowerConfidence: number;
  baselineDemand: number;
  stockAvailable: number;
}

export interface ForecastModelMetrics {
  medicineCode: string;
  medicineName: string;
  districtId: string;
  districtName: string;
  horizonDays: 7 | 14 | 30;
  mae: number;
  mape: number;
  rmse: number;
  modelType: 'Federated XGBoost Ensemble' | 'Local ARIMA' | 'Baseline Moving Average';
  featureImportance: {
    feature: string;
    weight: number;
    impact: string;
  }[];
  forecastSeries: ForecastDataPoint[];
}

export interface StockoutAlert {
  id: string;
  timestamp: string;
  districtId: string;
  districtName: string;
  phcId?: string;
  phcName?: string;
  medicineCode: string;
  medicineName: string;
  currentStock: number;
  daysRemaining: number;
  predictedDepletionDate: string;
  severity: RiskLevel;
  affectedPopulation: number;
  suggestedAction: string;
  status: 'active' | 'in_progress' | 'resolved';
}

export interface RedistributionTransfer {
  id: string;
  donorDistrictId: string;
  donorDistrictName: string;
  donorPHC?: string;
  receiverDistrictId: string;
  receiverDistrictName: string;
  receiverPHC?: string;
  medicineCode: string;
  medicineName: string;
  quantity: number;
  unit: string;
  distanceKm: number;
  estTransitHours: number;
  estCostINR: number;
  estCostUSD: number;
  donorStockBefore: number;
  donorStockAfter: number;
  receiverStockBefore: number;
  receiverStockAfter: number;
  urgency: 'high' | 'medium' | 'critical';
  status: 'proposed' | 'approved' | 'in_transit' | 'delivered';
  approvalTimestamp?: string;
  approvedBy?: string;
}

export interface OptimizerSummary {
  unmetDemandBefore: number;
  unmetDemandAfter: number;
  criticalShortagesBefore: number;
  criticalShortagesAfter: number;
  totalLogisticsCostINR: number;
  totalLogisticsCostUSD: number;
  avgStockDaysGain: number;
  co2ImpactKg: number;
  transfersCount: number;
}

export interface FederatedClientNode {
  id: string;
  name: string;
  state: string;
  nodeType: 'State Grid Hub' | 'District Aggregator';
  status: 'online' | 'training' | 'aggregating' | 'offline';
  localSamplesCount: number;
  localAccuracy: number;
  weightContribution: number;
  lastSyncTime: string;
  differentialPrivacyEpsilon: number; // e.g. 1.84
  gradientHash: string;
  latencyMs: number;
}

export interface FederatedRoundHistory {
  roundNumber: number;
  timestamp: string;
  globalFedAvgAccuracy: number;
  globalFedProxAccuracy: number;
  localOnlyBaselineAccuracy: number;
  participatingNodes: number;
  totalGradientsAggregated: number;
  privacyBudgetRemaining: number;
  convergenceDelta: number;
}

export interface AnomalyReport {
  id: string;
  timestamp: string;
  districtId: string;
  districtName: string;
  phcId: string;
  phcName: string;
  medicineCode: string;
  medicineName: string;
  anomalyType: 
    | 'Sudden Consumption Spike'
    | 'Ghost Stock Reporting Gap'
    | 'Cold-Chain Thermal Excursion'
    | 'Suspicious Zero-Dispense Event';
  confidenceScore: number; // 0 - 100
  isolationForestScore: number;
  expectedConsumption: number;
  reportedConsumption: number;
  deviationPercentage: number;
  severity: RiskLevel;
  reviewed: boolean;
  reviewerNotes?: string;
}

export interface GeminiExplainResponse {
  summary: string;
  confidence: number;
  groundedFactors: {
    factor: string;
    dataPoint: string;
    impactLevel: 'high' | 'medium' | 'low';
  }[];
  recommendedActions: {
    step: number;
    action: string;
    timeframe: string;
    expectedOutcome: string;
  }[];
  regulatoryContext: string;
  auditBadge: string;
}

export interface OperationalTickerEvent {
  id: string;
  timestamp: string;
  type: 'stockout_risk' | 'federated_round' | 'transfer_dispatched' | 'cold_chain' | 'system';
  message: string;
  severity: RiskLevel;
  district?: string;
}
