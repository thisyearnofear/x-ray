/**
 * Mobile Optimization
 * RESPONSIVE: Optimized layouts and interactions for mobile devices
 * PERFORMANCE: Reduced resource usage and improved frame rates on mobile
 * ACCESSIBILITY: Touch-friendly interfaces and gesture support
 */

import { colors, spacing, typography, borders, effects } from '../../styles/design-tokens'

export interface MobileConfig {
  enableTouchGestures: boolean
  enableHapticFeedback: boolean
  optimizePerformance: boolean
  adaptiveUI: boolean
  reducedMotion: boolean
}

export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'pan'
  element: HTMLElement
  callback: (event: TouchEvent | PointerEvent) => void
  options?: {
    threshold?: number
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right'
  }
}

export class MobileOptimization {
  private isMobile!: boolean
  private isTablet!: boolean
  private config: MobileConfig
  private gestureHandlers: Map<string, TouchGesture> = new Map()
  private resizeObserver: ResizeObserver | null = null
  private performanceMonitor: any = null
  private hapticSupported: boolean = false

  constructor(config: Partial<MobileConfig> = {}) {
    this.config = {
      enableTouchGestures: true,
      enableHapticFeedback: true,
      optimizePerformance: true,
      adaptiveUI: true,
      reducedMotion: false,
      ...config
    }

    this.detectDeviceType()
    this.initializeMobileOptimizations()
    
    console.log('📱 Mobile Optimization initialized', {
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      config: this.config
    })
  }

  private detectDeviceType(): void {
    const userAgent = navigator.userAgent.toLowerCase()
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const pixelRatio = window.devicePixelRatio || 1

    // Detect mobile devices
    this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                   screenWidth <= 768

    // Detect tablets
    this.isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) ||
                   (screenWidth >= 768 && screenWidth <= 1024)

    // Check for haptic feedback support
    this.hapticSupported = 'vibrate' in navigator || 'hapticFeedback' in navigator

