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
import { createWalletClient, createPublicClient, custom, http, formatEther } from 'viem';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState<boolean>(false); // Default to LIVE now that user has tPOT!
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

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setWalletBalance(null);
      return;
    }
    try {
      const publicClient = createPublicClient({
        chain: portaldotV3,
        transport: http(PORTALDOT_CHAIN_SPECS.evmRpcUrl),
      });
      const bal = await publicClient.getBalance({ address: walletAddress as `0x${string}` });
      const potUnits = Number(formatEther(bal)).toFixed(2);
      setWalletBalance(potUnits);
    } catch (e) {
      console.error('Failed to fetch balance:', e);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

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

  // Auto-reconnect wallet if already authorized (persists across page reloads)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const provider = window.ethereum;

    const checkConnected = async () => {
      try {
        const accounts = (await provider.request({
          method: 'eth_accounts',
        })) as string[];
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          addLog('RESOLVER', `Restored active wallet session: ${accounts[0]}`);
        }
      } catch (err) {
        console.error('Silent reconnect check failed:', err);
      }
    };

    checkConnected();

    const handleAccountsChanged = (...args: unknown[]) => {
      const accs = args[0] as string[];
      if (accs && accs.length > 0) {
        setWalletAddress(accs[0]);
        addLog('RESOLVER', `Switched active wallet account: ${accs[0]}`);
      } else {
        setWalletAddress(null);
        setWalletBalance(null);
        addLog('RESOLVER', 'Wallet disconnected by user');
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [addLog]);

  // Connect Wallet Handler
  const handleConnectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('No Ethereum wallet extension detected. Please install MetaMask or Rabby.');
      return;
    }

    try {
      setIsConnecting(true);

      // Auto switch or add Portaldot V3
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: PORTALDOT_CHAIN_SPECS.hexChainId }],
        });
      } catch (switchError: unknown) {
        const err = switchError as { code?: number };
        if (err && err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: PORTALDOT_CHAIN_SPECS.hexChainId,
                chainName: PORTALDOT_CHAIN_SPECS.networkName,
                nativeCurrency: {
                  name: 'Portaldot Token',
                  symbol: 'tPOT',
                  decimals: 18,
                },
                rpcUrls: [PORTALDOT_CHAIN_SPECS.evmRpcUrl],
                blockExplorerUrls: ['https://scanner-testnet-v3.portaldot.dev/'],
              },
            ],
          });
        }
      }

      const client = createWalletClient({
        chain: portaldotV3,
        transport: custom(window.ethereum),
      });

      const [account] = await client.requestAddresses();
      setWalletAddress(account);
      addLog('RESOLVER', `Connected Web3 wallet: ${account}`);

      // Query balance immediately
      const publicClient = createPublicClient({
        chain: portaldotV3,
        transport: http(PORTALDOT_CHAIN_SPECS.evmRpcUrl),
      });
      const bal = await publicClient.getBalance({ address: account });
      setWalletBalance(Number(formatEther(bal)).toFixed(2));
      addLog('RESOLVER', `Wallet tPOT balance confirmed: ${formatEther(bal)} tPOT`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog('RPC', `Wallet connection failed: ${msg}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    addLog('RESOLVER', 'Wallet disconnected');
  };

  // Add / Switch Portaldot V3 in MetaMask via EIP-3085
  const handleAddToMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask not detected in browser.');
      return;
    }

    try {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: PORTALDOT_CHAIN_SPECS.hexChainId }],
        });
        addLog('RPC', 'Switched MetaMask network to Portaldot V3 Testnet (Chain ID 420420777)');
      } catch (switchError: unknown) {
        const err = switchError as { code?: number };
        if (err && err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: PORTALDOT_CHAIN_SPECS.hexChainId,
                chainName: PORTALDOT_CHAIN_SPECS.networkName,
                nativeCurrency: {
                  name: 'Portaldot Token',
                  symbol: 'tPOT',
                  decimals: 18,
                },
                rpcUrls: [PORTALDOT_CHAIN_SPECS.evmRpcUrl],
                blockExplorerUrls: ['https://scanner-testnet-v3.portaldot.dev/'],
              },
            ],
          });
          addLog('RPC', 'Registered Portaldot V3 Testnet in MetaMask (Chain ID 420420777)');
        } else {
          throw switchError;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog('RPC', `MetaMask network error: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-zinc-100 flex flex-col font-sans selection:bg-accent-blue/30 selection:text-white">
      {/* Background visual atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-canvas to-transparent blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          walletAddress={walletAddress}
          walletBalance={walletBalance}
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
            walletBalance={walletBalance}
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
            onRefreshBalance={fetchBalance}
          />

          {/* Live Telemetry Log Feed */}
          <TelemetryFeed logs={logs} onClearLogs={() => setLogs([])} />
        </main>

        {/* Footer */}
        <footer className="border-t border-panel-border/80 bg-panel/30 py-5 px-4 lg:px-8 text-center text-xs font-mono text-zinc-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-300">ReviveScope</span>
              <span>• Engineered for Portaldot Hacker House 2026 (DoraHacks)</span>
            </div>
            <span className="text-zinc-400">
              Stack: Next.js 14 App Router • Viem • Solidity 0.8.20 • Substrate pallet-revive
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
