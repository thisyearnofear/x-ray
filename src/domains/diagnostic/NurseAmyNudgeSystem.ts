/**
 * Nurse Amy Nudge System
 * ENHANCEMENT FIRST: Leverages existing VoiceConsultationManager and AIPanel
 * IMMERSIVE: Creates realistic time pressure through nurse interactions
 * MODULAR: Integrates with game-phase-manager for contextual guidance
 */

import { VoiceConsultationManager } from '../voice/VoiceConsultationManager'
import { AIPanel } from './ui/AIPanel'
import { CaseAccessManager } from '../medical/CaseAccessManager'
import { NurseAmyPersonality } from '../character/NurseAmyPersonality'

// Define DiagnosticPhase enum locally since it's not exported from game-phase-manager
export enum DiagnosticPhase {
  CASE_INTRODUCTION = 'introduction',
  INITIAL_SCAN = 'initial_scan',
  INVESTIGATION = 'investigation',
  ANALYSIS = 'analysis',
  DIAGNOSIS_READY = 'diagnosis_ready'
}

// Import GamePhaseManager and GamePhase
import { GamePhaseManager, GamePhase } from './game-phase-manager'

export interface NurseNudge {
  id: string
  message: string
  urgency: 'normal' | 'moderate' | 'high' | 'critical'
  type: 'time_pressure' | 'family_pressure' | 'patient_comfort' | 'progress_positive' | 'tool_suggestion'
  timestamp: number
  conditions?: string[]
}

export class NurseAmyNudgeSystem {
  private voiceManager: VoiceConsultationManager | null = null
  private aiPanel: AIPanel | null = null
  private phaseManager: GamePhaseManager | null = null
  private accessManager: CaseAccessManager
  private lastNudgeTime: number = 0
  private nudgeHistory: NurseNudge[] = []
  private callbacks: Map<string, Function[]> = new Map()

  constructor(
    voiceManager?: VoiceConsultationManager,
    aiPanel?: AIPanel,
    phaseManager?: GamePhaseManager
  ) {
    this.voiceManager = voiceManager || null
    this.aiPanel = aiPanel || null
    this.phaseManager = phaseManager || null
    this.accessManager = CaseAccessManager.getInstance()
  }

  public on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  private emit(event: string, data?: any) {
    const callbacks = this.callbacks.get(event) || []
    callbacks.forEach(callback => callback(data))
  }

  // ENHANCEMENT FIRST: Register with existing systems
  public registerSystems(
    voiceManager: VoiceConsultationManager,
    aiPanel: AIPanel,
    phaseManager: GamePhaseManager
  ) {
    this.voiceManager = voiceManager
    this.aiPanel = aiPanel
    this.phaseManager = phaseManager

    // Listen to phase changes for contextual nudging
    this.phaseManager.on('phaseChanged', (data: any) => {
      this.handlePhaseChange(data)
    })

    // Send initial introduction message when systems are ready
    setTimeout(() => {
      this.sendInitialIntroduction()
    }, 3000) // Wait a few seconds for user to get oriented
  }

  // CLEAN: Send initial introduction using NurseAmyPersonality
  private sendInitialIntroduction(): void {
    const userStatus = this.accessManager.getUserStatus()
    const isPremiumUser = userStatus.isAuthenticated
    
    this.sendNudge({
      message: NurseAmyPersonality.getIntroductionMessage(isPremiumUser),
      urgency: 'normal',
      type: 'progress_positive'
    })
  }

  // CLEAN: Proactive prompting using NurseAmyPersonality
  public sendConsultationPrompt(): void {
    const userStatus = this.accessManager.getUserStatus()
    const isPremiumUser = userStatus.isAuthenticated
    
    this.sendNudge({
      message: NurseAmyPersonality.getConsultationPrompt(isPremiumUser),
      urgency: 'normal',
      type: 'tool_suggestion'
    })
  }

