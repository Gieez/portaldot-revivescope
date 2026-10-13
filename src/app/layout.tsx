import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReviveScope | Portaldot V3.0 Dual-Runtime Diagnostic Sentinel',
  description:
    'Authoritative EVM & Substrate node diagnostic sentinel, H160-to-SS58 address mapper, 14-decimal safe BigInt math terminal, and ReviveProbe execution harness for Portaldot Network V3.0.',
  keywords: [
    'Portaldot',
    'Portaldot V3.0',
    'pallet-revive',
    'PolkaVM',
    'EVM',
    'Substrate',
    'Solidity',
    'DoraHacks',
    'Hacker House 2026',
    'Web3 Tooling',
  ],
  authors: [{ name: 'Gieez' }],
  openGraph: {
    title: 'ReviveScope | Portaldot V3.0 Dual-Runtime Sentinel',
    description:
      'Diagnostic workspace for Portaldot Network V3.0: dual address derivation, 14-decimal BigInt math, and live node sentinel.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-zinc-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
