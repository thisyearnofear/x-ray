/**
 * Performance Comparison System
 * SOCIAL: Enables peer comparison and collaborative learning
 * MOTIVATIONAL: Leaderboards and performance benchmarks
 * EDUCATIONAL: Anonymous comparison to encourage improvement
 */

import { AnalyticsDataProcessor } from './AnalyticsDataProcessor'
import { AchievementSystem } from './AchievementSystem'
import { SkillProgression, AnalyticsSummary } from './types'
import { colors, spacing, typography, borders, effects, zIndex } from '../../styles/design-tokens'

export interface PerformanceMetric {
  id: string
  name: string
  value: number
  percentile: number
  rank: number
  totalParticipants: number
  category: 'diagnostic' | 'efficiency' | 'ethical' | 'skill' | 'overall'
}

export interface LeaderboardEntry {
  id: string
  displayName: string
  score: number
  rank: number
  badge?: string
  isCurrentUser: boolean
  achievements: number
  specialization?: string
}

export interface ComparisonData {
  userMetrics: PerformanceMetric[]
  peerAverages: Record<string, number>
  topPerformers: Record<string, number>
  improvementSuggestions: string[]
  strengthAreas: string[]
}

export interface SocialStats {
  totalUsers: number
  activeUsers: number
  averageProgress: number
  topAchievers: number
  collaborativeActions: number
}

export class PerformanceComparison {
  private analyticsDataProcessor: AnalyticsDataProcessor | null = null
  private achievementSystem: AchievementSystem | null = null
  private container: HTMLElement | null = null
  private isVisible: boolean = false
  private currentView: 'overview' | 'leaderboards' | 'comparison' = 'overview'
  
  // Mock data for demonstration (in real implementation, this would come from a backend)
  private mockPeerData = {
    totalUsers: 1247,
    activeUsers: 892,
    averageMetrics: {
      diagnosticAccuracy: 0.73,
      timeEfficiency: 0.68,
      ethicalAlignment: 0.81,
      consultationUsage: 0.45,
      casesCompleted: 12.3,
      skillsImproved: 8.7
    },
    topPercentileMetrics: {
      diagnosticAccuracy: 0.94,
      timeEfficiency: 0.89,
      ethicalAlignment: 0.96,
      consultationUsage: 0.78,
      casesCompleted: 47,
      skillsImproved: 23
    }
  }

  constructor() {
    console.log('📊 Performance Comparison System initialized')
  }

  /**
   * Initialize with required dependencies
   */
  public initialize(dependencies: {
    analyticsDataProcessor: AnalyticsDataProcessor
    achievementSystem: AchievementSystem
  }): void {
    this.analyticsDataProcessor = dependencies.analyticsDataProcessor
    this.achievementSystem = dependencies.achievementSystem

    console.log('📊 Performance Comparison System ready')
  }

  /**
   * Show performance comparison interface
   */
  public show(): void {
    if (this.isVisible) return

    this.createComparisonInterface()
    this.isVisible = true

    console.log('📊 Performance Comparison UI opened')
  }

