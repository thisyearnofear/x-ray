import { defineChain } from 'viem'

export const monadTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://testnet.monadexplorer.com'
    },
  },
  testnet: true,
})

// TODO: Replace with actual Monad testnet bundler URL when available
// Currently using placeholder - check FastLane or other providers
export const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL || 'https://bundler.monad-testnet.example.com'
