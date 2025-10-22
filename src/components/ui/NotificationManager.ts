/**
 * Notification Manager
 * ENHANCEMENT FIRST: Tiered notification system for better UX hierarchy
 * CLEAN: Single source of truth for all notifications
 * MODULAR: Different tiers for different importance levels
 */

import { colors, spacing, typography, borders, effects, zIndex } from '../../styles/design-tokens'

export type NotificationTier = 'modal' | 'banner' | 'toast' | 'subtle'
export type NotificationType = 'success' | 'warning' | 'info' | 'error'

export interface NotificationOptions {
  tier: NotificationTier
  type: NotificationType
  message: string
  title?: string
  duration?: number // in milliseconds, 0 for persistent
  icon?: string
  onDismiss?: () => void
  action?: {
    label: string
    callback: () => void
  }
}

export class NotificationManager {
  private static instance: NotificationManager
  private activeNotifications: Map<string, HTMLElement> = new Map()
  private notificationQueue: NotificationOptions[] = []

  private constructor() {
    this.initializeStyles()
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  // CLEAN: Main notification method
  public show(options: NotificationOptions): string {
    const id = this.generateId()
    
    // ENHANCEMENT FIRST: Different positioning based on tier
    const element = this.createNotificationElement(id, options)
    this.activeNotifications.set(id, element)
    
    document.body.appendChild(element)
    
    // Animate in
    requestAnimationFrame(() => {
      element.classList.add('notification-enter')
    })

    // Auto-dismiss if duration is set
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, options.duration)
    }

