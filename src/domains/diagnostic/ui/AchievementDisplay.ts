/**
 * Achievement Display Component
 * MODULAR: Single responsibility for achievement visualization
 * DRY: Centralized achievement rendering
 * CLEAN: Pure UI component, no business logic
 */

import { colors, spacing, typography, borders, effects, zIndex } from '../../../styles/design-tokens'

export interface AchievementData {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  progress?: number
}

export interface PerformanceMetrics {
accuracy: number
efficiency: number
streak: number
discoveryStreak?: number
achievementsCount: number
  totalAchievements: number
}

export class AchievementDisplay {
  private element: HTMLElement | null = null
  private isMinimized: boolean = false
  private onRevealConditions?: () => void
  private onCaseHub?: () => void

  setCallbacks(callbacks: { onRevealConditions?: () => void; onCaseHub?: () => void }): void {
    this.onRevealConditions = callbacks.onRevealConditions
    this.onCaseHub = callbacks.onCaseHub
  }

  create(): HTMLElement {
    this.element = document.createElement('div')
    this.element.className = 'achievement-display'
    this.element.style.cssText = `
      position: fixed;
      bottom: ${spacing.xl};
      right: ${spacing.xl};
      width: 380px;
      max-height: 600px;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.primary.base};
      border-radius: ${borders.radius.xl};
      box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
      backdrop-filter: ${effects.blur.base};
      z-index: ${zIndex.panel};
      transition: all 0.3s ease;
      overflow: hidden;
    `

    this.element.innerHTML = this.generateHTML()
    this.setupInteractivity()
    this.addStyles()
    return this.element
  }

  updatePerformance(metrics: PerformanceMetrics): void {
    if (!this.element) return

    const accuracyElement = this.element.querySelector('#accuracy-value')
    const efficiencyElement = this.element.querySelector('#efficiency-value')
    const streakElement = this.element.querySelector('#streak-value')
    const progressElement = this.element.querySelector('#achievement-progress')

    if (accuracyElement) accuracyElement.textContent = `${Math.round(metrics.accuracy * 100)}%`
    if (efficiencyElement) efficiencyElement.textContent = `${Math.round(metrics.efficiency * 100)}%`
    if (streakElement) streakElement.textContent = metrics.streak.toString()

    const discoveryStreakElement = this.element.querySelector('#discovery-streak-value')
    if (discoveryStreakElement) discoveryStreakElement.textContent = (metrics.discoveryStreak || 0).toString()
    if (progressElement) {
      progressElement.textContent = `${metrics.achievementsCount}/${metrics.totalAchievements}`
    }
  }

