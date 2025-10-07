/**
 * Tutorial Facade
 * AGGRESSIVE CONSOLIDATION: Replaces 544-line InteractiveTutorial.ts with clean facade
 * ENHANCEMENT FIRST: Uses focused service and UI components
 * CLEAN: Clear separation between tutorial logic and UI
 */

import { TutorialStepService, type TutorialStep } from './services/TutorialStepService'
import { TutorialOverlay } from './ui/TutorialOverlay'
import { AudioManager } from '../../components/AudioManager'

export interface TutorialConfig {
  onStepComplete?: (stepId: string) => void
  onTutorialComplete?: () => void
  onActionRequired?: (action: string, data?: any) => void
  audioManager?: AudioManager
  xRayEffect?: any
  scanFeedbackSystem?: any
  diagnosticUI?: any
}

export class TutorialFacade {
  private stepService: TutorialStepService
  private overlay: TutorialOverlay | null = null
  private config: TutorialConfig
  private isActive: boolean = false

  constructor(config: TutorialConfig = {}) {
    this.config = config
    this.stepService = new TutorialStepService()
    
    this.overlay = new TutorialOverlay({
      onNext: () => this.nextStep(),
      onPrevious: () => this.previousStep(),
      onSkip: () => this.skip(),
      onComplete: () => this.complete()
    })
  }

  // CLEAN: Public interface
  start(): void {
    if (this.isActive) return

    this.isActive = true
    this.stepService.reset()
    
    // Enable audio systems on tutorial start
    if (this.config.audioManager) {
      this.config.audioManager.ensureAudioContext?.()
    }
    
    const overlayElement = this.overlay!.create()
    document.body.appendChild(overlayElement)
    
    this.showCurrentStep()
    this.playTutorialAudio('welcome')
  }

  nextStep(): void {
    const currentStep = this.stepService.getCurrentStep()
    if (currentStep) {
      this.config.onStepComplete?.(currentStep.id)
    }

    const nextStep = this.stepService.nextStep()
    if (nextStep) {
      this.showCurrentStep()
    } else {
      this.complete()
    }
  }

  previousStep(): void {
    const previousStep = this.stepService.previousStep()
    if (previousStep) {
      this.showCurrentStep()
    }
  }

  skip(): void {
    this.complete()
  }

  complete(): void {
    this.isActive = false
    this.overlay?.hide()
    this.config.onTutorialComplete?.()
  }

  // MODULAR: Action handling
  actionPerformed(action: string, success: boolean, data?: any): void {
    const currentStep = this.stepService.getCurrentStep()
    if (!currentStep || currentStep.action !== action) return

    if (success && this.stepService.canProgressFrom(currentStep.id, data)) {
      if (currentStep.autoProgress) {
        setTimeout(() => this.nextStep(), 1000)
      }
    }
  }

  updateProgress(progress: number): void {
    // Handle progress updates for scan-related steps
    const currentStep = this.stepService.getCurrentStep()
    if (currentStep?.action === 'scan-progress-100' && progress >= 100) {
      this.actionPerformed('scan-progress-100', true, { progress })
    }
  }

  // CLEAN: Private methods
  private showCurrentStep(): void {
    const step = this.stepService.getCurrentStep()
    if (!step || !this.overlay) return

    const progress = this.stepService.getProgress()
    this.overlay.updateStep(step, progress)
    this.overlay.show()

    // Trigger action requirement
    this.config.onActionRequired?.(step.action, step.data)
  }

  // ENHANCEMENT FIRST: Backward compatibility
  getIsActive(): boolean {
    return this.isActive
  }

  getCurrentStepId(): string | null {
    return this.stepService.getCurrentStep()?.id || null
  }

  // ENHANCEMENT FIRST: Audio integration for immersive experience
  private playTutorialAudio(type: string): void {
    if (this.config.audioManager) {
      try {
        // Map tutorial events to audio cues
        const audioMap: Record<string, string> = {
          'welcome': 'tutorial_start',
          'step_complete': 'tutorial_progress',
          'tutorial_complete': 'tutorial_success'
        }
        
        const soundType = audioMap[type]
        if (soundType && typeof this.config.audioManager.playSound === 'function') {
          this.config.audioManager.playSound(soundType as any)
        }
      } catch (error) {
        console.warn('Tutorial audio warning:', error)
      }
    }
  }

  destroy(): void {
    this.overlay?.destroy()
    this.isActive = false
  }
}