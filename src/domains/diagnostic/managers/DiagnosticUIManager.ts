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
  public showTransitionOverlay(message: string): Promise<void> {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2em;
            z-index: ${zIndex.overlay};
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        `;
        overlay.textContent = message;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve();
            }, 500);
        }, 2000);
    });
  }

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
        <div style="display: flex; align-items: center; gap: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.base};">
            Status: <span id="current-phase">Loading...</span>
          </div>
          <button id="toggle-diagnostic-panel" style="
            background: ${colors.background.primaryGlow};
            color: ${colors.primary.base};
            border: ${borders.width.thin} solid ${colors.border.primary};
            width: 24px;
            height: 24px;
            border-radius: ${borders.radius.full};
            cursor: pointer;
            font-size: ${typography.fontSize.sm};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          ">−</button>
        </div>
      </div>
      
      <div id="diagnostic-content" style="margin-bottom: ${spacing.md};">
        <!-- CASE INFORMATION -->
        <div id="case-info-container" style="margin-bottom: ${spacing.md};"></div>

        <!-- INVESTIGATION TOOLS -->
        <div id="investigation-tools-panel" style="
          background: ${colors.background.gradient.panel};
          border: ${borders.width.thin} solid ${colors.border.accent};
          border-radius: ${borders.radius.lg};
          padding: ${spacing.md};
          margin-bottom: ${spacing.md};
        ">
          <div style="
            color: ${colors.accent.base};
            font-size: ${typography.fontSize.sm};
            font-weight: ${typography.fontWeight.bold};
            margin-bottom: ${spacing.sm};
            text-transform: uppercase;
            letter-spacing: ${typography.letterSpacing.wider};
          ">🔍 INVESTIGATION TOOLS</div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${spacing.sm}; margin-bottom: ${spacing.sm};">
            <button id="patient-interview-btn" style="
              background: linear-gradient(135deg, ${colors.info.base} 0%, ${colors.info.dark} 100%);
              color: ${colors.neutral.black};
              border: ${borders.width.base} solid ${colors.border.info};
              padding: ${spacing.sm};
              border-radius: ${borders.radius.md};
              cursor: pointer;
              font-size: ${typography.fontSize.xs};
              display: flex;
              align-items: center;
              gap: ${spacing.xs};
              font-weight: ${typography.fontWeight.medium};
              transition: all 0.3s ease;
              ${effects.inset.medium}
            "><span>💬</span> Patient Interview</button>
            
            <button id="lab-orders-btn" style="
              background: linear-gradient(135deg, ${colors.error.base} 0%, ${colors.error.dark} 100%);
              color: ${colors.neutral.black};
              border: ${borders.width.base} solid ${colors.border.error};
              padding: ${spacing.sm};
              border-radius: ${borders.radius.md};
              cursor: pointer;
              font-size: ${typography.fontSize.xs};
              display: flex;
              align-items: center;
              gap: ${spacing.xs};
              font-weight: ${typography.fontWeight.medium};
              transition: all 0.3s ease;
              ${effects.inset.medium}
            "><span>🔬</span> Lab Orders</button>
            
            <button id="imaging-btn" style="
              background: linear-gradient(135deg, ${colors.primary.base} 0%, ${colors.primary.dark} 100%);
              color: ${colors.neutral.black};
              border: ${borders.width.base} solid ${colors.border.primary};
              padding: ${spacing.sm};
              border-radius: ${borders.radius.md};
              cursor: pointer;
              font-size: ${typography.fontSize.xs};
              display: flex;
              align-items: center;
              gap: ${spacing.xs};
              font-weight: ${typography.fontWeight.medium};
              transition: all 0.3s ease;
              ${effects.inset.medium}
            "><span>📷</span> Imaging</button>
            
            <button id="consult-nurse-btn" style="
              background: linear-gradient(135deg, ${colors.accent.base} 0%, ${colors.accent.dark} 100%);
              color: ${colors.neutral.black};
              border: ${borders.width.base} solid ${colors.border.accent};
              padding: ${spacing.sm};
              border-radius: ${borders.radius.md};
              cursor: pointer;
              font-size: ${typography.fontSize.xs};
              display: flex;
              align-items: center;
              gap: ${spacing.xs};
              font-weight: ${typography.fontWeight.medium};
              transition: all 0.3s ease;
              ${effects.inset.medium}
            "><span>👩‍⚕️</span> Consult Nurse</button>
          </div>
        </div>
        
        <!-- PATIENT INFORMATION -->
        <div id="patient-info-container" style="margin-bottom: ${spacing.md};">
          Loading patient information...
        </div>
        
        <!-- SCANNING CONTROLS -->
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
        
        <!-- CASE PROGRESS -->
        <div style="
          background: ${colors.background.panelLight};
          border: ${borders.width.thin} solid ${colors.border.neutral};
          border-radius: ${borders.radius.lg};
          padding: ${spacing.md};
          margin-bottom: ${spacing.md};
        ">
          <div style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
            font-weight: ${typography.fontWeight.bold};
            margin-bottom: ${spacing.sm};
            text-transform: uppercase;
            letter-spacing: ${typography.letterSpacing.wider};
          ">📊 CASE PROGRESS</div>
          <div style="display: flex; align-items: center; gap: ${spacing.sm};">
            <div style="flex: 1; height: 8px; background: ${colors.background.primaryGlow}; border-radius: ${borders.radius.full};">
              <div style="width: 25%; height: 100%; background: ${colors.primary.base}; border-radius: ${borders.radius.full};"></div>
            </div>
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.light};">25%</div>
          </div>
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base}; margin-top: ${spacing.xs};">
            3 investigations completed • 2 findings discovered
          </div>
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
    const toggleBtn = document.getElementById('toggle-diagnostic-panel')
    const diagnosticContent = document.getElementById('diagnostic-content')
    const patientInterviewBtn = document.getElementById('patient-interview-btn')
    const labOrdersBtn = document.getElementById('lab-orders-btn')
    const imagingBtn = document.getElementById('imaging-btn')
    const consultNurseBtn = document.getElementById('consult-nurse-btn')
    
    conditionsBtn?.addEventListener('click', () => {
      // Enable audio on first interaction
      this.enableAudio()
      // Trigger conditions toggle
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))
    })

    audioBtn?.addEventListener('click', () => {
      this.toggleAudio()
    })
    
    // Add collapsible functionality
    let isPanelCollapsed = false
    toggleBtn?.addEventListener('click', () => {
      if (!diagnosticContent) return
      
      isPanelCollapsed = !isPanelCollapsed
      diagnosticContent.style.display = isPanelCollapsed ? 'none' : 'block'
      if (toggleBtn) {
        toggleBtn.textContent = isPanelCollapsed ? '+' : '−'
      }
    })
    
    // Add investigation tool functionality
    patientInterviewBtn?.addEventListener('click', () => {
      this.showPatientInterview()
    })
    
    labOrdersBtn?.addEventListener('click', () => {
      this.showLabOrders()
    })
    
    imagingBtn?.addEventListener('click', () => {
      this.showImagingOptions()
    })
    
    consultNurseBtn?.addEventListener('click', () => {
      this.consultNurse()
    })
  }
  
  // NEW: Patient interview functionality
  private showPatientInterview(): void {
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: `interview_${Date.now()}`,
        timestamp: Date.now(),
        content: "👩‍⚕️ Nurse Amy: Let's conduct a focused patient interview. Click on the symptoms below to ask about them:",
        type: 'voice',
        confidence: 0.9
      })
      
      // Add symptom questions
      const symptoms = [
        "📍 Where exactly do you feel the pain?",
        "⏱️ When did the headaches start?",
        "🔄 Do the headaches come and go or are they constant?",
        "🔥 Does anything make the pain better or worse?",
        "😴 Are the headaches affecting your sleep?",
        "🥱 Any associated jaw clicking or popping?"
      ]
      
      symptoms.forEach((symptom, index) => {
        setTimeout(() => {
          if (this.aiPanel) {
            this.aiPanel.addInsight({
              id: `symptom_${Date.now()}_${index}`,
              timestamp: Date.now(),
              content: `❓ ${symptom}`,
              type: 'educational',
              confidence: 0.8
            })
          }
        }, index * 500)
      })
    }
  }
  
  // NEW: Lab orders functionality
  private showLabOrders(): void {
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: `lab_orders_${Date.now()}`,
        timestamp: Date.now(),
        content: "🔬 Nurse Amy: Recommended laboratory investigations for this case:",
        type: 'diagnostic',
        confidence: 0.9
      })
      
      // Add lab order options
      const labTests = [
        { name: "Complete Blood Count (CBC)", rationale: "Rule out infection/inflammation", ordered: false },
        { name: "Comprehensive Metabolic Panel (CMP)", rationale: "Assess organ function", ordered: false },
        { name: "ESR/CRP", rationale: "Inflammatory markers", ordered: true },
        { name: "Thyroid Function Tests", rationale: "Rule out endocrine causes", ordered: false }
      ]
      
      labTests.forEach((test, index) => {
        setTimeout(() => {
          if (this.aiPanel) {
            this.aiPanel.addInsight({
              id: `lab_test_${Date.now()}_${index}`,
              timestamp: Date.now(),
              content: `${test.ordered ? '✅' : '📋'} ${test.name} - ${test.rationale}`,
              type: test.ordered ? 'urgent' : 'procedural',
              confidence: 0.8
            })
          }
        }, index * 300)
      })
    }
  }
  
  // NEW: Imaging options functionality
  private showImagingOptions(): void {
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: `imaging_${Date.now()}`,
        timestamp: Date.now(),
        content: "📷 Nurse Amy: Recommended imaging studies for this case:",
        type: 'diagnostic',
        confidence: 0.9
      })
      
      // Add imaging options
      const imagingStudies = [
        { name: "Panoramic X-ray", status: "ordered", finding: "TMJ degenerative changes" },
        { name: "CT Head", status: "available", finding: "Sinus opacification noted" },
        { name: "MRI Brain", status: "pending", finding: "Awaiting neurology consult" }
      ]
      
      imagingStudies.forEach((study, index) => {
        setTimeout(() => {
          if (this.aiPanel) {
            const statusEmoji = study.status === 'ordered' ? '✅' : study.status === 'available' ? '🔍' : '⏳'
            const findingText = study.finding ? `- ${study.finding}` : ''
            this.aiPanel.addInsight({
              id: `imaging_study_${Date.now()}_${index}`,
              timestamp: Date.now(),
              content: `${statusEmoji} ${study.name} ${findingText}`,
              type: study.status === 'ordered' ? 'urgent' : study.status === 'available' ? 'diagnostic' : 'procedural',
              confidence: 0.85
            })
          }
        }, index * 400)
      })
    }
  }
  
  // NEW: Nurse consultation functionality
  private consultNurse(): void {
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: `nurse_consult_${Date.now()}`,
        timestamp: Date.now(),
        content: "👩‍⚕️ Nurse Amy: Based on the case presentation, I recommend focusing on the temporomandibular joint region. The combination of headache and jaw pain suggests TMJ dysfunction, but we should also consider sinus pathology given the facial pain distribution.",
        type: 'voice',
        confidence: 0.9
      })
      
      setTimeout(() => {
        if (this.aiPanel) {
          this.aiPanel.addInsight({
            id: `nurse_advice_${Date.now()}`,
            timestamp: Date.now(),
            content: "📋 Clinical Pearl: Tenderness on palpation of the TMJ and deviation of jaw opening are key physical findings. Consider ordering panoramic X-ray to evaluate joint morphology.",
            type: 'educational',
            confidence: 0.85
          })
        }
      }, 1000)
    }
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

  public updateCaseInfo(patientCase: MedicalCase | null): void {
    const caseInfoContainer = document.getElementById('case-info-container');
    if (!caseInfoContainer) return;

    if (patientCase) {
        caseInfoContainer.innerHTML = `
            <div style="
              background: ${colors.background.panelLight};
              border: ${borders.width.thin} solid ${colors.border.primary};
              border-radius: ${borders.radius.lg};
              padding: ${spacing.md};
              margin-bottom: ${spacing.md};
            ">
              <div id="case-title" style="
                color: ${colors.primary.base};
                font-size: ${typography.fontSize.sm};
                font-weight: ${typography.fontWeight.bold};
                margin-bottom: ${spacing.sm};
                text-transform: uppercase;
                letter-spacing: ${typography.letterSpacing.wider};
              ">📋 CASE #${patientCase.id}: ${patientCase.title}</div>
              <div id="case-complaint" style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.light};">
                <strong>Presenting Complaint:</strong> ${patientCase.presentingComplaint}
              </div>
              <div id="case-mission" style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base}; margin-top: ${spacing.xs};">
                Your Mission: ${patientCase.mission}
              </div>
            </div>
        `;
    } else {
        caseInfoContainer.innerHTML = 'Loading case...';
    }
  }

  updatePatientInfo(patientCase: MedicalCase | null): void {
    const patientInfoContainer = document.getElementById('patient-info-container')
    if (!patientInfoContainer) return

    if (!patientCase) {
        patientInfoContainer.innerHTML = 'Loading patient information...';
        return;
    }

    // Create or update the patient info section
    if (!this.patientInfoSection) {
      this.patientInfoSection = new PatientInfoSection()
      const patientElement = this.patientInfoSection.create(patientCase.patientInfo)
      patientInfoContainer.innerHTML = ''
      patientInfoContainer.appendChild(patientElement)
    } else {
      this.patientInfoSection.update(patientCase.patientInfo)
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

  // Show achievement notification
  public showAchievementNotification(achievement: any): void {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors.background.gradient.panel};
      color: ${colors.neutral.white};
      padding: ${spacing.md};
      border-radius: ${borders.radius.lg};
      border: ${borders.width.base} solid ${colors.accent.base};
      box-shadow: ${effects.shadow.lg}, ${effects.shadow.accentGlow};
      z-index: ${zIndex.notification};
      display: flex;
      align-items: center;
      gap: ${spacing.md};
      transform: translateX(120%);
      transition: transform 0.5s ease-in-out;
      min-width: 300px;
    `;

    notification.innerHTML = `
      <div style="font-size: 2em;">${achievement.icon}</div>
      <div>
        <div style="font-weight: ${typography.fontWeight.bold};">${achievement.name}</div>
        <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.light};">${achievement.description}</div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(120%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 5000);
  }

  getUIElement(): HTMLElement | null {
    return this.uiElement;
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