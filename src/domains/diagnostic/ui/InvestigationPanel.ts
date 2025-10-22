/**
 * Investigation Panel - Unified UI for investigation, evidence, and diagnosis
 * MODULAR: Single component replacing scattered UI elements
 * CLEAN: Clear separation of tabs and state
 * ENHANCEMENT FIRST: Integrates with existing DiagnosticUIManager
 * AGGRESSIVE CONSOLIDATION: Replaces multiple fragmented components
 */

import { colors, spacing, typography, borders, effects, zIndex } from '../../../styles/design-tokens'
import { MEDICAL_CONDITIONS } from '../../medical/medical-data'

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
      width: 80%;
      max-width: 800px;
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

      <div class="panel-tabs" style="${this.getTabsStyles()}">
        <button id="tab-tools" class="panel-tab ${this.activeTab === 'tools' ? 'active' : ''}" style="${this.getTabButtonStyles(this.activeTab === 'tools')}">
          Investigation Tools
        </button>
        <button id="tab-evidence" class="panel-tab ${this.activeTab === 'evidence' ? 'active' : ''}" style="${this.getTabButtonStyles(this.activeTab === 'evidence')}">
          Evidence Board ${this.evidence.length > 0 ? `(${this.evidence.length})` : ''}
        </button>
        <button id="tab-diagnosis" class="panel-tab ${this.activeTab === 'diagnosis' ? 'active' : ''}" style="${this.getTabButtonStyles(this.activeTab === 'diagnosis')}" ${!this.readyToDiagnose ? 'disabled' : ''}>
          ${this.readyToDiagnose ? '✓' : '🔒'} Ready to Diagnose
        </button>
      </div>

      <div class="panel-content" style="${this.getContentStyles()}">
        ${this.renderTabContent()}
      </div>
    `
  }

  private renderTabContent(): string {
    switch (this.activeTab) {
      case 'tools':
        return this.renderToolsTab()
      case 'evidence':
        return this.renderEvidenceTab()
      case 'diagnosis':
        return this.renderDiagnosisTab()
      default:
        return ''
    }
  }

  private renderToolsTab(): string {
    const toolsList = Array.from(this.tools.values()).map(tool => `
      <div class="investigation-tool" style="${this.getToolStyles(tool.status)}" data-tool-id="${tool.id}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: ${typography.fontWeight.bold}; font-size: ${typography.fontSize.base}; margin-bottom: ${spacing.xs};">
              ${tool.icon} ${tool.name}
              ${tool.status === 'complete' ? '✓' : tool.status === 'in_progress' ? '⏳' : ''}
              ${tool.premium ? '🔒' : ''}
            </div>
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">
              ${tool.description}
            </div>
          </div>
          <button class="tool-action-btn" data-tool-id="${tool.id}" style="${this.getToolButtonStyles(tool.status)}">
            ${this.getToolButtonLabel(tool)}
          </button>
        </div>
      </div>
    `).join('')

    return `
      <div class="tools-grid">
        ${toolsList}
      </div>
    `
  }

  private renderEvidenceTab(): string {
    if (this.evidence.length === 0) {
      return `
        <div style="text-align: center; padding: ${spacing.xl}; color: ${colors.neutral.base};">
          <div style="font-size: ${typography.fontSize.lg}; margin-bottom: ${spacing.sm};">💡</div>
          <div>No evidence collected yet</div>
          <div style="font-size: ${typography.fontSize.sm}; margin-top: ${spacing.xs};">
            Use investigation tools to gather information
          </div>
        </div>
      `
    }

    // Group evidence by source
    const groupedEvidence = this.groupEvidenceBySource()
    const sections = Object.entries(groupedEvidence).map(([source, items]) => `
      <div class="evidence-section" style="margin-bottom: ${spacing.md};">
        <div style="font-weight: ${typography.fontWeight.bold}; color: ${colors.accent.base}; margin-bottom: ${spacing.sm}; text-transform: capitalize;">
          ${this.getSourceIcon(source)} From ${source} (${items.length} items)
        </div>
        ${items.map(item => `
          <div class="evidence-item" style="${this.getEvidenceItemStyles(item.abnormal)}">
            ${item.abnormal ? '🚨 ' : ''}${item.content}
          </div>
        `).join('')}
      </div>
    `).join('')

    return `
      <div class="evidence-board">
        ${sections}
        ${this.renderPatternRecognition()}
      </div>
    `
  }

  private renderPatternRecognition(): string {
    if (this.evidence.length < 3) return ''

    const confidence = Math.min((this.evidence.length / 8) * 100, 85)
    const confidenceBars = Math.floor(confidence / 10)

    return `
      <div style="margin-top: ${spacing.lg}; padding: ${spacing.md}; background: ${colors.background.primaryGlow}; border-radius: ${borders.radius.md}; border: ${borders.width.thin} solid ${colors.border.primary};">
        <div style="font-weight: ${typography.fontWeight.bold}; color: ${colors.primary.base}; margin-bottom: ${spacing.sm};">
          💡 Pattern Recognition
        </div>
        <div style="font-size: ${typography.fontSize.sm}; margin-bottom: ${spacing.xs};">
          Based on collected evidence, diagnosis confidence:
        </div>
        <div style="display: flex; align-items: center; gap: ${spacing.sm};">
          <div style="flex: 1; height: 8px; background: ${colors.background.panel}; border-radius: ${borders.radius.full};">
            <div style="width: ${confidence}%; height: 100%; background: ${colors.primary.base}; border-radius: ${borders.radius.full};"></div>
          </div>
          <span style="font-weight: ${typography.fontWeight.bold}; color: ${colors.primary.base};">
            ${Math.floor(confidence)}%
          </span>
        </div>
      </div>
    `
  }

  private renderDiagnosisTab(): string {
    if (!this.readyToDiagnose) {
      return `
        <div style="text-align: center; padding: ${spacing.xl}; color: ${colors.neutral.base};">
          <div style="font-size: ${typography.fontSize.lg}; margin-bottom: ${spacing.sm};">🔒</div>
          <div style="font-weight: ${typography.fontWeight.bold}; margin-bottom: ${spacing.xs};">
            Diagnosis Not Yet Available
          </div>
          <div style="font-size: ${typography.fontSize.sm};">
            Complete at least 3 investigations and collect evidence to unlock
          </div>
        </div>
      `
    }

    // ENHANCEMENT: Populate with discovered conditions from game state
    const conditionsHTML = Array.from(this.discoveredConditions).map(conditionId => {
      const condition = MEDICAL_CONDITIONS.find(c => c.id === conditionId)
      if (!condition) return ''
      
      return `
        <div style="
          padding: ${spacing.md};
          margin-bottom: ${spacing.sm};
          background: ${colors.background.panelLight};
          border: ${borders.width.thin} solid ${colors.border.primary};
          border-radius: ${borders.radius.md};
          display: flex;
          align-items: center;
          gap: ${spacing.md};
        ">
          <input 
            type="checkbox" 
            name="diagnosis" 
            value="${condition.id}"
            id="diagnosis_${condition.id}"
            style="width: 20px; height: 20px; cursor: pointer;"
          />
          <label for="diagnosis_${condition.id}" style="flex: 1; cursor: pointer;">
            <div style="font-weight: ${typography.fontWeight.bold}; color: ${colors.primary.base};">
              ${condition.name}
            </div>
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base}; margin-top: ${spacing.xs};">
              ${condition.description}
            </div>
          </label>
          <span style="
            padding: ${spacing.xs} ${spacing.sm};
            background: ${this.getSeverityColor(condition.severity)};
            border-radius: ${borders.radius.sm};
            font-size: ${typography.fontSize.xs};
            font-weight: ${typography.fontWeight.bold};
            color: ${colors.neutral.black};
          ">
            ${condition.severity.toUpperCase()}
          </span>
        </div>
      `
    }).join('')

    return `
      <div class="diagnosis-form">
        <div style="margin-bottom: ${spacing.md}; color: ${colors.neutral.light};">
          ${this.discoveredConditions.size > 0 
            ? `Select all conditions that apply based on your investigation (${this.discoveredConditions.size} discovered):`
            : 'Scan the patient to discover conditions before diagnosing.'}
        </div>
        <div id="diagnosis-conditions-list" style="max-height: 400px; overflow-y: auto;">
          ${conditionsHTML || '<div style="text-align: center; padding: ${spacing.md}; color: ${colors.neutral.base};">No conditions discovered yet. Continue scanning and investigating.</div>'}
        </div>
        <div style="display: flex; gap: ${spacing.md}; margin-top: ${spacing.lg};">
          <button id="review-evidence-btn" style="${this.getSecondaryButtonStyles()}">
            📋 Review All Evidence
          </button>
          <button id="submit-diagnosis-btn" style="${this.getPrimaryButtonStyles()}" ${this.discoveredConditions.size === 0 ? 'disabled' : ''}>
            ✓ SUBMIT DIAGNOSIS
          </button>
        </div>
      </div>
    `
  }

  // Public methods for external updates
  public addEvidence(evidence: Evidence): void {
    this.evidence.push(evidence)
    this.hasNewNotifications = true
    this.updateReadyToDiagnoseState()
    
    // Flash notification when collapsed
    if (!this.isExpanded) {
      this.flashNotification()
    }
    
    this.render()
  }

  public updateToolStatus(toolId: string, status: InvestigationTool['status']): void {
    const tool = this.tools.get(toolId)
    if (tool) {
      tool.status = status
      this.updateReadyToDiagnoseState()
      this.render()
    }
  }

  public addDiscoveredCondition(conditionId: string): void {
    this.discoveredConditions.add(conditionId)
    this.updateReadyToDiagnoseState()
    this.render() // Re-render to update diagnosis tab
  }

  public setDiagnosisConditions(conditions: string[]): void {
    // This will be called by DiagnosticUIManager to populate the diagnosis tab
    const conditionsList = document.getElementById('diagnosis-conditions-list')
    if (conditionsList && conditions.length > 0) {
      // Conditions HTML will be generated by the calling code
    }
  }

  public expand(): void {
    this.isExpanded = true
    this.hasNewNotifications = false
    this.render()
  }

  public collapse(): void {
    this.isExpanded = false
    this.render()
  }

  public switchTab(tab: PanelTab): void {
    this.activeTab = tab
    this.render()
  }

  // Private helper methods
  private updateReadyToDiagnoseState(): void {
    const completedTools = Array.from(this.tools.values()).filter(t => t.status === 'complete').length
    this.readyToDiagnose = completedTools >= 3 || this.evidence.length >= 5 || this.discoveredConditions.size >= 1
  }

  private flashNotification(): void {
    if (!this.panel) return
    this.panel.classList.add('flash-notification')
    setTimeout(() => {
      this.panel?.classList.remove('flash-notification')
    }, 800)
  }

  private getCompletedCount(): number {
    return Array.from(this.tools.values()).filter(t => t.status === 'complete').length
  }

  private groupEvidenceBySource(): Record<string, Evidence[]> {
    return this.evidence.reduce((acc, item) => {
      if (!acc[item.source]) {
        acc[item.source] = []
      }
      acc[item.source].push(item)
      return acc
    }, {} as Record<string, Evidence[]>)
  }

  private getSourceIcon(source: string): string {
    const icons: Record<string, string> = {
      interview: '📋',
      labs: '🧪',
      imaging: '📷',
      physical: '🩺',
      scanning: '🔬',
      consultation: '👩‍⚕️'
    }
    return icons[source] || '📌'
  }

  private getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
    const severityColors: Record<string, string> = {
      low: colors.accent.base,
      medium: '#ffaa00',
      high: '#ff6b6b'
    }
    return severityColors[severity] || colors.neutral.base
  }

  private getToolButtonLabel(tool: InvestigationTool): string {
    switch (tool.status) {
      case 'complete':
        return 'VIEW RESULTS'
      case 'in_progress':
        return 'IN PROGRESS...'
      default:
        return tool.id === 'scanning' ? 'ACTIVE' : 'START'
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.panel) return

    const expandBtn = this.panel.querySelector('#expand-panel-btn')
    const collapseBtn = this.panel.querySelector('#collapse-panel-btn')
    const tabButtons = this.panel.querySelectorAll('.panel-tab')
    const toolButtons = this.panel.querySelectorAll('.tool-action-btn')
    const reviewBtn = this.panel.querySelector('#review-evidence-btn')
    const submitBtn = this.panel.querySelector('#submit-diagnosis-btn')

    expandBtn?.addEventListener('click', () => this.expand())
    collapseBtn?.addEventListener('click', () => this.collapse())

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.id.replace('tab-', '') as PanelTab
        this.switchTab(tab)
      })
    })

    toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const toolId = (btn as HTMLElement).dataset.toolId
        if (toolId) {
          // Handle special mystery tools
          if (toolId === 'conversation' && this.config.onPatientConversation) {
            this.config.onPatientConversation()
          } else if (toolId === 'treatment' && this.config.onTreatmentOptions) {
            this.config.onTreatmentOptions()
          } else {
            this.config.onInvestigationClick(toolId)
          }
        }
      })
    })

    reviewBtn?.addEventListener('click', () => {
      this.switchTab('evidence')
      this.config.onEvidenceReview()
    })

    submitBtn?.addEventListener('click', () => {
      // Get selected conditions and submit
      const checkboxes = this.panel?.querySelectorAll('input[name="diagnosis"]:checked') as NodeListOf<HTMLInputElement>
      const selectedConditions = Array.from(checkboxes).map(cb => cb.value)
      this.config.onDiagnosisSubmit(selectedConditions)
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
      padding: ${spacing.xs} ${spacing.md};
    `
  }

  private getTabButtonStyles(isActive: boolean): string {
    return `
      background: ${isActive ? colors.background.primaryGlow : 'transparent'};
      color: ${isActive ? colors.primary.base : colors.neutral.base};
      border: ${borders.width.thin} solid ${isActive ? colors.border.primary : 'transparent'};
      padding: ${spacing.sm} ${spacing.md};
      border-radius: ${borders.radius.md};
      cursor: pointer;
      font-size: ${typography.fontSize.sm};
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
      padding: ${spacing.md};
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
      padding: ${spacing.md};
      margin-bottom: ${spacing.sm};
      transition: all 0.2s ease;
    `
  }

  private getToolButtonStyles(status: InvestigationTool['status']): string {
    const isDisabled = status === 'in_progress'
    return `
      background: ${isDisabled ? colors.background.panelLight : colors.accent.base};
      color: ${colors.neutral.black};
      border: none;
      padding: ${spacing.sm} ${spacing.md};
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

      .panel-tab:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .investigation-tool:hover {
        border-color: ${colors.border.primary};
        box-shadow: ${effects.shadow.sm};
      }

      .tool-action-btn:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: ${effects.shadow.sm};
      }

      .notification-badge {
        background: ${colors.accent.base};
        color: ${colors.neutral.black};
        padding: 2px 8px;
        border-radius: ${borders.radius.full};
        font-size: ${typography.fontSize.xs};
        font-weight: ${typography.fontWeight.bold};
        margin-left: ${spacing.xs};
      }

      @keyframes flashNotification {
        0%, 100% {
          box-shadow: ${effects.shadow.md};
        }
        50% {
          box-shadow: 0 0 30px ${colors.primary.base}, 0 0 60px ${colors.primary.base};
          border-color: ${colors.primary.base};
        }
      }

      .flash-notification {
        animation: flashNotification 0.8s ease-in-out;
      }
    `
    document.head.appendChild(style)
  }

  destroy(): void {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel)
    }
    this.panel = null
  }
}
