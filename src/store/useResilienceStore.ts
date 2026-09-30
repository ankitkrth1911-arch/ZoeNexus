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
} from '../types/decision';
import {
  DecisionService,
  SEEDED_AUDIT_TRAIL,
  SEEDED_FEDERATION_STATE,
  SEEDED_EMERGENCY_STATE,
} from '../services/decisionService';

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

  // Data Queries
  getPHCList: () => PHCNodeData[];
  getCurrentPHC: () => PHCNodeData;
  getRiskRadarList: () => RiskRadarItem[];
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
  selectedPHCId: 'PHC-184',
  selectedMedicineCode: 'MED-AMX-500',
  setSelectedPHCId: (id) => {
    set({ selectedPHCId: id });
    const phc = DecisionService.getPHC(id, get().connectionState);
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
    const newAuditEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      stepName: '5. Human Decision Logged (Approved)',
      actor: currentRole === 'district_officer' ? 'Dr. Rajesh Sharma, MD (DHO)' : 'Authorized Health Controller',
      role: currentRole.replace('_', ' ').toUpperCase(),
      action: 'APPROVE_ALLOCATION_ORDER',
      stateHash: DecisionService.generateHash(`approved-${selectedPHCId}-${Date.now()}`),
      modelVersion: 'v75.4-fedxgb-dp',
      payloadSummary: `Transfer order #DSP-${Date.now().toString().slice(-6)} committed: 420 units Amoxicillin from PHC 072 to ${selectedPHCId}. ${officerNote || 'Corridor verified via NH-48.'}`,
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

  // Data Queries
  getPHCList: () => DecisionService.getPHCNodes(get().connectionState),
  getCurrentPHC: () => {
    const { selectedPHCId, connectionState } = get();
    return DecisionService.getPHC(selectedPHCId, connectionState) || DecisionService.getPHCNodes(connectionState)[0];
  },
  getRiskRadarList: () => DecisionService.getRiskRadar(get().connectionState),
  getDonorsList: () => DecisionService.getDonors(get().selectedPHCId, get().connectionState),
  getRecommendation: () => DecisionService.getRecommendation(get().selectedPHCId, get().connectionState),
  getGeminiExplanation: () => DecisionService.getGeminiExplanation(get().selectedPHCId, get().connectionState),
  getFederationState: () => get().federationState,
  getEmergencyState: () => get().emergencyState,
  getAuditTrail: () => get().auditTrail,

  // Federation Dynamic State
  federationState: SEEDED_FEDERATION_STATE,
  triggerFederationRound: () => {
    const cur = get().federationState;
    const nextRound = cur.currentRound + 1;
    const nextDelta = Number((cur.convergenceDelta * 0.85).toFixed(4));
    const nextAccuracy = Math.min(98.8, Number((cur.globalAccuracyPct + 0.3).toFixed(1)));
    const nextEpsilon = Number((cur.epsilonBudgetConsumed + 0.12).toFixed(2));

    const updatedState: FederationRoundState = {
      ...cur,
      currentRound: nextRound,
      convergenceDelta: nextDelta,
      globalAccuracyPct: nextAccuracy,
      epsilonBudgetConsumed: nextEpsilon,
      globalModelVersion: `v${nextRound}.1-fedxgb-dp`,
      lastAggregatedAt: new Date().toISOString(),
      clients: cur.clients.map((c, i) => ({
        ...c,
        status: i === 4 && nextRound % 2 === 0 ? 'Offline' : 'Complete',
        localAccuracy: Math.min(98.5, Number((c.localAccuracy + 0.2).toFixed(1))),
        lastRoundLoss: Number((c.lastRoundLoss * 0.9).toFixed(3))
      }))
    };

    set({ federationState: updatedState });
    get().addToast({
      type: 'success',
      title: `Federation Round ${nextRound} Complete`,
      detail: `Aggregated 4 edge client gradients without pooling local patient records. Global accuracy: ${nextAccuracy}%.`
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
        set({ screen: 'pulse', isDrawerOpen: true, selectedPHCId: 'PHC-184', isRiskTrayOpen: false });
        break;
      case 1: // Spot: Risk Radar (Slide-up Tray)
        set({ screen: 'risks', isRiskTrayOpen: true });
        break;
      case 2: // Understand: PHC Workspace (Overlay Sheet)
        set({ screen: 'phc', selectedPHCId: 'PHC-184', isRiskTrayOpen: false });
        break;
      case 3: // Act: Resolve Shortage Drawer (Signature Decision Surface)
        set({ screen: 'resolve', selectedPHCId: 'PHC-184', isDrawerOpen: true, isRiskTrayOpen: false });
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
