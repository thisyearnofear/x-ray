import * as THREE from 'three'
import { AudioManager, SoundType } from "../../components/AudioManager"
import { MEDICAL_CONDITIONS } from "../../domains/medical/medical-data"
import { GamePhaseManager, GamePhase } from "./game-phase-manager"

// MODULAR: Clean diagnostic interface coordinating sophisticated backend systems
import { GameManager } from "./GameManager"
import { AchievementSystem } from "./AchievementSystem"
import { LearningTracker } from "./LearningTracker"
import { MedicalWorkflowManager, PatientCase } from "./MedicalWorkflowManager"
import { Web3SkillTracker } from "./Web3SkillTracker"

// ENHANCEMENT FIRST: Voice consultation integration
import { VoiceConsultationManager, ConsultationContext } from "../voice/VoiceConsultationManager"

// DRY: Import design tokens for consistent styling
import { colors, spacing, typography, borders, effects, animation, zIndex } from '../../styles/design-tokens'

// ENHANCEMENT FIRST: Interactive tutorial system
import { InteractiveTutorial } from '../tutorial/InteractiveTutorial'

// ENHANCEMENT FIRST: Patient chat panel for AI consultation
import { PatientChatPanel } from './patient-chat-panel'

// ENHANCEMENT FIRST: Achievement panel for progress tracking
import { AchievementPanel } from './achievement-panel'

// ENHANCEMENT FIRST: Learning progress panel for metrics and hints
import { LearningProgressPanel } from './learning-progress-panel'

// ENHANCEMENT FIRST: Game status panel for timer, score, and scanning progress
import { GameStatusPanel } from './game-status-panel'

// ENHANCEMENT FIRST: Audio management system for all audio-related functionality
import { AudioManagementSystem } from '../audio/audio-management-system'

export class DiagnosticUI {
    private audioManager: AudioManager
    private audioManagementSystem: AudioManagementSystem
    private phaseManager: GamePhaseManager

    // MODULAR: Sophisticated backend systems
    private gameManager: GameManager
    private achievementSystem: AchievementSystem
    private learningTracker: LearningTracker
    private workflowManager: MedicalWorkflowManager
    private web3Tracker: Web3SkillTracker

    // ENHANCEMENT FIRST: Voice consultation system
    private voiceConsultation: VoiceConsultationManager

    // MODULAR: Interactive tutorial system
    private tutorial: InteractiveTutorial | null = null

    // MODULAR: Patient chat panel
    private patientChatPanel: PatientChatPanel | null = null

    // MODULAR: Achievement panel
    private achievementPanel: AchievementPanel | null = null

    // MODULAR: Learning progress panel
    private learningProgressPanel: LearningProgressPanel | null = null

    // MODULAR: Game status panel
    private gameStatusPanel: GameStatusPanel | null = null

    private scanProgress: Map<string, number> = new Map()
    private panel: HTMLElement | null = null
    private timer: NodeJS.Timeout | null = null
    private isInitialized: boolean = false
    private isCollapsed: boolean = false
    private onboardingContainer: HTMLElement | null = null

    // ENHANCEMENT FIRST: References to canvas systems
    private xRayEffect: any = null
    private scanFeedbackSystem: any = null

    constructor(audioManager: AudioManager, config?: {
        xRayEffect?: any
        scanFeedbackSystem?: any
    }) {
        this.audioManager = audioManager
        // ENHANCEMENT FIRST: Initialize audio management system
        this.audioManagementSystem = new AudioManagementSystem(audioManager)
        this.xRayEffect = config?.xRayEffect
        this.scanFeedbackSystem = config?.scanFeedbackSystem

        // Initialize sophisticated backend systems
        this.gameManager = new GameManager()
        this.achievementSystem = new AchievementSystem()
        this.learningTracker = new LearningTracker()

        // Import and initialize CerebrasService for AI integration
        const { CerebrasService } = require('../medical/cerebras-service')
        const cerebrasService = new CerebrasService()
        this.workflowManager = new MedicalWorkflowManager(cerebrasService)

        this.web3Tracker = new Web3SkillTracker()

        // ENHANCEMENT FIRST: Initialize voice consultation system
        this.voiceConsultation = new VoiceConsultationManager()

        // ENHANCEMENT FIRST: Initialize patient chat panel
        this.patientChatPanel = new PatientChatPanel(this.voiceConsultation)

        // ENHANCEMENT FIRST: Initialize achievement panel
        this.achievementPanel = new AchievementPanel(this.achievementSystem)

        // ENHANCEMENT FIRST: Initialize learning progress panel
        this.learningProgressPanel = new LearningProgressPanel(this.learningTracker)

        // ENHANCEMENT FIRST: Initialize game status panel
        this.gameStatusPanel = new GameStatusPanel(this.gameManager)

        // ENHANCEMENT FIRST: Pass GameManager to GamePhaseManager for integration
        this.phaseManager = new GamePhaseManager(this.gameManager)

        this.setupSystemIntegration()
        this.initialize()
    }

    private setupSystemIntegration() {
        // Connect all systems together with event-driven communication
        this.gameManager.on('pointsAwarded', (data: { points: number; reason: string }) => {
            this.showPointsFeedback(data.points, data.reason)
        })

        this.gameManager.on('gameStateUpdated', (gameState: any) => {
            this.updatePhaseDisplay()
            this.updateLearningDisplay()
            // Update achievement panel with new performance data
            this.achievementPanel?.updatePerformanceData({
                accuracy: gameState.accuracy,
                efficiency: gameState.efficiency,
                streak: gameState.streak,
                achievementsCount: gameState.achievements.size,
                totalAchievements: this.achievementSystem.getAllAchievements().length
            })
            // Update learning progress panel with new learning data
            this.learningProgressPanel?.updateLearningData({
                conditionsDiscovered: gameState.discoveredConditions.size,
                accuracy: gameState.accuracy,
                streak: gameState.streak,
                conditionsLearned: gameState.learningProgress.size,
                totalConditions: Object.keys(MEDICAL_CONDITIONS).length
            })
        })

        this.achievementSystem.on('achievementUnlocked', (data: { achievement: any }) => {
            // Show achievement notification in the achievement panel
            this.achievementPanel?.showAchievementNotification(data.achievement)
            this.gameManager.awardPoints(data.achievement.points, 'achievement')
        })

        this.achievementSystem.on('techniqueReward', (data: { techniqueId: string }) => {
            this.gameManager.unlockTechnique(data.techniqueId)
        })

        this.achievementSystem.on('specializationReward', (data: { specializationId: string }) => {
            this.gameManager.unlockSpecialization(data.specializationId)
        })

        this.learningTracker.on('sessionEnded', (data: { session: any }) => {
            this.web3Tracker.updateSkillProfile({
                score: data.session.score,
                accuracy: data.session.accuracy,
                duration: data.session.duration,
                achievements: data.session.achievements,
                techniquesUsed: data.session.techniquesUsed,
                specialization: data.session.specialization
            })
        })

        this.workflowManager.on('caseGenerated', async (data: { patientCase: any }) => {
            await this.integrateAICaseData(data.patientCase)
        })

        this.workflowManager.on('stepCompleted', (data: { step: any }) => {
            this.handleWorkflowStepCompletion(data.step)
        })

        this.web3Tracker.on('nftMinted', (data: { nftReward: any }) => {
            this.showNFTRewardNotification(data.nftReward)
        })

        // ENHANCEMENT FIRST: Voice consultation system integration
        this.voiceConsultation.on('consultationStarted', (session: any) => {
            this.handleConsultationStarted(session)
        })

        this.voiceConsultation.on('guidanceReceived', (data: { guidance: string; session: any }) => {
            this.handleGuidanceReceived(data.guidance)
        })

        this.voiceConsultation.on('consultationEnded', (data: { insights: string[] }) => {
            this.handleConsultationEnded(data.insights)
        })

        this.voiceConsultation.on('gamePauseRequested', () => {
            this.pauseGameForConsultation()
        })

        this.voiceConsultation.on('gameResumeRequested', () => {
            this.resumeGameFromConsultation()
        })
        
        // DYNAMIC: Listen for dynamic hints and clues from the game manager
        this.gameManager.on('dynamicHintReceived', (data: { hint: string }) => {
            this.showDynamicHint(data.hint);
        });
        
        this.gameManager.on('dynamicClueReceived', (data: { clue: string }) => {
            this.showDynamicClueWithMessage(data.clue);
        });
        this.gameManager.on('conditionDiscoveryOpportunity', (data: { message: string }) => {
            this.showConditionDiscoveryOpportunity(data.message);
        });
    }

    private initialize() {
        if (this.isInitialized) return

        this.createDiagnosticPanel()
        this.setupPhaseManagement()
        this.isInitialized = true

            // Make DiagnosticUI globally accessible for phase transitions
            ; (window as any).diagnosticUI = this

        // ENHANCEMENT FIRST: Auto-start tutorial on page load
        setTimeout(() => {
            this.phaseManager.transitionTo(GamePhase.WELCOME)
        }, 500) // Small delay to ensure everything is loaded
    }

