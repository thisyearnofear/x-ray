/**
 * Adaptive Difficulty Engine
 * ENHANCEMENT: Real-time performance analysis and difficulty adjustment
 * INTELLIGENT: Uses machine learning principles for optimal challenge
 * EDUCATIONAL: Maintains flow state for maximum learning
 */

import {
  PlayerPerformance,
  AdaptiveElement,
  CaseModification,
  AdaptationMetrics,
  DifficultyProfile,
  DIFFICULTY_PROFILES,
  PlayerDecision
} from './types'

export class AdaptiveDifficultyEngine {
  private adaptationMetrics: AdaptationMetrics
  private currentProfile: DifficultyProfile
  private adaptiveElements: Map<string, AdaptiveElement>
  private performanceWindow: number = 5 // Number of recent sessions to consider
  private adaptationThreshold: number = 0.1 // Minimum performance deviation to trigger adaptation

  constructor(initialProfile: string = 'intermediate') {
    this.currentProfile = DIFFICULTY_PROFILES[initialProfile] || DIFFICULTY_PROFILES.intermediate
    this.adaptationMetrics = this.initializeMetrics()
    this.adaptiveElements = this.initializeAdaptiveElements()
    
    console.log('🎯 AdaptiveDifficultyEngine initialized with profile:', this.currentProfile.name)
  }

  private initializeMetrics(): AdaptationMetrics {
    return {
      performanceHistory: [],
      decisionHistory: [],
      adaptationHistory: [],
      currentDifficultyLevel: 0.5,
      optimalDifficultyLevel: 0.5,
      adaptationConfidence: 0.3,
      sessionCount: 0,
      totalPlayTime: 0
    }
  }

  private initializeAdaptiveElements(): Map<string, AdaptiveElement> {
    const elements = new Map<string, AdaptiveElement>()
    
    elements.set('case_difficulty', {
      id: 'case_difficulty',
      type: 'difficulty',
      currentValue: 0.5,
      targetValue: 0.5,
      adjustmentRate: 0.2,
      constraints: { min: 0.1, max: 0.9, stepSize: 0.1 }
    })
    
    elements.set('time_pressure', {
      id: 'time_pressure',
      type: 'timing',
      currentValue: 0.5,
      targetValue: 0.5,
      adjustmentRate: 0.15,
      constraints: { min: 0.2, max: 0.8, stepSize: 0.1 }
    })
    
    elements.set('hint_availability', {
      id: 'hint_availability',
      type: 'hints',
      currentValue: 0.6,
      targetValue: 0.6,
      adjustmentRate: 0.25,
      constraints: { min: 0.2, max: 1.0, stepSize: 0.2 }
    })
    
    elements.set('narrative_complexity', {
      id: 'narrative_complexity',
      type: 'narrative',
      currentValue: 0.4,
      targetValue: 0.4,
      adjustmentRate: 0.1,
      constraints: { min: 0.2, max: 0.8, stepSize: 0.2 }
    })
    
    elements.set('red_herring_intensity', {
      id: 'red_herring_intensity',
      type: 'complexity',
      currentValue: 0.3,
      targetValue: 0.3,
      adjustmentRate: 0.15,
      constraints: { min: 0.0, max: 0.7, stepSize: 0.1 }
    })
    
    return elements
  }

  /**
   * Analyze player performance and adjust difficulty
   */
  public adjustDifficulty(performance: PlayerPerformance): CaseModification {
    // Add performance to history
    this.adaptationMetrics.performanceHistory.push(performance)
    this.adaptationMetrics.sessionCount++
    
    // Keep only recent performance data
    if (this.adaptationMetrics.performanceHistory.length > this.performanceWindow) {
      this.adaptationMetrics.performanceHistory.shift()
    }
    
    // Calculate performance deviation from target
    const performanceDeviation = this.calculatePerformanceDeviation(performance)
    const adaptationNeeded = Math.abs(performanceDeviation) > this.adaptationThreshold
    
    if (adaptationNeeded) {
      this.updateAdaptiveElements(performanceDeviation)
      this.adaptationMetrics.adaptationConfidence = Math.min(
        this.adaptationMetrics.adaptationConfidence + 0.1,
        1.0
      )
    }
    
    // Generate case modification
    const modification = this.generateCaseModification()
    this.adaptationMetrics.adaptationHistory.push(modification)
    
    console.log('🎯 Difficulty adjusted:', {
      performanceDeviation: performanceDeviation.toFixed(3),
      adaptationNeeded,
      currentDifficulty: this.adaptationMetrics.currentDifficultyLevel.toFixed(3),
      confidence: this.adaptationMetrics.adaptationConfidence.toFixed(3)
    })
    
    return modification
  }

