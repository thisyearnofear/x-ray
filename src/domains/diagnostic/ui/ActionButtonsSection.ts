/**
 * MODULAR: Action buttons section
 * CLEAN: Single responsibility - user actions
 * ENHANCEMENT FIRST: Uses existing HolographicButton component
 */

import { colors, spacing, typography, borders, effects } from '../../../styles/design-tokens'

export interface ActionButtonConfig {
  id: string
  icon: string
  text: string
  count?: number | string
  onClick: () => void
  visible?: boolean
  disabled?: boolean
}

export class ActionButtonsSection {
  private element: HTMLElement | null = null
  private buttons: Map<string, ActionButtonConfig> = new Map()

  create(): HTMLElement {
    this.element = document.createElement('div')
    this.element.className = 'action-buttons-section'
    this.element.id = 'action-buttons'
    this.element.style.cssText = `
      margin-top: ${spacing.base}; 
      display: none;
      flex-direction: column;
      gap: ${spacing.sm};
    `
    
    this.addButtonStyles()
    return this.element
  }

  addButton(config: ActionButtonConfig): void {
    this.buttons.set(config.id, config)
    this.render()
  }

  updateButton(id: string, updates: Partial<ActionButtonConfig>): void {
    const existing = this.buttons.get(id)
    if (existing) {
      this.buttons.set(id, { ...existing, ...updates })
      this.render()
    }
  }

  removeButton(id: string): void {
    this.buttons.delete(id)
    this.render()
  }

  show(): void {
    if (this.element) {
      this.element.style.display = 'flex'
    }
  }

  hide(): void {
    if (this.element) {
      this.element.style.display = 'none'
    }
  }

  private render(): void {
    if (!this.element) return

    const visibleButtons = Array.from(this.buttons.values())
      .filter(config => config.visible !== false)

    const buttonsHTML = visibleButtons
      .map(config => this.createButton(config))
      .join('')

    this.element.innerHTML = buttonsHTML

    // Attach event listeners
    visibleButtons.forEach(config => {
      const button = this.element?.querySelector(`#${config.id}`) as HTMLElement
      if (button && !config.disabled) {
        button.addEventListener('click', config.onClick)
      }
    })
  }

  private createButton(config: ActionButtonConfig): string {
    const disabledClass = config.disabled ? 'disabled' : ''
    const countDisplay = config.count !== undefined ? `
      <div class="btn-count" style="
        background: ${colors.background.primaryGlow};
        border-radius: ${borders.radius.full};
        padding: 2px 6px;
        font-size: ${typography.fontSize.xs};
        font-weight: ${typography.fontWeight.bold};
        min-width: 20px;
        text-align: center;
      ">
        ${config.count}
      </div>
    ` : ''

    return `
      <button class="action-btn ${disabledClass}" id="${config.id}" style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${spacing.sm};
        padding: ${spacing.sm} ${spacing.md};
        background: linear-gradient(135deg, ${colors.primary.base}20 0%, ${colors.primary.dark}20 100%);
        border: ${borders.width.thin} solid ${colors.primary.base}60;
        border-radius: ${borders.radius.md};
        color: ${colors.neutral.white};
        font-size: ${typography.fontSize.sm};
        font-weight: ${typography.fontWeight.medium};
        cursor: ${config.disabled ? 'not-allowed' : 'pointer'};
        transition: all 0.3s ease;
        opacity: ${config.disabled ? '0.5' : '1'};
        pointer-events: ${config.disabled ? 'none' : 'auto'};
      ">
        <div class="btn-content" style="display: flex; align-items: center; gap: ${spacing.sm};">
          <div class="btn-icon" style="font-size: ${typography.fontSize.lg};">${config.icon}</div>
          <div class="btn-text" style="letter-spacing: ${typography.letterSpacing.wide};">${config.text}</div>
        </div>
        ${countDisplay}
      </button>
    `
  }

  private addButtonStyles(): void {
    if (document.querySelector('#action-buttons-styles')) return

    const style = document.createElement('style')
    style.id = 'action-buttons-styles'
    style.textContent = `
      .action-btn:not(.disabled):hover {
        background: linear-gradient(135deg, ${colors.primary.base}40 0%, ${colors.primary.dark}40 100%) !important;
        border-color: ${colors.primary.base} !important;
        transform: translateY(-2px);
        box-shadow: ${effects.shadow.md}, ${effects.shadow.primaryGlow};
      }

      .action-btn:not(.disabled):active {
        transform: translateY(0);
        box-shadow: ${effects.shadow.sm};
      }

      .action-btn .btn-icon {
        transition: transform 0.2s ease;
      }

      .action-btn:not(.disabled):hover .btn-icon {
        transform: scale(1.1);
      }

      @media (max-width: 768px) {
        .action-btn {
          padding: ${spacing.xs} ${spacing.sm} !important;
          font-size: ${typography.fontSize.xs} !important;
        }
        
        .action-btn .btn-icon {
          font-size: ${typography.fontSize.base} !important;
        }
      }
    `
    document.head.appendChild(style)
  }

  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.buttons.clear()
    this.element = null
  }
}