    return id
  }

  // MODULAR: Convenience methods for common notification types
  public showModal(options: Omit<NotificationOptions, 'tier'>): string {
    return this.show({ ...options, tier: 'modal' })
  }

  public showBanner(options: Omit<NotificationOptions, 'tier'>): string {
    return this.show({ ...options, tier: 'banner' })
  }

  public showToast(options: Omit<NotificationOptions, 'tier'>): string {
    return this.show({ ...options, tier: 'toast' })
  }

  public showSubtle(options: Omit<NotificationOptions, 'tier'>): string {
    return this.show({ ...options, tier: 'subtle' })
  }

  // CLEAN: Dismiss notification
  public dismiss(id: string): void {
    const element = this.activeNotifications.get(id)
    if (!element) return

    element.classList.remove('notification-enter')
    element.classList.add('notification-exit')

    setTimeout(() => {
      element.remove()
      this.activeNotifications.delete(id)
    }, 400)
  }

  // CLEAN: Dismiss all notifications of a specific tier
  public dismissByTier(tier: NotificationTier): void {
    this.activeNotifications.forEach((element, id) => {
      if (element.dataset.tier === tier) {
        this.dismiss(id)
      }
    })
  }

  // CLEAN: Clear all notifications
  public dismissAll(): void {
    this.activeNotifications.forEach((_, id) => {
      this.dismiss(id)
    })
  }

  // MODULAR: Create notification element based on tier
  private createNotificationElement(id: string, options: NotificationOptions): HTMLElement {
    const container = document.createElement('div')
    container.id = `notification-${id}`
    container.dataset.tier = options.tier
    container.dataset.type = options.type
    container.className = `notification notification-${options.tier} notification-${options.type}`

    // Position based on tier
    const positioning = this.getPositioningForTier(options.tier)
    Object.assign(container.style, positioning)

    // Build content
    container.innerHTML = this.buildNotificationHTML(options)

    // Setup event listeners
    this.setupEventListeners(container, id, options)

    return container
  }

  // CLEAN: Get positioning based on tier
  private getPositioningForTier(tier: NotificationTier): Partial<CSSStyleDeclaration> {
    const baseStyle = {
      position: 'fixed',
      zIndex: zIndex.notification.toString(),
      transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
    }

    switch (tier) {
      case 'modal':
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: (zIndex.modal + 10).toString()
        }
      
      case 'banner':
        return {
          ...baseStyle,
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '800px',
          zIndex: (zIndex.notification + 5).toString()
        }
      
      case 'toast':
        return {
          ...baseStyle,
          top: '20px',
          right: '20px',
          zIndex: zIndex.notification.toString()
        }
      
      case 'subtle':
        return {
          ...baseStyle,
          bottom: '20px',
          right: '20px',
          zIndex: (zIndex.notification - 5).toString()
        }
      
      default:
        return baseStyle
    }
  }

  // CLEAN: Build HTML based on tier and type
  private buildNotificationHTML(options: NotificationOptions): string {
    const { tier, type, message, title, icon, action } = options

    // Get color based on type
    const colorMap = {
      success: colors.accent.base,
      warning: '#ffaa00',
      error: '#ff4444',
      info: colors.primary.base
    }
    const color = colorMap[type]

    // Get icon if not provided
    const displayIcon = icon || this.getDefaultIcon(type)

    if (tier === 'modal') {
      return this.buildModalHTML({ title, message, icon: displayIcon, color, action })
    } else if (tier === 'banner') {
      return this.buildBannerHTML({ title, message, icon: displayIcon, color, action })
    } else if (tier === 'toast') {
      return this.buildToastHTML({ title, message, icon: displayIcon, color, action })
    } else {
      return this.buildSubtleHTML({ message, icon: displayIcon, color })
    }
  }

  private buildModalHTML(data: any): string {
    return `
      <div class="notification-backdrop" style="
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: -1;
      "></div>
      <div class="notification-content" style="
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid ${data.color};
        border-radius: 20px;
        padding: 2.5rem;
        max-width: 500px;
        width: 90vw;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">${data.icon}</div>
        ${data.title ? `<h2 style="color: ${data.color}; font-size: 1.8rem; font-weight: bold; margin-bottom: 1rem;">${data.title}</h2>` : ''}
        <p style="color: white; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; opacity: 0.9;">${data.message}</p>
        <div class="notification-actions" style="display: flex; gap: 1rem; justify-content: center;">
          ${data.action ? `
            <button class="notification-action-btn" style="
              background: linear-gradient(45deg, ${data.color}, ${this.darkenColor(data.color)});
              color: black;
              border: none;
              padding: 1rem 2rem;
              border-radius: 10px;
              cursor: pointer;
              font-size: 1rem;
              font-weight: bold;
              transition: all 0.3s ease;
            ">${data.action.label}</button>
          ` : ''}
          <button class="notification-dismiss-btn" style="
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 1rem 2rem;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
          ">Close</button>
        </div>
      </div>
    `
  }

  private buildBannerHTML(data: any): string {
    return `
      <div class="notification-content" style="
        background: linear-gradient(135deg, ${this.transparentize(data.color, 0.95)}, ${this.transparentize(data.color, 0.85)});
        border: 1px solid ${this.transparentize(data.color, 0.7)};
        border-radius: 0 0 15px 15px;
        padding: 1.5rem;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      ">
        <div style="display: flex; align-items: center; gap: 1rem; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
            <div style="font-size: 2rem;">${data.icon}</div>
            <div style="flex: 1;">
              ${data.title ? `<div style="color: ${data.color}; font-weight: bold; font-size: 1.1rem; margin-bottom: 0.25rem;">${data.title}</div>` : ''}
              <div style="color: white; font-size: 0.95rem;">${data.message}</div>
            </div>
          </div>
          <button class="notification-dismiss-btn" style="
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          ">✕</button>
        </div>
      </div>
    `
  }

  private buildToastHTML(data: any): string {
    return `
      <div class="notification-content" style="
        background: linear-gradient(135deg, ${this.transparentize(data.color, 0.9)}, ${this.transparentize(data.color, 0.8)});
        border: 1px solid ${this.transparentize(data.color, 0.7)};
        border-radius: 12px;
        padding: 1rem 1.25rem;
        min-width: 300px;
        max-width: 400px;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      ">
        <div style="display: flex; align-items: center; gap: 1rem; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
            <div style="font-size: 1.5rem;">${data.icon}</div>
            <div style="color: white; font-size: 0.95rem;">${data.message}</div>
          </div>
          <button class="notification-dismiss-btn" style="
            background: transparent;
            color: rgba(255, 255, 255, 0.6);
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          ">✕</button>
        </div>
      </div>
    `
  }

  private buildSubtleHTML(data: any): string {
    return `
      <div class="notification-content" style="
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        backdrop-filter: blur(5px);
        max-width: 250px;
      ">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="font-size: 1.2rem;">${data.icon}</div>
          <div style="color: white; font-size: 0.85rem; opacity: 0.9;">${data.message}</div>
        </div>
      </div>
    `
  }

  private setupEventListeners(element: HTMLElement, id: string, options: NotificationOptions): void {
    // Dismiss button
    const dismissBtn = element.querySelector('.notification-dismiss-btn')
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this.dismiss(id)
        options.onDismiss?.()
      })
    }

    // Action button
    const actionBtn = element.querySelector('.notification-action-btn')
    if (actionBtn && options.action) {
      actionBtn.addEventListener('click', () => {
        options.action!.callback()
        this.dismiss(id)
      })
    }

    // Modal backdrop dismiss
    if (options.tier === 'modal') {
      const backdrop = element.querySelector('.notification-backdrop')
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          this.dismiss(id)
          options.onDismiss?.()
        })
      }
    }
  }

  private getDefaultIcon(type: NotificationType): string {
    const iconMap = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    }
    return iconMap[type]
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private darkenColor(color: string): string {
    // Simple color darkening (would use proper color library in production)
    return color.replace(/([0-9a-f]{2})/gi, (match) => {
      const value = Math.max(0, parseInt(match, 16) - 40)
      return value.toString(16).padStart(2, '0')
    })
  }

  private transparentize(color: string, alpha: number): string {
    // Convert hex to rgba with alpha
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  private initializeStyles(): void {
    if (document.querySelector('#notification-manager-styles')) return

    const style = document.createElement('style')
    style.id = 'notification-manager-styles'
    style.textContent = `
      .notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .notification-modal {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }

      .notification-modal.notification-enter {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }

      .notification-modal.notification-exit {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }

      .notification-banner {
        transform: translateX(-50%) translateY(-100%);
      }

      .notification-banner.notification-enter {
        transform: translateX(-50%) translateY(0);
      }

      .notification-banner.notification-exit {
        transform: translateX(-50%) translateY(-100%);
      }

      .notification-toast {
        transform: translateX(100%);
      }

      .notification-toast.notification-enter {
        transform: translateX(0);
      }

      .notification-toast.notification-exit {
        transform: translateX(100%);
      }

      .notification-subtle {
        opacity: 0;
        transform: translateY(20px);
      }

      .notification-subtle.notification-enter {
        opacity: 1;
        transform: translateY(0);
      }

      .notification-subtle.notification-exit {
        opacity: 0;
        transform: translateY(20px);
      }

      .notification-dismiss-btn:hover {
        opacity: 1 !important;
        background: rgba(255, 255, 255, 0.2) !important;
      }

      .notification-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      }

      @media (max-width: 768px) {
        .notification-modal .notification-content,
        .notification-banner .notification-content {
          margin: 1rem;
          width: calc(100% - 2rem);
          max-width: none;
        }

        .notification-toast {
          top: auto;
          bottom: 20px;
          right: 20px;
          left: 20px;
          transform: translateY(100%);
        }

        .notification-toast.notification-enter {
          transform: translateY(0);
        }

        .notification-toast.notification-exit {
          transform: translateY(100%);
        }
      }
    `
    document.head.appendChild(style)
  }
}

// CLEAN: Export singleton instance
export const notificationManager = NotificationManager.getInstance()