  private calculatePerformanceDeviation(performance: PlayerPerformance): number {
    const target = this.currentProfile.targetPerformance
    const weights = {
      diagnosticAccuracy: 0.3,
      timeEfficiency: 0.2,
      consultationUsage: 0.1,
      ethicalChoiceAlignment: 0.15,
      investigationThoroughness: 0.1,
      caseCompletionRate: 0.1,
      mistakeFrequency: 0.05
    }
    
    let weightedDeviation = 0
    let totalWeight = 0
    
    // Calculate weighted deviation for each metric
    Object.entries(weights).forEach(([metric, weight]) => {
      const currentValue = performance[metric as keyof PlayerPerformance] as number
      const targetValue = target[metric as keyof PlayerPerformance] as number
      
      if (typeof currentValue === 'number' && typeof targetValue === 'number') {
        // For mistake frequency, lower is better, so invert the deviation
        const deviation = metric === 'mistakeFrequency' 
          ? targetValue - currentValue 
          : currentValue - targetValue
        
        weightedDeviation += deviation * weight
        totalWeight += weight
      }
    })
    
    return totalWeight > 0 ? weightedDeviation / totalWeight : 0
  }

  private updateAdaptiveElements(performanceDeviation: number): void {
    const adaptationMagnitude = Math.min(Math.abs(performanceDeviation), 0.3)
    const adaptationDirection = Math.sign(performanceDeviation)
    
    this.adaptiveElements.forEach((element, key) => {
      const adjustment = adaptationDirection * adaptationMagnitude * element.adjustmentRate
      const newTargetValue = Math.max(
        element.constraints.min,
        Math.min(
          element.constraints.max,
          element.targetValue + adjustment
        )
      )
      
      element.targetValue = newTargetValue
      
      // Gradually move current value toward target
      const moveRate = 0.3
      element.currentValue = element.currentValue + 
        (element.targetValue - element.currentValue) * moveRate
      
      // Ensure value stays within constraints
      element.currentValue = Math.max(
        element.constraints.min,
        Math.min(element.constraints.max, element.currentValue)
      )
    })
    
    // Update overall difficulty level
    const difficultyElement = this.adaptiveElements.get('case_difficulty')
    if (difficultyElement) {
      this.adaptationMetrics.currentDifficultyLevel = difficultyElement.currentValue
      this.adaptationMetrics.optimalDifficultyLevel = difficultyElement.targetValue
    }
  }

  private generateCaseModification(): CaseModification {
    const difficulty = this.adaptiveElements.get('case_difficulty')?.currentValue || 0.5
    const timePressure = this.adaptiveElements.get('time_pressure')?.currentValue || 0.5
    const hintLevel = this.adaptiveElements.get('hint_availability')?.currentValue || 0.6
    const narrativeComplexity = this.adaptiveElements.get('narrative_complexity')?.currentValue || 0.4
    const redHerringIntensity = this.adaptiveElements.get('red_herring_intensity')?.currentValue || 0.3
    
    // Convert numeric values to categorical values
    const getHintAvailability = (level: number): 'none' | 'minimal' | 'moderate' | 'generous' => {
      if (level < 0.25) return 'none'
      if (level < 0.5) return 'minimal'
      if (level < 0.75) return 'moderate'
      return 'generous'
    }
    
    const getNarrativeComplexity = (level: number): 'simple' | 'moderate' | 'complex' => {
      if (level < 0.4) return 'simple'
      if (level < 0.7) return 'moderate'
      return 'complex'
    }
    
    // Calculate time allowance (inverse relationship with time pressure)
    const timeAllowanceMultiplier = 0.5 + (1.0 - timePressure)
    
    // Determine investigation requirements based on difficulty
    const investigationRequirements: string[] = []
    if (difficulty > 0.3) investigationRequirements.push('patient_interview')
    if (difficulty > 0.5) investigationRequirements.push('physical_examination')
    if (difficulty > 0.6) investigationRequirements.push('lab_orders')
    if (difficulty > 0.7) investigationRequirements.push('imaging')
    if (difficulty > 0.8) investigationRequirements.push('specialist_consultation')
    
    return {
      difficultyAdjustment: (difficulty - 0.5) * 2, // Convert 0-1 to -1 to 1
      timeAllowanceMultiplier,
      hintAvailability: getHintAvailability(hintLevel),
      redHerringIntensity,
      narrativeComplexity: getNarrativeComplexity(narrativeComplexity),
      investigationRequirements,
      ethicalDilemmaPresence: difficulty > 0.6,
      specialistConsultationRequired: difficulty > 0.7
    }
  }

