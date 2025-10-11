/**
 * Achievement UI
 * VISUAL: Comprehensive achievement display and management interface
 * INTERACTIVE: Achievement browsing, progress tracking, and notifications
 * MOTIVATIONAL: Engaging visual design to encourage achievement hunting
 */

import { AchievementSystem, PlayerAchievement, AchievementStats } from './AchievementSystem'
import { Achievement, AchievementDefinitions, AchievementCategory, AchievementRarity } from './AchievementDefinitions'
import { colors, spacing, typography, borders, effects, zIndex } from '../../styles/design-tokens'

export interface AchievementUIConfig {
  showNotifications: boolean
  enableFiltering: boolean
  enableSearch: boolean
  showProgress: boolean
  animateUnlocks: boolean
}

export class AchievementUI {
  private achievementSystem: AchievementSystem
  private config: AchievementUIConfig
  private container: HTMLElement | null = null
  private isVisible: boolean = false
  private currentFilter: AchievementCategory | 'all' = 'all'
  private currentRarityFilter: AchievementRarity | 'all' = 'all'
  private searchQuery: string = ''

  constructor(achievementSystem: AchievementSystem, config: Partial<AchievementUIConfig> = {}) {
    this.achievementSystem = achievementSystem
    this.config = {
      showNotifications: true,
      enableFiltering: true,
      enableSearch: true,
      showProgress: true,
      animateUnlocks: true,
      ...config
    }

    console.log('🏆 Achievement UI initialized')
  }

  /**
   * Show achievement interface
   */
  public show(): void {
    if (this.isVisible) return

    this.createAchievementInterface()
    this.isVisible = true

    console.log('🏆 Achievement UI opened')
  }

