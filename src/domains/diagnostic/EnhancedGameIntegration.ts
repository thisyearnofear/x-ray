/**
 * Enhanced Game Integration Example
 * DEMONSTRATION: How to integrate all enhancement systems
 * EDUCATIONAL: Shows proper usage patterns and event handling
 */

import { EnhancedGameManager, GameAction, GameEvent } from './EnhancedGameManager'
import { MedicalCase } from '../medical/types'

export class EnhancedGameIntegration {
  private gameManager: EnhancedGameManager
  private uiUpdateCallbacks: Map<string, Function[]> = new Map()

  constructor(difficultyProfile: string = 'intermediate') {
    this.gameManager = new EnhancedGameManager(difficultyProfile)
    this.setupEventListeners()
    
    console.log('🎮 Enhanced Game Integration initialized')
  }

  private setupEventListeners(): void {
    // Listen for revelation events
    this.gameManager.addEventListener('revelation', (event: GameEvent) => {
      this.handleRevelationEvent(event)
    })

    // Listen for consultation completion
    this.gameManager.addEventListener('consultation_complete', (event: GameEvent) => {
      this.handleConsultationEvent(event)
    })

    // Listen for narrative choices
    this.gameManager.addEventListener('narrative_choice', (event: GameEvent) => {
      this.handleNarrativeEvent(event)
    })

    // Listen for difficulty adjustments
    this.gameManager.addEventListener('difficulty_adjusted', (event: GameEvent) => {
      this.handleDifficultyEvent(event)
    })

    // Listen for lab results
    this.gameManager.addEventListener('lab_result', (event: GameEvent) => {
      this.handleLabResultEvent(event)
    })
  }

  /**
   * Start a new enhanced medical case
   */
  public async startEnhancedCase(medicalCase: MedicalCase): Promise<void> {
    try {
      await this.gameManager.startCase(medicalCase)
      
      // Notify UI about case start
      this.notifyUI('case_started', {
        case: medicalCase,
        gameState: this.gameManager.getGameState()
      })
      
      console.log('🎮 Enhanced case started:', medicalCase.id)
    } catch (error) {
      console.error('Failed to start enhanced case:', error)
      throw error
    }
  }

  /**
   * Handle scanning with progressive revelation
   */
  public async handleScanAction(region: string, progress: number): Promise<void> {
    const action: GameAction = {
      type: 'scan',
      data: { region, progress },
      timestamp: Date.now(),
      region
    }

    try {
      const events = await this.gameManager.processAction(action)
      
      // Process revelation events
      events.forEach(event => {
        if (event.type === 'revelation') {
          this.notifyUI('scan_revelation', {
            region,
            progress,
            revealed: event.data.revealed,
            gameState: this.gameManager.getGameState()
          })
        }
      })
    } catch (error) {
      console.error('Failed to process scan action:', error)
    }
  }

  /**
   * Handle investigation technique usage
   */
  public async handleInvestigationAction(technique: string, region: string): Promise<void> {
    const action: GameAction = {
      type: 'investigate',
      data: { technique, region },
      timestamp: Date.now(),
      technique,
      region
    }

    try {
      const events = await this.gameManager.processAction(action)
      
      events.forEach(event => {
        if (event.type === 'revelation' && event.data.type === 'examination_result') {
          this.notifyUI('investigation_result', {
            technique,
            region,
            result: event.data.result,
            gameState: this.gameManager.getGameState()
          })
        }
      })
    } catch (error) {
      console.error('Failed to process investigation action:', error)
    }
  }

  /**
   * Handle specialist consultation request
   */
  public async handleConsultationAction(
    specialty: string, 
    clinicalQuestion: string, 
    findings: string[]
  ): Promise<void> {
    const action: GameAction = {
      type: 'consult',
      data: { specialty, clinicalQuestion, findings },
      timestamp: Date.now(),
      specialty
    }

    try {
      const events = await this.gameManager.processAction(action)
      
      events.forEach(event => {
        if (event.type === 'consultation_complete') {
          this.notifyUI('consultation_requested', {
            specialty,
            clinicalQuestion,
            request: event.data.request,
            gameState: this.gameManager.getGameState()
          })
        }
      })
    } catch (error) {
      console.error('Failed to process consultation action:', error)
    }
  }

