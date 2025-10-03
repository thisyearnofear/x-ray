// DRY: Single source of truth for all medical knowledge
export interface MedicalCondition {
  id: string
  name: string
  description: string
  symptoms: string[]
  treatment: string[]
  severity: 'low' | 'medium' | 'high'
  position: { x: number; y: number; z: number }
  requiredModel: 'head' | 'torso' | 'fullbody'
  visibleIn: string[]
}

// CLEAN: Consolidated medical conditions for all models
export const MEDICAL_CONDITIONS: MedicalCondition[] = [
  {
    id: 'temporomandibular_disorder',
    name: 'Temporomandibular Joint Disorder',
    description: 'TMJ disorder affecting jaw movement and causing pain',
    position: { x: 0.15, y: 0.8, z: 0.1 },
    severity: 'medium',
    symptoms: ['Jaw pain', 'Clicking sounds', 'Limited jaw movement', 'Headaches'],
    treatment: ['Physical therapy', 'Pain management', 'Bite guards', 'Stress reduction'],
    requiredModel: 'head',
    visibleIn: ['head', 'jaw', 'neck']
  },
  {
    id: 'cervical_strain',
    name: 'Cervical Muscle Strain',
    description: 'Strain of neck muscles causing pain and stiffness',
    position: { x: 0, y: 0.6, z: -0.1 },
    severity: 'low',
    symptoms: ['Neck pain', 'Stiffness', 'Muscle spasms', 'Reduced range of motion'],
    treatment: ['Rest', 'Ice/heat therapy', 'Gentle stretching', 'Pain relievers'],
    requiredModel: 'head',
    visibleIn: ['head', 'neck', 'cervical']
  },
  {
    id: 'thoracic_strain',
    name: 'Thoracic Muscle Strain',
    description: 'Upper back muscle strain from poor posture or overuse',
    position: { x: 0, y: 0.2, z: -0.15 },
    severity: 'medium',
    symptoms: ['Upper back pain', 'Muscle tension', 'Pain with movement', 'Stiffness'],
    treatment: ['Physical therapy', 'Posture correction', 'Strengthening exercises', 'Pain management'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'back', 'spine']
  },
  {
    id: 'lumbar_strain',
    name: 'Lumbar Muscle Strain',
    description: 'Lower back muscle strain from lifting or sudden movement',
    position: { x: 0, y: -0.2, z: -0.1 },
    severity: 'high',
    symptoms: ['Lower back pain', 'Muscle spasms', 'Pain with bending', 'Stiffness'],
    treatment: ['Rest', 'Physical therapy', 'Core strengthening', 'Ergonomic adjustments'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'back', 'lumbar', 'spine']
  }
]

// PERFORMANT: Model-specific condition filtering
export const getConditionsForModel = (model: string): MedicalCondition[] => {
  return MEDICAL_CONDITIONS.filter(condition => 
    condition.requiredModel === model || 
    condition.visibleIn.includes(model)
  )
}
