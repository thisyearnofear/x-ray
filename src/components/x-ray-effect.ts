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
import { AdvancedConditionDetection } from "./AdvancedConditionDetection"
import { MetaMaskSmartAccount } from './MetaMaskSmartAccount'
import { EnvioIndexer } from './EnvioIndexer'

// MYSTERY SYSTEM: Types for patient interaction and treatment
interface PatientState {
  name: string;
  age: number;
  symptoms: Symptom[];
  vitalSigns: VitalSigns;
  emotionalState: 'calm' | 'anxious' | 'agitated' | 'pain' | 'unconscious';
  trustLevel: number; // 0-100, affects information sharing
  revealedInfo: string[]; // What information has been shared
  treatmentHistory: Treatment[];
}

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  onsetTime: number;
  description: string;
  associatedConditions: string[];
  revealed: boolean;
  progressionRate: number; // How quickly it gets worse
}

interface VitalSigns {
  temperature: number;
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  respiratoryRate: number;
  oxygenSaturation: number;
}

interface ConversationEntry {
  timestamp: number;
  speaker: 'doctor' | 'patient' | 'nurse';
  message: string;
  triggersSymptom?: string; // If this conversation reveals a symptom
  affectsTrust?: number; // How it changes trust level
}

interface Treatment {
  id: string;
  name: string;
  type: 'medication' | 'procedure' | 'lifestyle' | 'monitoring';
  startTime: number;
  duration: number; // How long it takes to complete
  timeCost: number; // How much game time it consumes
  riskLevel: 'low' | 'medium' | 'high';
  potentialOutcomes: TreatmentOutcome[];
  active: boolean;
  completed: boolean;
}

interface TreatmentOutcome {
  condition: string; // What must be true for this outcome
  probability: number; // 0-1 chance
  result: 'success' | 'partial_success' | 'failure' | 'complication';
  effects: TreatmentEffect[];
  timeBonus?: number; // Extra time added to clock
}

interface TreatmentEffect {
  type: 'symptom_relief' | 'symptom_worsening' | 'new_symptom' | 'vital_change' | 'trust_change';
  target: string; // Symptom ID or vital sign
  magnitude: number; // How much it changes
  duration?: number; // How long the effect lasts
}

interface Complication {
  id: string;
  name: string;
  triggerTime: number;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  symptoms: string[]; // Symptoms this causes
  treatmentRequired: boolean;
}

interface SymptomProgression {
  symptomId: string;
  currentSeverity: number;
  maxSeverity: number;
  progressionRate: number;
  lastUpdate: number;
}

// ECONOMIC SYSTEM: Budget and earnings interfaces
interface TreatmentCost {
  baseCost: number;
  riskMultiplier: number; // Higher risk = higher cost
  premiumDiscount?: number; // Premium users get discounts
}

interface InsurancePayment {
  basePayment: number;
  complexityMultiplier: number; // Complex cases pay more
  accuracyBonus: number; // Perfect diagnosis = bonus
  efficiencyBonus: number; // Fast diagnosis = bonus
  treatmentBonus: number; // Successful treatments = bonus
}

interface CaseProfile {
  id: string;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  budget: number;
  potentialEarnings: InsurancePayment;
  timeLimit: number;
  unlockRequirements?: string[]; // Achievement IDs required
}

