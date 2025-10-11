/**
 * Progressive Revelation Manager
 * ENHANCEMENT: Granular information unlocks and red herring generation
 * EDUCATIONAL: Realistic discovery patterns and clinical judgment challenges
 * INTELLIGENT: Context-aware revelation based on investigation actions
 */

import { MedicalCase } from '../medical/types'

export interface AnatomicalRegion {
  id: string
  name: string
  scanProgress: number // 0-1
  unlockThreshold: number // 0-1, when information is revealed
  revealedInformation: RevealedData[]
  redHerrings: Finding[]
  clinicalFindings: Finding[]
}

export interface RevealedData {
  id: string
  type: 'symptom' | 'sign' | 'history' | 'test_result' | 'imaging_finding'
  content: string
  significance: 'critical' | 'important' | 'supportive' | 'incidental'
  confidence: number // 0-1, how reliable this finding is
  requiresInterpretation: boolean
  relatedFindings: string[] // IDs of related findings
  unlockConditions: string[] // what triggered this revelation
}

export interface Finding {
  id: string
  description: string
  type: 'true_positive' | 'false_positive' | 'red_herring' | 'incidental'
  anatomicalRegion: string
  clinicalSignificance: number // 0-1
  diagnosticValue: number // 0-1
  requiresClinicalJudgment: boolean
  differentialImpact: {
    supports: string[] // conditions this finding supports
    contradicts: string[] // conditions this finding contradicts
    neutral: string[] // conditions unaffected by this finding
  }
}

export interface JudgmentResult {
  findingId: string
  playerAssessment: 'relevant' | 'irrelevant' | 'uncertain'
  correctAssessment: 'relevant' | 'irrelevant' | 'uncertain'
  isCorrect: boolean
  reasoning: string
  educationalFeedback: string
  impactOnDiagnosis: number // -1 to 1
}

export interface RevelationContext {
  currentCase: MedicalCase
  investigationHistory: string[]
  playerSkillLevel: number // 0-1
  timeElapsed: number
  difficultyModifier: number // from adaptive system
}

export class ProgressiveRevelationManager {
  private anatomicalRegions: Map<string, AnatomicalRegion>
  private revealedFindings: Map<string, Finding>
  private redHerringPool: Finding[]
  private currentContext: RevelationContext | null = null
  private revelationHistory: RevealedData[] = []

  constructor() {
    this.anatomicalRegions = this.initializeAnatomicalRegions()
    this.revealedFindings = new Map()
    this.redHerringPool = this.generateRedHerringPool()
    
    console.log('🔍 ProgressiveRevelationManager initialized')
  }

  private initializeAnatomicalRegions(): Map<string, AnatomicalRegion> {
    const regions = new Map<string, AnatomicalRegion>()
    
    const regionDefinitions = [
      { id: 'head_neck', name: 'Head and Neck', threshold: 0.3 },
      { id: 'chest', name: 'Chest', threshold: 0.4 },
      { id: 'abdomen', name: 'Abdomen', threshold: 0.35 },
      { id: 'pelvis', name: 'Pelvis', threshold: 0.45 },
      { id: 'extremities', name: 'Extremities', threshold: 0.25 },
      { id: 'spine', name: 'Spine', threshold: 0.5 },
      { id: 'cardiovascular', name: 'Cardiovascular System', threshold: 0.4 },
      { id: 'respiratory', name: 'Respiratory System', threshold: 0.35 },
      { id: 'neurological', name: 'Neurological System', threshold: 0.5 },
      { id: 'musculoskeletal', name: 'Musculoskeletal System', threshold: 0.3 }
    ]
    
    regionDefinitions.forEach(def => {
      regions.set(def.id, {
        id: def.id,
        name: def.name,
        scanProgress: 0,
        unlockThreshold: def.threshold,
        revealedInformation: [],
        redHerrings: [],
        clinicalFindings: []
      })
    })
    
    return regions
  }