    // PREMIUM: Premium diagnostic panel positioned on LEFT for desktop
    private createDiagnosticPanel() {
        this.panel = document.createElement('div')
        this.panel.className = 'diagnostic-game-panel'
        this.panel.style.cssText = `
      position: fixed; top: 2rem; left: 2rem; width: 380px; max-height: 80vh;
      z-index: 1000; overflow-y: auto; transition: transform 0.3s ease;
    `

        this.panel.innerHTML = `
      <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: ${spacing.base}; border-bottom: ${borders.width.thin} solid ${colors.border.primary}; cursor: pointer; user-select: none;">
        <div class="scan-prompt">
          <div class="scan-title" id="panel-title">⚡ EMERGENCY DIAGNOSTIC</div>
          <div class="scan-subtitle" id="panel-subtitle">Critical Patient - Rapid Assessment Required</div>
        </div>
        <div class="collapse-toggle" id="collapse-toggle" style="font-size: ${typography.fontSize.xl}; color: ${colors.primary.base}; cursor: pointer; padding: ${spacing.sm}; border-radius: ${borders.radius.full}; background: ${colors.background.primaryGlow}; transition: all ${animation.duration.base} ${animation.easing.smooth};">
          ${this.isCollapsed ? '▶' : '◀'}
        </div>
      </div>

      <div class="panel-content" style="padding: 0 1.5rem 1.5rem;">




        <!-- AI Analysis Stream -->
        <div id="analysis-section" class="analysis-stream" style="margin-top: ${spacing.base}; padding: ${spacing.base}; display: none; position: relative;">
          <div style="color: ${colors.accent.base}; font-size: ${typography.fontSize.base}; margin-bottom: ${spacing.sm}; text-shadow: ${effects.textShadow.accent};">🧠 AI MEDICAL ANALYSIS</div>
          <div id="analysis-content" style="font-family: ${typography.fontFamily.monospace}; font-size: ${typography.fontSize.sm}; line-height: ${typography.lineHeight.base}; color: ${colors.primary.base}; text-shadow: ${effects.textShadow.sm}; min-height: 60px;"></div>
        </div>

        <!-- Enhanced Action Buttons -->
        <div class="progress-actions" id="action-buttons" style="margin-top: ${spacing.base}; display: none;">
          <button class="action-btn solve-btn" id="solve-btn">
            <div class="btn-icon">🩺</div>
            <div class="btn-text">SUBMIT DIAGNOSIS</div>
            <div class="btn-count" id="solve-count">0</div>
          </button>
          <button class="action-btn hint-btn" id="hint-btn">
            <div class="btn-icon">💡</div>
            <div class="btn-text">CLINICAL HINT</div>
            <div class="btn-count" id="hint-count">3</div>
          </button>
          <button class="action-btn consultation-btn" id="consultation-btn" style="display: none;">
            <div class="btn-icon">🎙️</div>
            <div class="btn-text">CONSULT SPECIALIST</div>
            <div class="btn-count" id="consultation-count">∞</div>
          </button>
        </div>

        <!-- Diagnosis Submission Section -->
        <div class="diagnosis-submission" id="diagnosis-submission" style="margin-top: ${spacing.base}; display: none;">
          <div style="color: ${colors.accent.base}; font-size: ${typography.fontSize.base}; margin-bottom: ${spacing.sm}; text-shadow: ${effects.textShadow.accent}; letter-spacing: ${typography.letterSpacing.wider};">🏥 SUBMIT FINAL DIAGNOSIS</div>
          <div id="diagnosis-options" style="margin-bottom: ${spacing.base};"></div>
          <button class="action-btn submit-diagnosis-btn" id="submit-diagnosis-btn" style="width: 100%;">
            <div class="btn-icon">📋</div>
            <div class="btn-text">SUBMIT DIAGNOSIS</div>
          </button>
        </div>


      </div>
    `

        document.body.appendChild(this.panel)

        this.addResponsiveStyles()
        this.setupCollapsibleFunctionality()
        this.setupDiagnosisSubmission()
        this.addDiagnosisSubmissionStyles()
        this.setupVoiceConsultation()
    }

    private addResponsiveStyles() {
        // Add responsive styles for mobile devices
        const responsiveStyle = document.createElement('style')
        responsiveStyle.id = 'diagnostic-responsive-styles'
        responsiveStyle.textContent = `
            @media (max-width: 768px) {
                .diagnostic-game-panel {
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

            /* Collapsible panel styles */
            .diagnostic-game-panel.collapsed {
                transform: translateX(calc(-100% + 60px)) !important;
                width: 60px !important;
            }

            .diagnostic-game-panel.collapsed .panel-content {
                display: none !important;
            }

            .diagnostic-game-panel.collapsed .panel-header {
                justify-content: center !important;
                padding: 0.5rem !important;
            }

            .diagnostic-game-panel.collapsed .scan-title,
            .diagnostic-game-panel.collapsed .scan-subtitle {
                display: none !important;
            }

            .collapse-toggle:hover {
                background: rgba(0,255,136,0.2) !important;
                transform: scale(1.1) !important;
            }
        `
        document.head.appendChild(responsiveStyle)
    }

    private addDiagnosisSubmissionStyles() {
        // Add premium diagnosis submission styles matching our holographic design ethos
        if (!document.querySelector('#diagnosis-submission-styles')) {
            const style = document.createElement('style')
            style.id = 'diagnosis-submission-styles'
            style.textContent = `
                /* PREMIUM: Diagnosis submission section with holographic effects */
                .diagnosis-submission {
                    background: 
                        linear-gradient(135deg, rgba(255,170,0,0.05) 0%, rgba(255,140,0,0.05) 100%),
                        radial-gradient(circle at 30% 30%, rgba(255,170,0,0.1) 0%, transparent 50%);
                    border: 1px solid rgba(255,170,0,0.3);
                    border-radius: 8px;
                    padding: 1rem;
                    position: relative;
                    overflow: hidden;
                    animation: glow-pulse 4s ease-in-out infinite;
                }

                .diagnosis-submission::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 2px,
                            rgba(255,170,0,0.03) 2px,
                            rgba(255,170,0,0.03) 4px
                        );
                    pointer-events: none;
                    animation: scan-line 5s linear infinite;
                }

                /* PREMIUM: Enhanced diagnosis options with shimmer effect */
                .diagnosis-option::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    transition: left 0.5s;
                }

                .diagnosis-option:hover::before {
                    left: 100%;
                }

                .diagnosis-option input[type="checkbox"]:checked + span {
                    color: #00ff88 !important;
                    text-shadow: 0 0 8px rgba(0,255,136,0.5);
                }

                .diagnosis-option:has(input[type="checkbox"]:checked) {
                    background: linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(0,150,255,0.2) 100%) !important;
                    border-color: rgba(0,255,136,0.6) !important;
                    box-shadow: 0 0 20px rgba(0,255,136,0.3) !important;
                }

                /* PREMIUM: Enhanced submit button with holographic styling */
                .submit-diagnosis-btn {
                    background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%) !important;
                    color: #000 !important;
                    font-weight: bold !important;
                    box-shadow: 
                        0 4px 15px rgba(0,255,136,0.4),
                        inset 0 1px 0 rgba(255,255,255,0.2) !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
                    position: relative;
                    overflow: hidden;
                }

                .submit-diagnosis-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.5s;
                }

                .submit-diagnosis-btn:hover::before {
                    left: 100%;
                }

                .submit-diagnosis-btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 
                        0 8px 25px rgba(0,255,136,0.5),
                        inset 0 1px 0 rgba(255,255,255,0.3) !important;
                }

                /* PERFORMANT: Hardware acceleration for diagnosis submission */
                .diagnosis-submission,
                .diagnosis-submission *,
                .diagnosis-submission::before,
                .diagnosis-option::before {
                    transform: translateZ(0);
                    will-change: transform, opacity;
                }
            `
            document.head.appendChild(style)
        }
    }

    private setupCollapsibleFunctionality() {
        if (!this.panel) return

        const header = this.panel.querySelector('.panel-header') as HTMLElement
        const toggle = this.panel.querySelector('#collapse-toggle') as HTMLElement

        if (header && toggle) {
            header.addEventListener('click', (e) => {
                e.stopPropagation()
                this.togglePanel()
            })

            toggle.addEventListener('click', (e) => {
                e.stopPropagation()
                this.togglePanel()
            })
        }
    }

    private togglePanel() {
        if (!this.panel) return

        this.isCollapsed = !this.isCollapsed
        this.panel.classList.toggle('collapsed', this.isCollapsed)

        const toggle = this.panel.querySelector('#collapse-toggle') as HTMLElement
        if (toggle) {
            toggle.textContent = this.isCollapsed ? '▶' : '◀'
        }

        // Update panel title based on state
        const titleElement = this.panel.querySelector('#panel-title') as HTMLElement
        const subtitleElement = this.panel.querySelector('#panel-subtitle') as HTMLElement

        if (titleElement && subtitleElement) {
            if (this.isCollapsed) {
                titleElement.textContent = '🏥'
                subtitleElement.textContent = 'DIAGNOSTIC'
            } else {
                titleElement.textContent = '🏥 MEDICAL DIAGNOSTIC SYSTEM'
                subtitleElement.textContent = 'AI-Powered Medical Analysis & Training'
            }
        }
    }

    // Add dynamic game elements (clues, new conditions) during gameplay
    private addDynamicGameElements() {
        const gameState = this.gameManager.getGameState()
        
        // Add dynamic clues every 30 seconds
        if (gameState.timeRemaining % 30 === 0 && gameState.timeRemaining > 60) {
            this.showDynamicClue()
        }
        
        // Add new conditions dynamically based on time and progress
        if (gameState.timeRemaining % 45 === 0 && gameState.discoveredConditions.size < 3) {
            this.addDynamicCondition()
        }
    }

    // DYNAMIC: Show dynamic clue to the user
    private showDynamicClue() {
        const gameState = this.gameManager.getGameState()
        const discoveredCount = gameState.discoveredConditions.size
        
        // Different clues based on game progress
        let clueMessage = ''
        if (discoveredCount === 0) {
            clueMessage = "🔍 Hint: Try scanning different areas of the anatomy. Move your cursor around to explore."
        } else if (discoveredCount === 1) {
            clueMessage = "💡 Pro Tip: Look for areas with subtle abnormalities. Conditions often hide in less obvious locations."
        } else {
            clueMessage = "🎯 Advanced: Consider the patient's chief complaint when focusing your scan areas."
        }
        
        // Add clue to the learning progress panel
        this.learningProgressPanel?.addContextualHint('dynamic-clue', clueMessage)
        
        // Play a subtle sound to indicate new clue through audio management system
        this.audioManagementSystem.playSound(SoundType.MEDICAL_BEEP)
    }

