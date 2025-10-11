/**
 * Enhanced Audio Manager
 * IMMERSIVE: Phase-specific background music and contextual audio cues
 * EDUCATIONAL: Audio feedback that enhances learning and engagement
 * ADAPTIVE: Audio that responds to game state and player performance
 */

import { AudioManager, SoundType } from '../../components/AudioManager'
import { EnhancedGameState } from '../diagnostic/EnhancedGameManager'

export interface AudioCue {
  id: string
  type: 'background' | 'effect' | 'notification' | 'ambient'
  file?: string
  volume: number
  loop: boolean
  fadeIn?: number
  fadeOut?: number
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface PhaseAudioConfig {
  backgroundMusic?: AudioCue
  ambientSounds?: AudioCue[]
  transitionEffects?: AudioCue[]
  notificationSounds?: AudioCue[]
}

export class EnhancedAudioManager {
  private baseAudioManager: AudioManager
  private currentPhase: string = 'idle'
  private audioContext: AudioContext | null = null
  private audioBuffers: Map<string, AudioBuffer> = new Map()
  private activeSources: Map<string, AudioBufferSourceNode> = new Map()
  private gainNodes: Map<string, GainNode> = new Map()
  private isEnabled: boolean = true
  private masterVolume: number = 0.7
  
  // Phase-specific audio configurations
  private phaseConfigs: Map<string, PhaseAudioConfig> = new Map()
  
  // Audio cue definitions
  private audioCues: Map<string, AudioCue> = new Map()

  constructor(baseAudioManager: AudioManager) {
    this.baseAudioManager = baseAudioManager
    this.initializeAudioContext()
    this.setupPhaseConfigurations()
    this.setupAudioCues()
    
    console.log('🎵 Enhanced Audio Manager initialized')
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume audio context on user interaction (required by browsers)
      document.addEventListener('click', () => {
        if (this.audioContext?.state === 'suspended') {
          this.audioContext.resume()
        }
      }, { once: true })
    } catch (error) {
      console.warn('Failed to initialize audio context:', error)
    }
  }

  private setupPhaseConfigurations(): void {
    // Case Introduction Phase
    this.phaseConfigs.set('case_introduction', {
      backgroundMusic: {
        id: 'medical_ambient',
        type: 'background',
        volume: 0.3,
        loop: true,
        fadeIn: 2000,
        priority: 'medium'
      },
      ambientSounds: [
        {
          id: 'hospital_ambience',
          type: 'ambient',
          volume: 0.2,
          loop: true,
          priority: 'low'
        }
      ],
      notificationSounds: [
        {
          id: 'case_start',
          type: 'notification',
          volume: 0.5,
          loop: false,
          priority: 'high'
        }
      ]
    })

    // Active Scanning Phase
    this.phaseConfigs.set('scanning', {
      backgroundMusic: {
        id: 'diagnostic_focus',
        type: 'background',
        volume: 0.25,
        loop: true,
        priority: 'medium'
      },
      ambientSounds: [
        {
          id: 'scanner_hum',
          type: 'ambient',
          volume: 0.15,
          loop: true,
          priority: 'low'
        }
      ]
    })

    // Investigation Phase
    this.phaseConfigs.set('investigation', {
      backgroundMusic: {
        id: 'investigation_theme',
        type: 'background',
        volume: 0.3,
        loop: true,
        priority: 'medium'
      },
      ambientSounds: [
        {
          id: 'medical_equipment',
          type: 'ambient',
          volume: 0.2,
          loop: true,
          priority: 'low'
        }
      ]
    })

    // Consultation Phase
    this.phaseConfigs.set('consultation', {
      backgroundMusic: {
        id: 'consultation_calm',
        type: 'background',
        volume: 0.2,
        loop: true,
        priority: 'medium'
      },
      ambientSounds: [
        {
          id: 'office_ambience',
          type: 'ambient',
          volume: 0.15,
          loop: true,
          priority: 'low'
        }
      ]
    })

    // Narrative Choice Phase
    this.phaseConfigs.set('narrative_choice', {
      backgroundMusic: {
        id: 'decision_tension',
        type: 'background',
        volume: 0.35,
        loop: true,
        priority: 'high'
      }
    })

    // Case Completion Phase
    this.phaseConfigs.set('case_complete', {
      backgroundMusic: {
        id: 'completion_theme',
        type: 'background',
        volume: 0.4,
        loop: false,
        fadeOut: 3000,
        priority: 'high'
      }
    })
  }

