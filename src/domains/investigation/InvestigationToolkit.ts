/**
 * Investigation Toolkit
 * ENHANCEMENT: Specialized examination techniques and multi-specialist consultations
 * REALISTIC: Simulates real clinical investigation workflows and timing
 * EDUCATIONAL: Teaches proper investigation sequencing and interpretation
 */

export interface ExamTechnique {
  id: string
  name: string
  category: 'inspection' | 'palpation' | 'percussion' | 'auscultation' | 'special_tests'
  description: string
  applicableRegions: string[]
  skillLevel: 'basic' | 'intermediate' | 'advanced'
  timeRequired: number // in seconds
  equipment?: string[]
  contraindications?: string[]
}

export interface ExamResult {
  techniqueId: string
  findings: string[]
  abnormalFindings: string[]
  clinicalSignificance: number // 0-1
  confidence: number // 0-1
  requiresFollowUp: boolean
  suggestedNextSteps: string[]
  educationalNotes: string[]
}

export interface MedicalSpecialty {
  id: string
  name: string
  description: string
  expertise: string[]
  consultationTime: number // in minutes
  availability: 'immediate' | 'same_day' | 'next_day' | 'scheduled'
  cost: number // relative cost 1-5
}

export interface ConsultationRequest {
  id: string
  specialtyId: string
  urgency: 'routine' | 'urgent' | 'emergent'
  clinicalQuestion: string
  relevantFindings: string[]
  patientContext: string
  requestedBy: string
  timestamp: number
}

export interface ConsultationResponse {
  requestId: string
  specialist: string
  specialty: string
  recommendations: string[]
  differentialDiagnosis: string[]
  suggestedTests: string[]
  followUpRequired: boolean
  confidence: number // 0-1
  responseTime: number // actual time taken
  educationalValue: string[]
}

export interface LabTest {
  id: string
  name: string
  category: 'hematology' | 'chemistry' | 'microbiology' | 'immunology' | 'molecular'
  description: string
  indications: string[]
  turnaroundTime: number // in hours
  cost: number // relative cost 1-5
  specimen: string
  normalRange?: string
}

export interface LabResult {
  testId: string
  value: string
  unit?: string
  normalRange: string
  interpretation: 'normal' | 'abnormal' | 'critical'
  clinicalSignificance: string
  flagged: boolean
  timestamp: number
  turnaroundTime: number // actual time taken
}

export class InvestigationToolkit {
  private examTechniques: Map<string, ExamTechnique>
  private medicalSpecialties: Map<string, MedicalSpecialty>
  private labTests: Map<string, LabTest>
  private pendingConsultations: Map<string, ConsultationRequest>
  private pendingLabTests: Map<string, { test: LabTest; orderTime: number }>
  private consultationHistory: ConsultationResponse[] = []
  private labHistory: LabResult[] = []

  constructor() {
    this.examTechniques = this.initializeExamTechniques()
    this.medicalSpecialties = this.initializeMedicalSpecialties()
    this.labTests = this.initializeLabTests()
    this.pendingConsultations = new Map()
    this.pendingLabTests = new Map()
    
    console.log('🔬 InvestigationToolkit initialized')
  }

