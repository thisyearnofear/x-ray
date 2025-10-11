/**
 * Enhanced Game Manager
 * INTEGRATION: Orchestrates all enhancement systems
 * INTELLIGENT: Coordinates adaptive difficulty, progressive revelation, investigation tools, and narrative depth
 * EDUCATIONAL: Provides comprehensive medical mystery game experience
 */

import { MedicalCase } from '../medical/types'
import { AdaptiveDifficultyEngine } from '../adaptation/AdaptiveDifficultyEngine'
import { BranchingNarrativeSystem, GameState } from '../adaptation/BranchingNarrativeSystem'
import { ProgressiveRevelationManager, RevelationContext } from '../revelation/ProgressiveRevelationManager'
import { InvestigationToolkit } from '../investigation/InvestigationToolkit'
import { NarrativeManager, ClinicalContext } from '../narrative/NarrativeManager'
import {
  PlayerPerformance,
  PlayerDecision,
  CaseModification,
  NarrativeChoice
} from '../adaptation/types'

export interface EnhancedGameState extends GameState {
  // Enhanced state properties
  adaptiveDifficulty: {
    currentLevel: number
    targetLevel: number
    confidence: number
  }
  revelation: {
    totalRevealed: number
    redHerringsEncountered: number
    clinicalJudgmentAccuracy: number
  }
  investigation: {
    techniquesUsed: string[]
    consultationsRequested: string[]
    labTestsOrdered: string[]
    pendingResults: number
  }
  narrative: {
    backstoryRevealed: boolean
    ethicalChoicesMade: number
    patientSatisfaction: number
    longTermOutcomeTracked: boolean
  }
  performance: PlayerPerformance
  sessionMetrics: {
    startTime: number
    totalTime: number
    actionsPerformed: number
    mistakeCount: number
  }
}

export interface GameAction {
  type: 'scan' | 'investigate' | 'consult' | 'decide' | 'diagnose'
  data: any
  timestamp: number
  region?: string
  technique?: string
  specialty?: string
}

export interface GameEvent {
  type: 'revelation' | 'consultation_complete' | 'lab_result' | 'narrative_choice' | 'difficulty_adjusted'
  data: any
  timestamp: number
  impact: 'low' | 'medium' | 'high'
}

export class EnhancedGameManager {
  private adaptiveDifficulty: AdaptiveDifficultyEngine
  private branchingNarrative: BranchingNarrativeSystem
  private progressiveRevelation: ProgressiveRevelationManager
  private investigationToolkit: InvestigationToolkit
  private narrativeManager: NarrativeManager
  
  private currentCase: MedicalCase | null = null
  private gameState: EnhancedGameState
  private actionHistory: GameAction[] = []
  private eventHistory: GameEvent[] = []
  private isGameActive: boolean = false
  
  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map()

  constructor(initialDifficultyProfile: string = 'intermediate') {
    this.adaptiveDifficulty = new AdaptiveDifficultyEngine(initialDifficultyProfile)
    this.branchingNarrative = new BranchingNarrativeSystem()
    this.progressiveRevelation = new ProgressiveRevelationManager()
    this.investigationToolkit = new InvestigationToolkit()
    this.narrativeManager = new NarrativeManager()
    
    this.gameState = this.initializeGameState()
    
    console.log('🎮 EnhancedGameManager initialized')
  }

  private initializeGameState(): EnhancedGameState {
    return {
      currentPhase: 'welcome',
      discoveredConditions: new Set(),
      investigationsCompleted: [],
      ethicalChoicesMade: [],
      narrativePath: [],
      caseModifications: [],
      playerReputation: {
        clinical: 0.5,
        ethical: 0.5,
        efficiency: 0.5
      },
      adaptiveDifficulty: {
        currentLevel: 0.5,
        targetLevel: 0.5,
        confidence: 0.3
      },
      revelation: {
        totalRevealed: 0,
        redHerringsEncountered: 0,
        clinicalJudgmentAccuracy: 0.5
      },
      investigation: {
        techniquesUsed: [],
        consultationsRequested: [],
        labTestsOrdered: [],
        pendingResults: 0
      },
      narrative: {
        backstoryRevealed: false,
        ethicalChoicesMade: 0,
        patientSatisfaction: 0.5,
        longTermOutcomeTracked: false
      },
      performance: {
        diagnosticAccuracy: 0.5,
        timeEfficiency: 0.5,
        consultationUsage: 0.5,
        ethicalChoiceAlignment: 0.5,
        investigationThoroughness: 0.5,
        caseCompletionRate: 0.5,
        averageSessionTime: 15,
        mistakeFrequency: 0.3,
        learningProgress: 0.3
      },
      sessionMetrics: {
        startTime: Date.now(),
        totalTime: 0,
        actionsPerformed: 0,
        mistakeCount: 0
      }
    }
  }

