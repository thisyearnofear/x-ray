/**
 * Visual Scan Feedback System
 * Provides real-time visual feedback on the 3D model during scanning
 * 
 * CORE PRINCIPLES:
 * - ENHANCEMENT FIRST: Enhances existing x-ray effect system
 * - PERFORMANT: Hardware-accelerated effects, optimized for 60fps
 * - MODULAR: Independent visual feedback system
 * - CLEAN: Clear interface for external integration
 */

import * as THREE from 'three'
import { colors, effects } from '../styles/design-tokens'

interface ScanRegion {
    id: string
    progress: number
    lastUpdate: number
    mesh?: THREE.Mesh
    glowMaterial?: THREE.ShaderMaterial
}

export class ScanFeedbackSystem {
    private scene: THREE.Scene
    private scanRegions: Map<string, ScanRegion> = new Map()
    private heatMapTexture: THREE.DataTexture | null = null
    private particleSystems: Map<string, THREE.Points> = new Map()

    // Performance optimization
    private updateInterval: number = 50 // Update every 50ms (20fps for effects)
    private lastUpdate: number = 0

    constructor(scene: THREE.Scene) {
        this.scene = scene
        this.initializeHeatMap()
    }

    private initializeHeatMap(): void {
        // Create a data texture for heat map overlay
        const size = 256
        const data = new Uint8Array(size * size * 4)

        this.heatMapTexture = new THREE.DataTexture(
            data,
            size,
            size,
            THREE.RGBAFormat
        )
        this.heatMapTexture.needsUpdate = true
    }

    // Main update method - called from animation loop
    update(deltaTime: number): void {
        const now = Date.now()

        // Throttle updates for performance
        if (now - this.lastUpdate < this.updateInterval) return
        this.lastUpdate = now

        // Update all active scan regions
        this.scanRegions.forEach((region, id) => {
            this.updateRegionVisuals(region, deltaTime)
        })

        // Update particle systems
        this.updateParticles(deltaTime)
    }

    // Start scanning a specific anatomical region
    startScanning(regionId: string, position: THREE.Vector3): void {
        if (!this.scanRegions.has(regionId)) {
            const region: ScanRegion = {
                id: regionId,
                progress: 0,
                lastUpdate: Date.now()
            }

            this.scanRegions.set(regionId, region)
            this.createGlowEffect(region, position)
            this.createParticleSystem(regionId, position)
        }
    }

    // Update scan progress for a region (0.0 to 1.0)
    updateScanProgress(regionId: string, progress: number): void {
        const region = this.scanRegions.get(regionId)
        if (region) {
            region.progress = Math.min(progress, 1.0)
            region.lastUpdate = Date.now()

            // Update visual intensity based on progress
            this.updateGlowIntensity(region)
            this.updateParticleIntensity(regionId, progress)

            // Trigger discovery effect at 100%
            if (progress >= 1.0) {
                this.triggerDiscoveryEffect(regionId)
            }
        }
    }

    // Stop scanning a region
    stopScanning(regionId: string): void {
        const region = this.scanRegions.get(regionId)
        if (region) {
            // Fade out effect
            this.fadeOutRegion(region)
            this.scanRegions.delete(regionId)

            // Remove particle system
            this.removeParticleSystem(regionId)
        }
    }

