import React, { useEffect } from 'react';
import {
  Network,
  ShieldCheck,
  Lock,
  ArrowRight,
  RefreshCw,
  Server,
  Cpu,
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useResilienceStore } from '../../../store/useResilienceStore';

export const FederationScreen: React.FC = () => {
  const {
    getFederationState,
    triggerFederationRound,
    currentRole,
    setScreen,
    screen,
  } = useResilienceStore();

  // Support ESC key to return to canvas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'federation') {
        setScreen('pulse');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, setScreen]);

  const fedState = getFederationState();

  const epsilonPct = Math.round((fedState.epsilonBudgetConsumed / fedState.epsilonBudgetTotal) * 100);

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
            <span className="text-[var(--ink-900)] font-semibold">Federation Engine</span>
            <ChevronRight className="w-3 h-3 text-[var(--ink-300)]" />
            <span className="text-[var(--sage-700)]">Round {fedState.currentRound}</span>
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
                Screen 05 · Privacy-Preserving Architecture
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--cream-100)] text-[var(--ink-900)] font-semibold">
                Round {fedState.currentRound} Active
              </span>
            </div>
            <h1 className="font-heading font-bold text-lg text-[var(--ink-900)] mt-0.5">
              Federation Engine — "How does the model learn without pooling data?"
            </h1>
            <p className="text-xs text-[var(--ink-700)] mt-0.5 max-w-2xl">
              Edge-trained machine learning across peripheral clinics. Clinical records stay strictly localized at the facility; only differentially private model weights cross the federation perimeter.
            </p>
          </div>

        {/* Global Model Stats + Round Trigger */}
        <div className="flex items-center gap-2 font-mono shrink-0">
          <div className="px-3 py-2 rounded-lg bg-[var(--paper-50)] border border-[var(--card-border)] text-center">
            <span className="text-[10px] text-[var(--ink-500)] uppercase block">Global Model</span>
            <span className="font-bold text-sm text-[var(--ink-900)]">{fedState.globalModelVersion}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[var(--sage-50)] border border-[var(--sage-200)] text-center">
            <span className="text-[10px] text-[var(--sage-700)] uppercase font-semibold block">Global Accuracy</span>
            <span className="font-bold text-sm text-[var(--sage-800)]">{fedState.globalAccuracyPct}%</span>
          </div>

          <button
            onClick={triggerFederationRound}
            disabled={currentRole === 'auditor'}
            className="px-3 py-2 rounded-lg bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40"
            title="Simulate aggregation of gradient updates into a new global round"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Trigger Round {fedState.currentRound + 1}</span>
          </button>
        </div>
      </div>

      {/* 2. Permanent Federation Perimeter Notice (Strict Non-Negotiable Contract) */}
      <div className="p-3.5 rounded-xl bg-[var(--sage-50)] border border-[var(--sage-600)]/40 flex items-start gap-3 shadow-xs">
        <Lock className="w-5 h-5 text-[var(--sage-700)] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wide text-[var(--sage-800)]">
              Strict Federation Boundary Guarantee
            </span>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[var(--card-bg)] text-[var(--ink-700)] border border-[var(--card-border)]">
              DP Budget: &epsilon; = {fedState.epsilonBudgetConsumed} / {fedState.epsilonBudgetTotal}
            </span>
          </div>
          <p className="text-[var(--ink-900)] text-[11px] leading-relaxed">
            <strong>Zero Patient Telemetry Transmitted: </strong>
            Individual patient consultation records, diagnostic logs, and demographic histories remain permanently encrypted on local clinic micro-servers. Facilities compute local gradient updates ($\nabla w_k$); only randomized mathematical weights (48 KB per client) pass through differential privacy noise layers to the central aggregator.
          </p>
        </div>
      </div>

      {/* 3. Visual Node Diagram: Edge Clients → Boundary → Central Aggregator → Global Model */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2.5">
          <span className="font-heading font-semibold text-xs text-[var(--ink-900)]">
            Topology of Distributed Federated Averaging (FedAvg / FedProx)
          </span>
          <span className="text-[10px] font-mono text-[var(--ink-500)]">
            Last Aggregated: {new Date(fedState.lastAggregatedAt).toLocaleTimeString()}
          </span>
        </div>

        {/* The Visual Architecture Canvas */}
        <div className="p-6 rounded-xl bg-[var(--paper-50)] border border-[var(--card-border)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          {/* LEFT: 5 Edge Clients (Local Training on Edge Servers) */}
          <div className="w-full md:w-5/12 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-500)] font-bold">
                Local Edge Clinics (Data Bounded)
              </span>
              <span className="text-[10px] font-mono text-[var(--sage-700)]">
                {fedState.clients.filter((c) => c.status === 'Complete').length} / {fedState.totalClients} Syncing
              </span>
            </div>

            <div className="space-y-1.5">
              {fedState.clients.map((client) => (
                <div
                  key={client.id}
                  className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        client.status === 'Complete'
                          ? 'bg-[var(--status-healthy)]'
                          : client.status === 'Training'
                          ? 'bg-[var(--status-warning)] animate-ping'
                          : 'bg-[var(--ink-300)]'
                      }`}
                    />
                    <div>
                      <span className="font-bold text-[var(--ink-900)] font-mono block">
                        {client.name}
                      </span>
                      <span className="text-[10px] text-[var(--ink-500)] font-mono">
                        {client.samplesCount.toLocaleString()} local records · loss {client.lastRoundLoss}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[10px]">
                    <span
                      className={`font-semibold ${
                        client.status === 'Complete'
                          ? 'text-[var(--status-healthy)]'
                          : client.status === 'Training'
                          ? 'text-[var(--status-warning)]'
                          : 'text-[var(--ink-500)]'
                      }`}
                    >
                      {client.status}
                    </span>
                    <span className="text-[var(--ink-500)] block">
                      {client.weightGradientsKB} KB weights
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE: Physical Federation Boundary / Firewall */}
          <div className="flex flex-col items-center justify-center px-4 py-2 border-y md:border-y-0 md:border-x border-dashed border-[var(--sage-600)] text-center max-w-[140px] shrink-0">
            <Lock className="w-5 h-5 text-[var(--sage-700)] mb-1" />
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[var(--sage-800)]">
              Federation Perimeter
            </span>
            <span className="text-[9px] text-[var(--ink-500)] mt-0.5 leading-tight font-mono">
              Raw data never crosses
            </span>
            <div className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--sage-100)] text-[var(--sage-800)] font-semibold">
              Weights Only
            </div>
          </div>

          {/* RIGHT: Aggregator Hub & Global Consensus Model */}
          <div className="w-full md:w-5/12 space-y-3">
            <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--sage-600)]/40 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <Cpu className="w-4 h-4 text-[var(--sage-600)]" />
                <span className="font-heading font-bold text-[var(--ink-900)]">
                  Central Consensus Aggregator
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-1 border-b border-[var(--card-border)]/60">
                  <span className="text-[var(--ink-500)]">Current Round:</span>
                  <span className="font-bold text-[var(--ink-900)]">Round {fedState.currentRound}</span>
                </div>
                <div className="flex items-center justify-between pb-1 border-b border-[var(--card-border)]/60">
                  <span className="text-[var(--ink-500)]">Convergence Delta (&Delta;):</span>
                  <span className="font-bold text-[var(--status-healthy)]">{fedState.convergenceDelta}</span>
                </div>
                <div className="flex items-center justify-between pb-1 border-b border-[var(--card-border)]/60">
                  <span className="text-[var(--ink-500)]">Global Model:</span>
                  <span className="font-bold text-[var(--ink-900)]">{fedState.globalModelVersion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ink-500)]">Global Test Accuracy:</span>
                  <span className="font-bold text-sm text-[var(--sage-700)]">
                    {fedState.globalAccuracyPct}%
                  </span>
                </div>
              </div>

              {/* DP Budget Meter */}
              <div className="pt-2 border-t border-[var(--card-border)]/60 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[var(--ink-700)]">Differential Privacy Budget (&epsilon;):</span>
                  <span className="font-bold text-[var(--ink-900)]">
                    {fedState.epsilonBudgetConsumed} / {fedState.epsilonBudgetTotal} ({epsilonPct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--paper-50)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--sage-600)] rounded-full transition-all duration-300"
                    style={{ width: `${epsilonPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Client Telemetry & Local Training Audit Table */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--card-border)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <span className="text-xs font-heading font-semibold text-[var(--ink-900)]">
            Node Client Telemetry &amp; Round Participation Record
          </span>
          <span className="text-[10px] font-mono text-[var(--ink-500)]">
            Differential Privacy (&delta; = 10⁻⁵)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--paper-50)] text-[10px] uppercase tracking-wider text-[var(--ink-700)]">
                <th className="py-2.5 px-4 font-semibold">Client Node ID</th>
                <th className="py-2.5 px-4 font-semibold">Facility Location</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Edge Samples</th>
                <th className="py-2.5 px-4 font-semibold">Local Accuracy</th>
                <th className="py-2.5 px-4 font-semibold">Gradient Size</th>
                <th className="py-2.5 px-4 font-semibold">Latency</th>
                <th className="py-2.5 px-4 font-semibold text-right">DP Contribution (&epsilon;)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/60 text-[11px]">
              {fedState.clients.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--card-hover)] transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--ink-900)]">{c.name}</td>
                  <td className="py-3 px-4 font-sans text-[var(--ink-700)]">{c.location}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.status === 'Complete'
                          ? 'bg-[var(--status-healthy-bg)] text-[var(--status-healthy)]'
                          : c.status === 'Training'
                          ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
                          : 'bg-[var(--sage-100)] text-[var(--ink-500)]'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{c.samplesCount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[var(--sage-700)] font-bold">{c.localAccuracy}%</td>
                  <td className="py-3 px-4">{c.weightGradientsKB} KB</td>
                  <td className="py-3 px-4 text-[var(--ink-700)]">{c.latencyMs} ms</td>
                  <td className="py-3 px-4 text-right font-bold text-[var(--ink-900)]">
                    &epsilon; = {c.differentialPrivacyEpsilon}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
};
