/**
 * Achievement System
 * GAMIFICATION: Comprehensive achievement tracking and progression system
 * MOTIVATIONAL: Designed to encourage continued learning and engagement
 * EDUCATIONAL: Aligned with medical learning objectives and milestones
 */

import { Achievement, AchievementDefinitions, AchievementCondition, AchievementCategory } from './AchievementDefinitions'
import { AnalyticsDataProcessor } from './AnalyticsDataProcessor'
import { EnhancedGameManager, EnhancedGameState } from '../diagnostic/EnhancedGameManager'
import { colors, spacing, typography, borders, effects, zIndex } from '../../styles/design-tokens'

export interface PlayerAchievement {
  achievementId: string
  unlockedAt: number
  progress: number
  isCompleted: boolean
  timesCompleted: number
  lastProgressUpdate: number
  metadata?: any
}

export interface AchievementProgress {
  achievementId: string
  currentProgress: number
  maxProgress: number
  progressPercentage: number
  isUnlocked: boolean
  isCompleted: boolean
  canProgress: boolean
  nextMilestone?: number
}

export interface AchievementNotification {
  id: string
  achievementId: string
  type: 'unlocked' | 'progress' | 'completed' | 'milestone'
  title: string
  description: string
  points: number
  timestamp: number
  isRead: boolean
}

export interface AchievementStats {
  totalAchievements: number
  unlockedAchievements: number
  completedAchievements: number
  totalPoints: number
  earnedPoints: number
  completionPercentage: number
  rareAchievements: number
  recentUnlocks: PlayerAchievement[]
}

export class AchievementSystem {
  private playerAchievements: Map<string, PlayerAchievement> = new Map()
  private notifications: AchievementNotification[] = []
  private analyticsDataProcessor: AnalyticsDataProcessor | null = null
  private enhancedGameManager: EnhancedGameManager | null = null
  private isInitialized: boolean = false
  private notificationContainer: HTMLElement | null = null

  constructor() {
    console.log('🏆 Achievement System initialized')
  }

  /**
   * Initialize with required dependencies
   */
  public initialize(dependencies: {
    analyticsDataProcessor: AnalyticsDataProcessor
    enhancedGameManager?: EnhancedGameManager
  }): void {
    this.analyticsDataProcessor = dependencies.analyticsDataProcessor
    this.enhancedGameManager = dependencies.enhancedGameManager || null

    // Initialize player achievements
    this.initializePlayerAchievements()

    // Listen for game events
    if (this.enhancedGameManager) {
      this.setupGameEventListeners()
    }

    // Validate achievement definitions
    if (!AchievementDefinitions.validateAchievementChain()) {
      console.error('🏆 Achievement chain validation failed')
    }

    this.isInitialized = true
    console.log('🏆 Achievement System ready')
  }

  private initializePlayerAchievements(): void {
    // Initialize all achievements with zero progress
    const allAchievements = AchievementDefinitions.getAllAchievements()
    
    allAchievements.forEach(achievement => {
      if (!this.playerAchievements.has(achievement.id)) {
        this.playerAchievements.set(achievement.id, {
          achievementId: achievement.id,
          unlockedAt: 0,
          progress: 0,
          isCompleted: false,
          timesCompleted: 0,
          lastProgressUpdate: Date.now()
        })
      }
    })
  }

  private setupGameEventListeners(): void {
    if (!this.enhancedGameManager) return

    // Listen for various game events
    this.enhancedGameManager.addEventListener('case_completed', (event: any) => {
      this.handleCaseCompletion(event.data)
    })

    this.enhancedGameManager.addEventListener('narrative_choice', (event: any) => {
      this.handleNarrativeChoice(event.data)
    })

    this.enhancedGameManager.addEventListener('skill_level_up', (event: any) => {
      this.handleSkillLevelUp(event.data)
    })

    this.enhancedGameManager.addEventListener('consultation_complete', (event: any) => {
      this.handleConsultationComplete(event.data)
    })

    this.enhancedGameManager.addEventListener('investigation_technique', (event: any) => {
      this.handleInvestigationTechnique(event.data)
    })
  }

