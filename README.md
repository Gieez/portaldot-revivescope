# ReviveScope 🌐⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network: Portaldot V3.0](https://img.shields.io/badge/Portaldot-V3.0%20(Chain%20ID%20420420777)-purple)](https://dorahacks.io/hackathon/portaldot-hacker-house-2026/detail)
[![Tests: 3 Passed](https://img.shields.io/badge/Tests-3%2F3%20Passing-emerald)](tests/diagnostic.test.ts)
[![Framework: Next.js 14 App Router](https://img.shields.io/badge/Framework-Next.js%2014-black)](https://nextjs.org/)

**Portaldot Network V3.0 Dual-Runtime Node & Contract Diagnostic Sentinel.**

Engineered for the **Portaldot Hacker House 2026 ($5,200 USDT)** on DoraHacks.  
Track: **Node Operations & Tooling / Analytics**.

---

## 🎯 The Critical Problem on Portaldot V3.0

Portaldot Network V3.0 introduces high-throughput EVM execution powered by Substrate's `pallet-revive` (PolkaVM/EVM) alongside `pallet-contracts` (WASM). However, developers and node operators encounter three friction points:

1. **The 10,000x Decimal Trap:** Native `tPOTv3` uses **strictly 14 decimals** ($10^{14}$ base units), while standard Ethereum tools (Viem/Ethers/Hardhat) default to 18 decimals (`10^18`). Unaware developers face silent transaction reverts and 10,000x balance calculation skew.
2. **The Missing Solidity Block Explorer:** Testnet V3 currently lacks a dedicated EVM block explorer. MetaMask configurations leave the explorer field blank, forcing developers to operate blindly.
3. **Dual-Address Runtime Gap:** Ethereum H160 addresses cannot directly receive native gas tokens from Substrate without querying the runtime mapping (`reviveApi.accountId`).

---

## ⚡ Solution: ReviveScope

ReviveScope delivers a tactical, zero-lag diagnostic workspace:

- **Dual-Address Resolver:** Bidirectional mapping between EVM H160 accounts (MetaMask) and Substrate SS58 `AccountId32`. Pre-configured with official testnet genesis mappings and runtime query recipes.
- **14-Decimal Anti-Skew Math Engine:** Type-safe native BigInt conversion between human POT, 14-decimal base units ($10^{14}$), 6-decimal pUSD, and standard 18-decimal tokens. Generates drop-in TypeScript and Solidity snippets.
- **Node & RPC Latency Sentinel:** Active polling of `https://testnetv3-eth-rpc.feso-apps.xyz` and WebSocket endpoints, tracking latency, block progression, and upstream maintenance states.
- **ReviveProbe On-Chain Diagnostic Sandbox (`ReviveProbe.sol`):** Solidity smart contract deployed to verify state inclusion, event emission, and 14-decimal deposit accounting without blind gas spend.
- **Hybrid Live / Replica Architecture:** Functions seamlessly against live Portaldot RPC while providing an offline simulated harness during scheduled network upgrades.

---

## 🏗️ Architecture

```text
Browser Wallet (MetaMask / Rabby / Injected)
       │  EIP-1193 Provider (Chain ID 420420777)
       ▼
createWalletClient (viem / custom) ──write──►  ReviveProbe.sol (pallet-revive)
       ▲                                              │
       │                                       State / Events
createPublicClient (viem / HTTP)   ◄──────────────────┘
       │
       ├──► Dual-Address Mapper (H160 <-> SS58 AccountId32)
       ├──► 14-Decimal Precision Engine (10^14 base units)
       └──► RPC Latency Sentinel (Health Probe & Metrics)
```

---

## 📜 Smart Contract Specification (`ReviveProbe.sol`)

- **Language:** Solidity `^0.8.20`
- **Chain ID:** `420420777`
- **Native Decimals:** `14`
- **Methods:**
  - `recordProbe(string tag, bytes extraData)`: Emits indexed `ProbeExecuted` and locks diagnostic test deposits.
  - `withdrawDiagnosticBalance(uint256 amount)`: Safe withdrawal of test POT.
  - `to14Decimals(uint256 rawPotUnits)`: On-chain precision math verification.
  - `getChainTelemetry()`: Fetches block number, timestamp, chain ID, and probe counters.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation

```bash
git clone https://github.com/Gieez/portaldot-revivescope.git
cd portaldot-revivescope
npm install
```

### Run Unit Tests

```bash
npm test
```

### Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

---

## 🧪 Verification & Test Suite

ReviveScope includes automated regression test suites covering mathematical invariants and address derivation:

```text
✔ 14-Decimal Safe Math: parsePot and formatPot
✔ Address Mapper: H160 validation and SS58 derivation
✔ Chain Specifications: Portaldot V3 config
3 passing (809ms)
```

---

## 🏆 DoraHacks Hackathon Submission

- **Event:** Portaldot Hacker House 2026
- **Track:** Track 3: Node Operations & Tooling / Analytics
- **Live Deployment:** [Vercel Production](https://portaldot-revivescope.vercel.app)
- **Author:** Nugi (Gieez)
