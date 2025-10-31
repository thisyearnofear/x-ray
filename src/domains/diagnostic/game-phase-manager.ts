// CLEAN: Phase management integrated with GameManager (no duplicate state)
import { GameManager, GamePhase as GMGamePhase } from './GameManager';
import { DiagnosticUIManager } from './managers/DiagnosticUIManager';
import { AudioManager, SoundType } from '../../components/AudioManager';
import { XRayCanvas as Canvas } from '../../canvas';
import * as THREE from 'three';

export enum GamePhase {
  WELCOME = 'welcome',
  TUTORIAL = 'tutorial',
  EXPLORATION = 'exploration',
  READY = 'ready',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETE = 'complete',
  // Staged diagnostic workflow phases
  PATIENT_PRESENTATION = 'patient_presentation',
  INVESTIGATION = 'investigation',
  ANALYSIS = 'analysis',
  DIAGNOSIS = 'diagnosis'
}

// AGGRESSIVE CONSOLIDATION: Removed duplicate GameState interface
// State management is now handled by GameManager
export class GamePhaseManager {
  private currentPhase: GamePhase = GamePhase.WELCOME
  private listeners: Map<GamePhase, (() => void)[]> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()
  private gameManager: GameManager
  private diagnosticUIManager: DiagnosticUIManager | null = null;
  private audioManager: AudioManager | null = null;
  private canvas: Canvas | null = null;

  constructor(gameManager?: GameManager, diagnosticUIManager?: DiagnosticUIManager, audioManager?: AudioManager, canvas?: Canvas) {
    // ENHANCEMENT FIRST: Use existing GameManager instead of creating new state
    this.gameManager = gameManager || new GameManager()
    this.diagnosticUIManager = diagnosticUIManager || null;
    this.audioManager = audioManager || null;
    this.canvas = canvas || null;

    // Initialize listeners for all phases
    Object.values(GamePhase).forEach(phase => {
      this.listeners.set(phase, [])
    })
  }

