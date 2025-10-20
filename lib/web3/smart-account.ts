import { createPublicClient, createWalletClient, http, type Address, custom } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit'
import { monadTestnet, BUNDLER_URL } from './config'

export class SmartAccountService {
  private publicClient: any
  private bundlerClient: any
  private walletClient: any

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

  async initializeWalletClient() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available')
    }

    this.walletClient = createWalletClient({
      chain: monadTestnet,
      transport: custom(window.ethereum)
    })

    return this.walletClient
  }

  async createSmartAccount(ownerAddress: Address, implementation: Implementation = Implementation.Hybrid): Promise<any> {
    try {
      // Ensure wallet client is initialized
      if (!this.walletClient) {
        await this.initializeWalletClient()
      }

      // Create actual MetaMask smart account using the delegation toolkit
      const account = await toMetaMaskSmartAccount({
        client: this.publicClient,
        implementation,
        deploySalt: `0x${Date.now().toString(16).padStart(64, '0')}` as `0x${string}`,
        owners: [ownerAddress]
      })

      console.log('Created MetaMask smart account:', {
        address: account.address,
        implementation,
        owner: ownerAddress
      })
      
      return account
    } catch (error) {
      console.error('Failed to create MetaMask smart account:', error)
      throw error
    }
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

  getWalletClient() {
    return this.walletClient
  }
}