    private createGlowEffect(region: ScanRegion, position: THREE.Vector3): void {
        // Create a glow sphere around the scanned area
        const geometry = new THREE.SphereGeometry(0.3, 32, 32)

        // Custom shader material for glow effect
        const material = new THREE.ShaderMaterial({
            uniforms: {
                intensity: { value: 0.0 },
                color: { value: new THREE.Color(colors.primary.base) },
                time: { value: 0.0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float intensity;
                uniform vec3 color;
                uniform float time;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    // Fresnel effect for edge glow
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
                    
                    // Pulsing effect
                    float pulse = 0.5 + 0.5 * sin(time * 3.0);
                    
                    // Combine effects
                    float glow = fresnel * intensity * pulse;
                    
                    gl_FragColor = vec4(color * glow, glow * 0.6);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.copy(position)
        this.scene.add(mesh)

        region.mesh = mesh
        region.glowMaterial = material
    }

    private createParticleSystem(regionId: string, position: THREE.Vector3): void {
        const particleCount = 100
        const positions = new Float32Array(particleCount * 3)
        const velocities = new Float32Array(particleCount * 3)
        const particleColors = new Float32Array(particleCount * 3)

        // Initialize particles in a sphere around the scan point
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3

            // Random position in sphere
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI
            const radius = 0.2 + Math.random() * 0.3

            positions[i3] = position.x + radius * Math.sin(phi) * Math.cos(theta)
            positions[i3 + 1] = position.y + radius * Math.sin(phi) * Math.sin(theta)
            positions[i3 + 2] = position.z + radius * Math.cos(phi)

            // Random velocity (outward from center)
            velocities[i3] = (Math.random() - 0.5) * 0.02
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02

            // Color - cyan/green
            const primaryColor = new THREE.Color(colors.primary.base)
            particleColors[i3] = primaryColor.r
            particleColors[i3 + 1] = primaryColor.g
            particleColors[i3 + 2] = primaryColor.b
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        const particles = new THREE.Points(geometry, material)
        this.scene.add(particles)
        this.particleSystems.set(regionId, particles)
    }

    private updateRegionVisuals(region: ScanRegion, deltaTime: number): void {
        if (!region.mesh || !region.glowMaterial) return

        // Update shader time uniform for animation
        region.glowMaterial.uniforms.time.value += deltaTime

        // Pulse scale based on progress
        const scale = 1.0 + 0.1 * Math.sin(Date.now() * 0.005)
        region.mesh.scale.setScalar(scale)

        // Rotate glow mesh for dynamic effect
        region.mesh.rotation.y += deltaTime * 0.5
    }

    private updateGlowIntensity(region: ScanRegion): void {
        if (!region.glowMaterial) return

        // Intensity increases with progress
        const targetIntensity = 0.3 + (region.progress * 0.7)
        region.glowMaterial.uniforms.intensity.value = targetIntensity
    }

    private updateParticleIntensity(regionId: string, progress: number): void {
        const particles = this.particleSystems.get(regionId)
        if (!particles) return

        const material = particles.material as THREE.PointsMaterial
        material.opacity = 0.3 + (progress * 0.5)
    }

    private updateParticles(deltaTime: number): void {
        this.particleSystems.forEach((particles, regionId) => {
            const positions = particles.geometry.attributes.position.array as Float32Array
            const velocities = particles.geometry.attributes.velocity.array as Float32Array

            // Update particle positions
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i]
                positions[i + 1] += velocities[i + 1]
                positions[i + 2] += velocities[i + 2]

                // Reset particles that drift too far
                const distance = Math.sqrt(
                    positions[i] ** 2 +
                    positions[i + 1] ** 2 +
                    positions[i + 2] ** 2
                )

                if (distance > 1.0) {
                    // Reset to center with slight randomness
                    positions[i] *= 0.1
                    positions[i + 1] *= 0.1
                    positions[i + 2] *= 0.1
                }
            }

            particles.geometry.attributes.position.needsUpdate = true
        })
    }

    private triggerDiscoveryEffect(regionId: string): void {
        const region = this.scanRegions.get(regionId)
        if (!region || !region.mesh) return

        // Pulse effect on discovery
        const originalScale = region.mesh.scale.x
        const pulseAnimation = () => {
            if (!region.mesh) return

            const elapsed = Date.now() - region.lastUpdate
            const duration = 1000 // 1 second pulse

            if (elapsed < duration) {
                const progress = elapsed / duration
                const scale = originalScale + Math.sin(progress * Math.PI * 2) * 0.3
                region.mesh.scale.setScalar(scale)
                requestAnimationFrame(pulseAnimation)
            } else {
                region.mesh.scale.setScalar(originalScale)
            }
        }

        pulseAnimation()

        // Change color to indicate completion
        if (region.glowMaterial) {
            const completionColor = new THREE.Color(colors.accent.base)
            region.glowMaterial.uniforms.color.value = completionColor
        }

        // Burst particle effect
        this.createDiscoveryBurst(region.mesh.position)
    }

    private createDiscoveryBurst(position: THREE.Vector3): void {
        const particleCount = 50
        const positions = new Float32Array(particleCount * 3)
        const velocities = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3

            // Start at discovery point
            positions[i3] = position.x
            positions[i3 + 1] = position.y
            positions[i3 + 2] = position.z

            // Random outward velocity
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI
            const speed = 0.05 + Math.random() * 0.1

            velocities[i3] = speed * Math.sin(phi) * Math.cos(theta)
            velocities[i3 + 1] = speed * Math.sin(phi) * Math.sin(theta)
            velocities[i3 + 2] = speed * Math.cos(phi)
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))

        const material = new THREE.PointsMaterial({
            size: 0.08,
            color: new THREE.Color(colors.accent.base),
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        })

        const burst = new THREE.Points(geometry, material)
        this.scene.add(burst)

        // Animate burst
        const startTime = Date.now()
        const animateBurst = () => {
            const elapsed = Date.now() - startTime
            const duration = 2000

            if (elapsed < duration) {
                const positions = burst.geometry.attributes.position.array as Float32Array
                const velocities = burst.geometry.attributes.velocity.array as Float32Array

                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += velocities[i]
                    positions[i + 1] += velocities[i + 1]
                    positions[i + 2] += velocities[i + 2]
                }

                burst.geometry.attributes.position.needsUpdate = true
                material.opacity = 1.0 - (elapsed / duration)

                requestAnimationFrame(animateBurst)
            } else {
                this.scene.remove(burst)
                geometry.dispose()
                material.dispose()
            }
        }

