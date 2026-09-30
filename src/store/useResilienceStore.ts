// PHC Federated AI — Unified Resilience Store (Zustand)
import { create } from 'zustand';
import {
  ScreenId,
  DecisionStep,
  SystemConnectionState,
  UserRole,
  AuditEvent,
  PHCNodeData,
  RiskRadarItem,
  DonorCandidate,
  SolverRecommendation,
  GeminiExplanation,
  FederationRoundState,
  EmergencySurgeState,
  ForecastPoint,
} from '../types/decision';
import {
  DecisionService,
  SEEDED_AUDIT_TRAIL,
  SEEDED_FEDERATION_STATE,
  SEEDED_EMERGENCY_STATE,
} from '../services/decisionService';
import { fetchAllForecasts, fetchMetrics, BackendForecast, BackendMetric } from '../services/apiService';
import { adaptForecastToPoints } from '../services/backendAdapter';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  title: string;
  detail?: string;
  timestamp: string;
}

interface ResilienceState {
  // Navigation & Screen Shell
  screen: ScreenId;
  setScreen: (screen: ScreenId) => void;
  isRailCollapsed: boolean;
  toggleRail: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Context & Scope
  selectedState: string;
  selectedDistrict: string;
  selectedPHCId: string;
  selectedMedicineCode: string;
  setSelectedPHCId: (id: string) => void;

  // Real System & Scenario States
  connectionState: SystemConnectionState;
  setConnectionState: (state: SystemConnectionState) => void;

  // User Role Contract
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Right Decision Drawer
  isDrawerOpen: boolean;
  openDrawer: (phcId?: string) => void;
  closeDrawer: () => void;
  decisionStep: DecisionStep;
  setDecisionStep: (step: DecisionStep) => void;

  // Decision Actions (Human in the Loop)
  approveAllocation: (officerNote?: string) => { success: boolean; reason?: string };
  rejectAllocation: (reason: string) => void;

  // Live backend data (hydrated by initBackendData on mount)
  livePhcList: PHCNodeData[] | null;
  liveRiskList: RiskRadarItem[] | null;
  rawForecasts: BackendForecast[] | null;
  metrics: BackendMetric[] | null;
  bestModel: string;
  dataLabel: string;               // e.g. 'Simulated data' or 'Offline demo data'
  isLiveData: boolean;             // true = from FastAPI backend
  isLoadingBackend: boolean;
  initBackendData: () => Promise<void>;

  // Data Queries
  getPHCList: () => PHCNodeData[];
  getCurrentPHC: () => PHCNodeData;
  getRiskRadarList: () => RiskRadarItem[];
  getForecastPoints: (phcId?: string, medicineId?: string) => ForecastPoint[];
  getDonorsList: () => DonorCandidate[];
  getRecommendation: () => SolverRecommendation;
  getGeminiExplanation: () => GeminiExplanation | null;
  getFederationState: () => FederationRoundState;
  getEmergencyState: () => EmergencySurgeState;
  getAuditTrail: () => AuditEvent[];

  // Dynamic Federation Simulation
  federationState: FederationRoundState;
  triggerFederationRound: () => void;

  // Emergency State
  emergencyState: EmergencySurgeState;
  toggleEmergencyActive: () => void;

  // Audit Events
  auditTrail: AuditEvent[];

  // Map Layers & Tray
  isRiskTrayOpen: boolean;
  setRiskTrayOpen: (open: boolean) => void;
  toggleRiskTray: () => void;
  mapLayerFilter: 'ALL' | 'HIGH' | 'SURPLUS' | 'EMERGENCY' | 'STALE' | 'OFFLINE';
  setMapLayerFilter: (filter: 'ALL' | 'HIGH' | 'SURPLUS' | 'EMERGENCY' | 'STALE' | 'OFFLINE') => void;
  mapViewMode: 'schematic' | 'geo';
  setMapViewMode: (mode: 'schematic' | 'geo') => void;

