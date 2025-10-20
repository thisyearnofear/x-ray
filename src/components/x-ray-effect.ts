import * as THREE from "three"
import LeePerry from "./lee-perry"
import Skeleton from "./skeleton"
import { DiagnosticUIFacade } from "../domains/diagnostic/DiagnosticUIFacade"
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
import { AudioManagementSystem } from "../domains/audio/audio-management-system"

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
  scanFeedbackSystem?: any
  mobileCamera?: any
  gameManager?: any
}

export default class XRayEffect {
  scene: THREE.Scene
  composer: EffectComposer
  renderer: THREE.WebGLRenderer
  renderTargetA!: THREE.WebGLRenderTarget
  skeletonModel: THREE.Group | null = null
  leePerryModel: THREE.Group | null = null
  xRayPass!: ShaderPass
  camera: THREE.PerspectiveCamera
  leePerry!: LeePerry
  skeleton!: Skeleton
  medicalMarkers: Map<string, MedicalMarker> = new Map()
  // Track whether medical markers are currently visible
  private areConditionsVisible: boolean = false
  diagnosticUI!: DiagnosticUIFacade
  instructionsPanel!: InstructionsPanel
  mouse!: {
    current: Position
    target: Position
  }
  expanded: boolean = false
  // Add scale property for X-ray effect scaling
  scale: number = 1.0
  keyHandler!: (event: KeyboardEvent) => void

  // Audio system
  audioManager: AudioManagerType;
  // Audio management system
  audioManagementSystem!: AudioManagementSystem;

  // Visual feedback system for accessibility
  visualFeedbackSystem!: VisualFeedbackSystem;

  // ENHANCEMENT FIRST: Reference to scan feedback system from canvas
  scanFeedbackSystem: any;

  // Reference to mobile camera to prevent interactions when camera is active
  mobileCamera: any;

  // Reference to game manager for achievements
  gameManager: any;

  // INTEGRATION: Progressive discovery and model switching
  currentModel: 'head' | 'torso' | 'fullbody' = 'head'
  scanProgress: Map<string, number> = new Map() // Track scanning progress per condition
  discoveredConditions: Set<string> = new Set() // Track discovered conditions
  visibleAnatomy: string[] = ['head', 'neck', 'cervical_spine', 'jaw', 'face'] // Current visible anatomy
  
  // ENHANCEMENT: Visual scanning feedback system
  scanRings: Map<string, THREE.Mesh> = new Map(); // Scanning rings around markers
  progressRings: Map<string, THREE.Mesh> = new Map(); // Progress rings for each marker
  activeScans: Set<string> = new Set(); // Track markers currently being scanned
  
  // ENHANCEMENT: Hint and guidance system
  lastActivityTime: number = Date.now();
  hintTimeout: number = 10000; // 10 seconds
  lastHintShown: string | null = null;
  lastHintTime: number = 0; // Track when last hint was shown
  lastHintCheckTime: number = 0; // Track when last hint check was performed
  
  constructor({ scene, composer, renderer, camera, audioManager, scanFeedbackSystem, mobileCamera, gameManager }: Props) {
    this.scene = scene
    this.composer = composer
    this.renderer = renderer
    this.camera = camera
    this.audioManager = audioManager;
    this.audioManagementSystem = new AudioManagementSystem(audioManager);
    this.scanFeedbackSystem = scanFeedbackSystem;
    this.mobileCamera = mobileCamera;
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

    // ENHANCEMENT FIRST: Pass system references to DiagnosticUIFacade
    this.diagnosticUI = new DiagnosticUIFacade({
      audioManager: this.audioManager,
      xRayEffect: this,
      scanFeedbackSystem: this.scanFeedbackSystem,
      gameManager: gameManager,
      onSolveClick: () => console.log('Solve clicked'),
      onHintClick: () => console.log('Hint clicked'),
      onConsultationClick: () => console.log('Consultation clicked'),
      onDiagnosisSubmit: (conditions) => console.log('Diagnosis submitted:', conditions),
      onError: (message) => console.error('Error:', message)
    })
    
    this.gameManager = gameManager;

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
        // Mark this as an activity to reset hint timer
        this.lastActivityTime = Date.now();
        
        // Increase scan progress
        const currentProgress = this.scanProgress.get(conditionId) || 0
        const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId)
        const requiredTime = condition?.scanTimeRequired || 3