  private initializeExamTechniques(): Map<string, ExamTechnique> {
    const techniques = new Map<string, ExamTechnique>()
    
    // Inspection techniques
    techniques.set('general_inspection', {
      id: 'general_inspection',
      name: 'General Inspection',
      category: 'inspection',
      description: 'Visual assessment of patient appearance and behavior',
      applicableRegions: ['general'],
      skillLevel: 'basic',
      timeRequired: 30,
      equipment: []
    })
    
    techniques.set('facial_inspection', {
      id: 'facial_inspection',
      name: 'Facial Inspection',
      category: 'inspection',
      description: 'Detailed visual examination of facial features and symmetry',
      applicableRegions: ['head_neck'],
      skillLevel: 'basic',
      timeRequired: 45,
      equipment: []
    })
    
    // Palpation techniques
    techniques.set('tmj_palpation', {
      id: 'tmj_palpation',
      name: 'TMJ Palpation',
      category: 'palpation',
      description: 'Palpation of temporomandibular joint for tenderness and movement',
      applicableRegions: ['head_neck'],
      skillLevel: 'intermediate',
      timeRequired: 60,
      equipment: []
    })
    
    techniques.set('cervical_palpation', {
      id: 'cervical_palpation',
      name: 'Cervical Lymph Node Palpation',
      category: 'palpation',
      description: 'Systematic palpation of cervical lymph node chains',
      applicableRegions: ['head_neck'],
      skillLevel: 'intermediate',
      timeRequired: 90,
      equipment: []
    })
    
    techniques.set('abdominal_palpation', {
      id: 'abdominal_palpation',
      name: 'Abdominal Palpation',
      category: 'palpation',
      description: 'Systematic palpation of abdominal organs and masses',
      applicableRegions: ['abdomen'],
      skillLevel: 'intermediate',
      timeRequired: 120,
      equipment: []
    })
    
    // Auscultation techniques
    techniques.set('cardiac_auscultation', {
      id: 'cardiac_auscultation',
      name: 'Cardiac Auscultation',
      category: 'auscultation',
      description: 'Systematic auscultation of heart sounds and murmurs',
      applicableRegions: ['chest', 'cardiovascular'],
      skillLevel: 'intermediate',
      timeRequired: 180,
      equipment: ['stethoscope']
    })
    
    techniques.set('pulmonary_auscultation', {
      id: 'pulmonary_auscultation',
      name: 'Pulmonary Auscultation',
      category: 'auscultation',
      description: 'Systematic auscultation of lung fields',
      applicableRegions: ['chest', 'respiratory'],
      skillLevel: 'intermediate',
      timeRequired: 150,
      equipment: ['stethoscope']
    })
    
    // Special tests
    techniques.set('jaw_range_motion', {
      id: 'jaw_range_motion',
      name: 'Jaw Range of Motion',
      category: 'special_tests',
      description: 'Assessment of jaw opening, closing, and lateral movement',
      applicableRegions: ['head_neck'],
      skillLevel: 'basic',
      timeRequired: 90,
      equipment: ['ruler']
    })
    
    techniques.set('neurological_screening', {
      id: 'neurological_screening',
      name: 'Neurological Screening',
      category: 'special_tests',
      description: 'Basic neurological assessment including reflexes and sensation',
      applicableRegions: ['neurological'],
      skillLevel: 'advanced',
      timeRequired: 300,
      equipment: ['reflex_hammer', 'tuning_fork']
    })
    
    return techniques
  }

  private initializeMedicalSpecialties(): Map<string, MedicalSpecialty> {
    const specialties = new Map<string, MedicalSpecialty>()
    
    specialties.set('cardiology', {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Heart and cardiovascular system disorders',
      expertise: ['cardiac_arrhythmias', 'heart_failure', 'coronary_disease', 'valvular_disease'],
      consultationTime: 45,
      availability: 'same_day',
      cost: 4
    })
    
    specialties.set('neurology', {
      id: 'neurology',
      name: 'Neurology',
      description: 'Nervous system disorders',
      expertise: ['headaches', 'seizures', 'stroke', 'movement_disorders', 'neuropathy'],
      consultationTime: 60,
      availability: 'next_day',
      cost: 4
    })
    
    specialties.set('radiology', {
      id: 'radiology',
      name: 'Radiology',
      description: 'Medical imaging interpretation',
      expertise: ['ct_interpretation', 'mri_interpretation', 'xray_interpretation', 'ultrasound'],
      consultationTime: 20,
      availability: 'same_day',
      cost: 3
    })
    
    specialties.set('oral_maxillofacial', {
      id: 'oral_maxillofacial',
      name: 'Oral and Maxillofacial Surgery',
      description: 'Jaw, face, and oral cavity disorders',
      expertise: ['tmj_disorders', 'facial_trauma', 'oral_pathology', 'jaw_surgery'],
      consultationTime: 30,
      availability: 'scheduled',
      cost: 4
    })
    
    specialties.set('emergency_medicine', {
      id: 'emergency_medicine',
      name: 'Emergency Medicine',
      description: 'Acute and urgent medical conditions',
      expertise: ['acute_care', 'trauma', 'critical_care', 'emergency_procedures'],
      consultationTime: 15,
      availability: 'immediate',
      cost: 2
    })
    
    specialties.set('internal_medicine', {
      id: 'internal_medicine',
      name: 'Internal Medicine',
      description: 'General adult medicine and complex medical conditions',
      expertise: ['general_medicine', 'chronic_disease', 'diagnostic_workup', 'medical_management'],
      consultationTime: 40,
      availability: 'same_day',
      cost: 3
    })
    
    return specialties
  }

