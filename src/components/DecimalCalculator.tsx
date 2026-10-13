'use client';

import React, { useState } from 'react';
import { Calculator, AlertTriangle, Code2, Copy, Check } from 'lucide-react';
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
    baseUnits14 = parsePot(potInput);
    skew = calculateDecimalSkew(potInput);
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

// DO NOT USE: parseEther("${potInput}") // produces 10^18 (10,000x skew!)
const baseWei = parsePot("${potInput}"); // exactly 10^14 base units`;

  const soliditySnippet = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PortaldotAccounting {
    // Portaldot native POT precision is strictly 14 decimals
    uint8 public constant POT_DECIMALS = 14;
    uint256 public constant POT_BASE = 10**14;

    function toBaseUnits(uint256 humanPot) external pure returns (uint256) {
        return humanPot * POT_BASE;
    }
}`;

  const ethersSnippet = `// Ethers.js v6 Portaldot 14-Decimal Custom Unit
import { parseUnits, formatUnits } from "ethers";

// Use explicit 14 decimals instead of ethers.parseEther()
const potAmount = parseUnits("${potInput}", 14);
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
    <div className="bg-panel border border-panel-border rounded-md p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-panel-border pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-accent-blue" />
          <h2 className="font-mono text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            14-Decimal Safe Math Terminal
          </h2>
        </div>
        <span className="text-[11px] font-mono text-accent-amber bg-accent-amber/10 border border-accent-amber/30 px-2 py-0.5 rounded font-semibold">
          ANTI-SKEW GUARD
        </span>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed font-mono">
        Portaldot Network V3.0 native token (<code>tPOTv3</code>) uses <strong>14 decimals</strong>.
        Standard EVM tools assume 18 decimals, creating a silent <strong>10,000x calculation error</strong>.
      </p>

      {/* Input */}
      <div>
        <label className="text-xs font-mono text-zinc-300 mb-1.5 block">
          Enter POT Amount to Inspect
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={potInput}
            onChange={(e) => setPotInput(e.target.value)}
            placeholder="1.0"
            className="w-full bg-canvas border border-panel-border focus:border-accent-blue rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none transition-colors"
          />
          <span className="text-xs font-mono font-semibold text-accent-blue bg-canvas border border-panel-border px-3 py-2 rounded shrink-0">
            tPOTv3
          </span>
        </div>
        {mathError && <p className="text-[11px] font-mono text-accent-rose mt-1">{mathError}</p>}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {/* Correct Portaldot 14-Decimal */}
        <div className="bg-canvas border border-accent-emerald/40 rounded p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-accent-emerald font-semibold uppercase text-[11px]">
              Portaldot V3.0 (Target)
            </span>
            <span className="text-[10px] bg-accent-emerald/15 text-accent-emerald px-1.5 py-0.5 rounded">
              14 DECIMALS
            </span>
          </div>
          <span className="text-sm font-bold text-zinc-100 break-all select-all">
            {baseUnits14.toString()}
          </span>
          <span className="text-[11px] text-zinc-400">
            = {formatPot(baseUnits14)} tPOTv3 (1 POT = 10^14 base units)
          </span>
        </div>

        {/* Skewed Standard 18-Decimal */}
        <div className="bg-canvas border border-accent-rose/40 rounded p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-accent-rose font-semibold uppercase text-[11px]">
              Standard EVM parseEther (Trap)
            </span>
            <span className="text-[10px] bg-accent-rose/15 text-accent-rose px-1.5 py-0.5 rounded">
              18 DECIMALS
            </span>
          </div>
          <span className="text-sm font-bold text-zinc-400 break-all select-all">
            {skew.standard18Base.toString()}
          </span>
          <span className="text-[11px] text-accent-rose">
            +{(skew.excessBaseUnits).toString()} excess (10,000x overpay!)
          </span>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-accent-amber/10 border border-accent-amber/30 rounded p-3 flex items-start gap-2.5 text-xs font-mono text-amber-200">
        <AlertTriangle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
        <div className="leading-relaxed text-[11px]">
          <strong>CRITICAL INTEGRATION PITFALL:</strong> If your dApp calls{' '}
          <code className="text-amber-100 bg-amber-950/60 px-1 py-0.5 rounded">parseEther(&quot;1.0&quot;)</code> on
          Portaldot, the contract attempts to transfer 10,000 POT instead of 1.0 POT! Always use safe 14-decimal BigInt
          math.
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="bg-canvas border border-panel-border rounded p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-panel-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-accent-blue" />
            <span className="text-xs font-mono text-zinc-300 font-semibold">
              Safe Integration Recipes
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveSnippetTab('viem')}
              className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                activeSnippetTab === 'viem'
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Viem
            </button>
            <button
              onClick={() => setActiveSnippetTab('solidity')}
              className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                activeSnippetTab === 'solidity'
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Solidity
            </button>
            <button
              onClick={() => setActiveSnippetTab('ethers')}
              className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                activeSnippetTab === 'ethers'
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Ethers.js
            </button>
            <button
              onClick={handleCopySnippet}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-panel-elevated hover:bg-zinc-800 border border-panel-border text-zinc-300 rounded ml-1 transition-colors"
            >
              {copiedSnippet ? <Check className="w-2.5 h-2.5 text-accent-emerald" /> : <Copy className="w-2.5 h-2.5" />}
              <span>{copiedSnippet ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>

        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto p-2 bg-panel/70 rounded border border-panel-border/50 max-h-40 leading-relaxed">
          {currentSnippet}
        </pre>
      </div>
    </div>
  );
};
