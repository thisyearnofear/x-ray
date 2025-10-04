import * as THREE from 'three';

export enum SoundType {
  DISCOVERY = 'discovery',
  CONDITION_FOUND = 'condition_found',
  SCAN_START = 'scan_start',
  SCAN_END = 'scan_end',
  HOVER = 'hover',
  CLICK = 'click',
  LOW_SEVERITY = 'low_severity',
  MEDIUM_SEVERITY = 'medium_severity',
  HIGH_SEVERITY = 'high_severity',

  // New file-based sounds
  BACKGROUND_MUSIC = 'background_music',
  HOSPITAL_AMBIENCE = 'hospital_ambience',
  XRAY_SCANNING = 'xray_scanning',
  HEARTBEAT = 'heartbeat',

  // Enhanced hospital ambience sounds
  HEARTBEAT_MONITOR = 'heartbeat_monitor',
  VENTILATOR = 'ventilator',
  FOOTSTEPS = 'footsteps',
  MEDICAL_BEEP = 'medical_beep',

  // AI-related audio feedback
  AI_PROCESSING = 'ai_processing',
  CEREBRAS_INFERENCE = 'cerebras_inference',
}

export class AudioManager {
  private audioListener: THREE.AudioListener;
  private soundMap: Map<SoundType, THREE.Audio | THREE.PositionalAudio> = new Map();
  private context: AudioContext;
  private masterVolume: number = 0.7;
  private audioLoader: THREE.AudioLoader;
  private backgroundAudio: THREE.Audio | THREE.PositionalAudio | null = null;
  private ambienceLoop: THREE.Audio | THREE.PositionalAudio | null = null;
  private isAmbiencePlaying: boolean = false;

  constructor(camera: THREE.Camera) {
    this.audioListener = new THREE.AudioListener();
    camera.add(this.audioListener);
    
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.audioLoader = new THREE.AudioLoader();
    
    this.createProceduralSounds();
    this.loadSounds();
  }

  private async loadSounds(): Promise<void> {
    // ENHANCEMENT FIRST: Dynamic audio generation instead of static files
    // Static files are now optional - we'll generate contextual audio on-demand
    const staticSounds = [
      { type: SoundType.BACKGROUND_MUSIC, path: 'sounds/background-music.mp3', volume: 0.3, loop: true },
      { type: SoundType.HOSPITAL_AMBIENCE, path: 'sounds/hospital-ambience.mp3', volume: 0.5, loop: true },
      { type: SoundType.XRAY_SCANNING, path: 'sounds/xray-scanning.mp3', volume: 0.6, loop: true },
      { type: SoundType.HEARTBEAT, path: 'sounds/heartbeat.wav', volume: 0.8, loop: true },
    ];

    // Try to load static files, but don't fail if they're missing
    for (const sound of staticSounds) {
      try {
        await this.loadAudio(sound.type, sound.path, sound.volume, sound.loop);
        console.log(`✅ Loaded static audio: ${sound.type}`);
      } catch (error) {
        console.log(`⚡ Static audio not found for ${sound.type}, will use procedural fallback and dynamic generation`);
        // Procedural fallback is already available from createProceduralSounds()
        // Dynamic generation will be attempted when generateContextualAudio() is called
      }
    }
  }