  private initializeLabTests(): Map<string, LabTest> {
    const tests = new Map<string, LabTest>()
    
    tests.set('cbc', {
      id: 'cbc',
      name: 'Complete Blood Count',
      category: 'hematology',
      description: 'Comprehensive blood cell analysis',
      indications: ['infection', 'anemia', 'bleeding', 'general_screening'],
      turnaroundTime: 2,
      cost: 2,
      specimen: 'whole_blood',
      normalRange: 'Age and gender specific'
    })
    
    tests.set('cmp', {
      id: 'cmp',
      name: 'Comprehensive Metabolic Panel',
      category: 'chemistry',
      description: 'Basic metabolic function assessment',
      indications: ['kidney_function', 'liver_function', 'electrolyte_balance', 'diabetes'],
      turnaroundTime: 3,
      cost: 2,
      specimen: 'serum',
      normalRange: 'Laboratory specific'
    })
    
    tests.set('esr', {
      id: 'esr',
      name: 'Erythrocyte Sedimentation Rate',
      category: 'hematology',
      description: 'Non-specific inflammatory marker',
      indications: ['inflammation', 'infection', 'autoimmune_disease'],
      turnaroundTime: 1,
      cost: 1,
      specimen: 'whole_blood',
      normalRange: '<20 mm/hr (age dependent)'
    })
    
    tests.set('crp', {
      id: 'crp',
      name: 'C-Reactive Protein',
      category: 'chemistry',
      description: 'Acute phase inflammatory marker',
      indications: ['acute_inflammation', 'infection', 'cardiovascular_risk'],
      turnaroundTime: 2,
      cost: 2,
      specimen: 'serum',
      normalRange: '<3.0 mg/L'
    })
    
    tests.set('tsh', {
      id: 'tsh',
      name: 'Thyroid Stimulating Hormone',
      category: 'chemistry',
      description: 'Thyroid function assessment',
      indications: ['thyroid_dysfunction', 'fatigue', 'weight_changes'],
      turnaroundTime: 4,
      cost: 2,
      specimen: 'serum',
      normalRange: '0.4-4.0 mIU/L'
    })
    
    return tests
  }

  /**
   * Perform specialized examination technique
   */
  public performSpecializedExam(technique: ExamTechnique, region: string): Promise<ExamResult> {
    return new Promise((resolve) => {
      // Simulate examination time
      setTimeout(() => {
        const result = this.generateExamResult(technique, region)
        console.log('🔬 Performed', technique.name, 'on', region)
        resolve(result)
      }, technique.timeRequired * 10) // Accelerated for demo (10ms per second)
    })
  }

  private generateExamResult(technique: ExamTechnique, region: string): ExamResult {
    const findings: string[] = []
    const abnormalFindings: string[] = []
    let clinicalSignificance = 0.5
    let confidence = 0.8
    
    // Generate findings based on technique and region
    if (technique.id === 'tmj_palpation' && region === 'head_neck') {
      findings.push('Bilateral TMJ palpated')
      abnormalFindings.push('Tenderness over right TMJ')
      abnormalFindings.push('Muscle tension in right masseter')
      clinicalSignificance = 0.8
      confidence = 0.9
    } else if (technique.id === 'jaw_range_motion' && region === 'head_neck') {
      findings.push('Jaw opening assessed')
      abnormalFindings.push('Limited mouth opening: 35mm (normal >40mm)')
      abnormalFindings.push('Deviation to right on opening')
      clinicalSignificance = 0.7
      confidence = 0.85
    } else if (technique.id === 'facial_inspection' && region === 'head_neck') {
      findings.push('Facial symmetry assessed')
      findings.push('No obvious facial asymmetry')
      findings.push('No visible swelling or deformity')
      clinicalSignificance = 0.3
      confidence = 0.9
    } else {
      // Generic findings for other techniques
      findings.push(`${technique.name} performed on ${region}`)
      findings.push('Examination completed without complications')
      clinicalSignificance = 0.4
      confidence = 0.7
    }
    
    const suggestedNextSteps: string[] = []
    const educationalNotes: string[] = []
    
    if (abnormalFindings.length > 0) {
      suggestedNextSteps.push('Consider imaging studies')
      suggestedNextSteps.push('Specialist consultation may be warranted')
      educationalNotes.push('Abnormal findings require clinical correlation')
    }
    
    educationalNotes.push(`${technique.name} is a ${technique.skillLevel} level technique`)
    educationalNotes.push(`Normal examination helps rule out structural abnormalities`)
    
    return {
      techniqueId: technique.id,
      findings,
      abnormalFindings,
      clinicalSignificance,
      confidence,
      requiresFollowUp: abnormalFindings.length > 0,
      suggestedNextSteps,
      educationalNotes
    }
  }

