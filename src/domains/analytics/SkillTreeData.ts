/**
 * Skill Tree Data Structure
 * HIERARCHICAL: Organized medical competencies with prerequisites and progression paths
 * EDUCATIONAL: Aligned with medical education standards and clinical practice
 * GAMIFIED: Engaging progression system with unlocks and achievements
 */

export interface SkillNode {
  id: string
  name: string
  description: string
  category: string
  level: number
  maxLevel: number
  experience: number
  experienceToNext: number
  masteryPercentage: number
  isUnlocked: boolean
  isCompleted: boolean
  prerequisites: string[]
  unlockConditions: UnlockCondition[]
  position: { x: number; y: number }
  icon: string
  color: string
  specialty?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  estimatedPracticeTime: number // minutes
  realWorldApplication: string
  relatedCases: string[]
}

export interface UnlockCondition {
  type: 'skill_level' | 'performance_metric' | 'case_completion' | 'time_spent'
  target: string
  value: number
  description: string
}

export interface SkillCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  position: { x: number; y: number }
  skills: string[]
}

export interface SkillConnection {
  from: string
  to: string
  type: 'prerequisite' | 'progression' | 'related'
  strength: number // 0-1, how strong the connection is
}

export interface SkillTreeConfig {
  width: number
  height: number
  nodeRadius: number
  connectionWidth: number
  animationDuration: number
  zoomLimits: { min: number; max: number }
  enableAnimations: boolean
  showTooltips: boolean
}

export class SkillTreeData {
  private skills: Map<string, SkillNode> = new Map()
  private categories: Map<string, SkillCategory> = new Map()
  private connections: SkillConnection[] = []

  constructor() {
    this.initializeSkillTree()
    console.log('🌳 Skill Tree Data initialized')
  }

  private initializeSkillTree(): void {
    // Initialize categories
    this.initializeCategories()
    
    // Initialize core skills
    this.initializeCoreSkills()
    
    // Initialize investigation skills
    this.initializeInvestigationSkills()
    
    // Initialize specialty skills
    this.initializeSpecialtySkills()
    
    // Initialize advanced skills
    this.initializeAdvancedSkills()
    
    // Initialize connections
    this.initializeConnections()
  }

  private initializeCategories(): void {
    const categories: SkillCategory[] = [
      {
        id: 'core',
        name: 'Core Medical Skills',
        description: 'Fundamental skills every medical professional needs',
        color: '#00ff88',
        icon: '🏥',
        position: { x: 400, y: 100 },
        skills: []
      },
      {
        id: 'investigation',
        name: 'Investigation Techniques',
        description: 'Physical examination and diagnostic techniques',
        color: '#00d4ff',
        icon: '🔬',
        position: { x: 200, y: 300 },
        skills: []
      },
      {
        id: 'imaging',
        name: 'Medical Imaging',
        description: 'Interpretation of medical imaging studies',
        color: '#ffaa00',
        icon: '📡',
        position: { x: 600, y: 300 },
        skills: []
      },
      {
        id: 'consultation',
        name: 'Consultation Skills',
        description: 'Communication and collaboration with specialists',
        color: '#ff6b6b',
        icon: '👥',
        position: { x: 400, y: 500 },
        skills: []
      },
      {
        id: 'specialty',
        name: 'Specialty Knowledge',
        description: 'Advanced knowledge in medical specialties',
        color: '#a855f7',
        icon: '🎓',
        position: { x: 200, y: 700 },
        skills: []
      },
      {
        id: 'advanced',
        name: 'Advanced Practice',
        description: 'Expert-level skills and complex case management',
        color: '#f59e0b',
        icon: '⭐',
        position: { x: 600, y: 700 },
        skills: []
      }
    ]

    categories.forEach(category => {
      this.categories.set(category.id, category)
    })
  }

