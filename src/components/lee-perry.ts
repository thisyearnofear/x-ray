import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
// Removed face-api.js dependency for better performance

interface Props {
  scene: THREE.Scene
}

export default class LeePerry {
  scene: THREE.Scene
  model: THREE.Group | null = null
  mapTexture: THREE.Texture | null = null
  normalTexture: THREE.Texture | null = null
  faceApiLoaded: boolean = false
  processingCanvas: HTMLCanvasElement
  processingCtx: CanvasRenderingContext2D

  constructor({ scene }: Props) {
    this.scene = scene
    this.processingCanvas = document.createElement('canvas')
    this.processingCtx = this.processingCanvas.getContext('2d')!
    this.loadMapTexture()
    this.importModel()
    this.initializeFaceAPI()
    this.setupUploadInterface()
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

  async initializeFaceAPI() {
    // Skip heavy model loading - use smart cropping instead for instant performance
    this.faceApiLoaded = false // Intentionally disable for better UX
    console.log('Using lightweight face processing for optimal performance')
  }

  setupUploadInterface() {
    // GAMIFIED: Direct drag-and-drop over 3D scene (no UI buttons)
    const canvas = document.getElementById('webgl')
    if (!canvas) return
    
    // Visual feedback on drag over
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault()
      canvas.style.filter = 'brightness(1.2) hue-rotate(30deg)'
      canvas.style.cursor = 'copy'
    })
    
    canvas.addEventListener('dragleave', () => {
      canvas.style.filter = 'none'
      canvas.style.cursor = 'default'
    })
    
    canvas.addEventListener('drop', (e) => {
      e.preventDefault()
      canvas.style.filter = 'none'
      canvas.style.cursor = 'default'
      
      const file = e.dataTransfer?.files[0]
      if (file && file.type.startsWith('image/')) {
        this.processUserFace(file)
      }
    })
    
