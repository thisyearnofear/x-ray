/**
 * Enhanced Canvas Integration
 * INTEGRATION: Connects enhanced systems with existing 3D canvas and UI
 * SEAMLESS: Maintains existing functionality while adding new features
 * PERFORMANT: Optimized for real-time interaction and feedback
 */

import Canvas from '../../canvas'
import { EnhancedGameManager, GameAction, GameEvent } from './EnhancedGameManager'
import { DiagnosticUIFacade } from './DiagnosticUIFacade'
import { MedicalCase } from '../medical/types'
import { ProgressiveRevelationManager } from '../revelation/ProgressiveRevelationManager'
import { InvestigationToolkit } from '../investigation/InvestigationToolkit'
import * as THREE from 'three'

export interface EnhancedCanvasConfig {
  canvas: Canvas
  diagnosticUI: DiagnosticUIFacade
  difficultyProfile?: string
}

export class EnhancedCanvasIntegration {
  private canvas: Canvas
  private diagnosticUI: DiagnosticUIFacade
  private enhancedGameManager: EnhancedGameManager
  private isEnhancedMode: boolean = false
  private scanProgressMap: Map<string, number> = new Map()
  private lastScanUpdate: number = 0
  private scanUpdateThrottle: number = 100 // ms

  constructor(config: EnhancedCanvasConfig) {
    this.canvas = config.canvas
    this.diagnosticUI = config.diagnosticUI
    this.enhancedGameManager = new EnhancedGameManager(config.difficultyProfile)
    
    this.setupEnhancedIntegration()
    console.log('🎮 Enhanced Canvas Integration initialized')
  }

  private setupEnhancedIntegration(): void {
    // Connect enhanced game manager events to UI updates
    this.enhancedGameManager.addEventListener('revelation', (event: GameEvent) => {
      this.handleRevelationEvent(event)
    })

    this.enhancedGameManager.addEventListener('consultation_complete', (event: GameEvent) => {
      this.handleConsultationEvent(event)
    })

    this.enhancedGameManager.addEventListener('narrative_choice', (event: GameEvent) => {
      this.handleNarrativeEvent(event)
    })

    this.enhancedGameManager.addEventListener('difficulty_adjusted', (event: GameEvent) => {
      this.handleDifficultyEvent(event)
    })

    // Enhance existing mouse movement handling
    this.enhanceMouseMovement()
    
    // Enhance existing scanning feedback
    this.enhanceScanningFeedback()
    
    // Add enhanced keyboard shortcuts
    this.addEnhancedKeyboardShortcuts()
  }

  /**
   * Enable enhanced mode with all new features
   */
  public enableEnhancedMode(medicalCase: MedicalCase): void {
    this.isEnhancedMode = true
    
    // Start enhanced case
    this.enhancedGameManager.startCase(medicalCase)
    
    // Update UI to show enhanced features
    this.showEnhancedUI()
    
    console.log('🎮 Enhanced mode enabled for case:', medicalCase.id)
  }

  /**
   * Disable enhanced mode and return to basic functionality
   */
  public disableEnhancedMode(): void {
    this.isEnhancedMode = false
    this.enhancedGameManager.reset()
    this.hideEnhancedUI()
    
    console.log('🎮 Enhanced mode disabled')
  }

  private enhanceMouseMovement(): void {
    // Store original mouse move handler
    const originalMouseMove = this.canvas.onMouseMove

    // Create enhanced mouse move handler
    this.canvas.onMouseMove = (event: MouseEvent) => {
      // Call original handler first
      originalMouseMove.call(this.canvas, event)
      
      // Add enhanced functionality if in enhanced mode
      if (this.isEnhancedMode) {
        this.handleEnhancedMouseMove(event)
      }
    }
  }

