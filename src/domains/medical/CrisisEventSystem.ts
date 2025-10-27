/**
 * Crisis Event System
 * ENHANCEMENT: Dynamic crisis events based on patient conditions and case specifics
 * CLEAN: Single responsibility - generate and manage dramatic patient events
 * MODULAR: Integrates with PatientState and GameManager
 * 
 * Core Principles:
 * - Patient-specific crisis events that match case conditions
 * - Dynamic escalation based on player actions and time pressure
 * - Narrative tension that complements economic pressure
 * - Immersive storytelling that enhances medical realism
 */

import { PatientState, PatientCase } from './types';

export interface CrisisEvent {
  id: string;
  type: 'deterioration' | 'complication' | 'emergency' | 'recovery' | 'breakthrough';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  triggerCondition: string; // What condition triggers this event
  timeWindow: { min: number; max: number }; // Time window for event (minutes remaining)
  healthThreshold: { min: number; max: number }; // Health range for event
  probability: number; // 0-1 chance of occurring
  effects: {
    healthChange: number; // Positive or negative health impact
    deteriorationRateChange: number; // Change to patient deterioration rate
    newSymptoms?: string[]; // New symptoms to add
    complications?: string[]; // New complications to add
    timeBonus?: number; // Seconds to add/remove from timer
    budgetImpact?: number; // MON cost/bonus
  };
  narrative: {
    nurseAmyMessage: string;
    audioCue: string;
    visualEffects: string[];
  };
  playerActions: {
    required?: string[]; // Actions that can prevent/mitigate event
    consequences: {
      success: {
        message: string;
        healthRecovery: number;
        timeBonus?: number;
        budgetBonus?: number;
      };
      failure: {
        message: string;
        healthLoss: number;
        timePenalty?: number;
        budgetCost?: number;
      };
    };
  };
}

export interface ActiveCrisis {
  event: CrisisEvent;
  triggeredAt: number;
  resolved: boolean;
  playerResponse?: 'success' | 'failure' | 'ignored';
}

export class CrisisEventSystem {
  private patientState: PatientState;
  private patientCase: PatientCase;
  private activeCrises: Map<string, ActiveCrisis> = new Map();
  private eventHistory: ActiveCrisis[] = [];
  private callbacks: Map<string, Function[]> = new Map();
  private crisisCooldowns: Map<string, number> = new Map(); // Track when events can occur again

