/**
 * MODULAR: AI integration panel for medical consultations with voice
 * CLEAN: Single responsibility - AI consultation and voice interactions
 * ENHANCEMENT FIRST: Centralized hub for all AI-driven features
 * AGGRESSIVE CONSOLIDATION: Consolidates AI insights and voice features
 */

import { colors, spacing, typography, borders, effects, zIndex, presets } from '../../../styles/design-tokens'

export interface AIInsight {
  id: string
  timestamp: number
  content: string
  type: 'diagnostic' | 'procedural' | 'educational' | 'urgent' | 'voice'
  confidence: number
}

export interface AIPanelConfig {
  title: string
  position?: 'left' | 'right' | 'bottom' | 'top'
  width?: string
  height?: string
  maxWidth?: string
  maxHeight?: string
}

export interface VoiceCallback {
  startListening: () => void
  stopListening: () => void
  isListening: () => boolean
  onResult: (callback: (text: string) => void) => void
  onError: (callback: (error: any) => void) => void
}

export class AIPanel {
  private panel: HTMLElement | null = null
  private isExpanded: boolean = true
  private config: AIPanelConfig
  private insights: AIInsight[] = []
  private insightContainer: HTMLElement | null = null
  private voiceContainer: HTMLElement | null = null
  private isVoiceActive: boolean = false
  private voiceCallbacks: VoiceCallback | null = null
  private onVoiceResultCallbacks: Array<(text: string) => void> = []
  private onVoiceErrorCallbacks: Array<(error: any) => void> = []

  constructor(config: AIPanelConfig) {
    this.config = {
      position: 'right',
      width: '320px',
      height: 'auto',
      maxWidth: '500px',
      maxHeight: '60vh',
      ...config
    }
  }

  create(): HTMLElement {
    if (this.panel) return this.panel

    this.panel = document.createElement('div')
    this.panel.className = 'ai-panel'
    this.panel.style.cssText = this.getPanelStyles()

    this.panel.innerHTML = `
      <div class="panel-header" style="${this.getHeaderStyles()}">
        <div class="panel-title-section">
          <div class="panel-title" id="ai-panel-title">🤖 AI Consultation</div>
          <div class="panel-subtitle" id="ai-panel-subtitle">Powered by Medical AI</div>
        </div>
        <div class="expand-toggle" id="expand-toggle" style="
          font-size: ${typography.fontSize.lg}; 
          color: ${colors.primary.base}; 
          cursor: pointer; 
          padding: ${spacing.sm}; 
          border-radius: ${borders.radius.full}; 
          background: ${colors.background.primaryGlow}; 
          transition: all 0.3s ease;
        ">
          ${this.isExpanded ? '▲' : '▼'}
        </div>
      </div>
      <div class="panel-content" style="padding: ${spacing.base}; ${this.isExpanded ? '' : 'display: none;'}">
        <div class="voice-control-section" id="voice-control-section" style="
          background: ${colors.background.panelLight};
          border-radius: ${borders.radius.lg};
          padding: ${spacing.md};
          margin-bottom: ${spacing.md};
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: ${borders.width.thin} solid ${colors.border.primary};
        ">
          <div>
            <div style="
              font-size: ${typography.fontSize.sm};
              font-weight: ${typography.fontWeight.bold};
              color: ${colors.neutral.light};
              margin-bottom: ${spacing.xs};
            ">Voice Command</div>
            <div style="
              font-size: ${typography.fontSize.xs};
              color: ${colors.neutral.base};
            ">Speak to interact with the AI</div>
          </div>
          <button id="voice-toggle-btn" style="
            background: ${colors.accent.base};
            color: ${colors.neutral.black};
            border: ${borders.width.base} solid ${colors.border.accent};
            padding: ${spacing.sm} ${spacing.md};
            border-radius: ${borders.radius.full};
            cursor: pointer;
            font-size: ${typography.fontSize.sm};
            font-weight: ${typography.fontWeight.bold};
            transition: all 0.3s ease;
            ${effects.inset.medium}
          ">${this.isVoiceActive ? '🔴 Listening...' : '🎤 Activate'}</button>
        </div>
        
        <div class="insights-container" id="insights-container" style="${this.getContentStyles()}">
          <div class="insight-placeholder" id="insight-placeholder" style="
            text-align: center; 
            padding: ${spacing.xl}; 
            color: ${colors.neutral.medium}; 
            font-style: italic;
          ">
            <div style="font-size: ${typography.fontSize.lg}; margin-bottom: ${spacing.sm};">💡</div>
            <div>No insights yet. Consult the AI for diagnostic guidance.</div>
          </div>
        </div>
      </div>
    `

    this.setupFunctionality()
    this.addStyles()
    
    return this.panel
  }

