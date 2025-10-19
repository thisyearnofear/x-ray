import { type Address } from 'viem'
import { SmartAccountService } from './smart-account'
import { DelegationService } from './delegation'

export interface Web3State {
  isConnected: boolean
  address?: Address
  smartAccount?: any
  delegations: any[]
  chainId?: number
}

export class Web3Facade {
  private smartAccountService: SmartAccountService
  private delegationService: DelegationService
  private state: Web3State

  constructor() {
    this.smartAccountService = new SmartAccountService()
    this.delegationService = new DelegationService(this.smartAccountService)

    this.state = {
      isConnected: false,
      delegations: []
    }
  }

  async connectWallet(): Promise<Web3State> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0] as Address

      // Create smart account
      const smartAccount = await this.smartAccountService.createSmartAccount(address)

      this.state = {
        ...this.state,
        isConnected: true,
        address,
        smartAccount,
        chainId: 10143 // Monad testnet
      }

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

    const delegation = await this.delegationService.createMedicalConsultationDelegation({
      delegator: this.state.address,
      delegate: delegateAddress,
      expiry: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    })

    this.state.delegations.push(delegation)
    return delegation
  }

  async createDataSharingDelegation(delegateAddress: Address, allowedData: string[]) {
    if (!this.state.address) {
      throw new Error('Wallet not connected')
    }

    const delegation = await this.delegationService.createDataSharingDelegation({
      delegator: this.state.address,
      delegate: delegateAddress,
      allowedData,
      expiry: Math.floor(Date.now() / 1000) + 86400 // 24 hours
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

  getState(): Web3State {
    return { ...this.state }
  }

  getSmartAccountService(): SmartAccountService {
    return this.smartAccountService
  }

  getDelegationService(): DelegationService {
    return this.delegationService
  }
}