  /**
   * Hide performance comparison interface
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

    console.log('📊 Performance Comparison UI closed')
  }

  private createComparisonInterface(): void {
    this.container = document.createElement('div')
    this.container.id = 'performance-comparison'
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
    
    // Create navigation tabs
    this.createNavigation()
    
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

    header.innerHTML = `
      <div>
        <h1 style="
          margin: 0;
          color: ${colors.primary.base};
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          text-shadow: ${effects.textShadow.sm};
        ">📊 Performance Comparison</h1>
        <p style="
          margin: ${spacing.sm} 0 0 0;
          color: ${colors.neutral.base};
          font-size: ${typography.fontSize.md};
        ">Compare your progress with peers and discover improvement opportunities</p>
      </div>
      <div style="display: flex; gap: ${spacing.md}; align-items: center;">
        <div style="
          background: ${colors.background.infoGlow};
          color: ${colors.info.base};
          padding: ${spacing.sm} ${spacing.md};
          border-radius: ${borders.radius.md};
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.bold};
        ">
          🌐 ${this.mockPeerData.activeUsers.toLocaleString()} Active Learners
        </div>
        <button id="close-comparison" style="
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

    // Add close functionality
    const closeButton = header.querySelector('#close-comparison') as HTMLButtonElement
    closeButton.addEventListener('click', () => {
      this.hide()
    })

    this.container.appendChild(header)
  }

  private createNavigation(): void {
    if (!this.container) return

    const navigation = document.createElement('div')
    navigation.style.cssText = `
      display: flex;
      background: ${colors.background.gradient.primary};
      border-bottom: ${borders.width.thin} solid ${colors.border.primary};
    `

    const tabs = [
      { id: 'overview', label: '📈 Overview', icon: '📈' },
      { id: 'leaderboards', label: '🏆 Leaderboards', icon: '🏆' },
      { id: 'comparison', label: '⚖️ Detailed Comparison', icon: '⚖️' }
    ]

    tabs.forEach(tab => {
      const tabButton = document.createElement('button')
      tabButton.id = `tab-${tab.id}`
      tabButton.style.cssText = `
        flex: 1;
        padding: ${spacing.lg};
        background: ${this.currentView === tab.id ? colors.background.primaryGlow : 'transparent'};
        color: ${this.currentView === tab.id ? colors.primary.base : colors.neutral.base};
        border: none;
        border-bottom: ${this.currentView === tab.id ? `3px solid ${colors.primary.base}` : '3px solid transparent'};
        cursor: pointer;
        font-size: ${typography.fontSize.md};
        font-weight: ${typography.fontWeight.bold};
        transition: all 0.3s ease;
      `

      tabButton.innerHTML = `${tab.icon} ${tab.label}`

      tabButton.addEventListener('click', () => {
        this.switchView(tab.id as any)
      })

      navigation.appendChild(tabButton)
    })

    this.container.appendChild(navigation)
  }

  private createMainContent(): void {
    if (!this.container) return

    const mainContent = document.createElement('div')
    mainContent.id = 'comparison-content'
    mainContent.style.cssText = `
      padding: ${spacing.xl};
      min-height: calc(100vh - 200px);
    `

    this.renderCurrentView(mainContent)
    this.container.appendChild(mainContent)
  }

  private renderCurrentView(container: HTMLElement): void {
    container.innerHTML = ''

    switch (this.currentView) {
      case 'overview':
        this.renderOverviewView(container)
        break
      case 'leaderboards':
        this.renderLeaderboardsView(container)
        break
      case 'comparison':
        this.renderComparisonView(container)
        break
    }
  }

  private renderOverviewView(container: HTMLElement): void {
    if (!this.analyticsDataProcessor) return

    const userSummary = this.analyticsDataProcessor.getAnalyticsSummary()
    const userMetrics = this.calculateUserMetrics(userSummary)

    // Performance overview cards
    const overviewGrid = document.createElement('div')
    overviewGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: ${spacing.lg};
      margin-bottom: ${spacing.xl};
    `

    userMetrics.forEach(metric => {
      const card = this.createMetricCard(metric)
      overviewGrid.appendChild(card)
    })

    container.appendChild(overviewGrid)

    // Strengths and improvements section
    const analysisSection = document.createElement('div')
    analysisSection.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${spacing.xl};
      margin-bottom: ${spacing.xl};
    `

    // Strengths
    const strengthsCard = this.createStrengthsCard(userMetrics)
    analysisSection.appendChild(strengthsCard)

    // Improvement opportunities
    const improvementsCard = this.createImprovementsCard(userMetrics)
    analysisSection.appendChild(improvementsCard)

    container.appendChild(analysisSection)

    // Community insights
    const communitySection = this.createCommunityInsights()
    container.appendChild(communitySection)
  }

  private renderLeaderboardsView(container: HTMLElement): void {
    const leaderboardsContainer = document.createElement('div')
    leaderboardsContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: ${spacing.xl};
    `

    // Different leaderboard categories
    const categories = [
      { id: 'overall', name: 'Overall Performance', icon: '🏆' },
      { id: 'diagnostic', name: 'Diagnostic Accuracy', icon: '🎯' },
      { id: 'efficiency', name: 'Time Efficiency', icon: '⚡' },
      { id: 'ethical', name: 'Ethical Decisions', icon: '⚖️' }
    ]

    categories.forEach(category => {
      const leaderboard = this.createLeaderboard(category)
      leaderboardsContainer.appendChild(leaderboard)
    })

    container.appendChild(leaderboardsContainer)
  }

  private renderComparisonView(container: HTMLElement): void {
    if (!this.analyticsDataProcessor) return

    const userSummary = this.analyticsDataProcessor.getAnalyticsSummary()
    const userSkills = this.analyticsDataProcessor.getSkillProgressions()

    // Detailed comparison charts
    const comparisonGrid = document.createElement('div')
    comparisonGrid.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${spacing.xl};
      margin-bottom: ${spacing.xl};
    `

    // Performance radar chart comparison
    const radarComparison = this.createRadarComparison(userSummary)
    comparisonGrid.appendChild(radarComparison)

    // Skill progression comparison
    const skillComparison = this.createSkillComparison(userSkills)
    comparisonGrid.appendChild(skillComparison)

    container.appendChild(comparisonGrid)

    // Detailed metrics table
    const metricsTable = this.createDetailedMetricsTable(userSummary)
    container.appendChild(metricsTable)
  }

  private createMetricCard(metric: PerformanceMetric): HTMLElement {
    const card = document.createElement('div')
    card.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
      transition: all 0.3s ease;
    `

    const percentileColor = metric.percentile >= 75 ? colors.primary.base :
                           metric.percentile >= 50 ? colors.accent.base :
                           metric.percentile >= 25 ? colors.info.base : colors.neutral.base

    card.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${spacing.md};
      ">
        <h3 style="
          margin: 0;
          color: ${colors.neutral.light};
          font-size: ${typography.fontSize.lg};
          font-weight: ${typography.fontWeight.bold};
        ">${metric.name}</h3>
        <div style="
          background: ${percentileColor}20;
          color: ${percentileColor};
          padding: ${spacing.xs} ${spacing.sm};
          border-radius: ${borders.radius.md};
          font-size: ${typography.fontSize.xs};
          font-weight: ${typography.fontWeight.bold};
        ">${this.getPercentileLabel(metric.percentile)}</div>
      </div>

      <div style="
        display: flex;
        align-items: baseline;
        gap: ${spacing.sm};
        margin-bottom: ${spacing.md};
      ">
        <div style="
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          color: ${percentileColor};
        ">${this.formatMetricValue(metric.value, metric.id)}</div>
        <div style="
          color: ${colors.neutral.base};
          font-size: ${typography.fontSize.sm};
        ">#{metric.rank} of ${metric.totalParticipants.toLocaleString()}</div>
      </div>

      <div style="
        width: 100%;
        height: 8px;
        background: ${colors.background.panel};
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: ${spacing.sm};
      ">
        <div style="
          width: ${metric.percentile}%;
          height: 100%;
          background: linear-gradient(90deg, ${percentileColor}, ${percentileColor}80);
          transition: width 0.3s ease;
        "></div>
      </div>

      <div style="
        display: flex;
        justify-content: space-between;
        font-size: ${typography.fontSize.xs};
        color: ${colors.neutral.base};
      ">
        <span>Bottom 25%</span>
        <span>Top 25%</span>
      </div>
    `

    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)'
      card.style.boxShadow = `0 4px 12px ${percentileColor}40`
    })

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)'
      card.style.boxShadow = 'none'
    })

    return card
  }

  private createStrengthsCard(metrics: PerformanceMetric[]): HTMLElement {
    const card = document.createElement('div')
    card.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    const strengths = metrics.filter(m => m.percentile >= 75).slice(0, 3)

    card.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.lg} 0;
        color: ${colors.primary.base};
        font-size: ${typography.fontSize.xl};
        font-weight: ${typography.fontWeight.bold};
      ">💪 Your Strengths</h3>

      ${strengths.length > 0 ? `
        <div style="
          display: flex;
          flex-direction: column;
          gap: ${spacing.md};
        ">
          ${strengths.map(strength => `
            <div style="
              background: ${colors.background.primaryGlow};
              border-radius: ${borders.radius.md};
              padding: ${spacing.md};
              border-left: 4px solid ${colors.primary.base};
            ">
              <div style="
                font-weight: ${typography.fontWeight.bold};
                color: ${colors.primary.base};
                margin-bottom: ${spacing.xs};
              ">${strength.name}</div>
              <div style="
                color: ${colors.neutral.light};
                font-size: ${typography.fontSize.sm};
              ">
                You're in the top ${100 - strength.percentile}% of learners in this area!
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="
          text-align: center;
          color: ${colors.neutral.base};
          padding: ${spacing.xl};
        ">
          <div style="font-size: ${typography.fontSize.xl}; margin-bottom: ${spacing.sm};">🌱</div>
          <div>Keep practicing to develop your strengths!</div>
        </div>
      `}
    `

    return card
  }

  private createImprovementsCard(metrics: PerformanceMetric[]): HTMLElement {
    const card = document.createElement('div')
    card.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    const improvements = metrics.filter(m => m.percentile < 50).slice(0, 3)

    card.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.lg} 0;
        color: ${colors.accent.base};
        font-size: ${typography.fontSize.xl};
        font-weight: ${typography.fontWeight.bold};
      ">🎯 Growth Opportunities</h3>

      ${improvements.length > 0 ? `
        <div style="
          display: flex;
          flex-direction: column;
          gap: ${spacing.md};
        ">
          ${improvements.map(improvement => `
            <div style="
              background: ${colors.background.accentGlow};
              border-radius: ${borders.radius.md};
              padding: ${spacing.md};
              border-left: 4px solid ${colors.accent.base};
            ">
              <div style="
                font-weight: ${typography.fontWeight.bold};
                color: ${colors.accent.base};
                margin-bottom: ${spacing.xs};
              ">${improvement.name}</div>
              <div style="
                color: ${colors.neutral.light};
                font-size: ${typography.fontSize.sm};
                margin-bottom: ${spacing.sm};
              ">
                Focus here to improve your ranking from #${improvement.rank}
              </div>
              <div style="
                background: ${colors.accent.base};
                color: ${colors.neutral.black};
                padding: ${spacing.xs} ${spacing.sm};
                border-radius: ${borders.radius.sm};
                font-size: ${typography.fontSize.xs};
                font-weight: ${typography.fontWeight.bold};
                display: inline-block;
              ">
                ${this.getImprovementSuggestion(improvement.id)}
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="
          text-align: center;
          color: ${colors.neutral.base};
          padding: ${spacing.xl};
        ">
          <div style="font-size: ${typography.fontSize.xl}; margin-bottom: ${spacing.sm};">🌟</div>
          <div>Great job! You're performing well across all areas.</div>
        </div>
      `}
    `

    return card
  }

  private createCommunityInsights(): HTMLElement {
    const section = document.createElement('div')
    section.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    section.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.lg} 0;
        color: ${colors.info.base};
        font-size: ${typography.fontSize.xl};
        font-weight: ${typography.fontWeight.bold};
      ">🌐 Community Insights</h3>

      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: ${spacing.lg};
      ">
        <div style="text-align: center;">
          <div style="
            font-size: ${typography.fontSize['2xl']};
            font-weight: ${typography.fontWeight.bold};
            color: ${colors.info.base};
            margin-bottom: ${spacing.xs};
          ">${this.mockPeerData.totalUsers.toLocaleString()}</div>
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
          ">Total Learners</div>
        </div>

        <div style="text-align: center;">
          <div style="
            font-size: ${typography.fontSize['2xl']};
            font-weight: ${typography.fontWeight.bold};
            color: ${colors.primary.base};
            margin-bottom: ${spacing.xs};
          ">${(this.mockPeerData.averageMetrics.diagnosticAccuracy * 100).toFixed(0)}%</div>
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
          ">Avg. Accuracy</div>
        </div>

        <div style="text-align: center;">
          <div style="
            font-size: ${typography.fontSize['2xl']};
            font-weight: ${typography.fontWeight.bold};
            color: ${colors.accent.base};
            margin-bottom: ${spacing.xs};
          ">${this.mockPeerData.averageMetrics.casesCompleted.toFixed(0)}</div>
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
          ">Avg. Cases</div>
        </div>

        <div style="text-align: center;">
          <div style="
            font-size: ${typography.fontSize['2xl']};
            font-weight: ${typography.fontWeight.bold};
            color: ${colors.info.base};
            margin-bottom: ${spacing.xs};
          ">${this.mockPeerData.averageMetrics.skillsImproved.toFixed(0)}</div>
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
          ">Avg. Skills</div>
        </div>
      </div>

      <div style="
        margin-top: ${spacing.lg};
        padding: ${spacing.md};
        background: ${colors.background.infoGlow};
        border-radius: ${borders.radius.md};
        text-align: center;
      ">
        <div style="
          color: ${colors.info.base};
          font-weight: ${typography.fontWeight.bold};
          margin-bottom: ${spacing.xs};
        ">💡 Community Tip</div>
        <div style="
          color: ${colors.neutral.light};
          font-size: ${typography.fontSize.sm};
        ">
          Top performers spend an average of 15 minutes per case and use consultation features 60% more often.
        </div>
      </div>
    `

    return section
  }

  private createLeaderboard(category: { id: string; name: string; icon: string }): HTMLElement {
    const leaderboard = document.createElement('div')
    leaderboard.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    // Generate mock leaderboard data
    const entries = this.generateMockLeaderboardData(category.id)

    leaderboard.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.lg} 0;
        color: ${colors.primary.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">${category.icon} ${category.name}</h3>

      <div style="
        display: flex;
        flex-direction: column;
        gap: ${spacing.sm};
      ">
        ${entries.map((entry, index) => `
          <div style="
            display: flex;
            align-items: center;
            gap: ${spacing.md};
            padding: ${spacing.md};
            background: ${entry.isCurrentUser ? colors.background.primaryGlow : colors.background.panel};
            border: ${entry.isCurrentUser ? `2px solid ${colors.primary.base}` : `1px solid ${colors.border.neutral}`};
            border-radius: ${borders.radius.md};
            ${entry.isCurrentUser ? `box-shadow: 0 0 12px ${colors.primary.base}40;` : ''}
          ">
            <div style="
              width: 32px;
              height: 32px;
              background: ${this.getRankColor(entry.rank)};
              color: ${colors.neutral.black};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: ${typography.fontWeight.bold};
              font-size: ${typography.fontSize.sm};
            ">${entry.rank}</div>
            
            <div style="flex: 1;">
              <div style="
                font-weight: ${typography.fontWeight.bold};
                color: ${entry.isCurrentUser ? colors.primary.base : colors.neutral.light};
                margin-bottom: ${spacing.xs};
              ">
                ${entry.displayName} ${entry.isCurrentUser ? '(You)' : ''}
              </div>
              <div style="
                color: ${colors.neutral.base};
                font-size: ${typography.fontSize.xs};
              ">
                ${entry.achievements} achievements ${entry.specialization ? `• ${entry.specialization}` : ''}
              </div>
            </div>
            
            <div style="
              font-size: ${typography.fontSize.lg};
              font-weight: ${typography.fontWeight.bold};
              color: ${this.getRankColor(entry.rank)};
            ">${entry.score.toFixed(1)}</div>
            
            ${entry.badge ? `
              <div style="font-size: ${typography.fontSize.md};">${entry.badge}</div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div style="
        margin-top: ${spacing.md};
        text-align: center;
        color: ${colors.neutral.base};
        font-size: ${typography.fontSize.xs};
      ">
        Updated every hour • Anonymous rankings
      </div>
    `

    return leaderboard
  }

  private createRadarComparison(userSummary: AnalyticsSummary): HTMLElement {
    const container = document.createElement('div')
    container.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    container.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.lg} 0;
        color: ${colors.primary.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">📊 Performance Radar</h3>
      
      <div style="
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${colors.neutral.base};
      ">
        <div style="text-align: center;">
          <div style="font-size: ${typography.fontSize.xl}; margin-bottom: ${spacing.sm};">📈</div>
          <div>Interactive radar chart comparing your performance<br>with peer averages and top performers</div>
        </div>
      </div>
    `

    return container
  }

  private createSkillComparison(userSkills: SkillProgression[]): HTMLElement {
    const container = document.createElement('div')
    container.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    container.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.lg} 0;
        color: ${colors.info.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">🎯 Skill Comparison</h3>
      
      <div style="
        display: flex;
        flex-direction: column;
        gap: ${spacing.md};
      ">
        ${userSkills.slice(0, 5).map(skill => {
          const peerAverage = Math.random() * 80 + 10 // Mock peer average
          const isAboveAverage = skill.masteryPercentage > peerAverage
          
          return `
            <div style="
              background: ${colors.background.panel};
              border-radius: ${borders.radius.md};
              padding: ${spacing.md};
            ">
              <div style="
                display: flex;
                justify-content: space-between;
                margin-bottom: ${spacing.sm};
              ">
                <span style="
                  font-weight: ${typography.fontWeight.bold};
                  color: ${colors.neutral.light};
                ">${skill.skillName}</span>
                <span style="
                  color: ${isAboveAverage ? colors.primary.base : colors.accent.base};
                  font-size: ${typography.fontSize.xs};
                ">
                  ${isAboveAverage ? '↗️ Above Average' : '↙️ Below Average'}
                </span>
              </div>
              
              <div style="
                display: flex;
                gap: ${spacing.sm};
                margin-bottom: ${spacing.xs};
              ">
                <div style="flex: 1;">
                  <div style="
                    font-size: ${typography.fontSize.xs};
                    color: ${colors.neutral.base};
                    margin-bottom: ${spacing.xs};
                  ">You: ${skill.masteryPercentage.toFixed(0)}%</div>
                  <div style="
                    width: 100%;
                    height: 4px;
                    background: ${colors.background.panel};
                    border-radius: 2px;
                    overflow: hidden;
                  ">
                    <div style="
                      width: ${skill.masteryPercentage}%;
                      height: 100%;
                      background: ${colors.primary.base};
                    "></div>
                  </div>
                </div>
                
                <div style="flex: 1;">
                  <div style="
                    font-size: ${typography.fontSize.xs};
                    color: ${colors.neutral.base};
                    margin-bottom: ${spacing.xs};
                  ">Peers: ${peerAverage.toFixed(0)}%</div>
                  <div style="
                    width: 100%;
                    height: 4px;
                    background: ${colors.background.panel};
                    border-radius: 2px;
                    overflow: hidden;
                  ">
                    <div style="
                      width: ${peerAverage}%;
                      height: 100%;
                      background: ${colors.neutral.base};
                    "></div>
                  </div>
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>
    `

    return container
  }

  private createDetailedMetricsTable(userSummary: AnalyticsSummary): HTMLElement {
    const table = document.createElement('div')
    table.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    const metrics = this.calculateUserMetrics(userSummary)

    table.innerHTML = `
      <h3 style="
        margin: 0 0 ${spacing.lg} 0;
        color: ${colors.accent.base};
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
      ">📋 Detailed Metrics</h3>
      
      <div style="
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
        gap: ${spacing.md};
        font-size: ${typography.fontSize.sm};
      ">
        <div style="
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.neutral.light};
          padding: ${spacing.sm};
          border-bottom: 2px solid ${colors.border.primary};
        ">Metric</div>
        <div style="
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.neutral.light};
          padding: ${spacing.sm};
          border-bottom: 2px solid ${colors.border.primary};
          text-align: center;
        ">Your Score</div>
        <div style="
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.neutral.light};
          padding: ${spacing.sm};
          border-bottom: 2px solid ${colors.border.primary};
          text-align: center;
        ">Peer Avg</div>
        <div style="
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.neutral.light};
          padding: ${spacing.sm};
          border-bottom: 2px solid ${colors.border.primary};
          text-align: center;
        ">Top 10%</div>
        <div style="
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.neutral.light};
          padding: ${spacing.sm};
          border-bottom: 2px solid ${colors.border.primary};
          text-align: center;
        ">Rank</div>
        
        ${metrics.map(metric => {
          const peerAvg = this.mockPeerData.averageMetrics[metric.id as keyof typeof this.mockPeerData.averageMetrics] || 0
          const topPercentile = this.mockPeerData.topPercentileMetrics[metric.id as keyof typeof this.mockPeerData.topPercentileMetrics] || 0
          
          return `
            <div style="
              padding: ${spacing.sm};
              color: ${colors.neutral.light};
            ">${metric.name}</div>
            <div style="
              padding: ${spacing.sm};
              text-align: center;
              font-weight: ${typography.fontWeight.bold};
              color: ${this.getMetricColor(metric.percentile)};
            ">${this.formatMetricValue(metric.value, metric.id)}</div>
            <div style="
              padding: ${spacing.sm};
              text-align: center;
              color: ${colors.neutral.base};
            ">${this.formatMetricValue(peerAvg, metric.id)}</div>
            <div style="
              padding: ${spacing.sm};
              text-align: center;
              color: ${colors.neutral.base};
            ">${this.formatMetricValue(topPercentile, metric.id)}</div>
            <div style="
              padding: ${spacing.sm};
              text-align: center;
              font-weight: ${typography.fontWeight.bold};
              color: ${this.getMetricColor(metric.percentile)};
            ">#${metric.rank}</div>
          `
        }).join('')}
      </div>
    `

    return table
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

    footer.innerHTML = `
      <div style="
        color: ${colors.neutral.base};
        font-size: ${typography.fontSize.sm};
      ">
        🔒 All comparisons are anonymous • Data updated hourly
      </div>
      <div style="
        display: flex;
        gap: ${spacing.md};
      ">
        <button id="export-comparison" style="
          background: ${colors.accent.base};
          color: ${colors.neutral.black};
          border: none;
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.bold};
        ">📊 Export Report</button>
      </div>
    `

    // Add export functionality
    const exportButton = footer.querySelector('#export-comparison') as HTMLButtonElement
    exportButton.addEventListener('click', () => {
      this.exportComparisonReport()
    })

    this.container.appendChild(footer)
  }

  /**
   * Helper methods
   */
  private calculateUserMetrics(userSummary: AnalyticsSummary): PerformanceMetric[] {
    return [
      {
        id: 'diagnosticAccuracy',
        name: 'Diagnostic Accuracy',
        value: userSummary.averageAccuracy,
        percentile: this.calculatePercentile(userSummary.averageAccuracy, 'diagnosticAccuracy'),
        rank: this.calculateRank(userSummary.averageAccuracy, 'diagnosticAccuracy'),
        totalParticipants: this.mockPeerData.totalUsers,
        category: 'diagnostic'
      },
      {
        id: 'timeEfficiency',
        name: 'Time Efficiency',
        value: userSummary.averageEfficiency,
        percentile: this.calculatePercentile(userSummary.averageEfficiency, 'timeEfficiency'),
        rank: this.calculateRank(userSummary.averageEfficiency, 'timeEfficiency'),
        totalParticipants: this.mockPeerData.totalUsers,
        category: 'efficiency'
      },
      {
        id: 'casesCompleted',
        name: 'Cases Completed',
        value: userSummary.casesCompleted,
        percentile: this.calculatePercentile(userSummary.casesCompleted, 'casesCompleted'),
        rank: this.calculateRank(userSummary.casesCompleted, 'casesCompleted'),
        totalParticipants: this.mockPeerData.totalUsers,
        category: 'overall'
      },
      {
        id: 'skillsImproved',
        name: 'Skills Improved',
        value: userSummary.skillsImproved,
        percentile: this.calculatePercentile(userSummary.skillsImproved, 'skillsImproved'),
        rank: this.calculateRank(userSummary.skillsImproved, 'skillsImproved'),
        totalParticipants: this.mockPeerData.totalUsers,
        category: 'skill'
      }
    ]
  }

