// INTEGRATION: Gamified diagnostic system orchestrating streaming UI and advanced Cerebras features

import { StreamingDiagnosticUI } from './streaming-diagnostic-ui'
import { CerebrasService } from '../medical/cerebras-service-enhanced'
import type { MedicalCondition } from '../medical/medical-data'

interface GameProgress {
  currentLevel: number
  xpPoints: number
  conditionsDiscovered: string[]
  achievementsUnlocked: string[]
  diagnosticStreak: number
  totalDiagnoses: number
}

interface DiagnosticSession {
  sessionId: string
  patientCase: PatientCase
  startTime: number
  progress: DiagnosticPhase
  userInteractions: UserInteraction[]
  aiInsights: AIInsight[]
}

interface PatientCase {
  id: string
  name: string
  age: number
  context: string
  symptoms: string[]
  findings: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  expectedConditions: MedicalCondition[]
}

interface DiagnosticPhase {
  current: 'initial_assessment' | 'streaming_analysis' | 'interactive_exploration' | 'confidence_validation' | 'learning_summary'
  completedPhases: string[]
  phaseProgress: number
}

interface UserInteraction {
  timestamp: number
  type: 'face_upload' | 'condition_click' | 'ai_question' | 'confidence_check' | 'achievement_unlock'
  data: any
  aiResponse?: string
}

interface AIInsight {
  timestamp: number
  type: 'streaming_diagnosis' | 'structured_analysis' | 'tool_assisted_explanation' | 'confidence_assessment'
  content: string
  confidence?: number
  tokensUsed?: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (progress: GameProgress, session: DiagnosticSession) => boolean
  xpReward: number
}

export class GamifiedDiagnosticSystem {
  private ui: StreamingDiagnosticUI
  private cerebras: CerebrasService
  private currentSession: DiagnosticSession | null = null
  private gameProgress: GameProgress
  private achievements: Achievement[]

  constructor() {
    this.ui = new StreamingDiagnosticUI()
    this.cerebras = new CerebrasService()
    
    this.gameProgress = this.loadGameProgress()
    this.achievements = this.initializeAchievements()
    
    this.setupEventListeners()
    this.displayWelcomeUI()
  }

  // MAIN FLOW: Start comprehensive diagnostic experience
  async startDiagnosticGame(patientCase: PatientCase, faceImage?: File): Promise<void> {
    // Initialize new diagnostic session
    this.currentSession = {
      sessionId: this.generateSessionId(),
      patientCase,
      startTime: Date.now(),
      progress: {
        current: 'initial_assessment',
        completedPhases: [],
        phaseProgress: 0
      },
      userInteractions: [],
      aiInsights: []
    }

    console.log('🎮 Starting Gamified Diagnostic Experience')
    
    // Phase 1: Initial Assessment (with optional face morph)
    await this.runInitialAssessmentPhase(faceImage)
    
    // Phase 2: Streaming Analysis
    await this.runStreamingAnalysisPhase()
    
    // Phase 3: Interactive Exploration
    await this.runInteractiveExplorationPhase()
    
    // Phase 4: Confidence Validation
    await this.runConfidenceValidationPhase()
    
    // Phase 5: Learning Summary & Rewards
    await this.runLearningSummaryPhase()
  }

  // PHASE 1: Initial assessment with face morphing integration
  private async runInitialAssessmentPhase(faceImage?: File): Promise<void> {
    this.updatePhase('initial_assessment', 0)
    
    if (faceImage) {
      await this.processFaceUpload(faceImage)
    }
    
    // Display case information with gamified elements
    this.displayCaseInformation()
    
    // Record user interaction
    this.recordUserInteraction('face_upload', { hasFaceImage: !!faceImage })
    
    await this.waitForUserReadiness()
    this.completePhase('initial_assessment')
  }

  // PHASE 2: Real-time streaming diagnostic analysis
  private async runStreamingAnalysisPhase(): Promise<void> {
    this.updatePhase('streaming_analysis', 0)
    
    const { patientCase } = this.currentSession!
    
    // Show achievement notification for starting streaming
    this.checkAndUnlockAchievement('first_streaming_diagnosis')
    
    // Start streaming analysis with gamified UI feedback
    await this.ui.startStreamingDiagnosis(
      patientCase.context,
      patientCase.symptoms,
      patientCase.findings
    )
    
    // Record AI insight
    this.recordAIInsight('streaming_diagnosis', 'Real-time diagnostic streaming completed')
    
    this.completePhase('streaming_analysis')
    await new Promise(resolve => setTimeout(resolve, 2000)) // Brief pause for user to absorb
  }