    // Apply mobile-specific CSS classes
    document.body.classList.toggle('mobile-device', this.isMobile)
    document.body.classList.toggle('tablet-device', this.isTablet)
    document.body.classList.toggle('high-dpi', pixelRatio > 1.5)
  }

  private initializeMobileOptimizations(): void {
    if (this.isMobile || this.isTablet) {
      this.setupViewportMeta()
      this.setupTouchOptimizations()
      this.setupPerformanceOptimizations()
      this.setupResponsiveUI()
      this.setupGestureHandling()
      this.setupHapticFeedback()
    }
  }

  private setupViewportMeta(): void {
    // Ensure proper viewport meta tag
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    if (!viewport) {
      viewport = document.createElement('meta')
      viewport.name = 'viewport'
      document.head.appendChild(viewport)
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
  }

  private setupTouchOptimizations(): void {
    // Prevent default touch behaviors that interfere with the app
    document.addEventListener('touchstart', (e) => {
      // Prevent zoom on double tap for specific elements
      if ((e.target as HTMLElement).closest('.enhanced-ui-element')) {
        e.preventDefault()
      }
    }, { passive: false })

    // Improve touch responsiveness
    document.addEventListener('touchend', (e) => {
      // Add visual feedback for touch interactions
      this.addTouchFeedback(e.target as HTMLElement)
    })

    // Add CSS for better touch interactions
    this.addTouchStyles()
  }

  private addTouchStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* Mobile-optimized touch targets */
      .mobile-device button,
      .mobile-device .technique-btn,
      .mobile-device .consult-button {
        min-height: 44px !important;
        min-width: 44px !important;
        padding: ${spacing.md} ${spacing.lg} !important;
        font-size: ${typography.fontSize.md} !important;
      }

      /* Improved touch feedback */
      .mobile-device button:active,
      .mobile-device .technique-btn:active {
        transform: scale(0.95) !important;
        transition: transform 0.1s ease !important;
      }

      /* Mobile-optimized panels */
      .mobile-device .enhanced-ui-element {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        top: auto !important;
        transform: none !important;
        width: 100% !important;
        max-width: none !important;
        border-radius: ${borders.radius.lg} ${borders.radius.lg} 0 0 !important;
        max-height: 70vh !important;
        overflow-y: auto !important;
      }

      /* Mobile navigation */
      .mobile-device #enhanced-consultation-ui {
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        border-radius: 0 !important;
        top: 0 !important;
        left: 0 !important;
        transform: none !important;
      }

      /* Responsive grid layouts */
      .mobile-device .specialist-grid {
        grid-template-columns: 1fr !important;
        gap: ${spacing.md} !important;
      }

      /* Touch-friendly form elements */
      .mobile-device input,
      .mobile-device select,
      .mobile-device textarea {
        font-size: 16px !important; /* Prevents zoom on iOS */
        padding: ${spacing.md} !important;
      }

      /* Improved scrolling */
      .mobile-device .consultation-content {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }

      /* Hide elements that don't work well on mobile */
      .mobile-device .desktop-only {
        display: none !important;
      }

      /* Mobile-specific animations */
      @media (prefers-reduced-motion: reduce) {
        .mobile-device * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `
    
    document.head.appendChild(style)
  }

  private setupPerformanceOptimizations(): void {
    if (!this.config.optimizePerformance) return

    // Reduce visual effects on mobile
    this.optimizeVisualEffects()
    
    // Implement performance monitoring
    this.startPerformanceMonitoring()
    
    // Optimize rendering
    this.optimizeRendering()
  }

  private optimizeVisualEffects(): void {
    // Reduce particle counts on mobile
    const style = document.createElement('style')
    style.textContent = `
      .mobile-device .particle-system {
        --particle-count: 25; /* Reduced from 100 */
      }
      
      .mobile-device .glow-effect {
        filter: none !important; /* Remove expensive filters */
      }
      
      .mobile-device .backdrop-blur {
        backdrop-filter: none !important;
        background: ${colors.background.panel} !important;
      }
    `
    document.head.appendChild(style)
  }

  private startPerformanceMonitoring(): void {
    let frameCount = 0
    let lastTime = performance.now()
    
    const monitor = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        
        // Adjust quality based on FPS
        if (fps < 30) {
          this.reducePerfomanceQuality()
        } else if (fps > 50) {
          this.increasePerfomanceQuality()
        }
        
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(monitor)
    }
    
    requestAnimationFrame(monitor)
  }

  private reducePerfomanceQuality(): void {
    // Reduce visual quality to maintain performance
    document.body.classList.add('reduced-quality')
    console.log('📱 Reducing visual quality for better performance')
  }

  private increasePerfomanceQuality(): void {
    // Increase visual quality when performance allows
    document.body.classList.remove('reduced-quality')
  }

  private optimizeRendering(): void {
    // Use will-change for elements that will be animated
    const animatedElements = document.querySelectorAll('.enhanced-ui-element')
    animatedElements.forEach(element => {
      (element as HTMLElement).style.willChange = 'transform, opacity'
    })
  }

  private setupResponsiveUI(): void {
    if (!this.config.adaptiveUI) return

    // Setup resize observer for responsive adjustments
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        this.handleResize(entry.target as HTMLElement)
      })
    })

    // Observe the body for size changes
    this.resizeObserver.observe(document.body)

    // Setup orientation change handling
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange()
      }, 100) // Small delay to ensure dimensions are updated
    })
  }

  private handleResize(element: HTMLElement): void {
    const width = window.innerWidth
    const height = window.innerHeight

    // Adjust UI based on screen size
    if (width < 480) {
      document.body.classList.add('small-mobile')
    } else {
      document.body.classList.remove('small-mobile')
    }

    // Adjust panel sizes
    this.adjustPanelSizes()
  }

  private handleOrientationChange(): void {
    // Force a repaint to handle orientation change issues
    document.body.style.display = 'none'
    document.body.offsetHeight // Trigger reflow
    document.body.style.display = ''

    // Adjust UI for new orientation
    this.adjustPanelSizes()
    
    console.log('📱 Orientation changed, UI adjusted')
  }

  private adjustPanelSizes(): void {
    const panels = document.querySelectorAll('.enhanced-ui-element')
    panels.forEach(panel => {
      const panelElement = panel as HTMLElement
      
      if (this.isMobile) {
        // Mobile-specific adjustments
        panelElement.style.maxHeight = '70vh'
        panelElement.style.width = '100%'
      } else if (this.isTablet) {
        // Tablet-specific adjustments
        panelElement.style.maxHeight = '80vh'
        panelElement.style.width = '90%'
      }
    })
  }

  private setupGestureHandling(): void {
    if (!this.config.enableTouchGestures) return

    // Setup common gestures for enhanced UI elements
    this.setupSwipeGestures()
    this.setupPinchGestures()
    this.setupTapGestures()
  }

  private setupSwipeGestures(): void {
    let startX = 0
    let startY = 0
    let startTime = 0

    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
    }, { passive: true })

    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 0) return

      const touch = e.changedTouches[0]
      const endX = touch.clientX
      const endY = touch.clientY
      const endTime = Date.now()

      const deltaX = endX - startX
      const deltaY = endY - startY
      const deltaTime = endTime - startTime

      // Check if it's a swipe (fast movement)
      if (deltaTime < 300 && Math.abs(deltaX) > 50) {
        const direction = deltaX > 0 ? 'right' : 'left'
        this.handleSwipe(direction, e.target as HTMLElement)
      }
    }, { passive: true })
  }

  private setupPinchGestures(): void {
    let initialDistance = 0

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = this.getDistance(e.touches[0], e.touches[1])
      }
    }, { passive: true })

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const currentDistance = this.getDistance(e.touches[0], e.touches[1])
        const scale = currentDistance / initialDistance

        if (scale > 1.1) {
          this.handlePinch('out', e.target as HTMLElement)
        } else if (scale < 0.9) {
          this.handlePinch('in', e.target as HTMLElement)
        }
      }
    }, { passive: true })
  }

  private setupTapGestures(): void {
    let tapCount = 0
    let tapTimer: number | null = null

    document.addEventListener('touchend', (e) => {
      tapCount++

      if (tapTimer) {
        clearTimeout(tapTimer)
      }

      tapTimer = window.setTimeout(() => {
        if (tapCount === 1) {
          this.handleTap(e.target as HTMLElement)
        } else if (tapCount === 2) {
          this.handleDoubleTap(e.target as HTMLElement)
        }
        tapCount = 0
      }, 300)
    }, { passive: true })
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  private handleSwipe(direction: 'left' | 'right', target: HTMLElement): void {
    // Handle swipe gestures on enhanced UI elements
    if (target.closest('.enhanced-ui-element')) {
      if (direction === 'left') {
        // Swipe left to close panels
        this.closeMobilePanel(target)
      } else if (direction === 'right') {
        // Swipe right to open navigation
        this.openMobileNavigation()
      }
    }

    this.triggerHapticFeedback('light')
  }

  private handlePinch(direction: 'in' | 'out', target: HTMLElement): void {
    // Handle pinch gestures for zooming or scaling
    if (target.closest('.consultation-content')) {
      if (direction === 'out') {
        // Pinch out to zoom in
        this.adjustFontSize(1.1)
      } else {
        // Pinch in to zoom out
        this.adjustFontSize(0.9)
      }
    }

    this.triggerHapticFeedback('medium')
  }

  private handleTap(target: HTMLElement): void {
    // Add visual feedback for taps
    this.addTouchFeedback(target)
  }

  private handleDoubleTap(target: HTMLElement): void {
    // Handle double tap gestures
    if (target.closest('.enhanced-ui-element')) {
      // Double tap to toggle panel size
      this.togglePanelSize(target)
    }

    this.triggerHapticFeedback('heavy')
  }

  private addTouchFeedback(target: HTMLElement): void {
    if (!target) return

    // Add visual ripple effect
    const ripple = document.createElement('div')
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${colors.primary.base}40;
      transform: scale(0);
      animation: ripple 0.3s ease-out;
      pointer-events: none;
      width: 20px;
      height: 20px;
      left: 50%;
      top: 50%;
      margin-left: -10px;
      margin-top: -10px;
    `

    const targetRect = target.getBoundingClientRect()
    if (targetRect.width > 0) {
      target.style.position = 'relative'
      target.appendChild(ripple)

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple)
        }
      }, 300)
    }
  }

  private setupHapticFeedback(): void {
    if (!this.config.enableHapticFeedback || !this.hapticSupported) return

    // Add haptic feedback CSS
    const style = document.createElement('style')
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.config.enableHapticFeedback || !this.hapticSupported) return

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(patterns[intensity])
    }
  }

  private closeMobilePanel(target: HTMLElement): void {
    const panel = target.closest('.enhanced-ui-element') as HTMLElement
    if (panel) {
      panel.style.transform = 'translateY(100%)'
      setTimeout(() => {
        panel.style.display = 'none'
      }, 300)
    }
  }

  private openMobileNavigation(): void {
    // Implementation for mobile navigation
    console.log('📱 Opening mobile navigation')
  }

  private adjustFontSize(multiplier: number): void {
    const currentSize = parseFloat(getComputedStyle(document.body).fontSize)
    const newSize = Math.max(12, Math.min(24, currentSize * multiplier))
    document.body.style.fontSize = `${newSize}px`
  }

  private togglePanelSize(target: HTMLElement): void {
    const panel = target.closest('.enhanced-ui-element') as HTMLElement
    if (panel) {
      const isExpanded = panel.classList.contains('expanded')
      panel.classList.toggle('expanded', !isExpanded)
      
      if (isExpanded) {
        panel.style.maxHeight = '70vh'
      } else {
        panel.style.maxHeight = '90vh'
      }
    }
  }

  /**
   * Public API methods
   */
  public isMobileDevice(): boolean {
    return this.isMobile
  }

  public isTabletDevice(): boolean {
    return this.isTablet
  }

  public enableReducedMotion(): void {
    this.config.reducedMotion = true
    document.body.classList.add('reduced-motion')
  }

  public disableReducedMotion(): void {
    this.config.reducedMotion = false
    document.body.classList.remove('reduced-motion')
  }

  public setHapticFeedback(enabled: boolean): void {
    this.config.enableHapticFeedback = enabled
  }

  public setTouchGestures(enabled: boolean): void {
    this.config.enableTouchGestures = enabled
  }

  public getDeviceInfo(): any {
    return {
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      hapticSupported: this.hapticSupported,
      config: this.config
    }
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor)
      this.performanceMonitor = null
    }

    this.gestureHandlers.clear()
    
    // Remove mobile-specific classes
    document.body.classList.remove('mobile-device', 'tablet-device', 'reduced-quality', 'small-mobile')
    
    console.log('📱 Mobile Optimization destroyed')
  }
}