// PREMIUM: Instructions panel with holographic aesthetic

export class InstructionsPanel {
  private panel: HTMLElement

  constructor() {
    this.createPanel()
  }

  private createPanel(): void {
    this.panel = document.createElement('div')
    this.panel.className = 'instructions-panel'
    this.panel.innerHTML = `
      <div class="instructions-content">
        <div class="instruction-group">
          <span class="instruction-icon">🔬</span>
          <span class="instruction-text">Scan patients</span>
        </div>
        
        <div class="instruction-divider"></div>
        
        <div class="instruction-group">
          <kbd class="key">E</kbd>
          <span class="instruction-text">expand</span>
        </div>
        
        <div class="instruction-group">
          <kbd class="key">C</kbd>
          <span class="instruction-text">conditions</span>
        </div>
        
        <div class="instruction-divider"></div>
        
        <div class="instruction-group">
          <kbd class="key">1</kbd>
          <span class="instruction-text">head</span>
        </div>
        
        <div class="instruction-group">
          <kbd class="key">2</kbd>
          <span class="instruction-text">torso</span>
        </div>
        
        <div class="instruction-group">
          <kbd class="key">3</kbd>
          <span class="instruction-text">full body</span>
        </div>
        
        <div class="instruction-divider"></div>
        
        <div class="instruction-group">
          <span class="instruction-icon">👆</span>
          <span class="instruction-text">Click markers to diagnose</span>
        </div>
      </div>
    `
    
    this.panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 1000;
    `
    
    document.body.appendChild(this.panel)
    
    // PREMIUM: Staggered entrance animation
    requestAnimationFrame(() => {
      this.panel.style.transform = 'translateX(-50%) translateY(0)'
      this.panel.style.opacity = '0.9'
    })
  }

  destroy(): void {
    this.panel.remove()
  }
}