  // PHASE 3: Interactive exploration with condition discovery
  private async runInteractiveExplorationPhase(): Promise<void> {
    this.updatePhase('interactive_exploration', 0)
    
    const { expectedConditions } = this.currentSession!.patientCase
    
    // Allow user to explore each detected condition interactively
    for (let i = 0; i < expectedConditions.length; i++) {
      const condition = expectedConditions[i]
      
      console.log(`🔍 Exploring condition ${i + 1}/${expectedConditions.length}: ${condition.name}`)
      
      // Start interactive session for this condition
      await this.ui.startInteractiveSession(
        condition,
        `Tell me more about ${condition.name} and how to recognize it in medical imaging.`
      )
      
      // Award discovery XP
      this.awardDiscoveryXP(condition)
      
      // Update phase progress
      this.updatePhaseProgress((i + 1) / expectedConditions.length * 100)
      
      // Wait for user interaction or auto-continue
      await this.waitForConditionExploration(condition)
    }
    
    this.completePhase('interactive_exploration')
  }

  // PHASE 4: Confidence validation and uncertainty handling
  private async runConfidenceValidationPhase(): Promise<void> {
    this.updatePhase('confidence_validation', 0)
    
    const { patientCase } = this.currentSession!
    const primaryDiagnosis = patientCase.expectedConditions[0]?.name || 'Multiple conditions detected'
    
    // Get structured diagnosis with confidence scoring
    await this.ui.showStructuredDiagnosis(
      patientCase.context,
      patientCase.findings
    )
    
    // Get additional confidence assessment
    const confidenceResult = await this.cerebras.getClinicalConfidence(
      primaryDiagnosis,
      patientCase.findings
    )
    
    if (confidenceResult.success && confidenceResult.data) {
      this.displayConfidenceAssessment(confidenceResult.data)
      this.recordAIInsight('confidence_assessment', 
        `Confidence: ${confidenceResult.data.confidence}%, Uncertainties: ${confidenceResult.data.uncertainties.length}`)
    }
    
    this.completePhase('confidence_validation')
  }

  // PHASE 5: Learning summary with rewards and achievements
  private async runLearningSummaryPhase(): Promise<void> {
    this.updatePhase('learning_summary', 0)
    
    const sessionDuration = Date.now() - this.currentSession!.startTime
    const sessionXP = this.calculateSessionXP()
    
    // Update game progress
    this.gameProgress.totalDiagnoses += 1
    this.gameProgress.xpPoints += sessionXP
    
    // Check for achievements
    this.checkAllAchievements()
    
    // Display comprehensive learning summary
    this.displayLearningSummary(sessionDuration, sessionXP)
    
    // Save progress
    this.saveGameProgress()
    
    this.completePhase('learning_summary')
    
    console.log('🎉 Diagnostic game session completed!')
  }

  private async processFaceUpload(faceImage: File): Promise<void> {
    // Integration point with face morphing system
    console.log('📸 Processing face upload for 3D morphing...')
    
    // This would integrate with the existing face detection/morphing code
    // For now, simulate the processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('✅ Face morphing applied to 3D model')
    
    // Award XP for face upload
    this.gameProgress.xpPoints += 50
    this.checkAndUnlockAchievement('first_face_morph')
  }

  private displayCaseInformation(): void {
    const { patientCase } = this.currentSession!
    
    console.log('📋 Case Information:')
    console.log(`Patient: ${patientCase.name}, Age: ${patientCase.age}`)
    console.log(`Difficulty: ${patientCase.difficulty}`)
    console.log(`Context: ${patientCase.context}`)
    console.log(`Symptoms: ${patientCase.symptoms.join(', ')}`)
    console.log(`Findings: ${patientCase.findings.join(', ')}`)
  }

