/**
 * Diagnostic UI Facade
 * AGGRESSIVE CONSOLIDATION: Replaces 2,259-line monolith with clean facade
 * ENHANCEMENT FIRST: Uses existing modular components
 * CLEAN: Clear separation of concerns - UI orchestration only
 * DRY: Single source of truth for UI state management
 */

import { AudioManager } from '../../components/AudioManager'
import { DiagnosticUIManager } from './managers/DiagnosticUIManager'
// Simple interfaces for now
interface PatientCase {
  patientName?: string
  age?: number
  [key: string]: any
}

export interface DiagnosticUIConfig {
  audioManager: AudioManager
  xRayEffect?: any
  scanFeedbackSystem?: any
  onSolveClick?: () => void
  onHintClick?: () => void
  onConsultationClick?: () => void
  onDiagnosisSubmit?: (selectedConditions: string[]) => void
  onError?: (message: string) => void
}

export class DiagnosticUIFacade {
  private uiManager: DiagnosticUIManager
  private audioManager: AudioManager
  private isInitialized: boolean = false

  // CLEAN: External system references
  private xRayEffect: any = null
  private scanFeedbackSystem: any = null

  constructor(config: DiagnosticUIConfig) {
    this.audioManager = config.audioManager
    this.xRayEffect = config.xRayEffect
    this.scanFeedbackSystem = config.scanFeedbackSystem

    // MODULAR: Initialize UI manager with clean config
    this.uiManager = new DiagnosticUIManager({
      onSolveClick: config.onSolveClick,
      onHintClick: config.onHintClick,
      onConsultationClick: config.onConsultationClick,
      onDiagnosisSubmit: config.onDiagnosisSubmit,
      onError: config.onError || this.showError.bind(this)
    })
  }

  // CLEAN: Public interface - only essential methods
  initialize(): void {
    if (this.isInitialized) return
    
    this.uiManager.initialize()
    this.isInitialized = true
  }

  updatePatientInfo(patientCase: PatientCase): void {
    this.uiManager.updatePatientInfo(patientCase)
  }

  updateScanProgress(conditionId: string, progress: number): void {
    // CLEAN: Delegate to UI manager for scan progress updates
    // console.log('Updating scan progress:', conditionId, progress) // DEBUG: Remove excessive logging
    // The UI manager should handle this through its own interface
  }

  updatePhase(phase: string): void {
    this.uiManager.updatePhase(phase)
  }

  discoverCondition(conditionId: string): void {
    // CLEAN: Delegate to external systems for business logic
    // console.log('✅ Condition discovered:', conditionId) // DEBUG: Remove excessive logging
    // Business logic should be handled by GameManager, not UI
  }

  showConsultationButton(): void {
    this.uiManager.showConsultationButton()
  }

  showDiagnosisSubmission(): void {
    this.uiManager.showDiagnosisSubmission()
  }

  updateButtonCount(buttonId: string, count: number | string): void {
    this.uiManager.updateButtonCount(buttonId, count)
  }

  collapse(): void {
    this.uiManager.collapse()
  }

  expand(): void {
    this.uiManager.expand()
  }

  // CLEAN: Error handling
  private showError(message: string): void {
    const errorDiv = document.createElement('div')
    errorDiv.innerHTML = `
      <div style="
        background: #ff4444ee; 
        color: white; 
        padding: 1rem; 
        border-radius: 8px; 
        position: fixed; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%); 
        z-index: 10000; 
        text-align: center; 
        font-size: 14px; 
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      ">
        ⚠️ ${message}
      </div>
    `

    document.body.appendChild(errorDiv)
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv)
      }
    }, 3000)
  }

  // CLEAN: Lifecycle management
  destroy(): void {
    this.uiManager.destroy()
    this.isInitialized = false
  }

  // ENHANCEMENT FIRST: Compatibility methods for existing code
  getElement(): HTMLElement | null {
    return this.uiManager.getElement()
  }

  // MODULAR: Allow access to underlying manager for advanced use cases
  getUIManager(): DiagnosticUIManager {
    return this.uiManager
  }
}