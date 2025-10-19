import { defineChain } from 'viem'

// Monad Testnet Configuration
export const monadTestnet = defineChain({
  id: 10143,
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

// Bundler Configuration (Pimlico or Alchemy)
export const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL || 'https://api.pimlico.io/v2/monad-testnet/rpc'

// Paymaster Configuration (optional)
export const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL
