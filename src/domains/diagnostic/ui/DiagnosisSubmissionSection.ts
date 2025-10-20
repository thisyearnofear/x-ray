/**
 * Diagnosis Submission Section
 * MODULAR: Single responsibility for diagnosis submission UI
 * DRY: Centralized submission logic
 * CLEAN: Pure UI component with clear data interface
 */

import { colors, spacing, typography, borders, effects, zIndex } from '../../../styles/design-tokens'
import { MEDICAL_CONDITIONS } from '../../medical/medical-data'

export interface DiagnosisSubmissionData {
  discoveredConditions: Set<string>
  onSubmit: (selectedConditions: string[]) => void
  onError: (message: string) => void
}

export class DiagnosisSubmissionSection {
  private element: HTMLElement | null = null
  private data: DiagnosisSubmissionData | null = null

  constructor() {
    this.addStyles()
  }

  create(data: DiagnosisSubmissionData): HTMLElement {
    this.data = data
    this.element = document.createElement('div')
    this.element.className = 'diagnosis-submission'
    this.element.id = 'diagnosis-submission'
    this.element.style.cssText = `
      margin-top: ${spacing.base}; 
      display: block;
    `
    
    this.element.innerHTML = this.generateHTML()
    this.setupEventListeners()
    return this.element
  }

  show(): void {
    if (this.element) {
      this.element.style.display = 'block'
    }
  }

  hide(): void {
    if (this.element) {
      this.element.style.display = 'none'
    }
  }

  updateDiscoveredConditions(discoveredConditions: Set<string>): void {
    if (!this.data) return
    
    this.data.discoveredConditions = discoveredConditions
    this.refreshOptions()
  }

  private generateHTML(): string {
    return `
      <div style="color: ${colors.accent.base}; font-size: ${typography.fontSize.base}; margin-bottom: ${spacing.sm}; text-shadow: ${effects.textShadow.accent}; letter-spacing: ${typography.letterSpacing.wider};">
        🏥 SUBMIT FINAL DIAGNOSIS
      </div>
      <div id="diagnosis-options" style="margin-bottom: ${spacing.base};">
        ${this.generateOptionsHTML()}
      </div>
      <button class="action-btn submit-diagnosis-btn" id="submit-diagnosis-btn" style="width: 100%;">
        <div class="btn-icon">📋</div>
        <div class="btn-text">SUBMIT DIAGNOSIS</div>
      </button>
    `
  }

  private generateOptionsHTML(): string {
    if (!this.data) return ''

    const discoveredConditions = Array.from(this.data.discoveredConditions)
    
    if (discoveredConditions.length === 0) {
      return `
        <div style="color: ${colors.neutral.base}; font-size: ${typography.fontSize.sm}; text-align: center; padding: ${spacing.base};">
          No conditions discovered yet
        </div>
      `
    }

    const instructionText = `
      <div style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.xs}; margin-bottom: 8px; letter-spacing: 0.5px; opacity: 0.9;">
        Select conditions for your final diagnosis:
      </div>
    `

    const optionsHTML = discoveredConditions.map(conditionId => {
      const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId)
      if (!condition) return ''

      return `
        <label class="diagnosis-option" style="
          display: flex; 
          align-items: center; 
          gap: 8px; 
          padding: 8px 12px; 
          background: linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,150,255,0.1) 100%); 
          border: 1px solid rgba(0,255,136,0.3); 
          border-radius: 6px; 
          margin-bottom: 6px; 
          cursor: pointer; 
          transition: all 0.3s ease; 
          position: relative; 
          overflow: hidden;
        ">
          <input type="checkbox" name="diagnosis" value="${conditionId}" style="accent-color: ${colors.primary.base}; transform: scale(1.1);">
          <span style="color: ${colors.neutral.white}; font-size: ${typography.fontSize.xs}; flex: 1; font-weight: 500;">
            ${condition.name}
          </span>
          <span style="color: ${colors.accent.base}; font-size: 9px; opacity: 0.8; font-weight: 600; letter-spacing: 0.5px;">
            ${condition.severity.toUpperCase()}
          </span>
        </label>
      `
    }).join('')

    return instructionText + optionsHTML
  }

  private refreshOptions(): void {
    if (!this.element) return

    const optionsContainer = this.element.querySelector('#diagnosis-options') as HTMLElement
    if (optionsContainer) {
      optionsContainer.innerHTML = this.generateOptionsHTML()
      this.setupOptionInteractivity()
    }
  }

  private setupEventListeners(): void {
    if (!this.element || !this.data) return

    const submitBtn = this.element.querySelector('#submit-diagnosis-btn') as HTMLElement
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleSubmission())
    }

    this.setupOptionInteractivity()
  }

  private setupOptionInteractivity(): void {
    if (!this.element) return

    const labels = this.element.querySelectorAll('.diagnosis-option')
    labels.forEach(label => {
      label.addEventListener('mouseenter', () => {
        const htmlLabel = label as HTMLElement
        htmlLabel.style.background = 'linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(0,150,255,0.2) 100%)'
        htmlLabel.style.borderColor = 'rgba(0,255,136,0.5)'
        htmlLabel.style.boxShadow = '0 8px 25px rgba(0,255,136,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
        htmlLabel.style.transform = 'translateY(-1px)'
      })
      
      label.addEventListener('mouseleave', () => {
        const htmlLabel = label as HTMLElement
        htmlLabel.style.background = 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,150,255,0.1) 100%)'
        htmlLabel.style.borderColor = 'rgba(0,255,136,0.3)'
        htmlLabel.style.boxShadow = 'none'
        htmlLabel.style.transform = 'translateY(0)'
      })
    })
  }

  private handleSubmission(): void {
    if (!this.element || !this.data) return

    const checkboxes = this.element.querySelectorAll('input[name="diagnosis"]:checked') as NodeListOf<HTMLInputElement>
    const selectedConditions = Array.from(checkboxes).map(cb => cb.value)

    if (selectedConditions.length === 0) {
      this.data.onError('Please select at least one condition for your diagnosis.')
      return
    }

    // ENHANCEMENT FIRST: Dispatch browser event for NFT panel
    window.dispatchEvent(new CustomEvent('diagnosis-complete', {
      detail: { selectedConditions }
    }))

    this.data.onSubmit(selectedConditions)
  }

  private addStyles(): void {
    if (document.querySelector('#diagnosis-submission-styles')) return

    const style = document.createElement('style')
    style.id = 'diagnosis-submission-styles'
    style.textContent = `
      .diagnosis-submission {
        background: 
          linear-gradient(135deg, rgba(255,170,0,0.05) 0%, rgba(255,140,0,0.05) 100%),
          radial-gradient(circle at 30% 30%, rgba(255,170,0,0.1) 0%, transparent 50%);
        border: 1px solid rgba(255,170,0,0.3);
        border-radius: 8px;
        padding: ${spacing.base};
        position: relative;
        overflow: hidden;
        animation: glow-pulse 4s ease-in-out infinite;
      }

      .diagnosis-submission::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255,170,0,0.03) 2px,
          rgba(255,170,0,0.03) 4px
        );
        pointer-events: none;
        animation: scan-line 5s linear infinite;
      }

      .diagnosis-option::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s;
      }

      .diagnosis-option:hover::before {
        left: 100%;
      }

      .diagnosis-option input[type="checkbox"]:checked + span {
        color: ${colors.primary.base} !important;
        text-shadow: 0 0 8px rgba(0,255,136,0.5);
      }

      .diagnosis-option:has(input[type="checkbox"]:checked) {
        background: linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(0,150,255,0.2) 100%) !important;
        border-color: rgba(0,255,136,0.6) !important;
        box-shadow: 0 0 20px rgba(0,255,136,0.3) !important;
      }

      .submit-diagnosis-btn {
        background: linear-gradient(135deg, ${colors.primary.base} 0%, #00cc6a 100%) !important;
        color: #000 !important;
        font-weight: bold !important;
        box-shadow: 
          0 4px 15px rgba(0,255,136,0.4),
          inset 0 1px 0 rgba(255,255,255,0.2) !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
        position: relative;
        overflow: hidden;
        border: none;
        border-radius: ${borders.radius.md};
        padding: ${spacing.md};
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .submit-diagnosis-btn::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s;
      }

      .submit-diagnosis-btn:hover::before {
        left: 100%;
      }

      .submit-diagnosis-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 
          0 8px 25px rgba(0,255,136,0.5),
          inset 0 1px 0 rgba(255,255,255,0.3) !important;
      }

      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 5px rgba(255,170,0,0.3); }
        50% { box-shadow: 0 0 20px rgba(255,170,0,0.6); }
      }

      @keyframes scan-line {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }
    `
    document.head.appendChild(style)
  }

  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.element = null
    this.data = null
  }
}