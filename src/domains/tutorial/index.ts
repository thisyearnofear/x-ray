/**
 * Tutorial Domain Index
 * ORGANIZED: Central export point for tutorial domain
 * ENHANCEMENT FIRST: Prioritizes new modular components
 * CLEAN: Clear separation between services and UI
 */

// ENHANCEMENT FIRST: New modular tutorial system
export { TutorialFacade } from './TutorialFacade'

// MODULAR: Services and UI
export { TutorialStepService } from './services/TutorialStepService'
export type { TutorialStep } from './services/TutorialStepService'
export { TutorialOverlay } from './ui/TutorialOverlay'

// AGGRESSIVE CONSOLIDATION: Bloated file deleted
// Old file removed: InteractiveTutorial.ts (544 lines) → Replaced with focused components