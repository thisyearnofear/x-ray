/**
 * MODULAR: Core diagnostic panel container
 * CLEAN: Single responsibility - panel structure and lifecycle
 * DRY: Reusable panel foundation for all diagnostic UI
 */

import { colors, spacing, typography, borders, effects, zIndex } from '../../../styles/design-tokens'

export interface DiagnosticPanelConfig {
  title: string
  subtitle: string
  position?: 'left' | 'right' | 'center'
  collapsible?: boolean
  width?: string
  maxHeight?: string
}

export class DiagnosticPanel {
  private panel: HTMLElement | null = null
  private isCollapsed: boolean = false
  private config: DiagnosticPanelConfig
  private sections: Map<string, HTMLElement> = new Map()

  constructor(config: DiagnosticPanelConfig) {
    this.config = {
      position: 'left',
      collapsible: true,
      width: '380px',
      maxHeight: '80vh',
      ...config
    }
  }

  create(): HTMLElement {
    if (this.panel) return this.panel

    this.panel = document.createElement('div')
    this.panel.className = 'diagnostic-panel'
    this.panel.style.cssText = this.getPanelStyles()

    this.panel.innerHTML = `
      <div class="panel-header" style="${this.getHeaderStyles()}">
        <div class="panel-title-section">
          <div class="panel-title" id="panel-title">${this.config.title}</div>
          <div class="panel-subtitle" id="panel-subtitle">${this.config.subtitle}</div>
        </div>
        ${this.config.collapsible ? this.getCollapseToggle() : ''}
      </div>
      <div class="panel-content" style="padding: 0 1.5rem 1.5rem;"></div>
    `

    this.setupCollapsibleFunctionality()
    this.addResponsiveStyles()
    
    return this.panel
  }

  addSection(id: string, element: HTMLElement): void {
    if (!this.panel) return

    const content = this.panel.querySelector('.panel-content')
    if (content) {
      content.appendChild(element)
      this.sections.set(id, element)
    }
  }

  removeSection(id: string): void {
    const section = this.sections.get(id)
    if (section && section.parentNode) {
      section.parentNode.removeChild(section)
      this.sections.delete(id)
    }
  }

  getSection(id: string): HTMLElement | undefined {
    return this.sections.get(id)
  }

  updateTitle(title: string, subtitle?: string): void {
    if (!this.panel) return

    const titleElement = this.panel.querySelector('#panel-title') as HTMLElement
    const subtitleElement = this.panel.querySelector('#panel-subtitle') as HTMLElement

    if (titleElement) titleElement.textContent = title
    if (subtitleElement && subtitle) subtitleElement.textContent = subtitle
  }

  toggle(): void {
    if (!this.panel || !this.config.collapsible) return

    this.isCollapsed = !this.isCollapsed
    this.panel.classList.toggle('collapsed', this.isCollapsed)

    const toggle = this.panel.querySelector('#collapse-toggle') as HTMLElement
    if (toggle) {
      toggle.textContent = this.isCollapsed ? '▶' : '◀'
    }

    // Update title for collapsed state
    if (this.isCollapsed) {
      this.updateTitle('🏥', 'DIAGNOSTIC')
    } else {
      this.updateTitle(this.config.title, this.config.subtitle)
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
    this.sections.clear()
    this.panel = null
  }

  private getPanelStyles(): string {
    const position = this.getPositionStyles()
    return `
      position: fixed; 
      ${position}
      width: ${this.config.width}; 
      max-height: ${this.config.maxHeight};
      z-index: ${zIndex.panel}; 
      overflow-y: auto; 
      transition: transform 0.3s ease;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.thin} solid ${colors.border.primary};
      border-radius: ${borders.radius.lg};
      box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
      backdrop-filter: ${effects.blur.base};
    `
  }

  private getPositionStyles(): string {
    switch (this.config.position) {
      case 'left':
        return 'top: 2rem; left: 2rem;'
      case 'right':
        return 'top: 2rem; right: 2rem;'
      case 'center':
        return 'top: 2rem; left: 50%; transform: translateX(-50%);'
      default:
        return 'top: 2rem; left: 2rem;'
    }
  }

  private getHeaderStyles(): string {
    return `
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: ${spacing.base}; 
      border-bottom: ${borders.width.thin} solid ${colors.border.primary}; 
      cursor: ${this.config.collapsible ? 'pointer' : 'default'}; 
      user-select: none;
    `
  }

  private getCollapseToggle(): string {
    return `
      <div class="collapse-toggle" id="collapse-toggle" style="
        font-size: ${typography.fontSize.xl}; 
        color: ${colors.primary.base}; 
        cursor: pointer; 
        padding: ${spacing.sm}; 
        border-radius: ${borders.radius.full}; 
        background: ${colors.background.primaryGlow}; 
        transition: all 0.3s ease;
      ">
        ${this.isCollapsed ? '▶' : '◀'}
      </div>
    `
  }

  private setupCollapsibleFunctionality(): void {
    if (!this.panel || !this.config.collapsible) return

    const header = this.panel.querySelector('.panel-header') as HTMLElement
    const toggle = this.panel.querySelector('#collapse-toggle') as HTMLElement

    if (header) {
      header.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggle()
      })
    }

    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggle()
      })
    }
  }

  private addResponsiveStyles(): void {
    if (document.querySelector('#diagnostic-panel-responsive-styles')) return

    const style = document.createElement('style')
    style.id = 'diagnostic-panel-responsive-styles'
    style.textContent = `
      @media (max-width: 768px) {
        .diagnostic-panel {
          top: 1rem !important;
          left: 1rem !important;
          right: 1rem !important;
          width: auto !important;
          max-height: 70vh !important;
        }
      }

      .diagnostic-panel.collapsed {
        transform: translateX(calc(-100% + 60px)) !important;
        width: 60px !important;
      }

      .diagnostic-panel.collapsed .panel-content {
        display: none !important;
      }

      .diagnostic-panel.collapsed .panel-header {
        justify-content: center !important;
        padding: 0.5rem !important;
      }

      .diagnostic-panel.collapsed .panel-title,
      .diagnostic-panel.collapsed .panel-subtitle {
        display: none !important;
      }

      .collapse-toggle:hover {
        background: rgba(0,255,136,0.2) !important;
        transform: scale(1.1) !important;
      }
    `
    document.head.appendChild(style)
  }
}