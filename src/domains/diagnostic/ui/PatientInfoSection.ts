/**
 * MODULAR: Patient information display section
 * CLEAN: Single responsibility - patient data presentation
 * ENHANCEMENT FIRST: Reuses existing design tokens
 * ENHANCED: Structured layout for better readability
 */

import { colors, spacing, typography, borders } from '../../../styles/design-tokens'

export interface PatientInfo {
  id?: string
  patientName: string
  age: number
  gender: string
  chiefComplaint: string
  conditionName?: string
  conditionDescription?: string
  conditionLocation?: string
  historyOfPresentIllness?: string
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
    respiratoryRate?: number
    temperature?: number
    oxygenSaturation?: number
    painLevel?: number
  }
  pastMedicalHistory?: string[]
  medications?: string[]
  diagnosis?: string
  estimatedStudyTime?: number
}

export class PatientInfoSection {
  private element: HTMLElement | null = null
  private isExpanded: boolean = false

  create(patientInfo: PatientInfo): HTMLElement {
    this.setLastKnownPatientInfo(patientInfo);
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
    this.setLastKnownPatientInfo(patientInfo);
    this.element.innerHTML = this.generateContent(patientInfo)
    this.setupExpandFunctionality()
  }

  private generateContent(patientInfo: PatientInfo): string {
    const hpi = patientInfo.historyOfPresentIllness || 'Patient requires comprehensive diagnostic assessment.'
    const displayHPI = hpi.length > 150 ? hpi.substring(0, 150) + '...' : hpi

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${spacing.sm};">
        <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.sm}; letter-spacing: ${typography.letterSpacing.wider};">
          🏥 PATIENT DATA
        </div>
        <div style="color: ${colors.neutral.medium}; font-size: ${typography.fontSize.xs};">
          Click to ${this.isExpanded ? 'collapse' : 'expand'}
        </div>
      </div>
      
      <div class="patient-basic-info" style="margin-bottom: ${spacing.md};">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${spacing.sm}; margin-bottom: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
            <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">Name</strong>
            <span style="display: block; margin-top: ${spacing.xs};">${patientInfo.patientName}</span>
          </div>
          <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
            <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">Age | Gender</strong>
            <span style="display: block; margin-top: ${spacing.xs};">${patientInfo.age} | ${patientInfo.gender}</span>
          </div>
        </div>

