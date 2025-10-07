import { AudioManager, SoundType } from "../../components/AudioManager"

// MODULAR: Clean audio management system that handles all audio-related functionality
export class AudioManagementSystem {
    private audioManager: AudioManager
    private isInitialized: boolean = false
    private isAmbiencePlaying: boolean = false

    constructor(audioManager: AudioManager) {
        this.audioManager = audioManager
        this.initialize()
    }

    private initialize() {
        if (this.isInitialized) return

        // Ensure audio context is ready
        this.ensureAudioContext()
        this.isInitialized = true
    }

    // Method to ensure audio context is running
    public async ensureAudioContext(): Promise<void> {
        if (this.audioManager && typeof this.audioManager.ensureAudioContext === 'function') {
            await this.audioManager.ensureAudioContext()
        }
    }

    // Enable audio systems when user interacts
    public enableAudioSystems(): void {
        console.log('🎵 Audio systems enabled via user interaction')
        
        // Add a small delay to ensure audio manager is fully initialized
        setTimeout(() => {
            if (this.audioManager) {
                try {
                    // Ensure AudioContext is resumed
                    if (this.audioManager.getAudioListener) {
                        const listener = this.audioManager.getAudioListener()
                        if (listener && listener.context && listener.context.state === 'suspended') {
                            listener.context.resume()
                        }
                    }
                    
                    // Start ambient medical sounds
                    this.startAmbientSounds()
                } catch (error) {
                    console.warn('Audio initialization warning:', error)
                }
            }
        }, 100)
    }

    private startAmbientSounds(): void {
        if (!this.isAmbiencePlaying) {
            this.playSound('ambient_medical')
            this.isAmbiencePlaying = true
        }
                            listener.context.resume().then(() => {
                                console.log('🎵 AudioContext resumed')
                            })
                        }
                    }

                    this.startHospitalAmbience()
                    console.log('🎵 Audio systems enabled via user interaction')
                } catch (error) {
                    console.warn('⚠️ AudioManager start failed:', error)
                    // Try fallback audio start
                    try {
                        if (this.audioManager.playSound) {
                            this.audioManager.playSound(SoundType.HOSPITAL_AMBIENCE, true)
                            console.log('🎵 Fallback audio started')
                        }
                    } catch (fallbackError) {
                        console.warn('⚠️ Fallback audio failed:', fallbackError)
                    }
                }
            } else {
                console.warn('⚠️ AudioManager not available')
            }
        }, 100) // Small delay to ensure proper initialization
    }

    // Start hospital ambience
    public startHospitalAmbience(): void {
        if (this.audioManager && typeof this.audioManager.startHospitalAmbience === 'function') {
            this.audioManager.startHospitalAmbience()
            this.isAmbiencePlaying = true
        }
    }

    // Stop hospital ambience
    public stopHospitalAmbience(): void {
        if (this.audioManager && typeof this.audioManager.stopHospitalAmbience === 'function') {
            this.audioManager.stopHospitalAmbience()
            this.isAmbiencePlaying = false
        }
    }

    // Play discovery sound based on severity
    public playDiscoverySound(severity: 'low' | 'medium' | 'high'): void {
        if (!this.audioManager || !this.audioManager.playSound) return

        try {
            switch (severity) {
                case 'low':
                    this.audioManager.playSound(SoundType.LOW_SEVERITY)
                    break
                case 'medium':
                    this.audioManager.playSound(SoundType.MEDIUM_SEVERITY)
                    break
                case 'high':
                    this.audioManager.playSound(SoundType.HIGH_SEVERITY)
                    break
            }
        } catch (error) {
            console.warn('⚠️ Discovery sound failed:', error)
        }
    }

    // Play a specific sound
    public playSound(soundType: SoundType, loop: boolean = false): void {
        if (this.audioManager && this.audioManager.playSound) {
            try {
                this.audioManager.playSound(soundType, loop)
            } catch (error) {
                console.warn(`⚠️ Sound playback failed for ${soundType}:`, error)
            }
        }
    }

    // Stop a specific sound
    public stopSound(soundType: SoundType): void {
        if (this.audioManager && this.audioManager.stopSound) {
            try {
                this.audioManager.stopSound(soundType)
            } catch (error) {
                console.warn(`⚠️ Sound stop failed for ${soundType}:`, error)
            }
        }
    }

    // Play AI feedback sounds
    public playAIFeedback(type: 'processing' | 'inference' | 'complete'): void {
        if (this.audioManager && this.audioManager.playAIFeedback) {
            try {
                this.audioManager.playAIFeedback(type)
            } catch (error) {
                console.warn(`⚠️ AI feedback playback failed for ${type}:`, error)
                
                // Fallback to basic sounds
                switch (type) {
                    case 'processing':
                        this.playSound(SoundType.AI_PROCESSING)
                        break
                    case 'inference':
                        this.playSound(SoundType.CEREBRAS_INFERENCE)
                        break
                    case 'complete':
                        this.playSound(SoundType.MEDICAL_BEEP)
                        break
                }
            }
        }
    }

    // Generate contextual audio for medical cases
    public async generateContextualAudio(context: {
        caseType: string
        patientAge?: number
        severity: 'low' | 'medium' | 'high'
        phase: 'scanning' | 'discovery' | 'analysis'
        anatomicalRegion: string
    }): Promise<void> {
        if (this.audioManager && typeof this.audioManager.generateContextualAudio === 'function') {
            try {
                await this.audioManager.generateContextualAudio(context)
                console.log('🎵 Generated contextual audio environment')
            } catch (error) {
                console.warn('Contextual audio generation failed:', error)
            }
        }
    }

    // Set master volume
    public setMasterVolume(volume: number): void {
        if (this.audioManager && typeof this.audioManager.setMasterVolume === 'function') {
            this.audioManager.setMasterVolume(volume)
        }
    }

    // Check if ambience is playing
    public getIsAmbiencePlaying(): boolean {
        return this.isAmbiencePlaying
    }

    // Cleanup resources
    public destroy(): void {
        this.stopHospitalAmbience()
        // AudioManager disposal is handled by canvas.ts
    }
}