/**
 * Diagnostic UI Manager
 * MODULAR: Orchestrates all UI sections
 * DRY: Single source of truth for UI state
 * CLEAN: Clear separation between UI and business logic
 * ENHANCED: Improved patient data presentation and dedicated AI panel
 */

import { SoundType } from '../../../components/AudioManager'
import { PatientInfoSection, type PatientInfo } from '../ui/PatientInfoSection'
import { AIPanel, type AIInsight } from '../ui/AIPanel'
import { colors, spacing, typography, borders, effects, zIndex } from '../../../styles/design-tokens'

export interface DiagnosticUIConfig {
  onSolveClick?: () => void
  onHintClick?: () => void
  onConsultationClick?: () => void
  onDiagnosisSubmit?: (selectedConditions: string[]) => void
  onError?: (message: string) => void
}

export class DiagnosticUIManager {
  private config: DiagnosticUIConfig
  private isInitialized: boolean = false
  private uiElement: HTMLElement | null = null
  private patientInfoSection: PatientInfoSection | null = null
  private aiPanel: AIPanel | null = null
  private audioEnabled: boolean = false // Track audio state
  
  // Public getter to access the AI panel for voice integration
  public getAIPanel(): AIPanel | null {
    return this.aiPanel
  }

  constructor(config: DiagnosticUIConfig = {}) {
    this.config = config
  }

  initialize(): void {
    if (this.isInitialized) return
    
    this.createUI()
    this.createAIPanel()
    this.isInitialized = true
    console.log('🏥 DiagnosticUIManager initialized')
  }

  private createUI(): void {
    // Create the main diagnostic panel with improved layout using design tokens
    this.uiElement = document.createElement('div')
    this.uiElement.id = 'diagnostic-panel'
    this.uiElement.style.cssText = `
      position: fixed;
      top: ${spacing.lg};
      left: ${spacing.lg};
      width: 320px;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.info};
      border-radius: ${borders.radius.xl};
      padding: ${spacing.md};
      color: ${colors.neutral.light};
      font-family: ${typography.fontFamily.primary};
      z-index: ${zIndex.panel};
      box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
      backdrop-filter: ${effects.blur.lg};
      ${effects.inset.medium}
    `
    
    this.uiElement.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${spacing.md};
        padding-bottom: ${spacing.sm};
        border-bottom: ${borders.width.thin} solid ${colors.border.info};
      ">
        <h3 style="margin: 0; color: ${colors.info.base}; font-size: ${typography.fontSize.lg}; font-weight: ${typography.fontWeight.bold};">🏥 Diagnosis Controls</h3>
        <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.base};">
          Status: <span id="current-phase">Loading...</span>
        </div>
      </div>
      
      <div id="patient-info-container" style="margin-bottom: ${spacing.md};">
        Loading patient information...
      </div>
      
      <div style="margin-bottom: ${spacing.md};">
        <button id="conditions-btn" style="
          background: linear-gradient(135deg, ${colors.info.base} 0%, ${colors.info.dark} 100%);
          color: ${colors.neutral.black};
          border: ${borders.width.base} solid ${colors.border.info};
          padding: ${spacing.sm} ${spacing.md};
          border-radius: ${borders.radius.full};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          margin-right: ${spacing.sm};
          margin-bottom: ${spacing.sm};
          display: inline-flex;
          align-items: center;
          gap: ${spacing.xs};
          font-weight: ${typography.fontWeight.medium};
          transition: all 0.3s ease;
          ${effects.inset.medium}
        "><span>🔍</span> Toggle Conditions</button>
        
        <button id="audio-btn" style="
          background: linear-gradient(135deg, ${colors.error.base} 0%, ${colors.error.dark} 100%);
          color: ${colors.neutral.black};
          border: ${borders.width.base} solid ${colors.border.error};
          padding: ${spacing.sm} ${spacing.md};
          border-radius: ${borders.radius.full};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          margin-bottom: ${spacing.sm};
          display: inline-flex;
          align-items: center;
          gap: ${spacing.xs};
          font-weight: ${typography.fontWeight.medium};
          transition: all 0.3s ease;
          ${effects.inset.medium}
        "><span>🎵</span> Audio: <span id="audio-status">Off</span></button>
      </div>
      