  private calculatePercentile(value: number, metricId: string): number {
    const average = this.mockPeerData.averageMetrics[metricId as keyof typeof this.mockPeerData.averageMetrics] || 0
    const topPercentile = this.mockPeerData.topPercentileMetrics[metricId as keyof typeof this.mockPeerData.topPercentileMetrics] || 1
    
    // Simple percentile calculation based on position relative to average and top performers
    if (value >= topPercentile) return 95
    if (value >= average) return 50 + ((value - average) / (topPercentile - average)) * 45
    return (value / average) * 50
  }

  private calculateRank(value: number, metricId: string): number {
    const percentile = this.calculatePercentile(value, metricId)
    return Math.floor(this.mockPeerData.totalUsers * (100 - percentile) / 100) + 1
  }

  private generateMockLeaderboardData(categoryId: string): LeaderboardEntry[] {
    const names = ['Alex M.', 'Jordan K.', 'Sam R.', 'Casey L.', 'Taylor P.', 'Morgan D.', 'Riley C.', 'Avery S.', 'Quinn T.', 'You']
    const specializations = ['Cardiology', 'Neurology', 'Emergency Med', 'Internal Med', 'Pediatrics', 'Surgery']
    
    return names.map((name, index) => ({
      id: `user_${index}`,
      displayName: name,
      score: 95 - (index * 3) + Math.random() * 2,
      rank: index + 1,
      badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : undefined,
      isCurrentUser: name === 'You',
      achievements: Math.floor(Math.random() * 20) + 5,
      specialization: index < 9 ? specializations[Math.floor(Math.random() * specializations.length)] : undefined
    }))
  }

