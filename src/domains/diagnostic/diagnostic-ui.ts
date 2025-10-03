// MODULAR: Immersive gamified diagnostic experience with enhanced onboarding

import * as THREE from 'three'
import { CerebrasService } from '../medical/cerebras-service'
import { getConditionsForModel, type MedicalCondition } from '../medical/medical-data'
import { GamePhaseManager, GamePhase } from './game-phase-manager'
import { OnboardingUI } from './onboarding-ui'
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
  private onboardingUI: OnboardingUI
  
  // MOBILE-FIRST: Responsive design support
  private isCollapsed: boolean = false

  constructor() {
    this.cerebras = new CerebrasService()
    
    // CLEAN: Initialize phase management system
    this.phaseManager = new GamePhaseManager()
    this.onboardingUI = new OnboardingUI(this.phaseManager)
    
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
    this.onboardingUI.destroy()
    
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
}
