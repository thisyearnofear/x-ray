import { type Address } from 'viem'
import { SmartAccountService } from './smart-account'
import { DelegationService } from './delegation'
import { ContractClient } from './contract-client'
import { PaymasterIntegrationService } from './paymaster-integration'

export interface Web3State {
  isConnected: boolean
  address?: Address
  smartAccount?: any
  delegations: any[]
  chainId?: number
  gaslessEnabled?: boolean
}

export class Web3Facade {
  private smartAccountService: SmartAccountService
  private delegationService: DelegationService
  private contractClient: ContractClient
  private paymasterService: PaymasterIntegrationService
  private state: Web3State

  constructor() {
    this.smartAccountService = new SmartAccountService()
    this.delegationService = new DelegationService(this.smartAccountService)
    this.contractClient = new ContractClient()
    this.paymasterService = new PaymasterIntegrationService(this.smartAccountService)

    this.state = {
      isConnected: false,
      delegations: [],
      gaslessEnabled: false
    }
  }

  async connectWallet(): Promise<Web3State> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0] as Address

      // Initialize wallet client first
      await this.smartAccountService.initializeWalletClient()

      // Create smart account with proper configuration
      const smartAccount = await this.smartAccountService.createSmartAccount(address)
      
      // Initialize contract client with wallet
      await this.contractClient.initializeWallet()

      this.state = {
        ...this.state,
        isConnected: true,
        address,
        smartAccount,
        chainId: 10143 // Monad testnet
      }

      console.log('Wallet connected successfully:', {
        address,
        smartAccountAddress: smartAccount.address,
        chainId: 10143
      })

      return this.state
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  async disconnectWallet(): Promise<void> {
    this.state = {
      isConnected: false,
      delegations: []
    }
  }

  async createMedicalConsultationDelegation(delegateAddress: Address) {
    if (!this.state.address) {
      throw new Error('Wallet not connected')
    }

    // Get wallet client for signing
    const walletClient = this.smartAccountService.getWalletClient()
    if (!walletClient) {
      throw new Error('Wallet client not initialized')
    }

    const delegation = await this.delegationService.createMedicalConsultationDelegation({
      delegator: this.state.address,
      delegate: delegateAddress,
      expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      walletClient
    })

    this.state.delegations.push(delegation)
    return delegation
  }

  async createDataSharingDelegation(delegateAddress: Address, allowedData: string[]) {
    if (!this.state.address) {
      throw new Error('Wallet not connected')
    }

    // Get wallet client for signing
    const walletClient = this.smartAccountService.getWalletClient()
    if (!walletClient) {
      throw new Error('Wallet client not initialized')
    }

    const delegation = await this.delegationService.createDataSharingDelegation({
      delegator: this.state.address,
      delegate: delegateAddress,
      allowedData,
      expiry: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      walletClient
    })

    this.state.delegations.push(delegation)
    return delegation
  }

  async executeDelegatedAction(action: { to: Address; data: string; value?: bigint }) {
    if (!this.state.smartAccount) {
      throw new Error('Smart account not available')
    }

    // Find active delegation for this action
    const activeDelegation = this.state.delegations.find(d =>
      d.status === 'active' && Date.now() / 1000 < d.expiry
    )

    if (!activeDelegation) {
      throw new Error('No active delegation found')
    }

    return await this.delegationService.executeDelegatedAction(activeDelegation, action)
  }

  async executeGaslessTransaction(action: {
    targetContract: Address
    functionData: `0x${string}`
    value?: bigint
  }) {
    if (!this.state.address) {
      throw new Error('Wallet not connected')
    }

    return await this.paymasterService.executeGaslessConsultation({
      userAddress: this.state.address,
      ...action
    })
  }

  async mintCertificateGasless(params: {
    to: Address
    patientId: string
    diagnosis: string
    accuracy: bigint
    conditions: string[]
    tokenURI: string
  }) {
    if (!this.state.address) {
      throw new Error('Wallet not connected')
    }

    return await this.paymasterService.executeGaslessMint({
      userAddress: this.state.address,
      ...params
    })
  }

  async checkGaslessQuota() {
    if (!this.state.address) {
      throw new Error('Wallet not connected')
    }

    return await this.paymasterService.checkGaslessQuota(this.state.address)
  }

  getState(): Web3State {
    return { ...this.state }
  }

  getSmartAccountService(): SmartAccountService {
    return this.smartAccountService
  }

  getDelegationService(): DelegationService {
    return this.delegationService
  }
  
  getContractClient(): ContractClient {
    return this.contractClient
  }

  getPaymasterService(): PaymasterIntegrationService {
    return this.paymasterService
  }
}
