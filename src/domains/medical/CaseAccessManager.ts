/**
 * Case Access Manager
 * ENHANCEMENT FIRST: Integrates with existing MedicalServiceFacade and Web3 systems
 * MODULAR: Clean separation between access control and case generation
 * MONETIZABLE: Manages freemium tiers and AI inference costs
 */

export interface CaseAccessLevel {
  type: 'static' | 'ai_generated'
  requiresAuth: boolean
  costPerCase?: number
  features: CaseFeature[]
  maxCasesPerDay?: number
}

export type CaseFeature = 
  | 'basic_nudges' 
  | 'ai_nudges' 
  | 'standard_ui' 
  | 'enhanced_ui'
  | 'achievement_preview' 
  | 'full_nft_minting'
  | 'dynamic_difficulty'
  | 'personalized_cases'
  | 'unlimited_cases'

export interface UserAccessStatus {
  isAuthenticated: boolean
  walletAddress?: string
  currentTier: 'free' | 'premium'
  casesUsedToday: number
  canAccessAICases: boolean
  upgradeRequired: boolean
}

export class CaseAccessManager {
  private static instance: CaseAccessManager
  private userStatus: UserAccessStatus
  private callbacks: Map<string, Function[]> = new Map()

  // AGGRESSIVE CONSOLIDATION: Single source of truth for tier definitions
  private readonly CASE_TIERS: Record<string, CaseAccessLevel> = {
    free: {
      type: 'static',
      requiresAuth: false,
      features: ['basic_nudges', 'standard_ui', 'achievement_preview'],
      maxCasesPerDay: 5
    },
    premium: {
      type: 'ai_generated',
      requiresAuth: true,
      costPerCase: 0.001, // ETH equivalent
      features: [
        'ai_nudges', 
        'enhanced_ui', 
        'full_nft_minting', 
        'dynamic_difficulty', 
        'personalized_cases',
        'unlimited_cases'
      ]
    }
  }

  private constructor() {
    this.userStatus = {
      isAuthenticated: false,
      currentTier: 'free',
      casesUsedToday: 0,
      canAccessAICases: false,
      upgradeRequired: false
    }
    this.loadUserStatus()
  }

  public static getInstance(): CaseAccessManager {
    if (!CaseAccessManager.instance) {
      CaseAccessManager.instance = new CaseAccessManager()
    }
    return CaseAccessManager.instance
  }

  // ENHANCEMENT FIRST: Event system for UI updates
  public on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  private emit(event: string, data?: any) {
    const callbacks = this.callbacks.get(event) || []
    callbacks.forEach(callback => callback(data))
  }

  // CLEAN: Update user authentication status
  public updateAuthStatus(isAuthenticated: boolean, walletAddress?: string): void {
    const wasAuthenticated = this.userStatus.isAuthenticated
    
    this.userStatus.isAuthenticated = isAuthenticated
    this.userStatus.walletAddress = walletAddress
    this.userStatus.currentTier = isAuthenticated ? 'premium' : 'free'
    this.userStatus.canAccessAICases = isAuthenticated
    this.userStatus.upgradeRequired = !isAuthenticated

    // Reset daily usage if upgrading to premium
    if (!wasAuthenticated && isAuthenticated) {
      this.userStatus.casesUsedToday = 0
    }

    this.saveUserStatus()
    this.emit('accessStatusChanged', this.userStatus)
    
    console.log(`🔐 Access tier updated: ${this.userStatus.currentTier}`, {
      authenticated: isAuthenticated,
      canAccessAI: this.userStatus.canAccessAICases
    })
  }

  // MODULAR: Check if user can access specific case type
  public canAccessCaseType(caseType: 'static' | 'ai_generated'): boolean {
    const tier = this.CASE_TIERS[this.userStatus.currentTier]
    
    if (caseType === 'static') {
      // Static cases are always accessible - no daily limit
      return true
    }
    
    if (caseType === 'ai_generated') {
      return this.userStatus.isAuthenticated && this.userStatus.canAccessAICases
    }
    
    return false
  }

  // PERFORMANT: Check specific feature access
  public hasFeature(feature: CaseFeature): boolean {
    const tier = this.CASE_TIERS[this.userStatus.currentTier]
    return tier.features.includes(feature)
  }

  // MONETIZABLE: Get cost for AI case generation
  public getAICaseCost(): number {
    const premiumTier = this.CASE_TIERS.premium
    return premiumTier.costPerCase || 0
  }

