/**
 * Phase 3.1 Integration Manager
 * ORCHESTRATION: Coordinates audio, visual, consultation, and mobile enhancements
 * SEAMLESS: Integrates Phase 3.1 features with existing enhanced systems
 * ADAPTIVE: Responds to device capabilities and user preferences
 */

// ENHANCEMENT: EnhancedAudioManager consolidated into AudioManager component
import { AudioManager } from '../../components/AudioManager'
import { EnhancedVisualEffects } from '../visual/EnhancedVisualEffects'
import { EnhancedConsultationUI } from '../consultation/EnhancedConsultationUI'
import { MobileOptimization } from '../mobile/MobileOptimization'
import { EnhancedGameManager, GameEvent, EnhancedGameState } from '../diagnostic/EnhancedGameManager'
import * as THREE from 'three'

export interface Phase3Config {
  enableAudioEnhancements: boolean
  enableVisualEffects: boolean
  enableEnhancedConsultation: boolean
  enableMobileOptimization: boolean
  adaptToDevice: boolean
  performanceMode: 'high' | 'medium' | 'low' | 'auto'
}

export interface Phase3Status {
  audioManager: any
  visualEffects: any
  consultationUI: any
  mobileOptimization: any
  isActive: boolean
  performanceLevel: string
}

export class Phase3Integration {
  private audioManager: AudioManager | null = null
  private enhancedVisualEffects: EnhancedVisualEffects | null = null
  private enhancedConsultationUI: EnhancedConsultationUI | null = null
  private mobileOptimization: MobileOptimization | null = null
  
  private enhancedGameManager: EnhancedGameManager | null = null
  private baseAudioManager: AudioManager | null = null
  private scene: THREE.Scene | null = null
  private renderer: THREE.WebGLRenderer | null = null
  private camera: THREE.Camera | null = null
  
  private config: Phase3Config
  private isActive: boolean = false
  private performanceLevel: 'high' | 'medium' | 'low' = 'medium'

  constructor(config: Partial<Phase3Config> = {}) {
    this.config = {
      enableAudioEnhancements: true,
      enableVisualEffects: true,
      enableEnhancedConsultation: true,
      enableMobileOptimization: true,
      adaptToDevice: true,
      performanceMode: 'auto',
      ...config
    }

    console.log('🚀 Phase 3.1 Integration Manager initialized')
  }

  /**
   * Initialize Phase 3.1 enhancements
   */
  public async initialize(dependencies: {
    enhancedGameManager: EnhancedGameManager
    baseAudioManager: AudioManager
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    camera: THREE.Camera
  }): Promise<void> {
    console.log('🚀 Initializing Phase 3.1 enhancements...')

    // Store dependencies
    this.enhancedGameManager = dependencies.enhancedGameManager
    this.baseAudioManager = dependencies.baseAudioManager
    this.scene = dependencies.scene
    this.renderer = dependencies.renderer
    this.camera = dependencies.camera

    // Determine performance level
    this.determinePerformanceLevel()

    // Initialize mobile optimization first (affects other systems)
    if (this.config.enableMobileOptimization) {
      await this.initializeMobileOptimization()
    }

    // Initialize audio enhancements
    if (this.config.enableAudioEnhancements) {
      await this.initializeAudioEnhancements()
    }

    // Initialize visual effects
    if (this.config.enableVisualEffects) {
      await this.initializeVisualEffects()
    }

    // Initialize enhanced consultation UI
    if (this.config.enableEnhancedConsultation) {
      await this.initializeConsultationUI()
    }

    // Connect all systems
    this.connectSystems()

    this.isActive = true
    console.log('✅ Phase 3.1 enhancements initialized successfully')
  }