        animateBurst()
    }

    private fadeOutRegion(region: ScanRegion): void {
        if (!region.mesh || !region.glowMaterial) return

        const startIntensity = region.glowMaterial.uniforms.intensity.value
        const startTime = Date.now()
        const duration = 500

        const fade = () => {
            if (!region.mesh || !region.glowMaterial) return

            const elapsed = Date.now() - startTime

            if (elapsed < duration) {
                const progress = elapsed / duration
                region.glowMaterial.uniforms.intensity.value = startIntensity * (1 - progress)
                requestAnimationFrame(fade)
            } else {
                this.scene.remove(region.mesh)
                region.mesh.geometry.dispose()
                if (region.glowMaterial) region.glowMaterial.dispose()
            }
        }

        fade()
    }

    private removeParticleSystem(regionId: string): void {
        const particles = this.particleSystems.get(regionId)
        if (particles) {
            this.scene.remove(particles)
            particles.geometry.dispose()
            if (particles.material instanceof THREE.Material) {
                particles.material.dispose()
            }
            this.particleSystems.delete(regionId)
        }
    }

    // Clean up all resources
    destroy(): void {
        // Remove all glow meshes
        this.scanRegions.forEach(region => {
            if (region.mesh) {
                this.scene.remove(region.mesh)
                region.mesh.geometry.dispose()
                if (region.glowMaterial) region.glowMaterial.dispose()
            }
        })
        this.scanRegions.clear()

        // Remove all particle systems
        this.particleSystems.forEach(particles => {
            this.scene.remove(particles)
            particles.geometry.dispose()
            if (particles.material instanceof THREE.Material) {
                particles.material.dispose()
            }
        })
        this.particleSystems.clear()

        // Dispose heat map texture
        if (this.heatMapTexture) {
            this.heatMapTexture.dispose()
        }
    }
}
