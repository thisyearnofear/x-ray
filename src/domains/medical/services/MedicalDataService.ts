/**
 * Medical Data Service
 * MODULAR: Single responsibility for medical data operations
 * DRY: Centralized medical data access
 * CLEAN: Pure data service, no business logic
 */

import { MEDICAL_CONDITIONS, type MedicalCondition } from '../medical-data'

export interface PatientCase {
  id: string
  patientName: string
  age: number
  gender: string
  chiefComplaint: string
  historyOfPresentIllness: string
  requiredModel: string
  conditions: string[]
  timestamp: number
}

export class MedicalDataService {
  
  // CLEAN: Pure data access methods
  getCondition(id: string): MedicalCondition | undefined {
    return Object.values(MEDICAL_CONDITIONS).find(condition => condition.id === id)
  }

  getConditionsForModel(model: string): MedicalCondition[] {
    return Object.values(MEDICAL_CONDITIONS).filter(condition => 
      condition.requiredModel === model
    )
  }

  getConditionsBySeverity(severity: 'low' | 'medium' | 'high'): MedicalCondition[] {
    return Object.values(MEDICAL_CONDITIONS).filter(condition => 
      condition.severity === severity
    )
  }

  getAllConditions(): MedicalCondition[] {
    return Object.values(MEDICAL_CONDITIONS)
  }

  // MODULAR: Patient case generation
  generatePatientCase(model: string, difficulty: string): PatientCase {
    const availableConditions = this.getConditionsForModel(model)
    const selectedCondition = availableConditions[Math.floor(Math.random() * availableConditions.length)]
    
    if (!selectedCondition) {
      throw new Error(`No conditions available for model: ${model}`)
    }

    return {
      id: `case_${Date.now()}`,
      patientName: this.generatePatientName(),
      age: this.generateAge(),
      gender: this.generateGender(),
      chiefComplaint: this.generateChiefComplaint(selectedCondition),
      historyOfPresentIllness: this.generateHPI(selectedCondition),
      requiredModel: model,
      conditions: [selectedCondition.id],
      timestamp: Date.now()
    }
  }

  // DRY: Centralized generation helpers
  private generatePatientName(): string {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    return `${firstName} ${lastName}`
  }

  private generateAge(): number {
    return Math.floor(Math.random() * 60) + 20 // 20-80 years
  }

  private generateGender(): string {
    const genders = ['Male', 'Female', 'Non-binary']
    return genders[Math.floor(Math.random() * genders.length)]
  }

  private generateChiefComplaint(condition: MedicalCondition): string {
    const complaints = {
      head: ['Headache', 'Dizziness', 'Vision changes', 'Confusion'],
      chest: ['Chest pain', 'Shortness of breath', 'Palpitations', 'Cough'],
      abdomen: ['Abdominal pain', 'Nausea', 'Vomiting', 'Bloating']
    }

    const modelComplaints = complaints[condition.requiredModel as keyof typeof complaints] || ['General discomfort']
    return modelComplaints[Math.floor(Math.random() * modelComplaints.length)]
  }

  private generateHPI(condition: MedicalCondition): string {
    const duration = ['2 days', '1 week', '3 days', '5 days'][Math.floor(Math.random() * 4)]
    const onset = ['gradual', 'sudden', 'progressive'][Math.floor(Math.random() * 3)]
    
    return `Patient presents with ${onset} onset of symptoms over the past ${duration}. ${condition.description} Patient reports ${condition.symptoms?.[0] || 'associated symptoms'}.`
  }

  // CLEAN: Search and filter methods
  searchConditions(query: string): MedicalCondition[] {
    const lowercaseQuery = query.toLowerCase()
    return Object.values(MEDICAL_CONDITIONS).filter(condition =>
      condition.name.toLowerCase().includes(lowercaseQuery) ||
      condition.description.toLowerCase().includes(lowercaseQuery) ||
      condition.symptoms?.some(symptom => symptom.toLowerCase().includes(lowercaseQuery))
    )
  }

  validatePatientCase(patientCase: PatientCase): boolean {
    return !!(
      patientCase.id &&
      patientCase.patientName &&
      patientCase.age > 0 &&
      patientCase.chiefComplaint &&
      patientCase.requiredModel &&
      patientCase.conditions.length > 0
    )
  }
}