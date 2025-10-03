// PREMIUM: X-ray controls with holographic aesthetic

import * as THREE from 'three'

interface ViewportConfig {
  minScale: number
  maxScale: number
  defaultScale: number
}

interface ViewportState {
  currentScale: number
  conditionsVisible: boolean
}

export class XRayControls {
  private config: ViewportConfig
  private state: ViewportState
  private element: HTMLCanvasElement
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controlsPanel: HTMLElement
  private callbacks: {
    onScaleChange?: (scale: number) => void
    onToggleConditions?: () => void
  }

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    callbacks: {
      onScaleChange?: (scale: number) => void
      onToggleConditions?: () => void
    } = {}
  ) {
    this.element = canvas
    this.camera = camera
    this.renderer = renderer
    this.callbacks = callbacks

    this.config = {
      minScale: 0.3,
      maxScale: 2.0,
      defaultScale: 1.0
    }

    this.state = {
      currentScale: 1.0,
      conditionsVisible: false
    }

    this.createControls()
    console.log('🔍 X-ray controls initialized')
  }

  private createControls(): void {
    this.controlsPanel = document.createElement('div')
    this.controlsPanel.id = 'xray-controls'
    this.controlsPanel.className = 'premium-controls-panel'
    this.controlsPanel.innerHTML = `
      <svg style="position: absolute; width: 0; height: 0;">
        <defs>
          <linearGradient id="control-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00ff88;stop-opacity:0.8" />
            <stop offset="50%" style="stop-color:#00cc6a;stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:#009955;stop-opacity:0.8" />
          </linearGradient>
        </defs>
      </svg>
      
      <div class="control-section">
        <div class="control-label">X-RAY INTENSITY</div>
        <div class="scale-control">
          <button class="scale-btn" id="scale-down">−</button>
          <div class="scale-display">
            <div class="scale-bar">
              <div class="scale-fill" id="scale-fill"></div>
            </div>
            <span class="scale-value" id="scale-value">100%</span>
          </div>
          <button class="scale-btn" id="scale-up">+</button>
        </div>
      </div>
      
      <div class="control-divider"></div>
      
      <div class="control-section">
        <button class="toggle-btn" id="conditions-toggle">
          <span class="btn-icon">🔍</span>
          <span class="btn-text">SCAN CONDITIONS</span>
        </button>
      </div>
    `
    
    this.controlsPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 280px;
      padding: 16px;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      color: #fff;
      z-index: 999;
      border-radius: 12px;
      transform: translateX(10px) scale(0.95);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    `

    document.body.appendChild(this.controlsPanel)
    
    // PREMIUM: Staggered entrance animation
    requestAnimationFrame(() => {
      this.controlsPanel.style.transform = 'translateX(0) scale(1)'
      this.controlsPanel.style.opacity = '0.9'
    })
    
    this.attachEventListeners()
  }

  private attachEventListeners(): void {
    const scaleDown = this.controlsPanel.querySelector('#scale-down') as HTMLButtonElement
    const scaleUp = this.controlsPanel.querySelector('#scale-up') as HTMLButtonElement
    const conditionsToggle = this.controlsPanel.querySelector('#conditions-toggle') as HTMLButtonElement
    
    scaleDown?.addEventListener('click', () => this.adjustScale(-0.1))
    scaleUp?.addEventListener('click', () => this.adjustScale(0.1))
    conditionsToggle?.addEventListener('click', () => this.toggleConditions())
    
    // PREMIUM: Hover effects for enhanced interactivity
    this.controlsPanel.addEventListener('mouseenter', () => {
      this.controlsPanel.style.opacity = '1'
    })
    
    this.controlsPanel.addEventListener('mouseleave', () => {
      this.controlsPanel.style.opacity = '0.9'
    })
  }

  private adjustScale(delta: number): void {
    const newScale = Math.max(this.config.minScale, 
                             Math.min(this.config.maxScale, 
                                     this.state.currentScale + delta))
    
    if (newScale !== this.state.currentScale) {
      this.state.currentScale = newScale
      this.updateScaleDisplay()
      this.callbacks.onScaleChange?.(newScale)
    }
  }

  private updateScaleDisplay(): void {
    const scaleValue = this.controlsPanel.querySelector('#scale-value') as HTMLElement
    const scaleFill = this.controlsPanel.querySelector('#scale-fill') as HTMLElement
    
    const percentage = Math.round(this.state.currentScale * 100)
    scaleValue.textContent = `${percentage}%`
    
    const fillPercentage = ((this.state.currentScale - this.config.minScale) / 
                           (this.config.maxScale - this.config.minScale)) * 100
    scaleFill.style.width = `${fillPercentage}%`
  }

  private toggleConditions(): void {
    this.state.conditionsVisible = !this.state.conditionsVisible
    const toggleBtn = this.controlsPanel.querySelector('#conditions-toggle') as HTMLElement
    
    if (this.state.conditionsVisible) {
      toggleBtn.classList.add('active')
      toggleBtn.querySelector('.btn-text')!.textContent = 'HIDE CONDITIONS'
    } else {
      toggleBtn.classList.remove('active')
      toggleBtn.querySelector('.btn-text')!.textContent = 'SCAN CONDITIONS'
    }
    
    this.callbacks.onToggleConditions?.()
  }

  // CLEAN: Public methods for external control
  public setScale(scale: number): void {
    this.state.currentScale = Math.max(this.config.minScale, 
                                      Math.min(this.config.maxScale, scale))
    this.updateScaleDisplay()
  }

  public getScale(): number {
    return this.state.currentScale
  }

  public destroy(): void {
    this.controlsPanel.remove()
  }
}
