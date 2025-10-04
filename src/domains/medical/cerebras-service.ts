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
      console.warn('Cerebras analysis failed, using fallback:', error)
      const fallback = `This condition requires careful examination. ${condition.description} Common symptoms include: ${condition.symptoms.join(', ')}. Recommended treatments: ${condition.treatment.join(', ')}.`
      
      const words = fallback.split(' ')
      for (const word of words) {
        yield word + ' '
        await new Promise(resolve => setTimeout(resolve, 30))
      }
    }
  }

  // ENHANCED: Dynamic case generation powered by Cerebras Llama inference
  async generateMedicalCase(anatomicalModel: string, difficulty: number = 1): Promise<any> {
    const cacheKey = cerebrasCache.generateCaseKey(anatomicalModel, difficulty)
    const cached = cerebrasCache.get(cacheKey)
    
    if (cached) {
       console.log('Using cached Cerebras-generated case')
       return JSON.parse(cached)
     }

    try {
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          condition: `Generate a comprehensive medical case study for ${anatomicalModel} with difficulty level ${difficulty}. Include realistic patient demographics, presenting symptoms, differential diagnosis considerations, and learning objectives. Make it clinically accurate and educational for medical students.`,
          patientHistory: `Create a detailed patient scenario involving the ${anatomicalModel} with realistic symptoms, timeline, and clinical presentation that would be suitable for medical education and diagnostic training.`
        }),
      })

      if (!response.ok) {
        throw new Error('Cerebras case generation failed')
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      
      const medicalCase = this.parseGeneratedCase(content, anatomicalModel, difficulty)
      cerebrasCache.set(cacheKey, JSON.stringify(medicalCase), 300000)
      
      console.log('Generated new case via Cerebras Llama:', medicalCase.patientName)
      return medicalCase
      
    } catch (error) {
      console.warn('Cerebras case generation failed, using fallback:', error)
      return this.createFallbackCase(anatomicalModel, difficulty)
    }
  }

  // ENHANCED: Dynamic medical condition generation using Cerebras inference
  async generateDynamicCondition(symptoms: string[], anatomicalModel: string): Promise<any> {
    const cacheKey = `condition_${symptoms.join('_')}_${anatomicalModel}`
    const cached = cerebrasCache.get(cacheKey)
    
    if (cached) {
       console.log('Using cached AI-generated condition')
       return JSON.parse(cached)
     }

    try {
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          condition: `Based on these symptoms: ${symptoms.join(', ')}, generate a specific medical condition for the ${anatomicalModel} region. Provide detailed medical information including pathophysiology, treatment options, and prognosis.`,
          patientHistory: `Patient presents with: ${symptoms.join(', ')} in the ${anatomicalModel} area. Generate a comprehensive diagnostic assessment with realistic clinical details.`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate condition via Cerebras')
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      
      const condition = this.parseGeneratedCondition(content, symptoms, anatomicalModel)
       cerebrasCache.set(cacheKey, JSON.stringify(condition), 600000) // Cache for 10 minutes
      
      console.log('Generated dynamic condition via Cerebras:', condition.name)
      return condition
      
    } catch (error) {
      console.warn('Dynamic condition generation failed:', error)
      throw error
    }
  }

  // ENHANCED: Generate contextual medical insights based on scan results
  async generateScanInsights(scanData: any, anatomicalModel: string): Promise<string> {
    const cacheKey = `insights_${anatomicalModel}_${JSON.stringify(scanData).slice(0, 50)}`
    const cached = cerebrasCache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          condition: `Analyze these X-ray scan findings for the ${anatomicalModel}: ${JSON.stringify(scanData)}. Provide clinical insights, potential diagnoses, and recommended follow-up actions.`,
          patientHistory: `X-ray examination of ${anatomicalModel} region with specific findings requiring expert interpretation and clinical correlation.`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate scan insights')
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || 'Scan analysis requires further clinical correlation.'
      
      cerebrasCache.set(cacheKey, content, 300000) // Cache for 5 minutes
      return content
      
    } catch (error) {
      console.warn('Scan insights generation failed:', error)
      return 'Unable to generate AI insights at this time. Please consult with a radiologist for detailed interpretation.'
    }
  }

  // ENHANCED: Generate differential diagnosis suggestions
  async generateDifferentialDiagnosis(symptoms: string[], findings: string[], anatomicalModel: string): Promise<string[]> {
    const cacheKey = `differential_${symptoms.join('_')}_${findings.join('_')}_${anatomicalModel}`
    const cached = cerebrasCache.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    try {
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          condition: `Generate a differential diagnosis list for a patient with symptoms: ${symptoms.join(', ')} and findings: ${findings.join(', ')} in the ${anatomicalModel} region. Provide 3-5 most likely diagnoses ranked by probability.`,
          patientHistory: `Clinical presentation includes ${symptoms.join(', ')} with examination findings of ${findings.join(', ')} in the ${anatomicalModel} area.`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate differential diagnosis')
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      
      const diagnoses = this.parseDifferentialDiagnosis(content)
      cerebrasCache.set(cacheKey, JSON.stringify(diagnoses), 600000)
      
      return diagnoses
      
    } catch (error) {
      console.warn('Differential diagnosis generation failed:', error)
      return ['Further clinical evaluation needed', 'Consult specialist for complex case', 'Additional imaging may be required']
    }
  }

  // ENHANCED: Generate personalized learning objectives
  async generateLearningObjectives(condition: MedicalCondition, studentLevel: string = 'intermediate'): Promise<string[]> {
    const cacheKey = `learning_${condition.id}_${studentLevel}`
    const cached = cerebrasCache.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    try {
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          condition: `Generate 4-6 specific learning objectives for ${studentLevel} level medical students studying ${condition.name}. Focus on clinical reasoning, diagnostic skills, and treatment planning.`,
          patientHistory: `Educational case involving ${condition.name} with emphasis on ${condition.severity} severity condition affecting ${condition.requiredModel} region.`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate learning objectives')
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      
      const objectives = this.parseLearningObjectives(content)
      cerebrasCache.set(cacheKey, JSON.stringify(objectives), 1800000) // Cache for 30 minutes
      
      return objectives
      
    } catch (error) {
      console.warn('Learning objectives generation failed:', error)
      return [
        `Identify key symptoms of ${condition.name}`,
        `Understand the pathophysiology involved`,
        `Recognize appropriate treatment options`,
        `Develop clinical reasoning skills`
      ]
    }
  }

  private parseGeneratedCondition(content: string, symptoms: string[], anatomicalModel: string): any {
    return {
      id: `ai_condition_${Date.now()}`,
      name: this.extractConditionName(content) || 'AI-Generated Condition',
      description: content.substring(0, 200) + '...',
      position: this.generatePositionForModel(anatomicalModel),
      severity: this.determineSeverity(content),
      symptoms: symptoms,
      treatment: this.extractTreatments(content),
      requiredModel: anatomicalModel,
      visibleIn: [anatomicalModel.toLowerCase(), 'ai-generated'],
      aiGenerated: true,
      cerebrasSource: true,
      fullAnalysis: content
    }
  }

  private extractConditionName(content: string): string {
    const match = content.match(/(?:diagnosis|condition|syndrome|disorder):\s*([^.\n]+)/i)
    return match ? match[1].trim() : 'Cerebras-Generated Condition'
  }

  private determineSeverity(content: string): string {
    const severityKeywords = {
      high: ['severe', 'critical', 'emergency', 'urgent', 'acute'],
      medium: ['moderate', 'significant', 'notable'],
      low: ['mild', 'minor', 'slight', 'minimal']
    }

    const lowerContent = content.toLowerCase()
    
    for (const [severity, keywords] of Object.entries(severityKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return severity
      }
    }
    
    return 'medium'
  }

  private extractTreatments(content: string): string[] {
    const treatmentSection = content.match(/treatment[s]?:?\s*([^.]*)/i)
    if (treatmentSection) {
      return treatmentSection[1].split(',').map(t => t.trim()).filter(t => t.length > 0)
    }
    return ['Consult healthcare provider', 'Follow clinical guidelines']
  }

  private generatePositionForModel(anatomicalModel: string): { x: number; y: number; z: number } {
    const positions = {
      head: { x: 0, y: 0.8, z: 0.1 },
      torso: { x: 0, y: 0.1, z: 0.1 },
      fullbody: { x: 0, y: 0, z: 0.1 }
    }
    
    const basePosition = positions[anatomicalModel as keyof typeof positions] || positions.torso
    
    // Add some randomization for dynamic positioning
    return {
      x: basePosition.x + (Math.random() - 0.5) * 0.2,
      y: basePosition.y + (Math.random() - 0.5) * 0.2,
      z: basePosition.z + (Math.random() - 0.5) * 0.1
    }
  }

  private parseGeneratedCase(content: string, anatomicalModel: string, difficulty: number): any {
    return {
      patientName: this.extractPatientName(content) || `Cerebras Patient ${Math.floor(Math.random() * 1000)}`,
      age: this.extractAge(content) || (25 + Math.floor(Math.random() * 50)),
      gender: this.extractGender(content) || (Math.random() > 0.5 ? 'Male' : 'Female'),
      chiefComplaint: this.extractChiefComplaint(content),
      anatomicalModel,
      difficulty,
      conditions: this.getConditionsForModel(anatomicalModel),
      aiDescription: content,
      timeLimit: 300 - (difficulty * 60),
      cerebrasGenerated: true,
      llamaInference: true,
      generatedAt: new Date().toISOString(),
      learningObjectives: this.extractLearningObjectives(content),
      clinicalPearls: this.extractClinicalPearls(content)
    }
  }

  private extractPatientName(content: string): string | null {
    const match = content.match(/(?:patient|name):\s*([A-Za-z\s]+)/i)
    return match ? match[1].trim() : null
  }

  private extractAge(content: string): number | null {
    const match = content.match(/(?:age|years?):\s*(\d+)/i)
    return match ? parseInt(match[1]) : null
  }

  private extractGender(content: string): string | null {
    const match = content.match(/(?:gender|sex):\s*(male|female|m|f)/i)
    return match ? (match[1].toLowerCase().startsWith('m') ? 'Male' : 'Female') : null
  }

  private extractChiefComplaint(content: string): string {
    const match = content.match(/(?:chief complaint|presenting|complaint):\s*([^.\n]+)/i)
    return match ? match[1].trim() : 'Patient requires diagnostic evaluation'
  }

  private extractLearningObjectives(content: string): string[] {
    const objectives = content.match(/(?:learning objectives?|objectives?):\s*([^.]*)/i)
    if (objectives) {
      return objectives[1].split(',').map(obj => obj.trim()).filter(obj => obj.length > 0)
    }
    return ['Identify key clinical findings', 'Develop diagnostic reasoning', 'Plan appropriate treatment']
  }

  private extractClinicalPearls(content: string): string[] {
    const pearls = content.match(/(?:clinical pearls?|pearls?|key points?):\s*([^.]*)/i)
    if (pearls) {
      return pearls[1].split(',').map(pearl => pearl.trim()).filter(pearl => pearl.length > 0)
    }
    return ['Consider differential diagnosis', 'Correlate with clinical presentation', 'Follow evidence-based guidelines']
  }

  private parseDifferentialDiagnosis(content: string): string[] {
    const diagnoses: string[] = []
    const lines = content.split('\n')
    
    for (const line of lines) {
      if (line.match(/^\d+\.|^-|^\*/) && line.length > 5) {
        const diagnosis = line.replace(/^\d+\.|^-|^\*/, '').trim()
        if (diagnosis.length > 0) {
          diagnoses.push(diagnosis)
        }
      }
    }
    
    return diagnoses.length > 0 ? diagnoses : ['Primary diagnosis consideration', 'Secondary differential', 'Alternative diagnosis']
  }

  private parseLearningObjectives(content: string): string[] {
    const objectives: string[] = []
    const lines = content.split('\n')
    
    for (const line of lines) {
      if (line.match(/^\d+\.|^-|^\*/) && line.length > 10) {
        const objective = line.replace(/^\d+\.|^-|^\*/, '').trim()
        if (objective.length > 0) {
          objectives.push(objective)
        }
      }
    }
    
    return objectives.length > 0 ? objectives : ['Understand key concepts', 'Apply clinical reasoning', 'Develop diagnostic skills']
  }

  private getConditionsForModel(anatomicalModel: string): string[] {
    const modelConditions: Record<string, string[]> = {
      head: ['temporomandibular_disorder', 'cervical_strain', 'migraine_headache', 'concussion'],
      torso: ['thoracic_strain', 'myocardial_infarction', 'pneumonia', 'appendicitis'],
      fullbody: ['lumbar_strain', 'fibromyalgia', 'multiple_sclerosis']
    }
    return modelConditions[anatomicalModel] || modelConditions.head
  }

  private createFallbackCase(anatomicalModel: string, difficulty: number): any {
    return {
      patientName: `Cerebras Fallback Patient ${Math.floor(Math.random() * 100)}`,
      age: 30 + Math.floor(Math.random() * 40),
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      chiefComplaint: 'Patient requires AI-assisted diagnostic evaluation',
      anatomicalModel,
      difficulty,
      conditions: this.getConditionsForModel(anatomicalModel),
      aiDescription: `Fallback case for ${anatomicalModel} examination. Cerebras AI integration temporarily unavailable. Use X-ray scanning to identify conditions.`,
      timeLimit: 300,
      fallbackCase: true,
      cerebrasGenerated: false,
      learningObjectives: ['Practice diagnostic skills', 'Use available clinical tools', 'Apply systematic approach'],
      clinicalPearls: ['Systematic examination is key', 'Consider patient history', 'Use all available resources']
    }
  }
}