  // CLEAN: Record case usage
  public recordCaseUsage(caseType: 'static' | 'ai_generated'): boolean {
    if (!this.canAccessCaseType(caseType)) {
      this.emit('accessDenied', { 
        reason: caseType === 'ai_generated' ? 'premium_required' : 'daily_limit_reached',
        currentTier: this.userStatus.currentTier,
        casesUsed: this.userStatus.casesUsedToday
      })
      return false
    }

    // Only track usage for AI-generated cases, not static cases
    if (caseType === 'ai_generated') {
      this.userStatus.casesUsedToday++
      this.saveUserStatus()
    }
    
    this.emit('caseUsageRecorded', { 
      caseType, 
      casesUsedToday: this.userStatus.casesUsedToday 
    })
    
    return true
  }

  // CLEAN: Get current user status
  public getUserStatus(): UserAccessStatus {
    return { ...this.userStatus }
  }

  // CLEAN: Get tier configuration
  public getTierConfig(tier: 'free' | 'premium'): CaseAccessLevel {
    return { ...this.CASE_TIERS[tier] }
  }

  // CLEAN: Get upgrade requirements
  public getUpgradeInfo(): {
    required: boolean
    benefits: string[]
    cost: number
    currentLimitations: string[]
  } {
    if (this.userStatus.currentTier === 'premium') {
      return {
        required: false,
        benefits: [],
        cost: 0,
        currentLimitations: []
      }
    }

    return {
      required: true,
      benefits: [
        '🤖 Unlimited AI-generated medical cases',
        '🎯 Personalized difficulty adjustment',
        '👩‍⚕️ Advanced AI-powered nurse guidance',
        '🏆 Full NFT achievement certificates',
        '📊 Enhanced analytics and progress tracking',
        '🔄 Dynamic case complexity based on performance'
      ],
      cost: this.getAICaseCost(),
      currentLimitations: [
        `📊 Limited to ${this.CASE_TIERS.free.maxCasesPerDay} cases per day`,
        '🔒 Only static case available (case-x487)',
        '⭐ Preview-only achievement certificates',
        '📈 Basic progress tracking'
      ]
    }
  }

  // PERFORMANT: Check if daily limit reached
  public isDailyLimitReached(): boolean {
    const tier = this.CASE_TIERS[this.userStatus.currentTier]
    const maxCases = tier.maxCasesPerDay || Infinity
    return this.userStatus.casesUsedToday >= maxCases
  }

  // CLEAN: Reset daily usage (called by daily cron or on date change)
  public resetDailyUsage(): void {
    this.userStatus.casesUsedToday = 0
    this.saveUserStatus()
    this.emit('dailyUsageReset')
  }

  // PERFORMANT: Load user status from localStorage
  private loadUserStatus(): void {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('xrai_user_access_status')
      if (saved) {
        const parsed = JSON.parse(saved)
        
        // Check if it's a new day and reset usage
        const lastUsageDate = localStorage.getItem('xrai_last_usage_date')
        const today = new Date().toDateString()
        
        if (lastUsageDate !== today) {
          parsed.casesUsedToday = 0
          localStorage.setItem('xrai_last_usage_date', today)
        }
        
        this.userStatus = { ...this.userStatus, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load user access status:', error)
    }
  }

  // PERFORMANT: Save user status to localStorage
  private saveUserStatus(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('xrai_user_access_status', JSON.stringify(this.userStatus))
      localStorage.setItem('xrai_last_usage_date', new Date().toDateString())
    } catch (error) {
      console.warn('Failed to save user access status:', error)
    }
  }

  // CLEAN: Get remaining cases for free tier
  public getRemainingFreeCases(): number {
    if (this.userStatus.currentTier === 'premium') return Infinity
    
    const maxCases = this.CASE_TIERS.free.maxCasesPerDay || 0
    // For free users, static cases (case-x487) are always available regardless of limit
    // This method returns remaining AI-generated cases, not static cases
    return Math.max(0, maxCases - this.userStatus.casesUsedToday)
  }
  
  // MODULAR: Check if user can access static cases (always available)
  public canAccessStaticCases(): boolean {
    // Static cases are always available for everyone
    return true
  }

  // MODULAR: Generate access summary for UI
  public getAccessSummary(): {
    tier: string
    casesRemaining: number | 'unlimited'
    features: CaseFeature[]
    canUpgrade: boolean
    upgradeRequired: boolean
  } {
    const tier = this.CASE_TIERS[this.userStatus.currentTier]
    
    return {
      tier: this.userStatus.currentTier,
      casesRemaining: this.userStatus.currentTier === 'premium' 
        ? 'unlimited' 
        : this.getRemainingFreeCases(),
      features: tier.features,
      canUpgrade: this.userStatus.currentTier === 'free',
      upgradeRequired: this.userStatus.upgradeRequired
    }
  }
}