  private switchView(view: 'overview' | 'leaderboards' | 'comparison'): void {
    this.currentView = view
    
    // Update tab styling
    const tabs = this.container?.querySelectorAll('[id^="tab-"]')
    tabs?.forEach(tab => {
      const tabId = tab.id.replace('tab-', '')
      const isActive = tabId === view
      
      ;(tab as HTMLElement).style.background = isActive ? colors.background.primaryGlow : 'transparent'
      ;(tab as HTMLElement).style.color = isActive ? colors.primary.base : colors.neutral.base
      ;(tab as HTMLElement).style.borderBottom = isActive ? `3px solid ${colors.primary.base}` : '3px solid transparent'
    })
    
    // Update content
    const contentContainer = this.container?.querySelector('#comparison-content') as HTMLElement
    if (contentContainer) {
      this.renderCurrentView(contentContainer)
    }
  }

  private getPercentileLabel(percentile: number): string {
    if (percentile >= 90) return 'Top 10%'
    if (percentile >= 75) return 'Top 25%'
    if (percentile >= 50) return 'Above Avg'
    if (percentile >= 25) return 'Below Avg'
    return 'Bottom 25%'
  }

  private formatMetricValue(value: number, metricId: string): string {
    if (metricId.includes('Accuracy') || metricId.includes('Efficiency') || metricId.includes('Usage')) {
      return `${(value * 100).toFixed(1)}%`
    }
    return value.toFixed(1)
  }

