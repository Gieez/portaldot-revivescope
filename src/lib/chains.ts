import { defineChain } from 'viem';

export const portaldotV3 = defineChain({
  id: 420420777,
  name: 'PortaldotV3 Testnet',
  nativeCurrency: {
    name: 'Portaldot Token',
    symbol: 'tPOTv3',
    decimals: 14, // Non-standard 14 decimals on pallet-revive
  },
  rpcUrls: {
    default: {
      http: ['https://test-evm-rpc-v3.portaldot.dev'],
      webSocket: ['wss://test-node-v3.portaldot.dev'],
    },
    public: {
      http: ['https://test-evm-rpc-v3.portaldot.dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Portaldot Node Console',
      url: 'https://node-console.portaldot.dev/',
    },
  },
  testnet: true,
});

export const PORTALDOT_CHAIN_SPECS = {
  chainId: 420420777,
  hexChainId: '0x190f1ca9',
  networkName: 'PortaldotV3 Testnet',
  tokenSymbol: 'tPOTv3',
  mainnetSymbol: 'POT',
  decimals: 14,
  baseUnitMultiplier: 100_000_000_000_000n, // 10^14
  evmRpcUrl: 'https://test-evm-rpc-v3.portaldot.dev',
  substrateRpcUrl: 'wss://test-node-v3.portaldot.dev',
  nodeConsoleUrl: 'https://node-console.portaldot.dev/',
  runtimeEngine: 'Substrate pallet-revive (PolkaVM/EVM) + pallet-contracts (WASM)',
};
