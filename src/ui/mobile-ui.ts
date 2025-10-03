// MOBILE-FIRST: Mobile UI Manager for responsive design and touch optimization
export interface MobileConfig {
  isMobile: boolean
  isTablet: boolean
  touchOptimized: boolean
  isCollapsed: boolean
  fontSize: number
  padding: number
  orientation: 'portrait' | 'landscape'
}

export interface EventHandlers {
  layoutChange: (() => void)[]
  swipeUp: (() => void)[]
  swipeDown: (() => void)[]
}

export class MobileUIManager {
  private config: MobileConfig
  private eventHandlers: EventHandlers
  private gestureStartY: number | null = null
  private gestureStartTime: number = 0

  constructor() {
    this.config = this.detectDevice()
    this.eventHandlers = {
      layoutChange: [],
      swipeUp: [],
      swipeDown: []
    }
    
    this.setupEventListeners()
  }

  private detectDevice(): MobileConfig {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)
    const touchOptimized = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    return {
      isMobile,
      isTablet,
      touchOptimized,
      isCollapsed: isMobile, // Start collapsed on mobile
      fontSize: isMobile ? 14 : 16,
      padding: isMobile ? 12 : 16,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    }
  }

  private setupEventListeners(): void {
    // CLEAN: Resize and orientation change handling
    this.handleResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('orientationchange', this.handleResize)

    // ENHANCEMENT: Touch gesture handling
    if (this.config.touchOptimized) {
      this.setupGestureHandling()
    }
  }

  private handleResize = (): void => {
    const newConfig = this.detectDevice()
    const orientationChanged = newConfig.orientation !== this.config.orientation
    
    this.config = { ...this.config, ...newConfig }
    
    if (orientationChanged) {
      this.eventHandlers.layoutChange.forEach(callback => callback())
    }
  }

  private setupGestureHandling(): void {
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)

    document.addEventListener('touchstart', this.handleTouchStart, { passive: true })
  }

  private handleTouchStart = (e: TouchEvent): void => {
    this.gestureStartY = e.touches[0].clientY
    this.gestureStartTime = Date.now()
    
    document.addEventListener('touchmove', this.handleTouchMove, { passive: true })
    document.addEventListener('touchend', this.handleTouchEnd, { passive: true })
  }

  private handleTouchMove = (e: TouchEvent): void => {
    if (this.gestureStartY === null) return
    
    const currentY = e.touches[0].clientY
    const deltaY = this.gestureStartY - currentY
    const deltaTime = Date.now() - this.gestureStartTime
    
    // ENHANCEMENT: Detect swipe gestures (minimum 50px movement, max 300ms duration)
    if (Math.abs(deltaY) > 50 && deltaTime < 300) {
      if (deltaY > 0) {
        // Swipe up
        this.eventHandlers.swipeUp.forEach(callback => callback())
      } else {
        // Swipe down
        this.eventHandlers.swipeDown.forEach(callback => callback())
      }
      
      this.resetGesture()
    }
  }

  private handleTouchEnd = (): void => {
    this.resetGesture()
  }

  private resetGesture(): void {
    this.gestureStartY = null
    this.gestureStartTime = 0
    
    document.removeEventListener('touchmove', this.handleTouchMove)
    document.removeEventListener('touchend', this.handleTouchEnd)
  }

  // PUBLIC API
  isMobileDevice(): boolean {
    return this.config.isMobile
  }

  isTabletDevice(): boolean {
    return this.config.isTablet
  }

  getConfig(): MobileConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<MobileConfig>): void {
    this.config = { ...this.config, ...updates }
    this.eventHandlers.layoutChange.forEach(callback => callback())
  }

  generateResponsiveStyles(selector: string): string {
    const config = this.getConfig()
    
    return `
      ${selector}.mobile {
        font-size: ${config.fontSize}px;
        padding: ${config.padding}px;
      }
      
      ${selector}.collapsed {
        transform: translateY(calc(100% - 60px)) !important;
      }
      
      @media (max-width: 768px) {
        ${selector} {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          top: auto !important;
          max-height: 70vh !important;
          border-radius: 1rem 1rem 0 0 !important;
          transform: translateY(${config.isCollapsed ? 'calc(100% - 60px)' : '0'}) !important;
          transition: transform 0.3s ease !important;
          z-index: 1000 !important;
          box-shadow: 0 -4px 20px rgba(0, 255, 136, 0.2) !important;
        }
        
        ${selector} .panel-header {
          background: rgba(0, 20, 40, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          border-bottom: 1px solid #00ff88 !important;
          padding: 1rem !important;
          min-height: 60px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
        }
        
        ${selector} .panel-content {
          max-height: calc(70vh - 60px) !important;
          overflow-y: auto !important;
          padding: 1rem !important;
        }
      }
      
      @media (max-width: 480px) {
        ${selector} {
          font-size: 14px !important;
          max-height: 80vh !important;
        }
        
        ${selector} .panel-header {
          padding: 0.75rem !important;
          font-size: 16px !important;
        }
        
        ${selector} .panel-content {
          padding: 0.75rem !important;
          font-size: 14px !important;
        }
        
        ${selector} button {
          min-height: 44px !important;
          font-size: 16px !important;
          padding: 0.75rem 1.5rem !important;
        }
      }
      
      @media (orientation: landscape) and (max-height: 600px) {
        ${selector} {
          max-height: 90vh !important;
        }
      }
    `
  }

  // ENHANCEMENT: Event handler methods
  onLayoutChange(callback: () => void): void {
    this.eventHandlers.layoutChange.push(callback)
  }

  onSwipeUp(callback: () => void): void {
    this.eventHandlers.swipeUp.push(callback)
  }

  onSwipeDown(callback: () => void): void {
    this.eventHandlers.swipeDown.push(callback)
  }

  destroy(): void {
    // CLEAN: Remove event listeners
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('orientationchange', this.handleResize)
    
    // Clear gesture listeners
    if (this.gestureStartY !== null) {
      document.removeEventListener('touchmove', this.handleTouchMove)
      document.removeEventListener('touchend', this.handleTouchEnd)
    }
    
    document.removeEventListener('touchstart', this.handleTouchStart)
    
    // Clear event handlers
    this.eventHandlers = {
      layoutChange: [],
      swipeUp: [],
      swipeDown: []
    }
  }
}

// CLEAN: Export singleton instance
export const mobileUI = new MobileUIManager()