/**
 * Medical Actions Database
 * DRY: Single source of truth for all medical actions, costs, and outcomes
 * IMMERSIVE: Realistic medical procedures with risk/reward mechanics
 * MODULAR: Easily extensible for new actions
 */

import { MedicalAction } from './types';

/**
 * Diagnostic Tests - Information Gathering
 */
export const DIAGNOSTIC_TESTS: MedicalAction[] = [
  {
    id: 'blood_panel_basic',
    name: 'Basic Blood Panel',
    category: 'test',
    cost: 0.05,
    riskLevel: 'low',
    informationGain: 40,
    description: 'Complete blood count with basic metabolic panel',
    expectedOutcome: 'Reveals infection markers, anemia, basic organ function',
    risks: ['Minor discomfort', 'Bruising at needle site'],
    timeRequired: 2
  },
  {
    id: 'blood_panel_comprehensive',
    name: 'Comprehensive Metabolic Panel',
    category: 'test',
    cost: 0.12,
    riskLevel: 'low',
    informationGain: 65,
    description: 'Detailed blood chemistry including liver, kidney, electrolytes',
    expectedOutcome: 'Comprehensive organ function assessment',
    risks: ['Minor discomfort'],
    timeRequired: 3
  },
  {
    id: 'xray_chest',
    name: 'Chest X-Ray',
    category: 'imaging',
    cost: 0.15,
    riskLevel: 'low',
    informationGain: 55,
    description: 'Standard two-view chest radiograph',
    expectedOutcome: 'Visualize lungs, heart, chest cavity abnormalities',
    risks: ['Minimal radiation exposure'],
    timeRequired: 5
  },
  {
    id: 'ct_scan',
    name: 'CT Scan',
    category: 'imaging',
    cost: 0.40,
    riskLevel: 'medium',
    informationGain: 85,
    description: 'Computed tomography with detailed 3D imaging',
    expectedOutcome: 'High-resolution anatomical visualization',
    risks: ['Radiation exposure', 'Contrast reaction (if contrast used)', 'High cost'],
    contraindications: ['Pregnancy', 'Severe kidney disease (if contrast used)'],
    timeRequired: 10
  },
  {
    id: 'mri_scan',
    name: 'MRI Scan',
    category: 'imaging',
    cost: 0.60,
    riskLevel: 'medium',
    informationGain: 90,
    description: 'Magnetic resonance imaging for soft tissue detail',
    expectedOutcome: 'Excellent soft tissue visualization, no radiation',
    risks: ['Claustrophobia', 'Long scan time', 'Very high cost'],
    contraindications: ['Metal implants', 'Pacemakers', 'Severe claustrophobia'],
    timeRequired: 20
  },
  {
    id: 'ultrasound',
    name: 'Ultrasound',
    category: 'imaging',
    cost: 0.10,
    riskLevel: 'low',
    informationGain: 50,
    description: 'Real-time sonographic imaging',
    expectedOutcome: 'Visualize soft tissues, blood flow, organ motion',
    risks: ['None'],
    timeRequired: 8
  },
  {
    id: 'ecg',
    name: 'Electrocardiogram (ECG)',
    category: 'test',
    cost: 0.08,
    riskLevel: 'low',
    informationGain: 60,
    description: 'Heart electrical activity monitoring',
    expectedOutcome: 'Detect arrhythmias, ischemia, heart abnormalities',
    risks: ['None'],
    timeRequired: 3
  },
  {
    id: 'culture_blood',
    name: 'Blood Culture',
    category: 'test',
    cost: 0.18,
    riskLevel: 'low',
    informationGain: 70,
    description: 'Bacterial/fungal culture from blood sample',
    expectedOutcome: 'Identify bloodstream infections, guide antibiotic therapy',
    risks: ['Minor discomfort', '24-48hr wait for results'],
    timeRequired: 24
  }
];

/**
 * Treatments - Active Interventions
 */
