// MODULAR: Voice consultation system following domain-driven design
// ENHANCEMENT FIRST: Extends existing AudioManager and DiagnosticUI systems
// AGGRESSIVE CONSOLIDATION: Centralized in AI panel with voice integration
// ENHANCED: Now integrates with dedicated AI panel with voice controls

import { AIPanel } from '../diagnostic/ui/AIPanel'

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

export interface VoiceRecognition {
  start: () => void
  stop: () => void
  isListening: () => boolean
  onresult: (event: any) => void
  onerror: (event: any) => void
}

export class VoiceConsultationManager {
  private currentSession: ConsultationSession | null = null
  private callbacks: Map<string, Function[]> = new Map()
  private isVoiceSupported: boolean = false
  private diagnosticUIManager: any = null // Reference to interact with the UI
  private aiPanel: AIPanel | null = null // Direct reference to AI panel
  private recognition: any = null // Speech recognition instance
  private onResultCallback: ((text: string) => void) | null = null
  private onErrorCallback: ((error: any) => void) | null = null

  constructor(diagnosticUIManager?: any, aiPanel?: AIPanel) {
    this.checkVoiceSupport()
    this.diagnosticUIManager = diagnosticUIManager
    this.aiPanel = aiPanel || null
    this.setupSpeechRecognition()
  }

  // PERFORMANT: Check voice capabilities before loading heavy dependencies
  private checkVoiceSupport(): void {
    this.isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    console.log('🎙️ Voice support detected:', this.isVoiceSupported)
  }