    // Add new conditions dynamically during gameplay
    private addDynamicCondition() {
        // Only add dynamic conditions if we have the XRayEffect reference
        if (!this.xRayEffect) return
        
        const gameState = this.gameManager.getGameState()
        const currentModel = this.xRayEffect.currentModel
        
        // Get conditions for the current model that haven't been discovered yet
        const availableConditions = Object.values(MEDICAL_CONDITIONS).filter(condition => 
            condition.requiredModel === currentModel && 
            !gameState.discoveredConditions.has(condition.id) &&
            !this.scanProgress.has(condition.id)
        )
        
        // If we have available conditions, add one dynamically
        if (availableConditions.length > 0) {
            const randomCondition = availableConditions[Math.floor(Math.random() * availableConditions.length)]
            
            // Add the condition to the XRayEffect
            if (this.xRayEffect && typeof this.xRayEffect.createConditionMarker === 'function') {
                this.xRayEffect.createConditionMarker(randomCondition)
                this.scanProgress.set(randomCondition.id, 0)
                
                // Update the progress display
                this.updateProgressDisplay()
                
                // Show notification about new condition
                const hintsPanel = this.panel?.querySelector('#hints-panel') as HTMLElement
                const hintsContent = this.panel?.querySelector('#hints-content') as HTMLElement
                
                if (hintsPanel && hintsContent) {
                    hintsContent.innerHTML = `
                        <div style="background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); border-radius: 6px; padding: 8px;">
                            <div style="color: #00ff88; font-weight: bold; margin-bottom: 4px;">⚡ New Condition Available:</div>
                            <div style="font-size: 10px; line-height: 1.4;">A new medical condition has appeared: <strong>${randomCondition.name}</strong>. Scan to discover!</div>
                        </div>
                    `
                    hintsPanel.style.display = 'block'
                }
                
                console.log('✨ Added dynamic condition:', randomCondition.name)
            }
        }
    }



    private setupPhaseManagement() {
        // AGGRESSIVE CONSOLIDATION: Use new InteractiveTutorial instead of old static screens
        this.phaseManager.onPhaseChange(GamePhase.WELCOME, () => {
            this.updatePanelForPhase('welcome')
            // Start the tutorial immediately when entering WELCOME phase
            setTimeout(() => {
                this.startInteractiveTutorial()
            }, 100)
        })

        this.phaseManager.onPhaseChange(GamePhase.ACTIVE, () => {
            this.gameManager.updateState({ phase: 'scanning' })
            this.updatePhaseDisplay()
            this.updatePanelForPhase('active')
            this.startDiagnosticSession()
        })
    }

    private async startInteractiveTutorial() {
        // ENHANCEMENT FIRST: Initialize new interactive tutorial system with game system references
        this.tutorial = new InteractiveTutorial({
            onStepComplete: (stepId) => {
                console.log('✅ Tutorial step completed:', stepId)
            },
            onTutorialComplete: () => {
                console.log('🎉 Tutorial complete!')
                // Transition to READY first, then to ACTIVE
                this.phaseManager.transitionTo(GamePhase.READY)
                // Small delay to ensure READY transition completes
                setTimeout(() => {
                    this.phaseManager.transitionTo(GamePhase.ACTIVE)
                }, 100)
            },
            onActionRequired: (action, data) => {
                this.handleTutorialAction(action, data)
            },
            // ENHANCEMENT FIRST: Pass references to enable real scanning during tutorial
            xRayEffect: this.xRayEffect,
            scanFeedbackSystem: this.scanFeedbackSystem,
            diagnosticUI: this,
            audioManager: this.audioManager // Pass audioManager directly
        })

        // Ensure audio context is running before starting tutorial (user interaction context)
        await this.audioManager.ensureAudioContext();
        
        this.tutorial.start()
    }

    private handleTutorialAction(action: string, data?: any) {
        console.log('🎯 Tutorial action required:', action, data)

        // ENHANCEMENT FIRST: Connect tutorial actions to real game mechanics
        switch (action) {
            case 'start-experience':
                // Welcome screen - audio enabled by tutorial itself
                break

            case 'mousemove':
                // User needs to move mouse - tutorial will detect this automatically
                break

            case 'camera-move':
                // User needs to rotate camera - OrbitControls handle this
                break

            case 'scan-start':
                // Start visual feedback for scanning practice
                if (this.scanFeedbackSystem && data?.highlightArea) {
                    this.startTutorialScanFeedback(data.highlightArea)
                }
                break

            case 'scan-demo':
                // Handle scan demo for tutorial
                this.handleScanDemo()
                break

            case 'scan-progress-100':
                // Monitor scan progress during tutorial
                if (this.xRayEffect) {
                    this.monitorTutorialScanProgress()
                }
                break

            case 'click-condition':
                // Enable condition discovery in tutorial mode
                this.enableTutorialConditionDiscovery()
                break

            case 'acknowledge':
            case 'start-game':
                // These are handled by tutorial button clicks
                break

            default:
                console.warn('Unknown tutorial action:', action)
        }
    }

    private startTutorialScanFeedback(area: string) {
        // ENHANCEMENT FIRST: Show visual scan feedback during tutorial
        console.log('🔍 Starting tutorial scan feedback for:', area)

        // Get approximate position for the highlighted area
        const positions: Record<string, [number, number, number]> = {
            'head': [0, 1, 0],
            'chest': [0, 0, 0],
            'torso': [0, -0.5, 0]
        }

        const pos = positions[area] || [0, 0, 0]
        const position = new THREE.Vector3(pos[0], pos[1], pos[2])

        // Start scan feedback visualization
        if (this.scanFeedbackSystem) {
            console.log('📊 ScanFeedbackSystem available:', !!this.scanFeedbackSystem)
            try {
                this.scanFeedbackSystem.startScanning('tutorial-scan', position)
                console.log('✅ Scan feedback started')
            } catch (error) {
                console.error('❌ Scan feedback failed:', error)
            }
        } else {
            console.warn('⚠️ ScanFeedbackSystem not available, skipping visual feedback.')
        }

        // ENHANCEMENT FIRST: Auto-complete this step after scan starts
        console.log('⏱️ Setting up tutorial auto-progression...')
        setTimeout(() => {
            console.log('🔔 Calling actionPerformed for scan-start')
            if (this.tutorial) {
                this.tutorial.actionPerformed('scan-start', true)
            } else {
                console.warn('⚠️ Tutorial system not available')
            }
        }, 1500) // Reduced to 1.5 seconds for faster progression
    }

    private handleScanDemo() {
        // Handle the scan-demo action for tutorial
        console.log('🔍 Handling scan demo for tutorial')
        // No special handling needed, just let tutorial auto-progress
    }

    private monitorTutorialScanProgress() {
        // ENHANCEMENT FIRST: Simulate scan progress for tutorial
        console.log('🔄 Scanning completes automatically in tutorial mode')
        let progress = 0
        const interval = setInterval(() => {
            progress += 5 // Increase by 5% per update for faster completion

            if (this.tutorial) {
                this.tutorial.updateProgress(progress)
            }

            if (this.scanFeedbackSystem) {
                this.scanFeedbackSystem.updateScanProgress('tutorial-scan', progress / 100)
            }

            if (progress >= 100) {
                clearInterval(interval)

                console.log('✅ Scan progress complete')
                // Notify tutorial of completion
                if (this.tutorial) {
                    this.tutorial.actionPerformed('scan-progress-100', true)
                }
                if (this.scanFeedbackSystem) {
                    this.scanFeedbackSystem.stopScanning('tutorial-scan')
                }
            }
        }, 50) // Update every 50ms for faster completion
    }

    private enableTutorialConditionDiscovery() {
        // ENHANCEMENT FIRST: Allow discovering a tutorial condition
        console.log('🎯 Tutorial condition discovery enabled')

        // In tutorial mode, auto-discover first condition after a brief delay
        setTimeout(() => {
            if (this.xRayEffect) {
                const conditions = this.xRayEffect.getVisibleConditions()
                if (conditions.length > 0) {
                    console.log('🔍 Auto-discovering condition:', conditions[0])
                    // Discover the first visible condition
                    this.discoverCondition(conditions[0])

                    // Notify tutorial
                    if (this.tutorial) {
                        this.tutorial.actionPerformed('click-condition', true)
                        console.log('✅ Condition discovery complete')
                    }
                } else {
                    console.warn('⚠️ No visible conditions for tutorial discovery')
                    // Force progression anyway
                    if (this.tutorial) {
                        this.tutorial.actionPerformed('click-condition', true)
                    }
                }
            } else {
                console.warn('⚠️ XRayEffect not available for condition discovery')
                // Force progression anyway
                if (this.tutorial) {
                    this.tutorial.actionPerformed('click-condition', true)
                }
            }
        }, 1000) // Faster delay
    }

    private updatePanelForPhase(phase: string) {
        if (!this.panel) return

        const titleElement = this.panel.querySelector('#panel-title') as HTMLElement
        const subtitleElement = this.panel.querySelector('#panel-subtitle') as HTMLElement
        const scanProgressElement = this.panel.querySelector('#scan-progress') as HTMLElement

        switch (phase) {
            case 'welcome':
            case 'tutorial':
            case 'exploration':
            case 'ready':
                if (titleElement) titleElement.textContent = '🏥 X-RAI MEDICAL SIMULATOR'
                if (subtitleElement) subtitleElement.textContent = 'Preparing diagnostic session...'
                if (scanProgressElement) {
                    scanProgressElement.innerHTML = `
                        <div style="color: #00ff88; font-size: 12px; margin-bottom: 1rem; text-align: center; letter-spacing: 1px;">📋 SYSTEM STATUS</div>
                        <div style="text-align: center; padding: 1rem; background: rgba(0,255,136,0.1); border-radius: 8px;">
                            <div style="color: #ffaa00; margin-bottom: 0.5rem;">⏸️ Diagnostic Session Not Started</div>
                            <div style="font-size: 12px; opacity: 0.8;">Complete onboarding to begin diagnosis</div>
                        </div>
                    `
                }
                break
            case 'active':
                if (titleElement) titleElement.textContent = '🏥 MEDICAL DIAGNOSTIC SYSTEM'
                if (subtitleElement) subtitleElement.textContent = 'AI-Powered Medical Analysis & Training'
                if (scanProgressElement) {
                    scanProgressElement.innerHTML = `
                        <div style="color: #00ff88; font-size: 12px; margin-bottom: 1rem; text-align: center; letter-spacing: 1px;">🔍 SCANNING PROGRESS</div>
                        <div id="progress-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
                    `
                }
                break
        }
    }

