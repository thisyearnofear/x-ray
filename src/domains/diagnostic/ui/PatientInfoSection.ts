/**
 * MODULAR: Patient information display section
 * CLEAN: Single responsibility - patient data presentation
 * ENHANCEMENT FIRST: Reuses existing design tokens
 */

import { colors, spacing, typography, borders } from '../../../styles/design-tokens'

export interface PatientInfo {
  patientName: string
  age: number
  gender: string
  chiefComplaint: string
  conditionName?: string
  conditionDescription?: string
  conditionLocation?: string
  historyOfPresentIllness?: string
}

export class PatientInfoSection {
  private element: HTMLElement | null = null
  private isExpanded: boolean = false

  create(patientInfo: PatientInfo): HTMLElement {
    this.element = document.createElement('div')
    this.element.className = 'patient-info-section'
    this.element.style.cssText = this.getSectionStyles()
    
    this.element.innerHTML = this.generateContent(patientInfo)
    this.setupExpandFunctionality()
    this.addStyles()
    
    return this.element
  }

  update(patientInfo: PatientInfo): void {
    if (!this.element) return
    this.element.innerHTML = this.generateContent(patientInfo)
    this.setupExpandFunctionality()
  }

  private generateContent(patientInfo: PatientInfo): string {
    const hpi = patientInfo.historyOfPresentIllness || 'Patient requires comprehensive diagnostic assessment.'
    const displayHPI = hpi.length > 150 ? hpi.substring(0, 150) + '...' : hpi

    return `
      <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.xs}; margin-bottom: 0.25rem; letter-spacing: ${typography.letterSpacing.wider};">
        🔍 CURRENT CASE: ${patientInfo.conditionName || 'Unknown Condition'}
      </div>
      <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.xs}; margin-bottom: 0.5rem; letter-spacing: ${typography.letterSpacing.wider};">
        👤 PATIENT INFORMATION 
        <span style="float: right; font-size: ${typography.fontSize.xs}; opacity: 0.7;">Click to expand</span>
      </div>
      
      <div class="patient-basic-info">
        <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.white}; margin-bottom: 0.25rem;">
          <strong>Name:</strong> ${patientInfo.patientName}
        </div>
        <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.white}; margin-bottom: 0.25rem;">
          <strong>Age:</strong> ${patientInfo.age} | <strong>Gender:</strong> ${patientInfo.gender}
        </div>
        <div style="font-size: ${typography.fontSize.xs}; color: ${colors.accent.base}; margin-bottom: 0.25rem;">
          <strong>Chief Complaint:</strong> ${patientInfo.chiefComplaint}
        </div>
      </div>

      ${this.generateConditionInfo(patientInfo)}
      ${this.generateHPISection(hpi, displayHPI)}
    `
  }

  private generateConditionInfo(patientInfo: PatientInfo): string {
    if (!patientInfo.conditionDescription && !patientInfo.conditionLocation) return ''

    return `
      <div class="condition-info">
        ${patientInfo.conditionDescription ? `
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.error.base}; margin-bottom: 0.25rem;">
            <strong>Condition:</strong> ${patientInfo.conditionDescription}
          </div>
        ` : ''}
        ${patientInfo.conditionLocation ? `
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.error.base}; margin-bottom: 0.5rem;">
            <strong>Location:</strong> ${patientInfo.conditionLocation}
          </div>
        ` : ''}
      </div>
    `
  }

  private generateHPISection(fullHPI: string, displayHPI: string): string {
    return `
      <div class="hpi-content" style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.light}; line-height: ${typography.lineHeight.relaxed};">
        <strong>HPI:</strong> 
        <span class="hpi-short">${displayHPI}</span>
        <span class="hpi-full" style="display: none;">${fullHPI}</span>
      </div>
    `
  }

  private getSectionStyles(): string {
    return `
      background: rgba(0,255,136,0.05); 
      border: ${borders.width.thin} solid rgba(0,255,136,0.2); 
      border-radius: ${borders.radius.md}; 
      padding: ${spacing.base}; 
      margin-top: ${spacing.base}; 
      cursor: pointer; 
      transition: all 0.3s ease;
    `
  }

  private setupExpandFunctionality(): void {
    if (!this.element) return

    this.element.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded
      this.element?.classList.toggle('expanded', this.isExpanded)
    })
  }

  private addStyles(): void {
    if (document.querySelector('#patient-info-section-styles')) return

    const style = document.createElement('style')
    style.id = 'patient-info-section-styles'
    style.textContent = `
      .patient-info-section:hover {
        background: rgba(0,255,136,0.08) !important;
        border-color: rgba(0,255,136,0.4) !important;
      }
      
      .patient-info-section.expanded .hpi-short {
        display: none !important;
      }
      
      .patient-info-section.expanded .hpi-full {
        display: inline !important;
      }
    `
    document.head.appendChild(style)
  }

  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.element = null
  }
}