  /**
   * Request specialist consultation
   */
  public requestSpecialistConsult(
    specialty: string, 
    findings: string[], 
    clinicalQuestion: string,
    urgency: 'routine' | 'urgent' | 'emergent' = 'routine'
  ): ConsultationRequest {
    const specialtyInfo = this.medicalSpecialties.get(specialty)
    if (!specialtyInfo) {
      throw new Error(`Unknown specialty: ${specialty}`)
    }
    
    const request: ConsultationRequest = {
      id: `consult_${Date.now()}`,
      specialtyId: specialty,
      urgency,
      clinicalQuestion,
      relevantFindings: findings,
      patientContext: 'Current case patient',
      requestedBy: 'Primary Care Provider',
      timestamp: Date.now()
    }
    
    this.pendingConsultations.set(request.id, request)
    
    // Simulate consultation response based on availability
    this.simulateConsultationResponse(request, specialtyInfo)
    
    console.log('🔬 Consultation requested:', specialty, 'for', clinicalQuestion)
    return request
  }

  private simulateConsultationResponse(request: ConsultationRequest, specialty: MedicalSpecialty): void {
    const baseDelay = this.getConsultationDelay(specialty.availability, request.urgency)
    
    setTimeout(() => {
      const response = this.generateConsultationResponse(request, specialty)
      this.consultationHistory.push(response)
      this.pendingConsultations.delete(request.id)
      
      // Emit consultation complete event (in real implementation)
      console.log('🔬 Consultation completed:', specialty.name, 'response received')
    }, baseDelay)
  }

  private getConsultationDelay(availability: string, urgency: string): number {
    const baseDelays = {
      immediate: 1000, // 1 second (accelerated)
      same_day: 5000,  // 5 seconds (accelerated)
      next_day: 10000, // 10 seconds (accelerated)
      scheduled: 15000 // 15 seconds (accelerated)
    }
    
    const urgencyMultipliers = {
      emergent: 0.1,
      urgent: 0.3,
      routine: 1.0
    }
    
    const baseDelay = baseDelays[availability as keyof typeof baseDelays] || 5000
    const multiplier = urgencyMultipliers[urgency as keyof typeof urgencyMultipliers] || 1.0
    
    return baseDelay * multiplier
  }

  private generateConsultationResponse(request: ConsultationRequest, specialty: MedicalSpecialty): ConsultationResponse {
    const recommendations: string[] = []
    const differentialDiagnosis: string[] = []
    const suggestedTests: string[] = []
    const educationalValue: string[] = []
    
    // Generate specialty-specific responses
    if (specialty.id === 'oral_maxillofacial' && request.clinicalQuestion.toLowerCase().includes('tmj')) {
      recommendations.push('Conservative management with soft diet and jaw rest')
      recommendations.push('Consider night guard for bruxism')
      recommendations.push('Physical therapy for jaw exercises')
      differentialDiagnosis.push('TMJ dysfunction syndrome')
      differentialDiagnosis.push('Myofascial pain syndrome')
      suggestedTests.push('Panoramic radiograph')
      suggestedTests.push('MRI of TMJ if conservative treatment fails')
      educationalValue.push('TMJ dysfunction is often multifactorial')
      educationalValue.push('Conservative treatment is first-line therapy')
    } else if (specialty.id === 'neurology' && request.clinicalQuestion.toLowerCase().includes('headache')) {
      recommendations.push('Detailed headache diary for pattern recognition')
      recommendations.push('Consider prophylactic medication if frequent')
      recommendations.push('Lifestyle modifications including sleep hygiene')
      differentialDiagnosis.push('Tension-type headache')
      differentialDiagnosis.push('Migraine without aura')
      differentialDiagnosis.push('Medication overuse headache')
      suggestedTests.push('Brain MRI if red flag symptoms present')
      educationalValue.push('Most headaches are primary headache disorders')
      educationalValue.push('Red flag symptoms require urgent evaluation')
    } else {
      // Generic consultation response
      recommendations.push(`Specialty evaluation confirms clinical findings`)
      recommendations.push(`Continue current management approach`)
      differentialDiagnosis.push('Clinical findings consistent with working diagnosis')
      educationalValue.push(`${specialty.name} consultation provides expert opinion`)
    }
    
    return {
      requestId: request.id,
      specialist: `Dr. ${specialty.name.split(' ')[0]}`,
      specialty: specialty.name,
      recommendations,
      differentialDiagnosis,
      suggestedTests,
      followUpRequired: request.urgency !== 'routine',
      confidence: 0.85,
      responseTime: Date.now() - request.timestamp,
      educationalValue
    }
  }

