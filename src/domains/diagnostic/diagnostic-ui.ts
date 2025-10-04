import { AudioManager, SoundType } from "../../components/AudioManager"
import { MEDICAL_CONDITIONS } from "../../domains/medical/medical-data"
import { GamePhaseManager, GamePhase } from "./game-phase-manager"

// MODULAR: Clean diagnostic interface coordinating sophisticated backend systems
import { GameManager } from "./GameManager"
import { AchievementSystem } from "./AchievementSystem"
import { LearningTracker } from "./LearningTracker"
import { MedicalWorkflowManager, PatientCase } from "./MedicalWorkflowManager"
import { Web3SkillTracker } from "./Web3SkillTracker"

export class DiagnosticUI {
    private audioManager: AudioManager
    private phaseManager: GamePhaseManager

    // MODULAR: Sophisticated backend systems
    private gameManager: GameManager
    private achievementSystem: AchievementSystem
    private learningTracker: LearningTracker
    private workflowManager: MedicalWorkflowManager
    private web3Tracker: Web3SkillTracker

    private scanProgress: Map<string, number> = new Map()
    private panel: HTMLElement | null = null
    private timer: NodeJS.Timeout | null = null
    private isInitialized: boolean = false
    private isCollapsed: boolean = false
    private onboardingContainer: HTMLElement | null = null

