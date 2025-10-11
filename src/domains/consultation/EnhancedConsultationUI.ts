/**
 * Enhanced Consultation UI
 * IMMERSIVE: Realistic specialist consultation interface with video call simulation
 * EDUCATIONAL: Detailed specialist profiles and consultation workflows
 * INTERACTIVE: Real-time consultation status and progress tracking
 */

import { colors, spacing, typography, borders, effects, zIndex } from '../../styles/design-tokens'

export interface SpecialistProfile {
  id: string
  name: string
  specialty: string
  title: string
  institution: string
  experience: number
  expertise: string[]
  availability: 'available' | 'busy' | 'offline'
  responseTime: number // minutes
  consultationFee: number
  rating: number
  avatar?: string
  bio: string
}

export interface ConsultationRequest {
  id: string
  specialistId: string
  patientCase: any
  urgency: 'routine' | 'urgent' | 'emergency'
  findings: string[]
  questions: string[]
  requestTime: number
  estimatedResponseTime: number
}

export interface ConsultationResponse {
  id: string
  requestId: string
  specialist: SpecialistProfile
  recommendations: string[]
  additionalTests: string[]
  followUpRequired: boolean
  confidence: number
  responseTime: number
  notes: string
}

export class EnhancedConsultationUI {
  private container: HTMLElement | null = null
  private specialists: Map<string, SpecialistProfile> = new Map()
  private activeConsultations: Map<string, ConsultationRequest> = new Map()
  private consultationHistory: ConsultationResponse[] = []
  private isVisible: boolean = false
  private currentView: 'specialists' | 'consultation' | 'history' = 'specialists'

  constructor() {
    this.setupSpecialistProfiles()
    console.log('🏥 Enhanced Consultation UI initialized')
  }

  private setupSpecialistProfiles(): void {
    const specialists: SpecialistProfile[] = [
      {
        id: 'cardiology_001',
        name: 'Dr. Sarah Chen',
        specialty: 'Cardiology',
        title: 'Interventional Cardiologist',
        institution: 'Metropolitan Heart Institute',
        experience: 15,
        expertise: ['Coronary Artery Disease', 'Heart Failure', 'Arrhythmias', 'Valvular Disease'],
        availability: 'available',
        responseTime: 10,
        consultationFee: 150,
        rating: 4.9,
        bio: 'Board-certified interventional cardiologist with expertise in complex coronary interventions and structural heart disease.'
      },
      {
        id: 'neurology_001',
        name: 'Dr. Michael Rodriguez',
        specialty: 'Neurology',
        title: 'Neurologist',
        institution: 'Central Neurological Center',
        experience: 12,
        expertise: ['Stroke', 'Epilepsy', 'Movement Disorders', 'Headache Medicine'],
        availability: 'available',
        responseTime: 15,
        consultationFee: 175,
        rating: 4.8,
        bio: 'Experienced neurologist specializing in acute stroke care and movement disorders with extensive research background.'
      },
      {
        id: 'radiology_001',
        name: 'Dr. Emily Watson',
        specialty: 'Radiology',
        title: 'Diagnostic Radiologist',
        institution: 'Advanced Imaging Associates',
        experience: 18,
        expertise: ['CT Imaging', 'MRI', 'Interventional Radiology', 'Emergency Radiology'],
        availability: 'available',
        responseTime: 5,
        consultationFee: 125,
        rating: 4.9,
        bio: 'Fellowship-trained diagnostic radiologist with subspecialty expertise in emergency and interventional radiology.'
      },
      {
        id: 'orthopedics_001',
        name: 'Dr. James Thompson',
        specialty: 'Orthopedic Surgery',
        title: 'Orthopedic Surgeon',
        institution: 'Sports Medicine & Orthopedic Center',
        experience: 20,
        expertise: ['Sports Medicine', 'Joint Replacement', 'Trauma Surgery', 'Spine Surgery'],
        availability: 'busy',
        responseTime: 30,
        consultationFee: 200,
        rating: 4.7,
        bio: 'Board-certified orthopedic surgeon with extensive experience in sports medicine and complex trauma cases.'
      },
      {
        id: 'pathology_001',
        name: 'Dr. Lisa Park',
        specialty: 'Pathology',
        title: 'Anatomic Pathologist',
        institution: 'University Medical Center',
        experience: 14,
        expertise: ['Surgical Pathology', 'Cytopathology', 'Molecular Diagnostics', 'Hematopathology'],
        availability: 'available',
        responseTime: 20,
        consultationFee: 140,
        rating: 4.8,
        bio: 'Board-certified anatomic pathologist with expertise in molecular diagnostics and precision medicine.'
      },
      {
        id: 'emergency_001',
        name: 'Dr. Robert Kim',
        specialty: 'Emergency Medicine',
        title: 'Emergency Physician',
        institution: 'City General Emergency Department',
        experience: 10,
        expertise: ['Trauma Care', 'Critical Care', 'Toxicology', 'Emergency Procedures'],
        availability: 'available',
        responseTime: 3,
        consultationFee: 100,
        rating: 4.6,
        bio: 'Emergency medicine physician with extensive experience in trauma and critical care medicine.'
      }
    ]

    specialists.forEach(specialist => {
      this.specialists.set(specialist.id, specialist)
    })
  }

