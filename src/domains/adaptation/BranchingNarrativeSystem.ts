/**
 * Branching Narrative System
 * ENHANCEMENT: Dynamic story paths based on player decisions
 * EDUCATIONAL: Meaningful choices with medical and ethical consequences
 * ENGAGING: Creates personalized narrative experiences
 */

import {
  NarrativeChoice,
  NarrativeOption,
  NarrativeConsequence,
  PlayerDecision,
  CaseModification
} from './types'
import { MedicalCase } from '../medical/types'

export interface GameState {
  currentPhase: string
  discoveredConditions: Set<string>
  investigationsCompleted: string[]
  ethicalChoicesMade: PlayerDecision[]
  narrativePath: string[]
  caseModifications: CaseModification[]
  playerReputation: {
    clinical: number // 0-1 scale
    ethical: number // 0-1 scale
    efficiency: number // 0-1 scale
  }
}

export interface NarrativeBranch {
  id: string
  name: string
  description: string
  triggerConditions: string[]
  choices: NarrativeChoice[]
  consequences: NarrativeConsequence[]
  unlocks: string[]
  blocks: string[]
}

export class BranchingNarrativeSystem {
  private gameState: GameState
  private availableBranches: Map<string, NarrativeBranch>
  private activeBranches: Set<string>
  private narrativeHistory: PlayerDecision[]
  private currentCase: MedicalCase | null = null

  constructor() {
    this.gameState = this.initializeGameState()
    this.availableBranches = this.initializeNarrativeBranches()
    this.activeBranches = new Set()
    this.narrativeHistory = []
    
    console.log('📖 BranchingNarrativeSystem initialized')
  }

