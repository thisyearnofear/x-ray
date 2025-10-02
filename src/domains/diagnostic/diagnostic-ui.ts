// MODULAR: Diagnostic UI with clear separation from 3D rendering logic

import { DiagnosticSession, type SessionState, type DiagnosticAnswer } from './diagnostic-session'
import type { PatientCase, MedicalCondition, DiagnosticQuestion } from '../medical/medical-data'
import { PATIENT_CASES, MEDICAL_CONDITIONS } from '../medical/medical-data'
import { CerebrasService } from '../medical/cerebras-service'

// CLEAN: UI-specific interfaces separate from domain logic
interface UICallbacks {
  onStartDiagnosis?: (conditionId: string) => void
  onCaseSelection?: (caseId: string) => void
  onModelSwitch?: (modelType: 'head' | 'torso' | 'fullbody') => void
}

// ENHANCEMENT: Progressive discovery and gamification features
interface DiscoveryProgress {
  conditionId: string
  scanProgress: number
  isRevealed: boolean
  discoveryTime: number
}

export class DiagnosticUI {
  private container: HTMLElement
  private session: DiagnosticSession
  private callbacks: UICallbacks

  // ENHANCEMENT: Anatomical filtering and progressive discovery
  private currentModel: 'head' | 'torso' | 'fullbody' = 'head'
  private visibleAnatomy: string[] = ['head', 'neck', 'cervical_spine', 'jaw', 'face']
  private discoveryProgress: Map<string, DiscoveryProgress> = new Map()
  private achievements: Set<string> = new Set()
  private streakCount: number = 0

  // DYNAMIC: AI-powered case generation
  private cerebrasService: CerebrasService
  private generatedCases: Map<string, any> = new Map()
  private isGeneratingCase: boolean = false

  // GAMIFICATION: Enhanced user experience
  private userLevel: number = 1
  private experiencePoints: number = 0
  private caseHistory: Array<{ id: string, score: number, timestamp: number }> = []

  constructor(callbacks: UICallbacks = {}) {
    this.callbacks = callbacks
    this.cerebrasService = new CerebrasService()
    this.session = new DiagnosticSession({
      onStateChange: this.handleStateChange.bind(this),
      onQuestionAnswered: this.handleQuestionAnswered.bind(this),
      onCaseCompleted: this.handleCaseCompleted.bind(this)
    })

    this.container = this.createContainer()
    this.setupStyles()
    document.body.appendChild(this.container)

    // Show the case selection screen by default
    this.renderCaseSelection()
  }

