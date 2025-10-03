// PERFORMANT: Advanced caching system for Cerebras API and resources
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
}

// MODULAR: Generic cache with TTL and LRU eviction
export class PerformanceCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private defaultTTL: number
  private stats = { hits: 0, misses: 0 }

  constructor(maxSize: number = 100, defaultTTL: number = 300000) { // 5 minutes default
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  // PERFORMANT: Efficient get with automatic cleanup
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Update hit count and stats
    entry.hits++
    this.stats.hits++
    
    // Move to end (LRU)
    this.cache.delete(key)
    this.cache.set(key, entry)
    
    return entry.data
  }

  // CLEAN: Simple set with automatic eviction
  set(key: string, data: T, ttl?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    }

    this.cache.set(key, entry)
  }

  // DRY: LRU eviction strategy
  private evictLRU(): void {
    const firstKey = this.cache.keys().next().value
    if (firstKey) {
      this.cache.delete(firstKey)
    }
  }

  // CLEAN: Cache management utilities
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
  }

  // PERFORMANT: Batch operations
  getMultiple(keys: string[]): Map<string, T> {
    const results = new Map<string, T>()
    
    for (const key of keys) {
      const value = this.get(key)
      if (value !== null) {
        results.set(key, value)
      }
    }
    
    return results
  }

  setMultiple(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.data, entry.ttl)
    }
  }

  // CLEAN: Statistics and monitoring
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0
    }
  }

  // PERFORMANT: Cleanup expired entries
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    return cleaned
  }
}

// MODULAR: Specialized caches for different data types
export class CerebrasCache extends PerformanceCache<string> {
  constructor() {
    super(50, 600000) // 10 minutes for AI responses
  }

  // CLEAN: Semantic key generation for medical analysis
  generateAnalysisKey(conditionName: string, model: string): string {
    return `analysis:${model}:${conditionName.toLowerCase().replace(/\s+/g, '-')}`
  }

  // CLEAN: Case generation key
  generateCaseKey(anatomicalModel: string, difficulty: number): string {
    return `case:${anatomicalModel}:${difficulty}`
  }
}

export class ResourceCache extends PerformanceCache<any> {
  constructor() {
    super(200, 1800000) // 30 minutes for resources
  }

  // PERFORMANT: Asset loading with cache
  async loadWithCache<T>(
    key: string, 
    loader: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get(key)
    if (cached !== null) {
      return cached as T
    }

    // Load and cache
    try {
      const data = await loader()
      this.set(key, data, ttl)
      return data
    } catch (error) {
      throw error
    }
  }
}

// ORGANIZED: Global cache instances
export const cerebrasCache = new CerebrasCache()
export const resourceCache = new ResourceCache()

// PERFORMANT: Automatic cleanup interval
let cleanupInterval: number | undefined

export function startCacheCleanup(intervalMs: number = 300000): void { // 5 minutes
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }
  
  cleanupInterval = window.setInterval(() => {
    const cerebrasCleaned = cerebrasCache.cleanup()
    const resourceCleaned = resourceCache.cleanup()
    
    if (cerebrasCleaned > 0 || resourceCleaned > 0) {
      console.log(`Cache cleanup: ${cerebrasCleaned + resourceCleaned} expired entries removed`)
    }
  }, intervalMs)
}

export function stopCacheCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = undefined
  }
}