  // IMMERSIVE: Time-pressure nudging system with phase transitions
  public evaluateNudgeNeeds(gameState: any): void {
    const now = Date.now()
    const timeSinceLastNudge = now - this.lastNudgeTime
    
    // Don't nudge too frequently (minimum 30 seconds between nudges)
    if (timeSinceLastNudge < 30000) return

    const timeRemaining = gameState.timeRemaining
    const conditionsFound = gameState.discoveredConditions?.size || 0
    const currentPhase = this.phaseManager?.getCurrentPhase() || GamePhase.ACTIVE

    // MODULAR: Trigger phase transitions based on time milestones
    this.handlePhaseTransitions(timeRemaining)

    // Proactive consultation prompt at 4 minutes (early in the case)
    if (timeRemaining === 240 && conditionsFound === 0) {
      this.sendConsultationPrompt()
    }
    // Critical time pressure (< 1 minute)
    else if (timeRemaining <= 60) {
      this.triggerCriticalTimeNudge(conditionsFound, gameState)
    }
    // High time pressure (< 2 minutes)
    else if (timeRemaining <= 120) {
      this.triggerHighTimeNudge(conditionsFound, this.mapGamePhaseToDiagnosticPhase(currentPhase), gameState)
    }
    // Moderate time pressure (< 3 minutes)
    else if (timeRemaining <= 180) {
      this.triggerModerateTimeNudge(conditionsFound, this.mapGamePhaseToDiagnosticPhase(currentPhase), gameState)
    }
    // Progress-based nudging (any time)
    else {
      this.triggerProgressNudge(conditionsFound, this.mapGamePhaseToDiagnosticPhase(currentPhase), gameState)
    }
  }

  // CLEAN: Handle phase transitions using NurseAmyPersonality
  private handlePhaseTransitions(timeRemaining: number): void {
    if (!this.phaseManager) return

    const currentPhase = this.phaseManager.getCurrentPhase()
    const conditionsFound = 0 // Will be passed from game state in full implementation

    // Use NurseAmyPersonality for consistent messaging
    if (timeRemaining === 60 && currentPhase !== GamePhase.COMPLETE) {
      this.sendNudge({
        message: NurseAmyPersonality.getTimePressureMessage(60, conditionsFound),
        urgency: 'critical',
        type: 'time_pressure'
      })
    } else if (timeRemaining === 120 && currentPhase === GamePhase.ACTIVE) {
      this.sendNudge({
        message: NurseAmyPersonality.getTimePressureMessage(120, conditionsFound),
        urgency: 'high',
        type: 'time_pressure'
      })
    } else if (timeRemaining === 180 && currentPhase === GamePhase.ACTIVE) {
      this.sendNudge({
        message: NurseAmyPersonality.getTimePressureMessage(180, conditionsFound),
        urgency: 'moderate',
        type: 'tool_suggestion'
      })
    }
  }

  // CLEAN: Map GamePhase to DiagnosticPhase for compatibility
  private mapGamePhaseToDiagnosticPhase(gamePhase: GamePhase): DiagnosticPhase {
    switch (gamePhase) {
      case GamePhase.WELCOME:
        return DiagnosticPhase.CASE_INTRODUCTION
      case GamePhase.TUTORIAL:
      case GamePhase.EXPLORATION:
        return DiagnosticPhase.INITIAL_SCAN
      case GamePhase.READY:
      case GamePhase.ACTIVE:
        return DiagnosticPhase.INVESTIGATION
      case GamePhase.PAUSED:
        return DiagnosticPhase.ANALYSIS
      case GamePhase.COMPLETE:
        return DiagnosticPhase.DIAGNOSIS_READY
      default:
        return DiagnosticPhase.INITIAL_SCAN
    }
  }

  private triggerCriticalTimeNudge(conditionsFound: number, gameState: any): void {
    let message: string
    let type: NurseNudge['type'] = 'time_pressure'
    const userStatus = this.accessManager.getUserStatus()
    const patientName = gameState.patientCase?.patientName || 'the patient'
    const chiefComplaint = gameState.patientCase?.chiefComplaint || 'the presenting symptoms'
    const title = gameState.patientCase?.title || 'this case'

    if (conditionsFound === 0) {
      if (userStatus.currentTier === 'premium') {
        message = `👩‍⚕️ Nurse Amy: Doctor, we're almost out of time on ${title}! ${patientName} is getting worried and their family is asking questions. Should I call for emergency consultation? The chief complaint of "${chiefComplaint}" needs urgent attention.`
      } else {
        message = `👩‍⚕️ Nurse Amy: Doctor, we're almost out of time! The patient is getting worried and their family is asking questions. The chief complaint of "${chiefComplaint}" needs urgent attention. Should I call for emergency consultation?`
      }
    } else if (conditionsFound < 2) {
      if (userStatus.currentTier === 'premium') {
        message = `👩‍⚕️ Nurse Amy: Doctor, time is critical on ${title}! We have some findings for ${patientName} but need a diagnosis now. They need to start treatment - what's your assessment of the "${chiefComplaint}"?`
      } else {
        message = `👩‍⚕️ Nurse Amy: Doctor, time is critical! We have some findings but need a diagnosis now. The patient needs to start treatment - what's your assessment of the "${chiefComplaint}"?`
      }
    } else {
      if (userStatus.currentTier === 'premium') {
        message = `👩‍⚕️ Nurse Amy: Doctor, excellent findings on ${title}! But we need your diagnosis immediately for ${patientName} - they're ready for treatment. Can you submit your assessment of the "${chiefComplaint}" now?`
      } else {
        message = `👩‍⚕️ Nurse Amy: Doctor, excellent findings! But we need your diagnosis immediately - the patient is ready for treatment. Can you submit your assessment of the "${chiefComplaint}" now?`
      }
      type = 'progress_positive'
    }

    this.sendNudge({
      message,
      urgency: 'critical',
      type,
      conditions: Array.from(gameState.discoveredConditions || [])
    })
  }