  // PERFORMANT: Minimal DOM creation
  private createContainer(): HTMLElement {
    const container = document.createElement('div')
    container.id = 'diagnostic-ui'
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: rgba(0, 15, 25, 0.95);
      border-right: 2px solid #00ccdd;
      font-family: 'Roboto', sans-serif;
      color: #00ccdd;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(12px);
      box-shadow: 0 0 30px rgba(0, 204, 221, 0.2);
      z-index: 1000;
      transition: all 0.3s ease;
    `
    return container
  }

  // DRY: Centralized styling
  private setupStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .diagnostic-header {
        padding: 15px;
        background: linear-gradient(135deg, #001520 0%, #002030 100%);
        border-bottom: 1px solid #00ccdd;
        border-radius: 6px 6px 0 0;
      }
      
      .diagnostic-content {
        padding: 15px;
        flex: 1;
        overflow-y: auto;
      }
      
      .patient-info {
        background: rgba(0, 204, 221, 0.1);
        border: 1px solid #00ccdd;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 15px;
      }
      
      .diagnostic-question {
        background: rgba(0, 100, 120, 0.2);
        border: 1px solid #006680;
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 15px;
      }
      
      .question-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
      }
      
      .option-button {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid #00ccdd;
        color: #00ccdd;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
      }
      
      .option-button:hover {
        background: rgba(0, 204, 221, 0.2);
        transform: translateX(5px);
      }
      
      .option-button:active {
        transform: scale(0.98);
      }
      
      .hint-section {
        border-top: 1px solid rgba(0, 204, 221, 0.3);
        padding-top: 12px;
        margin-top: 12px;
      }
      
      .hint-button {
        background: rgba(255, 165, 0, 0.2);
        border: 1px solid #ffa500;
        color: #ffa500;
        padding: 6px 12px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
        margin-right: 8px;
        margin-bottom: 6px;
        display: inline-block;
      }
      
      .progress-bar {
        height: 4px;
        background: rgba(0, 204, 221, 0.3);
        border-radius: 2px;
        margin: 10px 0;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ccdd, #00ffaa);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
      
      .case-selector {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
      }
      
      .case-card {
        background: rgba(0, 204, 221, 0.1);
        border: 1px solid #00ccdd;
        border-radius: 6px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .case-card:hover {
        background: rgba(0, 204, 221, 0.2);
        transform: translateY(-2px);
      }
      
      .difficulty-indicator {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        margin-left: 8px;
      }
      
      .diff-1 { background: #44ff88; color: #000; }
      .diff-2 { background: #ffaa44; color: #000; }
      .diff-3 { background: #ff4444; color: #fff; }
      .diff-4 { background: #aa44ff; color: #fff; }
      .diff-5 { background: #ff44aa; color: #fff; }
      
      /* ENHANCEMENT: Gamification and discovery styles */
      .model-selector {
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(0, 204, 221, 0.1);
        border-radius: 6px;
      }
      
      .model-button {
        flex: 1;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid #00ccdd;
        color: #00ccdd;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 11px;
        text-align: center;
      }
      
      .model-button.active {
        background: rgba(0, 204, 221, 0.3);
        border-color: #00ffaa;
        color: #00ffaa;
      }
      
      .model-button:hover {
        background: rgba(0, 204, 221, 0.2);
      }

      .model-button.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: rgba(0, 0, 0, 0.2);
        color: #666;
        border-color: #666;
      }

      .model-button.disabled:hover {
        background: rgba(0, 0, 0, 0.2);
      }
      
      .discovery-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
        animation: pulse 2s infinite;
      }
      
      .discovery-scanning { background: #ffaa44; }
      .discovery-revealed { background: #00ffaa; }
      .discovery-hidden { background: rgba(255, 255, 255, 0.3); }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .achievement-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #00ffaa, #00ccdd);
        color: #000;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        animation-fill-mode: forwards;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }

      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }

      .generating-case {
        animation: fadeIn 0.3s ease;
      }

      .generate-case-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 25px rgba(0, 255, 170, 0.3) !important;
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes feedbackPop {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
      
      .streak-counter {
        background: linear-gradient(45deg, #ff4444, #ffaa44);
        color: #fff;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        margin-left: 8px;
      }
      
      .scan-progress-bar {
        height: 6px;
        background: rgba(0, 204, 221, 0.2);
        border-radius: 3px;
        margin: 8px 0;
        overflow: hidden;
      }
      
      .scan-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #ffaa44, #00ffaa);
        border-radius: 3px;
        transition: width 0.3s ease;
      }
    `
    document.head.appendChild(style)
  }

  // CLEAN: State-driven rendering
  private handleStateChange(state: SessionState): void {
    switch (state.phase) {
      case 'case_selection':
        this.renderCaseSelection()
        break
      case 'scanning':
        this.renderScanningPhase(state)
        break
      case 'diagnosing':
        this.renderDiagnosticQuestion(state)
        break
      case 'completed':
        this.renderCompletionSummary(state)
        break
    }
  }

