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
    chiefComplaint: 'Chronic headaches with jaw pain',
    vitalSigns: {
      bloodPressure: '128/82',
      heartRate: 76,
      respiratoryRate: 14,
      temperature: 98.4,
      oxygenSaturation: 99,
      painLevel: 6
    }
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
  timestamp: Date.now(),
  
  // ENHANCEMENT: Complete hiddenElements structure matching AI case schema
  hiddenElements: {
    fullHistory: "Marcus is a 34-year-old administrative assistant who has been experiencing bilateral temple headaches for the past 3 weeks. The pain is described as a dull, constant ache that worsens throughout the day, particularly after prolonged computer work. He reports a noticeable 'clicking' sound when opening his mouth wide, especially when eating. The headaches are worse in the morning upon waking and tend to improve slightly with ibuprofen. He denies any visual changes, nausea, or neurological symptoms. His stress levels at work have increased significantly due to an upcoming project deadline. He grinds his teeth at night according to his partner. No history of trauma to the jaw or face.",
    
    pastMedicalHistory: "Generalized anxiety disorder (managed with cognitive behavioral therapy), no previous TMJ issues, no chronic medical conditions. Occasional tension headaches in the past, but never this persistent.",
    
    physicalFindings: [
      "Bilateral tenderness over temporomandibular joints on palpation",
      "Audible and palpable clicking with jaw movement (opening and closing)",
      "Limited jaw opening - maximum interincisal distance of 32mm (normal: 40-50mm)",
      "Tenderness and tightness in bilateral masseter muscles",
      "Mild tenderness over temporal regions bilaterally",
      "No facial asymmetry or swelling",
      "Dental occlusion appears normal",
      "No cervical lymphadenopathy",
      "Cranial nerves II-XII intact",
      "No signs of tooth wear or bruxism visible on examination"
    ],
    
    labResults: {
      "ESR (Erythrocyte Sedimentation Rate)": "22 mm/hr (slightly elevated; normal: 0-20 mm/hr) - suggests mild inflammation",
      "CRP (C-Reactive Protein)": "1.2 mg/dL (within normal range; normal: <1.0 mg/dL)",
      "CBC (Complete Blood Count)": "All values within normal limits - WBC 7.2 K/μL, Hemoglobin 14.8 g/dL, Platelets 245 K/μL",
      "Rheumatoid Factor": "Negative (<20 IU/mL) - rules out rheumatoid arthritis",
      "ANA (Antinuclear Antibody)": "Negative (titer <1:40) - rules out autoimmune disorders"
    },
    
    imagingFindings: {
      "TMJ X-ray (Panoramic)": "Mild degenerative changes in bilateral condyles, no acute fracture or dislocation. Slight anterior disc displacement suggested but not definitively visualized on plain film.",
      "Head CT (if ordered)": "No intracranial abnormalities. Normal brain parenchyma. No masses, hemorrhage, or hydrocephalus. TMJ structures show mild arthritic changes consistent with X-ray findings."
    },
    
    differentialDiagnosis: [
      {
        condition: "Temporomandibular Joint (TMJ) Disorder",
        likelihood: "high",
        reasoning: "Classic presentation: bilateral temple pain, jaw clicking, limited jaw opening, tenderness over TMJ and masseters. Associated with stress and likely bruxism. Clicking indicates possible disc displacement. Most likely diagnosis."
      },
      {
        condition: "Tension-Type Headache",
        likelihood: "medium",
        reasoning: "Bilateral temple pain worse with stress, responds to NSAIDs. However, the jaw clicking and limited opening strongly point to TMJ component. May be co-existing condition."
      },
      {
        condition: "Myofascial Pain Syndrome",
        likelihood: "medium",
        reasoning: "Masseter and temporal muscle tenderness, associated with stress and poor posture during computer work. Could be contributing factor or overlap with TMJ disorder."
      },
      {
        condition: "Temporal Arteritis (Giant Cell Arteritis)",
        likelihood: "low",
        reasoning: "Age <50 makes this unlikely (typically affects >50 years). ESR only mildly elevated, not markedly elevated as expected in temporal arteritis. No visual symptoms or jaw claudication. Unlikely but considered given temple location."
      }
    ]
  },
  
  // ENHANCEMENT: Economic data for MON token integration
  economicData: {
    difficultyTier: 'beginner',
    startingBudget: 0.5, // 0.5 MON tokens
    maxEarnings: 0.2, // Can earn up to 0.2 MON
    timeLimit: 300, // 5 minutes
    requiresWallet: false // Free tier case
  }
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
