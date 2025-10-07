import * as THREE from "three"
import { Dimensions, Size } from "./types/types"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import GUI from "lil-gui"
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js"
import XRayEffect from "./components/x-ray-effect"
import { XRayControls } from "./components/xray-controls"
import { MobileCamera } from "./components/mobile-camera"
import { AudioManager } from "./components/AudioManager"
import { SoundType } from "./components/AudioManager"
import { ScanFeedbackSystem } from "./components/ScanFeedbackSystem"
import { DiagnosticUIFacade } from "./domains/diagnostic/DiagnosticUIFacade"
import { GameManager } from "./domains/diagnostic/GameManager"
import { MedicalWorkflowManager } from "./domains/diagnostic/MedicalWorkflowManager"
import { TutorialFacade } from "./domains/tutorial/TutorialFacade"
import { VoiceConsultationManager } from "./domains/voice/VoiceConsultationManager"

export default class Canvas {
  element: HTMLCanvasElement
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  composer: EffectComposer
  renderer: THREE.WebGLRenderer
  sizes: Size
  dimensions: Dimensions
  time: number
  clock: THREE.Clock
  raycaster: THREE.Raycaster
  mouse: THREE.Vector2
  orbitControls: OrbitControls
  debug: GUI
  xRayEffect: XRayEffect

  // Enhanced mobile components
  xrayControls: XRayControls
  mobileCamera: MobileCamera
  isMobile: boolean

  // Audio system
  audioManager: AudioManager

  // ENHANCEMENT FIRST: Visual scan feedback system
  scanFeedbackSystem: ScanFeedbackSystem | null = null

  // ENHANCEMENT FIRST: Diagnostic UI system
  diagnosticUI: DiagnosticUIFacade | null = null

  // ENHANCEMENT FIRST: Game systems
  gameManager: GameManager | null = null
  medicalWorkflow: MedicalWorkflowManager | null = null

  // ENHANCEMENT FIRST: Tutorial and voice systems
  tutorial: TutorialFacade | null = null
  voiceConsultation: VoiceConsultationManager | null = null

  // Control RAF and listeners
  private _rafId: number | null = null
  private _disposed = false

  constructor(canvasElement: HTMLCanvasElement) {
    this.element = canvasElement
    this.time = 0
    this.isMobile = window.innerWidth < 768

    this.createClock()
    this.createScene()
    this.createCamera()
    this.setSizes() // Set dimensions before creating renderer
    this.createRenderer() // Now dimensions is defined
    this.createPostProcessing()
    this.createRayCaster()
    this.createOrbitControls() // Now renderer is defined
    this.addEventListeners()
    //this.createDebug()
    //this.createHelpers()
    this.createAudioManager()
    this.createXRayEffect()
    this.createLights()
    this.createScanFeedbackSystem()
    this.createDiagnosticUI()
    this.createTutorialAndVoice()
    this.setupKeyboardShortcuts() // ENHANCEMENT: Minimal keyboard support
    this.createMobileComponents()
    this.render()
  }

