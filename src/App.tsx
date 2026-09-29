import React from 'react';
import { useCommandStore } from './store/useCommandStore';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomTicker } from './components/common/BottomTicker';
import { RightContextDrawer } from './components/common/RightContextDrawer';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';

// Screens
import { OverviewScreen } from './components/overview/OverviewScreen';
import { LiveMapScreen } from './components/map/LiveMapScreen';
import { ForecastScreen } from './components/forecast/ForecastScreen';
import { AlertsScreen } from './components/alerts/AlertsScreen';
import { RedistributionScreen } from './components/redistribution/RedistributionScreen';
import { FederatedScreen } from './components/federated/FederatedScreen';
import { AnomaliesScreen } from './components/anomalies/AnomaliesScreen';
import { ExplainScreen } from './components/explain/ExplainScreen';
import { ReportsScreen } from './components/reports/ReportsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';

export const App: React.FC = () => {
  const { activeScreen, isDrawerOpen } = useCommandStore();

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'overview':
        return <OverviewScreen />;
      case 'map':
        return <LiveMapScreen />;
      case 'forecast':
        return <ForecastScreen />;
      case 'alerts':
        return <AlertsScreen />;
      case 'redistribution':
        return <RedistributionScreen />;
      case 'federated':
        return <FederatedScreen />;
      case 'anomalies':
        return <AnomaliesScreen />;
      case 'explain':
        return <ExplainScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0f17] text-[#f1f5f9] select-none">
      {/* 1. Global Navigation Top Header */}
      <Header />

      {/* 2. Main Body: Left Sidebar + Central Screen Canvas + Right Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsible Rail */}
        <Sidebar />

        {/* Central Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#090d14] relative transition-all">
          <div className="max-w-[1680px] mx-auto w-full">
            {renderActiveScreen()}
          </div>
        </main>

        {/* Right Context Drawer */}
        <RightContextDrawer />
      </div>

      {/* 3. Bottom Operational Incident Ticker Feed */}
      <BottomTicker />

      {/* 4. Global Overlays: ⌘K Command Palette & Toast Notifications */}
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export default App;
