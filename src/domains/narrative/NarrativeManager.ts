/**
 * Narrative Manager
 * ENHANCEMENT: Rich patient backstories, ethical dilemmas, and long-term outcomes
 * IMMERSIVE: Creates emotional connection and realistic patient scenarios
 * EDUCATIONAL: Teaches holistic patient care and ethical decision-making
 */

import { MedicalCase } from '../medical/types'

export interface PatientHistory {
  personalBackground: {
    occupation: string
    education: string
    familyStatus: string
    socioeconomicStatus: 'low' | 'middle' | 'high'
    culturalBackground: string
    languages: string[]
  }
  medicalHistory: {
    chronicConditions: string[]
    previousSurgeries: string[]
    allergies: string[]
    medications: string[]
    familyHistory: string[]
    socialHistory: {
      smoking: boolean
      alcohol: string
      drugs: string
      exercise: string
      diet: string
    }
  }
  psychosocialFactors: {
    stressLevel: number // 0-1
    copingMechanisms: string[]
    supportSystem: string[]
    mentalHealthHistory: string[]
    currentConcerns: string[]
  }
  presentingContext: {
    symptomImpact: string
    functionalLimitations: string[]
    workImpact: string
    relationshipImpact: string
    qualityOfLifeScore: number // 0-10
  }
}

export interface ClinicalContext {
  currentFindings: string[]
  workingDiagnosis: string[]
  treatmentOptions: TreatmentOption[]
  prognosticFactors: string[]
  riskFactors: string[]
  patientPreferences: string[]
  resourceConstraints: string[]
}

export interface TreatmentOption {
  id: string
  name: string
  description: string
  benefits: string[]
  risks: string[]
  contraindications: string[]
  cost: number // relative cost 1-5
  timeToEffect: string
  successRate: number // 0-1
  patientBurden: number // 0-1
  evidenceLevel: 'high' | 'moderate' | 'low' | 'expert_opinion'
}

export interface EthicalChoice {
  id: string
  scenario: string
  dilemmaType: 'autonomy' | 'beneficence' | 'non_maleficence' | 'justice' | 'informed_consent'
  stakeholders: string[]
  options: EthicalOption[]
  timeLimit?: number
  consequences: EthicalConsequence[]
  educationalObjectives: string[]
}

export interface EthicalOption {
  id: string
  description: string
  ethicalPrinciples: string[]
  potentialOutcomes: string[]
  professionalStandards: 'strongly_supports' | 'supports' | 'neutral' | 'questions' | 'violates'
  patientImpact: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative'
  legalConsiderations: string[]
}

export interface EthicalConsequence {
  type: 'immediate' | 'short_term' | 'long_term'
  description: string
  affectedParties: string[]
  severity: number // 0-1
  reversibility: boolean
  learningValue: string
}

export interface TreatmentDecision {
  optionId: string
  reasoning: string
  timestamp: number
  patientInvolvement: 'fully_informed' | 'partially_informed' | 'not_informed'
  sharedDecisionMaking: boolean
  ethicalConsiderations: string[]
}

export interface PatientOutcome {
  shortTerm: {
    symptomResolution: number // 0-1
    functionalImprovement: number // 0-1
    patientSatisfaction: number // 0-1
    complications: string[]
    adherence: number // 0-1
  }
  longTerm: {
    diseaseProgression: string
    qualityOfLife: number // 0-10
    functionalStatus: string
    chronicComplications: string[]
    patientLearning: string[]
    relationshipWithProvider: number // 0-1
  }
  systemicImpact: {
    costEffectiveness: number // 0-1
    resourceUtilization: string
    populationHealth: string
    professionalDevelopment: string[]
  }
}

export class NarrativeManager {
  private patientHistories: Map<string, PatientHistory> = new Map()
  private ethicalChoices: Map<string, EthicalChoice> = new Map()
  private treatmentDecisions: Map<string, TreatmentDecision[]> = new Map()
  private patientOutcomes: Map<string, PatientOutcome> = new Map()
  private narrativeTemplates: Map<string, any> = new Map()

