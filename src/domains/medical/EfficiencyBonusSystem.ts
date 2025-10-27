/**
 * Efficiency Bonus System
 * ENHANCEMENT: Reward system for budget-conscious medical practice
 * CLEAN: Single responsibility - calculate and track efficiency bonuses
 * MODULAR: Integrates with BudgetManager and GameManager
 * 
 * Core Principles:
 * - Reward players for efficient resource use
 * - Provide clear feedback on efficiency performance
 * - Create progression through efficiency achievements
 */

import { BudgetManager } from './BudgetManager';
import { PatientState } from './types';

export interface EfficiencyMetrics {
  budgetEfficiency: number; // 0-100 scale
  timeEfficiency: number; // 0-100 scale
  actionEfficiency: number; // 0-100 scale
  diagnosticAccuracy: number; // 0-100 scale
  complicationManagement: number; // 0-100 scale
}

export interface EfficiencyBonus {
  type: 'budget' | 'time' | 'action' | 'accuracy' | 'complication';
  amount: number; // MON tokens
  description: string;
  earned: boolean;
}

export interface EfficiencyAchievement {
  id: string;
  name: string;
  description: string;
  threshold: number; // 0-100 scale
  reward: number; // MON tokens
  earned: boolean;
}

export class EfficiencyBonusSystem {
  private budgetManager: BudgetManager | null = null;
  private patientState: PatientState | null = null;
  private baseTimeLimit: number = 300; // seconds
  private timeElapsed: number = 0;
  private complicationsManaged: number = 0;
  private totalComplications: number = 0;
  private diagnosticAccuracy: number = 100; // 0-100 scale

  // Predefined efficiency achievements
  private achievements: EfficiencyAchievement[] = [
    {
      id: 'budget_master',
      name: 'Budget Master',
      description: 'Complete case with 90%+ budget efficiency',
      threshold: 90,
      reward: 0.25,
      earned: false
    },
    {
      id: 'time_saver',
      name: 'Time Saver',
      description: 'Complete case with 25%+ time remaining',
      threshold: 75, // 75% time efficiency = 25% time remaining
      reward: 0.15,
      earned: false
    },
    {
      id: 'precision_practitioner',
      name: 'Precision Practitioner',
      description: 'Complete case with 95%+ diagnostic accuracy',
      threshold: 95,
      reward: 0.30,
      earned: false
    },
    {
      id: 'complication_conqueror',
      name: 'Complication Conqueror',
      description: 'Manage 100% of complications without patient deterioration',
      threshold: 100,
      reward: 0.20,
      earned: false
    },
    {
      id: 'efficiency_expert',
      name: 'Efficiency Expert',
      description: 'Earn all other efficiency achievements',
      threshold: 100, // Special case - requires all others
      reward: 0.50,
      earned: false
    }
  ];

  constructor() {}

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize system with budget manager and case parameters
   * MODULAR: Connect to game systems
   */
  initialize(
    budgetManager: BudgetManager,
    patientState: PatientState,
    timeLimit: number
  ): void {
    this.budgetManager = budgetManager;
    this.patientState = patientState;
    this.baseTimeLimit = timeLimit;
    this.timeElapsed = 0;
    this.complicationsManaged = 0;
    this.totalComplications = 0;
    this.diagnosticAccuracy = 100;
    
    // Reset achievements
    this.achievements.forEach(achievement => {
      achievement.earned = false;
    });
  }

  // ============================================================================
  // METRICS CALCULATION
  // ============================================================================

