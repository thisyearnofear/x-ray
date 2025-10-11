/**
 * Skill Tree Manager
 * INTEGRATION: Connects skill tree with analytics and game systems
 * PROGRESSION: Manages skill unlocking and advancement logic
 * EDUCATIONAL: Provides learning path recommendations and guidance
 */

import { SkillTreeData, SkillNode } from './SkillTreeData'
import { SkillTreeVisualization, SkillTreeVisualizationConfig } from './SkillTreeVisualization'
import { AnalyticsDataProcessor } from './AnalyticsDataProcessor'
import { SkillProgression, LearningRecommendation } from './types'
import { EnhancedGameManager } from '../diagnostic/EnhancedGameManager'
import { colors, spacing, typography, borders, effects, zIndex } from '../../styles/design-tokens'

export interface SkillTreeManagerConfig {
  enableAutoUnlock: boolean
  enableRecommendations: boolean
  enableNotifications: boolean
  experienceMultiplier: number
  unlockAnimations: boolean
}

export interface SkillUnlockEvent {
  skillId: string
  skill: SkillNode
  timestamp: number
  trigger: 'performance' | 'prerequisite' | 'manual'
}

export interface SkillRecommendation extends LearningRecommendation {
  skillId: string
  currentLevel: number
  targetLevel: number
  estimatedSessions: number
  prerequisites: string[]
}

export class SkillTreeManager {
  private skillTreeData: SkillTreeData
  private skillTreeVisualization: SkillTreeVisualization | null = null
  private analyticsDataProcessor: AnalyticsDataProcessor | null = null
  private enhancedGameManager: EnhancedGameManager | null = null
  private config: SkillTreeManagerConfig
  private container: HTMLElement | null = null
  private isVisible: boolean = false
  private skillUnlockHistory: SkillUnlockEvent[] = []

  constructor(config: Partial<SkillTreeManagerConfig> = {}) {
    this.config = {
      enableAutoUnlock: true,
      enableRecommendations: true,
      enableNotifications: true,
      experienceMultiplier: 1.0,
      unlockAnimations: true,
      ...config
    }

    this.skillTreeData = new SkillTreeData()
    
    console.log('🌳 Skill Tree Manager initialized')
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

    // Listen for game events to update skill progression
    if (this.enhancedGameManager) {
      this.enhancedGameManager.addEventListener('investigation_technique', (event: any) => {
        this.handleInvestigationTechnique(event.data)
      })

      this.enhancedGameManager.addEventListener('case_completed', (event: any) => {
        this.handleCaseCompletion(event.data)
      })

      this.enhancedGameManager.addEventListener('consultation_complete', (event: any) => {
        this.handleConsultationComplete(event.data)
      })
    }
  }

  /**
   * Show skill tree interface
   */
  public show(containerElement?: HTMLElement): void {
    if (this.isVisible) return

    this.container = containerElement || this.createSkillTreeContainer()
    this.createSkillTreeInterface()
    this.isVisible = true

    console.log('🌳 Skill tree interface opened')
  }

