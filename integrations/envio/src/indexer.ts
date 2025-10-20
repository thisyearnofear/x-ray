// envio/indexer.ts
import { createIndexer } from '@envio/envio-dev';

// Define event handlers for MedicalAchievementNFT
const medicalAchievementNFTHandlers = {
  CertificateMinted: async (event: any) => {
    console.log('Certificate minted:', event);
    // Store certificate data in database
    // This would typically save to a database or other storage
  },
};

// Define event handlers for MedicalPaymaster
const medicalPaymasterHandlers = {
  ContractAuthorized: async (event: any) => {
    console.log('Contract authorized:', event);
    // Track authorized contracts
  },
  ContractRevoked: async (event: any) => {
    console.log('Contract revoked:', event);
    // Track revoked contracts
  },
  GasSponsored: async (event: any) => {
    console.log('Gas sponsored:', event);
    // Track gas sponsorship events
  },
};

// Create and export the indexer
export const indexer = createIndexer({
  name: 'x-ray-medical-indexer',
  contracts: {
    MedicalAchievementNFT: medicalAchievementNFTHandlers,
    MedicalPaymaster: medicalPaymasterHandlers,
  },
});