  private setupAudioCues(): void {
    // Revelation audio cues
    this.audioCues.set('finding_revealed', {
      id: 'finding_revealed',
      type: 'effect',
      volume: 0.6,
      loop: false,
      priority: 'high'
    })

    this.audioCues.set('red_herring_detected', {
      id: 'red_herring_detected',
      type: 'effect',
      volume: 0.5,
      loop: false,
      priority: 'medium'
    })

    // Investigation technique audio cues
    this.audioCues.set('palpation_start', {
      id: 'palpation_start',
      type: 'effect',
      volume: 0.4,
      loop: false,
      priority: 'medium'
    })

    this.audioCues.set('auscultation_start', {
      id: 'auscultation_start',
      type: 'effect',
      volume: 0.4,
      loop: false,
      priority: 'medium'
    })

    this.audioCues.set('consultation_request', {
      id: 'consultation_request',
      type: 'effect',
      volume: 0.5,
      loop: false,
      priority: 'medium'
    })

    this.audioCues.set('consultation_complete', {
      id: 'consultation_complete',
      type: 'notification',
      volume: 0.6,
      loop: false,
      priority: 'high'
    })

    // Difficulty adjustment audio cues
    this.audioCues.set('difficulty_increased', {
      id: 'difficulty_increased',
      type: 'notification',
      volume: 0.5,
      loop: false,
      priority: 'medium'
    })

    this.audioCues.set('difficulty_decreased', {
      id: 'difficulty_decreased',
      type: 'notification',
      volume: 0.5,
      loop: false,
      priority: 'medium'
    })

    // Narrative choice audio cues
    this.audioCues.set('ethical_choice_presented', {
      id: 'ethical_choice_presented',
      type: 'notification',
      volume: 0.4,
      loop: false,
      priority: 'high'
    })

    this.audioCues.set('choice_confirmed', {
      id: 'choice_confirmed',
      type: 'effect',
      volume: 0.5,
      loop: false,
      priority: 'medium'
    })

    // Performance feedback audio cues
    this.audioCues.set('performance_excellent', {
      id: 'performance_excellent',
      type: 'notification',
      volume: 0.6,
      loop: false,
      priority: 'high'
    })

    this.audioCues.set('performance_good', {
      id: 'performance_good',
      type: 'notification',
      volume: 0.5,
      loop: false,
      priority: 'medium'
    })

    this.audioCues.set('performance_needs_improvement', {
      id: 'performance_needs_improvement',
      type: 'notification',
      volume: 0.4,
      loop: false,
      priority: 'medium'
    })
  }

  /**
   * Transition to a new game phase with appropriate audio
   */
  public transitionToPhase(phase: string, gameState?: EnhancedGameState): void {
    console.log(`🎵 Transitioning audio to phase: ${phase}`)
    
    const previousPhase = this.currentPhase
    this.currentPhase = phase
    
    // Fade out current background music
    this.fadeOutCurrentBackground()
    
    // Get phase configuration
    const phaseConfig = this.phaseConfigs.get(phase)
    if (!phaseConfig) {
      console.warn(`No audio configuration found for phase: ${phase}`)
      return
    }
    
    // Start new background music
    if (phaseConfig.backgroundMusic) {
      setTimeout(() => {
        this.playAudioCue(phaseConfig.backgroundMusic!)
      }, 500) // Small delay for smooth transition
    }
    
    // Start ambient sounds
    if (phaseConfig.ambientSounds) {
      phaseConfig.ambientSounds.forEach(ambientSound => {
        setTimeout(() => {
          this.playAudioCue(ambientSound)
        }, 1000) // Delay ambient sounds slightly
      })
    }
    
    // Play transition effect if available
    if (phaseConfig.transitionEffects) {
      phaseConfig.transitionEffects.forEach(effect => {
        this.playAudioCue(effect)
      })
    }
    
    // Adaptive audio based on game state
    if (gameState) {
      this.adaptAudioToGameState(gameState)
    }
  }

  /**
   * Play a specific audio cue
   */
  public playAudioCue(cue: AudioCue): void {
    if (!this.isEnabled || !this.audioContext) return
    
    // For now, use synthesized audio or fallback to base audio manager
    this.playFallbackAudio(cue)
  }

  /**
   * Play audio cue by ID
   */
  public playCueById(cueId: string): void {
    const cue = this.audioCues.get(cueId)
    if (cue) {
      this.playAudioCue(cue)
    } else {
      console.warn(`Audio cue not found: ${cueId}`)
    }
  }

  /**
   * Adapt audio based on current game state
   */
  private adaptAudioToGameState(gameState: EnhancedGameState): void {
    // Adjust volume based on difficulty level
    const difficultyLevel = gameState.adaptiveDifficulty.currentLevel
    const volumeMultiplier = 0.7 + (difficultyLevel * 0.3) // Higher difficulty = slightly louder
    
    // Adjust tempo based on time pressure
    const currentTime = Date.now() - gameState.sessionMetrics.startTime
    const timeRatio = Math.max(0, (gameState.sessionMetrics.totalTime - currentTime) / gameState.sessionMetrics.totalTime)
    if (timeRatio < 0.2) {
      // Time running out - increase tension
      this.adjustBackgroundTension(1.2)
    } else if (timeRatio < 0.5) {
      // Moderate time pressure
      this.adjustBackgroundTension(1.1)
    }
    
    // Performance-based audio feedback
    const accuracy = gameState.performance.diagnosticAccuracy
    if (accuracy > 0.8) {
      // Excellent performance - confident audio
      this.setAudioMood('confident')
    } else if (accuracy < 0.4) {
      // Poor performance - supportive audio
      this.setAudioMood('supportive')
    }
  }

