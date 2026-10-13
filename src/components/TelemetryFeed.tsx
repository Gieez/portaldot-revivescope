'use client';

import React, { useState } from 'react';
import { Terminal, Download, Trash2, Filter } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'RPC' | 'MATH' | 'RESOLVER' | 'CONTRACT';
  message: string;
}

interface TelemetryFeedProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const TelemetryFeed: React.FC<TelemetryFeedProps> = ({ logs, onClearLogs }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs =
    filterType === 'ALL' ? logs : logs.filter((log) => log.type === filterType);

  const handleExportJson = () => {
    const report = {
      generator: 'ReviveScope - Portaldot V3.0 Diagnostic Sentinel',
      exportedAt: new Date().toISOString(),
      network: {
        chainId: 420420777,
        name: 'PortaldotV3 Testnet',
        tokenSymbol: 'tPOTv3',
        decimals: 14,
        evmRpc: 'https://testnetv3-eth-rpc.feso-apps.xyz',
      },
      logCount: filteredLogs.length,
      events: filteredLogs,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portaldot-v3-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeBadge = (type: LogEntry['type']) => {
    switch (type) {
      case 'RPC':
        return 'text-accent-blue bg-accent-blue/15 border-accent-blue/30';
      case 'MATH':
        return 'text-accent-amber bg-accent-amber/15 border-accent-amber/30';
      case 'RESOLVER':
        return 'text-accent-emerald bg-accent-emerald/15 border-accent-emerald/30';
      case 'CONTRACT':
        return 'text-purple-400 bg-purple-500/15 border-purple-500/30';
    }
  };

  return (
    <div className="bg-panel border border-panel-border rounded-md p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-panel-border pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent-blue" />
          <h2 className="font-mono text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Live Telemetry Event Log
          </h2>
          <span className="text-[11px] font-mono text-zinc-400 bg-canvas border border-panel-border px-1.5 py-0.5 rounded">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Filter and Actions */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center bg-canvas border border-panel-border rounded p-0.5">
            {['ALL', 'RPC', 'MATH', 'RESOLVER', 'CONTRACT'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  filterType === cat
                    ? 'bg-panel-elevated text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 px-2.5 py-1 bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-300 rounded text-xs transition-colors"
            title="Download Telemetry JSON Report"
          >
            <Download className="w-3 h-3 text-accent-blue" />
            <span>EXPORT</span>
          </button>

          <button
            onClick={onClearLogs}
            className="p-1 hover:text-accent-rose text-zinc-500 transition-colors"
            title="Clear Event Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed Terminal Window */}
      <div className="bg-canvas border border-panel-border rounded p-3 font-mono text-xs max-h-56 overflow-y-auto flex flex-col gap-1.5 divide-y divide-panel-border/40">
        {filteredLogs.length === 0 ? (
          <div className="text-zinc-500 py-4 text-center italic text-[11px]">
            No telemetry events recorded yet. Trigger a probe or calculation above.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="pt-1.5 flex items-start gap-2.5 leading-relaxed">
              <span className="text-zinc-400 text-[10px] shrink-0 font-medium">
                {log.timestamp}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold tracking-wider shrink-0 uppercase ${getTypeBadge(
                  log.type
                )}`}
              >
                {log.type}
              </span>
              <span className="text-zinc-200 text-[11px] break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
