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
    console.log('🦴 Loading skeleton model...');
    const loader = new GLTFLoader()
    loader.load(
      "/skeleton/skeleton.glb",
      (gltf) => {
        console.log('✅ Skeleton model loaded successfully');
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
        gltf.scene.scale.set(5, 5, 5) // Restore original large scale
        gltf.scene.translateY(-0.25)  // Restore original positioning
        gltf.scene.translateZ(-0.15)
        gltf.scene.translateX(-0.1)
        this.model = gltf.scene
        console.log('🦴 Skeleton added to scene at position:', gltf.scene.position);
        console.log('🦴 Skeleton scale:', gltf.scene.scale);
      },
      (progress) => {
        // Avoid Infinity% when total is 0 or undefined
        const pct = progress.total ? (progress.loaded / progress.total) * 100 : 0;
        console.log('🦴 Loading progress:', isFinite(pct) ? pct + '%' : '0%');
      },
      (error) => {
        console.error('❌ Error loading skeleton:', error);
      }
    )
  }

  getModel() {
    return this.model
  }
}
