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
}
