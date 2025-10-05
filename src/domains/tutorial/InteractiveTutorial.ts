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
    private autoProgressTimeouts: Set<number> = new Set() // Track active auto-progress timeouts

    private steps: TutorialStep[] = [
        {
            id: 'welcome',
            title: 'X-RAI',
            instruction: 'AI-powered diagnostic training with immersive 3D visualization and real-time audio feedback',
            requiresAction: 'start-experience',
            feedback: {
                incomplete: 'Click "Start Experience" to begin',
                progress: 'Initializing audio systems...',
                complete: '✅ Audio enabled! Starting tutorial...'
            }
        },
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
            instruction: 'Watch as the system demonstrates scanning mechanics automatically.',
            highlightArea: 'head',
            requiresAction: 'scan-demo',
            showProgressBar: true,
            feedback: {
                incomplete: 'Initializing scan demonstration...',
                progress: 'Scanning in progress...',
                complete: '✅ Scan demonstration complete!'
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

    // ENHANCEMENT FIRST: References to game systems
    private xRayEffect: any = null
    private scanFeedbackSystem: any = null
    private diagnosticUI: any = null
    private audioManager: any = null

    constructor(callbacks?: {
        onStepComplete?: (stepId: string) => void
        onTutorialComplete?: () => void
        onActionRequired?: (action: string, data?: any) => void
        xRayEffect?: any
        scanFeedbackSystem?: any
        diagnosticUI?: any
        audioManager?: any
    }) {
        this.onStepComplete = callbacks?.onStepComplete
        this.onTutorialComplete = callbacks?.onTutorialComplete
        this.onActionRequired = callbacks?.onActionRequired

        // Store references to game systems
        this.xRayEffect = callbacks?.xRayEffect
        this.scanFeedbackSystem = callbacks?.scanFeedbackSystem
        this.diagnosticUI = callbacks?.diagnosticUI
        this.audioManager = callbacks?.audioManager
    }

    start(): void {
        if (this.isActive) return

        this.isActive = true
        this.currentStep = 0
        this.createTutorialOverlay()
        this.showCurrentStep()

        // ENHANCEMENT FIRST: Auto-detect mouse movement and camera rotation
        this.setupAutoProgression()
    }

    private enableAudioSystems(): void {
        // CLEAN: Single responsibility - enable all audio systems
        console.log('🎵 Audio should be enabled now from tutorial')
        
        // Add a small delay to ensure audio manager is fully initialized
        setTimeout(() => {
            if (this.audioManager) {
                try {
                    // Ensure AudioContext is resumed
                    if (this.audioManager.getAudioListener) {
                        const listener = this.audioManager.getAudioListener()
                        if (listener && listener.context && listener.context.state === 'suspended') {
                            listener.context.resume().then(() => {
                                console.log('🎵 AudioContext resumed')
                            })
                        }
                    }

                    this.audioManager.startHospitalAmbience()
                    console.log('🎵 Audio systems enabled via user interaction')
                } catch (error) {
                    console.warn('⚠️ AudioManager start failed:', error)
                    // Try fallback audio start
                    try {
                        if (this.audioManager.playSound) {
                            this.audioManager.playSound('hospital_ambience', true)
                            console.log('🎵 Fallback audio started')
                        }
                    } catch (fallbackError) {
                        console.warn('⚠️ Fallback audio failed:', fallbackError)
                    }
                }
            } else {
                console.warn('⚠️ AudioManager not available')
            }
        }, 100) // Small delay to ensure proper initialization
    }

    private setupAutoProgression(): void {
        // Auto-detect mousemove for intro step (now step 1 after welcome)
        const mouseMoveHandler = () => {
            if (this.currentStep === 1) {
                console.log('🖱️ Auto-completing mousemove step')
                this.actionPerformed('mousemove', true)
                window.removeEventListener('mousemove', mouseMoveHandler)
            }
        }
        window.addEventListener('mousemove', mouseMoveHandler)

        // Auto-detect camera rotation for rotation step (now step 2)
        const mouseDownHandler = () => {
            if (this.currentStep === 2) {
                setTimeout(() => {
                    console.log('📷 Auto-completing camera-move step')
                    this.actionPerformed('camera-move', true)
                }, 2500) // Give user 2.5 seconds to rotate
                window.removeEventListener('mousedown', mouseDownHandler)
            }
        }
        window.addEventListener('mousedown', mouseDownHandler)

        // Auto-progress through remaining tutorial steps
        this.setupStepAutoProgression()
    }

    private setupStepAutoProgression(): void {
        // Auto-progress through all tutorial steps for demo mode
        const checkStepProgression = () => {
            const stepKey = this.currentStep
            if (this.autoProgressTimeouts.has(stepKey)) {
                return // Already have a timeout for this step
            }

            switch (this.currentStep) {
                case 3: // scanning-intro step
                    const timeout3 = setTimeout(() => {
                        if (this.currentStep === 3) {
                            console.log('🔍 Scanning demo in tutorial mode - auto-progressing')
                            this.actionPerformed('scan-demo', true)
                        }
                        this.autoProgressTimeouts.delete(stepKey)
                    }, 4000) // Increased to 4 seconds for better demo experience
                    this.autoProgressTimeouts.add(stepKey)
                    break
                case 4: // scanning-progress step
                    const timeout4 = setTimeout(() => {
                        if (this.currentStep === 4) {
                            console.log('⏱️ Scan progress step - auto-progressing')
                            this.actionPerformed('scan-progress-100', true)
                        }
                        this.autoProgressTimeouts.delete(stepKey)
                    }, 5000) // Increased to 5 seconds
                    this.autoProgressTimeouts.add(stepKey)
                    break
                case 5: // discovery step
                    const timeout5 = setTimeout(() => {
                        if (this.currentStep === 5) {
                            console.log('🎯 Discovery step - auto-progressing')
                            this.actionPerformed('click-condition', true)
                        }
                        this.autoProgressTimeouts.delete(stepKey)
                    }, 3500) // Increased to 3.5 seconds
                    this.autoProgressTimeouts.add(stepKey)
                    break
                case 6: // consultation-intro step
                    const timeout6 = setTimeout(() => {
                        if (this.currentStep === 6) {
                            console.log('🎙️ Auto-acknowledging consultation feature')
                            this.actionPerformed('acknowledge', true)
                        }
                        this.autoProgressTimeouts.delete(stepKey)
                    }, 4500) // Increased to 4.5 seconds
                    this.autoProgressTimeouts.add(stepKey)
                    break
                case 7: // complete step
                    const timeout7 = setTimeout(() => {
                        if (this.currentStep === 7) {
                            console.log('🏆 Auto-starting diagnostic session')
                            this.actionPerformed('start-game', true)
                        }
                        this.autoProgressTimeouts.delete(stepKey)
                    }, 4000) // Increased to 4 seconds
                    this.autoProgressTimeouts.add(stepKey)
                    break
            }
        }

        // Check every 500ms for step changes
        const progressionInterval = setInterval(() => {
            if (this.isActive) {
                checkStepProgression()
            } else {
                clearInterval(progressionInterval)
                this.autoProgressTimeouts.clear()
            }
        }, 500)
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

        // REMOVED: Green highlight barrier - was cluttering UI
        // Tutorial instructions are clear enough without visual barriers

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

                ${step.requiresAction === 'acknowledge' || step.requiresAction === 'start-game' || step.requiresAction === 'start-experience' ? `
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
                        ${step.requiresAction === 'start-game' ? 'Start Diagnosis' : step.requiresAction === 'start-experience' ? '🔊 Start Experience' : 'Continue'}
                    </button>
                ` : ''}
            </div>
        `

        // Add button event listener
        const continueBtn = panel.querySelector('#tutorial-continue-btn')
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                // ENHANCEMENT FIRST: Enable audio immediately on first user interaction
                if (step.requiresAction === 'start-experience') {
                    console.log('🎵 Starting audio immediately on user interaction')
                    this.enableAudioSystems()
                    // Try immediate audio playback
                    if (this.audioManager && this.audioManager.playSound) {
                        try {
                            this.audioManager.playSound('hospital_ambience', true)
                            console.log('🎵 Hospital ambience started immediately')
                        } catch (e) {
                            console.warn('⚠️ Immediate audio failed, trying fallback:', e)
                            // Try other sounds
                            try {
                                this.audioManager.playSound('background_music', true)
                                console.log('🎵 Background music started as fallback')
                            } catch (e2) {
                                console.warn('⚠️ All audio attempts failed:', e2)
                            }
                        }
                    }
                }
                this.completeCurrentStep()
            })
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
            console.log(`✅ Tutorial action performed: ${action} for step ${this.currentStep}`)
            setTimeout(() => this.completeCurrentStep(), 500) // Faster completion
        } else {
            console.log(`⚠️ Tutorial action not performed: ${action} (current step requires ${step?.requiresAction})`)
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
        // Clear any pending auto-progress timeouts
        this.autoProgressTimeouts.clear()
    }
}