    constructor(audioManager: AudioManager) {
        this.audioManager = audioManager

        // Initialize sophisticated backend systems
        this.gameManager = new GameManager()
        this.achievementSystem = new AchievementSystem()
        this.learningTracker = new LearningTracker()

        // Import and initialize CerebrasService for AI integration
        const { CerebrasService } = require('../medical/cerebras-service')
        const cerebrasService = new CerebrasService()
        this.workflowManager = new MedicalWorkflowManager(cerebrasService)

        this.web3Tracker = new Web3SkillTracker()

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
        })

        this.achievementSystem.on('achievementUnlocked', (data: { achievement: any }) => {
            this.showAchievementNotification(data.achievement.id)
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
    }

    private initialize() {
        if (this.isInitialized) return

        this.createDiagnosticPanel()
        this.createOnboardingOverlay()
        this.showWelcomeScreen() // Show onboarding first
        this.setupPhaseManagement()
        this.isInitialized = true

        // Make DiagnosticUI globally accessible for onboarding buttons
        ; (window as any).diagnosticUI = this
    }

    // PREMIUM: Premium diagnostic panel positioned on LEFT for desktop
    private createDiagnosticPanel() {
        this.panel = document.createElement('div')
        this.panel.className = 'diagnostic-game-panel'
        this.panel.style.cssText = `
      position: fixed; top: 2rem; left: 2rem; width: 380px; max-height: 80vh;
      z-index: 1000; overflow-y: auto; transition: transform 0.3s ease;
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
      <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(0,255,136,0.2); cursor: pointer; user-select: none;">
        <div class="scan-prompt">
          <div class="scan-title" id="panel-title">🏥 MEDICAL DIAGNOSTIC SYSTEM</div>
          <div class="scan-subtitle" id="panel-subtitle">AI-Powered Medical Analysis & Training</div>
        </div>
        <div class="collapse-toggle" id="collapse-toggle" style="font-size: 18px; color: #00ff88; cursor: pointer; padding: 8px; border-radius: 50%; background: rgba(0,255,136,0.1); transition: all 0.3s ease;">
          ${this.isCollapsed ? '▶' : '◀'}
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
          <div class="timer-label">TIME REMAINING</div>
        </div>

        <!-- Score and Streak Display -->
        <div class="score-section">
          <div class="score-display">
            <div class="score-label">DIAGNOSTIC SCORE</div>
            <div class="score-value" id="score">0</div>
          </div>
          <div class="streak-display">
            <div class="streak-icon">🔥</div>
            <div class="streak-value" id="streak">0</div>
          </div>
        </div>

        <!-- Scanning Progress -->
        <div id="scan-progress" style="margin-top: 1.5rem;">
          <div style="color: #00ff88; font-size: 12px; margin-bottom: 1rem; text-align: center; letter-spacing: 1px;">🔍 SCANNING PROGRESS</div>
          <div id="progress-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
        </div>

        <!-- AI Analysis Stream -->
        <div id="analysis-section" class="analysis-stream" style="margin-top: 1rem; padding: 1rem; display: none; position: relative;">
          <div style="color: #ffaa00; font-size: 11px; margin-bottom: 0.5rem; text-shadow: 0 0 10px rgba(255,170,0,0.5);">🔬 CEREBRAS AI ANALYSIS</div>
          <div id="analysis-content" style="font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.4; color: #00ff88; text-shadow: 0 0 5px rgba(0,255,136,0.3); min-height: 60px;"></div>
        </div>

        <!-- Enhanced Action Buttons -->
        <div class="progress-actions" id="action-buttons" style="margin-top: 1rem; display: none;">
          <button class="action-btn solve-btn" id="solve-btn">
            <div class="btn-icon">🎯</div>
            <div class="btn-text">DIAGNOSE</div>
            <div class="btn-count" id="solve-count">0</div>
          </button>
          <button class="action-btn hint-btn" id="hint-btn">
            <div class="btn-icon">💡</div>
            <div class="btn-text">HINT</div>
            <div class="btn-count" id="hint-count">3</div>
          </button>
        </div>

        <!-- Contextual Hints Panel -->
        <div id="hints-panel" class="hints-panel" style="margin-top: 1rem; display: none;">
          <div style="color: #ffaa00; font-size: 11px; margin-bottom: 0.5rem; text-shadow: 0 0 10px rgba(255,170,0,0.5);">💡 CONTEXTUAL HINTS</div>
          <div id="hints-content" style="font-size: 10px; line-height: 1.4; color: #cccccc;"></div>
        </div>

        <!-- Learning Progress -->
        <div id="learning-progress" style="margin-top: 1rem; padding: 0.75rem; background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.2); border-radius: 8px;">
          <div style="color: #00ff88; font-size: 10px; margin-bottom: 0.5rem; letter-spacing: 1px;">📈 LEARNING PROGRESS</div>
          <div id="learning-stats" style="font-size: 9px; color: #999; display: flex; justify-content: space-between;">
            <span>Accuracy: <span id="accuracy-display">0%</span></span>
            <span>Efficiency: <span id="efficiency-display">0%</span></span>
            <span>Achievements: <span id="achievements-count">0</span></span>
          </div>
        </div>
      </div>
    `

        document.body.appendChild(this.panel)
        this.setupTimerAnimation()
        this.addResponsiveStyles()
        this.setupCollapsibleFunctionality()
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

    private startGameTimer() {
        this.timer = setInterval(() => {
            const gameState = this.gameManager.getGameState()
            const newTimeRemaining = gameState.timeRemaining - 1

            // Update the game state in the manager
            const updatedState = { ...gameState, timeRemaining: newTimeRemaining }
            this.gameManager['gameState'] = updatedState

            this.updateTimerDisplay()

            if (newTimeRemaining <= 0) {
                this.endDiagnosis('timeout')
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

    private setupPhaseManagement() {
        // Listen for phase changes and update UI accordingly
        this.phaseManager.onPhaseChange(GamePhase.WELCOME, () => {
            this.updatePanelForPhase('welcome')
            this.showWelcomeScreen()
        })

        this.phaseManager.onPhaseChange(GamePhase.TUTORIAL, () => {
            this.updatePanelForPhase('tutorial')
            this.showTutorialScreen()
        })

        this.phaseManager.onPhaseChange(GamePhase.EXPLORATION, () => {
            this.updatePanelForPhase('exploration')
            this.showExplorationScreen()
        })

        this.phaseManager.onPhaseChange(GamePhase.READY, () => {
            this.updatePanelForPhase('ready')
            this.showReadyScreen()
        })

        this.phaseManager.onPhaseChange(GamePhase.ACTIVE, () => {
            const gameState = this.gameManager.getGameState()
            this.gameManager['gameState'] = { ...gameState, phase: 'scanning' }
            this.updatePhaseDisplay()
            this.updatePanelForPhase('active')
            this.hideOnboarding()
            this.startDiagnosticSession()
        })
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
        this.updateProgressDisplay()

        // Provide contextual hints based on scanning progress
        this.updateContextualHints(conditionId, progress)
    }

    private updateContextualHints(conditionId: string, progress: number) {
        const gameState = this.gameManager.getGameState()
        if (!this.panel || gameState.hintsUsed >= 3) return

        const hintsPanel = this.panel.querySelector('#hints-panel') as HTMLElement
        const hintsContent = this.panel.querySelector('#hints-content') as HTMLElement

        if (!hintsPanel || !hintsContent) return

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
            hintsContent.innerHTML = `
                <div style="background: rgba(255,170,0,0.1); border: 1px solid rgba(255,170,0,0.3); border-radius: 6px; padding: 8px;">
                    ${hintMessage}
                </div>
            `
            hintsPanel.style.display = 'block'
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

        // Play analysis sound
        this.audioManager.playSound(SoundType.AI_PROCESSING)

        // Update game state in manager
        const gameState = this.gameManager.getGameState()
        this.gameManager['gameState'] = { ...gameState, phase: 'analyzing' }
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

            } catch (cerebrasError) {
                console.warn('Cerebras analysis failed, generating fallback analysis:', cerebrasError)
                fullAnalysis = await this.generateFallbackAnalysis(condition, gameState.patientCase)

                if (analysisContent) {
                    analysisContent.innerHTML = `
                        <div style="color: #ffaa00; margin-bottom: 0.5rem;">⚠️ Using Enhanced Analysis</div>
                        <div style="color: #cccccc; font-size: 10px; line-height: 1.3;">${fullAnalysis}</div>
                    `
                }
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
            // Update game state in manager
            const newDiscoveredConditions = new Set(gameState.discoveredConditions)
            newDiscoveredConditions.add(conditionId)
            this.gameManager['gameState'] = { ...gameState, discoveredConditions: newDiscoveredConditions }

            // Calculate contextual points based on multiple factors
            const basePoints = this.calculateDiscoveryPoints(condition)
            const timeBonus = this.calculateTimeBonus()
            const streakMultiplier = gameState.streak * 0.1 + 1
            const totalPoints = Math.floor((basePoints + timeBonus) * streakMultiplier)

            // Play discovery sound based on severity
            switch (condition.severity) {
                case 'low':
                    this.audioManager.playSound(SoundType.LOW_SEVERITY)
                    break
                case 'medium':
                    this.audioManager.playSound(SoundType.MEDIUM_SEVERITY)
                    break
                case 'high':
                    this.audioManager.playSound(SoundType.HIGH_SEVERITY)
                    break
            }

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

        this.gameManager['gameState'] = { ...gameState, learningProgress: newLearningProgress }
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

        this.gameManager['gameState'] = { ...gameState, achievements: newAchievements }
        this.showAchievementNotification(achievementId)
        this.awardPoints(100, 'achievement')
    }

    private showAchievementNotification(achievementId: string) {
        const messages = {
            'first_discovery': '🎯 First Discovery!',
            'speed_demon': '⚡ Speed Demon!',
            'perfectionist': '💎 Perfectionist!',
            'streak_master': '🔥 Streak Master!',
            'learning_enthusiast': '📚 Learning Enthusiast!',
            'efficiency_expert': '🎖️ Efficiency Expert!'
        }

        const indicator = document.createElement('div')
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 20px;">🏆</div>
                <div>
                    <div style="color: #ffaa00; font-weight: bold; font-size: 14px;">ACHIEVEMENT UNLOCKED</div>
                    <div style="color: #00ff88; font-size: 12px;">${messages[achievementId as keyof typeof messages] || 'Achievement!'}</div>
                </div>
            </div>
        `

        indicator.style.cssText = `
            position: fixed; top: 20px; right: 50%; transform: translateX(50%);
            background:
                linear-gradient(135deg, rgba(255,170,0,0.95) 0%, rgba(255,140,0,0.95) 100%),
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%);
            border: 2px solid #ffaa00;
            border-radius: 12px; padding: 12px 16px;
            box-shadow:
                0 10px 30px rgba(255,170,0,0.3),
                0 0 20px rgba(255,170,0,0.2);
            z-index: 1002; pointer-events: none;
            animation: achievementSlideDown 4s ease-out forwards;
        `

        document.body.appendChild(indicator)

        // Add CSS animation if not already present
        if (!document.querySelector('#achievement-animation-styles')) {
            const style = document.createElement('style')
            style.id = 'achievement-animation-styles'
            style.textContent = `
                @keyframes achievementSlideDown {
                    0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                    20%, 80% { transform: translateX(-50%) translateY(0); opacity: 1; }
                    100% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                }
            `
            document.head.appendChild(style)
        }

        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator)
            }
        }, 4000)
    }

    private awardPoints(points: number, reason: string) {
        const gameState = this.gameManager.getGameState()
        const newScore = gameState.score + points
        const newStreak = gameState.streak + 1

        // Bonus points for streak
        const streakBonus = newStreak > 1 ? newStreak * 10 : 0
        const finalScore = newScore + streakBonus

        // Update game state in manager
        this.gameManager['gameState'] = {
            ...gameState,
            score: finalScore,
            streak: newStreak
        }

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

        // Update game state with new metrics
        this.gameManager['gameState'] = {
            ...gameState,
            efficiency,
            accuracy
        }
    }

    private updateLearningDisplay() {
        if (!this.panel) return

        const gameState = this.gameManager.getGameState()
        const accuracyElement = this.panel.querySelector('#accuracy-display') as HTMLElement
        const efficiencyElement = this.panel.querySelector('#efficiency-display') as HTMLElement
        const achievementsElement = this.panel.querySelector('#achievements-count') as HTMLElement

        if (accuracyElement) {
            accuracyElement.textContent = Math.round(gameState.accuracy * 100) + '%'
            accuracyElement.style.color = this.getPerformanceColor(gameState.accuracy)
        }

        if (efficiencyElement) {
            efficiencyElement.textContent = Math.round(gameState.efficiency * 100) + '%'
            efficiencyElement.style.color = this.getPerformanceColor(gameState.efficiency)
        }

        if (achievementsElement) {
            achievementsElement.textContent = gameState.achievements.size.toString()
        }
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
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 20px;">${reason === 'discovery' ? '🔍' : '🧠'}</div>
                <div>
                    <div style="color: #00ff88; font-weight: bold; font-size: 18px; text-shadow: 0 0 10px rgba(0,255,136,0.8);">+${points}</div>
                    <div style="color: rgba(255,255,255,0.8); font-size: 10px; letter-spacing: 1px;">${reason.toUpperCase()}</div>
                </div>
            </div>
        `

        indicator.style.cssText = `
            position: fixed; top: 50%; left: 420px; z-index: 1001; transform: translateY(-50%);
            background:
                linear-gradient(135deg, rgba(0,20,40,0.95) 0%, rgba(0,40,80,0.95) 100%),
                radial-gradient(circle at 30% 30%, rgba(0,255,136,0.1) 0%, transparent 50%);
            border: 1px solid rgba(0,255,136,0.5);
            border-radius: 12px; padding: 12px 16px;
            box-shadow:
                0 10px 30px rgba(0,0,0,0.3),
                0 0 20px rgba(0,255,136,0.2),
                inset 0 1px 0 rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            pointer-events: none;
            animation: premiumFloatUp 3s ease-out forwards;
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
        // Check if we've discovered all major conditions
        const gameState = this.gameManager.getGameState()
        const totalConditions = Object.keys(MEDICAL_CONDITIONS).length
        const discoveredCount = gameState.discoveredConditions.size

        if (discoveredCount >= Math.min(totalConditions, 3)) { // At least 3 conditions for demo
            this.endDiagnosis('complete')
        }
    }

    private endDiagnosis(reason: 'complete' | 'timeout') {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }

        if (reason === 'complete') {
            this.audioManager.playSound(SoundType.CONDITION_FOUND)
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

    private restartDiagnosis() {
        // Reset game state with enhanced properties using the gameManager
        const currentGameState = this.gameManager.getGameState()
        const newGameState = {
            score: 0,
            streak: 0,
            timeRemaining: this.getTimeForDifficulty(),
            phase: 'scanning' as const,
            discoveredConditions: new Set<string>(),
            sessionStartTime: Date.now(),
            hintsUsed: 0,
            accuracy: 0,
            efficiency: 0,
            learningProgress: new Map<string, number>(),
            achievements: new Set<string>(),
            difficulty: currentGameState.difficulty,
            patientCase: null,
            specialization: currentGameState.specialization,
            unlockedTechniques: currentGameState.unlockedTechniques
        }

        this.gameManager['gameState'] = newGameState
        this.scanProgress.clear()

        // Recreate the panel
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel)
        }
        this.createDiagnosticPanel()
        this.startGameTimer()
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
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 20px;">🏆</div>
                <div>
                    <div style="color: #ffaa00; font-weight: bold; font-size: 14px;">NFT MINTED!</div>
                    <div style="color: #00ff88; font-size: 12px;">${nftReward.name}</div>
                </div>
            </div>
        `

        indicator.style.cssText = `
            position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
            background:
                linear-gradient(135deg, rgba(255,170,0,0.95) 0%, rgba(255,140,0,0.95) 100%),
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%);
            border: 2px solid #ffaa00;
            border-radius: 12px; padding: 12px 16px;
            box-shadow:
                0 10px 30px rgba(255,170,0,0.3),
                0 0 20px rgba(255,170,0,0.2);
            z-index: 1002; pointer-events: none;
            animation: achievementSlideDown 4s ease-out forwards;
        `

        document.body.appendChild(indicator)

        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator)
            }
        }, 4000)
    }

    private showWelcomeScreen() {
        this.createOnboardingOverlay()
        if (this.onboardingContainer) {
            this.onboardingContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(0,20,40,0.95) 0%, rgba(0,40,80,0.95) 100%); border: 2px solid #00ff88; border-radius: 16px; padding: 2rem; max-width: 600px; text-align: center;">
                    <h1 style="color: #00ff88; font-size: 2.5rem; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0,255,136,0.5);">🏥 X-RAI Medical Simulator</h1>
                    <div style="background: rgba(0,255,136,0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
                        <h2 style="color: #00ff88; margin-bottom: 1rem;">📋 Patient Briefing</h2>
                        <p style="font-size: 1.1rem; margin-bottom: 1rem; line-height: 1.5;">
                            <strong>Emergency Department - 14:30</strong><br>You are the attending physician on duty. A new patient has arrived with concerning symptoms.
                        </p>
                        <p style="color: #ffaa00; font-weight: bold;">🚨 Your diagnostic skills are needed immediately</p>
                    </div>
                    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button class="onboarding-btn secondary" onclick="window.diagnosticUI?.transitionToPhase('exploration')">Skip Tutorial</button>
                        <button class="onboarding-btn primary" onclick="window.diagnosticUI?.transitionToPhase('tutorial')">Start Tutorial</button>
                    </div>
                </div>
            `
            this.showOnboarding()
        }
    }

    private showTutorialScreen() {
        if (this.onboardingContainer) {
            this.onboardingContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(0,20,40,0.95) 0%, rgba(0,40,80,0.95) 100%); border: 2px solid #00ff88; border-radius: 16px; padding: 2rem; max-width: 600px; text-align: center;">
                    <h2 style="color: #00ff88; margin-bottom: 1rem;">🔍 X-Ray Navigation</h2>
                    <div style="background: rgba(0,255,136,0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
                        <p style="font-size: 1.1rem; line-height: 1.6;">Use your mouse to rotate and zoom the 3D model. Look for anatomical markers and abnormalities.</p>
                    </div>
                    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                        <button class="onboarding-btn secondary" onclick="window.diagnosticUI?.transitionToPhase('welcome')">Previous</button>
                        <button class="onboarding-btn primary" onclick="window.diagnosticUI?.transitionToPhase('exploration')">Continue</button>
                    </div>
                </div>
            `
            this.showOnboarding()
        }
    }

    private showExplorationScreen() {
        if (this.onboardingContainer) {
            this.onboardingContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(0,20,40,0.95) 0%, rgba(0,40,80,0.95) 100%); border: 2px solid #00ff88; border-radius: 16px; padding: 2rem; max-width: 600px; text-align: center;">
                    <h2 style="color: #00ff88; margin-bottom: 1rem;">🔬 Explore the Patient</h2>
                    <div style="background: rgba(255,170,0,0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; border: 1px solid #ffaa00;">
                        <p style="font-size: 1.1rem; margin-bottom: 1rem;">Take your time to examine the 3D model. Rotate, zoom, and identify key anatomical structures.</p>
                        <p style="color: #00ff88; font-weight: bold;">💡 The more you explore, the better prepared you'll be for diagnosis!</p>
                    </div>
                    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                        <button class="onboarding-btn secondary" onclick="window.diagnosticUI?.transitionToPhase('tutorial')">Back to Tutorial</button>
                        <button class="onboarding-btn primary" onclick="window.diagnosticUI?.transitionToPhase('ready')">I'm Ready!</button>
                    </div>
                </div>
            `
            this.showOnboarding()
        }
    }

    private showReadyScreen() {
        if (this.onboardingContainer) {
            this.onboardingContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(0,20,40,0.95) 0%, rgba(0,40,80,0.95) 100%); border: 2px solid #00ff88; border-radius: 16px; padding: 2rem; max-width: 600px; text-align: center;">
                    <h2 style="color: #00ff88; margin-bottom: 1rem;">🚀 Ready for Diagnosis</h2>
                    <div style="background: rgba(255,170,0,0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; border: 1px solid #ffaa00;">
                        <h3 style="color: #ffaa00; margin-bottom: 1rem;">⚠️ Final Briefing</h3>
                        <p style="font-size: 1.1rem; margin-bottom: 1rem;">Once you start the timer, you'll have <strong>5 minutes</strong> to make your diagnosis.</p>
                        <p style="color: #00ff88; font-weight: bold;">🎯 Remember: Accuracy and speed both matter!</p>
                    </div>
                    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                        <button class="onboarding-btn secondary" onclick="window.diagnosticUI?.transitionToPhase('exploration')">More Practice</button>
                        <button class="onboarding-btn primary" onclick="window.diagnosticUI?.transitionToPhase('active')">Start Diagnosis!</button>
                    </div>
                </div>
            `
            this.showOnboarding()
        }
    }

    private createOnboardingOverlay() {
        if (!this.onboardingContainer) {
            this.onboardingContainer = document.createElement('div')
            this.onboardingContainer.className = 'onboarding-overlay'
            this.onboardingContainer.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.95); z-index: 9999;
                display: flex; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.5s ease; pointer-events: none;
                padding: 1rem; box-sizing: border-box;
            `

            // Add onboarding button styles
            const style = document.createElement('style')
            style.textContent = `
                .onboarding-btn {
                    padding: 0.875rem 1.5rem; border: 2px solid #00ff88;
                    background: transparent; color: #00ff88; border-radius: 8px;
                    cursor: pointer; font-weight: bold; font-size: 14px;
                    min-height: 44px; transition: all 0.3s ease;
                }
                .onboarding-btn.primary {
                    background: #00ff88; color: #000;
                }
                .onboarding-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4);
                }
            `
            document.head.appendChild(style)

            document.body.appendChild(this.onboardingContainer)
        }
    }

    private showOnboarding() {
        if (this.onboardingContainer) {
            this.onboardingContainer.style.pointerEvents = 'auto'
            this.onboardingContainer.style.opacity = '1'
        }
    }

    private hideOnboarding() {
        if (this.onboardingContainer) {
            this.onboardingContainer.style.opacity = '0'
            setTimeout(() => {
                if (this.onboardingContainer) {
                    this.onboardingContainer.style.pointerEvents = 'none'
                }
            }, 500)
        }
    }

    private async startDiagnosticSession() {
        // Generate AI-powered patient case and start the diagnostic session
        console.log('🚀 Starting AI-powered diagnostic session...')

        // Start the game timer when diagnosis begins
        this.startGameTimer()

        try {
            // Generate realistic patient case using Cerebras AI
            const patientCase = await this.workflowManager.generatePatientCase('head', 'medium')

            // Generate contextual audio environment using ElevenLabs
            await this.generateContextualAudioEnvironment(patientCase)

            // Update UI with patient information
            this.updatePatientInfoInPanel(patientCase)

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

        // Extract consistent data from AI content or use fallbacks
        const patientName = patientCase.patientName || 'Anonymous Patient'
        const age = patientCase.age || 35
        const gender = patientCase.gender || 'Unknown'
        const chiefComplaint = patientCase.chiefComplaint || 'Diagnostic evaluation required'
        
        // Use first 150 characters of HPI for better display
        const hpi = patientCase.historyOfPresentIllness || patientCase.aiDescription || 'Patient requires comprehensive diagnostic assessment.'
        const displayHPI = hpi.length > 150 ? hpi.substring(0, 150) + '...' : hpi

        // Create new patient info section
        const patientInfoSection = `
            <div class="patient-info-section" style="background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.2); border-radius: 8px; padding: 1rem; margin-top: 1rem; cursor: pointer; transition: all 0.3s ease;" onclick="this.classList.toggle('expanded')">
                <div style="color: #00ff88; font-size: 10px; margin-bottom: 0.5rem; letter-spacing: 1px;">👤 PATIENT INFORMATION <span style="float: right; font-size: 8px; opacity: 0.7;">Click to expand</span></div>
                <div style="font-size: 10px; color: #fff; margin-bottom: 0.25rem;"><strong>Name:</strong> ${patientName}</div>
                <div style="font-size: 10px; color: #fff; margin-bottom: 0.25rem;"><strong>Age:</strong> ${age} | <strong>Gender:</strong> ${gender}</div>
                <div style="font-size: 10px; color: #ffaa00; margin-bottom: 0.5rem;"><strong>Chief Complaint:</strong> ${chiefComplaint}</div>
                <div class="hpi-content" style="font-size: 9px; color: #ccc; line-height: 1.3;"><strong>HPI:</strong> <span class="hpi-short">${displayHPI}</span><span class="hpi-full" style="display: none;">${hpi}</span></div>
            </div>
        `

        // Insert patient info before the scanning progress section
        const scanProgressSection = this.panel.querySelector('#scan-progress')
        if (scanProgressSection) {
            scanProgressSection.insertAdjacentHTML('beforebegin', patientInfoSection)
            
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
    }

    private startFallbackDiagnosticSession() {
        // Fallback when AI services are unavailable
        console.log('🔄 Starting fallback diagnostic session...')

        // Use procedural audio instead of ElevenLabs
        if (this.audioManager && typeof this.audioManager.startHospitalAmbience === 'function') {
            this.audioManager.startHospitalAmbience()
        }

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
}