  /**
   * Event handlers for achievement progress
   */
  private handleCaseCompletion(data: any): void {
    const { caseId, accuracy, timeSpent, isFirstCase } = data

    // First case achievement
    if (isFirstCase) {
      this.updateAchievementProgress('first_case', 1)
    }

    // Case completion count
    this.updateAchievementProgress('case_marathon', 1)

    // Perfect diagnosis
    if (accuracy >= 1.0) {
      this.updateAchievementProgress('perfect_diagnosis', 1)
    }

    // Quick learner (under 10 minutes with high accuracy)
    if (timeSpent < 600 && accuracy >= 0.8) {
      this.updateAchievementProgress('quick_learner', 1)
    }

    // Early adopter (special event)
    this.updateAchievementProgress('early_adopter', 1)

    console.log('🏆 Case completion achievements processed')
  }

  private handleNarrativeChoice(data: any): void {
    const { choiceType, ethicalPrinciple, pathExplored } = data

    // Ethical decision achievements
    switch (ethicalPrinciple) {
      case 'autonomy':
        this.updateAchievementProgress('ethical_autonomy_champion', 1)
        break
      case 'justice':
        this.updateAchievementProgress('justice_advocate', 1)
        break
      case 'beneficence':
        this.updateAchievementProgress('beneficence_guardian', 1)
        break
    }

    // Narrative path exploration
    if (pathExplored) {
      this.updateAchievementProgress('story_explorer', 1)
      this.updateAchievementProgress('master_storyteller', 1)
    }

    console.log('🏆 Narrative choice achievements processed')
  }

  private handleSkillLevelUp(data: any): void {
    const { skillId, newLevel } = data

    // Investigation novice
    if (skillId.includes('investigation') && newLevel >= 2) {
      this.updateAchievementProgress('investigation_novice', 1)
    }

    // Specific skill mastery
    if (skillId === 'palpation' && newLevel >= 8) {
      this.updateAchievementProgress('palpation_master', 1)
    }

    if (skillId === 'diagnostic_reasoning' && newLevel >= 10) {
      this.updateAchievementProgress('diagnostic_virtuoso', 1)
    }

    console.log('🏆 Skill level achievements processed')
  }

  private handleConsultationComplete(data: any): void {
    const { specialtyType, isFirstConsultation, uniqueSpecialtiesCount } = data

    // First consultation
    if (isFirstConsultation) {
      this.updateAchievementProgress('consultation_seeker', 1)
    }

    // Multidisciplinary expert
    if (uniqueSpecialtiesCount >= 5) {
      this.updateAchievementProgress('multidisciplinary_expert', 1)
    }

    console.log('🏆 Consultation achievements processed')
  }

  private handleInvestigationTechnique(data: any): void {
    const { technique, accuracy } = data

    // Investigation technique usage tracking
    // This could trigger various skill-based achievements

    console.log('🏆 Investigation technique achievements processed')
  }

  /**
   * Core achievement progress methods
   */
  public updateAchievementProgress(achievementId: string, progressIncrement: number = 1): boolean {
    const achievement = AchievementDefinitions.getAchievementById(achievementId)
    if (!achievement) {
      console.warn(`🏆 Achievement not found: ${achievementId}`)
      return false
    }

    const playerAchievement = this.playerAchievements.get(achievementId)
    if (!playerAchievement) {
      console.warn(`🏆 Player achievement not found: ${achievementId}`)
      return false
    }

    // Check if achievement can progress
    if (playerAchievement.isCompleted && !achievement.isRepeatable) {
      return false
    }

    // Check prerequisites
    if (!this.arePrerequisitesMet(achievement)) {
      return false
    }

    // Check unlock conditions
    if (!this.areUnlockConditionsMet(achievement)) {
      return false
    }

    // Update progress
    const oldProgress = playerAchievement.progress
    playerAchievement.progress = Math.min(
      playerAchievement.progress + progressIncrement,
      achievement.maxProgress
    )
    playerAchievement.lastProgressUpdate = Date.now()

    // Check for completion
    const wasCompleted = playerAchievement.isCompleted
    if (playerAchievement.progress >= achievement.maxProgress) {
      if (!wasCompleted) {
        playerAchievement.isCompleted = true
        playerAchievement.unlockedAt = Date.now()
        playerAchievement.timesCompleted = 1
        
        // Create completion notification
        this.createNotification(achievementId, 'completed')
        
        console.log(`🏆 Achievement completed: ${achievement.name}`)
      } else if (achievement.isRepeatable) {
        playerAchievement.timesCompleted += 1
        playerAchievement.progress = 0 // Reset for repeatable achievements
        
        // Create repeat completion notification
        this.createNotification(achievementId, 'milestone')
      }
    } else if (oldProgress !== playerAchievement.progress) {
      // Create progress notification
      this.createNotification(achievementId, 'progress')
    }

    return true
  }

