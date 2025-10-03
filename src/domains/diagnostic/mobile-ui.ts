// MOBILE-FIRST: Responsive UI manager for small screens and touch interactions
export interface MobileUIConfig {
  isCollapsed: boolean
  panelPosition: 'top' | 'bottom' | 'floating'
  touchOptimized: boolean
  gesturesEnabled: boolean
}

export class MobileUIManager {
  private isMobile: boolean
  private config: MobileUIConfig
  private breakpoint: number = 768
  private listeners: Map<string, (() => void)[]> = new Map()

  constructor() {
    this.isMobile = this.detectMobile()
    this.config = {
      isCollapsed: this.isMobile,
      panelPosition: this.isMobile ? 'bottom' : 'top',
      touchOptimized: this.isMobile,
      gesturesEnabled: this.isMobile
    }
    
    this.setupResizeListener()
    this.setupGestureHandlers()
  }

  // CLEAN: Device detection with multiple checks
  private detectMobile(): boolean {
    return window.innerWidth < this.breakpoint || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window)
  }

  // PERFORMANT: Responsive breakpoint management
  private setupResizeListener(): void {
    let resizeTimeout: NodeJS.Timeout
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile
        this.isMobile = this.detectMobile()
        
        if (wasMobile !== this.isMobile) {
          this.updateConfig()
          this.notifyListeners('layout-change')
        }
      }, 150)
    })
  }

  // ENHANCEMENT: Touch gesture support
  private setupGestureHandlers(): void {
    if (!this.config.gesturesEnabled) return

    let startY = 0
    let currentY = 0
    let isDragging = false

    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY
      isDragging = true
    }, { passive: true })

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return
      currentY = e.touches[0].clientY
    }, { passive: true })

    document.addEventListener('touchend', () => {
      if (!isDragging) return
      
      const deltaY = currentY - startY
      const threshold = 50

      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          this.notifyListeners('swipe-down')
        } else {
          this.notifyListeners('swipe-up')
        }
      }
      
      isDragging = false
    }, { passive: true })
  }

  // MODULAR: Configuration management
  private updateConfig(): void {
    this.config = {
      isCollapsed: this.isMobile,
      panelPosition: this.isMobile ? 'bottom' : 'top',
      touchOptimized: this.isMobile,
      gesturesEnabled: this.isMobile
    }
  }

  // DRY: Event system for UI updates
  onLayoutChange(callback: () => void): () => void {
    return this.addEventListener('layout-change', callback)
  }

  onSwipeUp(callback: () => void): () => void {
    return this.addEventListener('swipe-up', callback)
  }

  onSwipeDown(callback: () => void): () => void {
    return this.addEventListener('swipe-down', callback)
  }

  private addEventListener(event: string, callback: () => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    
    const eventListeners = this.listeners.get(event)!
    eventListeners.push(callback)
    
    return () => {
      const index = eventListeners.indexOf(callback)
      if (index > -1) eventListeners.splice(index, 1)
    }
  }

  private notifyListeners(event: string): void {
    const eventListeners = this.listeners.get(event) || []
    eventListeners.forEach(callback => callback())
  }

  // CLEAN: Public API
  getConfig(): Readonly<MobileUIConfig> {
    return { ...this.config }
  }

  isMobileDevice(): boolean {
    return this.isMobile
  }

  // PERFORMANT: CSS generation for responsive styles
  generateResponsiveStyles(baseStyles: string): string {
    const mobileStyles = `
      @media (max-width: ${this.breakpoint}px) {
        .diagnostic-game-panel {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          top: auto !important;
          width: 100% !important;
          border-radius: 16px 16px 0 0 !important;
          transform: translateY(0) !important;
          transition: transform 0.3s ease !important;
        }
        
        .diagnostic-game-panel.collapsed {
          transform: translateY(calc(100% - 60px)) !important;
        }
        
        .panel-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 0.5rem 1rem !important;
          cursor: pointer !important;
        }
        
        .game-content {
          max-height: 60vh !important;
          overflow-y: auto !important;
          padding: 1rem !important;
        }
        
        .action-btn {
          min-height: 44px !important;
          padding: 0.75rem 1rem !important;
          font-size: 16px !important;
        }
        
        .onboarding-panel {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          max-width: none !important;
          border-radius: 16px 16px 0 0 !important;
          max-height: 80vh !important;
          overflow-y: auto !important;
        }
      }
      
      @media (max-width: 480px) {
        .score-section, .timer-section {
          font-size: 0.8rem !important;
        }
        
        .panel-actions {
          flex-direction: column !important;
          gap: 0.5rem !important;
        }
        
        .action-btn {
          width: 100% !important;
        }
      }
    `
    
    return baseStyles + mobileStyles
  }

  // CLEAN: Cleanup
  destroy(): void {
    this.listeners.clear()
  }
}

// MODULAR: Singleton instance for global access
export const mobileUI = new MobileUIManager()