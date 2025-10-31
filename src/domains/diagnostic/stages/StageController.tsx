"use client";

/**
 * StageController Component
 * ENHANCEMENT FIRST: Extends existing diagnostic UI patterns
 * CLEAN: Single responsibility for stage management
 * MODULAR: Independent component that can be tested separately
 * ORGANIZED: Follows domain-driven design in diagnostic/stages
 */

import React, { useState, useEffect, useCallback } from "react";
import { StageNavigator } from "./StageNavigator";
import { PatientPresentationStage } from "./PatientPresentationStage";
import { InvestigationStage } from "./InvestigationStage";
import { AnalysisStage } from "./AnalysisStage";
import { DiagnosisStage } from "./DiagnosisStage";
import { GamePhase } from "../GameManager";
import { colors, spacing, typography, effects } from "../../../styles/design-tokens";

// Stage definitions following the 4-stage diagnostic workflow
export type DiagnosticStage = 
  | "patient_presentation"
  | "investigation"
  | "analysis"
  | "diagnosis";

interface StageControllerProps {
  currentGamePhase: GamePhase;
  onGamePhaseChange: (phase: GamePhase) => void;
  patientCase: any;
  budget: {
    remaining: number;
    spent: number;
    startingAmount: number;
  };
  timeRemaining: number;
  gameManager: any;
  onStageComplete: (stage: DiagnosticStage) => void;
  onEvidenceCollected?: (evidence: any) => void;
  onDiagnosisSubmitted?: (diagnosis: any) => void;
  nurseAmyNudges?: any; // Nurse Amy nudge system
}

export const StageController: React.FC<StageControllerProps> = ({
  currentGamePhase,
  onGamePhaseChange,
  patientCase,
  budget,
  timeRemaining,
  gameManager,
  onStageComplete,
  onEvidenceCollected,
  onDiagnosisSubmitted,
  nurseAmyNudges
}) => {
  // Map game phases to diagnostic stages
  const [currentStage, setCurrentStage] = useState<DiagnosticStage>(() => {
    switch (currentGamePhase) {
      case GamePhase.PATIENT_ARRIVAL:
        return "patient_presentation";
      case GamePhase.INVESTIGATION:
      case GamePhase.EVIDENCE_GATHERING:
        return "investigation";
      case GamePhase.DIAGNOSIS:
        return "analysis";
      case GamePhase.COMPLETED:
        return "diagnosis";
      default:
        return "patient_presentation";
    }
  });

  // Track completed stages for navigation
  const [completedStages, setCompletedStages] = useState<Set<DiagnosticStage>>(new Set());

  // Track stage-specific data
  const [stageData, setStageData] = useState<Record<DiagnosticStage, any>>({
    patient_presentation: {},
    investigation: {},
    analysis: {},
    diagnosis: {}
  });

  // Update stage when game phase changes
  useEffect(() => {
    switch (currentGamePhase) {
      case GamePhase.PATIENT_ARRIVAL:
        setCurrentStage("patient_presentation");
        break;
      case GamePhase.INVESTIGATION:
      case GamePhase.EVIDENCE_GATHERING:
        setCurrentStage("investigation");
        break;
      case GamePhase.DIAGNOSIS:
        setCurrentStage("analysis");
        break;
      case GamePhase.COMPLETED:
        setCurrentStage("diagnosis");
        break;
    }
  }, [currentGamePhase]);

  // Handle stage completion
  const handleStageComplete = useCallback((stage: DiagnosticStage) => {
    setCompletedStages(prev => new Set(prev).add(stage));
    onStageComplete(stage);
    
    // Auto-advance to next stage in sequence
    const stageOrder: DiagnosticStage[] = ["patient_presentation", "investigation", "analysis", "diagnosis"];
    const currentIndex = stageOrder.indexOf(stage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      // Map diagnostic stages back to game phases
      const phaseMap: Record<DiagnosticStage, GamePhase> = {
        patient_presentation: GamePhase.PATIENT_ARRIVAL,
        investigation: GamePhase.INVESTIGATION,
        analysis: GamePhase.DIAGNOSIS,
        diagnosis: GamePhase.COMPLETED
      };
      onGamePhaseChange(phaseMap[nextStage]);
    }
  }, [onStageComplete, onGamePhaseChange]);

  // Handle manual stage navigation
  const navigateToStage = useCallback((stage: DiagnosticStage) => {
    // Only allow navigation to completed stages or the current stage
    if (completedStages.has(stage) || stage === currentStage) {
      setCurrentStage(stage);
      // Map diagnostic stages back to game phases
      const phaseMap: Record<DiagnosticStage, GamePhase> = {
        patient_presentation: GamePhase.PATIENT_ARRIVAL,
        investigation: GamePhase.INVESTIGATION,
        analysis: GamePhase.DIAGNOSIS,
        diagnosis: GamePhase.COMPLETED
      };
      onGamePhaseChange(phaseMap[stage]);
    }
  }, [completedStages, currentStage, onGamePhaseChange]);

  // Render current stage component
  const renderCurrentStage = () => {
    switch (currentStage) {
      case "patient_presentation":
        return (
          <PatientPresentationStage
            patientCase={patientCase}
            onComplete={() => handleStageComplete("patient_presentation")}
            timeRemaining={timeRemaining}
            budget={budget}
            nurseAmyNudges={nurseAmyNudges}
          />
        );
      case "investigation":
        return (
          <InvestigationStage
            patientCase={patientCase}
            budget={budget}
            timeRemaining={timeRemaining}
            onComplete={() => handleStageComplete("investigation")}
            onEvidenceCollected={onEvidenceCollected}
          />
        );
      case "analysis":
        return (
          <AnalysisStage
            patientCase={patientCase}
            budget={budget}
            timeRemaining={timeRemaining}
            onComplete={() => handleStageComplete("analysis")}
          />
        );
      case "diagnosis":
        return (
          <DiagnosisStage
            patientCase={patientCase}
            budget={budget}
            timeRemaining={timeRemaining}
            gameManager={gameManager}
            onComplete={(diagnosis) => {
              handleStageComplete("diagnosis");
              if (onDiagnosisSubmitted) {
                onDiagnosisSubmitted(diagnosis);
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      position: "relative"
    }}>
      {/* Stage Navigator - Always visible */}
      <StageNavigator
        currentStage={currentStage}
        completedStages={completedStages}
        onStageSelect={navigateToStage}
        timeRemaining={timeRemaining}
        budget={budget}
      />
      
      {/* Stage Content */}
      <div style={{
        flex: 1,
        padding: spacing.md,
        overflow: "auto",
        position: "relative"
      }}>
        {renderCurrentStage()}
      </div>
    </div>
  );
};