  createScene() {
    this.scene = new THREE.Scene()
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.scene.add(this.camera)
    this.camera.position.z = 7
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75)
    directionalLight.position.set(1, 1, 1)
    this.scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.75)
    directionalLight2.position.set(-1, -1, -1)
    this.scene.add(directionalLight2)
  }

  createAudioManager() {
    this.audioManager = new AudioManager(this.camera)

    // ENHANCEMENT FIRST: Make audio manager globally accessible for UI interactions
    if (typeof window !== 'undefined') {
      (window as any).audioManager = this.audioManager
    }

    // AGGRESSIVE CONSOLIDATION: Audio now controlled by tutorial system
    // No auto-start needed - welcome screen handles user interaction
  }

  createOrbitControls() {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )
  }

  createClock() {
    this.clock = new THREE.Clock()
  }

  createRayCaster() {
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
  }

  setSizes() {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    }

    this.sizes = {
      width: this.dimensions.width,
      height: this.dimensions.height,
    }
  }

  createRenderer() {
    // Force canvas to full size
    this.element.style.width = '100vw';
    this.element.style.height = '100vh';
    this.element.style.position = 'fixed';
    this.element.style.top = '0';
    this.element.style.left = '0';

    console.log('Canvas element size:', this.element.clientWidth, 'x', this.element.clientHeight);
    console.log('Window size:', window.innerWidth, 'x', window.innerHeight);
    console.log('Dimensions:', this.dimensions);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.element,
      antialias: true,
      alpha: true,
    })
    this.renderer.setPixelRatio(this.dimensions.pixelRatio)
    this.renderer.setSize(this.dimensions.width, this.dimensions.height)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    console.log('Renderer size set to:', this.dimensions.width, 'x', this.dimensions.height);
  }

  createPostProcessing() {
    this.composer = new EffectComposer(this.renderer)
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)
  }

  onMouseMove = (event: MouseEvent) => {
    if (this._disposed) return;
    
    // Skip interactions if mobile camera is active
    if (this.mobileCamera && this.mobileCamera.getState().isActive) {
      return;
    }
    
    // Store normalized device coordinates for raycasting
    const ndcX = (event.clientX / window.innerWidth) * 2 - 1
    const ndcY = -(event.clientY / window.innerHeight) * 2 + 1

    // Store 0-1 range coordinates for XRayEffect
    const xRayX = event.clientX / window.innerWidth
    const xRayY = 1 - event.clientY / window.innerHeight

    this.xRayEffect?.onMouseMove({ x: xRayX, y: xRayY })

    // Use NDC coordinates for raycasting
    this.mouse.x = ndcX
    this.mouse.y = ndcY
    this.raycaster.setFromCamera(this.mouse, this.camera)

    const intersects = this.raycaster.intersectObjects(this.scene.children)
    this.xRayEffect?.handleMedicalConditionHover(intersects)
  }

  createHelpers() {
    const axesHelper = new THREE.AxesHelper(5)
    this.scene.add(axesHelper)
  }

  addEventListeners() {
    window.addEventListener("mousemove", this.onMouseMove)
    window.addEventListener("click", this.onMouseClick)
    window.addEventListener("resize", this.onResize)

    // AGGRESSIVE CONSOLIDATION: Audio now handled by tutorial welcome screen
    // Tutorial's "Start Experience" button enables audio with proper user consent
  }

  onMouseClick = (event: MouseEvent) => {
    if (this._disposed) return;
    
    // Skip interactions if mobile camera is active
    if (this.mobileCamera && this.mobileCamera.getState().isActive) {
      return;
    }
    
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.camera)

    const intersects = this.raycaster.intersectObjects(this.scene.children)
    this.xRayEffect?.handleMedicalConditionClick(intersects)
  }

  onResize = () => {
    if (this._disposed) return;
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    }

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.setSizes()

    this.renderer.setPixelRatio(this.dimensions.pixelRatio)
    this.renderer.setSize(this.dimensions.width, this.dimensions.height)
    this.xRayEffect?.onResize()
  }

  createXRayEffect() {
    this.xRayEffect = new XRayEffect({
      scene: this.scene,
      composer: this.composer,
      renderer: this.renderer,
      camera: this.camera,
      audioManager: this.audioManager,
      scanFeedbackSystem: this.scanFeedbackSystem,
      mobileCamera: this.mobileCamera,
    })
  }

  createScanFeedbackSystem() {
    // ENHANCEMENT FIRST: Initialize visual scan feedback
    this.scanFeedbackSystem = new ScanFeedbackSystem(this.scene)
    console.log('✨ ScanFeedbackSystem initialized')
  }

  // ENHANCEMENT FIRST: Initialize diagnostic UI using existing systems
  createDiagnosticUI() {
    this.diagnosticUI = new DiagnosticUIFacade({
      audioManager: this.audioManager,
      xRayEffect: this.xRayEffect,
      scanFeedbackSystem: this.scanFeedbackSystem,
      onConsultationClick: () => this.startVoiceConsultation()
    })
    this.diagnosticUI.initialize()
    console.log('🏥 DiagnosticUI initialized')
  }

  // ENHANCEMENT FIRST: Connect voice consultation to diagnostic UI
  private startVoiceConsultation() {
    if (this.voiceConsultation) {
      const gameState = this.gameManager?.getGameState() || {
        discoveredConditions: new Set(['temporomandibular_disorder']),
        timeRemaining: 300,
        phase: 'scanning',
        score: 0,
        patientCase: { patientName: 'Test Patient' }
      }
      
      // Use real patient case data if available, otherwise fall back to test
      const patientCase = gameState.patientCase || { patientName: 'Test Patient' };
      
      const context = {
        patientCase: patientCase,
        discoveredConditions: gameState.discoveredConditions,
        scanProgress: new Map(),
        timeRemaining: gameState.timeRemaining,
        gamePhase: gameState.phase,
        currentScore: gameState.score
      }
      this.voiceConsultation.startConsultation(context)
    }
  }

  // ENHANCEMENT FIRST: Initialize tutorial and voice using existing systems
  createTutorialAndVoice() {
    // Initialize GameManager
    this.gameManager = new GameManager()
    
    // Initialize MedicalWorkflowManager (for patient case generation)
    this.medicalWorkflow = new MedicalWorkflowManager(null) // Pass cerebras service if available
    
    // Tutorial facade
    this.tutorial = new TutorialFacade({
      audioManager: this.audioManager,
      xRayEffect: this.xRayEffect,
      scanFeedbackSystem: this.scanFeedbackSystem,
      diagnosticUI: this.diagnosticUI,
      onTutorialComplete: () => this.startGame()
    })
    
    // Voice consultation manager
    this.voiceConsultation = new VoiceConsultationManager()
    
    // Auto-start tutorial for new users
    const hasSeenTutorial = localStorage.getItem('xrai_tutorial_completed')
    if (!hasSeenTutorial) {
      setTimeout(() => this.tutorial?.start(), 2000) // Start after model loads
    }
    
    console.log('📚 Tutorial and Voice systems initialized')
  }

  // ENHANCEMENT FIRST: Start the game when tutorial completes
  private startGame() {
    console.log('🎮 Starting game after tutorial completion')
    
    // Mark tutorial as completed in localStorage
    localStorage.setItem('xrai_tutorial_completed', 'true')
    
    // Generate a realistic patient case
    this.generateAndIntroducePatientCase()
    
    // Start the game timer
    this.gameManager?.startTimer()
    
    // Switch audio to hospital ambience
    this.diagnosticUI?.getUIManager().startGameAudio()
    
    // Update UI for active game state
    this.diagnosticUI?.updatePhase('Active Game')
    
    // Show feedback to user
    this.audioManager?.showFeedback('🏥 Welcome to the diagnostic challenge! Find medical conditions before time runs out.', 'info')
  }
  
  // ENHANCEMENT: Generate and introduce a realistic patient case
  private async generateAndIntroducePatientCase() {
    try {
      // Generate a realistic patient case based on current model
      const currentModel = this.xRayEffect?.currentModel || 'head'
      const patientCase = await this.medicalWorkflow?.generatePatientCase(currentModel)
      
      // Update the game manager with the patient case
      if (patientCase) {
        this.gameManager?.updateState({ patientCase })
        
        // Update the diagnostic UI with patient information
        this.diagnosticUI?.updatePatientInfo({
          patientName: patientCase.patientName,
          age: patientCase.age,
          gender: patientCase.gender
        })
        
        console.log(`🏥 Patient case generated: ${patientCase.patientName}, Age: ${patientCase.age}, Chief Complaint: ${patientCase.chiefComplaint}`)
        
        // Provide audio feedback about the patient
        this.audioManager?.showFeedback(`New patient: ${patientCase.patientName}, age ${patientCase.age}. Chief complaint: ${patientCase.chiefComplaint}`, 'info')
      }
    } catch (error) {
      console.error('Failed to generate patient case:', error)
      // Fallback to basic patient info if generation fails
      const fallbackPatient = { patientName: 'Test Patient', age: 42, gender: 'Unknown' }
      this.gameManager?.updateState({ patientCase: fallbackPatient })
      this.diagnosticUI?.updatePatientInfo(fallbackPatient)
      this.audioManager?.showFeedback('🏥 New patient: Test Patient. Ready for diagnostic evaluation.', 'info')
    }
  }

  // ENHANCEMENT FIRST: Minimal keyboard shortcuts using existing systems
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement) return
      
      switch (e.key.toLowerCase()) {
        case 'c':
          this.xRayEffect?.toggleConditions()
          this.audioManager?.showFeedback('🔍 Toggled condition markers')
          break
        case 'e':
          // Use existing expansion logic from XRayEffect
          this.xRayEffect?.onPressKey(e)
          this.audioManager?.showFeedback('🔍 Expanded X-ray view')
          break
        case 'h':
          this.audioManager?.showFeedback('💡 Focus on density variations', 'info')
          break
      }
    })
  }

  render() {
    if (this._disposed) return;
    this.time = this.clock.getElapsedTime()
    const deltaTime = this.clock.getDelta()

    this.orbitControls.update()

    // PERFORMANT: Update scan feedback system
    this.scanFeedbackSystem?.update(deltaTime)

    this.xRayEffect?.render()

    this.composer.render()

    // Continue the animation loop
    this._rafId = requestAnimationFrame(() => this.render())
  }

  // Enhanced mobile methods
  private createMobileComponents(): void {
    // Create X-ray effect controls
    this.xrayControls = new XRayControls(
      this.element,
      this.camera,
      this.renderer,
      {
        onScaleChange: (scale: number) => {
          console.log('X-ray scale changed:', scale)
          if (this.xRayEffect) {
            this.xRayEffect.setScale(scale)
          }
        },
        onToggleConditions: () => {
          console.log('Toggle conditions requested')
          if (this.xRayEffect) {
            this.xRayEffect.toggleConditions()
          }
        }
      }
    )

    // Create mobile camera for face upload
    this.mobileCamera = new MobileCamera({
      onImageCaptured: (imageData: string, faceDetection: any) => {
        console.log('Face image captured:', { faceDetection })
      },
      onFaceDetected: (detection: any) => {
        console.log('Face detected:', detection)
      },
      onError: (error: string) => {
        console.error('Camera error:', error)
      },
      onPermissionGranted: () => {
        console.log('Camera permission granted')
      }
    })
  }

  dispose() {
    this._disposed = true
    if (this._rafId !== null) cancelAnimationFrame(this._rafId)
    window.removeEventListener("mousemove", this.onMouseMove)
    window.removeEventListener("click", this.onMouseClick)
    window.removeEventListener("resize", this.onResize)
    try { this.scanFeedbackSystem?.destroy() } catch { }
    try { this.diagnosticUI?.destroy() } catch { }
    try { this.tutorial?.destroy() } catch { }
    try { this.xRayEffect?.destroy() } catch { }
    try { this.renderer?.dispose() } catch { }
    // Clean up scene resources
    if (this.scene) {
      this.scene.traverse((obj: any) => {
        if ((obj as any).geometry) (obj as any).geometry.dispose?.()
        if ((obj as any).material) {
          const m = (obj as any).material
          if (Array.isArray(m)) m.forEach(mm => mm.dispose?.())
          else m.dispose?.()
        }
      })
    }
  }
}
