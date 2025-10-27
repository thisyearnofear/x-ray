/**
 * Investigation Panel - Unified UI for investigation, evidence, and diagnosis
 * MODULAR: Single component replacing scattered UI elements
 * CLEAN: Clear separation of tabs and state
 * ENHANCEMENT FIRST: Integrates with existing DiagnosticUIManager
 * AGGRESSIVE CONSOLIDATION: Replaces multiple fragmented components
 * ENHANCEMENT: Integrated treatment outcome predictions
 */

import { colors, spacing, typography, borders, effects, zIndex } from '../../../styles/design-tokens'
import { MEDICAL_CONDITIONS } from '../../medical/medical-data'
import { OutcomePredictor } from '../../medical/services/OutcomePredictor'
import { DiagnosticConfidence } from '../../medical/services/DiagnosticConfidence'

export interface Evidence {
  id: string
  source: 'interview' | 'labs' | 'imaging' | 'physical' | 'scanning' | 'consultation'
  content: string
  abnormal: boolean
  timestamp: number
  relatedCondition?: string
}

export interface InvestigationTool {
  id: string
  name: string
  icon: string
  description: string
  status: 'available' | 'in_progress' | 'complete'
  premium: boolean
}

export interface InvestigationPanelConfig {
  onInvestigationClick: (toolId: string) => void
  onDiagnosisSubmit: (selectedConditions: string[]) => void
  onEvidenceReview: () => void
  onPatientConversation?: () => void
  onTreatmentOptions?: () => void
  onShowTreatmentMenu?: () => void // New callback for showing TreatmentMenu
}

type PanelTab = 'tools' | 'evidence' | 'diagnosis'

export class InvestigationPanel {
  private panel: HTMLElement | null = null
  private config: InvestigationPanelConfig
  private isExpanded: boolean = false
  private activeTab: PanelTab = 'tools'
  private evidence: Evidence[] = []
  private tools: Map<string, InvestigationTool> = new Map()
  private hasNewNotifications: boolean = false
  private discoveredConditions: Set<string> = new Set()
  private readyToDiagnose: boolean = false

  constructor(config: InvestigationPanelConfig) {
    this.config = config
    this.initializeTools()
  }

  private initializeTools(): void {
    this.tools.set('interview', {
      id: 'interview',
      name: 'Patient Interview',
      icon: '💬',
      description: 'Get detailed patient history and symptoms',
      status: 'available',
      premium: false
    })

    this.tools.set('labs', {
      id: 'labs',
      name: 'Laboratory Tests',
      icon: '🧪',
      description: 'Order CBC, CMP, inflammatory markers',
      status: 'available',
      premium: false
    })

    this.tools.set('imaging', {
      id: 'imaging',
      name: 'Medical Imaging',
      icon: '📷',
      description: 'Request X-rays, CT, MRI scans',
      status: 'available',
      premium: false
    })

    this.tools.set('physical', {
      id: 'physical',
      name: 'Physical Examination',
      icon: '🩺',
      description: 'Palpation, auscultation, range of motion',
      status: 'available',
      premium: false
    })

    this.tools.set('scanning', {
      id: 'scanning',
      name: '3D Body Scan',
      icon: '🔬',
      description: 'Currently viewing - hover over areas to scan',
      status: 'in_progress',
      premium: false
    })

    this.tools.set('consultation', {
      id: 'consultation',
      name: 'AI Consultation',
      icon: '👩‍⚕️',
      description: 'Get AI-powered clinical guidance',
      status: 'available',
      premium: true
    })

    // MYSTERY ELEMENTS: Add conversation and treatment tools
    this.tools.set('conversation', {
      id: 'conversation',
      name: 'Patient Interview',
      icon: '💬',
      description: 'Talk to patient to learn about symptoms',
      status: 'available',
      premium: false
    })

    this.tools.set('treatment', {
      id: 'treatment',
      name: 'Treatment Options',
      icon: '💊',
      description: 'Administer treatments with risk/reward',
      status: 'available',
      premium: false
    })
  }