  private renderCaseSelection(): void {
    // ENHANCEMENT: Filter cases based on current anatomical model
    const availableCases = this.getFilteredCases()
    const achievementCount = this.achievements.size

    this.container.innerHTML = `
      <div class="diagnostic-header">
        <h3 style="margin: 0; color: #00ffaa;">🏥 Medical Diagnostic Center</h3>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
          <span style="font-size: 12px; opacity: 0.8;">Choose a patient case</span>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 11px; color: #00ffaa;">🏆 ${achievementCount} achievements</span>
            <span style="font-size: 11px; color: #ffaa44;">⭐ Level ${this.userLevel}</span>
            <span style="font-size: 11px; color: #44ffaa;">💎 ${this.experiencePoints} XP</span>
          </div>
        </div>
      </div>
      <div class="diagnostic-content">
        <!-- ENHANCEMENT: Anatomical model selector -->
        <div class="model-selector">
          <button class="model-button ${this.currentModel === 'head' ? 'active' : ''}"
                  onclick="diagnosticUI.switchModel('head')">
            👤 Head/Neck
          </button>
          <button class="model-button disabled"
                  onclick="return false;"
                  title="Coming Soon">
            🫁 Torso/Spine (Coming Soon)
          </button>
          <button class="model-button disabled"
                  onclick="return false;"
                  title="Coming Soon">
            🦴 Full Body (Coming Soon)
          </button>
        </div>
        
        <div class="case-selector">
          ${availableCases.map(caseData => this.renderCaseCard(caseData)).join('')}

          <!-- DYNAMIC: AI-powered case generation -->
          <div class="generate-case-section" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(0, 204, 221, 0.3);">
            <button class="generate-case-button"
                    onclick="diagnosticUI.generateNewCase()"
                    style="width: 100%; padding: 12px; background: linear-gradient(135deg, #001520, #002030); border: 1px solid #00ffaa; color: #00ffaa; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.3s ease;"
                    onmouseover="this.style.background='linear-gradient(135deg, #002030, #003040)'; this.style.borderColor='#00ffaa';"
                    onmouseout="this.style.background='linear-gradient(135deg, #001520, #002030)'; this.style.borderColor='#00ffaa';">
              <span style="margin-right: 8px;">🧠</span>
              Generate New AI Case
              <div style="font-size: 10px; opacity: 0.7; margin-top: 4px;">Unique case powered by Cerebras AI</div>
            </button>
          </div>
        </div>

        ${availableCases.length === 0 && this.generatedCases.size === 0 ? `
          <div style="text-align: center; padding: 20px; opacity: 0.6;">
            <p>📋 No cases available for ${this.currentModel} model</p>
            <p style="font-size: 11px;">Generate your first AI case above!</p>
          </div>
        ` : ''}
      </div>
    `
  }

  // DYNAMIC: Generate new case with AI
  private async generateNewCase(): Promise<void> {
    if (this.isGeneratingCase) return

    this.isGeneratingCase = true

    // Show loading state
    const caseSelector = this.container.querySelector('.case-selector') as HTMLElement
    if (caseSelector) {
      caseSelector.innerHTML = `
        <div class="generating-case" style="text-align: center; padding: 20px; color: #00ffaa;">
          <div style="font-size: 24px; margin-bottom: 10px;">🧠</div>
          <div>Generating unique case...</div>
          <div style="font-size: 12px; opacity: 0.7; margin-top: 8px;">Powered by Cerebras AI</div>
        </div>
      `
    }

    try {
      // Get previously generated case IDs to avoid repetition
      const previousCaseIds = Array.from(this.generatedCases.keys())

      const response = await this.cerebrasService.generateDynamicCase(
        this.currentModel,
        this.streakCount + 1, // Increase difficulty with streak
        previousCaseIds
      )

      if (response.success && response.data) {
        const caseId = `generated_${Date.now()}`
        this.generatedCases.set(caseId, response.data)

        // Re-render case selection with new case
        this.renderCaseSelection()
      } else {
        throw new Error('Failed to generate case')
      }
    } catch (error) {
      console.error('Case generation failed:', error)
      this.showError('Failed to generate new case. Please try again.')
      this.renderCaseSelection()
    } finally {
      this.isGeneratingCase = false
    }
  }

