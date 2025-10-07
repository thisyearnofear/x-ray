/**
 * Tutorial Step Service
 * MODULAR: Single responsibility for tutorial step management
 * DRY: Centralized step definitions and logic
 * CLEAN: Pure step service, no UI concerns
 */

export interface TutorialStep {
  id: string
  title: string
  description: string
  action: string
  targetElement?: string
  highlightArea?: string
  autoProgress?: boolean
  duration?: number
  data?: any
}

export class TutorialStepService {
  private steps: TutorialStep[] = []
  private currentStepIndex: number = 0

  constructor() {
    this.initializeSteps()
  }

  private initializeSteps(): void {
    this.steps = [
      {
        id: 'welcome',
        title: 'Welcome to X-RAI Medical Simulator',
        description: 'Advanced AI-powered medical diagnostic training system',
        action: 'start-experience',
        autoProgress: false,
        duration: 3000
      },
      {
        id: 'mouse-movement',
        title: 'Mouse Movement',
        description: 'Move your mouse to explore the interface',
        action: 'mousemove',
        autoProgress: true,
        duration: 2000
      },
      {
        id: 'camera-controls',
        title: 'Camera Controls',
        description: 'Click and drag to rotate the 3D model',
        action: 'camera-move',
        autoProgress: true,
        duration: 3000
      },
      {
        id: 'scan-introduction',
        title: 'X-Ray Scanning',
        description: 'Hold left mouse button to scan anatomical regions',
        action: 'scan-start',
        highlightArea: 'head',
        autoProgress: false,
        duration: 4000
      },
      {
        id: 'scan-demo',
        title: 'Scanning Demo',
        description: 'Watch as we demonstrate the scanning process',
        action: 'scan-demo',
        autoProgress: true,
        duration: 3000
      },
      {
        id: 'scan-progress',
        title: 'Scan Progress',
        description: 'Continue scanning until progress reaches 100%',
        action: 'scan-progress-100',
        autoProgress: false,
        duration: 5000
      },
      {
        id: 'condition-discovery',
        title: 'Condition Discovery',
        description: 'Click on highlighted areas to discover medical conditions',
        action: 'click-condition',
        autoProgress: false,
        duration: 4000
      },
      {
        id: 'tutorial-complete',
        title: 'Tutorial Complete',
        description: 'You\'re ready to start your medical diagnostic journey!',
        action: 'start-game',
        autoProgress: false,
        duration: 2000
      }
    ]
  }

  // CLEAN: Step navigation
  getCurrentStep(): TutorialStep | null {
    return this.steps[this.currentStepIndex] || null
  }

  getNextStep(): TutorialStep | null {
    return this.steps[this.currentStepIndex + 1] || null
  }

  getPreviousStep(): TutorialStep | null {
    return this.steps[this.currentStepIndex - 1] || null
  }

  // MODULAR: Step progression
  nextStep(): TutorialStep | null {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++
      return this.getCurrentStep()
    }
    return null
  }

  previousStep(): TutorialStep | null {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--
      return this.getCurrentStep()
    }
    return null
  }

  goToStep(stepId: string): TutorialStep | null {
    const index = this.steps.findIndex(step => step.id === stepId)
    if (index !== -1) {
      this.currentStepIndex = index
      return this.getCurrentStep()
    }
    return null
  }

  // DRY: Progress tracking
  getProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.currentStepIndex + 1,
      total: this.steps.length,
      percentage: Math.round(((this.currentStepIndex + 1) / this.steps.length) * 100)
    }
  }

  isFirstStep(): boolean {
    return this.currentStepIndex === 0
  }

  isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1
  }

  isComplete(): boolean {
    return this.currentStepIndex >= this.steps.length
  }

  // CLEAN: Step validation
  canProgressFrom(stepId: string, actionData?: any): boolean {
    const step = this.steps.find(s => s.id === stepId)
    if (!step) return false

    // Auto-progress steps can always progress
    if (step.autoProgress) return true

    // Manual steps require specific validation
    switch (step.action) {
      case 'start-experience':
      case 'start-game':
        return true
      case 'scan-progress-100':
        return actionData?.progress >= 100
      case 'click-condition':
        return actionData?.conditionClicked === true
      default:
        return false
    }
  }

  // MODULAR: Reset functionality
  reset(): void {
    this.currentStepIndex = 0
  }

  // DRY: Step lookup
  getStepById(stepId: string): TutorialStep | null {
    return this.steps.find(step => step.id === stepId) || null
  }

  getAllSteps(): TutorialStep[] {
    return [...this.steps]
  }
}