  /**
   * Hide skill tree interface
   */
  public hide(): void {
    if (!this.isVisible || !this.container) return

    if (this.skillTreeVisualization) {
      this.skillTreeVisualization.destroy()
      this.skillTreeVisualization = null
    }

    if (this.container.parentNode) {
      this.container.style.animation = 'slideOut 0.3s ease-in'
      setTimeout(() => {
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container)
        }
        this.container = null
        this.isVisible = false
      }, 300)
    }

    console.log('🌳 Skill tree interface closed')
  }

  private createSkillTreeContainer(): HTMLElement {
    const container = document.createElement('div')
    container.id = 'skill-tree-container'
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: ${colors.background.gradient.panel};
      color: ${colors.neutral.light};
      font-family: ${typography.fontFamily.primary};
      z-index: ${zIndex.modal};
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    `

    document.body.appendChild(container)
    return container
  }

  private createSkillTreeInterface(): void {
    if (!this.container) return

    // Create header
    this.createHeader()
    
    // Create main content area
    this.createMainContent()
    
    // Create sidebar
    this.createSidebar()
    
    // Create footer
    this.createFooter()
  }

  private createHeader(): void {
    if (!this.container) return

    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${spacing.lg} ${spacing.xl};
      border-bottom: ${borders.width.thin} solid ${colors.border.primary};
      background: ${colors.background.gradient.primary};
    `

    header.innerHTML = `
      <div>
        <h1 style="
          margin: 0;
          color: ${colors.primary.base};
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          text-shadow: ${effects.textShadow.sm};
        ">🌳 Medical Skill Tree</h1>
        <p style="
          margin: ${spacing.sm} 0 0 0;
          color: ${colors.neutral.base};
          font-size: ${typography.fontSize.md};
        ">Track your medical competency development and unlock new skills</p>
      </div>
      <div style="display: flex; gap: ${spacing.md}; align-items: center;">
        <button id="reset-view" style="
          background: ${colors.info.base};
          color: ${colors.neutral.black};
          border: none;
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.bold};
        ">🎯 Reset View</button>
        <button id="export-tree" style="
          background: ${colors.accent.base};
          color: ${colors.neutral.black};
          border: none;
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.bold};
        ">📸 Export</button>
        <button id="close-skill-tree" style="
          background: transparent;
          color: ${colors.neutral.base};
          border: ${borders.width.thin} solid ${colors.border.neutral};
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm};
          cursor: pointer;
          font-size: ${typography.fontSize.lg};
        ">✕</button>
      </div>
    `

    // Add event listeners
    const resetButton = header.querySelector('#reset-view') as HTMLButtonElement
    resetButton.addEventListener('click', () => {
      if (this.skillTreeVisualization) {
        this.skillTreeVisualization.resetView()
      }
    })

    const exportButton = header.querySelector('#export-tree') as HTMLButtonElement
    exportButton.addEventListener('click', () => {
      this.exportSkillTree()
    })

    const closeButton = header.querySelector('#close-skill-tree') as HTMLButtonElement
    closeButton.addEventListener('click', () => {
      this.hide()
    })

    this.container.appendChild(header)
  }

  private createMainContent(): void {
    if (!this.container) return

    const mainContent = document.createElement('div')
    mainContent.style.cssText = `
      display: flex;
      height: calc(100vh - 140px);
    `

    // Skill tree visualization area
    const treeArea = document.createElement('div')
    treeArea.id = 'skill-tree-area'
    treeArea.style.cssText = `
      flex: 1;
      background: ${colors.background.gradient.primary};
      border-right: ${borders.width.thin} solid ${colors.border.primary};
      position: relative;
    `

    // Initialize skill tree visualization
    const visualizationConfig: SkillTreeVisualizationConfig = {
      container: treeArea,
      width: 800,
      height: 600,
      enableZoom: true,
      enablePan: true,
      enableAnimations: this.config.unlockAnimations,
      showTooltips: true,
      onSkillClick: (skill) => this.handleSkillClick(skill),
      onSkillHover: (skill) => this.handleSkillHover(skill)
    }

    this.skillTreeVisualization = new SkillTreeVisualization(visualizationConfig)

    // Update visualization with current skill progressions
    if (this.analyticsDataProcessor) {
      const skillProgressions = this.analyticsDataProcessor.getSkillProgressions()
      this.skillTreeVisualization.updateSkillProgress(skillProgressions)
    }

    mainContent.appendChild(treeArea)
    this.container.appendChild(mainContent)
  }

  private createSidebar(): void {
    if (!this.container) return

    const mainContent = this.container.querySelector('div:last-child') as HTMLElement
    
    const sidebar = document.createElement('div')
    sidebar.id = 'skill-tree-sidebar'
    sidebar.style.cssText = `
      width: 350px;
      background: ${colors.background.gradient.panel};
      padding: ${spacing.lg};
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: ${spacing.lg};
    `

    // Skill overview section
    const overviewSection = this.createSkillOverviewSection()
    sidebar.appendChild(overviewSection)

    // Recommendations section
    if (this.config.enableRecommendations) {
      const recommendationsSection = this.createRecommendationsSection()
      sidebar.appendChild(recommendationsSection)
    }

    // Recent unlocks section
    const unlocksSection = this.createRecentUnlocksSection()
    sidebar.appendChild(unlocksSection)

    // Learning path section
    const pathSection = this.createLearningPathSection()
    sidebar.appendChild(pathSection)

    mainContent.appendChild(sidebar)
  }

  private createSkillOverviewSection(): HTMLElement {
    const section = document.createElement('div')
    section.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.md} 0;
        color: ${colors.primary.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">📊 Skill Overview</h3>
    `

    const skillsContainer = document.createElement('div')
    skillsContainer.id = 'skills-overview'
    skillsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${spacing.sm};
    `

    // Get skill statistics
    const allSkills = this.skillTreeData.getAllSkills()
    const unlockedSkills = allSkills.filter(skill => skill.isUnlocked)
    const completedSkills = allSkills.filter(skill => skill.isCompleted)
    const categories = this.skillTreeData.getCategories()

    // Overall progress
    const overallProgress = document.createElement('div')
    overallProgress.style.cssText = `
      background: ${colors.background.primaryGlow};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.md};
      padding: ${spacing.md};
    `

    overallProgress.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        margin-bottom: ${spacing.sm};
      ">
        <span style="color: ${colors.neutral.light};">Overall Progress</span>
        <span style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">
          ${completedSkills.length}/${allSkills.length}
        </span>
      </div>
      <div style="
        width: 100%;
        height: 6px;
        background: ${colors.background.panel};
        border-radius: 3px;
        overflow: hidden;
      ">
        <div style="
          width: ${(completedSkills.length / allSkills.length) * 100}%;
          height: 100%;
          background: linear-gradient(90deg, ${colors.primary.base}, ${colors.primary.light});
          transition: width 0.3s ease;
        "></div>
      </div>
    `

    skillsContainer.appendChild(overallProgress)

    // Category breakdown
    categories.forEach(category => {
      const categorySkills = this.skillTreeData.getSkillsByCategory(category.id)
      const categoryUnlocked = categorySkills.filter(skill => skill.isUnlocked).length
      const categoryCompleted = categorySkills.filter(skill => skill.isCompleted).length

      const categoryItem = document.createElement('div')
      categoryItem.style.cssText = `
        background: ${colors.background.gradient.primary};
        border: ${borders.width.thin} solid ${colors.border.neutral};
        border-radius: ${borders.radius.md};
        padding: ${spacing.sm};
        cursor: pointer;
        transition: all 0.3s ease;
      `

      categoryItem.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          margin-bottom: ${spacing.xs};
        ">
          <span style="font-size: ${typography.fontSize.md};">${category.icon}</span>
          <span style="
            color: ${colors.neutral.light};
            font-weight: ${typography.fontWeight.bold};
            flex: 1;
          ">${category.name}</span>
          <span style="
            color: ${category.color};
            font-size: ${typography.fontSize.xs};
          ">${categoryCompleted}/${categorySkills.length}</span>
        </div>
        <div style="
          width: 100%;
          height: 4px;
          background: ${colors.background.panel};
          border-radius: 2px;
          overflow: hidden;
        ">
          <div style="
            width: ${categorySkills.length > 0 ? (categoryCompleted / categorySkills.length) * 100 : 0}%;
            height: 100%;
            background: ${category.color};
            transition: width 0.3s ease;
          "></div>
        </div>
      `

      categoryItem.addEventListener('click', () => {
        // Focus on first skill in category
        const firstSkill = categorySkills[0]
        if (firstSkill && this.skillTreeVisualization) {
          this.skillTreeVisualization.focusOnSkill(firstSkill.id)
        }
      })

      categoryItem.addEventListener('mouseenter', () => {
        categoryItem.style.borderColor = category.color
        categoryItem.style.transform = 'translateY(-1px)'
      })

      categoryItem.addEventListener('mouseleave', () => {
        categoryItem.style.borderColor = colors.border.neutral
        categoryItem.style.transform = 'translateY(0)'
      })

      skillsContainer.appendChild(categoryItem)
    })

    section.appendChild(skillsContainer)
    return section
  }

  private createRecommendationsSection(): HTMLElement {
    const section = document.createElement('div')
    section.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.md} 0;
        color: ${colors.accent.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">🎯 Skill Recommendations</h3>
    `

    const recommendationsContainer = document.createElement('div')
    recommendationsContainer.id = 'skill-recommendations'
    
    const recommendations = this.generateSkillRecommendations()
    
    if (recommendations.length === 0) {
      recommendationsContainer.innerHTML = `
        <div style="
          text-align: center;
          color: ${colors.neutral.base};
          padding: ${spacing.lg};
        ">
          <div style="font-size: ${typography.fontSize.xl}; margin-bottom: ${spacing.sm};">🌟</div>
          <div>Complete more activities to unlock skill recommendations!</div>
        </div>
      `
    } else {
      recommendationsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: ${spacing.sm};
      `

      recommendations.slice(0, 3).forEach(recommendation => {
        const recommendationItem = document.createElement('div')
        recommendationItem.style.cssText = `
          background: ${colors.background.accentGlow};
          border: ${borders.width.thin} solid ${colors.border.accent};
          border-radius: ${borders.radius.md};
          padding: ${spacing.md};
          cursor: pointer;
          transition: all 0.3s ease;
        `

        const skill = this.skillTreeData.getSkill(recommendation.skillId)
        
        recommendationItem.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            gap: ${spacing.sm};
            margin-bottom: ${spacing.sm};
          ">
            <span style="font-size: ${typography.fontSize.lg};">${skill?.icon || '🎯'}</span>
            <div style="flex: 1;">
              <div style="
                font-weight: ${typography.fontWeight.bold};
                color: ${colors.accent.base};
                margin-bottom: ${spacing.xs};
              ">${recommendation.title}</div>
              <div style="
                font-size: ${typography.fontSize.xs};
                color: ${colors.neutral.base};
              ">Level ${recommendation.currentLevel} → ${recommendation.targetLevel}</div>
            </div>
          </div>
          <div style="
            color: ${colors.neutral.light};
            font-size: ${typography.fontSize.sm};
            line-height: ${typography.lineHeight.relaxed};
            margin-bottom: ${spacing.sm};
          ">${recommendation.description}</div>
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: ${typography.fontSize.xs};
            color: ${colors.neutral.base};
          ">
            <span>⏱️ ${recommendation.estimatedTime} min</span>
            <span>📚 ${recommendation.estimatedSessions} sessions</span>
          </div>
        `

        recommendationItem.addEventListener('click', () => {
          if (skill && this.skillTreeVisualization) {
            this.skillTreeVisualization.focusOnSkill(skill.id)
          }
        })

        recommendationItem.addEventListener('mouseenter', () => {
          recommendationItem.style.transform = 'translateY(-2px)'
          recommendationItem.style.boxShadow = `0 4px 12px ${colors.accent.base}40`
        })

        recommendationItem.addEventListener('mouseleave', () => {
          recommendationItem.style.transform = 'translateY(0)'
          recommendationItem.style.boxShadow = 'none'
        })

        recommendationsContainer.appendChild(recommendationItem)
      })
    }

    section.appendChild(recommendationsContainer)
    return section
  }

  private createRecentUnlocksSection(): HTMLElement {
    const section = document.createElement('div')
    section.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.md} 0;
        color: ${colors.info.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">🔓 Recent Unlocks</h3>
    `

    const unlocksContainer = document.createElement('div')
    unlocksContainer.id = 'recent-unlocks'
    
    const recentUnlocks = this.skillUnlockHistory.slice(-5).reverse()
    
    if (recentUnlocks.length === 0) {
      unlocksContainer.innerHTML = `
        <div style="
          text-align: center;
          color: ${colors.neutral.base};
          padding: ${spacing.lg};
        ">
          <div style="font-size: ${typography.fontSize.xl}; margin-bottom: ${spacing.sm};">🔒</div>
          <div>No skills unlocked yet. Keep practicing!</div>
        </div>
      `
    } else {
      unlocksContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: ${spacing.sm};
      `

      recentUnlocks.forEach(unlock => {
        const unlockItem = document.createElement('div')
        unlockItem.style.cssText = `
          background: ${colors.background.infoGlow};
          border: ${borders.width.thin} solid ${colors.border.info};
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm};
          cursor: pointer;
          transition: all 0.3s ease;
        `

        unlockItem.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            gap: ${spacing.sm};
          ">
            <span style="font-size: ${typography.fontSize.md};">${unlock.skill.icon}</span>
            <div style="flex: 1;">
              <div style="
                font-weight: ${typography.fontWeight.bold};
                color: ${colors.info.base};
                margin-bottom: ${spacing.xs};
              ">${unlock.skill.name}</div>
              <div style="
                font-size: ${typography.fontSize.xs};
                color: ${colors.neutral.base};
              ">${new Date(unlock.timestamp).toLocaleDateString()}</div>
            </div>
            <div style="
              background: ${colors.info.base};
              color: ${colors.neutral.black};
              padding: ${spacing.xs};
              border-radius: ${borders.radius.sm};
              font-size: ${typography.fontSize.xs};
              font-weight: ${typography.fontWeight.bold};
            ">NEW</div>
          </div>
        `

        unlockItem.addEventListener('click', () => {
          if (this.skillTreeVisualization) {
            this.skillTreeVisualization.focusOnSkill(unlock.skillId)
          }
        })

        unlocksContainer.appendChild(unlockItem)
      })
    }

    section.appendChild(unlocksContainer)
    return section
  }

  private createLearningPathSection(): HTMLElement {
    const section = document.createElement('div')
    section.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.md} 0;
        color: ${colors.primary.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">🛤️ Learning Path</h3>
    `

    const pathContainer = document.createElement('div')
    pathContainer.innerHTML = `
      <div style="
        background: ${colors.background.primaryGlow};
        border: ${borders.width.thin} solid ${colors.border.primary};
        border-radius: ${borders.radius.md};
        padding: ${spacing.md};
        text-align: center;
      ">
        <div style="
          color: ${colors.neutral.light};
          margin-bottom: ${spacing.sm};
        ">Suggested next steps based on your progress:</div>
        <div style="
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs};
        ">
          <div style="color: ${colors.primary.base};">1. Complete basic investigation skills</div>
          <div style="color: ${colors.neutral.base};">2. Unlock specialty knowledge</div>
          <div style="color: ${colors.neutral.base};">3. Master advanced techniques</div>
        </div>
      </div>
    `

    section.appendChild(pathContainer)
    return section
  }

  private createFooter(): void {
    if (!this.container) return

    const footer = document.createElement('div')
    footer.style.cssText = `
      padding: ${spacing.md} ${spacing.xl};
      border-top: ${borders.width.thin} solid ${colors.border.primary};
      background: ${colors.background.gradient.primary};
      display: flex;
      justify-content: space-between;
      align-items: center;
    `

    footer.innerHTML = `
      <div style="
        color: ${colors.neutral.base};
        font-size: ${typography.fontSize.sm};
      ">
        🌳 Interactive skill progression • Click nodes for details • Drag to pan • Scroll to zoom
      </div>
      <div style="
        display: flex;
        gap: ${spacing.md};
      ">
        <button id="skill-help" style="
          background: transparent;
          color: ${colors.neutral.base};
          border: ${borders.width.thin} solid ${colors.border.neutral};
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
        ">❓ Help</button>
      </div>
    `

    this.container.appendChild(footer)
  }

  /**
   * Event handlers
   */
  private handleSkillClick(skill: SkillNode): void {
    console.log('🌳 Skill clicked:', skill.name)
    // Skill details are handled by the visualization component
  }

  private handleSkillHover(skill: SkillNode | null): void {
    // Hover effects are handled by the visualization component
  }

  private handleInvestigationTechnique(data: any): void {
    const { technique } = data
    
    // Award experience for using investigation techniques
    const experienceGain = 10 * this.config.experienceMultiplier
    const updated = this.skillTreeData.updateSkillProgress(technique, experienceGain)
    
    if (updated && this.skillTreeVisualization && this.analyticsDataProcessor) {
      const skillProgressions = this.analyticsDataProcessor.getSkillProgressions()
      this.skillTreeVisualization.updateSkillProgress(skillProgressions)
    }
  }

  private handleCaseCompletion(data: any): void {
    const { accuracy, efficiency } = data
    
    // Award experience based on performance
    let experienceGain = 50 * this.config.experienceMultiplier
    
    if (accuracy > 0.8) experienceGain *= 1.5 // Bonus for high accuracy
    if (efficiency > 0.7) experienceGain *= 1.2 // Bonus for efficiency
    
    // Award to diagnostic reasoning skill
    this.skillTreeData.updateSkillProgress('diagnostic_reasoning', experienceGain)
    
    // Update visualization
    if (this.skillTreeVisualization && this.analyticsDataProcessor) {
      const skillProgressions = this.analyticsDataProcessor.getSkillProgressions()
      this.skillTreeVisualization.updateSkillProgress(skillProgressions)
    }
  }

  private handleConsultationComplete(data: any): void {
    // Award experience for consultation skills
    const experienceGain = 25 * this.config.experienceMultiplier
    this.skillTreeData.updateSkillProgress('clinical_communication', experienceGain)
    
    // Update visualization
    if (this.skillTreeVisualization && this.analyticsDataProcessor) {
      const skillProgressions = this.analyticsDataProcessor.getSkillProgressions()
      this.skillTreeVisualization.updateSkillProgress(skillProgressions)
    }
  }

  private generateSkillRecommendations(): SkillRecommendation[] {
    const recommendations: SkillRecommendation[] = []
    const allSkills = this.skillTreeData.getAllSkills()
    
    // Find skills that are unlocked but not mastered
    const improvableSkills = allSkills.filter(skill => 
      skill.isUnlocked && !skill.isCompleted && skill.level < skill.maxLevel
    )
    
    // Find skills that can be unlocked
    const unlockableSkills = allSkills.filter(skill => 
      !skill.isUnlocked && this.skillTreeData.canUnlockSkill(skill.id)
    )
    
    // Generate recommendations for improvement
    improvableSkills.forEach(skill => {
      const targetLevel = Math.min(skill.level + 2, skill.maxLevel)
      const estimatedSessions = Math.ceil((targetLevel - skill.level) * 2)
      
      recommendations.push({
        id: `improve_${skill.id}`,
        skillId: skill.id,
        type: 'skill',
        title: `Improve ${skill.name}`,
        description: `Continue practicing to reach level ${targetLevel}`,
        reasoning: `You're making good progress with ${skill.name}`,
        difficulty: skill.difficulty as 'beginner' | 'intermediate' | 'advanced',
        estimatedTime: skill.estimatedPracticeTime,
        priority: 8 - skill.level, // Higher priority for lower level skills
        prerequisites: [],
        expectedBenefit: `Enhanced ${skill.category} capabilities`,
        currentLevel: skill.level,
        targetLevel,
        estimatedSessions
      })
    })
    
    // Generate recommendations for unlocking
    unlockableSkills.forEach(skill => {
      recommendations.push({
        id: `unlock_${skill.id}`,
        skillId: skill.id,
        type: 'skill',
        title: `Unlock ${skill.name}`,
        description: `You're ready to learn ${skill.name}`,
        reasoning: 'All prerequisites have been met',
        difficulty: skill.difficulty as 'beginner' | 'intermediate' | 'advanced',
        estimatedTime: skill.estimatedPracticeTime,
        priority: 9, // High priority for unlockable skills
        prerequisites: skill.prerequisites,
        expectedBenefit: `Access to ${skill.category} techniques`,
        currentLevel: 0,
        targetLevel: 1,
        estimatedSessions: 1
      })
    })
    
    return recommendations.sort((a, b) => b.priority - a.priority)
  }

  private exportSkillTree(): void {
    if (this.skillTreeVisualization) {
      const imageUrl = this.skillTreeVisualization.exportImage()
      
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = `skill-tree-${new Date().toISOString().split('T')[0]}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      URL.revokeObjectURL(imageUrl)
      
      console.log('🌳 Skill tree exported')
    }
  }

  /**
   * Public API methods
   */
  public isSkillTreeVisible(): boolean {
    return this.isVisible
  }

  public focusOnSkill(skillId: string): void {
    if (this.skillTreeVisualization) {
      this.skillTreeVisualization.focusOnSkill(skillId)
    }
  }

  public getSkillRecommendations(): SkillRecommendation[] {
    return this.generateSkillRecommendations()
  }

  public getSkillUnlockHistory(): SkillUnlockEvent[] {
    return this.skillUnlockHistory
  }

  public exportSkillData(): any {
    return {
      skillTreeData: this.skillTreeData.exportSkillData(),
      unlockHistory: this.skillUnlockHistory,
      recommendations: this.generateSkillRecommendations(),
      exportTimestamp: Date.now()
    }
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    this.hide()
    
    if (this.skillTreeVisualization) {
      this.skillTreeVisualization.destroy()
      this.skillTreeVisualization = null
    }
    
    console.log('🌳 Skill Tree Manager destroyed')
  }
}