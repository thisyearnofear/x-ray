import { type Address, type Hex, encodeFunctionData } from 'viem'
import { SmartAccountService } from './smart-account'
import { DEPLOYED_CONTRACTS } from '../../contracts/config/MonadConfig'
import { MedicalPaymasterABI } from '../../contracts/abis/MedicalPaymaster'

/**
 * Paymaster Integration Service
 * @description Handles gasless transactions using ERC-4337 Paymaster
 * @author X-RAY Medical Diagnostics Team
 */
export class PaymasterIntegrationService {
  private smartAccountService: SmartAccountService

  constructor(smartAccountService: SmartAccountService) {
    this.smartAccountService = smartAccountService
  }

  /**
   * Execute a gasless medical consultation
   * @param params Consultation parameters
   * @returns User operation hash
   */
  async executeGaslessConsultation(params: {
    userAddress: Address
    targetContract: Address
    functionData: Hex
    value?: bigint
  }): Promise<string> {
    const { userAddress, targetContract, functionData, value = BigInt(0) } = params

    try {
      // Get or create smart account for user
      const smartAccount = await this.smartAccountService.createSmartAccount(userAddress)
      
      console.log('Executing gasless consultation:', {
        smartAccount: smartAccount.address,
        target: targetContract,
        paymaster: DEPLOYED_CONTRACTS.paymaster
      })

      // Prepare user operation with paymaster data
      const userOp = {
        sender: smartAccount.address,
        callData: functionData,
        paymasterAndData: this.encodePaymasterData()
      }

      // Send user operation through bundler
      const bundlerClient = this.smartAccountService.getBundlerClient()
      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [{
          to: targetContract,
          data: functionData,
          value
        }]
      })

      console.log('Gasless transaction submitted:', userOpHash)
      return userOpHash
    } catch (error) {
      console.error('Failed to execute gasless consultation:', error)
      throw error
    }
  }

  /**
   * Execute gasless NFT minting
   * @param params Minting parameters
   * @returns User operation hash
   */
  async executeGaslessMint(params: {
    userAddress: Address
    to: Address
    patientId: string
    diagnosis: string
    accuracy: bigint
    conditions: string[]
    tokenURI: string
  }): Promise<string> {
    const { userAddress, ...mintParams } = params

    try {
      // Encode mint function call
      const functionData = encodeFunctionData({
        abi: [{
          name: 'mintCertificate',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'patientId', type: 'string' },
            { name: 'diagnosis', type: 'string' },
            { name: 'accuracy', type: 'uint256' },
            { name: 'conditions', type: 'string[]' },
            { name: 'tokenURI', type: 'string' }
          ],
          outputs: [{ name: 'tokenId', type: 'uint256' }]
        }],
        functionName: 'mintCertificate',
        args: [
          mintParams.to,
          mintParams.patientId,
          mintParams.diagnosis,
          mintParams.accuracy,
          mintParams.conditions,
          mintParams.tokenURI
        ]
      }) as Hex

      return await this.executeGaslessConsultation({
        userAddress,
        targetContract: DEPLOYED_CONTRACTS.medicalNFT as Address,
        functionData
      })
    } catch (error) {
      console.error('Failed to execute gasless mint:', error)
      throw error
    }
  }

  /**
   * Check if user has remaining gasless transaction quota
   * @param userAddress User's address
   * @returns Remaining quota information
   */
  async checkGaslessQuota(userAddress: Address): Promise<{
    used: bigint
    remaining: bigint
    limit: bigint
  }> {
    try {
      const publicClient = this.smartAccountService.getPublicClient()
      
      const sponsoredGas = await publicClient.readContract({
        address: DEPLOYED_CONTRACTS.paymaster as Address,
        abi: MedicalPaymasterABI,
        functionName: 'getSponsoredGas',
        args: [userAddress]
      }) as bigint

      const maxDaily = BigInt('100000000000000000') // 0.1 ETH from contract

      return {
        used: sponsoredGas,
        remaining: maxDaily - sponsoredGas,
        limit: maxDaily
      }
    } catch (error) {
      console.error('Failed to check gasless quota:', error)
      throw error
    }
  }

  /**
   * Encode paymaster data for user operation
   * @returns Encoded paymaster data
   */
  private encodePaymasterData(): Hex {
    // Format: paymasterAddress + paymasterVerificationGasLimit + paymasterPostOpGasLimit + paymasterData
    const paymasterAddress = DEPLOYED_CONTRACTS.paymaster as Address
    
    // For simplicity, we'll use the paymaster address
    // In production, you'd include gas limits and additional data
    return paymasterAddress as Hex
  }

  /**
   * Wait for user operation receipt
   * @param userOpHash User operation hash
   * @returns Receipt
   */
  async waitForUserOpReceipt(userOpHash: string) {
    return await this.smartAccountService.waitForUserOperationReceipt(userOpHash)
  }
}