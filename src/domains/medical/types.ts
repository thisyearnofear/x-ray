/**
 * Medical Case Interface
 * Used by MedicalDataService and related components
 * 
 * ENHANCEMENT: Added MON token economy types for treatments/tests
 */

import { PatientInfo } from '../../types/types';

/**
 * Medical Action (Test/Treatment) with MON cost
 * CLEAN: Single source of truth for medical actions economy
 */
export interface MedicalAction {
  id: string;
  name: string;
  category: 'test' | 'treatment' | 'consultation' | 'imaging';
  cost: number; // MON tokens
  riskLevel: 'low' | 'medium' | 'high';
  informationGain: number; // 0-100 scale
  description: string;
  expectedOutcome: string;
  risks: string[];
  contraindications?: string[];
  timeRequired?: number; // in minutes
  
  // ENHANCEMENT: Treatment effectiveness
  effectiveness?: {
    baseSuccessRate: number; // 0-1 scale
    effectivenessVsCriticality: { // How effective based on patient state
      stable: number;
      deteriorating: number;
      critical: number;
      terminal: number;
    };
    healthImpact: number; // How much health restored on success (-20 to +50)
    deteriorationReduction: number; // Reduces deterioration rate (0-1 scale)
    requiresConditions?: string[]; // Required diagnoses for effectiveness
    contraindictedConditions?: string[]; // Conditions that reduce effectiveness
  };
}

/**
 * Treatment/Test result after execution
 */
export interface ActionResult {
  actionId: string;
  success: boolean;
  findings: string[];
  complications?: string[];
  costIncurred: number;
  timestamp: number;
}

export interface MedicalCase {
  id: string;
  title: string;
  presentingComplaint: string;
  patientStory: string;
  initialFindings: string;
  mission: string;
  stakes: string;
  patientInfo: PatientInfo;
  
  // Enhanced diagnostic properties for immersive experience
  estimatedCaseLength?: number;
  caseDifficulty?: 'easy' | 'medium' | 'hard';
  difficulty?: 'easy' | 'medium' | 'hard';
  caseComplexity?: 'straightforward' | 'complex' | 'advanced';
  requiredModel?: string;
  conditions?: string[];
  aiGenerated?: boolean;
  estimatedStudyTime?: number;
  timestamp?: number;
  
  // ENHANCEMENT: MON Token Economy
  economicData?: {
    difficultyTier: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    startingBudget: number; // MON tokens
    maxEarnings: number; // MON tokens
    timeLimit: number; // seconds
    requiresWallet: boolean;
  };
  
  // Hidden elements that are revealed progressively (for compatibility with PatientCase)
  hiddenElements?: {
    fullHistory?: string;
    pastMedicalHistory?: string;
    physicalFindings?: string[];
    labResults?: { [key: string]: string };
    imagingFindings?: { [key: string]: string };
    differentialDiagnosis?: Array<{
      condition: string;
      likelihood: string;
      reasoning: string;
    }>;
  };
  
  // Onchain features
  isAIGenerated?: boolean;
  generatedAt?: number;
  smartAccountAddress?: string;
  
  // Case generation context
  caseGenerationContext?: {
  originalDifficulty?: 'easy' | 'medium' | 'hard';
  generationTimestamp?: number;
  generatedByAI?: boolean;
  generationFailed?: boolean;
  fallbackUsed?: boolean;
  userWallet?: string;
  };
}

/**
 * ENHANCEMENT: PatientState - Extracted patient criticality and deterioration logic
 * CLEAN: Single source of truth for time-based patient progression
 */
export interface PatientStateData {
  criticality: 'stable' | 'deteriorating' | 'critical' | 'terminal';
  deteriorationRate: number; // points per minute
  currentHealth: number; // 0-100 scale
  timeSinceAdmission: number; // minutes
  lastUpdateTime: number; // timestamp
  vitalSigns: VitalSigns;
  complications: string[];
  interventions: string[]; // actions taken that affect state
}

export class PatientState {
  private data: PatientStateData;
  private initialHealth: number = 100;
  private deteriorationFactors: Map<string, number> = new Map();
  private eventCallbacks: Map<string, Function[]> = new Map();
  private milestonesPassed: Set<string> = new Set();
  
