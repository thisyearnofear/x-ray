// CLEAN: Phase management integrated with GameManager (no duplicate state)
import { GameManager } from './GameManager'

export enum GamePhase {
  WELCOME = 'welcome',
  TUTORIAL = 'tutorial',
  EXPLORATION = 'exploration',
  READY = 'ready',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETE = 'complete'
}

// AGGRESSIVE CONSOLIDATION: Removed duplicate GameState interface
// State management is now handled by GameManager
export class GamePhaseManager {
  private currentPhase: GamePhase = GamePhase.WELCOME
  private listeners: Map<GamePhase, (() => void)[]> = new Map()
  private gameManager: GameManager

  constructor(gameManager?: GameManager) {
    // ENHANCEMENT FIRST: Use existing GameManager instead of creating new state
    this.gameManager = gameManager || new GameManager()

    // Initialize listeners for all phases
    Object.values(GamePhase).forEach(phase => {
      this.listeners.set(phase, [])
    })
  }

  // CLEAN: Simplified phase transitions using GameManager state
  transitionTo(newPhase: GamePhase): boolean {
    // Allow same-phase transitions for welcome screen
    if (this.currentPhase === newPhase && newPhase === GamePhase.WELCOME) {
      this.onPhaseEnter(newPhase, this.currentPhase)
      const phaseListeners = this.listeners.get(newPhase) || []
      phaseListeners.forEach(listener => listener())
      return true
    }

    if (!this.isValidTransition(this.currentPhase, newPhase)) {
      console.warn(`Invalid transition from ${this.currentPhase} to ${newPhase}`)
      return false
    }

    const previousPhase = this.currentPhase
    this.currentPhase = newPhase

    // Update phase in GameManager if available
    if (this.gameManager) {
      const gameState = this.gameManager.getGameState()
      // Map GamePhase enum to GameManager phase type
      const phaseMap: Record<GamePhase, 'scanning' | 'analyzing' | 'solved'> = {
        [GamePhase.ACTIVE]: 'scanning',
        [GamePhase.PAUSED]: 'scanning',
        [GamePhase.COMPLETE]: 'solved',
        [GamePhase.WELCOME]: 'scanning',
        [GamePhase.TUTORIAL]: 'scanning',
        [GamePhase.EXPLORATION]: 'scanning',
        [GamePhase.READY]: 'scanning'
      }
      const mappedPhase = phaseMap[newPhase] || 'scanning'
      this.gameManager['gameState'] = { ...gameState, phase: mappedPhase }
    }

    // Trigger phase-specific actions
    this.onPhaseEnter(newPhase, previousPhase)

    // Notify listeners
    const phaseListeners = this.listeners.get(newPhase) || []
    phaseListeners.forEach(listener => listener())

    return true
  }

  // CLEAN: Clear validation rules for phase transitions
  private isValidTransition(from: GamePhase, to: GamePhase): boolean {
    const validTransitions: Record<GamePhase, GamePhase[]> = {
      [GamePhase.WELCOME]: [GamePhase.TUTORIAL, GamePhase.EXPLORATION],
      [GamePhase.TUTORIAL]: [GamePhase.EXPLORATION, GamePhase.READY],
      [GamePhase.EXPLORATION]: [GamePhase.READY, GamePhase.TUTORIAL],
      [GamePhase.READY]: [GamePhase.ACTIVE, GamePhase.EXPLORATION],
      [GamePhase.ACTIVE]: [GamePhase.PAUSED, GamePhase.COMPLETE],
      [GamePhase.PAUSED]: [GamePhase.ACTIVE, GamePhase.COMPLETE],
      [GamePhase.COMPLETE]: [GamePhase.WELCOME, GamePhase.READY]
    }

    return validTransitions[from]?.includes(to) || false
  }

  // CLEAN: Simplified phase entry logic - timer management delegated to GameManager
  private onPhaseEnter(phase: GamePhase, previousPhase: GamePhase): void {
    // Phase-specific logic now handled by GameManager and DiagnosticUI
    // This manager focuses solely on phase transitions and UI state
    console.log(`Phase transitioned from ${previousPhase} to ${phase}`)
  }

  // MODULAR: Event subscription system
  onPhaseChange(phase: GamePhase, callback: () => void): () => void {
    const phaseListeners = this.listeners.get(phase) || []
    phaseListeners.push(callback)
    this.listeners.set(phase, phaseListeners)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(phase) || []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // CLEAN: Simplified API - state management delegated to GameManager
  getCurrentPhase(): GamePhase {
    return this.currentPhase
  }

  // AGGRESSIVE CONSOLIDATION: Removed duplicate timer and state management
  // These are now handled by GameManager to follow DRY principle

  // CLEAN: Explicit cleanup - timer management delegated to GameManager
  destroy(): void {
    this.listeners.clear()
  }
}