/**
 * Enhanced Integration Example - Phase 3.1
 * COMPREHENSIVE: Complete integration example with all Phase 3.1 enhancements
 * PRODUCTION-READY: Real-world usage patterns and best practices
 * ADAPTIVE: Responds to device capabilities and user preferences
 */

import Canvas from './canvas'
import { EnhancedGameManager } from './domains/diagnostic/EnhancedGameManager'
import { EnhancedDiagnosticUI } from './domains/diagnostic/EnhancedDiagnosticUI'
import { Phase3Integration } from './domains/enhancement/Phase3Integration'
import { MedicalCase } from './domains/medical/types'

export class XRAIEnhancedApplicationPhase3 {
  private canvas: Canvas
  private enhancedGameManager: EnhancedGameManager | null = null
  private enhancedDiagnosticUI: EnhancedDiagnosticUI | null = null
  private phase3Integration: Phase3Integration | null = null
  private isEnhancedModeActive: boolean = false
  private currentDifficultyProfile: string = 'intermediate'

  constructor(canvasElement: HTMLCanvasElement) {
    // Initialize the existing canvas system
    this.canvas = new Canvas(canvasElement)
    
    console.log('🎮 X-RAI Enhanced Application (Phase 3.1) initialized')
  }

  /**
   * Enable enhanced mode with Phase 3.1 features
   */
  public async enableEnhancedMode(options: {
    difficultyProfile?: string
    enableAudio?: boolean
    enableVisualEffects?: boolean
    enableConsultation?: boolean
    enableMobileOptimization?: boolean
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
      
      this.isEnhancedModeActive = true
      
      // Show enhanced mode activation notification
      this.showEnhancedModeNotification('Phase 3.1 Enhanced Mode Activated', `
        🎯 Adaptive Difficulty: ${difficultyProfile}
        🎵 Audio Enhancements: ${enableAudio ? 'Enabled' : 'Disabled'}
        ✨ Visual Effects: ${enableVisualEffects ? 'Enabled' : 'Disabled'}
        🏥 Enhanced Consultation: ${enableConsultation ? 'Enabled' : 'Disabled'}
        📱 Mobile Optimization: ${enableMobileOptimization ? 'Enabled' : 'Disabled'}
        ⚡ Performance Mode: ${performanceMode}
      `)
      
      console.log('🎮 Phase 3.1 enhanced mode enabled successfully')
    } catch (error) {
      console.error('Failed to enable Phase 3.1 enhanced mode:', error)
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
   * Start an enhanced medical case with Phase 3.1 features
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
      
      console.log('🎮 Enhanced case started with Phase 3.1 features:', medicalCase.id)
    } catch (error) {
      console.error('Failed to start enhanced case:', error)
      throw error
    }
  }

  /**
   * Trigger investigation technique with Phase 3.1 effects
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

      console.log(`🔬 Investigation technique performed: ${technique} on ${region}`)
    } catch (error) {
      console.error('Failed to perform investigation technique:', error)
    }
  }

  /**
   * Show enhanced consultation UI
   */
  public showConsultationUI(): void {
    if (this.phase3Integration) {
      this.phase3Integration.showConsultationUI()
    }
  }

  /**
   * Hide enhanced consultation UI
   */
  public hideConsultationUI(): void {
    if (this.phase3Integration) {
      this.phase3Integration.hideConsultationUI()
    }
  }

  /**
   * Adjust performance level dynamically
   */
  public setPerformanceLevel(level: 'high' | 'medium' | 'low'): void {
    if (this.phase3Integration) {
      this.phase3Integration.setPerformanceLevel(level)
      
      this.showEnhancedModeNotification('Performance Level Changed', `
        Performance level set to: ${level}
        Visual and audio quality adjusted accordingly
      `)
    }
  }

  /**
   * Toggle audio enhancements
   */
  public toggleAudioEnhancements(enabled: boolean): void {
    if (this.phase3Integration) {
      this.phase3Integration.enableAudioEnhancements(enabled)
      
      this.showEnhancedModeNotification('Audio Settings Changed', `
        Audio enhancements: ${enabled ? 'Enabled' : 'Disabled'}
      `)
    }
  }

  /**
   * Get comprehensive system status
   */
  public getEnhancedSystemsStatus(): any {
    const baseStatus = {
      isEnhancedModeActive: this.isEnhancedModeActive,
      enhancedGameManager: !!this.enhancedGameManager,
      enhancedDiagnosticUI: !!this.enhancedDiagnosticUI,
      phase3Integration: !!this.phase3Integration,
      currentCase: this.enhancedGameManager?.getCurrentCase()?.id,
      difficultyProfile: this.currentDifficultyProfile
    }

    if (this.phase3Integration) {
      return {
        ...baseStatus,
        phase3Status: this.phase3Integration.getStatus()
      }
    }

    return baseStatus
  }

