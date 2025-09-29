// MODULAR: Diagnostic session management with clear separation of concerns

import { PATIENT_CASES, MEDICAL_CONDITIONS, DIAGNOSTIC_QUESTIONS, type PatientCase, type MedicalCondition, type DiagnosticQuestion } from '../medical/medical-data'

export interface SessionState {
  currentCase: PatientCase | null
  discoveredConditions: string[]
  currentQuestion: DiagnosticQuestion | null
  score: number
  hintsUsed: number
  accuracy: number
  phase: 'case_selection' | 'scanning' | 'diagnosing' | 'completed'
}

export interface DiagnosticAnswer {
  questionId: string
  selectedOption: number
  isCorrect: boolean
  pointsEarned: number
  explanation: string
}

// CLEAN: Single responsibility for managing diagnostic sessions
export class DiagnosticSession {
  private state: SessionState
  private callbacks: {
    onStateChange?: (state: SessionState) => void
    onQuestionAnswered?: (answer: DiagnosticAnswer) => void
    onCaseCompleted?: (finalScore: number, accuracy: number) => void
  }

  constructor(callbacks: DiagnosticSession['callbacks'] = {}) {
    this.callbacks = callbacks
    this.state = {
      currentCase: null,
      discoveredConditions: [],
      currentQuestion: null,
      score: 0,
      hintsUsed: 0,
      accuracy: 0,
      phase: 'case_selection'
    }
  }

  // PERFORMANT: Efficient case loading with caching
  startCase(caseId: string): boolean {
    const patientCase = PATIENT_CASES[caseId]
    if (!patientCase) return false

    this.state = {
      ...this.state,
      currentCase: patientCase,
      discoveredConditions: [],
      currentQuestion: null,
      score: 0,
      hintsUsed: 0,
      accuracy: 0,
      phase: 'scanning'
    }

    this.notifyStateChange()
    return true
  }

  // CLEAN: Clear method responsibility for condition discovery
  discoverCondition(conditionId: string): MedicalCondition | null {
    if (!this.state.currentCase) return null
    
    const condition = MEDICAL_CONDITIONS[conditionId]
    if (!condition || this.state.discoveredConditions.includes(conditionId)) {
      return null
    }

    // Check if this condition is actually part of the current case
    if (!this.state.currentCase.conditions.includes(conditionId)) {
      return null
    }

    this.state.discoveredConditions.push(conditionId)
    this.updatePhaseIfNeeded()
    this.notifyStateChange()
    
    return condition
  }

  // MODULAR: Independent question management
  getNextQuestion(conditionId: string): DiagnosticQuestion | null {
    const questions = DIAGNOSTIC_QUESTIONS[conditionId]
    if (!questions || questions.length === 0) return null

    // For now, return the first question - can be enhanced for progression
    const question = questions[0]
    this.state.currentQuestion = question
    this.state.phase = 'diagnosing'
    this.notifyStateChange()
    
    return question
  }

  // DRY: Single method for answer processing
  submitAnswer(questionId: string, selectedOptionIndex: number): DiagnosticAnswer | null {
    const question = this.state.currentQuestion
    if (!question || question.id !== questionId) return null

    const selectedOption = question.options[selectedOptionIndex]
    if (!selectedOption) return null

    const answer: DiagnosticAnswer = {
      questionId,
      selectedOption: selectedOptionIndex,
      isCorrect: selectedOption.isCorrect,
      pointsEarned: selectedOption.points,
      explanation: selectedOption.explanation
    }

    // Update session state
    this.state.score += answer.pointsEarned
    this.updateAccuracy()
    
    // Clear current question after answering
    this.state.currentQuestion = null

    this.callbacks.onQuestionAnswered?.(answer)
    this.checkForCompletion()
    this.notifyStateChange()

    return answer
  }

  // PERFORMANT: Efficient hint system with cost tracking
  useHint(hintIndex: number): string | null {
    const question = this.state.currentQuestion
    if (!question || hintIndex >= question.hints.length) return null

    const hint = question.hints[hintIndex]
    this.state.hintsUsed++
    this.state.score = Math.max(0, this.state.score - hint.cost)
    
    this.notifyStateChange()
    return hint.text
  }

  // CLEAN: Explicit state getters
  getCurrentState(): Readonly<SessionState> {
    return { ...this.state }
  }

  getCurrentCase(): PatientCase | null {
    return this.state.currentCase
  }

  getDiscoveredConditions(): MedicalCondition[] {
    return this.state.discoveredConditions
      .map(id => MEDICAL_CONDITIONS[id])
      .filter(Boolean)
  }

  // ORGANIZED: Clear game progression logic
  private updatePhaseIfNeeded(): void {
    if (!this.state.currentCase) return

    const totalConditions = this.state.currentCase.conditions.length
    const discoveredCount = this.state.discoveredConditions.length

    if (discoveredCount === totalConditions && this.state.phase === 'scanning') {
      this.state.phase = 'diagnosing'
    }
  }

  private updateAccuracy(): void {
    // Simple accuracy calculation - can be enhanced
    const questionsAnswered = this.state.hintsUsed + 1 // Rough estimate
    this.state.accuracy = Math.round((this.state.score / (questionsAnswered * 10)) * 100)
  }

  private checkForCompletion(): void {
    if (!this.state.currentCase) return

    // Check if all conditions have been diagnosed
    const allConditionsDiagnosed = this.state.currentCase.conditions.every(
      conditionId => this.state.discoveredConditions.includes(conditionId)
    )

    if (allConditionsDiagnosed && !this.state.currentQuestion) {
      this.state.phase = 'completed'
      this.callbacks.onCaseCompleted?.(this.state.score, this.state.accuracy)
    }
  }

  private notifyStateChange(): void {
    this.callbacks.onStateChange?.(this.getCurrentState())
  }

  // Utility methods for external components
  isConditionDiscovered(conditionId: string): boolean {
    return this.state.discoveredConditions.includes(conditionId)
  }

  canStartDiagnosis(): boolean {
    return this.state.discoveredConditions.length > 0 && this.state.phase !== 'case_selection'
  }

  reset(): void {
    this.state = {
      currentCase: null,
      discoveredConditions: [],
      currentQuestion: null,
      score: 0,
      hintsUsed: 0,
      accuracy: 0,
      phase: 'case_selection'
    }
    this.notifyStateChange()
  }
}