import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

interface Props {
  scene: THREE.Scene
}

export default class Skeleton {
  scene: THREE.Scene
  model: THREE.Group | null = null

  constructor({ scene }: Props) {
    this.scene = scene
    this.importModel()
  }

  importModel() {
    const loader = new GLTFLoader()
    loader.load("/skeleton/skeleton.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.opacity = 0.8 // Adjust opacity if necessary
          child.material.depthWrite = false
          child.material.transparent = true
          child.material.blending = THREE.CustomBlending
          child.material.blendEquation = THREE.MaxEquation
          child.material.blendSrc = THREE.SrcAlphaFactor
          child.material.blendDst = THREE.OneMinusSrcAlphaFactor
        }
      })

      this.scene.add(gltf.scene)
      gltf.scene.scale.set(5, 5, 5) // Adjust scale if necessary
      gltf.scene.translateY(-0.25)
      gltf.scene.translateZ(-0.15)
      gltf.scene.translateX(-0.1)
      this.model = gltf.scene
    })
  }

  getModel() {
    return this.model
  }
}