  /**
   * Export comprehensive analytics including Phase 3.1 data
   */
  public exportEnhancedAnalytics(): any {
    const baseAnalytics = {
      enhancedGameManager: this.enhancedGameManager?.getAnalyticsData(),
      diagnosticUI: this.enhancedDiagnosticUI?.exportEnhancedAnalytics(),
      timestamp: Date.now()
    }

    if (this.phase3Integration) {
      return {
        ...baseAnalytics,
        phase3Analytics: this.phase3Integration.getStatus()
      }
    }

    return baseAnalytics
  }

  /**
   * Update all enhanced systems
   */
  public update(): void {
    // Update Phase 3.1 systems
    if (this.phase3Integration) {
      this.phase3Integration.update()
    }

    // Update enhanced game manager
    if (this.enhancedGameManager) {
      // Enhanced game manager update would go here
    }
  }

  /**
   * Handle device orientation change (mobile optimization)
   */
  public handleOrientationChange(): void {
    if (this.phase3Integration) {
      // Phase 3.1 mobile optimization handles this automatically
      console.log('📱 Orientation change handled by Phase 3.1 mobile optimization')
    }
  }

  /**
   * Simulate realistic consultation workflow
   */
  public async simulateConsultationWorkflow(specialistType: string): Promise<void> {
    if (!this.isEnhancedModeActive || !this.enhancedGameManager) {
      console.warn('Enhanced mode not active')
      return
    }

    try {
      // Request consultation through enhanced game manager
      const events = await this.enhancedGameManager.processAction({
        type: 'consult',
        data: { 
          specialistType,
          urgency: 'routine',
          findings: ['TMJ dysfunction suspected'],
          questions: ['What additional imaging would you recommend?']
        },
        timestamp: Date.now()
      })

      // Show consultation UI
      this.showConsultationUI()

      console.log(`🏥 Consultation workflow initiated with ${specialistType}`)
    } catch (error) {
      console.error('Failed to simulate consultation workflow:', error)
    }
  }

  /**
   * Helper methods
   */
  private getRegionPosition(region: string): any {
    // Map anatomical regions to 3D positions
    const regionPositions: Record<string, any> = {
      'head_neck': { x: 0, y: 2, z: 0 },
      'chest': { x: 0, y: 0.5, z: 0 },
      'abdomen': { x: 0, y: -0.5, z: 0 },
      'pelvis': { x: 0, y: -1.5, z: 0 },
      'general': { x: 0, y: 0, z: 0 }
    }
    
    return regionPositions[region] || regionPositions['general']
  }

  private showEnhancedModeNotification(title: string, content: string): void {
    // Create a styled notification with Phase 3.1 enhancements
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
        🚀 ${title}
      </div>
      <div style="font-size: 14px; white-space: pre-line; line-height: 1.5;">
        ${content}
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #00d4ff;">
        Enhanced Medical Mystery Game - Phase 3.1
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
   * Cleanup and destroy all systems
   */
  public destroy(): void {
    this.disableEnhancedMode()
    this.canvas.dispose()
    
    console.log('🎮 X-RAI Enhanced Application (Phase 3.1) destroyed')
  }
}

// Example usage with Phase 3.1 features:
/*
// Initialize the enhanced application with Phase 3.1
const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
const app = new XRAIEnhancedApplicationPhase3(canvasElement)

// Enable enhanced mode with Phase 3.1 features
await app.enableEnhancedMode({
  difficultyProfile: 'intermediate',
  enableAudio: true,
  enableVisualEffects: true,
  enableConsultation: true,
  enableMobileOptimization: true,
  performanceMode: 'auto'
})

// Start an enhanced case
const medicalCase = {
  id: 'enhanced-case-phase3-001',
  title: 'TMJ Dysfunction with Phase 3.1 Features',
  // ... other case properties
}
await app.startEnhancedCase(medicalCase)

// Perform investigation with visual and audio effects
await app.performInvestigationTechnique('palpation', 'head_neck')

// Show consultation UI
app.showConsultationUI()

// Simulate consultation workflow
await app.simulateConsultationWorkflow('oral_maxillofacial')

// Adjust performance based on device capabilities
app.setPerformanceLevel('medium')

// Check comprehensive system status
console.log('Phase 3.1 systems status:', app.getEnhancedSystemsStatus())

// Export comprehensive analytics
const analytics = app.exportEnhancedAnalytics()
console.log('Phase 3.1 analytics:', analytics)

// Update systems in animation loop
function animate() {
  app.update()
  requestAnimationFrame(animate)
}
animate()

// Cleanup when done
app.destroy()
*/

export default XRAIEnhancedApplicationPhase3