// MODULAR: Diagnostic UI with clear separation from 3D rendering logic

import { DiagnosticSession, type SessionState, type DiagnosticAnswer } from './diagnostic-session'
import type { PatientCase, MedicalCondition, DiagnosticQuestion } from '../medical/medical-data'

// CLEAN: UI-specific interfaces separate from domain logic
interface UICallbacks {
  onStartDiagnosis?: (conditionId: string) => void
  onCaseSelection?: (caseId: string) => void
}

export class DiagnosticUI {
  private container: HTMLElement
  private session: DiagnosticSession
  private callbacks: UICallbacks

  constructor(callbacks: UICallbacks = {}) {
    this.callbacks = callbacks
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
      bottom: 20px;
      right: 20px;
      width: 350px;
      max-height: 500px;
      background: rgba(0, 15, 25, 0.95);
      border: 2px solid #00ccdd;
      border-radius: 8px;
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
    this.container.innerHTML = `
      <div class="diagnostic-header">
        <h3 style="margin: 0; color: #00ffaa;">🏥 Select Patient Case</h3>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Choose a case to begin diagnosis</p>
      </div>
      <div class="diagnostic-content">
        <div class="case-selector">
          <div class="case-card" onclick="diagnosticUI.startCase('case_001')">
            <strong>Sarah M. (34F)</strong>
            <span class="difficulty-indicator diff-2">Level 2</span>
            <div style="font-size: 11px; margin-top: 5px; opacity: 0.8;">Marathon runner with knee pain</div>
          </div>
          <div class="case-card" onclick="diagnosticUI.startCase('case_002')">
            <strong>Michael T. (19M)</strong>
            <span class="difficulty-indicator diff-3">Level 3</span>
            <div style="font-size: 11px; margin-top: 5px; opacity: 0.8;">Student with back pain and uneven shoulders</div>
          </div>
          <div class="case-card" onclick="diagnosticUI.startCase('case_003')">
            <strong>Robert K. (67M)</strong>
            <span class="difficulty-indicator diff-1">Level 1</span>
            <div style="font-size: 11px; margin-top: 5px; opacity: 0.8;">Construction worker after ladder fall</div>
          </div>
        </div>
      </div>
    `
  }

  private renderScanningPhase(state: SessionState): void {
    if (!state.currentCase) return

    const case_ = state.currentCase
    const totalConditions = case_.conditions.length
    const discoveredCount = state.discoveredConditions.length
    const progress = (discoveredCount / totalConditions) * 100

    this.container.innerHTML = `
      <div class="diagnostic-header">
        <h3 style="margin: 0;">📋 Case: ${case_.patientInfo.name}</h3>
        <div style="font-size: 12px; margin-top: 5px; display: flex; justify-content: space-between;">
          <span>Age: ${case_.patientInfo.age} | ${case_.patientInfo.gender}</span>
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
        
        <div style="text-align: center; padding: 20px; opacity: 0.8;">
          <p>🔍 <strong>Scan for abnormalities</strong></p>
          <p style="font-size: 12px;">Press [C] to show condition markers<br>Click on glowing areas to investigate</p>
          <p style="font-size: 11px; margin-top: 15px;">Found: ${discoveredCount}/${totalConditions} conditions</p>
        </div>
      </div>
    `
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
    this.container.innerHTML = `
      <div class="diagnostic-header">
        <h3 style="margin: 0; color: #00ffaa;">✅ Case Complete!</h3>
      </div>
      <div class="diagnostic-content" style="text-align: center; padding: 30px;">
        <h2 style="color: #00ffaa; margin: 0 0 20px 0;">🎯 Final Score: ${state.score}</h2>
        <p style="margin: 10px 0;">Accuracy: ${state.accuracy}%</p>
        <p style="margin: 10px 0;">Hints Used: ${state.hintsUsed}</p>
        <button onclick="diagnosticUI.reset()" style="
          background: linear-gradient(45deg, #00ccdd, #00ffaa);
          border: none; color: #000; padding: 12px 24px;
          border-radius: 6px; cursor: pointer; font-weight: bold;
          margin-top: 20px;
        ">New Case</button>
      </div>
    `
  }

  // CLEAN: Explicit public API methods
  public startCase(caseId: string): void {
    if (this.session.startCase(caseId)) {
      this.callbacks.onCaseSelection?.(caseId)
    }
  }

  public discoverCondition(conditionId: string): MedicalCondition | null {
    const condition = this.session.discoverCondition(conditionId)
    if (condition && this.session.canStartDiagnosis()) {
      // Auto-start first diagnostic question
      this.session.getNextQuestion(conditionId)
      this.callbacks.onStartDiagnosis?.(conditionId)
    }
    return condition
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
    // Show feedback briefly before continuing
    console.log(answer.isCorrect ? '✅ Correct!' : '❌ Incorrect:', answer.explanation)
  }

  private handleCaseCompleted(score: number, accuracy: number): void {
    console.log(`🎉 Case completed! Score: ${score}, Accuracy: ${accuracy}%`)
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