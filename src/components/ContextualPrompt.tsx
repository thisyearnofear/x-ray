"use client";

/**
 * Contextual Prompt Component
 * ENHANCEMENT: Timer-based contextual prompts
 * CLEAN: Non-intrusive notifications with smart timing
 * DESIGN: Follows X-RAY notification system
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  colors,
  typography,
  spacing,
  borders,
  effects,
  zIndex,
} from "../styles/design-tokens";

interface PromptCondition {
  type:
    | "time_remaining"
    | "budget_threshold"
    | "health_threshold"
    | "evidence_count";
  value: number;
  comparison: "lt" | "lte" | "gt" | "gte" | "eq";
}

interface ContextualPromptProps {
  id: string;
  title: string;
  message: string;
  conditions: PromptCondition[];
  priority: "low" | "medium" | "high" | "critical";
  duration?: number; // seconds to show (0 = until dismissed)
  showOnce?: boolean;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
  gameState: {
    timeRemaining: number;
    budgetRemaining: number;
    health: number;
    evidenceCount: number;
  };
}

export const ContextualPrompt: React.FC<ContextualPromptProps> = ({
  id,
  title,
  message,
  conditions,
  priority,
  duration = 8,
  showOnce = false,
  actions = [],
  gameState,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Check if prompt should be shown based on conditions
  const shouldShowPrompt = useCallback((): boolean => {
    // Check if already shown (for showOnce prompts)
    if (showOnce && hasBeenShown) return false;

    // Check all conditions
    return conditions.every((condition) => {
      const { type, value, comparison } = condition;
      let gameStateValue: number;

      switch (type) {
        case "time_remaining":
          gameStateValue = gameState.timeRemaining;
          break;
        case "budget_threshold":
          gameStateValue = gameState.budgetRemaining;
          break;
        case "health_threshold":
          gameStateValue = gameState.health;
          break;
        case "evidence_count":
          gameStateValue = gameState.evidenceCount;
          break;
        default:
          return false;
      }

      switch (comparison) {
        case "lt":
          return gameStateValue < value;
        case "lte":
          return gameStateValue <= value;
        case "gt":
          return gameStateValue > value;
        case "gte":
          return gameStateValue >= value;
        case "eq":
          return gameStateValue === value;
        default:
          return false;
      }
    });
  }, [conditions, gameState, showOnce, hasBeenShown]);

  // Check conditions when game state changes
  useEffect(() => {
    if (shouldShowPrompt()) {
      setIsVisible(true);
      if (showOnce) {
        setHasBeenShown(true);
      }

      // Auto-hide after duration if specified
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, duration * 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, duration, showOnce, hasBeenShown, shouldShowPrompt]);

  // Get priority-based styling
  const getPriorityStyles = () => {
    switch (priority) {
      case "critical":
        return {
          border: `${borders.width.base} solid ${colors.error.base}`,
          background: `linear-gradient(135deg, ${colors.background.errorGlow}, ${colors.error.dark}22)`,
          titleColor: colors.error.base,
          icon: "🚨",
        };
      case "high":
        return {
          border: `${borders.width.base} solid ${colors.accent.base}`,
          background: `linear-gradient(135deg, ${colors.background.accentGlow}, ${colors.accent.dark}22)`,
          titleColor: colors.accent.base,
          icon: "⚠️",
        };
      case "medium":
        return {
          border: `${borders.width.base} solid ${colors.info.base}`,
          background: `linear-gradient(135deg, ${colors.background.infoGlow}, ${colors.info.dark}22)`,
          titleColor: colors.info.base,
          icon: "ℹ️",
        };
      case "low":
      default:
        return {
          border: `${borders.width.base} solid ${colors.primary.base}`,
          background: `linear-gradient(135deg, ${colors.background.primaryGlow}, ${colors.primary.dark}22)`,
          titleColor: colors.primary.base,
          icon: "💡",
        };
    }
  };

  const priorityStyles = getPriorityStyles();

  if (!isVisible) return null;

  const styles: Record<string, React.CSSProperties> = {
    container: {
      position: "fixed",
      top: spacing.xl,
      right: spacing.xl,
      zIndex: zIndex.notification,
      background: priorityStyles.background,
      border: priorityStyles.border,
      borderRadius: borders.radius.xl,
      backdropFilter: effects.blur.lg,
      boxShadow: `${effects.shadow.lg}, 0 0 20px ${priorityStyles.titleColor}44`,
      padding: spacing.lg,
      maxWidth: "350px",
      fontFamily: typography.fontFamily.primary,
      transform: "translateX(0)",
      transition: "transform 0.3s ease, opacity 0.3s ease",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    icon: {
      fontSize: typography.fontSize["2xl"],
      filter: `drop-shadow(0 0 8px ${priorityStyles.titleColor})`,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: priorityStyles.titleColor,
      textShadow: effects.textShadow.sm,
      flex: 1,
    },
    closeButton: {
      background: "transparent",
      border: "none",
      color: colors.neutral.light,
      fontSize: typography.fontSize.lg,
      cursor: "pointer",
      padding: spacing.xs,
      borderRadius: borders.radius.full,
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    message: {
      fontSize: typography.fontSize.sm,
      color: colors.neutral.lightest,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: spacing.md,
    },
    actions: {
      display: "flex",
      gap: spacing.sm,
      flexWrap: "wrap",
    },
    actionButton: {
      flex: 1,
      padding: `${spacing.sm} ${spacing.md}`,
      background: "transparent",
      border: `${borders.width.thin} solid ${colors.border.primary}`,
      borderRadius: borders.radius.md,
      color: colors.neutral.light,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>{priorityStyles.icon}</span>
        <h3 style={styles.title}>{title}</h3>
        <button style={styles.closeButton} onClick={() => setIsVisible(false)}>
          ✕
        </button>
      </div>

      <p style={styles.message}>{message}</p>

      {actions.length > 0 && (
        <div style={styles.actions}>
          {actions.map((action, index) => (
            <button
              key={index}
              style={styles.actionButton}
              onClick={() => {
                action.onClick();
                setIsVisible(false);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Contextual Prompt Manager
 * CENTRALIZED: Manage multiple contextual prompts
 */