  // Predefined crisis events database
  private readonly CRISIS_EVENTS: CrisisEvent[] = [
    // Deterioration Events
    {
      id: 'respiratory_distress',
      type: 'deterioration',
      severity: 'high',
      title: 'Respiratory Distress',
      description: 'Patient experiencing difficulty breathing with decreasing oxygen saturation',
      triggerCondition: 'pulmonary_condition',
      timeWindow: { min: 2, max: 8 },
      healthThreshold: { min: 30, max: 60 },
      probability: 0.7,
      effects: {
        healthChange: -15,
        deteriorationRateChange: 0.5,
        newSymptoms: ['shortness_of_breath', 'cyanosis'],
        budgetImpact: -0.15
      },
      narrative: {
        nurseAmyMessage: "👩‍⚕️ Nurse Amy: Patient's oxygen saturation is dropping! We need to act quickly to prevent respiratory failure.",
        audioCue: 'HIGH_SEVERITY',
        visualEffects: ['oxygen_saturation_drop', 'breathing_difficulty']
      },
      playerActions: {
        required: ['oxygen_therapy', 'bronchodilator'],
        consequences: {
          success: {
            message: "✅ Excellent! Oxygen therapy and bronchodilators have stabilized the patient's breathing.",
            healthRecovery: 10,
            timeBonus: 30,
            budgetBonus: 0.10
          },
          failure: {
            message: "❌ The patient's respiratory status has worsened. We're losing valuable time.",
            healthLoss: -8,
            timePenalty: -15
          }
        }
      }
    },
    {
      id: 'cardiac_instability',
      type: 'deterioration',
      severity: 'critical',
      title: 'Cardiac Instability',
      description: 'Irregular heart rhythm with hemodynamic compromise',
      triggerCondition: 'cardiac_condition',
      timeWindow: { min: 1, max: 6 },
      healthThreshold: { min: 20, max: 50 },
      probability: 0.6,
      effects: {
        healthChange: -20,
        deteriorationRateChange: 0.8,
        newSymptoms: ['chest_pain', 'palpitations', 'hypotension'],
        timeBonus: -30,
        budgetImpact: -0.25
      },
      narrative: {
        nurseAmyMessage: "🚨 Nurse Amy: Critical alert! Patient showing signs of cardiac instability. Immediate intervention required!",
        audioCue: 'HIGH_SEVERITY',
        visualEffects: ['heart_rate_irregular', 'blood_pressure_drop']
      },
      playerActions: {
        required: ['ecg', 'cardiology_consultation'],
        consequences: {
          success: {
            message: "✅ Cardiology consultation and ECG analysis have identified the arrhythmia. Treatment is stabilizing the patient.",
            healthRecovery: 15,
            timeBonus: 45,
            budgetBonus: 0.20
          },
          failure: {
            message: "❌ Cardiac instability progressing. The patient's condition is becoming critical.",
            healthLoss: -12,
            timePenalty: -30,
            budgetCost: 0.10
          }
        }
      }
    },
    // Complication Events
    {
      id: 'sepsis_development',
      type: 'complication',
      severity: 'critical',
      title: 'Sepsis Development',
      description: 'Systemic inflammatory response to infection',
      triggerCondition: 'infectious_condition',
      timeWindow: { min: 3, max: 10 },
      healthThreshold: { min: 40, max: 70 },
      probability: 0.5,
      effects: {
        healthChange: -12,
        deteriorationRateChange: 0.6,
        newSymptoms: ['fever', 'tachycardia', 'altered_mental_status'],
        complications: ['septic_shock'],
        budgetImpact: -0.20
      },
      narrative: {
        nurseAmyMessage: "⚠️ Nurse Amy: I'm concerned about sepsis development. The patient's vital signs are trending concerning.",
        audioCue: 'MEDIUM_SEVERITY',
        visualEffects: ['temperature_spike', 'heart_rate_elevated']
      },
      playerActions: {
        required: ['blood_culture', 'antibiotic_therapy'],
        consequences: {
          success: {
            message: "✅ Blood cultures and early antibiotic therapy are showing positive results. Sepsis progression halted.",
            healthRecovery: 8,
            timeBonus: 60,
            budgetBonus: 0.15
          },
          failure: {
            message: "❌ Sepsis is progressing to severe sepsis. We're running out of time.",
            healthLoss: -15,
            timePenalty: -45,
            budgetCost: 0.15
          }
        }
      }
    },
    // Emergency Events
    {
      id: 'anaphylactic_reaction',
      type: 'emergency',
      severity: 'critical',
      title: 'Anaphylactic Reaction',
      description: 'Severe allergic reaction to medication or contrast',
      triggerCondition: 'allergic_condition',
      timeWindow: { min: 0, max: 15 },
      healthThreshold: { min: 10, max: 100 },
      probability: 0.3,
      effects: {
        healthChange: -25,
        deteriorationRateChange: 1.0,
        newSymptoms: ['urticaria', 'angioedema', 'hypotension', 'bronchospasm'],
        timeBonus: -60,
        budgetImpact: -0.30
      },
      narrative: {
        nurseAmyMessage: "🚨🚨🚨 Nurse Amy: EMERGENCY! Patient experiencing anaphylactic shock! Immediate resuscitation required!",
        audioCue: 'HIGH_SEVERITY',
        visualEffects: ['skin_rash', 'swelling', 'blood_pressure_critical']
      },
      playerActions: {
        required: ['epinephrine', 'airway_management'],
        consequences: {
          success: {
            message: "✅ Crisis averted! Epinephrine and airway management have stabilized the patient from anaphylactic shock.",
            healthRecovery: 20,
            timeBonus: 90,
            budgetBonus: 0.25
          },
          failure: {
            message: "❌ Anaphylactic reaction progressing to cardiovascular collapse. This is a life-threatening emergency.",
            healthLoss: -20,
            timePenalty: -60,
            budgetCost: 0.20
          }
        }
      }
    },
    // Recovery Events
    {
      id: 'treatment_response',
      type: 'recovery',
      severity: 'moderate',
      title: 'Positive Treatment Response',
      description: 'Patient showing improvement to treatment interventions',
      triggerCondition: 'any_treatment',
      timeWindow: { min: 5, max: 15 },
      healthThreshold: { min: 20, max: 80 },
      probability: 0.4,
      effects: {
        healthChange: 10,
        deteriorationRateChange: -0.3,
        timeBonus: 30,
        budgetImpact: 0.10
      },
      narrative: {
        nurseAmyMessage: "😊 Nurse Amy: Good news! The patient is showing positive response to treatment. Vital signs are stabilizing.",
        audioCue: 'DISCOVERY',
        visualEffects: ['vital_signs_improving', 'patient_relaxing']
      },
      playerActions: {
        required: ['monitor_response'],
        consequences: {
          success: {
            message: "✅ Excellent monitoring! Early recognition of treatment response allows for optimization of therapy.",
            healthRecovery: 5,
            timeBonus: 15,
            budgetBonus: 0.05
          },
          failure: {
            message: "⚠️ Missed opportunity to optimize treatment based on positive response.",
            healthLoss: 0
          }
        }
      }
    },
    // Breakthrough Events
    {
      id: 'diagnostic_breakthrough',
      type: 'breakthrough',
      severity: 'high',
      title: 'Diagnostic Breakthrough',
      description: 'Key finding that clarifies the diagnosis',
      triggerCondition: 'complex_case',
      timeWindow: { min: 4, max: 12 },
      healthThreshold: { min: 30, max: 90 },
      probability: 0.6,
      effects: {
        healthChange: 5,
        deteriorationRateChange: 0,
        timeBonus: 60,
        budgetImpact: 0.15
      },
      narrative: {
        nurseAmyMessage: "💡 Nurse Amy: Breakthrough! I've found something in the patient's history that might be the key to this case.",
        audioCue: 'DISCOVERY',
        visualEffects: ['evidence_highlight', 'insight_flash']
      },
      playerActions: {
        required: ['investigate_breakthrough'],
        consequences: {
          success: {
            message: "✅ Brilliant work! This breakthrough finding has clarified the diagnosis and treatment approach.",
            healthRecovery: 8,
            timeBonus: 120,
            budgetBonus: 0.20
          },
          failure: {
            message: "⚠️ Diagnostic breakthrough opportunity missed. The case remains complex.",
            healthLoss: 0
          }
        }
      }
    }
  ];

