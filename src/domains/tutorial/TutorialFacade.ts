/**
 * Tutorial Facade
 * AGGRESSIVE CONSOLIDATION: Replaces 544-line InteractiveTutorial.ts with clean facade
 * ENHANCEMENT FIRST: Uses focused service and UI components
 * CLEAN: Clear separation between tutorial logic and UI
 */

import { TutorialStepService, type TutorialStep } from './services/TutorialStepService'
import { TutorialOverlay } from './ui/TutorialOverlay'
import { AudioManager } from '../../components/AudioManager'
import { TooltipManager } from '../../components/ui/TooltipManager';

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
  private tooltipManager: TooltipManager;

  constructor(config: TutorialConfig = {}) {
    this.config = config
    this.stepService = new TutorialStepService()
    this.tooltipManager = new TooltipManager();
    
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

    if (step.targetElement && step.tooltipMessage) {
        const targetElement = document.querySelector(step.targetElement) as HTMLElement;
        if (targetElement) {
            this.tooltipManager.createTooltip(step.id, {
                targetElement,
                message: step.tooltipMessage
            });
            this.tooltipManager.showTooltip(step.id);
        } else {
            this.tooltipManager.destroyTooltip(step.id);
        }
    } else {
        this.tooltipManager.destroyTooltip(this.stepService.getPreviousStep()?.id || '');
    }

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
        // Map tutorial events to existing audio cues
        const audioMap: Record<string, string> = {
          'welcome': 'MEDICAL_BEEP', // Use existing sound
          'step_complete': 'DISCOVERY',
          'tutorial_complete': 'CONDITION_FOUND'
        }
        
        const soundType = audioMap[type]
        if (soundType && typeof this.config.audioManager.playSound === 'function') {
          // Use existing sounds instead of missing tutorial_start
          this.config.audioManager.playSound(soundType as any)
        }
      } catch (error) {
        // Silently handle missing sounds
      }
    }
  }

  destroy(): void {
    this.overlay?.destroy()
    this.isActive = false
  }
}