  private triggerHighTimeNudge(conditionsFound: number, phase: DiagnosticPhase, gameState: any): void {
    let message: string
    let type: NurseNudge['type'] = 'family_pressure'
    const patientName = gameState.patientCase?.patientName || 'the patient'
    const chiefComplaint = gameState.patientCase?.chiefComplaint || 'the presenting symptoms'
    const title = gameState.patientCase?.title || 'this case'

    if (phase === DiagnosticPhase.INITIAL_SCAN && conditionsFound === 0) {
      message = `👩‍⚕️ Nurse Amy: Doctor, ${patientName} is getting anxious about ${title}. They're asking if everything is okay with the "${chiefComplaint}". Should I reassure them while you continue your examination?`
    } else if (phase === DiagnosticPhase.INVESTIGATION) {
      message = `👩‍⚕️ Nurse Amy: Doctor, ${patientName} mentioned they have an important meeting tomorrow. They're hoping for quick answers about the "${chiefComplaint}" - how are we progressing?`
    } else if (conditionsFound >= 2) {
      message = `👩‍⚕️ Nurse Amy: Doctor, you've made great progress on ${title} with ${patientName}! They're asking if we know what's causing their "${chiefComplaint}". Are you ready to discuss your findings?`
      type = 'progress_positive'
    } else {
      message = `👩‍⚕️ Nurse Amy: Doctor, we're making progress on ${title} but time is getting short for ${patientName} with "${chiefComplaint}". Should I provide any comfort measures?`
      type = 'patient_comfort'
    }

    this.sendNudge({
      message,
      urgency: 'high',
      type,
      conditions: Array.from(gameState.discoveredConditions || [])
    })
  }

  private triggerModerateTimeNudge(conditionsFound: number, phase: DiagnosticPhase, gameState: any): void {
    let message: string
    let type: NurseNudge['type'] = 'tool_suggestion'

    if (phase === DiagnosticPhase.INITIAL_SCAN) {
      message = "👩‍⚕️ Nurse Amy: Doctor, should we consider using our investigation tools? The patient mentioned some specific symptoms that might need detailed examination."
    } else if (phase === DiagnosticPhase.INVESTIGATION && conditionsFound === 0) {
      message = "👩‍⚕️ Nurse Amy: Doctor, we haven't found anything concerning yet. Should I ask the patient about any additional symptoms they might not have mentioned?"
    } else {
      message = "👩‍⚕️ Nurse Amy: Doctor, we're making steady progress. The patient seems comfortable and trusts our process. How would you like to proceed?"
      type = 'progress_positive'
    }

    this.sendNudge({
      message,
      urgency: 'moderate',
      type,
      conditions: Array.from(gameState.discoveredConditions || [])
    })
  }

  private triggerProgressNudge(conditionsFound: number, phase: DiagnosticPhase, gameState: any): void {
    if (conditionsFound >= 3) {
      this.sendNudge({
        message: "👩‍⚕️ Nurse Amy: Excellent diagnostic work, Doctor! You've identified multiple findings. The patient will be relieved to have answers. Should we prepare for treatment planning?",
        urgency: 'normal',
        type: 'progress_positive',
        conditions: Array.from(gameState.discoveredConditions || [])
      })
    } else if (phase === DiagnosticPhase.INVESTIGATION && conditionsFound >= 1) {
      this.sendNudge({
        message: "👩‍⚕️ Nurse Amy: Good findings so far, Doctor. The patient is cooperating well. Should we explore any additional areas or use more investigation tools?",
        urgency: 'normal',
        type: 'tool_suggestion',
        conditions: Array.from(gameState.discoveredConditions || [])
      })
    }
  }