  constructor() {
    this.initializeNarrativeTemplates()
    console.log('📚 NarrativeManager initialized')
  }

  private initializeNarrativeTemplates(): void {
    // Template for TMJ dysfunction case
    this.narrativeTemplates.set('tmj_dysfunction', {
      personalBackground: {
        occupations: ['office_worker', 'teacher', 'call_center_agent', 'student'],
        stressFactors: ['work_deadlines', 'financial_pressure', 'relationship_issues', 'academic_pressure'],
        habits: ['teeth_grinding', 'jaw_clenching', 'gum_chewing', 'nail_biting']
      },
      ethicalScenarios: [
        'expensive_treatment_options',
        'work_accommodation_needs',
        'chronic_pain_management',
        'specialist_referral_timing'
      ]
    })

    // Template for headache cases
    this.narrativeTemplates.set('headache', {
      personalBackground: {
        occupations: ['healthcare_worker', 'executive', 'parent', 'graduate_student'],
        triggers: ['stress', 'sleep_deprivation', 'hormonal_changes', 'dietary_factors'],
        impactAreas: ['work_performance', 'family_relationships', 'social_activities', 'self_care']
      },
      ethicalScenarios: [
        'medication_dependency_risk',
        'work_disability_assessment',
        'imaging_necessity_debate',
        'lifestyle_modification_counseling'
      ]
    })
  }

  /**
   * Generate patient backstory based on medical case
   */
  public generatePatientBackstory(caseType: MedicalCase): PatientHistory {
    const template = this.narrativeTemplates.get(this.getCaseTemplate(caseType))
    
    const backstory: PatientHistory = {
      personalBackground: this.generatePersonalBackground(caseType, template),
      medicalHistory: this.generateMedicalHistory(caseType),
      psychosocialFactors: this.generatePsychosocialFactors(caseType, template),
      presentingContext: this.generatePresentingContext(caseType)
    }
    
    this.patientHistories.set(caseType.id, backstory)
    
    console.log('📚 Generated patient backstory for case:', caseType.id)
    return backstory
  }

  private getCaseTemplate(caseType: MedicalCase): string {
    if (caseType.title.toLowerCase().includes('tmj') || caseType.title.toLowerCase().includes('jaw')) {
      return 'tmj_dysfunction'
    }
    if (caseType.title.toLowerCase().includes('headache')) {
      return 'headache'
    }
    return 'general'
  }

  private generatePersonalBackground(caseType: MedicalCase, template: any): PatientHistory['personalBackground'] {
    const occupations = template?.personalBackground?.occupations || ['office_worker', 'teacher', 'healthcare_worker']
    const selectedOccupation = occupations[Math.floor(Math.random() * occupations.length)]
    
    return {
      occupation: this.getOccupationDetails(selectedOccupation),
      education: 'College graduate',
      familyStatus: 'Married with two children',
      socioeconomicStatus: 'middle',
      culturalBackground: 'Diverse urban community',
      languages: ['English', 'Spanish']
    }
  }

  private getOccupationDetails(occupation: string): string {
    const occupationMap: Record<string, string> = {
      office_worker: 'Administrative assistant at a busy corporate office',
      teacher: 'Elementary school teacher',
      call_center_agent: 'Customer service representative',
      student: 'Graduate student in business administration',
      healthcare_worker: 'Registered nurse in emergency department',
      executive: 'Marketing director at technology company',
      parent: 'Stay-at-home parent managing household and children'
    }
    
    return occupationMap[occupation] || 'Professional worker'
  }

  private generateMedicalHistory(caseType: MedicalCase): PatientHistory['medicalHistory'] {
    return {
      chronicConditions: ['Mild hypertension (well-controlled)'],
      previousSurgeries: ['Appendectomy (2015)'],
      allergies: ['Penicillin (rash)', 'Seasonal allergies'],
      medications: ['Lisinopril 10mg daily', 'Multivitamin'],
      familyHistory: [
        'Mother: Diabetes type 2, hypertension',
        'Father: Heart disease, deceased at 68',
        'Siblings: No significant medical history'
      ],
      socialHistory: {
        smoking: false,
        alcohol: 'Occasional social drinking (1-2 drinks per week)',
        drugs: 'None',
        exercise: 'Walks 30 minutes, 3 times per week',
        diet: 'Generally healthy, occasional fast food'
      }
    }
  }

