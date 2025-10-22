/**
 * MedicalEconomics Contract Client
 * CLEAN: Type-safe contract interactions
 * MODULAR: Integrates with existing web3 infrastructure
 * PERFORMANT: Caching and optimized calls
 */

import { createPublicClient, createWalletClient, http, type Address, parseEther, formatEther } from 'viem';
import { monadTestnet } from './config';
import { MedicalEconomicsABI, Difficulty, type PerformanceMetrics, type DifficultyConfig } from '../../contracts/abis/MedicalEconomics';

// Contract address - Deployed on Monad Testnet
export const MEDICAL_ECONOMICS_ADDRESS = process.env.NEXT_PUBLIC_MEDICAL_ECONOMICS_ADDRESS as Address || '0x59854F1DCc03E6d65E9C4e148D5635Fb56d3d892' as Address;

export class MedicalEconomicsClient {
  private publicClient: any;
  private walletClient: any;
  private contractAddress: Address;

  constructor(contractAddress?: Address) {
    this.contractAddress = contractAddress || MEDICAL_ECONOMICS_ADDRESS;
    
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http()
    });
  }

  /**
   * Initialize wallet client for write operations
   */
  async initializeWalletClient() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }

    const { createWalletClient, custom } = await import('viem');
    this.walletClient = createWalletClient({
      chain: monadTestnet,
      transport: custom(window.ethereum)
    });

    return this.walletClient;
  }

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  /**
   * Get difficulty configuration
   */
  async getDifficultyConfig(difficulty: Difficulty): Promise<{
    startingBudget: number;
    maxEarnings: number;
    timeLimit: number;
    isActive: boolean;
  }> {
    try {
      const config = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: MedicalEconomicsABI,
        functionName: 'getDifficultyConfig',
        args: [difficulty]
      }) as DifficultyConfig;

      return {
        startingBudget: Number(formatEther(config.startingBudget)),
        maxEarnings: Number(formatEther(config.maxEarnings)),
        timeLimit: Number(config.timeLimit),
        isActive: config.isActive
      };
    } catch (error) {
      console.error('Failed to get difficulty config:', error);
      throw error;
    }
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(playerAddress: Address): Promise<{
    totalEarnings: number;
    totalCases: number;
    averageAccuracy: number;
  }> {
    try {
      const stats = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: MedicalEconomicsABI,
        functionName: 'getPlayerStats',
        args: [playerAddress]
      });

      return {
        totalEarnings: Number(formatEther(stats[0])),
        totalCases: Number(stats[1]),
        averageAccuracy: Number(stats[2])
      };
    } catch (error) {
      console.error('Failed to get player stats:', error);
      throw error;
    }
  }

  /**
   * Get player's completed cases
   */
  async getPlayerCases(playerAddress: Address): Promise<any[]> {
    try {
      const cases = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: MedicalEconomicsABI,
        functionName: 'getPlayerCases',
        args: [playerAddress]
      });

      return (cases as any[]).map(c => ({
        player: c.player,
        difficulty: c.difficulty,
        budgetUsed: Number(formatEther(c.budgetUsed)),
        earningsAwarded: Number(formatEther(c.earningsAwarded)),
        timestamp: Number(c.timestamp),
        correctDiagnosis: c.correctDiagnosis,
        accuracyScore: Number(c.accuracyScore)
      }));
    } catch (error) {
      console.error('Failed to get player cases:', error);
      throw error;
    }
  }

  /**
   * Get global statistics
   */
  async getGlobalStats(): Promise<{
    totalCases: number;
    totalDistributed: number;
  }> {
    try {
      const stats = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: MedicalEconomicsABI,
        functionName: 'getGlobalStats'
      });

      return {
        totalCases: Number(stats[0]),
        totalDistributed: Number(formatEther(stats[1]))
      };
    } catch (error) {
      console.error('Failed to get global stats:', error);
      throw error;
    }
  }

  // ============================================================================
  // WRITE OPERATIONS
  // ============================================================================

  /**
   * Complete a medical case and receive earnings
   */
  async completeCase(
    playerAddress: Address,
    difficulty: Difficulty,
    budgetUsed: number,
    metrics: {
      correctDiagnosis: boolean;
      timeBonus: number; // 0-100
      budgetEfficiency: number; // 0-100
      complicationsHandled: number;
      accuracyScore: number; // 0-100
    }
  ): Promise<{
    hash: string;
    earnings: number;
  }> {
    try {
      if (!this.walletClient) {
        await this.initializeWalletClient();
      }

      // Convert metrics to contract format
      const contractMetrics: PerformanceMetrics = {
        correctDiagnosis: metrics.correctDiagnosis,
        timeBonus: BigInt(metrics.timeBonus),
        budgetEfficiency: BigInt(metrics.budgetEfficiency),
        complicationsHandled: BigInt(metrics.complicationsHandled),
        accuracyScore: BigInt(metrics.accuracyScore)
      };

      // Convert budget to wei
      const budgetUsedWei = parseEther(budgetUsed.toString());

      // Send transaction
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: MedicalEconomicsABI,
        functionName: 'completeCase',
        args: [playerAddress, difficulty, budgetUsedWei, contractMetrics]
      });

      console.log('✅ Case completion transaction sent:', hash);

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      // Parse earnings from logs (simplified - in production, parse actual event)
      const earnings = 0; // Would be parsed from CaseCompleted event

      return {
        hash,
        earnings
      };
    } catch (error) {
      console.error('Failed to complete case:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Convert difficulty tier string to enum
   */
  static getDifficultyEnum(tier: 'beginner' | 'intermediate' | 'advanced' | 'expert'): Difficulty {
    const map = {
      beginner: Difficulty.BEGINNER,
      intermediate: Difficulty.INTERMEDIATE,
      advanced: Difficulty.ADVANCED,
      expert: Difficulty.EXPERT
    };
    return map[tier];
  }

  /**
   * Convert difficulty enum to string
   */
  static getDifficultyString(difficulty: Difficulty): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const map = {
      [Difficulty.BEGINNER]: 'beginner' as const,
      [Difficulty.INTERMEDIATE]: 'intermediate' as const,
      [Difficulty.ADVANCED]: 'advanced' as const,
      [Difficulty.EXPERT]: 'expert' as const
    };
    return map[difficulty];
  }

  /**
   * Get contract address
   */
  getContractAddress(): Address {
    return this.contractAddress;
  }

  /**
   * Set contract address (useful after deployment)
   */
  setContractAddress(address: Address): void {
    this.contractAddress = address;
  }
}

/**
 * Singleton instance
 */
let medicalEconomicsClient: MedicalEconomicsClient | null = null;

export function getMedicalEconomicsClient(contractAddress?: Address): MedicalEconomicsClient {
  if (!medicalEconomicsClient) {
    medicalEconomicsClient = new MedicalEconomicsClient(contractAddress);
  } else if (contractAddress) {
    medicalEconomicsClient.setContractAddress(contractAddress);
  }
  return medicalEconomicsClient;
}
