/**
 * Hospital Administrator Agent
 * IMMERSIVE: Personified budget management with narrative tension
 * MODULAR: Integrates with BudgetManager and case difficulty
 * CLEAN: Clear negotiation mechanics and risk/reward system
 * 
 * Core Concept:
 * - Administrator controls the hospital's budget
 * - User negotiates for additional funds (premium feature)
 * - Real stakes: patient outcomes depend on user decisions
 * - Risk/reward: spend your own MON to save the patient
 */

import { BudgetManager, DIFFICULTY_CONFIGS } from './BudgetManager';
import { colors, typography, spacing } from '../../styles/design-tokens';

export interface AdministratorPersonality {
  name: string;
  role: string;
  avatar: string; // emoji or icon
  style: 'strict' | 'flexible' | 'generous';
  negotiationDifficulty: 'easy' | 'medium' | 'hard';
}

export interface BudgetNegotiation {
  requestedAmount: number;
  approvalChance: number; // 0-100
  conditions: string[];
  consequences: {
    success: string;
    failure: string;
  };
  requiresPremium: boolean;
}

export interface PatientOutcome {
  survived: boolean;
  outcomeMessage: string;
  reputationImpact: number; // -100 to +100
  financialImpact: number; // MON gained or lost
}

export class HospitalAdministrator {
  private personality: AdministratorPersonality;
  private budgetManager: BudgetManager;
  private callbacks: Map<string, Function[]> = new Map();
  private hasWalletConnected: boolean = false;
  private userContributions: number = 0; // User's own MON spent

  // Dialogue templates for immersive interaction
  private dialogueTemplates = {
    initial: {
      strict: [
        "Dr. {name}, you have {budget} MON for this case. The board expects efficiency.",
        "The hospital's resources are limited. Make every MON count, Doctor.",
        "Remember, we're accountable to shareholders. Stay within budget."
      ],
      flexible: [
        "You've got {budget} MON to work with, Dr. {name}. Use it wisely.",
        "The hospital trusts your judgment, but we need results within budget.",
        "We've allocated {budget} MON. Let me know if you need more."
      ],
      generous: [
        "Dr. {name}, here's {budget} MON. Patient care comes first.",
        "Don't worry too much about the budget - saving lives is what matters.",
        "You have {budget} MON, but we can find more if the patient needs it."
      ]
    },
    budgetLow: {
      strict: [
        "You're down to {remaining} MON, Doctor. The board is watching.",
        "Budget nearly depleted. Every test must be justified now.",
        "⚠️ Critical funds. One more expensive test could end this case."
      ],
      flexible: [
        "Only {remaining} MON left. Consider your next steps carefully.",
        "Running low on funds. Focus on the most critical interventions.",
        "Budget's tight now. Make each decision count."
      ],
      generous: [
        "You're at {remaining} MON. Need more? Let me see what I can do.",
        "Funds are low, but we can request emergency allocation if needed.",
        "Down to {remaining} MON, but patient care is still priority one."
      ]
    },
    negotiationRequest: {
      strict: [
        "Additional funds? The board will need convincing. What's your justification?",
        "Every extra MON comes from somewhere, Doctor. Make your case.",
        "Emergency budget requests require board approval. This better be critical."
      ],
      flexible: [
        "I might be able to find {amount} MON. What's the medical necessity?",
        "Let's discuss. Why do you need more than the allocated budget?",
        "I can try to get approval. Walk me through your reasoning."
      ],
      generous: [
        "Patient safety first. How much do you need?",
        "Of course, Doctor. Requisitioning {amount} MON now.",
        "No need to explain - I trust your clinical judgment."
      ]
    },
    patientCritical: {
      strict: [
        "The patient's condition is deteriorating. Budget or not, what's your call?",
        "Critical situation. The board will understand emergency spending... maybe.",
        "⚠️ CRITICAL: Patient failing. Protocol says save the life first, budget second."
      ],
      flexible: [
        "Patient's crashing! Do what you need to do, Doctor.",
        "Emergency status. Budget rules are suspended - SAVE THEM.",
        "Critical patient. I'm authorizing emergency fund access."
      ],
      generous: [
        "Patient first, always. Unlimited emergency funds authorized.",
        "Do whatever it takes, Doctor. Money means nothing if we lose them.",
        "All hospital resources at your disposal. Save this patient."
      ]
    },
    caseComplete: {
      success: [
        "Excellent work, Dr. {name}! Patient saved with {remaining} MON to spare.",
        "Outstanding diagnosis! The board will be pleased with your efficiency.",
        "Patient recovered successfully. Your clinical judgment was impeccable."
      ],
      failure: [
        "We lost them, Doctor. The outcome review will be... difficult.",
        "Patient didn't make it. The board will want answers about resource allocation.",
        "A tragic loss. Let's review what went wrong in the debrief."
      ],
      overbudget: [
        "Patient saved, but we're {overspend} MON over budget. The board wants explanations.",
        "Life saved, budget exceeded. You'll need to justify the overspend to administration.",
        "Success, but at significant cost. Was every expenditure necessary?"
      ]
    }
  };

