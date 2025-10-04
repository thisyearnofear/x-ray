// MODULAR: Immersive gamified diagnostic experience with enhanced onboarding

import * as THREE from 'three'
import { CerebrasService } from '../medical/cerebras-service'
import { getConditionsForModel, type MedicalCondition } from '../medical/medical-data'
import { GamePhaseManager, GamePhase } from './game-phase-manager'
// OnboardingUI consolidated into DiagnosticUI
import { adaptiveLoader, performanceMonitor } from '../../utils/adaptive-loading'
import { mobileUI } from './mobile-ui'

interface GameState {
  score: number
  streak: number
  hintsUsed: number
  timeRemaining: number
  phase: 'scanning' | 'analyzing' | 'solved' | 'hint'
  difficulty: number
}

export class DiagnosticUI {
  private cerebras: CerebrasService
  private gameState: GameState = { score: 0, streak: 0, hintsUsed: 0, timeRemaining: 300, phase: 'scanning', difficulty: 1 }
  private panel: HTMLElement
  private timer: NodeJS.Timeout | null = null
  private currentCondition: MedicalCondition | null = null
  
  // MODULAR: Enhanced onboarding system
  private phaseManager: GamePhaseManager
  private onboardingContainer: HTMLElement | null = null
  
  // MOBILE-FIRST: Responsive design support
  private isCollapsed: boolean = false

  constructor() {
    this.cerebras = new CerebrasService()
    
    // CLEAN: Initialize phase management system
    this.phaseManager = new GamePhaseManager()
    this.setupOnboardingSystem()
    
    this.createGamePanel()
    this.setupPhaseIntegration()
    this.setupMobileOptimizations()
    
    // PERFORMANT: Adaptive loading based on device capabilities
    const strategy = adaptiveLoader.getStrategy()
    console.log('Adaptive loading strategy:', strategy)
    
    // CLEAN: Phase manager starts in WELCOME by default, no need to transition
  }

  // PERFORMANT: Minimal DOM with premium visual effects
  private createGamePanel() {
    this.panel = document.createElement('div')
    this.panel.className = 'diagnostic-game-panel'
    this.panel.innerHTML = `
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
      
      <div class="panel-header">
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
        <div class="timer-section">
          <div class="timer-ring">
            <div class="timer-text" id="timer">2:00</div>
            <svg class="timer-circle">
              <circle cx="30" cy="30" r="25" class="timer-bg"/>
              <circle cx="30" cy="30" r="25" class="timer-progress" id="timer-progress"/>
            </svg>
          </div>
          <div class="timer-label">TIME REMAINING</div>
        </div>
      </div>
      
      <div class="game-content" id="game-content">
        <div class="scan-prompt">
          <div class="pulse-indicator"></div>
          <div class="scan-title">🔍 MEDICAL SCAN ACTIVE</div>
          <div class="scan-subtitle">Position cursor over patient to discover conditions</div>
          <div class="progress-actions">
            <button class="action-btn hint-btn" id="hint-btn">
              <span class="btn-icon">💡</span>
              <span class="btn-text">Clinical Hint</span>
              <span class="btn-count">(${3 - this.gameState.hintsUsed} left)</span>
            </button>
            <button class="action-btn nurse-btn" id="ai-assist">
              <span class="btn-icon">👩‍⚕️</span>
              <span class="btn-text">Call Nurse</span>
            </button>
          </div>
        </div>
      </div>
    `

    this.panel.style.cssText = `
      position: fixed; top: 20px; left: 20px; width: 340px; min-height: 220px;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #fff; z-index: 1000; border-radius: 16px; padding: 20px;
      transform: translateY(-10px) scale(0.95); opacity: 0;
      transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    `

    // MOBILE-FIRST: Apply responsive styles
    this.applyResponsiveStyles()

    document.body.appendChild(this.panel)

    // PREMIUM: Staggered entrance animation
    requestAnimationFrame(() => {
      this.panel.style.transform = 'translateY(0) scale(1)'
      this.panel.style.opacity = '1'
    })

    this.attachEventListeners()
  }

