import * as THREE from "three"
import { Dimensions, Size } from "./types/types"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import GUI from "lil-gui"
import { gsap } from 'gsap';
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
import { StagedDiagnosticView } from "./domains/diagnostic/stages/StagedDiagnosticView"
import { AchievementDisplay } from "./domains/diagnostic/ui/AchievementDisplay"
import { GameManager, GameState } from "./domains/diagnostic/GameManager"
import { MedicalServiceFacade } from "./domains/medical/MedicalServiceFacade"
import { MedicalCase, PatientState } from "./domains/medical/types"
import { TutorialFacade } from "./domains/tutorial/TutorialFacade"
import { VoiceConsultationManager } from "./domains/voice/VoiceConsultationManager"
import { NurseAmyNudgeSystem } from "./domains/diagnostic/NurseAmyNudgeSystem"
import { colors, spacing, typography, borders, effects, zIndex } from './styles/design-tokens'
import { payForAICase } from "./domains/web3/services/mon-payment"

export class XRayCanvas {
  element: HTMLCanvasElement
  scene!: THREE.Scene
  camera!: THREE.PerspectiveCamera
  composer!: EffectComposer
  renderer!: THREE.WebGLRenderer
  sizes!: Size
  dimensions!: Dimensions
  time: number
  clock!: THREE.Clock
  raycaster!: THREE.Raycaster
  mouse!: THREE.Vector2
  orbitControls!: OrbitControls
  debug!: GUI
  xRayEffect!: XRayEffect

  // Enhanced mobile components
  xrayControls!: XRayControls
  mobileCamera!: MobileCamera
  isMobile: boolean

  // Audio system
  audioManager!: AudioManager

  // ENHANCEMENT FIRST: Visual scan feedback system
  scanFeedbackSystem: ScanFeedbackSystem | null = null

  // ENHANCEMENT FIRST: Diagnostic UI system
  diagnosticUI: DiagnosticUIFacade | null = null
  stagedDiagnosticView: any = null // Staged diagnostic view reference
  achievementDisplay: AchievementDisplay | null = null

  // ENHANCEMENT FIRST: Game systems
  gameManager: GameManager | null = null
  medicalService: MedicalServiceFacade | null = null

  // ENHANCEMENT FIRST: Tutorial and voice systems
  tutorial: TutorialFacade | null = null
  voiceConsultation: VoiceConsultationManager | null = null
  nurseAmyNudges: NurseAmyNudgeSystem | null = null
  aiPanel: any = null // AI Panel reference for milestone responses

  // Control RAF and listeners
  private _rafId: number | null = null
  private _disposed = false

  constructor(canvasElement: HTMLCanvasElement) {
    this.element = canvasElement
    this.time = 0
    this.isMobile = window.innerWidth < 768

    // Create loading screen before initializing components
    this.createLoadingScreen()

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

    // Listen for wallet connection events to update MedicalServiceFacade
    this.setupWalletEventListeners();

    // Remove loading screen and start render after a brief delay to ensure everything is initialized
    setTimeout(() => {
      this.removeLoadingScreen()
      this.render()
    }, 500)
  }

