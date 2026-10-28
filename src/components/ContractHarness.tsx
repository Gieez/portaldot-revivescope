'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Shield,
  Terminal,
  CheckCircle,
  Database,
  Eye,
  Code,
  Rocket,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { parsePot, formatPot } from '@/lib/math';
import { REVIVE_PROBE_ABI, REVIVE_PROBE_BYTECODE, DEFAULT_PROBE_ADDRESS } from '@/contracts/ReviveProbeABI';
import { portaldotV3, PORTALDOT_CHAIN_SPECS } from '@/lib/chains';
import { createWalletClient, createPublicClient, custom, http, parseEther, formatEther } from 'viem';

export interface RecordedProbeItem {
  id: number;
  sender: string;
  tag: string;
  value: bigint;
  blockNumber: bigint;
  timestamp: string;
  txHash: string;
  status: 'CONFIRMED' | 'SUBMITTED' | 'SIMULATED';
  isOnChain?: boolean;
}

interface ContractHarnessProps {
  walletAddress: string | null;
  isSimulated: boolean;
  onLogEvent: (type: 'CONTRACT' | 'RPC' | 'RESOLVER' | 'MATH', msg: string) => void;
  onRefreshBalance?: () => void;
}

// Ensure wallet is on PortaldotV3 Testnet
const ensurePortaldotChain = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return;
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
    } else {
      throw switchError;
    }
  }
};

