import { GamePhaseManager, GamePhase } from './game-phase-manager'
import { mobileUI } from '../../ui/mobile-ui'

// MODULAR: Enhanced onboarding UI with immersive patient briefing and mobile optimization
export class OnboardingUI {
  private phaseManager: GamePhaseManager
  private container: HTMLElement
  private currentPanel?: HTMLElement

  constructor(phaseManager: GamePhaseManager) {
    this.phaseManager = phaseManager
    this.container = this.createContainer()
    this.setupPhaseListeners()
    this.setupMobileOptimizations()
    document.body.appendChild(this.container)
  }

  // CLEAN: Centralized container creation with mobile support
  private createContainer(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'onboarding-overlay'
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.5s ease;
      pointer-events: none;
      padding: 1rem;
      box-sizing: border-box;
    `
    return container
  }

  // MOBILE-FIRST: Setup mobile optimizations
  private setupMobileOptimizations(): void {
    if (mobileUI.isMobileDevice()) {
      // Apply mobile-specific styles
      this.container.style.padding = '0.5rem'
      this.container.style.alignItems = 'flex-start'
      this.container.style.paddingTop = '2rem'
    }
  }

  // DRY: Single method for phase listener setup
  private setupPhaseListeners(): void {
    this.phaseManager.onPhaseChange(GamePhase.WELCOME, () => this.showWelcomePanel())
    this.phaseManager.onPhaseChange(GamePhase.TUTORIAL, () => this.showTutorialPanel())
    this.phaseManager.onPhaseChange(GamePhase.EXPLORATION, () => this.showExplorationPanel())
    this.phaseManager.onPhaseChange(GamePhase.READY, () => this.showReadyPanel())
    this.phaseManager.onPhaseChange(GamePhase.ACTIVE, () => this.hide())
    this.phaseManager.onPhaseChange(GamePhase.COMPLETE, () => this.showCompletePanel())
  }

  // PERFORMANT: Efficient panel management with mobile responsiveness
  private showPanel(content: string, actions: Array<{text: string, action: () => void, primary?: boolean}>): void {
    this.clearCurrentPanel()
    
    const panel = document.createElement('div')
    panel.className = 'onboarding-panel'
    
    // MOBILE-FIRST: Responsive panel styling
    const isMobile = mobileUI.isMobileDevice()
    const config = mobileUI.getConfig()
    
    panel.style.cssText = `
      background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
      border: 2px solid #00ff88;
      border-radius: ${isMobile ? '12px' : '16px'};
      padding: ${isMobile ? '1.5rem' : '2rem'};
      max-width: ${isMobile ? '100%' : '600px'};
      width: ${isMobile ? '100%' : '90%'};
      max-height: ${isMobile ? '85vh' : 'auto'};
      overflow-y: ${isMobile ? 'auto' : 'visible'};
      box-shadow: 0 20px 40px rgba(0, 255, 136, 0.2);
      animation: slideIn 0.5s ease-out;
      font-size: ${config.fontSize}px;
    `

    panel.innerHTML = `
      <div class="panel-content" style="color: #ffffff; line-height: 1.6;">
        ${content}
      </div>
      <div class="panel-actions" style="
        margin-top: ${isMobile ? '1.5rem' : '2rem'}; 
        display: flex; 
        gap: ${isMobile ? '0.75rem' : '1rem'}; 
        justify-content: flex-end;
        flex-wrap: wrap;
      ">
        ${actions.map(action => `
          <button class="action-btn ${action.primary ? 'primary' : 'secondary'}" 
                  style="
                    padding: ${isMobile ? '0.875rem 1.25rem' : '0.75rem 1.5rem'};
                    border: 2px solid ${action.primary ? '#00ff88' : '#666'};
                    background: ${action.primary ? '#00ff88' : 'transparent'};
                    color: ${action.primary ? '#000' : '#00ff88'};
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: ${isMobile ? '16px' : '14px'};
                    min-height: ${isMobile ? '44px' : 'auto'};
                    min-width: ${isMobile ? '120px' : 'auto'};
                    transition: all 0.3s ease;
                    flex: ${isMobile ? '1' : 'none'};
                  "
                  onmouseover="this.style.transform='scale(1.05)'"
                  onmouseout="this.style.transform='scale(1)'"
          >
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

    this.currentPanel = panel
    this.container.appendChild(panel)
    this.show()
  }

  // CLEAN: Welcome panel with immersive patient briefing
  private showWelcomePanel(): void {
    const isMobile = mobileUI.isMobileDevice()
    
    const content = `
      <div style="text-align: center;">
        <h1 style="
          color: #00ff88; 
          font-size: ${isMobile ? '2rem' : '2.5rem'}; 
          margin-bottom: 1rem; 
          text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
          line-height: 1.2;
        ">
          🏥 X-RAI Medical Simulator
        </h1>
        <div style="
          background: rgba(0, 255, 136, 0.1); 
          padding: ${isMobile ? '1rem' : '1.5rem'}; 
          border-radius: 12px; 
          margin: ${isMobile ? '1rem 0' : '1.5rem 0'};
        ">
          <h2 style="color: #00ff88; margin-bottom: 1rem; font-size: ${isMobile ? '1.3rem' : '1.5rem'};">
            📋 Patient Briefing
          </h2>
          <p style="font-size: ${isMobile ? '1rem' : '1.1rem'}; margin-bottom: 1rem; line-height: 1.5;">
            <strong>Emergency Department - 14:30</strong><br>
            You are the attending physician on duty. A new patient has arrived with concerning symptoms.
          </p>
          <p style="color: #ffaa00; font-weight: bold; font-size: ${isMobile ? '0.95rem' : '1rem'};">
            🚨 Your diagnostic skills are needed immediately
          </p>
        </div>
        <div style="
          background: rgba(0, 255, 136, 0.05); 
          padding: ${isMobile ? '0.75rem' : '1rem'}; 
          border-radius: 8px; 
          margin-top: ${isMobile ? '1rem' : '1.5rem'};
          border-left: 3px solid #00ff88;
        ">
          <h3 style="color: #00ff88; margin-bottom: 0.5rem; font-size: ${isMobile ? '1.1rem' : '1.2rem'};">
            🎯 Quick Start Guide
          </h3>
          <ul style="
            text-align: left; 
            font-size: ${isMobile ? '0.9rem' : '1rem'}; 
            opacity: 0.9; 
            line-height: 1.4;
            margin: 0;
            padding-left: 1.2rem;
          ">
            <li>🖱️ <strong>Rotate & Zoom:</strong> Use mouse/touch to examine the 3D model</li>
            <li>🧠 <strong>AI Assistant:</strong> Get diagnostic hints powered by Cerebras AI</li>
            <li>⏱️ <strong>Time Limit:</strong> 5 minutes to make your diagnosis</li>
            <li>🏆 <strong>Scoring:</strong> Earn points for accuracy and speed</li>
          </ul>
        </div>
        <p style="
          font-size: ${isMobile ? '0.85rem' : '0.9rem'}; 
          opacity: 0.8; 
          margin-top: ${isMobile ? '1rem' : '1.5rem'};
          line-height: 1.4;
        ">
          Powered by <strong>Cerebras AI</strong> and <strong>Meta Llama 4</strong> 
          for ultra-fast, realistic medical simulations.
        </p>
      </div>
    `

    this.showPanel(content, [
      { text: isMobile ? 'Skip' : 'Skip Tutorial', action: () => this.phaseManager.transitionTo(GamePhase.EXPLORATION) },
      { text: isMobile ? 'Tutorial' : 'Start Tutorial', action: () => this.phaseManager.transitionTo(GamePhase.TUTORIAL), primary: true }
    ])
  }

  // CLEAN: Interactive tutorial panel
  private showTutorialPanel(): void {
    const state = this.phaseManager.getState()
    const steps = [
      {
        title: '🔍 X-Ray Navigation',
        content: 'Use your mouse to rotate and zoom the 3D model. Look for anatomical markers and abnormalities.'
      },
      {
        title: '🧠 AI Assistant',
        content: 'Click "Clinical Hint" for AI-powered diagnostic assistance using Cerebras ultra-fast inference.'
      },
      {
        title: '⏱️ Time Management', 
        content: 'You have 5 minutes to make your diagnosis. Use time wisely - real patients are waiting!'
      },
      {
        title: '🎯 Scoring System',
        content: 'Earn points for accurate diagnoses, quick decisions, and proper use of diagnostic tools.'
      }
    ]

    const currentStep = steps[state.tutorialStep] || steps[0]
    const isLastStep = state.tutorialStep >= steps.length - 1

    const content = `
      <div style="text-align: center;">
        <h2 style="color: #00ff88; margin-bottom: 1rem;">
          ${currentStep.title}
        </h2>
        <div style="background: rgba(0, 255, 136, 0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
          <p style="font-size: 1.1rem; line-height: 1.6;">
            ${currentStep.content}
          </p>
        </div>
        <div style="margin: 1rem 0;">
          <div style="background: #333; height: 4px; border-radius: 2px; overflow: hidden;">
            <div style="background: #00ff88; height: 100%; width: ${((state.tutorialStep + 1) / steps.length) * 100}%; transition: width 0.3s ease;"></div>
          </div>
          <p style="margin-top: 0.5rem; opacity: 0.7;">Step ${state.tutorialStep + 1} of ${steps.length}</p>
        </div>
      </div>
    `

    const actions = []
    if (state.tutorialStep > 0) {
      actions.push({ text: 'Previous', action: () => this.previousTutorialStep() })
    }
    actions.push({ text: 'Skip', action: () => this.phaseManager.transitionTo(GamePhase.EXPLORATION) })
    
    if (isLastStep) {
      actions.push({ text: 'Start Exploring', action: () => this.phaseManager.transitionTo(GamePhase.EXPLORATION), primary: true })
    } else {
      actions.push({ text: 'Next', action: () => this.nextTutorialStep(), primary: true })
    }

    this.showPanel(content, actions)
  }

  // CLEAN: Exploration phase with progress tracking
  private showExplorationPanel(): void {
    const state = this.phaseManager.getState()
    
    const content = `
      <div style="text-align: center;">
        <h2 style="color: #00ff88; margin-bottom: 1rem;">
          🔬 Explore the Patient
        </h2>
        <div style="background: rgba(0, 255, 136, 0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">
            Take your time to examine the 3D model. Rotate, zoom, and identify key anatomical structures.
          </p>
          <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden; margin: 1rem 0;">
            <div style="background: #00ff88; height: 100%; width: ${state.explorationProgress}%; transition: width 0.3s ease;"></div>
          </div>
          <p style="opacity: 0.8;">Exploration Progress: ${Math.round(state.explorationProgress)}%</p>
        </div>
        <p style="color: #ffaa00; font-weight: bold;">
          💡 The more you explore, the better prepared you'll be for diagnosis!
        </p>
      </div>
    `

    this.showPanel(content, [
      { text: 'Back to Tutorial', action: () => this.phaseManager.transitionTo(GamePhase.TUTORIAL) },
      { 
        text: state.explorationProgress >= 50 ? 'I\'m Ready!' : 'Continue Exploring', 
        action: () => {
          if (state.explorationProgress >= 50) {
            this.phaseManager.transitionTo(GamePhase.READY)
          } else {
            this.hide()
            // Let user continue exploring
            setTimeout(() => this.updateExplorationProgress(), 2000)
          }
        }, 
        primary: true 
      }
    ])
  }

  // CLEAN: Ready phase with final briefing
  private showReadyPanel(): void {
    const content = `
      <div style="text-align: center;">
        <h2 style="color: #00ff88; margin-bottom: 1rem;">
          🚀 Ready for Diagnosis
        </h2>
        <div style="background: rgba(255, 170, 0, 0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; border: 1px solid #ffaa00;">
          <h3 style="color: #ffaa00; margin-bottom: 1rem;">⚠️ Final Briefing</h3>
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">
            Once you start the timer, you'll have <strong>5 minutes</strong> to:
          </p>
          <ul style="text-align: left; margin: 1rem 0; padding-left: 2rem;">
            <li>Analyze the patient's condition</li>
            <li>Use AI assistance when needed</li>
            <li>Make your final diagnosis</li>
            <li>Recommend treatment</li>
          </ul>
          <p style="color: #00ff88; font-weight: bold;">
            🎯 Remember: Accuracy and speed both matter!
          </p>
        </div>
      </div>
    `

    this.showPanel(content, [
      { text: 'More Practice', action: () => this.phaseManager.transitionTo(GamePhase.EXPLORATION) },
      { text: 'Start Diagnosis!', action: () => this.phaseManager.transitionTo(GamePhase.ACTIVE), primary: true }
    ])
  }

  // CLEAN: Completion panel with results
  private showCompletePanel(): void {
    const state = this.phaseManager.getState()
    
    const content = `
      <div style="text-align: center;">
        <h2 style="color: #00ff88; margin-bottom: 1rem;">
          🏆 Diagnosis Complete
        </h2>
        <div style="background: rgba(0, 255, 136, 0.1); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
          <h3 style="color: #00ff88; font-size: 2rem; margin-bottom: 1rem;">
            Score: ${state.score}
          </h3>
          <p style="font-size: 1.1rem;">
            Time Used: ${Math.floor((300 - state.timeRemaining) / 60)}:${String((300 - state.timeRemaining) % 60).padStart(2, '0')}
          </p>
        </div>
        <p style="opacity: 0.9;">
          Thank you for using X-RAI Medical Simulator powered by Cerebras AI and Meta Llama 4.
        </p>
      </div>
    `

    this.showPanel(content, [
      { text: 'New Case', action: () => this.phaseManager.transitionTo(GamePhase.WELCOME), primary: true }
    ])
  }

  // Helper methods
  private nextTutorialStep(): void {
    const state = this.phaseManager.getState()
    this.phaseManager.updateState({ tutorialStep: state.tutorialStep + 1 })
    this.showTutorialPanel()
  }

  private previousTutorialStep(): void {
    const state = this.phaseManager.getState()
    this.phaseManager.updateState({ tutorialStep: Math.max(0, state.tutorialStep - 1) })
    this.showTutorialPanel()
  }

  private updateExplorationProgress(): void {
    const state = this.phaseManager.getState()
    const newProgress = Math.min(100, state.explorationProgress + 25)
    this.phaseManager.updateState({ explorationProgress: newProgress })
    
    if (newProgress < 100) {
      this.showExplorationPanel()
    } else {
      this.phaseManager.transitionTo(GamePhase.READY)
    }
  }

  // PERFORMANT: Efficient show/hide with CSS transitions
  private show(): void {
    this.container.style.pointerEvents = 'auto'
    this.container.style.opacity = '1'
  }

  private hide(): void {
    this.container.style.opacity = '0'
    setTimeout(() => {
      this.container.style.pointerEvents = 'none'
    }, 500)
  }

  private clearCurrentPanel(): void {
    if (this.currentPanel) {
      this.currentPanel.remove()
      this.currentPanel = undefined
    }
  }

  // CLEAN: Explicit cleanup
  destroy(): void {
    this.clearCurrentPanel()
    this.container.remove()
  }
}