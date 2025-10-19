import { Address, Hex } from 'viem'
import { Implementation } from '@metamask/delegation-toolkit'

export interface SmartAccountConfig {
  implementation: Implementation
  ownerAddress: Address
  salt: Hex
}

export interface DelegationRequest {
  delegateAddress: Address
  permissions: string[]
  expiry?: number
  caveats?: any[]
}

export interface MedicalCertificate {
  patientId: string
  diagnosis: string[]
  accuracy: number
  timestamp: number
  certificateId: string
}

export interface Web3State {
  isConnected: boolean
  smartAccountAddress?: Address
  chainId?: number
  delegations: DelegationRequest[]
  certificates: MedicalCertificate[]
}

export interface UserProfile {
  address: Address
  medicalHistory: MedicalCertificate[]
  achievements: string[]
  consultationPermissions: DelegationRequest[]
}
