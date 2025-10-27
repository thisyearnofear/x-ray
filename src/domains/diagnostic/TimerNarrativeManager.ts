/**
 * Timer Narrative Manager
 * ENHANCEMENT: Coordinated narrative tension that complements economic pressure
 * CLEAN: Single responsibility - manage dramatic timer-based storytelling
 * MODULAR: Integrates with GameManager, PatientState, and CrisisEventSystem
 * 
 * Core Principles:
 * - Patient-specific milestones that create story-driven urgency
 * - Emergency mode events based on patient conditions
 * - Narrative tension that enhances immersion without overwhelming
 * - Seamless integration with existing timer and economic systems
 */

import { CrisisEventSystem, CrisisEvent, ActiveCrisis } from '../medical/CrisisEventSystem';
import { PatientState, PatientCase } from '../medical/types';
import { GamePhase } from './GameManager';

export interface NarrativeMilestone {
  timeRemaining: number; // seconds
  id: string;
  type: 'scheduled' | 'conditional' | 'crisis';
  title: string;
  description: string;
  urgency: 'normal' | 'moderate' | 'high' | 'critical';
  conditions?: {
    patientHealth?: { min: number; max: number };
    patientCriticality?: string[];
    caseComplexity?: string[];
    conditionsFound?: { min: number; max: number };
  };
  effects: {
    visual: string[];
    audio: string;
    uiNotifications: string[];
  };
  narrative: {
    nurseAmyMessage: string;
    patientContext?: any;
  };
  actions: {
    available: string[];
    required?: string[];
  };
}

export interface ActiveNarrativeEvent {
  milestone: NarrativeMilestone | CrisisEvent;
  type: 'scheduled' | 'crisis';
  triggeredAt: number;
  resolved: boolean;
  playerResponse?: 'success' | 'failure' | 'ignored';
}

export class TimerNarrativeManager {
  private crisisEventSystem: CrisisEventSystem;
  private patientState: PatientState;
  private patientCase: PatientCase;
  private activeEvents: Map<string, ActiveNarrativeEvent> = new Map();
  private eventHistory: ActiveNarrativeEvent[] = [];
  private callbacks: Map<string, Function[]> = new Map();
  private lastCrisisCheck: number = 0;
  private crisisCheckInterval: number = 10000; // 10 seconds