  private initializeCoreSkills(): void {
    const coreSkills: Omit<SkillNode, 'level' | 'experience' | 'experienceToNext' | 'masteryPercentage' | 'isUnlocked' | 'isCompleted'>[] = [
      {
        id: 'diagnostic_reasoning',
        name: 'Diagnostic Reasoning',
        description: 'Systematic approach to medical diagnosis using clinical reasoning',
        category: 'core',
        maxLevel: 10,
        prerequisites: [],
        unlockConditions: [],
        position: { x: 350, y: 150 },
        icon: '🧠',
        color: '#00ff88',
        difficulty: 'beginner',
        estimatedPracticeTime: 60,
        realWorldApplication: 'Essential for accurate patient diagnosis in all medical settings',
        relatedCases: ['general_diagnosis', 'differential_diagnosis']
      },
      {
        id: 'clinical_communication',
        name: 'Clinical Communication',
        description: 'Effective communication with patients, families, and healthcare teams',
        category: 'core',
        maxLevel: 10,
        prerequisites: [],
        unlockConditions: [],
        position: { x: 450, y: 150 },
        icon: '💬',
        color: '#00ff88',
        difficulty: 'beginner',
        estimatedPracticeTime: 45,
        realWorldApplication: 'Critical for patient care, informed consent, and team collaboration',
        relatedCases: ['patient_consultation', 'family_discussion']
      },
      {
        id: 'ethical_reasoning',
        name: 'Ethical Decision Making',
        description: 'Application of medical ethics principles in clinical practice',
        category: 'core',
        maxLevel: 10,
        prerequisites: [],
        unlockConditions: [],
        position: { x: 400, y: 200 },
        icon: '⚖️',
        color: '#00ff88',
        difficulty: 'intermediate',
        estimatedPracticeTime: 90,
        realWorldApplication: 'Essential for navigating complex ethical dilemmas in patient care',
        relatedCases: ['end_of_life', 'informed_consent', 'resource_allocation']
      }
    ]

    coreSkills.forEach(skill => {
      this.addSkill({
        ...skill,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        masteryPercentage: 0,
        isUnlocked: true, // Core skills start unlocked
        isCompleted: false
      })
    })
  }

  private initializeInvestigationSkills(): void {
    const investigationSkills: Omit<SkillNode, 'level' | 'experience' | 'experienceToNext' | 'masteryPercentage' | 'isUnlocked' | 'isCompleted'>[] = [
      {
        id: 'palpation',
        name: 'Palpation Technique',
        description: 'Physical examination using touch to assess organs and tissues',
        category: 'investigation',
        maxLevel: 8,
        prerequisites: ['diagnostic_reasoning'],
        unlockConditions: [
          { type: 'skill_level', target: 'diagnostic_reasoning', value: 2, description: 'Reach level 2 in Diagnostic Reasoning' }
        ],
        position: { x: 150, y: 250 },
        icon: '👋',
        color: '#00d4ff',
        difficulty: 'beginner',
        estimatedPracticeTime: 30,
        realWorldApplication: 'Used in physical examinations to detect abnormalities',
        relatedCases: ['abdominal_pain', 'joint_examination']
      },
      {
        id: 'auscultation',
        name: 'Auscultation Skills',
        description: 'Listening to internal body sounds using a stethoscope',
        category: 'investigation',
        maxLevel: 8,
        prerequisites: ['diagnostic_reasoning'],
        unlockConditions: [
          { type: 'skill_level', target: 'diagnostic_reasoning', value: 2, description: 'Reach level 2 in Diagnostic Reasoning' }
        ],
        position: { x: 250, y: 250 },
        icon: '🩺',
        color: '#00d4ff',
        difficulty: 'beginner',
        estimatedPracticeTime: 45,
        realWorldApplication: 'Essential for cardiac, pulmonary, and abdominal examinations',
        relatedCases: ['heart_murmur', 'lung_sounds', 'bowel_sounds']
      },
      {
        id: 'percussion',
        name: 'Percussion Examination',
        description: 'Tapping technique to assess underlying structures',
        category: 'investigation',
        maxLevel: 6,
        prerequisites: ['palpation'],
        unlockConditions: [
          { type: 'skill_level', target: 'palpation', value: 3, description: 'Reach level 3 in Palpation' }
        ],
        position: { x: 150, y: 350 },
        icon: '🥁',
        color: '#00d4ff',
        difficulty: 'intermediate',
        estimatedPracticeTime: 40,
        realWorldApplication: 'Used to assess organ size and detect fluid or air',
        relatedCases: ['liver_enlargement', 'pneumothorax']
      },
      {
        id: 'inspection',
        name: 'Visual Inspection',
        description: 'Systematic visual examination of patients',
        category: 'investigation',
        maxLevel: 6,
        prerequisites: ['diagnostic_reasoning'],
        unlockConditions: [
          { type: 'skill_level', target: 'diagnostic_reasoning', value: 1, description: 'Basic diagnostic reasoning required' }
        ],
        position: { x: 200, y: 350 },
        icon: '👁️',
        color: '#00d4ff',
        difficulty: 'beginner',
        estimatedPracticeTime: 25,
        realWorldApplication: 'First step in most physical examinations',
        relatedCases: ['skin_lesions', 'general_appearance']
      },
      {
        id: 'reflex_testing',
        name: 'Reflex Testing',
        description: 'Neurological examination of reflexes',
        category: 'investigation',
        maxLevel: 7,
        prerequisites: ['percussion', 'inspection'],
        unlockConditions: [
          { type: 'skill_level', target: 'percussion', value: 2, description: 'Reach level 2 in Percussion' },
          { type: 'skill_level', target: 'inspection', value: 2, description: 'Reach level 2 in Visual Inspection' }
        ],
        position: { x: 250, y: 400 },
        icon: '🔨',
        color: '#00d4ff',
        specialty: 'neurology',
        difficulty: 'intermediate',
        estimatedPracticeTime: 35,
        realWorldApplication: 'Critical for neurological assessment',
        relatedCases: ['neurological_exam', 'spinal_injury']
      }
    ]

    investigationSkills.forEach(skill => {
      this.addSkill({
        ...skill,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        masteryPercentage: 0,
        isUnlocked: skill.prerequisites.length === 0,
        isCompleted: false
      })
    })
  }

