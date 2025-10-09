import { colors, spacing, typography, borders, effects, zIndex } from '../../styles/design-tokens';

export interface TooltipConfig {
  targetElement: HTMLElement;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export class Tooltip {
  private element: HTMLElement;
  private config: TooltipConfig;

  constructor(config: TooltipConfig) {
    this.config = config;
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.style.cssText = `
      position: absolute;
      background: ${colors.background.panel};
      color: ${colors.neutral.white};
      padding: ${spacing.sm} ${spacing.md};
      border-radius: ${borders.radius.md};
      font-size: ${typography.fontSize.sm};
      z-index: ${zIndex.tooltip};
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      pointer-events: none;
    `;
    this.element.textContent = this.config.message;
    document.body.appendChild(this.element);
  }

  public show(): void {
    const targetRect = this.config.targetElement.getBoundingClientRect();
    const tooltipRect = this.element.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (this.config.position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 10;
        break;
    }

    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;
    this.element.style.opacity = '1';
  }

  public hide(): void {
    this.element.style.opacity = '0';
  }

  public destroy(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export class TooltipManager {
  private tooltips: Map<string, Tooltip> = new Map();

  public createTooltip(id: string, config: TooltipConfig): void {
    if (this.tooltips.has(id)) {
      this.tooltips.get(id)?.destroy();
    }
    const tooltip = new Tooltip(config);
    this.tooltips.set(id, tooltip);
  }

  public showTooltip(id: string): void {
    this.tooltips.get(id)?.show();
  }

  public hideTooltip(id: string): void {
    this.tooltips.get(id)?.hide();
  }

  public destroyTooltip(id: string): void {
    this.tooltips.get(id)?.destroy();
    this.tooltips.delete(id);
  }
}
