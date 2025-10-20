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
  tooltipMessage?: string;
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
        description: 'AI-powered medical diagnostic training with Web3 achievements',
        action: 'start-experience',
        autoProgress: false,
        duration: 3000
      },
      {
        id: 'wallet-connection',
        title: 'Connect Your Wallet',
        description: 'Connect your wallet to save achievements and access AI consultations',
        action: 'wallet-connect',
        targetElement: '.wallet-connection-panel',
        tooltipMessage: 'Click "Connect" to enable all features',
        autoProgress: false,
        duration: 5000
      },
      {
        id: 'camera-controls',
        title: 'Camera Controls',
        description: 'Click and drag to rotate the 3D patient model',
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
        id: 'investigation-tools',
        title: 'Investigation Tools',
        description: 'Use medical tools like palpation, auscultation, and percussion for detailed examination',
        action: 'use-investigation-tool',
        targetElement: '.investigation-toolkit',
        tooltipMessage: 'Click investigation tools for detailed analysis',
        autoProgress: false,
        duration: 4000
      },
      {
        id: 'voice-consultation',
        title: 'AI Voice Consultation',
        description: 'Press "V" or click the consultation button to get AI medical advice',
        action: 'voice-consultation',
        targetElement: '.ai-consultation-button',
        tooltipMessage: 'Get expert AI guidance during diagnosis',
        autoProgress: false,
        duration: 4000
      },
      {
        id: 'diagnosis-submission',
        title: 'Submit Diagnosis',
        description: 'When ready, submit your diagnosis to complete the case and earn achievements',
        action: 'diagnosis-submit',
        targetElement: '.diagnosis-submission-section',
        tooltipMessage: 'Submit when you have enough evidence',
        autoProgress: false,
        duration: 4000
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
        id: 'investigation-tools',
        title: 'Investigation Tools',
        description: 'Use these tools to gather more information about the patient.',
        action: 'show-investigation-tools',
        targetElement: '#investigation-tools-panel',
        autoProgress: false,
        duration: 4000,
        tooltipMessage: 'This panel contains all the tools you need to investigate the case.'
      },
      {
        id: 'voice-consultation',
        title: 'Voice Consultation',
        description: 'Click the microphone to consult with Nurse Amy, your AI assistant.',
        action: 'show-voice-consultation',
        targetElement: '#voice-toggle-btn',
        autoProgress: false,
        duration: 4000,
        tooltipMessage: 'Click here to talk to Nurse Amy.'
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