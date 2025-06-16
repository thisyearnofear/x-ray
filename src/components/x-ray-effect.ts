import * as THREE from "three"
import LeePerry from "./lee-perry"
import Skeleton from "./skeleton"
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
  mouse: {
    current: Position
    target: Position
  }
  expanded: boolean = false

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

    window.addEventListener("keypress", (event) => {
      this.onPressKey(event)
    })
  }

  createRenderTargets() {
    const sizes = {
      width:
        window.innerWidth * Math.ceil(Math.min(2, window.devicePixelRatio)),
      //window.innerWidth,
      height:
        window.innerHeight * Math.ceil(Math.min(2, window.devicePixelRatio)),
      //window.innerHeight,
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
    if (event.key === "e" || event.key === "E") {
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

    //this.renderer.setClearColor(0x000000, 0) // Set clear color to transparent

    this.skeletonModel.rotation.y += 0.005
    this.leePerryModel.rotation.y += 0.005

    this.renderer.setRenderTarget(null)
  }
}