  private determinePerformanceLevel(): void {
    if (this.config.performanceMode !== 'auto') {
      this.performanceLevel = this.config.performanceMode
      return
    }

    // Auto-detect performance level based on device capabilities
    const deviceMemory = (navigator as any).deviceMemory || 4
    const hardwareConcurrency = navigator.hardwareConcurrency || 4
    const pixelRatio = window.devicePixelRatio || 1
    const screenArea = window.innerWidth * window.innerHeight

    let score = 0

    // Memory score (0-3)
    if (deviceMemory >= 8) score += 3
    else if (deviceMemory >= 4) score += 2
    else if (deviceMemory >= 2) score += 1

    // CPU score (0-3)
    if (hardwareConcurrency >= 8) score += 3
    else if (hardwareConcurrency >= 4) score += 2
    else if (hardwareConcurrency >= 2) score += 1

    // Display score (0-2)
    if (pixelRatio <= 1 && screenArea <= 1920 * 1080) score += 2
    else if (pixelRatio <= 2) score += 1

    // Determine performance level
    if (score >= 7) {
      this.performanceLevel = 'high'
    } else if (score >= 4) {
      this.performanceLevel = 'medium'
    } else {
      this.performanceLevel = 'low'
    }

    console.log(`🚀 Auto-detected performance level: ${this.performanceLevel} (score: ${score})`)
  }

  private async initializeMobileOptimization(): Promise<void> {
    const mobileConfig = {
      enableTouchGestures: true,
      enableHapticFeedback: this.performanceLevel !== 'low',
      optimizePerformance: true,
      adaptiveUI: true,
      reducedMotion: this.performanceLevel === 'low'
    }

    this.mobileOptimization = new MobileOptimization(mobileConfig)
    console.log('📱 Mobile optimization initialized')
  }

  private async initializeAudioEnhancements(): Promise<void> {
    if (!this.baseAudioManager) {
      console.warn('Base audio manager not available')
      return
    }

    this.audioManager = this.baseAudioManager // EnhancedAudioManager consolidated into base AudioManager
    
    // Adjust audio quality based on performance level
    if (this.performanceLevel === 'low') {
      this.audioManager.setMasterVolume(0.5)
    }

    console.log('🎵 Enhanced audio manager initialized')
  }

  private async initializeVisualEffects(): Promise<void> {
    if (!this.scene || !this.renderer || !this.camera) {
      console.warn('Three.js dependencies not available')
      return
    }

    this.enhancedVisualEffects = new EnhancedVisualEffects(
      this.scene,
      this.renderer,
      this.camera
    )

    console.log('✨ Enhanced visual effects initialized')
  }

  private async initializeConsultationUI(): Promise<void> {
    this.enhancedConsultationUI = new EnhancedConsultationUI()
    console.log('🏥 Enhanced consultation UI initialized')
  }

  private connectSystems(): void {
    if (!this.enhancedGameManager) return

    // Connect enhanced game manager events to Phase 3.1 systems
    this.enhancedGameManager.addEventListener('revelation', (event: GameEvent) => {
      this.handleRevelationEvent(event)
    })

    this.enhancedGameManager.addEventListener('investigation_technique', (event: GameEvent) => {
      this.handleInvestigationEvent(event)
    })

    this.enhancedGameManager.addEventListener('consultation_request', (event: GameEvent) => {
      this.handleConsultationEvent(event)
    })

    this.enhancedGameManager.addEventListener('difficulty_adjusted', (event: GameEvent) => {
      this.handleDifficultyEvent(event)
    })

    this.enhancedGameManager.addEventListener('narrative_choice', (event: GameEvent) => {
      this.handleNarrativeEvent(event)
    })

    this.enhancedGameManager.addEventListener('phase_transition', (event: GameEvent) => {
      this.handlePhaseTransition(event)
    })

    console.log('🔗 Phase 3.1 systems connected to enhanced game manager')
  }

  /**
   * Event handlers for enhanced game events
   */
  private handleRevelationEvent(event: GameEvent): void {
    const { region, revealed, type } = event.data

    // Audio feedback
    // ENHANCEMENT: EnhancedAudioManager consolidated - contextual feedback now handled by base AudioManager
    // this.audioManager.playAudioCue('revelation')

    // Visual effects
    if (this.enhancedVisualEffects && revealed && revealed.length > 0) {
      const position = this.getRegionPosition(region)
      if (position) {
        const findingType = type === 'red_herring' ? 'red_herring' : 
                           revealed.some((r: any) => r.significance === 'critical') ? 'critical' : 'normal'
        this.enhancedVisualEffects.createRevelationEffect(position, findingType)
      }
    }

    // Mobile haptic feedback
    if (this.mobileOptimization?.isMobileDevice()) {
      // Trigger haptic feedback for important revelations
      if (type !== 'red_herring') {
        // Implementation would trigger haptic feedback
      }
    }
  }