  private initializeSpecialtySkills(): void {
    const specialtySkills: Omit<SkillNode, 'level' | 'experience' | 'experienceToNext' | 'masteryPercentage' | 'isUnlocked' | 'isCompleted'>[] = [
      {
        id: 'cardiology_basics',
        name: 'Cardiology Fundamentals',
        description: 'Basic knowledge of cardiovascular system and common conditions',
        category: 'specialty',
        maxLevel: 10,
        prerequisites: ['auscultation', 'clinical_communication'],
        unlockConditions: [
          { type: 'skill_level', target: 'auscultation', value: 4, description: 'Master auscultation skills' },
          { type: 'performance_metric', target: 'diagnostic_accuracy', value: 0.7, description: 'Achieve 70% diagnostic accuracy' }
        ],
        position: { x: 100, y: 650 },
        icon: '❤️',
        color: '#a855f7',
        specialty: 'cardiology',
        difficulty: 'intermediate',
        estimatedPracticeTime: 120,
        realWorldApplication: 'Essential for managing cardiovascular patients',
        relatedCases: ['heart_failure', 'myocardial_infarction', 'arrhythmia']
      },
      {
        id: 'neurology_basics',
        name: 'Neurology Fundamentals',
        description: 'Basic knowledge of nervous system and neurological conditions',
        category: 'specialty',
        maxLevel: 10,
        prerequisites: ['reflex_testing', 'inspection'],
        unlockConditions: [
          { type: 'skill_level', target: 'reflex_testing', value: 3, description: 'Develop reflex testing skills' },
          { type: 'case_completion', target: 'neurological_cases', value: 3, description: 'Complete 3 neurological cases' }
        ],
        position: { x: 200, y: 650 },
        icon: '🧠',
        color: '#a855f7',
        specialty: 'neurology',
        difficulty: 'intermediate',
        estimatedPracticeTime: 150,
        realWorldApplication: 'Critical for neurological patient assessment',
        relatedCases: ['stroke', 'seizure', 'headache']
      },
      {
        id: 'orthopedics_basics',
        name: 'Orthopedics Fundamentals',
        description: 'Basic knowledge of musculoskeletal system and injuries',
        category: 'specialty',
        maxLevel: 8,
        prerequisites: ['palpation', 'inspection'],
        unlockConditions: [
          { type: 'skill_level', target: 'palpation', value: 4, description: 'Advanced palpation skills required' },
          { type: 'time_spent', target: 'investigation_practice', value: 3600, description: 'Spend 1 hour practicing investigation' }
        ],
        position: { x: 300, y: 650 },
        icon: '🦴',
        color: '#a855f7',
        specialty: 'orthopedics',
        difficulty: 'intermediate',
        estimatedPracticeTime: 90,
        realWorldApplication: 'Essential for musculoskeletal injury assessment',
        relatedCases: ['fracture', 'joint_pain', 'sports_injury']
      }
    ]

    specialtySkills.forEach(skill => {
      this.addSkill({
        ...skill,
        level: 1,
        experience: 0,
        experienceToNext: 150, // Specialty skills require more experience
        masteryPercentage: 0,
        isUnlocked: false,
        isCompleted: false
      })
    })
  }

