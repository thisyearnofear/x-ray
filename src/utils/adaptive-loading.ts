// PERFORMANT: Adaptive loading system for optimal resource management
export interface DeviceCapabilities {
  memory: number
  cores: number
  connection: string
  bandwidth: number
  isLowEnd: boolean
}

export interface LoadingStrategy {
  preloadAssets: boolean
  enableAnimations: boolean
  maxConcurrentRequests: number
  imageQuality: 'low' | 'medium' | 'high'
  enableCaching: boolean
}

// MODULAR: Device capability detection
export class AdaptiveLoader {
  private capabilities: DeviceCapabilities
  private strategy: LoadingStrategy

  constructor() {
    this.capabilities = this.detectCapabilities()
    this.strategy = this.determineStrategy()
  }

  // CLEAN: Comprehensive device detection
  private detectCapabilities(): DeviceCapabilities {
    const nav = navigator as any
    
    // Memory detection (Chrome/Edge)
    const memory = nav.deviceMemory || 4 // Default to 4GB if unknown
    
    // CPU cores
    const cores = nav.hardwareConcurrency || 4
    
    // Network connection
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection
    const effectiveType = connection?.effectiveType || '4g'
    const downlink = connection?.downlink || 10 // Mbps
    
    // PERFORMANT: Low-end device detection
    const isLowEnd = memory <= 2 || cores <= 2 || effectiveType === 'slow-2g' || effectiveType === '2g'

    return {
      memory,
      cores,
      connection: effectiveType,
      bandwidth: downlink,
      isLowEnd
    }
  }

  // CLEAN: Strategy determination based on capabilities
  private determineStrategy(): LoadingStrategy {
    const { isLowEnd, memory, bandwidth, connection } = this.capabilities

    if (isLowEnd || bandwidth < 1) {
      // PERFORMANT: Conservative strategy for low-end devices
      return {
        preloadAssets: false,
        enableAnimations: false,
        maxConcurrentRequests: 2,
        imageQuality: 'low',
        enableCaching: true
      }
    }

    if (memory >= 8 && bandwidth >= 5) {
      // PERFORMANT: Aggressive strategy for high-end devices
      return {
        preloadAssets: true,
        enableAnimations: true,
        maxConcurrentRequests: 6,
        imageQuality: 'high',
        enableCaching: true
      }
    }

    // PERFORMANT: Balanced strategy for mid-range devices
    return {
      preloadAssets: connection !== '3g',
      enableAnimations: true,
      maxConcurrentRequests: 4,
      imageQuality: 'medium',
      enableCaching: true
    }
  }

  // DRY: Public API for strategy access
  getStrategy(): LoadingStrategy {
    return { ...this.strategy }
  }

  getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities }
  }

  // PERFORMANT: Dynamic strategy updates based on performance
  updateStrategy(performanceMetrics: { fps: number; loadTime: number }): void {
    const { fps, loadTime } = performanceMetrics

    // Downgrade if performance is poor
    if (fps < 30 || loadTime > 3000) {
      this.strategy.enableAnimations = false
      this.strategy.maxConcurrentRequests = Math.max(1, this.strategy.maxConcurrentRequests - 1)
      this.strategy.imageQuality = this.strategy.imageQuality === 'high' ? 'medium' : 'low'
    }

    // Upgrade if performance is excellent
    if (fps >= 60 && loadTime < 1000 && !this.capabilities.isLowEnd) {
      this.strategy.enableAnimations = true
      this.strategy.maxConcurrentRequests = Math.min(6, this.strategy.maxConcurrentRequests + 1)
      this.strategy.imageQuality = this.strategy.imageQuality === 'low' ? 'medium' : 'high'
    }
  }

  // PERFORMANT: Resource loading with concurrency control
  async loadResources<T>(
    resources: Array<() => Promise<T>>,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<T[]> {
    const { maxConcurrentRequests } = this.strategy
    const results: T[] = []
    let loaded = 0

    // CLEAN: Batch processing with concurrency limit
    for (let i = 0; i < resources.length; i += maxConcurrentRequests) {
      const batch = resources.slice(i, i + maxConcurrentRequests)
      
      const batchResults = await Promise.allSettled(
        batch.map(loader => loader())
      )

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.warn('Resource loading failed:', result.reason)
        }
        
        loaded++
        onProgress?.(loaded, resources.length)
      }
    }

    return results
  }

  // PERFORMANT: Image optimization based on strategy
  optimizeImageUrl(baseUrl: string): string {
    const { imageQuality } = this.strategy
    
    // Add quality parameters if URL supports it
    if (baseUrl.includes('?')) {
      return `${baseUrl}&quality=${imageQuality}`
    } else {
      return `${baseUrl}?quality=${imageQuality}`
    }
  }

  // CLEAN: Animation control
  shouldEnableAnimation(animationType: 'essential' | 'decorative' = 'decorative'): boolean {
    if (animationType === 'essential') return true
    return this.strategy.enableAnimations
  }

  // PERFORMANT: Preloading control
  shouldPreload(resourceType: 'critical' | 'important' | 'optional' = 'optional'): boolean {
    if (resourceType === 'critical') return true
    if (resourceType === 'important') return this.strategy.preloadAssets
    return this.strategy.preloadAssets && !this.capabilities.isLowEnd
  }
}

// ORGANIZED: Global adaptive loader instance
export const adaptiveLoader = new AdaptiveLoader()

// PERFORMANT: Performance monitoring utilities
export class PerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 60

  // CLEAN: FPS monitoring
  measureFPS(): number {
    const now = performance.now()
    this.frameCount++

    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime))
      this.frameCount = 0
      this.lastTime = now
    }

    return this.fps
  }

  // PERFORMANT: Load time measurement
  measureLoadTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    
    return operation().then(result => ({
      result,
      duration: performance.now() - start
    }))
  }

  // CLEAN: Memory usage (if available)
  getMemoryUsage(): { used: number; total: number } | null {
    const memory = (performance as any).memory
    if (!memory) return null

    return {
      used: memory.usedJSHeapSize / 1024 / 1024, // MB
      total: memory.totalJSHeapSize / 1024 / 1024 // MB
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()