  constructor(
    budgetManager: BudgetManager,
    personalityStyle: 'strict' | 'flexible' | 'generous' = 'flexible',
    hasWallet: boolean = false
  ) {
    this.budgetManager = budgetManager;
    this.hasWalletConnected = hasWallet;
    
    // Define administrator personality
    this.personality = this.createPersonality(personalityStyle);
  }

  // ============================================================================
  // PERSONALITY & INITIALIZATION
  // ============================================================================

  private createPersonality(style: 'strict' | 'flexible' | 'generous'): AdministratorPersonality {
    const personalities: Record<typeof style, AdministratorPersonality> = {
      strict: {
        name: 'Dr. Patricia Chen',
        role: 'Chief Financial Officer',
        avatar: '💼',
        style: 'strict',
        negotiationDifficulty: 'hard'
      },
      flexible: {
        name: 'Marcus Rodriguez',
        role: 'Hospital Administrator',
        avatar: '👔',
        style: 'flexible',
        negotiationDifficulty: 'medium'
      },
      generous: {
        name: 'Dr. Sarah Williams',
        role: 'Chief Medical Officer',
        avatar: '🩺',
        style: 'generous',
        negotiationDifficulty: 'easy'
      }
    };

    return personalities[style];
  }

  /**
   * Get initial budget briefing
   * IMMERSIVE: Sets the tone for the case
   */
  getInitialBriefing(doctorName: string = 'Doctor'): string {
    const budgetState = this.budgetManager.getBudgetState();
    const templates = this.dialogueTemplates.initial[this.personality.style];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template
      .replace('{name}', doctorName)
      .replace('{budget}', budgetState.startingBudget.toFixed(2));
  }

  /**
   * Check budget status and provide warnings
   * IMMERSIVE: Dynamic responses based on budget state
   */
  checkBudgetStatus(): { message: string; urgency: 'normal' | 'warning' | 'critical' } {
    const remaining = this.budgetManager.getRemainingBudget();
    const efficiency = this.budgetManager.getBudgetEfficiency();

    if (this.budgetManager.isDepleted()) {
      return {
        message: "Budget depleted! Any further actions must come from personal funds or emergency authorization.",
        urgency: 'critical'
      };
    }

    if (this.budgetManager.isCriticallyLow()) {
      const templates = this.dialogueTemplates.budgetLow[this.personality.style];
      const template = templates[Math.floor(Math.random() * templates.length)];
      return {
        message: template.replace('{remaining}', remaining.toFixed(2)),
        urgency: 'warning'
      };
    }

    return {
      message: `Budget status: ${remaining.toFixed(2)} MON remaining (${efficiency}% of original allocation)`,
      urgency: 'normal'
    };
  }

  // ============================================================================
  // NEGOTIATION MECHANICS (PREMIUM FEATURE)
  // ============================================================================

  /**
   * Request additional budget allocation
   * MODULAR: Returns negotiation parameters for UI
   */
  requestAdditionalFunds(
    requestedAmount: number,
    justification: string,
    patientCriticality: 'stable' | 'deteriorating' | 'critical'
  ): BudgetNegotiation {
    if (!this.hasWalletConnected) {
      return {
        requestedAmount,
        approvalChance: 0,
        conditions: ['Connect wallet for premium negotiation features'],
        consequences: {
          success: 'N/A',
          failure: 'Premium feature requires wallet connection'
        },
        requiresPremium: true
      };
    }

    // Calculate approval chance based on personality and situation
    let baseChance = this.personality.negotiationDifficulty === 'easy' ? 70 :
                     this.personality.negotiationDifficulty === 'medium' ? 50 : 30;

    // Adjust for patient criticality
    if (patientCriticality === 'critical') baseChance += 30;
    else if (patientCriticality === 'deteriorating') baseChance += 15;

    // Adjust for requested amount
    if (requestedAmount < 0.5) baseChance += 10;
    else if (requestedAmount > 2.0) baseChance -= 20;

    const approvalChance = Math.min(95, Math.max(5, baseChance));

    return {
      requestedAmount,
      approvalChance,
      conditions: this.generateNegotiationConditions(requestedAmount, patientCriticality),
      consequences: {
        success: `Approved! ${requestedAmount.toFixed(2)} MON added to budget.`,
        failure: `Request denied. Consider using personal funds or prioritizing critical tests only.`
      },
      requiresPremium: false
    };
  }

  private generateNegotiationConditions(amount: number, criticality: string): string[] {
    const conditions: string[] = [];

    if (this.personality.style === 'strict') {
      conditions.push('Detailed justification required in post-case report');
      if (amount > 1.0) conditions.push('Board review of spending efficiency');
    }

    if (criticality === 'stable') {
      conditions.push('Must demonstrate medical necessity');
    }

    if (amount > 2.0) {
      conditions.push('Emergency fund allocation - affects hospital reputation');
    }

    return conditions.length > 0 ? conditions : ['Standard allocation - no special conditions'];
  }

