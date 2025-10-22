import { MedicalCase } from '../types';
import { MedicalCondition } from '../medical-data';

const sampleCase: MedicalCase = {
  id: 'case-x487',
  title: 'Chronic Headaches with Jaw Pain',
  presentingComplaint: 'A 3-week history of persistent headaches, localized to the temples and radiating to the jaw.',
  patientStory: 'The patient is a 34-year-old administrative assistant who reports increased stress at work. The headaches are worse in the morning and are associated with a clicking sound when opening and closing the mouth.',
  initialFindings: 'Tenderness on palpation of the temporomandibular joint (TMJ) and masseter muscles. Audible clicking on jaw movement.',
  mission: 'Your mission is to establish a definitive diagnosis within the next 5 minutes and recommend an initial management plan.',
  stakes: 'The patient\'s quality of life is significantly impacted. A misdiagnosis could lead to unnecessary procedures or a worsening of the underlying condition.',
  patientInfo: {
    patientName: 'Marcus Johnson',
    age: 34,
    gender: 'Male',
    chiefComplaint: 'Chronic headaches with jaw pain'
  },
  // Enhanced diagnostic properties for immersive experience
  estimatedCaseLength: 300, // 5 minutes
  caseDifficulty: 'medium',
  difficulty: 'medium',
  caseComplexity: 'complex',
  requiredModel: 'head',
  conditions: ['tmj_disorder', 'tension_headache'],
  aiGenerated: false,
  estimatedStudyTime: 300,
  timestamp: Date.now()
};

export class MedicalDataService {
  public getCase(caseId: string): MedicalCase | undefined {
    // In a real application, this would fetch from a database or API
    if (caseId === 'case-x487') {
      return sampleCase;
    }
    return undefined;
  }

  public getAllCases(): MedicalCase[] {
    return [sampleCase];
  }

  // ENHANCED: Get individual medical condition
  public getCondition(conditionId: string): MedicalCondition | undefined {
    const { MEDICAL_CONDITIONS } = require('../medical-data');
    return MEDICAL_CONDITIONS.find((condition: MedicalCondition) => condition.id === conditionId);
  }
}