  create(): HTMLElement {
    this.panel = document.createElement('div')
    this.panel.id = 'investigation-panel'
    this.panel.className = 'investigation-panel'
    this.panel.style.cssText = this.getPanelStyles()

    this.render()
    this.addStyles()
    return this.panel
  }

  private getPanelStyles(): string {
    return `
      position: fixed;
      top: ${spacing.lg};
      left: 50%;
      transform: translateX(-50%);
      width: 70%;
      max-width: 650px;
      z-index: ${zIndex.panel};
      transition: all 0.3s ease;
    `
  }

  private render(): void {
    if (!this.panel) return

    this.panel.innerHTML = this.isExpanded 
      ? this.renderExpanded() 
      : this.renderCollapsed()
      
    this.setupEventListeners()
  }

  private renderCollapsed(): string {
    const completedCount = Array.from(this.tools.values()).filter(t => t.status === 'complete').length
    const totalCount = this.tools.size
    const notificationBadge = this.hasNewNotifications ? `<span class="notification-badge">✨${this.evidence.length} NEW</span>` : ''

    return `
      <div class="panel-header-collapsed" style="${this.getCollapsedHeaderStyles()}">
        <span style="font-weight: ${typography.fontWeight.bold}; color: ${colors.primary.base};">
          🔍 INVESTIGATION PANEL
        </span>
        <span style="color: ${colors.neutral.base}; font-size: ${typography.fontSize.sm};">
          [${completedCount}/${totalCount} Tools] ${notificationBadge}
        </span>
        <button id="expand-panel-btn" style="${this.getToggleButtonStyles()}">
          ▼ Expand
        </button>
      </div>
    `
  }

  private renderExpanded(): string {
    return `
      <div class="panel-header-expanded" style="${this.getExpandedHeaderStyles()}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: ${typography.fontWeight.bold}; color: ${colors.primary.base}; font-size: ${typography.fontSize.lg};">
            🔍 INVESTIGATION PANEL
          </span>
          <div style="display: flex; gap: ${spacing.sm}; align-items: center;">
            <span style="color: ${colors.neutral.base}; font-size: ${typography.fontSize.sm};">
              ${this.getCompletedCount()}/${this.tools.size} Complete
            </span>
            <button id="collapse-panel-btn" style="${this.getToggleButtonStyles()}">
              ▲ Collapse
            </button>
          </div>
        </div>
      </div>
      
      <div style="${this.getTabsStyles()}">
        <button class="panel-tab" data-tab="tools" style="${this.getTabButtonStyles(this.activeTab === 'tools')}">Tools</button>
        <button class="panel-tab" data-tab="evidence" style="${this.getTabButtonStyles(this.activeTab === 'evidence')}">Evidence (${this.evidence.length})</button>
        <button class="panel-tab" data-tab="diagnosis" style="${this.getTabButtonStyles(this.activeTab === 'diagnosis')}">Diagnosis</button>
      </div>
      
      <div style="${this.getContentStyles()}">
        ${this.renderActiveTab()}
      </div>
    `
  }

  private renderActiveTab(): string {
    switch (this.activeTab) {
      case 'tools':
        return this.renderToolsTab()
      case 'evidence':
        return this.renderEvidenceTab()
      case 'diagnosis':
        return this.renderDiagnosisTab()
      default:
        return this.renderToolsTab()
    }
  }

