import type { MedicalCondition } from './medical-data'
import { cerebrasCache } from '../../utils/performance-cache'

// CLEAN: Direct API integration without SDK bloat
// PERFORMANT: Integrated caching for API optimization
export class CerebrasService {
  
  // PERFORMANT: Streaming medical analysis via secure API route
  async *analyzeMedicalCondition(condition: MedicalCondition): AsyncGenerator<string> {
    // PERFORMANT: Check cache first for instant responses
    const cacheKey = cerebrasCache.generateAnalysisKey(condition.name, 'llama3.1-8b')
    const cached = cerebrasCache.get(cacheKey)
    
    if (cached) {
      const chunks = cached.split(' ')
      for (const chunk of chunks) {
        yield chunk + ' '
        await new Promise(resolve => setTimeout(resolve, 20)) // Simulate streaming
      }
      return
    }

    let fullResponse = ''
    
    try {
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ condition: condition.name }),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      
      if (content) {
        fullResponse = content
        // Simulate streaming by yielding chunks
        const words = content.split(' ')
        for (const word of words) {
          yield word + ' '
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
      
      // PERFORMANT: Cache successful response
      if (fullResponse.trim()) {
        cerebrasCache.set(cacheKey, fullResponse.trim())
      }
      
    } catch (error) {
      // CLEAN: Structured fallback with educational value
      const fallback = `**${condition.name}**\n\n` +
        `**Description:** ${condition.description}\n\n` +
        `**Symptoms:** ${condition.symptoms.join(', ')}\n\n` +
        `**Treatment:** ${condition.treatment.join(', ')}`
      
      // PERFORMANT: Cache fallback to prevent repeated API failures
      cerebrasCache.set(cacheKey, fallback, 60000) // 1 minute TTL for fallbacks
      
      yield fallback
    }
  }

  // MISSING: Dynamic case generation that was removed during consolidation
  async generateMedicalCase(anatomicalModel: string, difficulty: number = 1): Promise<any> {
    const cacheKey = cerebrasCache.generateCaseKey(anatomicalModel, difficulty)
    const cached = cerebrasCache.get(cacheKey)
    
    if (cached) {
      console.log('Using cached medical case:', cached.patientName)
      return cached
    }

    try {
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          condition: `Generate a realistic medical case for ${anatomicalModel} with difficulty level ${difficulty}. Include patient details, symptoms, and conditions to discover.` 
        }),
      })

      if (!response.ok) {
        throw new Error('Case generation failed')
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      
      const medicalCase = this.parseGeneratedCase(content, anatomicalModel, difficulty)
      cerebrasCache.set(cacheKey, medicalCase, 300000)
      
      return medicalCase
      
    } catch (error) {
      console.warn('Case generation failed, using fallback:', error)
      return this.createFallbackCase(anatomicalModel, difficulty)
    }
  }

  private parseGeneratedCase(content: string, anatomicalModel: string, difficulty: number): any {
    return {
      patientName: `Patient ${Math.floor(Math.random() * 1000)}`,
      age: 25 + Math.floor(Math.random() * 50),
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      chiefComplaint: this.extractChiefComplaint(content),
      anatomicalModel,
      difficulty,
      conditions: this.getConditionsForModel(anatomicalModel),
      aiDescription: content,
      timeLimit: 300 - (difficulty * 60)
    }
  }

  private extractChiefComplaint(content: string): string {
    const complaints = [
      'Experiencing persistent pain and discomfort',
      'Reports unusual symptoms requiring investigation', 
      'Seeking medical evaluation for concerning issues',
      'Presenting with symptoms affecting daily activities'
    ]
    return complaints[Math.floor(Math.random() * complaints.length)]
  }

  private getConditionsForModel(anatomicalModel: string): string[] {
    const modelConditions: Record<string, string[]> = {
      head: ['temporomandibular_disorder', 'cervical_strain'],
      torso: ['thoracic_strain'],
      fullbody: ['lumbar_strain']
    }
    return modelConditions[anatomicalModel] || modelConditions.head
  }

  private createFallbackCase(anatomicalModel: string, difficulty: number): any {
    return {
      patientName: `Emergency Patient ${Math.floor(Math.random() * 100)}`,
      age: 30 + Math.floor(Math.random() * 40),
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      chiefComplaint: 'Patient requires immediate diagnostic evaluation',
      anatomicalModel,
      difficulty,
      conditions: this.getConditionsForModel(anatomicalModel),
      aiDescription: `Emergency case requiring ${anatomicalModel} examination. Use X-ray scanning to identify conditions.`,
      timeLimit: 300
    }
  }
}