  // Scheduled narrative milestones (building upon existing timer system)
  private readonly SCHEDULED_MILESTONES: NarrativeMilestone[] = [
    {
      timeRemaining: 240, // 4:00
      id: 'case_introduction',
      type: 'scheduled',
      title: 'Case Introduction',
      description: 'Meet the patient and begin initial assessment',
      urgency: 'normal',
      effects: {
        visual: ['patient_arrival_animation', 'vital_signs_display'],
        audio: 'PATIENT_ARRIVAL',
        uiNotifications: ['show_patient_info', 'unlock_investigation_tools']
      },
      narrative: {
        nurseAmyMessage: "👩‍⚕️ Nurse Amy: Dr. [Player], meet your patient. Please begin with a thorough history and physical examination.",
        patientContext: {
          greeting: "Hello, Doctor. I've been experiencing these symptoms for the past few days.",
          concern: "I'm really worried about what's causing this.",
          background: "I work in an office and haven't had any recent injuries."
        }
      },
      actions: {
        available: ['patient_interview', 'vital_signs', 'physical_examination']
      }
    },
    {
      timeRemaining: 180, // 3:00
      id: 'initial_findings',
      type: 'scheduled',
      title: 'Initial Findings',
      description: 'Key observations from initial assessment',
      urgency: 'normal',
      conditions: {
        conditionsFound: { min: 1, max: 10 }
      },
      effects: {
        visual: ['evidence_highlight', 'finding_notification'],
        audio: 'DISCOVERY',
        uiNotifications: ['show_evidence_summary']
      },
      narrative: {
        nurseAmyMessage: "👩‍⚕️ Nurse Amy: Your initial assessment has revealed some interesting findings. Consider what investigations might be helpful next.",
        patientContext: {
          observation: "The patient's symptoms seem to be progressing. We should act quickly."
        }
      },
      actions: {
        available: ['lab_orders', 'imaging_request', 'consultation']
      }
    },
    {
      timeRemaining: 150, // 2:30
      id: 'complexity_warning',
      type: 'conditional',
      title: 'Case Complexity',
      description: 'Case appears more complex than initially thought',
      urgency: 'moderate',
      conditions: {
        caseComplexity: ['complex', 'advanced'],
        patientHealth: { min: 40, max: 80 }
      },
      effects: {
        visual: ['complexity_indicator', 'warning_pulse'],
        audio: 'MEDIUM_SEVERITY',
        uiNotifications: ['show_complexity_warning', 'unlock_advanced_tools']
      },
      narrative: {
        nurseAmyMessage: "⚠️ Nurse Amy: This case seems more complex than initially apparent. Consider consulting with a specialist or ordering additional tests.",
        patientContext: {
          complexity: "Multiple systems may be involved. A systematic approach is essential."
        }
      },
      actions: {
        available: ['specialist_consultation', 'advanced_imaging', 'additional_labs']
      }
    },
    {
      timeRemaining: 120, // 2:00
      id: 'critical_decision_point',
      type: 'scheduled',
      title: 'Critical Decision Point',
      description: 'Time to formulate working diagnosis and treatment plan',
      urgency: 'high',
      effects: {
        visual: ['decision_highlight', 'timer_emphasis'],
        audio: 'HIGH_SEVERITY',
        uiNotifications: ['show_decision_options', 'unlock_treatment_menu']
      },
      narrative: {
        nurseAmyMessage: "⏰ Nurse Amy: Time for critical decisions. Based on your findings, what's your working diagnosis and treatment approach?",
        patientContext: {
          urgency: "The patient's condition requires immediate attention. Every second counts."
        }
      },
      actions: {
        available: ['diagnosis_submission', 'treatment_selection', 'emergency_intervention']
      }
    },
    {
      timeRemaining: 90, // 1:30
      id: 'evidence_synthesis',
      type: 'scheduled',
      title: 'Evidence Synthesis',
      description: 'Correlate all findings and prepare comprehensive assessment',
      urgency: 'high',
      effects: {
        visual: ['synthesis_animation', 'evidence_correlation'],
        audio: 'MEDIUM_SEVERITY',
        uiNotifications: ['show_evidence_summary', 'unlock_final_tools']
      },
      narrative: {
        nurseAmyMessage: "🧩 Nurse Amy: Let's synthesize all the evidence. How do the findings correlate with your working diagnosis?",
        patientContext: {
          synthesis: "All pieces of the puzzle need to fit together for an accurate diagnosis."
        }
      },
      actions: {
        available: ['evidence_review', 'differential_diagnosis', 'final_assessment']
      }
    },
    {
      timeRemaining: 60, // 1:00
      id: 'diagnosis_preparation',
      type: 'scheduled',
      title: 'Final Diagnosis Preparation',
      description: 'Prepare comprehensive diagnosis for patient and family',
      urgency: 'critical',
      effects: {
        visual: ['final_countdown', 'diagnosis_highlight'],
        audio: 'HIGH_SEVERITY',
        uiNotifications: ['show_diagnosis_options', 'unlock_family_brief']
      },
      narrative: {
        nurseAmyMessage: "🚨 Nurse Amy: Final preparation for diagnosis. The patient and family are waiting for answers. Make sure you're confident in your assessment.",
        patientContext: {
          final_preparation: "This is the moment of truth. Your diagnosis will determine the treatment path."
        }
      },
      actions: {
        available: ['final_diagnosis', 'treatment_plan', 'family_consultation']
      }
    },
    {
      timeRemaining: 30, // 0:30
      id: 'emergency_escalation',
      type: 'conditional',
      title: 'Emergency Escalation Required',
      description: 'Immediate action required - patient condition may deteriorate',
      urgency: 'critical',
      conditions: {
        patientHealth: { min: 0, max: 50 },
        patientCriticality: ['critical', 'terminal']
      },
      effects: {
        visual: ['emergency_pulse', 'crisis_indicators'],
        audio: 'HIGH_SEVERITY',
        uiNotifications: ['show_emergency_options', 'unlock_critical_care']
      },
      narrative: {
        nurseAmyMessage: "🚨🚨🚨 Nurse Amy: EMERGENCY ESCALATION! The patient's condition is critical. Immediate intervention is required to prevent deterioration!",
        patientContext: {
          emergency: "This is a life-threatening situation. Rapid action is essential."
        }
      },
      actions: {
        available: ['emergency_treatment', 'critical_care', 'code_blue']
      }
    }
  ];

  constructor(patientState: PatientState, patientCase: PatientCase) {
    this.patientState = patientState;
    this.patientCase = patientCase;
    this.crisisEventSystem = new CrisisEventSystem(patientState, patientCase);
    
    // Set up crisis event system listeners
    this.setupCrisisEventListeners();
  }

