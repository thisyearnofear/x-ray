/**
 * Analytics Dashboard
 * COMPREHENSIVE: Complete learning analytics visualization and insights
 * INTERACTIVE: Real-time updates and user-friendly interface
 * EDUCATIONAL: Actionable insights for learning improvement
 */

import { AnalyticsDataProcessor } from './AnalyticsDataProcessor'
import { ChartComponents } from './ChartComponents'
import { 
  AnalyticsTimeframe, 
  AnalyticsSummary, 
  LearningInsight, 
  SkillProgression,
  LearningRecommendation,
  ChartConfig,
  LineChartData,
  BarChartData,
  RadarChartData,
  PieChartData
} from './types'
import { EnhancedGameManager, EnhancedGameState } from '../diagnostic/EnhancedGameManager'
import { colors, spacing, typography, borders, effects, zIndex } from '../../styles/design-tokens'

export interface AnalyticsDashboardConfig {
  enableRealTimeUpdates: boolean
  updateInterval: number
  showRecommendations: boolean
  showComparisons: boolean
  defaultTimeframe: AnalyticsTimeframe
}

export class AnalyticsDashboard {
  private container: HTMLElement | null = null
  private dataProcessor: AnalyticsDataProcessor
  private enhancedGameManager: EnhancedGameManager | null = null
  private config: AnalyticsDashboardConfig
  private isVisible: boolean = false
  private updateInterval: number | null = null
  private currentTimeframe: AnalyticsTimeframe

  constructor(config: Partial<AnalyticsDashboardConfig> = {}) {
    this.config = {
      enableRealTimeUpdates: true,
      updateInterval: 5000, // 5 seconds
      showRecommendations: true,
      showComparisons: false,
      defaultTimeframe: {
        period: 'week',
        startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        endDate: Date.now()
      },
      ...config
    }

    this.currentTimeframe = this.config.defaultTimeframe
    this.dataProcessor = new AnalyticsDataProcessor()
    
    console.log('📊 Analytics Dashboard initialized')
  }

  /**
   * Initialize dashboard with enhanced game manager
   */
  public initialize(enhancedGameManager: EnhancedGameManager): void {
    this.enhancedGameManager = enhancedGameManager
    
    // Listen for game state updates
    if (this.config.enableRealTimeUpdates) {
      this.enhancedGameManager.addEventListener('state_updated', (event: any) => {
        this.handleGameStateUpdate(event.data)
      })
    }
  }

  /**
   * Show analytics dashboard
   */
  public show(): void {
    if (this.isVisible) return

    this.createDashboard()
    this.isVisible = true
    
    // Start real-time updates
    if (this.config.enableRealTimeUpdates) {
      this.startRealTimeUpdates()
    }
  }

