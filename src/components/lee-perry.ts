import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

interface Props {
  scene: THREE.Scene
}

export default class LeePerry {
  scene: THREE.Scene
  model: THREE.Group | null = null
  mapTexture: THREE.Texture | null = null
  normalTexture: THREE.Texture | null = null

  constructor({ scene }: Props) {
    this.scene = scene
    this.loadMapTexture()
    this.importModel()
  }

  importModel() {
    const loader = new GLTFLoader()
    loader.load("/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
      console.log("Model loaded:", gltf)

      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material.map === null) {
          child.material = new THREE.MeshStandardMaterial({
            map: this.mapTexture,
            normalMap: this.normalTexture,
            //transparent: true,
          })
        }
      })

      this.scene.add(gltf.scene)
      this.model = gltf.scene
    })
  }

  loadMapTexture() {
    const loader = new THREE.TextureLoader()
    this.mapTexture = loader.load("/LeePerrySmith/color.jpg")
    this.normalTexture = loader.load("/LeePerrySmith/normal.jpg")
  }

  getModel() {
    return this.model
  }
}