  showAchievementNotification(achievement: AchievementData): void {
    const notification = document.createElement('div')
    notification.className = 'achievement-notification'
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20%;
        right: ${spacing.xl};
        background: ${colors.background.gradient.panel};
        border: ${borders.width.base} solid ${colors.accent.base};
        border-radius: ${borders.radius.lg};
        padding: ${spacing.base};
        box-shadow: ${effects.shadow.lg}, ${effects.shadow.accentGlow};
        z-index: ${zIndex.notification};
        animation: slideInRight 0.5s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize['2xl']};">${achievement.icon}</div>
          <div>
            <div style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold};">
              Achievement Unlocked!
            </div>
            <div style="color: ${colors.neutral.white}; font-size: ${typography.fontSize.sm};">
              ${achievement.name}
            </div>
            <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.xs};">
              +${achievement.points} points
            </div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 4000)
  }

  minimize(): void {
    if (!this.element) return
    
    this.isMinimized = true
    this.element.style.height = '60px'
    this.element.style.width = '200px'
    
    const content = this.element.querySelector('.panel-content') as HTMLElement
    if (content) content.style.display = 'none'
  }

  restore(): void {
    if (!this.element) return
    
    this.isMinimized = false
    this.element.style.height = 'auto'
    this.element.style.width = '380px'
    
    const content = this.element.querySelector('.panel-content') as HTMLElement
    if (content) content.style.display = 'flex'
  }

  private generateHTML(): string {
    return `
      <div class="panel-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${spacing.base};
        border-bottom: ${borders.width.thin} solid ${colors.border.primary};
        cursor: pointer;
      ">
        <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">
          🏆 ACHIEVEMENTS
        </div>
        <div class="minimize-btn" style="
          color: ${colors.primary.base};
          cursor: pointer;
          padding: ${spacing.xs};
          border-radius: ${borders.radius.full};
          transition: all 0.2s ease;
        ">
          ${this.isMinimized ? '▲' : '▼'}
        </div>
      </div>

      <div class="panel-content" style="
        display: flex;
        flex-direction: column;
        padding: ${spacing.base};
        gap: ${spacing.sm};
      ">
        <div class="performance-metrics" style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${spacing.sm};
          margin-bottom: ${spacing.base};
        ">
          <div class="metric-card">
            <div style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.xs};">Accuracy</div>
            <div id="accuracy-value" style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">0%</div>
          </div>
          <div class="metric-card">
            <div style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.xs};">Efficiency</div>
            <div id="efficiency-value" style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold};">0%</div>
          </div>
          <div class="metric-card">
            <div style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.xs};">Streak</div>
            <div id="streak-value" style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">0</div>
          </div>
          <div class="metric-card">
            <div style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.xs};">Progress</div>
            <div id="achievement-progress" style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold};">0/0</div>
          </div>
        </div>

        <div class="quick-actions" style="
        background: rgba(100,100,255,0.05);
        border-radius: ${borders.radius.md};
        padding: ${spacing.sm};
          margin-bottom: ${spacing.sm};
        ">
        <div style="display: flex; flex-direction: column; gap: ${spacing.xs};">
          <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.xs};">🔥 Discovery Streak</div>
              <div id="discovery-streak-value" style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold};">0</div>
            </div>
            <button id="reveal-conditions-btn" style="
              background: linear-gradient(135deg, ${colors.primary.base} 0%, ${colors.primary.dark} 100%);
              color: ${colors.neutral.black};
              border: none;
              padding: ${spacing.xs} ${spacing.sm};
              border-radius: ${borders.radius.md};
              font-size: ${typography.fontSize.sm};
              cursor: pointer;
              width: 100%;
            ">
              🔍 Reveal Conditions
            </button>
            <button id="case-hub-btn" style="
              background: rgba(255,255,255,0.1);
              color: ${colors.neutral.white};
              border: ${borders.width.thin} solid rgba(255,255,255,0.3);
              padding: ${spacing.xs} ${spacing.sm};
              border-radius: ${borders.radius.md};
              font-size: ${typography.fontSize.sm};
              cursor: pointer;
              width: 100%;
            ">
              🎯 Case Hub
            </button>
          </div>
        </div>

        <div class="recent-achievements" style="
          background: rgba(0,255,136,0.05);
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm};
        ">
          <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.sm}; margin-bottom: ${spacing.xs};">
            Recent Achievements
          </div>
          <div id="achievement-list" style="
            max-height: 200px;
            overflow-y: auto;
            font-size: ${typography.fontSize.xs};
            color: ${colors.neutral.light};
          ">
            No achievements yet
          </div>
        </div>
      </div>
    `
  }

  private setupInteractivity(): void {
    if (!this.element) return

    const header = this.element.querySelector('.panel-header') as HTMLElement
    const minimizeBtn = this.element.querySelector('.minimize-btn') as HTMLElement
    const revealBtn = this.element.querySelector('#reveal-conditions-btn') as HTMLElement
    const caseHubBtn = this.element.querySelector('#case-hub-btn') as HTMLElement

    if (header) {
      header.addEventListener('click', () => {
        if (this.isMinimized) {
          this.restore()
        } else {
          this.minimize()
        }
      })
    }

    if (revealBtn && this.onRevealConditions) {
      revealBtn.addEventListener('click', this.onRevealConditions)
    }

    if (caseHubBtn && this.onCaseHub) {
      caseHubBtn.addEventListener('click', this.onCaseHub)
    }
  }

  private addStyles(): void {
    if (document.querySelector('#achievement-display-styles')) return

    const style = document.createElement('style')
    style.id = 'achievement-display-styles'
    style.textContent = `
      .metric-card {
        background: rgba(0,255,136,0.1);
        border-radius: ${borders.radius.sm};
        padding: ${spacing.xs};
        text-align: center;
      }

      .minimize-btn:hover {
        background: rgba(0,255,136,0.2);
        transform: scale(1.1);
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .achievement-display {
          bottom: ${spacing.base} !important;
          right: ${spacing.base} !important;
          left: ${spacing.base} !important;
          width: auto !important;
          max-height: 50vh !important;
        }
      }
    `
    document.head.appendChild(style)
  }

  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.element = null
  }
}