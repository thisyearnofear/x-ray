/**
 * Interactive Tutorial System
 * Step-by-step guided experience with visual overlays and practice mode
 * 
 * CORE PRINCIPLES:
 * - ENHANCEMENT FIRST: Enhances existing tutorial flow
 * - CLEAN: Clear step progression and state management
 * - MODULAR: Independent tutorial system
 * - DRY: Uses design tokens for consistent styling
 */

import { colors, spacing, typography, borders, effects, animation, zIndex } from '../../styles/design-tokens'

export interface TutorialStep {
    id: string
    title: string
    instruction: string
    highlightArea?: string
    requiresAction: string
    showProgressBar?: boolean
    feedback?: {
        incomplete: string
        progress: string
        complete: string
    }
}

export class InteractiveTutorial {
    private currentStep: number = 0
    private isActive: boolean = false
    private overlay: HTMLElement | null = null
    private highlightElement: HTMLElement | null = null
    private practiceMode: boolean = true // No timer in tutorial

    private steps: TutorialStep[] = [
        {
            id: 'intro',
            title: '🔍 X-Ray Vision Activated',
            instruction: 'Move your mouse over the 3D model to begin scanning',
            highlightArea: 'model',
            requiresAction: 'mousemove',
            feedback: {
                incomplete: 'Move your cursor over the 3D model',
                progress: 'Good! Keep moving to explore...',
                complete: '✅ Perfect! You can control the view'
            }
        },
        {
            id: 'rotation',
            title: '🔄 Camera Control',
            instruction: 'Click and drag to rotate the model. Use scroll wheel to zoom.',
            highlightArea: 'model',
            requiresAction: 'camera-move',
            feedback: {
                incomplete: 'Try rotating the 3D model',
                progress: 'Great! You\'re getting the hang of it...',
                complete: '✅ Excellent camera control!'
            }
        },
        {
            id: 'scanning-intro',
            title: '📡 Scanning Mechanics',
            instruction: 'Hover over different body parts to scan for conditions. Watch the progress bar!',
            highlightArea: 'head',
            requiresAction: 'scan-start',
            showProgressBar: true,
            feedback: {
                incomplete: 'Position your cursor over the highlighted area',
                progress: 'Scanning in progress... hold steady!',
                complete: '✅ Scan initiated successfully!'
            }
        },
        {
            id: 'scanning-progress',
            title: '⏱️ Scan Completion',
            instruction: 'Keep your cursor steady to reach 100% scan completion',
            highlightArea: 'head',
            requiresAction: 'scan-progress-100',
            showProgressBar: true,
            feedback: {
                incomplete: 'Hold your cursor steady on the area',
                progress: 'Scanning: {progress}% - keep going!',
                complete: '✅ Scan complete! Analyzing data...'
            }
        },
        {
            id: 'discovery',
            title: '🎯 Condition Detection',
            instruction: 'A condition has been detected! Click on it to learn more.',
            requiresAction: 'click-condition',
            feedback: {
                incomplete: 'Click on the discovered condition',
                progress: 'Analyzing condition details...',
                complete: '✅ Diagnosis recorded!'
            }
        },
        {
            id: 'consultation-intro',
            title: '🎙️ AI Consultation Available',
            instruction: 'You can pause anytime and consult our AI for guidance. No pressure!',
            requiresAction: 'acknowledge',
            feedback: {
                incomplete: 'Click "Continue" when you\'re ready',
                progress: 'Understanding consultation feature...',
                complete: '✅ Feature unlocked!'
            }
        },
        {
            id: 'complete',
            title: '🏆 Tutorial Complete!',
            instruction: 'You\'re ready for the timed diagnostic challenge. Good luck!',
            requiresAction: 'start-game',
            feedback: {
                incomplete: 'Click "Start Diagnosis" to begin',
                progress: 'Preparing diagnostic session...',
                complete: '✅ Let\'s diagnose!'
            }
        }
    ]

    private onStepComplete?: (stepId: string) => void
    private onTutorialComplete?: () => void
    private onActionRequired?: (action: string, data?: any) => void

    constructor(callbacks?: {
        onStepComplete?: (stepId: string) => void
        onTutorialComplete?: () => void
        onActionRequired?: (action: string, data?: any) => void
    }) {
        this.onStepComplete = callbacks?.onStepComplete
        this.onTutorialComplete = callbacks?.onTutorialComplete
        this.onActionRequired = callbacks?.onActionRequired
    }

