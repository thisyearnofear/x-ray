"use client";

/**
 * Tutorial System Component
 * ENHANCEMENT: Milestone-driven feature discovery
 * CLEAN: Progressive onboarding with contextual prompts
 * DESIGN: Non-intrusive overlays following X-RAY aesthetic
 */

import React, { useState, useEffect } from "react";
import {
  colors,
  typography,
  spacing,
  borders,
  effects,
  zIndex,
} from "../styles/design-tokens";

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetElement?: string; // CSS selector for target element
  position?: "top" | "bottom" | "left" | "right" | "center";
  milestone: {
    type: "time" | "budget" | "evidence" | "health" | "phase";
    value: number;
  };
  showOnce?: boolean;
}

interface TutorialSystemProps {
  currentMilestone: {
    type: "time" | "budget" | "evidence" | "health" | "phase";
    value: number;
  };
  onComplete?: (stepId: string) => void;
  onSkip?: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to X-RAI",
    content:
      "Explore the 3D medical visualization system. Hover over body parts to scan for abnormalities.",
    milestone: { type: "time", value: 0 },
    position: "center",
  },
  {
    id: "investigation-panel",
    title: "Investigation Tools",
    content:
      "Use the Investigation Panel to gather medical evidence through interviews, tests, and scans.",
    targetElement: "#investigation-panel",
    milestone: { type: "time", value: 30 },
    position: "top",
  },
  {
    id: "budget-management",
    title: "Budget Management",
    content:
      "Monitor your MON token budget. Each action costs resources. Manage wisely to avoid running out.",
    targetElement: ".master-hud",
    milestone: { type: "budget", value: 50 },
    position: "right",
  },
  {
    id: "treatment-options",
    title: "Treatment Options",
    content:
      "Access treatment options through the Medical Actions menu. AI predictions show success rates.",
    targetElement: '[data-tool-id="treatment"]',
    milestone: { type: "evidence", value: 3 },
    position: "bottom",
  },
  {
    id: "ai-consultation",
    title: "AI Consultation",
    content:
      "Get AI-powered clinical guidance when you need expert advice during complex cases.",
    targetElement: '[data-tool-id="consultation"]',
    milestone: { type: "health", value: 40 },
    position: "bottom",
  },
];

export const TutorialSystem: React.FC<TutorialSystemProps> = ({
  currentMilestone,
  onComplete,
  onSkip,
}) => {
  const [activeStep, setActiveStep] = useState<TutorialStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  // Check for completed steps in session storage
  useEffect(() => {
    const completed = sessionStorage.getItem("tutorial-completed-steps");
    if (completed) {
      setCompletedSteps(new Set(JSON.parse(completed)));
    }
  }, []);

  // Save completed steps to session storage
  useEffect(() => {
    sessionStorage.setItem(
      "tutorial-completed-steps",
      JSON.stringify(Array.from(completedSteps))
    );
  }, [completedSteps]);

  // Check for new tutorial steps based on milestones
  useEffect(() => {
    // Find the next step that matches the current milestone and hasn't been completed
    const nextStep = TUTORIAL_STEPS.find((step) => {
      if (completedSteps.has(step.id)) return false;

      // Check if milestone matches
      if (step.milestone.type !== currentMilestone.type) return false;

      // Check if milestone value has been reached
      return currentMilestone.value >= step.milestone.value;
    });

    if (nextStep) {
      setActiveStep(nextStep);
      setIsVisible(true);
    }
  }, [currentMilestone, completedSteps]);

  const handleComplete = () => {
    if (activeStep) {
      setCompletedSteps((prev) => new Set(prev).add(activeStep.id));
      onComplete?.(activeStep.id);
      setIsVisible(false);
      setActiveStep(null);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    setIsVisible(false);
    setActiveStep(null);
  };

  if (!isVisible || !activeStep) return null;

  const styles: Record<string, React.CSSProperties> = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: zIndex.modal,
      fontFamily: typography.fontFamily.primary,
    },
    modal: {
      background: colors.background.gradient.panel,
      border: `${borders.width.base} solid ${colors.border.primary}`,
      borderRadius: borders.radius.xl,
      backdropFilter: effects.blur.lg,
      boxShadow: `${effects.shadow.xl}, ${effects.shadow.primaryGlow}`,
      maxWidth: "500px",
      width: "90%",
      padding: spacing.xl,
      position: "relative",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.base,
      textShadow: effects.textShadow.sm,
    },
    content: {
      fontSize: typography.fontSize.base,
      color: colors.neutral.lightest,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: spacing.xl,
    },
    buttonGroup: {
      display: "flex",
      gap: spacing.md,
    },
    button: {
      flex: 1,
      padding: `${spacing.md} ${spacing.lg}`,
      borderRadius: borders.radius.md,
      border: "none",
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    primaryButton: {
      background: `linear-gradient(135deg, ${colors.primary.base}, ${colors.primary.dark})`,
      color: colors.neutral.black,
      boxShadow: effects.shadow.primaryGlow,
    },
    secondaryButton: {
      background: colors.background.panelLight,
      color: colors.neutral.light,
      border: `${borders.width.thin} solid ${colors.border.primary}`,
    },
    skipButton: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      background: "transparent",
      border: "none",
      color: colors.neutral.base,
      fontSize: typography.fontSize.sm,
      cursor: "pointer",
      padding: spacing.xs,
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.skipButton} onClick={handleSkip}>
          Skip Tutorial
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>{activeStep.title}</h2>
        </div>

        <div style={styles.content}>{activeStep.content}</div>

        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleComplete}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