  private arePrerequisitesMet(achievement: Achievement): boolean {
    return achievement.prerequisites.every(prerequisiteId => {
      const prerequisiteAchievement = this.playerAchievements.get(prerequisiteId)
      return prerequisiteAchievement?.isCompleted || false
    })
  }

  private areUnlockConditionsMet(achievement: Achievement): boolean {
    if (!this.analyticsDataProcessor) return true

    return achievement.unlockConditions.every(condition => {
      return this.evaluateCondition(condition)
    })
  }

  private evaluateCondition(condition: AchievementCondition): boolean {
    if (!this.analyticsDataProcessor) return false

    const summary = this.analyticsDataProcessor.getAnalyticsSummary()
    const skills = this.analyticsDataProcessor.getSkillProgressions()

    switch (condition.type) {
      case 'performance_metric':
        return this.evaluatePerformanceCondition(condition, summary)
      
      case 'skill_level':
        return this.evaluateSkillCondition(condition, skills)
      
      case 'case_completion':
        return this.evaluateCaseCondition(condition, summary)
      
      case 'time_spent':
        return this.evaluateTimeCondition(condition, summary)
      
      case 'streak':
        return this.evaluateStreakCondition(condition, summary)
      
      case 'narrative_choice':
        return this.evaluateNarrativeCondition(condition)
      
      case 'social':
        return this.evaluateSocialCondition(condition)
      
      default:
        return false
    }
  }

  private evaluatePerformanceCondition(condition: AchievementCondition, summary: any): boolean {
    const value = summary[condition.target]
    if (value === undefined) return false

    switch (condition.operator) {
      case 'greater_than':
        return value > condition.value
      case 'less_than':
        return value < condition.value
      case 'equals':
        return value === condition.value
      default:
        return false
    }
  }

  private evaluateSkillCondition(condition: AchievementCondition, skills: any[]): boolean {
    if (condition.target === 'any_investigation_skill') {
      return skills.some(skill => 
        skill.category === 'investigation' && skill.currentLevel > condition.value
      )
    }

    const skill = skills.find(s => s.skillId === condition.target)
    if (!skill) return false

    switch (condition.operator) {
      case 'greater_than':
        return skill.currentLevel > condition.value
      case 'equals':
        return skill.currentLevel === condition.value
      default:
        return false
    }
  }

  private evaluateCaseCondition(condition: AchievementCondition, summary: any): boolean {
    const value = summary.casesCompleted || 0
    
    switch (condition.operator) {
      case 'greater_than':
        return value > condition.value
      case 'equals':
        return value === condition.value
      default:
        return false
    }
  }

  private evaluateTimeCondition(condition: AchievementCondition, summary: any): boolean {
    // This would need to be implemented based on specific time tracking
    return false
  }

  private evaluateStreakCondition(condition: AchievementCondition, summary: any): boolean {
    const streak = summary.currentStreak || 0
    
    switch (condition.operator) {
      case 'greater_than':
        return streak > condition.value
      case 'equals':
        return streak === condition.value
      default:
        return false
    }
  }

  private evaluateNarrativeCondition(condition: AchievementCondition): boolean {
    // This would need to track narrative choices separately
    // For now, return false as placeholder
    return false
  }

  private evaluateSocialCondition(condition: AchievementCondition): boolean {
    // This would need to track social interactions
    // For now, return false as placeholder
    return false
  }

  /**
   * Notification system
   */
  private createNotification(achievementId: string, type: AchievementNotification['type']): void {
    const achievement = AchievementDefinitions.getAchievementById(achievementId)
    if (!achievement) return

    const notification: AchievementNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      achievementId,
      type,
      title: this.getNotificationTitle(achievement, type),
      description: this.getNotificationDescription(achievement, type),
      points: achievement.points,
      timestamp: Date.now(),
      isRead: false
    }

