import * as THREE from "three"
import LeePerry from "./lee-perry"
import Skeleton from "./skeleton"
import { createDiagnosticUI, type DiagnosticUI } from "../domains/diagnostic/diagnostic-ui"
import { MEDICAL_CONDITIONS } from "../domains/medical/medical-data"
import { EffectComposer, ShaderPass } from "three/examples/jsm/Addons.js"
import { XRayShader } from "../shaders/XRayShader"
import xRayFragment from "../shaders/x-ray-fragment.glsl"
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js"
import { Position } from "../types/types"
import gsap from "gsap"

const rtParams = {
  format: THREE.RGBAFormat,
  //type: THREE.UnsignedByteType, // Instead of FloatType
  type: THREE.HalfFloatType, // Instead of FloatType
  // Optimize texture filtering
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
}

interface Props {
  scene: THREE.Scene
  composer: EffectComposer
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
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
  medicalMarkers: Map<string, THREE.Mesh> = new Map()
  diagnosticUI: DiagnosticUI
  mouse: {
    current: Position
    target: Position
  }
  expanded: boolean = false
  // Add scale property for X-ray effect scaling
  scale: number = 1.0

  constructor({ scene, composer, renderer, camera }: Props) {
    this.scene = scene
    this.composer = composer
    this.renderer = renderer
    this.camera = camera
    this.mouse = {
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
    }
    this.createRenderTargets()
    this.setupPostprocessing()
    this.createLeePerry()
    this.createSkeleton()
    this.initializeMedicalMarkers()
    this.diagnosticUI = createDiagnosticUI({
      onStartDiagnosis: (conditionId: any) => console.log('🎯 Starting diagnosis for:', conditionId),
      onCaseSelection: (caseId: any) => console.log('📋 Case selected:', caseId)
    })

    window.addEventListener("keypress", (event) => {
      this.onPressKey(event)
    })
  }

  createRenderTargets() {
    // Use original implementation to avoid distortion
    const sizes = {
      width:
        window.innerWidth * Math.ceil(Math.min(2, window.devicePixelRatio)),
      height:
        window.innerHeight * Math.ceil(Math.min(2, window.devicePixelRatio)),
    }

    this.renderTargetA = new THREE.WebGLRenderTarget(
      sizes.width,
      sizes.height,
      rtParams
    )
  }

  onMouseMove(position: Position) {
    this.mouse.target = position
  }

  setupPostprocessing() {
    //@ts-ignore
    XRayShader.uniforms.tDiffuse1 = new THREE.Uniform(new THREE.Vector4())
    //@ts-ignore
    XRayShader.uniforms.uMouse = new THREE.Uniform(new THREE.Vector2())
    //@ts-ignore
    XRayShader.uniforms.uViewportRes = new THREE.Uniform(
      new THREE.Vector2(window.innerWidth, window.innerHeight)
    )
    //@ts-ignore
    XRayShader.uniforms.expand = new THREE.Uniform(0)

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
    this.xRayPass.uniforms.uViewportRes = new THREE.Uniform(
      new THREE.Vector2(window.innerWidth, window.innerHeight)
    )
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
    // DRY: Use single source of truth from medical-data
    Object.values(MEDICAL_CONDITIONS).forEach(condition => {
      this.createConditionMarker(condition)
    })
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

    this.renderer.setRenderTarget(null)
  }

  // CLEAN: Streamlined medical marker system
  createConditionMarker(condition: any) {
    const colors = { low: '#44ff88', medium: '#ffaa44', high: '#ff4444' }
    const geometry = new THREE.SphereGeometry(0.05, 16, 16)
    const material = new THREE.MeshBasicMaterial({
      color: colors[condition.severity as keyof typeof colors] || colors.medium,
      opacity: 0.0,
      transparent: true
    })
    
    const marker = new THREE.Mesh(geometry, material)
    marker.position.set(condition.position.x, condition.position.y, condition.position.z)
    marker.userData = { conditionId: condition.id }
    
    this.medicalMarkers.set(condition.id, marker)
    this.scene.add(marker)
  }

  toggleConditions() {
    const firstMarker = Array.from(this.medicalMarkers.values())[0]
    const material = Array.isArray(firstMarker?.material) ? firstMarker?.material[0] : firstMarker?.material
    const visible = (material as any)?.opacity === 0
    
    this.medicalMarkers.forEach(marker => {
      if (marker.material instanceof THREE.MeshBasicMaterial) {
        marker.material.opacity = visible ? 0.4 : 0
      }
    })
  }

  // MODULAR: Clean interaction handlers
  handleMedicalConditionHover(intersects: THREE.Intersection[]) {
    const medicalIntersect = intersects.find(i => 
      Array.from(this.medicalMarkers.values()).includes(i.object as THREE.Mesh)
    )
    
    document.body.style.cursor = medicalIntersect ? 'pointer' : 'default'
  }

  handleMedicalConditionClick(intersects: THREE.Intersection[]) {
    const medicalIntersect = intersects.find(i => 
      Array.from(this.medicalMarkers.values()).includes(i.object as THREE.Mesh)
    )
    
    if (medicalIntersect) {
      const conditionId = (medicalIntersect.object as THREE.Mesh).userData.conditionId
      this.discoverCondition(conditionId)
    }
  }

  // ORGANIZED: Single method for condition discovery
  discoverCondition(conditionId: string) {
    const condition = this.diagnosticUI.discoverCondition(conditionId)
    if (condition) {
      console.log(`🔍 Discovered: ${condition.name}`)
    }
  }

  // Add method to set the X-ray effect scale (0.3 to 2.0)
  setScale(scale: number) {
    // Clamp the scale between 0.3 and 2.0 as per project specifications
    this.scale = Math.max(0.3, Math.min(2.0, scale));
    console.log('🔍 X-ray effect scale updated:', this.scale);
  }

  // CLEAN: Old Llama methods removed - now handled by DiagnosticUI
}