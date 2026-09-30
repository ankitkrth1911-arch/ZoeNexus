import { create } from 'zustand';
import {
  District,
  PHCCentre,
  StockoutAlert,
  RedistributionTransfer,
  OptimizerSummary,
  FederatedClientNode,
  FederatedRoundHistory,
  AnomalyReport,
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
  NATIONAL_STATS,
} from '../data/mockData';

export type ScreenId =
  | 'overview'
  | 'map'
  | 'forecast'
  | 'alerts'
  | 'redistribution'
  | 'federated'
  | 'anomalies'
  | 'explain'
  | 'reports'
  | 'settings';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'warning' | 'info' | 'critical';
}

interface CommandState {
  // Navigation
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Scope & Selection
  selectedCountry: string; // 'IN', 'BR', 'RU', 'CN', 'ZA'
  setSelectedCountry: (code: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrictId: string | null;
  setSelectedDistrictId: (id: string | null) => void;
  selectedPHCId: string | null;
  setSelectedPHCId: (id: string | null) => void;
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;

  // Right Drawer
  isDrawerOpen: boolean;
  drawerType: 'district' | 'phc' | 'alert' | null;
  openDrawer: (type: 'district' | 'phc' | 'alert', id: string) => void;
  closeDrawer: () => void;

  // Panel focus mode (expand panel full screen)
  focusedPanelId: string | null;
  setFocusedPanelId: (id: string | null) => void;

  // Map Controls
  mapMetricOverlay: 'risk' | 'stock' | 'beds' | 'staff';
  setMapMetricOverlay: (metric: 'risk' | 'stock' | 'beds' | 'staff') => void;
  showFlowArcs: boolean;
  setShowFlowArcs: (show: boolean) => void;
  showPulsingPHCs: boolean;
  setShowPulsingPHCs: (show: boolean) => void;

  // Time Range
  timeRange: '7d' | '14d' | '30d';
  setTimeRange: (range: '7d' | '14d' | '30d') => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Redistribution Simulation & Optimization
  transfers: RedistributionTransfer[];
  optimizerSummary: OptimizerSummary;
  maxTransportKm: number;
  setMaxTransportKm: (km: number) => void;
  minBufferPercentage: number;
  setMinBufferPercentage: (pct: number) => void;
  surgeMultiplier: number;
  setSurgeMultiplier: (val: number) => void;
  disasterMode: boolean;
  setDisasterMode: (enabled: boolean) => void;
  approveTransfer: (transferId: string, officerName?: string) => void;
  approveAllTransfers: () => void;
  undoTransferApproval: (transferId: string) => void;

  // Anomalies
  anomalies: AnomalyReport[];
  markAnomalyReviewed: (id: string, notes?: string) => void;

  // Federated Network Simulation
  federatedNodes: FederatedClientNode[];
  federatedRounds: FederatedRoundHistory[];
  isTrainingSimulating: boolean;
  triggerFederatedRoundSimulation: () => void;

  // Alerts
  alerts: StockoutAlert[];
  resolveAlert: (alertId: string) => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;

  // Freshness
  lastDataFreshnessSeconds: number;
  resetFreshness: () => void;
}

export const useCommandStore = create<CommandState>((set, get) => ({
  activeScreen: 'overview',
  setActiveScreen: (screen) => set({ activeScreen: screen }),

  theme: 'dark',
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (nextTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
    set({ theme: nextTheme });
  },

  selectedCountry: 'IN',
  setSelectedCountry: (code) => {
    set({ selectedCountry: code });
    get().addToast({
      title: `Region Changed`,
      description: `Synchronized telemetry with ${code} Federated Regional Cluster.`,
      type: 'info',
    });
  },
  selectedState: 'Maharashtra',
  setSelectedState: (state) => set({ selectedState: state }),
  selectedDistrictId: 'DIST-STR', // Default selected to Satara for immediate high-density drilldown
  setSelectedDistrictId: (id) => set({ selectedDistrictId: id }),
  selectedPHCId: null,
  setSelectedPHCId: (id) => set({ selectedPHCId: id }),
  selectedAlertId: null,
  setSelectedAlertId: (id) => set({ selectedAlertId: id }),

  isDrawerOpen: false,
  drawerType: null,
  openDrawer: (type, id) => {
    if (type === 'district') set({ selectedDistrictId: id });
    if (type === 'phc') set({ selectedPHCId: id });
    if (type === 'alert') set({ selectedAlertId: id });
    set({ isDrawerOpen: true, drawerType: type });
  },
  closeDrawer: () => set({ isDrawerOpen: false, drawerType: null }),

  focusedPanelId: null,
  setFocusedPanelId: (id) => set({ focusedPanelId: id }),

  mapMetricOverlay: 'risk',
  setMapMetricOverlay: (metric) => set({ mapMetricOverlay: metric }),
  showFlowArcs: true,
  setShowFlowArcs: (show) => set({ showFlowArcs: show }),
  showPulsingPHCs: true,
  setShowPulsingPHCs: (show) => set({ showPulsingPHCs: show }),

  timeRange: '14d',
  setTimeRange: (range) => set({ timeRange: range }),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  // Transfers & Optimizer
  transfers: MOCK_TRANSFERS,
  optimizerSummary: MOCK_OPTIMIZER_SUMMARY,
  maxTransportKm: 200,
  setMaxTransportKm: (km) => {
    set({ maxTransportKm: km });
    // Dynamically filter or recompute transfers within radius
  },
  minBufferPercentage: 25,
  setMinBufferPercentage: (pct) => set({ minBufferPercentage: pct }),
  surgeMultiplier: 1.0,
  setSurgeMultiplier: (val) => {
    set({ surgeMultiplier: val });
    // Compute surge impact
    const baseUnmet = 274500;
    const baseOpt = 15200;
    set({
      optimizerSummary: {
        ...get().optimizerSummary,
        unmetDemandBefore: Math.round(baseUnmet * val),
        unmetDemandAfter: Math.round(baseOpt * Math.min(val * 1.2, 2.5)),
      },
    });
  },
  disasterMode: false,
  setDisasterMode: (enabled) => {
    set({ disasterMode: enabled });
    if (enabled) {
      get().addToast({
        title: 'Disaster Protocol Activated',
        description: 'Inter-district emergency buffer overrides enabled. Cold-chain priority lanes cleared.',
        type: 'critical',
      });
    } else {
      get().addToast({
        title: 'Standard Grid Mode Resumed',
        description: 'Standard buffer thresholds (25%) restored.',
        type: 'info',
      });
    }
  },

  approveTransfer: (transferId, officerName = 'Dr. V. Rao (DHO Satara)') => {
    const updated = get().transfers.map((t) =>
      t.id === transferId
        ? {
            ...t,
            status: 'approved' as const,
            approvalTimestamp: 'Just now',
            approvedBy: officerName,
          }
        : t
    );
    set({ transfers: updated });
    get().addToast({
      title: 'Transfer Approved',
      description: `Dispatched ${transferId} under emergency public health authority.`,
      type: 'success',
    });
  },

  approveAllTransfers: () => {
    const updated = get().transfers.map((t) => ({
      ...t,
      status: 'approved' as const,
      approvalTimestamp: 'Just now',
      approvedBy: 'National Health Commissioner / AI Auto-Authorize',
    }));
    set({ transfers: updated });
    get().addToast({
      title: 'Batch Transfers Approved',
      description: 'All 5 recommended corridors dispatched. Tracking numbers generated.',
      type: 'success',
    });
  },

  undoTransferApproval: (transferId) => {
    const updated = get().transfers.map((t) =>
      t.id === transferId
        ? {
            ...t,
            status: 'proposed' as const,
            approvalTimestamp: undefined,
            approvedBy: undefined,
          }
        : t
    );
    set({ transfers: updated });
    get().addToast({
      title: 'Transfer Approval Revoked',
      description: `Returned ${transferId} to proposed queue.`,
      type: 'warning',
    });
  },

  // Anomalies
  anomalies: MOCK_ANOMALIES,
  markAnomalyReviewed: (id, notes = 'Reviewed by District Vigilance Officer') => {
    const updated = get().anomalies.map((a) =>
      a.id === id ? { ...a, reviewed: true, reviewerNotes: notes } : a
    );
    set({ anomalies: updated });
    get().addToast({
      title: 'Anomaly Marked Reviewed',
      description: `Incident ${id} updated with audit timestamp.`,
      type: 'info',
    });
  },

  // Federated Network
  federatedNodes: MOCK_FEDERATED_NODES,
  federatedRounds: MOCK_FEDERATED_ROUNDS,
  isTrainingSimulating: false,
  triggerFederatedRoundSimulation: () => {
    if (get().isTrainingSimulating) return;
    set({ isTrainingSimulating: true });

    get().addToast({
      title: 'Federated Round #6 Initiated',
      description: 'Broadcasting model weights to 5 district edge nodes with DP (Not yet run).',
      type: 'info',
    });

    // Simulate 3-stage training animation
    setTimeout(() => {
      // Stage 2: local gradient calculation
      set({
        federatedNodes: get().federatedNodes.map((n) => ({
          ...n,
          status: 'training' as const,
        })),
      });
    }, 800);

    setTimeout(() => {
      // Stage 3: secure aggregation
      set({
        federatedNodes: get().federatedNodes.map((n) => ({
          ...n,
          status: 'aggregating' as const,
        })),
      });
    }, 2200);

    setTimeout(() => {
      // Round Complete
      const newRound: FederatedRoundHistory = {
        roundNumber: 6,
        timestamp: 'Just now',
        globalFedAvgAccuracy: 94.6,
        globalFedProxAccuracy: 96.8,
        localOnlyBaselineAccuracy: 74.4,
        participatingNodes: 5,
        totalGradientsAggregated: 184200,
        privacyBudgetRemaining: 6.8,
        convergenceDelta: 0.007,
      };

      set({
        isTrainingSimulating: false,
        federatedRounds: [...get().federatedRounds, newRound],
        federatedNodes: get().federatedNodes.map((n) => ({
          ...n,
          status: 'online' as const,
          lastSyncTime: 'Just now',
          localAccuracy: Math.min(99.4, Number((n.localAccuracy + 0.4).toFixed(1))),
        })),
      });

      get().addToast({
        title: 'Round #6 Completed & Verified',
        description: 'Global FedProx model reached 96.8% accuracy. Zero raw patient data transmitted.',
        type: 'success',
      });
    }, 3800);
  },

  // Alerts
  alerts: MOCK_ALERTS,
  resolveAlert: (alertId) => {
    set({
      alerts: get().alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'resolved' as const } : a
      ),
    });
    get().addToast({
      title: 'Alert Resolved',
      description: `Alert ${alertId} resolved via emergency stock replenishment.`,
      type: 'success',
    });
  },

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  // Freshness
  lastDataFreshnessSeconds: 12,
  resetFreshness: () => set({ lastDataFreshnessSeconds: 0 }),
}));