  /**
   * Show consultation interface
   */
  public show(): void {
    if (this.isVisible) return

    this.createConsultationInterface()
    this.isVisible = true
  }

  /**
   * Hide consultation interface
   */
  public hide(): void {
    if (!this.isVisible || !this.container) return

    this.container.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container)
      }
      this.container = null
      this.isVisible = false
    }, 300)
  }

  private createConsultationInterface(): void {
    this.container = document.createElement('div')
    this.container.id = 'enhanced-consultation-ui'
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90vw;
      max-width: 1200px;
      height: 80vh;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.primary};
      border-radius: ${borders.radius.xl};
      padding: ${spacing.xl};
      color: ${colors.neutral.light};
      font-family: ${typography.fontFamily.primary};
      z-index: ${zIndex.modal};
      box-shadow: ${effects.shadow.xl}, ${effects.shadow.primaryGlow};
      backdrop-filter: ${effects.blur.lg};
      ${effects.inset.medium};
      animation: slideIn 0.3s ease-out;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `

    // Create header
    this.createHeader()
    
    // Create navigation
    this.createNavigation()
    
    // Create content area
    this.createContentArea()
    
    // Create footer
    this.createFooter()

    document.body.appendChild(this.container)
  }

  private createHeader(): void {
    if (!this.container) return

    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${spacing.lg};
      padding-bottom: ${spacing.md};
      border-bottom: ${borders.width.thin} solid ${colors.border.primary};
    `

    header.innerHTML = `
      <div>
        <h2 style="
          margin: 0;
          color: ${colors.primary.base};
          font-size: ${typography.fontSize['2xl']};
          font-weight: ${typography.fontWeight.bold};
          text-shadow: ${effects.textShadow.sm};
        ">🏥 Specialist Consultation</h2>
        <p style="
          margin: ${spacing.xs} 0 0 0;
          color: ${colors.neutral.base};
          font-size: ${typography.fontSize.sm};
        ">Connect with medical specialists for expert consultation</p>
      </div>
      <button id="close-consultation" style="
        background: transparent;
        color: ${colors.neutral.base};
        border: ${borders.width.thin} solid ${colors.border.neutral};
        border-radius: ${borders.radius.md};
        padding: ${spacing.sm};
        cursor: pointer;
        font-size: ${typography.fontSize.lg};
        transition: all 0.3s ease;
      ">✕</button>
    `

    // Add close button functionality
    const closeButton = header.querySelector('#close-consultation') as HTMLButtonElement
    closeButton.addEventListener('click', () => this.hide())
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.color = colors.error.base
      closeButton.style.borderColor = colors.border.error
    })
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.color = colors.neutral.base
      closeButton.style.borderColor = colors.border.neutral
    })

    this.container.appendChild(header)
  }

  private createNavigation(): void {
    if (!this.container) return

    const nav = document.createElement('div')
    nav.style.cssText = `
      display: flex;
      gap: ${spacing.md};
      margin-bottom: ${spacing.lg};
    `

    const navItems = [
      { id: 'specialists', label: '👨‍⚕️ Specialists', view: 'specialists' },
      { id: 'consultation', label: '💬 Active Consultations', view: 'consultation' },
      { id: 'history', label: '📋 History', view: 'history' }
    ]

    navItems.forEach(item => {
      const button = document.createElement('button')
      button.id = `nav-${item.id}`
      button.textContent = item.label
      button.style.cssText = `
        background: ${this.currentView === item.view ? colors.background.primaryGlow : 'transparent'};
        color: ${this.currentView === item.view ? colors.primary.base : colors.neutral.light};
        border: ${borders.width.thin} solid ${this.currentView === item.view ? colors.border.primary : colors.border.neutral};
        border-radius: ${borders.radius.md};
        padding: ${spacing.sm} ${spacing.md};
        cursor: pointer;
        font-size: ${typography.fontSize.sm};
        transition: all 0.3s ease;
      `

      button.addEventListener('click', () => {
        this.currentView = item.view as any
        this.updateNavigation()
        this.updateContentArea()
      })

      nav.appendChild(button)
    })

    this.container.appendChild(nav)
  }

  private updateNavigation(): void {
    const navButtons = this.container?.querySelectorAll('[id^=\"nav-\"]')
    navButtons?.forEach(button => {
      const buttonElement = button as HTMLButtonElement
      const isActive = buttonElement.id.includes(this.currentView)
      
      buttonElement.style.background = isActive ? colors.background.primaryGlow : 'transparent'
      buttonElement.style.color = isActive ? colors.primary.base : colors.neutral.light
      buttonElement.style.borderColor = isActive ? colors.border.primary : colors.border.neutral
    })
  }

  private createContentArea(): void {
    if (!this.container) return

    const content = document.createElement('div')
    content.id = 'consultation-content'
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding-right: ${spacing.sm};
    `

    this.container.appendChild(content)
    this.updateContentArea()
  }

  private updateContentArea(): void {
    const content = this.container?.querySelector('#consultation-content')
    if (!content) return

    switch (this.currentView) {
      case 'specialists':
        this.renderSpecialistsList(content as HTMLElement)
        break
      case 'consultation':
        this.renderActiveConsultations(content as HTMLElement)
        break
      case 'history':
        this.renderConsultationHistory(content as HTMLElement)
        break
    }
  }

  private renderSpecialistsList(container: HTMLElement): void {
    container.innerHTML = `
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: ${spacing.lg};
      ">
        ${Array.from(this.specialists.values()).map(specialist => this.createSpecialistCard(specialist)).join('')}
      </div>
    `

    // Add event listeners for consultation buttons
    container.querySelectorAll('.consult-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const specialistId = (e.target as HTMLElement).getAttribute('data-specialist-id')
        if (specialistId) {
          this.initiateConsultation(specialistId)
        }
      })
    })
  }

  private createSpecialistCard(specialist: SpecialistProfile): string {
    const availabilityColor = {
      'available': colors.primary.base,
      'busy': colors.accent.base,
      'offline': colors.error.base
    }[specialist.availability]

    const availabilityText = {
      'available': 'Available',
      'busy': 'Busy',
      'offline': 'Offline'
    }[specialist.availability]

    return `
      <div style="
        background: ${colors.background.gradient.primary};
        border: ${borders.width.thin} solid ${colors.border.primary};
        border-radius: ${borders.radius.lg};
        padding: ${spacing.lg};
        transition: all 0.3s ease;
      " class="specialist-card">
        <div style="display: flex; align-items: center; margin-bottom: ${spacing.md};">
          <div style="
            width: 60px;
            height: 60px;
            background: ${colors.background.primaryGlow};
            border-radius: ${borders.radius.full};
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: ${spacing.md};
            font-size: ${typography.fontSize['2xl']};
          ">👨‍⚕️</div>
          <div>
            <h3 style="
              margin: 0;
              color: ${colors.primary.base};
              font-size: ${typography.fontSize.lg};
              font-weight: ${typography.fontWeight.bold};
            ">${specialist.name}</h3>
            <p style="
              margin: ${spacing.xs} 0 0 0;
              color: ${colors.neutral.base};
              font-size: ${typography.fontSize.sm};
            ">${specialist.title}</p>
          </div>
        </div>
        
        <div style="margin-bottom: ${spacing.md};">
          <div style="
            display: flex;
            align-items: center;
            gap: ${spacing.sm};
            margin-bottom: ${spacing.xs};
          ">
            <span style="
              display: inline-block;
              width: 8px;
              height: 8px;
              background: ${availabilityColor};
              border-radius: ${borders.radius.full};
            "></span>
            <span style="color: ${availabilityColor}; font-size: ${typography.fontSize.sm};">${availabilityText}</span>
            <span style="color: ${colors.neutral.base}; font-size: ${typography.fontSize.sm};">• ${specialist.responseTime} min response</span>
          </div>
          <div style="
            display: flex;
            align-items: center;
            gap: ${spacing.sm};
            margin-bottom: ${spacing.xs};
          ">
            <span style="color: ${colors.accent.base};">⭐</span>
            <span style="color: ${colors.neutral.light}; font-size: ${typography.fontSize.sm};">${specialist.rating}/5.0</span>
            <span style="color: ${colors.neutral.base}; font-size: ${typography.fontSize.sm};">• ${specialist.experience} years exp.</span>
          </div>
        </div>
        
        <div style="margin-bottom: ${spacing.md};">
          <p style="
            margin: 0;
            color: ${colors.neutral.light};
            font-size: ${typography.fontSize.sm};
            line-height: ${typography.lineHeight.relaxed};
          ">${specialist.bio}</p>
        </div>
        
        <div style="margin-bottom: ${spacing.md};">
          <h4 style="
            margin: 0 0 ${spacing.xs} 0;
            color: ${colors.info.base};
            font-size: ${typography.fontSize.sm};
            font-weight: ${typography.fontWeight.bold};
          ">Expertise:</h4>
          <div style="display: flex; flex-wrap: wrap; gap: ${spacing.xs};">
            ${specialist.expertise.map(skill => `
              <span style="
                background: ${colors.background.infoGlow};
                color: ${colors.info.base};
                padding: ${spacing.xs} ${spacing.sm};
                border-radius: ${borders.radius.md};
                font-size: ${typography.fontSize.xs};
              ">${skill}</span>
            `).join('')}
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
          ">$${specialist.consultationFee}</span>
          <button 
            class="consult-button"
            data-specialist-id="${specialist.id}"
            style="
              background: ${specialist.availability === 'available' ? colors.primary.base : colors.background.primaryGlow};
              color: ${specialist.availability === 'available' ? colors.neutral.black : colors.neutral.base};
              border: none;
              border-radius: ${borders.radius.md};
              padding: ${spacing.sm} ${spacing.lg};
              cursor: ${specialist.availability === 'available' ? 'pointer' : 'not-allowed'};
              font-size: ${typography.fontSize.sm};
              font-weight: ${typography.fontWeight.bold};
              transition: all 0.3s ease;
              opacity: ${specialist.availability === 'available' ? '1' : '0.6'};
            "
            ${specialist.availability !== 'available' ? 'disabled' : ''}
          >
            ${specialist.availability === 'available' ? 'Request Consultation' : 'Unavailable'}
          </button>
        </div>
      </div>
    `
  }

  private renderActiveConsultations(container: HTMLElement): void {
    if (this.activeConsultations.size === 0) {
      container.innerHTML = `
        <div style="
          text-align: center;
          padding: ${spacing['3xl']};
          color: ${colors.neutral.base};
        ">
          <div style="font-size: ${typography.fontSize['3xl']}; margin-bottom: ${spacing.lg};">💬</div>
          <h3 style="margin: 0 0 ${spacing.sm} 0; color: ${colors.neutral.light};">No Active Consultations</h3>
          <p style="margin: 0;">Request a consultation with a specialist to get started.</p>
        </div>
      `
      return
    }

    const consultationsHtml = Array.from(this.activeConsultations.values())
      .map(consultation => this.createConsultationCard(consultation))
      .join('')

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: ${spacing.lg};">
        ${consultationsHtml}
      </div>
    `
  }

  private createConsultationCard(consultation: ConsultationRequest): string {
    const specialist = this.specialists.get(consultation.specialistId)
    if (!specialist) return ''

    const urgencyColor = {
      'routine': colors.primary.base,
      'urgent': colors.accent.base,
      'emergency': colors.error.base
    }[consultation.urgency]

    const timeElapsed = Date.now() - consultation.requestTime
    const timeRemaining = Math.max(0, consultation.estimatedResponseTime - timeElapsed)
    const timeRemainingMinutes = Math.ceil(timeRemaining / (1000 * 60))

    return `
      <div style="
        background: ${colors.background.gradient.primary};
        border: ${borders.width.thin} solid ${colors.border.primary};
        border-radius: ${borders.radius.lg};
        padding: ${spacing.lg};
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${spacing.md};">
          <div>
            <h3 style="
              margin: 0;
              color: ${colors.primary.base};
              font-size: ${typography.fontSize.lg};
              font-weight: ${typography.fontWeight.bold};
            ">Consultation with ${specialist.name}</h3>
            <p style="
              margin: ${spacing.xs} 0 0 0;
              color: ${colors.neutral.base};
              font-size: ${typography.fontSize.sm};
            ">${specialist.specialty} • ${specialist.institution}</p>
          </div>
          <div style="
            background: ${urgencyColor}20;
            color: ${urgencyColor};
            padding: ${spacing.xs} ${spacing.sm};
            border-radius: ${borders.radius.md};
            font-size: ${typography.fontSize.xs};
            font-weight: ${typography.fontWeight.bold};
            text-transform: uppercase;
          ">${consultation.urgency}</div>
        </div>
        
        <div style="margin-bottom: ${spacing.md};">
          <h4 style="
            margin: 0 0 ${spacing.xs} 0;
            color: ${colors.info.base};
            font-size: ${typography.fontSize.sm};
            font-weight: ${typography.fontWeight.bold};
          ">Questions:</h4>
          <ul style="margin: 0; padding-left: ${spacing.lg}; color: ${colors.neutral.light};">
            ${consultation.questions.map(question => `<li style="margin-bottom: ${spacing.xs};">${question}</li>`).join('')}
          </ul>
        </div>
        
        <div style="display: flex; justify-content: between; align-items: center;">
          <div style="
            display: flex;
            align-items: center;
            gap: ${spacing.sm};
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.sm};
          ">
            <span>⏱️</span>
            <span>Estimated response: ${timeRemainingMinutes} minutes</span>
          </div>
          <div style="
            width: 20px;
            height: 20px;
            border: 2px solid ${colors.primary.base};
            border-top: 2px solid transparent;
            border-radius: ${borders.radius.full};
            animation: spin 1s linear infinite;
          "></div>
        </div>
      </div>
    `
  }

  private renderConsultationHistory(container: HTMLElement): void {
    if (this.consultationHistory.length === 0) {
      container.innerHTML = `
        <div style="
          text-align: center;
          padding: ${spacing['3xl']};
          color: ${colors.neutral.base};
        ">
          <div style="font-size: ${typography.fontSize['3xl']}; margin-bottom: ${spacing.lg};">📋</div>
          <h3 style="margin: 0 0 ${spacing.sm} 0; color: ${colors.neutral.light};">No Consultation History</h3>
          <p style="margin: 0;">Your completed consultations will appear here.</p>
        </div>
      `
      return
    }

    const historyHtml = this.consultationHistory
      .map(response => this.createHistoryCard(response))
      .join('')

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: ${spacing.lg};">
        ${historyHtml}
      </div>
    `
  }

  private createHistoryCard(response: ConsultationResponse): string {
    const date = new Date(response.responseTime).toLocaleDateString()
    const confidenceColor = response.confidence > 0.8 ? colors.primary.base : 
                           response.confidence > 0.6 ? colors.accent.base : colors.error.base

    return `
      <div style="
        background: ${colors.background.gradient.primary};
        border: ${borders.width.thin} solid ${colors.border.primary};
        border-radius: ${borders.radius.lg};
        padding: ${spacing.lg};
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${spacing.md};">
          <div>
            <h3 style="
              margin: 0;
              color: ${colors.primary.base};
              font-size: ${typography.fontSize.lg};
              font-weight: ${typography.fontWeight.bold};
            ">${response.specialist.name}</h3>
            <p style="
              margin: ${spacing.xs} 0 0 0;
              color: ${colors.neutral.base};
              font-size: ${typography.fontSize.sm};
            ">${response.specialist.specialty} • ${date}</p>
          </div>
          <div style="
            background: ${confidenceColor}20;
            color: ${confidenceColor};
            padding: ${spacing.xs} ${spacing.sm};
            border-radius: ${borders.radius.md};
            font-size: ${typography.fontSize.xs};
            font-weight: ${typography.fontWeight.bold};
          ">${Math.round(response.confidence * 100)}% Confidence</div>
        </div>
        
        <div style="margin-bottom: ${spacing.md};">
          <h4 style="
            margin: 0 0 ${spacing.xs} 0;
            color: ${colors.info.base};
            font-size: ${typography.fontSize.sm};
            font-weight: ${typography.fontWeight.bold};
          ">Recommendations:</h4>
          <ul style="margin: 0; padding-left: ${spacing.lg}; color: ${colors.neutral.light};">
            ${response.recommendations.map(rec => `<li style="margin-bottom: ${spacing.xs};">${rec}</li>`).join('')}
          </ul>
        </div>
        
        ${response.additionalTests.length > 0 ? `
          <div style="margin-bottom: ${spacing.md};">
            <h4 style="
              margin: 0 0 ${spacing.xs} 0;
              color: ${colors.accent.base};
              font-size: ${typography.fontSize.sm};
              font-weight: ${typography.fontWeight.bold};
            ">Additional Tests:</h4>
            <div style="display: flex; flex-wrap: wrap; gap: ${spacing.xs};">
              ${response.additionalTests.map(test => `
                <span style="
                  background: ${colors.background.accentGlow};
                  color: ${colors.accent.base};
                  padding: ${spacing.xs} ${spacing.sm};
                  border-radius: ${borders.radius.md};
                  font-size: ${typography.fontSize.xs};
                ">${test}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${response.notes ? `
          <div>
            <h4 style="
              margin: 0 0 ${spacing.xs} 0;
              color: ${colors.neutral.base};
              font-size: ${typography.fontSize.sm};
              font-weight: ${typography.fontWeight.bold};
            ">Notes:</h4>
            <p style="
              margin: 0;
              color: ${colors.neutral.light};
              font-size: ${typography.fontSize.sm};
              line-height: ${typography.lineHeight.relaxed};
            ">${response.notes}</p>
          </div>
        ` : ''}
      </div>
    `
  }

  private createFooter(): void {
    if (!this.container) return

    const footer = document.createElement('div')
    footer.style.cssText = `
      margin-top: ${spacing.lg};
      padding-top: ${spacing.md};
      border-top: ${borders.width.thin} solid ${colors.border.primary};
      display: flex;
      justify-content: space-between;
      align-items: center;
    `

    footer.innerHTML = `
      <div style="
        color: ${colors.neutral.base};
        font-size: ${typography.fontSize.xs};
      ">
        Secure consultation platform • HIPAA compliant
      </div>
      <div style="
        display: flex;
        gap: ${spacing.md};
      ">
        <button style="
          background: transparent;
          color: ${colors.neutral.base};
          border: ${borders.width.thin} solid ${colors.border.neutral};
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          transition: all 0.3s ease;
        ">Help</button>
        <button style="
          background: ${colors.primary.base};
          color: ${colors.neutral.black};
          border: none;
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm} ${spacing.md};
          cursor: pointer;
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.bold};
          transition: all 0.3s ease;
        ">Emergency Consultation</button>
      </div>
    `

    this.container.appendChild(footer)
  }

  /**
   * Initiate consultation with specialist
   */
  public initiateConsultation(specialistId: string): void {
    const specialist = this.specialists.get(specialistId)
    if (!specialist || specialist.availability !== 'available') {
      console.warn('Specialist not available for consultation')
      return
    }

    const consultation: ConsultationRequest = {
      id: `consultation_${Date.now()}`,
      specialistId,
      patientCase: {}, // Would be populated with actual case data
      urgency: 'routine',
      findings: ['TMJ dysfunction suspected', 'Joint clicking observed'],
      questions: [
        'What additional imaging would you recommend?',
        'Are there specific treatment protocols for this condition?',
        'What are the differential diagnoses to consider?'
      ],
      requestTime: Date.now(),
      estimatedResponseTime: specialist.responseTime * 60 * 1000
    }

    this.activeConsultations.set(consultation.id, consultation)
    
    // Switch to consultation view
    this.currentView = 'consultation'
    this.updateNavigation()
    this.updateContentArea()

    // Simulate consultation response
    setTimeout(() => {
      this.simulateConsultationResponse(consultation)
    }, specialist.responseTime * 60 * 1000)

    console.log(`🏥 Consultation initiated with ${specialist.name}`)
  }

  private simulateConsultationResponse(request: ConsultationRequest): void {
    const specialist = this.specialists.get(request.specialistId)
    if (!specialist) return

    const response: ConsultationResponse = {
      id: `response_${Date.now()}`,
      requestId: request.id,
      specialist,
      recommendations: [
        'Consider MRI of TMJ to evaluate disc position and joint morphology',
        'Recommend conservative treatment with occlusal splint therapy',
        'Physical therapy focusing on jaw exercises and posture correction',
        'NSAIDs for pain management if not contraindicated'
      ],
      additionalTests: ['MRI TMJ', 'Occlusal Analysis', 'Bite Registration'],
      followUpRequired: true,
      confidence: 0.85,
      responseTime: Date.now(),
      notes: 'Based on the clinical presentation, TMJ dysfunction is highly likely. The conservative approach should be tried first before considering more invasive interventions.'
    }

    // Move from active to history
    this.activeConsultations.delete(request.id)
    this.consultationHistory.unshift(response)

    // Update UI if currently viewing consultations
    if (this.currentView === 'consultation') {
      this.updateContentArea()
    }

    console.log(`🏥 Consultation response received from ${specialist.name}`)
  }

  /**
   * Get consultation status
   */
  public getConsultationStatus(): any {
    return {
      activeConsultations: this.activeConsultations.size,
      completedConsultations: this.consultationHistory.length,
      availableSpecialists: Array.from(this.specialists.values()).filter(s => s.availability === 'available').length
    }
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    this.hide()
    this.specialists.clear()
    this.activeConsultations.clear()
    this.consultationHistory.length = 0
    
    console.log('🏥 Enhanced Consultation UI destroyed')
  }
}