  private handleEnhancedMouseMove(event: MouseEvent): void {
    // Throttle scan updates for performance
    const now = Date.now()
    if (now - this.lastScanUpdate < this.scanUpdateThrottle) {
      return
    }
    this.lastScanUpdate = now

    // Calculate scan region based on mouse position
    const region = this.calculateScanRegion(event.clientX, event.clientY)
    if (!region) return

    // Update scan progress for the region
    const currentProgress = this.scanProgressMap.get(region) || 0
    const newProgress = Math.min(currentProgress + 0.02, 1.0) // Gradual progress
    this.scanProgressMap.set(region, newProgress)

    // Process scan action through enhanced game manager
    this.processScanAction(region, newProgress)
  }

  private calculateScanRegion(x: number, y: number): string | null {
    // Convert screen coordinates to anatomical regions
    const normalizedX = x / window.innerWidth
    const normalizedY = y / window.innerHeight

    // Define anatomical regions based on screen position
    // This is a simplified mapping - in a real implementation, 
    // this would use 3D raycasting to determine actual anatomy
    if (normalizedY < 0.3) {
      return 'head_neck'
    } else if (normalizedY < 0.5) {
      return 'chest'
    } else if (normalizedY < 0.7) {
      return 'abdomen'
    } else {
      return 'pelvis'
    }
  }

  private async processScanAction(region: string, progress: number): Promise<void> {
    const action: GameAction = {
      type: 'scan',
      data: { region, progress },
      timestamp: Date.now(),
      region
    }

    try {
      const events = await this.enhancedGameManager.processAction(action)
      
      // Update UI based on events
      events.forEach(event => {
        if (event.type === 'revelation') {
          this.updateScanVisualization(region, progress, event.data.revealed)
        }
      })
    } catch (error) {
      console.error('Failed to process scan action:', error)
    }
  }

  private enhanceScanningFeedback(): void {
    // Enhance the existing scan feedback system
    if (this.canvas.scanFeedbackSystem) {
      // Store original update method
      const originalUpdate = this.canvas.scanFeedbackSystem.update.bind(this.canvas.scanFeedbackSystem)
      
      // Enhance with progressive revelation feedback
      this.canvas.scanFeedbackSystem.update = (deltaTime: number) => {
        originalUpdate(deltaTime)
        
        if (this.isEnhancedMode) {
          this.updateEnhancedScanFeedback(deltaTime)
        }
      }
    }
  }

  private updateEnhancedScanFeedback(deltaTime: number): void {
    // Add enhanced visual feedback based on progressive revelation
    const gameState = this.enhancedGameManager.getGameState()
    
    // Update scan feedback intensity based on revelation progress
    this.scanProgressMap.forEach((progress, region) => {
      if (progress > 0.3) {
        // Add glow effect to scanned regions
        this.addRegionGlow(region, progress)
      }
    })
  }

  private addRegionGlow(region: string, intensity: number): void {
    // This would integrate with the existing ScanFeedbackSystem
    // to add visual effects to specific anatomical regions
    if (this.canvas.scanFeedbackSystem) {
      // Use existing scan feedback system to show region-specific effects
      const position = this.getRegionPosition(region)
      if (position) {
        this.canvas.scanFeedbackSystem.startScanning(region, position)
        this.canvas.scanFeedbackSystem.updateScanProgress(region, intensity)
      }
    }
  }

  private getRegionPosition(region: string): THREE.Vector3 | null {
    // Map anatomical regions to 3D positions
    const regionPositions: Record<string, { x: number; y: number; z: number }> = {
      'head_neck': { x: 0, y: 2, z: 0 },
      'chest': { x: 0, y: 0.5, z: 0 },
      'abdomen': { x: 0, y: -0.5, z: 0 },
      'pelvis': { x: 0, y: -1.5, z: 0 }
    }
    
    const pos = regionPositions[region]
    return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : null
  }

