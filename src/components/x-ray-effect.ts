import * as THREE from "three"
import LeePerry from "./lee-perry"
import Skeleton from "./skeleton"
import { DiagnosticUI } from "../domains/diagnostic/diagnostic-ui"
import { InstructionsPanel } from "./instructions-panel"
import { MEDICAL_CONDITIONS, getConditionsForModel } from "../domains/medical/medical-data"
import { EffectComposer, ShaderPass } from "three/examples/jsm/Addons.js"
import { XRayShader } from "../shaders/XRayShader"
import xRayFragment from "../shaders/x-ray-fragment.glsl"
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js"
import { Position } from "../types/types"
import gsap from "gsap"
import { MedicalMarker } from "./MedicalMarker"
import { AudioManager as AudioManagerType, SoundType as SoundTypeType } from "./AudioManager"
import { VisualFeedbackSystem } from "./VisualFeedbackSystem"

const rtParams = {
  format: THREE.RGBAFormat,
  //type: THREE.UnsignedByteType, // Instead of FloatType
  type: THREE.HalfFloatType, // Instead of FloatType
  // Optimize texture filtering
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
}

import { AudioManager } from './AudioManager'
import { SoundType } from './AudioManager'

interface Props {
  scene: THREE.Scene
  composer: EffectComposer
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  audioManager: AudioManagerType
}

export default class XRayEffect {
  scene: THREE.Scene
  composer: EffectComposer
  renderer: THREE.WebGLRenderer
  renderTargetA: THREE.WebGLRenderTarget
  skeletonModel: THREE.Group | null = null
  leePerryModel: THREE.Group | null = null
  xRayPass: ShaderPass
  camera: THREE.PerspectiveCamera
  leePerry: LeePerry
  skeleton: Skeleton
  medicalMarkers: Map<string, MedicalMarker> = new Map()
  diagnosticUI: DiagnosticUI
  instructionsPanel: InstructionsPanel
  mouse: {
    current: Position
    target: Position
  }
  expanded: boolean = false
  // Add scale property for X-ray effect scaling
  scale: number = 1.0
  keyHandler: (event: KeyboardEvent) => void

  // Audio system
  audioManager: AudioManagerType;

  // Visual feedback system for accessibility
  visualFeedbackSystem: VisualFeedbackSystem;

  // INTEGRATION: Progressive discovery and model switching
  currentModel: 'head' | 'torso' | 'fullbody' = 'head'
  scanProgress: Map<string, number> = new Map() // Track scanning progress per condition
  discoveredConditions: Set<string> = new Set() // Track discovered conditions
  visibleAnatomy: string[] = ['head', 'neck', 'cervical_spine', 'jaw', 'face'] // Current visible anatomy

  constructor({ scene, composer, renderer, camera, audioManager }: Props) {
    this.scene = scene
    this.composer = composer
    this.renderer = renderer
    this.camera = camera
    this.audioManager = audioManager;
    this.visualFeedbackSystem = new VisualFeedbackSystem(this.scene);
    this.mouse = {
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
    }
    this.createRenderTargets()
    this.setupPostprocessing()
    this.createLeePerry()
    this.createSkeleton()
    this.initializeMedicalMarkers()
    this.instructionsPanel = new InstructionsPanel()
    this.diagnosticUI = new DiagnosticUI()

    // PREVENT BLOAT: Single event listener with cleanup
    this.keyHandler = (event: KeyboardEvent) => this.onPressKey(event)
    window.addEventListener("keydown", this.keyHandler)
  }

  createRenderTargets() {
    // Use simplified implementation to avoid distortion (following best practice)
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    this.renderTargetA = new THREE.WebGLRenderTarget(
      sizes.width,
      sizes.height,
      rtParams
    )
  }

  onMouseMove(position: Position) {
    this.mouse.target = position
    // INTEGRATION: Update scanning progress for progressive discovery
    this.updateScanProgress(position)
  }

