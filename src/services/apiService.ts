import {
  District,
  PHCCentre,
  StockoutAlert,
  RedistributionTransfer,
  OptimizerSummary,
  FederatedClientNode,
  FederatedRoundHistory,
  AnomalyReport,
  ForecastModelMetrics,
} from '../types';
import {
  MOCK_DISTRICTS,
  MOCK_PHCS,
  MOCK_ALERTS,
  MOCK_TRANSFERS,
  MOCK_OPTIMIZER_SUMMARY,
  MOCK_FEDERATED_NODES,
  MOCK_FEDERATED_ROUNDS,
  MOCK_ANOMALIES,
  MOCK_FORECAST_DATA,
  NATIONAL_STATS,
} from '../data/mockData';

// API Configuration: Set VITE_API_BASE_URL to connect to real FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const IS_LIVE_BACKEND_AVAILABLE = Boolean(API_BASE_URL);

export const apiService = {
  // Check backend connectivity
  isUsingLiveBackend: () => IS_LIVE_BACKEND_AVAILABLE,

  getNationalSummary: async () => {
    if (IS_LIVE_BACKEND_AVAILABLE) {
      const res = await fetch(`${API_BASE_URL}/summary`);
      return res.json();
    }
    return NATIONAL_STATS;
  },

  getDistricts: async (): Promise<District[]> => {
    if (IS_LIVE_BACKEND_AVAILABLE) {
      const res = await fetch(`${API_BASE_URL}/districts`);
      return res.json();
    }
    return MOCK_DISTRICTS;
  },

  getPHCs: async (districtId?: string): Promise<PHCCentre[]> => {
    if (IS_LIVE_BACKEND_AVAILABLE) {
      const url = districtId
        ? `${API_BASE_URL}/phcs?district_id=${districtId}`
        : `${API_BASE_URL}/phcs`;
      const res = await fetch(url);
      return res.json();
    }
    if (districtId) {
      return MOCK_PHCS.filter((p) => p.districtId === districtId);
    }
    return MOCK_PHCS;
  },

  getForecast: async (
    medicineCode: string,
    districtId: string,
    horizonDays: 7 | 14 | 30 = 14
  ): Promise<ForecastModelMetrics> => {
    if (IS_LIVE_BACKEND_AVAILABLE) {
      const res = await fetch(
        `${API_BASE_URL}/forecast?medicine=${medicineCode}&district=${districtId}&horizon=${horizonDays}`
      );
      return res.json();
    }
    // Return typed mock with requested parameters
    return {
      ...MOCK_FORECAST_DATA,
      medicineCode,
      districtId,
      horizonDays,
    };
  },

  getStockoutAlerts: async (): Promise<StockoutAlert[]> => {
    if (IS_LIVE_BACKEND_AVAILABLE) {
      const res = await fetch(`${API_BASE_URL}/alerts`);
      return res.json();
    }
    return MOCK_ALERTS;
  },

  getRedistributionPlan: async (params?: {
    maxDistanceKm?: number;
    minBufferPct?: number;
    surgeMultiplier?: number;
  }): Promise<{ transfers: RedistributionTransfer[]; summary: OptimizerSummary }> => {
    if (IS_LIVE_BACKEND_AVAILABLE) {
      const res = await fetch(`${API_BASE_URL}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.json();
    }
    return {
      transfers: MOCK_TRANSFERS,
      summary: MOCK_OPTIMIZER_SUMMARY,
    };
  },

  getFederationStatus: async (): Promise<{
    nodes: FederatedClientNode[];
    rounds: FederatedRoundHistory[];
  }> => {
    if (IS_LIVE_BACKEND_AVAILABLE) {
      const res = await fetch(`${API_BASE_URL}/federation`);
      return res.json();
    }
    return {
      nodes: MOCK_FEDERATED_NODES,
      rounds: MOCK_FEDERATED_ROUNDS,
    };
  },

  getAnomalies: async (): Promise<AnomalyReport[]> => {
    if (IS_LIVE_BACKEND_AVAILABLE) {
      const res = await fetch(`${API_BASE_URL}/anomalies`);
      return res.json();
    }
    return MOCK_ANOMALIES;
  },
};
