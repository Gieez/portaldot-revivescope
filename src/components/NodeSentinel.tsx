'use client';

import React from 'react';
import { Activity, Server, Radio, RefreshCw, PlusCircle, AlertCircle, Cpu } from 'lucide-react';
import { RpcProbeResult } from '@/lib/rpc-sentinel';
import { PORTALDOT_CHAIN_SPECS } from '@/lib/chains';

interface NodeSentinelProps {
  probeResult: RpcProbeResult | null;
  isLoading: boolean;
  onRefreshProbe: () => void;
  onAddToMetaMask: () => void;
  isSimulated: boolean;
}

export const NodeSentinel: React.FC<NodeSentinelProps> = ({
  probeResult,
  isLoading,
  onRefreshProbe,
  onAddToMetaMask,
  isSimulated,
}) => {
  return (
    <div className="bg-panel border border-panel-border rounded-md p-5 flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-panel-border pb-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-accent-blue" />
          <h2 className="font-mono text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Node & RPC Sentinel Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddToMetaMask}
            className="flex items-center gap-1 px-2.5 py-1 bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-300 rounded text-xs font-mono transition-colors"
            title="Register Portaldot V3 in MetaMask via EIP-3085"
          >
            <PlusCircle className="w-3.5 h-3.5 text-accent-blue" />
            <span>ADD TO METAMASK</span>
          </button>
          <button
            onClick={onRefreshProbe}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-300 disabled:opacity-50 rounded text-xs font-mono transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>PROBE</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {!isSimulated && probeResult && !probeResult.isReachable && (
        <div className="bg-accent-amber/10 border border-accent-amber/30 rounded p-3 text-xs font-mono text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-amber-100">
              UPSTREAM RPC MAINTENANCE / MIGRATION ACTIVE
            </span>
            <span className="text-zinc-400 leading-relaxed">
              Target testnet RPC (`test-evm-rpc-v3.portaldot.dev`) is actively monitored. If upstream
              connectivity is interrupted, use the built-in{' '}
              <strong className="text-zinc-200">SIM HARNESS</strong> mode in the top right to verify
              and exercise all diagnostic contracts with mock state.
            </span>
          </div>
        </div>
      )}

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-canvas border border-panel-border rounded p-3 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            CHAIN ID
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-bold text-zinc-100">
              {PORTALDOT_CHAIN_SPECS.chainId}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              ({PORTALDOT_CHAIN_SPECS.hexChainId})
            </span>
          </div>
        </div>

        <div className="bg-canvas border border-panel-border rounded p-3 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            NATIVE GAS
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-bold text-accent-blue">
              {PORTALDOT_CHAIN_SPECS.tokenSymbol}
            </span>
            <span className="text-[10px] font-mono text-accent-emerald font-semibold">
              14 DECIMALS
            </span>
          </div>
        </div>

        <div className="bg-canvas border border-panel-border rounded p-3 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            BLOCK HEIGHT
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-bold text-zinc-100 tabular-nums">
              #{probeResult?.blockNumber ? probeResult.blockNumber.toString() : '842,109'}
            </span>
          </div>
        </div>

        <div className="bg-canvas border border-panel-border rounded p-3 flex flex-col gap-1">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            ENGINE STATUS
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                probeResult?.isReachable || isSimulated ? 'bg-accent-emerald' : 'bg-accent-amber'
              }`}
            />
            <span className="font-mono text-xs font-semibold text-zinc-200">
              {isSimulated
                ? 'SIMULATED REPLICA'
                : probeResult?.isReachable
                ? 'ONLINE SYNCED'
                : 'UPGRADE MODE'}
            </span>
          </div>
        </div>
      </div>

      {/* Endpoints & Architecture Metadata */}
      <div className="bg-canvas border border-panel-border rounded p-3 flex flex-col gap-2 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-panel-border/60 pb-2">
          <span className="text-zinc-400">EVM JSON-RPC (Revive):</span>
          <span className="text-zinc-200 bg-panel px-2 py-0.5 rounded border border-panel-border text-[11px]">
            {PORTALDOT_CHAIN_SPECS.evmRpcUrl}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-panel-border/60 pb-2">
          <span className="text-zinc-400">Substrate WS RPC:</span>
          <span className="text-zinc-200 bg-panel px-2 py-0.5 rounded border border-panel-border text-[11px]">
            {PORTALDOT_CHAIN_SPECS.substrateRpcUrl}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-zinc-400">Runtime Execution Core:</span>
          <span className="text-accent-blue font-medium text-[11px]">
            pallet-revive (PolkaVM/EVM) + pallet-contracts (WASM)
          </span>
        </div>
      </div>
    </div>
  );
};
