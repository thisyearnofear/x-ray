"use client";

/**
 * StagedDiagnosticView Component
 * ENHANCEMENT FIRST: Replaces traditional diagnostic UI with staged interface
 * MODULAR: Independent component that can be integrated with existing systems
 * ORGANIZED: Follows domain-driven design in diagnostic/stages
 */

import React, { useState, useEffect, useCallback } from "react";
import { StageController } from "./StageController";
import { GamePhase } from "../GameManager";
import { DiagnosticUIManager } from "../managers/DiagnosticUIManager";
import { colors, spacing, typography, borders, effects } from "../../../styles/design-tokens";

export interface StagedDiagnosticViewProps {
  gameManager: any;
  diagnosticUIManager: DiagnosticUIManager;
  currentGamePhase: GamePhase;
  onGamePhaseChange: (phase: GamePhase) => void;
  patientCase: any; // This should be the PatientCase type from GameManager
  budget: {
    remaining: number;
    spent: number;
    startingAmount: number;
  };
  timeRemaining: number;
  onEvidenceCollected?: (evidence: any) => void;
  onDiagnosisSubmitted?: (diagnosis: any) => void;
  nurseAmyNudges?: any; // Nurse Amy nudge system
}

export const StagedDiagnosticView: React.FC<StagedDiagnosticViewProps> = ({
  gameManager,
  diagnosticUIManager,
  currentGamePhase,
  onGamePhaseChange,
  patientCase,
  budget,
  timeRemaining,
  onEvidenceCollected,
  onDiagnosisSubmitted,
  nurseAmyNudges
}) => {
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());

  // Handle stage completion
  const handleStageComplete = useCallback((stage: string) => {
    setCompletedStages(prev => new Set(prev).add(stage));
    
    // Update the diagnostic UI manager for backward compatibility
    diagnosticUIManager.updateForStagedInterface(stage);
  }, [diagnosticUIManager]);

  // Effect to hide traditional UI elements when staged interface is active
  useEffect(() => {
    // Hide traditional diagnostic UI elements
    const hideElements = () => {
      const elementsToHide = [
        'diagnostic-panel',
        'ai-panel-container',
        'investigation-panel-container',
        'patient-info-section'
      ];
      
      elementsToHide.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.style.display = 'none';
        }
      });
    };
    
    // Show staged interface container
    const showStagedInterface = () => {
      const container = document.getElementById('staged-diagnostic-container');
      if (container) {
        container.style.display = 'block';
      }
    };
    
    hideElements();
    showStagedInterface();
    
    // Cleanup function to restore traditional UI if needed
    return () => {
      const elementsToHide = [
        'diagnostic-panel',
        'ai-panel-container',
        'investigation-panel-container',
        'patient-info-section'
      ];
      
      elementsToHide.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.style.display = 'block';
        }
      });
      
      const container = document.getElementById('staged-diagnostic-container');
      if (container) {
        container.style.display = 'none';
      }
    };
  }, []);

  return (
    <div 
      id="staged-diagnostic-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: colors.background.panel,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <StageController
        currentGamePhase={currentGamePhase}
        onGamePhaseChange={onGamePhaseChange}
        patientCase={patientCase}
        budget={budget}
        timeRemaining={timeRemaining}
        gameManager={gameManager}
        onStageComplete={handleStageComplete}
        onEvidenceCollected={onEvidenceCollected}
        onDiagnosisSubmitted={onDiagnosisSubmitted}
        nurseAmyNudges={nurseAmyNudges}
      />
    </div>
  );
};