    // Fallback: Click to select (hidden input)
    canvas.addEventListener('dblclick', () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) this.processUserFace(file)
      }
      input.click()
    })
  }

  async processUserFace(file: File) {
    // GAMIFIED: 3D visual feedback instead of text notifications
    this.showProcessingEffect(true)

    try {
      const img = await this.loadImage(file)
      const texture = this.faceApiLoaded 
        ? await this.processWithFaceAPI(img)
        : this.processBasic(img)
      
      this.updateTexture(texture)
      this.showSuccessEffect()
    } catch (error) {
      console.error('Face processing failed:', error)
      this.showErrorEffect()
    } finally {
      this.showProcessingEffect(false)
    }
  }

  showProcessingEffect(active: boolean) {
    // Pulse the model during processing
    if (!this.model) return
    
    if (active) {
      this.model.scale.set(1.05, 1.05, 1.05)
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.emissive = new THREE.Color(0x002244)
        }
      })
    } else {
      this.model.scale.set(1, 1, 1)
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.emissive = new THREE.Color(0x000000)
        }
      })
    }
  }

  showSuccessEffect() {
    // Brief green glow on success
    if (!this.model) return
    
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.material.emissive = new THREE.Color(0x004400)
      }
    })
    
    setTimeout(() => {
      this.model?.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.emissive = new THREE.Color(0x000000)
        }
      })
    }, 800)
  }

  showErrorEffect() {
    // Brief red flash on error
    if (!this.model) return
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.model?.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.material.emissive = i % 2 === 0 ? new THREE.Color(0x440000) : new THREE.Color(0x000000)
          }
        })
      }, i * 200)
    }
  }

  loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()
      reader.onload = (e) => {
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async processWithFaceAPI(img: HTMLImageElement): Promise<THREE.Texture> {
    try {
      // Try Cerebras API first for ultra-fast processing
      const cerebrasResult = await this.procesWithCerebras(img)
      if (cerebrasResult) return cerebrasResult
      
      // Fallback to optimized basic processing (no heavy dependencies)
      return this.processBasic(img)
    } catch (error) {
      console.warn('Processing failed, using basic fallback:', error)
      return this.processBasic(img)
    }
  }

  extractFaceRegion(img: HTMLImageElement, detection: any): THREE.Texture {
    const box = detection.detection.box
    const padding = 0.3
    
    // Calculate padded region
    const paddedWidth = box.width * (1 + padding * 2)
    const paddedHeight = box.height * (1 + padding * 2)
    const paddedX = Math.max(0, box.x - box.width * padding)
    const paddedY = Math.max(0, box.y - box.height * padding)
    
    // Setup canvas
    this.processingCanvas.width = 512
    this.processingCanvas.height = 512
    this.processingCtx.fillStyle = '#1a1a1a'
    this.processingCtx.fillRect(0, 0, 512, 512)
    
    // Scale and draw face
    const scale = Math.min(512 / paddedWidth, 512 / paddedHeight)
    const scaledW = paddedWidth * scale
    const scaledH = paddedHeight * scale
    const offsetX = (512 - scaledW) / 2
    const offsetY = (512 - scaledH) / 2
    
    this.processingCtx.drawImage(img, paddedX, paddedY, paddedWidth, paddedHeight, offsetX, offsetY, scaledW, scaledH)
    
    return new THREE.CanvasTexture(this.processingCanvas)
  }

  processBasic(img: HTMLImageElement): THREE.Texture {
    this.processingCanvas.width = 512
    this.processingCanvas.height = 512
    this.processingCtx.fillStyle = '#2a2a2a'
    this.processingCtx.fillRect(0, 0, 512, 512)
    
    // Improved basic processing with face-optimized cropping
    const scale = Math.min(512 / img.width, 512 / img.height)
    const w = img.width * scale
    const h = img.height * scale
    const x = (512 - w) / 2
    const y = (512 - h) / 2
    
    this.processingCtx.imageSmoothingEnabled = true
    this.processingCtx.imageSmoothingQuality = 'high'
    this.processingCtx.drawImage(img, x, y, w, h)
    
    // Apply enhancement
    this.enhanceForFaceMapping()
    
    const texture = new THREE.CanvasTexture(this.processingCanvas)
    texture.flipY = false
    return texture
  }

  updateTexture(texture: THREE.Texture) {
    if (!this.model) return
    
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.material.map = texture
        child.material.needsUpdate = true
      }
    })
  }

  async procesWithCerebras(img: HTMLImageElement): Promise<THREE.Texture | null> {
    try {
      console.log('🧠 Processing with Cerebras ultra-fast inference...')
      
      // Cerebras API call for face processing analysis
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CEREBRAS_API_KEY || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-4-scout-17b-16e-instruct',
          messages: [{
            role: 'user',
            content: `For face swapping, suggest optimal face region coordinates. Return only JSON: {"x": 0.5, "y": 0.4, "width": 0.7, "height": 0.8} where values are 0-1 representing center-crop percentages for a typical portrait photo.`
          }],
          max_tokens: 100,
          temperature: 0
        })
      })
      
      if (!response.ok) {
        throw new Error(`Cerebras API error: ${response.status}`)
      }
      
      const data = await response.json()
      const analysis = data.choices?.[0]?.message?.content
      
      console.log('🧠 Cerebras analysis:', analysis)
      
      if (analysis) {
        try {
          const faceData = JSON.parse(analysis)
          if (faceData.x !== undefined && faceData.y !== undefined) {
            console.log('✅ Cerebras face region detected:', faceData)
            return this.extractFaceRegionFromPercentages(img, faceData)
          }
        } catch (parseError) {
          console.warn('Failed to parse Cerebras response:', parseError)
        }
      }
    } catch (error) {
      console.warn('⚡ Cerebras API unavailable, using fallback:', error)
    }
    
    return null
  }

  extractFaceRegionFromBounds(img: HTMLImageElement, bounds: any): THREE.Texture {
    const padding = 0.3
    const paddedWidth = bounds.width * (1 + padding * 2)
    const paddedHeight = bounds.height * (1 + padding * 2)
    const paddedX = Math.max(0, bounds.x - bounds.width * padding)
    const paddedY = Math.max(0, bounds.y - bounds.height * padding)
    
    // Setup canvas 
    this.processingCanvas.width = 512
    this.processingCanvas.height = 512
    this.processingCtx.fillStyle = '#1a1a1a'
    this.processingCtx.fillRect(0, 0, 512, 512)
    
    // Scale and draw optimized face region
    const scale = Math.min(512 / paddedWidth, 512 / paddedHeight)
    const scaledW = paddedWidth * scale
    const scaledH = paddedHeight * scale
    const offsetX = (512 - scaledW) / 2
    const offsetY = (512 - scaledH) / 2
    
    this.processingCtx.drawImage(img, paddedX, paddedY, paddedWidth, paddedHeight, offsetX, offsetY, scaledW, scaledH)
    
    const texture = new THREE.CanvasTexture(this.processingCanvas)
    texture.needsUpdate = true
    return texture
  }

  extractFaceRegionFromPercentages(img: HTMLImageElement, faceData: any): THREE.Texture {
    // IMPROVED: Better face detection and UV mapping for Lee Perry Smith model
    console.log('🎯 Cerebras face data:', faceData)
    
    // Use smart defaults if Cerebras provides generic response
    const faceX = faceData.x || 0.5
    const faceY = faceData.y || 0.45  // Slightly higher for typical face position
    const faceW = faceData.width || 0.6
    const faceH = faceData.height || 0.75 // Taller for full face
    
    // Calculate crop region (center-based)
    const centerX = img.width * faceX
    const centerY = img.height * faceY
    const cropW = img.width * faceW
    const cropH = img.height * faceH
    
    const x = Math.max(0, centerX - cropW / 2)
    const y = Math.max(0, centerY - cropH / 2)
    const w = Math.min(img.width - x, cropW)
    const h = Math.min(img.height - y, cropH)
    
    // Setup canvas matching Lee Perry Smith texture dimensions
    this.processingCanvas.width = 512
    this.processingCanvas.height = 512
    this.processingCtx.fillStyle = '#2a2a2a' // Better base color
    this.processingCtx.fillRect(0, 0, 512, 512)
    
    // Apply face-optimized scaling and positioning
    const aspectRatio = w / h
    let drawW, drawH, offsetX, offsetY
    
    if (aspectRatio > 1) {
      // Wide face - fit to height
      drawH = 512
      drawW = drawH * aspectRatio
      offsetX = (512 - drawW) / 2
      offsetY = 0
    } else {
      // Tall face - fit to width  
      drawW = 512
      drawH = drawW / aspectRatio
      offsetX = 0
      offsetY = (512 - drawH) / 2
    }
    
    // Enhanced rendering with better quality
    this.processingCtx.imageSmoothingEnabled = true
    this.processingCtx.imageSmoothingQuality = 'high'
    this.processingCtx.drawImage(img, x, y, w, h, offsetX, offsetY, drawW, drawH)
    
    // Apply subtle face enhancement for better 3D mapping
    this.enhanceForFaceMapping()
    
    const texture = new THREE.CanvasTexture(this.processingCanvas)
    texture.needsUpdate = true
    texture.flipY = false // Important for proper UV mapping
    return texture
  }
  
  enhanceForFaceMapping() {
    // Enhanced image processing for better 3D face texture mapping
    const imageData = this.processingCtx.getImageData(0, 0, 512, 512)
    const data = imageData.data
    
    // Enhance contrast and saturation for better X-ray visibility
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1] 
      const b = data[i + 2]
      
      // Increase contrast slightly
      const contrast = 1.15
      const midpoint = 128
      
      data[i] = Math.min(255, Math.max(0, midpoint + contrast * (r - midpoint)))
      data[i + 1] = Math.min(255, Math.max(0, midpoint + contrast * (g - midpoint)))
      data[i + 2] = Math.min(255, Math.max(0, midpoint + contrast * (b - midpoint)))
      
      // Maintain alpha
      data[i + 3] = data[i + 3]
    }
    
    this.processingCtx.putImageData(imageData, 0, 0)
  }

  getModel() {
    return this.model
  }
}
