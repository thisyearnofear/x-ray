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

  constructor() {
    this.element = document.getElementById("webgl") as HTMLCanvasElement
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
    this.createXRayEffect()
    this.createLights()
    this.createAudioManager()
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
  }

  createPostProcessing() {
    this.composer = new EffectComposer(this.renderer)
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)
  }

  onMouseMove(event: MouseEvent) {
    // Store normalized device coordinates for raycasting
    const ndcX = (event.clientX / window.innerWidth) * 2 - 1
    const ndcY = -(event.clientY / window.innerHeight) * 2 + 1

    // Store 0-1 range coordinates for XRayEffect
    // Shader expects (0,0) at bottom-left and (1,1) at top-right
    // So we invert Y: screen Y (0 at top) -> shader Y (1 at top)
    const xRayX = event.clientX / window.innerWidth
    const xRayY = 1 - event.clientY / window.innerHeight

    // Pass 0-1 range coordinates to XRayEffect
    this.xRayEffect?.onMouseMove({
      x: xRayX,
      y: xRayY,
    })

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
    window.addEventListener("mousemove", this.onMouseMove.bind(this))
    window.addEventListener("click", this.onMouseClick.bind(this))
    window.addEventListener("resize", this.onResize.bind(this))
  }

  onMouseClick(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.camera)

    const intersects = this.raycaster.intersectObjects(this.scene.children)
    this.xRayEffect?.handleMedicalConditionClick(intersects)
  }

  onResize() {
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
    })
  }

  render() {
    this.time = this.clock.getElapsedTime()

    this.orbitControls.update()

    this.xRayEffect?.render()

    this.composer.render()
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
          console.log('🔍 X-ray scale changed:', scale)
          if (this.xRayEffect) {
            this.xRayEffect.setScale(scale)
          }
        },
        onToggleConditions: () => {
          console.log('🔍 Toggle conditions requested')
          if (this.xRayEffect) {
            this.xRayEffect.toggleConditions()
          }
        }
      }
    )

    // Create mobile camera for face upload
    this.mobileCamera = new MobileCamera({
      onImageCaptured: (imageData: string, faceDetection: any) => {
        console.log('📸 Face image captured:', { faceDetection })
      },
      onFaceDetected: (detection: any) => {
        console.log('Face detected:', detection)
      },
      onError: (error: string) => {
        console.error('📷 Camera error:', error)
      },
      onPermissionGranted: () => {
        console.log('📷 Camera permission granted')
      }
    })
  }
}