  // Setup the speech recognition instance
  private setupSpeechRecognition(): void {
    if (!this.isVoiceSupported) {
      console.warn('Voice recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    this.recognition = new SpeechRecognition()
    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = 'en-US'

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      this.handleVoiceResult(transcript)
    }

    this.recognition.onerror = (event: any) => {
      this.handleVoiceError(event.error)
    }
  }

  // Register with the AI panel for voice functionality
  public registerWithAIpanel(aiPanel: AIPanel): void {
    this.aiPanel = aiPanel

    // Create voice callbacks for the AI panel
    const voiceCallbacks = {
      startListening: () => {
        if (this.recognition) {
          this.recognition.start()
        }
      },
      stopListening: () => {
        if (this.recognition) {
          this.recognition.stop()
        }
      },
      isListening: () => {
        return this.recognition ? this.recognition.isListening : false
      },
      onResult: (callback: (text: string) => void) => {
        this.onResultCallback = callback
      },
      onError: (callback: (error: any) => void) => {
        this.onErrorCallback = callback
      }
    }

    aiPanel.registerVoiceCallbacks(voiceCallbacks)
  }

  private handleVoiceResult(transcript: string): void {
    console.log('🎤 Voice result:', transcript)
    
    // Add to AI panel as a voice insight
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: `voice_${Date.now()}`,
        timestamp: Date.now(),
        content: `You said: "${transcript}"`,
        type: 'voice',
        confidence: 0.9
      })
    }

    // Trigger internal callback if registered
    if (this.onResultCallback) {
      this.onResultCallback(transcript)
    }

    // Process the command if it's relevant to the diagnostic task
    this.processVoiceCommand(transcript)
  }

  private handleVoiceError(error: any): void {
    console.error('🎤 Voice error:', error)
    
    // Add error to AI panel
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: `error_${Date.now()}`,
        timestamp: Date.now(),
        content: `Voice recognition error: ${error}`,
        type: 'urgent',
        confidence: 0.5
      })
    }

    // Trigger internal callback if registered
    if (this.onErrorCallback) {
      this.onErrorCallback(error)
    }
  }

  // Process voice commands to generate relevant insights
  private processVoiceCommand(transcript: string): void {
    const lowerTranscript = transcript.toLowerCase()
    
    // If the user is asking for help or diagnostic advice
    if (lowerTranscript.includes('help') || 
        lowerTranscript.includes('advice') || 
        lowerTranscript.includes('suggest') || 
        lowerTranscript.includes('what should i')) {
      
      // Generate relevant diagnostic insights based on current context
      if (this.currentSession) {
        // Generate insights based on the current context
        this.generateContextualInsights(this.currentSession.context).then(insights => {
          insights.forEach((insight, index) => {
            if (this.aiPanel) {
              this.aiPanel.addInsight({
                id: `contextual_${Date.now()}_${index}`,
                timestamp: Date.now(),
                content: insight,
                type: this.getInsightType(insight),
                confidence: 0.8
              })
            }
          })
        })
      }
    }
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

  // ENHANCED: Integrate with dedicated AI panel
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

    try {
      // Show loading state in the AI panel
      if (this.aiPanel) {
        this.aiPanel.addInsight({
          id: `loading_${Date.now()}`,
          timestamp: Date.now(),
          content: 'Analyzing patient data...',
          type: 'diagnostic',
          confidence: 0.5
        })
      }

      // Generate AI insights based on current context
      const insights = await this.generateInsights(context)
      this.currentSession.insights = insights
      
      // Update the AI panel with insights
      if (this.aiPanel) {
        // Clear the loading indicator
        // Note: In a real implementation, we'd want to keep the loading indicator
        // until we have all results, but for now we'll just add the new insights
        
        // Add new insights to the AI panel
        insights.forEach((insight, index) => {
          this.aiPanel!.addInsight({
            id: `insight_${Date.now()}_${index}`,
            timestamp: Date.now(),
            content: insight,
            type: this.getInsightType(insight),
            confidence: 0.8
          })
        })
      } else if (this.diagnosticUIManager) {
        // Fallback to diagnostic UI manager
        insights.forEach((insight, index) => {
          this.diagnosticUIManager.addAIInsight({
            id: `insight_${Date.now()}_${index}`,
            timestamp: Date.now(),
            content: insight,
            type: this.getInsightType(insight),
            confidence: 0.8
          })
        })
      } else {
        // Fallback to the old modal UI if no diagnostic UI manager is available
        this.showConsultationModal(insights)
      }
      
      this.emit('consultation_started', this.currentSession)
      return true
    } catch (error) {
      console.error('🎙️ Consultation failed:', error)
      this.endConsultation()
      return false
    }
  }

  // Generate contextual insights based on current game state
  private async generateContextualInsights(context: ConsultationContext): Promise<string[]> {
    const insights: string[] = []
    
    // Add insights based on discovered conditions
    if (context.discoveredConditions && context.discoveredConditions.size > 0) {
      const conditionsCount = context.discoveredConditions.size
      insights.push(`You've discovered ${conditionsCount} condition${conditionsCount > 1 ? 's' : ''}. Consider how these findings relate to each other.`)
    }
    
    // Add time-sensitive insight
    if (context.timeRemaining) {
      const minutes = Math.floor(context.timeRemaining / 60)
      const seconds = context.timeRemaining % 60
      insights.push(`Time remaining: ${minutes}m ${seconds}s. Consider focusing on high-yield areas.`)
    }
    
    // Add educational insight based on patient case
    if (context.patientCase) {
      const chiefComplaint = context.patientCase.chiefComplaint || 'the symptoms'
      insights.push(`The patient's chief complaint is "${chiefComplaint}". How do your findings correlate?`)
    }
    
    return insights
  }

  // Determine the type of insight based on its content
  private getInsightType(insight: string): 'diagnostic' | 'procedural' | 'educational' | 'urgent' | 'voice' {
    if (insight.toLowerCase().includes('urgent') || insight.toLowerCase().includes('critical') || insight.toLowerCase().includes('immediately')) {
      return 'urgent'
    } else if (insight.toLowerCase().includes('diagnos') || insight.toLowerCase().includes('condition')) {
      return 'diagnostic'
    } else if (insight.toLowerCase().includes('learn') || insight.toLowerCase().includes('tip') || insight.toLowerCase().includes('remember')) {
      return 'educational'
    } else if (insight.toLowerCase().includes('you said') || insight.toLowerCase().includes('voice')) {
      return 'voice'
    } else {
      return 'procedural'
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

  // Fallback to showing a modal if the diagnostic UI manager is not available
  private showConsultationModal(insights: string[]): void {
    const existingUI = document.getElementById('consultation-ui')
    if (existingUI) existingUI.remove()

    // Get context from current session to access patient data
    const patientData = this.currentSession?.context?.patientCase || {};
    
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
        <div style="text-align: center; margin-bottom: 1rem;">
          <h3 style="margin: 0; color: #00d4ff; font-size: 1.4rem;">👩‍⚕️ Clinical Consultation</h3>
          <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.3rem;">
            Patient: <span style="font-weight: bold;">${patientData.patientName || 'Unknown'}</span>, 
            Age: <span style="font-weight: bold;">${patientData.age || 'N/A'}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          ${insights.map(insight => `
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
      </div>
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

    // Stop voice recognition if active
    if (this.recognition && this.recognition.isListening) {
      this.recognition.stop()
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
