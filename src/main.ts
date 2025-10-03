import './style.css'
import Canvas from './canvas'
import { DiagnosticUI } from './domains/diagnostic/diagnostic-ui'
import { startCacheCleanup } from './utils/performance-cache'

// PERFORMANT: Initialize cache cleanup system
startCacheCleanup()

// CLEAN: Initialize both 3D canvas and diagnostic UI
class App {
  canvas: Canvas
  diagnosticUI: DiagnosticUI

  constructor() {
    // Initialize 3D scene first
    this.canvas = new Canvas()
    
    // Then initialize diagnostic UI overlay
    this.diagnosticUI = new DiagnosticUI()
    
    this.render()
  }

  render() {
    this.canvas.render()
    requestAnimationFrame(this.render.bind(this))
  }

  destroy() {
    this.diagnosticUI.destroy()
    // Canvas cleanup would go here if needed
  }
}

const app = new App()

// CLEAN: Cleanup on page unload
window.addEventListener('beforeunload', () => {
  app.destroy()
})
