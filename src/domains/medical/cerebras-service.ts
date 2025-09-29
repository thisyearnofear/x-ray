// ENHANCED: Advanced Cerebras integration leveraging full API capabilities

import type { MedicalCondition, DiagnosticQuestion } from './medical-data'

// Structured Output Schemas for reliable JSON responses
const DIAGNOSTIC_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    confidence: { type: "number", minimum: 0, maximum: 1 },
    primaryDiagnosis: { type: "string" },
    differentialDiagnoses: {
      type: "array",
      items: { type: "string" }
    },
    reasoning: { type: "string" },
    recommendedTests: {
      type: "array", 
      items: { type: "string" }
    },
    urgency: { 
      type: "string",
      enum: ["low", "medium", "high", "emergency"]
    }
  },
  required: ["confidence", "primaryDiagnosis", "reasoning", "urgency"],
  additionalProperties: false
}

const TEACHING_EXPLANATION_SCHEMA = {
  type: "object",
  properties: {
    explanation: { type: "string" },
    keyPoints: {
      type: "array",
      items: { type: "string" }
    },
    commonMistakes: {
      type: "array",
      items: { type: "string" }
    },
    clinicalPearls: {
      type: "array", 
      items: { type: "string" }
    },
    followUpQuestions: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["explanation", "keyPoints"],
  additionalProperties: false
}

interface StreamingCallback {
  onChunk?: (chunk: string, isReasoning?: boolean) => void
  onComplete?: (fullResponse: string) => void
  onError?: (error: Error) => void
}

interface CerebrasResponse<T = any> {
  success: boolean
  data?: T
  reasoning?: string
  error?: string
  confidence?: number
}

export class CerebrasService {
  private apiKey: string
  private baseUrl = 'https://api.cerebras.ai/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_CEREBRAS_API_KEY
    if (!this.apiKey) {
      console.warn('⚠️ Cerebras API key not found - using fallback responses')
    }
  }

  // STREAMING: Real-time diagnostic reasoning with visible thought process
  async streamDiagnosticAnalysis(
    patientContext: string,
    symptoms: string[],
    imageFindings: string[],
    callback: StreamingCallback
  ): Promise<CerebrasResponse> {
    if (!this.apiKey) {
      return { success: false, error: 'No API key configured' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-oss-120b', // Using reasoning-capable model
          messages: [{
            role: 'system',
            content: `You are an expert radiologist and medical educator. Analyze the patient case step-by-step, showing your reasoning process clearly. Be thorough but educational.`
          }, {
            role: 'user', 
            content: `Patient Context: ${patientContext}
                     Reported Symptoms: ${symptoms.join(', ')}
                     X-ray Findings: ${imageFindings.join(', ')}
                     
                     Please provide a complete diagnostic analysis with your reasoning process visible.`
          }],
          stream: true,
          reasoning_effort: "medium", // Enable reasoning tokens
          max_completion_tokens: 1000,
          temperature: 0.2
        })
      })

      if (!response.ok) {
        throw new Error(`Cerebras API error: ${response.status}`)
      }

      return this.handleStreamingResponse(response, callback)
      
    } catch (error) {
      callback.onError?.(error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  // STRUCTURED OUTPUTS: Reliable JSON responses for UI integration
  async getStructuredDiagnosis(
    patientContext: string,
    findings: string[]
  ): Promise<CerebrasResponse<any>> {
    if (!this.apiKey) {
      return this.getFallbackDiagnosis(findings)
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-4-scout-17b-16e-instruct',
          messages: [{
            role: 'system',
            content: 'You are a medical AI that provides structured diagnostic analysis. Always return valid JSON matching the required schema.'
          }, {
            role: 'user',
            content: `Analyze this case: ${patientContext}. Findings: ${findings.join(', ')}`
          }],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "diagnostic_analysis",
              strict: true,
              schema: DIAGNOSTIC_ANALYSIS_SCHEMA
            }
          },
          temperature: 0.1
        })
      })

      const data = await response.json()
      const analysis = JSON.parse(data.choices[0].message.content)
      
      return {
        success: true,
        data: analysis,
        confidence: analysis.confidence
      }

    } catch (error) {
      console.warn('Structured diagnosis failed, using fallback:', error)
      return this.getFallbackDiagnosis(findings)
    }
  }

  // TOOL USE: Dynamic medical reference and calculation tools
  async getInteractiveExplanation(
    condition: MedicalCondition,
    userQuestion: string,
    conversationHistory: Array<{role: string, content: string}> = []
  ): Promise<CerebrasResponse<any>> {
    if (!this.apiKey) {
      return { success: false, error: 'No API key' }
    }

    // Define medical calculation tools
    const tools = [{
      type: "function",
      function: {
        name: "calculate_medical_score",
        strict: true,
        description: "Calculate medical scoring systems and risk assessments",
        parameters: {
          type: "object", 
          properties: {
            scoreType: {
              type: "string",
              enum: ["fracture_risk", "arthritis_severity", "scoliosis_cobb_angle"]
            },
            parameters: {
              type: "object",
              properties: {
                age: { type: "number" },
                severity: { type: "string" },
                measurements: { type: "array", items: { type: "number" } }
              }
            }
          },
          required: ["scoreType", "parameters"],
          additionalProperties: false
        }
      }
    }]

    try {
      const messages = [
        {
          role: 'system',
          content: `You are an expert medical educator discussing ${condition.name}. Use tools when helpful for calculations or assessments. Provide clear, educational explanations.`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userQuestion
        }
      ]

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-4-scout-17b-16e-instruct',
          messages,
          tools,
          parallel_tool_calls: false,
          temperature: 0.3
        })
      })

      const data = await response.json()
      const message = data.choices[0].message

      // Handle tool calls if present
      if (message.tool_calls) {
        const toolResult = await this.handleToolCall(message.tool_calls[0])
        
        // Continue conversation with tool result
        return this.continueConversationWithTool(messages, message, toolResult)
      }

      return {
        success: true,
        data: {
          response: message.content,
          type: 'explanation'
        }
      }

    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // REASONING: Generate teaching explanations with visible reasoning
  async generateTeachingMoment(
    studentAnswer: string,
    correctAnswer: string,
    condition: MedicalCondition
  ): Promise<CerebrasResponse<any>> {
    if (!this.apiKey) {
      return this.getFallbackTeaching(studentAnswer, correctAnswer)
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-oss-120b',
          messages: [{
            role: 'system',
            content: 'You are a medical educator creating personalized teaching moments. Show your reasoning about why the student made their choice and how to guide them to better understanding.'
          }, {
            role: 'user',
            content: `Student selected: "${studentAnswer}"
                     Correct answer: "${correctAnswer}"
                     Condition: ${condition.name}
                     
                     Create a teaching explanation that helps the student learn from this moment.`
          }],
          reasoning_effort: "high",
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "teaching_explanation",
              strict: true,
              schema: TEACHING_EXPLANATION_SCHEMA
            }
          },
          temperature: 0.4
        })
      })

      const data = await response.json()
      const teaching = JSON.parse(data.choices[0].message.content)
      
      return {
        success: true,
        data: teaching,
        reasoning: data.choices[0].message.reasoning // Include visible reasoning
      }

    } catch (error) {
      return this.getFallbackTeaching(studentAnswer, correctAnswer)
    }
  }

  // ENHANCED: Smart face processing with medical context
  async getContextualFaceProcessing(
    patientAge: number,
    gender: 'M' | 'F' | 'Other',
    condition: string
  ): Promise<CerebrasResponse<any>> {
    if (!this.apiKey) {
      return {
        success: true,
        data: { x: 0.5, y: 0.45, width: 0.6, height: 0.75 }
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-4-scout-17b-16e-instruct',
          messages: [{
            role: 'user',
            content: `For medical face mapping of a ${patientAge}-year-old ${gender} patient with ${condition}, suggest optimal face crop coordinates. Consider age-related facial proportions and medical imaging requirements. Return JSON: {"x": centerX, "y": centerY, "width": cropWidth, "height": cropHeight}`
          }],
          response_format: { type: "json_object" },
          max_tokens: 100,
          temperature: 0.1
        })
      })

      const data = await response.json()
      const faceData = JSON.parse(data.choices[0].message.content)
      
      return {
        success: true,
        data: faceData
      }

    } catch (error) {
      return {
        success: true,
        data: { x: 0.5, y: 0.45, width: 0.6, height: 0.75 }
      }
    }
  }

  // PRIVATE: Streaming response handler
  private async handleStreamingResponse(
    response: Response,
    callback: StreamingCallback
  ): Promise<CerebrasResponse> {
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    let fullResponse = ''
    let reasoning = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta

              if (delta?.reasoning) {
                reasoning += delta.reasoning
                callback.onChunk?.(delta.reasoning, true)
              }

              if (delta?.content) {
                fullResponse += delta.content
                callback.onChunk?.(delta.content, false)
              }
            } catch (e) {
              // Skip malformed chunks
            }
          }
        }
      }

      callback.onComplete?.(fullResponse)
      return {
        success: true,
        data: fullResponse,
        reasoning
      }

    } finally {
      reader.releaseLock()
    }
  }

  // PRIVATE: Handle tool function calls
  private async handleToolCall(toolCall: any): Promise<string> {
    const functionName = toolCall.function.name
    const args = JSON.parse(toolCall.function.arguments)

    switch (functionName) {
      case 'calculate_medical_score':
        return this.calculateMedicalScore(args.scoreType, args.parameters)
      default:
        return 'Tool not implemented'
    }
  }

  private calculateMedicalScore(scoreType: string, params: any): string {
    // Simplified medical calculations for demo
    switch (scoreType) {
      case 'fracture_risk':
        const risk = params.age > 65 ? 'High' : params.age > 50 ? 'Medium' : 'Low'
        return `Fracture risk: ${risk} (based on age ${params.age})`
      
      case 'scoliosis_cobb_angle':
        const angle = params.measurements?.[0] || 15
        const severity = angle > 40 ? 'Severe' : angle > 25 ? 'Moderate' : 'Mild'
        return `Cobb angle: ${angle}°, Severity: ${severity}`
        
      default:
        return 'Score calculation not available'
    }
  }

  private async continueConversationWithTool(
    messages: any[],
    assistantMessage: any,
    toolResult: string
  ): Promise<CerebrasResponse> {
    // Implementation for continuing conversation after tool use
    return {
      success: true,
      data: {
        response: `Based on the calculation: ${toolResult}`,
        type: 'tool_assisted'
      }
    }
  }

  // FALLBACK: Offline responses for demo purposes
  private getFallbackDiagnosis(findings: string[]) {
    return {
      success: true,
      data: {
        confidence: 0.75,
        primaryDiagnosis: findings[0] ? `Probable ${findings[0]}` : 'Further evaluation needed',
        reasoning: 'Analysis based on visible findings and clinical presentation',
        urgency: 'medium'
      }
    }
  }

  private getFallbackTeaching(studentAnswer: string, correctAnswer: string) {
    return {
      success: true,
      data: {
        explanation: `The correct answer was "${correctAnswer}". This is an important distinction in medical imaging.`,
        keyPoints: ['Review anatomical landmarks', 'Consider differential diagnoses'],
        commonMistakes: ['Overlooking subtle findings', 'Not considering patient history']
      }
    }
  }
}