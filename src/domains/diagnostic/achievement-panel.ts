/**
 * Achievement Panel
 * Bottom-right panel for achievements, progress tracking, and performance metrics
 * 
 * CORE PRINCIPLES:
 * - ENHANCEMENT FIRST: Enhances existing AchievementSystem
 * - CLEAN: Separate from diagnostic panel
 * - MODULAR: Independent component
 * - DRY: Uses design tokens
 */

import { colors, spacing, typography, borders, effects, animation, zIndex } from '../../styles/design-tokens'
import { AchievementSystem } from './AchievementSystem'

export class AchievementPanel {
    private panel: HTMLElement | null = null
    private isMinimized: boolean = false
    private achievementSystem: AchievementSystem
    private performanceData: any = null

    constructor(achievementSystem: AchievementSystem) {
        this.achievementSystem = achievementSystem
        this.setupEventListeners()
    }

    private setupEventListeners() {
        // Listen for achievement events
        // This would need to be implemented in the AchievementSystem
    }

    show(performanceData?: any) {
        if (this.panel) return

        this.performanceData = performanceData
        this.createPanel()
    }

    private createPanel() {
        this.panel = document.createElement('div')
        this.panel.className = 'achievement-panel'
        this.panel.style.cssText = `
            position: fixed;
            bottom: ${spacing.xl};
            right: ${spacing.xl};
            width: 380px;
            max-height: 600px;
            background: ${colors.background.gradient.panel};
            border: ${borders.width.base} solid ${colors.primary.base};
            border-radius: ${borders.radius.xl};
            box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
            backdrop-filter: ${effects.blur.lg};
            z-index: ${zIndex.modal};
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideInFromRight ${animation.duration.slow} ${animation.easing.smooth};
        `

        this.panel.innerHTML = `
            <div class="panel-header" style="padding: ${spacing.base}; border-bottom: ${borders.width.thin} solid ${colors.border.primary}; display: flex; justify-content: space-between; align-items: center; background: ${colors.background.primaryGlow}; cursor: pointer;">
                <div>
                    <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.lg}; font-weight: ${typography.fontWeight.bold}; text-shadow: ${effects.textShadow.base};">🏆 Achievements</div>
                    <div style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.xs}; opacity: 0.8;">Progress & Performance</div>
                </div>
                <button id="minimize-btn" style="background: none; border: none; color: ${colors.primary.base}; font-size: ${typography.fontSize.xl}; cursor: pointer; padding: ${spacing.sm}; border-radius: ${borders.radius.full}; transition: all ${animation.duration.fast} ${animation.easing.smooth};">
                    ▼
                </button>
            </div>

            <div class="panel-content" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <!-- Performance Metrics -->
                <div id="performance-metrics" style="padding: ${spacing.base}; border-bottom: ${borders.width.thin} solid ${colors.border.primary}; background: ${colors.background.primaryGlow};">
                    ${this.renderPerformanceMetrics()}
                </div>

                <!-- Recent Achievements -->
                <div id="recent-achievements" style="flex: 1; padding: ${spacing.base}; overflow-y: auto; display: flex; flex-direction: column; gap: ${spacing.sm};">
                    <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.base}; margin-bottom: ${spacing.sm}; text-shadow: ${effects.textShadow.base};">Recent Unlocks</div>
                    ${this.renderRecentAchievements()}
                </div>

                <!-- Achievement Categories -->
                <div id="achievement-categories" style="padding: ${spacing.base}; border-top: ${borders.width.thin} solid ${colors.border.primary}; background: ${colors.background.accentGlow};">
                    ${this.renderAchievementCategories()}
                </div>
            </div>
        `

        document.body.appendChild(this.panel)
        this.setupPanelListeners()
        this.addAnimations()
    }

    private renderPerformanceMetrics(): string {
        if (!this.performanceData) {
            return `
                <div style="text-align: center; padding: ${spacing.md}; color: ${colors.neutral.base};">
                    <div style="font-size: ${typography.fontSize['2xl']}; margin-bottom: ${spacing.sm};">📊</div>
                    <div style="font-size: ${typography.fontSize.sm};">Waiting for performance data...</div>
                </div>
            `
        }

        return `
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.white}; line-height: ${typography.lineHeight.relaxed};">
                <div style="display: flex; justify-content: space-between; margin-bottom: ${spacing.sm};">
                    <div>
                        <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 2px;">Accuracy</div>
                        <div>${Math.round((this.performanceData.accuracy || 0) * 100)}%</div>
                    </div>
                    <div>
                        <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 2px;">Efficiency</div>
                        <div>${Math.round((this.performanceData.efficiency || 0) * 100)}%</div>
                    </div>
                    <div>
                        <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 2px;">Streak</div>
                        <div>${this.performanceData.streak || 0}</div>
                    </div>
                </div>
                <div>
                    <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 2px;">Achievements Unlocked</div>
                    <div>${this.performanceData.achievementsCount || 0}/${this.performanceData.totalAchievements || 0}</div>
                </div>
            </div>
        `
    }

