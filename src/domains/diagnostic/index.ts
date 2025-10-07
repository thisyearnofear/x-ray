/**
 * Diagnostic Domain Index
 * ORGANIZED: Central export point for diagnostic domain
 * ENHANCEMENT FIRST: Prioritizes new modular components
 * CLEAN: Clear separation between old and new
 */

// ENHANCEMENT FIRST: New modular UI system
export { DiagnosticUIFacade } from './DiagnosticUIFacade'
export { DiagnosticUIManager } from './managers/DiagnosticUIManager'

// MODULAR: UI Components
export * from './ui'

// MODULAR: Managers and Systems
export { GameManager } from './GameManager'
export { AchievementSystem } from './AchievementSystem'
export { LearningTracker } from './LearningTracker'
export { MedicalWorkflowManager } from './MedicalWorkflowManager'
export { Web3SkillTracker } from './Web3SkillTracker'

// AGGRESSIVE CONSOLIDATION: Bloated files deleted, replaced with modular components
// Old files removed: diagnostic-ui.ts (2,259 lines), mobile-ui.ts (218 lines), 
// achievement-panel.ts (290 lines), learning-progress-panel.ts, game-status-panel.ts, patient-chat-panel.ts