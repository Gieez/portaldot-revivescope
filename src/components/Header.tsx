'use client';

import React from 'react';
import { Activity, Shield, Terminal, Wallet, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  walletAddress: string | null;
  isConnecting: boolean;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isSimulatedMode: boolean;
  onToggleMode: (simulated: boolean) => void;
  rpcLatency: number;
  rpcStatus: string;
}

export const Header: React.FC<HeaderProps> = ({
  walletAddress,
  isConnecting,
  onConnectWallet,
  onDisconnectWallet,
  isSimulatedMode,
  onToggleMode,
  rpcLatency,
  rpcStatus,
}) => {
  return (
    <header className="border-b border-panel-border bg-canvas/90 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-panel-elevated border border-accent-blue/40 flex items-center justify-center text-accent-blue shadow-inner">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-base text-zinc-100">
                REVIVESCOPE
              </span>
              <span className="text-[10px] font-mono uppercase bg-accent-blue/15 text-accent-blue border border-accent-blue/30 px-1.5 py-0.5 rounded">
                V3.0 SENTINEL
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Portaldot Network • Chain ID 420420777 • pallet-revive
            </p>
          </div>
        </div>

        {/* Telemetry and Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Mode Switcher */}
          <div className="flex items-center bg-panel border border-panel-border rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => onToggleMode(false)}
              className={`px-2.5 py-1 rounded transition-colors ${
                !isSimulatedMode
                  ? 'bg-panel-elevated text-zinc-100 border border-panel-border font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              LIVE RPC
            </button>
            <button
              onClick={() => onToggleMode(true)}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                isSimulatedMode
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              SIM HARNESS
            </button>
          </div>

          {/* Network Latency Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-panel border border-panel-border text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                rpcStatus.includes('HEALTHY') || isSimulatedMode
                  ? 'bg-accent-emerald animate-pulse'
                  : 'bg-accent-amber'
              }`}
            />
            <span className="text-zinc-400">PING:</span>
            <span className="text-zinc-200 font-medium">{rpcLatency}ms</span>
          </div>

          {/* Wallet Connection */}
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-panel-elevated border border-accent-blue/30 rounded text-xs font-mono text-zinc-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />
                <span>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <button
                onClick={onDisconnectWallet}
                className="px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-accent-rose hover:bg-panel border border-panel-border rounded transition-colors"
              >
                DISCONNECT
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded text-xs font-mono font-medium transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
