/**
 * Diagnostic UI Components Index
 * ORGANIZED: Central export point for all diagnostic UI components
 * MODULAR: Easy to import specific components
 * CLEAN: Clear component exports
 */

// MODULAR: UI Sections
export { DiagnosticPanel } from './DiagnosticPanel'
export { PatientInfoSection } from './PatientInfoSection'
export { AIPanel } from './AIPanel'
export { ScanProgressSection } from './ScanProgressSection'
export type { ScanProgressData } from './ScanProgressSection'
export { ActionButtonsSection } from './ActionButtonsSection'
export type { ActionButtonConfig } from './ActionButtonsSection'
export { DiagnosisSubmissionSection } from './DiagnosisSubmissionSection'
export type { DiagnosisSubmissionData } from './DiagnosisSubmissionSection'

// AGGRESSIVE CONSOLIDATION: Replaced bloated files with focused components
export { MobileResponsivePanel } from './MobileResponsivePanel'
export type { ResponsiveConfig } from './MobileResponsivePanel'
export { AchievementDisplay } from './AchievementDisplay'
export type { AchievementData, PerformanceMetrics } from './AchievementDisplay'