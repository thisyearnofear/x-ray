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
  type: 'diagnostic' | 'procedural' | 'educational' | 'urgent' | 'voice' | 'premium'
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
  private voiceSilenceTimer: NodeJS.Timeout | null = null // Timer for automatic voice timeout
  private onVoiceResultCallbacks: Array<(text: string) => void> = []
  private onVoiceErrorCallbacks: Array<(error: any) => void> = []
  private isPremiumUser: boolean = false // Track premium status for voice access

  constructor(config: AIPanelConfig) {
    this.config = {
      position: 'right',
      width: '320px',
      height: 'auto',
      maxWidth: '500px',
      maxHeight: '55vh',
      ...config
    }
  }

  // Set premium status for voice access control
  setPremiumStatus(isPremium: boolean): void {
    this.isPremiumUser = isPremium
    this.updateVoiceControlVisibility()
  }

  private updateVoiceControlVisibility(): void {
    if (!this.voiceContainer) return
    
    if (this.isPremiumUser) {
      this.voiceContainer.style.display = 'flex'
    } else {
      this.voiceContainer.style.display = 'none'
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
          <div class="panel-title" id="ai-panel-title">👩‍⚕️ Nurse Amy</div>
          <div class="panel-subtitle" id="ai-panel-subtitle">Virtual Clinical Assistant</div>
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
            color: ${colors.neutral.base}; 
            font-style: italic;
          ">
            <div style="font-size: ${typography.fontSize.lg}; margin-bottom: ${spacing.sm};">💡</div>
            <div>No insights yet. Consult the AI for diagnostic guidance.</div>
          </div>
        </div>
        
        <!-- Footer with keyboard shortcuts -->
        <div style="
          margin-top: ${spacing.md};
          padding-top: ${spacing.md};
          border-top: ${borders.width.thin} solid ${colors.border.primary};
          font-size: ${typography.fontSize.xs};
          color: ${colors.neutral.base};
          text-align: center;
        ">
          <div style="margin-bottom: ${spacing.xs};">⌨️ Keyboard Shortcuts</div>
          <div>[V] Voice Consultation • [C] Toggle Conditions</div>
          <div>[E] Expand View • [H] Focus Hints</div>
        </div>
      </div>
    `

    this.setupFunctionality()
    this.addStyles()
    this.makeDraggable()

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

    if (this.insightContainer) {
      this.insightContainer.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const btn = target.closest('[data-delegate-action]') as HTMLElement | null
        if (btn) {
          const label = btn.getAttribute('data-label') || 'action'
          document.dispatchEvent(new CustomEvent('requestDelegatedAction', { detail: { label } }))
        }
      })
    }
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
    // Check premium access first
    if (!this.isPremiumUser) {
      this.addInsight({
        id: `premium_required_${Date.now()}`,
        timestamp: Date.now(),
        content: '🔒 Voice consultation requires premium access. Connect your wallet to upgrade!',
        type: 'premium',
        confidence: 1.0
      })
      return
    }

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

      // Add visual feedback that voice has stopped
      this.addInsight({
        id: `voice_end_${Date.now()}`,
        timestamp: Date.now(),
        content: '🎙️ Voice consultation ended',
        type: 'voice',
        confidence: 0.7
      })

      // Clear any existing silence timers
      if (this.voiceSilenceTimer) {
        clearTimeout(this.voiceSilenceTimer)
        this.voiceSilenceTimer = null
      }
    } else {
      this.voiceCallbacks.startListening()
      this.isVoiceActive = true
      voiceToggleBtn.textContent = '🔴 Listening...'
      voiceToggleBtn.style.background = colors.error.base

      // Add visual feedback that voice has started
      this.addInsight({
        id: `voice_start_${Date.now()}`,
        timestamp: Date.now(),
        content: '🎙️ Voice consultation activated - speak now!',
        type: 'voice',
        confidence: 0.9
      })

      // Set up automatic stopping after 10 seconds of silence
      this.voiceSilenceTimer = setTimeout(() => {
        if (this.isVoiceActive) {
          this.voiceCallbacks?.stopListening()
          this.isVoiceActive = false
          if (voiceToggleBtn) {
            voiceToggleBtn.textContent = '🎤 Activate'
            voiceToggleBtn.style.background = colors.accent.base
          }

          // Add timeout insight to AI panel
          this.addInsight({
            id: `timeout_${Date.now()}`,
            timestamp: Date.now(),
            content: '🎙️ Voice session timed out after 10 seconds of silence',
            type: 'voice',
            confidence: 0.7
          })
        }
      }, 10000) // 10 seconds timeout
    }
  }

  private handleVoiceResult(text: string): void {
    // Add voice result as an insight
    this.addInsight({
      id: `voice_${Date.now()}`,
      timestamp: Date.now(),
      content: `🎙️ You said: "${text}"`,
      type: 'voice',
      confidence: 0.9
    })

    // Trigger any registered callbacks
    this.onVoiceResultCallbacks.forEach(callback => callback(text))

    // Automatically stop listening after processing the voice input
    if (this.voiceCallbacks && this.voiceCallbacks.isListening()) {
      // Brief pause to allow for natural conversation flow
      setTimeout(() => {
        if (this.voiceCallbacks && this.voiceCallbacks.isListening()) {
          this.voiceCallbacks.stopListening()
          this.isVoiceActive = false
          const voiceToggleBtn = this.panel?.querySelector('#voice-toggle-btn') as HTMLElement
          if (voiceToggleBtn) {
            voiceToggleBtn.textContent = '🎤 Activate'
            voiceToggleBtn.style.background = colors.accent.base

            // Add confirmation that voice session ended
            this.addInsight({
              id: `voice_confirmation_${Date.now()}`,
              timestamp: Date.now(),
              content: '🎙️ Voice session ended - processing your input...',
              type: 'voice',
              confidence: 0.8
            })
          }
        }
      }, 1000)
    }
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
    this.flashPanel() // Flash to catch user's attention
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
          color: ${colors.neutral.base}; 
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
            color: ${colors.neutral.base};
            font-size: ${typography.fontSize.xs};
          ">${new Date(insight.timestamp).toLocaleTimeString()}</div>
        </div>
        <div style="
          color: ${colors.neutral.light};
          font-size: ${typography.fontSize.sm};
          line-height: ${typography.lineHeight.base};
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
      case 'premium':
        return {
          bg: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
          border: '#ff6b6b',
          text: colors.neutral.black,
          confidenceBg: '#ff6b6b'
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
    const titleSection = this.panel.querySelector('.panel-title-section') as HTMLElement

    if (content) {
      content.style.display = this.isExpanded ? 'block' : 'none'
    }

    if (toggle) {
      toggle.textContent = this.isExpanded ? '▲' : '▼'
    }

    // Compact the entire panel when collapsed
    if (this.isExpanded) {
      // Expanded state - restore original styles
      this.panel.style.maxHeight = this.config.maxHeight || '60vh'
      if (titleSection) {
        titleSection.style.marginBottom = ''
      }
    } else {
      // Collapsed state - compact the panel
      this.panel.style.maxHeight = '70px'
      if (titleSection) {
        titleSection.style.marginBottom = '0'
      }
    }

    // Save the new state
    this.savePosition();
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

    // Clean up voice silence timer
    if (this.voiceSilenceTimer) {
      clearTimeout(this.voiceSilenceTimer)
      this.voiceSilenceTimer = null
    }

    this.panel = null
    this.insightContainer = null
    this.voiceContainer = null
  }

  private getPanelStyles(): string {
    const position = this.getPositionStyles()
    return `
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
      cursor: move;
    `
  }

  private getPositionStyles(): string {
    switch (this.config.position) {
      case 'left':
        return 'position: fixed; top: 2rem; left: 2rem;'
      case 'right':
        // Start position further down to avoid wallet panel
        return 'position: fixed; top: 270px; right: 2rem;'
      case 'bottom':
        return 'position: fixed; bottom: 2rem; left: 2rem;'
      case 'top':
        return 'position: fixed; top: 2rem; left: 2rem;'
      default:
        return 'position: fixed; top: 270px; right: 2rem;'
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
        font-family: ${typography.fontFamily.primary};
        cursor: move;
        user-select: none;
      }

      .panel-title {
        font-size: ${typography.fontSize.lg};
        font-weight: ${typography.fontWeight.bold};
        color: ${colors.primary.base};
        margin: 0;
      }

      .panel-subtitle {
        font-size: ${typography.fontSize.xs};
        color: ${colors.neutral.base};
        margin-top: ${spacing.xs};
      }

      .expand-toggle:hover {
        background: ${colors.background.accentGlow} !important;
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
        
        .ai-panel:not(.expanded) {
          max-height: 70px !important;
        }
      }
      
      .ai-panel:not(.expanded) {
        max-height: 70px !important;
      }
      
      @keyframes flashAttention {
        0%, 100% {
          box-shadow: ${effects.shadow.md}, ${effects.shadow.primaryGlow};
          border-color: ${colors.border.primary};
        }
        25% {
          box-shadow: 0 0 30px ${colors.primary.base}, 0 0 60px ${colors.primary.base};
          border-color: ${colors.primary.base};
        }
        50% {
          box-shadow: 0 0 40px ${colors.accent.base}, 0 0 80px ${colors.accent.base};
          border-color: ${colors.accent.base};
        }
        75% {
          box-shadow: 0 0 30px ${colors.primary.base}, 0 0 60px ${colors.primary.base};
          border-color: ${colors.primary.base};
        }
      }
      
      .ai-panel.flash-attention {
        animation: flashAttention 0.8s ease-in-out;
      }
    `
    document.head.appendChild(style)
  }

  // Flash the panel to catch user's attention
  private flashPanel(): void {
    if (!this.panel) return
    
    this.panel.classList.add('flash-attention')
    setTimeout(() => {
      this.panel?.classList.remove('flash-attention')
    }, 800)
  }

  // Make the panel draggable
  private makeDraggable(): void {
    if (!this.panel) return;

    let isDragging = false;
    let initialX: number;
    let initialY: number;
    let currentX = 0;
    let currentY = 0;
    let xOffset = 0;
    let yOffset = 0;

    // Load saved position if available
    this.loadSavedPosition();

    const dragStart = (e: MouseEvent | TouchEvent) => {
      // Don't drag when clicking on interactive elements
      if (e.target instanceof HTMLElement) {
        const target = e.target as HTMLElement;
        if (target.closest('.expand-toggle') || target.closest('#voice-toggle-btn') ||
          target.closest('.ai-insight') || target.closest('button')) {
          return;
        }
      }

      isDragging = true;

      if (e instanceof MouseEvent) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      } else if (e instanceof TouchEvent) {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      }

      // Add dragging class for visual feedback
      if (this.panel) {
        this.panel.style.cursor = 'grabbing';
      }
    };

    const dragEnd = () => {
      if (!isDragging) return;

      initialX = currentX;
      initialY = currentY;

      isDragging = false;

      // Remove dragging class
      if (this.panel) {
        this.panel.style.cursor = 'move';
      }

      // Save the new position
      this.savePosition();
    };

    const drag = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        e.preventDefault();

        if (e instanceof MouseEvent) {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        } else if (e instanceof TouchEvent) {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        this.setPosition(currentX, currentY);
      }
    };

    // Mouse events
    this.panel.addEventListener('mousedown', dragStart);
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('mousemove', drag);

    // Touch events for mobile
    this.panel.addEventListener('touchstart', dragStart);
    window.addEventListener('touchend', dragEnd);
    window.addEventListener('touchmove', drag, { passive: false });

    // Prevent text selection while dragging
    this.panel.addEventListener('selectstart', (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    });
  }

  private setPosition(x: number, y: number): void {
    if (!this.panel) return;

    // Use transform for smooth dragging
    this.panel.style.transform = `translate(${x}px, ${y}px)`;

    // Ensure the panel stays visible
    this.panel.style.position = 'fixed';
  }

  private savePosition(): void {
    if (!this.panel) return;

    // Get the current transform values
    const transform = this.panel.style.transform;
    if (transform && transform.includes('translate')) {
      const match = transform.match(/translate\(([^,]+)px, ([^,]+)px\)/);
      if (match) {
        const position = {
          x: parseFloat(match[1]),
          y: parseFloat(match[2])
        };

        try {
          localStorage.setItem('aiPanelPosition', JSON.stringify(position));
        } catch (e) {
          console.warn('Could not save panel position to localStorage');
        }
      }
    }
  }

  private loadSavedPosition(): void {
    try {
      const savedPosition = localStorage.getItem('aiPanelPosition');
      if (savedPosition) {
        const position = JSON.parse(savedPosition);
        this.setPosition(position.x, position.y);
      }
    } catch (e) {
      console.warn('Could not load saved panel position');
    }
  }
}