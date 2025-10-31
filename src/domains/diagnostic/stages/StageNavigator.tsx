"use client";

/**
 * StageNavigator Component
 * CLEAN: Single responsibility for stage navigation visualization
 * MODULAR: Independent component with clear interface
 * PERFORMANT: Lightweight with minimal re-renders
 */

import React from "react";
import { DiagnosticStage } from "./StageController";
import { colors, spacing, typography, borders, effects } from "../../../styles/design-tokens";

interface StageDefinition {
  id: DiagnosticStage;
  label: string;
  icon: string;
  description: string;
  color: string;
}

interface StageNavigatorProps {
  currentStage: DiagnosticStage;
  completedStages: Set<DiagnosticStage>;
  onStageSelect: (stage: DiagnosticStage) => void;
  timeRemaining: number;
  budget: {
    remaining: number;
    spent: number;
    startingAmount: number;
  };
}

const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    id: "patient_presentation",
    label: "Patient Presentation",
    icon: "👤",
    description: "Initial assessment and case context",
    color: colors.info.base
  },
  {
    id: "investigation",
    label: "Investigation",
    icon: "🔍",
    description: "Diagnostic tools and evidence gathering",
    color: colors.accent.base
  },
  {
    id: "analysis",
    label: "Analysis",
    icon: "📊",
    description: "Evidence review and pattern recognition",
    color: colors.primary.base
  },
  {
    id: "diagnosis",
    label: "Diagnosis",
    icon: "💊",
    description: "Treatment planning and resolution",
    color: colors.primary.light
  }
];

export const StageNavigator: React.FC<StageNavigatorProps> = ({
  currentStage,
  completedStages,
  onStageSelect,
  timeRemaining,
  budget
}) => {
  // Calculate urgency color based on time and budget
  const getUrgencyColor = (): string => {
    const budgetPercentage = budget.startingAmount > 0 ? 
      (budget.remaining / budget.startingAmount) : 1;
    
    if (timeRemaining < 60 || budgetPercentage < 0.2) return colors.error.base;
    if (timeRemaining < 180 || budgetPercentage < 0.4) return colors.accent.base;
    return colors.primary.base;
  };

  return (
    <div style={{
      background: colors.background.gradient.panel,
      border: `${borders.width.thin} solid ${colors.border.neutral}`,
      borderRadius: borders.radius.lg,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      boxShadow: effects.shadow.md,
      position: "relative"
    }}>
      {/* Header with urgency indicator */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm
      }}>
        <div style={{
          color: colors.neutral.base,
          fontSize: typography.fontSize.xs,
          textTransform: "uppercase",
          letterSpacing: typography.letterSpacing.wider
        }}>
          Diagnostic Workflow
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.xs
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: getUrgencyColor(),
            boxShadow: `0 0 8px ${getUrgencyColor()}`
          }} />
          <span style={{
            color: colors.neutral.light,
            fontSize: typography.fontSize.xs
          }}>
            {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: spacing.md
      }}>
        {STAGE_DEFINITIONS.map((stage, index) => {
          const isCompleted = completedStages.has(stage.id);
          const isCurrent = currentStage === stage.id;
          const isUnlocked = completedStages.has(stage.id) || stage.id === currentStage || 
            (index > 0 && completedStages.has(STAGE_DEFINITIONS[index - 1].id));
          
          return (
            <React.Fragment key={stage.id}>
              {/* Stage Indicator */}
              <button
                onClick={() => isUnlocked && onStageSelect(stage.id)}
                disabled={!isUnlocked}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: isCompleted ? stage.color : 
                    isCurrent ? `${stage.color}40` : 
                    isUnlocked ? `${colors.neutral.dark}80` : colors.neutral.dark,
                  border: `2px solid ${isCurrent ? stage.color : 'transparent'}`,
                  color: isCompleted || isCurrent ? colors.neutral.white : colors.neutral.base,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: typography.fontSize.lg,
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  position: "relative",
                  zIndex: 2
                }}
                aria-label={`Go to ${stage.label} stage`}
              >
                {isCompleted ? "✓" : stage.icon}
                {isCurrent && (
                  <div style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: colors.accent.base,
                    border: `2px solid ${colors.neutral.dark}`,
                    zIndex: 3
                  }} />
                )}
              </button>
              
              {/* Progress Line (except for last stage) */}
              {index < STAGE_DEFINITIONS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: 2,
                  background: completedStages.has(stage.id) ? stage.color : colors.neutral.dark,
                  margin: `0 ${spacing.xs}`,
                  transition: "background 0.3s ease"
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage Labels */}
      <div style={{
        display: "flex",
        justifyContent: "space-between"
      }}>
        {STAGE_DEFINITIONS.map((stage) => {
          const isCompleted = completedStages.has(stage.id);
          const isCurrent = currentStage === stage.id;
          
          return (
            <div 
              key={stage.id}
              style={{
                textAlign: "center",
                flex: 1,
                maxWidth: "25%",
                padding: `0 ${spacing.xs}`
              }}
            >
              <div style={{
                color: isCompleted || isCurrent ? colors.neutral.white : colors.neutral.base,
                fontSize: typography.fontSize.xs,
                fontWeight: isCurrent ? typography.fontWeight.bold : typography.fontWeight.normal,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {stage.label}
              </div>
              <div style={{
                color: colors.neutral.base,
                fontSize: typography.fontSize.xs,
                marginTop: spacing.xs,
                display: isCurrent ? "block" : "none"
              }}>
                {stage.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};