  /**
   * Track player decisions for narrative adaptation
   */
  public trackPlayerDecision(decision: PlayerDecision): void {
    this.adaptationMetrics.decisionHistory.push(decision)
    
    // Keep only recent decisions
    if (this.adaptationMetrics.decisionHistory.length > 50) {
      this.adaptationMetrics.decisionHistory.shift()
    }
    
    // Analyze decision patterns for narrative adaptation
    this.analyzeDecisionPatterns()
  }

  private analyzeDecisionPatterns(): void {
    const recentDecisions = this.adaptationMetrics.decisionHistory.slice(-10)
    if (recentDecisions.length < 5) return
    
    // Calculate average decision time
    const avgDecisionTime = recentDecisions.reduce((sum, d) => sum + d.timeToDecide, 0) / recentDecisions.length
    
    // Adjust narrative complexity based on decision patterns
    const narrativeElement = this.adaptiveElements.get('narrative_complexity')
    if (narrativeElement) {
      // If player is making decisions too quickly, increase complexity
      if (avgDecisionTime < 5) {
        narrativeElement.targetValue = Math.min(
          narrativeElement.constraints.max,
          narrativeElement.targetValue + 0.1
        )
      }
      // If player is taking too long, decrease complexity
      else if (avgDecisionTime > 20) {
        narrativeElement.targetValue = Math.max(
          narrativeElement.constraints.min,
          narrativeElement.targetValue - 0.1
        )
      }
    }
  }

  /**
   * Get current adaptation metrics
   */
  public getAdaptationMetrics(): AdaptationMetrics {
    return { ...this.adaptationMetrics }
  }

  /**
   * Get current difficulty profile
   */
  public getCurrentProfile(): DifficultyProfile {
    return { ...this.currentProfile }
  }

  /**
   * Switch to a different difficulty profile
   */
  public switchProfile(profileName: string): boolean {
    const newProfile = DIFFICULTY_PROFILES[profileName]
    if (!newProfile) {
      console.warn('🎯 Unknown difficulty profile:', profileName)
      return false
    }
    
    this.currentProfile = newProfile
    
    // Reset adaptive elements to match new profile
    this.adaptiveElements.forEach((element) => {
      element.currentValue = 0.5
      element.targetValue = 0.5
    })
    
    this.adaptationMetrics.currentDifficultyLevel = 0.5
    this.adaptationMetrics.optimalDifficultyLevel = 0.5
    this.adaptationMetrics.adaptationConfidence = 0.3
    
    console.log('🎯 Switched to difficulty profile:', newProfile.name)
    return true
  }

  /**
   * Reset adaptation state
   */
  public reset(): void {
    this.adaptationMetrics = this.initializeMetrics()
    this.adaptiveElements = this.initializeAdaptiveElements()
    console.log('🎯 AdaptiveDifficultyEngine reset')
  }

  /**
   * Get recommended case types based on current profile and performance
   */
  public getRecommendedCaseTypes(): string[] {
    const difficulty = this.adaptationMetrics.currentDifficultyLevel
    const baseTypes = [...this.currentProfile.preferredCaseTypes]
    
    // Add or remove case types based on current difficulty
    if (difficulty < 0.3 && !baseTypes.includes('straightforward')) {
      baseTypes.unshift('straightforward')
    }
    if (difficulty > 0.7 && !baseTypes.includes('advanced')) {
      baseTypes.push('advanced')
    }
    
    return baseTypes
  }

  /**
   * Export adaptation data for analytics
   */
  public exportAdaptationData(): any {
    return {
      profile: this.currentProfile.name,
      metrics: this.adaptationMetrics,
      elements: Object.fromEntries(this.adaptiveElements),
      timestamp: Date.now()
    }
  }
}