        const newProgress = Math.min(currentProgress + deltaTime, requiredTime)
        this.scanProgress.set(conditionId, newProgress)

        // Create or update scanning VFX
        if (!this.scanRings.has(conditionId)) {
          this.createScanningVFX(conditionId, markerPos);
        }
        
        // Create or update progress ring if it doesn't exist
        if (!this.progressRings.has(conditionId)) {
          this.createProgressRing(conditionId, markerPos);
        }
        
        // Update progress ring based on current progress
        this.updateProgressRing(conditionId, newProgress / requiredTime)

        // Update marker visibility based on progress
        this.updateMarkerVisibility(medicalMarker, newProgress / requiredTime)

        // Update diagnostic UI progress
        this.diagnosticUI.updateScanProgress(conditionId, newProgress / requiredTime)

        // Provide audio feedback during scanning
        const progressRatio = newProgress / requiredTime;
        if (condition && progressRatio > 0.9 && progressRatio < 0.95) { // Almost discovered
          this.audioManager?.showFeedback(`Almost there! Keep scanning ${condition.name}!`, 'success');
        } else if (condition && progressRatio > 0.5 && progressRatio < 0.55) { // Halfway
          this.audioManager?.showFeedback(`Halfway to discovering ${condition.name}. Keep going!`, 'info');
        }

        // Check if this is the first scan (any scanning activity)
        if (currentProgress === 0 && newProgress > 0 && this.gameManager) {
          // Check for first scan achievement
          const gameState = this.gameManager.getGameState();
          if (gameState && gameState.unlockedTechniques && !gameState.unlockedTechniques.has('first_scan_tracked')) {
            // This is the first scan - trigger the achievement
            this.gameManager.achievementSystem?.checkAchievements({
              ...gameState,
              firstScanTracked: true
            }, {
              type: 'first_scan',
              conditionId
            });
            
            // Update game state to mark first scan as tracked
            this.gameManager.updateState({
              unlockedTechniques: new Set([...gameState.unlockedTechniques, 'first_scan_tracked'])
            });
          }
        }

        // Check if condition is fully discovered
        if (newProgress >= requiredTime && !this.discoveredConditions.has(conditionId)) {
          this.discoverCondition(conditionId)
        }
        
