'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, Check, ExternalLink, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { deriveSubstrateAddress, isValidH160, getRuntimeQueryGuide } from '@/lib/substrate-address';

interface AddressMapperProps {
  connectedWalletAddress: string | null;
  onLogEvent: (type: 'RESOLVER' | 'RPC' | 'MATH' | 'CONTRACT', msg: string) => void;
}

export const AddressMapper: React.FC<AddressMapperProps> = ({
  connectedWalletAddress,
  onLogEvent,
}) => {
  const [h160Input, setH160Input] = useState<string>('0xf7eC65d11e35375A250e474059a917B537804142');
  const [ss58Output, setSs58Output] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!h160Input) {
      setSs58Output('');
      setErrorMsg(null);
      return;
    }

    if (isValidH160(h160Input)) {
      try {
        const derived = deriveSubstrateAddress(h160Input);
        setSs58Output(derived);
        setErrorMsg(null);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Derivation failed');
      }
    } else {
      setErrorMsg('Invalid H160 address (must be 0x followed by 40 hex characters)');
      setSs58Output('');
    }
  }, [h160Input]);

  const handleCopy = () => {
    if (!ss58Output) return;
    navigator.clipboard.writeText(ss58Output);
    setCopied(true);
    onLogEvent('RESOLVER', `Copied SS58 address: ${ss58Output} mapped from ${h160Input}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const setPreset = (addr: string) => {
    setH160Input(addr);
    onLogEvent('RESOLVER', `Loaded preset H160 target: ${addr}`);
  };

  const guide = getRuntimeQueryGuide(h160Input);

  return (
    <div className="relative bg-panel border border-panel-border/90 rounded-xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-panel-border/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold tracking-wider text-zinc-100 uppercase flex items-center gap-2">
              Dual-Address Resolver
              <span className="text-[10px] font-mono text-accent-blue bg-accent-blue/10 border border-accent-blue/30 px-2 py-0.5 rounded-full font-semibold">
                EVM ↔ SUBSTRATE
              </span>
            </h2>
            <p className="text-[11px] font-mono text-zinc-400">
              Deterministic fallback derivation via Polkadot SDK pallet-revive AddressMapper
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed font-mono">
        On Portaldot V3, MetaMask H160 accounts cannot directly receive native gas tokens from Substrate
        without runtime mapping. Resolve the mapped SS58 address before funding.
      </p>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
        <span className="text-zinc-400 font-medium">Quick Presets:</span>
        <button
          onClick={() => setPreset('0xe0ba8adf0cd660f5875aca70a98e466f30855dec')}
          className="px-2.5 py-1 bg-accent-emerald/10 hover:bg-accent-emerald/20 border border-accent-emerald/30 rounded-lg text-accent-emerald transition-colors font-bold"
        >
          Live ReviveProbe (0xe0ba...)
        </button>
        <button
          onClick={() => setPreset('0xf7eC65d11e35375A250e474059a917B537804142')}
          className="px-2.5 py-1 bg-canvas hover:bg-zinc-800 border border-panel-border rounded-lg text-zinc-300 transition-colors"
        >
          Genesis Deployer
        </button>
        {connectedWalletAddress && (
          <button
            onClick={() => setPreset(connectedWalletAddress)}
            className="px-2.5 py-1 bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/50 rounded-lg text-accent-blue transition-colors font-bold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Connected Wallet
          </button>
        )}
      </div>

      {/* Input Form */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-mono text-zinc-300 mb-1.5 block font-medium">
            EVM H160 Target Address (MetaMask)
          </label>
          <input
            type="text"
            value={h160Input}
            onChange={(e) => setH160Input(e.target.value)}
            placeholder="0x..."
            className="w-full bg-canvas/80 border border-panel-border focus:border-accent-blue rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 outline-none transition-colors font-semibold"
          />
          {errorMsg && <p className="text-[11px] font-mono text-accent-rose mt-1">{errorMsg}</p>}
        </div>

        <div>
          <label className="text-xs font-mono text-zinc-300 mb-1.5 block font-medium">
            Mapped Substrate AccountId32 (SS58 Format, Prefix 42)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={ss58Output}
              placeholder="Derivation result..."
              className="w-full bg-canvas/80 border border-panel-border rounded-lg px-3 py-2 text-xs font-mono text-accent-emerald font-bold outline-none select-all shadow-inner"
            />
            <button
              onClick={handleCopy}
              disabled={!ss58Output}
              className="flex items-center gap-1 px-3 py-2 bg-panel-elevated hover:bg-zinc-800 border border-panel-border disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-mono transition-colors shrink-0 font-medium"
              title="Copy SS58 Substrate Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Recipe */}
      <div className="bg-canvas/60 border border-panel-border/80 rounded-lg p-3 text-xs font-mono text-zinc-400 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-blue" />
            Runtime Verification Guide:
          </span>
          <a
            href={guide.consoleUrl}
            target="_blank"
            rel="noreferrer"
            className="text-accent-blue hover:underline flex items-center gap-1"
          >
            Node Console <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[11px] text-zinc-400">
          Navigate to <code>{guide.module}</code> → method <code>{guide.method}</code> with{' '}
          <code>{guide.paramName}</code> = <span className="text-zinc-200">{guide.paramValue.slice(0, 10)}...</span>
        </p>
      </div>
    </div>
  );
};
