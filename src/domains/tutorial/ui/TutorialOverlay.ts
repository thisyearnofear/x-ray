/**
 * Tutorial Overlay UI
 * MODULAR: Single responsibility for tutorial UI rendering
 * DRY: Centralized tutorial UI logic
 * CLEAN: Pure UI component, no business logic
 */

import { colors, spacing, typography, borders, effects, zIndex } from '../../../styles/design-tokens'
import type { TutorialStep } from '../services/TutorialStepService'

export interface TutorialOverlayConfig {
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  onComplete: () => void
}

export class TutorialOverlay {
  private element: HTMLElement | null = null
  private config: TutorialOverlayConfig
  private currentStep: TutorialStep | null = null

  constructor(config: TutorialOverlayConfig) {
    this.config = config
    this.addStyles()
  }

  create(): HTMLElement {
    this.element = document.createElement('div')
    this.element.className = 'tutorial-overlay'
    this.element.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: ${zIndex.modal + 10};
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: ${effects.blur.base};
    `

    this.element.innerHTML = this.generateHTML()
    this.setupEventListeners()
    console.log('Tutorial overlay created')
    return this.element
  }

  updateStep(step: TutorialStep, progress: { current: number; total: number; percentage: number }): void {
    if (!this.element) return

    this.currentStep = step
    
    const titleElement = this.element.querySelector('.tutorial-title')
    const descriptionElement = this.element.querySelector('.tutorial-description')
    const progressElement = this.element.querySelector('.tutorial-progress-text')
    const progressBar = this.element.querySelector('.tutorial-progress-fill') as HTMLElement

    if (titleElement) titleElement.textContent = step.title
    if (descriptionElement) descriptionElement.textContent = step.description
    if (progressElement) progressElement.textContent = `${progress.current} / ${progress.total}`
    if (progressBar) progressBar.style.width = `${progress.percentage}%`

    this.updateButtons(step)
    this.highlightElement(step.targetElement);
  }

  private highlightElement(selector: string | undefined): void {
    // Clear previous highlights
    const highlighted = document.querySelectorAll('.tutorial-highlight');
    highlighted.forEach(el => {
        (el as HTMLElement).style.boxShadow = '';
        (el as HTMLElement).style.borderRadius = '';
        (el as HTMLElement).style.transition = '';
        el.classList.remove('tutorial-highlight');
    });

    if (!selector) return;

    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
        element.classList.add('tutorial-highlight');
        element.style.boxShadow = `0 0 20px 10px ${colors.primary.base}`;
        element.style.borderRadius = borders.radius.lg;
        element.style.transition = 'box-shadow 0.3s ease-in-out';
    }
  }

  hide(): void {
    if (this.element) {
      this.element.style.display = 'none'
      console.log('Tutorial overlay hidden')
    }
  }

  show(): void {
    if (this.element) {
      this.element.style.display = 'flex'
      console.log('Tutorial overlay shown')
    }
  }

  // ENHANCEMENT FIRST: Show special centered completion modal
  showCompletionModal(): void {
    // Remove existing overlay
    this.destroy()

    // Create special completion modal
    this.element = document.createElement('div')
    this.element.className = 'tutorial-completion-overlay'
    this.element.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: ${zIndex.modal + 20};
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      animation: fadeIn 0.5s ease-out;
    `

    this.element.innerHTML = `
      <div class="completion-modal" style="
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #00ff88;
        border-radius: 20px;
        padding: 3rem;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 255, 136, 0.4);
        text-align: center;
        animation: celebrationPulse 2s ease-in-out infinite;
      ">
        <div style="font-size: 5rem; margin-bottom: 1.5rem; animation: bounce 1s ease-in-out infinite;">🎓</div>
        
        <h1 style="
          color: #00ff88;
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        ">
          Tutorial Complete!
        </h1>
        
        <p style="
          color: white;
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          opacity: 0.9;
        ">
          You've mastered the basics of X-Ray AI diagnostics.
          Ready to put your skills to the test?
        </p>

        <div style="
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        ">
          <h3 style="color: #00ff88; margin-bottom: 1rem; font-size: 1.1rem;">What You Learned:</h3>
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            text-align: left;
            color: white;
            font-size: 0.95rem;
          ">
            <div>✅ Camera Navigation</div>
            <div>✅ Scanning Bodies</div>
            <div>✅ Finding Conditions</div>
            <div>✅ AI Assistance</div>
          </div>
        </div>

        <div style="
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        ">
          <h3 style="color: #00d4ff; margin-bottom: 0.75rem; font-size: 1.1rem;">Next Up:</h3>
          <p style="color: white; font-size: 0.95rem; margin: 0; opacity: 0.9;">
            🏥 Your first patient case is waiting<br>
            ⏰ Race against time to diagnose conditions<br>
            🏆 Earn achievements and unlock new cases
          </p>
        </div>

        <button id="start-game-btn" style="
          width: 100%;
          background: linear-gradient(45deg, #00ff88, #00cc6a);
          color: black;
          border: none;
          padding: 1.25rem 2rem;
          border-radius: 15px;
          cursor: pointer;
          font-size: 1.3rem;
          font-weight: bold;
          box-shadow: 0 8px 25px rgba(0, 255, 136, 0.4);
          transition: all 0.3s ease;
        ">
          🎮 Start Your First Case
        </button>

        <div style="
          margin-top: 1.5rem;
          font-size: 0.85rem;
          opacity: 0.6;
          color: white;
        ">
          💡 Tip: Connect your wallet later to earn NFT achievements!
        </div>
      </div>
    `

    document.body.appendChild(this.element)

    // Setup event listener
    const startBtn = this.element.querySelector('#start-game-btn')
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.config.onComplete()
      })

      // Add hover effect
      startBtn.addEventListener('mouseenter', (e: Event) => {
        const target = e.target as HTMLElement
        target.style.transform = 'translateY(-4px) scale(1.02)'
        target.style.boxShadow = '0 12px 35px rgba(0, 255, 136, 0.6)'
      })

      startBtn.addEventListener('mouseleave', (e: Event) => {
        const target = e.target as HTMLElement
        target.style.transform = 'translateY(0) scale(1)'
        target.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.4)'
      })
    }

    console.log('✨ Tutorial completion modal shown')
  }

  private generateHTML(): string {
    return `
      <div class="tutorial-modal" style="
        background: ${colors.background.gradient.panel};
        border: ${borders.width.base} solid ${colors.primary.base};
        border-radius: ${borders.radius.xl};
        padding: ${spacing.xl};
        max-width: 500px;
        width: 90%;
        box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
        text-align: center;
      ">
        <div class="tutorial-header" style="margin-bottom: ${spacing.lg};">
          <h2 class="tutorial-title" style="
            color: ${colors.primary.base};
            font-size: ${typography.fontSize['2xl']};
            font-weight: ${typography.fontWeight.bold};
            margin-bottom: ${spacing.sm};
            text-shadow: ${effects.textShadow.md};
          ">
            Tutorial Step
          </h2>
          <div class="tutorial-progress" style="
            background: rgba(0,255,136,0.1);
            border-radius: ${borders.radius.full};
            height: 8px;
            margin-bottom: ${spacing.sm};
            overflow: hidden;
          ">
            <div class="tutorial-progress-fill" style="
              background: linear-gradient(90deg, ${colors.primary.base}, ${colors.accent.base});
              height: 100%;
              width: 0%;
              transition: width 0.3s ease;
            "></div>
          </div>
          <div class="tutorial-progress-text" style="
            color: ${colors.neutral.light};
            font-size: ${typography.fontSize.sm};
          ">
            1 / 8
          </div>
        </div>

        <div class="tutorial-content" style="margin-bottom: ${spacing.xl};">
          <p class="tutorial-description" style="
            color: ${colors.neutral.white};
            font-size: ${typography.fontSize.lg};
            line-height: ${typography.lineHeight.relaxed};
            margin-bottom: ${spacing.lg};
          ">
            Tutorial description will appear here
          </p>
        </div>

        <div class="tutorial-actions" style="
          display: flex;
          gap: ${spacing.md};
          justify-content: center;
          flex-wrap: wrap;
        ">
          <button class="tutorial-btn tutorial-btn-secondary" id="tutorial-previous" style="display: none;">
            Previous
          </button>
          <button class="tutorial-btn tutorial-btn-primary" id="tutorial-next">
            Next
          </button>
          <button class="tutorial-btn tutorial-btn-ghost" id="tutorial-skip">
            Skip Tutorial
          </button>
        </div>
      </div>
    `
  }

  private updateButtons(step: TutorialStep): void {
    if (!this.element) return

    const previousBtn = this.element.querySelector('#tutorial-previous') as HTMLElement
    const nextBtn = this.element.querySelector('#tutorial-next') as HTMLElement
    const skipBtn = this.element.querySelector('#tutorial-skip') as HTMLElement

    // Show/hide previous button
    if (previousBtn) {
      previousBtn.style.display = step.id === 'welcome' ? 'none' : 'inline-flex'
    }

    // Update next button text
    if (nextBtn) {
      if (step.id === 'tutorial-complete') {
        nextBtn.textContent = 'Start Game'
        nextBtn.className = 'tutorial-btn tutorial-btn-success'
      } else if (step.autoProgress) {
        nextBtn.textContent = 'Continue'
        nextBtn.className = 'tutorial-btn tutorial-btn-primary'
      } else {
        nextBtn.textContent = 'Next'
        nextBtn.className = 'tutorial-btn tutorial-btn-primary'
      }
    }

    // Hide skip button on last step
    if (skipBtn) {
      skipBtn.style.display = step.id === 'tutorial-complete' ? 'none' : 'inline-flex'
    }
  }

  private setupEventListeners(): void {
    if (!this.element) return

    const previousBtn = this.element.querySelector('#tutorial-previous')
    const nextBtn = this.element.querySelector('#tutorial-next')
    const skipBtn = this.element.querySelector('#tutorial-skip')

    if (previousBtn) {
      previousBtn.addEventListener('click', this.config.onPrevious)
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep?.id === 'tutorial-complete') {
          this.config.onComplete()
        } else {
          this.config.onNext()
        }
      })
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', this.config.onSkip)
    }
  }

  private addStyles(): void {
    if (document.querySelector('#tutorial-overlay-styles')) return

    const style = document.createElement('style')
    style.id = 'tutorial-overlay-styles'
    style.textContent = `
      .tutorial-btn {
        padding: ${spacing.sm} ${spacing.lg};
        border-radius: ${borders.radius.md};
        font-size: ${typography.fontSize.base};
        font-weight: ${typography.fontWeight.medium};
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: ${spacing.xs};
      }

      .tutorial-btn-primary {
        background: linear-gradient(135deg, ${colors.primary.base}, ${colors.primary.dark});
        color: ${colors.neutral.black};
      }

      .tutorial-btn-secondary {
        background: rgba(255,255,255,0.1);
        color: ${colors.neutral.white};
        border: ${borders.width.thin} solid ${colors.border.primary};
      }

      .tutorial-btn-success {
        background: linear-gradient(135deg, ${colors.accent.base}, ${colors.accent.dark});
        color: ${colors.neutral.black};
      }

      .tutorial-btn-ghost {
        background: transparent;
        color: ${colors.neutral.light};
        border: ${borders.width.thin} solid transparent;
      }

      .tutorial-btn:hover {
        transform: translateY(-2px);
        box-shadow: ${effects.shadow.md};
      }

      .tutorial-btn-primary:hover {
        box-shadow: ${effects.shadow.md}, ${effects.shadow.primaryGlow};
      }

      .tutorial-btn-success:hover {
        box-shadow: ${effects.shadow.md}, ${effects.shadow.accentGlow};
      }

      .tutorial-btn-ghost:hover {
        border-color: ${colors.border.primary};
        background: rgba(255,255,255,0.05);
      }

      @media (max-width: 768px) {
        .tutorial-modal {
          padding: ${spacing.lg} !important;
          margin: ${spacing.base} !important;
        }
        
        .tutorial-actions {
          flex-direction: column !important;
        }
        
        .tutorial-btn {
          width: 100% !important;
          justify-content: center !important;
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes celebrationPulse {
        0%, 100% { box-shadow: 0 20px 60px rgba(0, 255, 136, 0.4); }
        50% { box-shadow: 0 25px 70px rgba(0, 255, 136, 0.6); }
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `
    document.head.appendChild(style)
  }

  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.element = null
  }
}