  private setupFunctionality(): void {
    if (!this.panel) return

    const expandToggle = this.panel.querySelector('#expand-toggle') as HTMLElement
    const header = this.panel.querySelector('.panel-header') as HTMLElement
    const voiceToggleBtn = this.panel.querySelector('#voice-toggle-btn') as HTMLElement

    if (expandToggle) {
      expandToggle.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggle()
      })
    }

    if (header) {
      header.addEventListener('click', () => {
        this.toggle()
      })
    }

    if (voiceToggleBtn) {
      voiceToggleBtn.addEventListener('click', () => {
        this.toggleVoice()
      })
    }

    // Store container references
    this.insightContainer = this.panel.querySelector('#insights-container') as HTMLElement
    this.voiceContainer = this.panel.querySelector('#voice-control-section') as HTMLElement
  }

  // Voice integration methods
  registerVoiceCallbacks(callbacks: VoiceCallback): void {
    this.voiceCallbacks = callbacks
    
    // Register internal callbacks for voice events
    callbacks.onResult((text: string) => {
      this.handleVoiceResult(text)
    })
    
    callbacks.onError((error: any) => {
      this.handleVoiceError(error)
    })
  }

  private toggleVoice(): void {
    if (!this.voiceCallbacks) {
      console.warn('Voice callbacks not registered')
      return
    }

    const voiceToggleBtn = this.panel?.querySelector('#voice-toggle-btn') as HTMLElement
    if (!voiceToggleBtn) return

    if (this.isVoiceActive) {
      this.voiceCallbacks.stopListening()
      this.isVoiceActive = false
      voiceToggleBtn.textContent = '🎤 Activate'
      voiceToggleBtn.style.background = colors.accent.base
    } else {
      this.voiceCallbacks.startListening()
      this.isVoiceActive = true
      voiceToggleBtn.textContent = '🔴 Listening...'
      voiceToggleBtn.style.background = colors.error.base
    }
  }

  private handleVoiceResult(text: string): void {
    // Add voice result as an insight
    this.addInsight({
      id: `voice_${Date.now()}`,
      timestamp: Date.now(),
      content: `You said: "${text}"`,
      type: 'voice',
      confidence: 0.9
    })

    // Trigger any registered callbacks
    this.onVoiceResultCallbacks.forEach(callback => callback(text))
  }

  private handleVoiceError(error: any): void {
    this.addInsight({
      id: `error_${Date.now()}`,
      timestamp: Date.now(),
      content: `Voice error: ${error.message || error}`,
      type: 'urgent',
      confidence: 0.5
    })

    // Trigger any registered callbacks
    this.onVoiceErrorCallbacks.forEach(callback => callback(error))
  }

  // Register callbacks for voice events
  onVoiceResult(callback: (text: string) => void): void {
    this.onVoiceResultCallbacks.push(callback)
  }

  onVoiceError(callback: (error: any) => void): void {
    this.onVoiceErrorCallbacks.push(callback)
  }

  addInsight(insight: AIInsight): void {
    this.insights.push(insight)
    this.renderInsights()
  }

  updateInsights(insights: AIInsight[]): void {
    this.insights = insights
    this.renderInsights()
  }

  clearInsights(): void {
    this.insights = []
    this.renderInsights()
  }

  private renderInsights(): void {
    if (!this.insightContainer) return

    if (this.insights.length === 0) {
      this.insightContainer.innerHTML = `
        <div class="insight-placeholder" id="insight-placeholder" style="
          text-align: center; 
          padding: ${spacing.xl}; 
          color: ${colors.neutral.medium}; 
          font-style: italic;
        ">
          <div style="font-size: ${typography.fontSize.lg}; margin-bottom: ${spacing.sm};">💡</div>
          <div>No insights yet. Consult the AI for diagnostic guidance.</div>
        </div>
      `
      return
    }

    // Remove placeholder if it exists
    const placeholder = this.insightContainer.querySelector('#insight-placeholder')
    if (placeholder) {
      placeholder.remove()
    }

    // Clear and render insights
    this.insightContainer.innerHTML = this.insights.map(insight => this.renderInsight(insight)).join('')
  }

  private renderInsight(insight: AIInsight): string {
    const typeStyles = this.getInsightTypeStyles(insight.type)
    
    return `
      <div class="ai-insight" style="
        background: ${typeStyles.bg};
        border: ${borders.width.thin} solid ${typeStyles.border};
        border-radius: ${borders.radius.md};
        padding: ${spacing.sm} ${spacing.md};
        margin-bottom: ${spacing.sm};
        position: relative;
        overflow: hidden;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: ${spacing.xs};
        ">
          <div style="
            color: ${typeStyles.text};
            font-weight: ${typography.fontWeight.bold};
            font-size: ${typography.fontSize.sm};
            text-transform: uppercase;
            letter-spacing: ${typography.letterSpacing.wider};
          ">${insight.type}</div>
          <div style="
            color: ${colors.neutral.medium};
            font-size: ${typography.fontSize.xs};
          ">${new Date(insight.timestamp).toLocaleTimeString()}</div>
        </div>
        <div style="
          color: ${colors.neutral.light};
          font-size: ${typography.fontSize.sm};
          line-height: ${typography.lineHeight.normal};
        ">${insight.content}</div>
        <div style="
          position: absolute;
          top: 0;
          right: 0;
          background: linear-gradient(45deg, transparent, ${typeStyles.confidenceBg}40);
          height: 100%;
          width: 15%;
        "></div>
      </div>
    `
  }

  private getInsightTypeStyles(type: string): { bg: string; border: string; text: string; confidenceBg: string } {
    switch (type) {
      case 'urgent':
        return {
          bg: colors.background.errorGlow,
          border: colors.border.error,
          text: colors.error.base,
          confidenceBg: colors.error.base
        }
      case 'voice':
        return {
          bg: colors.background.accentGlow,
          border: colors.border.accent,
          text: colors.accent.base,
          confidenceBg: colors.accent.base
        }
      case 'diagnostic':
        return {
          bg: colors.background.infoGlow,
          border: colors.border.info,
          text: colors.info.base,
          confidenceBg: colors.info.base
        }
      case 'educational':
        return {
          bg: colors.background.primaryGlow,
          border: colors.border.primary,
          text: colors.primary.base,
          confidenceBg: colors.primary.base
        }
      case 'procedural':
      default:
        return {
          bg: colors.background.accentGlow,
          border: colors.border.accent,
          text: colors.accent.base,
          confidenceBg: colors.accent.base
        }
    }
  }

  toggle(): void {
    if (!this.panel) return

    this.isExpanded = !this.isExpanded
    this.panel.classList.toggle('expanded', this.isExpanded)

    const content = this.panel.querySelector('.panel-content') as HTMLElement
    const toggle = this.panel.querySelector('#expand-toggle') as HTMLElement

    if (content) {
      content.style.display = this.isExpanded ? 'block' : 'none'
    }

    if (toggle) {
      toggle.textContent = this.isExpanded ? '▲' : '▼'
    }
  }

  show(): void {
    if (this.panel) {
      this.panel.style.display = 'block'
    }
  }

  hide(): void {
    if (this.panel) {
      this.panel.style.display = 'none'
    }
  }

  destroy(): void {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel)
    }
    this.panel = null
    this.insightContainer = null
    this.voiceContainer = null
  }

  private getPanelStyles(): string {
    const position = this.getPositionStyles()
    return `
      position: fixed; 
      ${position}
      width: ${this.config.width}; 
      height: ${this.config.height};
      max-width: ${this.config.maxWidth};
      max-height: ${this.config.maxHeight};
      z-index: ${zIndex.panel}; 
      overflow-y: auto; 
      transition: all 0.3s ease;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.primary};
      border-radius: ${borders.radius.xl};
      box-shadow: ${effects.shadow.md}, ${effects.shadow.primaryGlow};
      backdrop-filter: ${effects.blur.lg};
      ${effects.inset.medium}
    `
  }

  private getPositionStyles(): string {
    switch (this.config.position) {
      case 'left':
        return 'top: 2rem; left: 2rem;'
      case 'right':
        return 'top: 2rem; right: 2rem;'
      case 'bottom':
        return 'bottom: 2rem; left: 2rem; right: 2rem; width: auto; max-width: 500px;'
      case 'top':
        return 'top: 2rem; left: 2rem; right: 2rem; width: auto; max-width: 500px;'
      default:
        return 'top: 2rem; right: 2rem;'
    }
  }

  private getHeaderStyles(): string {
    return `
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: ${spacing.base}; 
      border-bottom: ${borders.width.thin} solid ${colors.border.primary}; 
      cursor: pointer; 
      user-select: none;
    `
  }

  private getContentStyles(): string {
    return `
      max-height: calc(${this.config.maxHeight} - 150px);
      overflow-y: auto;
    `
  }

  private addStyles(): void {
    if (document.querySelector('#ai-panel-styles')) return

    const style = document.createElement('style')
    style.id = 'ai-panel-styles'
    style.textContent = `
      .ai-panel {
        font-family: ${typography.fontFamily.sans};
      }

      .panel-title {
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
        color: ${colors.primary.base};
        margin: 0;
      }

      .panel-subtitle {
        font-size: ${typography.fontSize.xs};
        color: ${colors.neutral.medium};
        margin-top: ${spacing.xs};
      }

      .expand-toggle:hover {
        background: ${colors.background.secondaryGlow} !important;
        transform: scale(1.1);
      }

      .voice-toggle-btn:hover {
        transform: scale(1.05);
      }

      .insights-container {
        max-height: 400px;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .ai-panel {
          top: auto !important;
          bottom: 1rem !important;
          left: 1rem !important;
          right: 1rem !important;
          width: auto !important;
          max-width: none !important;
          max-height: 40vh !important;
        }
      }
    `
    document.head.appendChild(style)
  }
}