  private createLoadingScreen(): void {
    // Create a stylish loading overlay
    const loadingScreen = document.createElement('div')
    loadingScreen.id = 'loading-screen'
    loadingScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      transition: opacity 0.5s ease;
    `

    loadingScreen.innerHTML = `
      <div style="
        text-align: center;
        max-width: 500px;
        padding: 30px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <div style="
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          background: linear-gradient(90deg, #00d4ff, #0099cc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        ">X-RAY DIAGNOSTIC</div>
        <div style="
          font-size: 16px;
          margin-bottom: 30px;
          color: rgba(255, 255, 255, 0.7);
        ">Initializing medical visualization platform</div>
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        ">
          <div class="loading-dot" style="
            width: 12px;
            height: 12px;
            background: #00d4ff;
            border-radius: 50%;
            animation: pulse 1.4s infinite both;
            animation-delay: 0s;
          "></div>
          <div class="loading-dot" style="
            width: 12px;
            height: 12px;
            background: #00d4ff;
            border-radius: 50%;
            animation: pulse 1.4s infinite both;
            animation-delay: 0.2s;
          "></div>
          <div class="loading-dot" style="
            width: 12px;
            height: 12px;
            background: #00d4ff;
            border-radius: 50%;
            animation: pulse 1.4s infinite both;
            animation-delay: 0.4s;
          "></div>
        </div>
        <div style="
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        ">Preparing diagnostic environment...</div>
      </div>
      
      <style>
        @keyframes pulse {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.7; }
        40% { transform: scale(1.2); opacity: 1; }
        }

      @keyframes panelHighlight {
        0% { filter: brightness(1); transform: scale(1); }
        50% { filter: brightness(1.2); transform: scale(1.02); box-shadow: 0 0 30px rgba(0, 255, 136, 0.4); }
        100% { filter: brightness(1); transform: scale(1); }
      }

      @keyframes toolUnlock {
        0% { transform: scale(0.8); opacity: 0.5; filter: blur(2px); }
        50% { transform: scale(1.1); opacity: 0.8; filter: blur(0px); }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes warningPulse {
        0% { opacity: 0; }
        50% { opacity: 0.3; }
        100% { opacity: 0; }
      }

      @keyframes emergencyPulse {
        0% { opacity: 0; }
        25% { opacity: 0.4; }
        50% { opacity: 0.2; }
        75% { opacity: 0.4; }
        100% { opacity: 0; }
      }
      </style>
    `

    document.body.appendChild(loadingScreen)
  }

  private removeLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      loadingScreen.style.opacity = '0'
      setTimeout(() => {
        if (loadingScreen.parentElement) {
          loadingScreen.parentElement.removeChild(loadingScreen)
        }
      }, 500)
    }
  }

  // ENHANCEMENT: Wallet connection event listeners
  private setupWalletEventListeners(): void {
    // Listen for wallet connection events
    document.addEventListener('walletConnected', (event: any) => {
      const { address, preferredDifficulty } = event.detail;

      console.log('💰 Wallet connected event received:', { address, preferredDifficulty });

      // Update MedicalServiceFacade with new authentication status
      if (this.medicalService) {
        this.medicalService.updateAuthStatus(true, address, preferredDifficulty);
      }

      // PERFORMANT: Don't auto-generate case on wallet connect
      // Wait for onboardingComplete event with user's choice
    });

    // ENHANCEMENT FIRST: Listen for onboarding completion with user's case choice
    document.addEventListener('onboardingComplete', async (event: any) => {
      const { generateAICase, chargeTestnetMON } = event.detail;

      console.log('🎓 Onboarding complete:', { generateAICase, chargeTestnetMON });

      if (generateAICase && chargeTestnetMON) {
        // User chose to generate AI case and pay wMON
        try {
          // Get wallet client from window (set by useWeb3 hook)
          const walletClient = (window as any).walletClient;

          if (!walletClient) {
            throw new Error('Wallet client not available');
          }

          console.log('💰 Processing 0.1 wMON payment for AI case generation');
          this.audioManager?.showFeedback('💰 Processing payment...', 'info');

          // Charge 0.1 wMON tokens to paymaster (virtuous flywheel)
          const txHash = await payForAICase(0.1, walletClient);
          console.log('✅ Payment successful:', txHash);

          // Generate the AI case
          await this.generateAndIntroducePatientCase();

          this.audioManager?.showFeedback('🎉 AI case generated! 0.1 wMON paid to paymaster.', 'success');
        } catch (error: any) {
          console.error('Payment error:', error);
          this.audioManager?.showFeedback(`❌ Payment failed: ${error.message}`, 'error');
          // Still generate free case as fallback
          await this.generateAndIntroducePatientCase();
        }
      } else if (generateAICase) {
        // Generate AI case without payment (shouldn't happen but handle it)
        await this.generateAndIntroducePatientCase();
      } else {
        // User chose free static case - just enable NFT tracking on existing case
        console.log('🆓 User chose free static case with NFT tracking enabled');
        this.audioManager?.showFeedback('🆓 Free case - NFT tracking enabled!', 'success');
      }
    });

    // Listen for wallet disconnection events
    document.addEventListener('walletDisconnected', (event: any) => {
      console.log('🔒 Wallet disconnected event received');

      // Update MedicalServiceFacade with new authentication status
      if (this.medicalService) {
        this.medicalService.updateAuthStatus(false, undefined, 'medium');
      }

      // PERFORMANT: Don't reset case on disconnect - just update auth status
      // User can continue with their current case
    });
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

    // Use NDC coordinates for raycasting
    this.mouse.x = ndcX
    this.mouse.y = ndcY
    this.raycaster.setFromCamera(this.mouse, this.camera)

    const intersects = this.raycaster.intersectObjects(this.scene.children, true) // Recursive for groups

    // Find the first intersection point for 3D tracking
    let worldPosition: THREE.Vector3 | undefined
    if (intersects.length > 0) {
      worldPosition = intersects[0].point
    }

    this.xRayEffect?.onMouseMove({ x: xRayX, y: xRayY }, worldPosition)
    this.scanFeedbackSystem?.updateMousePosition(this.mouse);

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

  public animateCameraTo(position: THREE.Vector3, target: THREE.Vector3, duration: number = 1.5): void {
    gsap.to(this.camera.position, {
      duration,
      x: position.x,
      y: position.y,
      z: position.z,
      ease: "power2.inOut"
    });

    gsap.to(this.orbitControls.target, {
      duration,
      x: target.x,
      y: target.y,
      z: target.z,
      ease: "power2.inOut"
    });
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
      gameManager: this.gameManager,
    })
  }

  createScanFeedbackSystem() {
    // ENHANCEMENT FIRST: Initialize visual scan feedback
    this.scanFeedbackSystem = new ScanFeedbackSystem(this.scene, this.audioManager)
    console.log('✨ ScanFeedbackSystem initialized')
  }

  // ENHANCEMENT FIRST: Initialize diagnostic UI using existing systems
  createDiagnosticUI() {
    // Create diagnostic UI first without game manager
    this.diagnosticUI = new DiagnosticUIFacade({
      audioManager: this.audioManager,
      xRayEffect: this.xRayEffect,
      scanFeedbackSystem: this.scanFeedbackSystem,
      canvas: this,
      onConsultationClick: () => this.startVoiceConsultation()
    })
    this.diagnosticUI.initialize()

    // Create GameManager with reference to diagnostic UI manager
    this.gameManager = new GameManager({
      diagnosticUIManager: this.diagnosticUI.getUIManager()
    });

    // Update the diagnostic UI with the GameManager
    this.diagnosticUI.updateGameManager(this.gameManager);

    // Store AI panel reference for milestone responses
    this.aiPanel = this.diagnosticUI.getUIManager()?.getAIPanel();

    // Create achievement display
    this.achievementDisplay = new AchievementDisplay()
    const achievementElement = this.achievementDisplay.create()
    document.body.appendChild(achievementElement)

    // Initialize staged diagnostic view
    // this.initializeStagedDiagnosticView();

    // Set callbacks for buttons
    this.achievementDisplay.setCallbacks({
      onRevealConditions: () => this.toggleConditionsReveal(),
      onCaseHub: () => this.xRayEffect?.showCaseSelectionHub()
    })

    console.log('🏥 DiagnosticUI initialized')
  }

  // ENHANCEMENT FIRST: Toggle conditions reveal
  private toggleConditionsReveal(): void {
    this.xRayEffect?.toggleConditions()
  }

  // ENHANCEMENT FIRST: Update achievement display with metrics
  public updateAchievementDisplay(metrics: any): void {
    if (this.achievementDisplay) {
      this.achievementDisplay.updatePerformance(metrics)
    }
  }

  // ENHANCEMENT FIRST: Connect voice consultation to diagnostic UI
  private startVoiceConsultation() {
    if (this.voiceConsultation) {
      const gameState = this.gameManager?.getGameState() || {
        discoveredConditions: new Set(['temporomandibular_disorder']),
        timeRemaining: 300,
        phase: 'scanning',
        score: 0,
        patientCase: {
          patientName: 'Test Patient',
          chiefComplaint: 'Test complaint'
        }
      }

      // Use real patient case data if available, otherwise fall back to test
      const patientCase = gameState.patientCase || {
        patientName: 'Test Patient',
        chiefComplaint: 'Test complaint'
      };

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
    // The GameManager should already exist from createDiagnosticUI, but ensure it has the UI manager reference
    if (!this.gameManager) {
      if (this.diagnosticUI) {
        this.gameManager = new GameManager({
          diagnosticUIManager: this.diagnosticUI.getUIManager()
        });
      } else {
        this.gameManager = new GameManager();
      }
    } else if (this.diagnosticUI && !this.gameManager.diagnosticUIManager) {
      // Update the GameManager with the UI manager if it wasn't set before
      this.gameManager.diagnosticUIManager = this.diagnosticUI.getUIManager();
    }

    // ENHANCEMENT FIRST: Initialize Nurse Amy Nudge System
    this.nurseAmyNudges = new NurseAmyNudgeSystem(
      this.voiceConsultation || undefined,
      this.diagnosticUI?.getUIManager()?.getAIPanel() || undefined,
      this.diagnosticUI?.getGamePhaseManager()
    )

    // Register Nurse Amy with the diagnostic UI manager
    if (this.diagnosticUI && this.voiceConsultation) {
      this.diagnosticUI.getUIManager()?.registerNurseAmy(this.nurseAmyNudges);
    }

    // MODULAR: Connect timer events to Nurse Amy nudges and UI
    this.gameManager.on('timer_update', (data: any) => {
      const gameState = this.gameManager?.getGameState()
      if (gameState && this.nurseAmyNudges) {
        this.nurseAmyNudges.evaluateNudgeNeeds(gameState)
      }

      // ENHANCEMENT FIRST: Update timer display in UI
      if (this.diagnosticUI && data.timeRemaining !== undefined) {
        this.diagnosticUI.getUIManager()?.updateTimer(data.timeRemaining, data.urgency || 'normal')
      }
    })

    // ENHANCED: Rich milestone events for immersive drama
    this.gameManager.on('timer_milestone', (data: any) => {
      console.log(`🎭 Timer milestone: ${data.milestone} at ${data.timeRemaining}s`)
      this.handleTimerMilestone(data)
    })

    // ENHANCEMENT FIRST: Handle timer expiration with comprehensive end experience
    this.gameManager.on('timer_expired', (data: any) => {
      console.log('⏰ Timer expired - showing comprehensive end experience')
      this.showTimerExpiredExperience(data)
    })

    // MODULAR: Connect condition discoveries to Nurse Amy
    this.gameManager.on('pointsAwarded', (data: any) => {
      if (data.reason === 'condition_discovered' && data.metadata?.conditionId) {
        const gameState = this.gameManager?.getGameState()
        if (gameState && this.nurseAmyNudges) {
          this.nurseAmyNudges.triggerConditionFoundNudge(data.metadata.conditionId, gameState)
        }
      }
    })

    this.gameManager.on('gameStateUpdated', (gameState: GameState) => {
      if (this.diagnosticUI) {
        this.diagnosticUI.getUIManager()?.updateCaseInfo(gameState.patientCase);
        this.diagnosticUI.getUIManager()?.updatePatientInfo(gameState.patientCase);
      }
    });

    // Initialize MedicalServiceFacade (for AI-powered patient case generation)
    this.medicalService = new MedicalServiceFacade()

    // Tutorial facade
    this.tutorial = new TutorialFacade({
      audioManager: this.audioManager,
      xRayEffect: this.xRayEffect,
      scanFeedbackSystem: this.scanFeedbackSystem,
      diagnosticUI: this.diagnosticUI,
      onTutorialComplete: () => {
        // Check for tutorial completion achievement
        if (this.gameManager) {
          const gameState = this.gameManager.getGameState();
          this.gameManager.checkAchievements(gameState, {
            type: 'tutorial_complete'
          });
        }
        this.startGame();
      }
    })

    // Voice consultation manager - pass the diagnostic UI manager for AI integration
    this.voiceConsultation = new VoiceConsultationManager(this.diagnosticUI?.getUIManager())

    // Register with the AI panel after diagnostic UI is initialized
    if (this.diagnosticUI) {
      const aiPanel = this.diagnosticUI.getUIManager()?.getAIPanel()
      if (aiPanel) {
        this.voiceConsultation.registerWithAIpanel(aiPanel)
      }
    }

    // Always show tutorial on page load
    setTimeout(() => this.tutorial?.start(), 2000) // Start after model loads

    console.log('✨ Tutorial and Voice systems initialized')
  }

  // ENHANCEMENT: Economic system functionality moved to GameManager

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

  // AGGRESSIVE CONSOLIDATION: Use AI-powered case generation with progressive revelation
  private async generateAndIntroducePatientCase() {
    try {
      // ENHANCEMENT FIRST: Generate AI-powered case for authenticated users, fallback to static for others
      let medicalCase: any;
      const userStatus = this.medicalService?.getAccessManager?.()?.getUserStatus?.();

      if (userStatus?.isAuthenticated && userStatus?.currentTier === 'premium') {
        // Try to generate an AI-powered case for premium users
        try {
          medicalCase = await this.medicalService?.generateAICase?.(userStatus.preferredDifficulty || 'medium');
          console.log('🏥 Generated AI-powered patient case for premium user');
        } catch (aiError) {
          console.warn('AI case generation failed, falling back to static case:', aiError);
          medicalCase = this.medicalService?.getCase('case-x487');
        }
      } else {
        // Use static case for non-premium users
        medicalCase = this.medicalService?.getCase('case-x487');
      }

      if (medicalCase) {
        // Convert MedicalCase to PatientCase to fix type mismatch
        const patientCase: any = {
          ...medicalCase,
          patientName: medicalCase.patientInfo.patientName,
          age: medicalCase.patientInfo.age,
          gender: medicalCase.patientInfo.gender,
          chiefComplaint: medicalCase.patientInfo.chiefComplaint
        };

        // ENHANCEMENT: Initialize PatientState for real-time vitals monitoring
        const patientState = new PatientState(patientCase);

        // DRY: Update game state (single call updates everything)
        this.gameManager?.updateState({ patientCase, patientState })

        // MODULAR: Connect case timer to game timer
        const estimatedCaseLength = medicalCase.estimatedCaseLength || 300; // Default to 5 minutes
        this.gameManager?.updateTimeRemaining(estimatedCaseLength)
        console.log(`⏰ Case timer: ${estimatedCaseLength}s`)

        // CLEAN: Progressive revelation - only show revealed information
        this.updatePatientDisplay()

        // PERFORMANT: Immersive feedback with staggered notifications
        this.providePatientIntroductionFeedback(medicalCase)

        // ENHANCEMENT FIRST: Different feedback for AI-generated vs static cases
        if (medicalCase.aiGenerated) {
          this.audioManager?.showFeedback('🤖 AI-Generated Case: Each case is uniquely created for you!', 'info');
          this.audioManager?.playSound(SoundType.AI_CASE_INTRO);
        }

        console.log(`🏥 Case Loaded: ${medicalCase.patientInfo.patientName} (${medicalCase.patientInfo.age}yo ${medicalCase.patientInfo.gender})`)
      }
    } catch (error) {
      console.error('Case loading failed:', error)
      this.handleCaseGenerationFallback()
    }
  }

  // CLEAN: Separate method for patient display updates
  private updatePatientDisplay(): void {
    const gameState = this.gameManager?.getGameState();
    if (gameState?.patientCase) {
      this.diagnosticUI?.updatePatientInfo(gameState.patientCase);
    }
  }

  // CLEAN: Separate method for patient introduction feedback
  private providePatientIntroductionFeedback(patientCase: MedicalCase): void {
    this.audioManager?.showFeedback(
      `New patient: ${patientCase.patientInfo.patientName}, ${patientCase.patientInfo.age}yo ${patientCase.patientInfo.gender}`,
      'info'
    )
    this.audioManager?.playSound(SoundType.MEDICAL_BEEP)

    setTimeout(() => {
      this.audioManager?.showFeedback(
        `Chief complaint: ${patientCase.patientInfo.chiefComplaint}`,
        'info'
      )
      this.audioManager?.playSound(SoundType.HEARTBEAT_MONITOR)
    }, 2500)
  }

  // CLEAN: Separate method for fallback case handling
  private handleCaseGenerationFallback(): void {
    // Convert MedicalCase to PatientCase to fix type mismatch
    const medicalCase: any = {
      id: 'fallback-case',
      title: 'Emergency Patient',
      presentingComplaint: 'Urgent diagnostic evaluation required',
      patientStory: 'An emergency patient requiring immediate diagnostic evaluation.',
      initialFindings: 'Initial examination pending',
      mission: 'Perform urgent diagnostic evaluation',
      stakes: 'Patient requires immediate medical attention',
      patientInfo: {
        patientName: 'Emergency Patient',
        age: 38,
        gender: 'Unknown',
        chiefComplaint: 'Urgent diagnostic evaluation required'
      }
    };

    const fallbackPatient: any = {
      ...medicalCase,
      patientName: medicalCase.patientInfo.patientName,
      age: medicalCase.patientInfo.age,
      gender: medicalCase.patientInfo.gender,
      chiefComplaint: medicalCase.patientInfo.chiefComplaint
    };

    this.gameManager?.updateState({ patientCase: fallbackPatient })
    this.updatePatientDisplay()
    this.audioManager?.showFeedback('🏥 Emergency patient ready. AI diagnosis support limited.', 'warning')
  }

  // ENHANCED: Handle timer milestones with coordinated multi-panel responses
  private handleTimerMilestone(data: any): void {
    const milestone = data.milestone;
    const urgency = data.urgency;

    // Coordinate responses across all panels
    this.coordinateMilestoneResponses(data);

    // Audio response based on milestone
    if (data.audioCue) {
      this.playMilestoneAudio(data.audioCue, urgency);
    }

    // Visual effects coordination
    if (data.visualEffects) {
      this.applyVisualEffects(data.visualEffects, urgency);
    }

    // Update environmental context
    this.updateEnvironmentalContext(milestone, data.patientContext);
  }

  // Coordinate responses across all app panels
  private coordinateMilestoneResponses(data: any): void {
    const milestone = data.milestone;
    const actions = data.actions || [];

    // Diagnostic UI Panel responses
    if (this.diagnosticUI?.getUIManager()) {
      this.updateDiagnosticUIPanel(milestone, actions, data);
    }

    // AI Panel responses (Nurse Amy)
    if (this.aiPanel) {
      this.updateAIPanel(milestone, data);
    }

    // Canvas/3D visualization responses
    this.updateCanvasVisualization(milestone, data);

    // Tier Status responses
    this.updateTierStatus(milestone, data);
  }

  // Update diagnostic UI panel based on milestone
  private updateDiagnosticUIPanel(milestone: string, actions: string[], data: any): void {
    const uiManager = this.diagnosticUI?.getUIManager();
    if (!uiManager) return;

    // ENHANCEMENT: Auto-trigger Investigation Panel at 60 seconds
    if (milestone === 'diagnosis_preparation') {
      const investigationPanel = uiManager.getInvestigationPanel();
      if (investigationPanel) {
        investigationPanel.expand();
        investigationPanel.switchTab('diagnosis');
        this.audioManager?.showFeedback('📋 Investigation Panel opened - time to submit your diagnosis!', 'info');
      }
    }

    // Tool unlocking animations
    if (actions.includes('unlock_patient_interview')) {
      uiManager.unlockInvestigationTool('patient_interview');
    }
    if (actions.includes('unlock_lab_orders')) {
      uiManager.unlockInvestigationTool('lab_orders');
    }
    if (actions.includes('unlock_imaging')) {
      uiManager.unlockInvestigationTool('imaging');
    }
    if (actions.includes('unlock_nurse_consult')) {
      uiManager.unlockInvestigationTool('nurse_consult');
    }

    // Result displays
    if (actions.includes('show_lab_results')) {
      uiManager.displayInvestigationResults('lab', data.patientContext?.expected || []);
    }
    if (actions.includes('show_imaging_results')) {
      uiManager.displayInvestigationResults('imaging', data.patientContext?.findings || []);
    }

    // Progress updates
    uiManager.updateCaseProgress(milestone, data.gameState);
  }

  // Update AI panel with milestone context
  private updateAIPanel(milestone: string, data: any): void {
    if (!this.aiPanel) return;

    // Trigger contextual Nurse Amy responses
    this.aiPanel.addInsight({
      id: `milestone_${milestone}_${Date.now()}`,
      timestamp: Date.now(),
      content: this.generateMilestoneMessage(milestone, data),
      type: this.mapUrgencyToInsightType(data.urgency),
      confidence: 0.95
    });
  }

  // Update 3D canvas visualization
  private updateCanvasVisualization(milestone: string, data: any): void {
    switch (milestone) {
      case 'patient_arrival':
        // Subtle lighting adjustment for "patient arrival"
        this.adjustSceneLighting('arrival');
        break;
      case 'imaging_complete':
        // Spotlight effect on discovered conditions
        this.highlightDiscoveredConditions();
        break;
      case 'complication_alert':
        // Warning visual effects
        this.showComplicationIndicators();
        break;
      case 'emergency_escalation':
        // Crisis visual effects
        this.showEmergencyIndicators();
        break;
    }
  }

  // Update tier status panel
  private updateTierStatus(milestone: string, data: any): void {
    // Update usage counters, show premium prompts for certain milestones
    if (milestone === 'investigation_unlock' && !this.isPremiumUser()) {
      this.showPremiumPrompt('advanced_investigations');
    }
  }

  // Audio responses for milestones
  private playMilestoneAudio(audioCue: string, urgency: string): void {
    if (!this.audioManager) return;

    const soundMap: Record<string, any> = {
      'patient_arrival': 'MEDICAL_BEEP',
      'tool_unlock': 'DISCOVERY',
      'lab_results': 'MEDICAL_BEEP',
      'imaging_complete': 'CONDITION_FOUND',
      'consultation_alert': 'MEDIUM_SEVERITY',
      'complication_discovery': 'HIGH_SEVERITY',
      'decision_urgent': 'HIGH_SEVERITY',
      'evidence_ready': 'MEDICAL_BEEP',
      'diagnosis_urgent': 'HIGH_SEVERITY',
      'emergency_alert': 'HIGH_SEVERITY'
    };

    const soundType = soundMap[audioCue];
    if (soundType) {
      this.audioManager.playSound(soundType as any);
    }

    // Urgency-based feedback
    if (urgency === 'critical') {
      this.audioManager.showFeedback('⚠️ Critical milestone reached', 'warning');
    } else if (urgency === 'high') {
      this.audioManager.showFeedback('⏰ Important development', 'info');
    }
  }

  // Visual effects coordination
  private applyVisualEffects(effects: string[], urgency: string): void {
    effects.forEach(effect => {
      switch (effect) {
        case 'panel_highlight':
          this.highlightDiagnosticPanel();
          break;
        case 'tool_unlock_animation':
          this.animateToolUnlocks();
          break;
        case 'discovery_spotlight':
          this.showDiscoverySpotlight();
          break;
        case 'urgent_highlight':
          this.showUrgentHighlight(urgency);
          break;
        case 'warning_pulse':
          this.showWarningPulse();
          break;
        case 'emergency_pulse':
          this.showEmergencyPulse();
          break;
      }
    });
  }

  // Environmental context updates
  private updateEnvironmentalContext(milestone: string, patientContext: any): void {
    // Adjust hospital ambience based on milestone urgency
    switch (milestone) {
      case 'patient_arrival':
      case 'investigation_unlock':
        // Calm, professional environment
        this.audioManager?.startHospitalAmbience();
        break;
      case 'complication_alert':
      case 'emergency_escalation':
        // More urgent, active environment
        // Could increase ambience volume or add urgent sounds
        break;
    }

    // Update patient info displays with context
    if (patientContext && this.diagnosticUI) {
      this.diagnosticUI.updatePatientContext(patientContext);
    }
  }

  // Helper methods for milestone responses
  private generateMilestoneMessage(milestone: string, data: any): string {
    const patientName = data.patientContext?.greeting?.split(' ')[1] || 'the patient';

    const messages = {
      'patient_arrival': `👩‍⚕️ Nurse Amy: Dr. [Player], ${patientName} has arrived and is ready for assessment. ${data.patientContext?.concern || ''}`,
      'investigation_unlock': `👩‍⚕️ Nurse Amy: Investigation tools are now available. ${data.patientContext?.rationale || 'These will help clarify the diagnosis.'}`,
      'lab_results_ready': `👩‍⚕️ Nurse Amy: Laboratory results are ready. ${data.patientContext?.correlation || 'Please review the findings.'}`,
      'imaging_complete': `👩‍⚕️ Nurse Amy: Imaging study complete. ${data.patientContext?.clinical_impact || 'Key findings have been identified.'}`,
      'consultation_escalation': `👩‍⚕️ Nurse Amy: I recommend consulting with me now for additional insights about ${patientName}'s condition.`,
      'complication_alert': `👩‍⚕️ Nurse Amy: Additional findings suggest possible complications. This case may be more complex than initially thought.`,
      'decision_critical': `👩‍⚕️ Nurse Amy: Time for critical decisions. ${patientName} needs a working diagnosis and treatment plan.`,
      'evidence_synthesis': `👩‍⚕️ Nurse Amy: We're entering the evidence synthesis phase. All findings need to be correlated.`,
      'diagnosis_preparation': `👩‍⚕️ Nurse Amy: Final diagnosis preparation. ${patientName} and their family are waiting for answers.`,
      'emergency_escalation': `👩‍⚕️ Nurse Amy: Emergency escalation required! ${patientName}'s condition needs immediate attention.`
    };

    return messages[milestone as keyof typeof messages] || `👩‍⚕️ Nurse Amy: Important milestone reached: ${milestone}`;
  }

