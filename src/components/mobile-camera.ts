// MOBILE: Advanced mobile camera integration with face upload optimization

interface CameraConfig {
  preferredWidth: number
  preferredHeight: number
  quality: number
  facingMode: 'user' | 'environment'
  maxFileSize: number
  acceptedTypes: string[]
}

interface CameraState {
  isActive: boolean
  hasPermission: boolean
  currentStream: MediaStream | null
  capturedImage: string | null
  faceDetected: boolean
  isMobile: boolean
  deviceSupport: {
    getUserMedia: boolean
    deviceMotion: boolean
    touchEvents: boolean
    webGL: boolean
  }
}

interface FaceDetectionResult {
  detected: boolean
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  landmarks?: Array<{ x: number; y: number }>
}

export class MobileCamera {
  private config: CameraConfig
  private state: CameraState
  private videoElement: HTMLVideoElement
  private canvasElement: HTMLCanvasElement
  private containerElement: HTMLElement
  private controlsContainer: HTMLElement
  private ctx: CanvasRenderingContext2D
  private animationFrame: number = 0
  private faceDetectionWorker: Worker | null = null
  
  private callbacks: {
    onImageCaptured?: (imageData: string, faceDetection: FaceDetectionResult) => void
    onFaceDetected?: (detection: FaceDetectionResult) => void
    onError?: (error: string) => void
    onPermissionGranted?: () => void
  }

  constructor(callbacks: {
    onImageCaptured?: (imageData: string, faceDetection: FaceDetectionResult) => void
    onFaceDetected?: (detection: FaceDetectionResult) => void
    onError?: (error: string) => void
    onPermissionGranted?: () => void
  } = {}) {
    this.callbacks = callbacks

    this.config = {
      preferredWidth: window.innerWidth < 768 ? 480 : 640,
      preferredHeight: window.innerWidth < 768 ? 640 : 480,
      quality: window.innerWidth < 768 ? 0.8 : 0.9,
      facingMode: 'user',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
    }

    this.initializeState()
    this.createInterface()
    this.setupFaceDetection()
    
    console.log('📷 Mobile camera initialized', this.state)
  }

  private initializeState(): void {
    this.state = {
      isActive: false,
      hasPermission: false,
      currentStream: null,
      capturedImage: null,
      faceDetected: false,
      isMobile: window.innerWidth < 768,
      deviceSupport: {
        getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        deviceMotion: 'DeviceMotionEvent' in window,
        touchEvents: 'ontouchstart' in window,
        webGL: this.checkWebGLSupport()
      }
    }
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (e) {
      return false
    }
  }

  private createInterface(): void {
    // Main container
    this.containerElement = document.createElement('div')
    this.containerElement.id = 'mobile-camera-container'
    this.containerElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      color: #00ff88;
      font-family: 'Roboto', monospace;
    `

    // Video element for camera preview
    this.videoElement = document.createElement('video')
    this.videoElement.style.cssText = `
      width: ${this.state.isMobile ? '90vw' : '60vw'};
      max-width: 500px;
      height: auto;
      border-radius: 12px;
      border: 2px solid rgba(0, 255, 136, 0.3);
      background: #000;
      transform: scaleX(-1); /* Mirror effect for selfie camera */
    `
    this.videoElement.autoplay = true
    this.videoElement.playsInline = true
    this.videoElement.muted = true

    // Canvas for image capture and processing
    this.canvasElement = document.createElement('canvas')
    this.canvasElement.style.display = 'none'
    this.ctx = this.canvasElement.getContext('2d')!

    // Face detection overlay
    const overlayCanvas = document.createElement('canvas')
    overlayCanvas.id = 'face-overlay'
    overlayCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      border-radius: 12px;
    `

    // Video container with overlay
    const videoContainer = document.createElement('div')
    videoContainer.style.cssText = `
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    `
    videoContainer.appendChild(this.videoElement)
    videoContainer.appendChild(overlayCanvas)

    // Controls container
    this.createCameraControls()

    // Status indicator
    const statusIndicator = this.createStatusIndicator()

    // File upload alternative
    const uploadArea = this.createUploadArea()

    this.containerElement.appendChild(statusIndicator)
    this.containerElement.appendChild(videoContainer)
    this.containerElement.appendChild(this.controlsContainer)
    this.containerElement.appendChild(uploadArea)
    this.containerElement.appendChild(this.canvasElement)

    document.body.appendChild(this.containerElement)

    // Setup overlay canvas context
    const overlayCtx = overlayCanvas.getContext('2d')!
    this.setupOverlayCanvas(overlayCanvas, overlayCtx)
  }

