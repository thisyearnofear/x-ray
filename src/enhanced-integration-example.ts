/**
 * Enhanced Integration Example
 * DEMONSTRATION: How to integrate enhanced systems with existing X-RAI application
 * USAGE: Import and use this in your main application file
 */

import Canvas from './canvas'
import { EnhancedCanvasIntegration } from './domains/diagnostic/EnhancedCanvasIntegration'
import { EnhancedDiagnosticUI } from './domains/diagnostic/EnhancedDiagnosticUI'
import { EnhancedGameManager } from './domains/diagnostic/EnhancedGameManager'
import { MedicalCase } from './domains/medical/types'

export class XRAIEnhancedApplication {
  private canvas: Canvas
  private enhancedCanvasIntegration: EnhancedCanvasIntegration | null = null
  private enhancedDiagnosticUI: EnhancedDiagnosticUI | null = null
  private enhancedGameManager: EnhancedGameManager | null = null
  private isEnhancedModeActive: boolean = false

  constructor(canvasElement: HTMLCanvasElement) {
    // Initialize the existing canvas system
    this.canvas = new Canvas(canvasElement)
    
    console.log('🎮 X-RAI Enhanced Application initialized')
  }

  /**
   * Enable enhanced medical mystery game features
   */
  public async enableEnhancedMode(difficultyProfile: string = 'intermediate'): Promise<void> {
    if (this.isEnhancedModeActive) {
      console.warn('Enhanced mode is already active')
      return
    }

    try {
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
          onConsultationClick: () => this.startVoiceConsultation()
        })
        