  private loadAudio(type: SoundType, path: string, volume: number, loop: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        path,
        (buffer) => {
          const sound = new THREE.Audio(this.audioListener);
          sound.setBuffer(buffer);
          sound.setVolume(volume);
          sound.setLoop(loop);
          this.soundMap.set(type, sound);
          resolve();
        },
        undefined, 
        (error) => {
          console.error(`AudioManager: Failed to load sound ${type} from ${path}`, error);
          reject(error);
        }
      );
    });
  }

  private createProceduralSounds(): void {
    this.soundMap.set(SoundType.DISCOVERY, this.createProceduralSound(0.3, 200, 800, 'sine', 0.1));
    this.soundMap.set(SoundType.CONDITION_FOUND, this.createProceduralSound(0.5, 400, 1200, 'sawtooth', 0.15));
    this.soundMap.set(SoundType.SCAN_START, this.createProceduralSound(0.1, 100, 300, 'square', 0.08));
    this.soundMap.set(SoundType.SCAN_END, this.createProceduralSound(0.1, 300, 100, 'square', 0.08));
    this.soundMap.set(SoundType.HOVER, this.createProceduralSound(0.05, 200, 250, 'sine', 0.05));
    this.soundMap.set(SoundType.LOW_SEVERITY, this.createProceduralSound(0.2, 300, 400, 'sine', 0.1));
    this.soundMap.set(SoundType.MEDIUM_SEVERITY, this.createProceduralSound(0.3, 200, 600, 'triangle', 0.12));
    this.soundMap.set(SoundType.HIGH_SEVERITY, this.createProceduralSound(0.4, 100, 800, 'sawtooth', 0.15));

    // Enhanced hospital ambience sounds
    this.soundMap.set(SoundType.HOSPITAL_AMBIENCE, this.createAmbienceSound());
    this.soundMap.set(SoundType.HEARTBEAT_MONITOR, this.createHeartbeatSound());
    this.soundMap.set(SoundType.VENTILATOR, this.createVentilatorSound());
    this.soundMap.set(SoundType.FOOTSTEPS, this.createFootstepsSound());
    this.soundMap.set(SoundType.MEDICAL_BEEP, this.createMedicalBeepSound());

    // AI-related audio feedback
    this.soundMap.set(SoundType.AI_PROCESSING, this.createAIProcessingSound());
    this.soundMap.set(SoundType.CEREBRAS_INFERENCE, this.createCerebrasInferenceSound());
  }

  private createProceduralSound(duration: number, startFreq: number, endFreq: number, waveform: OscillatorType, volume: number): THREE.Audio {
    const audio = new THREE.Audio(this.audioListener);
    const sampleRate = this.context.sampleRate;
    const frameCount = sampleRate * duration;
    const audioBuffer = this.context.createBuffer(1, frameCount, sampleRate);
    const data = audioBuffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      const progress = i / frameCount;
      const freq = startFreq + (endFreq - startFreq) * progress;
      const t = i / sampleRate;
      let value = 0;
      switch (waveform) {
        case 'sine': value = Math.sin(2 * Math.PI * freq * t); break;
        case 'square': value = Math.sign(Math.sin(2 * Math.PI * freq * t)); break;
        case 'sawtooth': value = 2 * (freq * t - Math.floor(0.5 + freq * t)); break;
        case 'triangle': value = Math.asin(Math.sin(2 * Math.PI * freq * t)) * (2 / Math.PI); break;
      }
      const envelope = Math.sin((Math.PI * i) / (2 * frameCount));
      const fadeOut = Math.sin((Math.PI * (frameCount - i)) / (2 * frameCount));
      data[i] = value * volume * envelope * fadeOut;
    }
    audio.setBuffer(audioBuffer);
    audio.setVolume(volume);
    return audio;
  }

  public playSound(type: SoundType, loop: boolean = false): void {
    const sound = this.soundMap.get(type);
    if (!sound) {
      console.warn(`Sound not found: ${type}`);
      return;
    }

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    // Don't re-play looping sounds that are already playing
    if (loop && sound.isPlaying) {
        return;
    }

    if (sound.isPlaying) {
      sound.stop();
    }
    
    sound.setLoop(loop);
    sound.play();
  }

  public stopSound(type: SoundType): void {
    const sound = this.soundMap.get(type);
    if (sound && sound.isPlaying) {
      sound.stop();
    }
  }

  public playBackgroundMusic(type: SoundType): void {
    const sound = this.soundMap.get(type);
    if (sound) {
        this.backgroundAudio = sound;
        if (this.backgroundAudio && !this.backgroundAudio.isPlaying) {
            this.backgroundAudio.play();
        }
    }
  }

  public stopBackgroundMusic(): void {
    if (this.backgroundAudio && this.backgroundAudio.isPlaying) {
      this.backgroundAudio.stop();
    }
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.audioListener.setMasterVolume(this.masterVolume);
  }

  public getAudioListener(): THREE.AudioListener {
    return this.audioListener;
  }

  public dispose(): void {
    // Stop ambience first
    this.stopHospitalAmbience();
    
    this.soundMap.forEach(sound => {
      if (sound.isPlaying) {
        sound.stop();
      }
    });
    this.soundMap.clear();
    
    if (this.context.state !== 'closed') {
      this.context.close();
    }
  }

  // Enhanced hospital ambience methods
  private createAmbienceSound(): THREE.Audio {
    return this.createProceduralSound(2.0, 60, 120, 'sine', 0.05);
  }

  private createHeartbeatSound(): THREE.Audio {
    return this.createProceduralSound(0.8, 80, 40, 'sine', 0.08);
  }

  private createVentilatorSound(): THREE.Audio {
    return this.createProceduralSound(1.5, 200, 180, 'triangle', 0.06);
  }

  private createFootstepsSound(): THREE.Audio {
    return this.createProceduralSound(0.3, 150, 100, 'square', 0.04);
  }

  private createMedicalBeepSound(): THREE.Audio {
    return this.createProceduralSound(0.1, 800, 1000, 'sine', 0.1);
  }

  // AI-related audio feedback methods
  private createAIProcessingSound(): THREE.Audio {
    return this.createProceduralSound(0.5, 300, 600, 'triangle', 0.07);
  }

  private createCerebrasInferenceSound(): THREE.Audio {
    return this.createProceduralSound(0.8, 400, 800, 'sawtooth', 0.09);
  }

  // Public methods for hospital ambience control
  public startHospitalAmbience(): void {
    if (!this.isAmbiencePlaying) {
      const ambience = this.soundMap.get(SoundType.HOSPITAL_AMBIENCE);
      if (ambience) {
        this.ambienceLoop = ambience;
        if (this.ambienceLoop) {
          this.ambienceLoop.setLoop(true);
          this.ambienceLoop.play();
          this.isAmbiencePlaying = true;
          console.log('🎵 Hospital ambience started');
        }
      }
    }
  }

  public stopHospitalAmbience(): void {
    if (this.ambienceLoop && this.ambienceLoop.isPlaying) {
      this.ambienceLoop.stop();
      this.isAmbiencePlaying = false;
      console.log('🔇 Hospital ambience stopped');
    }
  }

  public playAIFeedback(type: 'processing' | 'inference' | 'complete'): void {
    switch (type) {
      case 'processing':
        this.playSound(SoundType.AI_PROCESSING);
        break;
      case 'inference':
        this.playSound(SoundType.CEREBRAS_INFERENCE);
        break;
      case 'complete':
        this.playSound(SoundType.MEDICAL_BEEP);
        break;
    }
  }

  // ENHANCEMENT FIRST: Dynamic audio generation for contextual medical cases
  public async generateContextualAudio(context: {
    caseType: string;
    patientAge?: number;
    severity: 'low' | 'medium' | 'high';
    phase: 'scanning' | 'discovery' | 'analysis';
    anatomicalRegion: string;
  }): Promise<void> {
    try {
      // Generate contextual hospital ambience based on case
      const ambiencePrompt = this.buildAmbiencePrompt(context);
      const ambienceAudio = await this.generateElevenLabsAudio(ambiencePrompt, 30000); // 30 seconds
      
      if (ambienceAudio) {
        // Replace or supplement existing ambience
        const contextualSound = new THREE.Audio(this.audioListener);
        contextualSound.setBuffer(ambienceAudio);
        contextualSound.setVolume(0.4);
        contextualSound.setLoop(true);
        this.soundMap.set(SoundType.HOSPITAL_AMBIENCE, contextualSound);
        console.log('🎵 Generated contextual hospital ambience');
      }

      // Generate case-specific heartbeat if relevant
      if (context.caseType.toLowerCase().includes('cardiac') || context.caseType.toLowerCase().includes('heart')) {
        const heartbeatPrompt = this.buildHeartbeatPrompt(context);
        const heartbeatAudio = await this.generateElevenLabsAudio(heartbeatPrompt, 10000); // 10 seconds loop
        
        if (heartbeatAudio) {
          const contextualHeartbeat = new THREE.Audio(this.audioListener);
          contextualHeartbeat.setBuffer(heartbeatAudio);
          contextualHeartbeat.setVolume(0.6);
          contextualHeartbeat.setLoop(true);
          this.soundMap.set(SoundType.HEARTBEAT, contextualHeartbeat);
          console.log('💓 Generated contextual heartbeat audio');
        }
      }

    } catch (error) {
      console.warn('Dynamic audio generation failed, using procedural fallbacks:', error);
    }
  }

  private buildAmbiencePrompt(context: any): string {
    let prompt = "Create subtle hospital ambience audio with ";
    
    // Base hospital sounds
    prompt += "distant medical equipment beeps, soft ventilator breathing, ";
    
    // Adjust based on severity
    switch (context.severity) {
      case 'high':
        prompt += "slightly more urgent beeping patterns, faster-paced footsteps, ";
        break;
      case 'medium':
        prompt += "steady monitoring sounds, occasional distant voices, ";
        break;
      case 'low':
        prompt += "calm, slow beeping, peaceful atmosphere, ";
        break;
    }
    
    // Adjust based on anatomical region
    if (context.anatomicalRegion.includes('head') || context.anatomicalRegion.includes('brain')) {
      prompt += "neurological monitoring sounds, ";
    } else if (context.anatomicalRegion.includes('chest') || context.anatomicalRegion.includes('heart')) {
      prompt += "cardiac monitoring emphasis, ";
    }
    
    prompt += "very subtle, non-intrusive, medical professional environment. 30 seconds, seamless loop.";
    return prompt;
  }

  private buildHeartbeatPrompt(context: any): string {
    let prompt = "Create realistic heartbeat monitor audio with ";
    
    // Adjust based on patient age
    if (context.patientAge) {
      if (context.patientAge < 18) {
        prompt += "slightly faster heart rate for younger patient, ";
      } else if (context.patientAge > 65) {
        prompt += "slightly slower, more deliberate heart rhythm, ";
      }
    }
    
    // Adjust based on severity
    switch (context.severity) {
      case 'high':
        prompt += "irregular rhythm suggesting arrhythmia, ";
        break;
      case 'medium':
        prompt += "slightly elevated but steady rhythm, ";
        break;
      case 'low':
        prompt += "normal, healthy rhythm, ";
        break;
    }
    
    prompt += "clear ECG beep sounds, medical monitor quality. 10 seconds, perfect loop.";
    return prompt;
  }

  private async generateElevenLabsAudio(prompt: string, durationMs: number): Promise<AudioBuffer | null> {
    try {
      console.log(`🎵 Attempting to generate audio: "${prompt.substring(0, 50)}..."`);
      
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          duration: durationMs,
          type: 'medical_ambience'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Audio generation API error: ${response.status} ${response.statusText}`, errorText);
        return null;
      }

      const audioBlob = await response.blob();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      console.log(`✅ Successfully generated audio: ${audioBuffer.duration}s`);
      return audioBuffer;
    } catch (error) {
      console.warn('ElevenLabs audio generation failed:', error);
      return null;
    }
  }
}