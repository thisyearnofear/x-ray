// PREMIUM: Instructions panel with holographic aesthetic

export class InstructionsPanel {
  private panel!: HTMLElement

  constructor() {
    this.createPanel()
  }

  private createPanel(): void {
    this.panel = document.createElement('div')
    this.panel.className = 'instructions-panel'
    this.panel.innerHTML = `
      <div class="instructions-content">
        <div class="instruction-group">
          <kbd class="key">1</kbd>
          <span class="instruction-icon">🔬</span>
          <span class="instruction-text">Scan patients</span>
        </div>
        
        <div class="instruction-divider"></div>
        
        <div class="instruction-group">
          <kbd class="key">3</kbd>
          <span class="instruction-text">expand</span>
        </div>
        
        <div class="instruction-group">
          <kbd class="key">4</kbd>
          <span class="instruction-text">conditions</span>
        </div>
        
        <div class="instruction-divider"></div>
        
        <div class="instruction-group">
          <span class="instruction-icon">💰</span>
          <span class="instruction-text">Earned: <span id="earnings-amount">0</span> / <span id="potential-bonus">1.45</span> MON</span>
        </div>
        
        <div class="instruction-group">
          <span class="instruction-icon">🏥</span>
          <span class="instruction-text">Budget: <span id="budget-spent">0</span> / <span id="budget-amount">0.5</span> MON</span>
        </div>
        
        <div class="instruction-divider"></div>
        
        <div class="instruction-group" id="start-new-case-btn">
          <kbd class="key">12</kbd>
          <span class="instruction-icon">🎮</span>
          <span class="instruction-text">Start New Case</span>
        </div>
        
        <div class="instruction-group" id="medical-actions-btn">
          <kbd class="key">13</kbd>
          <span class="instruction-icon">🏥</span>
          <span class="instruction-text">Medical Actions</span>
        </div>
        
        <div class="instruction-divider"></div>
        
        <div class="instruction-group">
          <span class="instruction-icon">👆</span>
          <span class="instruction-text">Click glowing markers to scan</span>
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

  // Method to update earnings display
  updateEarnings(earnings: number, potential: number): void {
    const earningsElement = this.panel.querySelector('#earnings-amount');
    const potentialElement = this.panel.querySelector('#potential-bonus');
    if (earningsElement) earningsElement.textContent = earnings.toFixed(2);
    if (potentialElement) potentialElement.textContent = potential.toFixed(2);
  }

  // Method to update budget display (with spent vs total)
  updateBudget(current: number, total: number): void {
    const budgetSpentElement = this.panel.querySelector('#budget-spent');
    const budgetAmountElement = this.panel.querySelector('#budget-amount');
    const spent = total - current; // Calculate how much has been spent
    if (budgetSpentElement) budgetSpentElement.textContent = spent.toFixed(2);
    if (budgetAmountElement) budgetAmountElement.textContent = total.toFixed(2);
  }

  // Method to add event listeners for new case and medical actions
  addControlHandlers(startNewCaseHandler: () => void, medicalActionsHandler: () => void): void {
    const startNewCaseBtn = this.panel.querySelector('#start-new-case-btn') as HTMLElement | null;
    const medicalActionsBtn = this.panel.querySelector('#medical-actions-btn') as HTMLElement | null;
    
    if (startNewCaseBtn) {
      startNewCaseBtn.addEventListener('click', startNewCaseHandler);
      startNewCaseBtn.style.cursor = 'pointer';
      // Add visual feedback on hover
      startNewCaseBtn.addEventListener('mouseenter', () => {
        startNewCaseBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        startNewCaseBtn.style.borderRadius = '4px';
      });
      startNewCaseBtn.addEventListener('mouseleave', () => {
        startNewCaseBtn.style.background = '';
      });
    }
    
    if (medicalActionsBtn) {
      medicalActionsBtn.addEventListener('click', medicalActionsHandler);
      medicalActionsBtn.style.cursor = 'pointer';
      // Add visual feedback on hover
      medicalActionsBtn.addEventListener('mouseenter', () => {
        medicalActionsBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        medicalActionsBtn.style.borderRadius = '4px';
      });
      medicalActionsBtn.addEventListener('mouseleave', () => {
        medicalActionsBtn.style.background = '';
      });
    }
  }

  destroy(): void {
    this.panel.remove()
  }
}