  private createCameraControls(): void {
    this.controlsContainer = document.createElement('div')
    this.controlsContainer.style.cssText = `
      display: flex;
      gap: ${this.state.isMobile ? '20px' : '15px'};
      align-items: center;
      margin-bottom: 30px;
    `

    // Capture button
    const captureBtn = this.createControlButton('📸', 'Capture Photo', () => {
      this.captureImage()
    })
    captureBtn.style.cssText += `
      background: rgba(0, 255, 136, 0.2);
      border: 2px solid #00ff88;
      font-size: ${this.state.isMobile ? '24px' : '20px'};
      padding: ${this.state.isMobile ? '15px 20px' : '12px 16px'};
    `

    // Switch camera button (if mobile)
    const switchBtn = this.createControlButton('🔄', 'Switch Camera', () => {
      this.switchCamera()
    })

    // Close button
    const closeBtn = this.createControlButton('✕', 'Close Camera', () => {
      this.hide()
    })
    closeBtn.style.backgroundColor = 'rgba(255, 100, 100, 0.2)'
    closeBtn.style.borderColor = '#ff6464'
    closeBtn.style.color = '#ff6464'

    this.controlsContainer.appendChild(closeBtn)
    if (this.state.isMobile) {
      this.controlsContainer.appendChild(switchBtn)
    }
    this.controlsContainer.appendChild(captureBtn)
  }

  private createControlButton(text: string, title: string, onclick: () => void): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.title = title
    btn.onclick = onclick
    btn.style.cssText = `
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid rgba(0, 255, 136, 0.3);
      color: #00ff88;
      padding: ${this.state.isMobile ? '12px 16px' : '10px 14px'};
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: ${this.state.isMobile ? '16px' : '14px'};
      min-width: ${this.state.isMobile ? '50px' : '40px'};
      user-select: none;
    `