export const TREATMENTS: MedicalAction[] = [
  {
    id: 'antibiotics_broad',
    name: 'Broad-Spectrum Antibiotics',
    category: 'treatment',
    cost: 0.20,
    riskLevel: 'medium',
    informationGain: 30,
    description: 'Empiric antibiotic coverage for suspected infection',
    expectedOutcome: 'Treat bacterial infections before culture results',
    risks: ['Allergic reaction', 'C. diff infection', 'Antibiotic resistance'],
    contraindications: ['Known antibiotic allergy'],
    timeRequired: 0,
    effectiveness: {
      baseSuccessRate: 0.65,
      effectivenessVsCriticality: {
        stable: 0.80,
        deteriorating: 0.65,
        critical: 0.45,
        terminal: 0.20
      },
      healthImpact: 15,
      deteriorationReduction: 0.3,
      requiresConditions: ['infection'],
      contraindictedConditions: ['viral_infection']
    }
  },
  {
    id: 'antibiotics_targeted',
    name: 'Targeted Antibiotics',
    category: 'treatment',
    cost: 0.15,
    riskLevel: 'low',
    informationGain: 20,
    description: 'Culture-directed antibiotic therapy',
    expectedOutcome: 'Effective treatment with lower resistance risk',
    risks: ['Minor side effects'],
    timeRequired: 0,
    effectiveness: {
      baseSuccessRate: 0.90,
      effectivenessVsCriticality: {
        stable: 0.95,
        deteriorating: 0.90,
        critical: 0.75,
        terminal: 0.50
      },
      healthImpact: 25,
      deteriorationReduction: 0.5,
      requiresConditions: ['infection', 'culture_result'],
      contraindictedConditions: []
    }
  },
  {
    id: 'iv_fluids',
    name: 'IV Fluid Resuscitation',
    category: 'treatment',
    cost: 0.10,
    riskLevel: 'low',
    informationGain: 15,
    description: 'Intravenous crystalloid fluid administration',
    expectedOutcome: 'Restore hydration and blood pressure',
    risks: ['Fluid overload', 'Electrolyte imbalance'],
    timeRequired: 1,
    effectiveness: {
      baseSuccessRate: 0.85,
      effectivenessVsCriticality: {
        stable: 0.90,
        deteriorating: 0.85,
        critical: 0.75,
        terminal: 0.50
      },
      healthImpact: 10,
      deteriorationReduction: 0.2,
      requiresConditions: ['dehydration', 'hypotension'],
      contraindictedConditions: ['heart_failure', 'fluid_overload']
    }
  },
  {
    id: 'oxygen_therapy',
    name: 'Supplemental Oxygen',
    category: 'treatment',
    cost: 0.05,
    riskLevel: 'low',
    informationGain: 10,
    description: 'Oxygen administration via nasal cannula or mask',
    expectedOutcome: 'Improve oxygen saturation',
    risks: ['Minimal'],
    timeRequired: 0,
    effectiveness: {
      baseSuccessRate: 0.95,
      effectivenessVsCriticality: {
        stable: 0.98,
        deteriorating: 0.95,
        critical: 0.85,
        terminal: 0.60
      },
      healthImpact: 8,
      deteriorationReduction: 0.15,
      requiresConditions: ['hypoxia', 'respiratory_distress'],
      contraindictedConditions: []
    }
  },
  {
    id: 'pain_management',
    name: 'Pain Management',
    category: 'treatment',
    cost: 0.08,
    riskLevel: 'medium',
    informationGain: 5,
    description: 'Analgesic medication for pain relief',
    expectedOutcome: 'Reduce patient discomfort',
    risks: ['Respiratory depression', 'Addiction potential', 'Masks symptoms'],
    timeRequired: 0
  },
  {
    id: 'surgery_emergency',
    name: 'Emergency Surgery',
    category: 'treatment',
    cost: 1.50,
    riskLevel: 'high',
    informationGain: 40,
    description: 'Urgent surgical intervention',
    expectedOutcome: 'Correct life-threatening anatomical problem',
    risks: ['Anesthesia complications', 'Bleeding', 'Infection', 'Very high cost'],
    contraindications: ['Unstable patient without resuscitation'],
    timeRequired: 60,
    effectiveness: {
      baseSuccessRate: 0.70,
      effectivenessVsCriticality: {
        stable: 0.85,
        deteriorating: 0.70,
        critical: 0.55,
        terminal: 0.25
      },
      healthImpact: 40,
      deteriorationReduction: 0.8,
      requiresConditions: ['surgical_emergency'],
      contraindictedConditions: ['coagulopathy', 'severe_sepsis']
    }
  }
];