  private generatePsychosocialFactors(caseType: MedicalCase, template: any): PatientHistory['psychosocialFactors'] {
    const stressFactors = template?.personalBackground?.stressFactors || ['work_pressure', 'family_responsibilities']
    
    return {
      stressLevel: 0.7, // High stress
      copingMechanisms: ['Exercise', 'Talking with friends', 'Reading'],
      supportSystem: ['Spouse', 'Close friends', 'Extended family'],
      mentalHealthHistory: ['Mild anxiety during stressful periods'],
      currentConcerns: [
        'Impact of symptoms on work performance',
        'Concern about chronic condition',
        'Financial impact of medical care'
      ]
    }
  }

  private generatePresentingContext(caseType: MedicalCase): PatientHistory['presentingContext'] {
    return {
      symptomImpact: 'Symptoms significantly affecting daily activities and work concentration',
      functionalLimitations: [
        'Difficulty eating hard foods',
        'Avoiding social meals',
        'Reduced work productivity due to pain'
      ],
      workImpact: 'Missing 1-2 days per month due to severe symptoms',
      relationshipImpact: 'Increased irritability affecting family relationships',
      qualityOfLifeScore: 6 // Moderate impact
    }
  }

  /**
   * Present ethical dilemma based on clinical context
   */
  public presentEthicalDilemma(context: ClinicalContext): EthicalChoice[] {
    const dilemmas: EthicalChoice[] = []
    
    // Generate treatment cost dilemma
    if (context.treatmentOptions.some(option => option.cost >= 4)) {
      dilemmas.push(this.createCostBenefitDilemma(context))
    }
    
    // Generate informed consent dilemma
    if (context.treatmentOptions.some(option => option.risks.length > 2)) {
      dilemmas.push(this.createInformedConsentDilemma(context))
    }
    
    // Generate resource allocation dilemma
    if (context.resourceConstraints.length > 0) {
      dilemmas.push(this.createResourceAllocationDilemma(context))
    }
    
    dilemmas.forEach(dilemma => {
      this.ethicalChoices.set(dilemma.id, dilemma)
    })
    
    console.log('📚 Generated ethical dilemmas:', dilemmas.length)
    return dilemmas
  }

  private createCostBenefitDilemma(context: ClinicalContext): EthicalChoice {
    return {
      id: `cost_benefit_${Date.now()}`,
      scenario: 'The most effective treatment option is expensive and may not be covered by insurance. The patient has expressed financial concerns.',
      dilemmaType: 'justice',
      stakeholders: ['Patient', 'Family', 'Healthcare system', 'Insurance provider'],
      options: [
        {
          id: 'recommend_expensive',
          description: 'Recommend the most effective treatment despite cost',
          ethicalPrinciples: ['Beneficence', 'Medical excellence'],
          potentialOutcomes: ['Best medical outcome', 'Financial hardship for patient'],
          professionalStandards: 'supports',
          patientImpact: 'positive',
          legalConsiderations: ['Informed consent about costs required']
        },
        {
          id: 'recommend_affordable',
          description: 'Recommend a less expensive alternative treatment',
          ethicalPrinciples: ['Justice', 'Practical wisdom'],
          potentialOutcomes: ['Affordable care', 'Potentially suboptimal outcome'],
          professionalStandards: 'supports',
          patientImpact: 'neutral',
          legalConsiderations: ['Must disclose all reasonable options']
        },
        {
          id: 'explore_assistance',
          description: 'Help patient explore financial assistance options',
          ethicalPrinciples: ['Beneficence', 'Justice', 'Advocacy'],
          potentialOutcomes: ['Possible access to optimal care', 'Time and effort required'],
          professionalStandards: 'strongly_supports',
          patientImpact: 'very_positive',
          legalConsiderations: ['No legal obligations but ethically commendable']
        }
      ],
      timeLimit: 60,
      consequences: [],
      educationalObjectives: [
        'Understand healthcare equity challenges',
        'Learn about patient advocacy role',
        'Explore healthcare financing impact on care decisions'
      ]
    }
  }

