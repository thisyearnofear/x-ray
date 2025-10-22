/**
 * Budget Manager
 * CLEAN: Single responsibility - track MON spending during case gameplay
 * MODULAR: Integrates with GameManager and medical action systems
 * PERFORMANT: Minimal state, efficient calculations
 * 
 * Core Principles:
 * - User makes all spending decisions
 * - Real-time budget validation
 * - Earnings calculated at case completion
 */

import { MedicalAction, ActionResult } from './types';

export interface BudgetState {
  startingBudget: number; // MON
  remainingBudget: number; // MON
  totalSpent: number; // MON
  actions: ActionResult[];
  difficultyTier: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export class BudgetManager {
  private state: BudgetState;
  private callbacks: Map<string, Function[]> = new Map();

  constructor(startingBudget: number, difficultyTier: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner') {
    this.state = {
      startingBudget,
      remainingBudget: startingBudget,
      totalSpent: 0,
      actions: [],
      difficultyTier
    };
  }

  // ============================================================================
  // CORE BUDGET OPERATIONS
  // ============================================================================

  /**
   * Check if user can afford an action
   * CLEAN: Simple validation, no side effects
   */
  canAfford(action: MedicalAction): boolean {
    return this.state.remainingBudget >= action.cost;
  }

  /**
   * Execute an action and deduct cost
   * MODULAR: Returns ActionResult for further processing
   */
  executeAction(action: MedicalAction, findings: string[], success: boolean = true): ActionResult | null {
    if (!this.canAfford(action)) {
      this.emit('insufficientFunds', {
        action,
        required: action.cost,
        available: this.state.remainingBudget
      });
      return null;
    }

    // Deduct cost
    this.state.remainingBudget -= action.cost;
    this.state.totalSpent += action.cost;

    // Record action result
    const result: ActionResult = {
      actionId: action.id,
      success,
      findings,
      costIncurred: action.cost,
      timestamp: Date.now()
    };

    this.state.actions.push(result);

    // Emit events
    this.emit('actionExecuted', { action, result, remainingBudget: this.state.remainingBudget });
    this.emit('budgetUpdated', this.getBudgetState());

    return result;
  }

  /**
   * Get current budget state
   * CLEAN: Immutable return value
   */
  getBudgetState(): Readonly<BudgetState> {
    return { ...this.state };
  }

  /**
   * Get remaining budget
   * PERFORMANT: Direct accessor
   */
  getRemainingBudget(): number {
    return this.state.remainingBudget;
  }

  /**
   * Get total spent
   */
  getTotalSpent(): number {
    return this.state.totalSpent;
  }

  /**
   * Get budget efficiency percentage (0-100)
   * Used in earnings calculation
   */
  getBudgetEfficiency(): number {
    if (this.state.startingBudget === 0) return 0;
    return Math.round((this.state.remainingBudget / this.state.startingBudget) * 100);
  }

  /**
   * Get all executed actions
   */
  getExecutedActions(): ActionResult[] {
    return [...this.state.actions];
  }

  // ============================================================================
  // ANALYTICS & INSIGHTS
  // ============================================================================

  /**
   * Get spending breakdown by category
   * MODULAR: Returns structured data for UI display
   */
  getSpendingBreakdown(): {
    test: number;
    treatment: number;
    consultation: number;
    imaging: number;
  } {
    const breakdown = {
      test: 0,
      treatment: 0,
      consultation: 0,
      imaging: 0
    };

    // Note: We'd need to store action category in ActionResult
    // For now, this is a placeholder structure
    return breakdown;
  }

  /**
   * Check if budget is critically low
   * Useful for UI warnings
   */
  isCriticallyLow(threshold: number = 0.2): boolean {
    const percentageRemaining = this.state.remainingBudget / this.state.startingBudget;
    return percentageRemaining < threshold && percentageRemaining > 0;
  }

  /**
   * Check if budget is depleted
   */
  isDepleted(): boolean {
    return this.state.remainingBudget <= 0;
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  /**
   * Subscribe to budget events
   * MODULAR: Event-driven architecture
   */
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  /**
   * Emit event to subscribers
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // ============================================================================
  // RESET & UTILITIES
  // ============================================================================

  /**
   * Reset budget (for new case)
   * CLEAN: Creates fresh state
   */
  reset(newBudget: number, difficultyTier: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner'): void {
    this.state = {
      startingBudget: newBudget,
      remainingBudget: newBudget,
      totalSpent: 0,
      actions: [],
      difficultyTier
    };
    this.emit('budgetReset', this.state);
  }

  /**
   * Get summary for display
   * MODULAR: Formatted data for UI components
   */
  getSummary(): {
    startingBudget: string;
    remainingBudget: string;
    totalSpent: string;
    efficiency: number;
    actionsCount: number;
  } {
    return {
      startingBudget: this.state.startingBudget.toFixed(2),
      remainingBudget: this.state.remainingBudget.toFixed(2),
      totalSpent: this.state.totalSpent.toFixed(2),
      efficiency: this.getBudgetEfficiency(),
      actionsCount: this.state.actions.length
    };
  }
}

/**
 * Difficulty tier configurations
 * DRY: Single source of truth (mirrors smart contract)
 */
export const DIFFICULTY_CONFIGS = {
  beginner: {
    startingBudget: 0.5,
    maxEarnings: 1.0,
    timeLimit: 300, // 5 minutes
    label: 'Beginner',
    description: 'Perfect for learning the basics'
  },
  intermediate: {
    startingBudget: 1.5,
    maxEarnings: 3.75,
    timeLimit: 480, // 8 minutes
    label: 'Intermediate',
    description: 'Moderate complexity cases'
  },
  advanced: {
    startingBudget: 3.0,
    maxEarnings: 10.0,
    timeLimit: 600, // 10 minutes
    label: 'Advanced',
    description: 'Complex multi-system cases'
  },
  expert: {
    startingBudget: 5.0,
    maxEarnings: 30.0,
    timeLimit: 900, // 15 minutes
    label: 'Expert',
    description: 'Rare and challenging diagnoses'
  }
} as const;