  private addEnhancedKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.isEnhancedMode) return
      if (event.target instanceof HTMLInputElement) return

      switch (event.key.toLowerCase()) {
        case 'i':
          this.showInvestigationMenu()
          break
        case 'n':
          this.showNarrativeChoices()
          break
        case 'd':
          this.toggleDifficultyInfo()
          break
        case 'r':
          this.showRevelationStatus()
          break
        case 'p':
          this.pauseEnhancedGame()
          break
      }
    })
  }

  private showInvestigationMenu(): void {
    // Show available investigation techniques
    const techniques = this.getAvailableInvestigationTechniques()
    this.showTemporaryUI('Investigation Techniques', techniques.map(t => t.name).join(', '))
  }

  private showNarrativeChoices(): void {
    // Show current narrative choices
    const gameState = this.enhancedGameManager.getGameState()
    if (gameState.narrative.ethicalChoicesMade > 0) {
      this.showTemporaryUI('Narrative Status', `${gameState.narrative.ethicalChoicesMade} ethical choices made`)
    } else {
      this.showTemporaryUI('Narrative Status', 'No narrative choices available yet')
    }
  }

  private toggleDifficultyInfo(): void {
    // Show current difficulty information
    const gameState = this.enhancedGameManager.getGameState()
    const difficultyInfo = `
      Current Level: ${(gameState.adaptiveDifficulty.currentLevel * 100).toFixed(0)}%
      Target Level: ${(gameState.adaptiveDifficulty.targetLevel * 100).toFixed(0)}%
      Confidence: ${(gameState.adaptiveDifficulty.confidence * 100).toFixed(0)}%
    `
    this.showTemporaryUI('Adaptive Difficulty', difficultyInfo)
  }

  private showRevelationStatus(): void {
    // Show progressive revelation status
    const gameState = this.enhancedGameManager.getGameState()
    const revelationInfo = `
      Total Revealed: ${gameState.revelation.totalRevealed}
      Red Herrings: ${gameState.revelation.redHerringsEncountered}
      Accuracy: ${(gameState.revelation.clinicalJudgmentAccuracy * 100).toFixed(0)}%
    `
    this.showTemporaryUI('Revelation Status', revelationInfo)
  }

  private pauseEnhancedGame(): void {
    this.enhancedGameManager.pause()
    this.showTemporaryUI('Game Paused', 'Press P again to resume')
  }

  private showTemporaryUI(title: string, content: string): void {
    // Create temporary UI overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 20, 40, 0.95);
      color: #00ff88;
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #00ff88;
      z-index: 10000;
      font-family: monospace;
      text-align: center;
      backdrop-filter: blur(10px);
    `
    
    overlay.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #ffaa00;">${title}</h3>
      <pre style="margin: 0; white-space: pre-wrap;">${content}</pre>
    `
    
    document.body.appendChild(overlay)
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay)
      }
    }, 3000)
  }

  private showEnhancedUI(): void {
    // Add enhanced UI elements
    this.addEnhancedStatusPanel()
    this.addInvestigationToolbar()
    this.addNarrativePanel()
  }

  private hideEnhancedUI(): void {
    // Remove enhanced UI elements
    const enhancedElements = document.querySelectorAll('.enhanced-ui-element')
    enhancedElements.forEach(element => element.remove())
  }

  private addEnhancedStatusPanel(): void {
    const statusPanel = document.createElement('div')
    statusPanel.className = 'enhanced-ui-element'
    statusPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 20, 40, 0.9);
      color: #00ff88;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #00ff88;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      backdrop-filter: blur(10px);
    `
    
    statusPanel.innerHTML = `
      <div style="color: #ffaa00; font-weight: bold; margin-bottom: 5px;">Enhanced Mode</div>
      <div id="enhanced-status-content">Initializing...</div>
    `
    
    document.body.appendChild(statusPanel)
    
    // Update status periodically
    setInterval(() => {
      this.updateEnhancedStatusPanel()
    }, 1000)
  }

  private updateEnhancedStatusPanel(): void {
    const statusContent = document.getElementById('enhanced-status-content')
    if (!statusContent || !this.isEnhancedMode) return
    
    const gameState = this.enhancedGameManager.getGameState()
    const systemStatus = this.enhancedGameManager.getSystemStatus()
    
    statusContent.innerHTML = `
      Difficulty: ${(gameState.adaptiveDifficulty.currentLevel * 100).toFixed(0)}%<br>
      Revealed: ${gameState.revelation.totalRevealed}<br>
      Investigations: ${gameState.investigation.techniquesUsed.length}<br>
      Pending: ${systemStatus.investigation.pendingResults}<br>
      Ethical Choices: ${gameState.narrative.ethicalChoicesMade}
    `
  }

  private addInvestigationToolbar(): void {
    const toolbar = document.createElement('div')
    toolbar.className = 'enhanced-ui-element'
    toolbar.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 20, 40, 0.9);
      color: #00ff88;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #00ff88;
      display: flex;
      gap: 10px;
      z-index: 1000;
      backdrop-filter: blur(10px);
    `
    
    const techniques = this.getAvailableInvestigationTechniques()
    techniques.slice(0, 5).forEach(technique => {
      const button = document.createElement('button')
      button.textContent = technique.name
      button.style.cssText = `
        background: rgba(0, 255, 136, 0.2);
        color: #00ff88;
        border: 1px solid #00ff88;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      `
      
      button.addEventListener('click', () => {
        this.performInvestigationTechnique(technique.id)
      })
      
      toolbar.appendChild(button)
    })
    
    document.body.appendChild(toolbar)
  }

  private addNarrativePanel(): void {
    const panel = document.createElement('div')
    panel.className = 'enhanced-ui-element'
    panel.id = 'narrative-panel'
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
      background: rgba(0, 20, 40, 0.9);
      color: #00ff88;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #00ff88;
      max-width: 300px;
      z-index: 1000;
      backdrop-filter: blur(10px);
      display: none;
    `
    
    document.body.appendChild(panel)
  }

  private getAvailableInvestigationTechniques(): any[] {
    // Return mock investigation techniques
    // In a real implementation, this would come from the InvestigationToolkit
    return [
      { id: 'palpation', name: 'Palpation' },
      { id: 'auscultation', name: 'Auscultation' },
      { id: 'percussion', name: 'Percussion' },
      { id: 'inspection', name: 'Inspection' },
      { id: 'reflex_test', name: 'Reflex Test' }
    ]
  }

  private async performInvestigationTechnique(techniqueId: string): Promise<void> {
    const action: GameAction = {
      type: 'investigate',
      data: { technique: techniqueId, region: 'general' },
      timestamp: Date.now(),
      technique: techniqueId
    }

    try {
      const events = await this.enhancedGameManager.processAction(action)
      
      events.forEach(event => {
        if (event.type === 'revelation' && event.data.type === 'examination_result') {
          this.showInvestigationResult(event.data.result)
        }
      })
    } catch (error) {
      console.error('Failed to perform investigation technique:', error)
    }
  }

  private showInvestigationResult(result: any): void {
    this.showTemporaryUI('Investigation Result', `
      Technique: ${result.techniqueId}
      Findings: ${result.findings.join(', ')}
      Significance: ${(result.clinicalSignificance * 100).toFixed(0)}%
    `)
  }

  /**
   * Event handlers for enhanced game events
   */
  private handleRevelationEvent(event: GameEvent): void {
    if (event.data.type === 'case_started') {
      this.showPatientBackstory(event.data.backstory)
    } else if (event.data.revealed) {
      this.updateProgressiveRevelation(event.data.region, event.data.revealed)
    }
  }

  private handleConsultationEvent(event: GameEvent): void {
    if (event.data.consultation) {
      this.showConsultationResult(event.data.consultation)
    }
  }

  private handleNarrativeEvent(event: GameEvent): void {
    if (event.data.choices) {
      this.showNarrativeChoicesPanel(event.data.choices)
    }
  }

  private handleDifficultyEvent(event: GameEvent): void {
    this.showTemporaryUI('Difficulty Adjusted', `
      New Level: ${(event.data.metrics.currentLevel * 100).toFixed(0)}%
      Confidence: ${(event.data.metrics.confidence * 100).toFixed(0)}%
    `)
  }

  private showPatientBackstory(backstory: any): void {
    // Show patient backstory in a modal or panel
    this.showTemporaryUI('Patient Background', `
      Occupation: ${backstory.personalBackground.occupation}
      Stress Level: ${(backstory.psychosocialFactors.stressLevel * 100).toFixed(0)}%
      Quality of Life: ${backstory.presentingContext.qualityOfLifeScore}/10
    `)
  }

  private updateProgressiveRevelation(region: string, revealed: any[]): void {
    // Update UI to show newly revealed information
    revealed.forEach(data => {
      this.showTemporaryUI(`New Finding - ${region}`, `
        Type: ${data.type}
        Content: ${data.content}
        Significance: ${data.significance}
      `)
    })
  }

  private updateScanVisualization(region: string, progress: number, revealed?: any[]): void {
    // Update 3D visualization based on scan progress
    if (this.canvas.scanFeedbackSystem) {
      const position = this.getRegionPosition(region)
      if (position) {
        this.canvas.scanFeedbackSystem.updateScanProgress(region, progress)
        
        if (revealed && revealed.length > 0) {
          // Add special effects for revelations
          this.canvas.scanFeedbackSystem.startScanning(region, position)
        }
      }
    }
  }

  private showConsultationResult(consultation: any): void {
    this.showTemporaryUI('Consultation Complete', `
      Specialist: ${consultation.specialist}
      Recommendations: ${consultation.recommendations.slice(0, 2).join(', ')}
      Confidence: ${(consultation.confidence * 100).toFixed(0)}%
    `)
  }

  private showNarrativeChoicesPanel(choices: any[]): void {
    const panel = document.getElementById('narrative-panel')
    if (!panel) return
    
    panel.style.display = 'block'
    
    const choicesHtml = choices.map(choice => {
      const optionsHtml = choice.options.map((option: any) => {
        return `
          <button onclick="window.enhancedCanvas.makeNarrativeChoice('${choice.id}', '${option.id}')"
                  style="display: block; width: 100%; margin: 5px 0; padding: 8px; 
                         background: rgba(0, 255, 136, 0.2); color: #00ff88; 
                         border: 1px solid #00ff88; border-radius: 4px; cursor: pointer;">
            ${option.text}
          </button>
        `
      }).join('')
      
      return `
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; margin-bottom: 5px;">${choice.prompt}</div>
          ${optionsHtml}
        </div>
      `
    }).join('')
    
    panel.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #ffaa00;">Narrative Choice</h3>
      ${choicesHtml}
    `
    
    // Make this instance globally accessible for button clicks
    ;(window as any).enhancedCanvas = this
  }

  public async makeNarrativeChoice(choiceId: string, optionId: string): Promise<void> {
    const action: GameAction = {
      type: 'decide',
      data: { choiceId, optionId, reasoning: 'Player choice' },
      timestamp: Date.now()
    }

    try {
      await this.enhancedGameManager.processAction(action)
      
      // Hide narrative panel
      const panel = document.getElementById('narrative-panel')
      if (panel) {
        panel.style.display = 'none'
      }
    } catch (error) {
      console.error('Failed to process narrative choice:', error)
    }
  }

  /**
   * Public interface methods
   */
  public getEnhancedGameManager(): EnhancedGameManager {
    return this.enhancedGameManager
  }

  public isInEnhancedMode(): boolean {
    return this.isEnhancedMode
  }

  public getEnhancedGameState(): any {
    return this.enhancedGameManager.getGameState()
  }

  public exportEnhancedAnalytics(): any {
    return this.enhancedGameManager.getAnalyticsData()
  }

  public destroy(): void {
    this.disableEnhancedMode()
    this.hideEnhancedUI()
    this.enhancedGameManager.reset()
    
    // Clean up global reference
    if ((window as any).enhancedCanvas === this) {
      delete (window as any).enhancedCanvas
    }
    
    console.log('🎮 Enhanced Canvas Integration destroyed')
  }
}