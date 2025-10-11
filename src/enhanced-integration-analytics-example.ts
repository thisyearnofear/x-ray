/**
 * Enhanced Integration Example - Phase 3.2 Analytics
 * COMPREHENSIVE: Complete integration with analytics dashboard and learning insights
 * EDUCATIONAL: Demonstrates analytics-driven learning improvement
 * PRODUCTION-READY: Real-world usage patterns with analytics integration
 */

import Canvas from './canvas'
import { EnhancedGameManager } from './domains/diagnostic/EnhancedGameManager'
import { EnhancedDiagnosticUI } from './domains/diagnostic/EnhancedDiagnosticUI'
import { Phase3Integration } from './domains/enhancement/Phase3Integration'
import { AnalyticsDashboard } from './domains/analytics/AnalyticsDashboard'
import { MedicalCase } from './domains/medical/types'

export class XRAIEnhancedApplicationAnalytics {
  private canvas: Canvas
  private enhancedGameManager: EnhancedGameManager | null = null
  private enhancedDiagnosticUI: EnhancedDiagnosticUI | null = null
  private phase3Integration: Phase3Integration | null = null
  private analyticsDashboard: AnalyticsDashboard | null = null
  private isEnhancedModeActive: boolean = false
  private currentDifficultyProfile: string = 'intermediate'

  constructor(canvasElement: HTMLCanvasElement) {
    // Initialize the existing canvas system
    this.canvas = new Canvas(canvasElement)
    
    console.log('🎮 X-RAI Enhanced Application (Analytics) initialized')
  }

  /**
   * Enable enhanced mode with analytics dashboard
   */
  public async enableEnhancedMode(options: {
    difficultyProfile?: string
    enableAudio?: boolean
    enableVisualEffects?: boolean
    enableConsultation?: boolean
    enableMobileOptimization?: boolean
    enableAnalytics?: boolean
    performanceMode?: 'high' | 'medium' | 'low' | 'auto'
  } = {}): Promise<void> {
    if (this.isEnhancedModeActive) {
      console.warn('Enhanced mode is already active')
      return
    }

    try {
      const {
        difficultyProfile = 'intermediate',
        enableAudio = true,
        enableVisualEffects = true,
        enableConsultation = true,
        enableMobileOptimization = true,
        enableAnalytics = true,
        performanceMode = 'auto'
      } = options

      this.currentDifficultyProfile = difficultyProfile

      // Create enhanced game manager
      this.enhancedGameManager = new EnhancedGameManager(difficultyProfile)
      
      // Upgrade existing diagnostic UI to enhanced version
      if (this.canvas.diagnosticUI) {
        this.enhancedDiagnosticUI = new EnhancedDiagnosticUI({
          audioManager: this.canvas.audioManager,
          xRayEffect: this.canvas.xRayEffect,
          scanFeedbackSystem: this.canvas.scanFeedbackSystem,
          gameManager: this.canvas.gameManager || undefined,
          canvas: this.canvas,
          enhancedGameManager: this.enhancedGameManager,
          enableEnhancedFeatures: true,
          onConsultationClick: () => this.showConsultationUI()
        })
        
        // Initialize enhanced UI
        this.enhancedDiagnosticUI.initialize()
      }

      // Initialize Phase 3.1 integration
      this.phase3Integration = new Phase3Integration({
        enableAudioEnhancements: enableAudio,
        enableVisualEffects: enableVisualEffects,
        enableEnhancedConsultation: enableConsultation,
        enableMobileOptimization: enableMobileOptimization,
        adaptToDevice: true,
        performanceMode: performanceMode
      })

      // Initialize Phase 3.1 systems
      await this.phase3Integration.initialize({
        enhancedGameManager: this.enhancedGameManager,
        baseAudioManager: this.canvas.audioManager,
        scene: this.canvas.scene,
        renderer: this.canvas.renderer,
        camera: this.canvas.camera
      })

      // Initialize Analytics Dashboard (Phase 3.2)
      if (enableAnalytics) {
        this.analyticsDashboard = new AnalyticsDashboard({
          enableRealTimeUpdates: true,
          updateInterval: 3000, // 3 seconds
          showRecommendations: true,
          showComparisons: false,
          defaultTimeframe: {
            period: 'week',
            startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
            endDate: Date.now()
          }
        })

        // Connect analytics to enhanced game manager
        this.analyticsDashboard.initialize(this.enhancedGameManager)
      }
      
      this.isEnhancedModeActive = true
      
      // Show enhanced mode activation notification
      this.showEnhancedModeNotification('Analytics-Enhanced Mode Activated', `
        🎯 Adaptive Difficulty: ${difficultyProfile}
        🎵 Audio Enhancements: ${enableAudio ? 'Enabled' : 'Disabled'}
        ✨ Visual Effects: ${enableVisualEffects ? 'Enabled' : 'Disabled'}
        🏥 Enhanced Consultation: ${enableConsultation ? 'Enabled' : 'Disabled'}
        📱 Mobile Optimization: ${enableMobileOptimization ? 'Enabled' : 'Disabled'}
        📊 Analytics Dashboard: ${enableAnalytics ? 'Enabled' : 'Disabled'}
        ⚡ Performance Mode: ${performanceMode}
      `)
      
      console.log('🎮 Analytics-enhanced mode enabled successfully')
    } catch (error) {
      console.error('Failed to enable analytics-enhanced mode:', error)
      throw error
    }
  }

