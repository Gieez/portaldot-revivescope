'use client';

import React from 'react';
import { Activity, Shield, Terminal, Wallet, CheckCircle2, AlertTriangle, Zap, LogOut } from 'lucide-react';

interface HeaderProps {
  walletAddress: string | null;
  walletBalance: string | null;
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
  walletBalance,
  isConnecting,
  onConnectWallet,
  onDisconnectWallet,
  isSimulatedMode,
  onToggleMode,
  rpcLatency,
  rpcStatus,
}) => {
  return (
    <header className="border-b border-panel-border/80 bg-canvas/85 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-panel-elevated to-panel border border-accent-blue/40 flex items-center justify-center text-accent-blue shadow-lg shadow-accent-blue/10">
            <Terminal className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-emerald animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black tracking-wider text-base text-zinc-100">
                REVIVESCOPE
              </span>
              <span className="text-[10px] font-mono uppercase bg-accent-blue/15 text-accent-blue border border-accent-blue/30 px-2 py-0.5 rounded-full font-bold">
                V3.0 SENTINEL
              </span>
              <span className="text-[10px] font-mono text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/30 px-1.5 py-0.2 rounded font-semibold hidden sm:inline-block">
                Chain ID 420420777
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Portaldot Network • Substrate pallet-revive • Dual-Runtime Interop
            </p>
          </div>
        </div>

        {/* Telemetry and Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Mode Switcher */}
          <div className="flex items-center bg-panel border border-panel-border rounded-lg p-0.5 text-xs font-mono shadow-inner">
            <button
              onClick={() => onToggleMode(false)}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                !isSimulatedMode
                  ? 'bg-gradient-to-r from-accent-blue to-cyan-500 text-white shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              LIVE RPC
            </button>
            <button
              onClick={() => onToggleMode(true)}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-semibold ${
                isSimulatedMode
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              SIM HARNESS
            </button>
          </div>

          {/* Network Latency Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-panel/90 border border-panel-border text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                rpcStatus.includes('HEALTHY') || isSimulatedMode
                  ? 'bg-accent-emerald animate-pulse'
                  : 'bg-accent-amber'
              }`}
            />
            <span className="text-zinc-400">PING:</span>
            <span className="text-zinc-200 font-semibold">{rpcLatency}ms</span>
          </div>

          {/* Wallet Connection */}
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-panel-elevated border border-accent-blue/30 rounded-lg text-xs font-mono text-zinc-200 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />
                <span className="font-semibold">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                {walletBalance !== null && (
                  <span className="text-accent-emerald font-bold bg-accent-emerald/10 px-1.5 py-0.5 rounded border border-accent-emerald/20 text-[11px]">
                    {walletBalance} tPOT
                  </span>
                )}
              </div>
              <button
                onClick={onDisconnectWallet}
                className="p-1.5 bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
                title="Disconnect Wallet"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-semibold transition-all shadow-md shadow-accent-blue/20"
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
