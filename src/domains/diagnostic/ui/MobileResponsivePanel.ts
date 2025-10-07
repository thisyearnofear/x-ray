/**
 * Mobile Responsive Panel
 * MODULAR: Single responsibility for mobile responsiveness
 * DRY: Centralized mobile detection and responsive behavior
 * CLEAN: Pure responsive logic, no business concerns
 */

import { colors, spacing, typography } from '../../../styles/design-tokens'

export interface ResponsiveConfig {
  breakpoint?: number
  mobilePosition?: 'top' | 'bottom' | 'floating'
  touchOptimized?: boolean
}

export class MobileResponsivePanel {
  private config: ResponsiveConfig
  private isMobile: boolean = false
  private listeners: Set<(isMobile: boolean) => void> = new Set()

  constructor(config: ResponsiveConfig = {}) {
    this.config = {
      breakpoint: 768,
      mobilePosition: 'bottom',
      touchOptimized: true,
      ...config
    }
    
    this.isMobile = this.detectMobile()
    this.setupResizeListener()
  }

  // CLEAN: Device detection
  private detectMobile(): boolean {
    return window.innerWidth < (this.config.breakpoint || 768) ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window)
  }

  // PERFORMANT: Debounced resize handling
  private setupResizeListener(): void {
    let resizeTimeout: NodeJS.Timeout

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile
        this.isMobile = this.detectMobile()

        if (wasMobile !== this.isMobile) {
          this.notifyListeners()
        }
      }, 150)
    })
  }

  // MODULAR: Event system for responsive changes
  onResponsiveChange(callback: (isMobile: boolean) => void): void {
    this.listeners.add(callback)
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.isMobile))
  }

  // DRY: Centralized responsive styles
  getResponsiveStyles(element: HTMLElement): void {
    if (this.isMobile) {
      this.applyMobileStyles(element)
    } else {
      this.applyDesktopStyles(element)
    }
  }

  private applyMobileStyles(element: HTMLElement): void {
    element.style.cssText += `
      top: auto !important;
      bottom: ${spacing.base} !important;
      left: ${spacing.base} !important;
      right: ${spacing.base} !important;
      width: auto !important;
      max-height: 60vh !important;
      font-size: ${typography.fontSize.sm} !important;
    `
  }

  private applyDesktopStyles(element: HTMLElement): void {
    element.style.cssText += `
      top: ${spacing.xl} !important;
      left: ${spacing.xl} !important;
      right: auto !important;
      bottom: auto !important;
      width: 380px !important;
      max-height: 80vh !important;
      font-size: ${typography.fontSize.base} !important;
    `
  }

  // CLEAN: Public interface
  isMobileDevice(): boolean {
    return this.isMobile
  }

  destroy(): void {
    this.listeners.clear()
  }
}