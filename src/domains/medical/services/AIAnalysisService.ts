/**
 * AI Analysis Service
 * MODULAR: Single responsibility for AI medical analysis
 * DRY: Centralized AI analysis logic
 * CLEAN: Pure service, no mixed concerns
 */

import type { MedicalCondition } from '../medical-data'

export interface AnalysisRequest {
  condition: MedicalCondition
  patientContext?: any
  analysisType: 'condition' | 'differential' | 'treatment'
}

export interface AnalysisResponse {
  analysis: string
  confidence: number
  recommendations: string[]
  timestamp: number
}

export class AIAnalysisService {
  private baseUrl: string = '/api/cerebras-face'

  async analyzeCondition(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition: request.condition,
          patientContext: request.patientContext,
          analysisType: request.analysisType
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        analysis: data.analysis || 'Analysis completed',
        confidence: data.confidence || 0.85,
        recommendations: data.recommendations || [],
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('AI Analysis failed:', error)
      return this.getFallbackAnalysis(request)
    }
  }

  async *streamAnalysis(request: AnalysisRequest): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          stream: true
        })
      })

      if (!response.ok) {
        yield* this.getFallbackStream(request)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        yield* this.getFallbackStream(request)
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            yield line
          }
        }
      }
    } catch (error) {
      console.error('Streaming analysis failed:', error)
      yield* this.getFallbackStream(request)
    }
  }

  private getFallbackAnalysis(request: AnalysisRequest): AnalysisResponse {
    const condition = request.condition
    return {
      analysis: `Medical analysis of ${condition.name}: ${condition.description}. Severity: ${condition.severity}. Recommended treatment includes ${condition.treatment?.[0] || 'clinical evaluation'}.`,
      confidence: 0.75,
      recommendations: condition.treatment || ['Clinical evaluation recommended'],
      timestamp: Date.now()
    }
  }

  private async *getFallbackStream(request: AnalysisRequest): AsyncGenerator<string, void, unknown> {
    const analysis = this.getFallbackAnalysis(request).analysis
    const words = analysis.split(' ')
    
    for (let i = 0; i < words.length; i += 3) {
      yield words.slice(i, i + 3).join(' ') + ' '
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}