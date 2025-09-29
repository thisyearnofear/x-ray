// X-RAY CONTROLS: UI controls for adjusting X-ray effect scale

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
      minScale: 0.3, // Minimum X-ray scale (30%)
      maxScale: 2.0,  // Maximum X-ray scale (200%)
      defaultScale: 1.0 // Default X-ray scale (100%)
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
    this.controlsPanel.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 16px;
      color: #00ff88;
      font-family: 'Roboto', monospace;
      font-size: 11px;
      backdrop-filter: blur(8px);
      z-index: 1000;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    `

    // Add hover effect to make controls more visible when needed
    this.controlsPanel.addEventListener('mouseenter', () => {
      this.controlsPanel.style.opacity = '1'
    })
    
    this.controlsPanel.addEventListener('mouseleave', () => {
      this.controlsPanel.style.opacity = '0.7'
    })

    // Condition toggle button
    const conditionToggleBtn = this.createControlButton('C', 'Toggle Conditions', () => {
      this.toggleConditions()
    })
    
    this.controlsPanel.appendChild(conditionToggleBtn)

    // Scale controls
    this.createScaleControls()
    
    document.body.appendChild(this.controlsPanel)
  }

  private createScaleControls(): void {
    // X-ray effect decrease button
    const decreaseBtn = this.createControlButton('−', 'Smaller X-ray', () => {
      this.adjustSize(-0.1)
    })
    
    // Scale display
    const scaleDisplay = document.createElement('span')
    scaleDisplay.id = 'scale-display'
    scaleDisplay.style.cssText = `
      min-width: 50px;
      text-align: center;
      font-weight: 500;
      color: #00ffaa;
    `
    scaleDisplay.textContent = `${Math.round(this.state.currentScale * 100)}%`

    // X-ray effect increase button  
    const increaseBtn = this.createControlButton('+', 'Larger X-ray', () => {
      this.adjustSize(0.1)
    })

    this.controlsPanel.appendChild(decreaseBtn)
    this.controlsPanel.appendChild(scaleDisplay)
    this.controlsPanel.appendChild(increaseBtn)
  }

  private createControlButton(text: string, title: string, onclick: () => void): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.title = title
    btn.onclick = onclick
    btn.style.cssText = `
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid rgba(0, 255, 136, 0.2);
      color: #00ff88;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: inherit;
      min-width: 24px;
      user-select: none;
    `

    // Hover states
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(0, 255, 136, 0.2)'
      btn.style.borderColor = 'rgba(0, 255, 136, 0.4)'
      btn.style.color = '#00ffaa'
    })

    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(0, 255, 136, 0.1)'
      btn.style.borderColor = 'rgba(0, 255, 136, 0.2)'
      btn.style.color = '#00ff88'
    })

    return btn
  }

  public toggleConditions(): void {
    this.state.conditionsVisible = !this.state.conditionsVisible
    this.callbacks.onToggleConditions?.()
  }

  public adjustSize(delta: number): void {
    const newScale = Math.max(
      this.config.minScale,
      Math.min(this.config.maxScale, this.state.currentScale + delta)
    )
    this.setSize(newScale)
  }

  public setSize(size: number): void {
    const clampedScale = Math.max(
      this.config.minScale,
      Math.min(this.config.maxScale, size)
    )
    
    this.state.currentScale = clampedScale
    
    // Update scale display
    const scaleDisplay = document.getElementById('scale-display')
    if (scaleDisplay) {
      scaleDisplay.textContent = `${Math.round(clampedScale * 100)}%`
    }

    // Notify X-ray effect of scale change
    this.callbacks.onScaleChange?.(clampedScale)
  }

  public destroy(): void {
    this.controlsPanel.remove()
  }
}