  private initializeAdvancedSkills(): void {
    const advancedSkills: Omit<SkillNode, 'level' | 'experience' | 'experienceToNext' | 'masteryPercentage' | 'isUnlocked' | 'isCompleted'>[] = [
      {
        id: 'complex_diagnosis',
        name: 'Complex Case Management',
        description: 'Managing complex, multi-system medical cases',
        category: 'advanced',
        maxLevel: 12,
        prerequisites: ['cardiology_basics', 'neurology_basics', 'ethical_reasoning'],
        unlockConditions: [
          { type: 'skill_level', target: 'cardiology_basics', value: 5, description: 'Advanced cardiology knowledge' },
          { type: 'skill_level', target: 'neurology_basics', value: 5, description: 'Advanced neurology knowledge' },
          { type: 'performance_metric', target: 'diagnostic_accuracy', value: 0.85, description: 'Achieve 85% diagnostic accuracy' }
        ],
        position: { x: 550, y: 650 },
        icon: '🎯',
        color: '#f59e0b',
        difficulty: 'expert',
        estimatedPracticeTime: 240,
        realWorldApplication: 'Required for managing the most challenging cases',
        relatedCases: ['multi_organ_failure', 'rare_disease', 'complex_trauma']
      },
      {
        id: 'teaching_skills',
        name: 'Medical Teaching',
        description: 'Teaching and mentoring other medical professionals',
        category: 'advanced',
        maxLevel: 10,
        prerequisites: ['clinical_communication', 'complex_diagnosis'],
        unlockConditions: [
          { type: 'skill_level', target: 'clinical_communication', value: 7, description: 'Master communication skills' },
          { type: 'skill_level', target: 'complex_diagnosis', value: 3, description: 'Demonstrate complex case skills' },
          { type: 'case_completion', target: 'total_cases', value: 50, description: 'Complete 50 total cases' }
        ],
        position: { x: 650, y: 650 },
        icon: '👨‍🏫',
        color: '#f59e0b',
        difficulty: 'expert',
        estimatedPracticeTime: 180,
        realWorldApplication: 'Essential for senior medical professionals and educators',
        relatedCases: ['teaching_rounds', 'case_presentation', 'mentorship']
      },
      {
        id: 'research_skills',
        name: 'Medical Research',
        description: 'Conducting and interpreting medical research',
        category: 'advanced',
        maxLevel: 8,
        prerequisites: ['ethical_reasoning', 'complex_diagnosis'],
        unlockConditions: [
          { type: 'skill_level', target: 'ethical_reasoning', value: 6, description: 'Advanced ethical reasoning' },
          { type: 'skill_level', target: 'complex_diagnosis', value: 4, description: 'Complex case expertise' },
          { type: 'performance_metric', target: 'consultation_usage', value: 0.8, description: 'Effective consultation usage' }
        ],
        position: { x: 600, y: 750 },
        icon: '🔬',
        color: '#f59e0b',
        difficulty: 'expert',
        estimatedPracticeTime: 300,
        realWorldApplication: 'Critical for advancing medical knowledge and evidence-based practice',
        relatedCases: ['clinical_trial', 'case_study', 'systematic_review']
      }
    ]

    advancedSkills.forEach(skill => {
      this.addSkill({
        ...skill,
        level: 1,
        experience: 0,
        experienceToNext: 200, // Advanced skills require even more experience
        masteryPercentage: 0,
        isUnlocked: false,
        isCompleted: false
      })
    })
  }

  private initializeConnections(): void {
    const connections: SkillConnection[] = [
      // Core to Investigation
      { from: 'diagnostic_reasoning', to: 'palpation', type: 'prerequisite', strength: 1.0 },
      { from: 'diagnostic_reasoning', to: 'auscultation', type: 'prerequisite', strength: 1.0 },
      { from: 'diagnostic_reasoning', to: 'inspection', type: 'prerequisite', strength: 0.8 },
      
      // Investigation progressions
      { from: 'palpation', to: 'percussion', type: 'progression', strength: 0.9 },
      { from: 'percussion', to: 'reflex_testing', type: 'prerequisite', strength: 0.7 },
      { from: 'inspection', to: 'reflex_testing', type: 'prerequisite', strength: 0.7 },
      
      // Investigation to Specialty
      { from: 'auscultation', to: 'cardiology_basics', type: 'prerequisite', strength: 1.0 },
      { from: 'reflex_testing', to: 'neurology_basics', type: 'prerequisite', strength: 1.0 },
      { from: 'palpation', to: 'orthopedics_basics', type: 'prerequisite', strength: 0.9 },
      
      // Core to Specialty
      { from: 'clinical_communication', to: 'cardiology_basics', type: 'prerequisite', strength: 0.6 },
      { from: 'ethical_reasoning', to: 'complex_diagnosis', type: 'prerequisite', strength: 0.8 },
      
      // Specialty to Advanced
      { from: 'cardiology_basics', to: 'complex_diagnosis', type: 'prerequisite', strength: 0.9 },
      { from: 'neurology_basics', to: 'complex_diagnosis', type: 'prerequisite', strength: 0.9 },
      { from: 'clinical_communication', to: 'teaching_skills', type: 'prerequisite', strength: 1.0 },
      { from: 'complex_diagnosis', to: 'teaching_skills', type: 'prerequisite', strength: 0.8 },
      { from: 'ethical_reasoning', to: 'research_skills', type: 'prerequisite', strength: 0.9 },
      { from: 'complex_diagnosis', to: 'research_skills', type: 'prerequisite', strength: 0.7 },
      
      // Related skills
      { from: 'palpation', to: 'auscultation', type: 'related', strength: 0.6 },
      { from: 'cardiology_basics', to: 'neurology_basics', type: 'related', strength: 0.4 },
      { from: 'teaching_skills', to: 'research_skills', type: 'related', strength: 0.5 }
    ]

    this.connections = connections
  }