  private renderToolsTab(): string {
    const tools = Array.from(this.tools.values())
    const availableTools = tools.filter(t => t.status === 'available')
    const inProgressTools = tools.filter(t => t.status === 'in_progress')
    const completedTools = tools.filter(t => t.status === 'complete')

    return `
      <div style="margin-bottom: ${spacing.md};">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: ${spacing.sm};">
          ${tools.map(tool => `
            <button 
              class="tool-button" 
              data-tool-id="${tool.id}"
              style="${this.getToolStyles(tool.status)}"
              ${tool.status === 'in_progress' ? 'disabled' : ''}
            >
              <div style="font-size: 24px; margin-bottom: ${spacing.xs};">${tool.icon}</div>
              <div style="font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.xs}; margin-bottom: ${spacing.xs};">${tool.name}</div>
              <div style="font-size: ${typography.fontSize.xs}; opacity: 0.8;">${tool.description}</div>
              ${tool.premium ? `<div style="position: absolute; top: ${spacing.xs}; right: ${spacing.xs}; font-size: ${typography.fontSize.xs};">⭐</div>` : ''}
            </button>
          `).join('')}
        </div>
      </div>
      
      ${this.hasNewNotifications ? `
        <div style="background: ${colors.background.accentGlow}; border: 1px solid ${colors.border.accent}; border-radius: ${borders.radius.md}; padding: ${spacing.sm}; margin-top: ${spacing.md};">
          <div style="display: flex; align-items: center; gap: ${spacing.xs};">
            <span>✨</span>
            <span style="font-weight: ${typography.fontWeight.bold};">New Evidence Available</span>
          </div>
          <div style="font-size: ${typography.fontSize.xs}; margin-top: ${spacing.xs};">Review your findings in the Evidence tab</div>
        </div>
      ` : ''}
    `
  }

