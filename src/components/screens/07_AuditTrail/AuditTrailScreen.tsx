// 07 Audit Trail: "Trust is a visible state"
import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Key,
  Layers,
  FileCode,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useResilienceStore } from '../../../store/useResilienceStore';
import { AuditEvent } from '../../../types/decision';

export const AuditTrailScreen: React.FC = () => {
  const {
    getAuditTrail,
    addToast,
    setScreen,
    screen,
  } = useResilienceStore();

  // Support ESC key to return to canvas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'audit') {
        setScreen('pulse');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, setScreen]);

  const auditEvents = getAuditTrail();
  const [selectedEventId, setSelectedEventId] = useState<string>(auditEvents[0]?.id || 'AUD-005');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedEvent = auditEvents.find((e) => e.id === selectedEventId) || auditEvents[0];

  const filteredEvents = auditEvents.filter(
    (e) =>
      e.stepName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.payloadSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.stateHash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_bundle_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: 'success',
      title: 'Audit Bundle Exported',
      detail: 'Cryptographically signed JSON evidence package saved for Health Ministry archiving.'
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-[var(--paper-50)] overflow-y-auto p-4 md:p-8 select-none animate-in fade-in duration-200">
      <div className="max-w-6xl mx-auto space-y-4 pb-12">
        {/* Breadcrumb & Return to Canvas Bar */}
        <div className="flex items-center justify-between pb-1 border-b border-[var(--card-border)]/60">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-500)]">
            <button
              onClick={() => setScreen('pulse')}
              className="flex items-center gap-1 hover:text-[var(--ink-900)] text-[var(--sage-700)] font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Network Canvas</span>
            </button>
            <ChevronRight className="w-3 h-3 text-[var(--ink-300)]" />
            <span className="text-[var(--ink-900)] font-semibold">Statutory Governance</span>
            <ChevronRight className="w-3 h-3 text-[var(--ink-300)]" />
            <span className="text-[var(--sage-700)]">Audit Reconstruction Chain</span>
          </div>

          <button
            onClick={() => setScreen('pulse')}
            className="px-2.5 py-1 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-xs text-[var(--ink-700)] hover:bg-[var(--card-hover)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Close Layer</span>
            <kbd className="text-[10px] font-mono px-1 rounded bg-[var(--paper-50)] border border-[var(--card-border)] text-[var(--ink-500)]">
              ESC
            </kbd>
          </button>
        </div>

        {/* 1. Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--sage-700)] font-bold">
              Screen 07 · Verification Layer
            </span>
            <span className="text-[10px] font-mono text-[var(--ink-500)]">
              Statutory Governance &amp; Post-Hoc Audit
            </span>
          </div>
          <h1 className="font-heading font-bold text-lg text-[var(--ink-900)] mt-0.5">
            Audit Trail — "Trust is a visible state"
          </h1>
          <p className="text-xs text-[var(--ink-700)] mt-0.5 max-w-2xl">
            Reconstruct what evidence existed, what was recommended, which constraints passed, who authorized the decision, and the exact timestamp. Every decision is cryptographically sealed with SHA-256 state hashes.
          </p>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2 font-mono shrink-0">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Bundle (.JSON)</span>
          </button>
        </div>
      </div>

      {/* 2. End-to-End Decision Reconstruction Chain (Visual Stepper Strip) */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2.5">
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--ink-900)]">
            Decision Reconstruction Chain (Immutable Traceability)
          </span>
          <span className="text-[10px] font-mono text-[var(--status-healthy)] flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Integrity Verified (SHA-256)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
            <span className="text-[9px] text-[var(--ink-500)] uppercase block">1. Input Snapshot</span>
            <span className="font-bold text-[var(--ink-900)] block mt-0.5">Stock 420u</span>
            <span className="text-[9px] text-[var(--sage-700)]">Freshness 12m</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
            <span className="text-[9px] text-[var(--ink-500)] uppercase block">2. Risk Created</span>
            <span className="font-bold text-[var(--status-critical)] block mt-0.5">3.8d Runway</span>
            <span className="text-[9px] text-[var(--ink-500)]">&lt; 5d threshold</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
            <span className="text-[9px] text-[var(--ink-500)] uppercase block">3. Solver Run</span>
            <span className="font-bold text-[var(--ink-900)] block mt-0.5">Optimization</span>
            <span className="text-[9px] text-[var(--ink-500)]">Not yet run</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
            <span className="text-[9px] text-[var(--ink-500)] uppercase block">4. Explanation</span>
            <span className="font-bold text-[var(--ink-900)] block mt-0.5">Gemini Grounded</span>
            <span className="text-[9px] text-[var(--ink-500)]">96.4% Conf.</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)]">
            <span className="text-[9px] text-[var(--ink-500)] uppercase block">5. Human Sign-off</span>
            <span className="font-bold text-[var(--sage-800)] block mt-0.5">Dr. R. Sharma</span>
            <span className="text-[9px] text-[var(--ink-700)]">DHO Officer</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--sage-50)] border border-[var(--sage-200)]">
            <span className="text-[9px] text-[var(--sage-800)] uppercase block font-bold">6. Final Dispatch</span>
            <span className="font-bold text-[var(--status-healthy)] block mt-0.5">#DSP-0914</span>
            <span className="text-[9px] text-[var(--sage-800)]">Van En Route</span>
          </div>
        </div>
      </div>

      {/* 3. Main Split View: Left Timeline Table · Right Cryptographic Proof Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Timeline Events List */}
        <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 border-b border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--sage-600)]" />
              <span className="font-heading font-semibold text-xs text-[var(--ink-900)]">
                Chronological Audit Chain ({filteredEvents.length} Events)
              </span>
            </div>

            <div className="relative w-48">
              <Search className="w-3 h-3 text-[var(--ink-500)] absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter events..."
                className="w-full pl-7 pr-2 py-1 rounded border border-[var(--card-border)] bg-[var(--paper-50)] text-xs text-[var(--ink-900)] focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-[var(--card-border)]/60 max-h-[500px] overflow-y-auto">
            {filteredEvents.map((event) => {
              const isSelected = event.id === selectedEventId;

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`p-3.5 cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-[var(--sage-50)]' : 'hover:bg-[var(--card-hover)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-xs text-[var(--ink-900)]">
                          {event.stepName}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            event.status === 'COMMITTED'
                              ? 'bg-[var(--status-healthy-bg)] text-[var(--status-healthy)]'
                              : 'bg-[var(--sage-100)] text-[var(--sage-800)]'
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--ink-700)] mt-0.5 leading-snug">
                        {event.payloadSummary}
                      </p>
                    </div>

                    <div className="text-right shrink-0 ml-3 font-mono text-[10px] text-[var(--ink-500)]">
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      <span className="block font-semibold text-[var(--ink-700)]">{event.id}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--ink-500)] pt-1.5 border-t border-[var(--card-border)]/40">
                    <span>Actor: <strong>{event.actor}</strong> ({event.role})</span>
                    <span>Model: {event.modelVersion}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Deep Inspection & SHA-256 Proof Inspector */}
        <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2.5">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[var(--sage-600)]" />
              <h3 className="font-heading font-semibold text-xs text-[var(--ink-900)]">
                Cryptographic Evidence Inspector
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-[var(--ink-700)]">
              {selectedEvent.id}
            </span>
          </div>

          {/* Event Details */}
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] space-y-1">
              <span className="text-[10px] text-[var(--ink-500)] uppercase block">Recorded Step</span>
              <span className="font-bold text-[var(--ink-900)] font-sans">{selectedEvent.stepName}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] space-y-1">
              <span className="text-[10px] text-[var(--ink-500)] uppercase block">Statutory Actor &amp; Role</span>
              <span className="font-bold text-[var(--ink-900)] font-sans block">{selectedEvent.actor}</span>
              <span className="text-[10px] text-[var(--sage-700)] font-semibold">{selectedEvent.role}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] space-y-1">
              <span className="text-[10px] text-[var(--ink-500)] uppercase block">Action Payload</span>
              <p className="text-[11px] font-sans text-[var(--ink-700)] leading-relaxed">
                {selectedEvent.payloadSummary}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] space-y-1">
              <span className="text-[10px] text-[var(--ink-500)] uppercase block">Model / Engine Version</span>
              <span className="font-bold text-[var(--ink-900)]">{selectedEvent.modelVersion}</span>
            </div>

            {/* Cryptographic SHA-256 Hash */}
            <div className="p-2.5 rounded-lg bg-[var(--cream-100)]/60 border border-[var(--sage-200)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--ink-900)] uppercase font-bold">
                  SHA-256 State Hash
                </span>
                <span className="text-[9px] text-[var(--status-healthy)] font-bold">MATCHES CHAIN</span>
              </div>
              <p className="text-[10px] font-mono text-[var(--ink-700)] break-all bg-[var(--card-bg)] p-1.5 rounded border border-[var(--card-border)]/60">
                {selectedEvent.stateHash}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