  private awardDiscoveryXP(condition: MedicalCondition): void {
    const baseXP = 100
    const bonusXP = this.currentSession!.patientCase.difficulty === 'advanced' ? 50 : 
                   this.currentSession!.patientCase.difficulty === 'intermediate' ? 25 : 0
    
    const totalXP = baseXP + bonusXP
    this.gameProgress.xpPoints += totalXP
    
    // Add to discovered conditions if new
    if (!this.gameProgress.conditionsDiscovered.includes(condition.name)) {
      this.gameProgress.conditionsDiscovered.push(condition.name)
      console.log(`🆕 New condition discovered: ${condition.name} (+${totalXP} XP)`)
    }
  }

  private displayConfidenceAssessment(assessment: { confidence: number; uncertainties: string[]; recommendations: string[] }): void {
    console.log('🎯 Confidence Assessment:')
    console.log(`Overall Confidence: ${assessment.confidence}%`)
    console.log(`Uncertainties: ${assessment.uncertainties.join(', ')}`)
    console.log(`Recommendations: ${assessment.recommendations.join(', ')}`)
  }

  private displayLearningSummary(duration: number, xpGained: number): void {
    const durationMinutes = Math.round(duration / 60000)
    
    console.log('📊 Learning Summary:')
    console.log(`Session Duration: ${durationMinutes} minutes`)
    console.log(`XP Gained: ${xpGained}`)
    console.log(`Total XP: ${this.gameProgress.xpPoints}`)
    console.log(`Level: ${this.gameProgress.currentLevel}`)
    console.log(`Conditions Discovered: ${this.gameProgress.conditionsDiscovered.length}`)
    console.log(`Total Diagnoses: ${this.gameProgress.totalDiagnoses}`)
  }

  private initializeAchievements(): Achievement[] {
    return [
      {
        id: 'first_face_morph',
        name: 'Face Morphing Pioneer',
        description: 'Upload your first face for 3D morphing',
        icon: '📸',
        condition: (progress) => progress.totalDiagnoses >= 1,
        xpReward: 100
      },
      {
        id: 'first_streaming_diagnosis',
        name: 'Real-time Analyst',
        description: 'Complete your first streaming diagnostic analysis',
        icon: '🔄',
        condition: (progress) => progress.totalDiagnoses >= 1,
        xpReward: 150
      },
      {
        id: 'condition_explorer',
        name: 'Condition Explorer',
        description: 'Discover 10 different medical conditions',
        icon: '🔍',
        condition: (progress) => progress.conditionsDiscovered.length >= 10,
        xpReward: 500
      },
      {
        id: 'diagnostic_streak',
        name: 'Diagnostic Streak',
        description: 'Complete 5 diagnoses in a row',
        icon: '🔥',
        condition: (progress) => progress.diagnosticStreak >= 5,
        xpReward: 300
      },
      {
        id: 'expert_level',
        name: 'Expert Radiologist',
        description: 'Reach level 10',
        icon: '👨‍⚕️',
        condition: (progress) => progress.currentLevel >= 10,
        xpReward: 1000
      }
    ]
  }

  private checkAndUnlockAchievement(achievementId: string): void {
    const achievement = this.achievements.find(a => a.id === achievementId)
    
    if (achievement && !this.gameProgress.achievementsUnlocked.includes(achievementId)) {
      if (achievement.condition(this.gameProgress, this.currentSession!)) {
        this.gameProgress.achievementsUnlocked.push(achievementId)
        this.gameProgress.xpPoints += achievement.xpReward
        
        console.log(`🏆 Achievement Unlocked: ${achievement.name}`)
        console.log(`${achievement.icon} ${achievement.description} (+${achievement.xpReward} XP)`)
        
        this.recordUserInteraction('achievement_unlock', { achievementId, xpReward: achievement.xpReward })
      }
    }
  }

  private checkAllAchievements(): void {
    for (const achievement of this.achievements) {
      this.checkAndUnlockAchievement(achievement.id)
    }
    
    // Update level based on XP
    const newLevel = Math.floor(this.gameProgress.xpPoints / 1000) + 1
    if (newLevel > this.gameProgress.currentLevel) {
      this.gameProgress.currentLevel = newLevel
      console.log(`🆙 Level Up! You are now level ${newLevel}`)
    }
  }

