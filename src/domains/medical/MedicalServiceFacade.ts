/**
 * Medical Service Facade
 * AGGRESSIVE CONSOLIDATION: Replaces 447-line cerebras-service.ts with clean facade
 * ENHANCEMENT FIRST: Uses focused service components
 * CLEAN: Clear separation between AI, data, and business logic
 */

import { AIAnalysisService, type AnalysisRequest, type AnalysisResponse } from './services/AIAnalysisService'
import { MedicalDataService, type PatientCase } from './services/MedicalDataService'
import type { MedicalCondition } from './medical-data'

export class MedicalServiceFacade {
  private aiService: AIAnalysisService
  private dataService: MedicalDataService

  constructor() {
    this.aiService = new AIAnalysisService()
    this.dataService = new MedicalDataService()
  }

  // CLEAN: Medical data operations
  getCondition(id: string): MedicalCondition | undefined {
    return this.dataService.getCondition(id)
  }

  getConditionsForModel(model: string): MedicalCondition[] {
    return this.dataService.getConditionsForModel(model)
  }

  searchConditions(query: string): MedicalCondition[] {
    return this.dataService.searchConditions(query)
  }

  // CLEAN: Patient case operations
  generatePatientCase(model: string, difficulty: string): PatientCase {
    return this.dataService.generatePatientCase(model, difficulty)
  }

  validatePatientCase(patientCase: PatientCase): boolean {
    return this.dataService.validatePatientCase(patientCase)
  }

  // CLEAN: AI analysis operations
  async analyzeCondition(condition: MedicalCondition, patientContext?: any): Promise<AnalysisResponse> {
    const request: AnalysisRequest = {
      condition,
      patientContext,
      analysisType: 'condition'
    }
    return this.aiService.analyzeCondition(request)
  }

  async *streamAnalysis(condition: MedicalCondition, patientContext?: any): AsyncGenerator<string, void, unknown> {
    const request: AnalysisRequest = {
      condition,
      patientContext,
      analysisType: 'condition'
    }
    yield* this.aiService.streamAnalysis(request)
  }

  async generateDifferentialDiagnosis(condition: MedicalCondition): Promise<AnalysisResponse> {
    const request: AnalysisRequest = {
      condition,
      analysisType: 'differential'
    }
    return this.aiService.analyzeCondition(request)
  }

  // ENHANCEMENT FIRST: Backward compatibility methods
  async *analyzeMedicalCondition(condition: MedicalCondition): AsyncGenerator<string, void, unknown> {
    yield* this.streamAnalysis(condition)
  }

  async generatePatientCaseWithAI(anatomicalModel: string, difficulty: number): Promise<PatientCase> {
    // Convert difficulty number to string for consistency
    const difficultyLevel = difficulty > 0.7 ? 'hard' : difficulty > 0.4 ? 'medium' : 'easy'
    return this.generatePatientCase(anatomicalModel, difficultyLevel)
  }
}