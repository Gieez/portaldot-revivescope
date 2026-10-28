'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Server, Radio, RefreshCw, PlusCircle, AlertCircle, Cpu, Zap, Wifi } from 'lucide-react';
import { RpcProbeResult } from '@/lib/rpc-sentinel';
import { PORTALDOT_CHAIN_SPECS } from '@/lib/chains';

interface NodeSentinelProps {
  probeResult: RpcProbeResult | null;
  isLoading: boolean;
  onRefreshProbe: () => void;
  onAddToMetaMask: () => void;
  isSimulated: boolean;
  walletBalance?: string | null;
}

export const NodeSentinel: React.FC<NodeSentinelProps> = ({
  probeResult,
  isLoading,
  onRefreshProbe,
  onAddToMetaMask,
  isSimulated,
  walletBalance,
}) => {
  // Sparkline latency historical record
  const [latencyHistory, setLatencyHistory] = useState<number[]>([42, 38, 45, 40, 36, 41, 39, 44, 38, 41]);

  useEffect(() => {
    if (probeResult?.latencyMs) {
      setLatencyHistory((prev) => [...prev.slice(1), probeResult.latencyMs]);
    }
  }, [probeResult?.latencyMs]);

  return (
    <div className="relative bg-panel border border-panel-border/90 rounded-xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-28 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />

      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-panel-border/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold tracking-wider text-zinc-100 uppercase flex items-center gap-2">
              Node & RPC Sentinel Telemetry
              <span className="text-[10px] bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 px-2 py-0.5 rounded-full font-semibold">
                ACTIVE RADAR
              </span>
            </h2>
            <p className="text-[11px] font-mono text-zinc-400">
              Live round-trip health & latency sentinel across Substrate WSS and EVM RPC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddToMetaMask}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-200 rounded-lg text-xs font-mono font-medium transition-all shadow-sm hover:border-accent-blue/40"
            title="Register Portaldot V3 in MetaMask via EIP-3085"
          >
            <PlusCircle className="w-3.5 h-3.5 text-accent-blue" />
            <span>ADD TO METAMASK</span>
          </button>
          <button
            onClick={onRefreshProbe}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-200 disabled:opacity-50 rounded-lg text-xs font-mono font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent-blue ${isLoading ? 'animate-spin' : ''}`} />
            <span>PING NODE</span>
          </button>
        </div>
      </div>

      {/* Status Alert if live is unreachable */}
      {!isSimulated && probeResult && !probeResult.isReachable && (
        <div className="bg-accent-amber/10 border border-accent-amber/30 rounded-lg p-3 text-xs font-mono text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-amber-100">
              UPSTREAM RPC MAINTENANCE / RATE LIMIT
            </span>
            <span className="text-zinc-400 leading-relaxed">
              Target testnet RPC (`test-evm-rpc-v3.portaldot.dev`) is actively monitored. If upstream
              connectivity is interrupted, toggle{' '}
              <strong className="text-zinc-200">SIM HARNESS</strong> in the top header to exercise
              all diagnostic workflows.
            </span>
          </div>
        </div>
      )}

      {/* Telemetry Metrics Grid (Bento style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Chain ID */}
        <div className="bg-canvas/80 border border-panel-border/80 rounded-lg p-3.5 flex flex-col gap-1 shadow-sm hover:border-panel-border transition-colors">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium flex items-center justify-between">
            <span>CHAIN ID</span>
            <span className="text-[10px] text-zinc-400 font-mono">EVM</span>
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono text-xl font-bold text-zinc-100">
              {PORTALDOT_CHAIN_SPECS.chainId}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              ({PORTALDOT_CHAIN_SPECS.hexChainId})
            </span>
          </div>
        </div>

        {/* Metric 2: Native Gas */}
        <div className="bg-canvas/80 border border-panel-border/80 rounded-lg p-3.5 flex flex-col gap-1 shadow-sm hover:border-panel-border transition-colors">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium flex items-center justify-between">
            <span>NATIVE TOKEN</span>
            <span className="text-[10px] text-accent-emerald font-semibold font-mono">14 DEC</span>
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono text-xl font-bold text-accent-blue">
              {PORTALDOT_CHAIN_SPECS.tokenSymbol}
            </span>
            {walletBalance && (
              <span className="text-[11px] font-mono text-accent-emerald font-bold">
                ({walletBalance})
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Block Height */}
        <div className="bg-canvas/80 border border-panel-border/80 rounded-lg p-3.5 flex flex-col gap-1 shadow-sm hover:border-panel-border transition-colors">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium flex items-center justify-between">
            <span>BLOCK HEIGHT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono text-xl font-bold text-zinc-100 tabular-nums">
              #{probeResult?.blockNumber ? probeResult.blockNumber.toLocaleString() : '231,317'}
            </span>
          </div>
        </div>

        {/* Metric 4: Node Latency Sparkline */}
        <div className="bg-canvas/80 border border-panel-border/80 rounded-lg p-3.5 flex flex-col gap-1 shadow-sm hover:border-panel-border transition-colors">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium flex items-center justify-between">
            <span>LATENCY SENTINEL</span>
            <span className="text-[10px] text-accent-emerald font-bold font-mono">
              {probeResult?.latencyMs ?? 38}ms
            </span>
          </span>
          {/* Mini Sparkline Bar Chart */}
          <div className="flex items-end gap-1 h-7 mt-1 pt-1">
            {latencyHistory.map((val, idx) => {
              const heightPct = Math.min(100, Math.max(20, Math.round((val / 100) * 100)));
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-t transition-all duration-300"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: idx === latencyHistory.length - 1 ? '#3b82f6' : '#1e2433',
                  }}
                  title={`Ping: ${val}ms`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
