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
  HIGH_SEVERITY = 'high_severity'
}

export class AudioManager {
  private audioListener: THREE.AudioListener;
  private soundMap: Map<SoundType, THREE.Audio> = new Map();
  private context: AudioContext;
  private masterVolume: number = 0.7;

  constructor(camera: THREE.Camera) {
    this.audioListener = new THREE.AudioListener();
    camera.add(this.audioListener);
    
    // Initialize AudioContext
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create procedural audio effects
    this.createProceduralSounds();
  }

  private createProceduralSounds(): void {
    // Create discovery sound (upward frequency sweep)
    this.soundMap.set(SoundType.DISCOVERY, this.createProceduralSound(
      0.3,      // duration
      200,      // start frequency
      800,      // end frequency
      'sine',   // waveform
      0.1       // volume
    ));

    // Create condition found sound (more complex)
    this.soundMap.set(SoundType.CONDITION_FOUND, this.createProceduralSound(
      0.5,
      400,
      1200,
      'sawtooth',
      0.15
    ));

    // Create scan start sound
    this.soundMap.set(SoundType.SCAN_START, this.createProceduralSound(
      0.1,
      100,
      300,
      'square',
      0.08
    ));

    // Create scan end sound
    this.soundMap.set(SoundType.SCAN_END, this.createProceduralSound(
      0.1,
      300,
      100,
      'square',
      0.08
    ));

    // Create hover sound
    this.soundMap.set(SoundType.HOVER, this.createProceduralSound(
      0.05,
      200,
      250,
      'sine',
      0.05
    ));

    // Create severity-specific sounds
    this.soundMap.set(SoundType.LOW_SEVERITY, this.createProceduralSound(
      0.2,
      300,
      400,
      'sine',
      0.1
    ));

    this.soundMap.set(SoundType.MEDIUM_SEVERITY, this.createProceduralSound(
      0.3,
      200,
      600,
      'triangle',
      0.12
    ));

    this.soundMap.set(SoundType.HIGH_SEVERITY, this.createProceduralSound(
      0.4,
      100,
      800,
      'sawtooth',
      0.15
    ));
  }

  private createProceduralSound(
    duration: number,
    startFreq: number,
    endFreq: number,
    waveform: OscillatorType,
    volume: number
  ): THREE.Audio {
    const audio = new THREE.Audio(this.audioListener);
    
    // Create audio buffer procedurally
    const sampleRate = this.context.sampleRate;
    const frameCount = sampleRate * duration;
    
    const audioBuffer = this.context.createBuffer(1, frameCount, sampleRate);
    const data = audioBuffer.getChannelData(0);
    
    // Generate procedural sound based on parameters
    for (let i = 0; i < frameCount; i++) {
      // Create frequency sweep from startFreq to endFreq
      const progress = i / frameCount;
      const freq = startFreq + (endFreq - startFreq) * progress;
      
      // Generate waveform
      const t = i / sampleRate;
      let value = 0;
      
      switch (waveform) {
        case 'sine':
          value = Math.sin(2 * Math.PI * freq * t);
          break;
        case 'square':
          value = Math.sign(Math.sin(2 * Math.PI * freq * t));
          break;
        case 'sawtooth':
          value = 2 * (freq * t - Math.floor(0.5 + freq * t));
          break;
        case 'triangle':
          value = Math.asin(Math.sin(2 * Math.PI * freq * t)) * (2 / Math.PI);
          break;
      }
      
      // Apply volume envelope to avoid clicking
      const envelope = Math.sin((Math.PI * i) / (2 * frameCount)); // Fade in
      const fadeOut = Math.sin((Math.PI * (frameCount - i)) / (2 * frameCount)); // Fade out
      data[i] = value * volume * envelope * fadeOut;
    }
    
    audio.setBuffer(audioBuffer);
    audio.setVolume(volume);
    
    return audio;
  }

  public playSound(type: SoundType, position?: THREE.Vector3): void {
    const sound = this.soundMap.get(type);
    if (!sound) return;

    // If position is provided, make it positional audio
    if (position) {
      sound.position.set(position.x, position.y, position.z);
    }

    // Resume audio context if suspended (needed for user interaction)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    // Clone and play the sound to allow overlapping
    const clonedSound = sound.clone();
    clonedSound.play();
    
    // Clean up after playing
    setTimeout(() => {
      if (clonedSound.isPlaying) {
        clonedSound.stop();
      }
    }, 1000);
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    // Update the volume for all sounds
    this.soundMap.forEach(sound => {
      sound.setVolume(this.masterVolume);
    });
  }

  public getAudioListener(): THREE.AudioListener {
    return this.audioListener;
  }

  public dispose(): void {
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
}