  /**
   * Calculate current efficiency metrics
   * CLEAN: Single source of truth for efficiency data
   */
  calculateMetrics(): EfficiencyMetrics {
    if (!this.budgetManager) {
      return {
        budgetEfficiency: 0,
        timeEfficiency: 0,
        actionEfficiency: 0,
        diagnosticAccuracy: 0,
        complicationManagement: 0
      };
    }

    // Budget efficiency (0-100 scale)
    const budgetEfficiency = this.budgetManager.getBudgetEfficiency();
    
    // Time efficiency (0-100 scale)
    const timeEfficiency = this.baseTimeLimit > 0 
      ? Math.max(0, Math.min(100, ((this.baseTimeLimit - this.timeElapsed) / this.baseTimeLimit) * 100))
      : 0;
    
    // Action efficiency (based on cost-effective actions)
    const executedActions = this.budgetManager.getExecutedActions();
    const actionEfficiency = executedActions.length > 0
      ? this.calculateActionEfficiency(executedActions)
      : 100;
    
    // Complication management (0-100 scale)
    const complicationManagement = this.totalComplications > 0
      ? (this.complicationsManaged / this.totalComplications) * 100
      : 100;
    
    return {
      budgetEfficiency,
      timeEfficiency,
      actionEfficiency,
      diagnosticAccuracy: this.diagnosticAccuracy,
      complicationManagement
    };
  }

  /**
   * Calculate action efficiency based on cost-effectiveness
   * INTELLIGENT: Reward smart action selection
   */
  private calculateActionEfficiency(executedActions: any[]): number {
    if (executedActions.length === 0) return 100;
    
    // For this implementation, we'll use a simplified approach
    // In a real system, we'd compare actual actions to optimal actions
    let totalEfficiency = 0;
    
    executedActions.forEach(action => {
      // Placeholder logic - in reality, we'd compare to optimal action sequence
      // For now, assume 80% efficiency as a baseline
      totalEfficiency += 80;
    });
    
    return totalEfficiency / executedActions.length;
  }

  // ============================================================================
  // BONUS CALCULATION
  // ============================================================================

  /**
   * Calculate efficiency bonuses for case completion
   * REWARD: Transparent bonus system
   */
  calculateBonuses(): EfficiencyBonus[] {
    const metrics = this.calculateMetrics();
    const bonuses: EfficiencyBonus[] = [];

    // Budget efficiency bonus
    if (metrics.budgetEfficiency >= 80) {
      const amount = 0.10 + (Math.max(0, metrics.budgetEfficiency - 80) * 0.01);
      bonuses.push({
        type: 'budget',
        amount: parseFloat(amount.toFixed(2)),
        description: `Budget efficiency bonus (${metrics.budgetEfficiency.toFixed(0)}%)`,
        earned: true
      });
    }

    // Time efficiency bonus
    if (metrics.timeEfficiency >= 70) {
      const amount = 0.05 + (Math.max(0, metrics.timeEfficiency - 70) * 0.005);
      bonuses.push({
        type: 'time',
        amount: parseFloat(amount.toFixed(2)),
        description: `Time efficiency bonus (${metrics.timeEfficiency.toFixed(0)}%)`,
        earned: true
      });
    }

    // Action efficiency bonus
    if (metrics.actionEfficiency >= 75) {
      const amount = 0.08 + (Math.max(0, metrics.actionEfficiency - 75) * 0.008);
      bonuses.push({
        type: 'action',
        amount: parseFloat(amount.toFixed(2)),
        description: `Action efficiency bonus (${metrics.actionEfficiency.toFixed(0)}%)`,
        earned: true
      });
    }

    // Diagnostic accuracy bonus
    if (metrics.diagnosticAccuracy >= 90) {
      const amount = 0.15 + (Math.max(0, metrics.diagnosticAccuracy - 90) * 0.015);
      bonuses.push({
        type: 'accuracy',
        amount: parseFloat(amount.toFixed(2)),
        description: `Diagnostic accuracy bonus (${metrics.diagnosticAccuracy.toFixed(0)}%)`,
        earned: true
      });
    }

    // Complication management bonus
    if (metrics.complicationManagement >= 80) {
      const amount = 0.10 + (Math.max(0, metrics.complicationManagement - 80) * 0.01);
      bonuses.push({
        type: 'complication',
        amount: parseFloat(amount.toFixed(2)),
        description: `Complication management bonus (${metrics.complicationManagement.toFixed(0)}%)`,
        earned: true
      });
    }

    return bonuses;
  }

  /**
   * Calculate total efficiency bonus amount
   * SIMPLE: Sum of all earned bonuses
   */
  calculateTotalBonus(): number {
    const bonuses = this.calculateBonuses();
    return bonuses.reduce((total, bonus) => total + bonus.amount, 0);
  }

