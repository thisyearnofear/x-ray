import { type Address, type Hex, keccak256, toHex } from 'viem'
import { SmartAccountService } from './smart-account'
import { createDelegation, signDelegation, getDelegationHashOffchain } from '@metamask/delegation-toolkit'
import { getDeleGatorEnvironment } from '@metamask/delegation-toolkit'
import { monadTestnet } from './config'

export interface DelegationOptions {
  delegator: Address
  delegate: Address
  permissions?: string[]
  expiry?: number
  walletClient?: any
}

export interface DelegationRequest {
  delegateAddress: Address
  permissions: string[]
  expiry?: number
}

export interface Delegation {
  id: string
  delegator: Address
  delegate: Address
  permissions: string[]
  allowedData?: string[]
  type: 'medical-consultation' | 'data-sharing'
  status: 'active' | 'revoked'
  created: number
  expiry?: number
  signature?: string
  contractAddress?: Address
  delegationHash?: string
}

export class DelegationService {
  private smartAccountService: SmartAccountService
  private delegations: Map<string, Delegation> = new Map()
  private environment: any

  constructor(smartAccountService: SmartAccountService) {
    this.smartAccountService = smartAccountService
    // Initialize DeleGator environment for Monad testnet
    this.environment = getDeleGatorEnvironment({
      chain: monadTestnet,
      version: '0.1.0' // PREFERRED_VERSION from the toolkit
    })
  }

  async createMedicalConsultationDelegation(options: DelegationOptions): Promise<Delegation> {
    const { delegator, delegate, permissions = ['consultAI', 'getMedicalAnalysis'], expiry, walletClient } = options

    try {
      if (!walletClient) {
        throw new Error('Wallet client required for signing delegation')
      }

      // Generate function selectors for medical consultation functions
      const functionSelectors = [
        keccak256(toHex('consultAI(bytes)')).slice(0, 10) as Hex,
        keccak256(toHex('analyzeCase(uint256)')).slice(0, 10) as Hex,
        keccak256(toHex('submitDiagnosis(string)')).slice(0, 10) as Hex
      ]

      // Create actual ERC-7710 delegation using MetaMask toolkit
      const delegation = createDelegation({
        environment: this.environment,
        from: delegator,
        to: delegate,
        scope: {
          type: 'functionCall',
          targets: [delegator], // Allow calls to delegator's contracts
          selectors: functionSelectors
        },
        caveats: [
          // Add limitations to the delegation
          {
            type: 'limitedCalls',
            limit: 100 // Limit to 100 calls
          }
        ],
        salt: `0x${Date.now().toString(16).padStart(64, '0')}` as `0x${string}`
      })

      // Get delegation hash for off-chain tracking
      const delegationHash = getDelegationHashOffchain(delegation)
      
      // Sign the delegation with the user's wallet
      let signature: Hex | undefined
      try {
        const message = delegationHash
        signature = await walletClient.signMessage({
          account: delegator,
          message
        }) as Hex
        console.log('Delegation signed successfully:', signature)
      } catch (signError) {
        console.warn('Failed to sign delegation, proceeding without signature:', signError)
      }
      
      const delegationData: Delegation = {
        id: `delegation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        delegator,
        delegate,
        permissions,
        type: 'medical-consultation',
        status: 'active',
        created: Date.now(),
        expiry,
        delegationHash,
        signature
      }

      this.delegations.set(delegationData.id, delegationData)
      console.log('Created medical consultation delegation:', {
        id: delegationData.id,
        delegator,
        delegate,
        delegationHash,
        hasSig: !!signature
      })

      return delegationData
    } catch (error) {
      console.error('Failed to create medical consultation delegation:', error)
      throw error
    }
  }

  async createDataSharingDelegation(options: DelegationOptions & { allowedData: string[]; walletClient?: any }): Promise<Delegation> {
    const { delegator, delegate, allowedData, expiry, walletClient } = options

    try {
      if (!walletClient) {
        throw new Error('Wallet client required for signing delegation')
      }

      // Generate function selectors for data sharing functions
      const functionSelectors = [
        keccak256(toHex('shareMedicalData(bytes)')).slice(0, 10) as Hex,
        keccak256(toHex('getMedicalHistory(address)')).slice(0, 10) as Hex,
        keccak256(toHex('updateMedicalRecord(string)')).slice(0, 10) as Hex
      ]

      // Create actual ERC-7710 delegation for data sharing
      const delegation = createDelegation({
        environment: this.environment,
        from: delegator,
        to: delegate,
        scope: {
          type: 'functionCall',
          targets: [delegator], // Allow calls to delegator's contracts
          selectors: functionSelectors
        },
        caveats: [
          // Add limitations to the delegation
          {
            type: 'limitedCalls',
            limit: 50 // Limit to 50 calls
          }
        ],
        salt: `0x${Date.now().toString(16).padStart(64, '0')}` as `0x${string}`
      })

      // Get delegation hash for off-chain tracking
      const delegationHash = getDelegationHashOffchain(delegation)
      
      // Sign the delegation with the user's wallet
      let signature: Hex | undefined
      try {
        const message = delegationHash
        signature = await walletClient.signMessage({
          account: delegator,
          message
        }) as Hex
        console.log('Data sharing delegation signed successfully')
      } catch (signError) {
        console.warn('Failed to sign delegation, proceeding without signature:', signError)
      }
      
      const delegationData: Delegation = {
        id: `delegation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        delegator,
        delegate,
        permissions: ['shareMedicalData'],
        allowedData,
        type: 'data-sharing',
        status: 'active',
        created: Date.now(),
        expiry,
        delegationHash,
        signature
      }

      this.delegations.set(delegationData.id, delegationData)
      console.log('Created data sharing delegation:', {
        id: delegationData.id,
        delegator,
        delegate,
        delegationHash,
        hasSig: !!signature
      })

      return delegationData
    } catch (error) {
      console.error('Failed to create data sharing delegation:', error)
      throw error
    }
  }

  async executeDelegatedAction(
    delegation: Delegation,
    action: {
      to: Address
      data: string
      value?: bigint
    }
  ): Promise<string> {
    // Check if delegation is still active
    if (delegation.status !== 'active') {
      throw new Error('Delegation is not active')
    }

    if (delegation.expiry && Date.now() / 1000 > delegation.expiry) {
      throw new Error('Delegation has expired')
    }

    try {
      // Create smart account for the delegator using MetaMask toolkit
      const smartAccount = await this.smartAccountService.createSmartAccount(delegation.delegator)

      // Send user operation with delegation
      const userOpHash = await this.smartAccountService.sendUserOperation(smartAccount, [{
        to: action.to,
        data: action.data as `0x${string}`,
        value: action.value || BigInt(0)
      }])

      return userOpHash
    } catch (error) {
      console.error('Failed to execute delegated action:', error)
      throw error
    }
  }

  async revokeDelegation(delegationId: string): Promise<boolean> {
    const delegation = this.delegations.get(delegationId)
    if (!delegation) {
      throw new Error('Delegation not found')
    }

    delegation.status = 'revoked'
    this.delegations.set(delegationId, delegation)

    console.log('Revoked delegation:', delegationId)
    return true
  }

  async getActiveDelegations(accountAddress: Address): Promise<DelegationRequest[]> {
    const activeDelegations = Array.from(this.delegations.values())
      .filter(d => d.delegator === accountAddress && d.status === 'active')
      .filter(d => !d.expiry || Date.now() / 1000 <= d.expiry)

    return activeDelegations.map(d => ({
      delegateAddress: d.delegate,
      permissions: d.permissions,
      expiry: d.expiry
    }))
  }
}