  /**
   * Handle narrative decision making
   */
  public async handleNarrativeDecision(
    choiceId: string, 
    optionId: string, 
    reasoning?: string
  ): Promise<void> {
    const action: GameAction = {
      type: 'decide',
      data: { choiceId, optionId, reasoning },
      timestamp: Date.now()
    }

    try {
      const events = await this.gameManager.processAction(action)
      
      events.forEach(event => {
        if (event.type === 'narrative_choice') {
          this.notifyUI('narrative_decision', {
            decision: event.data.decision,
            consequences: event.data.consequences,
            gameState: this.gameManager.getGameState()
          })
        }
      })
    } catch (error) {
      console.error('Failed to process narrative decision:', error)
    }
  }

  /**
   * Handle final diagnosis submission
   */
  public async handleDiagnosisSubmission(
    selectedConditions: string[], 
    confidence: number
  ): Promise<void> {
    const action: GameAction = {
      type: 'diagnose',
      data: { selectedConditions, confidence },
      timestamp: Date.now()
    }

    try {
      const events = await this.gameManager.processAction(action)
      
      events.forEach(event => {
        if (event.type === 'revelation' && event.data.type === 'diagnosis_submitted') {
          this.notifyUI('diagnosis_completed', {
            accuracy: event.data.accuracy,
            timeEfficiency: event.data.timeEfficiency,
            selectedConditions: event.data.selectedConditions,
            correctConditions: event.data.correctConditions,
            gameState: this.gameManager.getGameState(),
            analytics: this.gameManager.getAnalyticsData()
          })
        }
      })
    } catch (error) {
      console.error('Failed to process diagnosis submission:', error)
    }
  }

  /**
   * Event handlers for different game events
   */
  private handleRevelationEvent(event: GameEvent): void {
    console.log('🔍 Revelation event:', event.data)
    
    if (event.data.type === 'case_started') {
      this.notifyUI('patient_backstory', {
        backstory: event.data.backstory,
        case: event.data.case
      })
    }
  }

  private handleConsultationEvent(event: GameEvent): void {
    console.log('👨‍⚕️ Consultation event:', event.data)
    
    if (event.data.consultation) {
      this.notifyUI('consultation_completed', {
        consultation: event.data.consultation,
        gameState: this.gameManager.getGameState()
      })
    }
  }

  private handleNarrativeEvent(event: GameEvent): void {
    console.log('📖 Narrative event:', event.data)
    
    if (event.data.choices) {
      this.notifyUI('narrative_choices_available', {
        choices: event.data.choices,
        gameState: this.gameManager.getGameState()
      })
    }
  }

  private handleDifficultyEvent(event: GameEvent): void {
    console.log('🎯 Difficulty adjusted:', event.data)
    
    this.notifyUI('difficulty_adjusted', {
      modification: event.data.modification,
      metrics: event.data.metrics,
      gameState: this.gameManager.getGameState()
    })
  }

  private handleLabResultEvent(event: GameEvent): void {
    console.log('🔬 Lab result:', event.data)
    
    this.notifyUI('lab_result_available', {
      result: event.data.result,
      gameState: this.gameManager.getGameState()
    })
  }

  /**
   * Register UI update callback
   */
  public onUIUpdate(eventType: string, callback: Function): void {
    if (!this.uiUpdateCallbacks.has(eventType)) {
      this.uiUpdateCallbacks.set(eventType, [])
    }
    this.uiUpdateCallbacks.get(eventType)!.push(callback)
  }