    this.notifications.push(notification)
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications.shift()
    }

    // Show visual notification
    this.showVisualNotification(notification)
  }

  private getNotificationTitle(achievement: Achievement, type: AchievementNotification['type']): string {
    switch (type) {
      case 'completed':
        return `Achievement Unlocked: ${achievement.name}!`
      case 'progress':
        return `Progress: ${achievement.name}`
      case 'milestone':
        return `Milestone: ${achievement.name} (${this.playerAchievements.get(achievement.id)?.timesCompleted}x)`
      default:
        return achievement.name
    }
  }

  private getNotificationDescription(achievement: Achievement, type: AchievementNotification['type']): string {
    switch (type) {
      case 'completed':
        return `${achievement.description} (+${achievement.points} points)`
      case 'progress':
        const playerAchievement = this.playerAchievements.get(achievement.id)
        const progress = playerAchievement ? playerAchievement.progress : 0
        return `${progress}/${achievement.maxProgress} - ${achievement.description}`
      case 'milestone':
        return `Completed again! ${achievement.description}`
      default:
        return achievement.description
    }
  }

  private showVisualNotification(notification: AchievementNotification): void {
    const notificationElement = document.createElement('div')
    notificationElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors.background.gradient.primary};
      color: ${colors.neutral.light};
      padding: ${spacing.lg};
      border-radius: ${borders.radius.lg};
      border: 2px solid ${colors.primary.base};
      box-shadow: ${effects.shadow.xl};
      z-index: ${zIndex.notification};
      max-width: 400px;
      animation: slideInRight 0.5s ease-out;
      backdrop-filter: ${effects.blur.md};
    `

    const achievement = AchievementDefinitions.getAchievementById(notification.achievementId)
    const rarityColors = {
      common: colors.neutral.base,
      uncommon: colors.info.base,
      rare: colors.primary.base,
      epic: colors.accent.base,
      legendary: '#FFD700'
    }

    notificationElement.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: ${spacing.md};
        margin-bottom: ${spacing.sm};
      ">
        <div style="
          font-size: 32px;
          filter: drop-shadow(0 0 8px ${achievement ? rarityColors[achievement.rarity] : colors.primary.base});
        ">${achievement?.icon || '🏆'}</div>
        <div style="flex: 1;">
          <div style="
            font-weight: ${typography.fontWeight.bold};
            color: ${achievement ? rarityColors[achievement.rarity] : colors.primary.base};
            font-size: ${typography.fontSize.md};
            margin-bottom: ${spacing.xs};
          ">${notification.title}</div>
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
          ">${notification.description}</div>
        </div>
        <button style="
          background: transparent;
          border: none;
          color: ${colors.neutral.base};
          cursor: pointer;
          font-size: ${typography.fontSize.lg};
          padding: ${spacing.xs};
        ">✕</button>
      </div>
      ${achievement?.rarity === 'legendary' || achievement?.rarity === 'epic' ? `
        <div style="
          text-align: center;
          color: ${rarityColors[achievement.rarity]};
          font-size: ${typography.fontSize.xs};
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: ${spacing.sm};
          font-weight: ${typography.fontWeight.bold};
        ">${achievement.rarity} Achievement</div>
      ` : ''}
    `

    // Add close functionality
    const closeButton = notificationElement.querySelector('button')
    closeButton?.addEventListener('click', () => {
      notificationElement.style.animation = 'slideOutRight 0.3s ease-in'
      setTimeout(() => {
        if (notificationElement.parentNode) {
          notificationElement.parentNode.removeChild(notificationElement)
        }
      }, 300)
    })

    document.body.appendChild(notificationElement)

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.style.animation = 'slideOutRight 0.3s ease-in'
        setTimeout(() => {
          if (notificationElement.parentNode) {
            notificationElement.parentNode.removeChild(notificationElement)
          }
        }, 300)
      }
    }, 8000)
  }

  /**
   * Public API methods
   */
  public getPlayerAchievement(achievementId: string): PlayerAchievement | undefined {
    return this.playerAchievements.get(achievementId)
  }

  public getAllPlayerAchievements(): PlayerAchievement[] {
    return Array.from(this.playerAchievements.values())
  }

  public getCompletedAchievements(): PlayerAchievement[] {
    return Array.from(this.playerAchievements.values()).filter(pa => pa.isCompleted)
  }

  public getAchievementProgress(achievementId: string): AchievementProgress | null {
    const achievement = AchievementDefinitions.getAchievementById(achievementId)
    const playerAchievement = this.playerAchievements.get(achievementId)
    
    if (!achievement || !playerAchievement) return null

    return {
      achievementId,
      currentProgress: playerAchievement.progress,
      maxProgress: achievement.maxProgress,
      progressPercentage: (playerAchievement.progress / achievement.maxProgress) * 100,
      isUnlocked: playerAchievement.unlockedAt > 0,
      isCompleted: playerAchievement.isCompleted,
      canProgress: this.arePrerequisitesMet(achievement) && this.areUnlockConditionsMet(achievement)
    }
  }

  public getAchievementStats(): AchievementStats {
    const allAchievements = AchievementDefinitions.getAllAchievements()
    const playerAchievements = Array.from(this.playerAchievements.values())
    
    const unlockedAchievements = playerAchievements.filter(pa => pa.unlockedAt > 0).length
    const completedAchievements = playerAchievements.filter(pa => pa.isCompleted).length
    
    const earnedPoints = playerAchievements.reduce((total, pa) => {
      if (pa.isCompleted) {
        const achievement = AchievementDefinitions.getAchievementById(pa.achievementId)
        if (achievement) {
          return total + (achievement.points * pa.timesCompleted)
        }
      }
      return total
    }, 0)

    const rareAchievements = playerAchievements.filter(pa => {
      if (!pa.isCompleted) return false
      const achievement = AchievementDefinitions.getAchievementById(pa.achievementId)
      return achievement && (achievement.rarity === 'rare' || achievement.rarity === 'epic' || achievement.rarity === 'legendary')
    }).length

    const recentUnlocks = playerAchievements
      .filter(pa => pa.isCompleted)
      .sort((a, b) => b.unlockedAt - a.unlockedAt)
      .slice(0, 5)

    return {
      totalAchievements: allAchievements.length,
      unlockedAchievements,
      completedAchievements,
      totalPoints: AchievementDefinitions.getTotalPossiblePoints(),
      earnedPoints,
      completionPercentage: (completedAchievements / allAchievements.length) * 100,
      rareAchievements,
      recentUnlocks
    }
  }

  public getNotifications(unreadOnly: boolean = false): AchievementNotification[] {
    if (unreadOnly) {
      return this.notifications.filter(n => !n.isRead)
    }
    return [...this.notifications]
  }

  public markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
    }
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true
    })
  }

  public getAchievementsByCategory(category: AchievementCategory): { achievement: Achievement; playerData: PlayerAchievement }[] {
    const achievements = AchievementDefinitions.getAchievementsByCategory(category)
    return achievements.map(achievement => ({
      achievement,
      playerData: this.playerAchievements.get(achievement.id)!
    }))
  }

  public exportAchievementData(): any {
    return {
      playerAchievements: Array.from(this.playerAchievements.values()),
      notifications: this.notifications,
      stats: this.getAchievementStats(),
      exportTimestamp: Date.now()
    }
  }

  /**
   * Manual achievement triggers (for testing or special events)
   */
  public triggerAchievement(achievementId: string): boolean {
    return this.updateAchievementProgress(achievementId, 1)
  }

  public resetAchievement(achievementId: string): void {
    const playerAchievement = this.playerAchievements.get(achievementId)
    if (playerAchievement) {
      playerAchievement.progress = 0
      playerAchievement.isCompleted = false
      playerAchievement.timesCompleted = 0
      playerAchievement.unlockedAt = 0
      playerAchievement.lastProgressUpdate = Date.now()
    }
  }

  public resetAllAchievements(): void {
    this.playerAchievements.forEach(playerAchievement => {
      playerAchievement.progress = 0
      playerAchievement.isCompleted = false
      playerAchievement.timesCompleted = 0
      playerAchievement.unlockedAt = 0
      playerAchievement.lastProgressUpdate = Date.now()
    })
    
    this.notifications = []
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    // Remove any visual notifications
    const notifications = document.querySelectorAll('[style*="slideInRight"]')
    notifications.forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    })
    
    console.log('🏆 Achievement System destroyed')
  }
}