  /**
   * Start a new medical case
   */
  public async startCase(medicalCase: MedicalCase): Promise<void> {
    this.currentCase = medicalCase
    this.isGameActive = true
    this.gameState = this.initializeGameState()
    this.gameState.sessionMetrics.startTime = Date.now()
    
    // Initialize all systems with the new case
    this.branchingNarrative.setCurrentCase(medicalCase)
    
    // Generate patient backstory
    const patientHistory = this.narrativeManager.generatePatientBackstory(medicalCase)
    this.gameState.narrative.backstoryRevealed = true
    
    // Set revelation context
    const revelationContext: RevelationContext = {
      currentCase: medicalCase,
      investigationHistory: [],
      playerSkillLevel: this.gameState.performance.diagnosticAccuracy,
      timeElapsed: 0,
      difficultyModifier: this.gameState.adaptiveDifficulty.currentLevel
    }
    this.progressiveRevelation.setRevelationContext(revelationContext)
    
    // Emit case started event
    this.emitEvent({
      type: 'revelation',
      data: { type: 'case_started', case: medicalCase.id, backstory: patientHistory },
      timestamp: Date.now(),
      impact: 'high'
    })
    
    console.log('🎮 Started case:', medicalCase.id)
  }

  /**
   * Process player action and update game state
   */
  public async processAction(action: GameAction): Promise<GameEvent[]> {
    if (!this.isGameActive || !this.currentCase) {
      throw new Error('No active game session')
    }
    
    this.actionHistory.push(action)
    this.gameState.sessionMetrics.actionsPerformed++
    
    const events: GameEvent[] = []
    
    switch (action.type) {
      case 'scan':
        events.push(...await this.processScanAction(action))
        break
      case 'investigate':
        events.push(...await this.processInvestigateAction(action))
        break
      case 'consult':
        events.push(...await this.processConsultAction(action))
        break
      case 'decide':
        events.push(...await this.processDecideAction(action))
        break
      case 'diagnose':
        events.push(...await this.processDiagnoseAction(action))
        break
    }
    
    // Update game state based on events
    this.updateGameStateFromEvents(events)
    
    // Check for adaptive difficulty adjustment
    if (this.shouldAdjustDifficulty()) {
      const difficultyEvent = await this.adjustDifficulty()
      if (difficultyEvent) events.push(difficultyEvent)
    }
    
    // Check for narrative choices
    const narrativeChoices = this.checkForNarrativeChoices()
    if (narrativeChoices.length > 0) {
      events.push({
        type: 'narrative_choice',
        data: { choices: narrativeChoices },
        timestamp: Date.now(),
        impact: 'medium'
      })
    }
    
    // Store events
    this.eventHistory.push(...events)
    
    return events
  }

  private async processScanAction(action: GameAction): Promise<GameEvent[]> {
    const events: GameEvent[] = []
    const { region, progress } = action.data
    
    // Process progressive revelation
    const revealedData = this.progressiveRevelation.unlockInformation(region, progress)
    
    if (revealedData.length > 0) {
      this.gameState.revelation.totalRevealed += revealedData.length
      
      events.push({
        type: 'revelation',
        data: { region, revealed: revealedData },
        timestamp: Date.now(),
        impact: 'medium'
      })
      
      // Check for red herrings
      const regionFindings = this.progressiveRevelation.getRegionFindings(region)
      if (regionFindings.redHerrings.length > 0) {
        this.gameState.revelation.redHerringsEncountered += regionFindings.redHerrings.length
      }
    }
    
    return events
  }

  private async processInvestigateAction(action: GameAction): Promise<GameEvent[]> {
    const events: GameEvent[] = []
    const { technique, region } = action.data
    
    // Get available techniques
    const availableTechniques = this.investigationToolkit.getAvailableTechniques(region)
    const selectedTechnique = availableTechniques.find(t => t.id === technique)
    
    if (selectedTechnique) {
      this.gameState.investigation.techniquesUsed.push(technique)
      
      // Perform examination
      const examResult = await this.investigationToolkit.performSpecializedExam(selectedTechnique, region)
      
      events.push({
        type: 'revelation',
        data: { type: 'examination_result', technique, result: examResult },
        timestamp: Date.now(),
        impact: 'medium'
      })
    }
    
    return events
  }

