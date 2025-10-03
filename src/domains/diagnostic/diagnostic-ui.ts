// MODULAR: Immersive gamified diagnostic experience

import * as THREE from 'three'
import { CerebrasService } from '../medical/cerebras-service'
import { getConditionsForModel, type MedicalCondition } from '../medical/medical-data'

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
  private gameState: GameState = { score: 0, streak: 0, hintsUsed: 0, timeRemaining: 120, phase: 'scanning', difficulty: 1 }
  private panel: HTMLElement
  private timer: NodeJS.Timeout | null = null
  private currentCondition: MedicalCondition | null = null

  constructor() {
    this.cerebras = new CerebrasService()
    this.createGamePanel()
    this.startGameTimer()
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

  // PERFORMANT: Streaming with delightful typing effect
  private async streamAnalysis(condition: MedicalCondition) {
    const streamEl = this.panel.querySelector('#analysis-stream') as HTMLElement
    streamEl.innerHTML = ''

    try {
      for await (const chunk of this.cerebras.analyzeMedicalCondition(condition)) {
        const span = document.createElement('span')
        span.textContent = chunk
        span.style.opacity = '0'
        streamEl.appendChild(span)

        // PERFORMANT: Staggered fade-in animation
        requestAnimationFrame(() => {
          span.style.transition = 'opacity 0.3s ease'
          span.style.opacity = '1'
        })

        await new Promise(resolve => setTimeout(resolve, 30))
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

    const progress = (this.gameState.timeRemaining / 120) * 157 // 2π * 25
    progressEl.style.strokeDasharray = `${progress} 157`
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

  destroy() {
    if (this.timer) clearInterval(this.timer)
    this.panel.remove()
  }
}