  /**
   * Simulate lab timing with realistic delays
   */
  public simulateLabTiming(testType: string): Promise<LabResult> {
    const test = this.labTests.get(testType)
    if (!test) {
      return Promise.reject(new Error(`Unknown lab test: ${testType}`))
    }
    
    const orderTime = Date.now()
    this.pendingLabTests.set(`${testType}_${orderTime}`, { test, orderTime })
    
    // Convert hours to milliseconds (accelerated for demo)
    const delayMs = test.turnaroundTime * 1000 // 1 second per hour for demo
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.generateLabResult(test, orderTime)
        this.labHistory.push(result)
        this.pendingLabTests.delete(`${testType}_${orderTime}`)
        
        console.log('🔬 Lab result available:', test.name)
        resolve(result)
      }, delayMs)
    })
  }

  private generateLabResult(test: LabTest, orderTime: number): LabResult {
    let value = ''
    let interpretation: 'normal' | 'abnormal' | 'critical' = 'normal'
    let clinicalSignificance = ''
    let flagged = false
    
    // Generate test-specific results
    switch (test.id) {
      case 'cbc':
        value = 'WBC: 7.2, RBC: 4.5, Hgb: 14.2, Hct: 42.1, Plt: 285'
        interpretation = 'normal'
        clinicalSignificance = 'No evidence of infection, anemia, or bleeding disorder'
        break
        
      case 'esr':
        value = '15 mm/hr'
        interpretation = 'normal'
        clinicalSignificance = 'No significant inflammatory process detected'
        break
        
      case 'crp':
        value = '2.1 mg/L'
        interpretation = 'normal'
        clinicalSignificance = 'No acute inflammatory response'
        break
        
      case 'tsh':
        value = '2.3 mIU/L'
        interpretation = 'normal'
        clinicalSignificance = 'Normal thyroid function'
        break
        
      default:
        value = 'Within normal limits'
        interpretation = 'normal'
        clinicalSignificance = 'No abnormalities detected'
    }
    
    return {
      testId: test.id,
      value,
      unit: test.normalRange ? undefined : 'various',
      normalRange: test.normalRange || 'Reference range specific',
      interpretation,
      clinicalSignificance,
      flagged,
      timestamp: Date.now(),
      turnaroundTime: Date.now() - orderTime
    }
  }

  /**
   * Get available examination techniques for a region
   */
  public getAvailableTechniques(region: string): ExamTechnique[] {
    return Array.from(this.examTechniques.values()).filter(technique =>
      technique.applicableRegions.includes(region) || technique.applicableRegions.includes('general')
    )
  }

  /**
   * Get available medical specialties
   */
  public getAvailableSpecialties(): MedicalSpecialty[] {
    return Array.from(this.medicalSpecialties.values())
  }

  /**
   * Get available lab tests
   */
  public getAvailableLabTests(): LabTest[] {
    return Array.from(this.labTests.values())
  }

  /**
   * Get pending consultations
   */
  public getPendingConsultations(): ConsultationRequest[] {
    return Array.from(this.pendingConsultations.values())
  }

  /**
   * Get consultation history
   */
  public getConsultationHistory(): ConsultationResponse[] {
    return [...this.consultationHistory]
  }

  /**
   * Get pending lab tests
   */
  public getPendingLabTests(): Array<{ test: LabTest; orderTime: number }> {
    return Array.from(this.pendingLabTests.values())
  }

  /**
   * Get lab history
   */
  public getLabHistory(): LabResult[] {
    return [...this.labHistory]
  }

  /**
   * Reset investigation toolkit
   */
  public reset(): void {
    this.pendingConsultations.clear()
    this.pendingLabTests.clear()
    this.consultationHistory = []
    this.labHistory = []
    console.log('🔬 InvestigationToolkit reset')
  }

  /**
   * Export investigation data for analytics
   */
  public exportInvestigationData(): any {
    return {
      consultationHistory: this.consultationHistory,
      labHistory: this.labHistory,
      pendingConsultations: Array.from(this.pendingConsultations.values()),
      pendingLabTests: Array.from(this.pendingLabTests.values()),
      timestamp: Date.now()
    }
  }
}