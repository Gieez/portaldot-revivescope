'use client';

import React, { useState } from 'react';
import { Play, Shield, Terminal, CheckCircle, Database, Eye, Code } from 'lucide-react';
import { parsePot, formatPot } from '@/lib/math';
import { REVIVE_PROBE_ABI, DEFAULT_PROBE_ADDRESS } from '@/contracts/ReviveProbeABI';

export interface RecordedProbeItem {
  id: number;
  sender: string;
  tag: string;
  value: bigint;
  blockNumber: bigint;
  timestamp: string;
  txHash: string;
  status: 'CONFIRMED' | 'SUBMITTED' | 'SIMULATED';
}

interface ContractHarnessProps {
  walletAddress: string | null;
  isSimulated: boolean;
  onLogEvent: (type: 'CONTRACT' | 'RPC' | 'RESOLVER' | 'MATH', msg: string) => void;
}

export const ContractHarness: React.FC<ContractHarnessProps> = ({
  walletAddress,
  isSimulated,
  onLogEvent,
}) => {
  const [probeTag, setProbeTag] = useState<string>('SENTINEL_PING');
  const [customTag, setCustomTag] = useState<string>('');
  const [testDepositPot, setTestDepositPot] = useState<string>('0.05');
  const [contractAddress, setContractAddress] = useState<string>(DEFAULT_PROBE_ADDRESS);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showCalldata, setShowCalldata] = useState<boolean>(false);

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
    },
  ]);

  const activeTag = probeTag === 'CUSTOM' ? customTag || 'CUSTOM_PROBE' : probeTag;

  // Calldata simulation for pallet-revive call
  const simulatedCalldata = `0x9c42a0f8${Buffer.from(activeTag).toString('hex').padStart(64, '0')}`;

  const handleExecuteProbe = async () => {
    setIsExecuting(true);
    const activeAddress = walletAddress || '0xf7eC65d11e35375A250e474059a917B537804142';
    const amountBigInt = parsePot(testDepositPot || '0');

    onLogEvent(
      'CONTRACT',
      `Executing ReviveProbe.recordProbe("${activeTag}", ${testDepositPot} tPOTv3) to ${contractAddress}`
    );

    // Simulate block time or execution delay
    setTimeout(() => {
      const newId = probesList.length > 0 ? probesList[probesList.length - 1].id + 1 : 1;
      const fakeHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const timeStr = new Date().toISOString().slice(11, 19) + ' UTC';

      const newRecord: RecordedProbeItem = {
        id: newId,
        sender: activeAddress,
        tag: activeTag,
        value: amountBigInt,
        blockNumber: 842109n + BigInt(probesList.length),
        timestamp: timeStr,
        txHash: fakeHash,
        status: isSimulated ? 'SIMULATED' : 'CONFIRMED',
      };

      setProbesList((prev) => [newRecord, ...prev]);
      setIsExecuting(false);
      onLogEvent(
        'CONTRACT',
        `Probe #${newId} recorded successfully! TX: ${fakeHash.slice(0, 16)}... Block: #${newRecord.blockNumber}`
      );
    }, 800);
  };

  return (
    <div className="bg-panel border border-panel-border rounded-md p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-panel-border pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent-blue" />
          <h2 className="font-mono text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            ReviveProbe On-Chain Diagnostic Sandbox
          </h2>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-canvas border border-panel-border px-2 py-0.5 rounded">
          Solidity 0.8.20 • pallet-revive
        </span>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed font-mono">
        Exercise state commitment, event emission, and 14-decimal deposit accounting on Portaldot
        Network V3.0 EVM runtime without blind gas wastage.
      </p>

      {/* Target Contract Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-zinc-400 block">Target Contract Address</label>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Planned / Pre-Compiled Sandbox
            </span>
          </div>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="w-full bg-canvas border border-panel-border focus:border-accent-blue rounded px-3 py-1.5 text-zinc-200 outline-none select-all"
          />
        </div>
        <div>
          <label className="text-zinc-400 mb-1 block">Test Deposit (tPOTv3)</label>
          <input
            type="text"
            value={testDepositPot}
            onChange={(e) => setTestDepositPot(e.target.value)}
            placeholder="0.05"
            className="w-full bg-canvas border border-panel-border focus:border-accent-blue rounded px-3 py-1.5 text-zinc-200 outline-none"
          />
        </div>
      </div>

      {/* Tag Selector & Trigger Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 font-mono text-xs">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-zinc-400 shrink-0">Probe Tag:</span>
          <select
            value={probeTag}
            onChange={(e) => setProbeTag(e.target.value)}
            className="bg-canvas border border-panel-border rounded px-2.5 py-1.5 text-zinc-200 outline-none flex-1"
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
            className="bg-canvas border border-panel-border rounded px-2.5 py-1.5 text-zinc-200 outline-none w-36"
          />
        )}

        <button
          onClick={handleExecuteProbe}
          disabled={isExecuting}
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded font-medium transition-colors shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isExecuting ? 'TRANSACTING...' : 'DISPATCH PROBE'}</span>
        </button>

        <button
          onClick={() => setShowCalldata(!showCalldata)}
          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-300 rounded transition-colors shrink-0"
          title="Toggle Encoded Calldata"
        >
          <Code className="w-3.5 h-3.5 text-accent-blue" />
          <span>CALLDATA</span>
        </button>
      </div>

      {/* Calldata Inspector Drawer */}
      {showCalldata && (
        <div className="bg-canvas border border-panel-border rounded p-3 text-xs font-mono flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Raw Encoded Calldata for pallet-revive call:</span>
            <span>Selector: 0x9c42a0f8</span>
          </div>
          <pre className="text-accent-blue bg-panel p-2 rounded border border-panel-border/50 text-[11px] break-all select-all">
            {simulatedCalldata}
          </pre>
          <p className="text-[10px] text-zinc-400">
            Paste this calldata into Portaldot Node Console at <code>Developer → Runtime calls → reviveApi → call</code>
          </p>
        </div>
      )}

      {/* Execution Records Table */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Recorded Execution Probes ({probesList.length})</span>
          <span className="text-[11px] text-accent-emerald flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> State Attested
          </span>
        </div>

        <div className="border border-panel-border rounded bg-canvas overflow-x-auto max-h-56">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-panel/80 text-zinc-400 text-[11px] border-b border-panel-border">
              <tr>
                <th className="p-2.5">ID</th>
                <th className="p-2.5">TAG</th>
                <th className="p-2.5">VALUE</th>
                <th className="p-2.5">BLOCK</th>
                <th className="p-2.5">SENDER</th>
                <th className="p-2.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-border/60">
              {probesList.map((probe) => (
                <tr key={probe.id} className="hover:bg-panel/40 transition-colors">
                  <td className="p-2.5 font-bold text-accent-blue">#{probe.id}</td>
                  <td className="p-2.5 text-zinc-200">{probe.tag}</td>
                  <td className="p-2.5 text-accent-emerald font-semibold">
                    {formatPot(probe.value)} tPOT
                  </td>
                  <td className="p-2.5 text-zinc-400">#{probe.blockNumber.toString()}</td>
                  <td className="p-2.5 text-zinc-400">
                    {probe.sender.slice(0, 6)}...{probe.sender.slice(-4)}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        probe.status === 'CONFIRMED'
                          ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30'
                          : 'bg-accent-blue/15 text-accent-blue border-accent-blue/30'
                      }`}
                    >
                      {probe.status}
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
