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
import { MedicalCase, PatientCase } from '../../medical/types'
import { colors, spacing, typography, borders, effects, zIndex } from '../../../styles/design-tokens'
import { TierStatusIndicator } from '../../medical/ui/TierStatusIndicator'
import { UpgradePrompt } from '../../medical/ui/UpgradePrompt'
import { CaseAccessManager } from '../../medical/CaseAccessManager'
import { SmartAccountOnboarding } from '../../web3/SmartAccountOnboarding'
import { GaslessConsultationFlow } from '../../web3/GaslessConsultationFlow'
import { DelegationPermissionsUI } from '../../web3/DelegationPermissionsUI'

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
  private currentPatientCase: MedicalCase | PatientCase | null = null // Store current patient case
  private accessManager: CaseAccessManager
  private tierIndicator: any = null // TierStatusIndicator instance
  private upgradePrompt: any = null // UpgradePrompt instance
  private onboardingActive: boolean = false
  private isSmartAccountConnected: boolean = false

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
    this.accessManager = CaseAccessManager.getInstance()
  }

  initialize(): void {
    if (this.isInitialized) return

    this.createUI()
    this.createAIPanel()
    this.createTierStatusIndicator()
    this.setupAccessManagerListeners()
    this.addTimerStyles()
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
          <div id="timer-display" style="
            font-size: ${typography.fontSize.lg};
            color: ${colors.primary.base};
            font-weight: ${typography.fontWeight.bold};
            padding: ${spacing.xs} ${spacing.sm};
            background: ${colors.background.primaryGlow};
            border: ${borders.width.thin} solid ${colors.border.primary};
            border-radius: ${borders.radius.md};
            min-width: 80px;
            text-align: center;
          ">5:00</div>
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
            "><span>🤖</span> Free AI Consult</button>
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

  // ENHANCEMENT FIRST: Create tier status indicator
  private createTierStatusIndicator(): void {
    const tierContainer = document.createElement('div')
    tierContainer.id = 'tier-status-container'
    tierContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: ${zIndex.panel - 10}; // Lower z-index to avoid blocking main UI
    `

    // Create React component container
    const tierElement = document.createElement('div')
    tierElement.id = 'tier-status-indicator'
    tierContainer.appendChild(tierElement)

    document.body.appendChild(tierContainer)

    // CLEAN: Render tier status indicator
    this.renderTierStatusIndicator()
  }

  // MODULAR: Render tier status indicator using React-like pattern
  private renderTierStatusIndicator(): void {
    const container = document.getElementById('tier-status-indicator')
    if (!container) return

    const accessSummary = this.accessManager.getAccessSummary()
    const userStatus = this.accessManager.getUserStatus()

    const getTierColor = () => accessSummary.tier === 'premium' ? '#00d4ff' : '#ffa500'
    const getTierIcon = () => accessSummary.tier === 'premium' ? '👑' : '⭐'
    const getCasesDisplay = () => {
      if (accessSummary.casesRemaining === 'unlimited') return 'Unlimited'
      return `${accessSummary.casesRemaining} left today`
    }

    container.innerHTML = `
      <div style="
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid ${getTierColor()};
        border-radius: 15px;
        padding: 1rem;
        color: white;
        font-family: 'Segoe UI', sans-serif;
        min-width: 200px;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      ">
        <!-- Header -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
          ">
            <span style="font-size: 1.2rem;">${getTierIcon()}</span>
            <span style="
              font-weight: bold;
              text-transform: capitalize;
              color: ${getTierColor()};
            ">${accessSummary.tier} Tier</span>
          </div>
          
          ${userStatus.isAuthenticated ? `
            <div style="
              font-size: 0.7rem;
              background: rgba(0, 255, 0, 0.2);
              color: #00ff00;
              padding: 0.25rem 0.5rem;
              border-radius: 10px;
              border: 1px solid rgba(0, 255, 0, 0.3);
            ">✅ Connected</div>
          ` : ''}
        </div>

        <!-- Cases Remaining -->
        <div style="margin-bottom: 0.75rem;">
          <div style="
            font-size: 0.8rem;
            opacity: 0.8;
            margin-bottom: 0.25rem;
          ">Cases Available:</div>
          <div style="
            font-size: 1rem;
            font-weight: bold;
            color: ${accessSummary.casesRemaining === 0 ? '#ff6b6b' : getTierColor()};
          ">${getCasesDisplay()}</div>
        </div>

        <!-- Smart Account Benefits (for non-connected users) -->
        ${!userStatus.isAuthenticated ? `
          <div style="
            margin: 0.75rem 0;
            padding: 0.5rem;
            background: rgba(0, 212, 255, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(0, 212, 255, 0.2);
            font-size: 0.7rem;
          ">
            <div style="font-weight: bold; margin-bottom: 0.25rem; color: #00d4ff;">💡 Why connect?</div>
            <div style="opacity: 0.8;">Earn NFT achievements • Track progress • Gasless AI</div>
          </div>
        ` : ''}

        <!-- Upgrade Button -->
        ${accessSummary.canUpgrade ? `
          <button id="tier-upgrade-btn" style="
            width: 100%;
            background: linear-gradient(45deg, #00d4ff, #0099cc);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
          ">🚀 Upgrade to Premium</button>
        ` : ''}

        <!-- Status Messages -->
        ${accessSummary.casesRemaining === 0 && accessSummary.tier === 'free' ? `
          <div style="
            margin-top: 0.5rem;
            font-size: 0.75rem;
            color: #ff6b6b;
            text-align: center;
            opacity: 0.9;
          ">Daily limit reached. Upgrade for unlimited access!</div>
        ` : ''}
      </div>
    `

    // CLEAN: Add event listeners
    const upgradeBtn = document.getElementById('tier-upgrade-btn')
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => this.showUpgradePrompt('feature_locked'))
    }
  }

  // MODULAR: Setup access manager event listeners
  private setupAccessManagerListeners(): void {
    this.accessManager.on('accessStatusChanged', () => {
      this.renderTierStatusIndicator()
    })

    this.accessManager.on('caseUsageRecorded', () => {
      this.renderTierStatusIndicator()
    })

    this.accessManager.on('accessDenied', (data: any) => {
      if (data.reason === 'daily_limit_reached') {
        this.showUpgradePrompt('daily_limit')
      } else if (data.reason === 'premium_required') {
        this.showUpgradePrompt('ai_access')
      }
    })
  }

  // ENHANCEMENT FIRST: Show upgrade prompt
  public showUpgradePrompt(trigger: 'daily_limit' | 'ai_access' | 'feature_locked'): void {
    if (this.upgradePrompt) return // Prevent multiple prompts

    const promptContainer = document.createElement('div')
    promptContainer.id = 'upgrade-prompt-container'
    promptContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: ${zIndex.modal};
      backdrop-filter: blur(10px);
    `

    const getTriggerMessage = () => {
      switch (trigger) {
        case 'daily_limit': return `You've used all 5 free cases today`
        case 'ai_access': return 'AI-generated cases require premium access'
        case 'feature_locked': return 'This feature is available in premium'
        default: return 'Upgrade to unlock premium features'
      }
    }

    const getTriggerIcon = () => {
      switch (trigger) {
        case 'daily_limit': return '📊'
        case 'ai_access': return '🤖'
        case 'feature_locked': return '🔒'
        default: return '⭐'
      }
    }

    const upgradeInfo = this.accessManager.getUpgradeInfo()

    promptContainer.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #00d4ff;
        border-radius: 20px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        color: white;
        font-family: 'Segoe UI', sans-serif;
        box-shadow: 0 20px 40px rgba(0, 212, 255, 0.3);
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">${getTriggerIcon()}</div>
          <h2 style="margin: 0; color: #00d4ff; font-size: 1.5rem; margin-bottom: 0.5rem;">
            Upgrade to Premium
          </h2>
          <p style="margin: 0; opacity: 0.8; font-size: 0.9rem;">
            ${getTriggerMessage()}
          </p>
        </div>

        <!-- Benefits -->
        <div style="
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        ">
          <h4 style="margin: 0 0 0.5rem 0; color: #00d4ff;">Premium Benefits:</h4>
          ${upgradeInfo.benefits.map(benefit => `
            <div style="font-size: 0.85rem; margin-bottom: 0.25rem; opacity: 0.9;">
              ${benefit}
            </div>
          `).join('')}
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="upgrade-dismiss-btn" style="
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          ">Maybe Later</button>
          
          <button id="upgrade-connect-btn" style="
            background: linear-gradient(45deg, #00d4ff, #0099cc);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
          ">🔗 Connect Wallet & Upgrade</button>
        </div>
      </div>
    `

    document.body.appendChild(promptContainer)

    // CLEAN: Add event listeners
    const dismissBtn = document.getElementById('upgrade-dismiss-btn')
    const connectBtn = document.getElementById('upgrade-connect-btn')

    dismissBtn?.addEventListener('click', () => {
      document.body.removeChild(promptContainer)
      this.upgradePrompt = null
    })

    connectBtn?.addEventListener('click', () => {
      // Trigger wallet connection
      this.config.onConsultationClick?.() // Reuse existing wallet connection flow
      document.body.removeChild(promptContainer)
      this.upgradePrompt = null
    })

    this.upgradePrompt = promptContainer
  }

  // ENHANCEMENT FIRST: Smart Account onboarding for new users
  public showSmartAccountOnboarding(): void {
    if (this.onboardingActive) return

    this.onboardingActive = true
    const onboardingContainer = document.createElement('div')
    onboardingContainer.id = 'smart-account-onboarding'
    
    // Create React-like onboarding component
    this.renderSmartAccountOnboarding(onboardingContainer)
    document.body.appendChild(onboardingContainer)
  }

  private renderSmartAccountOnboarding(container: HTMLElement): void {
    // CLEAN: Simple onboarding without technical jargon
    container.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: ${zIndex.modal};
        backdrop-filter: blur(10px);
      ">
        <div style="
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid #00d4ff;
          border-radius: 20px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          color: white;
          font-family: 'Segoe UI', sans-serif;
          box-shadow: 0 20px 40px rgba(0, 212, 255, 0.3);
          text-align: center;
        ">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🏥</div>
          <h2 style="margin: 0 0 1rem 0; color: #00d4ff; font-size: 1.5rem;">
            Welcome to Smart Medical Accounts
          </h2>
          <p style="margin: 0 0 1.5rem 0; font-size: 1rem; line-height: 1.5; opacity: 0.9;">
            Get free AI medical consultations without any transaction fees. 
            Our smart account technology handles all the complexity for you.
          </p>
          
          <div style="
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 10px;
            padding: 1rem;
            margin-bottom: 1.5rem;
          ">
            <div style="font-size: 0.9rem; font-weight: bold; color: #00d4ff; margin-bottom: 0.5rem;">
              ✨ What you get:
            </div>
            <div style="font-size: 0.8rem; text-align: left;">
              • Free AI medical consultations (no fees)<br>
              • Instant responses from medical AI<br>
              • Secure permission management<br>
              • Verified medical achievement certificates
            </div>
          </div>

          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="onboarding-skip" style="
              background: rgba(255, 255, 255, 0.1);
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.3);
              padding: 0.75rem 1.5rem;
              border-radius: 10px;
              cursor: pointer;
              font-size: 0.9rem;
              transition: all 0.3s ease;
            ">Skip Setup</button>
            
            <button id="onboarding-start" style="
              background: linear-gradient(45deg, #00d4ff, #0099cc);
              color: white;
              border: none;
              padding: 0.75rem 2rem;
              border-radius: 10px;
              cursor: pointer;
              font-size: 0.9rem;
              font-weight: bold;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
            ">🚀 Set Up Smart Account</button>
          </div>

          <div style="margin-top: 1rem; font-size: 0.75rem; opacity: 0.6;">
            Secure • Free • No technical knowledge required
          </div>
        </div>
      </div>
    `

    // Add event listeners
    const skipBtn = container.querySelector('#onboarding-skip') as HTMLElement
    const startBtn = container.querySelector('#onboarding-start') as HTMLElement

    skipBtn?.addEventListener('click', () => {
      this.completeOnboarding(container, false)
    })

    startBtn?.addEventListener('click', () => {
      this.completeOnboarding(container, true)
    })
  }

  private completeOnboarding(container: HTMLElement, shouldConnect: boolean): void {
    if (shouldConnect) {
      // Trigger wallet connection
      this.config.onConsultationClick?.()
    }
    
    document.body.removeChild(container)
    this.onboardingActive = false
  }

  // ENHANCEMENT FIRST: Gasless consultation flow
  private startGaslessConsultation(): void {
    if (!this.isSmartAccountConnected) {
      this.showSmartAccountOnboarding()
      return
    }

    // Show gasless consultation UI
    this.showGaslessConsultationFlow()
  }

  private showGaslessConsultationFlow(): void {
    const consultationContainer = document.createElement('div')
    consultationContainer.id = 'gasless-consultation-flow'
    consultationContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: ${zIndex.panel};
      max-width: 400px;
    `

    consultationContainer.innerHTML = `
      <div style="
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 15px;
        padding: 1.5rem;
        color: white;
        font-family: 'Segoe UI', sans-serif;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        ">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">🤖</span>
            <span style="font-weight: bold; color: #00d4ff;">AI Medical Consultation</span>
          </div>
          <div style="
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
            padding: 0.25rem 0.5rem;
            border-radius: 10px;
            fontSize: 0.7rem;
            border: 1px solid rgba(0, 255, 0, 0.3);
          ">✨ FREE</div>
        </div>

        <p style="margin: 0 0 1rem 0; font-size: 0.9rem; opacity: 0.9;">
          Get instant medical advice from our AI assistant. No fees, no waiting.
        </p>
        
        <button id="start-consultation" style="
          width: 100%;
          background: linear-gradient(45deg, #00d4ff, #0099cc);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
          margin-bottom: 1rem;
        ">🎙️ Start Free Consultation</button>

        <div style="
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          font-size: 0.75rem;
        ">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span>💰 Transaction Fee:</span>
            <span style="color: #00ff00; font-weight: bold;">$0.00</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>⚡ Response Time:</span>
            <span style="color: #00d4ff; font-weight: bold;">Instant</span>
          </div>
        </div>

        <button id="close-consultation" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          opacity: 0.6;
        ">×</button>
      </div>
    `

    document.body.appendChild(consultationContainer)

    // Add event listeners
    const startBtn = consultationContainer.querySelector('#start-consultation') as HTMLElement
    const closeBtn = consultationContainer.querySelector('#close-consultation') as HTMLElement

    startBtn?.addEventListener('click', () => {
      this.executeGaslessConsultation()
    })

    closeBtn?.addEventListener('click', () => {
      document.body.removeChild(consultationContainer)
    })
  }

  private executeGaslessConsultation(): void {
    // ENHANCEMENT FIRST: Use existing voice consultation system
    this.config.onConsultationClick?.()
    
    // Add gasless transaction feedback
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: `gasless_consult_${Date.now()}`,
        timestamp: Date.now(),
        content: '🤖 Free AI Consultation: No transaction fees charged! Your smart account handled everything automatically.',
        type: 'voice',
        confidence: 1.0
      })
    }
  }

  // ENHANCEMENT FIRST: Update smart account connection status
  public updateSmartAccountStatus(isConnected: boolean, address?: string): void {
    this.isSmartAccountConnected = isConnected
    
    if (isConnected) {
      // Update UI to show smart account benefits
      this.renderTierStatusIndicator()
      
      // Show first-time delegation setup if needed
      const hasSetupDelegation = localStorage.getItem('delegation_setup_complete')
      if (!hasSetupDelegation) {
        setTimeout(() => this.showDelegationSetup(), 2000)
      }
    }
  }

  private showDelegationSetup(): void {
    // Dispatch event to show delegation panel
    const event = new CustomEvent('showDelegationPanel', {
      detail: {
        message: '🔐 Smart Account Setup: Would you like to grant AI assistants permission to provide free medical consultations? You can change this anytime.'
      }
    });
    document.dispatchEvent(event);
    
    // Also show in AI panel for context
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: `delegation_setup_${Date.now()}`,
        timestamp: Date.now(),
        content: '🔐 Smart Account Setup: Would you like to grant AI assistants permission to provide free medical consultations? You can change this anytime.',
        type: 'voice',
        confidence: 1.0
      })
    }
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
      this.startGaslessConsultation()
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

      // Add patient responses based on the current case
      setTimeout(() => {
        if (this.aiPanel && this.currentPatientCase) {
          // Handle both MedicalCase and PatientCase types
          let patientName = 'Patient';
          if ('patientInfo' in this.currentPatientCase) {
            patientName = (this.currentPatientCase as any).patientInfo.patientName;
          } else if ('patientName' in this.currentPatientCase) {
            patientName = (this.currentPatientCase as any).patientName;
          }

          const patientResponses = [
            `🗣️ ${patientName}: \"The pain is mainly in my temples and jaw area. It feels like a constant dull ache that sometimes sharpens when I chew.\"`,
            `🗣️ ${patientName}: \"These headaches started about three weeks ago. They've been getting worse, especially in the mornings.\"`,
            `🗣️ ${patientName}: \"They're pretty constant now. I used to get occasional headaches, but this is different - much more persistent.\"`,
            `🗣️ ${patientName}: \"The pain gets worse when I'm stressed or chew hard foods. Warm compresses and rest help a little.\"`,
            `🗣️ ${patientName}: \"Yes, they're really affecting my sleep. I wake up with a stiff jaw and headache most mornings.\"`,
            `🗣️ ${patientName}: \"Yes! There's definitely clicking when I open my mouth wide, especially when I yawn.\"`
          ];

          patientResponses.forEach((response, index) => {
            setTimeout(() => {
              if (this.aiPanel) {
                this.aiPanel.addInsight({
                  id: `patient_response_${Date.now()}_${index}`,
                  timestamp: Date.now(),
                  content: response,
                  type: 'voice',
                  confidence: 0.95
                })
              }
            }, index * 600)
          })
        }
      }, 3500) // Start responses after questions are shown
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

  public updateCaseInfo(patientCase: MedicalCase | PatientCase | null): void {
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
              ">📋 CASE #${patientCase.id}: ${(patientCase as any).title || 'Unknown Case'}</div>
              <div id="case-complaint" style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.light};">
                <strong>Presenting Complaint:</strong> ${(patientCase as any).presentingComplaint || 'Not specified'}
              </div>
              <div id="case-mission" style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base}; margin-top: ${spacing.xs};">
                Your Mission: ${(patientCase as any).mission || 'Not specified'}
              </div>
            </div>
        `;
    } else {
      caseInfoContainer.innerHTML = 'Loading case...';
    }
  }

  updatePatientInfo(patientCase: MedicalCase | PatientCase | null): void {
    // Store the current patient case for use in other methods
    this.currentPatientCase = patientCase;
    
    const patientInfoContainer = document.getElementById('patient-info-container')
    if (!patientInfoContainer) return

    if (!patientCase) {
      patientInfoContainer.innerHTML = 'Loading patient information...';
      return;
    }

    // Handle both MedicalCase and PatientCase types
    let patientInfo: any = null;
    if ('patientInfo' in patientCase) {
      patientInfo = (patientCase as any).patientInfo;
    } else if ('patientName' in patientCase) {
      // Create a PatientInfo object from PatientCase properties
      patientInfo = {
        patientName: (patientCase as any).patientName,
        age: (patientCase as any).age,
        gender: (patientCase as any).gender,
        chiefComplaint: (patientCase as any).chiefComplaint
      };
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

  // ENHANCEMENT FIRST: Update timer display
  updateTimer(timeRemaining: number, urgency: 'normal' | 'warning' | 'critical' = 'normal'): void {
    const timerElement = document.getElementById('timer-display')
    if (!timerElement) return

    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    timerElement.textContent = timeString

    // Update color based on urgency
    const urgencyColors = {
      normal: colors.primary.base,
      warning: colors.accent.base,
      critical: colors.error.base
    }
    
    const urgencyBorders = {
      normal: colors.border.primary,
      warning: colors.border.accent,
      critical: colors.border.error
    }

    timerElement.style.color = urgencyColors[urgency]
    timerElement.style.borderColor = urgencyBorders[urgency]
    
    // Add pulse animation for critical time
    if (urgency === 'critical') {
      timerElement.style.animation = 'pulse 1s ease-in-out infinite'
    } else {
      timerElement.style.animation = 'none'
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

  // CLEAN: Add pulse animation styles
  private addTimerStyles(): void {
    if (document.querySelector('#timer-animation-styles')) return

    const style = document.createElement('style')
    style.id = 'timer-animation-styles'
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.8;
        }
      }
    `
    document.head.appendChild(style)
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