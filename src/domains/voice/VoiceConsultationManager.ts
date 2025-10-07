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
    if (this.currentSession?.isActive) {
      console.warn('Consultation already active')
      return false
    }

    try {
      // Create new consultation session
      this.currentSession = {
        id: `consultation_${Date.now()}`,
        startTime: Date.now(),
        context: { ...context },
        insights: [],
        isActive: true
      }

      console.log('🎙️ Starting voice consultation...', this.currentSession.id)
      
      // PERFORMANT: Lazy load voice dependencies only when needed
      if (this.isVoiceSupported) {
        await this.initializeVoiceSession()
      } else {
        // CLEAN: Graceful fallback to text-based consultation
        await this.initializeTextConsultation()
      }

      this.emit('consultationStarted', this.currentSession)
      return true

    } catch (error) {
      console.error('Failed to start consultation:', error)
      this.currentSession = null
      return false
    }
  }

  // MODULAR: Voice session management
  private async initializeVoiceSession(): Promise<void> {
    // TODO: Implement LiveKit voice session
    // For now, simulate voice consultation
    console.log('🎙️ Voice session initialized (simulated)')
    
    // REUSE: Leverage existing Cerebras integration for medical knowledge
    await this.generateMedicalGuidance()
  }

  // CLEAN: Fallback consultation without voice
  private async initializeTextConsultation(): Promise<void> {
    console.log('💬 Text consultation initialized')
    await this.generateMedicalGuidance()
  }

  // DRY: Single source for medical AI consultation
  private async generateMedicalGuidance(): Promise<void> {
    if (!this.currentSession) return

    try {
      const context = this.currentSession.context
      const medicalContext = this.buildMedicalContext(context)

      // REUSE: Existing Cerebras integration via medical-analysis API
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition: `Medical consultation context: ${medicalContext}. Provide educational guidance for diagnostic learning. Focus on: 1) Anatomical findings explanation, 2) Diagnostic reasoning steps, 3) Learning hints for discovered conditions. Keep response concise and educational.`
        })
      })

      if (response.ok) {
        const data = await response.json()
        const guidance = data.choices?.[0]?.message?.content || 'Unable to generate guidance at this time.'
        
        this.currentSession.insights.push(guidance)
        this.emit('guidanceReceived', { guidance, session: this.currentSession })
        
        console.log('🧠 Cerebras medical guidance generated')
      }

    } catch (error) {
      console.error('Failed to generate medical guidance:', error)
      const fallbackGuidance = this.generateFallbackGuidance()
      this.currentSession.insights.push(fallbackGuidance)
      this.emit('guidanceReceived', { guidance: fallbackGuidance, session: this.currentSession })
    }
  }

  // DRY: Build consistent medical context from game state
  private buildMedicalContext(context: ConsultationContext): string {
    const discoveredConditionsList = Array.from(context.discoveredConditions)
    const scanProgressList = Array.from(context.scanProgress.entries())
      .map(([condition, progress]) => `${condition}: ${Math.round(progress * 100)}%`)

    return `
      Patient Case: ${context.patientCase?.patientName || 'Current patient'}
      Chief Complaint: ${context.patientCase?.chiefComplaint || 'Diagnostic evaluation'}
      
      Current Progress:
      - Discovered Conditions: ${discoveredConditionsList.join(', ') || 'None yet'}
      - Scan Progress: ${scanProgressList.join(', ') || 'Just started'}
      - Time Remaining: ${Math.floor(context.timeRemaining / 60)}:${(context.timeRemaining % 60).toString().padStart(2, '0')}
      - Current Score: ${context.currentScore}
      - Game Phase: ${context.gamePhase}
      
      Learning Objective: Guide student through diagnostic reasoning process
    `
  }

  // CLEAN: Fallback guidance when AI fails
  private generateFallbackGuidance(): string {
    if (!this.currentSession) return 'Consultation unavailable'

    const context = this.currentSession.context
    const discoveredCount = context.discoveredConditions.size

    if (discoveredCount === 0) {
      return `Start by systematically scanning the X-ray image. Look for abnormalities in bone density, joint spaces, and soft tissue shadows. Take your time to examine each anatomical region carefully.`
    } else if (discoveredCount < 3) {
      return `Good progress! You've found ${discoveredCount} condition(s). Continue scanning other anatomical regions. Consider the patient's symptoms and correlate them with your imaging findings.`
    } else {
      return `Excellent work discovering multiple conditions! Now focus on differential diagnosis. Which findings are most significant? How do they relate to the patient's clinical presentation?`
    }
  }

  // ENHANCEMENT FIRST: Integrate with existing game pause/resume
  public pauseGame(): void {
    this.emit('gamePauseRequested')
  }

  public resumeGame(): void {
    this.emit('gameResumeRequested')
  }

  // MODULAR: End consultation and return insights
  public async endConsultation(): Promise<string[]> {
    if (!this.currentSession) return []

    const insights = [...this.currentSession.insights]
    const sessionDuration = Date.now() - this.currentSession.startTime

    console.log(`🎙️ Consultation ended. Duration: ${Math.round(sessionDuration / 1000)}s`)

    this.emit('consultationEnded', {
      session: this.currentSession,
      duration: sessionDuration,
      insights
    })

    this.currentSession = null
    return insights
  }

  // CLEAN: Public API for current session state
  public getCurrentSession(): ConsultationSession | null {
    return this.currentSession
  }

  public isConsultationActive(): boolean {
    return this.currentSession?.isActive || false
  }

  // PERFORMANT: Cleanup resources
  public destroy(): void {
    if (this.currentSession) {
      this.endConsultation()
    }
    this.callbacks.clear()
  }
}