  private initializeGameState(): GameState {
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
      }
    }
  }

  private initializeNarrativeBranches(): Map<string, NarrativeBranch> {
    const branches = new Map<string, NarrativeBranch>()
    
    // Treatment Priority Branch
    branches.set('treatment_priority', {
      id: 'treatment_priority',
      name: 'Treatment Priority Dilemma',
      description: 'Multiple patients need attention - who do you treat first?',
      triggerConditions: ['multiple_conditions_discovered', 'time_pressure_high'],
      choices: [{
        id: 'priority_choice_1',
        prompt: 'You have limited time and multiple concerning findings. How do you prioritize your investigation?',
        options: [
          {
            id: 'systematic_approach',
            text: 'Follow systematic diagnostic protocol',
            description: 'Methodically investigate each finding according to standard protocols',
            ethicalAlignment: 'excellent',
            medicalSoundness: 'excellent',
            consequences: ['increased_accuracy', 'longer_time'],
            unlocks: ['thorough_investigation_path'],
            blocks: ['rapid_response_path']
          },
          {
            id: 'severity_first',
            text: 'Address most severe finding first',
            description: 'Focus immediately on the most life-threatening condition',
            ethicalAlignment: 'good',
            medicalSoundness: 'good',
            consequences: ['faster_critical_care', 'possible_missed_findings'],
            unlocks: ['emergency_response_path'],
            blocks: ['comprehensive_workup_path']
          },
          {
            id: 'patient_preference',
            text: 'Ask patient about their main concern',
            description: 'Let patient guide the investigation priority',
            ethicalAlignment: 'good',
            medicalSoundness: 'questionable',
            consequences: ['patient_satisfaction', 'possible_clinical_error'],
            unlocks: ['patient_centered_path'],
            blocks: ['clinical_priority_path']
          }
        ],
        context: 'Emergency department triage scenario',
        consequences: [],
        ethicalWeight: 0.8,
        medicalRelevance: 0.9,
        timeLimit: 30
      }],
      consequences: [],
      unlocks: [],
      blocks: []
    })

    // Informed Consent Branch
    branches.set('informed_consent', {
      id: 'informed_consent',
      name: 'Informed Consent Challenge',
      description: 'Patient understanding and consent for procedures',
      triggerConditions: ['imaging_ordered', 'patient_anxiety_high'],
      choices: [{
        id: 'consent_choice_1',
        prompt: 'The patient seems anxious about the recommended CT scan. How do you proceed?',
        options: [
          {
            id: 'detailed_explanation',
            text: 'Provide detailed explanation of risks and benefits',
            description: 'Take time to thoroughly explain the procedure, risks, and alternatives',
            ethicalAlignment: 'excellent',
            medicalSoundness: 'excellent',
            consequences: ['patient_understanding', 'time_investment', 'trust_building'],
            unlocks: ['informed_patient_path'],
            blocks: ['expedited_care_path']
          },
          {
            id: 'reassurance_focus',
            text: 'Focus on reassurance and necessity',
            description: 'Emphasize safety and medical necessity to reduce anxiety',
            ethicalAlignment: 'good',
            medicalSoundness: 'good',
            consequences: ['reduced_anxiety', 'possible_incomplete_understanding'],
            unlocks: ['supportive_care_path'],
            blocks: ['full_disclosure_path']
          },
          {
            id: 'defer_to_specialist',
            text: 'Have specialist explain the procedure',
            description: 'Arrange for radiologist to discuss the scan with patient',
            ethicalAlignment: 'good',
            medicalSoundness: 'excellent',
            consequences: ['expert_explanation', 'care_delay', 'specialist_involvement'],
            unlocks: ['collaborative_care_path'],
            blocks: ['direct_care_path']
          }
        ],
        context: 'Outpatient clinic setting with anxious patient',
        consequences: [],
        ethicalWeight: 0.9,
        medicalRelevance: 0.7,
        timeLimit: 45
      }],
      consequences: [],
      unlocks: [],
      blocks: []
    })

    // Resource Allocation Branch
    branches.set('resource_allocation', {
      id: 'resource_allocation',
      name: 'Resource Allocation Dilemma',
      description: 'Limited resources require difficult decisions',
      triggerConditions: ['expensive_test_needed', 'budget_constraints'],
      choices: [{
        id: 'resource_choice_1',
        prompt: 'The ideal diagnostic test is expensive and not immediately available. What is your approach?',
        options: [
          {
            id: 'alternative_testing',
            text: 'Use alternative, less expensive tests',
            description: 'Order available tests that may provide similar information',
            ethicalAlignment: 'good',
            medicalSoundness: 'good',
            consequences: ['cost_savings', 'possible_diagnostic_delay', 'creative_problem_solving'],
            unlocks: ['resourceful_care_path'],
            blocks: ['gold_standard_path']
          },
          {
            id: 'wait_for_ideal',
            text: 'Wait for the optimal test to become available',
            description: 'Delay diagnosis to ensure the best possible testing',
            ethicalAlignment: 'questionable',
            medicalSoundness: 'excellent',
            consequences: ['diagnostic_accuracy', 'care_delay', 'patient_anxiety'],
            unlocks: ['perfectionist_path'],
            blocks: ['pragmatic_care_path']
          },
          {
            id: 'clinical_diagnosis',
            text: 'Proceed with clinical diagnosis',
            description: 'Make diagnosis based on available clinical information',
            ethicalAlignment: 'good',
            medicalSoundness: 'questionable',
            consequences: ['rapid_treatment', 'diagnostic_uncertainty', 'clinical_skill_reliance'],
            unlocks: ['clinical_expertise_path'],
            blocks: ['evidence_based_path']
          }
        ],
        context: 'Resource-limited healthcare setting',
        consequences: [],
        ethicalWeight: 0.7,
        medicalRelevance: 0.8,
        timeLimit: 60
      }],
      consequences: [],
      unlocks: [],
      blocks: []
    })

    return branches
  }

  /**
   * Generate branching options based on current game state
   */
  public generateBranchingOptions(currentState: GameState): NarrativeChoice[] {
    this.gameState = { ...this.gameState, ...currentState }
    
    const availableChoices: NarrativeChoice[] = []
    
    // Check which branches can be activated
    this.availableBranches.forEach((branch, branchId) => {
      if (this.canActivateBranch(branch)) {
        this.activeBranches.add(branchId)
        availableChoices.push(...branch.choices)
      }
    })
    
    // Filter choices based on current context
    const contextualChoices = availableChoices.filter(choice => 
      this.isChoiceRelevant(choice)
    )
    
    console.log('📖 Generated branching options:', {
      totalBranches: this.availableBranches.size,
      activeBranches: this.activeBranches.size,
      availableChoices: contextualChoices.length
    })
    
    return contextualChoices
  }

  private canActivateBranch(branch: NarrativeBranch): boolean {
    // Check if all trigger conditions are met
    return branch.triggerConditions.every(condition => 
      this.evaluateTriggerCondition(condition)
    )
  }

  private evaluateTriggerCondition(condition: string): boolean {
    switch (condition) {
      case 'multiple_conditions_discovered':
        return this.gameState.discoveredConditions.size >= 2
      
      case 'time_pressure_high':
        return this.gameState.currentPhase === 'active' // Assuming active phase has time pressure
      
      case 'imaging_ordered':
        return this.gameState.investigationsCompleted.includes('imaging')
      
      case 'patient_anxiety_high':
        return this.gameState.narrativePath.includes('patient_concern_expressed')
      
      case 'expensive_test_needed':
        return this.gameState.investigationsCompleted.includes('specialist_consultation')
      
      case 'budget_constraints':
        return true // Always true for educational purposes
      
      default:
        return false
    }
  }

  private isChoiceRelevant(choice: NarrativeChoice): boolean {
    // Check if choice hasn't been made recently
    const recentChoices = this.narrativeHistory.slice(-5)
    const alreadyMade = recentChoices.some(decision => decision.choiceId === choice.id)
    
    // Check if choice is blocked by previous decisions
    const isBlocked = this.gameState.narrativePath.some(pathElement => 
      choice.options.some(option => option.blocks?.includes(pathElement))
    )
    
    return !alreadyMade && !isBlocked
  }

  /**
   * Process player decision and return consequences
   */
  public processPlayerDecision(decision: PlayerDecision): NarrativeConsequence[] {
    this.narrativeHistory.push(decision)
    
    // Find the choice and option
    const choice = this.findChoiceById(decision.choiceId)
    const option = choice?.options.find(opt => opt.id === decision.optionId)
    
    if (!choice || !option) {
      console.warn('📖 Invalid decision:', decision)
      return []
    }
    
    // Update game state based on decision
    this.updateGameStateFromDecision(decision, choice, option)
    
    // Generate consequences
    const consequences = this.generateConsequences(choice, option, decision)
    
    // Update player reputation
    this.updatePlayerReputation(option)
    
    console.log('📖 Processed player decision:', {
      choice: choice.prompt.substring(0, 50) + '...',
      option: option.text,
      consequences: consequences.length,
      reputation: this.gameState.playerReputation
    })
    
    return consequences
  }

  private findChoiceById(choiceId: string): NarrativeChoice | undefined {
    for (const branch of this.availableBranches.values()) {
      const choice = branch.choices.find(c => c.id === choiceId)
      if (choice) return choice
    }
    return undefined
  }

  private updateGameStateFromDecision(
    decision: PlayerDecision, 
    choice: NarrativeChoice, 
    option: NarrativeOption
  ): void {
    // Add to narrative path
    this.gameState.narrativePath.push(option.id)
    
    // Add unlocked paths
    if (option.unlocks) {
      this.gameState.narrativePath.push(...option.unlocks)
    }
    
    // Add to ethical choices if significant
    if (choice.ethicalWeight > 0.5) {
      this.gameState.ethicalChoicesMade.push(decision)
    }
    
    // Update investigations if relevant
    if (option.consequences.includes('specialist_involvement')) {
      this.gameState.investigationsCompleted.push('specialist_consultation')
    }
  }

  private generateConsequences(
    choice: NarrativeChoice, 
    option: NarrativeOption, 
    decision: PlayerDecision
  ): NarrativeConsequence[] {
    const consequences: NarrativeConsequence[] = []
    
    // Immediate consequences
    option.consequences.forEach(consequenceType => {
      consequences.push({
        type: 'immediate',
        description: this.getConsequenceDescription(consequenceType, option),
        impact: this.getConsequenceImpact(consequenceType),
        affectedSystems: this.getAffectedSystems(consequenceType),
        magnitude: this.calculateConsequenceMagnitude(choice, option, decision)
      })
    })
    
    // Delayed consequences based on ethical alignment
    if (option.ethicalAlignment === 'poor') {
      consequences.push({
        type: 'delayed',
        description: 'Patient trust may be affected by this decision',
        impact: 'negative',
        affectedSystems: ['patient_relationship', 'reputation'],
        magnitude: 0.6
      })
    }
    
    // Long-term consequences for significant choices
    if (choice.ethicalWeight > 0.7) {
      consequences.push({
        type: 'long_term',
        description: 'This decision will influence your professional development',
        impact: option.ethicalAlignment === 'excellent' ? 'positive' : 'negative',
        affectedSystems: ['career_progression', 'clinical_skills'],
        magnitude: choice.ethicalWeight
      })
    }
    
    return consequences
  }

  private getConsequenceDescription(consequenceType: string, option: NarrativeOption): string {
    const descriptions: Record<string, string> = {
      'increased_accuracy': 'Your thorough approach improves diagnostic accuracy',
      'longer_time': 'The systematic approach takes additional time',
      'faster_critical_care': 'Rapid response to critical findings',
      'possible_missed_findings': 'Some findings may be overlooked in the rush',
      'patient_satisfaction': 'Patient appreciates being heard and involved',
      'possible_clinical_error': 'Medical priorities may not align with patient preferences',
      'patient_understanding': 'Patient gains clear understanding of the procedure',
      'time_investment': 'Explanation takes valuable time but builds trust',
      'trust_building': 'Patient confidence in your care increases',
      'reduced_anxiety': 'Patient feels more comfortable with the procedure',
      'possible_incomplete_understanding': 'Patient may not fully grasp all implications',
      'expert_explanation': 'Specialist provides detailed technical explanation',
      'care_delay': 'Additional consultation causes treatment delay',
      'specialist_involvement': 'Collaborative care approach initiated',
      'cost_savings': 'Alternative approach reduces healthcare costs',
      'possible_diagnostic_delay': 'Diagnosis may take longer with alternative tests',
      'creative_problem_solving': 'Innovative approach to resource constraints',
      'diagnostic_accuracy': 'Optimal testing ensures accurate diagnosis',
      'patient_anxiety': 'Waiting period increases patient stress',
      'rapid_treatment': 'Treatment begins immediately based on clinical assessment',
      'diagnostic_uncertainty': 'Some uncertainty remains without confirmatory testing',
      'clinical_skill_reliance': 'Decision demonstrates confidence in clinical judgment'
    }
    
    return descriptions[consequenceType] || `Consequence: ${consequenceType}`
  }

  private getConsequenceImpact(consequenceType: string): 'positive' | 'neutral' | 'negative' {
    const positiveConsequences = [
      'increased_accuracy', 'faster_critical_care', 'patient_satisfaction',
      'patient_understanding', 'trust_building', 'reduced_anxiety',
      'expert_explanation', 'cost_savings', 'creative_problem_solving',
      'diagnostic_accuracy', 'rapid_treatment', 'clinical_skill_reliance'
    ]
    
    const negativeConsequences = [
      'longer_time', 'possible_missed_findings', 'possible_clinical_error',
      'possible_incomplete_understanding', 'care_delay', 'possible_diagnostic_delay',
      'patient_anxiety', 'diagnostic_uncertainty'
    ]
    
    if (positiveConsequences.includes(consequenceType)) return 'positive'
    if (negativeConsequences.includes(consequenceType)) return 'negative'
    return 'neutral'
  }

  private getAffectedSystems(consequenceType: string): string[] {
    const systemMap: Record<string, string[]> = {
      'increased_accuracy': ['diagnostic_system', 'quality_metrics'],
      'longer_time': ['efficiency_metrics', 'workflow'],
      'patient_satisfaction': ['patient_relationship', 'satisfaction_scores'],
      'trust_building': ['patient_relationship', 'reputation'],
      'cost_savings': ['resource_management', 'budget'],
      'diagnostic_accuracy': ['diagnostic_system', 'quality_metrics'],
      'specialist_involvement': ['care_team', 'collaboration']
    }
    
    return systemMap[consequenceType] || ['general']
  }

  private calculateConsequenceMagnitude(
    choice: NarrativeChoice, 
    option: NarrativeOption, 
    decision: PlayerDecision
  ): number {
    let magnitude = 0.5 // Base magnitude
    
    // Increase magnitude for high-weight choices
    magnitude += choice.ethicalWeight * 0.3
    magnitude += choice.medicalRelevance * 0.2
    
    // Adjust based on decision time (quick decisions may have less consideration)
    if (decision.timeToDecide < 10) {
      magnitude += 0.1 // Impulsive decisions have higher impact
    } else if (decision.timeToDecide > 30) {
      magnitude += 0.2 // Thoughtful decisions have higher impact
    }
    
    // Adjust based on ethical alignment
    if (option.ethicalAlignment === 'excellent') magnitude += 0.2
    if (option.ethicalAlignment === 'poor') magnitude += 0.3
    
    return Math.min(1.0, magnitude)
  }

  private updatePlayerReputation(option: NarrativeOption): void {
    const reputationChange = 0.05 // Small incremental changes
    
    // Update clinical reputation
    if (option.medicalSoundness === 'excellent') {
      this.gameState.playerReputation.clinical += reputationChange
    } else if (option.medicalSoundness === 'poor') {
      this.gameState.playerReputation.clinical -= reputationChange
    }
    
    // Update ethical reputation
    if (option.ethicalAlignment === 'excellent') {
      this.gameState.playerReputation.ethical += reputationChange
    } else if (option.ethicalAlignment === 'poor') {
      this.gameState.playerReputation.ethical -= reputationChange
    }
    
    // Update efficiency reputation (based on consequence types)
    if (option.consequences.includes('rapid_treatment') || option.consequences.includes('faster_critical_care')) {
      this.gameState.playerReputation.efficiency += reputationChange
    } else if (option.consequences.includes('care_delay') || option.consequences.includes('longer_time')) {
      this.gameState.playerReputation.efficiency -= reputationChange
    }
    
    // Clamp reputation values between 0 and 1
    Object.keys(this.gameState.playerReputation).forEach(key => {
      const repKey = key as keyof typeof this.gameState.playerReputation
      this.gameState.playerReputation[repKey] = Math.max(0, Math.min(1, this.gameState.playerReputation[repKey]))
    })
  }

  /**
   * Get current game state
   */
  public getGameState(): GameState {
    return { ...this.gameState }
  }

  /**
   * Update game state from external systems
   */
  public updateGameState(updates: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...updates }
  }

  /**
   * Get narrative history
   */
  public getNarrativeHistory(): PlayerDecision[] {
    return [...this.narrativeHistory]
  }

  /**
   * Reset narrative system
   */
  public reset(): void {
    this.gameState = this.initializeGameState()
    this.activeBranches.clear()
    this.narrativeHistory = []
    this.currentCase = null
    console.log('📖 BranchingNarrativeSystem reset')
  }

  /**
   * Set current medical case for context
   */
  public setCurrentCase(medicalCase: MedicalCase): void {
    this.currentCase = medicalCase
    this.gameState.narrativePath = [`case_${medicalCase.id}`]
  }

  /**
   * Export narrative data for analytics
   */
  public exportNarrativeData(): any {
    return {
      gameState: this.gameState,
      activeBranches: Array.from(this.activeBranches),
      narrativeHistory: this.narrativeHistory,
      currentCase: this.currentCase?.id,
      timestamp: Date.now()
    }
  }
}