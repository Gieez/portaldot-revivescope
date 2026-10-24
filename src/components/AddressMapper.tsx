'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, Check, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';
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
    <div className="bg-panel border border-panel-border rounded-md p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-panel-border pb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-accent-blue" />
          <h2 className="font-mono text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Dual-Address Resolver (EVM H160 ↔ Substrate SS58)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-canvas border border-panel-border px-2 py-0.5 rounded">
          pallet-revive Mapping
        </span>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed font-mono">
        On Portaldot V3, MetaMask H160 accounts cannot directly receive native gas tokens from Substrate
        without runtime mapping. Resolve the mapped SS58 address before funding.
      </p>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="text-zinc-400">Presets:</span>
        <button
          onClick={() => setPreset('0xf7eC65d11e35375A250e474059a917B537804142')}
          className="px-2 py-0.5 bg-canvas hover:bg-zinc-800 border border-panel-border rounded text-zinc-300 transition-colors"
        >
          Guide Deployer (0xf7eC...)
        </button>
        <button
          onClick={() => setPreset('0x7a39F90aE852D6cfEb24a9a46C0A9A30f78d6b9C')}
          className="px-2 py-0.5 bg-canvas hover:bg-zinc-800 border border-panel-border rounded text-zinc-300 transition-colors"
        >
          ReviveProbe (0x7a39...)
        </button>
        {connectedWalletAddress && (
          <button
            onClick={() => setPreset(connectedWalletAddress)}
            className="px-2 py-0.5 bg-accent-blue/15 hover:bg-accent-blue/25 border border-accent-blue/40 rounded text-accent-blue transition-colors"
          >
            Connected Wallet
          </button>
        )}
      </div>

      {/* Input Form */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-mono text-zinc-300 mb-1.5 block">
            EVM H160 Target Address (MetaMask)
          </label>
          <input
            type="text"
            value={h160Input}
            onChange={(e) => setH160Input(e.target.value)}
            placeholder="0x..."
            className="w-full bg-canvas border border-panel-border focus:border-accent-blue rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none transition-colors"
          />
          {errorMsg && <p className="text-[11px] font-mono text-accent-rose mt-1">{errorMsg}</p>}
        </div>

        <div>
          <label className="text-xs font-mono text-zinc-300 mb-1.5 block">
            Mapped Substrate AccountId32 (SS58 Format)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={ss58Output}
              placeholder="SS58 will appear here..."
              className="w-full bg-canvas border border-panel-border rounded px-3 py-2 text-xs font-mono text-accent-emerald font-medium outline-none select-all"
            />
            <button
              onClick={handleCopy}
              disabled={!ss58Output}
              className="flex items-center gap-1 px-3 py-2 bg-panel-elevated hover:bg-zinc-800 border border-panel-border disabled:opacity-40 text-zinc-200 rounded text-xs font-mono transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Runtime Call Manual Verification Guide */}
      <div className="bg-canvas border border-panel-border rounded p-3 text-xs font-mono flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-zinc-300 font-semibold border-b border-panel-border/60 pb-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-blue" />
          <span>Official On-Chain Verification Query</span>
        </div>
        <div className="text-[11px] text-zinc-400 leading-relaxed">
          To attest on the Portaldot Node Console:
          <ol className="list-decimal list-inside mt-1 space-y-0.5 text-zinc-300">
            <li>
              Open Console:{' '}
              <a
                href={guide.consoleUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent-blue underline inline-flex items-center gap-0.5"
              >
                node-console.portaldot.dev <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
            <li>Navigate to <strong>{guide.module}</strong></li>
            <li>Select call <strong>{guide.method}</strong> with parameter <code>{guide.paramName}</code></li>
            <li>Fund the returned SS58 address with <code>tPOTv3</code> to provide MetaMask EVM gas.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