  /**
   * Hide analytics dashboard
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

    this.stopRealTimeUpdates()
  }

  private createDashboard(): void {
    this.container = document.createElement('div')
    this.container.id = 'analytics-dashboard'
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

    header.innerHTML = `
      <div>
        <h1 style="
          margin: 0;
          color: ${colors.primary.base};
          font-size: ${typography.fontSize['3xl']};
          font-weight: ${typography.fontWeight.bold};
          text-shadow: ${effects.textShadow.sm};
        ">📊 Learning Analytics Dashboard</h1>
        <p style="
          margin: ${spacing.sm} 0 0 0;
          color: ${colors.neutral.base};
          font-size: ${typography.fontSize.md};
        ">Track your progress and improve your medical diagnostic skills</p>
      </div>
      <div style="display: flex; gap: ${spacing.md}; align-items: center;">
        <select id="timeframe-selector" style="
          background: ${colors.background.primaryGlow};
          color: ${colors.primary.base};
          border: ${borders.width.thin} solid ${colors.border.primary};
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${typography.fontSize.sm};
        ">
          <option value="day">Last 24 Hours</option>
          <option value="week" selected>Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="all">All Time</option>
        </select>
        <button id="export-data" style="
          background: ${colors.accent.base};
          color: ${colors.neutral.black};
          border: none;
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.lg};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.bold};
        ">Export Data</button>
        <button id="close-dashboard" style="
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
    const timeframeSelector = header.querySelector('#timeframe-selector') as HTMLSelectElement
    timeframeSelector.addEventListener('change', () => {
      this.updateTimeframe(timeframeSelector.value as any)
    })

    const exportButton = header.querySelector('#export-data') as HTMLButtonElement
    exportButton.addEventListener('click', () => {
      this.exportAnalyticsData()
    })

    const closeButton = header.querySelector('#close-dashboard') as HTMLButtonElement
    closeButton.addEventListener('click', () => {
      this.hide()
    })

    this.container.appendChild(header)
  }

  private createMainContent(): void {
    if (!this.container) return

    const mainContent = document.createElement('div')
    mainContent.style.cssText = `
      padding: ${spacing.xl};
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto;
      gap: ${spacing.xl};
      min-height: calc(100vh - 200px);
    `

    // Summary cards
    const summarySection = this.createSummarySection()
    summarySection.style.gridColumn = '1 / -1'
    mainContent.appendChild(summarySection)

    // Performance charts
    const performanceSection = this.createPerformanceSection()
    mainContent.appendChild(performanceSection)

    // Skills section
    const skillsSection = this.createSkillsSection()
    mainContent.appendChild(skillsSection)

    // Insights section
    const insightsSection = this.createInsightsSection()
    mainContent.appendChild(insightsSection)

    // Recommendations section
    const recommendationsSection = this.createRecommendationsSection()
    mainContent.appendChild(recommendationsSection)

    this.container.appendChild(mainContent)
  }

  private createSummarySection(): HTMLElement {
    const section = document.createElement('div')
    section.id = 'summary-section'
    section.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: ${spacing.lg};
    `

    const summary = this.dataProcessor.getAnalyticsSummary(this.currentTimeframe)
    const summaryCards = [
      { title: 'Total Sessions', value: summary.totalSessions, icon: '🎮', color: colors.primary.base },
      { title: 'Average Accuracy', value: `${(summary.averageAccuracy * 100).toFixed(1)}%`, icon: '🎯', color: colors.info.base },
      { title: 'Time Efficiency', value: `${(summary.averageEfficiency * 100).toFixed(1)}%`, icon: '⚡', color: colors.accent.base },
      { title: 'Cases Completed', value: summary.casesCompleted, icon: '📋', color: colors.primary.base },
      { title: 'Skills Improved', value: summary.skillsImproved, icon: '📈', color: colors.info.base },
      { title: 'Current Streak', value: `${summary.currentStreak} days`, icon: '🔥', color: colors.accent.base }
    ]

    summaryCards.forEach(card => {
      const cardElement = document.createElement('div')
      cardElement.style.cssText = `
        background: ${colors.background.gradient.primary};
        border: ${borders.width.thin} solid ${colors.border.primary};
        border-radius: ${borders.radius.lg};
        padding: ${spacing.lg};
        text-align: center;
        transition: all 0.3s ease;
      `

      cardElement.innerHTML = `
        <div style="font-size: ${typography.fontSize['2xl']}; margin-bottom: ${spacing.sm};">${card.icon}</div>
        <div style="
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          color: ${card.color};
          margin-bottom: ${spacing.xs};
        ">${card.value}</div>
        <div style="
          font-size: ${typography.fontSize.sm};
          color: ${colors.neutral.base};
        ">${card.title}</div>
      `

      cardElement.addEventListener('mouseenter', () => {
        cardElement.style.transform = 'translateY(-2px)'
        cardElement.style.boxShadow = `0 4px 12px ${card.color}40`
      })

      cardElement.addEventListener('mouseleave', () => {
        cardElement.style.transform = 'translateY(0)'
        cardElement.style.boxShadow = 'none'
      })

      section.appendChild(cardElement)
    })

    return section
  }

  private createPerformanceSection(): HTMLElement {
    const section = document.createElement('div')
    section.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    const header = document.createElement('h2')
    header.style.cssText = `
      margin: 0 0 ${spacing.lg} 0;
      color: ${colors.primary.base};
      font-size: ${typography.fontSize.xl};
      font-weight: ${typography.fontWeight.bold};
    `
    header.textContent = '📈 Performance Trends'
    section.appendChild(header)

    // Create performance chart
    const chartContainer = document.createElement('div')
    chartContainer.id = 'performance-chart'
    chartContainer.style.cssText = `
      width: 100%;
      height: 300px;
      margin-bottom: ${spacing.md};
    `

    const chartConfig: ChartConfig = {
      type: 'line',
      title: 'Performance Over Time',
      xAxisLabel: 'Time',
      yAxisLabel: 'Score',
      showLegend: true,
      showGrid: true,
      colors: [colors.primary.base, colors.info.base, colors.accent.base],
      width: 500,
      height: 300,
      responsive: true
    }

    const chartComponents = new ChartComponents(chartContainer, chartConfig)
    
    // Get performance data
    const accuracyData = this.dataProcessor.getPerformanceMetricsForChart('diagnostic_accuracy', this.currentTimeframe)
    const efficiencyData = this.dataProcessor.getPerformanceMetricsForChart('time_efficiency', this.currentTimeframe)
    const ethicalData = this.dataProcessor.getPerformanceMetricsForChart('ethical_alignment', this.currentTimeframe)

    const lineChartData: LineChartData = {
      datasets: [
        { label: 'Diagnostic Accuracy', data: accuracyData, color: colors.primary.base },
        { label: 'Time Efficiency', data: efficiencyData, color: colors.info.base },
        { label: 'Ethical Alignment', data: ethicalData, color: colors.accent.base }
      ]
    }

    const chart = chartComponents.createLineChart(lineChartData)
    chartContainer.appendChild(chart)
    section.appendChild(chartContainer)

    return section
  }

  private createSkillsSection(): HTMLElement {
    const section = document.createElement('div')
    section.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    const header = document.createElement('h2')
    header.style.cssText = `
      margin: 0 0 ${spacing.lg} 0;
      color: ${colors.primary.base};
      font-size: ${typography.fontSize.xl};
      font-weight: ${typography.fontWeight.bold};
    `
    header.textContent = '🌟 Skill Progression'
    section.appendChild(header)

    // Create skills radar chart
    const chartContainer = document.createElement('div')
    chartContainer.style.cssText = `
      width: 100%;
      height: 300px;
      margin-bottom: ${spacing.md};
    `

    const skills = this.dataProcessor.getSkillProgressions()
    if (skills.length > 0) {
      const chartConfig: ChartConfig = {
        type: 'radar',
        title: 'Skill Mastery',
        showLegend: false,
        showGrid: false,
        colors: [colors.primary.base],
        width: 400,
        height: 300,
        responsive: true
      }

      const chartComponents = new ChartComponents(chartContainer, chartConfig)
      
      const radarData: RadarChartData = {
        categories: skills.slice(0, 6).map(skill => skill.skillName),
        datasets: [{
          label: 'Current Level',
          data: skills.slice(0, 6).map(skill => skill.masteryPercentage / 100),
          color: colors.primary.base,
          fillOpacity: 0.3
        }]
      }

      const chart = chartComponents.createRadarChart(radarData)
      chartContainer.appendChild(chart)
    } else {
      chartContainer.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: ${colors.neutral.base};
          font-size: ${typography.fontSize.md};
        ">
          Start practicing to see your skill progression!
        </div>
      `
    }

    section.appendChild(chartContainer)

    // Skills list
    const skillsList = document.createElement('div')
    skillsList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${spacing.sm};
    `

    skills.slice(0, 5).forEach(skill => {
      const skillItem = document.createElement('div')
      skillItem.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${spacing.sm};
        background: ${colors.background.primaryGlow};
        border-radius: ${borders.radius.md};
      `

      skillItem.innerHTML = `
        <div>
          <div style="
            font-weight: ${typography.fontWeight.bold};
            color: ${colors.neutral.light};
            margin-bottom: ${spacing.xs};
          ">${skill.skillName}</div>
          <div style="
            font-size: ${typography.fontSize.xs};
            color: ${colors.neutral.base};
          ">Level ${skill.currentLevel} • ${skill.practiceCount} practices</div>
        </div>
        <div style="
          font-size: ${typography.fontSize.lg};
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.primary.base};
        ">${skill.masteryPercentage.toFixed(0)}%</div>
      `

      skillsList.appendChild(skillItem)
    })

    section.appendChild(skillsList)
    return section
  }

  private createInsightsSection(): HTMLElement {
    const section = document.createElement('div')
    section.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    const header = document.createElement('h2')
    header.style.cssText = `
      margin: 0 0 ${spacing.lg} 0;
      color: ${colors.primary.base};
      font-size: ${typography.fontSize.xl};
      font-weight: ${typography.fontWeight.bold};
    `
    header.textContent = '💡 Learning Insights'
    section.appendChild(header)

    const insights = this.dataProcessor.getRecentInsights(5)
    
    if (insights.length === 0) {
      section.innerHTML += `
        <div style="
          text-align: center;
          color: ${colors.neutral.base};
          padding: ${spacing.xl};
        ">
          <div style="font-size: ${typography.fontSize['2xl']}; margin-bottom: ${spacing.md};">🔍</div>
          <div>Complete more sessions to generate insights!</div>
        </div>
      `
      return section
    }

    const insightsList = document.createElement('div')
    insightsList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${spacing.md};
    `

    insights.forEach(insight => {
      const insightItem = document.createElement('div')
      const typeColors = {
        strength: colors.primary.base,
        improvement: colors.accent.base,
        recommendation: colors.info.base,
        achievement: colors.primary.base
      }

      const typeIcons = {
        strength: '💪',
        improvement: '📈',
        recommendation: '💡',
        achievement: '🏆'
      }

      insightItem.style.cssText = `
        padding: ${spacing.md};
        background: ${colors.background.primaryGlow};
        border-left: 4px solid ${typeColors[insight.type]};
        border-radius: ${borders.radius.md};
      `

      insightItem.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          margin-bottom: ${spacing.sm};
        ">
          <span style="font-size: ${typography.fontSize.md};">${typeIcons[insight.type]}</span>
          <span style="
            font-weight: ${typography.fontWeight.bold};
            color: ${typeColors[insight.type]};
            text-transform: capitalize;
          ">${insight.type}</span>
          <span style="
            font-size: ${typography.fontSize.xs};
            color: ${colors.neutral.base};
            margin-left: auto;
          ">${new Date(insight.timestamp).toLocaleDateString()}</span>
        </div>
        <div style="
          font-weight: ${typography.fontWeight.bold};
          color: ${colors.neutral.light};
          margin-bottom: ${spacing.xs};
        ">${insight.title}</div>
        <div style="
          color: ${colors.neutral.base};
          font-size: ${typography.fontSize.sm};
          line-height: ${typography.lineHeight.relaxed};
        ">${insight.description}</div>
      `

      insightsList.appendChild(insightItem)
    })

    section.appendChild(insightsList)
    return section
  }

  private createRecommendationsSection(): HTMLElement {
    const section = document.createElement('div')
    section.style.cssText = `
      background: ${colors.background.gradient.primary};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.lg};
    `

    const header = document.createElement('h2')
    header.style.cssText = `
      margin: 0 0 ${spacing.lg} 0;
      color: ${colors.primary.base};
      font-size: ${typography.fontSize.xl};
      font-weight: ${typography.fontWeight.bold};
    `
    header.textContent = '🎯 Recommendations'
    section.appendChild(header)

    const recommendations = this.dataProcessor.generateRecommendations()
    
    if (recommendations.length === 0) {
      section.innerHTML += `
        <div style="
          text-align: center;
          color: ${colors.neutral.base};
          padding: ${spacing.xl};
        ">
          <div style="font-size: ${typography.fontSize['2xl']}; margin-bottom: ${spacing.md};">✨</div>
          <div>Great job! Keep practicing to unlock new recommendations.</div>
        </div>
      `
      return section
    }

    const recommendationsList = document.createElement('div')
    recommendationsList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${spacing.md};
    `

    recommendations.slice(0, 3).forEach(recommendation => {
      const recommendationItem = document.createElement('div')
      recommendationItem.style.cssText = `
        padding: ${spacing.md};
        background: ${colors.background.accentGlow};
        border: ${borders.width.thin} solid ${colors.border.accent};
        border-radius: ${borders.radius.md};
        cursor: pointer;
        transition: all 0.3s ease;
      `

      recommendationItem.innerHTML = `
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.sm};
        ">
          <div style="
            font-weight: ${typography.fontWeight.bold};
            color: ${colors.accent.base};
          ">${recommendation.title}</div>
          <div style="
            background: ${colors.accent.base};
            color: ${colors.neutral.black};
            padding: ${spacing.xs} ${spacing.sm};
            border-radius: ${borders.radius.md};
            font-size: ${typography.fontSize.xs};
            font-weight: ${typography.fontWeight.bold};
          ">${recommendation.difficulty}</div>
        </div>
        <div style="
          color: ${colors.neutral.light};
          margin-bottom: ${spacing.sm};
          font-size: ${typography.fontSize.sm};
          line-height: ${typography.lineHeight.relaxed};
        ">${recommendation.description}</div>
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: ${typography.fontSize.xs};
          color: ${colors.neutral.base};
        ">
          <span>⏱️ ${recommendation.estimatedTime} minutes</span>
          <span>🎯 ${recommendation.expectedBenefit}</span>
        </div>
      `

      recommendationItem.addEventListener('mouseenter', () => {
        recommendationItem.style.transform = 'translateY(-2px)'
        recommendationItem.style.boxShadow = `0 4px 12px ${colors.accent.base}40`
      })

      recommendationItem.addEventListener('mouseleave', () => {
        recommendationItem.style.transform = 'translateY(0)'
        recommendationItem.style.boxShadow = 'none'
      })

      recommendationsList.appendChild(recommendationItem)
    })

    section.appendChild(recommendationsList)
    return section
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
        Last updated: ${new Date().toLocaleString()}
      </div>
      <div style="
        display: flex;
        gap: ${spacing.md};
      ">
        <button id="refresh-data" style="
          background: ${colors.primary.base};
          color: ${colors.neutral.black};
          border: none;
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.bold};
        ">🔄 Refresh</button>
        <button id="settings" style="
          background: transparent;
          color: ${colors.neutral.base};
          border: ${borders.width.thin} solid ${colors.border.neutral};
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
        ">⚙️ Settings</button>
      </div>
    `

    // Add event listeners
    const refreshButton = footer.querySelector('#refresh-data') as HTMLButtonElement
    refreshButton.addEventListener('click', () => {
      this.refreshDashboard()
    })

    this.container.appendChild(footer)
  }

  /**
   * Event handlers and updates
   */
  private handleGameStateUpdate(gameState: EnhancedGameState): void {
    if (!this.isVisible) return

    // Process the new game state
    this.dataProcessor.processGameState(gameState, 'current_session')
    
    // Update dashboard if visible
    this.refreshDashboard()
  }