  // ============================================================================
  // ACHIEVEMENT SYSTEM
  // ============================================================================

  /**
   * Check and unlock efficiency achievements
   * PROGRESSION: Long-term rewards for consistent performance
   */
  checkAchievements(): EfficiencyAchievement[] {
    const metrics = this.calculateMetrics();
    const newlyEarned: EfficiencyAchievement[] = [];

    this.achievements.forEach(achievement => {
      if (achievement.earned) return; // Skip already earned achievements

      let earned = false;

      switch (achievement.id) {
        case 'budget_master':
          earned = metrics.budgetEfficiency >= achievement.threshold;
          break;
        case 'time_saver':
          earned = metrics.timeEfficiency >= achievement.threshold;
          break;
        case 'precision_practitioner':
          earned = this.diagnosticAccuracy >= achievement.threshold;
          break;
        case 'complication_conqueror':
          earned = metrics.complicationManagement >= achievement.threshold;
          break;
        case 'efficiency_expert':
          // Special case - requires all other achievements
          const otherAchievements = this.achievements.filter(a => a.id !== 'efficiency_expert');
          earned = otherAchievements.every(a => a.earned);
          break;
      }

      if (earned) {
        achievement.earned = true;
        newlyEarned.push(achievement);
      }
    });

    return newlyEarned;
  }

  /**
   * Get all achievements with current progress
   * TRANSPARENT: Clear achievement tracking
   */
  getAchievements(): EfficiencyAchievement[] {
    const metrics = this.calculateMetrics();
    
    // Update progress for display purposes
    return this.achievements.map(achievement => {
      let progress = 0;
      
      switch (achievement.id) {
        case 'budget_master':
          progress = metrics.budgetEfficiency;
          break;
        case 'time_saver':
          progress = metrics.timeEfficiency;
          break;
        case 'precision_practitioner':
          progress = this.diagnosticAccuracy;
          break;
        case 'complication_conqueror':
          progress = metrics.complicationManagement;
          break;
        case 'efficiency_expert':
          // Progress is percentage of other achievements earned
          const otherCount = this.achievements.filter(a => a.id !== 'efficiency_expert').length;
          const earnedCount = this.achievements.filter(a => a.id !== 'efficiency_expert' && a.earned).length;
          progress = otherCount > 0 ? (earnedCount / otherCount) * 100 : 0;
          break;
      }
      
      return {
        ...achievement,
        // Add progress for UI display
        progress: Math.round(progress)
      };
    }) as EfficiencyAchievement[];
  }

  // ============================================================================
  // STATE UPDATES
  // ============================================================================

  /**
   * Update time elapsed
   * REAL-TIME: Track case progression
   */
  updateTimeElapsed(elapsed: number): void {
    this.timeElapsed = elapsed;
  }

  /**
   * Update complication tracking
   * COMPREHENSIVE: Track all patient management aspects
   */
  updateComplications(total: number, managed: number): void {
    this.totalComplications = total;
    this.complicationsManaged = managed;
  }

  /**
   * Update diagnostic accuracy
   * ACCURATE: Reflect true diagnostic performance
   */
  updateDiagnosticAccuracy(accuracy: number): void {
    this.diagnosticAccuracy = Math.max(0, Math.min(100, accuracy));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get efficiency summary for display
   * USER-FRIENDLY: Clear performance feedback
   */
  getEfficiencySummary(): {
    overall: number;
    breakdown: EfficiencyMetrics;
    bonuses: EfficiencyBonus[];
    achievements: EfficiencyAchievement[];
    totalBonus: number;
  } {
    const metrics = this.calculateMetrics();
    const bonuses = this.calculateBonuses();
    const achievements = this.getAchievements();
    
    // Calculate overall efficiency as weighted average
    const overall = Math.round(
      (metrics.budgetEfficiency * 0.3) +
      (metrics.timeEfficiency * 0.2) +
      (metrics.actionEfficiency * 0.2) +
      (metrics.diagnosticAccuracy * 0.2) +
      (metrics.complicationManagement * 0.1)
    );
    
    return {
      overall,
      breakdown: metrics,
      bonuses,
      achievements,
      totalBonus: this.calculateTotalBonus()
    };
  }
}