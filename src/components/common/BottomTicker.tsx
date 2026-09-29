import React, { useState, useEffect } from 'react';
import { Radio, AlertCircle, CheckCircle, Info, ChevronRight } from 'lucide-react';
import { MOCK_TICKER_FEED } from '../../data/mockData';
import { useCommandStore } from '../../store/useCommandStore';

export const BottomTicker: React.FC = () => {
  const [events, setEvents] = useState(MOCK_TICKER_FEED);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { openDrawer, setActiveScreen } = useCommandStore();

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, events.length]);

  const currentEvent = events[currentIndex];

  const handleEventClick = () => {
    if (currentEvent.type === 'stockout_risk') {
      setActiveScreen('alerts');
    } else if (currentEvent.type === 'federated_round') {
      setActiveScreen('federated');
    } else if (currentEvent.type === 'transfer_dispatched') {
      setActiveScreen('redistribution');
    } else {
      setActiveScreen('overview');
    }
  };

  return (
    <footer
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full h-8 bg-[#090d14] border-t border-[#1e293b] px-4 flex items-center justify-between text-xs select-none z-30 font-mono"
    >
      {/* Live Indicator */}
      <div className="flex items-center gap-2 pr-3 border-r border-slate-800 flex-shrink-0">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5bc] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5bc]"></span>
        </span>
        <span className="text-[11px] font-bold text-slate-300 tracking-wider">
          LIVE FEED
        </span>
      </div>

      {/* Rotating Event Text */}
      <div
        onClick={handleEventClick}
        className="flex-1 px-3 flex items-center gap-2 overflow-hidden cursor-pointer hover:text-white transition-colors group"
      >
        <span className="text-[10px] text-slate-500 flex-shrink-0">
          [{currentEvent.timestamp}]
        </span>

        {currentEvent.severity === 'critical' ? (
          <AlertCircle className="w-3.5 h-3.5 text-[#ef4444] flex-shrink-0" />
        ) : currentEvent.severity === 'warning' ? (
          <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
        ) : currentEvent.severity === 'healthy' ? (
          <CheckCircle className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0" />
        ) : (
          <Info className="w-3.5 h-3.5 text-[#38bdf8] flex-shrink-0" />
        )}

        <span
          className={`text-[11px] truncate tracking-tight ${
            currentEvent.severity === 'critical'
              ? 'text-red-400 font-medium'
              : currentEvent.severity === 'warning'
              ? 'text-amber-300 font-medium'
              : 'text-slate-300'
          }`}
        >
          {currentEvent.message}
        </span>

        <span className="text-[10px] text-[#00e5bc] opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-auto flex-shrink-0">
          Act now <ChevronRight className="w-3 h-3" />
        </span>
      </div>

      {/* Ticker controls & items indicator */}
      <div className="flex items-center gap-2 pl-3 border-l border-slate-800 text-[10px] text-slate-500 flex-shrink-0">
        <span>
          {currentIndex + 1} / {events.length}
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-[9px] text-slate-400">
          {isPaused ? 'PAUSED' : 'AUTO-SCROLL'}
        </span>
      </div>
    </footer>
  );
};
