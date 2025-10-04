// CLEAN: Simplified medical marker for basic positioning
import * as THREE from 'three'

export interface MarkerConfig {
  conditionId: string
  conditionName: string
  position: { x: number; y: number; z: number }
  severity: 'low' | 'medium' | 'high'
}

export class MedicalMarker {
  private markerGroup: THREE.Group
  private config: MarkerConfig
  private marker: THREE.Mesh

  constructor(config: MarkerConfig) {
    this.config = config
    this.markerGroup = new THREE.Group()
    this.createMarker()
  }

  // ENHANCED: Professional medical marker with better visuals
  private createMarker(): void {
    // Create marker sphere with better geometry
    const geometry = new THREE.SphereGeometry(0.025, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: this.getSeverityColor(),
      transparent: true,
      opacity: 0.9,
      emissive: this.getSeverityColor(),
      emissiveIntensity: 0.2,
      metalness: 0.1,
      roughness: 0.3
    })

    this.marker = new THREE.Mesh(geometry, material)

    // Set position from config
    this.marker.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    )

    // Add subtle pulsing animation for undiscovered conditions
    this.addSubtlePulse()

    this.markerGroup.add(this.marker)
    this.markerGroup.position.copy(this.marker.position)
  }

  // ENHANCEMENT: Subtle pulsing animation for better visibility
  private addSubtlePulse(): void {
    if (typeof window !== 'undefined' && (window as any).gsap) {
      const gsap = (window as any).gsap
      gsap.to(this.marker.scale, {
        x: 1.2, y: 1.2, z: 1.2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      })
    }
  }

  private getSeverityColor(): number {
    switch (this.config.severity) {
      case 'high': return 0xff4444
      case 'medium': return 0xffaa44
      case 'low': return 0x44ff44
      default: return 0x00ff88
    }
  }

  // CLEAN: Missing methods with minimal implementations
  update(): void {
    // Minimal update - could add animations here later
  }

  updateDiscoveryProgress(progress: number): void {
    // Update marker appearance based on discovery progress
    const material = this.marker.material as THREE.MeshStandardMaterial
    material.opacity = 0.5 + (progress * 0.5) // More visible as discovered
    material.emissiveIntensity = 0.1 + (progress * 0.3) // Glow increases with progress
    
    // Scale slightly increases with progress
    const scale = 1 + (progress * 0.2)
    this.marker.scale.setScalar(scale)
  }

  // CLEAN: Public interface
  getMarkerGroup(): THREE.Group {
    return this.markerGroup
  }

  showAROverlay(): void {
    // Simple show implementation
    this.markerGroup.visible = true
  }

  markAsDiscovered(): void {
    // Update marker appearance for discovered state
    const material = this.marker.material as THREE.MeshStandardMaterial
    material.color.setHex(0x00ff88) // Change to green when discovered
    material.emissive.setHex(0x00ff88)
    material.emissiveIntensity = 0.4
    material.opacity = 1.0
    
    // Stop pulsing animation and add discovery effect
    if (typeof window !== 'undefined' && (window as any).gsap) {
      const gsap = (window as any).gsap
      gsap.killTweensOf(this.marker.scale)
      gsap.to(this.marker.scale, { x: 1, y: 1, z: 1, duration: 0.3 })
      
      // Brief celebration scale
      gsap.to(this.marker.scale, {
        x: 1.5, y: 1.5, z: 1.5,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      })
    }
  }

  hideAROverlay(): void {
    // Simple hide implementation
    this.markerGroup.visible = false
  }

  dispose(): void {
    this.markerGroup.clear()
  }
}
