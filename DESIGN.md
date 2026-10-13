# Design Direction: ReviveScope

## Project
ReviveScope: Portaldot V3.0 (Chain ID 420420777) Dual-Runtime Node & Contract Diagnostic Sentinel.

## Purpose
Bridge the critical developer tooling void in Portaldot Network V3.0. Deliver an authoritative, zero-lag diagnostic workspace for Substrate pallet-revive EVM:
1. Bidirectional H160 (EVM) <-> SS58 (Substrate AccountId32) Address Derivation.
2. 14-Decimal Precision Native BigInt Token Math Engine (preventing the 10,000x decimal skew trap).
3. Live RPC Sentinel & Latency Probe (measuring block progression, JSON-RPC response time, and runtime state).
4. Dual-Runtime Calldata Inspector & On-Chain ReviveProbe execution harness.

## Audience
Web3 developers, node operators, security auditors, and hackathon judges evaluating Portaldot Network V3.0 infrastructure.

## Brand Character
Tactical, authoritative, surgical, dense, high-utility, uncompromising.

## Visual Concept
Tactical Swiss-Fintech Terminal. Think Bloomberg Terminal crossed with mission control telemetry. High-density information architecture, crisp borders, monospaced numeric readouts, and immediate interactive feedback without decorative filler.

## Art Direction
Industrial Swiss-Fintech Minimalist. Dark slate graphite canvas (#090a0f), precision grid lines, micro-borders (1px solid #1f2430), muted zinc typography with surgical emerald (#10b981) and amber (#f59e0b) operational status indicators.

## Typography
- Display / Headers: JetBrains Mono / Space Grotesk / system-ui monospace
- Data / Metrics / Calldata: Monospace (Fira Code / Roboto Mono fallback)
- Body: Inter / system-ui, tight tracking (-0.01em), high legibility
- Hierarchy:
  - H1: 24px - 28px, font-bold, uppercase, tracking-wider
  - H2: 16px - 18px, font-semibold, uppercase, tracking-wide
  - Section Labels: 11px - 12px, font-mono, tracking-widest, text-zinc-400
  - Data Values: 13px - 14px, font-mono, tabular-nums

## Color System
- Canvas Background: #07090e (deep graphite void)
- Card / Panel Surface: #0f121a (slate container)
- Surface Elevated: #161b26 (interactive element)
- Primary Accent: #3b82f6 (Portaldot cyan-blue)
- Tactical Signal Emerald: #10b981 (healthy RPC / verified check)
- Tactical Signal Amber: #f59e0b (maintenance / warning / testnet note)
- Tactical Signal Rose: #ef4444 (RPC unreachable / syntax error)
- Text Primary: #f3f4f6 (zinc-100)
- Text Secondary: #9ca3af (zinc-400)
- Text Muted: #6b7280 (zinc-500)
- Borders: #1e2433 (subtle tactical grid)
- Active Border: #3b82f6 / #10b981

## Composition & Layout
- Top HUD Bar: Network badge (Chain ID 420420777), RPC latency monitor, Dual-mode toggle (Live RPC / Simulator), and Wallet Connect.
- Diagnostic Grid: 3-column asymmetric layout (not equal repetitive cards):
  - Left Col (40% width): Node Sentinel & Live RPC Health telemetry + Substrate/EVM status.
  - Center Col (35% width): Bidirectional Address Mapper (H160 <-> SS58) & 14-Decimal Safe Math Engine.
  - Right Col (25% width): ReviveProbe Execution Sandbox & Transaction Receipt inspector.
- Bottom Dock: Real-time event log streamer and quick copy utilities.

## Shape Language
- Corners: Crisp micro-radii (rounded-md / rounded-sm, max 6px). No bubble pills.
- Borders: 1px precision hairline borders (border-zinc-800).
- Shadows: None or ultra-tight dark inset bevels. No blurry neon halos.

## Motion
- Transitions: Instantaneous to snappy (100ms - 150ms ease-out).
- Telemetry: Real-time pulsed indicators for ping/block height.
- Zero gratuitous parallax or page-load delays.

## Forbidden Patterns
- No generic SaaS purple gradients.
- No floating 3D blobs or decorative glassmorphism blur.
- No rounded-full pill buttons floating randomly.
- Zero em-dashes in prose and copy.
- No dummy/unclickable buttons; all interactive tools must calculate or execute real logic.