      <div style="
        font-size: ${typography.fontSize.xs};
        color: ${colors.neutral.base};
        text-align: center;
        padding-top: ${spacing.sm};
        border-top: ${borders.width.thin} solid ${colors.border.neutral};
      ">
        <div style="margin-bottom: ${spacing.xs};">Use [C] to toggle conditions • [V] for voice consultation</div>
        <div>AI insights in separate panel →</div>
        <div id="voice-status-indicator" style="
          margin-top: ${spacing.xs};
          color: ${colors.accent.base};
          font-weight: ${typography.fontWeight.bold};
          display: none;
        ">🎙️ Voice consultation active</div>
      </div>
    `
    
    document.body.appendChild(this.uiElement)
    this.setupEventListeners()
  }

  // Create dedicated AI panel
  private createAIPanel(): void {
    this.aiPanel = new AIPanel({
      title: 'AI Consultation Panel',
      position: 'bottom' // Move to bottom to avoid blocking X-ray panel
    })
    
    const aiPanelElement = this.aiPanel.create()
    document.body.appendChild(aiPanelElement)
  }

  // Show voice consultation active indicator
  public showVoiceActiveIndicator(): void {
    const indicator = document.getElementById('voice-status-indicator')
    if (indicator) {
      indicator.style.display = 'block'
    }
  }

  // Hide voice consultation active indicator
  public hideVoiceActiveIndicator(): void {
    const indicator = document.getElementById('voice-status-indicator')
    if (indicator) {
      indicator.style.display = 'none'
    }
  }

  public updateAIInsights(insights: AIInsight[]): void {
    if (this.aiPanel) {
      this.aiPanel.updateInsights(insights)
    }
  }

  public clearAIInsights(): void {
    if (this.aiPanel) {
      this.aiPanel.clearInsights()
    }
  }

  // Add a single insight to the AI panel
  public addAIInsight(insight: AIInsight): void {
    if (this.aiPanel) {
      this.aiPanel.addInsight(insight)
    }
  }

  private setupEventListeners(): void {
    const conditionsBtn = document.getElementById('conditions-btn')
    const audioBtn = document.getElementById('audio-btn')
    
    conditionsBtn?.addEventListener('click', () => {
      // Enable audio on first interaction
      this.enableAudio()
      // Trigger conditions toggle
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))
    })

    audioBtn?.addEventListener('click', () => {
      this.toggleAudio()
    })
  }

  // ENHANCEMENT FIRST: Enable audio using existing systems
  private enableAudio(): void {
    if (this.audioEnabled) return // Prevent multiple calls
    
    if (typeof window !== 'undefined' && (window as any).audioManager) {
      try {
        const audioManager = (window as any).audioManager
        audioManager.ensureAudioContext()
        // Start with background music (not hospital ambience)
        setTimeout(() => {
          audioManager.playSound(SoundType.BACKGROUND_MUSIC, true)
          this.audioEnabled = true
          this.updateAudioStatus(true)
          console.log('🎵 Background music started')
        }, 100)
      } catch (error) {
        console.log('Audio activation attempted:', error)
      }
    }
  }

  // ENHANCEMENT FIRST: Toggle audio on/off with proper state management
  private toggleAudio(): void {
    if (typeof window !== 'undefined' && (window as any).audioManager) {
      try {
        const audioManager = (window as any).audioManager
        
        if (this.audioEnabled) {
          // Turn off audio
          audioManager.stopSound?.(SoundType.BACKGROUND_MUSIC)
          audioManager.stopHospitalAmbience?.()
          this.audioEnabled = false
          this.updateAudioStatus(false)
          console.log('🎵 Audio stopped')
        } else {
          // Turn on audio
          audioManager.playSound(SoundType.BACKGROUND_MUSIC, true)
          this.audioEnabled = true
          this.updateAudioStatus(true)
          console.log('🎵 Background music started')
        }
      } catch (error) {
        console.log('Audio toggle attempted:', error)
      }
    }
  }

  private updateAudioStatus(isOn: boolean): void {
    const statusElement = document.getElementById('audio-status')
    if (statusElement) {
      statusElement.textContent = isOn ? 'On' : 'Off'
    }
  }

  // ENHANCEMENT FIRST: Switch to hospital ambience when game starts
  public startGameAudio(): void {
    if (this.audioEnabled && typeof window !== 'undefined' && (window as any).audioManager) {
      try {
        const audioManager = (window as any).audioManager
        // Stop background music and start hospital ambience
        audioManager.stopSound?.(SoundType.BACKGROUND_MUSIC)
        audioManager.startHospitalAmbience()
        console.log('🎵 Switched to hospital ambience for game')
      } catch (error) {
        console.log('Game audio switch attempted:', error)
      }
    }
  }

  updatePatientInfo(patientCase: any): void {
    const patientInfoContainer = document.getElementById('patient-info-container')
    if (!patientInfoContainer) return

    // Convert the patient case to the PatientInfo format
    const patientInfo: PatientInfo = {
      patientName: patientCase?.patientName || 'Anonymous Patient',
      age: patientCase?.age || 0,
      gender: patientCase?.gender || 'Unknown',
      chiefComplaint: patientCase?.chiefComplaint || 'No chief complaint available',
      conditionName: patientCase?.conditionName,
      conditionDescription: patientCase?.conditionDescription,
      conditionLocation: patientCase?.conditionLocation,
      historyOfPresentIllness: patientCase?.historyOfPresentIllness,
      vitalSigns: patientCase?.vitalSigns,
      pastMedicalHistory: patientCase?.pastMedicalHistory,
      medications: patientCase?.medications,
      diagnosis: patientCase?.diagnosis,
      estimatedStudyTime: patientCase?.estimatedStudyTime
    }

    // Create or update the patient info section
    if (!this.patientInfoSection) {
      this.patientInfoSection = new PatientInfoSection()
      const patientElement = this.patientInfoSection.create(patientInfo)
      patientInfoContainer.innerHTML = ''
      patientInfoContainer.appendChild(patientElement)
    } else {
      this.patientInfoSection.update(patientInfo)
    }
  }

  updatePhase(phase: string): void {
    const phaseElement = document.getElementById('current-phase')
    if (phaseElement) {
      phaseElement.textContent = phase
    }
  }

  // ENHANCEMENT FIRST: Add missing methods for facade compatibility
  updateScanProgress(data: any): void {
    // Progress updates handled by visual feedback system
  }

  showConsultationButton(): void {
    // The consultation button has been removed from the main panel to reduce clutter
    // Consultation is now handled through the dedicated AI panel
  }

  showDiagnosisSubmission(): void {
    // Diagnosis submission UI can be added here if needed
  }

  updateButtonCount(buttonId: string, count: number | string): void {
    // Button count updates can be added here if needed
  }

  collapse(): void {
    if (this.uiElement) this.uiElement.style.transform = 'translateX(-100%)'
  }

  expand(): void {
    if (this.uiElement) this.uiElement.style.transform = 'translateX(0)'
  }

  getElement(): HTMLElement | null {
    return this.uiElement
  }

  destroy(): void {
    if (this.uiElement && this.uiElement.parentNode) {
      this.uiElement.parentNode.removeChild(this.uiElement)
    }
    if (this.patientInfoSection) {
      this.patientInfoSection.destroy()
      this.patientInfoSection = null
    }
    if (this.aiPanel) {
      this.aiPanel.destroy()
      this.aiPanel = null
    }
    this.uiElement = null
    this.isInitialized = false
  }
}