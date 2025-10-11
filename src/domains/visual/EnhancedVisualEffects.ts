/**
 * Enhanced Visual Effects
 * IMMERSIVE: Visual effects for investigation tools and medical procedures
 * EDUCATIONAL: Visual feedback that enhances understanding of medical techniques
 * PERFORMANT: GPU-accelerated effects optimized for real-time interaction
 */

import * as THREE from 'three'
import { colors, effects } from '../../styles/design-tokens'

export interface VisualEffect {
  id: string
  type: 'particle' | 'glow' | 'pulse' | 'scan' | 'highlight' | 'trail'
  duration: number
  intensity: number
  color: string
  position?: THREE.Vector3
  target?: THREE.Object3D
}

export interface InvestigationVisualConfig {
  technique: string
  primaryEffect: VisualEffect
  secondaryEffects?: VisualEffect[]
  audioSync?: boolean
}

export class EnhancedVisualEffects {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private camera: THREE.Camera
  private effectGroups: Map<string, THREE.Group> = new Map()
  private activeEffects: Map<string, VisualEffect> = new Map()
  private particleSystems: Map<string, THREE.Points> = new Map()
  private animationMixers: THREE.AnimationMixer[] = []
  private clock: THREE.Clock = new THREE.Clock()

  // Investigation technique visual configurations
  private investigationConfigs: Map<string, InvestigationVisualConfig> = new Map()

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.scene = scene
    this.renderer = renderer
    this.camera = camera
    