  // IMMERSIVE: Condition-specific responses
  public triggerConditionFoundNudge(conditionId: string, gameState: any): void {
    const responses: Record<string, string> = {
      'temporomandibular_disorder': "👩‍⚕️ Nurse Amy: Excellent, Doctor! TMJ dysfunction explains the patient's jaw pain and headaches perfectly. They'll be so relieved to finally have an answer. Should I prepare treatment options?",
      'dental_abscess': "👩‍⚕️ Nurse Amy: Doctor, this dental abscess needs immediate attention! The patient mentioned the pain has been getting worse. Should I contact oral surgery for urgent consultation?",
      'sinusitis': "👩‍⚕️ Nurse Amy: Great catch, Doctor! The sinus findings explain the facial pressure the patient described. They mentioned it's been affecting their sleep - should we discuss treatment options?",
      'pneumonia': "👩‍⚕️ Nurse Amy: Doctor, pneumonia requires prompt treatment. The patient's family will want to know about the treatment plan and recovery time. Should I prepare the antibiotic protocol?",
      'fracture': "👩‍⚕️ Nurse Amy: This fracture finding is significant, Doctor. The patient will need to know about activity restrictions and follow-up care. Should I schedule orthopedic consultation?"
    }

    const message = responses[conditionId] || 
      "👩‍⚕️ Nurse Amy: Interesting finding, Doctor! The patient will appreciate having a clear diagnosis. How does this relate to their presenting symptoms?"

    this.sendNudge({
      message,
      urgency: 'normal',
      type: 'progress_positive',
      conditions: [conditionId]
    })
  }

  // IMMERSIVE: Phase transition responses
  private handlePhaseChange(data: any): void {
    const { newPhase, oldPhase } = data
    const diagnosticPhase = this.mapGamePhaseToDiagnosticPhase(newPhase)

    const phaseMessages: Record<DiagnosticPhase, string> = {
      [DiagnosticPhase.CASE_INTRODUCTION]: "👩‍⚕️ Nurse Amy: Doctor, our new patient has arrived. I've prepared their chart - they seem a bit anxious about their symptoms.",
      [DiagnosticPhase.INITIAL_SCAN]: "👩‍⚕️ Nurse Amy: The patient is positioned and ready for examination, Doctor. They're hoping we can find answers to their concerns.",
      [DiagnosticPhase.INVESTIGATION]: "👩‍⚕️ Nurse Amy: Doctor, we should use our investigation tools now. The patient mentioned some details that might be important for diagnosis.",
      [DiagnosticPhase.ANALYSIS]: "👩‍⚕️ Nurse Amy: Doctor, the patient is asking if we've found anything. Their family is also waiting for updates - what should I tell them?",
      [DiagnosticPhase.DIAGNOSIS_READY]: "👩‍⚕️ Nurse Amy: Doctor, the patient is ready to hear your diagnosis. They trust your expertise - are you prepared to present your findings?"
    }

    if (phaseMessages[diagnosticPhase]) {
      this.sendNudge({
        message: phaseMessages[diagnosticPhase],
        urgency: 'normal',
        type: 'progress_positive'
      })
    }
  }

  // ENHANCEMENT FIRST: Send nudge through existing systems
  private sendNudge(nudgeData: Partial<NurseNudge>): void {
    const nudge: NurseNudge = {
      id: `nudge_${Date.now()}`,
      message: nudgeData.message || '',
      urgency: nudgeData.urgency || 'normal',
      type: nudgeData.type || 'progress_positive',
      timestamp: Date.now(),
      conditions: nudgeData.conditions || []
    }

    // Send through AI Panel (primary method)
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: nudge.id,
        timestamp: nudge.timestamp,
        content: nudge.message,
        type: this.mapUrgencyToInsightType(nudge.urgency),
        confidence: 0.95
      })
    }

    // Store in history
    this.nudgeHistory.push(nudge)
    if (this.nudgeHistory.length > 20) {
      this.nudgeHistory.shift() // Keep last 20 nudges
    }

    this.lastNudgeTime = Date.now()
    this.emit('nudgeSent', nudge)
  }

  private mapUrgencyToInsightType(urgency: NurseNudge['urgency']): 'diagnostic' | 'procedural' | 'educational' | 'urgent' | 'voice' {
    switch (urgency) {
      case 'critical': return 'urgent'
      case 'high': return 'urgent'
      case 'moderate': return 'voice'
      case 'normal': return 'voice'
      default: return 'voice'
    }
  }

  // CLEAN: Get nudge history for analytics
  public getNudgeHistory(): NurseNudge[] {
    return [...this.nudgeHistory]
  }

  // CLEAN: Get nudge statistics
  public getNudgeStats() {
    const total = this.nudgeHistory.length
    const byUrgency = this.nudgeHistory.reduce((acc, nudge) => {
      acc[nudge.urgency] = (acc[nudge.urgency] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byType = this.nudgeHistory.reduce((acc, nudge) => {
      acc[nudge.type] = (acc[nudge.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, byUrgency, byType }
  }
}