  // CLEAN: Event handling with game mechanics
  private attachEventListeners() {
    const hintBtn = this.panel.querySelector('#hint-btn') as HTMLElement
    const nurseBtn = this.panel.querySelector('#ai-assist') as HTMLElement

    hintBtn?.addEventListener('click', () => this.showHint())
    nurseBtn?.addEventListener('click', () => this.callNurse())
  }

  // ENHANCEMENT FIRST: Immersive condition analysis with animations
  async analyzeCondition(condition: MedicalCondition) {
    this.currentCondition = condition
    this.gameState.phase = 'analyzing'

    // PERFORMANT: Panel flip animation
    this.panel.style.transform = 'rotateY(180deg) scale(1.05)'

    setTimeout(() => {
      const content = this.panel.querySelector('#game-content') as HTMLElement
      content.innerHTML = `
        <div class="analysis-mode">
          <div class="condition-card">
            <div class="condition-icon">🏥</div>
            <h3>${condition.name}</h3>
            <div class="analysis-stream" id="analysis-stream">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div class="action-buttons">
            <button class="solve-btn" id="solve-btn">✅ I Know This!</button>
            <button class="learn-btn" id="learn-btn">📚 Learn More</button>
          </div>
        </div>
      `

      this.panel.style.transform = 'rotateY(0deg) scale(1)'
      this.streamAnalysis(condition)
    }, 300)
  }

  // PERFORMANT: Streaming with delightful typing effect + Performance monitoring
  private async streamAnalysis(condition: MedicalCondition) {
    const streamEl = this.panel.querySelector('#analysis-stream') as HTMLElement
    streamEl.innerHTML = ''

    // PERFORMANT: Monitor streaming performance
    const startTime = performance.now()
    let chunkCount = 0

    try {
      for await (const chunk of this.cerebras.analyzeMedicalCondition(condition)) {
        const span = document.createElement('span')
        span.textContent = chunk
        span.style.opacity = '0'
        streamEl.appendChild(span)

        // PERFORMANT: Adaptive animation based on device capabilities
        const shouldAnimate = adaptiveLoader.shouldEnableAnimation('decorative')
        
        if (shouldAnimate) {
          // Staggered fade-in animation
          requestAnimationFrame(() => {
            span.style.transition = 'opacity 0.3s ease'
            span.style.opacity = '1'
          })
          await new Promise(resolve => setTimeout(resolve, 30))
        } else {
          // Instant display for low-end devices
          span.style.opacity = '1'
        }

        chunkCount++
      }

      // PERFORMANT: Update adaptive strategy based on performance
      const duration = performance.now() - startTime
      const fps = performanceMonitor.measureFPS()
      
      if (chunkCount > 0) {
        adaptiveLoader.updateStrategy({ fps, loadTime: duration })
      }

    } catch (error) {
      streamEl.innerHTML = `<div class="fallback-info">${condition.description}</div>`
    }

    this.attachSolutionHandlers()
  }

  // CLEAN: Game progression mechanics
  private attachSolutionHandlers() {
    const solveBtn = this.panel.querySelector('#solve-btn') as HTMLElement
    const learnBtn = this.panel.querySelector('#learn-btn') as HTMLElement

    solveBtn?.addEventListener('click', () => this.handleSolution(true))
    learnBtn?.addEventListener('click', () => this.handleSolution(false))
  }

  // PERFORMANT: Reward system with visual feedback
  private handleSolution(userSolved: boolean) {
    if (userSolved) {
      this.gameState.score += (10 * this.gameState.difficulty)
      this.gameState.streak += 1
      this.celebrateSuccess()
    } else {
      this.gameState.streak = 0
    }

    this.updateUI()
    this.resetToScanning()
  }

  // ENHANCEMENT FIRST: Delightful success animation
  private celebrateSuccess() {
    // PERFORMANT: Particle burst effect
    this.panel.style.animation = 'success-pulse 0.6s ease-out'

    // Create floating score
    const scoreFloat = document.createElement('div')
    scoreFloat.textContent = `+${10 * this.gameState.difficulty}`
    scoreFloat.style.cssText = `
      position: absolute; top: -20px; right: 20px; color: #00ff88;
      font-weight: bold; font-size: 18px; pointer-events: none;
      animation: float-up 1s ease-out forwards;
    `
    this.panel.appendChild(scoreFloat)

    setTimeout(() => scoreFloat.remove(), 1000)
  }

