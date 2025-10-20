/**
 * Monad Testnet Configuration
 * @description Network configuration for Monad testnet deployment
 * @author X-RAY Medical Diagnostics Team
 */

// Monad Testnet Chain Configuration
export const monadTestnet = {
  id: 41454,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monad.xyz',
    },
  },
  testnet: true,
} as const;

// ERC-4337 EntryPoint addresses (same across testnets)
export const ENTRYPOINT_ADDRESSES = {
  v06: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // v0.6
  v07: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', // v0.7 (recommended)
} as const;

// Deployed Contract Addresses (update after deployment)
export const DEPLOYED_CONTRACTS = {
  // Core Medical Contracts
  medicalNFT: '0xA960B1692aa11a10Ff1c1595300301DfF1CDAcB4', // MedicalAchievementNFT
  paymaster: '0x2Aa0f72AEc34Ea007aeeD1c998f28278A1501423', // MedicalPaymaster

  // Supporting Contracts
  dataRegistry: '0x0000000000000000000000000000000000000000', // MedicalDataRegistry (future)
  entryPoint: ENTRYPOINT_ADDRESSES.v07, // ERC-4337 EntryPoint

  // Frontend Configuration
  chainId: monadTestnet.id,
  rpcUrl: monadTestnet.rpcUrls.default.http[0],
} as const;

// Contract Deployment Configuration
export const CONTRACT_CONFIG = {
  // MedicalAchievementNFT
  nft: {
    name: 'Medical Achievement Certificate',
    symbol: 'MAC',
    maxSupply: 10000, // Reasonable limit for testnet
  },

  // MedicalPaymaster
  paymaster: {
    maxGasCost: '1000000000000000000', // 1 MON in wei
    maxDailySponsorship: '100000000000000000', // 0.1 MON in wei
    authorizedContracts: [] as string[], // To be populated during deployment
  },

  // Deployment Parameters
  deployment: {
    confirmations: 3, // Wait for 3 block confirmations
    gasPrice: '50000000000', // 50 gwei (Monad is fast!)
    gasLimit: 5000000, // Conservative gas limit
  },
} as const;

// ABI Exports for Frontend Integration
export { MedicalAchievementNFTABI } from '../abis/MedicalAchievementNFT';
export { MedicalPaymasterABI } from '../abis/MedicalPaymaster';

// Type Definitions
export type ContractAddress = keyof typeof DEPLOYED_CONTRACTS;
export type ContractConfig = typeof CONTRACT_CONFIG;