  // CLEAN: Simplified phase transitions using GameManager state
  async transitionTo(newPhase: GamePhase): Promise<boolean> {
    // Allow same-phase transitions for welcome screen
    if (this.currentPhase === newPhase && newPhase === GamePhase.WELCOME) {
      console.log(`Same-phase transition allowed for WELCOME: ${this.currentPhase} -> ${newPhase}`)
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
    console.log(`Phase transition: ${previousPhase} -> ${newPhase}`)

    if (this.diagnosticUIManager) {
        const messageMap: Record<GamePhase, string> = {
            [GamePhase.WELCOME]: "Welcome to X-RAI",
            [GamePhase.TUTORIAL]: "Entering Tutorial Mode",
            [GamePhase.EXPLORATION]: "Exploration Mode",
            [GamePhase.READY]: "Get Ready!",
            [GamePhase.ACTIVE]: "Starting Diagnosis",
            [GamePhase.PAUSED]: "Game Paused",
            [GamePhase.COMPLETE]: "Diagnosis Complete",
            // Staged diagnostic workflow messages
            [GamePhase.PATIENT_PRESENTATION]: "Patient Presentation",
            [GamePhase.INVESTIGATION]: "Investigation Phase",
            [GamePhase.ANALYSIS]: "Analysis Phase",
            [GamePhase.DIAGNOSIS]: "Diagnosis Phase"
        };
        this.diagnosticUIManager.showTransitionOverlay(messageMap[newPhase]);
    }

    if (this.canvas) {
        const cameraPositions: Record<GamePhase, {position: THREE.Vector3, target: THREE.Vector3}> = {
            [GamePhase.WELCOME]: { position: new THREE.Vector3(0, 0, 15), target: new THREE.Vector3(0, 0, 0) },
            [GamePhase.TUTORIAL]: { position: new THREE.Vector3(0, 0, 10), target: new THREE.Vector3(0, 0, 0) },
            [GamePhase.EXPLORATION]: { position: new THREE.Vector3(5, 5, 5), target: new THREE.Vector3(0, 0, 0) },
            [GamePhase.READY]: { position: new THREE.Vector3(0, 0, 7), target: new THREE.Vector3(0, 0, 0) },
            [GamePhase.ACTIVE]: { position: new THREE.Vector3(0, 0, 7), target: new THREE.Vector3(0, 0, 0) },
            [GamePhase.PAUSED]: { position: new THREE.Vector3(0, 0, 7), target: new THREE.Vector3(0, 0, 0) },
            [GamePhase.COMPLETE]: { position: new THREE.Vector3(0, 0, 12), target: new THREE.Vector3(0, 0, 0) },
            // Staged diagnostic workflow camera positions
            [GamePhase.PATIENT_PRESENTATION]: { position: new THREE.Vector3(0, 0, 8), target: new THREE.Vector3(0, 0, 0) },
            [GamePhase.INVESTIGATION]: { position: new THREE.Vector3(3, 3, 6), target: new THREE.Vector3(0, 0, 0) },
            [GamePhase.ANALYSIS]: { position: new THREE.Vector3(0, 0, 7), target: new THREE.Vector3(0, 0, 0) },
            [GamePhase.DIAGNOSIS]: { position: new THREE.Vector3(0, 0, 9), target: new THREE.Vector3(0, 0, 0) }
        };
        const { position, target } = cameraPositions[newPhase];
        this.canvas.animateCameraTo(position, target);
    }

    if (this.audioManager) {
        const soundMap: Record<GamePhase, SoundType> = {
            [GamePhase.WELCOME]: SoundType.TUTORIAL_START,
            [GamePhase.TUTORIAL]: SoundType.TUTORIAL_PROGRESS,
            [GamePhase.EXPLORATION]: SoundType.TUTORIAL_PROGRESS,
            [GamePhase.READY]: SoundType.TUTORIAL_SUCCESS,
            [GamePhase.ACTIVE]: SoundType.MEDICAL_BEEP,
            [GamePhase.PAUSED]: SoundType.CLICK,
            [GamePhase.COMPLETE]: SoundType.DISCOVERY,
            // Staged diagnostic workflow sounds
            [GamePhase.PATIENT_PRESENTATION]: SoundType.TUTORIAL_START,
            [GamePhase.INVESTIGATION]: SoundType.MEDICAL_BEEP,
            [GamePhase.ANALYSIS]: SoundType.TUTORIAL_PROGRESS,
            [GamePhase.DIAGNOSIS]: SoundType.TUTORIAL_SUCCESS
        };
        this.audioManager.playSound(soundMap[newPhase]);
    }

    await this.animatePhaseTransition(newPhase, previousPhase);

    this.currentPhase = newPhase

    // Emit phase change event
    this.emit('phaseChanged', { newPhase, previousPhase })

    // Update phase in GameManager if available
    if (this.gameManager) {
      // Map GamePhaseManager phases to GameManager phases
      const phaseMap: Record<GamePhase, GMGamePhase> = {
        [GamePhase.ACTIVE]: GMGamePhase.SCANNING,
        [GamePhase.PAUSED]: GMGamePhase.SCANNING,
        [GamePhase.COMPLETE]: GMGamePhase.SOLVED,
        [GamePhase.WELCOME]: GMGamePhase.SCANNING,
        [GamePhase.TUTORIAL]: GMGamePhase.SCANNING,
        [GamePhase.EXPLORATION]: GMGamePhase.SCANNING,
        [GamePhase.READY]: GMGamePhase.SCANNING,
        // Map staged diagnostic phases to appropriate GameManager phases
        [GamePhase.PATIENT_PRESENTATION]: GMGamePhase.PATIENT_ARRIVAL,
        [GamePhase.INVESTIGATION]: GMGamePhase.INVESTIGATION,
        [GamePhase.ANALYSIS]: GMGamePhase.DIAGNOSIS,
        [GamePhase.DIAGNOSIS]: GMGamePhase.COMPLETED
      }
      const mappedPhase = phaseMap[newPhase] || GMGamePhase.SCANNING
      this.gameManager.updatePhase(mappedPhase)
    }

    // Trigger phase-specific actions
    this.onPhaseEnter(newPhase, previousPhase)

    // Notify listeners
    const phaseListeners = this.listeners.get(newPhase) || []
    phaseListeners.forEach(listener => listener())

    return true
  }

  private async animatePhaseTransition(newPhase: GamePhase, oldPhase: GamePhase): Promise<void> {
    const uiElement = this.diagnosticUIManager?.getUIElement();
    if (!uiElement) return;

    return new Promise(resolve => {
        uiElement.classList.add('fade-out');

        setTimeout(() => {
            // Update UI content for the new phase here

            uiElement.classList.remove('fade-out');
            uiElement.classList.add('fade-in');

            setTimeout(() => {
                uiElement.classList.remove('fade-in');
                resolve();
            }, 500);
        }, 500);
    });
  }

  // CLEAN: Clear validation rules for phase transitions
  private isValidTransition(from: GamePhase, to: GamePhase): boolean {
    const validTransitions: Record<GamePhase, GamePhase[]> = {
      [GamePhase.WELCOME]: [GamePhase.TUTORIAL, GamePhase.EXPLORATION, GamePhase.PATIENT_PRESENTATION],
      [GamePhase.TUTORIAL]: [GamePhase.WELCOME, GamePhase.EXPLORATION, GamePhase.READY, GamePhase.PATIENT_PRESENTATION],
      [GamePhase.EXPLORATION]: [GamePhase.READY, GamePhase.TUTORIAL, GamePhase.PATIENT_PRESENTATION],
      [GamePhase.READY]: [GamePhase.ACTIVE, GamePhase.EXPLORATION, GamePhase.PATIENT_PRESENTATION],
      [GamePhase.ACTIVE]: [GamePhase.PAUSED, GamePhase.COMPLETE, GamePhase.PATIENT_PRESENTATION],
      [GamePhase.PAUSED]: [GamePhase.ACTIVE, GamePhase.COMPLETE, GamePhase.PATIENT_PRESENTATION],
      [GamePhase.COMPLETE]: [GamePhase.WELCOME, GamePhase.READY, GamePhase.PATIENT_PRESENTATION],
      // Staged diagnostic workflow transitions
      [GamePhase.PATIENT_PRESENTATION]: [GamePhase.INVESTIGATION, GamePhase.WELCOME],
      [GamePhase.INVESTIGATION]: [GamePhase.ANALYSIS, GamePhase.PATIENT_PRESENTATION],
      [GamePhase.ANALYSIS]: [GamePhase.DIAGNOSIS, GamePhase.INVESTIGATION],
      [GamePhase.DIAGNOSIS]: [GamePhase.COMPLETE, GamePhase.ANALYSIS]
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

  // Event system for general events
  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event) || []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(callback => callback(data))
  }

  // CLEAN: Simplified API - state management delegated to GameManager
  getCurrentPhase(): GamePhase {
    return this.currentPhase
  }

  // AGGRESSIVE CONSOLIDATION: Removed duplicate timer and state management
  // These are now handled by GameManager to follow DRY principle

  // MODULAR: Allow updating GameManager after initialization
  public updateGameManager(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  // CLEAN: Explicit cleanup - timer management delegated to GameManager
  destroy(): void {
    this.listeners.clear()
  }
}