  /**
   * Disable enhanced features and return to basic mode
   */
  public disableEnhancedMode(): void {
    if (!this.isEnhancedModeActive) {
      console.warn('Enhanced mode is not active')
      return
    }

    try {
      // Disable analytics dashboard
      if (this.analyticsDashboard) {
        this.analyticsDashboard.destroy()
        this.analyticsDashboard = null
      }

      // Disable Phase 3.1 integration
      if (this.phase3Integration) {
        this.phase3Integration.destroy()
        this.phase3Integration = null
      }
      
      // Disable enhanced diagnostic UI
      if (this.enhancedDiagnosticUI) {
        this.enhancedDiagnosticUI.disableEnhancedFeatures()
        this.enhancedDiagnosticUI = null
      }
      
      // Reset enhanced game manager
      if (this.enhancedGameManager) {
        this.enhancedGameManager.reset()
        this.enhancedGameManager = null
      }
      
      this.isEnhancedModeActive = false
      
      this.showEnhancedModeNotification('Enhanced Mode Disabled', 'Returned to basic X-RAI experience')
      
      console.log('🎮 Enhanced mode disabled')
    } catch (error) {
      console.error('Failed to disable enhanced mode:', error)
    }
  }

  /**
   * Show analytics dashboard
   */
  public showAnalyticsDashboard(): void {
    if (this.analyticsDashboard) {
      this.analyticsDashboard.show()
      console.log('📊 Analytics dashboard opened')
    } else {
      console.warn('Analytics dashboard not available - enable enhanced mode first')
    }
  }

  /**
   * Hide analytics dashboard
   */
  public hideAnalyticsDashboard(): void {
    if (this.analyticsDashboard) {
      this.analyticsDashboard.hide()
      console.log('📊 Analytics dashboard closed')
    }
  }

  /**
   * Get learning analytics summary
   */
  public getAnalyticsSummary(): any {
    if (this.analyticsDashboard) {
      return this.analyticsDashboard.getAnalyticsSummary()
    }
    return null
  }

  /**
   * Get skill progressions
   */
  public getSkillProgressions(): any[] {
    if (this.analyticsDashboard) {
      return this.analyticsDashboard.getSkillProgressions()
    }
    return []
  }

  /**
   * Get learning insights
   */
  public getLearningInsights(): any[] {
    if (this.analyticsDashboard) {
      return this.analyticsDashboard.getRecentInsights()
    }
    return []
  }

