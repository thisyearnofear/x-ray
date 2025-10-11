/**
 * Achievement Definitions
 * COMPREHENSIVE: Complete set of achievements for medical education gamification
 * EDUCATIONAL: Aligned with medical learning objectives and ethical principles
 * MOTIVATIONAL: Designed to encourage continued learning and skill development
 */

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  type: AchievementType
  rarity: AchievementRarity
  points: number
  icon: string
  badge: string
  unlockConditions: AchievementCondition[]
  prerequisites: string[]
  isHidden: boolean
  isRepeatable: boolean
  maxProgress: number
  rewards: AchievementReward[]
}

export interface AchievementCondition {
  type: 'narrative_choice' | 'skill_level' | 'case_completion' | 'performance_metric' | 'time_spent' | 'streak' | 'social'
  target: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'count'
  value: number | string
  description: string
}

export interface AchievementReward {
  type: 'points' | 'badge' | 'title' | 'unlock' | 'cosmetic'
  value: string | number
  description: string
}

export type AchievementCategory = 
  | 'ethical_decisions' 
  | 'narrative_paths' 
  | 'skill_mastery' 
  | 'case_completion' 
  | 'learning_progress' 
  | 'social_learning' 
  | 'investigation_excellence'
  | 'consultation_mastery'
  | 'diagnostic_accuracy'
  | 'special_events'

export type AchievementType = 
  | 'milestone' 
  | 'progression' 
  | 'mastery' 
  | 'discovery' 
  | 'social' 
  | 'rare' 
  | 'seasonal'

export type AchievementRarity = 
  | 'common' 
  | 'uncommon' 
  | 'rare' 
  | 'epic' 
  | 'legendary'