  private mapUrgencyToInsightType(urgency: string): 'diagnostic' | 'procedural' | 'educational' | 'urgent' | 'voice' {
    switch (urgency) {
      case 'critical': return 'urgent';
      case 'high': return 'urgent';
      case 'moderate': return 'voice';
      default: return 'voice';
    }
  }

  // Visual effect implementations
  private highlightDiagnosticPanel(): void {
    const panel = document.getElementById('diagnostic-panel');
    if (panel) {
      panel.style.animation = 'panelHighlight 1s ease-out';
      setTimeout(() => panel.style.animation = '', 1000);
    }
  }

  private animateToolUnlocks(): void {
    const tools = document.querySelectorAll('#investigation-tools-panel button');
    tools.forEach((tool, index) => {
      setTimeout(() => {
        (tool as HTMLElement).style.animation = 'toolUnlock 0.8s ease-out';
        setTimeout(() => (tool as HTMLElement).style.animation = '', 800);
      }, index * 200);
    });
  }

  private showDiscoverySpotlight(): void {
    // This would highlight discovered conditions in the 3D scene
    console.log('🎭 Discovery spotlight effect triggered');
  }

  private showUrgentHighlight(urgency: string): void {
    const color = urgency === 'critical' ? '#ff4444' : '#ffaa00';
    document.body.style.boxShadow = `inset 0 0 50px ${color}20`;
    setTimeout(() => document.body.style.boxShadow = '', 2000);
  }

