// DRY: Single source of truth for all medical knowledge

import * as THREE from 'three';

export interface MedicalCondition {
  id: string
  name: string
  description: string
  symptoms: string[]
  causes: string[]
  treatments: string[]
  severity: 'low' | 'medium' | 'high'
  category: 'orthopedic' | 'neurological' | 'cardiovascular'
  // ENHANCEMENT: Anatomical model requirements for proper visualization
  requiredModel: 'head' | 'torso' | 'fullbody'
  visibleIn: string[] // Anatomical regions where this condition is visible
  // 🏥 Anatomically accurate positioning (replaces arbitrary position)
  anatomicalConfig?: {
    attachmentPoint: {
      boneName: 'skull' | 'cervical_vertebra' | 'mandible' | 'temporomandibular_joint'
      landmark: string
      relativeOffset: THREE.Vector3
    }
    conditionSpecificOffset?: THREE.Vector3
    landmarkBased: boolean
    anatomicalRegion: string
  }
  // Legacy support (deprecated)
  position?: { x: number; y: number; z: number }
  visualClues: string[]
  keyFeatures: string[] // Added for enhanced Cerebras integration
  // GAMIFICATION: Discovery mechanics
  discoveryDifficulty: 'easy' | 'medium' | 'hard'
  scanTimeRequired: number // Seconds of scanning required to reveal
}

export interface PatientCase {
  id: string
  patientInfo: {
    name: string
    age: number
    gender: 'M' | 'F' | 'Other'
    occupation: string
    chiefComplaint: string
    medicalHistory: string[]
  }
  conditions: string[] // References to MedicalCondition IDs
  difficulty: 1 | 2 | 3 | 4 | 5
  prerequisiteKnowledge: string[]
  learningObjectives: string[]
}

export interface DiagnosticQuestion {
  id: string
  conditionId: string
  type: 'observation' | 'analysis' | 'treatment'
  question: string
  options: Array<{
    text: string
    isCorrect: boolean
    points: number
    explanation: string
  }>
  hints: Array<{
    text: string
    cost: number
  }>
}

