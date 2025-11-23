/**
 * Case Cache Manager
 * PERFORMANT: LRU cache for validated AI-generated cases
 * CLEAN: Single responsibility for case caching
 * DRY: Centralized cache management logic
 */

import { MedicalCase } from '../types';

interface CachedCase {
    key: string;
    case: MedicalCase;
    timestamp: number;
    validationScore: number;
}

export class CaseCacheManager {
    private static readonly CACHE_KEY = 'x-ray-case-cache';
    private static readonly MAX_CACHE_SIZE = 5; // LRU: Keep last 5 cases
    private static readonly CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

    /**
     * PERFORMANT: Cache a validated case for reuse
     * @param caseData - The medical case to cache
     * @param difficulty - Difficulty level
     * @param model - Anatomical model (head, torso, fullbody)
     * @param validationScore - Quality score from validator
     */
    static cacheValidatedCase(
        caseData: MedicalCase,
        difficulty: string,
        model: string,
        validationScore: number
    ): void {
        try {
            const cacheKey = this.getCacheKey(difficulty, model);
            const cache = this.getCache();

            // Remove existing entry with same key (if any)
            const filteredCache = cache.filter(item => item.key !== cacheKey);

            // Add new entry at the beginning (most recent)
            const newEntry: CachedCase = {
                key: cacheKey,
                case: caseData,
                timestamp: Date.now(),
                validationScore
            };

            filteredCache.unshift(newEntry);

            // PERFORMANT: LRU eviction - keep only MAX_CACHE_SIZE items
            if (filteredCache.length > this.MAX_CACHE_SIZE) {
                filteredCache.pop(); // Remove least recently used
            }

            localStorage.setItem(this.CACHE_KEY, JSON.stringify(filteredCache));
            console.log(`💾 Cached case: ${cacheKey} (score: ${validationScore}/100)`);
        } catch (error) {
            console.error('❌ Failed to cache case:', error);
            // Fail silently - caching is optional
        }
    }

    /**
     * PERFORMANT: Retrieve cached case if available and not stale
     * @param difficulty - Difficulty level
     * @param model - Anatomical model
     * @returns Cached case or null
     */
    static getCachedCase(difficulty: string, model: string): MedicalCase | null {
        try {
            const cacheKey = this.getCacheKey(difficulty, model);
            const cache = this.getCache();

            const cached = cache.find(item => item.key === cacheKey);
            if (!cached) {
                console.log(`📭 Cache miss: ${cacheKey}`);
                return null;
            }

            // CLEAN: Check if cache is stale
            if (Date.now() - cached.timestamp > this.CACHE_EXPIRATION) {
                console.log(`⏰ Cache expired: ${cacheKey}`);
                this.removeCachedCase(cacheKey);
                return null;
            }

            console.log(`⚡ Cache hit: ${cacheKey} (age: ${this.getCacheAge(cached.timestamp)})`);

            // PERFORMANT: Move to front (LRU update)
            this.updateLRU(cacheKey);

            return cached.case;
        } catch (error) {
            console.error('❌ Failed to retrieve cached case:', error);
            return null;
        }
    }

    /**
     * CLEAN: Remove a specific cached case
     */
    private static removeCachedCase(cacheKey: string): void {
        try {
            const cache = this.getCache();
            const filteredCache = cache.filter(item => item.key !== cacheKey);
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(filteredCache));
        } catch (error) {
            console.error('❌ Failed to remove cached case:', error);
        }
    }

    /**
     * PERFORMANT: Update LRU order - move accessed item to front
     */
    private static updateLRU(cacheKey: string): void {
        try {
            const cache = this.getCache();
            const itemIndex = cache.findIndex(item => item.key === cacheKey);

            if (itemIndex > 0) {
                // Move to front
                const [item] = cache.splice(itemIndex, 1);
                cache.unshift(item);
                localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
            }
        } catch (error) {
            console.error('❌ Failed to update LRU:', error);
        }
    }

    /**
     * CLEAN: Clear all cached cases
     */
    static clearCache(): void {
        try {
            localStorage.removeItem(this.CACHE_KEY);
            console.log('🗑️ Case cache cleared');
        } catch (error) {
            console.error('❌ Failed to clear cache:', error);
        }
    }

    /**
     * CLEAN: Get cache statistics
     */
    static getCacheStats(): {
        size: number;
        entries: Array<{ key: string; age: string; score: number }>;
        totalSize: number;
    } {
        try {
            const cache = this.getCache();
            const cacheString = localStorage.getItem(this.CACHE_KEY) || '[]';

            return {
                size: cache.length,
                entries: cache.map(item => ({
                    key: item.key,
                    age: this.getCacheAge(item.timestamp),
                    score: item.validationScore
                })),
                totalSize: new Blob([cacheString]).size
            };
        } catch (error) {
            console.error('❌ Failed to get cache stats:', error);
            return { size: 0, entries: [], totalSize: 0 };
        }
    }

    /**
     * PERFORMANT: Clean up stale entries
     */
    static cleanupStaleEntries(): number {
        try {
            const cache = this.getCache();
            const now = Date.now();
            const freshCache = cache.filter(
                item => now - item.timestamp <= this.CACHE_EXPIRATION
            );

            const removedCount = cache.length - freshCache.length;

            if (removedCount > 0) {
                localStorage.setItem(this.CACHE_KEY, JSON.stringify(freshCache));
                console.log(`🧹 Cleaned up ${removedCount} stale cache entries`);
            }

            return removedCount;
        } catch (error) {
            console.error('❌ Failed to cleanup stale entries:', error);
            return 0;
        }
    }

    /**
     * MODULAR: Generate cache key from parameters
     */
    private static getCacheKey(difficulty: string, model: string): string {
        return `${difficulty}-${model}`;
    }

    /**
     * MODULAR: Get cache from localStorage
     */
    private static getCache(): CachedCase[] {
        try {
            const stored = localStorage.getItem(this.CACHE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ Failed to parse cache:', error);
            return [];
        }
    }

    /**
     * MODULAR: Get human-readable cache age
     */
    private static getCacheAge(timestamp: number): string {
        const ageMs = Date.now() - timestamp;
        const ageMinutes = Math.floor(ageMs / (60 * 1000));
        const ageHours = Math.floor(ageMinutes / 60);

        if (ageHours > 0) {
            return `${ageHours}h ${ageMinutes % 60}m`;
        }
        return `${ageMinutes}m`;
    }

    /**
     * CLEAN: Check if cache is available (localStorage accessible)
     */
    static isCacheAvailable(): boolean {
        try {
            const test = '__cache_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }
}