  private generateRedHerringPool(): Finding[] {
    return [
      {
        id: 'rh_001',
        description: 'Mild degenerative changes in cervical spine',
        type: 'red_herring',
        anatomicalRegion: 'head_neck',
        clinicalSignificance: 0.2,
        diagnosticValue: 0.1,
        requiresClinicalJudgment: true,
        differentialImpact: {
          supports: [],
          contradicts: [],
          neutral: ['tmj_dysfunction', 'tension_headache', 'migraine']
        }
      },
      {
        id: 'rh_002',
        description: 'Small amount of fluid in mastoid air cells',
        type: 'red_herring',
        anatomicalRegion: 'head_neck',
        clinicalSignificance: 0.3,
        diagnosticValue: 0.2,
        requiresClinicalJudgment: true,
        differentialImpact: {
          supports: ['upper_respiratory_infection'],
          contradicts: [],
          neutral: ['tmj_dysfunction', 'tension_headache']
        }
      },
      {
        id: 'rh_003',
        description: 'Incidental thyroid nodule, 4mm',
        type: 'incidental',
        anatomicalRegion: 'head_neck',
        clinicalSignificance: 0.4,
        diagnosticValue: 0.0,
        requiresClinicalJudgment: true,
        differentialImpact: {
          supports: [],
          contradicts: [],
          neutral: ['tmj_dysfunction', 'tension_headache', 'migraine']
        }
      },
      {
        id: 'rh_004',
        description: 'Mild sinus mucosal thickening',
        type: 'red_herring',
        anatomicalRegion: 'head_neck',
        clinicalSignificance: 0.3,
        diagnosticValue: 0.2,
        requiresClinicalJudgment: true,
        differentialImpact: {
          supports: ['sinusitis', 'upper_respiratory_infection'],
          contradicts: [],
          neutral: ['tmj_dysfunction']
        }
      },
      {
        id: 'rh_005',
        description: 'Borderline enlarged lymph node, 1.2cm',
        type: 'red_herring',
        anatomicalRegion: 'head_neck',
        clinicalSignificance: 0.5,
        diagnosticValue: 0.3,
        requiresClinicalJudgment: true,
        differentialImpact: {
          supports: ['infection', 'inflammatory_process'],
          contradicts: [],
          neutral: ['tmj_dysfunction', 'tension_headache']
        }
      }
    ]
  }

  /**
   * Unlock information based on scanning progress
   */
  public unlockInformation(scanArea: string, progress: number): RevealedData[] {
    const region = this.anatomicalRegions.get(scanArea)
    if (!region) {
      console.warn('🔍 Unknown anatomical region:', scanArea)
      return []
    }
    
    region.scanProgress = Math.max(region.scanProgress, progress)
    
    const newlyRevealed: RevealedData[] = []
    
    // Check if we've crossed the unlock threshold
    if (region.scanProgress >= region.unlockThreshold && region.revealedInformation.length === 0) {
      const revealedData = this.generateRevealedData(region, progress)
      region.revealedInformation.push(...revealedData)
      newlyRevealed.push(...revealedData)
      
      // Add red herrings based on difficulty and context
      const redHerrings = this.generateRedHerrings(region)
      region.redHerrings.push(...redHerrings)
      
      this.revelationHistory.push(...newlyRevealed)
      
      console.log('🔍 Information unlocked for', region.name, ':', {
        revealed: newlyRevealed.length,
        redHerrings: redHerrings.length,
        progress: progress.toFixed(2)
      })
    }
    
    return newlyRevealed
  }

  private generateRevealedData(region: AnatomicalRegion, progress: number): RevealedData[] {
    if (!this.currentContext) return []
    
    const revealedData: RevealedData[] = []
    const caseType = this.currentContext.currentCase.id
    
    // Generate case-specific findings based on the medical case
    if (region.id === 'head_neck' && caseType.includes('headache')) {
      revealedData.push({
        id: `revealed_${region.id}_${Date.now()}_1`,
        type: 'sign',
        content: 'Tenderness on palpation of temporomandibular joint',
        significance: 'critical',
        confidence: 0.9,
        requiresInterpretation: false,
        relatedFindings: [],
        unlockConditions: [`scan_${region.id}_${progress.toFixed(1)}`]
      })
      
      revealedData.push({
        id: `revealed_${region.id}_${Date.now()}_2`,
        type: 'sign',
        content: 'Audible clicking sound during jaw movement',
        significance: 'important',
        confidence: 0.8,
        requiresInterpretation: true,
        relatedFindings: [],
        unlockConditions: [`scan_${region.id}_${progress.toFixed(1)}`]
      })
      
      if (progress > 0.6) {
        revealedData.push({
          id: `revealed_${region.id}_${Date.now()}_3`,
          type: 'sign',
          content: 'Limited mouth opening (35mm maximum)',
          significance: 'important',
          confidence: 0.85,
          requiresInterpretation: false,
          relatedFindings: [],
          unlockConditions: [`scan_${region.id}_${progress.toFixed(1)}`]
        })
      }
    }
    
    // Add generic findings based on region and progress
    if (progress > 0.8) {
      revealedData.push({
        id: `revealed_${region.id}_${Date.now()}_generic`,
        type: 'imaging_finding',
        content: `Detailed anatomical structures of ${region.name} visualized`,
        significance: 'supportive',
        confidence: 0.7,
        requiresInterpretation: true,
        relatedFindings: [],
        unlockConditions: [`scan_${region.id}_complete`]
      })
    }
    
    return revealedData
  }

