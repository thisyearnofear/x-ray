import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';

// Get private key from environment (only needed for deployment/testing)
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';

// Monad Testnet Configuration
const monadTestnet = {
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

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable Intermediate Representation for better optimization
    },
  },

  networks: {
    // Monad Testnet Configuration
    monadTestnet: {
      url: monadTestnet.rpcUrls.default.http[0],
      accounts: [PRIVATE_KEY],
      chainId: monadTestnet.id,
      gasPrice: 50000000000, // 50 gwei
      gas: 5000000,
      timeout: 60000, // 60 seconds
    },

    // Local development
    hardhat: {
      chainId: 31337,
    },

    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
  },

  etherscan: {
    apiKey: {
      // Add Monad explorer API key when available
      monadTestnet: process.env.MONAD_EXPLORER_API_KEY || '',
    },
    customChains: [
      {
        network: 'monadTestnet',
        chainId: monadTestnet.id,
        urls: {
          apiURL: 'https://testnet.monad.xyz/api', // Update when available
          browserURL: monadTestnet.blockExplorers.default.url,
        },
      },
    ],
  },

  // Contract sizing and gas reporting
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },

  // Contract sources are in the root directory
};

export default config;