  /**
   * Provide contextual audio feedback for specific events
   */
  public provideContextualFeedback(eventType: string, data?: any): void {
    switch (eventType) {
      case 'revelation':
        if (data?.type === 'red_herring') {
          this.playCueById('red_herring_detected')
        } else {
          this.playCueById('finding_revealed')
        }
        break
        
      case 'investigation_technique':
        this.playCueById(`${data?.technique}_start`)
        break
        
      case 'consultation_request':
        this.playCueById('consultation_request')
        break
        
      case 'consultation_complete':
        this.playCueById('consultation_complete')
        break
        
      case 'difficulty_adjusted':
        if (data?.direction === 'increased') {
          this.playCueById('difficulty_increased')
        } else {
          this.playCueById('difficulty_decreased')
        }
        break
        
      case 'narrative_choice':
        this.playCueById('ethical_choice_presented')
        break
        
      case 'choice_made':
        this.playCueById('choice_confirmed')
        break
        
      case 'performance_feedback':
        if (data?.level === 'excellent') {
          this.playCueById('performance_excellent')
        } else if (data?.level === 'good') {
          this.playCueById('performance_good')
        } else {
          this.playCueById('performance_needs_improvement')
        }
        break
    }
  }

  /**
   * Fallback audio implementation using base audio manager
   */
  private playFallbackAudio(cue: AudioCue): void {
    // Map enhanced audio cues to existing base audio manager sounds
    const soundMapping: Record<string, SoundType> = {
      'finding_revealed': SoundType.CONDITION_FOUND,
      'consultation_complete': SoundType.MEDICAL_BEEP,
      'choice_confirmed': SoundType.CLICK,
      'performance_excellent': SoundType.DISCOVERY,
      'case_start': SoundType.MEDICAL_BEEP
    }
    
    const mappedSound = soundMapping[cue.id]
    if (mappedSound) {
      this.baseAudioManager.playSound(mappedSound)
    } else {
      // Generate synthesized audio for unmapped cues
      this.generateSynthesizedAudio(cue)
    }
  }

  /**
   * Generate synthesized audio for cues without audio files
   */
  private generateSynthesizedAudio(cue: AudioCue): void {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    // Configure oscillator based on cue type
    switch (cue.type) {
      case 'notification':
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1)
        break
        
      case 'effect':
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
        oscillator.type = 'sine'
        break
        
      case 'ambient':
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime)
        oscillator.type = 'sawtooth'
        break
        
      default:
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime)
    }
    
    // Configure gain
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(cue.volume * this.masterVolume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)
    
    // Connect and play
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.2)
  }

  /**
   * Fade out current background music
   */
  private fadeOutCurrentBackground(): void {
    this.activeSources.forEach((source, id) => {
      const gainNode = this.gainNodes.get(id)
      if (gainNode && this.audioContext) {
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1)
        setTimeout(() => {
          source.stop()
          this.activeSources.delete(id)
          this.gainNodes.delete(id)
        }, 1000)
      }
    })
  }

  /**
   * Adjust background music tension
   */
  private adjustBackgroundTension(multiplier: number): void {
    // This would adjust playback rate or filter parameters
    // For now, just adjust volume
    this.gainNodes.forEach(gainNode => {
      if (this.audioContext) {
        const currentGain = gainNode.gain.value
        gainNode.gain.exponentialRampToValueAtTime(
          Math.min(currentGain * multiplier, 1.0),
          this.audioContext.currentTime + 0.5
        )
      }
    })
  }

  /**
   * Set overall audio mood
   */
  private setAudioMood(mood: 'confident' | 'supportive' | 'neutral'): void {
    // This would adjust EQ, reverb, or other audio parameters
    // For now, just log the mood change
    console.log(`🎵 Audio mood set to: ${mood}`)
  }

  /**
   * Enable/disable enhanced audio
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled) {
      this.stopAllAudio()
    }
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    
    // Update all active gain nodes
    this.gainNodes.forEach(gainNode => {
      if (this.audioContext) {
        gainNode.gain.exponentialRampToValueAtTime(
          this.masterVolume,
          this.audioContext.currentTime + 0.1
        )
      }
    })
  }

  /**
   * Stop all audio
   */
  public stopAllAudio(): void {
    this.activeSources.forEach(source => {
      try {
        source.stop()
      } catch (error) {
        // Source may already be stopped
      }
    })
    
    this.activeSources.clear()
    this.gainNodes.clear()
  }

  /**
   * Get current phase
   */
  public getCurrentPhase(): string {
    return this.currentPhase
  }

  /**
   * Get audio status
   */
  public getAudioStatus(): any {
    return {
      isEnabled: this.isEnabled,
      currentPhase: this.currentPhase,
      masterVolume: this.masterVolume,
      activeSources: this.activeSources.size,
      audioContextState: this.audioContext?.state
    }
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    this.stopAllAudio()
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    this.audioBuffers.clear()
    this.phaseConfigs.clear()
    this.audioCues.clear()
    
    console.log('🎵 Enhanced Audio Manager destroyed')
  }
}