  /**
   * Generate red herrings based on case context and difficulty
   */
  public generateRedHerrings(region: AnatomicalRegion): Finding[] {
    if (!this.currentContext) return []
    
    const redHerrings: Finding[] = []
    const difficultyModifier = this.currentContext.difficultyModifier
    const playerSkill = this.currentContext.playerSkillLevel
    
    // Calculate number of red herrings based on difficulty
    const baseRedHerringCount = Math.floor(difficultyModifier * 3)
    const skillAdjustment = Math.floor((1 - playerSkill) * 2) // More red herrings for less skilled players
    const totalRedHerrings = Math.min(baseRedHerringCount + skillAdjustment, 5)
    
    // Select appropriate red herrings for this region
    const regionRedHerrings = this.redHerringPool.filter(rh => 
      rh.anatomicalRegion === region.id || rh.anatomicalRegion === 'general'
    )
    
    // Randomly select red herrings
    const shuffled = [...regionRedHerrings].sort(() => Math.random() - 0.5)
    redHerrings.push(...shuffled.slice(0, totalRedHerrings))
    
    // Add case-specific red herrings
    if (region.id === 'head_neck' && this.currentContext.currentCase.id.includes('headache')) {
      redHerrings.push({
        id: `rh_case_specific_${Date.now()}`,
        description: 'Mild asymmetry in facial muscles',
        type: 'red_herring',
        anatomicalRegion: region.id,
        clinicalSignificance: 0.4,
        diagnosticValue: 0.2,
        requiresClinicalJudgment: true,
        differentialImpact: {
          supports: ['facial_nerve_palsy', 'stroke'],
          contradicts: [],
          neutral: ['tmj_dysfunction', 'tension_headache']
        }
      })
    }
    
    console.log('🔍 Generated red herrings for', region.name, ':', {
      count: redHerrings.length,
      difficulty: difficultyModifier.toFixed(2),
      playerSkill: playerSkill.toFixed(2)
    })
    
    return redHerrings
  }

  /**
   * Validate clinical judgment on findings
   */
  public validateClinicalJudgment(findings: Finding[]): JudgmentResult[] {
    const results: JudgmentResult[] = []
    
    findings.forEach(finding => {
      const result = this.assessFindingRelevance(finding)
      results.push(result)
    })
    
    // Calculate overall judgment accuracy
    const correctJudgments = results.filter(r => r.isCorrect).length
    const accuracy = correctJudgments / results.length
    
    console.log('🔍 Clinical judgment validation:', {
      totalFindings: findings.length,
      correctJudgments,
      accuracy: accuracy.toFixed(2)
    })
    
    return results
  }