  private renderEvidenceTab(): string {
    if (this.evidence.length === 0) {
      return `
        <div style="text-align: center; padding: ${spacing.xl}; color: ${colors.neutral.base};">
          <div style="font-size: 3rem; margin-bottom: ${spacing.md};">📋</div>
          <div style="font-weight: ${typography.fontWeight.bold}; margin-bottom: ${spacing.sm};">No Evidence Collected</div>
          <div style="font-size: ${typography.fontSize.sm};">Use investigation tools to gather medical evidence</div>
        </div>
      `
    }

    const abnormalEvidence = this.evidence.filter(e => e.abnormal)
    const normalEvidence = this.evidence.filter(e => !e.abnormal)

    return `
      <div>
        ${abnormalEvidence.length > 0 ? `
          <div style="margin-bottom: ${spacing.md};">
            <div style="font-weight: ${typography.fontWeight.bold}; color: ${colors.error.base}; margin-bottom: ${spacing.sm}; display: flex; align-items: center; gap: ${spacing.xs};">
              <span>⚠️</span>
              <span>Abnormal Findings (${abnormalEvidence.length})</span>
            </div>
            ${abnormalEvidence.map(evidence => `
              <div style="${this.getEvidenceItemStyles(true)}">
                <div style="font-weight: ${typography.fontWeight.semibold};">${evidence.content}</div>
                <div style="font-size: ${typography.fontSize.xs}; opacity: 0.8; margin-top: ${spacing.xs};">Source: ${evidence.source} • ${new Date(evidence.timestamp).toLocaleTimeString()}</div>
                ${evidence.relatedCondition ? `<div style="font-size: ${typography.fontSize.xs}; color: ${colors.accent.base}; margin-top: ${spacing.xs};">Related to: ${evidence.relatedCondition}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${normalEvidence.length > 0 ? `
          <div>
            <div style="font-weight: ${typography.fontWeight.bold}; color: ${colors.primary.base}; margin-bottom: ${spacing.sm};">Normal Findings (${normalEvidence.length})</div>
            ${normalEvidence.map(evidence => `
              <div style="${this.getEvidenceItemStyles(false)}">
                <div>${evidence.content}</div>
                <div style="font-size: ${typography.fontSize.xs}; opacity: 0.8; margin-top: ${spacing.xs};">Source: ${evidence.source} • ${new Date(evidence.timestamp).toLocaleTimeString()}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `
  }

  private renderDiagnosisTab(): string {
    const canDiagnose = this.readyToDiagnose || this.discoveredConditions.size > 0
    
    return `
      <div>
        <div style="margin-bottom: ${spacing.md};">
          <div style="font-weight: ${typography.fontWeight.bold}; margin-bottom: ${spacing.sm};">Discovered Conditions</div>
          ${this.discoveredConditions.size > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: ${spacing.xs};">
              ${Array.from(this.discoveredConditions).map(condition => `
                <div style="background: ${colors.background.primaryGlow}; border: 1px solid ${colors.border.primary}; border-radius: ${borders.radius.md}; padding: ${spacing.xs} ${spacing.sm}; font-size: ${typography.fontSize.xs};">
                  ${condition}
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="color: ${colors.neutral.base}; font-style: italic;">No conditions discovered yet</div>
          `}
        </div>
        
        <div style="margin-bottom: ${spacing.md};">
          <div style="font-weight: ${typography.fontWeight.bold}; margin-bottom: ${spacing.sm};">Treatment Recommendations</div>
          ${canDiagnose ? `
            <div style="background: ${colors.background.infoGlow}; border: 1px solid ${colors.border.info}; border-radius: ${borders.radius.md}; padding: ${spacing.md};">
              <div style="display: flex; align-items: center; gap: ${spacing.xs}; margin-bottom: ${spacing.sm};">
                <span>💡</span>
                <span style="font-weight: ${typography.fontWeight.bold};">AI-Powered Treatment Suggestions</span>
              </div>
              <div style="font-size: ${typography.fontSize.sm}; margin-bottom: ${spacing.sm};">
                Based on your findings, the AI recommends specific treatments with predicted outcomes.
              </div>
              <button id="show-treatment-menu" style="${this.getPrimaryButtonStyles()}">
                View Treatment Options
              </button>
            </div>
          ` : `
            <div style="color: ${colors.neutral.base}; font-style: italic;">
              Gather more evidence before treatment recommendations can be provided
            </div>
          `}
        </div>
        
        ${canDiagnose ? `
          <div>
            <div style="font-weight: ${typography.fontWeight.bold}; margin-bottom: ${spacing.sm};">Submit Diagnosis</div>
            <div style="background: ${colors.background.accentGlow}; border: 1px solid ${colors.border.accent}; border-radius: ${borders.radius.md}; padding: ${spacing.md}; margin-bottom: ${spacing.md};">
              <div style="font-size: ${typography.fontSize.sm}; margin-bottom: ${spacing.sm};">
                Ready to submit your diagnosis? Review all evidence and select the most likely conditions.
              </div>
              <button id="submit-diagnosis" style="${this.getPrimaryButtonStyles()}">
                Submit Diagnosis
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `
  }

  private setupEventListeners(): void {
    if (!this.panel) return

    // Expand/Collapse buttons
    const expandBtn = this.panel.querySelector('#expand-panel-btn')
    const collapseBtn = this.panel.querySelector('#collapse-panel-btn')
    
    expandBtn?.addEventListener('click', () => {
      this.expand()
    })
    
    collapseBtn?.addEventListener('click', () => {
      this.collapse()
    })

    // Tab switching
    const tabButtons = this.panel.querySelectorAll('.panel-tab')
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab as PanelTab
        if (tab) {
          this.switchTab(tab)
        }
      })
    })

    // Tool buttons
    const toolButtons = this.panel.querySelectorAll('.tool-button')
    toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const toolId = (btn as HTMLElement).dataset.toolId
        if (toolId) {
          // Handle special mystery tools
          if (toolId === 'conversation' && this.config.onPatientConversation) {
            this.config.onPatientConversation()
          } else if (toolId === 'treatment' && this.config.onTreatmentOptions) {
            // First try the new callback, fallback to old if not available
            if (this.config.onShowTreatmentMenu) {
              this.config.onShowTreatmentMenu()
            } else {
              this.config.onTreatmentOptions()
            }
          } else {
            this.config.onInvestigationClick(toolId)
          }
        }
      })
    })

    // Treatment menu button
    const treatmentMenuBtn = this.panel.querySelector('#show-treatment-menu')
    treatmentMenuBtn?.addEventListener('click', () => {
      if (this.config.onShowTreatmentMenu) {
        this.config.onShowTreatmentMenu()
      } else if (this.config.onTreatmentOptions) {
        this.config.onTreatmentOptions()
      }
    })

    // Submit diagnosis button
    const submitBtn = this.panel.querySelector('#submit-diagnosis')
    submitBtn?.addEventListener('click', () => {
      // For now, we'll just call the diagnosis submit callback
      // In a real implementation, we would collect selected conditions
      this.config.onDiagnosisSubmit([])
    })
  }

  // Styles
  private getCollapsedHeaderStyles(): string {
    return `
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      padding: ${spacing.sm} ${spacing.md};
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: ${spacing.md};
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: ${effects.shadow.md};
      backdrop-filter: ${effects.blur.base};
    `
  }

  private getExpandedHeaderStyles(): string {
    return `
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.primary};
      border-top-left-radius: ${borders.radius.lg};
      border-top-right-radius: ${borders.radius.lg};
      padding: ${spacing.md};
      box-shadow: ${effects.shadow.md};
      backdrop-filter: ${effects.blur.base};
    `
  }

  private getTabsStyles(): string {
    return `
      display: flex;
      gap: ${spacing.xs};
      background: ${colors.background.panel};
      border-left: ${borders.width.base} solid ${colors.border.primary};
      border-right: ${borders.width.base} solid ${colors.border.primary};
      padding: ${spacing.xs} ${spacing.sm};
    `
  }

  private getTabButtonStyles(isActive: boolean): string {
    return `
      background: ${isActive ? colors.background.primaryGlow : 'transparent'};
      color: ${isActive ? colors.primary.base : colors.neutral.base};
      border: ${borders.width.thin} solid ${isActive ? colors.border.primary : 'transparent'};
      padding: ${spacing.xs} ${spacing.sm};
      border-radius: ${borders.radius.md};
      cursor: pointer;
      font-size: ${typography.fontSize.xs};
      font-weight: ${isActive ? typography.fontWeight.bold : typography.fontWeight.normal};
      transition: all 0.2s ease;
    `
  }

  private getContentStyles(): string {
    return `
      background: ${colors.background.panel};
      border: ${borders.width.base} solid ${colors.border.primary};
      border-bottom-left-radius: ${borders.radius.lg};
      border-bottom-right-radius: ${borders.radius.lg};
      padding: ${spacing.sm};
      max-height: 60vh;
      overflow-y: auto;
      box-shadow: ${effects.shadow.md};
      backdrop-filter: ${effects.blur.base};
    `
  }

  private getToolStyles(status: InvestigationTool['status']): string {
    return `
      background: ${colors.background.panelLight};
      border: ${borders.width.thin} solid ${status === 'complete' ? colors.border.primary : colors.border.neutral};
      border-radius: ${borders.radius.md};
      padding: ${spacing.sm};
      margin-bottom: ${spacing.xs};
      transition: all 0.2s ease;
      position: relative;
      cursor: ${status === 'in_progress' ? 'not-allowed' : 'pointer'};
      opacity: ${status === 'in_progress' ? 0.6 : 1};
    `
  }

  private getToolButtonStyles(status: InvestigationTool['status']): string {
    const isDisabled = status === 'in_progress'
    return `
      background: ${isDisabled ? colors.background.panelLight : colors.accent.base};
      color: ${colors.neutral.black};
      border: none;
      padding: ${spacing.xs} ${spacing.sm};
      border-radius: ${borders.radius.md};
      cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
      font-size: ${typography.fontSize.xs};
      font-weight: ${typography.fontWeight.bold};
      opacity: ${isDisabled ? 0.6 : 1};
      transition: all 0.2s ease;
    `
  }

  private getEvidenceItemStyles(abnormal: boolean): string {
    return `
      padding: ${spacing.sm} ${spacing.md};
      margin-bottom: ${spacing.xs};
      background: ${abnormal ? colors.background.errorGlow : colors.background.panelLight};
      border-left: ${borders.width.base} solid ${abnormal ? colors.error.base : colors.border.primary};
      border-radius: ${borders.radius.sm};
      font-size: ${typography.fontSize.sm};
      color: ${colors.neutral.light};
    `
  }

  private getPrimaryButtonStyles(): string {
    return `
      flex: 1;
      background: linear-gradient(135deg, ${colors.primary.base} 0%, #00cc6a 100%);
      color: ${colors.neutral.black};
      border: none;
      padding: ${spacing.md} ${spacing.lg};
      border-radius: ${borders.radius.md};
      cursor: pointer;
      font-size: ${typography.fontSize.base};
      font-weight: ${typography.fontWeight.bold};
      box-shadow: ${effects.shadow.md}, 0 0 20px rgba(0,255,136,0.3);
      transition: all 0.2s ease;
    `
  }

  private getSecondaryButtonStyles(): string {
    return `
      flex: 1;
      background: ${colors.background.panelLight};
      color: ${colors.neutral.light};
      border: ${borders.width.thin} solid ${colors.border.primary};
      padding: ${spacing.md} ${spacing.lg};
      border-radius: ${borders.radius.md};
      cursor: pointer;
      font-size: ${typography.fontSize.base};
      font-weight: ${typography.fontWeight.medium};
      transition: all 0.2s ease;
    `
  }

  private getToggleButtonStyles(): string {
    return `
      background: ${colors.background.primaryGlow};
      color: ${colors.primary.base};
      border: ${borders.width.thin} solid ${colors.border.primary};
      padding: ${spacing.xs} ${spacing.md};
      border-radius: ${borders.radius.md};
      cursor: pointer;
      font-size: ${typography.fontSize.xs};
      font-weight: ${typography.fontWeight.bold};
      transition: all 0.2s ease;
    `
  }

  private addStyles(): void {
    if (document.querySelector('#investigation-panel-styles')) return

    const style = document.createElement('style')
    style.id = 'investigation-panel-styles'
    style.textContent = `
      .investigation-panel {
        font-family: ${typography.fontFamily.primary};
      }

      .panel-header-collapsed:hover {
        border-color: ${colors.border.primary};
        box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
      }

      .panel-tab:hover:not(:disabled) {
        background: ${colors.background.primaryGlow};
        color: ${colors.primary.base};
      }

      .tool-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: ${effects.shadow.md}, ${effects.shadow.primaryGlow};
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .fade-in {
        animation: fadeIn 0.3s ease-out;
      }
    `
    document.head.appendChild(style)
  }

  // Public methods for external control
  expand(): void {
    this.isExpanded = true
    this.render()
  }

  collapse(): void {
    this.isExpanded = false
    this.render()
  }

  switchTab(tab: PanelTab): void {
    this.activeTab = tab
    const content = this.panel?.querySelector('div[style*="background:"]') // Find content div
    if (content) {
      content.innerHTML = this.renderActiveTab()
      this.setupEventListeners() // Reattach event listeners
    }
  }

  addEvidence(evidence: Evidence): void {
    this.evidence.push(evidence)
    this.hasNewNotifications = true
    if (this.isExpanded && this.activeTab === 'evidence') {
      this.switchTab('evidence') // Refresh the evidence tab
    }
  }

  markToolInProgress(toolId: string): void {
    const tool = this.tools.get(toolId)
    if (tool) {
      tool.status = 'in_progress'
      if (this.isExpanded) {
        this.render() // Re-render to update tool status
      }
    }
  }

  markToolComplete(toolId: string): void {
    const tool = this.tools.get(toolId)
    if (tool) {
      tool.status = 'complete'
      if (this.isExpanded) {
        this.render() // Re-render to update tool status
      }
    }
  }

  // Method for backward compatibility
  updateToolStatus(toolId: string, status: 'available' | 'in_progress' | 'complete'): void {
    const tool = this.tools.get(toolId)
    if (tool) {
      tool.status = status
      if (this.isExpanded) {
        this.render() // Re-render to update tool status
      }
    }
  }

  addDiscoveredCondition(condition: string): void {
    this.discoveredConditions.add(condition)
    this.readyToDiagnose = this.discoveredConditions.size >= 2 // Ready to diagnose with 2+ conditions
    if (this.isExpanded && this.activeTab === 'diagnosis') {
      this.switchTab('diagnosis') // Refresh the diagnosis tab
    }
  }

  getCompletedCount(): number {
    return Array.from(this.tools.values()).filter(t => t.status === 'complete').length
  }

  destroy(): void {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel)
    }
    this.panel = null
  }
}