// MEDICAL CONDITIONS DATABASE
export const MEDICAL_CONDITIONS: Record<string, MedicalCondition> = {
  femur_fracture: {
    id: 'femur_fracture',
    name: 'Femur Fracture',
    description: 'Complete break in the thighbone, often from high-impact trauma',
    symptoms: ['Severe pain', 'Inability to bear weight', 'Visible deformity', 'Swelling'],
    causes: ['Motor vehicle accidents', 'Falls from height', 'Sports injuries'],
    treatments: ['Surgical repair with rods/plates', 'Physical therapy', 'Pain management'],
    severity: 'high',
    category: 'orthopedic',
    requiredModel: 'fullbody',
    visibleIn: ['legs', 'lower_body', 'thigh'],
    position: { x: 0.15, y: -1.2, z: 0 }, // Adjusted for full body model
    visualClues: ['Clear fracture line', 'Bone displacement', 'Soft tissue swelling'],
    keyFeatures: ['Complete fracture line', 'Bone displacement', 'Cortical disruption', 'Soft tissue swelling'],
    discoveryDifficulty: 'easy',
    scanTimeRequired: 2
  },

  knee_arthritis: {
    id: 'knee_arthritis',
    name: 'Knee Osteoarthritis',
    description: 'Degenerative joint disease causing cartilage breakdown',
    symptoms: ['Joint stiffness', 'Pain during movement', 'Reduced range of motion'],
    causes: ['Age-related wear', 'Previous injuries', 'Repetitive stress'],
    treatments: ['Anti-inflammatory medications', 'Physical therapy', 'Joint replacement'],
    severity: 'medium',
    category: 'orthopedic',
    requiredModel: 'fullbody',
    visibleIn: ['legs', 'lower_body', 'knee'],
    position: { x: 0.1, y: -1.8, z: 0 }, // Adjusted for full body model
    visualClues: ['Joint space narrowing', 'Bone spurs', 'Subchondral sclerosis'],
    keyFeatures: ['Joint space narrowing', 'Osteophyte formation', 'Subchondral sclerosis', 'Cartilage degeneration'],
    discoveryDifficulty: 'medium',
    scanTimeRequired: 4
  },

  scoliosis: {
    id: 'scoliosis',
    name: 'Adolescent Idiopathic Scoliosis',
    description: 'Abnormal lateral curvature of the spine',
    symptoms: ['Uneven shoulders', 'Back pain', 'Fatigue', 'Cosmetic concerns'],
    causes: ['Unknown (idiopathic)', 'Genetic factors', 'Growth abnormalities'],
    treatments: ['Observation', 'Bracing', 'Spinal fusion surgery'],
    severity: 'medium',
    category: 'orthopedic',
    requiredModel: 'torso',
    visibleIn: ['spine', 'back', 'torso'],
    position: { x: 0, y: 0.2, z: -0.05 },
    visualClues: ['Spinal curvature', 'Vertebral rotation', 'Rib hump'],
    keyFeatures: ['Lateral spinal curvature', 'Vertebral rotation', 'Cobb angle measurement', 'Compensatory curves'],
    discoveryDifficulty: 'medium',
    scanTimeRequired: 3
  },

  // ENHANCEMENT: Add head/neck conditions for current model compatibility
  cervical_strain: {
    id: 'cervical_strain',
    name: 'Cervical Muscle Strain',
    description: 'Acute strain of neck muscles and ligaments',
    symptoms: ['Neck pain', 'Muscle spasms', 'Limited range of motion', 'Headaches'],
    causes: ['Poor posture', 'Sudden movement', 'Sleeping in awkward position'],
    treatments: ['Rest', 'Ice/heat therapy', 'Anti-inflammatory medications', 'Physical therapy'],
    severity: 'low',
    category: 'orthopedic',
    requiredModel: 'head',
    visibleIn: ['neck', 'cervical_spine', 'head'],
    // 🏥 Anatomically accurate positioning
    anatomicalConfig: {
      attachmentPoint: {
        boneName: 'cervical_vertebra',
        landmark: 'c2',
        relativeOffset: new THREE.Vector3(0.05, 0.1, 0.02)
      },
      landmarkBased: true,
      anatomicalRegion: 'cervical_spine'
    },
    visualClues: ['Muscle tension', 'Reduced neck mobility', 'Tender points'],
    keyFeatures: ['Muscle spasm', 'Soft tissue inflammation', 'Postural changes'],
    discoveryDifficulty: 'easy',
    scanTimeRequired: 2
  },

  temporomandibular_disorder: {
    id: 'temporomandibular_disorder',
    name: 'TMJ Disorder',
    description: 'Dysfunction of the temporomandibular joint',
    symptoms: ['Jaw pain', 'Clicking sounds', 'Limited jaw opening', 'Facial pain'],
    causes: ['Teeth grinding', 'Jaw clenching', 'Arthritis', 'Jaw injury'],
    treatments: ['Bite guards', 'Physical therapy', 'Anti-inflammatory medications', 'Stress management'],
    severity: 'medium',
    category: 'orthopedic',
    requiredModel: 'head',
    visibleIn: ['jaw', 'face', 'temporomandibular_joint'],
    // 🏥 Anatomically accurate positioning for TMJ
    anatomicalConfig: {
      attachmentPoint: {
        boneName: 'temporomandibular_joint',
        landmark: 'lateral',
        relativeOffset: new THREE.Vector3(0.02, -0.01, 0.01)
      },
      landmarkBased: true,
      anatomicalRegion: 'temporomandibular_joint'
    },
    visualClues: ['Joint space changes', 'Disc displacement', 'Muscle tension'],
    keyFeatures: ['Joint dysfunction', 'Disc displacement', 'Muscle hyperactivity'],
    discoveryDifficulty: 'hard',
    scanTimeRequired: 5
  }
}

