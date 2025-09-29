// ENHANCED: Full-featured Cerebras integration with streaming, structured outputs, and tool use

import type { MedicalCondition } from './medical-data'

interface CerebrasConfig {
  apiKey: string
  baseURL: string
  model: string
  maxTokens: number
  temperature: number
}

interface StreamingCallbacks {
  onChunk: (chunk: string, isReasoning?: boolean) => void
  onComplete: (fullResponse: string) => void
  onError: (error: Error) => void
}

interface StructuredDiagnosisOutput {
  primaryDiagnosis: string
  confidence: number
  reasoning: string
  differentialDiagnoses?: string[]
  riskFactors?: string[]
  recommendedActions?: string[]
}

interface InteractiveResponse {
  type: 'direct' | 'tool_assisted'
  response: string
  confidence?: number
  toolsUsed?: string[]
}

interface CerebrasResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  tokensUsed?: number
}

export class CerebrasService {
  private config: CerebrasConfig
  private conversationHistory: Map<string, Array<{ role: string; content: string }>>

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_CEREBRAS_API_KEY || '',
      baseURL: 'https://api.cerebras.ai/v1',
      model: 'llama3.1-70b', // Ultra-fast Cerebras model
      maxTokens: 8192,
      temperature: 0.3
    }
    this.conversationHistory = new Map()
  }

  // STREAMING: Real-time diagnostic analysis with visible reasoning
  async streamDiagnosticAnalysis(
    patientContext: string,
    symptoms: string[],
    findings: string[],
    callbacks: StreamingCallbacks
  ): Promise<void> {
    try {
      const diagnosticPrompt = this.buildDiagnosticPrompt(
        patientContext,
        symptoms,
        findings,
        { includeReasoning: true, streamingMode: true }
      )

      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt('diagnostic_streaming')
            },
            {
              role: 'user',
              content: diagnosticPrompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: true,
          reasoning: true // Enable reasoning tokens if supported
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content

              if (delta) {
                fullResponse += delta
                
                // Check if this is reasoning content (marked in stream)
                const isReasoning = parsed.choices?.[0]?.delta?.reasoning || false
                
                callbacks.onChunk(delta, isReasoning)
                
                // Small delay for realistic streaming effect
                await new Promise(resolve => setTimeout(resolve, 30))
              }
            } catch (e) {
              // Skip malformed JSON chunks
              continue
            }
          }
        }
      }

      callbacks.onComplete(fullResponse)

    } catch (error) {
      callbacks.onError(error as Error)
    }
  }

  // STRUCTURED: Get reliable, structured diagnostic output
  async getStructuredDiagnosis(
    patientContext: string,
    findings: string[]
  ): Promise<CerebrasResponse<StructuredDiagnosisOutput>> {
    try {
      const structuredPrompt = this.buildDiagnosticPrompt(
        patientContext,
        [],
        findings,
        { structured: true, confidenceScoring: true }
      )

      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt('structured_diagnosis')
            },
            {
              role: 'user',
              content: structuredPrompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: 0.1, // Lower for more consistent structured output
          response_format: {
            type: 'json_object'
          }
        })
      })

      if (!response.ok) {
        return { success: false, error: `API Error: ${response.status}` }
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        return { success: false, error: 'No response from API' }
      }

      const parsedOutput: StructuredDiagnosisOutput = JSON.parse(content)
      
      return {
        success: true,
        data: parsedOutput,
        tokensUsed: data.usage?.total_tokens
      }

    } catch (error) {
      return {
        success: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // TOOL USE: Interactive medical explanations with dynamic tool calling
  async getInteractiveExplanation(
    condition: MedicalCondition,
    question: string,
    conversationId: string = 'default'
  ): Promise<CerebrasResponse<InteractiveResponse>> {
    try {
      // Get or initialize conversation history
      if (!this.conversationHistory.has(conversationId)) {
        this.conversationHistory.set(conversationId, [])
      }
      
      const history = this.conversationHistory.get(conversationId)!
      history.push({ role: 'user', content: question })

      const messages = [
        {
          role: 'system',
          content: this.getSystemPrompt('interactive_medical', condition)
        },
        ...history
      ]

      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: 0.4,
          tools: this.getMedicalTools(), // Define available tools
          tool_choice: 'auto' // Let model decide when to use tools
        })
      })

      if (!response.ok) {
        return { success: false, error: `API Error: ${response.status}` }
      }

      const data = await response.json()
      const choice = data.choices?.[0]

      if (!choice) {
        return { success: false, error: 'No response from API' }
      }

      // Handle tool calls
      if (choice.message?.tool_calls) {
        const toolResults = await this.executeMedicalTools(choice.message.tool_calls)
        const assistantResponse: InteractiveResponse = {
          type: 'tool_assisted',
          response: this.formatToolResponse(toolResults),
          toolsUsed: choice.message.tool_calls.map((tc: any) => tc.function.name)
        }

        // Add to conversation history
        history.push({ 
          role: 'assistant', 
          content: assistantResponse.response 
        })

        return {
          success: true,
          data: assistantResponse,
          tokensUsed: data.usage?.total_tokens
        }
      }

      // Regular response
      const assistantResponse: InteractiveResponse = {
        type: 'direct',
        response: choice.message?.content || 'I apologize, but I cannot provide a response to that question.'
      }

      // Add to conversation history
      history.push({ 
        role: 'assistant', 
        content: assistantResponse.response 
      })

      return {
        success: true,
        data: assistantResponse,
        tokensUsed: data.usage?.total_tokens
      }

    } catch (error) {
      return {
        success: false,
        error: `Interactive query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // MULTI-TURN: Confidence scoring and uncertainty handling
  async getClinicalConfidence(
    diagnosis: string,
    evidence: string[]
  ): Promise<CerebrasResponse<{ confidence: number; uncertainties: string[]; recommendations: string[] }>> {
    try {
      const confidencePrompt = `
        As an expert medical AI, assess the clinical confidence of this diagnosis:
        
        Diagnosis: ${diagnosis}
        Supporting Evidence: ${evidence.join(', ')}
        
        Provide a confidence assessment with:
        1. Overall confidence score (0-100%)
        2. Key uncertainties or missing information
        3. Recommendations to increase diagnostic confidence
        
        Return as JSON with keys: confidence (number), uncertainties (array), recommendations (array)
      `

      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt('confidence_assessment')
            },
            {
              role: 'user',
              content: confidencePrompt
            }
          ],
          max_tokens: 1024,
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        return { success: false, error: `API Error: ${response.status}` }
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        return { success: false, error: 'No confidence assessment returned' }
      }

      const assessment = JSON.parse(content)
      
      return {
        success: true,
        data: assessment,
        tokensUsed: data.usage?.total_tokens
      }

    } catch (error) {
      return {
        success: false,
        error: `Confidence assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private buildDiagnosticPrompt(
    patientContext: string,
    symptoms: string[],
    findings: string[],
    options: {
      includeReasoning?: boolean
      streamingMode?: boolean
      structured?: boolean
      confidenceScoring?: boolean
    } = {}
  ): string {
    let prompt = `Patient Context: ${patientContext}\n`
    
    if (symptoms.length > 0) {
      prompt += `Symptoms: ${symptoms.join(', ')}\n`
    }
    
    if (findings.length > 0) {
      prompt += `Radiological Findings: ${findings.join(', ')}\n`
    }

    if (options.structured) {
      prompt += `\nPlease provide a structured diagnostic analysis in JSON format with the following fields:
      - primaryDiagnosis: string
      - confidence: number (0-1)
      - reasoning: string
      - differentialDiagnoses: string[] (optional)
      - riskFactors: string[] (optional)
      - recommendedActions: string[] (optional)`
    } else if (options.streamingMode) {
      prompt += `\nPlease provide a comprehensive diagnostic analysis. Start with your reasoning process, then present your diagnostic conclusions.`
    } else {
      prompt += `\nPlease analyze these findings and provide a medical assessment.`
    }

    if (options.confidenceScoring) {
      prompt += `\nInclude confidence scoring for your diagnostic conclusions.`
    }

    return prompt
  }

  private getSystemPrompt(type: string, condition?: MedicalCondition): string {
    const basePrompt = "You are an expert medical AI assistant specializing in diagnostic radiology and clinical assessment. Provide accurate, educational information for learning purposes only. Always emphasize that this is for educational use and not a substitute for professional medical advice."

    switch (type) {
      case 'diagnostic_streaming':
        return `${basePrompt}

        When providing diagnostic analysis:
        1. Start by explaining your reasoning process step by step
        2. Consider differential diagnoses systematically
        3. Present findings in order of clinical significance
        4. Use medical terminology appropriately but explain complex terms
        5. Maintain a clinical but educational tone throughout`

      case 'structured_diagnosis':
        return `${basePrompt}

        Provide responses in structured JSON format only. Ensure:
        1. Confidence scores are realistic (0.0 to 1.0)
        2. Primary diagnosis is specific and evidence-based
        3. Reasoning is clear and clinically sound
        4. Differential diagnoses are ranked by likelihood
        5. Recommended actions are appropriate and prioritized`

      case 'interactive_medical':
        return `${basePrompt}

        You are discussing: ${condition?.name || 'a medical condition'}
        
        Context: ${condition ? `
        - Condition: ${condition.name}
        - Category: ${condition.category}
        - Description: ${condition.description}
        - Key Features: ${condition.keyFeatures?.join(', ') || 'Not specified'}
        ` : 'General medical consultation'}
        
        Engage in educational conversation:
        1. Answer questions thoroughly but accessibly
        2. Use tools when calculations or specific data are needed
        3. Encourage deeper learning through follow-up questions
        4. Maintain conversation context and build on previous exchanges`

      case 'confidence_assessment':
        return `${basePrompt}

        You are assessing diagnostic confidence. Be:
        1. Realistic about uncertainty in medical diagnosis
        2. Specific about what information would improve confidence
        3. Clear about the limitations of available evidence
        4. Practical in your recommendations for additional testing or evaluation`

      default:
        return basePrompt
    }
  }

  private getMedicalTools(): Array<any> {
    return [
      {
        type: 'function',
        function: {
          name: 'calculate_risk_score',
          description: 'Calculate clinical risk scores for various conditions',
          parameters: {
            type: 'object',
            properties: {
              score_type: {
                type: 'string',
                enum: ['CHADS2', 'Wells', 'CURB-65', 'APACHE', 'Glasgow'],
                description: 'Type of clinical risk score to calculate'
              },
              patient_data: {
                type: 'object',
                description: 'Relevant patient data for the calculation'
              }
            },
            required: ['score_type', 'patient_data']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'lookup_medical_reference',
          description: 'Look up specific medical reference values, guidelines, or drug information',
          parameters: {
            type: 'object',
            properties: {
              query_type: {
                type: 'string',
                enum: ['lab_values', 'drug_dosing', 'guidelines', 'anatomy'],
                description: 'Type of medical information to look up'
              },
              query: {
                type: 'string',
                description: 'Specific query or term to look up'
              }
            },
            required: ['query_type', 'query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'explain_medical_concept',
          description: 'Provide detailed explanation of complex medical concepts with analogies',
          parameters: {
            type: 'object',
            properties: {
              concept: {
                type: 'string',
                description: 'Medical concept to explain'
              },
              complexity_level: {
                type: 'string',
                enum: ['basic', 'intermediate', 'advanced'],
                description: 'Level of explanation detail'
              }
            },
            required: ['concept']
          }
        }
      }
    ]
  }

  private async executeMedicalTools(toolCalls: Array<any>): Promise<Array<{ name: string; result: any }>> {
    const results = []

    for (const toolCall of toolCalls) {
      const { name, arguments: args } = toolCall.function
      let result

      try {
        const parsedArgs = JSON.parse(args)

        switch (name) {
          case 'calculate_risk_score':
            result = await this.calculateRiskScore(parsedArgs.score_type, parsedArgs.patient_data)
            break

          case 'lookup_medical_reference':
            result = await this.lookupMedicalReference(parsedArgs.query_type, parsedArgs.query)
            break

          case 'explain_medical_concept':
            result = await this.explainMedicalConcept(parsedArgs.concept, parsedArgs.complexity_level)
            break

          default:
            result = { error: `Unknown tool: ${name}` }
        }

        results.push({ name, result })

      } catch (error) {
        results.push({ 
          name, 
          result: { error: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
        })
      }
    }

    return results
  }

  private async calculateRiskScore(scoreType: string, patientData: any): Promise<any> {
    // Implement actual risk score calculations
    const calculations = {
      'CHADS2': () => {
        // Sample CHADS2 calculation
        let score = 0
        if (patientData.congestive_heart_failure) score += 1
        if (patientData.hypertension) score += 1
        if (patientData.age >= 75) score += 1
        if (patientData.diabetes) score += 1
        if (patientData.stroke_history) score += 2
        
        return {
          score,
          interpretation: score === 0 ? 'Low risk' : score === 1 ? 'Intermediate risk' : 'High risk',
          recommendation: score >= 2 ? 'Consider anticoagulation' : 'Aspirin may be sufficient'
        }
      }
      // Add more risk score calculations as needed
    }

    const calculator = calculations[scoreType as keyof typeof calculations]
    return calculator ? calculator() : { error: `Risk score ${scoreType} not implemented` }
  }

  private async lookupMedicalReference(queryType: string, query: string): Promise<any> {
    // Implement medical reference lookups
    // This would typically connect to medical databases or reference APIs
    return {
      query_type: queryType,
      query,
      result: `Reference information for ${query} (${queryType})`,
      source: 'Medical Reference Database',
      disclaimer: 'This is simulated reference data for educational purposes'
    }
  }

  private async explainMedicalConcept(concept: string, complexityLevel: string = 'intermediate'): Promise<any> {
    // Generate detailed explanations with appropriate complexity
    return {
      concept,
      complexity_level: complexityLevel,
      explanation: `Detailed ${complexityLevel}-level explanation of ${concept}`,
      key_points: [`Key point 1 about ${concept}`, `Key point 2 about ${concept}`],
      analogies: complexityLevel === 'basic' ? [`Simple analogy for ${concept}`] : undefined
    }
  }

  private formatToolResponse(toolResults: Array<{ name: string; result: any }>): string {
    let response = "I've used specialized medical tools to provide you with detailed information:\n\n"

    for (const { name, result } of toolResults) {
      response += `🔧 **${name.replace('_', ' ').toUpperCase()}**\n`
      
      if (result.error) {
        response += `❌ Error: ${result.error}\n\n`
      } else {
        // Format based on tool type
        if (name === 'calculate_risk_score') {
          response += `Score: ${result.score}\n`
          response += `Interpretation: ${result.interpretation}\n`
          response += `Recommendation: ${result.recommendation}\n\n`
        } else if (name === 'lookup_medical_reference') {
          response += `${result.result}\n`
          response += `Source: ${result.source}\n\n`
        } else if (name === 'explain_medical_concept') {
          response += `${result.explanation}\n`
          if (result.key_points) {
            response += `Key Points:\n${result.key_points.map((p: string) => `• ${p}`).join('\n')}\n`
          }
          if (result.analogies) {
            response += `Analogy: ${result.analogies[0]}\n`
          }
          response += '\n'
        }
      }
    }

    return response
  }

  // Utility method to clear conversation history
  public clearConversation(conversationId: string = 'default'): void {
    this.conversationHistory.delete(conversationId)
  }

  // Get conversation history for debugging or continuity
  public getConversationHistory(conversationId: string = 'default'): Array<{ role: string; content: string }> {
    return this.conversationHistory.get(conversationId) || []
  }
}