  private async processConsultAction(action: GameAction): Promise<GameEvent[]> {
    const events: GameEvent[] = []
    const { specialty, clinicalQuestion, findings } = action.data
    
    this.gameState.investigation.consultationsRequested.push(specialty)
    this.gameState.investigation.pendingResults++
    
    // Request consultation
    const consultRequest = this.investigationToolkit.requestSpecialistConsult(
      specialty,
      findings,
      clinicalQuestion,
      'routine'
    )
    
    // Simulate consultation response (in real implementation, this would be async)
    setTimeout(() => {
      const consultHistory = this.investigationToolkit.getConsultationHistory()
      const latestConsult = consultHistory[consultHistory.length - 1]
      
      if (latestConsult) {
        this.gameState.investigation.pendingResults--
        
        this.emitEvent({
          type: 'consultation_complete',
          data: { consultation: latestConsult },
          timestamp: Date.now(),
          impact: 'high'
        })
      }
    }, 5000) // 5 second delay for demo
    
    events.push({
      type: 'consultation_complete',
      data: { type: 'consultation_requested', specialty, request: consultRequest },
      timestamp: Date.now(),
      impact: 'medium'
    })
    
    return events
  }

  private async processDecideAction(action: GameAction): Promise<GameEvent[]> {
    const events: GameEvent[] = []
    const { choiceId, optionId, reasoning } = action.data
    
    const decision: PlayerDecision = {
      choiceId,
      optionId,
      timestamp: Date.now(),
      timeToDecide: action.timestamp - this.gameState.sessionMetrics.startTime,
      context: 'game_decision',
      reasoning
    }
    
    // Process decision through narrative system
    const consequences = this.branchingNarrative.processPlayerDecision(decision)
    this.gameState.narrative.ethicalChoicesMade++
    
    // Track decision for adaptive difficulty
    this.adaptiveDifficulty.trackPlayerDecision(decision)
    
    events.push({
      type: 'narrative_choice',
      data: { decision, consequences },
      timestamp: Date.now(),
      impact: 'high'
    })
    
    return events
  }

  private async processDiagnoseAction(action: GameAction): Promise<GameEvent[]> {
    const events: GameEvent[] = []
    const { selectedConditions, confidence } = action.data
    
    // Calculate diagnostic accuracy
    // Handle both MedicalCase and PatientCase types
    const correctConditions = (this.currentCase as any)?.conditions || 
                             (this.currentCase as any)?.diagnosticHypothesis || 
                             []
    const accuracy = this.calculateDiagnosticAccuracy(selectedConditions, correctConditions)
    
    this.gameState.performance.diagnosticAccuracy = accuracy
    this.gameState.sessionMetrics.totalTime = Date.now() - this.gameState.sessionMetrics.startTime
    
    // Calculate time efficiency
    const timeEfficiency = this.calculateTimeEfficiency(this.gameState.sessionMetrics.totalTime)
    this.gameState.performance.timeEfficiency = timeEfficiency
    
    // End game session
    this.isGameActive = false
    
    events.push({
      type: 'revelation',
      data: { 
        type: 'diagnosis_submitted', 
        accuracy, 
        timeEfficiency,
        selectedConditions,
        correctConditions
      },
      timestamp: Date.now(),
      impact: 'high'
    })
    
    return events
  }

  private calculateDiagnosticAccuracy(selected: string[], correct: string[]): number {
    if (correct.length === 0) return 1.0
    
    const correctlySelected = selected.filter(condition => correct.includes(condition))
    const incorrectlySelected = selected.filter(condition => !correct.includes(condition))
    const missed = correct.filter(condition => !selected.includes(condition))
    
    // Calculate accuracy: (correct selections - incorrect selections - missed) / total possible
    const score = (correctlySelected.length - incorrectlySelected.length - missed.length) / correct.length
    return Math.max(0, Math.min(1, score))
  }

  private calculateTimeEfficiency(totalTime: number): number {
    // Assume optimal time is 10 minutes (600,000 ms)
    const optimalTime = 600000
    const efficiency = Math.max(0, Math.min(1, optimalTime / totalTime))
    return efficiency
  }

  private updateGameStateFromEvents(events: GameEvent[]): void {
    events.forEach(event => {
      switch (event.type) {
        case 'revelation':
          if (event.data.type === 'examination_result') {
            this.gameState.investigation.techniquesUsed.push(event.data.technique)
          }
          break
        case 'consultation_complete':
          if (event.data.consultation) {
            this.gameState.investigation.pendingResults = Math.max(0, this.gameState.investigation.pendingResults - 1)
          }
          break
        case 'narrative_choice':
          if (event.data.decision) {
            this.gameState.ethicalChoicesMade.push(event.data.decision)
          }
          break
      }
    })
    
    // Update performance metrics
    this.updatePerformanceMetrics()
  }

