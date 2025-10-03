// MODULAR: Game phase management for enhanced onboarding experience
export enum GamePhase {
  WELCOME = 'welcome',
  TUTORIAL = 'tutorial', 
  EXPLORATION = 'exploration',
  READY = 'ready',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETE = 'complete'
}

export interface GameState {
  phase: GamePhase
  score: number
  timeRemaining: number
  currentCase?: any
  explorationProgress: number
  tutorialStep: number
}

// CLEAN: Centralized phase management with clear state transitions
export class GamePhaseManager {
  private currentPhase: GamePhase = GamePhase.WELCOME
  private listeners: Map<GamePhase, (() => void)[]> = new Map()
  private state: GameState

  constructor() {
    this.state = {
      phase: GamePhase.WELCOME,
      score: 0,
      timeRemaining: 300, // 5 minutes default
      explorationProgress: 0,
      tutorialStep: 0
    }
    
    // Initialize listeners for all phases
    Object.values(GamePhase).forEach(phase => {
      this.listeners.set(phase, [])
    })
  }

  // PERFORMANT: Efficient phase transitions with validation
  transitionTo(newPhase: GamePhase): boolean {
    if (!this.isValidTransition(this.currentPhase, newPhase)) {
      console.warn(`Invalid transition from ${this.currentPhase} to ${newPhase}`)
      return false
    }

    const previousPhase = this.currentPhase
    this.currentPhase = newPhase
    this.state.phase = newPhase

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

  // DRY: Centralized phase entry logic
  private onPhaseEnter(phase: GamePhase, previousPhase: GamePhase): void {
    switch (phase) {
      case GamePhase.WELCOME:
        this.resetGameState()
        break
      case GamePhase.ACTIVE:
        this.startTimer()
        break
      case GamePhase.PAUSED:
        this.pauseTimer()
        break
      case GamePhase.COMPLETE:
        this.stopTimer()
        break
    }
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

  // PERFORMANT: Efficient state management
  updateState(updates: Partial<GameState>): void {
    this.state = { ...this.state, ...updates }
  }

  getState(): Readonly<GameState> {
    return { ...this.state }
  }

  getCurrentPhase(): GamePhase {
    return this.currentPhase
  }

  // Timer management methods
  private timerInterval?: number

  private startTimer(): void {
    this.stopTimer() // Clear any existing timer
    this.timerInterval = window.setInterval(() => {
      if (this.state.timeRemaining > 0) {
        this.updateState({ timeRemaining: this.state.timeRemaining - 1 })
      } else {
        this.transitionTo(GamePhase.COMPLETE)
      }
    }, 1000)
  }

  private pauseTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = undefined
    }
  }

  private stopTimer(): void {
    this.pauseTimer()
  }

  private resetGameState(): void {
    this.updateState({
      score: 0,
      timeRemaining: 300,
      explorationProgress: 0,
      tutorialStep: 0,
      currentCase: undefined
    })
  }

  // CLEAN: Explicit cleanup
  destroy(): void {
    this.stopTimer()
    this.listeners.clear()
  }
}