  /**
   * Get personalized recommendations
   */
  public getRecommendations(): any[] {
    if (this.analyticsDashboard) {
      return this.analyticsDashboard.getRecommendations()
    }
    return []
  }

  /**
   * Start an enhanced medical case with analytics tracking
   */
  public async startEnhancedCase(medicalCase: MedicalCase): Promise<void> {
    if (!this.isEnhancedModeActive) {
      throw new Error('Enhanced mode must be enabled before starting enhanced cases')
    }

    if (!this.enhancedGameManager) {
      throw new Error('Enhanced systems not properly initialized')
    }

    try {
      // Start the enhanced case
      await this.enhancedGameManager.startCase(medicalCase)
      
      console.log('🎮 Enhanced case started with analytics tracking:', medicalCase.id)
    } catch (error) {
      console.error('Failed to start enhanced case:', error)
      throw error
    }
  }

  /**
   * Perform investigation technique with analytics tracking
   */
  public async performInvestigationTechnique(technique: string, region: string = 'general'): Promise<void> {
    if (!this.isEnhancedModeActive || !this.enhancedGameManager || !this.phase3Integration) {
      console.warn('Enhanced mode not active or systems not initialized')
      return
    }

    try {
      // Process investigation through enhanced game manager
      const events = await this.enhancedGameManager.processAction({
        type: 'investigate',
        data: { technique, region },
        timestamp: Date.now(),
        technique
      })

      // Trigger Phase 3.1 visual and audio effects
      const position = this.getRegionPosition(region)
      if (position) {
        this.phase3Integration.triggerInvestigationEffect(technique, position)
      }

      console.log(`🔬 Investigation technique performed with analytics: ${technique} on ${region}`)
    } catch (error) {
      console.error('Failed to perform investigation technique:', error)
    }
  }

  /**
   * Show consultation UI
   */
  public showConsultationUI(): void {
    if (this.phase3Integration) {
      this.phase3Integration.showConsultationUI()
    }
  }

  /**
   * Generate learning report
   */
  public generateLearningReport(): any {
    if (!this.analyticsDashboard) {
      console.warn('Analytics dashboard not available')
      return null
    }

    const summary = this.analyticsDashboard.getAnalyticsSummary()
    const skills = this.analyticsDashboard.getSkillProgressions()
    const insights = this.analyticsDashboard.getRecentInsights()
    const recommendations = this.analyticsDashboard.getRecommendations()

    const report = {
      generatedAt: new Date().toISOString(),
      summary,
      skills: skills.slice(0, 10), // Top 10 skills
      insights: insights.slice(0, 5), // Recent 5 insights
      recommendations: recommendations.slice(0, 3), // Top 3 recommendations
      overallProgress: this.calculateOverallProgress(summary, skills),
      nextSteps: this.generateNextSteps(recommendations, insights)
    }

    console.log('📊 Learning report generated:', report)
    return report
  }

  /**
   * Export comprehensive analytics
   */
  public exportAnalyticsData(): any {
    const baseAnalytics = {
      enhancedGameManager: this.enhancedGameManager?.getAnalyticsData(),
      diagnosticUI: this.enhancedDiagnosticUI?.exportEnhancedAnalytics(),
      timestamp: Date.now()
    }

    if (this.phase3Integration) {
      (baseAnalytics as any).phase3Analytics = this.phase3Integration.getStatus()
    }

    if (this.analyticsDashboard) {
      (baseAnalytics as any).learningAnalytics = {
        summary: this.analyticsDashboard.getAnalyticsSummary(),
        skills: this.analyticsDashboard.getSkillProgressions(),
        insights: this.analyticsDashboard.getRecentInsights(),
        recommendations: this.analyticsDashboard.getRecommendations()
      }
    }

    return baseAnalytics
  }