export const ContractHarness: React.FC<ContractHarnessProps> = ({
  walletAddress,
  isSimulated,
  onLogEvent,
  onRefreshBalance,
}) => {
  const [probeTag, setProbeTag] = useState<string>('SENTINEL_PING');
  const [customTag, setCustomTag] = useState<string>('');
  const [testDepositPot, setTestDepositPot] = useState<string>('0.01');
  const [contractAddress, setContractAddress] = useState<string>(DEFAULT_PROBE_ADDRESS);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [showCalldata, setShowCalldata] = useState<boolean>(false);
  const [deployedOnChain, setDeployedOnChain] = useState<boolean>(false);
  const [deploymentTxHash, setDeploymentTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedContract = localStorage.getItem('revivescope_deployed_contract');
      const savedTx = localStorage.getItem('revivescope_deployment_tx');
      if (savedContract) {
        setContractAddress(savedContract);
        setDeployedOnChain(true);
      }
      if (savedTx) {
        setDeploymentTxHash(savedTx);
      }
    }
  }, []);

  const [probesList, setProbesList] = useState<RecordedProbeItem[]>([
    {
      id: 1042,
      sender: '0xf7eC65d11e35375A250e474059a917B537804142',
      tag: 'GENESIS_SENTINEL_PROBE',
      value: parsePot('0.05'),
      blockNumber: 842100n,
      timestamp: '14:20:12 UTC',
      txHash: '0x8f4d92a11b72e01c9a41b52a8d3e91f0c29a8d7e6c5b4a3928170e9f8d7c6b5a',
      status: 'CONFIRMED',
      isOnChain: false,
    },
    {
      id: 1043,
      sender: '0x7a39F90aE852D6cfEb24a9a46C0A9A30f78d6b9C',
      tag: 'LATENCY_VERIFY_14DEC',
      value: parsePot('0.01'),
      blockNumber: 842106n,
      timestamp: '14:21:05 UTC',
      txHash: '0x3c2a9e10f8b7d6c5a4b3e2d109f8e7d6c5b4a3928170e9f8d7c6b5a41b52a8d3',
      status: 'CONFIRMED',
      isOnChain: false,
    },
  ]);

  const activeTag = probeTag === 'CUSTOM' ? customTag || 'CUSTOM_PROBE' : probeTag;

  // Calldata simulation for pallet-revive call
  const simulatedCalldata = `0x9c42a0f8${Buffer.from(activeTag).toString('hex').padStart(64, '0')}`;

  // 1-Click Deploy ReviveProbe.sol to Testnet V3
  const handleDeployContract = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Ethereum wallet extension not detected. Please install MetaMask or Rabby.');
      return;
    }
    if (!walletAddress) {
      alert('Please connect your MetaMask wallet first.');
      return;
    }

    try {
      setIsDeploying(true);
      onLogEvent('CONTRACT', 'Ensuring wallet is connected to Portaldot V3 Testnet (Chain ID 420420777)...');

      // Auto-switch chain to Portaldot V3
      await ensurePortaldotChain();

      onLogEvent('CONTRACT', 'Initiating on-chain deployment of ReviveProbe.sol to Portaldot V3...');

      const walletClient = createWalletClient({
        chain: portaldotV3,
        transport: custom(window.ethereum),
      });

      const publicClient = createPublicClient({
        chain: portaldotV3,
        transport: http(PORTALDOT_CHAIN_SPECS.evmRpcUrl),
      });

      const hash = await walletClient.deployContract({
        abi: REVIVE_PROBE_ABI,
        bytecode: REVIVE_PROBE_BYTECODE,
        account: walletAddress as `0x${string}`,
      });

      onLogEvent('CONTRACT', `Deployment TX broadcasted: ${hash}. Awaiting block finalization...`);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.contractAddress) {
        const newAddr = receipt.contractAddress;
        setContractAddress(newAddr);
        setDeployedOnChain(true);
        setDeploymentTxHash(hash);

        if (typeof window !== 'undefined') {
          localStorage.setItem('revivescope_deployed_contract', newAddr);
          localStorage.setItem('revivescope_deployment_tx', hash);
        }

        onLogEvent(
          'CONTRACT',
          `ReviveProbe deployed live on-chain at ${newAddr}! Block: #${receipt.blockNumber}, Tx: ${hash}`
        );

        if (onRefreshBalance) onRefreshBalance();
      } else {
        throw new Error('Deployment receipt did not return a contract address.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onLogEvent('CONTRACT', `Contract deployment error: ${msg}`);
      alert(`Deployment notice: ${msg}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleExecuteProbe = async () => {
    setIsExecuting(true);
    const activeAddress = walletAddress || '0xf7eC65d11e35375A250e474059a917B537804142';

    // If LIVE mode + wallet connected + contract deployed -> Execute REAL ON-CHAIN TRANSACTION!
    if (!isSimulated && walletAddress && typeof window !== 'undefined' && window.ethereum) {
      try {
        await ensurePortaldotChain();

        onLogEvent(
          'CONTRACT',
          `Broadcasting live transaction: ReviveProbe.recordProbe("${activeTag}", ${testDepositPot} tPOT)...`
        );

        const walletClient = createWalletClient({
          chain: portaldotV3,
          transport: custom(window.ethereum),
        });

        const publicClient = createPublicClient({
          chain: portaldotV3,
          transport: http(PORTALDOT_CHAIN_SPECS.evmRpcUrl),
        });

        const depositWei = parseEther(testDepositPot || '0');

        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: REVIVE_PROBE_ABI,
          functionName: 'recordProbe',
          args: [activeTag, '0x'],
          value: depositWei,
          account: walletAddress as `0x${string}`,
        });

        onLogEvent('CONTRACT', `Transaction submitted: ${hash}. Waiting for block inclusion...`);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const timeStr = new Date().toISOString().slice(11, 19) + ' UTC';
        const newId = probesList.length > 0 ? probesList[0].id + 1 : 1001;

        const newRecord: RecordedProbeItem = {
          id: newId,
          sender: walletAddress,
          tag: activeTag,
          value: parsePot(testDepositPot || '0'),
          blockNumber: receipt.blockNumber,
          timestamp: timeStr,
          txHash: hash,
          status: 'CONFIRMED',
          isOnChain: true,
        };

        setProbesList((prev) => [newRecord, ...prev]);
        onLogEvent(
          'CONTRACT',
          `Probe #${newId} CONFIRMED on-chain! Block: #${receipt.blockNumber}, Tx: ${hash}`
        );

        if (onRefreshBalance) onRefreshBalance();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        onLogEvent('CONTRACT', `On-chain execution failed: ${msg}`);
      } finally {
        setIsExecuting(false);
      }
      return;
    }

    // Fallback: Simulated Execution Harness
    onLogEvent(
      'CONTRACT',
      `Executing ReviveProbe.recordProbe("${activeTag}", ${testDepositPot} tPOTv3) to ${contractAddress} [SIMULATOR]`
    );

    setTimeout(() => {
      const newId = probesList.length > 0 ? probesList[0].id + 1 : 1001;
      const fakeHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const timeStr = new Date().toISOString().slice(11, 19) + ' UTC';

      const newRecord: RecordedProbeItem = {
        id: newId,
        sender: activeAddress,
        tag: activeTag,
        value: parsePot(testDepositPot || '0'),
        blockNumber: 842109n + BigInt(probesList.length),
        timestamp: timeStr,
        txHash: fakeHash,
        status: isSimulated ? 'SIMULATED' : 'CONFIRMED',
        isOnChain: false,
      };

      setProbesList((prev) => [newRecord, ...prev]);
      setIsExecuting(false);
      onLogEvent(
        'CONTRACT',
        `Probe #${newId} recorded in sandbox harness. Hash: ${fakeHash.slice(0, 16)}... Block: #${newRecord.blockNumber}`
      );
    }, 700);
  };

  return (
    <div className="relative bg-panel border border-panel-border/90 rounded-xl p-5 flex flex-col gap-5 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Subtle background ambient radial gradient */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-panel-border/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold tracking-wider text-zinc-100 uppercase flex items-center gap-2">
              ReviveProbe On-Chain Diagnostic Sandbox
              {deployedOnChain && (
                <span className="text-[10px] bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> LIVE ON-CHAIN
                </span>
              )}
            </h2>
            <p className="text-[11px] font-mono text-zinc-400">
              Solidity 0.8.20 • Substrate pallet-revive bytecode execution
            </p>
          </div>
        </div>

        {/* 1-Click Deploy Button */}
        <div className="flex items-center gap-2">
          {!deployedOnChain ? (
            <button
              onClick={handleDeployContract}
              disabled={isDeploying || !walletAddress}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-accent-blue to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-40 text-white rounded-lg text-xs font-mono font-semibold transition-all shadow-lg shadow-accent-blue/20"
              title={walletAddress ? 'Deploy ReviveProbe.sol to Portaldot Testnet V3' : 'Connect wallet first to deploy'}
            >
              <Rocket className={`w-3.5 h-3.5 ${isDeploying ? 'animate-bounce' : ''}`} />
              <span>{isDeploying ? 'DEPLOYING CONTRACT...' : 'DEPLOY TO TESTNET V3'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Deployed on Testnet
              </span>
              {deploymentTxHash && (
                <a
                  href={`https://scanner-testnet-v3.portaldot.dev/tx/${deploymentTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono text-accent-blue hover:underline flex items-center gap-1 bg-canvas border border-panel-border px-2 py-1 rounded"
                >
                  Tx <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed font-mono">
        Attest state commitment, event emission, and 14-decimal deposit accounting on Portaldot
        Network V3.0 EVM runtime without blind gas wastage.
      </p>

      {/* Target Contract Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-zinc-400 block font-medium">Target Contract Address</label>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border ${
                deployedOnChain
                  ? 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/30 font-semibold'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              }`}
            >
              {deployedOnChain ? 'Active Deployed Instance' : 'Planned / Pre-Compiled Sandbox'}
            </span>
          </div>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="w-full bg-canvas/80 border border-panel-border focus:border-accent-blue rounded-lg px-3 py-2 text-zinc-100 outline-none select-all transition-colors font-mono"
          />
        </div>
        <div>
          <label className="text-zinc-400 mb-1.5 block font-medium">Diagnostic Deposit (tPOT)</label>
          <input
            type="text"
            value={testDepositPot}
            onChange={(e) => setTestDepositPot(e.target.value)}
            placeholder="0.01"
            className="w-full bg-canvas/80 border border-panel-border focus:border-accent-blue rounded-lg px-3 py-2 text-zinc-100 outline-none font-mono transition-colors"
          />
        </div>
      </div>

      {/* Tag Selector & Trigger Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 font-mono text-xs">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-zinc-400 shrink-0 font-medium">Probe Tag:</span>
          <select
            value={probeTag}
            onChange={(e) => setProbeTag(e.target.value)}
            className="bg-canvas/90 border border-panel-border rounded-lg px-3 py-2 text-zinc-200 outline-none flex-1 font-mono focus:border-accent-blue transition-colors"
          >
            <option value="SENTINEL_PING">SENTINEL_PING (Basic Inclusion)</option>
            <option value="LATENCY_PROBE">LATENCY_PROBE (Block Timing)</option>
            <option value="STATE_DIFF_VERIFY">STATE_DIFF_VERIFY (Storage)</option>
            <option value="CUSTOM">CUSTOM TAG...</option>
          </select>
        </div>

        {probeTag === 'CUSTOM' && (
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            placeholder="ENTER_TAG"
            className="bg-canvas/90 border border-panel-border rounded-lg px-3 py-2 text-zinc-200 outline-none w-36 font-mono focus:border-accent-blue"
          />
        )}

        <button
          onClick={handleExecuteProbe}
          disabled={isExecuting}
          className="flex items-center justify-center gap-1.5 px-5 py-2 bg-accent-blue hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 text-white rounded-lg font-semibold transition-all shrink-0 shadow-lg shadow-accent-blue/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isExecuting ? 'TRANSACTING...' : 'DISPATCH PROBE'}</span>
        </button>

        <button
          onClick={() => setShowCalldata(!showCalldata)}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-300 rounded-lg transition-colors shrink-0"
          title="Toggle Encoded Calldata"
        >
          <Code className="w-3.5 h-3.5 text-accent-blue" />
          <span>CALLDATA</span>
        </button>
      </div>

      {/* Calldata Inspector Drawer */}
      {showCalldata && (
        <div className="bg-canvas border border-panel-border rounded-lg p-3 text-xs font-mono flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Raw Encoded Calldata for pallet-revive call:</span>
            <span className="text-accent-blue font-bold">Selector: 0x9c42a0f8</span>
          </div>
          <pre className="text-accent-blue bg-panel/90 p-2.5 rounded border border-panel-border/60 text-[11px] break-all select-all font-mono">
            {simulatedCalldata}
          </pre>
          <p className="text-[10px] text-zinc-400">
            Paste this calldata into Portaldot Node Console at <code>Developer → Runtime calls → reviveApi → call</code>
          </p>
        </div>
      )}

      {/* Execution Records Table */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="font-semibold text-zinc-300">
            Recorded Execution Probes ({probesList.length})
          </span>
          <span className="text-[11px] text-accent-emerald flex items-center gap-1 bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded-full font-bold">
            <CheckCircle className="w-3 h-3" /> State Attested
          </span>
        </div>

        <div className="border border-panel-border/80 rounded-lg bg-canvas/80 overflow-x-auto max-h-60 shadow-inner">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-panel/90 text-zinc-400 text-[11px] border-b border-panel-border uppercase tracking-wider">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">TAG</th>
                <th className="p-3">VALUE</th>
                <th className="p-3">BLOCK</th>
                <th className="p-3">SENDER</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-border/40">
              {probesList.map((probe) => (
                <tr key={probe.id} className="hover:bg-panel/50 transition-colors">
                  <td className="p-3 font-bold text-accent-blue">#{probe.id}</td>
                  <td className="p-3 text-zinc-200 font-medium">{probe.tag}</td>
                  <td className="p-3 text-accent-emerald font-semibold">
                    {formatPot(probe.value)} tPOT
                  </td>
                  <td className="p-3 text-zinc-400">#{probe.blockNumber.toString()}</td>
                  <td className="p-3 text-zinc-400">
                    {probe.sender.slice(0, 6)}...{probe.sender.slice(-4)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                        probe.status === 'CONFIRMED'
                          ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30'
                          : 'bg-accent-blue/15 text-accent-blue border-accent-blue/30'
                      }`}
                    >
                      {probe.isOnChain ? 'ON-CHAIN' : probe.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