  // ============================================================================
  // NARRATIVE COORDINATION
  // ============================================================================

  /**
   * Check for and trigger narrative events based on current game state
   * COORDINATED: Synchronized storytelling
   */
  checkForNarrativeEvents(
    timeRemaining: number,
    gameState: any,
    currentPhase: GamePhase
  ): ActiveNarrativeEvent | null {
    const now = Date.now();
    
    // Check for scheduled milestones
    const scheduledEvent = this.checkForScheduledMilestones(timeRemaining, gameState);
    if (scheduledEvent) {
      return scheduledEvent;
    }
    
    // Check for crisis events (not too frequently)
    if (now - this.lastCrisisCheck > this.crisisCheckInterval) {
      this.lastCrisisCheck = now;
      const crisisEvent = this.checkForCrisisEvents(timeRemaining);
      if (crisisEvent) {
        return crisisEvent;
      }
    }
    
    return null;
  }

  /**
   * Check for scheduled narrative milestones
   * PREDICTABLE: Consistent story progression
   */
  private checkForScheduledMilestones(
    timeRemaining: number,
    gameState: any
  ): ActiveNarrativeEvent | null {
    // Find matching milestone
    const milestone = this.SCHEDULED_MILESTONES.find(m => {
      // Check time match
      if (m.timeRemaining !== timeRemaining) return false;
      
      // Check conditional requirements
      if (m.conditions) {
        // Patient health condition
        if (m.conditions.patientHealth) {
          const health = this.patientState.getState().currentHealth;
          if (health < m.conditions.patientHealth.min || health > m.conditions.patientHealth.max) {
            return false;
          }
        }
        
        // Patient criticality condition
        if (m.conditions.patientCriticality) {
          const criticality = this.patientState.getState().criticality;
          if (!m.conditions.patientCriticality.includes(criticality)) {
            return false;
          }
        }
        
        // Case complexity condition
        if (m.conditions.caseComplexity) {
          const complexity = this.patientCase.caseComplexity || 'straightforward';
          if (!m.conditions.caseComplexity.includes(complexity)) {
            return false;
          }
        }
        
        // Conditions found condition
        if (m.conditions.conditionsFound) {
          const conditionsFound = gameState.discoveredConditions?.size || 0;
          if (conditionsFound < m.conditions.conditionsFound.min || conditionsFound > m.conditions.conditionsFound.max) {
            return false;
          }
        }
      }
      
      return true;
    });
    
    if (milestone) {
      const activeEvent: ActiveNarrativeEvent = {
        milestone,
        type: 'scheduled',
        triggeredAt: Date.now(),
        resolved: false
      };
      
      this.activeEvents.set(milestone.id, activeEvent);
      this.eventHistory.push(activeEvent);
      
      this.emit('narrative_event_triggered', activeEvent);
      return activeEvent;
    }
    
    return null;
  }

  /**
   * Check for dynamic crisis events
   * DYNAMIC: Context-aware storytelling
   */
  private checkForCrisisEvents(timeRemaining: number): ActiveNarrativeEvent | null {
    const crisisEvent = this.crisisEventSystem.checkForCrisisEvents(timeRemaining);
    if (crisisEvent) {
      // Trigger the crisis event through the crisis system
      const activeCrisis = this.crisisEventSystem.triggerCrisisEvent(crisisEvent);
      
      // Create narrative event wrapper
      const activeEvent: ActiveNarrativeEvent = {
        milestone: crisisEvent,
        type: 'crisis',
        triggeredAt: activeCrisis.triggeredAt,
        resolved: activeCrisis.resolved,
        playerResponse: activeCrisis.playerResponse
      };
      
      this.activeEvents.set(crisisEvent.id, activeEvent);
      this.eventHistory.push(activeEvent);
      
      return activeEvent;
    }
    
    return null;
  }

  // ============================================================================
  // CRISIS EVENT INTEGRATION
  // ============================================================================