  /**
   * Get comprehensive system status including analytics
   */
  public getEnhancedSystemsStatus(): any {
    const baseStatus = {
      isEnhancedModeActive: this.isEnhancedModeActive,
      enhancedGameManager: !!this.enhancedGameManager,
      enhancedDiagnosticUI: !!this.enhancedDiagnosticUI,
      phase3Integration: !!this.phase3Integration,
      analyticsDashboard: !!this.analyticsDashboard,
      currentCase: (this.enhancedGameManager as any)?.getCurrentCase()?.id,
      difficultyProfile: this.currentDifficultyProfile
    }

    if (this.phase3Integration) {
      (baseStatus as any).phase3Status = this.phase3Integration.getStatus()
    }

    if (this.analyticsDashboard) {
      (baseStatus as any).analyticsStatus = {
        isDashboardVisible: this.analyticsDashboard.isDashboardVisible(),
        summary: this.analyticsDashboard.getAnalyticsSummary(),
        skillCount: this.analyticsDashboard.getSkillProgressions().length,
        insightCount: this.analyticsDashboard.getRecentInsights().length,
        recommendationCount: this.analyticsDashboard.getRecommendations().length
      }
    }

    return baseStatus
  }

  /**
   * Simulate learning session with analytics
   */
  public async simulateLearningSession(duration: number = 300000): Promise<any> {
    if (!this.isEnhancedModeActive) {
      console.warn('Enhanced mode not active')
      return null
    }

    console.log(`🎓 Starting simulated learning session (${duration / 1000}s)`)

    const sessionStart = Date.now()
    const sessionData: any = {
      startTime: sessionStart,
      actions: [],
      insights: [],
      skillImprovements: []
    }

    // Simulate various learning activities
    const activities = [
      () => this.performInvestigationTechnique('palpation', 'head_neck'),
      () => this.performInvestigationTechnique('auscultation', 'chest'),
      () => this.showConsultationUI(),
      () => this.showAnalyticsDashboard()
    ]

    // Perform activities at intervals
    const activityInterval = setInterval(() => {
      const activity = activities[Math.floor(Math.random() * activities.length)]
      activity()
      sessionData.actions.push({
        timestamp: Date.now(),
        action: activity.name
      })
    }, 5000)

    // End session after duration
    setTimeout(() => {
      clearInterval(activityInterval)
      
      const sessionEnd = Date.now()
      sessionData.endTime = sessionEnd
      sessionData.duration = sessionEnd - sessionStart
      
      // Get final analytics
      if (this.analyticsDashboard) {
        sessionData.insights = this.analyticsDashboard.getRecentInsights()
        sessionData.skillImprovements = this.analyticsDashboard.getSkillProgressions()
      }

      console.log('🎓 Learning session completed:', sessionData)
    }, duration)

    return sessionData
  }

  /**
   * Helper methods
   */
  private getRegionPosition(region: string): any {
    const regionPositions: Record<string, any> = {
      'head_neck': { x: 0, y: 2, z: 0 },
      'chest': { x: 0, y: 0.5, z: 0 },
      'abdomen': { x: 0, y: -0.5, z: 0 },
      'pelvis': { x: 0, y: -1.5, z: 0 },
      'general': { x: 0, y: 0, z: 0 }
    }
    
    return regionPositions[region] || regionPositions['general']
  }

  private calculateOverallProgress(summary: any, skills: any[]): any {
    const avgAccuracy = summary.averageAccuracy || 0
    const avgEfficiency = summary.averageEfficiency || 0
    const avgSkillMastery = skills.length > 0 
      ? skills.reduce((sum, skill) => sum + skill.masteryPercentage, 0) / skills.length / 100
      : 0

    const overallScore = (avgAccuracy + avgEfficiency + avgSkillMastery) / 3

    return {
      overallScore: overallScore * 100,
      accuracy: avgAccuracy * 100,
      efficiency: avgEfficiency * 100,
      skillMastery: avgSkillMastery * 100,
      level: overallScore > 0.8 ? 'Expert' : overallScore > 0.6 ? 'Competent' : 'Developing'
    }
  }