  // CLEAN: Error display helper
  private showError(message: string): void {
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 68, 68, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `
    errorDiv.textContent = message

    document.body.appendChild(errorDiv)
    setTimeout(() => {
      errorDiv.remove()
    }, 3000)
  }

  // GAMIFICATION: Experience and level system
  private addExperience(points: number, reason: string = ''): void {
    this.experiencePoints += points
    const newLevel = Math.floor(this.experiencePoints / 1000) + 1

    if (newLevel > this.userLevel) {
      this.userLevel = newLevel
      this.showLevelUpNotification()
    }

    this.showExperienceGain(points, reason)
  }

  private showLevelUpNotification(): void {
    this.showNotification(
      `🎉 Level Up! Now Level ${this.userLevel}`,
      'success',
      4000
    )
  }

  private showExperienceGain(points: number, reason: string): void {
    this.showNotification(
      `+${points} XP${reason ? ` - ${reason}` : ''}`,
      'info',
      2000
    )
  }

  // IMMERSIVE: Enhanced notifications
  private showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error', duration: number = 3000): void {
    const notification = document.createElement('div')
    const colors = {
      success: { bg: '#00ffaa', border: '#00cc88' },
      info: { bg: '#00ccdd', border: '#0099aa' },
      warning: { bg: '#ffaa44', border: '#cc8800' },
      error: { bg: '#ff4444', border: '#cc0000' }
    }

    const color = colors[type]

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color.bg};
      color: #000;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
      animation: slideDown 0.3s ease;
      border: 2px solid ${color.border};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `
    notification.textContent = message

    document.body.appendChild(notification)
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }, duration)
  }

  // ENHANCED: Case completion with rewards (existing method enhanced)

  // MODULAR: Smart case filtering based on anatomical model
  private getFilteredCases(): Array<{ case: PatientCase, id: string, isGenerated?: boolean }> {
    // Include hardcoded cases that match current model
    const hardcodedCases = Object.entries(PATIENT_CASES)
      .map(([id, patientCase]) => ({ case: patientCase, id }))
      .filter(({ case: patientCase }) => {
        // Check if case has conditions visible in current model
        return patientCase.conditions.some(conditionId => {
          const condition = MEDICAL_CONDITIONS[conditionId]
          return condition && (
            condition.requiredModel === this.currentModel ||
            condition.visibleIn.some(part => this.visibleAnatomy.includes(part))
          )
        })
      })

    // Include generated cases for current model
    const generatedCases = Array.from(this.generatedCases.entries())
      .filter(([_, caseData]) => {
        // Filter generated cases by model compatibility
        return caseData.conditions.some((conditionId: string) => {
          const condition = MEDICAL_CONDITIONS[conditionId]
          return condition && (
            condition.requiredModel === this.currentModel ||
            condition.visibleIn.some((part: string) => this.visibleAnatomy.includes(part))
          )
        })
      })
      .map(([id, caseData]) => ({ case: caseData, id, isGenerated: true }))

    return [...hardcodedCases, ...generatedCases]
  }

  // ENHANCEMENT: Rich case card with medical context
  private renderCaseCard(caseData: { case: PatientCase, id: string }): string {
    const { case: patientCase, id } = caseData
    const conditionCount = patientCase.conditions.length
    const isCompleted = this.achievements.has(`case_${id}_completed`)

    return `
      <div class="case-card" onclick="diagnosticUI.startCase('${id}')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <strong>${patientCase.patientInfo.name}</strong>
            <span style="font-size: 11px; opacity: 0.7; margin-left: 8px;">
              ${patientCase.patientInfo.age}${patientCase.patientInfo.gender} • ${patientCase.patientInfo.occupation}
            </span>
            ${isCompleted ? '<span style="color: #00ffaa; margin-left: 8px;">✅</span>' : ''}
          </div>
          <span class="difficulty-indicator diff-${patientCase.difficulty}">Level ${patientCase.difficulty}</span>
        </div>
        
        <div style="font-size: 11px; margin: 8px 0; opacity: 0.8; line-height: 1.3;">
          <strong>Chief Complaint:</strong> ${patientCase.patientInfo.chiefComplaint}
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span style="font-size: 10px; opacity: 0.6;">
            ${conditionCount} condition${conditionCount !== 1 ? 's' : ''} to discover
          </span>
          <span style="font-size: 10px; color: #00ccdd;">
            ${patientCase.learningObjectives.length} learning objectives
          </span>
        </div>
      </div>
    `
  }

  private renderScanningPhase(state: SessionState): void {
    if (!state.currentCase) return

    const case_ = state.currentCase
    const visibleConditions = this.getVisibleConditionsForCase(case_)
    const totalConditions = visibleConditions.length
    const discoveredCount = state.discoveredConditions.filter(id =>
      visibleConditions.some(c => c.id === id)
    ).length
    const progress = totalConditions > 0 ? (discoveredCount / totalConditions) * 100 : 0

    this.container.innerHTML = `
      <div class="diagnostic-header">
        <h3 style="margin: 0;">📋 ${case_.patientInfo.name} 
          ${this.streakCount > 0 ? `<span class="streak-counter">🔥 ${this.streakCount}</span>` : ''}
        </h3>
        <div style="font-size: 12px; margin-top: 5px; display: flex; justify-content: space-between;">
          <span>${case_.patientInfo.age}${case_.patientInfo.gender} • ${this.currentModel.toUpperCase()}</span>
          <span>🎯 Score: ${state.score}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      <div class="diagnostic-content">
        <div class="patient-info">
          <strong>Chief Complaint:</strong><br>
          "${case_.patientInfo.chiefComplaint}"
          <br><br>
          <strong>Occupation:</strong> ${case_.patientInfo.occupation}<br>
          <strong>Medical History:</strong> ${case_.patientInfo.medicalHistory.join(', ')}
        </div>
        
        <!-- ENHANCEMENT: Progressive discovery indicators -->
        <div style="margin: 15px 0;">
          <strong style="font-size: 12px;">🔍 Discovery Progress:</strong>
          <div style="margin-top: 8px;">
            ${this.renderDiscoveryIndicators(visibleConditions, state.discoveredConditions)}
          </div>
        </div>
        
        <div style="text-align: center; padding: 15px; opacity: 0.8;">
          <p>🔍 <strong>Scan the ${this.currentModel} for abnormalities</strong></p>
          <p style="font-size: 12px;">Move mouse slowly over areas • Press [C] to toggle markers</p>
          <p style="font-size: 11px; margin-top: 10px; color: #00ffaa;">
            Found: ${discoveredCount}/${totalConditions} conditions in ${this.currentModel} view
          </p>
          ${totalConditions === 0 ? `
            <p style="font-size: 10px; color: #ffaa44; margin-top: 10px;">
              💡 Switch to a different anatomical view to find conditions for this case
            </p>
          ` : ''}
        </div>
      </div>
    `
  }

  // ENHANCEMENT: Visual discovery progress indicators
  private renderDiscoveryIndicators(visibleConditions: MedicalCondition[], discoveredIds: string[]): string {
    return visibleConditions.map(condition => {
      const isDiscovered = discoveredIds.includes(condition.id)
      const progress = this.discoveryProgress.get(condition.id)
      const scanProgress = progress ? (progress.scanProgress / (condition.scanTimeRequired || 3)) * 100 : 0

      let indicatorClass = 'discovery-hidden'
      if (isDiscovered) {
        indicatorClass = 'discovery-revealed'
      } else if (scanProgress > 0) {
        indicatorClass = 'discovery-scanning'
      }

      return `
        <div style="display: flex; align-items: center; margin: 4px 0; font-size: 11px;">
          <span class="discovery-indicator ${indicatorClass}"></span>
          <span style="flex: 1; opacity: ${isDiscovered ? '1' : '0.6'};">
            ${isDiscovered ? condition.name : '???'}
          </span>
          ${!isDiscovered && scanProgress > 0 ? `
            <div class="scan-progress-bar" style="width: 60px; margin-left: 8px;">
              <div class="scan-progress-fill" style="width: ${scanProgress}%"></div>
            </div>
          ` : ''}
          ${isDiscovered ? '<span style="color: #00ffaa;">✓</span>' : ''}
        </div>
      `
    }).join('')
  }

  // MODULAR: Get conditions visible in current anatomical model for a case
  private getVisibleConditionsForCase(patientCase: PatientCase): MedicalCondition[] {
    return patientCase.conditions
      .map(id => MEDICAL_CONDITIONS[id])
      .filter(condition => condition && (
        condition.requiredModel === this.currentModel ||
        condition.visibleIn.some(part => this.visibleAnatomy.includes(part))
      ))
  }

  private renderDiagnosticQuestion(state: SessionState): void {
    if (!state.currentQuestion) return

    const question = state.currentQuestion
    const optionsHtml = question.options.map((option, index) =>
      `<button class="option-button" onclick="diagnosticUI.submitAnswer(${index})">${option.text}</button>`
    ).join('')

    const hintsHtml = question.hints.map((hint, index) =>
      `<button class="hint-button" onclick="diagnosticUI.useHint(${index})">💡 Hint ${index + 1} (${hint.cost} pts)</button>`
    ).join('')

    this.container.innerHTML = `
      <div class="diagnostic-header">
        <h3 style="margin: 0;">🧠 Diagnostic Question</h3>
        <div style="font-size: 12px; margin-top: 5px; display: flex; justify-content: space-between;">
          <span>Type: ${question.type.charAt(0).toUpperCase() + question.type.slice(1)}</span>
          <span>🎯 Score: ${state.score}</span>
        </div>
      </div>
      <div class="diagnostic-content">
        <div class="diagnostic-question">
          <p style="margin: 0 0 12px 0; font-weight: bold;">${question.question}</p>
          <div class="question-options">
            ${optionsHtml}
          </div>
          ${hintsHtml ? `<div class="hint-section"><strong>Hints Available:</strong><br>${hintsHtml}</div>` : ''}
        </div>
      </div>
    `
  }

  private renderCompletionSummary(state: SessionState): void {
    const currentCase = state.currentCase
    const achievementsList = Array.from(this.achievements)
      .slice(-3) // Show last 3 achievements
      .map(id => this.getAchievementTitle(id))
      .join('<br>')

    let performanceMessage = ''
    if (state.accuracy >= 90) {
      performanceMessage = '🌟 Outstanding performance!'
    } else if (state.accuracy >= 75) {
      performanceMessage = '👍 Great job!'
    } else if (state.accuracy >= 60) {
      performanceMessage = '📚 Keep learning!'
    } else {
      performanceMessage = '💪 Practice makes perfect!'
    }

    this.container.innerHTML = `
      <div class="diagnostic-header">
        <h3 style="margin: 0; color: #00ffaa;">✅ Case Complete!</h3>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">
          ${currentCase ? currentCase.patientInfo.name : 'Patient'} • ${performanceMessage}
        </p>
      </div>
      <div class="diagnostic-content" style="padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #00ffaa; margin: 0 0 15px 0;">🎯 Final Score: ${state.score}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
            <div style="background: rgba(0, 204, 221, 0.1); padding: 10px; border-radius: 6px;">
              <div style="font-size: 11px; opacity: 0.8;">Accuracy</div>
              <div style="font-size: 18px; font-weight: bold; color: #00ffaa;">${state.accuracy}%</div>
            </div>
            <div style="background: rgba(0, 204, 221, 0.1); padding: 10px; border-radius: 6px;">
              <div style="font-size: 11px; opacity: 0.8;">Hints Used</div>
              <div style="font-size: 18px; font-weight: bold; color: #ffaa44;">${state.hintsUsed}</div>
            </div>
          </div>
        </div>
        
        ${this.achievements.size > 0 ? `
          <div style="margin: 15px 0; padding: 12px; background: rgba(0, 255, 170, 0.1); border-radius: 6px;">
            <strong style="font-size: 12px; color: #00ffaa;">🏆 Recent Achievements:</strong>
            <div style="font-size: 11px; margin-top: 8px; line-height: 1.4;">
              ${achievementsList || 'Complete more cases to unlock achievements!'}
            </div>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button onclick="diagnosticUI.reset()" style="
            flex: 1;
            background: linear-gradient(45deg, #00ccdd, #00ffaa);
            border: none; color: #000; padding: 12px 16px;
            border-radius: 6px; cursor: pointer; font-weight: bold;
            font-size: 12px;
          ">New Case</button>
          <button onclick="diagnosticUI.switchModel('${this.getNextModelSuggestion()}')" style="
            flex: 1;
            background: rgba(0, 204, 221, 0.2);
            border: 1px solid #00ccdd; color: #00ccdd; padding: 12px 16px;
            border-radius: 6px; cursor: pointer; font-weight: bold;
            font-size: 12px;
          ">Try ${this.getNextModelSuggestion().toUpperCase()}</button>
        </div>
      </div>
    `
  }

  // ENHANCEMENT: Helper methods for completion summary
  private getAchievementTitle(id: string): string {
    const titles: Record<string, string> = {
      'first_discovery': '🔍 First Discovery',
      'detective': '🕵️ Detective',
      'streak_3': '🔥 Hot Streak',
      'streak_5': '🔥🔥 On Fire',
      'perfectionist': '💎 Perfectionist',
      'high_scorer': '🎯 High Scorer',
      'speed_demon': '⚡ Speed Demon'
    }

    if (id.startsWith('case_') && id.endsWith('_completed')) {
      return '🏆 Case Complete'
    }

    return titles[id] || '🏅 Achievement'
  }

  private getNextModelSuggestion(): 'head' | 'torso' | 'fullbody' {
    const models: Array<'head' | 'torso' | 'fullbody'> = ['head', 'torso', 'fullbody']
    const currentIndex = models.indexOf(this.currentModel)
    return models[(currentIndex + 1) % models.length]
  }

  // CLEAN: Explicit public API methods
  public startCase(caseId: string): void {
    if (this.session.startCase(caseId)) {
      // Reset discovery progress for new case
      this.discoveryProgress.clear()
      this.streakCount = 0
      this.callbacks.onCaseSelection?.(caseId)
    }
  }

  public discoverCondition(conditionId: string): MedicalCondition | null {
    const condition = this.session.discoverCondition(conditionId)
    if (condition) {
      // GAMIFICATION: Track discovery and check for achievements
      this.trackDiscovery(conditionId)
      this.checkAchievements()

      if (this.session.canStartDiagnosis()) {
        // Auto-start first diagnostic question
        this.session.getNextQuestion(conditionId)
        this.callbacks.onStartDiagnosis?.(conditionId)
      }
    }
    return condition
  }

  // ENHANCEMENT: Model switching with anatomical filtering
  public switchModel(modelType: 'head' | 'torso' | 'fullbody'): void {
    if (this.currentModel === modelType) return

    this.currentModel = modelType

    // Update visible anatomy based on model
    switch (modelType) {
      case 'head':
        this.visibleAnatomy = ['head', 'neck', 'cervical_spine', 'jaw', 'face', 'temporomandibular_joint']
        break
      case 'torso':
        this.visibleAnatomy = ['spine', 'back', 'torso', 'chest', 'ribs']
        break
      case 'fullbody':
        this.visibleAnatomy = ['legs', 'lower_body', 'thigh', 'knee', 'spine', 'back', 'torso']
        break
    }

    // Notify callback for 3D model switching
    this.callbacks.onModelSwitch?.(modelType)

    // Re-render current view
    this.handleStateChange(this.session.getCurrentState())
  }

  // GAMIFICATION: Update scanning progress for progressive discovery
  public updateScanProgress(conditionId: string, progress: number): void {
    const existing = this.discoveryProgress.get(conditionId) || {
      conditionId,
      scanProgress: 0,
      isRevealed: false,
      discoveryTime: Date.now()
    }

    existing.scanProgress = progress
    this.discoveryProgress.set(conditionId, existing)

    // Re-render if in scanning phase
    const state = this.session.getCurrentState()
    if (state.phase === 'scanning') {
      this.renderScanningPhase(state)
    }
  }

  public submitAnswer(optionIndex: number): void {
    const question = this.session.getCurrentState().currentQuestion
    if (question) {
      this.session.submitAnswer(question.id, optionIndex)
    }
  }

  public useHint(hintIndex: number): void {
    const hint = this.session.useHint(hintIndex)
    if (hint) {
      // Could show hint in a tooltip or notification
      console.log('💡 Hint:', hint)
    }
  }

  public reset(): void {
    this.session.reset()
  }

  private handleQuestionAnswered(answer: DiagnosticAnswer): void {
    // ENHANCEMENT: Enhanced feedback with streak tracking
    if (answer.isCorrect) {
      this.streakCount++
      this.showFeedback(`✅ Correct! +${answer.pointsEarned} points`, 'success')

      // Check for streak achievements
      if (this.streakCount === 3) {
        this.unlockAchievement('streak_3', '🔥 Hot Streak! 3 correct answers in a row')
      } else if (this.streakCount === 5) {
        this.unlockAchievement('streak_5', '🔥🔥 On Fire! 5 correct answers in a row')
      }
    } else {
      this.streakCount = 0
      this.showFeedback(`❌ Incorrect. ${answer.explanation}`, 'error')
    }
  }

  private handleCaseCompleted(score: number, accuracy: number): void {
    const currentCase = this.session.getCurrentCase()
    if (currentCase) {
      this.unlockAchievement(`case_${currentCase.id}_completed`, `🏆 Case Complete: ${currentCase.patientInfo.name}`)

      // Performance-based achievements
      if (accuracy >= 90) {
        this.unlockAchievement('perfectionist', '💎 Perfectionist: 90%+ accuracy')
      }
      if (score >= 100) {
        this.unlockAchievement('high_scorer', '🎯 High Scorer: 100+ points')
      }
    }

    console.log(`🎉 Case completed! Score: ${score}, Accuracy: ${accuracy}%`)
  }

  // GAMIFICATION: Achievement system
  private unlockAchievement(id: string, title: string): void {
    if (this.achievements.has(id)) return

    this.achievements.add(id)
    this.showAchievementNotification(title)
  }

  private showAchievementNotification(title: string): void {
    const notification = document.createElement('div')
    notification.className = 'achievement-notification'
    notification.textContent = title
    document.body.appendChild(notification)

    // Remove after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }

  private showFeedback(message: string, type: 'success' | 'error'): void {
    // Create temporary feedback element
    const feedback = document.createElement('div')
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${type === 'success' ? 'rgba(0, 255, 170, 0.9)' : 'rgba(255, 68, 68, 0.9)'};
      color: ${type === 'success' ? '#000' : '#fff'};
      padding: 15px 25px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 10001;
      animation: feedbackPop 0.3s ease;
    `
    feedback.textContent = message
    document.body.appendChild(feedback)

    // Remove after delay
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback)
      }
    }, 2000)
  }

  private trackDiscovery(conditionId: string): void {
    const progress = this.discoveryProgress.get(conditionId)
    if (progress) {
      progress.isRevealed = true
      progress.discoveryTime = Date.now() - progress.discoveryTime
    }

    // Discovery-based achievements
    const discoveredCount = this.session.getCurrentState().discoveredConditions.length
    if (discoveredCount === 1) {
      this.unlockAchievement('first_discovery', '🔍 First Discovery: Found your first condition')
    } else if (discoveredCount === 5) {
      this.unlockAchievement('detective', '🕵️ Detective: Discovered 5 conditions')
    }
  }

  private checkAchievements(): void {
    const state = this.session.getCurrentState()

    // Speed-based achievements
    const avgDiscoveryTime = Array.from(this.discoveryProgress.values())
      .filter(p => p.isRevealed)
      .reduce((sum, p) => sum + p.discoveryTime, 0) / this.discoveryProgress.size

    if (avgDiscoveryTime < 3000) { // Less than 3 seconds average
      this.unlockAchievement('speed_demon', '⚡ Speed Demon: Quick discovery times')
    }
  }

  public getSession(): DiagnosticSession {
    return this.session
  }
}

// ORGANIZED: Global instance for easy access (can be improved with proper DI)
declare global {
  interface Window {
    diagnosticUI: DiagnosticUI
  }
}

export const createDiagnosticUI = (callbacks: UICallbacks = {}): DiagnosticUI => {
  const ui = new DiagnosticUI(callbacks)
  window.diagnosticUI = ui // For onclick handlers - can be improved
  return ui
}