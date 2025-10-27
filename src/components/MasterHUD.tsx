"use client";

/**
 * Master HUD Component
 * CLEAN: Comprehensive heads-up display integrating:
 * - Budget information (MON tokens, efficiency, admin messages)
 * - Patient state (health, criticality, milestones)
 * - Diagnostic confidence (evidence tracking)
 * - Phase progression indicators
 * - Treatment outcome predictions
 *
 * DESIGN: Follows X-RAY design tokens for consistency
 * MODULAR: Can be collapsed/expanded per section
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
import { PhaseIndicator } from "./PhaseIndicator";
import { GamePhase } from "../domains/diagnostic/GameManager";
import { ContextualHelp, HELP_TIPS } from "./ContextualHelp";

// ENHANCEMENT: Extended interface with patient and diagnostic data
interface MasterHUDProps {
  // Budget data (existing)
  budget: {
    remaining: number;
    spent: number;
    startingAmount: number;
    difficultyTier: "beginner" | "intermediate" | "advanced" | "expert";
  };

  // Patient state data (enhanced)
  patientState?: {
    currentHealth: number; // 0-100
    criticality: "stable" | "deteriorating" | "critical" | "terminal";
    timeSinceAdmission: number; // minutes
    nextMilestone?: {
      health: number;
      event: string;
      timeRemaining: number; // minutes
    };
    complications: string[];
    // ENHANCEMENT: Crisis event information
    activeCrises?: Array<{
      id: string;
      title: string;
      severity: "low" | "moderate" | "high" | "critical";
      description: string;
    }>;
  };

  // Diagnostic confidence data (new)
  diagnosticData?: {
    evidenceCount: number;
    topDiagnosis?: {
      name: string;
      confidence: number; // 0-1
    };
    overallCertainty: number; // 0-1
    recommendation?:
      | "investigate_more"
      | "consult_specialist"
      | "diagnose"
      | "emergency";
  };

  // Game phase (new)
  currentPhase?: GamePhase;
  timeRemaining?: number;

  // Administrator message (existing)
  administratorMessage?: {
    message: string;
    urgency: "normal" | "warning" | "critical";
  };

  // Actions (existing)
  onRequestFunds?: () => void;
  onContributeFunds?: () => void;
  hasWallet: boolean;
}

export const MasterHUD: React.FC<MasterHUDProps> = ({
  budget,
  patientState,
  diagnosticData,
  currentPhase,
  timeRemaining,
  administratorMessage,
  onRequestFunds,
  onContributeFunds,
  hasWallet,
}) => {
  const [expandedSection, setExpandedSection] = useState<
    "budget" | "patient" | "diagnostic" | null
  >(null);
  const [showAdminMessage, setShowAdminMessage] = useState(false);

  // Show admin message when it changes
  useEffect(() => {
    if (administratorMessage) {
      setShowAdminMessage(true);
      const timer = setTimeout(() => {
        setShowAdminMessage(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [administratorMessage]);

  // Helper functions
  const getBudgetPercentage = () =>
    (budget.remaining / budget.startingAmount) * 100;
  const isBudgetCritical = () => getBudgetPercentage() < 20;
  const isBudgetLow = () => getBudgetPercentage() < 40 && !isBudgetCritical();

  const getBudgetColor = () => {
    if (isBudgetCritical()) return colors.error.base;
    if (isBudgetLow()) return colors.accent.base;
    return colors.primary.base;
  };

  // ENHANCEMENT: Get health color with crisis awareness
  const getHealthColor = () => {
    if (!patientState) return colors.neutral.base;

    // Check for active crises
    if (patientState.activeCrises && patientState.activeCrises.length > 0) {
      // Get the highest severity crisis
      const severities: ("low" | "moderate" | "high" | "critical")[] = [
        "low",
        "moderate",
        "high",
        "critical",
      ];
      let maxSeverityIndex = 0;

      patientState.activeCrises.forEach((crisis) => {
        const severityIndex = severities.indexOf(crisis.severity);
        if (severityIndex > maxSeverityIndex) {
          maxSeverityIndex = severityIndex;
        }
      });

      const maxSeverity = severities[maxSeverityIndex];

      switch (maxSeverity) {
        case "critical":
          return colors.error.dark;
        case "high":
          return colors.error.base;
        case "moderate":
          return colors.accent.base;
        default:
          return colors.primary.base;
      }
    }

    // Normal health-based coloring
    if (patientState.currentHealth <= 20) return colors.error.base;
    if (patientState.currentHealth <= 40) return colors.error.light;
    if (patientState.currentHealth <= 70) return colors.accent.base;
    return colors.primary.base; // Healthy = primary green
  };

  // ENHANCEMENT: Get criticality label with crisis awareness
  const getCriticalityLabel = (criticality: string) => {
    // Check for active crises
    if (patientState?.activeCrises && patientState.activeCrises.length > 0) {
      // Get the highest severity crisis
      const severities: ("low" | "moderate" | "high" | "critical")[] = [
        "low",
        "moderate",
        "high",
        "critical",
      ];
      let maxSeverityIndex = 0;

      patientState.activeCrises.forEach((crisis) => {
        const severityIndex = severities.indexOf(crisis.severity);
        if (severityIndex > maxSeverityIndex) {
          maxSeverityIndex = severityIndex;
        }
      });

      const maxSeverity = severities[maxSeverityIndex];

      switch (maxSeverity) {
        case "critical":
          return { text: "🚨 Critical Crisis", color: colors.error.dark };
        case "high":
          return { text: "⚠️ High Crisis", color: colors.error.base };
        case "moderate":
          return { text: "⚠️ Moderate Crisis", color: colors.accent.base };
        default:
          return { text: "⚠️ Crisis Active", color: colors.primary.base };
      }
    }

    // Normal criticality labels
    const labels = {
      stable: { text: "✓ Stable", color: colors.primary.base },
      deteriorating: { text: "⚠ Deteriorating", color: colors.accent.base },
      critical: { text: "🚨 Critical", color: colors.error.base },
      terminal: { text: "💀 Terminal", color: colors.error.dark },
    };
    return labels[criticality as keyof typeof labels] || labels.stable;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.75) return colors.primary.base;
    if (confidence >= 0.5) return colors.accent.base;
    return colors.error.base;
  };

  const getPhaseDisplay = (phase: string) => {
    const phaseMap: Record<string, { icon: string; label: string }> = {
      patient_arrival: { icon: "🚑", label: "Patient Arrival" },
      investigation: { icon: "🔍", label: "Investigation" },
      evidence_gathering: { icon: "📋", label: "Gathering Evidence" },
      diagnosis: { icon: "⚕️", label: "Diagnosis" },
      completed: { icon: "✅", label: "Complete" },
      scanning: { icon: "🔍", label: "Scanning" },
      analyzing: { icon: "🧠", label: "Analyzing" },
      solved: { icon: "✅", label: "Solved" },
    };
    return phaseMap[phase] || { icon: "⏳", label: "In Progress" };
  };

  const styles = {
    container: {
      position: "fixed" as const,
      top: spacing.xl,
      right: spacing.xl,
      zIndex: zIndex.panel,
      fontFamily: typography.fontFamily.primary,
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: spacing.md,
      maxWidth: "320px",
    },
    section: {
      background: colors.background.gradient.panel,
      border: `${borders.width.base} solid ${colors.border.primary}`,
      borderRadius: borders.radius.xl,
      backdropFilter: effects.blur.lg,
      boxShadow: effects.shadow.md,
      overflow: "hidden",
      transition: "all 300ms ease",
    },
    sectionHeader: {
      display: "flex" as const,
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      cursor: "pointer",
      borderBottom: `1px solid ${colors.border.primary}22`,
      transition: "background 200ms ease",
    },
    sectionTitle: {
      display: "flex" as const,
      alignItems: "center",
      gap: spacing.sm,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.neutral.light,
      textTransform: "uppercase" as const,
      letterSpacing: typography.letterSpacing.wider,
    },
    sectionContent: {
      padding: spacing.lg,
      fontSize: typography.fontSize.sm,
    },
    progressBar: {
      height: "10px",
      background: colors.background.primaryGlow,
      borderRadius: borders.radius.full,
      overflow: "hidden" as const,
      border: `1px solid ${colors.border.primary}`,
      marginBottom: spacing.sm,
    },
    progressFill: {
      height: "100%",
      transition: "width 300ms ease",
    },
    statRow: {
      display: "flex" as const,
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
      fontSize: typography.fontSize.sm,
      color: colors.neutral.light,
    },
    statLabel: {
      color: colors.neutral.base,
    },
    statValue: {
      fontWeight: typography.fontWeight.semibold,
      color: colors.neutral.lightest,
      fontFamily: typography.fontFamily.monospace,
    },
    milestoneWarning: {
      padding: spacing.sm,
      background: `${colors.accent.base}22`,
      border: `1px solid ${colors.accent.base}`,
      borderRadius: borders.radius.md,
      fontSize: typography.fontSize.xs,
      color: colors.accent.light,
      marginTop: spacing.sm,
    },
    confidenceMeter: {
      height: "24px",
      background: colors.background.primaryGlow,
      borderRadius: borders.radius.base,
      overflow: "hidden" as const,
      border: `1px solid ${colors.border.primary}`,
      position: "relative" as const,
      marginBottom: spacing.md,
    },
    actionButton: {
      width: "100%",
      padding: `${spacing.sm} ${spacing.md}`,
      background: "transparent",
      border: `${borders.width.base} solid ${colors.border.primary}`,
      borderRadius: borders.radius.md,
      color: colors.primary.base,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      cursor: "pointer",
      transition: "all 200ms ease",
      backdropFilter: effects.blur.sm,
      marginTop: spacing.sm,
    },
    adminMessageContainer: {
      background: colors.background.gradient.panel,
      border: `${borders.width.base} solid ${
        administratorMessage?.urgency === "critical"
          ? colors.error.base
          : administratorMessage?.urgency === "warning"
          ? colors.accent.base
          : colors.info.base
      }`,
      borderRadius: borders.radius.xl,
      backdropFilter: effects.blur.lg,
      padding: spacing.lg,
      boxShadow: effects.shadow.md,
      fontSize: typography.fontSize.sm,
      color: colors.neutral.lightest,
      lineHeight: typography.lineHeight.relaxed,
      opacity: showAdminMessage ? 1 : 0,
      transform: showAdminMessage ? "translateY(0)" : "translateY(-10px)",
      transition: "all 300ms ease",
      pointerEvents: showAdminMessage ? ("auto" as const) : ("none" as const),
    },

    // ENHANCEMENT: Crisis indicator styles
    crisisIndicator: {
      padding: spacing.sm,
      borderRadius: borders.radius.md,
      marginBottom: spacing.sm,
      fontSize: typography.fontSize.sm,
      display: "flex" as const,
      alignItems: "center",
      gap: spacing.xs,
    },

    crisisTitle: {
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
    },

    crisisDescription: {
      fontSize: typography.fontSize.xs,
      opacity: 0.8,
      marginTop: spacing.xs,
    },

    // ENHANCEMENT: Health bar style
    healthBar: {
      height: "24px",
      background: colors.background.primaryGlow,
      borderRadius: borders.radius.base,
      overflow: "hidden" as const,
      border: `1px solid ${colors.border.primary}`,
      position: "relative" as const,
      marginBottom: spacing.md,
    },
  };

  const toggleSection = (section: typeof expandedSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div style={styles.container}>
      {/* Phase Indicator */}
      {currentPhase && (
        <ContextualHelp tip={HELP_TIPS.phaseIndicator}>
          <PhaseIndicator
            currentPhase={currentPhase}
            timeRemaining={timeRemaining}
            patientCriticality={patientState?.criticality}
            compact={true}
          />
        </ContextualHelp>
      )}

      {/* Patient State Section */}
      {patientState && (
        <div
          style={{
            ...styles.section,
            borderColor: getHealthColor(),
          }}
        >
          <div
            style={styles.sectionHeader}
            onClick={() => toggleSection("patient")}
          >
            <h3 style={styles.sectionTitle}>🩺 Patient Status</h3>
            <span style={{ fontSize: "1.2em" }}>
              {expandedSection === "patient" ? "▼" : "▶"}
            </span>
          </div>

          {expandedSection === "patient" && (
            <div style={styles.sectionContent}>
              {/* Criticality Status */}
              <div
                style={{
                  ...styles.statRow,
                  background: `${
                    getCriticalityLabel(patientState.criticality).color
                  }22`,
                  border: `1px solid ${
                    getCriticalityLabel(patientState.criticality).color
                  }`,
                  color: getCriticalityLabel(patientState.criticality).color,
                }}
              >
                <span style={styles.statLabel}>Status</span>
                <span style={styles.statValue}>
                  {getCriticalityLabel(patientState.criticality).text}
                </span>
              </div>

              {/* Health Bar */}
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Health</span>
                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      ...styles.progressBar,
                      backgroundColor: `${getHealthColor()}33`,
                      border: `1px solid ${getHealthColor()}`,
                    }}
                  >
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${patientState.currentHealth}%`,
                        backgroundColor: getHealthColor(),
                      }}
                    />
                  </div>
                  <span style={{ ...styles.statValue, marginLeft: spacing.sm }}>
                    {Math.round(patientState.currentHealth)}%
                  </span>
                </div>
              </div>

              {/* Time Since Admission */}
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Admitted</span>
                <span style={styles.statValue}>
                  {Math.floor(patientState.timeSinceAdmission)} min
                </span>
              </div>

              {/* Next Milestone */}
              {patientState.nextMilestone && (
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Next Milestone</span>
                  <span style={styles.statValue}>
                    ⚠️ {patientState.nextMilestone.health}% health in ~
                    {Math.floor(patientState.nextMilestone.timeRemaining)} min
                  </span>
                </div>
              )}

              {/* Complications */}
              {patientState.complications.length > 0 && (
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Complications</span>
                  <span style={styles.statValue}>
                    {patientState.complications.length}
                  </span>
                </div>
              )}

              {/* ENHANCEMENT: Active Crises */}
              {patientState.activeCrises &&
                patientState.activeCrises.length > 0 && (
                  <div style={{ marginTop: spacing.md }}>
                    <h4
                      style={{
                        color: colors.error.base,
                        marginBottom: spacing.sm,
                        display: "flex" as const,
                        alignItems: "center",
                        gap: spacing.xs,
                      }}
                    >
                      🚨 Active Crises
                    </h4>
                    {patientState.activeCrises.map((crisis, index) => (
                      <div
                        key={index}
                        style={{
                          ...styles.crisisIndicator,
                          background: `${getHealthColor()}22`,
                          border: `1px solid ${getHealthColor()}`,
                        }}
                      >
                        <div>
                          <div style={styles.crisisTitle}>{crisis.title}</div>
                          <div style={styles.crisisDescription}>
                            {crisis.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* Diagnostic Confidence Section */}
      {diagnosticData && (
        <div style={styles.section}>
          <div
            style={styles.sectionHeader}
            onClick={() => toggleSection("diagnostic")}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${colors.info.base}11`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={styles.sectionTitle}>
              <span>🔬</span>
              <span>Diagnostic</span>
            </div>
            <span style={{ fontSize: typography.fontSize.xl }}>
              {diagnosticData.evidenceCount} 📋
            </span>
          </div>

          {expandedSection === "diagnostic" && (
            <div style={styles.sectionContent}>
              <div style={{ marginBottom: spacing.md }}>
                <div style={styles.statLabel}>Overall Certainty</div>
                <div style={styles.confidenceMeter}>
                  <div
                    style={{
                      height: "100%",
                      background: `linear-gradient(90deg, ${getConfidenceColor(
                        diagnosticData.overallCertainty
                      )}, ${getConfidenceColor(
                        diagnosticData.overallCertainty
                      )}aa)`,
                      boxShadow: `0 0 8px ${getConfidenceColor(
                        diagnosticData.overallCertainty
                      )}`,
                      width: `${diagnosticData.overallCertainty * 100}%`,
                      transition: "width 300ms ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.neutral.darkest,
                    }}
                  >
                    {(diagnosticData.overallCertainty * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {diagnosticData.topDiagnosis && (
                <>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Top Diagnosis:</span>
                    <span
                      style={{
                        ...styles.statValue,
                        color: getConfidenceColor(
                          diagnosticData.topDiagnosis.confidence
                        ),
                      }}
                    >
                      {(diagnosticData.topDiagnosis.confidence * 100).toFixed(
                        0
                      )}
                      %
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.neutral.lightest,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {diagnosticData.topDiagnosis.name}
                  </div>
                </>
              )}

              {diagnosticData.recommendation && (
                <div
                  style={{
                    display: "inline-block",
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: `${
                      diagnosticData.recommendation === "emergency"
                        ? colors.error.base
                        : diagnosticData.recommendation === "diagnose"
                        ? colors.primary.base
                        : diagnosticData.recommendation === "consult_specialist"
                        ? colors.accent.base
                        : colors.info.base
                    }22`,
                    border: `1px solid ${
                      diagnosticData.recommendation === "emergency"
                        ? colors.error.base
                        : diagnosticData.recommendation === "diagnose"
                        ? colors.primary.base
                        : diagnosticData.recommendation === "consult_specialist"
                        ? colors.accent.base
                        : colors.info.base
                    }`,
                    borderRadius: borders.radius.base,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color:
                      diagnosticData.recommendation === "emergency"
                        ? colors.error.base
                        : diagnosticData.recommendation === "diagnose"
                        ? colors.primary.base
                        : diagnosticData.recommendation === "consult_specialist"
                        ? colors.accent.base
                        : colors.info.base,
                    textTransform: "uppercase" as const,
                  }}
                >
                  {diagnosticData.recommendation.replace("_", " ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Budget Section */}
      <div
        style={{
          ...styles.section,
          borderColor: getBudgetColor(),
        }}
      >
        <ContextualHelp tip={HELP_TIPS.budget}>
          <div
            style={styles.sectionHeader}
            onClick={() => toggleSection("budget")}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${getBudgetColor()}11`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={styles.sectionTitle}>
              <span>💰</span>
              <span>Budget</span>
            </div>
            <span
              style={{
                fontSize: typography.fontSize["2xl"],
                color: getBudgetColor(),
                fontFamily: typography.fontFamily.monospace,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              {budget.remaining.toFixed(2)}
            </span>
          </div>
        </ContextualHelp>

        {expandedSection === "budget" && (
          <div style={styles.sectionContent}>
            <div style={styles.healthBar}>
              <div
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${getBudgetColor()}, ${getBudgetColor()}aa)`,
                  boxShadow: `0 0 10px ${getBudgetColor()}`,
                  width: `${getBudgetPercentage()}%`,
                  transition: "width 300ms ease",
                }}
              />
            </div>

            <div style={styles.statRow}>
              <span style={styles.statLabel}>Starting:</span>
              <span style={styles.statValue}>
                {budget.startingAmount.toFixed(2)} MON
              </span>
            </div>

            <div style={styles.statRow}>
              <span style={styles.statLabel}>Spent:</span>
              <span style={styles.statValue}>
                {budget.spent.toFixed(2)} MON
              </span>
            </div>

            <div style={styles.statRow}>
              <span style={styles.statLabel}>Efficiency:</span>
              <span style={{ ...styles.statValue, color: getBudgetColor() }}>
                {getBudgetPercentage().toFixed(0)}%
              </span>
            </div>

            <div
              style={{
                display: "inline-block" as const,
                padding: `${spacing.xs} ${spacing.sm}`,
                background: `${colors.primary.base}22`,
                border: `1px solid ${colors.primary.base}`,
                borderRadius: borders.radius.base,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.semibold,
                color: colors.primary.base,
                textTransform: "uppercase" as const,
                marginTop: spacing.md,
              }}
            >
              {budget.difficultyTier}
            </div>

            {hasWallet && (
              <>
                <ContextualHelp tip={HELP_TIPS.walletConnection}>
                  <button
                    style={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestFunds?.();
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        colors.background.primaryGlow;
                      e.currentTarget.style.borderColor = colors.primary.base;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = colors.border.primary;
                    }}
                  >
                    💸 Request Additional Funds
                  </button>
                </ContextualHelp>
                <button
                  style={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onContributeFunds?.();
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      colors.background.primaryGlow;
                    e.currentTarget.style.borderColor = colors.primary.base;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = colors.border.primary;
                  }}
                >
                  💵 Contribute Personal Funds
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Administrator Message */}
      {administratorMessage && (
        <div style={styles.adminMessageContainer}>
          {administratorMessage.message}
        </div>
      )}
    </div>
  );
};