  private generateNextSteps(recommendations: any[], insights: any[]): string[] {
    const nextSteps: string[] = []

    // Add top recommendations
    recommendations.slice(0, 2).forEach(rec => {
      nextSteps.push(`📚 ${rec.title}: ${rec.description}`)
    })

    // Add actionable insights
    insights.filter(insight => insight.actionable).slice(0, 2).forEach(insight => {
      nextSteps.push(`💡 ${insight.title}: ${insight.description}`)
    })

    if (nextSteps.length === 0) {
      nextSteps.push('🎯 Continue practicing to unlock personalized recommendations!')
    }

    return nextSteps
  }

  private showEnhancedModeNotification(title: string, content: string): void {
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.95));
      color: #00ff88;
      padding: 30px;
      border-radius: 15px;
      border: 2px solid #00ff88;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 136, 0.3);
      z-index: 10000;
      font-family: 'Courier New', monospace;
      text-align: center;
      backdrop-filter: blur(10px);
      max-width: 600px;
      animation: slideIn 0.5s ease-out;
    `
    
    notification.innerHTML = `
      <div style="font-size: 20px; font-weight: bold; color: #ffaa00; margin-bottom: 15px;">
        📊 ${title}
      </div>
      <div style="font-size: 14px; white-space: pre-line; line-height: 1.5;">
        ${content}
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #00d4ff;">
        Enhanced Medical Mystery Game - Analytics Dashboard
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0'
        notification.style.transform = 'translate(-50%, -50%) scale(0.9)'
        notification.style.transition = 'all 0.3s ease-out'
        
        setTimeout(() => {
          notification.parentNode?.removeChild(notification)
        }, 300)
      }
    }, 6000)
  }

  /**
   * Update all enhanced systems including analytics
   */
  public update(): void {
    // Update Phase 3.1 systems
    if (this.phase3Integration) {
      this.phase3Integration.update()
    }

    // Analytics dashboard updates automatically via real-time updates
  }

  /**
   * Cleanup and destroy all systems
   */
  public destroy(): void {
    this.disableEnhancedMode()
    this.canvas.dispose()
    
    console.log('🎮 X-RAI Enhanced Application (Analytics) destroyed')
  }
}

// Example usage with Analytics Dashboard:
/*
// Initialize the enhanced application with analytics
const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
const app = new XRAIEnhancedApplicationAnalytics(canvasElement)

// Enable enhanced mode with analytics
await app.enableEnhancedMode({
  difficultyProfile: 'intermediate',
  enableAudio: true,
  enableVisualEffects: true,
  enableConsultation: true,
  enableMobileOptimization: true,
  enableAnalytics: true,
  performanceMode: 'auto'
})

// Start an enhanced case with analytics tracking
const medicalCase = {
  id: 'analytics-case-001',
  title: 'TMJ Dysfunction with Analytics Tracking',
  // ... other case properties
}
await app.startEnhancedCase(medicalCase)

// Show analytics dashboard
app.showAnalyticsDashboard()

// Perform investigation with analytics tracking
await app.performInvestigationTechnique('palpation', 'head_neck')

// Get learning insights
const insights = app.getLearningInsights()
console.log('Learning insights:', insights)

// Get personalized recommendations
const recommendations = app.getRecommendations()
console.log('Recommendations:', recommendations)

// Generate comprehensive learning report
const report = app.generateLearningReport()
console.log('Learning report:', report)

// Simulate a learning session
const sessionData = await app.simulateLearningSession(60000) // 1 minute
console.log('Session data:', sessionData)

// Export comprehensive analytics
const analytics = app.exportAnalyticsData()
console.log('Complete analytics:', analytics)

// Check system status including analytics
console.log('System status:', app.getEnhancedSystemsStatus())

// Update systems in animation loop
function animate() {
  app.update()
  requestAnimationFrame(animate)
}
animate()

// Cleanup when done
app.destroy()
*/

export default XRAIEnhancedApplicationAnalytics