  // ENHANCEMENT: Deterioration milestones for dramatic progression
  private readonly DETERIORATION_MILESTONES = [
    { health: 80, event: 'mild_deterioration', message: 'Patient showing early signs of decline' },
    { health: 60, event: 'moderate_deterioration', message: 'Patient condition worsening' },
    { health: 50, event: 'complication_risk', message: 'High risk of complications' },
    { health: 40, event: 'critical_threshold', message: 'Patient entering critical state' },
    { health: 20, event: 'terminal_threshold', message: 'Patient condition grave - immediate intervention required' }
  ];

  constructor(patientCase: PatientCase) {
    this.data = this.extractFromPatientCase(patientCase);
  }

  /**
   * Extract patient state from existing PatientCase structure
   */
  private extractFromPatientCase(patientCase: PatientCase): PatientStateData {
    // Determine initial criticality based on case complexity and symptoms
    const criticality = this.determineInitialCriticality(patientCase);

    // Calculate deterioration rate based on complexity
    const deteriorationRate = this.calculateDeteriorationRate(patientCase);

    // Extract or generate vital signs
    const vitalSigns = this.extractVitalSigns(patientCase);

    return {
      criticality,
      deteriorationRate,
      currentHealth: this.initialHealth,
      timeSinceAdmission: 0,
      lastUpdateTime: Date.now(),
      vitalSigns,
      complications: [],
      interventions: []
    };
  }

  private determineInitialCriticality(patientCase: PatientCase): 'stable' | 'deteriorating' | 'critical' | 'terminal' {
    const complexity = patientCase.caseComplexity || 'straightforward';

    // Check for critical symptoms in chief complaint
    const criticalKeywords = ['unconscious', 'shock', 'arrest', 'seizure', 'hemorrhage', 'trauma'];
    const hasCriticalSymptoms = criticalKeywords.some(keyword =>
      patientCase.chiefComplaint.toLowerCase().includes(keyword)
    );

    if (hasCriticalSymptoms) return 'critical';
    if (complexity === 'advanced') return 'deteriorating';
    if (complexity === 'complex') return 'deteriorating';
    return 'stable';
  }

  private calculateDeteriorationRate(patientCase: PatientCase): number {
    const complexity = patientCase.caseComplexity || 'straightforward';

    // Base deterioration rates (health points lost per minute)
    const rates = {
      straightforward: 0.5, // Very slow deterioration
      complex: 1.0,          // Moderate deterioration
      advanced: 2.0          // Fast deterioration
    };

    return rates[complexity] || 0.5;
  }

  private extractVitalSigns(patientCase: PatientCase): VitalSigns {
    // Use provided vital signs (direct property takes precedence)
    if (patientCase.vitalSigns) {
      return patientCase.vitalSigns;
    }

    // Use initial presentation vital signs
    if (patientCase.initialPresentation?.vitalSigns) {
      const vs = patientCase.initialPresentation.vitalSigns;
      return {
        temperature: vs.temperature || 98.6,
        heartRate: vs.heartRate || 72,
        bloodPressure: vs.bloodPressure || '120/80',
        respiratoryRate: vs.respiratoryRate || 16,
        oxygenSaturation: vs.oxygenSaturation || 98,
        painLevel: (vs as any).painLevel || 0
      };
    }

    // Generate defaults based on criticality
    const criticality = this.determineInitialCriticality(patientCase);
    return this.generateDefaultVitals(criticality);
  }

  private generateDefaultVitals(criticality: string): VitalSigns {
    switch (criticality) {
      case 'critical':
        return {
          temperature: 101.5,
          heartRate: 120,
          bloodPressure: '90/60',
          respiratoryRate: 28,
          oxygenSaturation: 92,
          painLevel: 8
        };
      case 'deteriorating':
        return {
          temperature: 99.5,
          heartRate: 95,
          bloodPressure: '110/70',
          respiratoryRate: 20,
          oxygenSaturation: 96,
          painLevel: 5
        };
      default: // stable
        return {
          temperature: 98.6,
          heartRate: 72,
          bloodPressure: '120/80',
          respiratoryRate: 16,
          oxygenSaturation: 98,
          painLevel: 2
        };
    }
  }

