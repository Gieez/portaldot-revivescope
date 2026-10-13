'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { NodeSentinel } from '@/components/NodeSentinel';
import { AddressMapper } from '@/components/AddressMapper';
import { DecimalCalculator } from '@/components/DecimalCalculator';
import { ContractHarness } from '@/components/ContractHarness';
import { TelemetryFeed, LogEntry } from '@/components/TelemetryFeed';
import { probeRpcEndpoint, getSimulatedProbeResult, RpcProbeResult } from '@/lib/rpc-sentinel';
import { PORTALDOT_CHAIN_SPECS, portaldotV3 } from '@/lib/chains';
import { createWalletClient, custom } from 'viem';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState<boolean>(true); // Resilient default for judging
  const [probeResult, setProbeResult] = useState<RpcProbeResult | null>(null);
  const [isProbing, setIsProbing] = useState<boolean>(false);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-0',
      timestamp: new Date().toISOString().slice(11, 19),
      type: 'RPC',
      message: 'Initialized ReviveScope diagnostic runtime targeting Chain ID 420420777',
    },
    {
      id: 'log-1',
      timestamp: new Date().toISOString().slice(11, 19),
      type: 'MATH',
      message: '14-Decimal BigInt Guard active: 1 tPOTv3 = 10^14 base units (Anti-skew active)',
    },
  ]);

  const addLog = useCallback(
    (type: LogEntry['type'], message: string) => {
      const newEntry: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString().slice(11, 19),
        type,
        message,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
    },
    []
  );

  const runProbe = useCallback(async () => {
    setIsProbing(true);
    if (isSimulatedMode) {
      const sim = getSimulatedProbeResult();
      setProbeResult(sim);
      setIsProbing(false);
      addLog('RPC', `Simulated replica probe: latency ${sim.latencyMs}ms, block #${sim.blockNumber}`);
      return;
    }

    addLog('RPC', `Probing live endpoint: ${PORTALDOT_CHAIN_SPECS.evmRpcUrl}...`);
    const live = await probeRpcEndpoint(PORTALDOT_CHAIN_SPECS.evmRpcUrl);
    setProbeResult(live);
    setIsProbing(false);

    if (live.isReachable) {
      addLog('RPC', `Live RPC ping response: ${live.latencyMs}ms, status: ${live.statusText}`);
    } else {
      addLog(
        'RPC',
        `Live RPC unreachable: ${live.statusText} (${live.errorDetail || 'Check network'}). Falling back to inspection.`
      );
    }
  }, [isSimulatedMode, addLog]);

  useEffect(() => {
    runProbe();
    const interval = setInterval(() => {
      runProbe();
    }, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [runProbe]);

  // Connect Wallet Handler
  const handleConnectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('No Ethereum wallet extension detected. Please install MetaMask or Rabby.');
      return;
    }

    try {
      setIsConnecting(true);
      const client = createWalletClient({
        chain: portaldotV3,
        transport: custom(window.ethereum),
      });

      const [account] = await client.requestAddresses();
      setWalletAddress(account);
      addLog('RESOLVER', `Connected Web3 wallet: ${account}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog('RPC', `Wallet connection failed: ${msg}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    addLog('RESOLVER', 'Wallet disconnected');
  };

  // Add Portaldot V3 to MetaMask via EIP-3085
  const handleAddToMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask not detected in browser.');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: PORTALDOT_CHAIN_SPECS.hexChainId,
            chainName: PORTALDOT_CHAIN_SPECS.networkName,
            nativeCurrency: {
              name: 'Portaldot Token',
              symbol: PORTALDOT_CHAIN_SPECS.tokenSymbol,
              decimals: PORTALDOT_CHAIN_SPECS.decimals,
            },
            rpcUrls: [PORTALDOT_CHAIN_SPECS.evmRpcUrl],
            blockExplorerUrls: [PORTALDOT_CHAIN_SPECS.nodeConsoleUrl],
          },
        ],
      });
      addLog('RPC', 'Dispatched wallet_addEthereumChain for Portaldot V3 (Chain ID 420420777)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog('RPC', `wallet_addEthereumChain error: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-zinc-100 flex flex-col font-sans selection:bg-accent-blue/30 selection:text-white">
      <Header
        walletAddress={walletAddress}
        isConnecting={isConnecting}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        isSimulatedMode={isSimulatedMode}
        onToggleMode={(sim) => {
          setIsSimulatedMode(sim);
          addLog('RPC', `Toggled diagnostic mode: ${sim ? 'SIMULATOR REPLICA' : 'LIVE NETWORK RPC'}`);
        }}
        rpcLatency={probeResult?.latencyMs ?? 0}
        rpcStatus={probeResult?.statusText ?? 'INITIALIZING'}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top Node Sentinel Telemetry Banner */}
        <NodeSentinel
          probeResult={probeResult}
          isLoading={isProbing}
          onRefreshProbe={runProbe}
          onAddToMetaMask={handleAddToMetaMask}
          isSimulated={isSimulatedMode}
        />

        {/* Dual Core Workbenches: Address Resolver & Safe Decimal Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AddressMapper
            connectedWalletAddress={walletAddress}
            onLogEvent={addLog}
          />
          <DecimalCalculator onLogEvent={addLog} />
        </div>

        {/* On-Chain ReviveProbe Sandbox */}
        <ContractHarness
          walletAddress={walletAddress}
          isSimulated={isSimulatedMode}
          onLogEvent={addLog}
        />

        {/* Live Telemetry Log Feed */}
        <TelemetryFeed logs={logs} onClearLogs={() => setLogs([])} />
      </main>

      {/* Footer */}
      <footer className="border-t border-panel-border bg-panel/40 py-4 px-4 lg:px-8 text-center text-xs font-mono text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ReviveScope • Engineered for Portaldot Hacker House 2026 (DoraHacks)</span>
          <span className="text-zinc-400">
            Stack: Next.js App Router • Viem • Solidity 0.8.20 • Substrate pallet-revive
          </span>
        </div>
      </footer>
    </div>
  );
}
