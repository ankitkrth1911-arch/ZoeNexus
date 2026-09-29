import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Repeat,
  Network,
  ShieldAlert,
  Sparkles,
  FileText,
  Building2,
  Pill,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useCommandStore, ScreenId } from '../../store/useCommandStore';
import { MOCK_DISTRICTS, ESSENTIAL_MEDICINES_CATALOG } from '../../data/mockData';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveScreen,
    setSelectedDistrictId,
    openDrawer,
    triggerFederatedRoundSimulation,
    setDisasterMode,
    disasterMode,
    approveAllTransfers,
  } = useCommandStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global keydown listener for ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Build searchable commands
  const allItems = [
    // Screens
    { id: 'screen-overview', title: 'Command Overview', category: 'Navigation', icon: LayoutDashboard, action: () => setActiveScreen('overview') },
    { id: 'screen-map', title: 'Geospatial Grid Map', category: 'Navigation', icon: MapPin, action: () => setActiveScreen('map') },
    { id: 'screen-forecast', title: 'Demand Forecasts & Early Warning', category: 'Navigation', icon: TrendingUp, action: () => setActiveScreen('forecast') },
    { id: 'screen-alerts', title: 'Stock-out Alerts Queue', category: 'Navigation', icon: AlertTriangle, action: () => setActiveScreen('alerts') },
    { id: 'screen-redistribution', title: 'Redistribution Optimizer', category: 'Navigation', icon: Repeat, action: () => setActiveScreen('redistribution') },
    { id: 'screen-federated', title: 'Federated Learning Network', category: 'Navigation', icon: Network, action: () => setActiveScreen('federated') },
    { id: 'screen-anomalies', title: 'Anomalies & Integrity Monitor', category: 'Navigation', icon: ShieldAlert, action: () => setActiveScreen('anomalies') },
    { id: 'screen-explain', title: 'Gemini AI Grounded Explanations', category: 'Navigation', icon: Sparkles, action: () => setActiveScreen('explain') },
    { id: 'screen-reports', title: 'Commissioner Briefing Report', category: 'Navigation', icon: FileText, action: () => setActiveScreen('reports') },

    // Districts
    ...MOCK_DISTRICTS.map((d) => ({
      id: `district-${d.id}`,
      title: `${d.name} (${d.state})`,
      category: 'Districts',
      icon: Building2,
      action: () => {
        setSelectedDistrictId(d.id);
        openDrawer('district', d.id);
      },
    })),

    // Essential Medicines
    ...ESSENTIAL_MEDICINES_CATALOG.map((m) => ({
      id: `med-${m.code}`,
      title: `${m.name} [${m.code}]`,
      category: 'Medicines',
      icon: Pill,
      action: () => {
        setActiveScreen('forecast');
      },
    })),

    // Rapid Mission Actions
    {
      id: 'act-federated-round',
      title: 'Trigger Federated Training Round #6 (Simulate Sync)',
      category: 'Mission Actions',
      icon: Zap,
      action: () => {
        setActiveScreen('federated');
        triggerFederatedRoundSimulation();
      },
    },
    {
      id: 'act-disaster-mode',
      title: disasterMode ? 'Deactivate Disaster Emergency Protocol' : 'Activate Disaster Emergency Protocol (Override Buffer)',
      category: 'Mission Actions',
      icon: AlertTriangle,
      action: () => {
        setDisasterMode(!disasterMode);
      },
    },
    {
      id: 'act-approve-all',
      title: 'Batch Approve All 5 Redistribution Corridors',
      category: 'Mission Actions',
      icon: Repeat,
      action: () => {
        setActiveScreen('redistribution');
        approveAllTransfers();
      },
    },
  ];

  const filtered = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: typeof allItems[0]) => {
    item.action();
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl bg-[#111722] border border-[#2a3a52] rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#1e293b] flex items-center gap-3 bg-[#0b0f17]/90">
          <Search className="w-4 h-4 text-[#00e5bc] flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a screen, district, medicine, or action... (e.g. Satara, Forecast, Approve)"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-mono">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isHighlighted = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isHighlighted
                      ? 'bg-[#161f2e] text-white border border-[#2a3a52]'
                      : 'text-slate-300 hover:bg-[#111722]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 text-[#00e5bc] flex-shrink-0" />
                    <span className="font-medium truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-800/80">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-2.5 border-t border-[#1e293b] bg-[#0b0f17]/60 flex items-center justify-between text-[11px] text-slate-500 font-mono px-4">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span className="text-[#00e5bc]">SANJEEVANI COMMAND v2.4</span>
        </div>
      </div>
    </div>
  );
};
