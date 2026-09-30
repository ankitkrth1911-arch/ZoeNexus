// PHC Federated AI — BRICS Hackathon Track 3: Smart Health & Supply Chain Resilience
// Canvas-First Command Centre Shell (Zero Navigation Bar: No top nav, no left rail, no tab bar)
import React, { useEffect } from 'react';
import { useResilienceStore } from './store/useResilienceStore';

// Shell Zones
import { NetworkCanvas } from './components/screens/01_NetworkPulse/NetworkCanvas';
import { ContextChip } from './components/shell/ContextChip';
import { LayerControls } from './components/shell/LayerControls';
import { JumpToPill } from './components/shell/JumpToPill';
import { DecisionDrawer } from './components/shell/DecisionDrawer';

// Overlay Layers
import { RiskTray } from './components/shell/RiskTray';
import { PHCWorkspaceSheet } from './components/screens/03_PHCWorkspace/PHCWorkspaceSheet';

// Full-screen Focus Layers
import { FederationScreen } from './components/screens/05_Federation/FederationScreen';
import { EmergencyModeScreen } from './components/screens/06_EmergencyMode/EmergencyModeScreen';
import { AuditTrailScreen } from './components/screens/07_AuditTrail/AuditTrailScreen';

// Global Overlays
import { CommandPalette } from './components/shell/CommandPalette';
import { JudgeWalkthroughModal } from './components/shell/JudgeWalkthroughModal';
import { ToastContainer } from './components/shell/ToastContainer';

export const App: React.FC = () => {
  const { screen, theme, setScreen } = useResilienceStore();

  useEffect(() => {
    // Synchronize daylight medical and night ops themes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Global keyboard shortcuts for rapid judge navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if inside input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        if (screen !== 'pulse') {
          setScreen('pulse');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, setScreen]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--paper-50)] text-[var(--ink-900)] select-none">
      {/* 1. Zone 1: NETWORK CANVAS (Fills the entire viewport, home = Network Pulse) */}
      <NetworkCanvas />

      {/* 2. Zone 2: FLOATING CONTEXT CHIP (Top-left, small scope & status) */}
      <ContextChip />

      {/* 3. Zone 3: FLOATING LAYER CONTROLS (Top-right, compact controls & persona switcher) */}
      <LayerControls />

      {/* 4. Zone 4: COMMAND PALETTE PILL ("Jump to..." bottom-centre) */}
      <JumpToPill />

      {/* 5. Zone 5: DECISION DRAWER (Right full-height drawer, opens on selection) */}
      <DecisionDrawer />

      {/* Layer A: RISK RADAR (Bottom slide-up tray with persistent exception count) */}
      <RiskTray />

      {/* Layer B: PHC WORKSPACE (Large overlay sheet with breadcrumbs) */}
      {screen === 'phc' && <PHCWorkspaceSheet />}

      {/* Layer C: Full-Screen Focus Layers (With breadcrumb bar and ESC to return) */}
      {screen === 'federation' && <FederationScreen />}
      {screen === 'emergency' && <EmergencyModeScreen />}
      {screen === 'audit' && <AuditTrailScreen />}

      {/* Global Overlays: ⌘K Command Palette, 60s Tour Modal, and Toast Notifications */}
      <CommandPalette />
      <JudgeWalkthroughModal />
      <ToastContainer />
    </div>
  );
};

export default App;
