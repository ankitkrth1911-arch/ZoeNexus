// Shell Zone 4: Jump to... Pill (Bottom-Centre)
// Spec: COMMAND PALETTE (⌘K / Ctrl+K, plus a small "Jump to…" pill bottom-centre) reaches every view.
import React from 'react';
import { Search, Command } from 'lucide-react';
import { useResilienceStore } from '../../store/useResilienceStore';

export const JumpToPill: React.FC = () => {
  const { setCommandPaletteOpen, isRiskTrayOpen } = useResilienceStore();

  // If bottom Risk Tray is wide open, we lift the pill slightly or integrate it cleanly
  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-300 select-none ${
        isRiskTrayOpen ? 'bottom-20 md:bottom-24' : 'bottom-6'
      }`}
    >
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="px-4 py-2 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--card-border)] shadow-elevated hover:border-[var(--sage-600)] text-xs text-[var(--ink-700)] hover:text-[var(--ink-900)] flex items-center gap-2.5 transition-all cursor-pointer group"
        aria-label="Open Command Palette (⌘K)"
      >
        <Search className="w-3.5 h-3.5 text-[var(--sage-600)] group-hover:scale-110 transition-transform" />
        <span className="font-heading font-medium">Jump to…</span>
        <div className="flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--paper-50)] border border-[var(--card-border)] text-[var(--ink-500)]">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </button>
    </div>
  );
};