  constructor(patientState: PatientState, patientCase: PatientCase) {
    this.patientState = patientState;
    this.patientCase = patientCase;
  }

  // ============================================================================
  // EVENT GENERATION & TRIGGERING
  // ============================================================================

  /**
   * Check for and potentially trigger crisis events based on current state
   * IMMERSIVE: Context-aware event generation
   */
  checkForCrisisEvents(timeRemaining: number): CrisisEvent | null {
    const patientData = this.patientState.getState();
    const timeInMinutes = Math.floor(timeRemaining / 60);

    // Don't trigger events too frequently
    const now = Date.now();
    if (this.crisisCooldowns.has('global') && now - this.crisisCooldowns.get('global')! < 30000) {
      return null; // 30 second cooldown between events
    }

    // Filter events based on current conditions
    const relevantEvents = this.getRelevantEvents();
    
    // Filter events based on current state
    const eligibleEvents = relevantEvents.filter(event => {
      // Check time window
      if (timeInMinutes < event.timeWindow.min || timeInMinutes > event.timeWindow.max) {
        return false;
      }
      
      // Check health threshold
      if (patientData.currentHealth < event.healthThreshold.min || patientData.currentHealth > event.healthThreshold.max) {
        return false;
      }
      
      // Check cooldown
      if (this.crisisCooldowns.has(event.id) && now - this.crisisCooldowns.get(event.id)! < 60000) {
        return false; // 1 minute cooldown per event type
      }
      
      return true;
    });

    // Randomly select an event based on probability
    for (const event of eligibleEvents) {
      if (Math.random() < event.probability) {
        // Set cooldown
        this.crisisCooldowns.set(event.id, now);
        this.crisisCooldowns.set('global', now);
        return event;
      }
    }

    return null;
  }

  /**
   * Get events relevant to current patient case
   * INTELLIGENT: Case-specific event selection
   */
  private getRelevantEvents(): CrisisEvent[] {
    const conditions = this.patientCase.conditions || [];
    const caseComplexity = this.patientCase.caseComplexity || 'straightforward';
    
    return this.CRISIS_EVENTS.filter(event => {
      // Match specific conditions
      if (event.triggerCondition === 'any_treatment') return true;
      if (event.triggerCondition === 'complex_case' && caseComplexity !== 'straightforward') return true;
      
      // Match condition-specific events
      return conditions.some(condition => 
        condition.toLowerCase().includes(event.triggerCondition.replace('_condition', ''))
      );
    });
  }

  /**
   * Trigger a crisis event
   * DRAMATIC: Immersive event execution
   */
  triggerCrisisEvent(event: CrisisEvent): ActiveCrisis {
    const activeCrisis: ActiveCrisis = {
      event,
      triggeredAt: Date.now(),
      resolved: false
    };

    // Apply immediate effects
    this.applyCrisisEffects(event);

    // Add to active crises
    this.activeCrises.set(event.id, activeCrisis);
    this.eventHistory.push(activeCrisis);

    // Emit event for UI updates
    this.emit('crisis_triggered', activeCrisis);

    return activeCrisis;
  }