  private getMetricColor(percentile: number): string {
    if (percentile >= 75) return colors.primary.base
    if (percentile >= 50) return colors.accent.base
    if (percentile >= 25) return colors.info.base
    return colors.neutral.base
  }

  private getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700' // Gold
    if (rank === 2) return '#C0C0C0' // Silver
    if (rank === 3) return '#CD7F32' // Bronze
    if (rank <= 10) return colors.primary.base
    return colors.neutral.base
  }

  private getImprovementSuggestion(metricId: string): string {
    const suggestions = {
      diagnosticAccuracy: 'Practice more cases',
      timeEfficiency: 'Use investigation tools',
      ethicalAlignment: 'Review ethics cases',
      consultationUsage: 'Try specialist consultations',
      casesCompleted: 'Set daily goals',
      skillsImproved: 'Focus on skill tree'
    }
    
    return suggestions[metricId as keyof typeof suggestions] || 'Keep practicing'
  }

  private exportComparisonReport(): void {
    if (!this.analyticsDataProcessor) return

    const userSummary = this.analyticsDataProcessor.getAnalyticsSummary()
    const userMetrics = this.calculateUserMetrics(userSummary)
    
    const report = {
      generatedAt: new Date().toISOString(),
      userMetrics,
      peerComparison: this.mockPeerData,
      recommendations: userMetrics.filter(m => m.percentile < 50).map(m => this.getImprovementSuggestion(m.id)),
      strengths: userMetrics.filter(m => m.percentile >= 75).map(m => m.name)
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-comparison-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    
    console.log('📊 Performance comparison report exported')
  }

  /**
   * Public API methods
   */
  public isComparisonVisible(): boolean {
    return this.isVisible
  }

  public getCurrentView(): string {
    return this.currentView
  }

  public refreshData(): void {
    if (this.isVisible) {
      const contentContainer = this.container?.querySelector('#comparison-content') as HTMLElement
      if (contentContainer) {
        this.renderCurrentView(contentContainer)
      }
    }
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    this.hide()
    console.log('📊 Performance Comparison System destroyed')
  }
}