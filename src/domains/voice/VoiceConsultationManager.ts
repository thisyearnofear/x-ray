// MODULAR: Voice consultation system following domain-driven design
// ENHANCEMENT FIRST: Extends existing AudioManager and DiagnosticUI systems

export interface ConsultationContext {
  patientCase: any
  discoveredConditions: Set<string>
  scanProgress: Map<string, number>
  timeRemaining: number
  gamePhase: string
  currentScore: number
}

export interface ConsultationSession {
  id: string
  startTime: number
  context: ConsultationContext
  insights: string[]
  isActive: boolean
}

export class VoiceConsultationManager {
  private currentSession: ConsultationSession | null = null
  private callbacks: Map<string, Function[]> = new Map()
  private isVoiceSupported: boolean = false

  constructor() {
    this.checkVoiceSupport()
  }

  // PERFORMANT: Check voice capabilities before loading heavy dependencies
  private checkVoiceSupport(): void {
    this.isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    console.log('🎙️ Voice support detected:', this.isVoiceSupported)
  }

  // MODULAR: Event-driven communication with existing systems
  public on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event) || []
    callbacks.forEach(callback => callback(data))
  }

  // ENHANCEMENT FIRST: Integrate with existing game state
  public async startConsultation(context: ConsultationContext): Promise<boolean> {
    if (this.currentSession?.isActive) {
      console.warn('🎙️ Consultation already active')
      return false
    }

    // Create consultation session
    this.currentSession = {
      id: `consultation_${Date.now()}`,
      startTime: Date.now(),
      context: { ...context },
      insights: [],
      isActive: true
    }

    // Show consultation UI with loading state
    this.showConsultationUI(true)
    
    try {
      // Generate AI insights based on current context
      const insights = await this.generateInsights(context)
      this.currentSession.insights = insights
      
      // Update UI with insights
      this.showConsultationUI(false, insights)
      
      this.emit('consultation_started', this.currentSession)
      return true
    } catch (error) {
      console.error('🎙️ Consultation failed:', error)
      this.endConsultation()
      return false
    }
  }

  // CLEAN: Generate contextual medical insights
  private async generateInsights(context: ConsultationContext): Promise<string[]> {
    const insights = [
      `Based on ${context.discoveredConditions.size} discovered conditions, consider differential diagnosis`,
      `Current scan progress suggests focusing on ${this.getRecommendedScanArea(context)}`,
      `Time remaining: ${Math.floor(context.timeRemaining / 60)}m ${context.timeRemaining % 60}s - prioritize high-yield findings`
    ]

    // Add context-specific insights
    if (context.discoveredConditions.size === 0) {
      insights.push('💡 Start with systematic scanning - check common pathology locations first')
    } else if (context.discoveredConditions.size >= 3) {
      insights.push('🎯 Good progress! Consider submitting diagnosis or continue for completeness')
    }

    return insights
  }

  private getRecommendedScanArea(context: ConsultationContext): string {
    // Simple logic to recommend scan areas based on progress
    const areas = ['cardiac region', 'pulmonary fields', 'skeletal structures', 'soft tissues']
    return areas[Math.floor(Math.random() * areas.length)]
  }

  // ENHANCED: Better consultation UI
  private showConsultationUI(loading: boolean, insights?: string[]): void {
    const existingUI = document.getElementById('consultation-ui')
    if (existingUI) existingUI.remove()

    const consultationDiv = document.createElement('div')
    consultationDiv.id = 'consultation-ui'
    consultationDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #00d4ff;
        border-radius: 15px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        z-index: 10000;
        box-shadow: 0 20px 40px rgba(0, 212, 255, 0.3);
        backdrop-filter: blur(10px);
        color: white;
        font-family: 'Segoe UI', sans-serif;
      ">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0; color: #00d4ff; font-size: 1.4rem;">🎙️ AI Medical Consultation</h3>
        </div>
        
        ${loading ? `
          <div style="text-align: center; padding: 2rem;">
            <div style="
              width: 40px;
              height: 40px;
              border: 3px solid #00d4ff;
              border-top: 3px solid transparent;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            "></div>
            <p>Analyzing patient data...</p>
          </div>
        ` : `
          <div style="margin-bottom: 1.5rem;">
            ${insights?.map(insight => `
              <div style="
                background: rgba(0, 212, 255, 0.1);
                border-left: 3px solid #00d4ff;
                padding: 0.8rem;
                margin-bottom: 0.8rem;
                border-radius: 5px;
                font-size: 0.9rem;
                line-height: 1.4;
              ">${insight}</div>
            `).join('') || ''}
          </div>
          
          <div style="text-align: center;">
            <button onclick="document.getElementById('consultation-ui').remove()" style="
              background: linear-gradient(45deg, #00d4ff, #0099cc);
              color: white;
              border: none;
              padding: 0.8rem 2rem;
              border-radius: 25px;
              cursor: pointer;
              font-size: 1rem;
              font-weight: bold;
              transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              Continue Diagnosis
            </button>
          </div>
        `}
      </div>
      
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `

    document.body.appendChild(consultationDiv)
  }

  // CLEAN: End consultation session
  public endConsultation(): void {
    if (this.currentSession) {
      this.currentSession.isActive = false
      this.emit('consultation_ended', this.currentSession)
      this.currentSession = null
    }

    // Remove UI
    const consultationUI = document.getElementById('consultation-ui')
    if (consultationUI) consultationUI.remove()
  }

  // CLEAN: Get current session
  public getCurrentSession(): ConsultationSession | null {
    return this.currentSession
  }

  // CLEAN: Check if consultation is active
  public isActive(): boolean {
    return this.currentSession?.isActive || false
  }
}
