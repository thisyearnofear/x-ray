/**
 * Staged Diagnostic Interface Exports
 * ORGANIZED: Clear entry point for all stage components
 * MODULAR: Individual exports for flexible importing
 */

export { StageController } from './StageController';
export { StageNavigator } from './StageNavigator';
export { PatientPresentationStage } from './PatientPresentationStage';
export { InvestigationStage } from './InvestigationStage';
export { AnalysisStage } from './AnalysisStage';
export { DiagnosisStage } from './DiagnosisStage';
export { StagedDiagnosticView } from './StagedDiagnosticView';

// Type exports
export type { DiagnosticStage } from './StageController';