  private createInformedConsentDilemma(context: ClinicalContext): EthicalChoice {
    return {
      id: `informed_consent_${Date.now()}`,
      scenario: 'The patient seems overwhelmed by the complexity of treatment options and risks. They are asking you to "just decide what\'s best."',
      dilemmaType: 'autonomy',
      stakeholders: ['Patient', 'Family', 'Healthcare provider'],
      options: [
        {
          id: 'respect_delegation',
          description: 'Accept the patient\'s delegation and make the medical decision',
          ethicalPrinciples: ['Respect for autonomy', 'Beneficence'],
          potentialOutcomes: ['Reduced patient anxiety', 'Potential regret if outcome poor'],
          professionalStandards: 'questions',
          patientImpact: 'neutral',
          legalConsiderations: ['May not meet informed consent standards']
        },
        {
          id: 'insist_involvement',
          description: 'Insist the patient participate in decision-making',
          ethicalPrinciples: ['Autonomy', 'Informed consent'],
          potentialOutcomes: ['True informed consent', 'Increased patient stress'],
          professionalStandards: 'strongly_supports',
          patientImpact: 'positive',
          legalConsiderations: ['Meets legal standards for informed consent']
        },
        {
          id: 'gradual_education',
          description: 'Provide information gradually and check understanding',
          ethicalPrinciples: ['Autonomy', 'Beneficence', 'Practical wisdom'],
          potentialOutcomes: ['Better patient understanding', 'More time required'],
          professionalStandards: 'strongly_supports',
          patientImpact: 'very_positive',
          legalConsiderations: ['Exceeds minimum legal requirements']
        }
      ],
      timeLimit: 90,
      consequences: [],
      educationalObjectives: [
        'Understand informed consent principles',
        'Learn communication strategies for complex decisions',
        'Explore patient autonomy in healthcare'
      ]
    }
  }

  private createResourceAllocationDilemma(context: ClinicalContext): EthicalChoice {
    return {
      id: `resource_allocation_${Date.now()}`,
      scenario: 'The imaging study that would be most helpful has a 2-week wait time. A less optimal but available alternative could be done today.',
      dilemmaType: 'justice',
      stakeholders: ['Current patient', 'Other patients', 'Healthcare system'],
      options: [
        {
          id: 'wait_optimal',
          description: 'Wait for the optimal imaging study',
          ethicalPrinciples: ['Beneficence', 'Medical excellence'],
          potentialOutcomes: ['Best diagnostic information', 'Delayed diagnosis and treatment'],
          professionalStandards: 'supports',
          patientImpact: 'neutral',
          legalConsiderations: ['Standard of care considerations']
        },
        {
          id: 'use_available',
          description: 'Use the immediately available alternative',
          ethicalPrinciples: ['Practical wisdom', 'Efficiency'],
          potentialOutcomes: ['Faster diagnosis', 'Potentially incomplete information'],
          professionalStandards: 'supports',
          patientImpact: 'positive',
          legalConsiderations: ['Acceptable if clinically reasonable']
        },
        {
          id: 'clinical_diagnosis',
          description: 'Proceed with clinical diagnosis without imaging',
          ethicalPrinciples: ['Clinical expertise', 'Resource conservation'],
          potentialOutcomes: ['Immediate treatment', 'Diagnostic uncertainty'],
          professionalStandards: 'neutral',
          patientImpact: 'neutral',
          legalConsiderations: ['Requires careful documentation of reasoning']
        }
      ],
      timeLimit: 45,
      consequences: [],
      educationalObjectives: [
        'Understand resource allocation in healthcare',
        'Learn to balance optimal vs. practical care',
        'Explore clinical decision-making under constraints'
      ]
    }
  }