  /**
   * Hide achievement interface
   */
  public hide(): void {
    if (!this.isVisible || !this.container) return

    this.container.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container)
      }
      this.container = null
      this.isVisible = false
    }, 300)

    console.log('🏆 Achievement UI closed')
  }

  private createAchievementInterface(): void {
    this.container = document.createElement('div')
    this.container.id = 'achievement-ui'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: ${colors.background.gradient.panel};
      color: ${colors.neutral.light};
      font-family: ${typography.fontFamily.primary};
      z-index: ${zIndex.modal};
      overflow-y: auto;
      animation: slideIn 0.3s ease-out;
    `

    // Create header
    this.createHeader()
    
    // Create main content
    this.createMainContent()
    
    // Create footer
    this.createFooter()

    document.body.appendChild(this.container)
  }

  private createHeader(): void {
    if (!this.container) return

    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${spacing.xl};
      border-bottom: ${borders.width.thin} solid ${colors.border.primary};
      background: ${colors.background.gradient.primary};
    `

    const stats = this.achievementSystem.getAchievementStats()

    header.innerHTML = `
      <div>
        <h1 style="
          margin: 0;
          color: ${colors.primary.base};
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          text-shadow: ${effects.textShadow.sm};
        ">🏆 Achievements</h1>
        <p style="
          margin: ${spacing.sm} 0 0 0;
          color: ${colors.neutral.base};
          font-size: ${typography.fontSize.md};
        ">
          ${stats.completedAchievements}/${stats.totalAchievements} completed • 
          ${stats.earnedPoints.toLocaleString()} points earned
        </p>
      </div>
      <div style="display: flex; gap: ${spacing.md}; align-items: center;">
        ${this.config.enableSearch ? `
          <input type="text" id="achievement-search" placeholder="Search achievements..." style="
            background: ${colors.background.primaryGlow};
            color: ${colors.neutral.light};
            border: ${borders.width.thin} solid ${colors.border.primary};
            border-radius: ${borders.radius.md};
            padding: ${spacing.sm} ${spacing.md};
            font-size: ${typography.fontSize.sm};
            width: 200px;
          ">
        ` : ''}
        <button id="close-achievements" style="
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
    if (this.config.enableSearch) {
      const searchInput = header.querySelector('#achievement-search') as HTMLInputElement
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase()
        this.refreshAchievementList()
      })
    }

    const closeButton = header.querySelector('#close-achievements') as HTMLButtonElement
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

    // Create sidebar with filters and stats
    const sidebar = this.createSidebar()
    mainContent.appendChild(sidebar)

    // Create achievement list area
    const achievementArea = document.createElement('div')
    achievementArea.id = 'achievement-area'
    achievementArea.style.cssText = `
      flex: 1;
      padding: ${spacing.xl};
      overflow-y: auto;
    `

    this.createAchievementList(achievementArea)
    mainContent.appendChild(achievementArea)

    this.container.appendChild(mainContent)
  }

  private createSidebar(): HTMLElement {
    const sidebar = document.createElement('div')
    sidebar.style.cssText = `
      width: 300px;
      background: ${colors.background.gradient.primary};
      border-right: ${borders.width.thin} solid ${colors.border.primary};
      padding: ${spacing.lg};
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: ${spacing.lg};
    `

    // Achievement stats
    const statsSection = this.createStatsSection()
    sidebar.appendChild(statsSection)

    // Filters
    if (this.config.enableFiltering) {
      const filtersSection = this.createFiltersSection()
      sidebar.appendChild(filtersSection)
    }

    // Recent achievements
    const recentSection = this.createRecentSection()
    sidebar.appendChild(recentSection)

    return sidebar
  }

  private createStatsSection(): HTMLElement {
    const section = document.createElement('div')
    section.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.md} 0;
        color: ${colors.primary.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">📊 Progress</h3>
    `

    const stats = this.achievementSystem.getAchievementStats()
    const progressContainer = document.createElement('div')
    progressContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${spacing.md};
    `

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
          ${stats.completionPercentage.toFixed(1)}%
        </span>
      </div>
      <div style="
        width: 100%;
        height: 8px;
        background: ${colors.background.panel};
        border-radius: 4px;
        overflow: hidden;
      ">
        <div style="
          width: ${stats.completionPercentage}%;
          height: 100%;
          background: linear-gradient(90deg, ${colors.primary.base}, ${colors.primary.light});
          transition: width 0.3s ease;
        "></div>
      </div>
    `

    progressContainer.appendChild(overallProgress)

    // Stats cards
    const statsCards = [
      { label: 'Completed', value: stats.completedAchievements, icon: '✅', color: colors.primary.base },
      { label: 'Points Earned', value: stats.earnedPoints.toLocaleString(), icon: '⭐', color: colors.accent.base },
      { label: 'Rare Unlocked', value: stats.rareAchievements, icon: '💎', color: colors.info.base }
    ]

    statsCards.forEach(card => {
      const cardElement = document.createElement('div')
      cardElement.style.cssText = `
        background: ${colors.background.gradient.primary};
        border: ${borders.width.thin} solid ${colors.border.neutral};
        border-radius: ${borders.radius.md};
        padding: ${spacing.sm};
        display: flex;
        align-items: center;
        gap: ${spacing.sm};
      `

      cardElement.innerHTML = `
        <div style="font-size: ${typography.fontSize.lg};">${card.icon}</div>
        <div style="flex: 1;">
          <div style="
            color: ${card.color};
            font-weight: ${typography.fontWeight.bold};
            font-size: ${typography.fontSize.md};
          ">${card.value}</div>
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.xs};
          ">${card.label}</div>
        </div>
      `

      progressContainer.appendChild(cardElement)
    })

    section.appendChild(progressContainer)
    return section
  }

  private createFiltersSection(): HTMLElement {
    const section = document.createElement('div')
    section.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.md} 0;
        color: ${colors.accent.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">🔍 Filters</h3>
    `

    const filtersContainer = document.createElement('div')
    filtersContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${spacing.md};
    `

    // Category filter
    const categoryFilter = document.createElement('div')
    categoryFilter.innerHTML = `
      <label style="
        display: block;
        color: ${colors.neutral.light};
        font-size: ${typography.fontSize.sm};
        margin-bottom: ${spacing.xs};
      ">Category</label>
      <select id="category-filter" style="
        width: 100%;
        background: ${colors.background.primaryGlow};
        color: ${colors.neutral.light};
        border: ${borders.width.thin} solid ${colors.border.primary};
        border-radius: ${borders.radius.md};
        padding: ${spacing.sm};
        font-size: ${typography.fontSize.sm};
      ">
        <option value="all">All Categories</option>
        <option value="ethical_decisions">Ethical Decisions</option>
        <option value="narrative_paths">Narrative Paths</option>
        <option value="skill_mastery">Skill Mastery</option>
        <option value="case_completion">Case Completion</option>
        <option value="consultation_mastery">Consultation Mastery</option>
        <option value="learning_progress">Learning Progress</option>
        <option value="social_learning">Social Learning</option>
        <option value="special_events">Special Events</option>
      </select>
    `

    const categorySelect = categoryFilter.querySelector('#category-filter') as HTMLSelectElement
    categorySelect.addEventListener('change', (e) => {
      this.currentFilter = (e.target as HTMLSelectElement).value as AchievementCategory | 'all'
      this.refreshAchievementList()
    })

    filtersContainer.appendChild(categoryFilter)

    // Rarity filter
    const rarityFilter = document.createElement('div')
    rarityFilter.innerHTML = `
      <label style="
        display: block;
        color: ${colors.neutral.light};
        font-size: ${typography.fontSize.sm};
        margin-bottom: ${spacing.xs};
      ">Rarity</label>
      <select id="rarity-filter" style="
        width: 100%;
        background: ${colors.background.primaryGlow};
        color: ${colors.neutral.light};
        border: ${borders.width.thin} solid ${colors.border.primary};
        border-radius: ${borders.radius.md};
        padding: ${spacing.sm};
        font-size: ${typography.fontSize.sm};
      ">
        <option value="all">All Rarities</option>
        <option value="common">Common</option>
        <option value="uncommon">Uncommon</option>
        <option value="rare">Rare</option>
        <option value="epic">Epic</option>
        <option value="legendary">Legendary</option>
      </select>
    `

    const raritySelect = rarityFilter.querySelector('#rarity-filter') as HTMLSelectElement
    raritySelect.addEventListener('change', (e) => {
      this.currentRarityFilter = (e.target as HTMLSelectElement).value as AchievementRarity | 'all'
      this.refreshAchievementList()
    })

    filtersContainer.appendChild(rarityFilter)

    section.appendChild(filtersContainer)
    return section
  }

  private createRecentSection(): HTMLElement {
    const section = document.createElement('div')
    section.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.md} 0;
        color: ${colors.info.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">🆕 Recent Unlocks</h3>
    `

    const stats = this.achievementSystem.getAchievementStats()
    const recentContainer = document.createElement('div')
    recentContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${spacing.sm};
    `

    if (stats.recentUnlocks.length === 0) {
      recentContainer.innerHTML = `
        <div style="
          text-align: center;
          color: ${colors.neutral.base};
          padding: ${spacing.lg};
        ">
          <div style="font-size: ${typography.fontSize.xl}; margin-bottom: ${spacing.sm};">🎯</div>
          <div>No achievements unlocked yet!</div>
        </div>
      `
    } else {
      stats.recentUnlocks.forEach(playerAchievement => {
        const achievement = AchievementDefinitions.getAchievementById(playerAchievement.achievementId)
        if (!achievement) return

        const recentItem = document.createElement('div')
        recentItem.style.cssText = `
          background: ${colors.background.infoGlow};
          border: ${borders.width.thin} solid ${colors.border.info};
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm};
          cursor: pointer;
          transition: all 0.3s ease;
        `

        recentItem.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            gap: ${spacing.sm};
          ">
            <span style="font-size: ${typography.fontSize.md};">${achievement.icon}</span>
            <div style="flex: 1;">
              <div style="
                font-weight: ${typography.fontWeight.bold};
                color: ${colors.info.base};
                font-size: ${typography.fontSize.sm};
              ">${achievement.name}</div>
              <div style="
                color: ${colors.neutral.base};
                font-size: ${typography.fontSize.xs};
              ">${new Date(playerAchievement.unlockedAt).toLocaleDateString()}</div>
            </div>
          </div>
        `

        recentItem.addEventListener('click', () => {
          this.focusOnAchievement(achievement.id)
        })

        recentContainer.appendChild(recentItem)
      })
    }

    section.appendChild(recentContainer)
    return section
  }

  private createAchievementList(container: HTMLElement): void {
    const achievements = this.getFilteredAchievements()
    
    if (achievements.length === 0) {
      container.innerHTML = `
        <div style="
          text-align: center;
          color: ${colors.neutral.base};
          padding: ${spacing.xl};
        ">
          <div style="font-size: ${typography.fontSize['2xl']}; margin-bottom: ${spacing.md};">🔍</div>
          <div>No achievements match your current filters.</div>
        </div>
      `
      return
    }

    // Group achievements by category
    const groupedAchievements = this.groupAchievementsByCategory(achievements)
    
    Object.entries(groupedAchievements).forEach(([category, categoryAchievements]) => {
      if (categoryAchievements.length === 0) return

      // Category header
      const categoryHeader = document.createElement('div')
      categoryHeader.style.cssText = `
        margin: ${spacing.xl} 0 ${spacing.lg} 0;
        padding-bottom: ${spacing.sm};
        border-bottom: ${borders.width.thin} solid ${colors.border.primary};
      `

      categoryHeader.innerHTML = `
        <h2 style="
          margin: 0;
          color: ${colors.primary.base};
          font-size: ${typography.fontSize.xl};
          font-weight: ${typography.fontWeight.bold};
          text-transform: capitalize;
        ">${category.replace(/_/g, ' ')}</h2>
      `

      container.appendChild(categoryHeader)

      // Achievement grid
      const achievementGrid = document.createElement('div')
      achievementGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: ${spacing.lg};
        margin-bottom: ${spacing.xl};
      `

      categoryAchievements.forEach(({ achievement, playerData }) => {
        const achievementCard = this.createAchievementCard(achievement, playerData)
        achievementGrid.appendChild(achievementCard)
      })

      container.appendChild(achievementGrid)
    })
  }

  private createAchievementCard(achievement: Achievement, playerData: PlayerAchievement): HTMLElement {
    const isCompleted = playerData.isCompleted
    const progress = this.achievementSystem.getAchievementProgress(achievement.id)
    
    const rarityColors = {
      common: colors.neutral.base,
      uncommon: colors.info.base,
      rare: colors.primary.base,
      epic: colors.accent.base,
      legendary: '#FFD700'
    }

    const card = document.createElement('div')
    card.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${isCompleted ? rarityColors[achievement.rarity] : colors.border.neutral};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: ${isCompleted ? '1' : '0.7'};
      position: relative;
      overflow: hidden;
    `

    // Add rarity glow for completed achievements
    if (isCompleted && (achievement.rarity === 'epic' || achievement.rarity === 'legendary')) {
      card.style.boxShadow = `0 0 20px ${rarityColors[achievement.rarity]}40`
    }

    card.innerHTML = `
      ${isCompleted ? `
        <div style="
          position: absolute;
          top: ${spacing.sm};
          right: ${spacing.sm};
          background: ${rarityColors[achievement.rarity]};
          color: ${colors.neutral.black};
          padding: ${spacing.xs} ${spacing.sm};
          border-radius: ${borders.radius.md};
          font-size: ${typography.fontSize.xs};
          font-weight: ${typography.fontWeight.bold};
          text-transform: uppercase;
        ">Unlocked</div>
      ` : ''}
      
      <div style="
        display: flex;
        align-items: center;
        gap: ${spacing.md};
        margin-bottom: ${spacing.md};
      ">
        <div style="
          font-size: 48px;
          filter: ${isCompleted ? `drop-shadow(0 0 8px ${rarityColors[achievement.rarity]})` : 'grayscale(1)'};
        ">${achievement.icon}</div>
        <div style="flex: 1;">
          <div style="
            font-weight: ${typography.fontWeight.bold};
            color: ${isCompleted ? rarityColors[achievement.rarity] : colors.neutral.base};
            font-size: ${typography.fontSize.lg};
            margin-bottom: ${spacing.xs};
          ">${achievement.name}</div>
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
            text-transform: capitalize;
          ">${achievement.rarity} • ${achievement.category.replace(/_/g, ' ')}</div>
        </div>
      </div>

      <div style="
        color: ${colors.neutral.light};
        font-size: ${typography.fontSize.sm};
        line-height: ${typography.lineHeight.relaxed};
        margin-bottom: ${spacing.md};
      ">${achievement.description}</div>

      ${this.config.showProgress && progress ? `
        <div style="margin-bottom: ${spacing.md};">
          <div style="
            display: flex;
            justify-content: space-between;
            font-size: ${typography.fontSize.xs};
            color: ${colors.neutral.base};
            margin-bottom: ${spacing.xs};
          ">
            <span>Progress</span>
            <span>${progress.currentProgress}/${progress.maxProgress}</span>
          </div>
          <div style="
            width: 100%;
            height: 6px;
            background: ${colors.background.panel};
            border-radius: 3px;
            overflow: hidden;
          ">
            <div style="
              width: ${progress.progressPercentage}%;
              height: 100%;
              background: ${isCompleted ? rarityColors[achievement.rarity] : colors.neutral.base};
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>
      ` : ''}

      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: ${typography.fontSize.sm};
      ">
        <div style="color: ${colors.neutral.base};">
          ${achievement.points} points
        </div>
        ${playerData.timesCompleted > 1 ? `
          <div style="
            background: ${colors.accent.base};
            color: ${colors.neutral.black};
            padding: ${spacing.xs} ${spacing.sm};
            border-radius: ${borders.radius.md};
            font-size: ${typography.fontSize.xs};
            font-weight: ${typography.fontWeight.bold};
          ">×${playerData.timesCompleted}</div>
        ` : ''}
      </div>

      ${achievement.prerequisites.length > 0 ? `
        <div style="
          margin-top: ${spacing.md};
          padding-top: ${spacing.md};
          border-top: ${borders.width.thin} solid ${colors.border.neutral};
        ">
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.xs};
            margin-bottom: ${spacing.xs};
          ">Prerequisites:</div>
          <div style="
            display: flex;
            flex-wrap: wrap;
            gap: ${spacing.xs};
          ">
            ${achievement.prerequisites.map(prereqId => {
              const prereq = AchievementDefinitions.getAchievementById(prereqId)
              const prereqData = this.achievementSystem.getPlayerAchievement(prereqId)
              return prereq ? `
                <span style="
                  background: ${prereqData?.isCompleted ? colors.background.primaryGlow : colors.background.panel};
                  color: ${prereqData?.isCompleted ? colors.primary.base : colors.neutral.base};
                  padding: ${spacing.xs};
                  border-radius: ${borders.radius.sm};
                  font-size: ${typography.fontSize.xs};
                ">${prereq.name}</span>
              ` : ''
            }).join('')}
          </div>
        </div>
      ` : ''}
    `

    // Add hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)'
      if (isCompleted) {
        card.style.boxShadow = `0 8px 25px ${rarityColors[achievement.rarity]}60`
      } else {
        card.style.boxShadow = `0 8px 25px ${colors.neutral.base}20`
      }
    })

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)'
      if (isCompleted && (achievement.rarity === 'epic' || achievement.rarity === 'legendary')) {
        card.style.boxShadow = `0 0 20px ${rarityColors[achievement.rarity]}40`
      } else {
        card.style.boxShadow = 'none'
      }
    })

    // Add click handler for detailed view
    card.addEventListener('click', () => {
      this.showAchievementDetails(achievement, playerData)
    })

    return card
  }

  private showAchievementDetails(achievement: Achievement, playerData: PlayerAchievement): void {
    // Create detailed achievement modal
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${colors.background.gradient.panel};
      color: ${colors.neutral.light};
      padding: ${spacing.xl};
      border-radius: ${borders.radius.lg};
      border: 2px solid ${colors.border.primary};
      max-width: 600px;
      width: 90vw;
      z-index: ${zIndex.modal + 1};
      box-shadow: ${effects.shadow.xl};
      backdrop-filter: ${effects.blur.lg};
    `

    const rarityColors = {
      common: colors.neutral.base,
      uncommon: colors.info.base,
      rare: colors.primary.base,
      epic: colors.accent.base,
      legendary: '#FFD700'
    }

    modal.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${spacing.lg};
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: ${spacing.md};
        ">
          <span style="
            font-size: 64px;
            filter: drop-shadow(0 0 12px ${rarityColors[achievement.rarity]});
          ">${achievement.icon}</span>
          <div>
            <h2 style="
              margin: 0;
              color: ${rarityColors[achievement.rarity]};
              font-size: ${typography.fontSize.xl};
            ">${achievement.name}</h2>
            <p style="
              margin: ${spacing.xs} 0 0 0;
              color: ${colors.neutral.base};
              text-transform: capitalize;
            ">${achievement.rarity} ${achievement.type} • ${achievement.category.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button id="close-achievement-details" style="
          background: transparent;
          color: ${colors.neutral.base};
          border: 1px solid ${colors.border.neutral};
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm};
          cursor: pointer;
          font-size: ${typography.fontSize.lg};
        ">✕</button>
      </div>

      <div style="margin-bottom: ${spacing.lg};">
        <p style="
          color: ${colors.neutral.light};
          line-height: ${typography.lineHeight.relaxed};
          margin: 0;
        ">${achievement.description}</p>
      </div>

      ${playerData.isCompleted ? `
        <div style="
          background: ${colors.background.primaryGlow};
          border: ${borders.width.thin} solid ${colors.border.primary};
          border-radius: ${borders.radius.md};
          padding: ${spacing.md};
          margin-bottom: ${spacing.lg};
          text-align: center;
        ">
          <div style="
            color: ${rarityColors[achievement.rarity]};
            font-weight: ${typography.fontWeight.bold};
            margin-bottom: ${spacing.sm};
          ">🎉 Achievement Unlocked!</div>
          <div style="color: ${colors.neutral.base};">
            Completed on ${new Date(playerData.unlockedAt).toLocaleDateString()}
          </div>
          ${playerData.timesCompleted > 1 ? `
            <div style="color: ${colors.accent.base}; margin-top: ${spacing.xs};">
              Completed ${playerData.timesCompleted} times
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: ${spacing.md};
        margin-bottom: ${spacing.lg};
      ">
        <div style="
          background: ${colors.background.gradient.primary};
          border: ${borders.width.thin} solid ${colors.border.neutral};
          border-radius: ${borders.radius.md};
          padding: ${spacing.md};
          text-align: center;
        ">
          <div style="
            color: ${colors.accent.base};
            font-size: ${typography.fontSize.lg};
            font-weight: ${typography.fontWeight.bold};
          ">${achievement.points}</div>
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
          ">Points</div>
        </div>
        <div style="
          background: ${colors.background.gradient.primary};
          border: ${borders.width.thin} solid ${colors.border.neutral};
          border-radius: ${borders.radius.md};
          padding: ${spacing.md};
          text-align: center;
        ">
          <div style="
            color: ${rarityColors[achievement.rarity]};
            font-size: ${typography.fontSize.lg};
            font-weight: ${typography.fontWeight.bold};
            text-transform: capitalize;
          ">${achievement.rarity}</div>
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
          ">Rarity</div>
        </div>
      </div>

      ${achievement.rewards.length > 0 ? `
        <div style="margin-bottom: ${spacing.lg};">
          <h3 style="
            margin: 0 0 ${spacing.md} 0;
            color: ${colors.neutral.light};
            font-size: ${typography.fontSize.md};
          ">Rewards</h3>
          <div style="
            display: flex;
            flex-direction: column;
            gap: ${spacing.sm};
          ">
            ${achievement.rewards.map(reward => `
              <div style="
                background: ${colors.background.primaryGlow};
                border-radius: ${borders.radius.md};
                padding: ${spacing.sm};
                display: flex;
                justify-content: space-between;
                align-items: center;
              ">
                <span style="color: ${colors.neutral.light};">${reward.description}</span>
                <span style="
                  color: ${colors.primary.base};
                  font-weight: ${typography.fontWeight.bold};
                ">${reward.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `

    // Add close functionality
    const closeButton = modal.querySelector('#close-achievement-details') as HTMLButtonElement
    closeButton.addEventListener('click', () => {
      modal.remove()
    })

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })

    document.body.appendChild(modal)
  }

  private createFooter(): void {
    if (!this.container) return

    const footer = document.createElement('div')
    footer.style.cssText = `
      padding: ${spacing.lg} ${spacing.xl};
      border-top: ${borders.width.thin} solid ${colors.border.primary};
      background: ${colors.background.gradient.primary};
      display: flex;
      justify-content: space-between;
      align-items: center;
    `

    const stats = this.achievementSystem.getAchievementStats()

    footer.innerHTML = `
      <div style="
        color: ${colors.neutral.base};
        font-size: ${typography.fontSize.sm};
      ">
        🏆 ${stats.completionPercentage.toFixed(1)}% complete • 
        ${stats.earnedPoints.toLocaleString()}/${stats.totalPoints.toLocaleString()} points
      </div>
      <div style="
        display: flex;
        gap: ${spacing.md};
      ">
        <button id="export-achievements" style="
          background: ${colors.accent.base};
          color: ${colors.neutral.black};
          border: none;
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.bold};
        ">📊 Export Progress</button>
      </div>
    `

    // Add export functionality
    const exportButton = footer.querySelector('#export-achievements') as HTMLButtonElement
    exportButton.addEventListener('click', () => {
      this.exportAchievementProgress()
    })

    this.container.appendChild(footer)
  }

  /**
   * Helper methods
   */
  private getFilteredAchievements(): { achievement: Achievement; playerData: PlayerAchievement }[] {
    let achievements = AchievementDefinitions.getAllAchievements()

    // Apply category filter
    if (this.currentFilter !== 'all') {
      achievements = achievements.filter(a => a.category === this.currentFilter)
    }

    // Apply rarity filter
    if (this.currentRarityFilter !== 'all') {
      achievements = achievements.filter(a => a.rarity === this.currentRarityFilter)
    }

    // Apply search filter
    if (this.searchQuery) {
      achievements = achievements.filter(a => 
        a.name.toLowerCase().includes(this.searchQuery) ||
        a.description.toLowerCase().includes(this.searchQuery)
      )
    }

    return achievements.map(achievement => ({
      achievement,
      playerData: this.achievementSystem.getPlayerAchievement(achievement.id)!
    }))
  }

  private groupAchievementsByCategory(achievements: { achievement: Achievement; playerData: PlayerAchievement }[]): Record<string, { achievement: Achievement; playerData: PlayerAchievement }[]> {
    const grouped: Record<string, { achievement: Achievement; playerData: PlayerAchievement }[]> = {}

    achievements.forEach(item => {
      const category = item.achievement.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(item)
    })

    // Sort each category by completion status and rarity
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        // Completed achievements first
        if (a.playerData.isCompleted !== b.playerData.isCompleted) {
          return a.playerData.isCompleted ? -1 : 1
        }
        
        // Then by rarity
        const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
        return rarityOrder[b.achievement.rarity] - rarityOrder[a.achievement.rarity]
      })
    })

    return grouped
  }

  private refreshAchievementList(): void {
    const achievementArea = this.container?.querySelector('#achievement-area') as HTMLElement
    if (achievementArea) {
      achievementArea.innerHTML = ''
      this.createAchievementList(achievementArea)
    }
  }

  private focusOnAchievement(achievementId: string): void {
    // Scroll to achievement in the list
    const achievementCards = this.container?.querySelectorAll('[style*="cursor: pointer"]')
    // This would need more sophisticated implementation to actually scroll to the specific achievement
  }

  private exportAchievementProgress(): void {
    const data = this.achievementSystem.exportAchievementData()
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `achievement-progress-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    
    console.log('🏆 Achievement progress exported')
  }

  /**
   * Public API methods
   */
  public isAchievementUIVisible(): boolean {
    return this.isVisible
  }

  public refreshUI(): void {
    if (this.isVisible) {
      this.refreshAchievementList()
    }
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    this.hide()
    console.log('🏆 Achievement UI destroyed')
  }
}