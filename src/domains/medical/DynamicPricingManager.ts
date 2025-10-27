/**
 * Dynamic Pricing Manager
 * ENHANCEMENT: Time and patient state-based medical action pricing
 * CLEAN: Single responsibility - adjust costs based on game context
 * MODULAR: Integrates with BudgetManager and PatientState
 * 
 * Core Principles:
 * - Dynamic pricing based on time pressure and patient state
 * - Efficiency rewards for budget-conscious players
 * - Real-time cost adjustments during gameplay
 */

import { MedicalAction } from './types';
import { PatientState } from './types';

export interface PricingModifiers {
  timePressure: number; // 0.5-2.0 multiplier based on time remaining
  patientCriticality: number; // 1.0-3.0 multiplier based on patient state
  efficiencyBonus: number; // 0.5-1.0 discount for budget efficiency
  streakMultiplier: number; // 0.9-0.7 discount for consecutive cases
  specializationBonus: number; // 0.8-1.0 discount for specialization expertise
  delegationDiscount: number; // 0.9-0.8 discount for smart account delegation
}

export interface DynamicPricingConfig {
  enableTimePressurePricing: boolean;
  enableCriticalityPricing: boolean;
  enableEfficiencyBonuses: boolean;
  enableStreakBonuses: boolean;
  enableSpecializationBonuses: boolean;
  enableDelegationDiscounts: boolean;
}

export class DynamicPricingManager {
  private config: DynamicPricingConfig;
  private currentStreak: number = 0;
  private specializationLevel: number = 0; // 0-3 (beginner to expert)
  private hasDelegation: boolean = false;
  private baseEfficiency: number = 100; // 0-100 scale

  constructor(config?: Partial<DynamicPricingConfig>) {
    this.config = {
      enableTimePressurePricing: true,
      enableCriticalityPricing: true,
      enableEfficiencyBonuses: true,
      enableStreakBonuses: true,
      enableSpecializationBonuses: true,
      enableDelegationDiscounts: true,
      ...config
    };
  }

  // ============================================================================
  // PRICING CALCULATION
  // ============================================================================

  /**
   * Calculate dynamic price for a medical action
   * MODULAR: Applies all enabled modifiers
   */
  calculateDynamicPrice(
    baseAction: MedicalAction,
    timeRemaining: number,
    timeLimit: number,
    patientState: PatientState,
    budgetEfficiency: number = 100
  ): number {
    let price = baseAction.cost;
    
    // Apply time pressure modifier
    if (this.config.enableTimePressurePricing) {
      const timeModifier = this.calculateTimePressureModifier(timeRemaining, timeLimit);
      price *= timeModifier;
    }
    
    // Apply patient criticality modifier
    if (this.config.enableCriticalityPricing) {
      const criticalityModifier = this.calculateCriticalityModifier(patientState);
      price *= criticalityModifier;
    }
    
    // Apply efficiency bonus
    if (this.config.enableEfficiencyBonuses) {
      const efficiencyModifier = this.calculateEfficiencyModifier(budgetEfficiency);
      price *= efficiencyModifier;
    }
    
    // Apply streak bonus
    if (this.config.enableStreakBonuses) {
      const streakModifier = this.calculateStreakModifier(this.currentStreak);
      price *= streakModifier;
    }
    
    // Apply specialization bonus
    if (this.config.enableSpecializationBonuses) {
      const specializationModifier = this.calculateSpecializationModifier(this.specializationLevel);
      price *= specializationModifier;
    }
    
    // Apply delegation discount
    if (this.config.enableDelegationDiscounts && this.hasDelegation) {
      const delegationModifier = this.calculateDelegationModifier();
      price *= delegationModifier;
    }
    
    // Ensure price doesn't go below a minimum threshold (10% of base cost)
    return Math.max(price, baseAction.cost * 0.1);
  }

  /**
   * Calculate time pressure modifier
   * CLEAN: Simple time-based pricing
   */
  private calculateTimePressureModifier(timeRemaining: number, timeLimit: number): number {
    const timeElapsed = timeLimit - timeRemaining;
    const timeRatio = timeElapsed / timeLimit;
    
    // Exponential increase as time runs out
    if (timeRatio < 0.3) return 1.0; // Normal pricing for first 30%
    if (timeRatio < 0.6) return 1.2; // 20% increase for 30-60%
    if (timeRatio < 0.8) return 1.5; // 50% increase for 60-80%
    return 2.0; // Double price for last 20%
  }

  /**
   * Calculate patient criticality modifier
   * IMMERSIVE: Higher costs for critical patients
   */
  private calculateCriticalityModifier(patientState: PatientState): number {
    const state = patientState.getState();
    
    switch (state.criticality) {
      case 'terminal':
        return 3.0; // Triple cost for terminal patients
      case 'critical':
        return 2.0; // Double cost for critical patients
      case 'deteriorating':
        return 1.5; // 50% increase for deteriorating patients
      case 'stable':
      default:
        return 1.0; // Normal pricing for stable patients
    }
  }