        // Initialize enhanced UI
        this.enhancedDiagnosticUI.initialize()
      }
      
      // Create enhanced canvas integration
      this.enhancedCanvasIntegration = new EnhancedCanvasIntegration({
        canvas: this.canvas,
        diagnosticUI: this.enhancedDiagnosticUI || this.canvas.diagnosticUI!,
        difficultyProfile
      })
      
      this.isEnhancedModeActive = true
      
      // Show enhanced mode activation notification
      this.showEnhancedModeNotification('Enhanced Mode Activated', `
        🎯 Adaptive Difficulty: ${difficultyProfile}
        🔍 Progressive Revelation: Enabled
        🔬 Investigation Toolkit: Available
        📚 Narrative Depth: Active
      `)
      
      console.log('🎮 Enhanced mode enabled successfully')
    } catch (error) {
      console.error('Failed to enable enhanced mode:', error)
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
      // Disable enhanced canvas integration
      if (this.enhancedCanvasIntegration) {
        this.enhancedCanvasIntegration.destroy()
        this.enhancedCanvasIntegration = null
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
   * Start an enhanced medical case
   */
  public async startEnhancedCase(medicalCase: MedicalCase): Promise<void> {
    if (!this.isEnhancedModeActive) {
      throw new Error('Enhanced mode must be enabled before starting enhanced cases')
    }

    if (!this.enhancedCanvasIntegration || !this.enhancedGameManager) {
      throw new Error('Enhanced systems not properly initialized')
    }

    try {
      // Enable enhanced mode on canvas integration
      this.enhancedCanvasIntegration.enableEnhancedMode(medicalCase)
      
      // Start the enhanced case
      await this.enhancedGameManager.startCase(medicalCase)
      
      console.log('🎮 Enhanced case started:', medicalCase.id)
    } catch (error) {
      console.error('Failed to start enhanced case:', error)
      throw error
    }
  }

  /**
   * Get current enhanced game state
   */
  public getEnhancedGameState(): any {
    if (!this.enhancedGameManager) {
      return null
    }
    
    return this.enhancedGameManager.getGameState()
  }

  /**
   * Export comprehensive analytics from enhanced systems
   */
  public exportEnhancedAnalytics(): any {
    if (!this.enhancedGameManager) {
      return null
    }
    
    return {
      enhancedGameManager: this.enhancedGameManager.getAnalyticsData(),
      canvasIntegration: this.enhancedCanvasIntegration?.exportEnhancedAnalytics(),
      diagnosticUI: this.enhancedDiagnosticUI?.exportEnhancedAnalytics(),
      timestamp: Date.now()
    }
  }

  /**
   * Check if enhanced mode is active
   */
  public isEnhancedMode(): boolean {
    return this.isEnhancedModeActive
  }

  /**
   * Get enhanced systems status
   */
  public getEnhancedSystemsStatus(): any {
    return {
      isEnhancedModeActive: this.isEnhancedModeActive,
      enhancedGameManager: !!this.enhancedGameManager,
      enhancedCanvasIntegration: !!this.enhancedCanvasIntegration,
      enhancedDiagnosticUI: !!this.enhancedDiagnosticUI,
      currentCase: this.enhancedGameManager?.getCurrentCase()?.id,
      systemStatus: this.enhancedGameManager?.getSystemStatus()
    }
  }

  /**
   * Switch difficulty profile in enhanced mode
   */
  public switchDifficultyProfile(profileName: string): boolean {
    if (!this.isEnhancedModeActive || !this.enhancedGameManager) {
      console.warn('Enhanced mode must be active to switch difficulty profiles')
      return false
    }

    try {
      // This would require extending the enhanced game manager
      // For now, we'll restart enhanced mode with the new profile
      const currentCase = this.enhancedGameManager.getCurrentCase()
      
      this.disableEnhancedMode()
      this.enableEnhancedMode(profileName)
      
      if (currentCase) {
        this.startEnhancedCase(currentCase)
      }
      
      this.showEnhancedModeNotification('Difficulty Profile Changed', `
        New Profile: ${profileName}
        Adaptive systems reset
      `)
      
      return true
    } catch (error) {
      console.error('Failed to switch difficulty profile:', error)
      return false
    }
  }

  private startVoiceConsultation(): void {
    // Use existing voice consultation from canvas
    if (this.canvas.voiceConsultation) {
      const gameState = this.enhancedGameManager?.getGameState() || this.canvas.gameManager?.getGameState()
      
      if (gameState) {
        const context = {
          patientCase: (gameState as any).patientCase || { patientName: 'Enhanced Patient' },
          discoveredConditions: (gameState as any).discoveredConditions || new Set(),
          scanProgress: new Map(),
          timeRemaining: (gameState as any).sessionMetrics?.totalTime || 300,
          gamePhase: (gameState as any).currentPhase || 'scanning',
          currentScore: (gameState as any).performance?.diagnosticAccuracy || 0
        }
        
        this.canvas.voiceConsultation.startConsultation(context)
      }
    }
  }

  private showEnhancedModeNotification(title: string, content: string): void {
    // Create a styled notification
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
      max-width: 500px;
    `
    
    notification.innerHTML = `
      <div style="font-size: 18px; font-weight: bold; color: #ffaa00; margin-bottom: 15px;">
        🎮 ${title}
      </div>
      <div style="font-size: 14px; white-space: pre-line; line-height: 1.5;">
        ${content}
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #00d4ff;">
        Enhanced Medical Mystery Game
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0'
        notification.style.transform = 'translate(-50%, -50%) scale(0.9)'
        notification.style.transition = 'all 0.3s ease-out'
        
        setTimeout(() => {
          notification.parentNode?.removeChild(notification)
        }, 300)
      }
    }, 5000)
  }

  /**
   * Cleanup and destroy all systems
   */
  public destroy(): void {
    this.disableEnhancedMode()
    this.canvas.dispose()
    
    console.log('🎮 X-RAI Enhanced Application destroyed')
  }
}

// Example usage:
/*
// Initialize the enhanced application
const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
const app = new XRAIEnhancedApplication(canvasElement)

// Enable enhanced mode
await app.enableEnhancedMode('intermediate')

// Start an enhanced case
const medicalCase = {
  id: 'enhanced-case-001',
  title: 'TMJ Dysfunction with Adaptive Features',
  // ... other case properties
}
await app.startEnhancedCase(medicalCase)

// Check enhanced systems status
console.log('Enhanced systems status:', app.getEnhancedSystemsStatus())

// Export analytics
const analytics = app.exportEnhancedAnalytics()
console.log('Enhanced analytics:', analytics)

// Switch difficulty profile
app.switchDifficultyProfile('advanced')

// Disable enhanced mode when done
app.disableEnhancedMode()
*/

export default XRAIEnhancedApplication