  /**
   * Set up listeners for crisis event system
   * INTEGRATED: Seamless event handling
   */
  private setupCrisisEventListeners(): void {
    this.crisisEventSystem.on('crisis_triggered', (activeCrisis: any) => {
      this.emit('crisis_event_triggered', activeCrisis);
    });
    
    this.crisisEventSystem.on('health_change_requested', (data: any) => {
      this.emit('health_change_requested', data);
    });
    
    this.crisisEventSystem.on('deterioration_rate_change_requested', (data: any) => {
      this.emit('deterioration_rate_change_requested', data);
    });
    
    this.crisisEventSystem.on('time_adjustment_requested', (data: any) => {
      this.emit('time_adjustment_requested', data);
    });
    
    this.crisisEventSystem.on('budget_adjustment_requested', (data: any) => {
      this.emit('budget_adjustment_requested', data);
    });
    
    this.crisisEventSystem.on('symptom_added', (data: any) => {
      this.emit('symptom_added', data);
    });
    
    this.crisisEventSystem.on('complication_added', (data: any) => {
      this.emit('complication_added', data);
    });
    
    this.crisisEventSystem.on('crisis_resolved', (data: any) => {
      this.emit('crisis_resolved', data);
    });
    
    this.crisisEventSystem.on('crisis_ignored', (data: any) => {
      this.emit('crisis_ignored', data);
    });
  }

  /**
   * Handle player response to a crisis event
   * INTERACTIVE: Player agency in narrative
   */
  handleCrisisResponse(eventId: string, action: string, success: boolean): void {
    this.crisisEventSystem.handlePlayerResponse(eventId, action, success);
    
    // Update our tracking
    const activeEvent = this.activeEvents.get(eventId);
    if (activeEvent) {
      activeEvent.resolved = true;
      activeEvent.playerResponse = success ? 'success' : 'failure';
    }
  }

  /**
   * Resolve crisis event with no player response
   * REALISTIC: Consequences for inaction
   */
  resolveCrisisWithoutResponse(eventId: string): void {
    this.crisisEventSystem.resolveCrisisWithoutResponse(eventId);
    
    // Update our tracking
    const activeEvent = this.activeEvents.get(eventId);
    if (activeEvent) {
      activeEvent.resolved = true;
      activeEvent.playerResponse = 'ignored';
    }
  }

  // ============================================================================
  // NARRATIVE TENSION MANAGEMENT
  // ============================================================================

  /**
   * Get current narrative tension level
   * CONTEXTUAL: Dynamic difficulty adjustment
   */
  getNarrativeTensionLevel(): 'low' | 'moderate' | 'high' | 'critical' {
    // Base tension on time remaining
    const timeTension = this.getTimeBasedTension();
    
    // Factor in active crises
    const crisisTension = this.crisisEventSystem.getCrisisSeverityLevel();
    
    // Factor in patient state
    const patientTension = this.getPatientBasedTension();
    
    // Return highest tension level
    const tensions: ('low' | 'moderate' | 'high' | 'critical')[] = [timeTension, crisisTension, patientTension];
    const severityOrder: ('low' | 'moderate' | 'high' | 'critical')[] = ['low', 'moderate', 'high', 'critical'];
    
    let maxSeverityIndex = 0;
    tensions.forEach(tension => {
      const index = severityOrder.indexOf(tension);
      if (index > maxSeverityIndex) {
        maxSeverityIndex = index;
      }
    });
    
    return severityOrder[maxSeverityIndex];
  }

  /**
   * Get time-based tension level
   * TEMPORAL: Pressure that builds over time
   */
  private getTimeBasedTension(): 'low' | 'moderate' | 'high' | 'critical' {
    // This would be provided by the GameManager
    // For now, we'll return a placeholder
    return 'moderate';
  }

  /**
   * Get patient-based tension level
   * PATIENT-CENTERED: Health-driven narrative pressure
   */
  private getPatientBasedTension(): 'low' | 'moderate' | 'high' | 'critical' {
    const patientData = this.patientState.getState();
    
    if (patientData.currentHealth <= 20 || patientData.criticality === 'terminal') {
      return 'critical';
    } else if (patientData.currentHealth <= 40 || patientData.criticality === 'critical') {
      return 'high';
    } else if (patientData.currentHealth <= 60 || patientData.criticality === 'deteriorating') {
      return 'moderate';
    }
    
    return 'low';
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  /**
   * Subscribe to narrative events
   * MODULAR: Event-driven architecture
   */
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  /**
   * Emit event to subscribers
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // ============================================================================
  // GETTERS & UTILITIES
  // ============================================================================

  /**
   * Get all active narrative events
   * TRANSPARENT: Clear event tracking
   */
  getActiveEvents(): ActiveNarrativeEvent[] {
    return Array.from(this.activeEvents.values()).filter(event => !event.resolved);
  }

  /**
   * Get narrative event history
   * ANALYTICAL: Track story progression
   */
  getEventHistory(): ActiveNarrativeEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Get crisis event system for direct access
   * ACCESSIBLE: Flexible integration options
   */
  getCrisisEventSystem(): CrisisEventSystem {
    return this.crisisEventSystem;
  }
}