  // ENHANCEMENT FIRST: Immersive nurse assistance
  private callNurse() {
    const nurseBtn = this.panel.querySelector('#ai-assist') as HTMLElement

    // Visual feedback
    nurseBtn.style.transform = 'scale(0.95)'
    setTimeout(() => nurseBtn.style.transform = 'scale(1)', 150)

    const nurseMessages = [
      "👩‍⚕️ Nurse Sarah: Focus on areas where patients typically feel discomfort",
      "👩‍⚕️ Nurse Sarah: Check joint connections and muscle attachment points",
      "👩‍⚕️ Nurse Sarah: Look for asymmetry or unusual positioning in the anatomy",
      "👩‍⚕️ Nurse Sarah: Remember, pain often radiates from the source of injury"
    ]

    const randomMessage = nurseMessages[Math.floor(Math.random() * nurseMessages.length)]
    this.showToast(randomMessage, 'info', 4000)
  }

  // CLEAN: Hint system with progressive disclosure
  private showHint() {
    if (this.gameState.hintsUsed >= 3) return

    this.gameState.hintsUsed++

    const hints = [
      "🔍 Clinical Tip: Look for areas that might cause discomfort during movement",
      "🎯 Diagnostic Focus: Check joints and muscle connection points carefully",
      "⚡ Assessment Guide: Examine areas that experience frequent stress"
    ]

    const hintText = hints[this.gameState.hintsUsed - 1]
    this.showToast(hintText, 'hint', 3000)

    // Update hint button
    const hintBtn = this.panel.querySelector('#hint-btn .btn-count') as HTMLElement
    if (hintBtn) {
      hintBtn.textContent = `(${3 - this.gameState.hintsUsed} left)`
    }
  }

