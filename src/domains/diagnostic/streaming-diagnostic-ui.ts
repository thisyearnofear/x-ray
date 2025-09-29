// ENHANCED: Streaming diagnostic interface showcasing Cerebras streaming capabilities

import { CerebrasService } from '../medical/cerebras-service'
import type { MedicalCondition } from '../medical/medical-data'

export class StreamingDiagnosticUI {
  private container: HTMLElement
  private cerebras: CerebrasService
  private currentStreaming: boolean = false

  constructor() {
    this.cerebras = new CerebrasService()
    this.container = this.createStreamingContainer()
    this.setupStreamingStyles()
    document.body.appendChild(this.container)
  }

  private createStreamingContainer(): HTMLElement {
    const container = document.createElement('div')
    container.id = 'streaming-diagnostic'
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 450px;
      max-height: 600px;
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #00ff88;
      border-radius: 12px;
      font-family: 'Roboto', monospace;
      color: #00ff88;
      display: none;
      flex-direction: column;
      backdrop-filter: blur(15px);
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.3);
      z-index: 2000;
      animation: slideInRight 0.4s ease-out;
    `
    return container
  }

  private setupStreamingStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      
      .reasoning-section {
        background: rgba(0, 255, 136, 0.05);
        border-left: 3px solid #00ff88;
        padding: 12px;
        margin: 8px 0;
        border-radius: 0 6px 6px 0;
        font-style: italic;
        opacity: 0.8;
      }
      
      .streaming-text {
        display: inline-block;
        overflow: hidden;
        white-space: pre-wrap;
        animation: typewriter 0.1s steps(1) infinite;
      }
      
      .confidence-bar {
        width: 100%;
        height: 8px;
        background: rgba(0, 255, 136, 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin: 8px 0;
      }
      
      .confidence-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff4444, #ffaa44, #00ff88);
        border-radius: 4px;
        transition: width 0.8s ease;
      }
      
      .diagnosis-chip {
        display: inline-block;
        background: rgba(0, 255, 136, 0.2);
        border: 1px solid #00ff88;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        margin: 3px;
        animation: slideIn 0.3s ease-out;
      }
      
      .tool-call {
        background: rgba(255, 165, 0, 0.1);
        border: 1px solid #ffa500;
        border-radius: 6px;
        padding: 10px;
        margin: 8px 0;
        color: #ffa500;
      }
      
      .streaming-cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        background: #00ff88;
        margin-left: 2px;
        animation: pulse 1s infinite;
      }
    `
    document.head.appendChild(style)
  }

  // STREAMING: Real-time diagnostic analysis with visible reasoning
  async startStreamingDiagnosis(
    patientContext: string,
    symptoms: string[],
    findings: string[]
  ): Promise<void> {
    this.show()
    this.currentStreaming = true

    const header = this.createHeader('🧠 AI Diagnostic Analysis')
    const reasoningSection = this.createReasoningSection()
    const diagnosisSection = this.createDiagnosisSection()
    const toolSection = this.createToolSection()

    this.container.innerHTML = ''
    this.container.appendChild(header)
    this.container.appendChild(reasoningSection)
    this.container.appendChild(diagnosisSection)
    this.container.appendChild(toolSection)

    // Start streaming analysis
    await this.cerebras.streamDiagnosticAnalysis(
      patientContext,
      symptoms,
      findings,
      {
        onChunk: (chunk, isReasoning) => {
          if (isReasoning) {
            this.appendToReasoningSection(chunk)
          } else {
            this.appendToDiagnosisSection(chunk)
          }
        },
        onComplete: (fullResponse) => {
          this.onStreamingComplete(fullResponse)
        },
        onError: (error) => {
          this.showError(error.message)
        }
      }
    )
  }

  // STRUCTURED: Get confident diagnosis with UI integration
  async showStructuredDiagnosis(
    patientContext: string,
    findings: string[]
  ): Promise<void> {
    this.show()

    const header = this.createHeader('📊 Structured Analysis')
    this.container.innerHTML = ''
    this.container.appendChild(header)

    const loadingDiv = document.createElement('div')
    loadingDiv.style.cssText = 'text-align: center; padding: 40px;'
    loadingDiv.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">🔄</div>
      <p>Analyzing with Cerebras ultra-fast inference...</p>
    `
    this.container.appendChild(loadingDiv)

    const result = await this.cerebras.getStructuredDiagnosis(patientContext, findings)
    
    if (result.success && result.data) {
      this.renderStructuredDiagnosis(result.data)
    } else {
      this.showError(result.error || 'Analysis failed')
    }
  }

  // TOOL USE: Interactive medical explanations
  async startInteractiveSession(
    condition: MedicalCondition,
    initialQuestion: string = "What should I know about this condition?"
  ): Promise<void> {
    this.show()

    const header = this.createHeader(`🔧 Interactive Analysis: ${condition.name}`)
    this.container.innerHTML = ''
    this.container.appendChild(header)

    const chatArea = this.createChatArea()
    const inputArea = this.createInputArea()

    this.container.appendChild(chatArea)
    this.container.appendChild(inputArea)

    // Start with initial question
    this.addChatMessage('user', initialQuestion)
    await this.processInteractiveQuery(condition, initialQuestion)
  }

  private async processInteractiveQuery(
    condition: MedicalCondition,
    question: string
  ): Promise<void> {
    const result = await this.cerebras.getInteractiveExplanation(
      condition,
      question
    )

    if (result.success && result.data) {
      if (result.data.type === 'tool_assisted') {
        this.addToolCallMessage(result.data.response)
      } else {
        this.addChatMessage('ai', result.data.response)
      }
    } else {
      this.addChatMessage('ai', 'I encountered an issue analyzing that question.')
    }
  }

  private createHeader(title: string): HTMLElement {
    const header = document.createElement('div')
    header.style.cssText = `
      padding: 15px;
      background: linear-gradient(135deg, #001a0f 0%, #003320 100%);
      border-bottom: 2px solid #00ff88;
      border-radius: 10px 10px 0 0;
      text-align: center;
    `
    header.innerHTML = `
      <h3 style="margin: 0; color: #00ffaa;">${title}</h3>
      <button onclick="streamingDiagnosticUI.hide()" style="
        position: absolute; top: 10px; right: 15px;
        background: none; border: none; color: #00ff88;
        cursor: pointer; font-size: 18px; padding: 5px;
      ">✕</button>
    `
    return header
  }

  private createReasoningSection(): HTMLElement {
    const section = document.createElement('div')
    section.id = 'reasoning-section'
    section.style.cssText = 'padding: 15px; max-height: 200px; overflow-y: auto;'
    section.innerHTML = `
      <h4 style="margin: 0 0 10px 0; color: #00ccaa;">🤔 AI Reasoning Process:</h4>
      <div id="reasoning-content" class="reasoning-section"></div>
    `
    return section
  }

  private createDiagnosisSection(): HTMLElement {
    const section = document.createElement('div')
    section.id = 'diagnosis-section'
    section.style.cssText = 'padding: 15px; flex: 1; overflow-y: auto;'
    section.innerHTML = `
      <h4 style="margin: 0 0 10px 0; color: #00ffaa;">📋 Diagnostic Analysis:</h4>
      <div id="diagnosis-content"></div>
    `
    return section
  }

  private createToolSection(): HTMLElement {
    const section = document.createElement('div')
    section.id = 'tool-section'
    section.style.cssText = 'padding: 15px; border-top: 1px solid rgba(0, 255, 136, 0.3);'
    return section
  }

  private createChatArea(): HTMLElement {
    const area = document.createElement('div')
    area.id = 'chat-area'
    area.style.cssText = `
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      max-height: 400px;
    `
    return area
  }

  private createInputArea(): HTMLElement {
    const area = document.createElement('div')
    area.style.cssText = `
      padding: 15px;
      border-top: 1px solid rgba(0, 255, 136, 0.3);
    `
    area.innerHTML = `
      <input type="text" id="chat-input" placeholder="Ask about this condition..." style="
        width: 100%;
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid #00ff88;
        color: #00ff88;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: inherit;
      ">
    `
    return area
  }

  private appendToReasoningSection(text: string): void {
    const reasoningContent = document.getElementById('reasoning-content')
    if (reasoningContent) {
      reasoningContent.textContent += text
      reasoningContent.scrollTop = reasoningContent.scrollHeight
    }
  }

  private appendToDiagnosisSection(text: string): void {
    const diagnosisContent = document.getElementById('diagnosis-content')
    if (diagnosisContent) {
      diagnosisContent.innerHTML += `<span class="streaming-text">${text}</span>`
      diagnosisContent.scrollTop = diagnosisContent.scrollHeight
    }
  }

  private onStreamingComplete(fullResponse: string): void {
    this.currentStreaming = false
    
    // Remove streaming cursor
    const cursors = document.querySelectorAll('.streaming-cursor')
    cursors.forEach(cursor => cursor.remove())
    
    // Add completion indicator
    const diagnosisContent = document.getElementById('diagnosis-content')
    if (diagnosisContent) {
      diagnosisContent.innerHTML += `
        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(0, 255, 136, 0.3); font-size: 11px; opacity: 0.7;">
          ✅ Analysis complete • Powered by Cerebras ultra-fast inference
        </div>
      `
    }
  }

  private renderStructuredDiagnosis(data: any): void {
    const confidencePercent = Math.round(data.confidence * 100)
    
    this.container.innerHTML = `
      <div style="padding: 15px; background: linear-gradient(135deg, #001a0f 0%, #003320 100%); border-bottom: 2px solid #00ff88;">
        <h3 style="margin: 0; color: #00ffaa;">📊 Diagnostic Analysis</h3>
        <button onclick="streamingDiagnosticUI.hide()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: #00ff88; cursor: pointer; font-size: 18px;">✕</button>
      </div>
      
      <div style="padding: 20px;">
        <div style="margin-bottom: 20px;">
          <h4 style="color: #00ffaa; margin: 0 0 8px 0;">Primary Diagnosis</h4>
          <div style="font-size: 18px; font-weight: bold;">${data.primaryDiagnosis}</div>
          
          <div style="margin: 10px 0;">
            <div style="font-size: 12px; margin-bottom: 4px;">Confidence: ${confidencePercent}%</div>
            <div class="confidence-bar">
              <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h4 style="color: #00ccaa; margin: 0 0 8px 0;">Clinical Reasoning</h4>
          <div style="background: rgba(0, 255, 136, 0.05); padding: 12px; border-left: 3px solid #00ff88; border-radius: 0 6px 6px 0;">
            ${data.reasoning}
          </div>
        </div>
        
        ${data.differentialDiagnoses ? `
          <div style="margin-bottom: 20px;">
            <h4 style="color: #00ccaa; margin: 0 0 8px 0;">Differential Diagnoses</h4>
            <div>
              ${data.differentialDiagnoses.map((dx: string) => `<span class="diagnosis-chip">${dx}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        <div style="text-align: center; padding: 15px; border-top: 1px solid rgba(0, 255, 136, 0.3); font-size: 11px; opacity: 0.7;">
          🧠 Powered by Cerebras structured outputs • For educational purposes
        </div>
      </div>
    `
  }

  private addChatMessage(role: 'user' | 'ai', content: string): void {
    const chatArea = document.getElementById('chat-area')
    if (!chatArea) return

    const messageDiv = document.createElement('div')
    messageDiv.style.cssText = `
      margin: 10px 0;
      padding: 10px;
      border-radius: 8px;
      ${role === 'user' 
        ? 'background: rgba(0, 255, 136, 0.1); border: 1px solid #00ff88; align-self: flex-end;'
        : 'background: rgba(0, 200, 200, 0.1); border: 1px solid #00cccc;'
      }
    `
    messageDiv.innerHTML = `
      <div style="font-size: 11px; opacity: 0.7; margin-bottom: 5px;">${role === 'user' ? '👤 You' : '🤖 AI Assistant'}</div>
      <div>${content}</div>
    `
    
    chatArea.appendChild(messageDiv)
    chatArea.scrollTop = chatArea.scrollHeight
  }

  private addToolCallMessage(content: string): void {
    const chatArea = document.getElementById('chat-area')
    if (!chatArea) return

    const toolDiv = document.createElement('div')
    toolDiv.className = 'tool-call'
    toolDiv.innerHTML = `
      <div style="font-size: 11px; margin-bottom: 5px;">🔧 Tool Used</div>
      <div>${content}</div>
    `
    
    chatArea.appendChild(toolDiv)
    chatArea.scrollTop = chatArea.scrollHeight
  }

  private showError(message: string): void {
    this.container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
        <h3 style="color: #ff6666; margin-bottom: 10px;">Analysis Error</h3>
        <p style="opacity: 0.8;">${message}</p>
        <button onclick="streamingDiagnosticUI.hide()" style="
          background: rgba(255, 102, 102, 0.2); border: 1px solid #ff6666;
          color: #ff6666; padding: 8px 16px; border-radius: 4px;
          cursor: pointer; margin-top: 15px;
        ">Close</button>
      </div>
    `
  }

  public show(): void {
    this.container.style.display = 'flex'
  }

  public hide(): void {
    this.container.style.display = 'none'
    this.currentStreaming = false
  }

  public isStreaming(): boolean {
    return this.currentStreaming
  }
}

// Global instance for easy access
declare global {
  interface Window {
    streamingDiagnosticUI: StreamingDiagnosticUI
  }
}

export const createStreamingDiagnosticUI = (): StreamingDiagnosticUI => {
  const ui = new StreamingDiagnosticUI()
  window.streamingDiagnosticUI = ui
  return ui
}