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
  scanTimeRequired?: number
}

// ENHANCED: Expanded medical conditions database to showcase AI inference capabilities
export const MEDICAL_CONDITIONS: MedicalCondition[] = [
  // HEAD/NEUROLOGICAL CONDITIONS - Showcase Llama's medical knowledge
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
    id: 'migraine_headache',
    name: 'Migraine Headache',
    description: 'Severe recurring headache with neurological symptoms',
    position: { x: -0.1, y: 0.9, z: 0.05 },
    severity: 'high',
    symptoms: ['Severe headache', 'Nausea', 'Light sensitivity', 'Visual aura'],
    treatment: ['Triptans', 'Preventive medications', 'Lifestyle modifications', 'Trigger avoidance'],
    requiredModel: 'head',
    visibleIn: ['head', 'brain', 'neurological']
  },
  {
    id: 'sinusitis',
    name: 'Acute Sinusitis',
    description: 'Inflammation of the paranasal sinuses',
    position: { x: 0.08, y: 0.85, z: 0.12 },
    severity: 'medium',
    symptoms: ['Facial pressure', 'Nasal congestion', 'Thick discharge', 'Reduced smell'],
    treatment: ['Antibiotics', 'Decongestants', 'Nasal irrigation', 'Steam therapy'],
    requiredModel: 'head',
    visibleIn: ['head', 'sinus', 'respiratory']
  },
  {
    id: 'concussion',
    name: 'Mild Traumatic Brain Injury',
    description: 'Brain injury caused by impact or sudden movement',
    position: { x: 0, y: 0.95, z: 0 },
    severity: 'high',
    symptoms: ['Headache', 'Confusion', 'Dizziness', 'Memory problems', 'Nausea'],
    treatment: ['Rest', 'Gradual return to activity', 'Symptom monitoring', 'Neurological follow-up'],
    requiredModel: 'head',
    visibleIn: ['head', 'brain', 'neurological', 'trauma']
  },
  {
    id: 'trigeminal_neuralgia',
    name: 'Trigeminal Neuralgia',
    description: 'Severe facial pain along trigeminal nerve distribution',
    position: { x: 0.12, y: 0.75, z: 0.08 },
    severity: 'high',
    symptoms: ['Sharp facial pain', 'Triggered by light touch', 'Unilateral pain', 'Brief episodes'],
    treatment: ['Anticonvulsants', 'Baclofen', 'Nerve blocks', 'Surgical options'],
    requiredModel: 'head',
    visibleIn: ['head', 'face', 'neurological', 'nerve']
  },
  
  // CARDIOVASCULAR CONDITIONS - Complex diagnostic scenarios
  {
    id: 'myocardial_infarction',
    name: 'Acute Myocardial Infarction',
    description: 'Heart attack due to blocked coronary artery',
    position: { x: -0.05, y: 0.05, z: 0.1 },
    severity: 'high',
    symptoms: ['Chest pain', 'Shortness of breath', 'Nausea', 'Sweating', 'Left arm pain'],
    treatment: ['Emergency PCI', 'Thrombolytics', 'Antiplatelet therapy', 'Beta blockers'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'heart', 'cardiovascular', 'emergency'],
    scanTimeRequired: 45
  },
  {
    id: 'pericarditis',
    name: 'Acute Pericarditis',
    description: 'Inflammation of the pericardial sac around the heart',
    position: { x: -0.03, y: 0.08, z: 0.12 },
    severity: 'medium',
    symptoms: ['Sharp chest pain', 'Pain worse when lying down', 'Pericardial friction rub', 'Fever'],
    treatment: ['NSAIDs', 'Colchicine', 'Corticosteroids', 'Activity restriction'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'heart', 'cardiovascular', 'inflammatory']
  },
  {
    id: 'aortic_dissection',
    name: 'Aortic Dissection',
    description: 'Tear in the inner layer of the aorta',
    position: { x: 0, y: 0.1, z: -0.05 },
    severity: 'high',
    symptoms: ['Tearing chest pain', 'Back pain', 'Pulse differences', 'Neurological deficits'],
    treatment: ['Emergency surgery', 'Blood pressure control', 'Pain management', 'Imaging monitoring'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'aorta', 'cardiovascular', 'emergency', 'vascular']
  },
  
  // RESPIRATORY CONDITIONS - Showcase AI diagnostic reasoning
  {
    id: 'pneumonia',
    name: 'Community-Acquired Pneumonia',
    description: 'Infection of the lung parenchyma',
    position: { x: -0.15, y: 0.02, z: 0.08 },
    severity: 'high',
    symptoms: ['Productive cough', 'Fever', 'Shortness of breath', 'Chest pain', 'Fatigue'],
    treatment: ['Antibiotics', 'Supportive care', 'Oxygen therapy', 'Hydration'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'lungs', 'respiratory', 'infectious']
  },
  {
    id: 'pneumothorax',
    name: 'Spontaneous Pneumothorax',
    description: 'Collapsed lung due to air in pleural space',
    position: { x: 0.18, y: 0.05, z: 0.1 },
    severity: 'high',
    symptoms: ['Sudden chest pain', 'Shortness of breath', 'Reduced breath sounds', 'Chest tightness'],
    treatment: ['Chest tube insertion', 'Needle decompression', 'Observation', 'Pleurodesis'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'lungs', 'respiratory', 'emergency', 'pleural']
  },
  {
    id: 'pulmonary_embolism',
    name: 'Pulmonary Embolism',
    description: 'Blood clot blocking pulmonary arteries',
    position: { x: 0.1, y: 0.08, z: 0.05 },
    severity: 'high',
    symptoms: ['Sudden shortness of breath', 'Chest pain', 'Hemoptysis', 'Tachycardia', 'Anxiety'],
    treatment: ['Anticoagulation', 'Thrombolytics', 'Embolectomy', 'IVC filter'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'lungs', 'cardiovascular', 'emergency', 'vascular']
  },
  {
    id: 'asthma_exacerbation',
    name: 'Acute Asthma Exacerbation',
    description: 'Severe worsening of asthma symptoms',
    position: { x: 0, y: 0, z: 0.15 },
    severity: 'medium',
    symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Cough', 'Peak flow reduction'],
    treatment: ['Bronchodilators', 'Corticosteroids', 'Oxygen therapy', 'Magnesium sulfate'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'lungs', 'respiratory', 'inflammatory']
  },
  
  // MUSCULOSKELETAL CONDITIONS - Complex diagnostic scenarios
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
  },
  {
    id: 'rotator_cuff_tear',
    name: 'Rotator Cuff Tear',
    description: 'Tear in the muscles and tendons that stabilize the shoulder',
    position: { x: 0.25, y: 0.1, z: 0.05 },
    severity: 'high',
    symptoms: ['Shoulder pain', 'Weakness', 'Limited range of motion', 'Night pain'],
    treatment: ['Physical therapy', 'Anti-inflammatory drugs', 'Steroid injections', 'Surgery'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'shoulder', 'arm']
  },
  {
    id: 'carpal_tunnel',
    name: 'Carpal Tunnel Syndrome',
    description: 'Compression of the median nerve in the wrist',
    position: { x: 0.35, y: -0.1, z: 0.1 },
    severity: 'medium',
    symptoms: ['Hand numbness', 'Tingling', 'Weakness', 'Night symptoms'],
    treatment: ['Wrist splints', 'Ergonomic modifications', 'Steroid injections', 'Surgery'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'wrist', 'hand', 'nerve']
  },
  {
    id: 'herniated_disc',
    name: 'Herniated Lumbar Disc',
    description: 'Displacement of disc material causing nerve compression',
    position: { x: 0.05, y: -0.15, z: -0.08 },
    severity: 'high',
    symptoms: ['Radiating leg pain', 'Numbness', 'Weakness', 'Back pain'],
    treatment: ['Conservative management', 'Epidural injections', 'Physical therapy', 'Surgery'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'spine', 'nerve', 'disc']
  },
  {
    id: 'osteoarthritis_knee',
    name: 'Knee Osteoarthritis',
    description: 'Degenerative joint disease affecting the knee',
    position: { x: 0.15, y: -0.4, z: 0.05 },
    severity: 'medium',
    symptoms: ['Knee pain', 'Stiffness', 'Swelling', 'Reduced mobility', 'Crepitus'],
    treatment: ['Weight management', 'Physical therapy', 'NSAIDs', 'Intra-articular injections'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'knee', 'joint', 'degenerative']
  },
  {
    id: 'achilles_tendinopathy',
    name: 'Achilles Tendinopathy',
    description: 'Overuse injury of the Achilles tendon',
    position: { x: 0.08, y: -0.6, z: -0.05 },
    severity: 'medium',
    symptoms: ['Heel pain', 'Morning stiffness', 'Tendon thickening', 'Pain with activity'],
    treatment: ['Eccentric exercises', 'Load management', 'Physiotherapy', 'Shockwave therapy'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'ankle', 'tendon', 'overuse']
  },
  
  // GASTROINTESTINAL CONDITIONS - Advanced diagnostic scenarios
  {
    id: 'appendicitis',
    name: 'Acute Appendicitis',
    description: 'Inflammation of the vermiform appendix',
    position: { x: 0.12, y: -0.1, z: 0.08 },
    severity: 'high',
    symptoms: ['Right lower quadrant pain', 'Nausea', 'Vomiting', 'Fever', 'Rebound tenderness'],
    treatment: ['Appendectomy', 'Antibiotics', 'IV fluids', 'Pain management'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'abdomen', 'gastrointestinal', 'emergency']
  },
  {
    id: 'cholecystitis',
    name: 'Acute Cholecystitis',
    description: 'Inflammation of the gallbladder',
    position: { x: 0.08, y: 0.02, z: 0.12 },
    severity: 'high',
    symptoms: ['Right upper quadrant pain', 'Nausea', 'Vomiting', 'Fever', 'Murphy\'s sign'],
    treatment: ['Cholecystectomy', 'Antibiotics', 'Pain management', 'IV fluids'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'abdomen', 'gallbladder', 'gastrointestinal']
  },
  {
    id: 'peptic_ulcer',
    name: 'Peptic Ulcer Disease',
    description: 'Ulceration of stomach or duodenal lining',
    position: { x: -0.05, y: 0.05, z: 0.15 },
    severity: 'medium',
    symptoms: ['Epigastric pain', 'Heartburn', 'Nausea', 'Early satiety', 'GI bleeding'],
    treatment: ['Proton pump inhibitors', 'H. pylori eradication', 'Lifestyle modifications', 'Endoscopy'],
    requiredModel: 'torso',
    visibleIn: ['torso', 'stomach', 'gastrointestinal', 'ulcer']
  },
  
  // COMPLEX CONDITIONS - Showcase AI diagnostic reasoning
  {
    id: 'fibromyalgia',
    name: 'Fibromyalgia Syndrome',
    description: 'Chronic widespread musculoskeletal pain disorder',
    position: { x: 0, y: 0, z: 0 },
    severity: 'medium',
    symptoms: ['Widespread pain', 'Fatigue', 'Sleep disturbances', 'Cognitive issues'],
    treatment: ['Medications', 'Exercise therapy', 'Stress management', 'Sleep hygiene'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'systemic', 'chronic']
  },
  {
    id: 'multiple_sclerosis',
    name: 'Multiple Sclerosis',
    description: 'Autoimmune demyelinating disease of the central nervous system',
    position: { x: 0, y: 0.3, z: 0 },
    severity: 'high',
    symptoms: ['Fatigue', 'Vision problems', 'Numbness', 'Weakness', 'Coordination issues'],
    treatment: ['Disease-modifying therapies', 'Corticosteroids', 'Symptom management', 'Rehabilitation'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'neurological', 'autoimmune', 'chronic']
  },
  {
    id: 'systemic_lupus',
    name: 'Systemic Lupus Erythematosus',
    description: 'Autoimmune connective tissue disease',
    position: { x: 0, y: 0.1, z: 0 },
    severity: 'high',
    symptoms: ['Joint pain', 'Malar rash', 'Fatigue', 'Kidney involvement', 'Photosensitivity'],
    treatment: ['Immunosuppressants', 'Antimalarials', 'Corticosteroids', 'Biologics'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'autoimmune', 'systemic', 'rheumatologic']
  },
  
  // RARE CONDITIONS - Advanced AI diagnostic challenges
  {
    id: 'marfan_syndrome',
    name: 'Marfan Syndrome',
    description: 'Genetic connective tissue disorder',
    position: { x: 0, y: 0.2, z: 0 },
    severity: 'medium',
    symptoms: ['Tall stature', 'Aortic dilation', 'Lens dislocation', 'Joint hypermobility'],
    treatment: ['Cardiovascular monitoring', 'Activity restrictions', 'Genetic counseling', 'Surgical intervention'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'genetic', 'connective tissue', 'cardiovascular']
  },
  {
    id: 'ehlers_danlos',
    name: 'Ehlers-Danlos Syndrome',
    description: 'Genetic connective tissue disorder affecting collagen',
    position: { x: 0, y: 0, z: 0.1 },
    severity: 'medium',
    symptoms: ['Joint hypermobility', 'Skin hyperextensibility', 'Tissue fragility', 'Easy bruising'],
    treatment: ['Physical therapy', 'Joint protection', 'Pain management', 'Genetic counseling'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'genetic', 'connective tissue', 'hypermobility']
  },
  {
    id: 'guillain_barre',
    name: 'Guillain-Barré Syndrome',
    description: 'Acute inflammatory demyelinating polyneuropathy',
    position: { x: 0, y: -0.1, z: 0 },
    severity: 'high',
    symptoms: ['Progressive weakness', 'Areflexia', 'Sensory symptoms', 'Respiratory compromise'],
    treatment: ['IVIG', 'Plasmapheresis', 'Supportive care', 'Respiratory monitoring'],
    requiredModel: 'fullbody',
    visibleIn: ['fullbody', 'neurological', 'inflammatory', 'emergency']
  }
]

// PERFORMANT: Model-specific condition filtering
export const getConditionsForModel = (model: string): MedicalCondition[] => {
  return MEDICAL_CONDITIONS.filter(condition =>
    condition.requiredModel === model ||
    condition.visibleIn.includes(model)
  )
}