  // PERFORMANT: Toast notifications with smooth animations
  // PERFORMANT: Toast notifications with smooth animations
  private showToast(message: string, type: 'hint' | 'success' | 'info', duration: number = 3000) {
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message
    toast.style.cssText = `
      position: fixed; top: 100px; left: 50%; transform: translateX(-50%) translateY(-20px);
      background: rgba(0,0,0,0.9); color: #fff; padding: 12px 20px;
      border-radius: 8px; font-size: 14px; opacity: 0;
      transition: all 0.3s ease; z-index: 1001; max-width: 400px; text-align: center;
    `

    document.body.appendChild(toast)
    requestAnimationFrame(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateX(-50%) translateY(0)'
    })

    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, duration)
  }

  // MODULAR: Phase integration with existing game systems
  private setupPhaseIntegration(): void {
    // CLEAN: Sync phase manager with game timer
    this.phaseManager.onPhaseChange(GamePhase.ACTIVE, () => {
      this.startGameTimer()
    })

    this.phaseManager.onPhaseChange(GamePhase.PAUSED, () => {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    })

    this.phaseManager.onPhaseChange(GamePhase.COMPLETE, () => {
      this.endGame()
    })

    // PERFORMANT: Sync game state with phase manager
    this.phaseManager.onPhaseChange(GamePhase.ACTIVE, () => {
      const phaseState = this.phaseManager.getState()
      this.gameState.timeRemaining = phaseState.timeRemaining
      this.gameState.score = phaseState.score
    })
  }

  // CLEAN: Game timer with visual countdown
  private startGameTimer() {
    this.timer = setInterval(() => {
      this.gameState.timeRemaining--
      this.updateTimer()

      if (this.gameState.timeRemaining <= 0) {
        this.endGame()
      }
    }, 1000)
  }

  private updateTimer() {
    const timerEl = this.panel.querySelector('#timer') as HTMLElement
    const progressEl = this.panel.querySelector('#timer-progress') as HTMLElement

    const minutes = Math.floor(this.gameState.timeRemaining / 60)
    const seconds = this.gameState.timeRemaining % 60
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`

    // PERFORMANT: Updated progress calculation for 5-minute timer
    const progress = (this.gameState.timeRemaining / 300) * 157 // 2π * 25 for 5 minutes
    progressEl.style.strokeDasharray = `${progress} 157`
    
    // CLEAN: Sync with phase manager
    this.phaseManager.updateState({ timeRemaining: this.gameState.timeRemaining })
  }

  private updateUI() {
    const scoreEl = this.panel.querySelector('#score') as HTMLElement
    const streakEl = this.panel.querySelector('#streak') as HTMLElement

    scoreEl.textContent = this.gameState.score.toString()
    streakEl.textContent = `🔥 ${this.gameState.streak}`
  }

  private resetToScanning() {
    setTimeout(() => {
      const content = this.panel.querySelector('#game-content') as HTMLElement
      content.innerHTML = `
        <div class="scan-prompt">
          <div class="pulse-indicator"></div>
          <h3>🔍 Continue Scanning</h3>
          <p>Great work! Find the next condition</p>
        </div>
      `
      this.gameState.phase = 'scanning'
    }, 2000)
  }

  private endGame() {
    if (this.timer) clearInterval(this.timer)
    // Game over logic here
  }

  updateScanProgress(conditionId: string, progress: number): void {
    // Update UI to show scanning progress for the condition
    console.log(`Scan progress for ${conditionId}: ${progress}`)
  }

  discoverCondition(conditionId: string): void {
    // Handle condition discovery
    console.log(`Condition discovered: ${conditionId}`)
  }

  destroy() {
    if (this.timer) clearInterval(this.timer)
    this.panel.remove()
    
    // CLEAN: Cleanup phase management system
    this.phaseManager.destroy()
    this.cleanupOnboarding()
    
    // MOBILE-FIRST: Cleanup mobile UI
    mobileUI.destroy()
  }

  // UNIVERSAL: Setup collapsible functionality for all devices
  private setupMobileOptimizations(): void {
    const config = mobileUI.getConfig()
    
    // ENHANCEMENT: Enable collapsible for all devices, not just mobile
    this.isCollapsed = config.isCollapsed
    
    // Apply responsive styles for all devices
    this.applyResponsiveStyles()
    
    // Setup collapsible panel for all devices
    this.setupCollapsiblePanel()
    
    // CLEAN: Listen for layout changes
    mobileUI.onLayoutChange(() => {
      this.applyResponsiveStyles()
    })
    
    // Add gesture support for mobile devices
    if (mobileUI.isMobileDevice()) {
      mobileUI.onSwipeUp(() => {
        if (this.isCollapsed) this.togglePanel()
      })
      
      mobileUI.onSwipeDown(() => {
        if (!this.isCollapsed) this.togglePanel()
      })
    }
  }

  private applyResponsiveStyles(): void {
    // UNIVERSAL: Apply styles for both mobile and desktop
    const existingStyle = document.getElementById('diagnostic-responsive-styles')
    if (existingStyle) existingStyle.remove()
    
    const style = document.createElement('style')
    style.id = 'diagnostic-responsive-styles'
    
    // Generate styles for both mobile and desktop
    const mobileStyles = mobileUI.generateResponsiveStyles('.diagnostic-panel')
    const desktopStyles = this.generateDesktopCollapsibleStyles()
    
    style.textContent = mobileStyles + desktopStyles
    document.head.appendChild(style)
    
    // CLEAN: Update panel classes
    this.panel.classList.toggle('mobile', mobileUI.isMobileDevice())
    this.panel.classList.toggle('desktop', !mobileUI.isMobileDevice())
    this.panel.classList.toggle('collapsed', this.isCollapsed)
  }

  private generateDesktopCollapsibleStyles(): string {
    return `
      /* DESKTOP: Collapsible panel styles */
      @media (min-width: 769px) {
        .diagnostic-panel.desktop {
          position: fixed !important;
          top: 2rem !important;
          right: 2rem !important;
          width: 400px !important;
          max-height: calc(100vh - 4rem) !important;
          transition: transform 0.3s ease, width 0.3s ease !important;
          z-index: 1000 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 255, 136, 0.15) !important;
        }
        
        .diagnostic-panel.desktop.collapsed {
          transform: translateX(calc(100% - 60px)) !important;
          width: 60px !important;
        }
        
        .diagnostic-panel.desktop .panel-header {
          background: rgba(0, 20, 40, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          border-bottom: 1px solid #00ff88 !important;
          padding: 1rem !important;
          min-height: 60px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          cursor: pointer !important;
          border-radius: 12px 12px 0 0 !important;
        }
        
        .diagnostic-panel.desktop.collapsed .panel-header {
          border-radius: 12px !important;
        }
        
        .diagnostic-panel.desktop .panel-content {
          max-height: calc(100vh - 120px) !important;
          overflow-y: auto !important;
          padding: 1rem !important;
        }
        
        .diagnostic-panel.desktop.collapsed .panel-content {
          display: none !important;
        }
        
        .diagnostic-panel.desktop .collapse-indicator {
          transition: transform 0.3s ease !important;
          font-size: 1.2rem !important;
          color: #00ff88 !important;
          cursor: pointer !important;
        }
        
        .diagnostic-panel.desktop.collapsed .collapse-indicator {
          transform: rotate(180deg) !important;
        }
        
        /* ENHANCEMENT: Hover effects for desktop */
        .diagnostic-panel.desktop:hover {
          box-shadow: 0 12px 40px rgba(0, 255, 136, 0.25) !important;
        }
        
        .diagnostic-panel.desktop .panel-header:hover {
          background: rgba(0, 30, 60, 0.95) !important;
        }
      }
    `;
  }

  private setupCollapsiblePanel(): void {
    // Enable collapsible functionality for all devices (desktop and mobile)
    const header = this.panel.querySelector('.panel-header') as HTMLElement
    if (header) {
      header.style.cursor = 'pointer'
      header.addEventListener('click', () => this.togglePanel())
      
      // Add visual indicator
      const indicator = document.createElement('div')
      indicator.innerHTML = '⌄'
      indicator.className = 'collapse-indicator'
      indicator.style.cssText = `
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%) rotate(${this.isCollapsed ? '180deg' : '0deg'});
        transition: transform 0.3s ease;
        font-size: 1.2rem;
        color: #00ff88;
        pointer-events: none;
      `
      header.style.position = 'relative'
      header.appendChild(indicator)
    }
  }

  private togglePanel(): void {
    this.isCollapsed = !this.isCollapsed
    this.panel.classList.toggle('collapsed', this.isCollapsed)
    
    // Update indicator rotation
    const indicator = this.panel.querySelector('.collapse-indicator') as HTMLElement
    if (indicator) {
      indicator.style.transform = `translateY(-50%) rotate(${this.isCollapsed ? '180deg' : '0deg'})`
    }
  }

  // CONSOLIDATED: OnboardingUI functionality integrated into DiagnosticUI
  private setupOnboardingSystem(): void {
    this.createOnboardingContainer()
    this.setupOnboardingPhaseListeners()
  }

  private createOnboardingContainer(): void {
    this.onboardingContainer = document.createElement('div')
    this.onboardingContainer.className = 'onboarding-overlay'
    this.onboardingContainer.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.95); z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.5s ease; pointer-events: none;
      padding: 1rem; box-sizing: border-box;
    `
    document.body.appendChild(this.onboardingContainer)
  }

  private setupOnboardingPhaseListeners(): void {
    this.phaseManager.onPhaseChange(GamePhase.WELCOME, () => this.showWelcomePanel())
    this.phaseManager.onPhaseChange(GamePhase.TUTORIAL, () => this.showTutorialPanel())
    this.phaseManager.onPhaseChange(GamePhase.EXPLORATION, () => this.showExplorationPanel())
    this.phaseManager.onPhaseChange(GamePhase.READY, () => this.showReadyPanel())
    this.phaseManager.onPhaseChange(GamePhase.ACTIVE, () => this.hideOnboarding())
    this.phaseManager.onPhaseChange(GamePhase.COMPLETE, () => this.showCompletePanel())
  }

  private showOnboardingPanel(content: string, actions: Array<{text: string, action: () => void, primary?: boolean}>): void {
    if (!this.onboardingContainer) return

    this.onboardingContainer.innerHTML = ''
    
    const panel = document.createElement('div')
    panel.className = 'onboarding-panel'
    
    const isMobile = mobileUI.isMobileDevice()
    const config = mobileUI.getConfig()
    
    panel.style.cssText = `
      background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
      border: 2px solid #00ff88; border-radius: ${isMobile ? '12px' : '16px'};
      padding: ${isMobile ? '1.5rem' : '2rem'}; max-width: ${isMobile ? '100%' : '600px'};
      width: ${isMobile ? '100%' : '90%'}; max-height: ${isMobile ? '85vh' : 'auto'};
      overflow-y: ${isMobile ? 'auto' : 'visible'};
      box-shadow: 0 20px 40px rgba(0, 255, 136, 0.2);
      animation: slideIn 0.5s ease-out; font-size: ${config.fontSize}px;
    `

    panel.innerHTML = `
      <div class="panel-content" style="color: #ffffff; line-height: 1.6;">${content}</div>
      <div class="panel-actions" style="margin-top: ${isMobile ? '1.5rem' : '2rem'}; display: flex; gap: ${isMobile ? '0.75rem' : '1rem'}; justify-content: flex-end; flex-wrap: wrap;">
        ${actions.map(action => `
          <button class="action-btn ${action.primary ? 'primary' : 'secondary'}" 
                  style="padding: ${isMobile ? '0.875rem 1.25rem' : '0.75rem 1.5rem'}; border: 2px solid ${action.primary ? '#00ff88' : '#666'}; background: ${action.primary ? '#00ff88' : 'transparent'}; color: ${action.primary ? '#000' : '#00ff88'}; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: ${isMobile ? '16px' : '14px'}; min-height: ${isMobile ? '44px' : 'auto'}; min-width: ${isMobile ? '120px' : 'auto'}; transition: all 0.3s ease; flex: ${isMobile ? '1' : 'none'};"
                  onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            ${action.text}
          </button>
        `).join('')}
      </div>
    `

    // Attach event listeners
    const buttons = panel.querySelectorAll('.action-btn')
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', actions[index].action)
    })

    this.onboardingContainer.appendChild(panel)
    this.showOnboarding()
  }

  private showWelcomePanel(): void {
    const isMobile = mobileUI.isMobileDevice()
    const content = `
      <div style="text-align: center;">
        <h1 style="color: #00ff88; font-size: ${isMobile ? '2rem' : '2.5rem'}; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0, 255, 136, 0.5); line-height: 1.2;">
          🏥 X-RAI Medical Simulator
        </h1>
        <div style="background: rgba(0, 255, 136, 0.1); padding: ${isMobile ? '1rem' : '1.5rem'}; border-radius: 12px; margin: ${isMobile ? '1rem 0' : '1.5rem 0'};">
          <h2 style="color: #00ff88; margin-bottom: 1rem; font-size: ${isMobile ? '1.3rem' : '1.5rem'};">📋 Patient Briefing</h2>
          <p style="font-size: ${isMobile ? '1rem' : '1.1rem'}; margin-bottom: 1rem; line-height: 1.5;">
            <strong>Emergency Department - 14:30</strong><br>You are the attending physician on duty. A new patient has arrived with concerning symptoms.
          </p>
          <p style="color: #ffaa00; font-weight: bold; font-size: ${isMobile ? '0.95rem' : '1rem'};">🚨 Your diagnostic skills are needed immediately</p>
        </div>
        <p style="font-size: ${isMobile ? '0.85rem' : '0.9rem'}; opacity: 0.8; margin-top: ${isMobile ? '1rem' : '1.5rem'}; line-height: 1.4;">
          Powered by <strong>Cerebras AI</strong> and <strong>Meta Llama 4</strong> for ultra-fast, realistic medical simulations.
        </p>
      </div>
    `
    this.showOnboardingPanel(content, [
      { text: isMobile ? 'Skip' : 'Skip Tutorial', action: () => this.phaseManager.transitionTo(GamePhase.EXPLORATION) },
      { text: isMobile ? 'Tutorial' : 'Start Tutorial', action: () => this.phaseManager.transitionTo(GamePhase.TUTORIAL), primary: true }
    ])
  }

  private showTutorialPanel(): void {
    const content = `
      <div style="text-align: center;">
        <h2 style="color: #00ff88; margin-bottom: 1rem;">🔍 X-Ray Navigation</h2>
        <div style="background: rgba(0, 255, 136, 0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
          <p style="font-size: 1.1rem; line-height: 1.6;">Use your mouse to rotate and zoom the 3D model. Look for anatomical markers and abnormalities.</p>
        </div>
      </div>
    `
    this.showOnboardingPanel(content, [
      { text: 'Previous', action: () => this.phaseManager.transitionTo(GamePhase.WELCOME) },
      { text: 'Start Exploring', action: () => this.phaseManager.transitionTo(GamePhase.EXPLORATION), primary: true }
    ])
  }

  private showExplorationPanel(): void {
    const content = `
      <div style="text-align: center;">
        <h2 style="color: #00ff88; margin-bottom: 1rem;">🔬 Explore the Patient</h2>
        <div style="background: rgba(0, 255, 136, 0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">Take your time to examine the 3D model. Rotate, zoom, and identify key anatomical structures.</p>
          <p style="color: #ffaa00; font-weight: bold;">💡 The more you explore, the better prepared you'll be for diagnosis!</p>
        </div>
      </div>
    `
    this.showOnboardingPanel(content, [
      { text: 'Back to Tutorial', action: () => this.phaseManager.transitionTo(GamePhase.TUTORIAL) },
      { text: 'I\'m Ready!', action: () => this.phaseManager.transitionTo(GamePhase.READY), primary: true }
    ])
  }

  private showReadyPanel(): void {
    const content = `
      <div style="text-align: center;">
        <h2 style="color: #00ff88; margin-bottom: 1rem;">🚀 Ready for Diagnosis</h2>
        <div style="background: rgba(255, 170, 0, 0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; border: 1px solid #ffaa00;">
          <h3 style="color: #ffaa00; margin-bottom: 1rem;">⚠️ Final Briefing</h3>
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">Once you start the timer, you'll have <strong>5 minutes</strong> to make your diagnosis.</p>
          <p style="color: #00ff88; font-weight: bold;">🎯 Remember: Accuracy and speed both matter!</p>
        </div>
      </div>
    `
    this.showOnboardingPanel(content, [
      { text: 'More Practice', action: () => this.phaseManager.transitionTo(GamePhase.EXPLORATION) },
      { text: 'Start Diagnosis!', action: () => this.phaseManager.transitionTo(GamePhase.ACTIVE), primary: true }
    ])
  }

  private showCompletePanel(): void {
    const state = this.phaseManager.getState()
    const content = `
      <div style="text-align: center;">
        <h2 style="color: #00ff88; margin-bottom: 1rem;">🏆 Diagnosis Complete</h2>
        <div style="background: rgba(0, 255, 136, 0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
          <h3 style="color: #00ff88; font-size: 2rem; margin-bottom: 1rem;">Score: ${state.score}</h3>
          <p style="font-size: 1.1rem;">Time Used: ${Math.floor((300 - state.timeRemaining) / 60)}:${String((300 - state.timeRemaining) % 60).padStart(2, '0')}</p>
        </div>
        <p style="opacity: 0.9;">Thank you for using X-RAI Medical Simulator powered by Cerebras AI and Meta Llama 4.</p>
      </div>
    `
    this.showOnboardingPanel(content, [
      { text: 'New Case', action: () => this.phaseManager.transitionTo(GamePhase.WELCOME), primary: true }
    ])
  }

  private showOnboarding(): void {
    if (this.onboardingContainer) {
      this.onboardingContainer.style.pointerEvents = 'auto'
      this.onboardingContainer.style.opacity = '1'
    }
  }

  private hideOnboarding(): void {
    if (this.onboardingContainer) {
      this.onboardingContainer.style.opacity = '0'
      setTimeout(() => {
        if (this.onboardingContainer) {
          this.onboardingContainer.style.pointerEvents = 'none'
        }
      }, 500)
    }
  }

  private cleanupOnboarding(): void {
    if (this.onboardingContainer) {
      this.onboardingContainer.remove()
      this.onboardingContainer = null
    }
  }
}
