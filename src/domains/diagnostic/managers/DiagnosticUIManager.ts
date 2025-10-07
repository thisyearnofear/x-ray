/**
 * Diagnostic UI Manager
 * MODULAR: Orchestrates all UI sections
 * DRY: Single source of truth for UI state
 * CLEAN: Clear separation between UI and business logic
 */

import { SoundType } from '../../../components/AudioManager'

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
  private audioEnabled: boolean = false // Track audio state

  constructor(config: DiagnosticUIConfig = {}) {
    this.config = config
  }

  initialize(): void {
    if (this.isInitialized) return
    
    this.createUI()
    this.isInitialized = true
    console.log('DiagnosticUIManager initialized')
  }

  // ENHANCEMENT FIRST: Create minimal diagnostic panel
  private createUI(): void {
    this.uiElement = document.createElement('div')
    this.uiElement.id = 'diagnostic-panel'
    this.uiElement.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 20px;
        width: 300px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #00d4ff;
        border-radius: 15px;
        padding: 1.5rem;
        color: white;
        font-family: 'Segoe UI', sans-serif;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
        backdrop-filter: blur(10px);
      ">
        <h3 style="margin: 0 0 1rem 0; color: #00d4ff; font-size: 1.2rem;">🏥 Medical Diagnostic Panel</h3>
        
        <div style="margin-bottom: 1rem;">
          <div style="font-size: 0.9rem; opacity: 0.8;">Patient: <span id="patient-name">Loading...</span></div>
          <div style="font-size: 0.9rem; opacity: 0.8;">Phase: <span id="current-phase">Scanning</span></div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <button id="conditions-btn" style="
            background: linear-gradient(45deg, #00d4ff, #0099cc);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          ">🔍 Toggle Conditions [C]</button>
          
          <button id="consultation-btn" style="
            background: linear-gradient(45deg, #6c5ce7, #5a4fcf);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          ">👩‍⚕️ Consult Nurse</button>
          
          <button id="audio-btn" style="
            background: linear-gradient(45deg, #ff6b6b, #ee5a52);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          ">🎵 Audio: <span id="audio-status">Off</span></button>
        </div>
        
        <div style="font-size: 0.8rem; opacity: 0.6;">
          Press [C] for conditions, [E] to expand, [H] for hints
        </div>
      </div>
    `
    
    document.body.appendChild(this.uiElement)
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    const conditionsBtn = document.getElementById('conditions-btn')
    const consultationBtn = document.getElementById('consultation-btn')
    const audioBtn = document.getElementById('audio-btn')
    
    conditionsBtn?.addEventListener('click', () => {
      // Enable audio on first interaction
      this.enableAudio()
      // Trigger conditions toggle
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))
    })
    
    consultationBtn?.addEventListener('click', () => {
      // Enable audio on first interaction  
      this.enableAudio()
      this.config.onConsultationClick?.()
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
    const nameElement = document.getElementById('patient-name')
    if (nameElement) {
      nameElement.textContent = patientCase?.patientName || 'Anonymous Patient'
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
    const btn = document.getElementById('consultation-btn')
    if (btn) btn.style.display = 'inline-block'
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
    this.uiElement = null
    this.isInitialized = false
  }
}