  private updateTimeframe(period: string): void {
    const now = Date.now()
    let startDate: number

    switch (period) {
      case 'day':
        startDate = now - 24 * 60 * 60 * 1000
        break
      case 'week':
        startDate = now - 7 * 24 * 60 * 60 * 1000
        break
      case 'month':
        startDate = now - 30 * 24 * 60 * 60 * 1000
        break
      case 'quarter':
        startDate = now - 90 * 24 * 60 * 60 * 1000
        break
      case 'all':
        startDate = 0
        break
      default:
        startDate = now - 7 * 24 * 60 * 60 * 1000
    }

    this.currentTimeframe = {
      period: period as any,
      startDate,
      endDate: now
    }

    this.refreshDashboard()
  }

  private refreshDashboard(): void {
    if (!this.container) return

    // Remove existing content
    const mainContent = this.container.querySelector('div:nth-child(2)')
    if (mainContent) {
      this.container.removeChild(mainContent)
    }

    // Recreate main content
    this.createMainContent()
  }

  private exportAnalyticsData(): void {
    const data = this.dataProcessor.exportData(this.currentTimeframe)
    
    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    
    console.log('📊 Analytics data exported')
  }

  private startRealTimeUpdates(): void {
    if (this.updateInterval) return

    this.updateInterval = window.setInterval(() => {
      if (this.enhancedGameManager && this.isVisible) {
        const gameState = this.enhancedGameManager.getGameState()
        this.handleGameStateUpdate(gameState)
      }
    }, this.config.updateInterval)
  }

  private stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Public API methods
   */
  public getAnalyticsSummary(): AnalyticsSummary {
    return this.dataProcessor.getAnalyticsSummary(this.currentTimeframe)
  }

  public getSkillProgressions(): SkillProgression[] {
    return this.dataProcessor.getSkillProgressions()
  }

  public getRecentInsights(): LearningInsight[] {
    return this.dataProcessor.getRecentInsights()
  }

  public getRecommendations(): LearningRecommendation[] {
    return this.dataProcessor.generateRecommendations()
  }

  public isDashboardVisible(): boolean {
    return this.isVisible
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    this.hide()
    this.stopRealTimeUpdates()
    
    console.log('📊 Analytics Dashboard destroyed')
  }
}