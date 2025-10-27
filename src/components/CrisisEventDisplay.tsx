/**
 * Crisis Event Display Component
 * ENHANCEMENT: Visual display of active crisis events
 * CLEAN: Single responsibility - show crisis information to user
 * MODULAR: Integrates with TimerNarrativeManager and GameManager
 *
 * Core Principles:
 * - Clear, immediate crisis awareness
 * - Actionable crisis response options
 * - Immersive visual presentation
 * - Non-intrusive but attention-grabbing
 */

import React, { useState, useEffect } from "react";
import {
  colors,
  spacing,
  typography,
  borders,
  effects,
  zIndex,
} from "../styles/design-tokens";

interface CrisisEvent {
  id: string;
  title: string;
  description: string;
  severity: "low" | "moderate" | "high" | "critical";
  type:
    | "deterioration"
    | "complication"
    | "emergency"
    | "recovery"
    | "breakthrough";
  triggeredAt: number;
  resolved: boolean;
  playerResponse?: "success" | "failure" | "ignored";
}

interface CrisisEventDisplayProps {
  activeCrises: CrisisEvent[];
  onRespond: (eventId: string) => void;
  onDismiss: (eventId: string) => void;
  onTimeout: (eventId: string) => void;
}

export const CrisisEventDisplay: React.FC<CrisisEventDisplayProps> = ({
  activeCrises,
  onRespond,
  onDismiss,
  onTimeout,
}) => {
  const [visibleCrises, setVisibleCrises] = useState<CrisisEvent[]>([]);
  const [timers, setTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Update visible crises when active crises change
  useEffect(() => {
    setVisibleCrises(activeCrises.filter((crisis) => !crisis.resolved));
  }, [activeCrises]);

  // Set up auto-dismiss timers for new crises
  useEffect(() => {
    const newTimers = new Map(timers);

    visibleCrises.forEach((crisis) => {
      // If we don't already have a timer for this crisis, set one
      if (!newTimers.has(crisis.id)) {
        const timer = setTimeout(() => {
          onTimeout(crisis.id);
          // Remove the timer from our map
          setTimers((prev) => {
            const updated = new Map(prev);
            updated.delete(crisis.id);
            return updated;
          });
        }, 10000); // 10 seconds timeout

        newTimers.set(crisis.id, timer);
      }
    });

    setTimers(newTimers);

    // Clean up timers on unmount
    return () => {
      newTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [visibleCrises, onTimeout]);

  // Clean up timers when crises are resolved
  useEffect(() => {
    const resolvedCrises = activeCrises.filter((crisis) => crisis.resolved);
    const newTimers = new Map(timers);

    resolvedCrises.forEach((crisis) => {
      if (newTimers.has(crisis.id)) {
        clearTimeout(newTimers.get(crisis.id)!);
        newTimers.delete(crisis.id);
      }
    });

    setTimers(newTimers);
  }, [activeCrises, timers]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return colors.error.dark;
      case "high":
        return colors.error.base;
      case "moderate":
        return colors.accent.base;
      case "low":
        return colors.primary.base;
      default:
        return colors.neutral.base;
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case "critical":
        return colors.border.error;
      case "high":
        return colors.border.error;
      case "moderate":
        return colors.border.accent;
      case "low":
        return colors.border.primary;
      default:
        return colors.border.neutral;
    }
  };

  const getSeverityBackground = (severity: string) => {
    const color = getSeverityColor(severity);
    return `${color}22`; // 13% opacity
  };

  const getEmojiForType = (type: string) => {
    switch (type) {
      case "deterioration":
        return "📉";
      case "complication":
        return "⚠️";
      case "emergency":
        return "🚨";
      case "recovery":
        return "✅";
      case "breakthrough":
        return "💡";
      default:
        return "⚠️";
    }
  };

  const handleRespond = (eventId: string) => {
    // Clear the timer for this crisis
    if (timers.has(eventId)) {
      clearTimeout(timers.get(eventId)!);
      setTimers((prev) => {
        const updated = new Map(prev);
        updated.delete(eventId);
        return updated;
      });
    }

    onRespond(eventId);
  };

  const handleDismiss = (eventId: string) => {
    // Clear the timer for this crisis
    if (timers.has(eventId)) {
      clearTimeout(timers.get(eventId)!);
      setTimers((prev) => {
        const updated = new Map(prev);
        updated.delete(eventId);
        return updated;
      });
    }

    onDismiss(eventId);
  };

  if (visibleCrises.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: zIndex.notification,
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
        maxWidth: "350px",
      }}
    >
      {visibleCrises.map((crisis) => (
        <div
          key={crisis.id}
          style={{
            background: "rgba(0, 0, 0, 0.9)",
            border: `2px solid ${getSeverityBorder(crisis.severity)}`,
            borderRadius: borders.radius.lg,
            padding: spacing.lg,
            color: colors.neutral.lightest,
            backdropFilter: effects.blur.lg,
            boxShadow: effects.shadow.xl,
            animation: "slideInRight 0.3s ease-out",
            transform: "translateX(0)",
            transition: "transform 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <div
              style={{
                fontSize: "24px",
                marginRight: spacing.sm,
              }}
            >
              {getEmojiForType(crisis.type)}
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  color: getSeverityColor(crisis.severity),
                  fontSize: typography.fontSize.lg,
                }}
              >
                {crisis.title}
              </h3>
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  opacity: 0.7,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {crisis.type} • {crisis.severity}
              </div>
            </div>
          </div>

          {/* Description */}
          <p
            style={{
              margin: `0 0 ${spacing.md} 0`,
              fontSize: typography.fontSize.sm,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            {crisis.description}
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: spacing.sm,
            }}
          >
            <button
              onClick={() => handleRespond(crisis.id)}
              style={{
                flex: 1,
                background: getSeverityColor(crisis.severity),
                color: colors.neutral.black,
                border: "none",
                borderRadius: borders.radius.md,
                padding: spacing.md,
                cursor: "pointer",
                fontWeight: typography.fontWeight.bold,
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Respond
            </button>
            <button
              onClick={() => handleDismiss(crisis.id)}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.1)",
                color: colors.neutral.lightest,
                border: `1px solid ${colors.border.neutral}`,
                borderRadius: borders.radius.md,
                padding: spacing.md,
                cursor: "pointer",
                fontWeight: typography.fontWeight.medium,
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              Dismiss
            </button>
          </div>

          {/* Timer indicator */}
          <div
            style={{
              marginTop: spacing.sm,
              height: "3px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                background: getSeverityColor(crisis.severity),
                animation: "timeoutProgress 10s linear forwards",
              }}
            />
          </div>
        </div>
      ))}

      {/* Global styles for animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes timeoutProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};