  // INTEGRATION: Progressive discovery through scanning
  updateScanProgress(mousePosition: Position) {
    const scanRadius = 0.15 // Radius around mouse for scanning
    const deltaTime = 0.016 // Approximate frame time (60fps)

    this.medicalMarkers.forEach((medicalMarker, conditionId) => {
      if (this.discoveredConditions.has(conditionId)) return

      const markerGroup = medicalMarker.getMarkerGroup();
      const markerPos = markerGroup.position;
      const mousePos3D = new THREE.Vector3(
        (mousePosition.x - 0.5) * 4, // Convert to world coordinates
        (mousePosition.y - 0.5) * 4,
        0
      )

      const distance = markerPos.distanceTo(mousePos3D)

      if (distance < scanRadius) {
        // Increase scan progress
        const currentProgress = this.scanProgress.get(conditionId) || 0
        const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId)
        const requiredTime = condition?.scanTimeRequired || 3

        const newProgress = Math.min(currentProgress + deltaTime, requiredTime)
        this.scanProgress.set(conditionId, newProgress)

        // Update marker visibility based on progress
        this.updateMarkerVisibility(medicalMarker, newProgress / requiredTime)

        // Update diagnostic UI progress
        this.diagnosticUI.updateScanProgress(conditionId, newProgress)

        // Check if condition is fully discovered
        if (newProgress >= requiredTime && !this.discoveredConditions.has(conditionId)) {
          this.discoverCondition(conditionId)
        }
      }
    })
  }

  // INTEGRATION: Progressive marker revelation
  updateMarkerVisibility(medicalMarker: MedicalMarker, progress: number) {
    medicalMarker.updateDiscoveryProgress(progress);
  }

  setupPostprocessing() {
    XRayShader.uniforms.tDiffuse1 = new THREE.Uniform(new THREE.Vector4())
    XRayShader.uniforms.uMouse.value = new THREE.Vector2()
    const pixelRatio = Math.min(2, window.devicePixelRatio)
    XRayShader.uniforms.uViewportRes.value = new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio)
    XRayShader.uniforms.expand.value = 0

    XRayShader.fragmentShader = xRayFragment

    this.xRayPass = new ShaderPass(XRayShader)
    this.xRayPass.uniforms["resolution"].value.x =
      window.innerWidth * Math.min(window.devicePixelRatio, 2)
    this.xRayPass.uniforms["resolution"].value.y =
      window.innerHeight * Math.min(window.devicePixelRatio, 2)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.4,
      3,
      0
    )

    this.composer.addPass(bloomPass)
    this.composer.addPass(this.xRayPass)
  }

  onResize() {
    const pixelRatio = Math.min(2, window.devicePixelRatio)
    this.xRayPass.uniforms.uViewportRes.value = new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio)

    // Recreate render targets on resize to maintain proper dimensions
    this.createRenderTargets()
  }

  onPressKey(event: KeyboardEvent) {
    if (event.key === "c" || event.key === "C") {
      this.toggleConditions()
    } else if (event.key === "e" || event.key === "E") {
      if (this.expanded) {
        gsap.to(this.xRayPass.uniforms.expand, {
          value: 0,
          duration: 0.5,
          ease: "power2.out",
        })
        this.expanded = false
      } else {
        gsap.to(this.xRayPass.uniforms.expand, {
          value: 0.25,
          duration: 0.5,
          ease: "power2.out",
        })
        this.expanded = true
      }
    }
    // INTEGRATION: Keyboard shortcuts for model switching
    else if (event.key === "1") {
      this.switchAnatomicalModel('head')
    } else if (event.key === "2") {
      this.switchAnatomicalModel('torso')
    } else if (event.key === "3") {
      this.switchAnatomicalModel('fullbody')
    }
  }

  createLeePerry() {
    this.leePerry = new LeePerry({
      scene: this.scene,
    })
  }

  createSkeleton() {
    this.skeleton = new Skeleton({
      scene: this.scene,
    })
  }

  initializeMedicalMarkers() {
    // INTEGRATION: Only create markers for conditions visible in current model
    this.updateMarkersForCurrentModel()

    // CLEAN: Ensure markers are visible by default
    console.log('Initializing medical markers for model:', this.currentModel)
  }

  // INTEGRATION: Smart marker management based on anatomical model
  updateMarkersForCurrentModel() {
    // Clear existing markers
    this.medicalMarkers.forEach(medicalMarker => {
      medicalMarker.dispose();
      const markerGroup = medicalMarker.getMarkerGroup();
      if (markerGroup.parent) {
        markerGroup.parent.remove(markerGroup);
      }
    })
    this.medicalMarkers.clear()
    this.scanProgress.clear()

    // PERFORMANT: Use consolidated condition filtering
    const conditions = getConditionsForModel(this.currentModel)
    conditions.forEach(condition => {
      if (condition.requiredModel === this.currentModel ||
        condition.visibleIn.some(part => this.visibleAnatomy.includes(part))) {
        this.createConditionMarker(condition)
        this.scanProgress.set(condition.id, 0) // Initialize scan progress
      }
    })

    console.log(`Updated markers for ${this.currentModel} model: ${this.medicalMarkers.size} conditions`)
  }

  render() {
    this.skeletonModel = this.skeleton?.getModel()
    this.leePerryModel = this.leePerry?.getModel()

    //this.renderer.setClearColor(0xffffff, 1)

    if (!this.leePerryModel || !this.skeletonModel) return

    this.mouse.current.x = gsap.utils.interpolate(
      this.mouse.current.x,
      this.mouse.target.x,
      0.1
    )
    this.mouse.current.y = gsap.utils.interpolate(
      this.mouse.current.y,
      this.mouse.target.y,
      0.1
    )

    this.skeletonModel.children.forEach((child) => {
      child.visible = false
    })
    this.leePerryModel.children.forEach((child) => {
      child.visible = true
    })

    this.renderer.setRenderTarget(this.renderTargetA)
    this.renderer.render(this.scene, this.camera)

    this.skeletonModel.children.forEach((child) => {
      child.visible = true
    })
    this.leePerryModel.children.forEach((child) => {
      child.visible = false
    })

    this.xRayPass.uniforms.tDiffuse1.value = this.renderTargetA.texture
    // Revert to using target mouse position for accurate positioning
    this.xRayPass.uniforms.uMouse.value = this.mouse.target

    // Update the expand uniform based on scale - this is the correct way to scale the X-ray effect
    // The base size is 0.25, so we adjust the expand value based on scale
    // Scale of 1.0 = expand of 0 (base size 0.25)
    // Scale of 2.0 = expand of 0.25 (size 0.5)
    // Scale of 0.3 = expand of -0.175 (size 0.075)
    if (this.xRayPass.uniforms.expand) {
      const baseSize = 0.25;
      const targetSize = baseSize * this.scale;
      this.xRayPass.uniforms.expand.value = targetSize - baseSize;
    }

    //this.renderer.setClearColor(0x000000, 0) // Set clear color to transparent

    this.skeletonModel.rotation.y += 0.005
    this.leePerryModel.rotation.y += 0.005

    // Update all medical markers
    this.medicalMarkers.forEach(marker => {
      marker.update();
    });

    this.renderer.setRenderTarget(null)
  }

  // CLEAN: Simplified marker creation with single positioning system
  createConditionMarker(condition: any) {
    const markerOptions = {
      conditionId: condition.id,
      conditionName: condition.name,
      position: condition.position,
      severity: condition.severity
    };

    const medicalMarker = new MedicalMarker(markerOptions);
    const markerGroup = medicalMarker.getMarkerGroup();

    // CLEAN: Ensure markers are visible and properly positioned
    markerGroup.visible = true;
    this.scene.add(markerGroup);
    this.medicalMarkers.set(condition.id, medicalMarker);

    console.log(`Created marker for ${condition.id} at position:`, markerGroup.position);
  }

  // INTEGRATION: Add subtle pulsing effect to hint at hidden conditions
  addSubtlePulse(marker: THREE.Mesh) {
    gsap.to(marker.scale, {
      x: 1.1, y: 1.1, z: 1.1,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    })
  }

  toggleConditions() {
    // CLEAN: Force markers visible without bloat
    this.medicalMarkers.forEach((marker) => {
      marker.getMarkerGroup().visible = true
    })
  }

  // MODULAR: Clean interaction handlers with consistent UX
  handleMedicalConditionHover(intersects: THREE.Intersection[]) {
    // For the new marker system, we need to check if the intersected object
    // is part of a medical marker group
    const medicalIntersect = intersects.find(i =>
      Array.from(this.medicalMarkers.values()).some(marker =>
        marker.getMarkerGroup().children.includes(i.object as THREE.Object3D) ||
        marker.getMarkerGroup() === i.object
      )
    )

    // Hide AR overlays for all markers first
    this.medicalMarkers.forEach(marker => {
      marker.hideAROverlay();
    });

    // Show AR overlay for the hovered marker with consistent timing
    if (medicalIntersect) {
      for (const [conditionId, medicalMarker] of this.medicalMarkers.entries()) {
        const markerGroup = medicalMarker.getMarkerGroup();

        if (medicalIntersect.object === markerGroup ||
          markerGroup.children.includes(medicalIntersect.object as THREE.Object3D)) {
          medicalMarker.showAROverlay();
          break;
        }
      }

      // Also provide audio feedback for hover to maintain consistency
      if (this.audioManager) {
        this.audioManager.playSound(SoundTypeType.HOVER);
      }
    }

    document.body.style.cursor = medicalIntersect ? 'pointer' : 'default'
  }

  handleMedicalConditionClick(intersects: THREE.Intersection[]) {
    // Find which medical marker was clicked
    for (const [conditionId, medicalMarker] of this.medicalMarkers.entries()) {
      const markerGroup = medicalMarker.getMarkerGroup();

      // Check if any part of the marker group was intersected
      if (intersects.some(intersect =>
        markerGroup.children.includes(intersect.object as THREE.Object3D) ||
        markerGroup === intersect.object
      )) {
        // Play click sound for consistency
        this.audioManager.playSound(SoundTypeType.CLICK);

        // ENHANCEMENT FIRST: Trigger streaming analysis for immediate feedback
        const condition = MEDICAL_CONDITIONS.find(c => c.id === conditionId)
        if (condition) {
          this.diagnosticUI.analyzeCondition(condition)
        }

        this.discoverCondition(conditionId);
        // Hide the AR overlay after discovery
        medicalMarker.hideAROverlay();
        break;
      }
    }
  }

  discoverCondition(conditionId: string) {
    console.log('🔍 Discovering condition:', conditionId)

    // Mark as discovered
    this.discoveredConditions.add(conditionId)

    // Update marker appearance for discovered condition
    const medicalMarker = this.medicalMarkers.get(conditionId)
    if (medicalMarker) {
      medicalMarker.markAsDiscovered();

      // Get condition details for both audio and visual feedback
      const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId);
      if (condition) {
        // Play discovery sound based on severity
        switch (condition.severity) {
          case 'low':
            this.audioManager.playSound(SoundTypeType.LOW_SEVERITY, medicalMarker.getMarkerGroup().position);
            break;
          case 'medium':
            this.audioManager.playSound(SoundTypeType.MEDIUM_SEVERITY, medicalMarker.getMarkerGroup().position);
            break;
          case 'high':
            this.audioManager.playSound(SoundTypeType.HIGH_SEVERITY, medicalMarker.getMarkerGroup().position);
            break;
        }

        // Create visual feedback as audio alternative
        this.visualFeedbackSystem.createConditionDiscoveryFeedback(
          medicalMarker.getMarkerGroup().position,
          condition.severity,
          condition.name
        );
      }
    }

    // Trigger diagnostic UI
    this.diagnosticUI.discoverCondition(conditionId)
  }

  // INTEGRATION: Switch between anatomical models with reality shift effects
  switchAnatomicalModel(modelType: 'head' | 'torso' | 'fullbody') {
    if (this.currentModel === modelType) return

    console.log(`Switching from ${this.currentModel} to ${modelType} model`)

    // Play transition sound
    this.audioManager.playSound(SoundTypeType.DISCOVERY);

    // Create a transition effect
    this.performRealityShift(modelType);

    this.currentModel = modelType

    // Update visible anatomy based on model
    switch (modelType) {
      case 'head':
        this.visibleAnatomy = ['head', 'neck', 'cervical_spine', 'jaw', 'face', 'temporomandibular_joint']
        break
      case 'torso':
        this.visibleAnatomy = ['spine', 'back', 'torso', 'chest', 'ribs']
        break
      case 'fullbody':
        this.visibleAnatomy = ['legs', 'lower_body', 'thigh', 'knee', 'spine', 'back', 'torso']
        break
    }

    // Update markers for new model
    this.updateMarkersForCurrentModel()

    // Reset discovery progress for new model
    this.discoveredConditions.clear()

    console.log(`Model switched. Visible anatomy:`, this.visibleAnatomy)
    console.log(`Active markers: ${this.medicalMarkers.size}`)
  }

  // NEW: Perform reality shift transition effect
  private performRealityShift(newModelType: 'head' | 'torso' | 'fullbody'): void {
    // Create a brief fade effect during transition
    const originalExpandValue = this.xRayPass.uniforms.expand.value;

    // Fade out effect
    gsap.to(this.xRayPass.uniforms.expand, {
      value: originalExpandValue - 0.5,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        // Fade back in with new model
        gsap.to(this.xRayPass.uniforms.expand, {
          value: originalExpandValue,
          duration: 0.3,
          ease: "power2.out"
        });

        // Create visual feedback for model switch
        this.visualFeedbackSystem.createModelSwitchFeedback(
          new THREE.Vector3(0, 0, 0) // Center of scene for model switch feedback
        );
      }
    });

    // Play transition sound
    this.audioManager.playSound(SoundTypeType.CONDITION_FOUND);
  }

  // INTEGRATION: Get conditions visible in current model (for diagnostic UI filtering)
  getVisibleConditions(): string[] {
    return Object.values(MEDICAL_CONDITIONS)
      .filter(condition =>
        condition.requiredModel === this.currentModel ||
        condition.visibleIn.some(part => this.visibleAnatomy.includes(part))
      )
      .map(condition => condition.id)
  }

  // Add method to set the X-ray effect scale (0.3 to 2.0)
  setScale(scale: number) {
    // Clamp the scale between 0.3 and 2.0 as per project specifications
    this.scale = Math.max(0.3, Math.min(2.0, scale));
    console.log('🔍 X-ray effect scale updated:', this.scale);
  }

  // CLEAN: Old Llama methods removed - now handled by DiagnosticUI

  // MODULAR: Clean resource management
  destroy() {
    window.removeEventListener("keydown", this.keyHandler)
    this.instructionsPanel?.destroy()
    this.diagnosticUI?.destroy()
  }
}
