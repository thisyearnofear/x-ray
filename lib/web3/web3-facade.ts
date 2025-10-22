import { type Address } from 'viem'
import { SmartAccountService } from './smart-account'
import { DelegationService } from './delegation'
import { ContractClient } from './contract-client'
import { PaymasterIntegrationService } from './paymaster-integration'
import { MetaMaskSmartAccount } from '../../src/components/MetaMaskSmartAccount'

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
  private metaMaskSmartAccount: MetaMaskSmartAccount
  private state: Web3State

  constructor() {
    this.smartAccountService = new SmartAccountService()
    this.delegationService = new DelegationService(this.smartAccountService)
    this.contractClient = new ContractClient()
    this.paymasterService = new PaymasterIntegrationService(this.smartAccountService)
    
    // Defer instantiation to client-side
    this.metaMaskSmartAccount = {} as MetaMaskSmartAccount;

    // Restore persisted state only on client
    if (typeof window !== 'undefined') {
      const persistedState = this.loadPersistedState()
      this.state = persistedState || {
        isConnected: false,
        delegations: [],
        gaslessEnabled: false
      }
    } else {
      this.state = {
        isConnected: false,
        delegations: [],
        gaslessEnabled: false
      }
    }
  }

  async connectWallet(): Promise<Web3State> {
    try {
      // Instantiate on client-side
      if (!this.metaMaskSmartAccount.initializeSmartAccount) {
        this.metaMaskSmartAccount = new MetaMaskSmartAccount();
      }

      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask to use onchain features.')
      }

      // Request account access - this must be triggered by user interaction
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0] as Address

      if (!address) {
        throw new Error('No wallet address found. Please unlock your wallet and try again.')
      }

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

      this.persistState()
      return this.state
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      
      // Provide user-friendly error messages
      if (error.code === 4001) {
        throw new Error('Wallet connection rejected by user. Please click "Connect Wallet" to try again.')
      } else if (error.message?.includes('signMessage')) {
        throw new Error('Wallet connection failed. Please ensure you have a compatible wallet installed and unlocked.')
      } else {
        throw new Error(`Wallet connection failed: ${error.message || 'Unknown error'}`)
      }
    }
  }

  async disconnectWallet(): Promise<void> {
    this.state = {
      isConnected: false,
      delegations: []
    }
    this.persistState()
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

  getWalletClient() {
    return this.smartAccountService.getWalletClient()
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

  async getMonBalanceForAddress(address: Address): Promise<number> {
    // Use the meta mask smart account to get MON balance
    try {
      return await this.metaMaskSmartAccount.getMonBalance(address);
    } catch (error) {
      console.error('❌ Failed to get MON balance:', error);
      // Fallback to mock balance if real balance check fails
      return 0;
    }
  }

  getPaymasterService(): PaymasterIntegrationService {
    return this.paymasterService
  }

  async getMonBalance(): Promise<bigint> {
    if (!this.state.address) {
      throw new Error('Wallet not connected')
    }
    return this.smartAccountService.getBalance(this.state.address)
  }

  // Persistence methods
  private persistState(): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stateToPersist = {
        ...this.state,
        smartAccount: undefined // Don't persist smart account object
      }
      localStorage.setItem('xrai_wallet_state', JSON.stringify(stateToPersist))
    } catch (error) {
      console.warn('Failed to persist wallet state:', error)
    }
  }

  private loadPersistedState(): Web3State | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const persisted = localStorage.getItem('xrai_wallet_state')
      if (persisted) {
        const parsed = JSON.parse(persisted)
        // Validate the persisted state
        if (parsed.isConnected && parsed.address) {
          return parsed as Web3State
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted wallet state:', error)
    }
    return null
  }
}
