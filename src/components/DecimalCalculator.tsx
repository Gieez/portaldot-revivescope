'use client';

import React, { useState } from 'react';
import { Calculator, AlertTriangle, Code2, Copy, Check, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { parsePot, formatPot, calculateDecimalSkew } from '@/lib/math';

interface DecimalCalculatorProps {
  onLogEvent: (type: 'MATH' | 'RPC' | 'RESOLVER' | 'CONTRACT', msg: string) => void;
}

export const DecimalCalculator: React.FC<DecimalCalculatorProps> = ({ onLogEvent }) => {
  const [potInput, setPotInput] = useState<string>('1.0');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'viem' | 'solidity' | 'ethers'>('viem');

  let baseUnits14 = 0n;
  let skew = {
    standard18Base: 0n,
    portaldot14Base: 0n,
    skewRatio: 10000,
    excessBaseUnits: 0n,
  };
  let mathError = '';

  try {
    baseUnits14 = parsePot(potInput || '0');
    skew = calculateDecimalSkew(potInput || '0');
  } catch (err: unknown) {
    mathError = err instanceof Error ? err.message : 'Invalid amount';
  }

  const viemSnippet = `// Portaldot V3 Safe 14-Decimal Parsing in Viem
export const parsePot = (humanAmount: string): bigint => {
  const [whole, frac = ''] = humanAmount.trim().split('.');
  const wholeUnits = BigInt(whole || '0') * (10n ** 14n);
  const paddedFrac = frac.slice(0, 14).padEnd(14, '0');
  return wholeUnits + BigInt(paddedFrac);
};

// DO NOT USE: parseEther("${potInput || '1.0'}") // produces 10^18 (10,000x skew!)
const safeBaseWei = parsePot("${potInput || '1.0'}"); // exactly 10^14 base units`;

  const soliditySnippet = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PortaldotPrecisionGuard {
    // Portaldot native POT precision is strictly 14 decimals
    uint8 public constant POT_DECIMALS = 14;
    uint256 public constant POT_BASE = 10**14;

    function toBaseUnits(uint256 humanPot) external pure returns (uint256) {
        return humanPot * POT_BASE;
    }
}`;

  const ethersSnippet = `// Ethers.js v6 Portaldot 14-Decimal Custom Unit
import { parseUnits } from "ethers";

// Explicit 14 decimals instead of ethers.parseEther()
const potAmount = parseUnits("${potInput || '1.0'}", 14);
console.log("Portaldot Base Units:", potAmount.toString());`;

  const currentSnippet =
    activeSnippetTab === 'viem'
      ? viemSnippet
      : activeSnippetTab === 'solidity'
      ? soliditySnippet
      : ethersSnippet;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopiedSnippet(true);
    onLogEvent('MATH', `Copied safe 14-decimal code snippet (${activeSnippetTab.toUpperCase()})`);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="relative bg-panel border border-panel-border/90 rounded-xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-amber/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-panel-border/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center text-accent-amber">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold tracking-wider text-zinc-100 uppercase flex items-center gap-2">
              14-Decimal Safe Math Terminal
              <span className="text-[10px] font-mono text-accent-amber bg-accent-amber/10 border border-accent-amber/30 px-2 py-0.5 rounded-full font-bold">
                ANTI-SKEW GUARD
              </span>
            </h2>
            <p className="text-[11px] font-mono text-zinc-400">
              Deterministic normalizer between Substrate 14-dec and EVM 18-dec base units
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed font-mono">
        Portaldot Network V3.0 native token (<code>tPOTv3</code>) uses <strong>14 decimals</strong> ($10^{14}$).
        Standard EVM tools assume 18 decimals, generating a silent <strong>10,000x economic skew</strong>.
      </p>

      {/* Input */}
      <div>
        <label className="text-xs font-mono text-zinc-300 mb-1.5 block font-medium">
          Enter POT Amount to Inspect
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={potInput}
            onChange={(e) => setPotInput(e.target.value)}
            placeholder="1.0"
            className="w-full bg-canvas/80 border border-panel-border focus:border-accent-blue rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 outline-none transition-colors font-semibold"
          />
          <div className="flex gap-1">
            {['0.1', '1.0', '10', '50'].map((preset) => (
              <button
                key={preset}
                onClick={() => setPotInput(preset)}
                className="px-2 py-1.5 text-[11px] font-mono bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-300 rounded transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-accent-blue bg-canvas border border-panel-border px-3 py-2 rounded-lg shrink-0">
            tPOTv3
          </span>
        </div>
        {mathError && <p className="text-[11px] font-mono text-accent-rose mt-1">{mathError}</p>}
      </div>

      {/* Visual Skew Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {/* Correct Portaldot 14-Decimal */}
        <div className="bg-canvas/80 border border-accent-emerald/40 rounded-lg p-3.5 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-accent-emerald font-bold flex items-center gap-1">
              ✓ PORTALDOT V3 (14-DEC)
            </span>
            <span className="text-[10px] text-zinc-400 bg-accent-emerald/10 px-1.5 py-0.5 rounded font-mono">
              1 POT = 10^14 base
            </span>
          </div>
          <span className="text-zinc-100 font-bold text-base break-all font-mono">
            {baseUnits14.toString()}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            Exact Substrate pallet-revive base units
          </span>
        </div>

        {/* Flawed Standard 18-Decimal */}
        <div className="bg-canvas/80 border border-accent-rose/40 rounded-lg p-3.5 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-accent-rose font-bold flex items-center gap-1">
              ✕ STANDARD EVM (18-DEC)
            </span>
            <span className="text-[10px] text-accent-rose bg-accent-rose/10 px-1.5 py-0.5 rounded font-mono font-bold">
              10,000x SKEW
            </span>
          </div>
          <span className="text-zinc-400 font-bold text-base break-all font-mono line-through opacity-80">
            {skew.standard18Base.toString()}
          </span>
          <span className="text-[10px] text-accent-rose/90 font-mono font-semibold">
            Caution: parseEther() over-requests 10,000x more tokens!
          </span>
        </div>
      </div>

      {/* Interactive Visual Scale Bar */}
      <div className="bg-canvas/60 border border-panel-border/80 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>PRECISION RATIO VISUALIZER</span>
          <span className="text-accent-amber font-bold">1 : 10,000 SCALE DELTA</span>
        </div>
        <div className="w-full bg-panel rounded-full h-2.5 overflow-hidden flex border border-panel-border">
          <div className="bg-accent-emerald h-full w-[10%]" title="Portaldot 14 decimals scale" />
          <div className="bg-accent-rose/80 h-full w-[90%]" title="18 decimals excess skew" />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
          <span className="text-accent-emerald">Target: 10^14 (Safe)</span>
          <span className="text-accent-rose">Excess Skew: +9,999x Overpayment</span>
        </div>
      </div>

      {/* Drop-in Snippet Tabs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1 bg-canvas border border-panel-border rounded-lg p-0.5">
            {(['viem', 'solidity', 'ethers'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSnippetTab(tab)}
                className={`px-2.5 py-1 rounded text-[11px] uppercase transition-colors font-semibold ${
                  activeSnippetTab === tab
                    ? 'bg-panel-elevated text-zinc-100 border border-panel-border'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopySnippet}
            className="flex items-center gap-1 text-[11px] text-accent-blue hover:text-blue-400 transition-colors bg-panel-elevated px-2.5 py-1 rounded-lg border border-panel-border"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet ? 'COPIED!' : 'COPY CODE'}</span>
          </button>
        </div>

        <pre className="bg-canvas border border-panel-border rounded-lg p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed shadow-inner">
          {currentSnippet}
        </pre>
      </div>
    </div>
  );
};