  /**
   * Notify UI components of updates
   */
  private notifyUI(eventType: string, data: any): void {
    const callbacks = this.uiUpdateCallbacks.get(eventType) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in UI callback:', error)
      }
    })

    // Dispatch browser custom event for diagnosis completion
    if (eventType === 'diagnosis_completed' && typeof window !== 'undefined') {
      const event = new CustomEvent('diagnosis-complete', {
        detail: {
          conditions: data.selectedConditions || [],
          accuracy: Math.round((data.accuracy || 0) * 100),
          timeEfficiency: data.timeEfficiency,
          correctConditions: data.correctConditions
        }
      })
      window.dispatchEvent(event)
      console.log('🏆 Diagnosis completion event dispatched to browser')
    }
  }

  /**
   * Get current game status
   */
  public getGameStatus(): any {
    return {
      systemStatus: this.gameManager.getSystemStatus(),
      gameState: this.gameManager.getGameState(),
      currentCase: this.gameManager.getCurrentCase(),
      actionHistory: this.gameManager.getActionHistory().slice(-10), // Last 10 actions
      eventHistory: this.gameManager.getEventHistory().slice(-10) // Last 10 events
    }
  }

  /**
   * Export comprehensive analytics
   */
  public exportAnalytics(): any {
    return this.gameManager.getAnalyticsData()
  }

  /**
   * Pause the game
   */
  public pauseGame(): void {
    this.gameManager.pause()
    this.notifyUI('game_paused', { timestamp: Date.now() })
  }

  /**
   * Resume the game
   */
  public resumeGame(): void {
    this.gameManager.resume()
    this.notifyUI('game_resumed', { timestamp: Date.now() })
  }

  /**
   * Reset the entire game system
   */
  public resetGame(): void {
    this.gameManager.reset()
    this.notifyUI('game_reset', { timestamp: Date.now() })
  }

  /**
   * Switch difficulty profile
   */
  public switchDifficultyProfile(profileName: string): boolean {
    // This would require extending the game manager to support profile switching
    // For now, we'll create a new game manager
    this.gameManager.reset()
    this.gameManager = new EnhancedGameManager(profileName)
    this.setupEventListeners()
    
    this.notifyUI('difficulty_profile_changed', { 
      profile: profileName, 
      timestamp: Date.now() 
    })
    
    return true
  }

  /**
   * Get available investigation techniques for a region
   */
  public getAvailableInvestigationTechniques(region: string): any[] {
    // Access through game manager's investigation toolkit
    const gameState = this.gameManager.getGameState()
    // This would require exposing the investigation toolkit
    // For now, return a placeholder
    return [
      { id: 'inspection', name: 'Visual Inspection', region },
      { id: 'palpation', name: 'Palpation', region },
      { id: 'auscultation', name: 'Auscultation', region }
    ]
  }

  /**
   * Get available medical specialties for consultation
   */
  public getAvailableSpecialties(): any[] {
    // Access through game manager's investigation toolkit
    return [
      { id: 'cardiology', name: 'Cardiology' },
      { id: 'neurology', name: 'Neurology' },
      { id: 'radiology', name: 'Radiology' },
      { id: 'oral_maxillofacial', name: 'Oral and Maxillofacial Surgery' }
    ]
  }

  /**
   * Get current narrative choices
   */
  public getCurrentNarrativeChoices(): any[] {
    const gameState = this.gameManager.getGameState()
    // This would require exposing the narrative system
    // For now, return a placeholder
    return []
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.gameManager.reset()
    this.uiUpdateCallbacks.clear()
    console.log('🎮 Enhanced Game Integration destroyed')
  }
}

// Example usage:
/*
const gameIntegration = new EnhancedGameIntegration('intermediate')

// Register UI callbacks
gameIntegration.onUIUpdate('case_started', (data) => {
  console.log('UI: Case started', data.case.id)
})

gameIntegration.onUIUpdate('scan_revelation', (data) => {
  console.log('UI: New findings revealed', data.revealed)
})

gameIntegration.onUIUpdate('consultation_completed', (data) => {
  console.log('UI: Consultation completed', data.consultation)
})

// Start a case
const medicalCase = {
  id: 'case-001',
  title: 'TMJ Dysfunction',
  // ... other case properties
}

await gameIntegration.startEnhancedCase(medicalCase)

// Handle user interactions
await gameIntegration.handleScanAction('head_neck', 0.5)
await gameIntegration.handleInvestigationAction('tmj_palpation', 'head_neck')
await gameIntegration.handleConsultationAction('oral_maxillofacial', 'TMJ evaluation', ['jaw pain', 'clicking'])
*/