  /**
   * Update patient state based on time progression
   */
  public update(deltaTimeMinutes: number): void {
    const previousHealth = this.data.currentHealth;
    
    this.data.timeSinceAdmission += deltaTimeMinutes;
    this.data.lastUpdateTime = Date.now();

    // Apply deterioration
    const deterioration = this.data.deteriorationRate * deltaTimeMinutes;
    this.data.currentHealth = Math.max(0, this.data.currentHealth - deterioration);

    // Update criticality based on current health
    this.updateCriticalityFromHealth();

    // Apply any active deterioration factors
    this.applyDeteriorationFactors(deltaTimeMinutes);

    // Update vital signs based on current state
    this.updateVitalSigns();
    
    // ENHANCEMENT: Check for deterioration milestones
    this.checkDeteriorationMilestones(previousHealth, this.data.currentHealth);
  }

  private updateCriticalityFromHealth(): void {
    if (this.data.currentHealth <= 20) {
      this.data.criticality = 'terminal';
    } else if (this.data.currentHealth <= 40) {
      this.data.criticality = 'critical';
    } else if (this.data.currentHealth <= 70) {
      this.data.criticality = 'deteriorating';
    } else {
      this.data.criticality = 'stable';
    }
  }

  private applyDeteriorationFactors(deltaTimeMinutes: number): void {
    this.deteriorationFactors.forEach((rate, factor) => {
      const deterioration = rate * deltaTimeMinutes;
      this.data.currentHealth = Math.max(0, this.data.currentHealth - deterioration);
    });
  }

  private updateVitalSigns(): void {
    // Adjust vital signs based on current health and criticality
    const healthRatio = this.data.currentHealth / 100;

    switch (this.data.criticality) {
      case 'terminal':
        this.data.vitalSigns.heartRate = Math.max(40, 140 - (healthRatio * 100));
        this.data.vitalSigns.bloodPressure = '80/50';
        this.data.vitalSigns.oxygenSaturation = Math.max(80, 98 - (healthRatio * 20));
        break;
      case 'critical':
        this.data.vitalSigns.heartRate = 110 + (Math.random() * 20);
        this.data.vitalSigns.bloodPressure = '95/65';
        this.data.vitalSigns.oxygenSaturation = 90 + (healthRatio * 8);
        break;
      case 'deteriorating':
        this.data.vitalSigns.heartRate = 85 + (Math.random() * 15);
        this.data.vitalSigns.oxygenSaturation = 94 + (healthRatio * 6);
        break;
      case 'stable':
        // Vitals remain relatively stable
        break;
    }
  }

  /**
   * Apply intervention that affects patient state
   */
  public applyIntervention(interventionId: string, effectiveness: number): void {
    this.data.interventions.push(interventionId);

    // Positive interventions improve health
    if (effectiveness > 0) {
      const improvement = effectiveness * 10; // Scale effectiveness to health points
      this.data.currentHealth = Math.min(100, this.data.currentHealth + improvement);

      // Remove deterioration factors for successful interventions
      if (effectiveness > 0.7) {
        this.deteriorationFactors.clear();
      }
    } else {
      // Failed interventions can cause complications
      this.data.complications.push(`Complication from ${interventionId}`);
      // Increase deterioration rate temporarily
      this.deteriorationFactors.set(`failed_${interventionId}`, 0.5);
    }

    this.updateCriticalityFromHealth();
  }

  /**
   * Get current patient state
   */
  public getState(): PatientStateData {
    return { ...this.data };
  }

  /**
   * Check if patient has reached terminal state
   */
  public isTerminal(): boolean {
    return this.data.criticality === 'terminal' || this.data.currentHealth <= 0;
  }

  /**
   * Get deterioration prognosis
   */
  public getPrognosis(): {
    timeToCritical: number; // minutes until critical
    timeToTerminal: number; // minutes until terminal
    survivalProbability: number; // 0-1 scale
    nextMilestone?: { health: number; event: string; timeRemaining: number };
  } {
    const health = this.data.currentHealth;
    const rate = this.data.deteriorationRate;

    const timeToCritical = rate > 0 ? (health - 40) / rate : Infinity;
    const timeToTerminal = rate > 0 ? health / rate : Infinity;
    const survivalProbability = Math.max(0, Math.min(1, health / 100));
    
    // Calculate next milestone
    const nextMilestone = this.getNextMilestone();

    return {
      timeToCritical: Math.max(0, timeToCritical),
      timeToTerminal: Math.max(0, timeToTerminal),
      survivalProbability,
      nextMilestone
    };
  }
  
