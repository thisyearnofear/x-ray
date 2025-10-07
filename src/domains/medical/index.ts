/**
 * Medical Domain Index
 * ORGANIZED: Central export point for medical domain
 * ENHANCEMENT FIRST: Prioritizes new modular services
 * CLEAN: Clear separation between services and data
 */

// ENHANCEMENT FIRST: New modular medical system
export { MedicalServiceFacade } from './MedicalServiceFacade'

// MODULAR: Focused Services
export { AIAnalysisService } from './services/AIAnalysisService'
export type { AnalysisRequest, AnalysisResponse } from './services/AIAnalysisService'
export { MedicalDataService } from './services/MedicalDataService'
export type { PatientCase } from './services/MedicalDataService'

// CLEAN: Medical Data
export * from './medical-data'

// AGGRESSIVE CONSOLIDATION: Bloated file deleted
// Old file removed: cerebras-service.ts (447 lines) → Replaced with focused services