export class AchievementDefinitions {
  private static achievements: Achievement[] = [
    // Ethical Decision Achievements
    {
      id: 'ethical_autonomy_champion',
      name: 'Autonomy Champion',
      description: 'Consistently respect patient autonomy in difficult decisions',
      category: 'ethical_decisions',
      type: 'mastery',
      rarity: 'rare',
      points: 500,
      icon: '⚖️',
      badge: '🏆',
      unlockConditions: [
        {
          type: 'narrative_choice',
          target: 'autonomy_choices',
          operator: 'greater_than',
          value: 10,
          description: 'Make 10+ autonomy-focused ethical decisions'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 500, description: 'Achievement points' },
        { type: 'title', value: 'Autonomy Champion', description: 'Special title' },
        { type: 'badge', value: 'autonomy_master', description: 'Autonomy mastery badge' }
      ]
    },
    {
      id: 'justice_advocate',
      name: 'Justice Advocate',
      description: 'Demonstrate commitment to fairness and justice in healthcare',
      category: 'ethical_decisions',
      type: 'mastery',
      rarity: 'rare',
      points: 500,
      icon: '⚖️',
      badge: '🏛️',
      unlockConditions: [
        {
          type: 'narrative_choice',
          target: 'justice_choices',
          operator: 'greater_than',
          value: 8,
          description: 'Make 8+ justice-focused ethical decisions'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 500, description: 'Achievement points' },
        { type: 'title', value: 'Justice Advocate', description: 'Special title' }
      ]
    },
    {
      id: 'beneficence_guardian',
      name: 'Beneficence Guardian',
      description: 'Always prioritize patient wellbeing and do no harm',
      category: 'ethical_decisions',
      type: 'mastery',
      rarity: 'epic',
      points: 750,
      icon: '💚',
      badge: '🛡️',
      unlockConditions: [
        {
          type: 'narrative_choice',
          target: 'beneficence_choices',
          operator: 'greater_than',
          value: 12,
          description: 'Make 12+ beneficence-focused ethical decisions'
        },
        {
          type: 'performance_metric',
          target: 'ethical_choice_alignment',
          operator: 'greater_than',
          value: 0.9,
          description: 'Maintain 90%+ ethical alignment'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 750, description: 'Achievement points' },
        { type: 'title', value: 'Beneficence Guardian', description: 'Special title' },
        { type: 'unlock', value: 'advanced_ethics_cases', description: 'Unlock advanced ethics cases' }
      ]
    },

    // Narrative Path Achievements
    {
      id: 'story_explorer',
      name: 'Story Explorer',
      description: 'Complete multiple narrative paths in a single case',
      category: 'narrative_paths',
      type: 'discovery',
      rarity: 'uncommon',
      points: 200,
      icon: '🗺️',
      badge: '🧭',
      unlockConditions: [
        {
          type: 'narrative_choice',
          target: 'unique_paths_explored',
          operator: 'greater_than',
          value: 3,
          description: 'Explore 3+ different narrative paths'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: true,
      maxProgress: 10,
      rewards: [
        { type: 'points', value: 200, description: 'Achievement points' }
      ]
    },
    {
      id: 'master_storyteller',
      name: 'Master Storyteller',
      description: 'Complete all possible narrative paths across multiple cases',
      category: 'narrative_paths',
      type: 'mastery',
      rarity: 'legendary',
      points: 1000,
      icon: '📚',
      badge: '👑',
      unlockConditions: [
        {
          type: 'case_completion',
          target: 'narrative_paths_completed',
          operator: 'greater_than',
          value: 25,
          description: 'Complete 25+ narrative paths'
        }
      ],
      prerequisites: ['story_explorer'],
      isHidden: true,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 1000, description: 'Achievement points' },
        { type: 'title', value: 'Master Storyteller', description: 'Legendary title' },
        { type: 'unlock', value: 'narrative_creator_mode', description: 'Unlock narrative creation tools' }
      ]
    },

    // Skill Mastery Achievements
    {
      id: 'investigation_novice',
      name: 'Investigation Novice',
      description: 'Learn your first investigation technique',
      category: 'skill_mastery',
      type: 'milestone',
      rarity: 'common',
      points: 50,
      icon: '🔍',
      badge: '🎯',
      unlockConditions: [
        {
          type: 'skill_level',
          target: 'any_investigation_skill',
          operator: 'greater_than',
          value: 1,
          description: 'Reach level 2 in any investigation skill'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 50, description: 'Achievement points' }
      ]
    },
    {
      id: 'palpation_master',
      name: 'Palpation Master',
      description: 'Master the art of palpation examination',
      category: 'skill_mastery',
      type: 'mastery',
      rarity: 'rare',
      points: 400,
      icon: '👋',
      badge: '🏅',
      unlockConditions: [
        {
          type: 'skill_level',
          target: 'palpation',
          operator: 'greater_than',
          value: 7,
          description: 'Reach level 8 in palpation'
        }
      ],
      prerequisites: ['investigation_novice'],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 400, description: 'Achievement points' },
        { type: 'unlock', value: 'advanced_palpation_techniques', description: 'Unlock advanced techniques' }
      ]
    },
    {
      id: 'diagnostic_virtuoso',
      name: 'Diagnostic Virtuoso',
      description: 'Achieve mastery in diagnostic reasoning',
      category: 'skill_mastery',
      type: 'mastery',
      rarity: 'epic',
      points: 800,
      icon: '🧠',
      badge: '💎',
      unlockConditions: [
        {
          type: 'skill_level',
          target: 'diagnostic_reasoning',
          operator: 'greater_than',
          value: 9,
          description: 'Reach level 10 in diagnostic reasoning'
        },
        {
          type: 'performance_metric',
          target: 'diagnostic_accuracy',
          operator: 'greater_than',
          value: 0.95,
          description: 'Maintain 95%+ diagnostic accuracy'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 800, description: 'Achievement points' },
        { type: 'title', value: 'Diagnostic Virtuoso', description: 'Master diagnostician title' }
      ]
    },

    // Case Completion Achievements
    {
      id: 'first_case',
      name: 'First Case',
      description: 'Complete your first medical case',
      category: 'case_completion',
      type: 'milestone',
      rarity: 'common',
      points: 100,
      icon: '📋',
      badge: '🎉',
      unlockConditions: [
        {
          type: 'case_completion',
          target: 'cases_completed',
          operator: 'greater_than',
          value: 0,
          description: 'Complete 1 case'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 100, description: 'Achievement points' }
      ]
    },
    {
      id: 'case_marathon',
      name: 'Case Marathon',
      description: 'Complete 50 medical cases',
      category: 'case_completion',
      type: 'progression',
      rarity: 'rare',
      points: 1000,
      icon: '🏃‍♂️',
      badge: '🏆',
      unlockConditions: [
        {
          type: 'case_completion',
          target: 'cases_completed',
          operator: 'greater_than',
          value: 49,
          description: 'Complete 50 cases'
        }
      ],
      prerequisites: ['first_case'],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 1000, description: 'Achievement points' },
        { type: 'title', value: 'Case Marathon Champion', description: 'Endurance title' }
      ]
    },
    {
      id: 'perfect_diagnosis',
      name: 'Perfect Diagnosis',
      description: 'Achieve 100% accuracy on a complex case',
      category: 'diagnostic_accuracy',
      type: 'mastery',
      rarity: 'epic',
      points: 600,
      icon: '🎯',
      badge: '💯',
      unlockConditions: [
        {
          type: 'performance_metric',
          target: 'case_accuracy',
          operator: 'equals',
          value: 1.0,
          description: 'Achieve 100% accuracy on a case'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: true,
      maxProgress: 10,
      rewards: [
        { type: 'points', value: 600, description: 'Achievement points' }
      ]
    },

    // Consultation Mastery Achievements
    {
      id: 'consultation_seeker',
      name: 'Consultation Seeker',
      description: 'Request your first specialist consultation',
      category: 'consultation_mastery',
      type: 'milestone',
      rarity: 'common',
      points: 75,
      icon: '👥',
      badge: '🤝',
      unlockConditions: [
        {
          type: 'narrative_choice',
          target: 'consultations_requested',
          operator: 'greater_than',
          value: 0,
          description: 'Request 1 consultation'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 75, description: 'Achievement points' }
      ]
    },
    {
      id: 'multidisciplinary_expert',
      name: 'Multidisciplinary Expert',
      description: 'Consult with specialists from 5 different fields',
      category: 'consultation_mastery',
      type: 'mastery',
      rarity: 'rare',
      points: 500,
      icon: '🌐',
      badge: '🎓',
      unlockConditions: [
        {
          type: 'narrative_choice',
          target: 'unique_specialties_consulted',
          operator: 'greater_than',
          value: 4,
          description: 'Consult with 5+ different specialties'
        }
      ],
      prerequisites: ['consultation_seeker'],
      isHidden: false,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 500, description: 'Achievement points' },
        { type: 'unlock', value: 'expert_consultation_mode', description: 'Unlock expert consultations' }
      ]
    },

    // Learning Progress Achievements
    {
      id: 'quick_learner',
      name: 'Quick Learner',
      description: 'Complete a case in under 10 minutes with high accuracy',
      category: 'learning_progress',
      type: 'mastery',
      rarity: 'uncommon',
      points: 300,
      icon: '⚡',
      badge: '🚀',
      unlockConditions: [
        {
          type: 'time_spent',
          target: 'case_completion_time',
          operator: 'less_than',
          value: 600, // 10 minutes in seconds
          description: 'Complete case in under 10 minutes'
        },
        {
          type: 'performance_metric',
          target: 'case_accuracy',
          operator: 'greater_than',
          value: 0.8,
          description: 'Maintain 80%+ accuracy'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: true,
      maxProgress: 5,
      rewards: [
        { type: 'points', value: 300, description: 'Achievement points' }
      ]
    },
    {
      id: 'learning_streak',
      name: 'Learning Streak',
      description: 'Practice for 7 consecutive days',
      category: 'learning_progress',
      type: 'progression',
      rarity: 'uncommon',
      points: 400,
      icon: '🔥',
      badge: '📅',
      unlockConditions: [
        {
          type: 'streak',
          target: 'daily_practice_streak',
          operator: 'greater_than',
          value: 6,
          description: 'Practice for 7 consecutive days'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: true,
      maxProgress: 10,
      rewards: [
        { type: 'points', value: 400, description: 'Achievement points' }
      ]
    },

    // Social Learning Achievements
    {
      id: 'helpful_peer',
      name: 'Helpful Peer',
      description: 'Share insights that help other learners',
      category: 'social_learning',
      type: 'social',
      rarity: 'uncommon',
      points: 250,
      icon: '🤲',
      badge: '💝',
      unlockConditions: [
        {
          type: 'social',
          target: 'helpful_interactions',
          operator: 'greater_than',
          value: 5,
          description: 'Help other learners 5+ times'
        }
      ],
      prerequisites: [],
      isHidden: false,
      isRepeatable: true,
      maxProgress: 20,
      rewards: [
        { type: 'points', value: 250, description: 'Achievement points' }
      ]
    },

    // Special Event Achievements
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'One of the first to experience the enhanced medical mystery game',
      category: 'special_events',
      type: 'rare',
      rarity: 'legendary',
      points: 1500,
      icon: '🌟',
      badge: '👑',
      unlockConditions: [
        {
          type: 'case_completion',
          target: 'cases_completed',
          operator: 'greater_than',
          value: 0,
          description: 'Complete any case during early access'
        }
      ],
      prerequisites: [],
      isHidden: true,
      isRepeatable: false,
      maxProgress: 1,
      rewards: [
        { type: 'points', value: 1500, description: 'Achievement points' },
        { type: 'title', value: 'Early Adopter', description: 'Exclusive early access title' },
        { type: 'cosmetic', value: 'golden_stethoscope', description: 'Exclusive cosmetic item' }
      ]
    }
  ]

  public static getAllAchievements(): Achievement[] {
    return [...this.achievements]
  }

  public static getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(achievement => achievement.id === id)
  }

  public static getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.achievements.filter(achievement => achievement.category === category)
  }

  public static getAchievementsByType(type: AchievementType): Achievement[] {
    return this.achievements.filter(achievement => achievement.type === type)
  }

  public static getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
    return this.achievements.filter(achievement => achievement.rarity === rarity)
  }

  public static getVisibleAchievements(): Achievement[] {
    return this.achievements.filter(achievement => !achievement.isHidden)
  }

  public static getRepeatableAchievements(): Achievement[] {
    return this.achievements.filter(achievement => achievement.isRepeatable)
  }

  public static getMilestoneAchievements(): Achievement[] {
    return this.achievements.filter(achievement => achievement.type === 'milestone')
  }

  public static getEthicalAchievements(): Achievement[] {
    return this.achievements.filter(achievement => achievement.category === 'ethical_decisions')
  }

  public static getNarrativeAchievements(): Achievement[] {
    return this.achievements.filter(achievement => achievement.category === 'narrative_paths')
  }

  public static getSkillMasteryAchievements(): Achievement[] {
    return this.achievements.filter(achievement => achievement.category === 'skill_mastery')
  }

  public static getTotalPossiblePoints(): number {
    return this.achievements.reduce((total, achievement) => {
      if (achievement.isRepeatable) {
        return total + (achievement.points * achievement.maxProgress)
      }
      return total + achievement.points
    }, 0)
  }

  public static getAchievementsByPrerequisite(prerequisiteId: string): Achievement[] {
    return this.achievements.filter(achievement => 
      achievement.prerequisites.includes(prerequisiteId)
    )
  }

  public static validateAchievementChain(): boolean {
    // Validate that all prerequisites exist
    for (const achievement of this.achievements) {
      for (const prerequisiteId of achievement.prerequisites) {
        if (!this.getAchievementById(prerequisiteId)) {
          console.error(`Achievement ${achievement.id} has invalid prerequisite: ${prerequisiteId}`)
          return false
        }
      }
    }
    return true
  }
}