  /**
   * Process negotiation outcome
   * IMMERSIVE: Handles approval/rejection with narrative
   */
  processNegotiation(negotiation: BudgetNegotiation): {
    approved: boolean;
    message: string;
    budgetIncrease: number;
  } {
    const approved = Math.random() * 100 < negotiation.approvalChance;

    if (approved) {
      // Add funds to budget (would be implemented in BudgetManager)
      this.emit('negotiationApproved', {
        amount: negotiation.requestedAmount,
        conditions: negotiation.conditions
      });

      return {
        approved: true,
        message: `${this.personality.avatar} ${this.personality.name}: "${negotiation.consequences.success}"`,
        budgetIncrease: negotiation.requestedAmount
      };
    } else {
      this.emit('negotiationDenied', { amount: negotiation.requestedAmount });

      return {
        approved: false,
        message: `${this.personality.avatar} ${this.personality.name}: "${negotiation.consequences.failure}"`,
        budgetIncrease: 0
      };
    }
  }

  // ============================================================================
  // PERSONAL FUND CONTRIBUTION
  // ============================================================================

  /**
   * User contributes their own MON
   * RISK/REWARD: High stakes - can lose personal funds if patient dies
   */
  contributePersonalFunds(amount: number): {
    accepted: boolean;
    message: string;
    warning: string;
  } {
    if (!this.hasWalletConnected) {
      return {
        accepted: false,
        message: 'Connect wallet to contribute personal funds',
        warning: ''
      };
    }

    this.userContributions += amount;

    const riskWarning = this.personality.style === 'strict' 
      ? "⚠️ RISK: Personal funds are non-refundable if patient doesn't survive."
      : "⚠️ Personal contribution noted. You'll be reimbursed only if the patient survives.";

    this.emit('personalContribution', { amount, total: this.userContributions });

    return {
      accepted: true,
      message: `${this.personality.avatar} ${this.personality.name}: "Your dedication is noted, Doctor. ${amount.toFixed(2)} MON added to case budget."`,
      warning: riskWarning
    };
  }

  /**
   * Get total user contributions (at risk)
   */
  getUserContributions(): number {
    return this.userContributions;
  }

  // ============================================================================
  // PATIENT OUTCOME & CONSEQUENCES
  // ============================================================================

  /**
   * Calculate outcome when case completes
   * IMMERSIVE: Financial and reputational consequences
   */
  calculateOutcome(
    patientSurvived: boolean,
    diagnosisCorrect: boolean,
    timeRemaining: number
  ): PatientOutcome {
    const budgetState = this.budgetManager.getBudgetState();
    const overbudget = budgetState.totalSpent > budgetState.startingBudget;
    const overspend = overbudget ? budgetState.totalSpent - budgetState.startingBudget : 0;

    let outcomeMessage = '';
    let reputationImpact = 0;
    let financialImpact = 0;

    if (patientSurvived && diagnosisCorrect) {
      // SUCCESS
      if (overbudget) {
        // Saved patient but over budget
        const templates = this.dialogueTemplates.caseComplete.overbudget;
        outcomeMessage = templates[Math.floor(Math.random() * templates.length)]
          .replace('{overspend}', overspend.toFixed(2));
        reputationImpact = 40; // Good but penalized
        
        // If user contributed personal funds, they get them back
        financialImpact = this.userContributions;
      } else {
        // Saved patient within budget
        const templates = this.dialogueTemplates.caseComplete.success;
        outcomeMessage = templates[Math.floor(Math.random() * templates.length)]
          .replace('{remaining}', budgetState.remainingBudget.toFixed(2));
        reputationImpact = 80 + (timeRemaining > 60 ? 20 : 0); // Bonus for speed
        
        // Full refund plus efficiency bonus
        financialImpact = this.userContributions + (budgetState.remainingBudget * 0.5);
      }
    } else {
      // FAILURE
      const templates = this.dialogueTemplates.caseComplete.failure;
      outcomeMessage = templates[Math.floor(Math.random() * templates.length)];
      reputationImpact = -60;
      
      // User loses personal contributions
      financialImpact = -this.userContributions;
      
      outcomeMessage += `\n\n💔 Personal funds lost: ${this.userContributions.toFixed(2)} MON`;
    }

    return {
      survived: patientSurvived,
      outcomeMessage,
      reputationImpact,
      financialImpact
    };
  }

  /**
   * Get critical patient dialogue
   * IMMERSIVE: Emergency situations unlock temporary budget freedom
   */
  getEmergencyDialogue(): string {
    const templates = this.dialogueTemplates.patientCritical[this.personality.style];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // ============================================================================
  // ACCESSORS
  // ============================================================================

  getPersonality(): AdministratorPersonality {
    return { ...this.personality };
  }

  setWalletStatus(connected: boolean): void {
    this.hasWalletConnected = connected;
  }
}