    private renderRecentAchievements(): string {
        // This would be populated with actual achievement data
        return `
            <div style="text-align: center; padding: ${spacing.xl}; color: ${colors.neutral.base}; font-size: ${typography.fontSize.sm};">
                No achievements unlocked yet. Keep playing to earn your first one!
            </div>
        `
    }

    private renderAchievementCategories(): string {
        return `
            <div style="display: flex; justify-content: space-around; font-size: ${typography.fontSize.xs};">
                <div style="text-align: center;">
                    <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">Discovery</div>
                    <div style="color: ${colors.neutral.light};">0/5</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">Analysis</div>
                    <div style="color: ${colors.neutral.light};">0/4</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">Efficiency</div>
                    <div style="color: ${colors.neutral.light};">0/3</div>
                </div>
            </div>
        `
    }

    private setupPanelListeners() {
        if (!this.panel) return

        // Minimize/maximize button
        const minimizeBtn = this.panel.querySelector('#minimize-btn') as HTMLElement
        const header = this.panel.querySelector('.panel-header') as HTMLElement

        if (minimizeBtn && header) {
            header.addEventListener('click', () => this.toggleMinimize())
        }
    }

    private toggleMinimize() {
        if (!this.panel) return

        this.isMinimized = !this.isMinimized
        const content = this.panel.querySelector('.panel-content') as HTMLElement
        const minimizeBtn = this.panel.querySelector('#minimize-btn') as HTMLElement

        if (content && minimizeBtn) {
            if (this.isMinimized) {
                content.style.display = 'none'
                minimizeBtn.textContent = '▲'
                this.panel.style.maxHeight = 'auto'
            } else {
                content.style.display = 'flex'
                minimizeBtn.textContent = '▼'
                this.panel.style.maxHeight = '600px'
            }
        }
    }

    updatePerformanceData(performanceData: any) {
        this.performanceData = performanceData
        const performanceMetricsContainer = this.panel?.querySelector('#performance-metrics') as HTMLElement
        if (performanceMetricsContainer) {
            performanceMetricsContainer.innerHTML = this.renderPerformanceMetrics()
        }
    }

    showAchievementNotification(achievement: any) {
        // Show a temporary notification for unlocked achievements
        const notification = document.createElement('div')
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: ${spacing.sm};">
                <div style="font-size: ${typography.fontSize['3xl']};">${achievement.icon}</div>
                <div>
                    <div style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.lg};">ACHIEVEMENT UNLOCKED</div>
                    <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.md};">${achievement.name}</div>
                </div>
            </div>
        `

        notification.style.cssText = `
            position: fixed; 
            bottom: 100px; 
            right: 20px; 
            background: ${colors.background.gradient.panel};
            border: ${borders.width.base} solid ${colors.accent.base};
            border-radius: ${borders.radius.lg}; 
            padding: ${spacing.md} ${spacing.base};
            box-shadow: ${effects.shadow.lg}, ${effects.shadow.accentGlow};
            z-index: ${zIndex.notification}; 
            pointer-events: none;
            animation: achievementSlideIn 4s ${animation.easing.easeOut} forwards;
        `

        document.body.appendChild(notification)

        // Add CSS animation if not already present
        if (!document.querySelector('#achievement-notification-styles')) {
            const style = document.createElement('style')
            style.id = 'achievement-notification-styles'
            style.textContent = `
                @keyframes achievementSlideIn {
                    0% { transform: translateX(100%); opacity: 0; }
                    20%, 80% { transform: translateX(0); opacity: 1; }
                    100% { transform: translateX(100%); opacity: 0; }
                }
            `
            document.head.appendChild(style)
        }

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification)
            }
        }, 4000)
    }

    private addAnimations() {
        if (document.querySelector('#achievement-panel-animations')) return

        const style = document.createElement('style')
        style.id = 'achievement-panel-animations'
        style.textContent = `
            @keyframes slideInFromRight {
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
                .achievement-panel {
                    bottom: 1rem !important;
                    right: 1rem !important;
                    left: 1rem !important;
                    width: auto !important;
                    max-height: 400px !important;
                }
            }
        `
        document.head.appendChild(style)
    }

    hide() {
        if (this.panel && this.panel.parentNode) {
            this.panel.style.animation = `slideInFromRight ${animation.duration.base} ${animation.easing.smooth} reverse`
            setTimeout(() => {
                if (this.panel && this.panel.parentNode) {
                    this.panel.parentNode.removeChild(this.panel)
                }
                this.panel = null
            }, 300)
        }
    }

    destroy() {
        this.hide()
    }
}