  private showWarningPulse(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255, 170, 0, 0.1);
      pointer-events: none;
      animation: warningPulse 1s ease-out;
      z-index: 1000;
    `;
    document.body.appendChild(overlay);
    setTimeout(() => document.body.removeChild(overlay), 1000);
  }

  private showEmergencyPulse(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255, 68, 68, 0.2);
      pointer-events: none;
      animation: emergencyPulse 1.5s ease-out;
      z-index: 1000;
    `;
    document.body.appendChild(overlay);
    setTimeout(() => document.body.removeChild(overlay), 1500);
  }

  // Helper methods
  private adjustSceneLighting(mode: string): void {
    // Adjust Three.js scene lighting based on context
    console.log(`💡 Adjusting scene lighting for: ${mode}`);
  }

  private highlightDiscoveredConditions(): void {
    // Highlight discovered conditions in 3D scene
    console.log('🔍 Highlighting discovered conditions');
  }

  private showComplicationIndicators(): void {
    // Show visual indicators for complications
    console.log('⚠️ Showing complication indicators');
  }

  private showEmergencyIndicators(): void {
    // Show emergency visual indicators
    console.log('🚨 Showing emergency indicators');
  }

  private isPremiumUser(): boolean {
    const accessManager = this.medicalService?.getAccessManager?.();
    return accessManager?.getUserStatus?.()?.currentTier === 'premium' || false;
  }

  private showPremiumPrompt(feature: string): void {
    if (this.diagnosticUI?.getUIManager()) {
      this.diagnosticUI.getUIManager().showUpgradePrompt('feature_locked');
    }
  }

  // ENHANCEMENT FIRST: Comprehensive timer expired experience
  private showTimerExpiredExperience(data: any): void {
    // Stop audio and provide feedback
    this.audioManager?.showFeedback('⏰ Time\'s up! Great effort!', 'warning')
    this.audioManager?.playSound(SoundType.MEDIUM_SEVERITY)

    // Calculate final statistics
    const gameState = this.gameManager?.getGameState()
    if (!gameState) return

    const finalStats = {
      score: gameState.score,
      conditionsFound: gameState.discoveredConditions.size,
      timeElapsed: Math.floor((Date.now() - gameState.sessionStartTime) / 1000),
      accuracy: gameState.accuracy,
      efficiency: gameState.efficiency,
      patientCase: gameState.patientCase,
      difficulty: gameState.difficulty
    }

    // Show comprehensive end screen overlay
    this.showEndGameOverlay(finalStats)
  }

  // CLEAN: Dedicated method for end game overlay using existing design tokens
  private showEndGameOverlay(stats: any): void {

    const overlay = document.createElement('div')
    overlay.id = 'timer-expired-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: ${effects.blur.lg};
      z-index: ${zIndex.modal};
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    `

    // Get access manager for premium status
    const accessManager = this.medicalService?.getAccessManager?.()
    const userStatus = accessManager?.getUserStatus?.()
    const isPremium = userStatus?.currentTier === 'premium'

    overlay.innerHTML = `
      <div style="
        background: linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 40, 80, 0.95) 100%);
        border: ${borders.width.base} solid ${colors.border.primary};
        border-radius: ${borders.radius.xl};
        padding: ${spacing['3xl']};
        max-width: 600px;
        width: 90%;
        color: ${colors.neutral.white};
        font-family: ${typography.fontFamily.primary};
        box-shadow: ${effects.shadow.xl}, ${effects.shadow.primaryGlow};
        text-align: center;
        transform: scale(0.9);
        transition: transform 0.3s ease-out;
      ">
        <!-- Header -->
        <div style="margin-bottom: ${spacing.xl};">
          <div style="font-size: 4rem; margin-bottom: ${spacing.md};">⏰</div>
          <h1 style="
          color: ${colors.primary.base};
          margin: 0;
          font-size: ${typography.fontSize['4xl']};
          font-weight: ${typography.fontWeight.bold};
          text-shadow: ${effects.textShadow.base};
          ">⏰ Time's Up!</h1>
          <p style="
          margin: ${spacing.md} 0 0 0;
          opacity: 0.8;
          font-size: ${typography.fontSize.lg};
          ">Review your diagnostic performance.</p>
        </div>

        <!-- Stats Grid -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: ${spacing.md};
          margin-bottom: ${spacing.xl};
        ">
          <div style="
            background: rgba(0, 255, 136, 0.1);
            border: ${borders.width.thin} solid ${colors.border.primary};
            border-radius: ${borders.radius.lg};
            padding: ${spacing.md};
          ">
            <div style="
              font-size: ${typography.fontSize['3xl']};
              font-weight: ${typography.fontWeight.bold};
              color: ${colors.primary.base};
              text-shadow: ${effects.textShadow.sm};
            ">${stats.score}</div>
            <div style="font-size: ${typography.fontSize.sm}; opacity: 0.8;">Final Score</div>
          </div>

          <div style="
            background: rgba(0, 212, 255, 0.1);
            border: ${borders.width.thin} solid ${colors.border.info};
            border-radius: ${borders.radius.lg};
            padding: ${spacing.md};
          ">
            <div style="
              font-size: ${typography.fontSize['3xl']};
              font-weight: ${typography.fontWeight.bold};
              color: ${colors.info.base};
              text-shadow: ${effects.textShadow.sm};
            ">${stats.conditionsFound}</div>
            <div style="font-size: ${typography.fontSize.sm}; opacity: 0.8;">Conditions Found</div>
          </div>

          <div style="
            background: rgba(255, 170, 0, 0.1);
            border: ${borders.width.thin} solid ${colors.border.accent};
            border-radius: ${borders.radius.lg};
            padding: ${spacing.md};
          ">
            <div style="
              font-size: ${typography.fontSize['3xl']};
              font-weight: ${typography.fontWeight.bold};
              color: ${colors.accent.base};
              text-shadow: ${effects.textShadow.sm};
            ">${Math.floor(stats.timeElapsed / 60)}:${(stats.timeElapsed % 60).toString().padStart(2, '0')}</div>
            <div style="font-size: ${typography.fontSize.sm}; opacity: 0.8;">Time Used</div>
          </div>
        </div>

        <!-- Performance Feedback -->
        <div style="
          background: rgba(255, 255, 255, 0.05);
          border: ${borders.width.thin} solid rgba(255, 255, 255, 0.1);
          border-radius: ${borders.radius.lg};
          padding: ${spacing.lg};
          margin-bottom: ${spacing.xl};
          text-align: left;
        ">
          <h3 style="
          margin: 0 0 ${spacing.md} 0;
          color: ${colors.primary.base};
          font-size: ${typography.fontSize.lg};
          ">📊 Insights</h3>
          <div style="font-size: ${typography.fontSize.sm}; line-height: 1.6;">
          <div>🎯 Accuracy: ${Math.round(stats.accuracy * 100)}% ${stats.accuracy > 0.7 ? 'Excellent!' : 'Practice more'}</div>
          <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; margin: 4px 0;"><div style="background: ${colors.primary.base}; height: 100%; width: ${Math.round(stats.accuracy * 100)}%; border-radius: 4px;"></div></div>
          <div>⚡ Efficiency: ${Math.round(stats.efficiency * 100)}% ${stats.efficiency > 0.6 ? 'Great!' : 'Scan faster'}</div>
          <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; margin: 4px 0;"><div style="background: ${colors.primary.base}; height: 100%; width: ${Math.round(stats.efficiency * 100)}%; border-radius: 4px;"></div></div>
            <div>🛡️ Difficulty: ${stats.difficulty.charAt(0).toUpperCase() + stats.difficulty.slice(1)} ${stats.difficulty === 'hard' ? 'Impressive!' : stats.difficulty === 'medium' ? 'Solid!' : 'Building foundation'}</div>
            <div>🔍 Conditions: ${stats.conditionsFound} ${stats.conditionsFound > 2 ? 'Comprehensive!' : 'Explore more'}</div>
          </div>
        </div>
        <!-- Personalized Recommendations -->
        <div style="
          background: rgba(100, 100, 255, 0.1);
          border: ${borders.width.thin} solid rgba(100, 100, 255, 0.3);
          border-radius: ${borders.radius.lg};
          padding: ${spacing.lg};
          margin-bottom: ${spacing.xl};
          text-align: left;
        ">
          <h3 style="
          margin: 0 0 ${spacing.md} 0;
          color: #6464ff;
          font-size: ${typography.fontSize.lg};
          ">🎯 Tips</h3>
          <div style="font-size: ${typography.fontSize.sm}; line-height: 1.6;">
          ${stats.conditionsFound === 0 ?
        `<div>🔍 Focus on glowing markers</div>
          <div>🖱️ Use investigation tools</div>
          <div>🎙️ Press 'V' for Nurse Amy</div>` :
        stats.accuracy < 0.5 ?
          `<div>🖱️ Confirm with investigation tools</div>
          <div>🎙️ Consult Nurse Amy</div>
          <div>📋 Gather more evidence</div>` :
          stats.efficiency < 0.5 ?
            `<div>⏰ Prioritize high-prob areas</div>
          <div>⌨️ Use shortcuts [C], [V]</div>
          <div>🎙️ Get AI tips</div>` :
            `<div>🏆 Great work!</div>
          <div>📈 Try harder cases</div>
          <div>💎 Upgrade for more cases</div>`
      }
          </div>
        </div>
        <!-- Feature Discovery -->
        <div style="
          background: rgba(255, 100, 100, 0.1);
          border: ${borders.width.thin} solid rgba(255, 100, 100, 0.3);
          border-radius: ${borders.radius.lg};
          padding: ${spacing.lg};
          margin-bottom: ${spacing.xl};
          text-align: left;
        ">
          <h3 style="
          margin: 0 0 ${spacing.md} 0;
          color: #ff6464;
          font-size: ${typography.fontSize.lg};
          ">🌟 Missed Features</h3>
          <div style="font-size: ${typography.fontSize.sm}; line-height: 1.6;">
          <div>🖱️ Investigation Tools</div>
          <div>🎙️ Voice Consultation 'V'</div>
          <div>⌨️ Shortcuts [C], [E]</div>
          <div>📊 Progress Ring</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; flex-direction: column; gap: ${spacing.md};">
          <button id="restart-same-case" style="
            background: linear-gradient(135deg, ${colors.primary.base} 0%, ${colors.primary.dark} 100%);
            color: ${colors.neutral.black};
            border: none;
            padding: ${spacing.lg} ${spacing.xl};
            border-radius: ${borders.radius.lg};
            font-size: ${typography.fontSize.lg};
            font-weight: ${typography.fontWeight.bold};
            cursor: pointer;
            box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
            transition: all 0.3s ease;
            width: 100%;
          ">
            🔄 Practice This Case Again
          </button>

          ${!isPremium ? `
          <button id="upgrade-premium" style="
            background: linear-gradient(135deg, ${colors.info.base} 0%, ${colors.info.dark} 100%);
            color: ${colors.neutral.black};
            border: none;
            padding: ${spacing.lg} ${spacing.xl};
            border-radius: ${borders.radius.lg};
            font-size: ${typography.fontSize.lg};
            font-weight: ${typography.fontWeight.bold};
            cursor: pointer;
            box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
            transition: all 0.3s ease;
            width: 100%;
          ">
            💎 Upgrade to Premium - Unlimited AI Cases
          </button>
          ` : ''}

          <button id="close-end-overlay" style="
            background: rgba(255, 255, 255, 0.1);
            color: ${colors.neutral.white};
            border: ${borders.width.thin} solid rgba(255, 255, 255, 0.3);
            padding: ${spacing.md} ${spacing.xl};
            border-radius: ${borders.radius.lg};
            font-size: ${typography.fontSize.base};
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
          ">
            Close & Return to Menu
          </button>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    // Animate in
    setTimeout(() => {
      overlay.style.opacity = '1'
      const content = overlay.querySelector('div')
      if (content) content.style.transform = 'scale(1)'
    }, 100)

    // Add event listeners
    const restartBtn = overlay.querySelector('#restart-same-case') as HTMLElement
    const upgradeBtn = overlay.querySelector('#upgrade-premium') as HTMLElement
    const closeBtn = overlay.querySelector('#close-end-overlay') as HTMLElement

    restartBtn?.addEventListener('click', () => {
      this.closeEndOverlay()
      this.restartWithSameCase()
    })

    upgradeBtn?.addEventListener('click', () => {
      this.showPremiumUpgradePrompt()
    })

    closeBtn?.addEventListener('click', () => {
      this.closeEndOverlay()
    })
  }

  // MODULAR: Restart with same case functionality
  private restartWithSameCase(): void {
    console.log('🔄 Restarting with same case')

    // Reset game state but keep the same patient case
    const currentCase = this.gameManager?.getGameState()?.patientCase
    if (currentCase) {
      this.gameManager?.resetGameState()

      // Reapply the same case
      this.gameManager?.updateState({ patientCase: currentCase })

      // Restart the game
      this.startGame()

      this.audioManager?.showFeedback('🔄 Same case restarted - Good luck!', 'info')
    }
  }

  // CLEAN: Show premium upgrade prompt using existing system
  private showPremiumUpgradePrompt(): void {
    const accessManager = this.medicalService?.getAccessManager?.()
    if (accessManager && this.diagnosticUI) {
      this.diagnosticUI.getUIManager()?.showUpgradePrompt('ai_access')
    }
  }

  // UTILITY: Close end overlay
  private closeEndOverlay(): void {
    const overlay = document.getElementById('timer-expired-overlay')
    if (overlay) {
      overlay.style.opacity = '0'
      setTimeout(() => {
        if (overlay.parentElement) {
          overlay.parentElement.removeChild(overlay)
        }
      }, 500)
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
        case 'v':
          // ENHANCEMENT FIRST: Trigger voice consultation
          this.startVoiceConsultation()
          this.audioManager?.showFeedback('🎙️ Voice consultation activated')
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

  // Method to get the diagnostic UI manager for React integration
  public getDiagnosticUIManager() {
    return this.diagnosticUI?.getUIManager() || null;
  }

  // Method to get the game manager for React integration
  public getGameManager() {
    return this.gameManager || null;
  }

  // Method to get the current game phase
  public getCurrentGamePhase() {
    return this.gameManager?.getGameState()?.phase || null;
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
    // ENHANCEMENT: EconomicBridge functionality moved to GameManager
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
