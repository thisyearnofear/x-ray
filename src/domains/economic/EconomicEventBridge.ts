/**
 * Economic Event Bridge
 * CLEAN: Bridges GameManager events to DOM for React components
 * MODULAR: Event-driven architecture between systems
 * PERFORMANT: Direct event dispatch, no polling
 */

import { GameManager } from '../diagnostic/GameManager';
import { BudgetManager } from '../medical/BudgetManager';
import { HospitalAdministrator } from '../medical/HospitalAdministrator';
import { MedicalAction } from '../medical/types';

/**
 * Bridges GameManager economic events to DOM events for React components
 */
export class EconomicEventBridge {
  private gameManager: GameManager;
  private isInitialized = false;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  /**
   * Initialize event listeners
   * CLEAN: Sets up all event bridges
   */
  public initialize(): void {
    if (this.isInitialized) return;

    // Budget updates
    this.gameManager.on('budgetUpdated', (budget: any) => {
      document.dispatchEvent(new CustomEvent('budgetUpdated', {
        detail: budget
      }));
    });

    // Administrator messages
    this.gameManager.on('administratorMessage', (message: any) => {
      document.dispatchEvent(new CustomEvent('administratorMessage', {
        detail: message
      }));
    });

    // Action execution
    this.gameManager.on('actionExecuted', (data: any) => {
      document.dispatchEvent(new CustomEvent('actionExecuted', {
        detail: data
      }));
    });

    // Insufficient funds
    this.gameManager.on('insufficientFunds', (data: any) => {
      document.dispatchEvent(new CustomEvent('insufficientFunds', {
        detail: data
      }));
    });

    // Listen for UI-triggered events
    this.setupUIEventListeners();

    this.isInitialized = true;
    console.log('💰 Economic Event Bridge initialized');
  }

  /**
   * Setup listeners for UI-triggered events
   */
  private setupUIEventListeners(): void {
    // Case selected from CaseSelectionHub
    document.addEventListener('caseSelected', ((event: CustomEvent) => {
      const { difficultyTier } = event.detail;
      
      // Initialize budget in GameManager
      const budgetManager = this.gameManager.getBudgetManager();
      const hospitalAdmin = this.gameManager.getHospitalAdministrator();
      
      if (!budgetManager || !hospitalAdmin) {
        // Initialize if not already done
        this.gameManager.initializeBudget(
          difficultyTier,
          'flexible', // Default personality
          this.isWalletConnected()
        );
      }
    }) as EventListener);

    // Execute medical action
    document.addEventListener('executeAction', ((event: CustomEvent) => {
      const { action } = event.detail as { action: MedicalAction };
      
      const budgetManager = this.gameManager.getBudgetManager();
      if (!budgetManager) {
        console.error('BudgetManager not initialized');
        return;
      }

      // Execute action through budget manager
      const result = budgetManager.executeAction(
        action,
        [`Performed ${action.name}`],
        true
      );

      if (result) {
        console.log(`✅ Executed: ${action.name} for ${action.cost} MON`);
        // BudgetManager internally handles emitting events through GameManager
      }
    }) as EventListener);

    // Request additional funds
    document.addEventListener('requestAdditionalFunds', (() => {
      const hospitalAdmin = this.gameManager.getHospitalAdministrator();
      if (!hospitalAdmin) return;

      const gameState = this.gameManager.getGameState();
      const criticality = gameState.patientCriticality || 'stable';

      // Request 0.5 MON (can be made dynamic later)
      const negotiation = hospitalAdmin.requestAdditionalFunds(
        0.5,
        'Additional tests needed for accurate diagnosis',
        criticality
      );

      // Show negotiation dialog
      document.dispatchEvent(new CustomEvent('showNegotiationDialog', {
        detail: { negotiation }
      }));
    }) as EventListener);

    // Contribute personal funds
    document.addEventListener('contributePersonalFunds', (() => {
      const hospitalAdmin = this.gameManager.getHospitalAdministrator();
      if (!hospitalAdmin) return;

      // Show contribution dialog
      document.dispatchEvent(new CustomEvent('showContributionDialog', {
        detail: { maxAmount: 5.0 } // Max 5 MON personal contribution
      }));
    }) as EventListener);
  }

  /**
   * Show case selection hub
   */
  public showCaseSelection(): void {
    document.dispatchEvent(new CustomEvent('showCaseSelection'));
  }

  /**
   * Show treatment menu
   */
  public showTreatmentMenu(): void {
    document.dispatchEvent(new CustomEvent('showTreatmentMenu'));
  }

  /**
   * Check if wallet is connected
   */
  private isWalletConnected(): boolean {
    return typeof window !== 'undefined' && 
           (window as any).ethereum?.selectedAddress != null;
  }

  /**
   * Cleanup event listeners
   */
  public dispose(): void {
    // Remove event listeners if needed
    this.isInitialized = false;
  }
}

/**
 * Helper to create button for case selection
 */
export function createCaseSelectionButton(bridge: EconomicEventBridge): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = '🏥 Start New Case';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #00ff88, #00cc6a);
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    transition: all 0.3s;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.8)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
  });

  button.addEventListener('click', () => {
    bridge.showCaseSelection();
  });

  return button;
}

/**
 * Helper to create button for treatment menu
 */
export function createTreatmentMenuButton(bridge: EconomicEventBridge): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = '💊 Medical Actions';
  button.style.cssText = `
    position: fixed;
    top: 80px;
    left: 20px;
    padding: 12px 24px;
    background: transparent;
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 8px;
    color: #00ff88;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    z-index: 1000;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.background = 'rgba(0, 255, 136, 0.1)';
    button.style.borderColor = '#00ff88';
    button.style.transform = 'translateX(4px)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = 'transparent';
    button.style.borderColor = 'rgba(0, 255, 136, 0.3)';
    button.style.transform = 'translateX(0)';
  });

  button.addEventListener('click', () => {
    bridge.showTreatmentMenu();
  });

  return button;
}