  private assessFindingRelevance(finding: Finding): JudgmentResult {
    if (!this.currentContext) {
      return {
        findingId: finding.id,
        playerAssessment: 'uncertain',
        correctAssessment: 'uncertain',
        isCorrect: true,
        reasoning: 'No case context available',
        educationalFeedback: 'Unable to assess without case context',
        impactOnDiagnosis: 0
      }
    }
    
    // Handle both MedicalCase and PatientCase types
    const caseConditions = (this.currentContext.currentCase as any)?.conditions || 
                          (this.currentContext.currentCase as any)?.diagnosticHypothesis || 
                          []
    
    // Determine correct assessment based on finding type and case
    let correctAssessment: 'relevant' | 'irrelevant' | 'uncertain' = 'uncertain'
    let reasoning = ''
    let educationalFeedback = ''
    let impactOnDiagnosis = 0
    
    if (finding.type === 'true_positive') {
      correctAssessment = 'relevant'
      reasoning = 'This finding directly supports the primary diagnosis'
      educationalFeedback = 'True positive findings are crucial for accurate diagnosis'
      impactOnDiagnosis = finding.diagnosticValue
    } else if (finding.type === 'red_herring') {
      correctAssessment = 'irrelevant'
      reasoning = 'This finding is not related to the primary condition'
      educationalFeedback = 'Red herrings can mislead diagnosis if not properly evaluated'
      impactOnDiagnosis = -finding.diagnosticValue * 0.5
    } else if (finding.type === 'incidental') {
      correctAssessment = 'irrelevant'
      reasoning = 'This is an incidental finding unrelated to the presenting complaint'
      educationalFeedback = 'Incidental findings require separate evaluation but don\'t affect current diagnosis'
      impactOnDiagnosis = 0
    } else if (finding.type === 'false_positive') {
      correctAssessment = 'irrelevant'
      reasoning = 'This finding appears significant but is not related to the condition'
      educationalFeedback = 'False positives require careful clinical correlation'
      impactOnDiagnosis = -finding.diagnosticValue
    }
    
    // For this implementation, assume player assessment matches correct assessment
    // In a real implementation, this would come from player input
    const playerAssessment = correctAssessment
    const isCorrect = playerAssessment === correctAssessment
    
    return {
      findingId: finding.id,
      playerAssessment,
      correctAssessment,
      isCorrect,
      reasoning,
      educationalFeedback,
      impactOnDiagnosis
    }
  }

  /**
   * Set revelation context
   */
  public setRevelationContext(context: RevelationContext): void {
    this.currentContext = context
    
    // Reset regions for new case
    this.anatomicalRegions.forEach(region => {
      region.scanProgress = 0
      region.revealedInformation = []
      region.redHerrings = []
      region.clinicalFindings = []
    })
    
    this.revealedFindings.clear()
    this.revelationHistory = []
    
    console.log('🔍 Revelation context set for case:', context.currentCase.id)
  }

  /**
   * Get current revelation state
   */
  public getRevelationState(): {
    regions: AnatomicalRegion[]
    totalRevealed: number
    totalRedHerrings: number
    revelationHistory: RevealedData[]
  } {
    const regions = Array.from(this.anatomicalRegions.values())
    const totalRevealed = regions.reduce((sum, region) => sum + region.revealedInformation.length, 0)
    const totalRedHerrings = regions.reduce((sum, region) => sum + region.redHerrings.length, 0)
    
    return {
      regions,
      totalRevealed,
      totalRedHerrings,
      revelationHistory: [...this.revelationHistory]
    }
  }

  /**
   * Get findings for a specific region
   */
  public getRegionFindings(regionId: string): {
    revealed: RevealedData[]
    redHerrings: Finding[]
    clinicalFindings: Finding[]
  } {
    const region = this.anatomicalRegions.get(regionId)
    if (!region) {
      return { revealed: [], redHerrings: [], clinicalFindings: [] }
    }
    
    return {
      revealed: [...region.revealedInformation],
      redHerrings: [...region.redHerrings],
      clinicalFindings: [...region.clinicalFindings]
    }
  }

  /**
   * Check if region has unlocked information
   */
  public hasUnlockedInformation(regionId: string): boolean {
    const region = this.anatomicalRegions.get(regionId)
    return region ? region.scanProgress >= region.unlockThreshold : false
  }

  /**
   * Get scan progress for all regions
   */
  public getScanProgress(): Record<string, number> {
    const progress: Record<string, number> = {}
    this.anatomicalRegions.forEach((region, id) => {
      progress[id] = region.scanProgress
    })
    return progress
  }

  /**
   * Reset revelation manager
   */
  public reset(): void {
    this.anatomicalRegions.forEach(region => {
      region.scanProgress = 0
      region.revealedInformation = []
      region.redHerrings = []
      region.clinicalFindings = []
    })
    
    this.revealedFindings.clear()
    this.revelationHistory = []
    this.currentContext = null
    
    console.log('🔍 ProgressiveRevelationManager reset')
  }

  /**
   * Export revelation data for analytics
   */
  public exportRevelationData(): any {
    return {
      regions: Object.fromEntries(this.anatomicalRegions),
      revelationHistory: this.revelationHistory,
      context: this.currentContext,
      timestamp: Date.now()
    }
  }
}