  /**
   * Apply immediate effects of a crisis event
   * IMMEDIATE: Real-time patient state changes
   */
  private applyCrisisEffects(event: CrisisEvent): void {
    const patientData = this.patientState.getState();
    
    // Apply health change
    if (event.effects.healthChange !== 0) {
      // This would need to be implemented in PatientState
      // For now, we'll emit an event for the GameManager to handle
      this.emit('health_change_requested', {
        amount: event.effects.healthChange,
        reason: event.title
      });
    }
    
    // Apply deterioration rate change
    if (event.effects.deteriorationRateChange !== 0) {
      this.emit('deterioration_rate_change_requested', {
        amount: event.effects.deteriorationRateChange,
        reason: event.title
      });
    }
    
    // Apply time bonus/penalty
    if (event.effects.timeBonus) {
      this.emit('time_adjustment_requested', {
        seconds: event.effects.timeBonus,
        reason: event.title
      });
    }
    
    // Apply budget impact
    if (event.effects.budgetImpact) {
      this.emit('budget_adjustment_requested', {
        amount: event.effects.budgetImpact,
        reason: event.title
      });
    }
    
    // Add new symptoms
    if (event.effects.newSymptoms) {
      event.effects.newSymptoms.forEach(symptom => {
        this.emit('symptom_added', {
          symptom,
          reason: event.title
        });
      });
    }
    
    // Add complications
    if (event.effects.complications) {
      event.effects.complications.forEach(complication => {
        this.emit('complication_added', {
          complication,
          reason: event.title
        });
      });
    }
  }

  // ============================================================================
  // PLAYER RESPONSE HANDLING
  // ============================================================================

  /**
   * Handle player response to a crisis event
   * INTERACTIVE: Player agency in crisis resolution
   */
  handlePlayerResponse(eventId: string, action: string, success: boolean): void {
    const activeCrisis = this.activeCrises.get(eventId);
    if (!activeCrisis) return;

    const event = activeCrisis.event;
    
    // Mark as resolved
    activeCrisis.resolved = true;
    activeCrisis.playerResponse = success ? 'success' : 'failure';

    // Apply consequences
    const consequences = success 
      ? event.playerActions.consequences.success 
      : event.playerActions.consequences.failure;

    // Emit consequences for GameManager to handle
    this.emit('crisis_resolved', {
      eventId,
      success,
      consequences,
      event
    });

    // Remove from active crises
    this.activeCrises.delete(eventId);
  }

  /**
   * Resolve crisis event with no player response (ignored)
   * REALISTIC: Consequences for inaction
   */
  resolveCrisisWithoutResponse(eventId: string): void {
    const activeCrisis = this.activeCrises.get(eventId);
    if (!activeCrisis) return;

    activeCrisis.resolved = true;
    activeCrisis.playerResponse = 'ignored';

    // Emit for GameManager to handle default consequences
    this.emit('crisis_ignored', {
      eventId,
      event: activeCrisis.event
    });

    // Remove from active crises
    this.activeCrises.delete(eventId);
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  /**
   * Subscribe to crisis events
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
   * Get all active crises
   * TRANSPARENT: Clear crisis tracking
   */
  getActiveCrises(): ActiveCrisis[] {
    return Array.from(this.activeCrises.values());
  }

  /**
   * Get crisis event history
   * ANALYTICAL: Track event progression
   */
  getEventHistory(): ActiveCrisis[] {
    return [...this.eventHistory];
  }

  /**
   * Check if specific crisis is active
   * UTILITY: Quick status checks
   */
  isCrisisActive(eventId: string): boolean {
    return this.activeCrises.has(eventId) && !this.activeCrises.get(eventId)!.resolved;
  }

  /**
   * Get crisis severity level
   * CONTEXTUAL: Risk assessment
   */
  getCrisisSeverityLevel(): 'low' | 'moderate' | 'high' | 'critical' {
    const activeCrises = this.getActiveCrises();
    if (activeCrises.length === 0) return 'low';
    
    // Return the highest severity among active crises
    const severities: ('low' | 'moderate' | 'high' | 'critical')[] = ['low', 'moderate', 'high', 'critical'];
    let maxSeverityIndex = 0;
    
    activeCrises.forEach(crisis => {
      const severityIndex = severities.indexOf(crisis.event.severity);
      if (severityIndex > maxSeverityIndex) {
        maxSeverityIndex = severityIndex;
      }
    });
    
    return severities[maxSeverityIndex];
  }
}