    private updatePhaseDisplay() {
        if (!this.panel) return

        const gameState = this.gameManager.getGameState()

        const phaseElement = this.panel.querySelector('#phase') as HTMLElement
        if (phaseElement) {
            const phaseColors: Record<string, string> = {
                'scanning': '#00ff88',
                'analyzing': '#ffaa00',
                'solved': '#44ff44'
            }
            phaseElement.textContent = gameState.phase.charAt(0).toUpperCase() + gameState.phase.slice(1)
            phaseElement.style.color = phaseColors[gameState.phase] || '#ffffff'
        }

        const scoreElement = this.panel.querySelector('#score') as HTMLElement
        const streakElement = this.panel.querySelector('#streak') as HTMLElement
        if (scoreElement && streakElement) {
            scoreElement.textContent = gameState.score.toString()
            streakElement.textContent = gameState.streak.toString()
        }
    }

    updateScanProgress(conditionId: string, progress: number) {
        this.scanProgress.set(conditionId, progress)
        // Update progress in the game status panel
        this.gameStatusPanel?.updateScanProgress(conditionId, progress)

        // Provide contextual hints based on scanning progress
        this.updateContextualHints(conditionId, progress)
    }

    private updateContextualHints(conditionId: string, progress: number) {
        const gameState = this.gameManager.getGameState()
        if (gameState.hintsUsed >= 3) return

        const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId)
        if (!condition) return

        // Show progressive hints based on scan progress
        let hintMessage = ''

        if (progress > 0.2 && progress < 0.4) {
            hintMessage = `🔍 Focus your scan on the ${condition.requiredModel} region. Look for subtle abnormalities in tissue density and structure.`
        } else if (progress > 0.6 && progress < 0.8) {
            hintMessage = `📋 Consider the patient's symptoms: ${condition.symptoms.slice(0, 2).join(', ')}. This may indicate ${condition.severity} severity involvement.`
        } else if (progress > 0.9) {
            hintMessage = `💡 Nearly there! Review the anatomical landmarks and correlate with clinical presentation for final diagnosis.`
        }

        if (hintMessage) {
            // Add hint to the learning progress panel
            this.learningProgressPanel?.addContextualHint(conditionId, hintMessage)
        }
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

    analyzeCondition(condition: any) {
        console.log('🔍 Analyzing condition:', condition.name)

        // Play analysis sound through audio management system
        this.audioManagementSystem.playSound(SoundType.AI_PROCESSING)

        // Update game state in manager
        this.gameManager.updateState({ phase: 'analyzing' })
        this.updatePhaseDisplay()

        // Show analysis section
        this.showAnalysisSection(condition)

        // Trigger AI analysis
        this.performAIAnalysis(condition)
    }

    private async performAIAnalysis(condition: any) {
        try {
            const analysisContent = this.panel?.querySelector('#analysis-content') as HTMLElement
            if (analysisContent) {
                analysisContent.innerHTML = '<div style="color: #ffaa00;">🔄 Analyzing with Cerebras AI...</div>'
                analysisContent.style.display = 'block'
            }

            // 🤖 ACTUAL CEREBRAS AI INTEGRATION
            console.log('🧠 Calling Cerebras AI for medical analysis...')

            // Use Cerebras service for streaming medical analysis
            let fullAnalysis = ''
            const gameState = this.gameManager.getGameState()

            try {
                // Get current patient case for context
                const patientCase = gameState.patientCase

                // Generate AI analysis using Cerebras/Llama through public API
                const cerebrasService = this.workflowManager.getCerebrasService()
                const analysisGenerator = cerebrasService?.analyzeMedicalCondition(condition)

                if (analysisGenerator) {
                    console.log('🔄 Streaming AI analysis...')
                    for await (const chunk of analysisGenerator) {
                        fullAnalysis += chunk
                        // Update UI with streaming text in real-time
                        if (analysisContent) {
                            analysisContent.innerHTML = `
                                <div style="color: #00ff88; margin-bottom: 0.5rem;">🔄 Streaming Analysis...</div>
                                <div style="color: #cccccc; font-size: 10px; line-height: 1.3;">${fullAnalysis}</div>
                            `
                        }
                    }
                } else {
                    // Fallback if Cerebras service not available
                    fullAnalysis = await this.generateFallbackAnalysis(condition, patientCase)
                }

                if (analysisContent) {
                    analysisContent.innerHTML = `
                        <div style="color: #00ff88; margin-bottom: 0.5rem;">✅ Cerebras AI Analysis Complete</div>
                        <div style="color: #cccccc; font-size: 10px; line-height: 1.3;">${fullAnalysis}</div>
                    `
                }

                console.log('✅ Cerebras AI analysis completed successfully')
                
                // Show AI analysis in patient chat panel
                this.patientChatPanel?.showAIAnalysis({
                    summary: `Analysis of ${condition.name} completed`,
                    findings: [
                        `Condition: ${condition.name}`,
                        `Severity: ${condition.severity}`,
                        `Key symptoms: ${condition.symptoms.slice(0, 3).join(', ')}`,
                        `Treatment approach: ${condition.treatment[0]}`
                    ]
                });

            } catch (cerebrasError) {
                console.warn('Cerebras analysis failed, generating fallback analysis:', cerebrasError)
                fullAnalysis = await this.generateFallbackAnalysis(condition, gameState.patientCase)

                if (analysisContent) {
                    analysisContent.innerHTML = `
                        <div style="color: #ffaa00; margin-bottom: 0.5rem;">⚠️ Using Enhanced Analysis</div>
                        <div style="color: #cccccc; font-size: 10px; line-height: 1.3;">${fullAnalysis}</div>
                    `
                }
                
                // Show fallback analysis in patient chat panel
                this.patientChatPanel?.showAIAnalysis({
                    summary: `Enhanced analysis of ${condition.name} completed`,
                    findings: [
                        `Condition: ${condition.name}`,
                        `Severity: ${condition.severity}`,
                        `Key symptoms: ${condition.symptoms.slice(0, 3).join(', ')}`,
                        `Treatment approach: ${condition.treatment[0]}`
                    ]
                });
            }

            // Award points for AI analysis completion
            this.awardPoints(75, 'ai_analysis')

        } catch (error) {
            console.error('AI Analysis system failed:', error)
            const analysisContent = this.panel?.querySelector('#analysis-content') as HTMLElement
            if (analysisContent) {
                analysisContent.innerHTML = '<div style="color: #ff4444;">❌ Analysis system unavailable</div>'
            }
        }
    }

    private async generateFallbackAnalysis(condition: any, patientCase: any): Promise<string> {
        // Generate enhanced fallback analysis when Cerebras is unavailable
        const patientContext = patientCase ? `
            Patient: ${patientCase.patientName}, Age: ${patientCase.age}
            Chief Complaint: ${patientCase.chiefComplaint}
            History: ${patientCase.historyOfPresentIllness?.substring(0, 100)}...
        ` : ''

        return `
            Enhanced Medical Analysis of ${condition.name}:

            📋 Clinical Presentation:
            ${patientContext}

            🔍 Radiological Findings:
            • Location: ${condition.requiredModel} region
            • Severity: ${condition.severity} grade pathology
            • Characteristics: ${condition.description}

            💊 Recommended Management:
            • Immediate: ${condition.treatment[0] || 'Clinical correlation required'}
            • Follow-up: Consider specialist consultation
            • Monitoring: Serial imaging may be indicated

            📚 Educational Notes:
            This condition represents ${condition.severity} severity pathology requiring
            prompt clinical attention and appropriate specialist referral.

            🎯 Key Learning Points:
            • Recognize characteristic imaging findings
            • Correlate with clinical presentation
            • Initiate appropriate treatment protocols
        `
    }

    private showAnalysisSection(condition: any) {
        if (!this.panel) return

        const analysisSection = this.panel.querySelector('#analysis-section') as HTMLElement
        if (analysisSection) {
            analysisSection.style.display = 'block'
        }
    }