    start(): void {
        if (this.isActive) return

        this.isActive = true
        this.currentStep = 0
        this.createTutorialOverlay()
        this.showCurrentStep()
    }

    private createTutorialOverlay(): void {
        // Create main overlay container
        this.overlay = document.createElement('div')
        this.overlay.id = 'interactive-tutorial-overlay'
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: ${zIndex.overlay};
            pointer-events: none;
        `

        document.body.appendChild(this.overlay)
    }

    private showCurrentStep(): void {
        if (!this.overlay) return

        const step = this.steps[this.currentStep]
        if (!step) return

        // Clear previous step content
        this.overlay.innerHTML = ''

        // Create step instruction panel
        const instructionPanel = this.createInstructionPanel(step)
        this.overlay.appendChild(instructionPanel)

        // Create highlight if needed
        if (step.highlightArea) {
            this.createHighlight(step.highlightArea)
        }

        // Create progress indicator
        const progressIndicator = this.createProgressIndicator()
        this.overlay.appendChild(progressIndicator)

        // Request the required action
        if (this.onActionRequired) {
            this.onActionRequired(step.requiresAction, step)
        }
    }

    private createInstructionPanel(step: TutorialStep): HTMLElement {
        const panel = document.createElement('div')
        panel.style.cssText = `
            position: fixed;
            top: ${spacing['3xl']};
            left: 50%;
            transform: translateX(-50%);
            max-width: 500px;
            background: ${colors.background.gradient.panel};
            border: ${borders.width.base} solid ${colors.primary.base};
            border-radius: ${borders.radius.xl};
            padding: ${spacing.xl};
            box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
            backdrop-filter: ${effects.blur.lg};
            pointer-events: auto;
            animation: slideIn ${animation.duration.slow} ${animation.easing.smooth};
        `

        panel.innerHTML = `
            <div style="text-align: center;">
                <h2 style="color: ${colors.primary.base}; font-size: ${typography.fontSize['2xl']}; margin-bottom: ${spacing.base}; text-shadow: ${effects.textShadow.base};">
                    ${step.title}
                </h2>
                <p style="color: ${colors.neutral.white}; font-size: ${typography.fontSize.lg}; line-height: ${typography.lineHeight.relaxed}; margin-bottom: ${spacing.xl};">
                    ${step.instruction}
                </p>
                
                ${step.showProgressBar ? `
                    <div style="background: ${colors.background.primaryGlow}; border: ${borders.width.thin} solid ${colors.border.primary}; border-radius: ${borders.radius.full}; height: 8px; margin-bottom: ${spacing.base}; overflow: hidden;">
                        <div id="tutorial-progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, ${colors.primary.base}, ${colors.primary.light}); transition: width ${animation.duration.base} ${animation.easing.smooth};"></div>
                    </div>
                ` : ''}
                
                <div id="tutorial-feedback" style="color: ${colors.accent.base}; font-size: ${typography.fontSize.base}; min-height: 24px; margin-bottom: ${spacing.base};">
                    ${step.feedback?.incomplete || ''}
                </div>

                ${step.requiresAction === 'acknowledge' || step.requiresAction === 'start-game' ? `
                    <button id="tutorial-continue-btn" style="
                        background: linear-gradient(135deg, ${colors.primary.base} 0%, ${colors.primary.dark} 100%);
                        color: ${colors.neutral.black};
                        border: none;
                        padding: ${spacing.md} ${spacing['2xl']};
                        border-radius: ${borders.radius.md};
                        font-weight: ${typography.fontWeight.bold};
                        font-size: ${typography.fontSize.md};
                        cursor: pointer;
                        transition: all ${animation.duration.base} ${animation.easing.smooth};
                        box-shadow: ${effects.shadow.base}, ${effects.shadow.primaryGlow};
                    ">
                        ${step.requiresAction === 'start-game' ? 'Start Diagnosis' : 'Continue'}
                    </button>
                ` : ''}
            </div>
        `

        // Add button event listener
        const continueBtn = panel.querySelector('#tutorial-continue-btn')
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.completeCurrentStep())
            continueBtn.addEventListener('mouseenter', (e) => {
                (e.target as HTMLElement).style.transform = 'translateY(-2px)'
                    ; (e.target as HTMLElement).style.boxShadow = `${effects.shadow.md}, ${effects.shadow.primaryGlow}`
            })
            continueBtn.addEventListener('mouseleave', (e) => {
                (e.target as HTMLElement).style.transform = 'translateY(0)'
                    ; (e.target as HTMLElement).style.boxShadow = `${effects.shadow.base}, ${effects.shadow.primaryGlow}`
            })
        }

        return panel
    }

    private createHighlight(area: string): void {
        // Create pulsing highlight overlay for specific areas
        this.highlightElement = document.createElement('div')
        this.highlightElement.style.cssText = `
            position: fixed;
            border: 3px solid ${colors.primary.base};
            border-radius: ${borders.radius.lg};
            box-shadow: 0 0 30px ${colors.primary.glow}, inset 0 0 30px ${colors.primary.glow};
            pointer-events: none;
            animation: pulse 2s ${animation.easing.easeInOut} infinite;
            z-index: ${zIndex.overlay - 1};
        `

        // Position based on area (simplified - would need actual element positions)
        const positions: Record<string, { top: string; left: string; width: string; height: string }> = {
            'model': { top: '50%', left: '50%', width: '60%', height: '60%' },
            'head': { top: '30%', left: '50%', width: '30%', height: '30%' },
            'panel': { top: '2rem', left: '2rem', width: '380px', height: '80vh' }
        }

        const position = positions[area] || positions['model']
        Object.assign(this.highlightElement.style, position)
        this.highlightElement.style.transform = 'translate(-50%, -50%)'

        this.overlay?.appendChild(this.highlightElement)
    }

    private createProgressIndicator(): HTMLElement {
        const indicator = document.createElement('div')
        indicator.style.cssText = `
            position: fixed;
            bottom: ${spacing['3xl']};
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: ${spacing.sm};
            pointer-events: none;
        `

        this.steps.forEach((_, index) => {
            const dot = document.createElement('div')
            dot.style.cssText = `
                width: 12px;
                height: 12px;
                border-radius: ${borders.radius.full};
                background: ${index <= this.currentStep ? colors.primary.base : colors.neutral.dark};
                border: ${borders.width.thin} solid ${index === this.currentStep ? colors.primary.base : colors.neutral.base};
                box-shadow: ${index === this.currentStep ? effects.shadow.primaryGlow : 'none'};
                transition: all ${animation.duration.base} ${animation.easing.smooth};
            `
            indicator.appendChild(dot)
        })

        return indicator
    }

    // Public methods for external interaction
    updateProgress(progress: number): void {
        const progressBar = document.querySelector('#tutorial-progress-bar') as HTMLElement
        if (progressBar) {
            progressBar.style.width = `${progress}%`
        }

        const step = this.steps[this.currentStep]
        const feedback = document.querySelector('#tutorial-feedback') as HTMLElement
        if (feedback && step.feedback) {
            if (progress < 100) {
                feedback.textContent = step.feedback.progress.replace('{progress}', progress.toString())
                feedback.style.color = colors.accent.base
            } else {
                feedback.textContent = step.feedback.complete
                feedback.style.color = colors.primary.base
            }
        }
    }

    actionPerformed(action: string, success: boolean = true): void {
        const step = this.steps[this.currentStep]

        if (step.requiresAction === action && success) {
            setTimeout(() => this.completeCurrentStep(), 1000)
        }
    }

    private completeCurrentStep(): void {
        const step = this.steps[this.currentStep]

        if (this.onStepComplete) {
            this.onStepComplete(step.id)
        }

        this.currentStep++

        if (this.currentStep >= this.steps.length) {
            this.completeTutorial()
        } else {
            this.showCurrentStep()
        }
    }

    private completeTutorial(): void {
        this.isActive = false

        // Fade out overlay
        if (this.overlay) {
            this.overlay.style.animation = `fadeOut ${animation.duration.slow} ${animation.easing.smooth} forwards`

            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay)
                }
                this.overlay = null
            }, 500)
        }

        if (this.onTutorialComplete) {
            this.onTutorialComplete()
        }
    }

    skip(): void {
        this.completeTutorial()
    }

    destroy(): void {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay)
        }
        this.overlay = null
        this.highlightElement = null
        this.isActive = false
    }
}