  private calculateSessionXP(): number {
    if (!this.currentSession) return 0
    
    const baseXP = 200
    const difficultyMultiplier = {
      'beginner': 1,
      'intermediate': 1.5,
      'advanced': 2
    }
    
    const difficulty = this.currentSession.patientCase.difficulty
    const multiplier = difficultyMultiplier[difficulty]
    
    return Math.round(baseXP * multiplier)
  }

  private updatePhase(phase: DiagnosticPhase['current'], progress: number): void {
    if (this.currentSession) {
      this.currentSession.progress.current = phase
      this.currentSession.progress.phaseProgress = progress
      console.log(`🎯 Phase: ${phase} (${progress}%)`)
    }
  }

  private updatePhaseProgress(progress: number): void {
    if (this.currentSession) {
      this.currentSession.progress.phaseProgress = progress
    }
  }

  private completePhase(phase: string): void {
    if (this.currentSession) {
      this.currentSession.progress.completedPhases.push(phase)
      console.log(`✅ Completed phase: ${phase}`)
    }
  }

  private recordUserInteraction(type: UserInteraction['type'], data: any): void {
    if (this.currentSession) {
      this.currentSession.userInteractions.push({
        timestamp: Date.now(),
        type,
        data
      })
    }
  }

  private recordAIInsight(type: AIInsight['type'], content: string, confidence?: number, tokensUsed?: number): void {
    if (this.currentSession) {
      this.currentSession.aiInsights.push({
        timestamp: Date.now(),
        type,
        content,
        confidence,
        tokensUsed
      })
    }
  }

  private async waitForUserReadiness(): Promise<void> {
    // Simulate waiting for user interaction
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  private async waitForConditionExploration(condition: MedicalCondition): Promise<void> {
    // Simulate waiting for user to explore condition
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadGameProgress(): GameProgress {
    // Load from localStorage or initialize default
    const saved = localStorage.getItem('xray-game-progress')
    
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.warn('Failed to load game progress, using defaults')
      }
    }
    
    return {
      currentLevel: 1,
      xpPoints: 0,
      conditionsDiscovered: [],
      achievementsUnlocked: [],
      diagnosticStreak: 0,
      totalDiagnoses: 0
    }
  }

  private saveGameProgress(): void {
    localStorage.setItem('xray-game-progress', JSON.stringify(this.gameProgress))
  }

  private setupEventListeners(): void {
    // Add event listeners for UI interactions
    document.addEventListener('condition-clicked', (event: any) => {
      this.recordUserInteraction('condition_click', event.detail)
    })
    
    document.addEventListener('ai-question-asked', (event: any) => {
      this.recordUserInteraction('ai_question', event.detail)
    })
  }

  private displayWelcomeUI(): void {
    console.log('🎮 Welcome to X-Ray Diagnostic Game!')
    console.log(`Level ${this.gameProgress.currentLevel} • ${this.gameProgress.xpPoints} XP`)
    console.log(`${this.gameProgress.conditionsDiscovered.length} conditions discovered`)
    console.log(`${this.gameProgress.achievementsUnlocked.length} achievements unlocked`)
  }

  // PUBLIC API for integration with main app
  public getCurrentSession(): DiagnosticSession | null {
    return this.currentSession
  }

  public getGameProgress(): GameProgress {
    return { ...this.gameProgress }
  }

  public async handleConditionClick(condition: MedicalCondition): Promise<void> {
    if (this.currentSession) {
      await this.ui.startInteractiveSession(condition)
      this.recordUserInteraction('condition_click', { conditionName: condition.name })
    }
  }

  public async askAIQuestion(question: string): Promise<void> {
    if (this.currentSession && this.currentSession.patientCase.expectedConditions.length > 0) {
      const condition = this.currentSession.patientCase.expectedConditions[0]
      const result = await this.cerebras.getInteractiveExplanation(condition, question)
      
      if (result.success && result.data) {
        console.log('🤖 AI Response:', result.data.response)
        this.recordUserInteraction('ai_question', { question, response: result.data.response })
      }
    }
  }
}

// Factory function for easy integration
export const createGamifiedDiagnosticSystem = (): GamifiedDiagnosticSystem => {
  return new GamifiedDiagnosticSystem()
}