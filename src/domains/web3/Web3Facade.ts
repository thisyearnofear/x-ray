import { Address } from 'viem'
import { SmartAccountService } from './services/SmartAccountService'
import { DelegationService } from './services/DelegationService'
import { MedicalNFTService } from './services/MedicalNFTService'
import { Web3State, UserProfile, MedicalCertificate } from './types'

export class Web3Facade {
  private smartAccountService: SmartAccountService
  private delegationService: DelegationService
  private medicalNFTService: MedicalNFTService
  private state: Web3State

  constructor(bundlerUrl?: string) {
    this.smartAccountService = new SmartAccountService(bundlerUrl)
    this.delegationService = new DelegationService()
    this.medicalNFTService = new MedicalNFTService(this.smartAccountService)

    this.state = {
      isConnected: false,
      delegations: [],
      certificates: []
    }
  }

  async connectWallet(ownerAddress: Address): Promise<UserProfile> {
    // Create or connect to smart account
    const smartAccount = await this.smartAccountService.createSmartAccount(ownerAddress)

    this.state.isConnected = true
    this.state.smartAccountAddress = smartAccount.address
    this.state.chainId = 10143 // Monad testnet

    // Load existing profile data
    const profile = await this.loadUserProfile(ownerAddress)

    return profile
  }

  async enableAIConsultationDelegation(delegateAddress: Address): Promise<void> {
    if (!this.state.smartAccountAddress) throw new Error('No smart account connected')

    const delegation = await this.delegationService.createMedicalConsultationDelegation(
      this.state.smartAccountAddress,
      delegateAddress
    )

    this.state.delegations.push({
      delegateAddress,
      permissions: ['consultAI', 'getMedicalAnalysis'],
      expiry: delegation.expiry
    })
  }

  async mintMedicalAchievement(certificateData: MedicalCertificate): Promise<string> {
    if (!this.state.smartAccountAddress) throw new Error('No smart account connected')

    // Create smart account instance (would be stored in state in real implementation)
    const smartAccount = await this.smartAccountService.createSmartAccount(this.state.smartAccountAddress)

    const txHash = await this.medicalNFTService.mintMedicalCertificate(smartAccount, certificateData)

    this.state.certificates.push(certificateData)

    return txHash
  }

  async shareMedicalData(delegateAddress: Address, allowedData: string[]): Promise<void> {
    if (!this.state.smartAccountAddress) throw new Error('No smart account connected')

    await this.delegationService.createDataSharingDelegation(
      this.state.smartAccountAddress,
      delegateAddress,
      allowedData
    )
  }

  private async loadUserProfile(address: Address): Promise<UserProfile> {
    // Implementation to load user profile from local storage or blockchain
    // For now, return a basic profile
    return {
      address,
      medicalHistory: this.state.certificates,
      achievements: [],
      consultationPermissions: this.state.delegations
    }
  }

  getState(): Web3State {
    return { ...this.state }
  }
}
