import { type Address } from 'viem'
import { SmartAccountService } from './smart-account'

export interface DelegationOptions {
  delegator: Address
  delegate: Address
  permissions?: string[]
  expiry?: number
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
}

export class DelegationService {
  private smartAccountService: SmartAccountService
  private delegations: Map<string, Delegation> = new Map()

  constructor(smartAccountService: SmartAccountService) {
    this.smartAccountService = smartAccountService
  }

  async createMedicalConsultationDelegation(options: DelegationOptions): Promise<Delegation> {
    const { delegator, delegate, permissions = ['consultAI', 'getMedicalAnalysis'], expiry } = options

    const delegation: Delegation = {
      id: `delegation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      delegator,
      delegate,
      permissions,
      type: 'medical-consultation',
      status: 'active',
      created: Date.now(),
      expiry
    }

    this.delegations.set(delegation.id, delegation)

    // Simulate onchain storage (in production, this would be a smart contract call)
    console.log('Created medical consultation delegation:', delegation)

    return delegation
  }

  async createDataSharingDelegation(options: DelegationOptions & { allowedData: string[] }): Promise<Delegation> {
    const { delegator, delegate, allowedData, expiry } = options

    const delegation: Delegation = {
      id: `delegation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      delegator,
      delegate,
      permissions: ['shareMedicalData'],
      allowedData,
      type: 'data-sharing',
      status: 'active',
      created: Date.now(),
      expiry
    }

    this.delegations.set(delegation.id, delegation)

    // Simulate onchain storage
    console.log('Created data sharing delegation:', delegation)

    return delegation
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
      // Create smart account for the delegator
      const smartAccount = await this.smartAccountService.createSmartAccount(delegation.delegator)

      // Send user operation with delegation (simulated)
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
