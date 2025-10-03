import Cerebras from '@cerebras/cerebras_cloud_sdk'
import type { MedicalCondition } from './medical-data'

// MODULAR: Enhanced Cerebras service with streaming and medical analysis
export class CerebrasService {
  private client: Cerebras

  constructor() {
    this.client = new Cerebras({
      apiKey: import.meta.env.VITE_CEREBRAS_API_KEY,
      maxRetries: 2,
      timeout: 30000,
      warmTCPConnection: false // Disable TCP warming to prevent 503 errors
    })
  }

  // PERFORMANT: Streaming medical analysis for real-time feedback
  async *analyzeMedicalCondition(condition: MedicalCondition): AsyncGenerator<string> {
    try {
      const stream = await this.client.chat.completions.create({
        model: 'llama3.1-8b',
        messages: [{
          role: 'user',
          content: `Analyze ${condition.name}: symptoms, causes, treatment options. Be concise and educational.`
        }],
        stream: true,
        temperature: 0.3
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) yield content
      }
    } catch (error) {
      yield `${condition.name}: ${condition.description}. Symptoms: ${condition.symptoms.join(', ')}. Treatment: ${condition.treatment.join(', ')}.`
    }
  }

  // CLEAN: Simple case generation with proper error handling
  async generateDynamicCase(anatomicalModel: string, difficulty: number = 3) {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama3.1-8b',
        messages: [{
          role: 'system',
          content: 'You are a medical educator. Generate realistic patient cases as valid JSON only.'
        }, {
          role: 'user',
          content: `Create a ${anatomicalModel} case, difficulty ${difficulty}/5. JSON format: {patientInfo:{name,age,gender,chiefComplaint}, conditions:[], difficulty, educationalValue, learningObjectives:[]}`
        }],
        temperature: 0.7,
        max_tokens: 500
      })

      const content = completion.choices[0]?.message?.content?.trim()
      if (!content) throw new Error('Empty response')

      // CLEAN: Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : content
      
      return { success: true, data: JSON.parse(jsonStr) }

    } catch (error) {
      return this.getFallbackCase(anatomicalModel, difficulty)
    }
  }

  // DRY: Single fallback method
  private getFallbackCase(model: string, difficulty: number) {
    const cases = {
      head: { condition: 'TMJ disorder', area: 'jaw and neck' },
      torso: { condition: 'thoracic strain', area: 'upper back' },
      fullbody: { condition: 'lumbar strain', area: 'lower back' }
    }
    
    const caseInfo = cases[model as keyof typeof cases] || cases.head

    return {
      success: false,
      data: {
        patientInfo: {
          name: "Alex Johnson",
          age: 32,
          gender: "M",
          chiefComplaint: `Pain in ${caseInfo.area}`
        },
        conditions: [caseInfo.condition],
        difficulty,
        educationalValue: `Learn to diagnose ${caseInfo.condition}`,
        learningObjectives: ["Identify symptoms", "Recommend treatment"]
      }
    }
  }
}