interface UserProgression {
  level: number;
  experience: number;
  diagnosticAccuracy: number;
  efficiencyRating: number;
  treatmentSuccessRate: number;
  unlockedCases: string[];
  totalEarnings: number;
  bestStreak: number;
}

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
  
  // ENHANCEMENT: Advanced condition detection system
  private advancedDetection: AdvancedConditionDetection;
  
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
  hasPressedCToggle: boolean = false; // Track if user has pressed C to toggle markers
  hasSubmittedDiagnosis: boolean = false; // Track if user has submitted a diagnosis

  // GAMIFICATION: Live progress tracking
  private discoveryStreak: number = 0;
  private lastDiscoveryTime: number = 0;
  private comboMultiplier: number = 1;
  private totalScore: number = 0;
  private scoreDisplay: HTMLElement | null = null;
  private streakBonusActive: boolean = false;
  private timePressureMultiplier: number = 1;

  // MYSTERY ELEMENTS: Patient interaction and treatment system
  private patientState!: PatientState;
  private conversationHistory: ConversationEntry[] = [];
  private activeTreatments: Treatment[] = [];
  private pendingComplications: Complication[] = [];
  private symptomProgression: SymptomProgression[] = [];

  // ECONOMIC SYSTEM: Hospital budget and earnings (in MON)
  private hospitalBudget: number = 0.5; // Starting budget (free mode) - 0.5 MON
  private caseEarnings: number = 0;
  private potentialBonus: number = 0;
  private budgetDisplay: HTMLElement | null = null;
  private earningsDisplay: HTMLElement | null = null;
  private currentCaseProfile!: CaseProfile;

  // HACKATHON: MetaMask Smart Accounts integration
  private smartAccount: MetaMaskSmartAccount;
  private envioIndexer: EnvioIndexer;
  
  constructor({ scene, composer, renderer, camera, audioManager, scanFeedbackSystem, mobileCamera, gameManager }: Props) {
    this.scene = scene
    this.composer = composer
    this.renderer = renderer
    this.camera = camera
    this.audioManager = audioManager;

    // Initialize gamification elements
    this.createScoreDisplay();
    this.createProgressIndicators();

    // Initialize mystery system
    this.initializePatientState();

    // Initialize economic system
    this.createEconomicDisplays();
    this.initializeCaseEconomics();

    // HACKATHON: Initialize MetaMask Smart Accounts
    this.smartAccount = new MetaMaskSmartAccount();
    this.envioIndexer = new EnvioIndexer(this.smartAccount);
    this.audioManagementSystem = new AudioManagementSystem(audioManager);
    this.scanFeedbackSystem = scanFeedbackSystem;
    this.mobileCamera = mobileCamera;
    this.visualFeedbackSystem = new VisualFeedbackSystem(this.scene);
    this.mouse = {
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
    }
    
    // ENHANCEMENT: Initialize advanced detection system
    this.advancedDetection = new AdvancedConditionDetection(this.scanFeedbackSystem);
    
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

  // INTEGRATION: Advanced progressive discovery through scanning
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
        
        // ENHANCEMENT FIRST: Use advanced detection system to calculate scan metrics
        const condition = MEDICAL_CONDITIONS.find(c => c.id === conditionId);
        if (!condition) return; // Skip if condition not found
        
        // Calculate scan metrics using advanced detection system
        const scanPath = [mousePos3D]; // In this simplified case, we just use current position
        const scanMetrics = this.advancedDetection.calculateScanMetrics(
          condition.position,
          { x: mousePos3D.x, y: mousePos3D.y, z: mousePos3D.z },
          scanPath
        );

        // Get current progress and compute new progress with advanced detection
        const currentProgress = this.scanProgress.get(conditionId) || 0
        const requiredTime = condition?.scanTimeRequired || 3

        // ENHANCEMENT: Instead of linear progress, use advanced detection to determine progress rate
        const baseIncrement = deltaTime;
        const qualityModifier = 
          (scanMetrics.positionAccuracy * 0.3) + 
          (scanMetrics.scanCoverage * 0.2) + 
          (scanMetrics.focusQuality * 0.3) + 
          (scanMetrics.timeEfficiency * 0.2);
        
        const progressIncrement = baseIncrement * (0.5 + qualityModifier * 0.5); // Range: 0.5 to 1.0
        const newProgress = Math.min(currentProgress + progressIncrement, requiredTime);
        
        this.scanProgress.set(conditionId, newProgress);

        // ENHANCEMENT: Update scan feedback system with scan data including clues
        const detectionResult = this.advancedDetection.detectCondition(condition, newProgress, scanMetrics);
        if (this.scanFeedbackSystem && this.scanFeedbackSystem.updateScanProgress) {
          this.scanFeedbackSystem.updateScanProgress(conditionId, newProgress / requiredTime, {
            clues: detectionResult.clues
          });
        }

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

        // ENHANCEMENT: Provide intelligent audio feedback based on advanced detection
        const progressRatio = newProgress / requiredTime;
        if (condition && progressRatio > 0.8 && progressRatio < 0.85) { // Almost discovered
          this.audioManager?.showFeedback(detectionResult.clues[0] || `Almost there! Keep scanning ${condition.name}!`, 'success');
        } else if (condition && progressRatio > 0.5 && progressRatio < 0.55) { // Halfway
          this.audioManager?.showFeedback(detectionResult.clues[0] || `Halfway to discovering ${condition.name}. Keep going!`, 'info');
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

        // ENHANCEMENT: Use advanced detection to determine when condition is discovered
        if (detectionResult.detected && !this.discoveredConditions.has(conditionId)) {
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

    // Update time pressure multiplier for gamification
    this.updateTimePressure();

    // MYSTERY ELEMENTS: Update symptom progression and patient state
    this.updateSymptomProgression();
    this.updatePatientEmotionalState();
    this.revealProgressiveInformation();
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
    this.hasPressedCToggle = true;
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

          // Show visual scan progress indicator
          this.showScanProgressIndicator(medicalMarker.getMarkerGroup().position, conditionId);

          // Play proximity sound when hovering near a condition
          this.audioManagementSystem.playSound(SoundTypeType.HOVER);

          // Provide clear audio hint about the condition if it hasn't been discovered yet
          if (!this.discoveredConditions.has(conditionId)) {
            const condition = MEDICAL_CONDITIONS.find(c => c.id === conditionId);
            if (condition && Date.now() - this.lastActivityTime > 3000) { // Reduced delay for better responsiveness
              // Show hint more consistently to guide users
              if (Math.random() > 0.3) { // 70% chance instead of 30%
                this.audioManager?.showFeedback(`🔍 Click to scan: ${condition.name}`, 'info');
              }
            }
          }
          break;
        }
      }
    } else {
      // Hide scan progress when not hovering
      this.hideScanProgressIndicator();
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

  // Scan progress indicator properties
  private scanProgressIndicator: THREE.Mesh | null = null;

  showScanProgressIndicator(position: THREE.Vector3, conditionId: string): void {
    if (this.scanProgressIndicator) {
      this.scene.remove(this.scanProgressIndicator);
    }

    // Create a glowing ring around the marker to show it's scannable
    const ringGeometry = new THREE.RingGeometry(0.12, 0.15, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    this.scanProgressIndicator = new THREE.Mesh(ringGeometry, ringMaterial);
    this.scanProgressIndicator.position.copy(position);
    this.scanProgressIndicator.rotation.x = -Math.PI / 2;

    // Add pulsing animation
    const pulseAnimation = gsap.to(this.scanProgressIndicator.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut"
    });

    this.scene.add(this.scanProgressIndicator);
  }

  hideScanProgressIndicator(): void {
    if (this.scanProgressIndicator) {
      gsap.killTweensOf(this.scanProgressIndicator.scale);
      this.scene.remove(this.scanProgressIndicator);
      this.scanProgressIndicator = null;
    }
  }

  createScoreDisplay(): void {
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.className = 'diagnostic-score-display';
    this.scoreDisplay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #00ff88, #0099ff);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-family: 'Arial', sans-serif;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: scorePulse 2s ease-in-out infinite;
    `;

    this.scoreDisplay.innerHTML = `
      <span style="font-size: 18px;">🏆</span>
      <span id="score-value">0</span>
      <span id="streak-info" style="font-size: 12px; opacity: 0.9;">Streak: 0</span>
    `;

    document.body.appendChild(this.scoreDisplay);
  }

  createProgressIndicators(): void {
    // Create progress circle for conditions discovered
    const progressRing = document.createElement('div');
    progressRing.className = 'progress-ring';
    progressRing.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: conic-gradient(#00ff88 0deg, #333 0deg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 14px;
      box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
      transition: all 0.3s ease;
    `;

    progressRing.innerHTML = '<div id="progress-text">0/16</div>';
    document.body.appendChild(progressRing);

    // Create achievement preview widget
    const achievementPreview = document.createElement('div');
    achievementPreview.className = 'achievement-preview';
    achievementPreview.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 15px;
      border-radius: 10px;
      font-family: 'Arial', sans-serif;
      font-size: 12px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      max-width: 200px;
      opacity: 0.8;
      transition: opacity 0.3s ease;
      cursor: pointer;
    `;

    achievementPreview.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">🎯 Next Achievement</div>
      <div id="next-achievement">🔥 Hot Streak: 5 in a row</div>
      <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">Click for Case Hub</div>
    `;

    achievementPreview.addEventListener('click', () => this.showCaseSelectionHub());
    document.body.appendChild(achievementPreview);

    // Create case hub access button (top center)
    const caseHubButton = document.createElement('div');
    caseHubButton.id = 'case-hub-button';
    caseHubButton.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
      cursor: pointer;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    `;

    caseHubButton.innerHTML = `
      <span style="font-size: 16px;">🏥</span>
      <span>Case Hub</span>
    `;

    caseHubButton.addEventListener('mouseenter', () => {
      caseHubButton.style.transform = 'translateX(-50%) translateY(-2px)';
      caseHubButton.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
    });

    caseHubButton.addEventListener('mouseleave', () => {
      caseHubButton.style.transform = 'translateX(-50%) translateY(0)';
      caseHubButton.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)';
    });

    caseHubButton.addEventListener('click', () => this.showCaseSelectionHub());
    document.body.appendChild(caseHubButton);

    // HACKATHON: Add AI delegation setup button
    const aiDelegateButton = document.createElement('div');
    aiDelegateButton.id = 'ai-delegation-button';
    aiDelegateButton.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-family: 'Arial', sans-serif;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      cursor: pointer;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0.8;
      transition: all 0.3s ease;
    `;

    aiDelegateButton.innerHTML = `
      <span style="font-size: 14px;">🤖</span>
      <span>AI Delegate</span>
    `;

    aiDelegateButton.addEventListener('mouseenter', () => {
      aiDelegateButton.style.opacity = '1';
      aiDelegateButton.style.transform = 'translateY(-2px)';
    });

    aiDelegateButton.addEventListener('mouseleave', () => {
      aiDelegateButton.style.opacity = '0.8';
      aiDelegateButton.style.transform = 'translateY(0)';
    });

    aiDelegateButton.addEventListener('click', () => this.setupAIDelegation());
    document.body.appendChild(aiDelegateButton);

    // Add CSS animation for score display
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scorePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .progress-ring {
        animation: progressGlow 3s ease-in-out infinite;
      }
      @keyframes progressGlow {
        0%, 100% { box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3); }
        50% { box-shadow: 0 4px 25px rgba(0, 255, 136, 0.6); }
      }
      .achievement-preview:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  updateScoreDisplay(): void {
    if (!this.scoreDisplay) return;

    const scoreElement = this.scoreDisplay.querySelector('#score-value');
    const streakElement = this.scoreDisplay.querySelector('#streak-info');

    if (scoreElement) scoreElement.textContent = this.totalScore.toString();
    if (streakElement) {
      let streakText = `Streak: ${this.discoveryStreak}`;
      if (this.timePressureMultiplier > 1) {
        streakText += ` ⏰${this.timePressureMultiplier.toFixed(1)}x`;
      }
      streakElement.textContent = streakText;
    }

    // Animate score increase
    this.scoreDisplay.style.animation = 'none';
    setTimeout(() => {
      if (this.scoreDisplay) {
        this.scoreDisplay.style.animation = 'scorePulse 2s ease-in-out infinite';
      }
    }, 10);
  }

  updateOverallProgressRing(): void {
    const progressText = document.getElementById('progress-text');
    if (progressText) {
      const discovered = this.discoveredConditions.size;
      const total = this.getVisibleConditions().length;
      progressText.textContent = `${discovered}/${total}`;

      // Update progress ring color based on completion
      const progressRing = progressText.parentElement as HTMLElement;
      if (progressRing) {
        const percentage = (discovered / total) * 360;
        progressRing.style.background = `conic-gradient(#00ff88 ${percentage}deg, #333 ${percentage}deg)`;
      }
    }

    // Update achievement preview
    this.updateAchievementPreview();
  }

  updateAchievementPreview(): void {
    const nextAchievementElement = document.getElementById('next-achievement');
    if (!nextAchievementElement) return;

    const streak = this.discoveryStreak;
    const score = this.totalScore;

    if (streak < 5) {
      nextAchievementElement.textContent = `🔥 Hot Streak: ${streak}/5 in a row`;
    } else if (streak < 10) {
      nextAchievementElement.textContent = `🌟 Unstoppable: ${streak}/10 in a row`;
    } else if (this.comboMultiplier < 3.0) {
      nextAchievementElement.textContent = `💫 Combo Master: ${this.comboMultiplier.toFixed(1)}/3.0x`;
    } else if (score < 1000) {
      nextAchievementElement.textContent = `🏆 Point Collector: ${score}/1000 points`;
    } else {
      nextAchievementElement.textContent = `🎖️ Master Diagnostician`;
    }
  }

  private discoverCondition(conditionId: string) {
    console.log('Discovering condition:', conditionId)

    // GAMIFICATION: Calculate scoring and streaks
    const now = Date.now();
    const timeSinceLastDiscovery = now - this.lastDiscoveryTime;

    // Combo system: discoveries within 10 seconds maintain streak
    if (timeSinceLastDiscovery < 10000) {
      this.discoveryStreak++;
      this.comboMultiplier = Math.min(this.comboMultiplier + 0.5, 5.0); // Max 5x multiplier
    } else {
      this.discoveryStreak = 1;
      this.comboMultiplier = 1;
    }

    this.lastDiscoveryTime = now;

    // Calculate score with multiple multipliers
    const baseScore = 100;
    const streakBonus = this.discoveryStreak * 10;
    const comboScore = Math.floor(baseScore * this.comboMultiplier);

    // Time pressure bonus: faster discoveries get more points
    const timeBonus = timeSinceLastDiscovery < 2000 ? 50 : 0; // Bonus for discoveries under 2 seconds

    // Total points calculation
    const totalPoints = (comboScore + streakBonus + timeBonus) * this.timePressureMultiplier;

    this.totalScore += Math.floor(totalPoints);

    // Mark as discovered
    this.discoveredConditions.add(conditionId);

    // Update marker appearance for discovered condition
    const medicalMarker = this.medicalMarkers.get(conditionId);
    if (medicalMarker) {
      medicalMarker.markAsDiscovered();

      // Ensure discovered marker is always visible
      const markerGroup = medicalMarker.getMarkerGroup();
      markerGroup.visible = true;

      // Get condition details for both audio and visual feedback
      const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId);
      if (condition) {
        // Play discovery sound based on severity through audio management system
        this.audioManagementSystem.playDiscoverySound(condition.severity);

        // Create visual feedback as audio alternative
        this.visualFeedbackSystem.createConditionDiscoveryFeedback(
          medicalMarker.getMarkerGroup().position,
          condition.severity,
          condition.name
        );

        // ENHANCEMENT: Add to Investigation Panel evidence
        const uiManager = this.diagnosticUI.getUIManager();
        if (uiManager && uiManager.addDiscoveredCondition) {
          uiManager.addDiscoveredCondition(conditionId);

          // Add evidence to Investigation Panel
          const investigationPanel = uiManager.getInvestigationPanel();
          if (investigationPanel) {
            investigationPanel.addEvidence({
              id: `evidence_scanning_${conditionId}_${Date.now()}`,
              source: 'scanning',
              content: `${condition.name} detected`,
              abnormal: condition.severity !== 'low',
              timestamp: Date.now(),
              relatedCondition: conditionId
            });
          }
        }

        // GAMIFICATION: Show celebration message with points and bonuses
        let celebrationMessage = `🎉 ${condition.name} discovered! +${Math.floor(totalPoints)} points!`;

        // Add to evidence board
        this.addDiscoveryToEvidenceBoard(condition);
      }

      // ENHANCEMENT: Report discovery to scan feedback system for effects
      if (this.scanFeedbackSystem && this.scanFeedbackSystem.updateMarker) {
        this.scanFeedbackSystem.updateMarker(conditionId, true);
      }

      // Remove scanning VFX for this condition
      this.removeScanningVFX(conditionId);
      this.activeScans.delete(conditionId);

      // Show celebration message (outside condition check since we want this even if condition details aren't found)
      const discoveredCondition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === conditionId);
      const conditionName = discoveredCondition ? discoveredCondition.name : 'Medical Condition';
      let celebrationMessage = `🎉 ${conditionName} discovered! +${Math.floor(totalPoints)} points!`;

      if (timeBonus > 0) {
        celebrationMessage += ` ⚡ Speed bonus!`;
      }
      if (this.discoveryStreak > 1) {
        celebrationMessage += ` 🔥 ${this.discoveryStreak}x streak!`;
      }
      if (this.comboMultiplier > 1) {
        celebrationMessage += ` 💫 ${this.comboMultiplier.toFixed(1)}x combo!`;
      }
      if (this.timePressureMultiplier > 1) {
        celebrationMessage += ` ⏰ Time pressure bonus!`;
      }

      this.audioManager?.showFeedback(celebrationMessage, 'success');
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

    // Update UI elements
    this.updateScoreDisplay();
    this.updateOverallProgressRing();

    // Trigger achievement checks
    this.checkForAchievements();
  }

  checkForAchievements(): void {
    // Check for discovery streak achievements
    if (this.discoveryStreak >= 5) {
      this.showAchievementNotification('🔥 Hot Streak!', '5 discoveries in a row!', 'streak_5');
    }
    if (this.discoveryStreak >= 10) {
      this.showAchievementNotification('🌟 Unstoppable!', '10 discoveries in a row!', 'streak_10');
    }

    // Check for combo multiplier achievements
    if (this.comboMultiplier >= 3.0) {
      this.showAchievementNotification('💫 Combo Master!', `${this.comboMultiplier.toFixed(1)}x multiplier!`, 'combo_master');
    }

    // Check for total score achievements
    if (this.totalScore >= 1000) {
      this.showAchievementNotification('🏆 Point Collector!', '1000+ points earned!', 'points_1000');
    }
  }

  showAchievementNotification(title: string, description: string, achievementId: string): void {
    // Create achievement popup
    const achievementPopup = document.createElement('div');
    achievementPopup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #ff6b6b, #ffa500);
      color: white;
      padding: 20px 30px;
      border-radius: 15px;
      font-family: 'Arial', sans-serif;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 8px 32px rgba(255, 107, 107, 0.4);
      z-index: 2000;
      animation: achievementPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;

    achievementPopup.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">🎊</div>
      <div style="margin-bottom: 5px;">${title}</div>
      <div style="font-size: 14px; opacity: 0.9;">${description}</div>
    `;

    document.body.appendChild(achievementPopup);

    // Add achievement animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes achievementPop {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Remove after 3 seconds
    setTimeout(() => {
      if (achievementPopup.parentNode) {
        achievementPopup.parentNode.removeChild(achievementPopup);
      }
    }, 3000);
  }

  // ECONOMIC SYSTEM: Create budget and earnings displays
  createEconomicDisplays(): void {
    // Budget display (bottom left)
    this.budgetDisplay = document.createElement('div');
    this.budgetDisplay.className = 'economic-display budget-display';
    this.budgetDisplay.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: linear-gradient(135deg, #2c3e50, #34495e);
      color: white;
      padding: 12px 16px;
      border-radius: 20px;
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    this.budgetDisplay.innerHTML = `
      <span style="font-size: 16px;">🏥</span>
      <span>Budget: <span id="budget-amount">${this.hospitalBudget}</span> MON</span>
    `;

    document.body.appendChild(this.budgetDisplay);

    // Earnings display (bottom right, above progress ring)
    this.earningsDisplay = document.createElement('div');
    this.earningsDisplay.className = 'economic-display earnings-display';
    this.earningsDisplay.style.cssText = `
      position: fixed;
      bottom: 120px;
      right: 20px;
      background: linear-gradient(135deg, #27ae60, #2ecc71);
      color: white;
      padding: 12px 16px;
      border-radius: 20px;
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0.9;
    `;

    this.earningsDisplay.innerHTML = `
      <span style="font-size: 16px;">💰</span>
      <span>Earnings: <span id="earnings-amount">${this.caseEarnings}</span> MON</span>
      <span style="font-size: 12px; opacity: 0.8;">(Potential: <span id="potential-bonus">${this.potentialBonus}</span> MON)</span>
    `;

    document.body.appendChild(this.earningsDisplay);
  }

  updateEconomicDisplays(): void {
    if (this.budgetDisplay) {
      const budgetAmount = this.budgetDisplay.querySelector('#budget-amount');
      if (budgetAmount) budgetAmount.textContent = this.hospitalBudget.toString();

      // Color coding for budget (in MON)
      if (this.hospitalBudget < 0.1) {
        this.budgetDisplay.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
      } else if (this.hospitalBudget < 0.5) {
        this.budgetDisplay.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
      } else {
        this.budgetDisplay.style.background = 'linear-gradient(135deg, #2c3e50, #34495e)';
      }
    }

    if (this.earningsDisplay) {
      const earningsAmount = this.earningsDisplay.querySelector('#earnings-amount');
      const potentialBonus = this.earningsDisplay.querySelector('#potential-bonus');

      if (earningsAmount) earningsAmount.textContent = this.caseEarnings.toString();
      if (potentialBonus) potentialBonus.textContent = this.potentialBonus.toString();
    }
  }

  // ECONOMIC SYSTEM: Initialize case economics
  initializeCaseEconomics(): void {
    // Set up initial case parameters based on difficulty/user status
    this.currentCaseProfile = {
      id: 'free_case_1',
      name: 'Basic Emergency Case',
      difficulty: 'beginner',
      budget: 0.5, // Free mode budget - 0.5 MON
      potentialEarnings: {
        basePayment: 1.0,
        complexityMultiplier: 1.0,
        accuracyBonus: 0.2,
        efficiencyBonus: 0.15,
        treatmentBonus: 0.1
      },
      timeLimit: 300 // 5 minutes
    };

    this.hospitalBudget = this.currentCaseProfile.budget;
    this.calculatePotentialEarnings();
    this.updateEconomicDisplays();
  }

  calculatePotentialEarnings(): void {
    const profile = this.currentCaseProfile;
    const base = profile.potentialEarnings.basePayment * profile.potentialEarnings.complexityMultiplier;
    const maxBonus = profile.potentialEarnings.accuracyBonus +
                    profile.potentialEarnings.efficiencyBonus +
                    profile.potentialEarnings.treatmentBonus;

    this.potentialBonus = base + maxBonus;
  }

  // ECONOMIC SYSTEM: Spend budget on treatments
  spendBudget(amount: number, description: string): boolean {
    if (this.hospitalBudget >= amount) {
      this.hospitalBudget -= amount;
      this.updateEconomicDisplays();

      this.audioManager?.showFeedback(`💸 Spent ${amount} MON on ${description}`, 'warning');
      return true;
    } else {
      this.audioManager?.showFeedback('❌ Insufficient budget for this treatment!', 'error');
      return false;
    }
  }

  // TIMER SYSTEM: Pause mechanics for consultations
  private timerPaused: boolean = false;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;

  pauseTimer(reason: string): boolean {
    if (this.timerPaused) return false;

    this.timerPaused = true;
    this.pauseStartTime = Date.now();

    // Small budget cost for pausing (consultation fee)
    const pauseCost = 0.025;
    if (this.spendBudget(pauseCost, `consultation (${reason})`)) {
      this.audioManager?.showFeedback(`⏸️ Timer paused for consultation. Cost: ${pauseCost} MON`, 'info');

      // Visual indicator
      this.showPauseIndicator(reason);
      return true;
    } else {
      this.timerPaused = false;
      return false;
    }
  }

  resumeTimer(): void {
    if (!this.timerPaused) return;

    const pauseDuration = Date.now() - this.pauseStartTime;
    this.totalPausedTime += pauseDuration;
    this.timerPaused = false;

    this.hidePauseIndicator();
    this.audioManager?.showFeedback('▶️ Timer resumed', 'info');
  }

  isTimerPaused(): boolean {
    return this.timerPaused;
  }

  showPauseIndicator(reason: string): void {
    const indicator = document.createElement('div');
    indicator.id = 'timer-pause-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #9b59b6, #8e44ad);
      color: white;
      padding: 20px 30px;
      border-radius: 15px;
      font-family: 'Arial', sans-serif;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 2500;
      animation: pausePulse 2s ease-in-out infinite;
    `;

    indicator.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">⏸️</div>
      <div>Consultation in Progress</div>
      <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${reason}</div>
    `;

    document.body.appendChild(indicator);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes pausePulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.05); }
      }
    `;
    document.head.appendChild(style);
  }

  hidePauseIndicator(): void {
    const indicator = document.getElementById('timer-pause-indicator');
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }

  // ECONOMIC SYSTEM: Earn from case completion (via MetaMask Smart Accounts)
  async processCaseEarnings(diagnosticAccuracy: number, timeEfficiency: number, treatmentSuccess: number): Promise<void> {
    const profile = this.currentCaseProfile;
    let earnings = profile.potentialEarnings.basePayment * profile.potentialEarnings.complexityMultiplier;

    // Accuracy bonus (0-100% of max bonus)
    earnings += profile.potentialEarnings.accuracyBonus * (diagnosticAccuracy / 100);

    // Efficiency bonus (based on time remaining)
    earnings += profile.potentialEarnings.efficiencyBonus * timeEfficiency;

    // Treatment bonus
    earnings += profile.potentialEarnings.treatmentBonus * treatmentSuccess;

    this.caseEarnings = Math.round(earnings * 1000) / 1000; // Round to 3 decimal places

    // HACKATHON: Process payment via MetaMask Smart Accounts on Monad testnet
    try {
      const paymentSuccess = await this.smartAccount.processCasePayment(
        profile.id,
        this.caseEarnings,
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' // Mock user address
      );

      if (paymentSuccess) {
        // Animate earnings
        this.animateEarnings(this.caseEarnings);

        // HACKATHON: Index case data to Envio
        await this.envioIndexer.indexMedicalCase(
          profile.id,
          this.patientState.name,
          {
            conditions: [], // Would be filled with actual diagnosis
            confidence: 0.85,
            accuracy: 0.87,
            timeTaken: 300, // Would be calculated from actual time
            method: 'manual'
          },
          this.activeTreatments.map(t => ({
            id: t.id,
            name: t.name,
            type: t.type,
            cost: t.timeCost * 0.01,
            outcome: 'success', // Would be based on actual outcome
            administeredBy: 'doctor',
            timestamp: t.startTime
          })),
          this.pendingComplications.map(c => ({
            id: c.id,
            description: c.description,
            severity: c.severity,
            causedBy: 'treatment',
            timestamp: c.triggerTime
          })),
          {
            budget: profile.budget,
            earnings: this.caseEarnings,
            treatmentsCost: this.activeTreatments.reduce((sum, t) => sum + (t.timeCost * 0.01), 0),
            efficiencyBonus: profile.potentialEarnings.efficiencyBonus,
            accuracyBonus: profile.potentialEarnings.accuracyBonus,
            netResult: this.caseEarnings - (profile.budget - this.hospitalBudget)
          }
        );

        this.audioManager?.showFeedback(`💰 Case completed! Earned ${this.caseEarnings} MON via Smart Account!`, 'success');
      } else {
        this.audioManager?.showFeedback('⚠️ Case completed but payment processing failed', 'warning');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      this.audioManager?.showFeedback('❌ Payment error - case completed without earnings', 'error');
    }
  }

  animateEarnings(amount: number): void {
    // Create floating earnings animation
    const earningsFloat = document.createElement('div');
    earningsFloat.style.cssText = `
      position: fixed;
      bottom: 150px;
      right: 20px;
      background: linear-gradient(135deg, #27ae60, #2ecc71);
      color: white;
      padding: 15px 25px;
      border-radius: 25px;
      font-family: 'Arial', sans-serif;
      font-size: 18px;
      font-weight: bold;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      z-index: 2000;
      animation: earningsFloat 3s ease-out forwards;
    `;

    earningsFloat.innerHTML = `💰 +${amount} MON!`;

    document.body.appendChild(earningsFloat);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes earningsFloat {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        50% { transform: translateY(-50px) scale(1.1); opacity: 1; }
        100% { transform: translateY(-100px) scale(0.9); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      if (earningsFloat.parentNode) {
        earningsFloat.parentNode.removeChild(earningsFloat);
      }
    }, 3000);
  }

  // EVIDENCE SYSTEM: Add discovery to investigation panel
  private addDiscoveryToEvidenceBoard(condition: any): void {
    const uiManager = this.diagnosticUI.getUIManager();
    const investigationPanel = uiManager?.getInvestigationPanel();
    if (investigationPanel && investigationPanel.addEvidence) {
      investigationPanel.addEvidence({
        id: `scanning_discovery_${condition.id}_${Date.now()}`,
        source: 'scanning',
        content: `${condition.name} detected via 3D body scanning`,
        abnormal: condition.severity !== 'low',
        timestamp: Date.now(),
        relatedCondition: condition.id
      });
    }
  }

  // MYSTERY SYSTEM: Initialize patient state for dynamic interactions
  initializePatientState(): void {
    this.patientState = {
      name: 'Marcus Johnson',
      age: 34,
      symptoms: [
        {
          id: 'jaw_pain',
          name: 'Jaw Pain',
          severity: 'moderate',
          onsetTime: Date.now(),
          description: 'Chronic pain in left temporomandibular joint',
          associatedConditions: ['temporomandibular_disorder'],
          revealed: false,
          progressionRate: 0.1
        },
        {
          id: 'clicking',
          name: 'Audible Clicking',
          severity: 'mild',
          onsetTime: Date.now(),
          description: 'Clicking sound when opening mouth',
          associatedConditions: ['temporomandibular_disorder'],
          revealed: false,
          progressionRate: 0.05
        }
      ],
      vitalSigns: {
        temperature: 98.6,
        heartRate: 72,
        bloodPressure: { systolic: 120, diastolic: 80 },
        respiratoryRate: 16,
        oxygenSaturation: 98
      },
      emotionalState: 'anxious',
      trustLevel: 50,
      revealedInfo: [],
      treatmentHistory: []
    };

    // Initialize symptom progression tracking
    this.patientState.symptoms.forEach(symptom => {
      this.symptomProgression.push({
        symptomId: symptom.id,
        currentSeverity: this.getSeverityValue(symptom.severity),
        maxSeverity: 4, // critical = 4
        progressionRate: symptom.progressionRate,
        lastUpdate: Date.now()
      });
    });
  }

  getSeverityValue(severity: string): number {
    const severityMap = { mild: 1, moderate: 2, severe: 3, critical: 4 };
    return severityMap[severity as keyof typeof severityMap] || 1;
  }

  // MYSTERY SYSTEM: Patient conversation system
  initiatePatientConversation(): void {
    const conversationOptions = [
      {
        prompt: "How are you feeling today?",
        response: "I'm having this terrible pain in my jaw when I chew. It's been going on for weeks.",
        revealsSymptom: 'jaw_pain',
        trustChange: 5
      },
      {
        prompt: "Can you describe your symptoms?",
        response: "Well, my jaw hurts, and I hear this clicking sound when I open my mouth wide.",
        revealsSymptom: 'clicking',
        trustChange: 8
      },
      {
        prompt: "When did this start?",
        response: "About 3 weeks ago. It started mild but has been getting worse.",
        trustChange: 3
      }
    ];

    // Show conversation UI
    this.showConversationDialog(conversationOptions);
  }

  showConversationDialog(options: any[]): void {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 25px;
      border-radius: 15px;
      max-width: 400px;
      z-index: 3000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    dialog.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #fff;">💬 Patient Conversation</h3>
      <p style="margin: 0 0 20px 0; font-size: 14px;">Choose what to ask ${this.patientState.name}:</p>
      ${options.map((option, index) => `
        <button class="conversation-option" data-index="${index}"
          style="display: block; width: 100%; margin: 5px 0; padding: 10px;
                 background: rgba(255,255,255,0.1); border: none; border-radius: 8px;
                 color: white; cursor: pointer; text-align: left;">
          "${option.prompt}"
        </button>
      `).join('')}
      <button id="close-conversation" style="margin-top: 15px; padding: 8px 16px;
              background: rgba(255,255,255,0.2); border: none; border-radius: 8px;
              color: white; cursor: pointer;">Close</button>
    `;

    document.body.appendChild(dialog);

    // Add event listeners
    options.forEach((option, index) => {
      const button = dialog.querySelector(`[data-index="${index}"]`) as HTMLButtonElement;
      button.addEventListener('click', () => {
        this.processConversationChoice(option);
        dialog.remove();
      });
    });

    const closeBtn = dialog.querySelector('#close-conversation') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => dialog.remove());
  }

  processConversationChoice(choice: any): void {
    // Add to conversation history
    this.conversationHistory.push({
      timestamp: Date.now(),
      speaker: 'doctor',
      message: choice.prompt,
      affectsTrust: choice.trustChange
    });

    this.conversationHistory.push({
      timestamp: Date.now(),
      speaker: 'patient',
      message: choice.response,
      triggersSymptom: choice.revealsSymptom,
      affectsTrust: choice.trustChange
    });

    // Update trust level
    if (choice.trustChange) {
      this.patientState.trustLevel = Math.max(0, Math.min(100, this.patientState.trustLevel + choice.trustChange));
    }

    // Reveal symptom if triggered
    if (choice.revealsSymptom) {
      const symptom = this.patientState.symptoms.find(s => s.id === choice.revealsSymptom);
      if (symptom && !symptom.revealed) {
        symptom.revealed = true;
        this.audioManager?.showFeedback(`🗣️ Patient reveals: ${symptom.description}`, 'info');

        // Add to investigation panel as evidence
        const uiManager = this.diagnosticUI.getUIManager();
        const investigationPanel = uiManager?.getInvestigationPanel();
        if (investigationPanel && investigationPanel.addEvidence) {
          investigationPanel.addEvidence({
            id: `conversation_${symptom.id}_${Date.now()}`,
            source: 'interview',
            content: `Patient reports: ${symptom.description}`,
            abnormal: symptom.severity !== 'mild',
            timestamp: Date.now()
          });
        }
      }
    }

    // Show patient response
    this.showPatientResponse(choice.response);
  }

  showPatientResponse(response: string): void {
    const responseToast = document.createElement('div');
    responseToast.style.cssText = `
      position: fixed;
      bottom: 200px;
      right: 20px;
      background: linear-gradient(135deg, #4facfe, #00f2fe);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      max-width: 300px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 2500;
      animation: slideInRight 0.5s ease-out;
    `;

    responseToast.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">${this.patientState.name}:</div>
      <div style="font-size: 14px;">"${response}"</div>
    `;

    document.body.appendChild(responseToast);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      if (responseToast.parentNode) {
        responseToast.parentNode.removeChild(responseToast);
      }
    }, 4000);
  }

  // MYSTERY SYSTEM: Treatment decision system
  showTreatmentOptions(): void {
    const availableTreatments = [
      {
        id: 'ibuprofen',
        name: 'Ibuprofen 600mg',
        type: 'medication' as const,
        description: 'NSAID for pain and inflammation reduction',
        timeCost: 5, // 5 seconds
        riskLevel: 'low' as const,
        outcomes: [
          {
            condition: 'has_inflammation',
            probability: 0.8,
            result: 'partial_success',
            effects: [
              { type: 'symptom_relief', target: 'jaw_pain', magnitude: -1, duration: 180 }
            ],
            timeBonus: 10
          },
          {
            condition: 'true',
            probability: 0.2,
            result: 'complication',
            effects: [
              { type: 'new_symptom', target: 'stomach_pain', magnitude: 2, duration: 120 }
            ]
          }
        ]
      },
      {
        id: 'muscle_relaxant',
        name: 'Muscle Relaxant',
        type: 'medication' as const,
        description: 'Reduces jaw muscle tension',
        timeCost: 8,
        riskLevel: 'medium' as const,
        outcomes: [
          {
            condition: 'has_muscle_tension',
            probability: 0.7,
            result: 'success',
            effects: [
              { type: 'symptom_relief', target: 'clicking', magnitude: -2, duration: 300 }
            ],
            timeBonus: 15
          }
        ]
      },
      {
        id: 'physical_therapy',
        name: 'Jaw Exercises',
        type: 'procedure' as const,
        description: 'Teach patient jaw relaxation exercises',
        timeCost: 15,
        riskLevel: 'low' as const,
        outcomes: [
          {
            condition: 'true',
            probability: 0.9,
            result: 'partial_success',
            effects: [
              { type: 'trust_change', target: 'trust', magnitude: 10 }
            ],
            timeBonus: 20
          }
        ]
      }
    ];

    this.displayTreatmentDialog(availableTreatments);
  }

  displayTreatmentDialog(treatments: any[]): void {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #ff9a9e, #fecfef);
      color: white;
      padding: 25px;
      border-radius: 15px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 3000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    dialog.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #fff;">💊 Treatment Options</h3>
      <p style="margin: 0 0 20px 0; font-size: 14px;">Choose a treatment for ${this.patientState.name}. Each treatment costs time but may provide benefits.</p>
      ${treatments.map((treatment, index) => `
        <div style="margin: 10px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 5px;">${treatment.name}</div>
          <div style="font-size: 12px; margin-bottom: 8px; opacity: 0.9;">${treatment.description}</div>
          <div style="font-size: 11px; margin-bottom: 10px;">
          ⏰ Time cost: ${treatment.timeCost}s |
          💰 Cost: ${(treatment.timeCost * 0.01 * (treatment.riskLevel === 'low' ? 1.0 : treatment.riskLevel === 'medium' ? 1.5 : 2.0)).toFixed(3)} MON |
          ⚠️ Risk: ${treatment.riskLevel.toUpperCase()}
          </div>
          <button class="treatment-btn" data-index="${index}"
            style="padding: 8px 16px; background: #4CAF50; border: none; border-radius: 6px;
                   color: white; cursor: pointer; font-size: 12px;">
            Administer Treatment
          </button>
        </div>
      `).join('')}
      <button id="close-treatments" style="margin-top: 15px; padding: 10px 20px;
              background: rgba(255,255,255,0.2); border: none; border-radius: 8px;
              color: white; cursor: pointer;">Close</button>
    `;

    document.body.appendChild(dialog);

    // Add event listeners
    treatments.forEach((treatment, index) => {
      const button = dialog.querySelector(`[data-index="${index}"]`) as HTMLButtonElement;
      button.addEventListener('click', () => {
        this.administerTreatment(treatment);
        dialog.remove();
      });
    });

    const closeBtn = dialog.querySelector('#close-treatments') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => dialog.remove());
  }

  administerTreatment(treatment: any): void {
    // HACKATHON: Check if AI delegation is available for autonomous treatment
    const activeDelegations = this.smartAccount.getActiveDelegations();
    const treatmentDelegation = activeDelegations.find(d => d.type === 'treatment_execution' && d.active);

    let treatmentCost = 0;

    if (treatmentDelegation) {
      // AI agent can execute autonomously
      const riskMultipliers = { low: 1.0, medium: 1.5, high: 2.0 };
      const baseCost = treatment.timeCost * 0.01; // 0.01 MON per second of time cost
      treatmentCost = Math.round((baseCost * riskMultipliers[treatment.riskLevel as keyof typeof riskMultipliers]) * 1000) / 1000;

      // Check delegation budget
      if (treatmentDelegation.budgetLimit < treatmentCost) {
        this.audioManager?.showFeedback('❌ AI delegation budget insufficient for this treatment', 'error');
        return;
      }

      // Execute via AI delegation (no time cost to player)
      this.smartAccount.executeDelegatedTreatment(treatment.id, this.patientState.name, treatmentCost);
      this.audioManager?.showFeedback(`🤖 AI Agent administered ${treatment.name} (${treatmentCost} MON)`, 'info');

    } else {
      // Manual treatment execution
      const riskMultipliers = { low: 1.0, medium: 1.5, high: 2.0 };
      const baseCost = treatment.timeCost * 0.01; // 0.01 MON per second of time cost
      treatmentCost = Math.round((baseCost * riskMultipliers[treatment.riskLevel as keyof typeof riskMultipliers]) * 1000) / 1000;

      // Check budget first
      if (!this.spendBudget(treatmentCost, treatment.name)) {
        return; // Budget check failed
      }
    }

    // Check if player has enough time
    if (!this.gameManager) return;

    const gameState = this.gameManager.getGameState();
    if (!gameState || gameState.timeRemaining < treatment.timeCost) {
      // Refund budget if time check fails
      this.hospitalBudget += treatmentCost;
      this.updateEconomicDisplays();
      this.audioManager?.showFeedback('❌ Not enough time remaining for this treatment!', 'warning');
      return;
    }

    // Consume time
    this.gameManager.adjustTime(-treatment.timeCost);

    // Start treatment
    const newTreatment: Treatment = {
      id: treatment.id,
      name: treatment.name,
      type: treatment.type,
      startTime: Date.now(),
      duration: treatment.timeCost * 1000, // Convert to milliseconds
      timeCost: treatment.timeCost,
      riskLevel: treatment.riskLevel,
      potentialOutcomes: treatment.outcomes,
      active: true,
      completed: false
    };

    this.activeTreatments.push(newTreatment);

    this.audioManager?.showFeedback(`💊 Starting ${treatment.name}... (${treatment.timeCost}s)`, 'info');

    // Schedule treatment completion
    setTimeout(() => {
      this.completeTreatment(newTreatment);
    }, newTreatment.duration);
  }

  completeTreatment(treatment: Treatment): void {
    treatment.active = false;
    treatment.completed = true;
    this.patientState.treatmentHistory.push(treatment);

    // Determine outcome based on probabilities
    const outcome = this.determineTreatmentOutcome(treatment);
    this.applyTreatmentOutcome(outcome, treatment);

    // Show result
    const resultMessage = this.getOutcomeMessage(outcome, treatment);
    this.audioManager?.showFeedback(resultMessage, outcome.result === 'success' ? 'success' : outcome.result === 'complication' ? 'error' : 'warning');
  }

  determineTreatmentOutcome(treatment: Treatment): TreatmentOutcome {
    // Simple probability-based outcome selection
    const rand = Math.random();
    let cumulativeProb = 0;

    for (const outcome of treatment.potentialOutcomes) {
      cumulativeProb += outcome.probability;
      if (rand <= cumulativeProb) {
        return outcome;
      }
    }

    // Fallback to first outcome
    return treatment.potentialOutcomes[0];
  }

  applyTreatmentOutcome(outcome: TreatmentOutcome, treatment: Treatment): void {
    outcome.effects.forEach(effect => {
      switch (effect.type) {
        case 'symptom_relief':
          this.modifySymptomSeverity(effect.target, effect.magnitude);
          break;
        case 'new_symptom':
          this.addNewSymptom(effect.target, effect.magnitude);
          break;
        case 'vital_change':
          this.modifyVitalSign(effect.target, effect.magnitude);
          break;
        case 'trust_change':
          this.patientState.trustLevel = Math.max(0, Math.min(100, this.patientState.trustLevel + effect.magnitude));
          break;
      }
    });

    // Apply time bonus if successful
    if (outcome.timeBonus && (outcome.result === 'success' || outcome.result === 'partial_success')) {
      if (this.gameManager) {
        this.gameManager.adjustTime(outcome.timeBonus);
        this.audioManager?.showFeedback(`⏰ +${outcome.timeBonus} seconds bonus time!`, 'success');
      }
    }
  }

  modifySymptomSeverity(symptomId: string, change: number): void {
    const symptom = this.patientState.symptoms.find(s => s.id === symptomId);
    if (symptom) {
      const severityValues = ['mild', 'moderate', 'severe', 'critical'];
      const currentIndex = severityValues.indexOf(symptom.severity);
      const newIndex = Math.max(0, Math.min(3, currentIndex + change));
      symptom.severity = severityValues[newIndex] as any;

      this.audioManager?.showFeedback(`${symptom.name} ${change < 0 ? 'improved' : 'worsened'} to ${symptom.severity}`, 'info');
    }
  }

  addNewSymptom(symptomId: string, severity: number): void {
    // Add a new symptom as a complication
    const newSymptom: Symptom = {
      id: symptomId,
      name: symptomId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      severity: severity >= 3 ? 'severe' : severity >= 2 ? 'moderate' : 'mild',
      onsetTime: Date.now(),
      description: `New symptom: ${symptomId}`,
      associatedConditions: [],
      revealed: true, // Complications are immediately visible
      progressionRate: 0.1
    };

    this.patientState.symptoms.push(newSymptom);

    this.audioManager?.showFeedback(`⚠️ New symptom emerged: ${newSymptom.name}`, 'warning');

    // Add to investigation panel
    const uiManager = this.diagnosticUI.getUIManager();
    const investigationPanel = uiManager?.getInvestigationPanel();
    if (investigationPanel && investigationPanel.addEvidence) {
      investigationPanel.addEvidence({
        id: `complication_${symptomId}_${Date.now()}`,
        source: 'physical',
        content: `Treatment complication: ${newSymptom.description}`,
        abnormal: true,
        timestamp: Date.now()
      });
    }
  }

  modifyVitalSign(vitalSign: string, change: number): void {
    // Modify vital signs (simplified implementation)
    switch (vitalSign) {
      case 'temperature':
        this.patientState.vitalSigns.temperature += change;
        break;
      case 'heart_rate':
        this.patientState.vitalSigns.heartRate += change;
        break;
    }
  }

  getOutcomeMessage(outcome: TreatmentOutcome, treatment: Treatment): string {
    const resultEmojis = {
      success: '✅',
      partial_success: '⚡',
      failure: '❌',
      complication: '🚨'
    };

    const resultTexts = {
      success: 'Treatment successful!',
      partial_success: 'Partial improvement',
      failure: 'Treatment ineffective',
      complication: 'Complication occurred!'
    };

    return `${resultEmojis[outcome.result]} ${treatment.name}: ${resultTexts[outcome.result]}`;
  }

  // MYSTERY ELEMENTS: Symptom progression over time
  updateSymptomProgression(): void {
    const now = Date.now();

    this.symptomProgression.forEach(progression => {
      const timeSinceLastUpdate = now - progression.lastUpdate;
      const symptom = this.patientState.symptoms.find(s => s.id === progression.symptomId);

      if (symptom && timeSinceLastUpdate > 10000) { // Update every 10 seconds
        // Symptoms naturally progress toward worse state
        if (Math.random() < progression.progressionRate) {
          const severityValues = ['mild', 'moderate', 'severe', 'critical'];
          const currentIndex = severityValues.indexOf(symptom.severity);
          if (currentIndex < 3) { // Not at critical yet
            const newSeverity = severityValues[currentIndex + 1] as any;
            symptom.severity = newSeverity;
            progression.currentSeverity++;

            // Notify if symptom worsens and is revealed
            if (symptom.revealed) {
              this.audioManager?.showFeedback(`⚠️ ${symptom.name} has worsened to ${newSeverity}`, 'warning');
            }
          }
        }

        progression.lastUpdate = now;
      }
    });
  }

  // MYSTERY ELEMENTS: Dynamic patient emotional state
  updatePatientEmotionalState(): void {
    const unrevealedSymptoms = this.patientState.symptoms.filter(s => !s.revealed).length;
    const severeSymptoms = this.patientState.symptoms.filter(s => s.severity === 'severe' || s.severity === 'critical').length;
    const activeTreatments = this.activeTreatments.length;

    // Determine emotional state based on conditions
    if (severeSymptoms > 0 && activeTreatments === 0) {
      this.patientState.emotionalState = 'pain';
    } else if (unrevealedSymptoms > 2) {
      this.patientState.emotionalState = 'anxious';
    } else if (activeTreatments > 0) {
      this.patientState.emotionalState = 'calm';
    } else {
      this.patientState.emotionalState = 'anxious';
    }

    // Emotional state affects conversation responses
    // This could influence what information patients share
  }

  // MYSTERY ELEMENTS: Progressive information revelation
  revealProgressiveInformation(): void {
    const unrevealedSymptoms = this.patientState.symptoms.filter(s => !s.revealed);

    if (unrevealedSymptoms.length > 0 && this.patientState.trustLevel > 60) {
      // High trust level allows spontaneous symptom revelation
      if (Math.random() < 0.1) { // 10% chance per update
        const randomSymptom = unrevealedSymptoms[Math.floor(Math.random() * unrevealedSymptoms.length)];
        randomSymptom.revealed = true;

        this.audioManager?.showFeedback(`💭 Patient spontaneously mentions: ${randomSymptom.description}`, 'info');

        // Add to investigation panel
        const uiManager = this.diagnosticUI.getUIManager();
        const investigationPanel = uiManager?.getInvestigationPanel();
        if (investigationPanel && investigationPanel.addEvidence) {
          investigationPanel.addEvidence({
            id: `spontaneous_${randomSymptom.id}_${Date.now()}`,
            source: 'interview',
            content: `Patient spontaneously revealed: ${randomSymptom.description}`,
            abnormal: randomSymptom.severity !== 'mild',
            timestamp: Date.now()
          });
        }
      }
    }
  }

  // GAMIFICATION: Update time pressure multiplier based on remaining time
  updateTimePressure(): void {
    if (!this.gameManager) return;

    const gameState = this.gameManager.getGameState();
    if (!gameState) return;

    const timeRemaining = gameState.timeRemaining || 0;
    const totalTime = 300; // 5 minutes

    // Calculate time pressure: higher multiplier when less time remains
    if (timeRemaining < 60) { // Last minute
      this.timePressureMultiplier = 2.0;
    } else if (timeRemaining < 120) { // Last 2 minutes
      this.timePressureMultiplier = 1.5;
    } else if (timeRemaining < 180) { // Last 3 minutes
      this.timePressureMultiplier = 1.2;
    } else {
      this.timePressureMultiplier = 1.0;
    }
  }

  // CASE SELECTION HUB: Comprehensive case selection system
  showCaseSelectionHub(): void {
    const availableCases: CaseProfile[] = [
      {
        id: 'free_case_1',
        name: 'Basic Emergency Case',
        difficulty: 'beginner',
        budget: 0.5,
        potentialEarnings: {
          basePayment: 1.0,
          complexityMultiplier: 1.0,
          accuracyBonus: 0.2,
          efficiencyBonus: 0.15,
          treatmentBonus: 0.1
        },
        timeLimit: 300
      },
      {
        id: 'premium_case_1',
        name: 'Complex Trauma Case',
        difficulty: 'intermediate',
        budget: 1.5,
        potentialEarnings: {
          basePayment: 2.5,
          complexityMultiplier: 1.5,
          accuracyBonus: 0.5,
          efficiencyBonus: 0.4,
          treatmentBonus: 0.3
        },
        timeLimit: 420,
        unlockRequirements: ['diagnostic_accuracy_80']
      },
      {
        id: 'expert_case_1',
        name: 'Rare Neurological Case',
        difficulty: 'advanced',
        budget: 3.0,
        potentialEarnings: {
          basePayment: 5.0,
          complexityMultiplier: 2.0,
          accuracyBonus: 1.0,
          efficiencyBonus: 0.8,
          treatmentBonus: 0.6
        },
        timeLimit: 600,
        unlockRequirements: ['treatment_success_85', 'efficiency_rating_90']
      },
      {
        id: 'master_case_1',
        name: 'Multi-System Crisis',
        difficulty: 'expert',
        budget: 5.0,
        potentialEarnings: {
          basePayment: 10.0,
          complexityMultiplier: 3.0,
          accuracyBonus: 2.0,
          efficiencyBonus: 1.5,
          treatmentBonus: 1.0
        },
        timeLimit: 900,
        unlockRequirements: ['diagnostic_accuracy_95', 'treatment_success_95', 'best_streak_20']
      }
    ];

    this.displayCaseSelectionHub(availableCases);
  }

  displayCaseSelectionHub(cases: CaseProfile[]): void {
    const hub = document.createElement('div');
    hub.id = 'case-selection-hub';
    hub.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 3000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow-y: auto;
    `;

    const userProgress = this.getUserProgress(); // Mock user progress for now

    hub.innerHTML = `
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: white; font-size: 2.5em; margin: 0 0 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
          🏥 Case Selection Hub
        </h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 1.2em; margin: 0;">
          Choose your next medical challenge
        </p>
        <div style="margin-top: 20px; color: white; font-size: 1.1em;">
        <div>🏆 Level ${userProgress.level} Doctor</div>
        <div>💰 Total Earnings: ${userProgress.totalEarnings.toFixed(1)} MON</div>
        <div>🎯 Accuracy: ${userProgress.diagnosticAccuracy}%</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1200px; width: 100%;">
        ${cases.map(caseProfile => this.renderCaseCard(caseProfile, userProgress)).join('')}
      </div>

      <button id="close-case-hub" style="
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.2);
        border: 2px solid white;
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.3s ease;
      ">Close Hub</button>
    `;

    document.body.appendChild(hub);

    // Add hover effects for case cards
    const caseCards = hub.querySelectorAll('.case-card');
    caseCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        (card as HTMLElement).style.transform = 'translateY(-5px)';
        (card as HTMLElement).style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
      });
      card.addEventListener('mouseleave', () => {
        (card as HTMLElement).style.transform = 'translateY(0)';
        (card as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
      });
    });

    // Event listeners
    const closeBtn = hub.querySelector('#close-case-hub') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => {
      if (hub.parentNode) {
        hub.parentNode.removeChild(hub);
      }
    });

    cases.forEach((caseProfile) => {
      const selectBtn = hub.querySelector(`#select-case-${caseProfile.id}`) as HTMLButtonElement;
      if (selectBtn) {
        selectBtn.addEventListener('click', () => {
          this.selectCase(caseProfile);
          if (hub.parentNode) {
            hub.parentNode.removeChild(hub);
          }
        });
      }
    });
  }

  renderCaseCard(caseProfile: CaseProfile, userProgress: UserProgression): string {
    const isUnlocked = this.isCaseUnlocked(caseProfile, userProgress);
    const difficultyColors = {
      beginner: '#27ae60',
      intermediate: '#f39c12',
      advanced: '#e74c3c',
      expert: '#9b59b6'
    };

    const totalPotential = caseProfile.potentialEarnings.basePayment * caseProfile.potentialEarnings.complexityMultiplier +
                          caseProfile.potentialEarnings.accuracyBonus +
                          caseProfile.potentialEarnings.efficiencyBonus +
                          caseProfile.potentialEarnings.treatmentBonus;

    return `
      <div class="case-card" style="
        background: ${isUnlocked ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)'};
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        border: 3px solid ${difficultyColors[caseProfile.difficulty]};
        position: relative;
        overflow: hidden;
      ">
        ${!isUnlocked ? `
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            z-index: 1;
          ">
            🔒 Locked - Complete requirements
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #2c3e50; font-size: 1.3em;">${caseProfile.name}</h3>
          <span style="
            background: ${difficultyColors[caseProfile.difficulty]};
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
          ">${caseProfile.difficulty}</span>
        </div>

        <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>🏥 Budget:</span>
        <span style="font-weight: bold; color: #27ae60;">${caseProfile.budget.toFixed(1)} MON</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>💰 Potential Earnings:</span>
        <span style="font-weight: bold; color: #e74c3c;">${totalPotential.toFixed(1)} MON</span>
        </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>⏰ Time Limit:</span>
            <span style="font-weight: bold;">${Math.floor(caseProfile.timeLimit / 60)}:${(caseProfile.timeLimit % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        ${caseProfile.unlockRequirements ? `
          <div style="margin-bottom: 20px; padding: 10px; background: rgba(52, 152, 219, 0.1); border-radius: 8px;">
            <div style="font-weight: bold; color: #2980b9; margin-bottom: 5px;">🔓 Requirements:</div>
            <ul style="margin: 0; padding-left: 20px; color: #2980b9;">
              ${caseProfile.unlockRequirements.map(req => `<li>${this.formatRequirement(req)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <button id="select-case-${caseProfile.id}"
          ${!isUnlocked ? 'disabled' : ''}
          style="
            width: 100%;
            padding: 12px;
            background: ${isUnlocked ? '#27ae60' : '#95a5a6'};
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
            transition: background 0.3s ease;
          ">
          ${isUnlocked ? '🎯 Select Case' : '🔒 Locked'}
        </button>
      </div>
    `;
  }

  isCaseUnlocked(caseProfile: CaseProfile, userProgress: UserProgression): boolean {
    if (!caseProfile.unlockRequirements) return true;

    return caseProfile.unlockRequirements.every(req => {
      // Mock requirement checking - in real implementation, check against actual user progress
      return true; // For now, all cases are unlocked for demonstration
    });
  }

  formatRequirement(requirement: string): string {
    const requirementMap: { [key: string]: string } = {
      'diagnostic_accuracy_80': '80% Diagnostic Accuracy',
      'treatment_success_85': '85% Treatment Success Rate',
      'efficiency_rating_90': '90% Efficiency Rating',
      'diagnostic_accuracy_95': '95% Diagnostic Accuracy',
      'treatment_success_95': '95% Treatment Success Rate',
      'best_streak_20': '20 Condition Discovery Streak'
    };

    return requirementMap[requirement] || requirement;
  }

  selectCase(caseProfile: CaseProfile): void {
    this.currentCaseProfile = caseProfile;
    this.hospitalBudget = caseProfile.budget;
    this.caseEarnings = 0;
    this.calculatePotentialEarnings();
    this.updateEconomicDisplays();

    // Reset game state for new case
    this.resetCaseState();

    // HACKATHON: Auto-setup AI delegation for premium cases
    if (caseProfile.difficulty !== 'beginner') {
      this.setupAIDelegation();
    }

    this.audioManager?.showFeedback(`🎯 Selected: ${caseProfile.name}`, 'success');
  }

  getUserProgress(): UserProgression {
    // Mock user progress - in real implementation, this would come from user profile/database
    return {
      level: 3,
      experience: 2450,
      diagnosticAccuracy: 87,
      efficiencyRating: 82,
      treatmentSuccessRate: 91,
      unlockedCases: ['free_case_1', 'premium_case_1'],
      totalEarnings: 12.5, // 12.5 MON
      bestStreak: 15
    };
  }

  resetCaseState(): void {
    // Reset case-specific state
    this.discoveryStreak = 0;
    this.lastDiscoveryTime = 0;
    this.comboMultiplier = 1;
    this.totalScore = 0;
    this.timerPaused = false;
    this.totalPausedTime = 0;
    this.activeTreatments = [];
    this.pendingComplications = [];

    // HACKATHON: Clear delegations for new case
    this.smartAccount.clearAllDelegations();

    // Reinitialize patient state
    this.initializePatientState();
  }

  // HACKATHON: Set up AI delegation for autonomous medical decisions
  async setupAIDelegation(): Promise<void> {
    try {
      // Grant AI agent permission to execute treatments
      const treatmentDelegation = await this.smartAccount.delegateTreatmentAuthority(
        this.currentCaseProfile.id,
        this.hospitalBudget * 0.5 // Allow AI to spend up to 50% of budget
      );

      if (treatmentDelegation) {
        // Grant AI permission to complete cases
        await this.smartAccount.delegateCaseCompletion(this.currentCaseProfile.id);

        this.audioManager?.showFeedback('🤖 AI Medical Assistant activated! Can now autonomously administer treatments and complete cases.', 'success');
      }
    } catch (error) {
      console.error('Failed to setup AI delegation:', error);
      this.audioManager?.showFeedback('⚠️ AI delegation setup failed - operating in manual mode', 'warning');
    }
  }

  // HACKATHON: Envio integration for blockchain indexing
  async indexCaseDataToEnvio(caseId: string, diagnosis: any, earnings: number): Promise<void> {
    try {
      // Prepare case data for indexing
      const caseData = {
        caseId,
        timestamp: Date.now(),
        diagnosis,
        earnings,
        treatments: this.activeTreatments,
        complications: this.pendingComplications,
        symptoms: this.patientState.symptoms,
        delegations: this.smartAccount.getActiveDelegations(),
        payments: this.smartAccount.getPendingPayments()
      };

      // In production: Send to Envio HyperIndex/HyperSync
      // For hackathon demo: Log the data structure
      console.log('📊 Case data indexed to Envio:', caseData);

      // Simulate Envio indexing confirmation
      this.audioManager?.showFeedback('📊 Case data indexed on Monad via Envio', 'info');

    } catch (error) {
      console.error('Failed to index case data:', error);
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

  // Progressive tutorial hints based on user progress
  if (timeSinceLastActivity > this.hintTimeout + 3000) { // Reduced to 13 seconds for more responsive guidance
  if (this.discoveredConditions.size === 0) {
  if (!this.hasPressedCToggle) {
      this.showTutorialHint('Press [C] to reveal condition markers on the patient');
  } else {
      this.showTutorialHint('Look for glowing markers. Hover over them and click to scan!');
      }
      } else if (this.discoveredConditions.size < 2) {
        this.showTutorialHint('Great! Keep scanning - find more conditions before time runs out');
      } else if (this.discoveredConditions.size >= 2 && !this.hasSubmittedDiagnosis) {
        this.showTutorialHint('You\'ve found conditions! Check the Investigation Panel to submit diagnosis');
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
