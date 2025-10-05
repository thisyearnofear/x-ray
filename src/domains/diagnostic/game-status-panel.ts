/**
 * Game Status Panel
 * Top-left panel for timer, score, streak, and scanning progress
 * 
 * CORE PRINCIPLES:
 * - ENHANCEMENT FIRST: Enhances existing game status display
 * - CLEAN: Separate from diagnostic panel
 * - MODULAR: Independent component
 * - DRY: Uses design tokens
 */

import { colors, spacing, typography, borders, effects, animation, zIndex } from '../../styles/design-tokens'
import { GameManager } from './GameManager'
import { MEDICAL_CONDITIONS } from '../medical/medical-data'

export class GameStatusPanel {
    private panel: HTMLElement | null = null
    private gameManager: GameManager
    private timer: NodeJS.Timeout | null = null
    private scanProgress: Map<string, number> = new Map()

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager
        this.setupEventListeners()
    }

    private setupEventListeners() {
        // Listen for game state updates
        this.gameManager.on('gameStateUpdated', (gameState: any) => {
            this.updateTimerDisplay()
            this.updateScoreDisplay()
            this.updateProgressDisplay()
        })
    }

    show() {
        if (this.panel) return

        this.createPanel()
        this.startTimer()
    }

    private createPanel() {
        this.panel = document.createElement('div')
        this.panel.className = 'game-status-panel'
        this.panel.style.cssText = `
            position: fixed;
            top: ${spacing.xl};
            left: ${spacing.xl};
            width: 380px;
            max-height: 80vh;
            background: ${colors.background.gradient.panel};
            border: ${borders.width.base} solid ${colors.primary.base};
            border-radius: ${borders.radius.xl};
            box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
            backdrop-filter: ${effects.blur.lg};
            z-index: ${zIndex.panel};
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideInFromLeft ${animation.duration.slow} ${animation.easing.smooth};
        `

        // Add SVG gradient definitions for timer
        const svgDefs = `
            <svg style="position: absolute; width: 0; height: 0;">
                <defs>
                    <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#00ff88;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#00cc6a;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#009955;stop-opacity:1" />
                    </linearGradient>
                    <filter id="hologram-glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        `

        this.panel.innerHTML = `
            ${svgDefs}
            <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: ${spacing.base}; border-bottom: ${borders.width.thin} solid ${colors.border.primary}; cursor: pointer; user-select: none;">
                <div class="scan-prompt">
                    <div class="scan-title" id="panel-title">⚡ EMERGENCY DIAGNOSTIC</div>
                    <div class="scan-subtitle" id="panel-subtitle">Critical Patient - Rapid Assessment Required</div>
                </div>
            </div>

            <div class="panel-content" style="padding: 0 1.5rem 1.5rem;">
                <!-- Timer and Score Section -->
                <div class="timer-section" style="margin-bottom: 1.5rem;">
                    <div class="timer-ring">
                        <div class="timer-text" id="timer">5:00</div>
                        <svg class="timer-circle" width="60" height="60" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                            <circle cx="30" cy="30" r="25" class="timer-bg" fill="none" stroke="rgba(0,255,136,0.2)" stroke-width="2"/>
                            <circle cx="30" cy="30" r="25" class="timer-progress" id="timer-progress"
                                    fill="none" stroke="url(#timer-gradient)" stroke-width="3"
                                    stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="0"
                                    style="filter: url(#hologram-glow);"/>
                        </svg>
                    </div>
                    <div class="timer-label">⏱️ TIME CRITICAL</div>
                </div>

                <!-- Score and Streak Display -->
                <div class="score-section">
                    <div class="score-display">
                        <div class="score-label">🏥 DIAGNOSTIC POINTS</div>
                        <div class="score-value" id="score">0</div>
                    </div>
                    <div class="streak-display">
                        <div class="streak-icon">🔥</div>
                        <div class="streak-value" id="streak">0</div>
                    </div>
                </div>

                <!-- Scanning Progress -->
                <div id="scan-progress" style="margin-top: ${spacing.xl};">
                    <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.md}; margin-bottom: ${spacing.base}; text-align: center; letter-spacing: ${typography.letterSpacing.wider};">🔍 ACTIVE SCANS</div>
                    <div id="progress-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
                </div>
            </div>
        `

        document.body.appendChild(this.panel)
        this.setupTimerAnimation()
        this.addResponsiveStyles()
    }

    private addResponsiveStyles() {
        // Add responsive styles for mobile devices
        if (!document.querySelector('#game-status-responsive-styles')) {
            const responsiveStyle = document.createElement('style')
            responsiveStyle.id = 'game-status-responsive-styles'
            responsiveStyle.textContent = `
                @media (max-width: 768px) {
                    .game-status-panel {
                        top: 1rem !important;
                        left: 1rem !important;
                        right: 1rem !important;
                        width: auto !important;
                        max-height: 70vh !important;
                    }

                    .scan-title {
                        font-size: 14px !important;
                    }

                    .scan-subtitle {
                        font-size: 11px !important;
                    }

                    .timer-ring svg {
                        width: 50px !important;
                        height: 50px !important;
                    }

                    .timer-text {
                        font-size: 12px !important;
                    }

                    .score-value {
                        font-size: 20px !important;
                    }

                    .condition-card {
                        padding: 6px 10px !important;
                        margin: 3px 0 !important;
                    }
                }
            `
            document.head.appendChild(responsiveStyle)
        }
    }

    private setupTimerAnimation() {
        // Animate the timer progress circle
        const updateTimerProgress = () => {
            if (!this.panel) return

            const progressCircle = this.panel.querySelector('#timer-progress') as SVGCircleElement
            if (progressCircle) {
                const circumference = 2 * Math.PI * 25 // radius = 25
                const gameState = this.gameManager.getGameState()
                const timeProgress = gameState.timeRemaining / 300 // 300 seconds total
                const offset = circumference * (1 - timeProgress)

                progressCircle.style.strokeDashoffset = offset.toString()
            }
        }

        // Update immediately and then every second
        updateTimerProgress()
        setInterval(updateTimerProgress, 1000)
    }

    private startTimer() {
        // Clear any existing timer to prevent multiple timers running
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
        
        this.timer = setInterval(() => {
            const gameState = this.gameManager.getGameState()
            const newTimeRemaining = gameState.timeRemaining - 1

            // Update the game state in the manager using consolidated method
            this.gameManager.updateState({ timeRemaining: newTimeRemaining })

            this.updateTimerDisplay()

            if (newTimeRemaining <= 0) {
                // Handle timeout - this would need to be handled by the main DiagnosticUI
                console.log('⏰ Game time expired')
            }
        }, 1000)
    }

    private updateTimerDisplay() {
        if (!this.panel) return

        const timerElement = this.panel.querySelector('#timer') as HTMLElement
        const gameState = this.gameManager.getGameState()
        const minutes = Math.floor(gameState.timeRemaining / 60)
        const seconds = gameState.timeRemaining % 60
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`

        // Visual warning when time is running low
        if (gameState.timeRemaining < 60) {
            timerElement.style.color = '#ff4444'
            timerElement.style.animation = 'pulse 1s infinite'
        }
    }

    private updateScoreDisplay() {
        if (!this.panel) return

        const gameState = this.gameManager.getGameState()
        const scoreElement = this.panel.querySelector('#score') as HTMLElement
        const streakElement = this.panel.querySelector('#streak') as HTMLElement
        
        if (scoreElement && streakElement) {
            scoreElement.textContent = gameState.score.toString()
            streakElement.textContent = gameState.streak.toString()
        }
    }

    updateScanProgress(conditionId: string, progress: number) {
        this.scanProgress.set(conditionId, progress)
        this.updateProgressDisplay()
    }

    private updateProgressDisplay() {
        if (!this.panel) return

        const progressList = this.panel.querySelector('#progress-list') as HTMLElement
        if (!progressList) return

        const gameState = this.gameManager.getGameState()
        const progressEntries = Array.from(this.scanProgress.entries())
            .map(([conditionId, progress]) => {
                const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId)
                const percentage = Math.round(progress * 100)
                const isDiscovered = gameState.discoveredConditions.has(conditionId)

                let status = 'scanning'
                if (isDiscovered) status = 'discovered'
                else if (percentage >= 100) status = 'ready'

                const statusConfig: Record<string, { color: string; symbol: string; bg: string }> = {
                    'scanning': { color: '#ffffff', symbol: '🔍', bg: 'rgba(255,255,255,0.05)' },
                    'ready': { color: '#ffaa00', symbol: '⚡', bg: 'rgba(255,170,0,0.1)' },
                    'discovered': { color: '#00ff88', symbol: '✅', bg: 'rgba(0,255,136,0.1)' }
                }

                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['scanning']

                return `
                    <div class="condition-card" style="padding: 8px 12px; margin: 4px 0; background: ${config.bg}; border: 1px solid ${config.color}33; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 12px;">${config.symbol}</span>
                        <span style="flex: 1; color: ${config.color}; font-size: 11px; font-weight: 500;">${condition?.name || conditionId}</span>
                        <span style="color: ${config.color}; font-size: 10px; opacity: 0.8; font-family: monospace;">${percentage}%</span>
                    </div>
                `
            })
            .join('')

        progressList.innerHTML = progressEntries || '<div style="opacity: 0.6; font-style: italic; text-align: center; padding: 1rem; color: #888;">No active scans</div>'
    }

    hide() {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel)
            this.panel = null
        }

        // Clear timer
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    }

    destroy() {
        this.hide()
        this.scanProgress.clear()
    }
}