  private handleInvestigationEvent(event: GameEvent): void {
    const { technique, region, position } = event.data

    // Audio feedback - ENHANCEMENT: EnhancedAudioManager consolidated
    // this.audioManager.playAudioCue('investigation_technique')

    // Visual effects
    if (this.enhancedVisualEffects) {
      const effectPosition = position || this.getRegionPosition(region)
      if (effectPosition) {
        this.enhancedVisualEffects.startInvestigationEffect(technique, effectPosition)
      }
    }
  }

  private handleConsultationEvent(event: GameEvent): void {
    const { type, specialist, request } = event.data

    // Audio feedback
    // ENHANCEMENT: EnhancedAudioManager consolidated
    // this.audioManager.playAudioCue('consultation_request')

    // Show consultation UI
    if (this.enhancedConsultationUI && type === 'request') {
      this.enhancedConsultationUI.show()
      if (specialist) {
        this.enhancedConsultationUI.initiateConsultation(specialist.id)
      }
    }
  }

  private handleDifficultyEvent(event: GameEvent): void {
    const { direction, metrics } = event.data

    // Audio feedback
    if (this.audioManager) {
      // this.audioManager.playAudioCue('difficulty_adjusted')
    }

    // Visual feedback
    if (this.enhancedVisualEffects) {
      this.enhancedVisualEffects.createDifficultyAdjustmentEffect(direction)
    }

    // Adjust performance based on difficulty
    this.adaptPerformanceToGameState(metrics)
  }

  private handleNarrativeEvent(event: GameEvent): void {
    const { choices, type } = event.data

    // Audio feedback
    if (this.audioManager) {
      // this.audioManager.playAudioCue('narrative_choice')
    }

    // Mobile optimization for narrative choices
    if (this.mobileOptimization?.isMobileDevice() && choices) {
      // Ensure narrative choices are touch-friendly on mobile
      this.optimizeNarrativeForMobile(choices)
    }
  }

  private handlePhaseTransition(event: GameEvent): void {
    const { newPhase, gameState } = event.data

    // Audio phase transition
    if (this.audioManager) {
      this.audioManager.setCurrentPhase(newPhase)
    }

    // Adjust UI for new phase
    this.adaptUIForPhase(newPhase)
  }

  /**
   * Helper methods
   */
  private getRegionPosition(region: string): THREE.Vector3 | null {
    // Map anatomical regions to 3D positions
    const regionPositions: Record<string, THREE.Vector3> = {
      'head_neck': new THREE.Vector3(0, 2, 0),
      'chest': new THREE.Vector3(0, 0.5, 0),
      'abdomen': new THREE.Vector3(0, -0.5, 0),
      'pelvis': new THREE.Vector3(0, -1.5, 0),
      'general': new THREE.Vector3(0, 0, 0)
    }

    return regionPositions[region] || null
  }

  private adaptPerformanceToGameState(metrics: any): void {
    // Adjust performance settings based on game difficulty and device performance
    if (metrics.currentLevel > 0.8 && this.performanceLevel === 'high') {
      // High difficulty on high-performance device - maintain quality
      return
    }

    if (metrics.currentLevel > 0.6 && this.performanceLevel === 'low') {
      // High difficulty on low-performance device - reduce quality
      this.reduceVisualQuality()
    }
  }

  private reduceVisualQuality(): void {
    // Reduce visual effects quality for better performance
    if (this.enhancedVisualEffects) {
      // Implementation would reduce particle counts, disable expensive effects, etc.
    }

    if (this.audioManager) {
      // Reduce audio quality
      this.audioManager.setMasterVolume(0.4)
    }
  }

  private optimizeNarrativeForMobile(choices: any[]): void {
    // Ensure narrative choice buttons are touch-friendly
    setTimeout(() => {
      const choiceButtons = document.querySelectorAll('.narrative-choice button')
      choiceButtons.forEach(button => {
        const buttonElement = button as HTMLElement
        buttonElement.style.minHeight = '44px'
        buttonElement.style.padding = '12px 16px'
        buttonElement.style.fontSize = '14px'
      })
    }, 100)
  }

