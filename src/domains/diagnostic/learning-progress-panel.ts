/**
 * Learning Progress Panel
 * Bottom-right panel for learning metrics, progress tracking, and contextual hints
 * 
 * CORE PRINCIPLES:
 * - ENHANCEMENT FIRST: Enhances existing LearningTracker
 * - CLEAN: Separate from diagnostic panel
 * - MODULAR: Independent component
 * - DRY: Uses design tokens
 */

import { colors, spacing, typography, borders, effects, animation, zIndex } from '../../styles/design-tokens'
import { LearningTracker } from './LearningTracker'

export class LearningProgressPanel {
    private panel: HTMLElement | null = null
    private isMinimized: boolean = false
    private learningTracker: LearningTracker
    private learningData: any = null
    private hintsData: Array<{ conditionId: string; hint: string; timestamp: Date }> = []

    constructor(learningTracker: LearningTracker) {
        this.learningTracker = learningTracker
        this.setupEventListeners()
    }

    private setupEventListeners() {
        // Listen for learning events
        // This would need to be implemented in the LearningTracker
    }

    show(learningData?: any) {
        if (this.panel) return

        this.learningData = learningData
        this.createPanel()
    }

    private createPanel() {
        this.panel = document.createElement('div')
        this.panel.className = 'learning-progress-panel'
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
                    <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.lg}; font-weight: ${typography.fontWeight.bold}; text-shadow: ${effects.textShadow.base};">📊 Learning Progress</div>
                    <div style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.xs}; opacity: 0.8;">Metrics & Hints</div>
                </div>
                <button id="minimize-btn" style="background: none; border: none; color: ${colors.primary.base}; font-size: ${typography.fontSize.xl}; cursor: pointer; padding: ${spacing.sm}; border-radius: ${borders.radius.full}; transition: all ${animation.duration.fast} ${animation.easing.smooth};">
                    ▼
                </button>
            </div>

            <div class="panel-content" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <!-- Learning Metrics -->
                <div id="learning-metrics" style="padding: ${spacing.base}; border-bottom: ${borders.width.thin} solid ${colors.border.primary}; background: ${colors.background.primaryGlow};">
                    ${this.renderLearningMetrics()}
                </div>

                <!-- Contextual Hints -->
                <div id="contextual-hints" style="flex: 1; padding: ${spacing.base}; overflow-y: auto; display: flex; flex-direction: column; gap: ${spacing.sm};">
                    <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.base}; margin-bottom: ${spacing.sm}; text-shadow: ${effects.textShadow.base};">💡 Contextual Hints</div>
                    ${this.renderContextualHints()}
                </div>

                <!-- Learning Categories -->
                <div id="learning-categories" style="padding: ${spacing.base}; border-top: ${borders.width.thin} solid ${colors.border.primary}; background: ${colors.background.accentGlow};">
                    ${this.renderLearningCategories()}
                </div>
            </div>
        `

        document.body.appendChild(this.panel)
        this.setupPanelListeners()
        this.addAnimations()
    }

    private renderLearningMetrics(): string {
        if (!this.learningData) {
            return `
                <div style="text-align: center; padding: ${spacing.md}; color: ${colors.neutral.base};">
                    <div style="font-size: ${typography.fontSize['2xl']}; margin-bottom: ${spacing.sm};">📊</div>
                    <div style="font-size: ${typography.fontSize.sm};">Waiting for learning data...</div>
                </div>
            `
        }

        return `
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.white}; line-height: ${typography.lineHeight.relaxed};">
                <div style="display: flex; justify-content: space-between; margin-bottom: ${spacing.sm};">
                    <div>
                        <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 2px;">Conditions</div>
                        <div>${this.learningData.conditionsDiscovered || 0}</div>
                    </div>
                    <div>
                        <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 2px;">Accuracy</div>
                        <div>${Math.round((this.learningData.accuracy || 0) * 100)}%</div>
                    </div>
                    <div>
                        <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 2px;">Streak</div>
                        <div>${this.learningData.streak || 0}</div>
                    </div>
                </div>
                <div>
                    <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold}; margin-bottom: 2px;">Learning Progress</div>
                    <div>${this.learningData.conditionsLearned || 0}/${this.learningData.totalConditions || 0}</div>
                </div>
            </div>
        `
    }

    private renderContextualHints(): string {
        if (this.hintsData.length === 0) {
            return `
                <div style="text-align: center; padding: ${spacing.xl}; color: ${colors.neutral.base}; font-size: ${typography.fontSize.sm};">
                    No hints available yet. Continue scanning to receive contextual guidance!
                </div>
            `
        }

        return this.hintsData.map(hint => `
            <div style="background: rgba(255,170,0,0.1); border: 1px solid rgba(255,170,0,0.3); border-radius: 6px; padding: 8px;">
                <div style="color: #ffaa00; font-weight: bold; margin-bottom: 4px; font-size: ${typography.fontSize.xs};">
                    🔍 Hint for ${hint.conditionId}:
                </div>
                <div style="font-size: ${typography.fontSize.xs}; line-height: 1.4;">${hint.hint}</div>
            </div>
        `).join('')
    }

    private renderLearningCategories(): string {
        return `
            <div style="display: flex; justify-content: space-around; font-size: ${typography.fontSize.xs};">
                <div style="text-align: center;">
                    <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">Anatomy</div>
                    <div style="color: ${colors.neutral.light};">0/5</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">Pathology</div>
                    <div style="color: ${colors.neutral.light};">0/4</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">Diagnosis</div>
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

    updateLearningData(learningData: any) {
        this.learningData = learningData
        const learningMetricsContainer = this.panel?.querySelector('#learning-metrics') as HTMLElement
        if (learningMetricsContainer) {
            learningMetricsContainer.innerHTML = this.renderLearningMetrics()
        }
    }

    addContextualHint(conditionId: string, hint: string) {
        this.hintsData.push({
            conditionId,
            hint,
            timestamp: new Date()
        })
        
        // Keep only the most recent 5 hints
        if (this.hintsData.length > 5) {
            this.hintsData.shift()
        }
        
        const hintsContainer = this.panel?.querySelector('#contextual-hints') as HTMLElement
        if (hintsContainer) {
            hintsContainer.innerHTML = `
                <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.base}; margin-bottom: ${spacing.sm}; text-shadow: ${effects.textShadow.base};">💡 Contextual Hints</div>
                ${this.renderContextualHints()}
            `
        }
    }

    private addAnimations() {
        if (document.querySelector('#learning-progress-animations')) return

        const style = document.createElement('style')
        style.id = 'learning-progress-animations'
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
                .learning-progress-panel {
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
        this.hintsData = []
    }
}