    discoverCondition(conditionId: string) {
        const gameState = this.gameManager.getGameState()
        if (gameState.discoveredConditions.has(conditionId)) return

        console.log('✅ Condition discovered:', conditionId)

        const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId)
        if (condition) {
            // Update game state in manager using consolidated method
            const newDiscoveredConditions = new Set(gameState.discoveredConditions)
            newDiscoveredConditions.add(conditionId)
            this.gameManager.updateState({ discoveredConditions: newDiscoveredConditions })

            // Calculate contextual points based on multiple factors
            const basePoints = this.calculateDiscoveryPoints(condition)
            const timeBonus = this.calculateTimeBonus()
            const streakMultiplier = gameState.streak * 0.1 + 1
            const totalPoints = Math.floor((basePoints + timeBonus) * streakMultiplier)

            // Play discovery sound based on severity through audio management system
            this.audioManagementSystem.playDiscoverySound(condition.severity)

            // Award points with enhanced feedback
            this.awardPoints(totalPoints, 'discovery')

            // Update learning progress
            this.updateLearningProgress(conditionId, 'discovery')

            // Check for achievements
            this.checkAchievements('discovery', { condition, points: totalPoints })

            // Update UI
            this.updateProgressDisplay()

            // Check if diagnosis is complete
            this.checkDiagnosisComplete()
        }
    }

    private calculateDiscoveryPoints(condition: any): number {
        const gameState = this.gameManager.getGameState()
        const basePoints: Record<string, number> = { 'low': 100, 'medium': 200, 'high': 300 }
        let points = basePoints[condition.severity] || 150

        // Difficulty multiplier
        const difficultyMultiplier: Record<string, number> = { 'easy': 0.8, 'medium': 1.0, 'hard': 1.3 }
        points *= difficultyMultiplier[gameState.difficulty]

        // Learning progress bonus (repeat conditions give fewer points)
        const learningProgress = gameState.learningProgress.get(condition.id) || 0
        const learningMultiplier = Math.max(0.3, 1.0 - (learningProgress * 0.2))
        points *= learningMultiplier

        return Math.floor(points)
    }

    private calculateTimeBonus(): number {
        const gameState = this.gameManager.getGameState()
        const elapsedTime = (Date.now() - gameState.sessionStartTime) / 1000
        const timeRatio = elapsedTime / gameState.timeRemaining

        // Bonus for quick discoveries
        if (timeRatio < 0.3) return 50
        if (timeRatio < 0.6) return 25
        return 0
    }

    private updateLearningProgress(conditionId: string, activity: string) {
        const gameState = this.gameManager.getGameState()
        const current = gameState.learningProgress.get(conditionId) || 0
        const newLearningProgress = new Map(gameState.learningProgress)
        newLearningProgress.set(conditionId, Math.min(current + 0.1, 1.0))

        this.gameManager.updateState({ learningProgress: newLearningProgress })
    }

    private checkAchievements(type: string, data: any) {
        const gameState = this.gameManager.getGameState()
        const achievements = {
            'first_discovery': () => gameState.discoveredConditions.size === 1,
            'speed_demon': () => this.calculateTimeBonus() >= 50,
            'perfectionist': () => gameState.accuracy >= 0.9,
            'streak_master': () => gameState.streak >= 5,
            'learning_enthusiast': () => gameState.learningProgress.size >= 3,
            'efficiency_expert': () => gameState.efficiency >= 0.8
        }

        Object.entries(achievements).forEach(([achievementId, check]) => {
            if (check() && !gameState.achievements.has(achievementId)) {
                this.unlockAchievement(achievementId)
            }
        })
    }

    private unlockAchievement(achievementId: string) {
        const gameState = this.gameManager.getGameState()
        const newAchievements = new Set(gameState.achievements)
        newAchievements.add(achievementId)

        this.gameManager.updateState({ achievements: newAchievements })
        this.showAchievementNotification(achievementId)
        this.awardPoints(100, 'achievement')
    }

    private showAchievementNotification(achievementId: string) {
        // This method is now handled by the AchievementPanel
        // The achievement notification is shown in the achievement panel
        const achievement = this.achievementSystem.getAchievement(achievementId);
        if (achievement) {
            this.achievementPanel?.showAchievementNotification(achievement);
        }
    }

    private awardPoints(points: number, reason: string) {
        const gameState = this.gameManager.getGameState()
        const newScore = gameState.score + points
        const newStreak = gameState.streak + 1

        // Bonus points for streak
        const streakBonus = newStreak > 1 ? newStreak * 10 : 0
        const finalScore = newScore + streakBonus

        // Update game state in manager using consolidated method
        this.gameManager.updateState({ score: finalScore, streak: newStreak })

        // Update efficiency metrics
        this.updateEfficiencyMetrics()

        this.updatePhaseDisplay()
        this.updateLearningDisplay()

        // Visual feedback for points
        this.showPointsFeedback(points, reason)
    }

    private updateEfficiencyMetrics() {
        const gameState = this.gameManager.getGameState()
        const elapsedTime = (Date.now() - gameState.sessionStartTime) / 1000
        const conditionsFound = gameState.discoveredConditions.size

        // Efficiency = conditions found per minute
        const efficiency = Math.min((conditionsFound / (elapsedTime / 60)) / 2, 1.0) // Normalize to 0-1

        // Accuracy = average learning progress across discovered conditions
        let accuracy = 0
        if (conditionsFound > 0) {
            let totalProgress = 0
            gameState.discoveredConditions.forEach((conditionId: string) => {
                totalProgress += gameState.learningProgress.get(conditionId) || 0
            })
            accuracy = totalProgress / conditionsFound
        }

        this.gameManager.updateState({ accuracy, efficiency })
    }

    private updateLearningDisplay() {
        if (!this.panel) return

        // Learning display is now handled by the LearningProgressPanel
        // This method is kept for backward compatibility but does nothing
    }

    private getPerformanceColor(value: number): string {
        if (value >= 0.8) return '#00ff88'
        if (value >= 0.6) return '#ffaa00'
        return '#ff4444'
    }

    private showPointsFeedback(points: number, reason: string) {
        // Create floating points indicator with premium styling
        const indicator = document.createElement('div')
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: ${spacing.sm};">
                <div style="font-size: ${typography.fontSize['3xl']};">${reason === 'discovery' ? '🔍' : '🧠'}</div>
                <div>
                    <div style="color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.xl}; text-shadow: ${effects.textShadow.md};">+${points}</div>
                    <div style="color: ${colors.neutral.lightest}cc; font-size: ${typography.fontSize.sm}; letter-spacing: ${typography.letterSpacing.wider};">${reason.toUpperCase()}</div>
                </div>
            </div>
        `

        indicator.style.cssText = `
            position: fixed; top: 50%; left: 420px; z-index: ${zIndex.tooltip}; transform: translateY(-50%);
            background: ${colors.background.gradient.panel},
                radial-gradient(circle at 30% 30%, ${colors.background.primaryGlow} 0%, transparent 50%);
            border: ${borders.width.thin} solid ${colors.border.primaryStrong};
            border-radius: ${borders.radius.lg}; padding: ${spacing.md} ${spacing.base};
            box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow}, ${effects.inset.medium};
            backdrop-filter: ${effects.blur.base};
            pointer-events: none;
            animation: premiumFloatUp 3s ${animation.easing.easeOut} forwards;
        `

        document.body.appendChild(indicator)

        // Add CSS animation if not already present
        if (!document.querySelector('#points-animation-styles')) {
            const style = document.createElement('style')
            style.id = 'points-animation-styles'
            style.textContent = `
                @keyframes premiumFloatUp {
                    0% {
                        transform: translateY(-50%) scale(0.8);
                        opacity: 0;
                    }
                    10% {
                        transform: translateY(-50%) scale(1.1);
                        opacity: 1;
                    }
                    70% {
                        transform: translateY(-50%) scale(1) translateY(-100px);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-50%) scale(0.9) translateY(-200px);
                        opacity: 0;
                    }
                }
            `
            document.head.appendChild(style)
        }

        // Remove after animation
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator)
            }
        }, 3000)
    }

    private checkDiagnosisComplete() {
        // ENHANCEMENT FIRST: Show diagnosis submission UI instead of auto-completing
        const gameState = this.gameManager.getGameState()
        const discoveredCount = gameState.discoveredConditions.size

        if (discoveredCount >= 1) { // Show consultation after discovering at least 1 condition
            this.showConsultationButton()
        }

        if (discoveredCount >= 2) { // Allow submission after discovering at least 2 conditions
            this.showDiagnosisSubmissionUI()
        }
    }

    private endDiagnosis(reason: 'complete' | 'timeout') {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }

        if (reason === 'complete') {
            this.audioManagementSystem.playSound(SoundType.CONDITION_FOUND)
            this.showDiagnosisComplete()
        } else {
            this.showDiagnosisTimeout()
        }
    }

    private showDiagnosisComplete() {
        const gameState = this.gameManager.getGameState()
        const accuracy = Math.round((gameState.score / 1000) * 100)
        const timeBonus = gameState.timeRemaining * 2

        // Update final score in manager
        this.gameManager['gameState'] = {
            ...gameState,
            score: gameState.score + timeBonus
        }

        if (this.panel) {
            this.panel.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <div style="color: #00ff88; font-size: 24px; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0,255,136,0.8);">🏆 DIAGNOSIS COMPLETE</div>
                    <div style="background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); border-radius: 12px; padding: 1.5rem; margin: 1rem 0;">
                        <div style="color: #ffffff; margin-bottom: 0.5rem;">Final Score: <span style="color: #00ff88; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px rgba(0,255,136,0.8);">${gameState.score + timeBonus}</span></div>
                        <div style="color: #ffffff; margin-bottom: 0.5rem;">Accuracy: <span style="color: #ffaa00; font-weight: bold;">${accuracy}%</span></div>
                        <div style="color: #ffffff;">Time Bonus: <span style="color: #00ff88; font-weight: bold;">+${timeBonus}</span></div>
                    </div>
                    <div style="color: #00ff88; font-size: 12px; margin-top: 1rem; opacity: 0.9;">Click anywhere to continue</div>
                </div>
            `

            // Make panel clickable to restart
            this.panel.style.cursor = 'pointer'
            this.panel.onclick = () => this.restartDiagnosis()
        }
    }

    private showDiagnosisTimeout() {
        const gameState = this.gameManager.getGameState()
        if (this.panel) {
            this.panel.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <div style="color: #ff4444; font-size: 20px; margin-bottom: 1rem; text-shadow: 0 0 15px rgba(255,68,68,0.6);">⏰ TIME'S UP</div>
                    <div style="background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.3); border-radius: 12px; padding: 1.5rem; margin: 1rem 0;">
                        <div style="color: #ffffff; margin-bottom: 1rem;">Final Score: <span style="color: #ffaa00; font-size: 18px; font-weight: bold;">${gameState.score}</span></div>
                        <div style="color: #cccccc; font-size: 12px;">More practice will improve your speed!</div>
                    </div>
                    <div style="color: #00ff88; font-size: 12px; margin-top: 1rem; opacity: 0.9;">Click to try again</div>
                </div>
            `

            this.panel.style.cursor = 'pointer'
            this.panel.onclick = () => this.restartDiagnosis()
        }
    }

    // ENHANCEMENT FIRST: Add diagnosis submission functionality
    private setupDiagnosisSubmission() {
        if (!this.panel) return

        const submitBtn = this.panel.querySelector('#submit-diagnosis-btn') as HTMLElement
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleDiagnosisSubmission())
        }
    }

    private showDiagnosisSubmissionUI() {
        if (!this.panel) return

        const submissionSection = this.panel.querySelector('#diagnosis-submission') as HTMLElement
        const optionsContainer = this.panel.querySelector('#diagnosis-options') as HTMLElement

        if (submissionSection && optionsContainer) {
            // Show the submission section
            submissionSection.style.display = 'block'

            // REUSE: Get discovered conditions from existing game state
            const gameState = this.gameManager.getGameState()
            const discoveredConditions = Array.from(gameState.discoveredConditions)

            // Create diagnosis options from discovered conditions
            const optionsHTML = discoveredConditions.map(conditionId => {
                const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId)
                if (!condition) return ''

                return `
                    <label class="diagnosis-option" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,150,255,0.1) 100%); border: 1px solid rgba(0,255,136,0.3); border-radius: 6px; margin-bottom: 6px; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;">
                        <input type="checkbox" name="diagnosis" value="${conditionId}" style="accent-color: #00ff88; transform: scale(1.1);">
                        <span style="color: #ffffff; font-size: 11px; flex: 1; font-weight: 500;">${condition.name}</span>
                        <span style="color: #ffaa00; font-size: 9px; opacity: 0.8; font-weight: 600; letter-spacing: 0.5px;">${condition.severity.toUpperCase()}</span>
                    </label>
                `
            }).join('')

            optionsContainer.innerHTML = `
                <div style="color: #cccccc; font-size: 10px; margin-bottom: 8px; letter-spacing: 0.5px; opacity: 0.9;">Select conditions for your final diagnosis:</div>
                ${optionsHTML}
            `

            // Add premium hover effects matching our design ethos
            const labels = optionsContainer.querySelectorAll('label')
            labels.forEach(label => {
                label.addEventListener('mouseenter', () => {
                    label.style.background = 'linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(0,150,255,0.2) 100%)'
                    label.style.borderColor = 'rgba(0,255,136,0.5)'
                    label.style.boxShadow = '0 8px 25px rgba(0,255,136,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                    label.style.transform = 'translateY(-1px)'
                })
                label.addEventListener('mouseleave', () => {
                    label.style.background = 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,150,255,0.1) 100%)'
                    label.style.borderColor = 'rgba(0,255,136,0.3)'
                    label.style.boxShadow = 'none'
                    label.style.transform = 'translateY(0)'
                })
            })
        }
    }

    private handleDiagnosisSubmission() {
        if (!this.panel) return

        // Get selected diagnoses
        const checkboxes = this.panel.querySelectorAll('input[name="diagnosis"]:checked') as NodeListOf<HTMLInputElement>
        const selectedConditions = Array.from(checkboxes).map(cb => cb.value)

        if (selectedConditions.length === 0) {
            this.showSubmissionError('Please select at least one condition for your diagnosis.')
            return
        }

        // CLEAN: Use existing workflow manager for validation
        this.submitFinalDiagnosis(selectedConditions)
    }

    private submitFinalDiagnosis(selectedConditions: string[]) {
        // REUSE: Complete the final diagnosis workflow step
        const success = this.workflowManager.completeWorkflowStep('final_diagnosis', selectedConditions)

        if (success) {
            // Calculate diagnostic accuracy using existing systems
            const accuracy = this.calculateDiagnosticAccuracy(selectedConditions)

            // REUSE: Award points using existing scoring system
            const basePoints = 500
            const accuracyBonus = Math.floor(accuracy * 300)
            const totalPoints = this.gameManager.awardPoints(basePoints + accuracyBonus, 'final_diagnosis', { accuracy, selectedConditions })

            // Complete the workflow and show results
            this.showDiagnosisResults(selectedConditions, accuracy, totalPoints)

            // REUSE: Transition to complete phase using existing phase manager
            this.phaseManager.transitionTo(GamePhase.COMPLETE)
        } else {
            this.showSubmissionError('Unable to submit diagnosis. Please try again.')
        }
    }

    private calculateDiagnosticAccuracy(selectedConditions: string[]): number {
        // REUSE: Get AI-generated differential diagnosis from workflow manager
        const differentialDiagnosis = this.workflowManager.getDifferentialDiagnosis()
        const expectedConditions = differentialDiagnosis.map(d => d.condition.toLowerCase())

        if (expectedConditions.length === 0) {
            // Fallback: Use discovered conditions as baseline
            const gameState = this.gameManager.getGameState()
            const totalDiscovered = gameState.discoveredConditions.size
            const correctSelections = selectedConditions.length
            return Math.min(correctSelections / Math.max(totalDiscovered, 1), 1.0)
        }

        // Calculate accuracy based on AI differential diagnosis
        let correctCount = 0
        selectedConditions.forEach(conditionId => {
            const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId)
            if (condition && expectedConditions.some(expected =>
                expected.includes(condition.name.toLowerCase()) ||
                condition.name.toLowerCase().includes(expected)
            )) {
                correctCount++
            }
        })

        return correctCount / Math.max(selectedConditions.length, 1)
    }

    private showDiagnosisResults(selectedConditions: string[], accuracy: number, totalPoints: number) {
        if (!this.panel) return

        const gameState = this.gameManager.getGameState()
        const selectedConditionNames = selectedConditions.map(id => {
            const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === id)
            return condition?.name || id
        })

        this.panel.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div style="color: #00ff88; font-size: 24px; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0,255,136,0.8);">🏆 DIAGNOSIS SUBMITTED</div>
                
                <div style="background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); border-radius: 12px; padding: 1.5rem; margin: 1rem 0;">
                    <div style="color: #ffaa00; font-size: 14px; margin-bottom: 1rem; font-weight: bold;">YOUR DIAGNOSIS:</div>
                    <div style="color: #ffffff; margin-bottom: 1rem; font-size: 12px;">
                        ${selectedConditionNames.map(name => `• ${name}`).join('<br>')}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,255,136,0.2);">
                        <div style="text-align: left;">
                            <div style="color: #ffffff; font-size: 11px;">Diagnostic Accuracy:</div>
                            <div style="color: ${this.getPerformanceColor(accuracy)}; font-size: 16px; font-weight: bold;">${Math.round(accuracy * 100)}%</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="color: #ffffff; font-size: 11px;">Final Score:</div>
                            <div style="color: #00ff88; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px rgba(0,255,136,0.8);">${gameState.score}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #ffffff; font-size: 11px;">Time Bonus:</div>
                            <div style="color: #ffaa00; font-size: 16px; font-weight: bold;">+${gameState.timeRemaining * 2}</div>
                        </div>
                    </div>
                </div>
                
                <div style="color: #00ff88; font-size: 12px; margin-top: 1rem; opacity: 0.9;">Click anywhere to continue</div>
            </div>
        `

        // Make panel clickable to restart
        this.panel.style.cursor = 'pointer'
        this.panel.onclick = () => this.restartDiagnosis()

        // Play completion sound through audio management system
        this.audioManagementSystem.playSound(SoundType.CONDITION_FOUND)
    }

    private showSubmissionError(message: string) {
        // Show temporary error message
        const errorDiv = document.createElement('div')
        errorDiv.innerHTML = `
            <div style="background: ${colors.error.base}ee; color: ${colors.neutral.white}; padding: ${spacing.md}; border-radius: ${borders.radius.md}; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: ${zIndex.modal}; text-align: center; font-size: ${typography.fontSize.lg}; box-shadow: ${effects.shadow.md};">
                ⚠️ ${message}
            </div>
        `

        document.body.appendChild(errorDiv)

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv)
            }
        }, 3000)
    }

    // ENHANCEMENT FIRST: Voice consultation system integration
    private setupVoiceConsultation() {
        if (!this.panel) return

        const consultationBtn = this.panel.querySelector('#consultation-btn') as HTMLElement
        if (consultationBtn) {
            consultationBtn.addEventListener('click', () => this.startVoiceConsultation())
        }
    }

    private showConsultationButton() {
        if (!this.panel) return

        const consultationBtn = this.panel.querySelector('#consultation-btn') as HTMLElement
        const actionButtons = this.panel.querySelector('#action-buttons') as HTMLElement

        if (consultationBtn && actionButtons) {
            consultationBtn.style.display = 'flex'
            actionButtons.style.display = 'flex'
        }
    }

    private async startVoiceConsultation() {
        const gameState = this.gameManager.getGameState()
        const patientCase = this.workflowManager.getCurrentCase()

        // REUSE: Build consultation context from existing game state
        const context: ConsultationContext = {
            patientCase: patientCase,
            discoveredConditions: gameState.discoveredConditions,
            scanProgress: this.scanProgress,
            timeRemaining: gameState.timeRemaining,
            gamePhase: gameState.phase,
            currentScore: gameState.score
        }

        console.log('🎙️ Starting voice consultation with context:', context)

        const success = await this.voiceConsultation.startConsultation(context)
        if (!success) {
            this.showSubmissionError('Unable to start consultation. Please try again.')
        }
    }

    // CLEAN: Handle consultation lifecycle events
    private handleConsultationStarted(session: any) {
        console.log('🎙️ Consultation started:', session.id)
        // Instead of showing a separate overlay, we'll focus on the patient chat panel
        this.focusOnPatientChatPanel()
        this.pauseGameForConsultation()
    }

    private handleGuidanceReceived(guidance: string) {
        console.log('🧠 Guidance received:', guidance.substring(0, 100) + '...')
        // The patient chat panel will handle displaying the guidance
        // We don't need to show it in a separate overlay
    }

    private handleConsultationEnded(insights: string[]) {
        console.log('🎙️ Consultation ended with', insights.length, 'insights')
        // The patient chat panel will handle the consultation ending
        this.resumeGameFromConsultation()
        this.showConsultationInsights(insights)
    }

    private focusOnPatientChatPanel() {
        // Ensure the patient chat panel is visible and brought to focus
        if (this.patientChatPanel) {
            // Make sure the panel is shown and not minimized
            // The show() method should make sure the panel is created and visible
            this.patientChatPanel.show();
            
            // If the panel was minimized, restore it
            // We don't have direct access to the minimized state, so we'll ensure the panel is in normal state
            const panel = document.querySelector('.patient-chat-panel') as HTMLElement;
            if (panel) {
                // Make sure the panel is not hidden (in case it was minimized)
                const content = panel.querySelector('.panel-content') as HTMLElement;
                if (content) {
                    content.style.display = 'flex';
                }
                
                // Set a visual indicator that consultation is active
                const header = panel.querySelector('.panel-header') as HTMLElement;
                if (header) {
                    header.style.background = 'linear-gradient(135deg, rgba(0,255,136,0.3), rgba(0,150,255,0.3))';
                }
                
                // Bring panel to front by increasing z-index
                panel.style.zIndex = '9999';
            }
            
            console.log('🔍 Patient chat panel is now active and focused for consultation');
        } else {
            console.warn('Patient chat panel not available for consultation');
        }
    }

    // PERFORMANT: Pause game state during consultation
    private pauseGameForConsultation() {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }

        // Dim the 3D scene (if accessible)
        this.emit('gamePaused')
        console.log('⏸️ Game paused for consultation')
    }

    // PERFORMANT: Resume game state after consultation
    private resumeGameFromConsultation() {
        this.gameStatusPanel?.show()
        this.emit('gameResumed')
        console.log('▶️ Game resumed from consultation')
    }

    private async endVoiceConsultation() {
        const insights = await this.voiceConsultation.endConsultation()
        console.log('🎙️ Consultation ended with insights:', insights)
    }

    private showConsultationInsights(insights: string[]) {
        if (insights.length === 0) return

        // Add insights to the learning progress panel
        insights.forEach((insight, index) => {
            this.learningProgressPanel?.addContextualHint(`consultation-${index}`, insight)
        })
    }

    // MODULAR: Event emission for external systems
    private emit(event: string, data?: any) {
        // Could integrate with external game systems if needed
        console.log('🎮 Game event:', event, data)
    }

    private restartDiagnosis() {
        // Reset game state with enhanced properties using the gameManager
        const currentGameState = this.gameManager.getGameState()
        
        this.gameManager.resetGameState(currentGameState.difficulty);
        this.scanProgress.clear()

        // Recreate the panel
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel)
        }
        this.createDiagnosticPanel()
        this.gameStatusPanel?.show()
    }

    private getTimeForDifficulty(): number {
        const gameState = this.gameManager.getGameState()
        const timeMap: Record<string, number> = { 'easy': 420, 'medium': 300, 'hard': 240 } // 7min, 5min, 4min
        return timeMap[gameState.difficulty] || 300
    }

    destroy() {
        // Clean up resources
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }

        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel)
        }

        // ENHANCEMENT FIRST: Clean up patient chat panel
        this.patientChatPanel?.destroy()
        
        // ENHANCEMENT FIRST: Clean up achievement panel
        this.achievementPanel?.destroy()
        
        // ENHANCEMENT FIRST: Clean up learning progress panel
        this.learningProgressPanel?.destroy()
        
        // ENHANCEMENT FIRST: Clean up game status panel
        this.gameStatusPanel?.destroy()

        this.scanProgress.clear()
        this.isInitialized = false
    }

    private updatePatientInfoDisplay() {
        // Update patient information in the UI when a new case is generated
        const gameState = this.gameManager.getGameState()
        if (gameState.patientCase && this.panel) {
            // Could add patient info section to the diagnostic panel
            console.log('Patient case updated:', gameState.patientCase.patientName)
        }
    }

    private handleWorkflowStepCompletion(step: any) {
        // Handle completion of medical workflow steps
        console.log('Workflow step completed:', step.name)
        // Could trigger UI updates or progress indicators
    }

    private showNFTRewardNotification(nftReward: any) {
        // Show notification for newly minted NFT rewards
        const indicator = document.createElement('div')
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: ${spacing.sm};">
                <div style="font-size: ${typography.fontSize['3xl']};">🏆</div>
                <div>
                    <div style="color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.lg};">NFT MINTED!</div>
                    <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.md};">${nftReward.name}</div>
                </div>
            </div>
        `

        indicator.style.cssText = `
            position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
            background:
                linear-gradient(135deg, ${colors.accent.base}ee 0%, ${colors.accent.dark}ee 100%),
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%);
            border: ${borders.width.base} solid ${colors.accent.base};
            border-radius: ${borders.radius.lg}; padding: ${spacing.md} ${spacing.base};
            box-shadow: ${effects.shadow.lg}, ${effects.shadow.accentGlow};
            z-index: ${zIndex.notification}; pointer-events: none;
            animation: achievementSlideDown 4s ${animation.easing.easeOut} forwards;
        `

        document.body.appendChild(indicator)

        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator)
            }
        }, 4000)
    }


    private async startDiagnosticSession() {
        // Generate AI-powered patient case and start the diagnostic session
        console.log('🚀 Starting AI-powered diagnostic session...')

        // Ensure audio context is running (needed for Web Audio API policies)
        await this.audioManager.ensureAudioContext();

        // Show the game status panel
        this.gameStatusPanel?.show()

        try {
            // Generate realistic patient case using Cerebras AI
            const patientCase = await this.workflowManager.generatePatientCase('head', 'medium')

            // Generate contextual audio environment using ElevenLabs
            await this.generateContextualAudioEnvironment(patientCase)

            // Update UI with patient information
            this.updatePatientInfoInPanel(patientCase)

            // ENHANCEMENT FIRST: Show patient chat panel with generated case
            this.patientChatPanel?.show(patientCase)
            
            // ENHANCEMENT FIRST: Show achievement panel with initial performance data
            const gameState = this.gameManager.getGameState();
            this.achievementPanel?.show({
                accuracy: gameState.accuracy,
                efficiency: gameState.efficiency,
                streak: gameState.streak,
                achievementsCount: gameState.achievements.size,
                totalAchievements: this.achievementSystem.getAllAchievements().length
            })
            
            // ENHANCEMENT FIRST: Show learning progress panel with initial learning data
            this.learningProgressPanel?.show({
                conditionsDiscovered: gameState.discoveredConditions.size,
                accuracy: gameState.accuracy,
                streak: gameState.streak,
                conditionsLearned: gameState.learningProgress.size,
                totalConditions: Object.keys(MEDICAL_CONDITIONS).length
            })

            console.log('✅ AI case generated:', patientCase.patientName)
            console.log('🎵 Contextual audio environment created')

        } catch (error) {
            console.warn('AI integration failed, using fallback:', error)
            this.startFallbackDiagnosticSession()
        }
    }

    private async integrateAICaseData(patientCase: any) {
        // Integrate AI-generated case data into the diagnostic session
        console.log('🔗 Integrating AI case data:', patientCase.patientName)

        // Update patient information in the diagnostic panel
        this.updatePatientInfoInPanel(patientCase)

        // Update patient chat panel if it exists
        this.patientChatPanel?.updatePatientInfo(patientCase)
        
        // Show case generation details in patient chat panel
        this.patientChatPanel?.showCaseGenerationDetails({
            model: patientCase.requiredModel,
            complexity: 'medium',
            generationTime: Math.floor(Math.random() * 1000) + 500 // Simulated generation time
        });

        // Generate contextual audio based on case
        await this.generateContextualAudioEnvironment(patientCase)
    }

    private async generateContextualAudioEnvironment(patientCase: any) {
        // Use ElevenLabs to generate contextual audio environment
        try {
            const context = {
                caseType: patientCase.chiefComplaint,
                patientAge: patientCase.age,
                severity: 'medium' as const, // Properly typed as literal type
                phase: 'scanning' as const,
                anatomicalRegion: patientCase.requiredModel
            }

            // Generate contextual hospital ambience using ElevenLabs
            if (this.audioManager && typeof this.audioManager.generateContextualAudio === 'function') {
                await this.audioManager.generateContextualAudio(context)
            }

            // Generate case-specific audio cues
            if (patientCase.chiefComplaint.toLowerCase().includes('chest') ||
                patientCase.chiefComplaint.toLowerCase().includes('heart')) {
                await this.generateCardiacAudioEnvironment(patientCase)
            }

            console.log('🎵 AI-generated contextual audio environment created')

        } catch (error) {
            console.warn('ElevenLabs audio generation failed:', error)
            // Fallback to procedural audio
            if (this.audioManager && typeof this.audioManager.startHospitalAmbience === 'function') {
                this.audioManager.startHospitalAmbience()
            }
        }
    }

    private async generateCardiacAudioEnvironment(patientCase: any) {
        // Generate cardiac-specific audio environment using ElevenLabs
        try {
            const cardiacContext = {
                caseType: 'cardiac_monitoring',
                patientAge: patientCase.age,
                severity: 'medium' as const,
                phase: 'scanning' as const,
                anatomicalRegion: 'chest'
            }

            await this.audioManager.generateContextualAudio(cardiacContext)
            console.log('💓 Cardiac audio environment generated')

        } catch (error) {
            console.warn('Cardiac audio generation failed:', error)
        }
    }

    private updatePatientInfoInPanel(patientCase: any) {
        // Update the diagnostic panel with AI-generated patient information
        if (!this.panel) return

        // Remove existing patient info if it exists
        const existingPatientInfo = this.panel.querySelector('.patient-info-section')
        if (existingPatientInfo) {
            existingPatientInfo.remove()
        }

        // Extract consistent data from AI content with better fallbacks for medical cases
        const patientName = patientCase.patientName || patientCase.conditionName || 'Anonymous Patient'
        const age = patientCase.age || patientCase.patientInfo?.age || 35
        const gender = patientCase.gender || patientCase.patientInfo?.gender || 'Unknown'
        const chiefComplaint = patientCase.chiefComplaint || patientCase.patientInfo?.chiefComplaint || 'Diagnostic evaluation required'
        const conditionName = patientCase.conditionName || patientCase.patientInfo?.conditionName || 'Unknown Condition'
        const conditionDescription = patientCase.conditionDescription || patientCase.patientInfo?.conditionDescription || 'Condition details not available'
        const conditionLocation = patientCase.conditionLocation || patientCase.patientInfo?.conditionLocation || 'Location not specified'

        // Use first 150 characters of HPI for better display
        const hpi = patientCase.historyOfPresentIllness || patientCase.aiDescription || patientCase.patientInfo?.medicalHistory || 'Patient requires comprehensive diagnostic assessment.'
        const displayHPI = hpi.length > 150 ? hpi.substring(0, 150) + '...' : hpi

        // Create new patient info section with enhanced medical case details
        const patientInfoSection = `
            <div class="patient-info-section" style="background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.2); border-radius: 8px; padding: 1rem; margin-top: 1rem; cursor: pointer; transition: all 0.3s ease;" onclick="this.classList.toggle('expanded')">
                <div style="color: #00ff88; font-size: 10px; margin-bottom: 0.25rem; letter-spacing: 1px;">🔍 CURRENT CASE: ${conditionName}</div>
                <div style="color: #00ff88; font-size: 10px; margin-bottom: 0.5rem; letter-spacing: 1px;">👤 PATIENT INFORMATION <span style="float: right; font-size: 8px; opacity: 0.7;">Click to expand</span></div>
                <div style="font-size: 10px; color: #fff; margin-bottom: 0.25rem;"><strong>Name:</strong> ${patientName}</div>
                <div style="font-size: 10px; color: #fff; margin-bottom: 0.25rem;"><strong>Age:</strong> ${age} | <strong>Gender:</strong> ${gender}</div>
                <div style="font-size: 10px; color: #ffaa00; margin-bottom: 0.25rem;"><strong>Chief Complaint:</strong> ${chiefComplaint}</div>
                <div style="font-size: 10px; color: #ff5555; margin-bottom: 0.25rem;"><strong>Condition:</strong> ${conditionDescription}</div>
                <div style="font-size: 10px; color: #ff5555; margin-bottom: 0.5rem;"><strong>Location:</strong> ${conditionLocation}</div>
                <div class="hpi-content" style="font-size: 9px; color: #ccc; line-height: 1.3;"><strong>HPI:</strong> <span class="hpi-short">${displayHPI}</span><span class="hpi-full" style="display: none;">${hpi}</span></div>
            </div>
        `

        // Insert patient info in the panel - try multiple approaches to ensure it appears
        const scanProgressSection = this.panel.querySelector('#scan-progress')
        const panelContent = this.panel.querySelector('.panel-content') || this.panel
        
        if (scanProgressSection) {
            scanProgressSection.insertAdjacentHTML('beforebegin', patientInfoSection)
        } else {
            // If no scan progress section exists, insert at the beginning of panel content
            panelContent.insertAdjacentHTML('afterbegin', patientInfoSection)
        }

        // Add CSS for expandable functionality
        if (!document.querySelector('#patient-info-styles')) {
            const style = document.createElement('style')
            style.id = 'patient-info-styles'
            style.textContent = `
                .patient-info-section:hover {
                    background: rgba(0,255,136,0.08) !important;
                    border-color: rgba(0,255,136,0.4) !important;
                }
                .patient-info-section.expanded .hpi-short {
                    display: none !important;
                }
                .patient-info-section.expanded .hpi-full {
                    display: inline !important;
                }
            `
            document.head.appendChild(style)
        }
    }

    private startFallbackDiagnosticSession() {
        // Fallback when AI services are unavailable
        console.log('🔄 Starting fallback diagnostic session...')

        // Show the game status panel
        this.gameStatusPanel?.show()

        // Start hospital ambience through audio management system
        this.audioManagementSystem.startHospitalAmbience()

        // Generate basic patient case
        const fallbackCase = {
            patientName: 'AI Unavailable Patient',
            age: 35,
            gender: 'Unknown',
            chiefComplaint: 'Diagnostic evaluation required',
            historyOfPresentIllness: 'Patient requires diagnostic assessment. AI services temporarily unavailable.',
            requiredModel: 'head'
        }

        this.updatePatientInfoInPanel(fallbackCase)

        // ENHANCEMENT FIRST: Show patient chat panel with fallback case
        this.patientChatPanel?.show(fallbackCase)
        
        // ENHANCEMENT FIRST: Show achievement panel with initial performance data
        const gameState = this.gameManager.getGameState();
        this.achievementPanel?.show({
            accuracy: gameState.accuracy,
            efficiency: gameState.efficiency,
            streak: gameState.streak,
            achievementsCount: gameState.achievements.size,
            totalAchievements: this.achievementSystem.getAllAchievements().length
        })
        
        // ENHANCEMENT FIRST: Show learning progress panel with initial learning data
        this.learningProgressPanel?.show({
            conditionsDiscovered: gameState.discoveredConditions.size,
            accuracy: gameState.accuracy,
            streak: gameState.streak,
            conditionsLearned: gameState.learningProgress.size,
            totalConditions: Object.keys(MEDICAL_CONDITIONS).length
        })
    }

    // Public method to allow external phase transitions
    public transitionToPhase(phase: string) {
        switch (phase) {
            case 'welcome':
                this.phaseManager.transitionTo(GamePhase.WELCOME)
                break
            case 'tutorial':
                this.phaseManager.transitionTo(GamePhase.TUTORIAL)
                break
            case 'exploration':
                this.phaseManager.transitionTo(GamePhase.EXPLORATION)
                break
            case 'ready':
                this.phaseManager.transitionTo(GamePhase.READY)
                break
            case 'active':
                this.phaseManager.transitionTo(GamePhase.ACTIVE)
                break
        }
    }

    // DYNAMIC: Show condition discovery opportunity

    // DYNAMIC: Show dynamic hint to the user
    private showDynamicHint(hint: string) {
        if (!this.panel) return;
        
        console.log('💡 Dynamic hint:', hint);
        
        // Create a temporary hint display element
        const hintElement = document.createElement('div');
        hintElement.className = 'dynamic-hint';
        hintElement.innerHTML = `
            <div style="
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 255, 136, 0.2);
                border: 1px solid rgba(0, 255, 136, 0.5);
                border-radius: 8px;
                padding: 12px 24px;
                color: #00ff88;
                font-size: 14px;
                font-weight: bold;
                z-index: 10000;
                text-align: center;
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
                backdrop-filter: blur(10px);
                animation: fadeInOut 5s ease-in-out forwards;
            ">
                ${hint}
            </div>
        `;
        
        document.body.appendChild(hintElement);
        
        // Remove the hint after animation completes
        setTimeout(() => {
            if (hintElement.parentNode) {
                hintElement.parentNode.removeChild(hintElement);
            }
        }, 5000);
        
        // Add CSS animation if not already present
        if (!document.querySelector('#dynamic-hint-styles')) {
            const style = document.createElement('style');
            style.id = 'dynamic-hint-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; top: 15%; }
                    10% { opacity: 1; top: 20%; }
                    90% { opacity: 1; top: 20%; }
                    100% { opacity: 0; top: 25%; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // DYNAMIC: Show dynamic clue to the user
    // DYNAMIC: Show dynamic clue to the user
    private showDynamicClueWithMessage(clue: string) {
        if (!this.panel) return;
        
        console.log('🔍 Dynamic clue:', clue);
        
        // Create a temporary clue display element
        const clueElement = document.createElement('div');
        clueElement.className = 'dynamic-clue';
        clueElement.innerHTML = `
            <div style="
                position: fixed;
                top: 25%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 200, 0, 0.2);
                border: 1px solid rgba(255, 200, 0, 0.5);
                border-radius: 8px;
                padding: 12px 24px;
                color: #ffc800;
                font-size: 14px;
                font-weight: bold;
                z-index: 10000;
                text-align: center;
                box-shadow: 0 0 20px rgba(255, 200, 0, 0.3);
                backdrop-filter: blur(10px);
                animation: fadeInOut 5s ease-in-out forwards;
            ">
                ${clue}
            </div>
        `;
        
        document.body.appendChild(clueElement);
        
        // Remove the clue after animation completes
        setTimeout(() => {
            if (clueElement.parentNode) {
                clueElement.parentNode.removeChild(clueElement);
            }
        }, 5000);
    }

    // DYNAMIC: Show condition discovery opportunity
    private showConditionDiscoveryOpportunity(message: string) {
        if (!this.panel) return;
        
        console.log('🔬 Condition discovery opportunity:', message);
        
        // Create a temporary discovery notification element
        const discoveryElement = document.createElement('div');
        discoveryElement.className = 'discovery-opportunity';
        
        // Create the inner HTML structure
        discoveryElement.innerHTML = `
            <div style="
                position: fixed;
                top: 30%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(136, 0, 255, 0.2);
                border: 1px solid rgba(136, 0, 255, 0.5);
                border-radius: 8px;
                padding: 12px 24px;
                color: #8800ff;
                font-size: 14px;
                font-weight: bold;
                z-index: 10000;
                text-align: center;
                box-shadow: 0 0 20px rgba(136, 0, 255, 0.3);
                backdrop-filter: blur(10px);
                animation: fadeInOut 5s ease-in-out forwards;
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(discoveryElement);
        
        // Remove the discovery notification after animation completes
        setTimeout(() => {
            if (discoveryElement.parentNode) {
                discoveryElement.parentNode.removeChild(discoveryElement);
            }
        }, 5000);
    }
}