        // Add to active scans set
        this.activeScans.add(conditionId);
      } else {
        // If not currently scanning this marker and progress is not at max, update visibility based on global state
        const currentProgress = this.scanProgress.get(conditionId) || 0
        const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId)
        const requiredTime = condition?.scanTimeRequired || 3
        
        if (currentProgress < requiredTime) {
          // Only update visibility based on global toggle when not being actively scanned
          markerGroup.visible = this.areConditionsVisible
        }
        
        // Remove scanning VFX if not actively scanning
        if (this.activeScans.has(conditionId)) {
          this.removeScanningVFX(conditionId);
          this.activeScans.delete(conditionId);
        }
      }
    })
    
    // Check for hints after processing all markers - PREVENT BLOAT: Only check periodically
    if (Date.now() - this.lastHintCheckTime > 2000) { // Only check every 2 seconds
      this.lastHintCheckTime = Date.now();
      this.checkForHints();
    }
    
    // Show directional guidance for new users
    if (this.discoveredConditions.size < 3 && Date.now() - this.lastActivityTime > 8000) {
      this.showDirectionalGuidance();
    }
    
    // Update game objective UI
    this.updateGameObjectiveUI();
  }

  // INTEGRATION: Progressive marker revelation
  updateMarkerVisibility(medicalMarker: MedicalMarker, progress: number) {
    medicalMarker.updateDiscoveryProgress(progress);
    
    // Make sure marker is visible during active scanning regardless of global toggle
    const markerGroup = medicalMarker.getMarkerGroup();
    if (progress > 0) {
      // If marker is being scanned (progress > 0), ensure it's visible
      markerGroup.visible = true;
    }
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
    // Skip keyboard interactions if mobile camera is active
    if (this.mobileCamera && this.mobileCamera.getState && this.mobileCamera.getState().isActive) {
      return;
    }
    
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

    // CLEAN: Ensure markers respect current visibility state and are properly positioned
    // Initially markers should be invisible unless discovered
    markerGroup.visible = this.discoveredConditions.has(condition.id);
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
    // Skip toggle if mobile camera is active
    if (this.mobileCamera && this.mobileCamera.getState && this.mobileCamera.getState().isActive) {
      return;
    }
    
    // Toggle visibility of all medical markers based on current state
    const newState = !this.areConditionsVisible;
    
    this.medicalMarkers.forEach((marker, conditionId) => {
      const markerGroup = marker.getMarkerGroup();
      
      // Discovered markers should always be visible
      if (this.discoveredConditions.has(conditionId)) {
        markerGroup.visible = true;
      } else {
        // For undiscovered markers, use the global toggle state
        markerGroup.visible = newState;
      }
    })
    
    // Update our internal state
    this.areConditionsVisible = newState;
    
    console.log(`Toggled conditions visibility - Now showing: ${newState}, Total markers: ${this.medicalMarkers.size}`);
    
    // Mark as activity to prevent hint from showing immediately
    this.lastActivityTime = Date.now();
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
          
          // Play proximity sound when hovering near a condition
          this.audioManagementSystem.playSound(SoundTypeType.HOVER);
          
          // Provide audio hint about the condition if it hasn't been discovered yet
          if (!this.discoveredConditions.has(conditionId)) {
            const condition = MEDICAL_CONDITIONS.find(c => c.id === conditionId);
            if (condition && Date.now() - this.lastActivityTime > 5000) { // Only speak if no recent activity
              // Only play audio hint occasionally to avoid spam
              if (Math.random() > 0.7) { // 30% chance to avoid audio spam
                this.audioManager?.showFeedback(`Near ${condition.name}. Hold to scan.`, 'info');
              }
            }
          }
          break;
        }
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
        this.audioManagementSystem.playSound(SoundTypeType.CLICK);

        // ENHANCEMENT FIRST: Trigger streaming analysis for immediate feedback
        const condition = MEDICAL_CONDITIONS.find(c => c.id === conditionId)
        if (condition) {
          console.log('Condition clicked for analysis:', condition.name)
        }

        this.discoverCondition(conditionId);
        // Hide the AR overlay after discovery
        medicalMarker.hideAROverlay();
        break;
      }
    }
  }

  discoverCondition(conditionId: string) {
    console.log('Discovering condition:', conditionId)

    // Mark as discovered
    this.discoveredConditions.add(conditionId)

    // Update marker appearance for discovered condition
    const medicalMarker = this.medicalMarkers.get(conditionId)
    if (medicalMarker) {
      medicalMarker.markAsDiscovered();

      // Ensure discovered marker is always visible
      const markerGroup = medicalMarker.getMarkerGroup();
      markerGroup.visible = true;

      // Get condition details for both audio and visual feedback
      const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId);
      if (condition) {
        // Play discovery sound based on severity through audio management system
        this.audioManagementSystem.playDiscoverySound(condition.severity)

        // Create visual feedback as audio alternative
        this.visualFeedbackSystem.createConditionDiscoveryFeedback(
          medicalMarker.getMarkerGroup().position,
          condition.severity,
          condition.name
        );
      }
      
      // Remove scanning VFX for this condition
      this.removeScanningVFX(conditionId);
      this.activeScans.delete(conditionId);
      
      // Get condition details for the discovery announcement
      const conditionDetails = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId);
      if (conditionDetails) {
        this.audioManager?.showFeedback(`${conditionDetails.name} discovered!`, 'success');
      }
    }

    // Trigger diagnostic UI
    this.diagnosticUI.discoverCondition(conditionId)
    
    // Check for achievements related to this discovery
    if (this.gameManager) {
      const gameState = this.gameManager.getGameState();
      // Check for achievements based on current game state
      this.gameManager.achievementSystem?.checkAchievements({
        ...gameState,
        discoveredConditions: this.discoveredConditions
      }, {
        type: 'discovery',
        conditionId
      });
      
      // Record condition practice for spaced repetition
      this.gameManager.recordConditionPractice(conditionId, true);
    }
  }

  // INTEGRATION: Switch between anatomical models with reality shift effects
  switchAnatomicalModel(modelType: 'head' | 'torso' | 'fullbody') {
    if (this.currentModel === modelType) return

    console.log(`Switching from ${this.currentModel} to ${modelType} model`)

    // Play transition sound through audio management system
    this.audioManagementSystem.playSound(SoundTypeType.DISCOVERY);

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

    // Play transition sound through audio management system
    this.audioManagementSystem.playSound(SoundTypeType.CONDITION_FOUND);
  }

  // ENHANCEMENT: Visual scanning feedback systems
  createScanningVFX(conditionId: string, position: THREE.Vector3): THREE.Mesh {
    // Create a torus ring that indicates active scanning
    const geometry = new THREE.TorusGeometry(0.08, 0.015, 16, 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      emissive: 0x004444,  // Add subtle cyan glow
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.4
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.position.copy(position);
    ring.rotation.x = Math.PI / 2; // Face the camera orientation
    
    // Add pulsing animation
    if (typeof window !== 'undefined' && (window as any).gsap) {
      const gsap = (window as any).gsap;
      gsap.to(ring.material, {
        opacity: 0.3,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
      
      // Add rotation animation for added visual interest
      gsap.to(ring.rotation, {
        z: Math.PI * 2,
        duration: 4,
        repeat: -1,
        ease: "none"
      });
    }
    
    this.scene.add(ring);
    this.scanRings.set(conditionId, ring);
    return ring;
  }

  // ENHANCEMENT: Progress ring visualization
  createProgressRing(conditionId: string, position: THREE.Vector3): THREE.Mesh {
    const geometry = new THREE.RingGeometry(0.05, 0.07, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      emissive: 0x004400,  // Add subtle green glow
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.5
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.position.copy(position);
    ring.rotation.x = Math.PI / 2; // Face camera
    
    this.scene.add(ring);
    this.progressRings.set(conditionId, ring);
    return ring;
  }

  updateProgressRing(conditionId: string, progress: number): void {
    const ring = this.progressRings.get(conditionId);
    if (ring) {
      // Update the ring to show progress as a partial circle
      const material = ring.material as THREE.MeshStandardMaterial;
      
      // Change color based on progress with enhanced emissive glow
      if (progress < 0.33) {
        material.color.setHex(0xffff00); // Yellow for low progress
        material.emissive.setHex(0x444400); // Yellow glow
        material.emissiveIntensity = 0.4;
      } else if (progress < 0.66) {
        material.color.setHex(0xffaa00); // Orange for medium progress
        material.emissive.setHex(0x442200); // Orange glow
        material.emissiveIntensity = 0.5;
      } else {
        material.color.setHex(0x00ff00); // Green for high progress
        material.emissive.setHex(0x004400); // Green glow
        material.emissiveIntensity = 0.6;
      }
      
      material.opacity = 0.6;
      
      // Update to show partial ring based on progress
      // We'll recreate the ring geometry to show partial progress
      const ringObj = ring as THREE.Mesh;
      if (ringObj.parent) {
        const position = ringObj.position.clone();
        const rotation = ringObj.rotation.clone();
        
        // Remove the old ring
        ringObj.parent.remove(ringObj);
        
        // Create new partial ring based on progress
        const newGeometry = new THREE.RingGeometry(0.05, 0.07, 32, 1, 0, progress * Math.PI * 2);
        const newRing = new THREE.Mesh(newGeometry, (ringObj.material as THREE.MeshStandardMaterial).clone());
        newRing.position.copy(position);
        newRing.rotation.copy(rotation);
        
        // Store the new ring in the map
        this.scene.add(newRing);
        this.progressRings.set(conditionId, newRing);
      }
    }
  }

  removeScanningVFX(conditionId: string): void {
    const scanRing = this.scanRings.get(conditionId);
    const progressRing = this.progressRings.get(conditionId);
    
    if (scanRing) {
      if (scanRing.parent) scanRing.parent.remove(scanRing);
      this.scanRings.delete(conditionId);
    }
    
    if (progressRing) {
      if (progressRing.parent) progressRing.parent.remove(progressRing);
      this.progressRings.delete(conditionId);
    }
  }

  // ENHANCEMENT: In-game tutorial hint system - PREVENT BLOAT: Throttled to prevent excessive repetition
  showTutorialHint(message: string): void {
    // PREVENT BLOAT: Only show hint if different from last one and enough time has passed
    const minTimeBetweenSameHints = 10000; // 10 seconds minimum between same hints
    const now = Date.now();
    
    if (this.lastHintShown === message && (now - this.lastHintTime) < minTimeBetweenSameHints) {
      return; // Don't show the same hint too frequently
    }
    
    // Also prevent any hint if we've shown one recently
    const minTimeBetweenAnyHints = 5000; // 5 seconds minimum between any hints
    if ((now - this.lastHintTime) < minTimeBetweenAnyHints) {
      return; // Don't show any hint too frequently
    }
    
    this.lastHintShown = message;
    this.lastHintTime = now;
    
    // Show visual hint in UI
    this.audioManager?.showFeedback(message, 'info');
    
    console.log('Tutorial hint:', message);
  }

  checkForHints(): void {
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    
    // Show hint after 15 seconds of inactivity (increased from 10)
    if (timeSinceLastActivity > this.hintTimeout + 5000) {
      if (this.discoveredConditions.size === 0) {
        this.showTutorialHint('Press [C] to reveal condition markers, then move mouse near them to scan');
      } else if (this.discoveredConditions.size < 2) { // Reduced from 3
        this.showTutorialHint('Keep scanning! Move mouse near pulsing markers to discover conditions');
      }
    }
  }

  // ENHANCEMENT: Update game objective in UI
  updateGameObjectiveUI(): void {
    const totalConditions = this.getVisibleConditions().length;
    const discoveredCount = this.discoveredConditions.size;
    
    // Update diagnostic UI with objective
    if (this.diagnosticUI) {
      this.diagnosticUI.updateButtonCount('objective', `${discoveredCount}/${totalConditions} found`);
      this.diagnosticUI.updatePhase(`Diagnose: ${discoveredCount}/${totalConditions}`);
    }
  }

  // ENHANCEMENT: Add directional guidance to next undiscovered marker
  showDirectionalGuidance(): void {
    const undiscoveredMarkers = Array.from(this.medicalMarkers.entries())
      .filter(([id]) => !this.discoveredConditions.has(id));
    
    if (undiscoveredMarkers.length > 0 && this.discoveredConditions.size < 3) {
      const [conditionId, medicalMarker] = undiscoveredMarkers[0];
      const position = medicalMarker.getMarkerGroup().position;
      
      // Create a subtle arrow pointing towards the closest undiscovered marker
      const direction = new THREE.Vector3();
      direction.subVectors(position, this.camera.position).normalize();
      
      // Create temporary guidance arrow
      const arrowHelper = new THREE.ArrowHelper(
        direction,
        this.camera.position.clone().add(new THREE.Vector3(0, 0.5, 0)), // slightly above camera
        3, // length
        0x00ffff,
        0.3, // head length
        0.15  // head width
      );
      
      this.scene.add(arrowHelper);
      
      // Remove arrow after 5 seconds
      setTimeout(() => {
        if (arrowHelper.parent) arrowHelper.parent.remove(arrowHelper);
      }, 5000);
      
      this.showTutorialHint('Move toward the arrow to find a condition!');
    }
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
    console.log('X-ray effect scale updated:', this.scale);
  }

  // CLEAN: Old Llama methods removed - now handled by DiagnosticUI

  // MODULAR: Clean resource management
  destroy() {
    window.removeEventListener("keydown", this.keyHandler)
    this.instructionsPanel?.destroy()
    this.diagnosticUI?.destroy()
    
    // Clean up scanning VFX
    this.scanRings.forEach(ring => {
      if (ring.parent) ring.parent.remove(ring);
    });
    this.scanRings.clear();
    
    this.progressRings.forEach(ring => {
      if (ring.parent) ring.parent.remove(ring);
    });
    this.progressRings.clear();
  }
}