  /**
   * ENHANCEMENT: Event system for patient state changes
   */
  public on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }
  
  private emit(event: string, data: any): void {
    const callbacks = this.eventCallbacks.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
  
  /**
   * ENHANCEMENT: Check for deterioration milestones
   */
  private checkDeteriorationMilestones(previousHealth: number, currentHealth: number): void {
    for (const milestone of this.DETERIORATION_MILESTONES) {
      // Check if we just crossed this milestone
      if (previousHealth > milestone.health && currentHealth <= milestone.health) {
        if (!this.milestonesPassed.has(milestone.event)) {
          this.milestonesPassed.add(milestone.event);
          
          // Add complication if at complication_risk milestone
          if (milestone.event === 'complication_risk') {
            this.data.complications.push('Deterioration complications emerging');
            // Increase deterioration rate
            this.deteriorationFactors.set('complication', 0.3);
          }
          
          // Emit milestone event
          this.emit('milestone', {
            milestone: milestone.event,
            health: currentHealth,
            message: milestone.message,
            criticality: this.data.criticality,
            vitalSigns: this.data.vitalSigns
          });
        }
      }
    }
  }
  
  /**
   * Get next upcoming deterioration milestone
   */
  private getNextMilestone(): { health: number; event: string; timeRemaining: number } | undefined {
    const health = this.data.currentHealth;
    const rate = this.data.deteriorationRate;
    
    for (const milestone of this.DETERIORATION_MILESTONES) {
      if (health > milestone.health && !this.milestonesPassed.has(milestone.event)) {
        const timeRemaining = rate > 0 ? (health - milestone.health) / rate : Infinity;
        return {
          health: milestone.health,
          event: milestone.event,
          timeRemaining: Math.max(0, timeRemaining)
        };
      }
    }
    
    return undefined;
  }
  
  /**
   * Get all milestones for UI display
   */
  public getMilestones(): Array<{ health: number; event: string; message: string; passed: boolean }> {
    return this.DETERIORATION_MILESTONES.map(m => ({
      ...m,
      passed: this.milestonesPassed.has(m.event)
    }));
  }
}

/**
 * Unified Patient Case Interface
 * COMPREHENSIVE: Contains all properties needed by CaseRevelationService and other medical services
 * COMPATIBLE: Works with both GeneratedPatientCase from API and MedicalWorkflowManager
 */

export interface VitalSigns {
  bloodPressure: string
  heartRate: number
  respiratoryRate: number
  temperature: number
  oxygenSaturation: number
  painLevel: number
}

export interface DifferentialDiagnosis {
  condition: string
  likelihood: 'high' | 'medium' | 'low'
  reasoning: string
  supportingFindings: string[]
  contradictoryFindings: string[]
}

export interface PatientCase {
  // Basic patient information
  id: string
  patientName: string
  age: number
  gender: string
  occupation?: string
  socialHistory?: string
  chiefComplaint: string
  
  // Detailed history
  historyOfPresentIllness?: string
  pastMedicalHistory?: string[]
  medications?: string[]
  allergies?: string[]
  
  // Vital signs
  vitalSigns?: VitalSigns
  
  // Initial presentation
  initialPresentation?: {
    vitalSigns?: {
      temperature?: number
      heartRate?: number
      bloodPressure?: string
      respiratoryRate?: number
      oxygenSaturation?: number
    }
    generalAssessment?: string
  }
  
  // Hidden elements that are revealed progressively
  hiddenElements?: {
    fullHistory?: string
    pastMedicalHistory?: string
    physicalFindings?: string[]
    labResults?: { [key: string]: string }
    imagingFindings?: { [key: string]: string }
    differentialDiagnosis?: Array<{
      condition: string
      likelihood: string
      reasoning: string
    }>
  }
  
  // Symptoms and findings
  symptoms?: string[]
  physicalExamFindings?: string[]
  
  // Diagnostic information
  diagnosticHypothesis?: string[]
  differentialDiagnosis?: DifferentialDiagnosis[]
  
  // Case metadata
  requiredModel?: string
  conditions?: string[]
  caseComplexity?: 'straightforward' | 'complex' | 'advanced'
  estimatedCaseLength?: number
  caseDifficulty?: 'easy' | 'medium' | 'hard'
  difficulty?: 'easy' | 'medium' | 'hard'
  aiGenerated?: boolean
  estimatedStudyTime?: number
  timestamp?: number
  
  // ENHANCEMENT: MON Token Economy
  economicData?: {
    difficultyTier: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    startingBudget: number;
    maxEarnings: number;
    timeLimit: number;
    requiresWallet: boolean;
  }
}