  /**
   * Calculate efficiency modifier
   * REWARD: Discounts for budget-conscious players
   */
  private calculateEfficiencyModifier(budgetEfficiency: number): number {
    // Higher efficiency = lower costs
    if (budgetEfficiency >= 90) return 0.7; // 30% discount for excellent efficiency
    if (budgetEfficiency >= 75) return 0.8; // 20% discount for good efficiency
    if (budgetEfficiency >= 60) return 0.9; // 10% discount for fair efficiency
    return 1.0; // No discount for poor efficiency
  }

  /**
   * Calculate streak modifier
   * INCENTIVE: Discounts for consecutive successful cases
   */
  private calculateStreakModifier(streak: number): number {
    if (streak >= 10) return 0.7; // 30% discount for 10+ streak
    if (streak >= 5) return 0.8; // 20% discount for 5+ streak
    if (streak >= 2) return 0.9; // 10% discount for 2+ streak
    return 1.0; // No discount for no streak
  }

  /**
   * Calculate specialization modifier
   * PROGRESSION: Discounts for medical expertise
   */
  private calculateSpecializationModifier(specializationLevel: number): number {
    switch (specializationLevel) {
      case 3: // Expert
        return 0.8; // 20% discount
      case 2: // Advanced
        return 0.85; // 15% discount
      case 1: // Intermediate
        return 0.9; // 10% discount
      case 0: // Beginner
      default:
        return 1.0; // No discount
    }
  }

  /**
   * Calculate delegation modifier
   * WALLET: Discounts for smart account users
   */
  private calculateDelegationModifier(): number {
    return 0.9; // 10% discount for delegation users
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Update streak counter
   * MODULAR: External control of streak system
   */
  updateStreak(success: boolean): void {
    if (success) {
      this.currentStreak++;
    } else {
      this.currentStreak = 0;
    }
  }

  /**
   * Set specialization level
   * PROGRESSION: Unlock discounts through expertise
   */
  setSpecializationLevel(level: number): void {
    this.specializationLevel = Math.max(0, Math.min(3, level)); // Clamp to 0-3
  }

  /**
   * Set delegation status
   * WALLET: Enable delegation discounts
   */
  setDelegationStatus(hasDelegation: boolean): void {
    this.hasDelegation = hasDelegation;
  }

  /**
   * Update base efficiency
   * PERFORMANCE: Track overall budget efficiency
   */
  updateEfficiency(efficiency: number): void {
    this.baseEfficiency = Math.max(0, Math.min(100, efficiency)); // Clamp to 0-100
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get current pricing modifiers for display
   * TRANSPARENT: Show players why prices change
   */
  getCurrentModifiers(
    timeRemaining: number,
    timeLimit: number,
    patientState: PatientState,
    budgetEfficiency: number = 100
  ): PricingModifiers {
    return {
      timePressure: this.calculateTimePressureModifier(timeRemaining, timeLimit),
      patientCriticality: this.calculateCriticalityModifier(patientState),
      efficiencyBonus: this.calculateEfficiencyModifier(budgetEfficiency),
      streakMultiplier: this.calculateStreakModifier(this.currentStreak),
      specializationBonus: this.calculateSpecializationModifier(this.specializationLevel),
      delegationDiscount: this.hasDelegation ? this.calculateDelegationModifier() : 1.0
    };
  }

  /**
   * Get pricing explanation for an action
   * IMMERSIVE: Educational pricing feedback
   */
  getPricingExplanation(
    baseAction: MedicalAction,
    timeRemaining: number,
    timeLimit: number,
    patientState: PatientState,
    budgetEfficiency: number = 100
  ): string {
    const modifiers = this.getCurrentModifiers(timeRemaining, timeLimit, patientState, budgetEfficiency);
    const dynamicPrice = this.calculateDynamicPrice(baseAction, timeRemaining, timeLimit, patientState, budgetEfficiency);
    
    const explanations: string[] = [];
    
    if (modifiers.timePressure > 1.0) {
      explanations.push(`⏱️ Time pressure: +${Math.round((modifiers.timePressure - 1) * 100)}%`);
    }
    
    if (modifiers.patientCriticality > 1.0) {
      explanations.push(`🚨 Criticality: +${Math.round((modifiers.patientCriticality - 1) * 100)}%`);
    }
    
    if (modifiers.efficiencyBonus < 1.0) {
      explanations.push(`💰 Efficiency: -${Math.round((1 - modifiers.efficiencyBonus) * 100)}%`);
    }
    
    if (modifiers.streakMultiplier < 1.0) {
      explanations.push(`🔥 Streak: -${Math.round((1 - modifiers.streakMultiplier) * 100)}%`);
    }
    
    if (modifiers.specializationBonus < 1.0) {
      explanations.push(`🎓 Specialization: -${Math.round((1 - modifiers.specializationBonus) * 100)}%`);
    }
    
    if (modifiers.delegationDiscount < 1.0) {
      explanations.push(`🔗 Delegation: -${Math.round((1 - modifiers.delegationDiscount) * 100)}%`);
    }
    
    if (explanations.length === 0) {
      explanations.push("Standard pricing");
    }
    
    return `${explanations.join(', ')}. Final cost: ${dynamicPrice.toFixed(2)} MON`;
  }
}