    // Touch-friendly interactions
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault()
      btn.style.transform = 'scale(0.95)'
      btn.style.background = 'rgba(0, 255, 136, 0.3)'
    })

    btn.addEventListener('touchend', () => {
      btn.style.transform = 'scale(1)'
      btn.style.background = 'rgba(0, 255, 136, 0.1)'
    })

    return btn
  }

  private createStatusIndicator(): HTMLElement {
    const indicator = document.createElement('div')
    indicator.id = 'camera-status'
    indicator.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(0, 255, 136, 0.4);
      border-radius: 20px;
      font-size: 12px;
      backdrop-filter: blur(10px);
    `
    indicator.textContent = 'Initializing camera...'
    return indicator
  }

  private createUploadArea(): HTMLElement {
    const uploadArea = document.createElement('div')
    uploadArea.style.cssText = `
      margin-top: 20px;
      padding: 20px;
      border: 2px dashed rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
    `

    const uploadText = document.createElement('p')
    uploadText.textContent = 'Or drag & drop an image here'
    uploadText.style.cssText = `
      margin: 0 0 10px 0;
      font-size: ${this.state.isMobile ? '14px' : '12px'};
      opacity: 0.8;
    `

    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = this.config.acceptedTypes.join(',')
    fileInput.style.display = 'none'
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        this.processUploadedFile(file)
      }
    }

    uploadArea.appendChild(uploadText)
    uploadArea.appendChild(fileInput)

    uploadArea.onclick = () => fileInput.click()

    // Drag and drop handlers
    uploadArea.ondragover = (e) => {
      e.preventDefault()
      uploadArea.style.borderColor = '#00ff88'
      uploadArea.style.background = 'rgba(0, 255, 136, 0.05)'
    }

    uploadArea.ondragleave = () => {
      uploadArea.style.borderColor = 'rgba(0, 255, 136, 0.3)'
      uploadArea.style.background = 'transparent'
    }

    uploadArea.ondrop = (e) => {
      e.preventDefault()
      uploadArea.style.borderColor = 'rgba(0, 255, 136, 0.3)'
      uploadArea.style.background = 'transparent'
      
      const file = e.dataTransfer?.files[0]
      if (file) {
        this.processUploadedFile(file)
      }
    }

    return uploadArea
  }

  private setupOverlayCanvas(overlayCanvas: HTMLCanvasElement, overlayCtx: CanvasRenderingContext2D): void {
    const updateOverlay = () => {
      if (!this.state.isActive || !this.videoElement.videoWidth) return

      overlayCanvas.width = this.videoElement.videoWidth
      overlayCanvas.height = this.videoElement.videoHeight
      overlayCanvas.style.width = this.videoElement.style.width
      overlayCanvas.style.height = this.videoElement.style.height

      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)

      // Draw face detection guide
      if (this.state.faceDetected) {
        overlayCtx.strokeStyle = '#00ff88'
        overlayCtx.lineWidth = 2
        overlayCtx.setLineDash([5, 5])
        
        // Draw center guide for optimal positioning
        const centerX = overlayCanvas.width / 2
        const centerY = overlayCanvas.height / 2
        const guideSize = Math.min(overlayCanvas.width, overlayCanvas.height) * 0.3
        
        overlayCtx.strokeRect(
          centerX - guideSize / 2,
          centerY - guideSize / 2,
          guideSize,
          guideSize
        )
        
        overlayCtx.setLineDash([])
      }

      if (this.state.isActive) {
        this.animationFrame = requestAnimationFrame(updateOverlay)
      }
    }

    updateOverlay()
  }

  private setupFaceDetection(): void {
    // Simple face detection using basic image processing
    // In production, you'd use face-api.js or TensorFlow.js
    if (this.state.deviceSupport.webGL) {
      try {
        // Create a simple face detection worker
        const workerCode = `
          self.onmessage = function(e) {
            const { imageData, width, height } = e.data;
            
            // Simple face detection algorithm
            // This is a placeholder - use proper face detection library
            const faceDetected = Math.random() > 0.3; // Simulate detection
            const confidence = faceDetected ? 0.7 + Math.random() * 0.3 : 0;
            
            self.postMessage({
              detected: faceDetected,
              confidence: confidence,
              boundingBox: faceDetected ? {
                x: width * 0.3,
                y: height * 0.2,
                width: width * 0.4,
                height: height * 0.5
              } : null
            });
          };
        `
        
        const blob = new Blob([workerCode], { type: 'application/javascript' })
        this.faceDetectionWorker = new Worker(URL.createObjectURL(blob))
        
        this.faceDetectionWorker.onmessage = (e) => {
          const result: FaceDetectionResult = e.data
          this.state.faceDetected = result.detected
          this.callbacks.onFaceDetected?.(result)
          this.updateStatusIndicator(result.detected)
        }
      } catch (error) {
        console.warn('Face detection worker failed to initialize:', error)
      }
    }
  }

  private updateStatusIndicator(faceDetected: boolean): void {
    const indicator = document.getElementById('camera-status')
    if (indicator) {
      if (faceDetected) {
        indicator.textContent = '✓ Face detected - Ready to capture'
        indicator.style.borderColor = '#00ff88'
        indicator.style.color = '#00ffaa'
      } else {
        indicator.textContent = '👤 Position your face in the frame'
        indicator.style.borderColor = 'rgba(0, 255, 136, 0.4)'
        indicator.style.color = '#00ff88'
      }
    }
  }

  public async show(): Promise<void> {
    this.containerElement.style.display = 'flex'
    
    if (!this.state.deviceSupport.getUserMedia) {
      this.callbacks.onError?.('Camera not supported on this device')
      return
    }

    try {
      await this.requestCameraPermission()
      await this.startCamera()
    } catch (error) {
      this.callbacks.onError?.(`Camera access failed: ${error}`)
    }
  }

  public hide(): void {
    this.containerElement.style.display = 'none'
    this.stopCamera()
  }

  private async requestCameraPermission(): Promise<void> {
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: this.config.preferredWidth },
        height: { ideal: this.config.preferredHeight },
        facingMode: this.config.facingMode
      },
      audio: false
    }

    try {
      this.state.currentStream = await navigator.mediaDevices.getUserMedia(constraints)
      this.state.hasPermission = true
      this.callbacks.onPermissionGranted?.()
      
      console.log('📷 Camera permission granted')
    } catch (error) {
      throw new Error(`Permission denied: ${error}`)
    }
  }

  private async startCamera(): Promise<void> {
    if (!this.state.currentStream) return

    this.videoElement.srcObject = this.state.currentStream
    this.state.isActive = true

    this.videoElement.onloadedmetadata = () => {
      this.canvasElement.width = this.videoElement.videoWidth
      this.canvasElement.height = this.videoElement.videoHeight
      
      // Start face detection
      this.startFaceDetection()
    }
  }

  private startFaceDetection(): void {
    if (!this.faceDetectionWorker || !this.state.isActive) return

    const detectFaces = () => {
      if (!this.state.isActive || this.videoElement.readyState !== 4) return

      // Capture frame for face detection
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height)
      const imageData = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height)

      // Send to worker for processing
      this.faceDetectionWorker!.postMessage({
        imageData: imageData.data,
        width: this.canvasElement.width,
        height: this.canvasElement.height
      })

      // Check again in 200ms
      if (this.state.isActive) {
        setTimeout(detectFaces, 200)
      }
    }

    detectFaces()
  }

  private stopCamera(): void {
    this.state.isActive = false
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }

    if (this.state.currentStream) {
      this.state.currentStream.getTracks().forEach(track => track.stop())
      this.state.currentStream = null
    }

    this.videoElement.srcObject = null
  }

  private async switchCamera(): Promise<void> {
    if (!this.state.isMobile) return

    this.stopCamera()
    
    // Toggle facing mode
    this.config.facingMode = this.config.facingMode === 'user' ? 'environment' : 'user'
    
    try {
      await this.requestCameraPermission()
      await this.startCamera()
    } catch (error) {
      this.callbacks.onError?.(`Failed to switch camera: ${error}`)
    }
  }

  private captureImage(): void {
    if (!this.state.isActive || !this.videoElement.videoWidth) return

    // Draw current video frame to canvas
    this.ctx.save()
    
    // Mirror the image if using front camera
    if (this.config.facingMode === 'user') {
      this.ctx.scale(-1, 1)
      this.ctx.drawImage(this.videoElement, -this.canvasElement.width, 0, this.canvasElement.width, this.canvasElement.height)
    } else {
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height)
    }
    
    this.ctx.restore()

    // Get image data
    const imageData = this.canvasElement.toDataURL('image/jpeg', this.config.quality)
    this.state.capturedImage = imageData

    // Simple face detection on captured image
    const faceDetection: FaceDetectionResult = {
      detected: this.state.faceDetected,
      confidence: this.state.faceDetected ? 0.8 : 0.2,
      boundingBox: this.state.faceDetected ? {
        x: this.canvasElement.width * 0.3,
        y: this.canvasElement.height * 0.2,
        width: this.canvasElement.width * 0.4,
        height: this.canvasElement.height * 0.5
      } : undefined
    }

    this.callbacks.onImageCaptured?.(imageData, faceDetection)
    
    // Add haptic feedback on mobile
    if (this.state.isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }

    console.log('📸 Image captured', { faceDetected: this.state.faceDetected })
  }

  private async processUploadedFile(file: File): Promise<void> {
    if (file.size > this.config.maxFileSize) {
      this.callbacks.onError?.('File too large. Please choose a smaller image.')
      return
    }

    if (!this.config.acceptedTypes.includes(file.type)) {
      this.callbacks.onError?.('Unsupported file type. Please use JPEG, PNG, or WebP.')
      return
    }

    try {
      const imageData = await this.fileToDataURL(file)
      
      // Simple face detection placeholder for uploaded images
      const faceDetection: FaceDetectionResult = {
        detected: true, // Assume uploaded images have faces
        confidence: 0.7
      }

      this.callbacks.onImageCaptured?.(imageData, faceDetection)
      
      console.log('📁 File uploaded successfully')
    } catch (error) {
      this.callbacks.onError?.(`Failed to process uploaded file: ${error}`)
    }
  }

  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Public API
  public getState(): CameraState {
    return { ...this.state }
  }

  public getCapturedImage(): string | null {
    return this.state.capturedImage
  }

  public isMobileDevice(): boolean {
    return this.state.isMobile
  }

  public hasDeviceSupport(): boolean {
    return this.state.deviceSupport.getUserMedia && this.state.deviceSupport.webGL
  }

  public destroy(): void {
    this.stopCamera()
    
    if (this.faceDetectionWorker) {
      this.faceDetectionWorker.terminate()
    }

    this.containerElement.remove()
  }
}