        <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white}; margin-bottom: ${spacing.sm};">
          <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">Chief Complaint</strong>
          <span style="display: block; margin-top: ${spacing.xs}; color: ${colors.accent.base};">${patientInfo.chiefComplaint}</span>
        </div>
      </div>

      ${this.isExpanded ? this.generateExpandedContent(patientInfo) : ''}

      <div class="hpi-section" style="margin-top: ${spacing.md}; border-top: 1px solid ${colors.border.primary}; padding-top: ${spacing.md};">
        <div style="color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider}; margin-bottom: ${spacing.sm};">
          HISTORY OF PRESENT ILLNESS
        </div>
        <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.light}; line-height: ${typography.lineHeight.relaxed};">
          <span class="hpi-content">${displayHPI}</span>
          ${hpi.length > 150 ? `<span class="hpi-full" style="display: none;">${hpi}</span>` : ''}
          ${hpi.length > 150 ? '<a href="#" class="read-more" style="color: ' + colors.primary.base + '; text-decoration: underline; margin-left: 5px; font-size: ' + typography.fontSize.xs + ';">Read more</a>' : ''}
        </div>
      </div>
    `
  }

  private generateExpandedContent(patientInfo: PatientInfo): string {
    return `
      <div class="expanded-info" style="margin-bottom: ${spacing.md};">
        ${patientInfo.conditionName || patientInfo.conditionDescription || patientInfo.conditionLocation ? `
          <div class="condition-info" style="margin-bottom: ${spacing.md};">
            <div style="color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider}; margin-bottom: ${spacing.sm};">
              CONDITION DETAILS
            </div>
            ${patientInfo.conditionName ? `
              <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white}; margin-bottom: ${spacing.xs};">
                <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">Name</strong>
                <span style="display: block; margin-top: ${spacing.xs}; color: ${colors.error.base};">${patientInfo.conditionName}</span>
              </div>
            ` : ''}
            ${patientInfo.conditionDescription ? `
              <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white}; margin-bottom: ${spacing.xs};">
                <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">Description</strong>
                <span style="display: block; margin-top: ${spacing.xs}; color: ${colors.error.base};">${patientInfo.conditionDescription}</span>
              </div>
            ` : ''}
            ${patientInfo.conditionLocation ? `
              <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white}; margin-bottom: ${spacing.xs};">
                <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">Location</strong>
                <span style="display: block; margin-top: ${spacing.xs}; color: ${colors.error.base};">${patientInfo.conditionLocation}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${patientInfo.vitalSigns ? `
          <div class="vital-signs" style="margin-bottom: ${spacing.md};">
            <div style="color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider}; margin-bottom: ${spacing.sm};">
              VITAL SIGNS
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: ${spacing.sm};">
              ${patientInfo.vitalSigns.bloodPressure ? `
                <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
                  <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">BP</strong>
                  <span style="display: block; margin-top: ${spacing.xs};">${patientInfo.vitalSigns.bloodPressure}</span>
                </div>
              ` : ''}
              ${patientInfo.vitalSigns.heartRate ? `
                <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
                  <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">HR</strong>
                  <span style="display: block; margin-top: ${spacing.xs};">${patientInfo.vitalSigns.heartRate} bpm</span>
                </div>
              ` : ''}
              ${patientInfo.vitalSigns.respiratoryRate ? `
                <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
                  <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">RR</strong>
                  <span style="display: block; margin-top: ${spacing.xs};">${patientInfo.vitalSigns.respiratoryRate} /min</span>
                </div>
              ` : ''}
              ${patientInfo.vitalSigns.temperature ? `
                <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
                  <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">Temp</strong>
                  <span style="display: block; margin-top: ${spacing.xs};">${patientInfo.vitalSigns.temperature}°F</span>
                </div>
              ` : ''}
              ${patientInfo.vitalSigns.oxygenSaturation ? `
                <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
                  <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">O2 Sat</strong>
                  <span style="display: block; margin-top: ${spacing.xs};">${patientInfo.vitalSigns.oxygenSaturation}%</span>
                </div>
              ` : ''}
              ${patientInfo.vitalSigns.painLevel !== undefined ? `
                <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
                  <strong style="display: block; color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.normal}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider};">Pain</strong>
                  <span style="display: block; margin-top: ${spacing.xs};">${patientInfo.vitalSigns.painLevel}/10</span>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        ${patientInfo.pastMedicalHistory && patientInfo.pastMedicalHistory.length > 0 ? `
          <div class="medical-history" style="margin-bottom: ${spacing.md};">
            <div style="color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider}; margin-bottom: ${spacing.sm};">
              PAST MEDICAL HISTORY
            </div>
            <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
              ${patientInfo.pastMedicalHistory.map(history => `<div style="margin-bottom: ${spacing.xs};">• ${history}</div>`).join('')}
            </div>
          </div>
        ` : ''}

        ${patientInfo.medications && patientInfo.medications.length > 0 ? `
          <div class="medications" style="margin-bottom: ${spacing.md};">
            <div style="color: ${colors.neutral.medium}; font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.xs}; text-transform: uppercase; letter-spacing: ${typography.letterSpacing.wider}; margin-bottom: ${spacing.sm};">
              CURRENT MEDICATIONS
            </div>
            <div style="font-size: ${typography.fontSize.sm}; color: ${colors.neutral.white};">
              ${patientInfo.medications.map(med => `<div style="margin-bottom: ${spacing.xs};">• ${med}</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
  }

  private getSectionStyles(): string {
    return `
      background: ${colors.background.panel}; 
      border: ${borders.width.base} solid ${colors.border.primary}; 
      border-radius: ${borders.radius.lg}; 
      padding: ${spacing.md}; 
      margin-top: ${spacing.base}; 
      cursor: pointer; 
      transition: all 0.3s ease;
      ${effects.inset.medium}
      backdrop-filter: ${effects.blur.base};
    `
  }

  private setupExpandFunctionality(): void {
    if (!this.element) return

    // Add click handler for the main element
    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Check if clicked on "Read more" link to expand HPI without toggling section
      if ((e.target as HTMLElement).classList.contains('read-more')) {
        e.preventDefault();
        this.expandHPI();
        return;
      }
      
      // Toggle the expanded state and regenerate content
      this.isExpanded = !this.isExpanded;
      this.element!.innerHTML = this.generateContent((this.element as any).patientInfo || this.getLastKnownPatientInfo());
      this.setupExpandFunctionality(); // Reattach event listeners
    });
  }

  private expandHPI(): void {
    const hpiContent = this.element?.querySelector('.hpi-content') as HTMLElement;
    const readMore = this.element?.querySelector('.read-more, .read-less') as HTMLElement;
    const hpiFull = this.element?.querySelector('.hpi-full') as HTMLElement;
    
    if (hpiContent && hpiFull && readMore) {
      if (readMore.classList.contains('read-more')) {
        // Expand to full HPI
        hpiContent.innerHTML = hpiFull.textContent || '';
        readMore.textContent = 'Show less';
        readMore.classList.remove('read-more');
        readMore.classList.add('read-less');
      } else {
        // Collapse back to short HPI
        const patientInfo = (this.element as any).patientInfo || this.getLastKnownPatientInfo();
        const hpi = patientInfo.historyOfPresentIllness || 'Patient requires comprehensive diagnostic assessment.';
        const displayHPI = hpi.length > 150 ? hpi.substring(0, 150) + '...' : hpi;
        
        hpiContent.innerHTML = displayHPI;
        readMore.textContent = 'Read more';
        readMore.classList.remove('read-less');
        readMore.classList.add('read-more');
      }
    }
  }

  // Store patient info temporarily to access in event handlers
  private lastKnownPatientInfo: PatientInfo | null = null;
  
  private setLastKnownPatientInfo(patientInfo: PatientInfo): void {
    this.lastKnownPatientInfo = patientInfo;
    if (this.element) {
      (this.element as any).patientInfo = patientInfo;
    }
  }
  
  private getLastKnownPatientInfo(): PatientInfo {
    return this.lastKnownPatientInfo || {
      patientName: 'Unknown Patient',
      age: 0,
      gender: 'Unknown',
      chiefComplaint: 'No data available'
    };
  }

  private addStyles(): void {
    if (document.querySelector('#patient-info-section-styles')) return

    const style = document.createElement('style')
    style.id = 'patient-info-section-styles'
    style.textContent = `
      .patient-info-section:hover {
        background: ${colors.background.panelLight} !important;
        border-color: ${colors.primary.base} !important;
        box-shadow: ${effects.shadow.base}, ${effects.shadow.primaryGlow} !important;
      }
      
      .patient-info-section.expanded .hpi-short {
        display: none !important;
      }
      
      .patient-info-section.expanded .hpi-full {
        display: inline !important;
      }
      
      .patient-info-section .read-less {
        color: ${colors.error.base} !important;
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