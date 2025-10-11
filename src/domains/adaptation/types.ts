/**
 * Dynamic Case Adaptation Types
 * ENHANCEMENT: Real-time difficulty adjustment and branching narratives
 * MODULAR: Independent types for adaptive systems
 */

export interface PlayerPerformance {
  diagnosticAccuracy: number // 0-1 scale
  timeEfficiency: number // 0-1 scale (1 = very fast, 0 = very slow)
  consultationUsage: number // 0-1 scale (frequency of AI consultation)
  ethicalChoiceAlignment: number // 0-1 scale (alignment with best practices)
  investigationThoroughness: number // 0-1 scale (completeness of investigation)
  caseCompletionRate: number // 0-1 scale (percentage of cases completed)
  averageSessionTime: number // in minutes
  mistakeFrequency: number // 0-1 scale (0 = no mistakes, 1 = many mistakes)
  learningProgress: number // 0-1 scale (improvement over time)
}

export interface AdaptiveElement {
  id: string
  type: 'difficulty' | 'narrative' | 'timing' | 'hints' | 'complexity'
  currentValue: number // 0-1 scale
  targetValue: number // 0-1 scale
  adjustmentRate: number // how quickly to adapt (0-1)
  constraints: {
    min: number
    max: number
    stepSize: number
  }
}

export interface CaseModification {
  difficultyAdjustment: number // -1 to 1 (negative = easier, positive = harder)
  timeAllowanceMultiplier: number // 0.5 to 2.0 (0.5 = half time, 2.0 = double time)
  hintAvailability: 'none' | 'minimal' | 'moderate' | 'generous'
  redHerringIntensity: number // 0-1 scale (0 = no red herrings, 1 = many)
  narrativeComplexity: 'simple' | 'moderate' | 'complex'
  investigationRequirements: string[] // required investigation types
  ethicalDilemmaPresence: boolean
  specialistConsultationRequired: boolean
}

export interface NarrativeChoice {
  id: string
  prompt: string
  options: NarrativeOption[]
  context: string
  consequences: NarrativeConsequence[]
  ethicalWeight: number // 0-1 scale (how ethically significant this choice is)
  medicalRelevance: number // 0-1 scale (how medically relevant this choice is)
  timeLimit?: number // seconds to make choice (optional)
}

export interface NarrativeOption {
  id: string
  text: string
  description: string
  ethicalAlignment: 'excellent' | 'good' | 'questionable' | 'poor'
  medicalSoundness: 'excellent' | 'good' | 'questionable' | 'poor'
  consequences: string[]
  unlocks?: string[] // what this choice unlocks
  blocks?: string[] // what this choice prevents
}

export interface NarrativeConsequence {
  type: 'immediate' | 'delayed' | 'long_term'
  description: string
  impact: 'positive' | 'neutral' | 'negative'
  affectedSystems: string[] // which game systems are affected
  magnitude: number // 0-1 scale (how significant the consequence is)
}

export interface PlayerDecision {
  choiceId: string
  optionId: string
  timestamp: number
  timeToDecide: number // seconds taken to make decision
  context: string
  reasoning?: string // optional player reasoning
}

export interface AdaptationMetrics {
  performanceHistory: PlayerPerformance[]
  decisionHistory: PlayerDecision[]
  adaptationHistory: CaseModification[]
  currentDifficultyLevel: number // 0-1 scale
  optimalDifficultyLevel: number // 0-1 scale (calculated target)
  adaptationConfidence: number // 0-1 scale (how confident we are in adaptations)
  sessionCount: number
  totalPlayTime: number // in minutes
}

export interface DifficultyProfile {
  name: string
  description: string
  targetPerformance: PlayerPerformance
  adaptationSensitivity: number // 0-1 scale (how quickly to adapt)
  preferredCaseTypes: string[]
  specializations: string[] // medical specialties to focus on
}

// Predefined difficulty profiles
export const DIFFICULTY_PROFILES: Record<string, DifficultyProfile> = {
  beginner: {
    name: 'Medical Student',
    description: 'Learning basic diagnostic skills',
    targetPerformance: {
      diagnosticAccuracy: 0.6,
      timeEfficiency: 0.4,
      consultationUsage: 0.8,
      ethicalChoiceAlignment: 0.7,
      investigationThoroughness: 0.8,
      caseCompletionRate: 0.8,
      averageSessionTime: 20,
      mistakeFrequency: 0.4,
      learningProgress: 0.3
    },
    adaptationSensitivity: 0.7,
    preferredCaseTypes: ['straightforward'],
    specializations: ['general']
  },
  intermediate: {
    name: 'Resident Physician',
    description: 'Developing clinical reasoning skills',
    targetPerformance: {
      diagnosticAccuracy: 0.75,
      timeEfficiency: 0.6,
      consultationUsage: 0.5,
      ethicalChoiceAlignment: 0.8,
      investigationThoroughness: 0.7,
      caseCompletionRate: 0.85,
      averageSessionTime: 15,
      mistakeFrequency: 0.25,
      learningProgress: 0.5
    },
    adaptationSensitivity: 0.5,
    preferredCaseTypes: ['straightforward', 'complex'],
    specializations: ['general', 'emergency']
  },
  advanced: {
    name: 'Attending Physician',
    description: 'Mastering complex diagnostic scenarios',
    targetPerformance: {
      diagnosticAccuracy: 0.9,
      timeEfficiency: 0.8,
      consultationUsage: 0.3,
      ethicalChoiceAlignment: 0.9,
      investigationThoroughness: 0.6,
      caseCompletionRate: 0.9,
      averageSessionTime: 12,
      mistakeFrequency: 0.1,
      learningProgress: 0.7
    },
    adaptationSensitivity: 0.3,
    preferredCaseTypes: ['complex', 'advanced'],
    specializations: ['cardiology', 'neurology', 'emergency', 'internal_medicine']
  }
}