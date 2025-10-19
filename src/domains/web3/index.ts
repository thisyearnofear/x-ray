/**
 * Web3 Domain Index
 * Integrates MetaMask Smart Accounts, Delegation Toolkit, and Monad testnet
 * ENHANCEMENT FIRST: Adds blockchain functionality to medical diagnostic game
 */

export { SmartAccountService } from './services/SmartAccountService'
export { DelegationService } from './services/DelegationService'
export { MedicalNFTService } from './services/MedicalNFTService'
export { Web3Facade } from './Web3Facade'

export type {
  SmartAccountConfig,
  DelegationRequest,
  MedicalCertificate,
  Web3State
} from './types'
