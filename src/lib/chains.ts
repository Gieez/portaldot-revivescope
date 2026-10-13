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
      http: ['https://testnetv3-eth-rpc.feso-apps.xyz'],
      webSocket: ['wss://testnetv3-node.feso-apps.xyz'],
    },
    public: {
      http: ['https://testnetv3-eth-rpc.feso-apps.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Portaldot Node Console',
      url: 'https://node-console.feso-apps.xyz/',
    },
  },
  testnet: true,
});

export const PORTALDOT_CHAIN_SPECS = {
  chainId: 420420777,
  hexChainId: '0x190f2309',
  networkName: 'PortaldotV3 Testnet',
  tokenSymbol: 'tPOTv3',
  mainnetSymbol: 'POT',
  decimals: 14,
  baseUnitMultiplier: 100_000_000_000_000n, // 10^14
  evmRpcUrl: 'https://testnetv3-eth-rpc.feso-apps.xyz',
  substrateRpcUrl: 'wss://testnetv3-node.feso-apps.xyz',
  nodeConsoleUrl: 'https://node-console.feso-apps.xyz/',
  runtimeEngine: 'Substrate pallet-revive (PolkaVM/EVM) + pallet-contracts (WASM)',
};