interface PromptConfig {
  id: string;
  title: string;
  message: string;
  conditions: PromptCondition[];
  priority: "low" | "medium" | "high" | "critical";
  duration?: number;
  showOnce?: boolean;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

interface ContextualPromptManagerProps {
  prompts: PromptConfig[];
  gameState: {
    timeRemaining: number;
    budgetRemaining: number;
    health: number;
    evidenceCount: number;
  };
}

export const ContextualPromptManager: React.FC<
  ContextualPromptManagerProps
> = ({ prompts, gameState }) => {
  return (
    <>
      {prompts.map((prompt) => (
        <ContextualPrompt
          key={prompt.id}
          id={prompt.id}
          title={prompt.title}
          message={prompt.message}
          conditions={prompt.conditions}
          priority={prompt.priority}
          duration={prompt.duration}
          showOnce={prompt.showOnce}
          actions={prompt.actions}
          gameState={gameState}
        />
      ))}
    </>
  );
};

// Predefined prompts for common scenarios
export const DEFAULT_PROMPTS: PromptConfig[] = [
  {
    id: "low_time_warning",
    title: "Time Running Low",
    message:
      "Patient health is deteriorating. Consider taking immediate action.",
    conditions: [{ type: "time_remaining", value: 60, comparison: "lt" }],
    priority: "high",
    duration: 10,
    showOnce: false,
  },
  {
    id: "low_budget_warning",
    title: "Budget Alert",
    message:
      "Your MON token budget is running low. Consider requesting additional funds.",
    conditions: [{ type: "budget_threshold", value: 20, comparison: "lt" }],
    priority: "medium",
    duration: 8,
    showOnce: false,
    actions: [
      {
        label: "Request Funds",
        onClick: () => {
          document.dispatchEvent(new CustomEvent("requestAdditionalFunds"));
        },
      },
    ],
  },
  {
    id: "critical_health",
    title: "Patient Critical",
    message:
      "Patient health is critically low. Immediate intervention required!",
    conditions: [{ type: "health_threshold", value: 20, comparison: "lt" }],
    priority: "critical",
    duration: 0, // Stay until dismissed
    showOnce: false,
  },
  {
    id: "first_evidence",
    title: "First Evidence Collected",
    message:
      "Great start! Continue gathering evidence to build your diagnosis.",
    conditions: [{ type: "evidence_count", value: 1, comparison: "eq" }],
    priority: "low",
    duration: 6,
    showOnce: true,
  },
  {
    id: "enough_evidence",
    title: "Ready to Diagnose",
    message:
      "You have sufficient evidence to make a diagnosis. Consider submitting your findings.",
    conditions: [{ type: "evidence_count", value: 5, comparison: "gte" }],
    priority: "medium",
    duration: 8,
    showOnce: true,
    actions: [
      {
        label: "Submit Diagnosis",
        onClick: () => {
          // Find and click the submit diagnosis button
          const submitBtn = document.querySelector("#submit-diagnosis");
          if (submitBtn instanceof HTMLElement) {
            submitBtn.click();
          }
        },
      },
    ],
  },
];
