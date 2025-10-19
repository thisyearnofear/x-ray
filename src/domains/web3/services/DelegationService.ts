import { Address } from 'viem'
import { DelegationRequest } from '../types'

export class DelegationService {
  // ENHANCED: Core delegation functionality following ENHANCEMENT FIRST principle
  // TODO: Upgrade to full MetaMask delegation toolkit when API stabilizes

  async createMedicalConsultationDelegation(
    delegatorAddress: Address,
    delegateAddress: Address,
    expiry?: number
  ): Promise<any> {
    // Create delegation object for AI consultation permissions
    // This demonstrates the concept and can be upgraded to full toolkit integration
    const delegation = {
      delegator: delegatorAddress,
      delegate: delegateAddress,
      permissions: ['consultAI', 'getMedicalAnalysis'],
      expiry: expiry || Math.floor(Date.now() / 1000) + 3600, // 1 hour default
      type: 'medical-consultation',
      status: 'active',
      created: Date.now()
    }

    // Store delegation locally (in production, this would be onchain)
    this.storeDelegation(delegation)

    return delegation
  }

  async createDataSharingDelegation(
    delegatorAddress: Address,
    delegateAddress: Address,
    allowedData: string[],
    expiry?: number
  ): Promise<any> {
    // Create delegation for medical data sharing
    const delegation = {
      delegator: delegatorAddress,
      delegate: delegateAddress,
      permissions: ['shareMedicalData'],
      allowedData: allowedData,
      expiry: expiry || Math.floor(Date.now() / 1000) + 86400, // 24 hours default
      type: 'data-sharing',
      status: 'active',
      created: Date.now()
    }

    this.storeDelegation(delegation)

    return delegation
  }

  async revokeDelegation(delegationId: string): Promise<boolean> {
    // Remove delegation from local storage
    const delegations = this.getStoredDelegations()
    const updatedDelegations = delegations.filter(d => d.id !== delegationId)
    localStorage.setItem('xrai_delegations', JSON.stringify(updatedDelegations))
    return true
  }

  async getActiveDelegations(accountAddress: Address): Promise<DelegationRequest[]> {
    // Get active delegations for an account
    const delegations = this.getStoredDelegations()
    return delegations
      .filter(d => d.delegator === accountAddress && d.status === 'active')
      .map(d => ({
        delegateAddress: d.delegate,
        permissions: d.permissions,
        expiry: d.expiry
      }))
  }

  private storeDelegation(delegation: any): void {
    const delegations = this.getStoredDelegations()
    delegation.id = `delegation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    delegations.push(delegation)
    localStorage.setItem('xrai_delegations', JSON.stringify(delegations))
  }

  private getStoredDelegations(): any[] {
    try {
      const stored = localStorage.getItem('xrai_delegations')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
}
