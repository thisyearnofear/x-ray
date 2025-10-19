import { createPublicClient, createWalletClient, http, type Address } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit'
import { monadTestnet, BUNDLER_URL } from './config'

export class SmartAccountService {
  private publicClient: any
  private bundlerClient: any

  constructor() {
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http()
    })

    this.bundlerClient = createBundlerClient({
      client: this.publicClient,
      transport: http(BUNDLER_URL)
    })
  }

  async createSmartAccount(ownerAddress: Address, implementation: Implementation = Implementation.Hybrid): Promise<any> {
    // ENHANCED: Create smart account that demonstrates ERC-4337 concepts
    // TODO: Integrate with full MetaMask toolkit when API stabilizes
    const account = {
      address: ownerAddress, // Use owner address as smart account for demo
      ownerAddress,
      implementation,
      isDeployed: false,
      type: 'smart-account',
      // ERC-4337 compatible interface
      signUserOperation: async (userOp: any) => {
        // Simulate signing (in production, this would use proper signing)
        return `0x${Date.now().toString(16)}`
      }
    }

    console.log('Created smart account:', account)
    return account
  }

  async sendUserOperation(account: any, calls: any[]) {
    try {
      const userOpHash = await this.bundlerClient.sendUserOperation({
        account,
        calls
      })

      return userOpHash
    } catch (error) {
      console.error('Failed to send user operation:', error)
      throw error
    }
  }

  async waitForUserOperationReceipt(userOpHash: string) {
    try {
      const receipt = await this.bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash as `0x${string}`
      })

      return receipt
    } catch (error) {
      console.error('Failed to get user operation receipt:', error)
      throw error
    }
  }

  getPublicClient() {
    return this.publicClient
  }

  getBundlerClient() {
    return this.bundlerClient
  }
}