  private adaptUIForPhase(phase: string): void {
    // Adapt UI layout and behavior for different game phases
    if (this.mobileOptimization?.isMobileDevice()) {
      switch (phase) {
        case 'scanning':
          // Optimize for touch scanning
          this.optimizeForTouchScanning()
          break
        case 'investigation':
          // Show investigation toolbar prominently
          this.showMobileInvestigationToolbar()
          break
        case 'consultation':
          // Full-screen consultation on mobile
          this.optimizeConsultationForMobile()
          break
      }
    }
  }

  private optimizeForTouchScanning(): void {
    // Add touch-friendly scanning indicators
    const style = document.createElement('style')
    style.textContent = `
      .mobile-device .scan-area {
        min-width: 44px;
        min-height: 44px;
        touch-action: manipulation;
      }
    `
    document.head.appendChild(style)
  }

  private showMobileInvestigationToolbar(): void {
    // Ensure investigation toolbar is visible and accessible on mobile
    const toolbar = document.querySelector('.investigation-toolbar') as HTMLElement
    if (toolbar) {
      toolbar.style.position = 'fixed'
      toolbar.style.bottom = '20px'
      toolbar.style.left = '50%'
      toolbar.style.transform = 'translateX(-50%)'
      toolbar.style.zIndex = '1000'
    }
  }

  private optimizeConsultationForMobile(): void {
    // Ensure consultation UI is mobile-optimized
    if (this.enhancedConsultationUI) {
      // Implementation would adjust consultation UI for mobile
    }
  }

  /**
   * Public API methods
   */
  public getStatus(): Phase3Status {
    return {
      audioManager: { isEnabled: !!this.audioManager, currentPhase: 'unknown' },
      visualEffects: {
        isActive: !!this.enhancedVisualEffects,
        availableTechniques: this.enhancedVisualEffects?.getAvailableInvestigationTechniques() || []
      },
      consultationUI: this.enhancedConsultationUI?.getConsultationStatus(),
      mobileOptimization: this.mobileOptimization?.getDeviceInfo(),
      isActive: this.isActive,
      performanceLevel: this.performanceLevel
    }
  }

  public setPerformanceLevel(level: 'high' | 'medium' | 'low'): void {
    this.performanceLevel = level
    
    // Adjust all systems based on new performance level
    if (this.audioManager) {
      const volumeMap = { high: 0.7, medium: 0.5, low: 0.3 }
      this.audioManager.setMasterVolume(volumeMap[level])
    }

    if (this.mobileOptimization) {
      if (level === 'low') {
        this.mobileOptimization.enableReducedMotion()
      } else {
        this.mobileOptimization.disableReducedMotion()
      }
    }

    console.log(`🚀 Performance level set to: ${level}`)
  }

  public enableAudioEnhancements(enabled: boolean): void {
    if (this.audioManager) {
      // ENHANCEMENT: setEnabled method consolidated - audio enabled state now managed internally
      // this.audioManager.setEnabled(enabled)
    }
  }

  public showConsultationUI(): void {
    if (this.enhancedConsultationUI) {
      this.enhancedConsultationUI.show()
    }
  }

  public hideConsultationUI(): void {
    if (this.enhancedConsultationUI) {
      this.enhancedConsultationUI.hide()
    }
  }

  public triggerInvestigationEffect(technique: string, position: THREE.Vector3): void {
    if (this.enhancedVisualEffects) {
      this.enhancedVisualEffects.startInvestigationEffect(technique, position)
    }

    if (this.audioManager) {
      // this.audioManager.playAudioCue('investigation_technique')
    }
  }

  public update(): void {
    // Update all Phase 3.1 systems
    if (this.enhancedVisualEffects) {
      this.enhancedVisualEffects.update()
    }
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    if (this.audioManager) {
      this.audioManager.destroy()
      // AudioManager is managed externally, don't set to null
    }

    if (this.enhancedVisualEffects) {
      this.enhancedVisualEffects.destroy()
      this.enhancedVisualEffects = null
    }

    if (this.enhancedConsultationUI) {
      this.enhancedConsultationUI.destroy()
      this.enhancedConsultationUI = null
    }

    if (this.mobileOptimization) {
      this.mobileOptimization.destroy()
      this.mobileOptimization = null
    }

    this.isActive = false
    
    console.log('🚀 Phase 3.1 Integration Manager destroyed')
  }
}