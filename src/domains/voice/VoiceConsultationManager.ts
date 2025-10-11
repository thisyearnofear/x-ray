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

import { AIInsight } from '../diagnostic/ui/AIPanel'

export interface ConsultationSession {
  id: string
  startTime: number
  context: ConsultationContext
  insights: AIInsight[]
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
  private transcriptQueue: string[] = []

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

    // Process any queued transcripts
    if (this.transcriptQueue.length > 0) {
      console.log(`Processing ${this.transcriptQueue.length} queued transcripts.`)
      this.transcriptQueue.forEach(transcript => this.handleVoiceResult(transcript))
      this.transcriptQueue = []
    }
  }

  private handleVoiceResult(transcript: string): void {
    console.log('🎤 Voice result:', transcript)

    if (!this.aiPanel) {
      console.log('AI Panel not ready, queueing transcript.')
      this.transcriptQueue.push(transcript)
      return
    }

    // Add to AI panel as a voice insight
    if (this.aiPanel) {
      this.aiPanel.addInsight({
        id: `voice_${Date.now()}`,
        timestamp: Date.now(),
        content: `🎙️ You said: "${transcript}"`,
        type: 'voice',
        confidence: 0.9
      })
    }

    // Trigger internal callback if registered
    if (this.onResultCallback) {
      this.onResultCallback(transcript)
    }

    // If no active consultation session exists, create a default one
    if (!this.currentSession) {
      console.log('🎙️ No active consultation session, creating default session')
      this.startConsultation({ 
        patientCase: null,
        discoveredConditions: new Set(),
        scanProgress: new Map(),
        timeRemaining: 0,
        gamePhase: 'scanning',
        currentScore: 0
      })
    }

    // Add the insight to the current session
    if (this.currentSession) {
      this.currentSession.insights.push({
        id: `voice_insight_${Date.now()}`,
        timestamp: Date.now(),
        content: transcript,
        type: 'voice',
        confidence: 0.9
      })
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
    let responseSent = false
    
    // Handle greeting words
    if (lowerTranscript.includes('hello') || 
        lowerTranscript.includes('hi') ||
        lowerTranscript.includes('hey')) {
      
      // Provide greeting response
      if (this.aiPanel) {
        this.aiPanel.addInsight({
          id: `greeting_${Date.now()}`,
          timestamp: Date.now(),
          content: "👩‍⚕️ Hello there! I'm Nurse Amy, your virtual clinical assistant.",
          type: 'voice',
          confidence: 0.9
        })
      }
      responseSent = true
    }
    
    // Handle identification requests
    if (lowerTranscript.includes('who is') || 
        lowerTranscript.includes('who are you') ||
        lowerTranscript.includes('identify yourself')) {
      
      // Provide identification response
      if (this.aiPanel) {
        this.aiPanel.addInsight({
          id: `identification_${Date.now()}`,
          timestamp: Date.now(),
          content: "👩‍⚕️ I'm Nurse Amy, your virtual clinical assistant. I'm here to guide you through this diagnostic case and provide expert medical insights.",
          type: 'voice',
          confidence: 0.9
        })
      }
      responseSent = true
    }
    
    // Handle purpose/questions
    if (lowerTranscript.includes('what are you') || 
        lowerTranscript.includes('what do you want') ||
        lowerTranscript.includes('purpose')) {
      
      // Provide purpose response
      if (this.aiPanel) {
        this.aiPanel.addInsight({
          id: `purpose_${Date.now()}`,
          timestamp: Date.now(),
          content: "👩‍⚕️ My purpose is to assist you with diagnostic guidance. I can suggest scanning approaches, explain findings, and help with differential diagnosis.",
          type: 'voice',
          confidence: 0.9
        })
      }
      responseSent = true
    }
    
    // Handle help requests
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
      } else {
        // Provide general diagnostic guidance when no active session
        const generalGuidance = [
          "📋 Diagnostic approach: Systematically evaluate anatomical regions - bones, soft tissues, and organ contours",
          "💡 Scanning tip: Look for asymmetry, abnormal densities, or unexpected opacities",
          "🎯 Focus suggestion: Start with the center of the image and work outward in a spiral pattern",
          "🔍 Clinical correlation: Consider how radiological findings relate to the patient's chief complaint",
          "🔔 Reminder: Toggle condition markers with [C] to visualize pathology locations"
        ];
        
        generalGuidance.forEach((guidance, index) => {
          if (this.aiPanel) {
            this.aiPanel.addInsight({
              id: `general_guidance_${Date.now()}_${index}`,
              timestamp: Date.now(),
              content: `👩‍⚕️ Nurse Amy guidance: ${guidance}`,
              type: 'educational',
              confidence: 0.7
            })
          }
        })
      }
      responseSent = true
    }
    
    // For any other unrecognized commands, provide a helpful response
    if (!responseSent) {
      if (this.aiPanel) {
        this.aiPanel.addInsight({
          id: `unknown_${Date.now()}`,
          timestamp: Date.now(),
          content: "🤔 I'm not sure I understood that, Nurse Amy here. Try asking for 'help' or 'advice' for diagnostic guidance, or say 'hello' to chat with me! You can also try 'what should I look for?' or 'suggest a scanning approach'.",
          type: 'voice',
          confidence: 0.7
        })
      }
      
      // Provide some general tips even for unrecognized commands
      const tips = [
        "📋 Diagnostic tip: Toggle condition markers with [C] to visualize pathology locations",
        "💡 Efficiency tip: Focus on high-yield anatomical regions first",
        "🎯 Navigation tip: Move your mouse systematically across the image to scan",
        "🔍 Analysis tip: Look for asymmetry, abnormal densities, or unexpected findings"
      ];
      
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      if (this.aiPanel) {
        this.aiPanel.addInsight({
          id: `tip_${Date.now()}`,
          timestamp: Date.now(),
          content: `👩‍⚕️ Nurse Amy tip: ${randomTip}`,
          type: 'educational',
          confidence: 0.6
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
          content: '🎙️ Voice consultation activated - Analyzing patient data...',
          type: 'voice', // Mark as voice type for better visual distinction
          confidence: 0.5
        })
      }
      
      // Show voice active indicator in main diagnostic panel
      if (this.diagnosticUIManager) {
        this.diagnosticUIManager.showVoiceActiveIndicator()
      }

      // Generate AI insights based on current context
      const insights = await this.generateInsights(context)
      // Convert string insights to AIInsight objects
      this.currentSession.insights = insights.map((insight, index) => ({
        id: `insight_${Date.now()}_${index}`,
        timestamp: Date.now(),
        content: insight,
        type: this.getInsightType(insight),
        confidence: 0.8
      }))
      
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
      insights.push(`👩‍⚕️ Nurse Amy observation: You've discovered ${conditionsCount} condition${conditionsCount > 1 ? 's' : ''}. Consider how these findings might relate to each other.`)
    }
    
    // Add time-sensitive insight
    if (context.timeRemaining) {
      const minutes = Math.floor(context.timeRemaining / 60)
      const seconds = context.timeRemaining % 60
      insights.push(`⏰ Time alert: ${minutes}m ${seconds}s remaining. Focus on high-yield anatomical areas.`)
    }
    
    // Add educational insight based on patient case
    if (context.patientCase) {
      const chiefComplaint = context.patientCase.chiefComplaint || 'the symptoms'
      insights.push(`📋 Clinical correlation: The patient's chief complaint is \"${chiefComplaint}\". How do your radiological findings correlate?`)
    }
    
    // Add a general diagnostic tip
    insights.push("💡 Pro tip: Systematically evaluate bone structures, soft tissues, and organ contours in your field of view.")
    
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

  // ENHANCED: Generate sophisticated contextual medical insights
  private async generateInsights(context: ConsultationContext): Promise<string[]> {
    const insights: string[] = []
    
    // Personalize the greeting based on patient data
    const patientName = context.patientCase?.patientName || 'the patient'
    const chiefComplaint = context.patientCase?.chiefComplaint || 'the symptoms'
    
    insights.push(`👩‍⚕️ Nurse Amy here: Based on ${context.discoveredConditions.size} discovered condition${context.discoveredConditions.size !== 1 ? 's' : ''} in ${patientName}, let's consider the differential diagnosis`)
    
    // Analyze discovered conditions for patterns
    if (context.discoveredConditions.size > 0) {
      const conditionArray = Array.from(context.discoveredConditions)
      insights.push(`🔍 Analysis: You've identified ${conditionArray.join(', ')}. Consider if these conditions are related or independent.`)
      
      // Generate condition-specific clinical correlations
      conditionArray.forEach(condition => {
        const correlationInsight = this.generateClinicalCorrelation(condition, chiefComplaint)
        if (correlationInsight) insights.push(correlationInsight)
      })
    } else {
      insights.push(`📋 The patient's chief complaint is "${chiefComplaint}". Focus your scan on anatomical regions that could explain these symptoms.`)
    }
    
    // Time-based recommendation
    const timePercentage = 1 - (context.timeRemaining / (context.timeRemaining + (Date.now() - (context.patientCase?.sessionStartTime || Date.now())) / 1000))
    if (timePercentage > 0.7) {
      insights.push(`⏰ Time alert: You're running low on time. Focus on high-yield anatomical regions that could explain "${chiefComplaint}".`)
    } else {
      insights.push(`⏳ Time status: ${Math.floor(context.timeRemaining / 60)}m ${context.timeRemaining % 60}s remaining - sufficient time for thorough evaluation.`)
    }
    
    // Performance analysis based on scan progress
    const scanProgressValues = Array.from(context.scanProgress.values())
    if (scanProgressValues.length > 0) {
      const avgProgress = scanProgressValues.reduce((a, b) => a + b, 0) / scanProgressValues.length
      if (avgProgress < 0.3) {
        insights.push('💡 Scanning guidance: You\'re just starting your evaluation. Systematically scan all anatomical regions.')
      } else if (avgProgress > 0.8 && context.discoveredConditions.size === 0) {
        insights.push('⚠️ Pro tip: You\'ve scanned extensively but found no conditions. Reconsider the scan technique or anatomical focus areas.')
      }
    }
    
    // Add context-specific insights
    if (context.discoveredConditions.size === 0) {
      insights.push('🎯 First-time diagnostic tip: Start with systematic scanning - evaluate bone structures, soft tissues, and organ contours in a structured pattern')
    } else if (context.discoveredConditions.size >= 3) {
      insights.push('✅ Excellent progress! Consider submitting your diagnosis or continue scanning for additional findings to confirm your hypothesis.')
    }
    
    // Add clinical reasoning
    if (context.gamePhase === 'scanning') {
      insights.push('🔍 Scanning phase: Focus on identifying abnormalities. Look for asymmetry, unexpected densities, or structural changes.')
    } else if (context.gamePhase === 'analyzing') {
      insights.push('🧠 Analysis phase: Correlate findings with clinical presentation. Consider pathophysiology and differential diagnosis.')
    }
    
    // Performance-based recommendation
    if (context.currentScore > 500) {
      insights.push('🏆 High performance noticed! Consider advancing to more complex cases or focusing on subtle findings.')
    } else if (context.currentScore < 200 && context.discoveredConditions.size === 0) {
      insights.push('💡 Don\'t worry about the score yet. Focus on learning anatomical landmarks and pathology recognition.')
    }
    
    return insights
  }

  // Generate clinical correlations for discovered conditions
  private generateClinicalCorrelation(conditionId: string, chiefComplaint: string): string | null {
    // Map of conditions to clinical correlations
    const correlations: Record<string, string> = {
      'temporomandibular_disorder': `The TMJ dysfunction you discovered might correlate with facial pain symptoms in "${chiefComplaint}".`,
      'dental_abscess': `A dental abscess could explain fever or pain symptoms mentioned in "${chiefComplaint}".`,
      'sinusitis': `Sinus pathology might contribute to facial pressure or headache symptoms in the chief complaint.`,
      'pneumonia': `Lung infiltrates could explain respiratory symptoms in "${chiefComplaint}".`,
      'fracture': `Bone disruption might explain trauma-related symptoms or pain.`,
      'cardiomegaly': `An enlarged heart might correlate with cardiovascular symptoms or risk factors.`,
      'pleural_effusion': `Fluid around the lungs could explain respiratory symptoms in the presentation.`
    }
    
    // Look for condition patterns in medical data
    if (Object.keys(correlations).includes(conditionId)) {
      return `🔗 Clinical correlation: ${correlations[conditionId]}`
    }
    
    // Generic correlation if specific one not found
    return `🔗 Clinical correlation: The condition "${conditionId}" you discovered should be considered in the context of "${chiefComplaint}".`
  }

  private getRecommendedScanArea(context: ConsultationContext): string {
    // More sophisticated logic to recommend scan areas based on progress and conditions
    const conditionAreas: Record<string, string[]> = {
      'head': ['temporomandibular joint', 'sinuses', 'skull structures'],
      'torso': ['cardiac region', 'pulmonary fields', 'mediastinum', 'diaphragm'],
      'fullbody': ['skeletal structures', 'organs', 'soft tissues']
    }
    
    // If we know the patient case model, recommend appropriate areas
    const modelType = context.patientCase?.requiredModel || 'head'
    const areas = conditionAreas[modelType as keyof typeof conditionAreas] || 
                  ['cardiac region', 'pulmonary fields', 'skeletal structures', 'soft tissues']
    
    // Prioritize areas not yet thoroughly scanned
    const leastScanned = this.findLeastScannedArea(context)
    if (leastScanned) return leastScanned
    
    return areas[Math.floor(Math.random() * areas.length)]
  }
  
  // Find the anatomical area with the least scan progress
  private findLeastScannedArea(context: ConsultationContext): string | null {
    if (!context.scanProgress || context.scanProgress.size === 0) return null
    
    // Find the condition with the lowest progress
    let minProgress = 1
    let minConditionId = null
    
    for (const [conditionId, progress] of context.scanProgress.entries()) {
      if (progress < minProgress) {
        minProgress = progress
        minConditionId = conditionId
      }
    }
    
    // For now, return the condition ID if found, since we can't easily import medical data here
    // In a real implementation, we'd want to get the human-readable name
    return minConditionId
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
    
    // Hide voice active indicator in main diagnostic panel
    if (this.diagnosticUIManager) {
      this.diagnosticUIManager.hideVoiceActiveIndicator()
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