  private updatePerformanceMetrics(): void {
    // Update investigation thoroughness
    const totalTechniques = this.investigationToolkit.getAvailableTechniques('general').length
    this.gameState.performance.investigationThoroughness = 
      this.gameState.investigation.techniquesUsed.length / totalTechniques
    
    // Update consultation usage
    this.gameState.performance.consultationUsage = 
      this.gameState.investigation.consultationsRequested.length / 5 // Assume 5 is optimal
    
    // Update ethical choice alignment (simplified)
    this.gameState.performance.ethicalChoiceAlignment = 
      this.gameState.narrative.ethicalChoicesMade > 0 ? 0.8 : 0.5
  }

  private shouldAdjustDifficulty(): boolean {
    // Adjust difficulty every 10 actions
    return this.actionHistory.length % 10 === 0 && this.actionHistory.length > 0
  }

  private async adjustDifficulty(): Promise<GameEvent | null> {
    const caseModification = this.adaptiveDifficulty.adjustDifficulty(this.gameState.performance)
    
    this.gameState.caseModifications.push(caseModification)
    this.gameState.adaptiveDifficulty = {
      currentLevel: this.adaptiveDifficulty.getAdaptationMetrics().currentDifficultyLevel,
      targetLevel: this.adaptiveDifficulty.getAdaptationMetrics().optimalDifficultyLevel,
      confidence: this.adaptiveDifficulty.getAdaptationMetrics().adaptationConfidence
    }
    
    return {
      type: 'difficulty_adjusted',
      data: { modification: caseModification, metrics: this.gameState.adaptiveDifficulty },
      timestamp: Date.now(),
      impact: 'medium'
    }
  }

  private checkForNarrativeChoices(): NarrativeChoice[] {
    return this.branchingNarrative.generateBranchingOptions(this.gameState)
  }

  /**
   * Get current game state
   */
  public getGameState(): EnhancedGameState {
    return { ...this.gameState }
  }

  /**
   * Get current medical case
   */
  public getCurrentCase(): MedicalCase | null {
    return this.currentCase
  }

  /**
   * Get action history
   */
  public getActionHistory(): GameAction[] {
    return [...this.actionHistory]
  }

  /**
   * Get event history
   */
  public getEventHistory(): GameEvent[] {
    return [...this.eventHistory]
  }

  /**
   * Add event listener
   */
  public addEventListener(eventType: string, listener: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)
  }

  /**
   * Remove event listener
   */
  public removeEventListener(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: GameEvent): void {
    const listeners = this.eventListeners.get(event.type) || []
    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  /**
   * Get comprehensive analytics data
   */
  public getAnalyticsData(): any {
    return {
      gameState: this.gameState,
      currentCase: this.currentCase?.id,
      actionHistory: this.actionHistory,
      eventHistory: this.eventHistory,
      adaptiveDifficulty: this.adaptiveDifficulty.exportAdaptationData(),
      branchingNarrative: this.branchingNarrative.exportNarrativeData(),
      progressiveRevelation: this.progressiveRevelation.exportRevelationData(),
      investigationToolkit: this.investigationToolkit.exportInvestigationData(),
      narrativeManager: this.narrativeManager.exportNarrativeData(),
      timestamp: Date.now()
    }
  }

  /**
   * Reset all systems
   */
  public reset(): void {
    this.adaptiveDifficulty.reset()
    this.branchingNarrative.reset()
    this.progressiveRevelation.reset()
    this.investigationToolkit.reset()
    this.narrativeManager.reset()
    
    this.currentCase = null
    this.gameState = this.initializeGameState()
    this.actionHistory = []
    this.eventHistory = []
    this.isGameActive = false
    
    console.log('🎮 EnhancedGameManager reset')
  }

  /**
   * Pause game
   */
  public pause(): void {
    this.isGameActive = false
    console.log('🎮 Game paused')
  }

  /**
   * Resume game
   */
  public resume(): void {
    if (this.currentCase) {
      this.isGameActive = true
      console.log('🎮 Game resumed')
    }
  }

  /**
   * Get system status
   */
  public getSystemStatus(): any {
    return {
      isGameActive: this.isGameActive,
      currentCase: this.currentCase?.id,
      totalActions: this.actionHistory.length,
      totalEvents: this.eventHistory.length,
      adaptiveDifficulty: {
        currentLevel: this.gameState.adaptiveDifficulty.currentLevel,
        confidence: this.gameState.adaptiveDifficulty.confidence
      },
      investigation: {
        pendingResults: this.gameState.investigation.pendingResults,
        techniquesUsed: this.gameState.investigation.techniquesUsed.length
      },
      narrative: {
        ethicalChoicesMade: this.gameState.narrative.ethicalChoicesMade,
        patientSatisfaction: this.gameState.narrative.patientSatisfaction
      }
    }
  }
}