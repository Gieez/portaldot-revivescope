# ReviveScope — Pitch Deck & Architecture Brief

**Event:** Portaldot Hacker House 2026 (DoraHacks)  
**Project:** ReviveScope (Portaldot V3.0 Dual-Runtime Diagnostic Sentinel)  
**Author:** Gieez (Solo Web3 Builder)  
**Live Application:** [https://portaldot-revivescope.vercel.app](https://portaldot-revivescope.vercel.app)  
**GitHub Repository:** [https://github.com/Gieez/portaldot-revivescope](https://github.com/Gieez/portaldot-revivescope)

---

## 1. Problem Statement

Portaldot Network V3.0 introduces high-performance dual-runtime execution via Substrate's `pallet-revive` (PolkaVM/EVM) alongside `pallet-contracts` (WASM). While powerful, early builders and node operators face three critical developer-experience gaps:

1. **The 10,000x Decimal Trap:** Native `tPOTv3` uses strictly **14 decimals** (1 POT = 10^14 base units), whereas standard EVM tools (Viem, Ethers.js, Hardhat) assume 18 decimals (`10^18`). Unaware developers executing `parseEther("1.0")` cause silent transaction reverts and a 10,000x economic calculation skew.
2. **Missing EVM Block Explorer:** The V3 testnet currently lacks a dedicated Solidity block explorer, forcing teams to deploy and transact blindly.
3. **Dual-Address Runtime Gap:** MetaMask H160 accounts cannot directly receive native gas tokens from Substrate without first querying the runtime mapping (`reviveApi.accountId`).

---

## 2. The Solution: ReviveScope

ReviveScope delivers a tactical, zero-lag diagnostic workspace:

* **Dual-Address Resolver:** Bidirectional mapping between EVM H160 accounts and Substrate SS58 `AccountId32` with verified runtime query recipes.
* **14-Decimal Anti-Skew Math Engine:** Native BigInt precision converter with real-time skew ratio calculation and copyable TypeScript / Solidity code recipes.
* **Live RPC Sentinel:** Real-time round-trip latency tracking, block progression monitoring, and 1-click MetaMask network addition (EIP-3085).
* **ReviveProbe On-Chain Sandbox:** Solidity 0.8.20 diagnostic contract designed to verify block inclusion, event emission, and test deposits without blind gas expenditure.
* **Resilient Hybrid Architecture:** Seamless toggle between live network RPC and an in-memory replica harness, allowing evaluators to audit features even during upstream testnet maintenance.

---

## 3. Product Functionality & Verification Proof

- **Live Production:** Deployed on Vercel Edge Network at `https://portaldot-revivescope.vercel.app`.
- **Automated Tests:** 3/3 automated regression tests passing (`diagnostic.test.ts`), verifying 14-decimal mathematical invariants, address derivation, and chain configuration.
- **Smart Contract:** `contracts/ReviveProbe.sol` compiled with `solc 0.8.20`, targeted for Chain ID `420420777`.

---

## 4. Why Portaldot is Essential

Portaldot Network's dual-runtime architecture represents the future of Substrate and EVM interoperability. By solving the operational tooling gaps with ReviveScope, we accelerate developer onboarding, prevent costly decimal errors, and provide node operators with actionable execution telemetry.

---

## 5. Roadmap & Future Support

- **Post-Hackathon Q4 2026:** Native Substrate WebSocket event streaming and real-time block explorer page.
- **Mainnet 3.0:** Automated contract source-code verification registry (Solidity to PolkaVM via `resolc`).
- **Developer SDK:** `@revivescope/sdk` npm package for plug-and-play 14-decimal BigInt conversions in any dApp.
