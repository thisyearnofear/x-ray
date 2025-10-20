import { createPublicClient, createWalletClient, http, type Address, custom } from 'viem'
import { monadTestnet } from './config'
import { DEPLOYED_CONTRACTS } from '../../contracts/config/MonadConfig'
import { MedicalAchievementNFTABI } from '../../contracts/abis/MedicalAchievementNFT'
import { MedicalPaymasterABI } from '../../contracts/abis/MedicalPaymaster'

/**
 * Contract Client for interacting with deployed medical contracts
 * @description Provides typed interfaces for MedicalAchievementNFT and MedicalPaymaster
 * @author X-RAY Medical Diagnostics Team
 */
export class ContractClient {
  private publicClient: any
  private walletClient: any
  // Add caching for frequently accessed data
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 30000 // 30 seconds
  
  constructor() {
    // Initialize clients
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http()
    })
    
    // Wallet client will be set when wallet is connected
    this.walletClient = null
  }
  
  /**
   * Initialize wallet client from browser extension
   */
  async initializeWallet() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available')
    }

    this.walletClient = createWalletClient({
      chain: monadTestnet,
      transport: custom(window.ethereum)
    })

    console.log('Contract client wallet initialized')
    return this.walletClient
  }
  
  /**
   * Set wallet client for write operations
   * @param walletClient Viem wallet client
   */
  setWalletClient(walletClient: any) {
    this.walletClient = walletClient
  }
  
  /**
   * Get cached data if available and not expired
   * @param key Cache key
   * @returns Cached data or null
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }
  
  /**
   * Set cached data
   * @param key Cache key
   * @param data Data to cache
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }
  
  /**
   * Clear expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key)
      }
    }
  }
  
  /**
   * Get MedicalAchievementNFT contract instance
   * @param account Optional account for write operations
   * @returns Contract instance with typed methods
   */
  getMedicalNFTContract(account?: Address) {
    return {
      address: DEPLOYED_CONTRACTS.medicalNFT as Address,
      abi: MedicalAchievementNFTABI,
      client: {
        public: this.publicClient,
        wallet: this.walletClient
      },
      account
    }
  }
  
  /**
   * Get MedicalPaymaster contract instance
   * @param account Optional account for write operations
   * @returns Contract instance with typed methods
   */
  getMedicalPaymasterContract(account?: Address) {
    return {
      address: DEPLOYED_CONTRACTS.paymaster as Address,
      abi: MedicalPaymasterABI,
      client: {
        public: this.publicClient,
        wallet: this.walletClient
      },
      account
    }
  }
  
  /**
   * Mint a medical achievement certificate
   * @param params Certificate parameters
   * @returns Transaction hash
   */
  async mintMedicalCertificate(params: {
    to: Address
    patientId: string
    diagnosis: string
    accuracy: bigint
    conditions: string[]
    tokenURI: string
  }, account: Address) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected')
    }
    
    // Clear expired cache entries
    this.cleanupCache()
    
    const contract = this.getMedicalNFTContract(account)
    
    return await this.walletClient.writeContract({
      address: contract.address,
      abi: MedicalAchievementNFTABI,
      functionName: 'mintCertificate',
      args: [
        params.to,
        params.patientId,
        params.diagnosis,
        params.accuracy,
        params.conditions,
        params.tokenURI
      ]
    })
  }
  
  /**
   * Get certificate details
   * @param tokenId Token ID of the certificate
   * @returns Certificate data
   */
  async getCertificate(tokenId: bigint) {
    const cacheKey = `certificate_${tokenId.toString()}`
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const contract = this.getMedicalNFTContract()
    
    const result = await this.publicClient.readContract({
      address: contract.address,
      abi: MedicalAchievementNFTABI,
      functionName: 'getCertificate',
      args: [tokenId]
    })
    
    this.setCachedData(cacheKey, result)
    return result
  }
  
  /**
   * Check if certificate exists
   * @param tokenId Token ID to check
   * @returns True if certificate exists
   */
  async certificateExists(tokenId: bigint) {
    const cacheKey = `certificate_exists_${tokenId.toString()}`
    const cached = this.getCachedData(cacheKey)
    if (cached !== null) {
      return cached
    }
    
    const contract = this.getMedicalNFTContract()
    
    const result = await this.publicClient.readContract({
      address: contract.address,
      abi: MedicalAchievementNFTABI,
      functionName: 'certificateExists',
      args: [tokenId]
    })
    
    this.setCachedData(cacheKey, result)
    return result
  }
  
  /**
   * Get total number of certificates
   * @returns Total certificate count
   */
  async getTotalCertificates() {
    const cacheKey = 'total_certificates'
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const contract = this.getMedicalNFTContract()
    
    const result = await this.publicClient.readContract({
      address: contract.address,
      abi: MedicalAchievementNFTABI,
      functionName: 'totalCertificates'
    })
    
    this.setCachedData(cacheKey, result)
    return result
  }
  
  /**
   * Authorize a contract to use the paymaster
   * @param contractAddress Address to authorize
   * @param account Owner account
   * @returns Transaction hash
   */
  async authorizeContract(contractAddress: Address, account: Address) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected')
    }
    
    // Clear cache when authorizing new contracts
    this.cache.clear()
    
    return await this.walletClient.writeContract({
      address: DEPLOYED_CONTRACTS.paymaster as Address,
      abi: MedicalPaymasterABI,
      functionName: 'authorizeContract',
      args: [contractAddress],
      account
    })
  }
  
  /**
   * Check if contract is authorized
   * @param contractAddress Address to check
   * @returns True if authorized
   */
  async isContractAuthorized(contractAddress: Address) {
    const cacheKey = `authorized_${contractAddress}`
    const cached = this.getCachedData(cacheKey)
    if (cached !== null) {
      return cached
    }
    
    const result = await this.publicClient.readContract({
      address: DEPLOYED_CONTRACTS.paymaster as Address,
      abi: MedicalPaymasterABI,
      functionName: 'isContractAuthorized',
      args: [contractAddress]
    })
    
    this.setCachedData(cacheKey, result)
    return result
  }
  
  /**
   * Get paymaster deposit balance
   * @returns Balance in wei
   */
  async getPaymasterDeposit() {
    const cacheKey = 'paymaster_deposit'
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const result = await this.publicClient.readContract({
      address: DEPLOYED_CONTRACTS.paymaster as Address,
      abi: MedicalPaymasterABI,
      functionName: 'getDeposit'
    })
    
    this.setCachedData(cacheKey, result)
    return result
  }
}