  // 60-Second Judge Tour Assistant
  isTourOpen: boolean;
  tourStep: number;
  openTour: () => void;
  closeTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  jumpToTourStep: (step: number) => void;

  // Global Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
}

export const useResilienceStore = create<ResilienceState>((set, get) => ({
  // Defaults
  screen: 'pulse',
  setScreen: (screen) => {
    if (screen === 'risks') {
      set({ screen, isRiskTrayOpen: true });
    } else if (screen === 'resolve') {
      set({ screen, isDrawerOpen: true });
    } else {
      set({ screen });
    }
  },
  isRailCollapsed: false,
  toggleRail: () => set((s) => ({ isRailCollapsed: !s.isRailCollapsed })),

  // Map & Tray State
  isRiskTrayOpen: false,
  setRiskTrayOpen: (open) => set({ isRiskTrayOpen: open }),
  toggleRiskTray: () => set((s) => ({ isRiskTrayOpen: !s.isRiskTrayOpen })),
  mapLayerFilter: 'ALL',
  setMapLayerFilter: (filter) => set({ mapLayerFilter: filter }),
  mapViewMode: 'schematic',
  setMapViewMode: (mode) => set({ mapViewMode: mode }),

  theme: 'light',
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: nextTheme });
  },

  selectedState: 'Maharashtra',
  selectedDistrict: 'DIST-PUN',
  selectedPHCId: 'PHC_A',
  selectedMedicineCode: 'AMLODIPINE',
  setSelectedPHCId: (id) => {
    set({ selectedPHCId: id });
    const phc = get().getCurrentPHC();
    if (phc) {
      set({ selectedMedicineCode: phc.primaryMedicineCode });
    }
  },

  connectionState: 'ONLINE',
  setConnectionState: (connectionState) => {
    set({ connectionState });
    get().addToast({
      type: connectionState === 'ONLINE' ? 'info' : 'warning',
      title: `Scenario State Changed: ${connectionState}`,
      detail:
        connectionState === 'STALE_CRITICAL'
          ? 'Telemetric freshness degraded to >4h. Authoritative transfer approvals are now BLOCKED.'
          : connectionState === 'OFFLINE'
          ? 'Local facility connectivity severed. Approvals disabled until re-sync.'
          : connectionState === 'NO_SAFE_DONOR'
          ? 'Regional epidemic surge has consumed safe donor margins.'
          : connectionState === 'SOLVER_FAILURE'
          ? 'Routing constraint failure (bridge washed out); solver cannot find feasible corridor.'
          : `Active operational network state updated to ${connectionState}.`
    });
  },

  currentRole: 'district_officer',
  setCurrentRole: (currentRole) => {
    set({ currentRole });
    get().addToast({
      type: 'info',
      title: `Role Switched: ${currentRole.replace('_', ' ').toUpperCase()}`,
      detail:
        currentRole === 'district_officer'
          ? 'Full statutory review and inter-PHC allocation approval rights.'
          : currentRole === 'phc_operator'
          ? 'Facility operator mode: read local clinic data and log local consumption.'
          : currentRole === 'emergency_controller'
          ? 'Disaster response lead: priority surge triage and mass reallocation authority.'
          : currentRole === 'federation_admin'
          ? 'Federated intelligence governor: DP epsilon budget and aggregation monitoring.'
          : 'Statutory auditor: immutable inspection and export verification rights.'
    });
  },

  // Decision Drawer
  isDrawerOpen: true, // open by default to immediately highlight the core decision
  openDrawer: (phcId) => {
    if (phcId) {
      get().setSelectedPHCId(phcId);
    }
    set({ isDrawerOpen: true });
  },
  closeDrawer: () => set({ isDrawerOpen: false }),
  decisionStep: 'PENDING_APPROVAL',
  setDecisionStep: (decisionStep) => set({ decisionStep }),

  // Human in the Loop Approval
  approveAllocation: (officerNote) => {
    const { connectionState, currentRole, selectedPHCId, auditTrail } = get();

    // Verification Rules
    if (currentRole === 'auditor') {
      get().addToast({
        type: 'critical',
        title: 'Action Denied: Auditor Role',
        detail: 'Auditors maintain strict read-only inspection access.'
      });
      return { success: false, reason: 'Auditors cannot approve allocation orders.' };
    }

    if (connectionState === 'STALE_CRITICAL') {
      get().addToast({
        type: 'critical',
        title: 'Approval Blocked: Stale Critical Telemetry',
        detail: 'Facility reporting age is 4h 12m. Fresh telemetry is legally required before committing stock transfer.'
      });
      return { success: false, reason: 'Telemetry age exceeds 4-hour statutory threshold.' };
    }

    if (connectionState === 'OFFLINE') {
      get().addToast({
        type: 'critical',
        title: 'Approval Disabled: Facility Offline',
        detail: 'Target facility is disconnected. Cannot transmit dispatch confirmation.'
      });
      return { success: false, reason: 'Target facility is offline.' };
    }

    if (connectionState === 'SOLVER_FAILURE' || connectionState === 'NO_SAFE_DONOR') {
      get().addToast({
        type: 'critical',
        title: 'Approval Blocked: Infeasible Solution',
        detail: 'Cannot approve an unfulfilled or constraint-violating allocation plan.'
      });
      return { success: false, reason: 'No feasible or safe allocation solution exists.' };
    }

    // Success: Commit to Audit Trail with SHA-256 hash
    const rec = get().getRecommendation();
    const curPHC = get().getCurrentPHC();
    const newAuditEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      stepName: '5. Human Decision Logged (Approved)',
      actor: currentRole === 'district_officer' ? 'Dr. Rajesh Sharma, MD (DHO)' : 'Authorized Health Controller',
      role: currentRole.replace('_', ' ').toUpperCase(),
      action: 'APPROVE_ALLOCATION_ORDER',
      stateHash: DecisionService.generateHash(`approved-${selectedPHCId}-${Date.now()}`),
      modelVersion: 'v75.4-fedxgb-dp',
      payloadSummary: `Transfer order #DSP-${Date.now().toString().slice(-6)} committed: ${rec.transferQuantity} units ${curPHC.primaryMedicine || 'Amlodipine'} from ${rec.donorId} to ${selectedPHCId}. ${officerNote || 'Corridor verified via NH-48.'}`,
      status: 'COMMITTED'
    };

    set({
      decisionStep: 'APPROVED',
      auditTrail: [newAuditEvent, ...auditTrail]
    });

    get().addToast({
      type: 'success',
      title: 'Allocation Order Approved & Dispatched',
      detail: `Dispatch order #DSP-${Date.now().toString().slice(-6)} signed. Cold van #MH-12-CZ-4412 en route (42m ETA).`
    });

    return { success: true };
  },

  rejectAllocation: (reason) => {
    const { currentRole, selectedPHCId, auditTrail } = get();

    const rejectEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      stepName: '5. Human Decision Logged (Rejected)',
      actor: currentRole === 'district_officer' ? 'Dr. Rajesh Sharma, MD (DHO)' : 'Authorized Health Controller',
      role: currentRole.replace('_', ' ').toUpperCase(),
      action: 'REJECT_ALLOCATION_ORDER',
      stateHash: DecisionService.generateHash(`rejected-${selectedPHCId}-${Date.now()}`),
      modelVersion: 'v75.4-fedxgb-dp',
      payloadSummary: `Allocation plan rejected for ${selectedPHCId}. Officer reason: ${reason}`,
      status: 'COMMITTED'
    };

    set({
      decisionStep: 'REJECTED',
      auditTrail: [rejectEvent, ...auditTrail]
    });

    get().addToast({
      type: 'warning',
      title: 'Allocation Plan Rejected',
      detail: `Decision recorded with immutable audit reason: "${reason}".`
    });
  },

  // Live backend state
  livePhcList: null,
  liveRiskList: null,
  rawForecasts: null,
  metrics: [
    { model: 'XGBoost', mae: 21.67, rmse: 27.54, mae_raw: 21.67079361167494, rmse_raw: 27.541215818663826 },
    { model: 'Moving Average 7D', mae: 27.39, rmse: 34.27, mae_raw: 27.39388435338817, rmse_raw: 34.26861213430817 },
    { model: 'Seasonal Naive 7D', mae: 91.85, rmse: 111.81, mae_raw: 91.84555539378803, rmse_raw: 111.81010325298111 },
    { model: 'Naive', mae: 95.61, rmse: 116.07, mae_raw: 95.61254273577697, rmse_raw: 116.07467267004093 },
  ],
  bestModel: 'XGBoost',
  dataLabel: 'Offline demo data',
  isLiveData: false,
  isLoadingBackend: false,

  initBackendData: async () => {
    set({ isLoadingBackend: true });
    try {
      const [forecastResult, metricsResult] = await Promise.all([
        fetchAllForecasts(),
        fetchMetrics(),
      ]);
      set({
        livePhcList: forecastResult.phcList,
        liveRiskList: forecastResult.riskList,
        rawForecasts: forecastResult.rawForecasts ?? null,
        metrics: metricsResult.data?.metrics ?? get().metrics,
        bestModel: metricsResult.data?.best_model ?? 'XGBoost',
        dataLabel: forecastResult.dataLabel,
        isLiveData: forecastResult.isLive,
        isLoadingBackend: false,
        // Set default selection to first PHC if available
        selectedPHCId: forecastResult.phcList.length > 0 ? forecastResult.phcList[0].id : get().selectedPHCId,
      });
      get().addToast({
        type: forecastResult.isLive ? 'success' : 'info',
        title: forecastResult.isLive ? 'Live Backend Connected' : 'Offline Demo Mode',
        detail: forecastResult.isLive
          ? `${forecastResult.dataLabel}: ${forecastResult.phcList.length} PHCs loaded. Real ML metrics loaded from /metrics.`
          : 'Backend not reachable. Showing seeded demo data.',
      });
    } catch (err) {
      console.error('[store] initBackendData failed:', err);
      set({ isLoadingBackend: false });
    }
  },

  getPHCList: () => {
    const { livePhcList, connectionState } = get();
    const base = livePhcList ?? DecisionService.getPHCNodes(connectionState);
    if (connectionState === 'STALE_CRITICAL') {
      return base.map((p) =>
        p.id === 'PHC_A' || p.id === 'PHC-184'
          ? { ...p, freshnessMinutes: 284, status: 'STALE' as const }
          : p
      );
    }
    return base;
  },
  getCurrentPHC: () => {
    const { selectedPHCId, connectionState, livePhcList } = get();
    if (livePhcList) {
      return livePhcList.find((p) => p.id === selectedPHCId) ?? livePhcList[0];
    }
    return DecisionService.getPHC(selectedPHCId, connectionState) || DecisionService.getPHCNodes(connectionState)[0];
  },
  getRiskRadarList: () => {
    const { liveRiskList, connectionState } = get();
    return liveRiskList ?? DecisionService.getRiskRadar(connectionState);
  },
  getForecastPoints: (phcId?: string, medicineId?: string) => {
    const targetPHC = phcId ?? get().selectedPHCId;
    const targetMed = medicineId ?? get().getCurrentPHC()?.primaryMedicine ?? 'Amlodipine';
    const raw = get().rawForecasts;
    if (raw && raw.length > 0) {
      const match =
        raw.find(
          (f) =>
            f.phc_id.toLowerCase() === targetPHC.toLowerCase() &&
            (f.medicine_id.toLowerCase() === targetMed.toLowerCase() ||
              targetMed.toLowerCase().includes(f.medicine_id.toLowerCase()))
        ) || raw.find((f) => f.phc_id.toLowerCase() === targetPHC.toLowerCase());
      if (match) {
        return adaptForecastToPoints(match);
      }
    }
    return DecisionService.getForecast(targetPHC);
  },
  getDonorsList: () => DecisionService.getDonors(get().selectedPHCId, get().connectionState),
  getRecommendation: () => DecisionService.getRecommendation(get().selectedPHCId, get().connectionState),
  getGeminiExplanation: () => DecisionService.getGeminiExplanation(get().selectedPHCId, get().connectionState),
  getFederationState: () => get().federationState,
  getEmergencyState: () => get().emergencyState,
  getAuditTrail: () => get().auditTrail,

  // Federation Dynamic State
  federationState: SEEDED_FEDERATION_STATE,
  triggerFederationRound: () => {
    get().addToast({
      type: 'info',
      title: 'Federated Round: Not yet run',
      detail: 'Edge training rounds require decentralized peripheral node deployment. Federated metrics: Not yet run.'
    });
  },

  // Emergency Mode
  emergencyState: SEEDED_EMERGENCY_STATE,
  toggleEmergencyActive: () => {
    const cur = get().emergencyState;
    const nextActive = !cur.active;
    set({
      emergencyState: {
        ...cur,
        active: nextActive,
        status: nextActive ? 'ALLOCATING' : 'RESOLVED'
      }
    });
    get().addToast({
      type: nextActive ? 'critical' : 'info',
      title: nextActive ? 'SURGE PRIORITY ESCALATED' : 'Emergency State Stood Down',
      detail: nextActive
        ? 'Mass surge allocation activated. Pre-empting commercial logistics for medical convoys.'
        : 'Network returned to standard resilient steady-state operation.'
    });
  },

  // Audit Events
  auditTrail: SEEDED_AUDIT_TRAIL,

  // 60-Second Judge Tour
  isTourOpen: false,
  tourStep: 0,
  openTour: () => set({ isTourOpen: true, tourStep: 0 }),
  closeTour: () => set({ isTourOpen: false }),
  nextTourStep: () => {
    const current = get().tourStep;
    if (current < 8) {
      get().jumpToTourStep(current + 1);
    } else {
      set({ isTourOpen: false });
    }
  },
  prevTourStep: () => {
    const current = get().tourStep;
    if (current > 0) {
      get().jumpToTourStep(current - 1);
    }
  },
  jumpToTourStep: (step: number) => {
    set({ tourStep: step, isTourOpen: true });
    // Automatically switch screens and layers based on walkthrough step
    switch (step) {
      case 0: // Scan: Network Pulse (Canvas + Drawer)
        set({ screen: 'pulse', isDrawerOpen: true, selectedPHCId: 'PHC_A', isRiskTrayOpen: false });
        break;
      case 1: // Spot: Risk Radar (Slide-up Tray)
        set({ screen: 'risks', isRiskTrayOpen: true });
        break;
      case 2: // Understand: PHC Workspace (Overlay Sheet)
        set({ screen: 'phc', selectedPHCId: 'PHC_A', isRiskTrayOpen: false });
        break;
      case 3: // Act: Resolve Shortage Drawer (Signature Decision Surface)
        set({ screen: 'resolve', selectedPHCId: 'PHC_A', isDrawerOpen: true, isRiskTrayOpen: false });
        break;
      case 4: // Verifiable Constraints
        set({ screen: 'resolve', isDrawerOpen: true, isRiskTrayOpen: false });
        break;
      case 5: // Grounded Gemini Rationale
        set({ screen: 'resolve', isDrawerOpen: true, isRiskTrayOpen: false });
        break;
      case 6: // Human Approval Sign-off
        set({ screen: 'resolve', isDrawerOpen: true, isRiskTrayOpen: false });
        break;
      case 7: // Audit Trail Focus Layer
        set({ screen: 'audit', isDrawerOpen: false, isRiskTrayOpen: false });
        break;
      case 8: // Privacy-Preserving Federation Focus Layer
        set({ screen: 'federation', isDrawerOpen: false, isRiskTrayOpen: false });
        break;
      default:
        break;
    }
  },

  // Command Palette
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    set((s) => ({ toasts: [newToast, ...s.toasts].slice(0, 4) }));
    setTimeout(() => {
      get().removeToast(id);
    }, 6000);
  },
  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  }
}));