// PATIENT CASES DATABASE
export const PATIENT_CASES: Record<string, PatientCase> = {
  case_001: {
    id: 'case_001',
    patientInfo: {
      name: 'Sarah M.',
      age: 34,
      gender: 'F',
      occupation: 'Marathon Runner',
      chiefComplaint: 'Knee pain for 6 months, worse when climbing stairs',
      medicalHistory: ['Previous ACL injury (age 28)', 'No chronic conditions']
    },
    conditions: ['knee_arthritis'],
    difficulty: 2,
    prerequisiteKnowledge: ['Basic joint anatomy', 'Common sports injuries'],
    learningObjectives: ['Identify joint space narrowing', 'Understand arthritis progression']
  },

  case_002: {
    id: 'case_002',
    patientInfo: {
      name: 'Michael T.',
      age: 19,
      gender: 'M',
      occupation: 'College Student',
      chiefComplaint: 'Back pain and uneven shoulders noticed by parents',
      medicalHistory: ['Family history of scoliosis', 'Recent growth spurt']
    },
    conditions: ['scoliosis'],
    difficulty: 3,
    prerequisiteKnowledge: ['Spinal anatomy', 'Growth disorders'],
    learningObjectives: ['Measure spinal curvature', 'Assess treatment options']
  },

  case_003: {
    id: 'case_003',
    patientInfo: {
      name: 'Robert K.',
      age: 67,
      gender: 'M',
      occupation: 'Construction Worker (Retired)',
      chiefComplaint: 'Severe thigh pain after fall from ladder',
      medicalHistory: ['Osteoporosis', 'Previous hip fracture']
    },
    conditions: ['femur_fracture'],
    difficulty: 1,
    prerequisiteKnowledge: ['Bone anatomy', 'Fracture classification'],
    learningObjectives: ['Identify fracture location', 'Assess fracture severity']
  }
}

// DIAGNOSTIC QUESTIONS DATABASE
export const DIAGNOSTIC_QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  knee_arthritis: [
    {
      id: 'knee_obs_1',
      conditionId: 'knee_arthritis',
      type: 'observation',
      question: 'What abnormality do you observe in the knee joint?',
      options: [
        { text: 'Normal joint space', isCorrect: false, points: 0, explanation: 'Look more carefully at the space between bones' },
        { text: 'Joint space narrowing', isCorrect: true, points: 10, explanation: 'Correct! Cartilage loss causes reduced joint space' },
        { text: 'Complete joint fusion', isCorrect: false, points: 0, explanation: 'This would indicate end-stage arthritis' },
        { text: 'Joint effusion only', isCorrect: false, points: 5, explanation: 'Partial credit - may be present but not the primary finding' }
      ],
      hints: [
        { text: 'Compare the affected joint to the normal side', cost: 5 },
        { text: 'Look at the space between the femur and tibia', cost: 8 }
      ]
    }
  ],

  scoliosis: [
    {
      id: 'scoliosis_obs_1',
      conditionId: 'scoliosis',
      type: 'observation',
      question: 'What do you notice about the spine alignment?',
      options: [
        { text: 'Normal straight alignment', isCorrect: false, points: 0, explanation: 'Look again at the overall spinal curve' },
        { text: 'Lateral curvature (S-shaped)', isCorrect: true, points: 10, explanation: 'Excellent! This lateral curvature defines scoliosis' },
        { text: 'Forward curvature only', isCorrect: false, points: 0, explanation: 'This would be kyphosis, not scoliosis' },
        { text: 'Backward curvature only', isCorrect: false, points: 0, explanation: 'This would be lordosis, not scoliosis' }
      ],
      hints: [
        { text: 'Trace the spine from top to bottom', cost: 5 },
        { text: 'Look for curves in the coronal plane', cost: 10 }
      ]
    }
  ],

  femur_fracture: [
    {
      id: 'femur_obs_1',
      conditionId: 'femur_fracture',
      type: 'observation',
      question: 'What is the most obvious abnormality in this X-ray?',
      options: [
        { text: 'Normal bone structure', isCorrect: false, points: 0, explanation: 'There is a clear abnormality present' },
        { text: 'Complete fracture with displacement', isCorrect: true, points: 10, explanation: 'Correct! Clear fracture line with bone displacement' },
        { text: 'Hairline crack only', isCorrect: false, points: 3, explanation: 'This is a complete fracture, not just a hairline' },
        { text: 'Bone infection', isCorrect: false, points: 0, explanation: 'No signs of infection - this is traumatic injury' }
      ],
      hints: [
        { text: 'Look for breaks in the bone continuity', cost: 3 },
        { text: 'Check if bone fragments are aligned', cost: 5 }
      ]
    }
  ]
}