  private addSkill(skill: SkillNode): void {
    this.skills.set(skill.id, skill)
    
    // Add skill to category
    const category = this.categories.get(skill.category)
    if (category) {
      category.skills.push(skill.id)
    }
  }

  /**
   * Public API methods
   */
  public getSkill(skillId: string): SkillNode | undefined {
    return this.skills.get(skillId)
  }

  public getAllSkills(): SkillNode[] {
    return Array.from(this.skills.values())
  }

  public getSkillsByCategory(categoryId: string): SkillNode[] {
    return Array.from(this.skills.values()).filter(skill => skill.category === categoryId)
  }

  public getCategories(): SkillCategory[] {
    return Array.from(this.categories.values())
  }

  public getConnections(): SkillConnection[] {
    return this.connections
  }

  public getPrerequisites(skillId: string): SkillNode[] {
    const skill = this.skills.get(skillId)
    if (!skill) return []
    
    return skill.prerequisites
      .map(prereqId => this.skills.get(prereqId))
      .filter(prereq => prereq !== undefined) as SkillNode[]
  }

  public getDependents(skillId: string): SkillNode[] {
    return Array.from(this.skills.values()).filter(skill => 
      skill.prerequisites.includes(skillId)
    )
  }

  public updateSkillProgress(skillId: string, experience: number): boolean {
    const skill = this.skills.get(skillId)
    if (!skill) return false

    skill.experience += experience
    
    // Check for level up
    while (skill.experience >= skill.experienceToNext && skill.level < skill.maxLevel) {
      skill.level += 1
      skill.experience -= skill.experienceToNext
      skill.experienceToNext = skill.level * 100 // Increasing XP requirement
      
      // Check if skill is completed
      if (skill.level >= skill.maxLevel) {
        skill.isCompleted = true
      }
    }

    // Update mastery percentage
    skill.masteryPercentage = ((skill.level - 1) / (skill.maxLevel - 1)) * 100

    // Check if new skills should be unlocked
    this.checkSkillUnlocks()

    return true
  }

  public checkSkillUnlocks(): string[] {
    const newlyUnlocked: string[] = []

    this.skills.forEach(skill => {
      if (!skill.isUnlocked && this.canUnlockSkill(skill.id)) {
        skill.isUnlocked = true
        newlyUnlocked.push(skill.id)
      }
    })

    return newlyUnlocked
  }

  public canUnlockSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId)
    if (!skill) return false

    // Check prerequisites
    const prerequisitesMet = skill.prerequisites.every(prereqId => {
      const prereq = this.skills.get(prereqId)
      return prereq && prereq.isUnlocked && prereq.level >= 2 // Minimum level requirement
    })

    if (!prerequisitesMet) return false

    // Check unlock conditions (would need performance data)
    // For now, just check prerequisites
    return true
  }

  public getSkillPath(fromSkillId: string, toSkillId: string): string[] {
    // Simple path finding - could be enhanced with proper graph algorithms
    const visited = new Set<string>()
    const path: string[] = []

    const findPath = (currentId: string, targetId: string): boolean => {
      if (currentId === targetId) {
        path.push(currentId)
        return true
      }

      if (visited.has(currentId)) return false
      visited.add(currentId)

      const dependents = this.getDependents(currentId)
      for (const dependent of dependents) {
        if (findPath(dependent.id, targetId)) {
          path.unshift(currentId)
          return true
        }
      }

      return false
    }

    findPath(fromSkillId, toSkillId)
    return path
  }

  public exportSkillData(): any {
    return {
      skills: Array.from(this.skills.values()),
      categories: Array.from(this.categories.values()),
      connections: this.connections,
      exportTimestamp: Date.now()
    }
  }
}