    this.setupInvestigationVisuals()
    console.log('✨ Enhanced Visual Effects initialized')
  }

  private setupInvestigationVisuals(): void {
    // Palpation - Gentle pressure waves
    this.investigationConfigs.set('palpation', {
      technique: 'palpation',
      primaryEffect: {
        id: 'palpation_pressure',
        type: 'pulse',
        duration: 2000,
        intensity: 0.6,
        color: colors.primary.base
      },
      secondaryEffects: [
        {
          id: 'palpation_ripple',
          type: 'scan',
          duration: 1500,
          intensity: 0.4,
          color: colors.primary.light
        }
      ],
      audioSync: true
    })

    // Auscultation - Sound wave visualization
    this.investigationConfigs.set('auscultation', {
      technique: 'auscultation',
      primaryEffect: {
        id: 'auscultation_waves',
        type: 'particle',
        duration: 3000,
        intensity: 0.8,
        color: colors.info.base
      },
      secondaryEffects: [
        {
          id: 'auscultation_glow',
          type: 'glow',
          duration: 2500,
          intensity: 0.5,
          color: colors.info.light
        }
      ],
      audioSync: true
    })

    // Percussion - Impact visualization
    this.investigationConfigs.set('percussion', {
      technique: 'percussion',
      primaryEffect: {
        id: 'percussion_impact',
        type: 'pulse',
        duration: 800,
        intensity: 1.0,
        color: colors.accent.base
      },
      secondaryEffects: [
        {
          id: 'percussion_shockwave',
          type: 'scan',
          duration: 1200,
          intensity: 0.7,
          color: colors.accent.light
        }
      ],
      audioSync: true
    })

    // Inspection - Focused examination light
    this.investigationConfigs.set('inspection', {
      technique: 'inspection',
      primaryEffect: {
        id: 'inspection_light',
        type: 'highlight',
        duration: 4000,
        intensity: 0.9,
        color: colors.neutral.white
      },
      secondaryEffects: [
        {
          id: 'inspection_focus',
          type: 'glow',
          duration: 3500,
          intensity: 0.6,
          color: colors.primary.glow
        }
      ],
      audioSync: false
    })

    // Reflex Testing - Neural pathway visualization
    this.investigationConfigs.set('reflex_test', {
      technique: 'reflex_test',
      primaryEffect: {
        id: 'reflex_pathway',
        type: 'trail',
        duration: 1500,
        intensity: 0.8,
        color: colors.error.base
      },
      secondaryEffects: [
        {
          id: 'reflex_response',
          type: 'pulse',
          duration: 1000,
          intensity: 0.7,
          color: colors.error.light
        }
      ],
      audioSync: true
    })

    // Consultation - Communication visualization
    this.investigationConfigs.set('consultation', {
      technique: 'consultation',
      primaryEffect: {
        id: 'consultation_connection',
        type: 'particle',
        duration: 5000,
        intensity: 0.5,
        color: colors.accent.base
      },
      secondaryEffects: [
        {
          id: 'consultation_data',
          type: 'trail',
          duration: 4000,
          intensity: 0.4,
          color: colors.accent.light
        }
      ],
      audioSync: false
    })
  }

  /**
   * Start visual effect for investigation technique
   */
  public startInvestigationEffect(technique: string, position: THREE.Vector3, target?: THREE.Object3D): void {
    const config = this.investigationConfigs.get(technique)
    if (!config) {
      console.warn(`No visual configuration found for technique: ${technique}`)
      return
    }

    console.log(`✨ Starting visual effect for: ${technique}`)

    // Create effect group for this technique
    const effectGroup = new THREE.Group()
    effectGroup.position.copy(position)
    this.scene.add(effectGroup)
    this.effectGroups.set(technique, effectGroup)

    // Start primary effect
    config.primaryEffect.position = position
    config.primaryEffect.target = target
    this.createVisualEffect(config.primaryEffect, effectGroup)

    // Start secondary effects with slight delays
    if (config.secondaryEffects) {
      config.secondaryEffects.forEach((effect, index) => {
        setTimeout(() => {
          effect.position = position
          effect.target = target
          this.createVisualEffect(effect, effectGroup)
        }, index * 200) // Stagger secondary effects
      })
    }

    // Auto-cleanup after duration
    setTimeout(() => {
      this.stopInvestigationEffect(technique)
    }, config.primaryEffect.duration + 1000)
  }

  /**
   * Stop visual effect for investigation technique
   */
  public stopInvestigationEffect(technique: string): void {
    const effectGroup = this.effectGroups.get(technique)
    if (effectGroup) {
      // Fade out effect
      this.fadeOutEffect(effectGroup, 500)
      
      setTimeout(() => {
        this.scene.remove(effectGroup)
        this.effectGroups.delete(technique)
      }, 500)
    }
  }

  /**
   * Create specific visual effect
   */
  private createVisualEffect(effect: VisualEffect, parent: THREE.Group): void {
    switch (effect.type) {
      case 'particle':
        this.createParticleEffect(effect, parent)
        break
      case 'glow':
        this.createGlowEffect(effect, parent)
        break
      case 'pulse':
        this.createPulseEffect(effect, parent)
        break
      case 'scan':
        this.createScanEffect(effect, parent)
        break
      case 'highlight':
        this.createHighlightEffect(effect, parent)
        break
      case 'trail':
        this.createTrailEffect(effect, parent)
        break
    }
  }

  /**
   * Create particle effect
   */
  private createParticleEffect(effect: VisualEffect, parent: THREE.Group): void {
    const particleCount = 100
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Random positions in sphere
      const radius = Math.random() * 0.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      // Color based on effect color
      const color = new THREE.Color(effect.color)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
      
      sizes[i] = Math.random() * 0.02 + 0.01
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Particle material
    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: effect.intensity,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    parent.add(particles)
    this.particleSystems.set(effect.id, particles)

    // Animate particles
    this.animateParticles(particles, effect)
  }

  /**
   * Create glow effect
   */
  private createGlowEffect(effect: VisualEffect, parent: THREE.Group): void {
    const geometry = new THREE.SphereGeometry(0.3, 16, 16)
    const material = new THREE.MeshBasicMaterial({
      color: effect.color,
      transparent: true,
      opacity: effect.intensity * 0.3,
      blending: THREE.AdditiveBlending
    })

    const glowSphere = new THREE.Mesh(geometry, material)
    parent.add(glowSphere)

    // Animate glow
    this.animateGlow(glowSphere, effect)
  }

  /**
   * Create pulse effect
   */
  private createPulseEffect(effect: VisualEffect, parent: THREE.Group): void {
    const geometry = new THREE.RingGeometry(0.1, 0.2, 16)
    const material = new THREE.MeshBasicMaterial({
      color: effect.color,
      transparent: true,
      opacity: effect.intensity,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })

    const pulseRing = new THREE.Mesh(geometry, material)
    pulseRing.lookAt(this.camera.position)
    parent.add(pulseRing)

    // Animate pulse
    this.animatePulse(pulseRing, effect)
  }

  /**
   * Create scan effect
   */
  private createScanEffect(effect: VisualEffect, parent: THREE.Group): void {
    const geometry = new THREE.PlaneGeometry(1, 0.05)
    const material = new THREE.MeshBasicMaterial({
      color: effect.color,
      transparent: true,
      opacity: effect.intensity,
      blending: THREE.AdditiveBlending
    })

    const scanLine = new THREE.Mesh(geometry, material)
    scanLine.position.y = -0.5
    parent.add(scanLine)

    // Animate scan
    this.animateScan(scanLine, effect)
  }

  /**
   * Create highlight effect
   */
  private createHighlightEffect(effect: VisualEffect, parent: THREE.Group): void {
    // Create spotlight
    const spotlight = new THREE.SpotLight(effect.color, effect.intensity, 2, Math.PI / 6, 0.5)
    spotlight.position.set(0, 1, 0)
    spotlight.target.position.set(0, 0, 0)
    parent.add(spotlight)
    parent.add(spotlight.target)

    // Animate highlight
    this.animateHighlight(spotlight, effect)
  }

  /**
   * Create trail effect
   */
  private createTrailEffect(effect: VisualEffect, parent: THREE.Group): void {
    const points = []
    for (let i = 0; i < 20; i++) {
      points.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      ))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: effect.color,
      transparent: true,
      opacity: effect.intensity,
      blending: THREE.AdditiveBlending
    })

    const trail = new THREE.Line(geometry, material)
    parent.add(trail)

    // Animate trail
    this.animateTrail(trail, effect)
  }

  /**
   * Animation methods
   */
  private animateParticles(particles: THREE.Points, effect: VisualEffect): void {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / effect.duration

      if (progress < 1) {
        // Rotate particles
        particles.rotation.y += 0.01
        
        // Update opacity
        const material = particles.material as THREE.PointsMaterial
        material.opacity = effect.intensity * (1 - progress)
        
        requestAnimationFrame(animate)
      }
    }
    animate()
  }

  private animateGlow(glowSphere: THREE.Mesh, effect: VisualEffect): void {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / effect.duration

      if (progress < 1) {
        // Pulse scale
        const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.2
        glowSphere.scale.setScalar(scale)
        
        // Update opacity
        const material = glowSphere.material as THREE.MeshBasicMaterial
        material.opacity = effect.intensity * 0.3 * (1 - progress)
        
        requestAnimationFrame(animate)
      }
    }
    animate()
  }

  private animatePulse(pulseRing: THREE.Mesh, effect: VisualEffect): void {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / effect.duration

      if (progress < 1) {
        // Expand ring
        const scale = 1 + progress * 3
        pulseRing.scale.setScalar(scale)
        
        // Update opacity
        const material = pulseRing.material as THREE.MeshBasicMaterial
        material.opacity = effect.intensity * (1 - progress)
        
        requestAnimationFrame(animate)
      }
    }
    animate()
  }

  private animateScan(scanLine: THREE.Mesh, effect: VisualEffect): void {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / effect.duration

      if (progress < 1) {
        // Move scan line
        scanLine.position.y = -0.5 + progress * 1
        
        // Update opacity
        const material = scanLine.material as THREE.MeshBasicMaterial
        material.opacity = effect.intensity * Math.sin(progress * Math.PI)
        
        requestAnimationFrame(animate)
      }
    }
    animate()
  }

  private animateHighlight(spotlight: THREE.SpotLight, effect: VisualEffect): void {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / effect.duration

      if (progress < 1) {
        // Adjust intensity
        spotlight.intensity = effect.intensity * (1 - progress * 0.5)
        
        // Slight movement
        spotlight.position.x = Math.sin(elapsed * 0.001) * 0.1
        spotlight.position.z = Math.cos(elapsed * 0.001) * 0.1
        
        requestAnimationFrame(animate)
      }
    }
    animate()
  }

  private animateTrail(trail: THREE.Line, effect: VisualEffect): void {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / effect.duration

      if (progress < 1) {
        // Update trail opacity
        const material = trail.material as THREE.LineBasicMaterial
        material.opacity = effect.intensity * (1 - progress)
        
        // Animate trail points
        const positions = trail.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (Math.random() - 0.5) * 0.01
          positions[i + 1] += (Math.random() - 0.5) * 0.01
          positions[i + 2] += (Math.random() - 0.5) * 0.01
        }
        trail.geometry.attributes.position.needsUpdate = true
        
        requestAnimationFrame(animate)
      }
    }
    animate()
  }

  /**
   * Fade out effect
   */
  private fadeOutEffect(group: THREE.Group, duration: number): void {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      if (progress < 1) {
        group.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.Line) {
            const material = child.material as any
            if (material.opacity !== undefined) {
              material.opacity *= (1 - progress * 0.1)
            }
          }
        })
        
        requestAnimationFrame(animate)
      }
    }
    animate()
  }

  /**
   * Create revelation effect for progressive revelation
   */
  public createRevelationEffect(position: THREE.Vector3, findingType: 'normal' | 'critical' | 'red_herring'): void {
    const effectGroup = new THREE.Group()
    effectGroup.position.copy(position)
    this.scene.add(effectGroup)

    let color: string
    let intensity: number

    switch (findingType) {
      case 'critical':
        color = colors.error.base
        intensity = 1.0
        break
      case 'red_herring':
        color = colors.accent.base
        intensity = 0.7
        break
      default:
        color = colors.primary.base
        intensity = 0.8
    }

    // Create revelation burst effect
    const burstEffect: VisualEffect = {
      id: 'revelation_burst',
      type: 'particle',
      duration: 2000,
      intensity,
      color
    }

    this.createVisualEffect(burstEffect, effectGroup)

    // Add glow effect
    const glowEffect: VisualEffect = {
      id: 'revelation_glow',
      type: 'glow',
      duration: 3000,
      intensity: intensity * 0.6,
      color
    }

    setTimeout(() => {
      this.createVisualEffect(glowEffect, effectGroup)
    }, 200)

    // Cleanup
    setTimeout(() => {
      this.fadeOutEffect(effectGroup, 1000)
      setTimeout(() => {
        this.scene.remove(effectGroup)
      }, 1000)
    }, 3000)
  }

  /**
   * Create difficulty adjustment visual feedback
   */
  public createDifficultyAdjustmentEffect(direction: 'increase' | 'decrease'): void {
    const color = direction === 'increase' ? colors.error.base : colors.primary.base
    const effectGroup = new THREE.Group()
    this.scene.add(effectGroup)

    // Create screen-wide effect
    const geometry = new THREE.PlaneGeometry(10, 10)
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending
    })

    const overlay = new THREE.Mesh(geometry, material)
    overlay.position.z = -2
    effectGroup.add(overlay)

    // Animate overlay
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / 1000

      if (progress < 1) {
        material.opacity = 0.1 * Math.sin(progress * Math.PI)
        requestAnimationFrame(animate)
      } else {
        this.scene.remove(effectGroup)
      }
    }
    animate()
  }

  /**
   * Update visual effects
   */
  public update(): void {
    const deltaTime = this.clock.getDelta()
    
    // Update animation mixers
    this.animationMixers.forEach(mixer => {
      mixer.update(deltaTime)
    })
  }

  /**
   * Get available investigation techniques
   */
  public getAvailableInvestigationTechniques(): string[] {
    return Array.from(this.investigationConfigs.keys())
  }

  /**
   * Check if technique has visual effects
   */
  public hasVisualEffects(technique: string): boolean {
    return this.investigationConfigs.has(technique)
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    // Stop all active effects
    this.effectGroups.forEach(group => {
      this.scene.remove(group)
    })
    
    this.effectGroups.clear()
    this.activeEffects.clear()
    this.particleSystems.clear()
    this.animationMixers.length = 0
    
    console.log('✨ Enhanced Visual Effects destroyed')
  }
}