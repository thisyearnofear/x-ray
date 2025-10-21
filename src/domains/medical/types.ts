/**
 * Medical Case Interface
 * Used by MedicalDataService and related components
 */

import { PatientInfo } from '../../types/types';

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
}