  /**
   * Track long-term outcomes based on treatment decisions
   */
  public trackLongTermOutcomes(caseId: string, decisions: TreatmentDecision[]): PatientOutcome {
    this.treatmentDecisions.set(caseId, decisions)
    
    const outcome = this.calculatePatientOutcome(decisions)
    this.patientOutcomes.set(caseId, outcome)
    
    console.log('📚 Tracked long-term outcomes for case:', caseId)
    return outcome
  }

  private calculatePatientOutcome(decisions: TreatmentDecision[]): PatientOutcome {
    // Analyze decisions to determine outcomes
    const hasSharedDecisionMaking = decisions.some(d => d.sharedDecisionMaking)
    const hasEthicalConsiderations = decisions.some(d => d.ethicalConsiderations.length > 0)
    const patientInvolvementLevel = this.calculatePatientInvolvement(decisions)
    
    return {
      shortTerm: {
        symptomResolution: hasSharedDecisionMaking ? 0.8 : 0.6,
        functionalImprovement: 0.7,
        patientSatisfaction: patientInvolvementLevel,
        complications: hasEthicalConsiderations ? [] : ['Minor treatment side effects'],
        adherence: hasSharedDecisionMaking ? 0.9 : 0.7
      },
      longTerm: {
        diseaseProgression: 'Stable with good symptom control',
        qualityOfLife: hasSharedDecisionMaking ? 8.5 : 7.0,
        functionalStatus: 'Returned to normal activities',
        chronicComplications: [],
        patientLearning: [
          'Better understanding of condition',
          'Improved self-management skills',
          'Enhanced communication with healthcare providers'
        ],
        relationshipWithProvider: patientInvolvementLevel
      },
      systemicImpact: {
        costEffectiveness: hasEthicalConsiderations ? 0.8 : 0.6,
        resourceUtilization: 'Appropriate use of healthcare resources',
        populationHealth: 'Contributes to evidence-based care patterns',
        professionalDevelopment: [
          'Enhanced clinical decision-making skills',
          'Improved patient communication',
          'Better understanding of ethical considerations'
        ]
      }
    }
  }

  private calculatePatientInvolvement(decisions: TreatmentDecision[]): number {
    const involvementScores = decisions.map(decision => {
      switch (decision.patientInvolvement) {
        case 'fully_informed': return 1.0
        case 'partially_informed': return 0.6
        case 'not_informed': return 0.2
        default: return 0.5
      }
    })
    
    return involvementScores.reduce((sum, score) => sum + score, 0) / involvementScores.length
  }

  /**
   * Get patient history for a case
   */
  public getPatientHistory(caseId: string): PatientHistory | undefined {
    return this.patientHistories.get(caseId)
  }

  /**
   * Get ethical choices for a case
   */
  public getEthicalChoices(caseId: string): EthicalChoice[] {
    return Array.from(this.ethicalChoices.values())
  }

  /**
   * Get patient outcomes for a case
   */
  public getPatientOutcomes(caseId: string): PatientOutcome | undefined {
    return this.patientOutcomes.get(caseId)
  }

  /**
   * Get treatment decisions for a case
   */
  public getTreatmentDecisions(caseId: string): TreatmentDecision[] {
    return this.treatmentDecisions.get(caseId) || []
  }

  /**
   * Reset narrative manager
   */
  public reset(): void {
    this.patientHistories.clear()
    this.ethicalChoices.clear()
    this.treatmentDecisions.clear()
    this.patientOutcomes.clear()
    console.log('📚 NarrativeManager reset')
  }

  /**
   * Export narrative data for analytics
   */
  public exportNarrativeData(): any {
    return {
      patientHistories: Object.fromEntries(this.patientHistories),
      ethicalChoices: Object.fromEntries(this.ethicalChoices),
      treatmentDecisions: Object.fromEntries(this.treatmentDecisions),
      patientOutcomes: Object.fromEntries(this.patientOutcomes),
      timestamp: Date.now()
    }
  }
}