/**
 * Consultations - Expert Opinions
 */
export const CONSULTATIONS: MedicalAction[] = [
  {
    id: 'consult_specialist',
    name: 'Specialist Consultation',
    category: 'consultation',
    cost: 0.25,
    riskLevel: 'low',
    informationGain: 75,
    description: 'Expert opinion from relevant medical specialist',
    expectedOutcome: 'Focused assessment and recommendations',
    risks: ['None'],
    timeRequired: 15
  },
  {
    id: 'consult_nurse_amy',
    name: 'Nurse Amy Consultation',
    category: 'consultation',
    cost: 0.03,
    riskLevel: 'low',
    informationGain: 35,
    description: 'Nursing perspective and clinical insights',
    expectedOutcome: 'Practical bedside observations and hints',
    risks: ['None'],
    timeRequired: 5
  },
  {
    id: 'consult_radiology',
    name: 'Radiology Consultation',
    category: 'consultation',
    cost: 0.15,
    riskLevel: 'low',
    informationGain: 60,
    description: 'Detailed imaging interpretation by radiologist',
    expectedOutcome: 'Expert image analysis and differential diagnosis',
    risks: ['None'],
    timeRequired: 10
  },
  {
    id: 'consult_pathology',
    name: 'Pathology Consultation',
    category: 'consultation',
    cost: 0.20,
    riskLevel: 'low',
    informationGain: 65,
    description: 'Tissue or lab sample expert interpretation',
    expectedOutcome: 'Microscopic analysis and definitive diagnosis',
    risks: ['None'],
    timeRequired: 12
  }
];

/**
 * All medical actions combined
 * DRY: Single export for all actions
 */
export const ALL_MEDICAL_ACTIONS: MedicalAction[] = [
  ...DIAGNOSTIC_TESTS,
  ...TREATMENTS,
  ...CONSULTATIONS
];

/**
 * Helper functions
 */

/**
 * Get action by ID
 */
export function getMedicalAction(actionId: string): MedicalAction | undefined {
  return ALL_MEDICAL_ACTIONS.find(action => action.id === actionId);
}

/**
 * Get actions by category
 */
export function getMedicalActionsByCategory(
  category: 'test' | 'treatment' | 'consultation' | 'imaging'
): MedicalAction[] {
  return ALL_MEDICAL_ACTIONS.filter(action => action.category === category);
}

/**
 * Get affordable actions for current budget
 */
export function getAffordableActions(budget: number): MedicalAction[] {
  return ALL_MEDICAL_ACTIONS.filter(action => action.cost <= budget);
}

/**
 * Calculate total cost for multiple actions
 */
export function calculateTotalCost(actionIds: string[]): number {
  return actionIds.reduce((total, id) => {
    const action = getMedicalAction(id);
    return total + (action?.cost || 0);
  }, 0);
}

/**
 * Get actions sorted by information gain
 */
export function getActionsByInformationGain(): MedicalAction[] {
  return [...ALL_MEDICAL_ACTIONS].sort((a, b) => b.informationGain - a.informationGain);
}

/**
 * Get cost-effective actions (high info gain per MON)
 */
export function getCostEffectiveActions(): MedicalAction[] {
  return [...ALL_MEDICAL_ACTIONS]
    .map(action => ({
      ...action,
      efficiency: action.informationGain / action.cost
    }))
    .sort((a, b) => b.efficiency - a.efficiency);
}
