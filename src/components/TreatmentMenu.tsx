"use client";

/**
 * Treatment Menu Component
 * IMMERSIVE: Medical actions with costs, risks, and outcomes
 * CLEAN: Categorized by type with affordability indicators
 * DESIGN: Holographic cards following X-RAY aesthetic
 * ENHANCEMENT: Integrated contextual help and outcome previews
 */

import React, { useState, useEffect } from "react";
import {
  colors,
  typography,
  spacing,
  borders,
  effects,
  animation,
} from "../styles/design-tokens";
import { MedicalAction, PatientState } from "../domains/medical/types";
import {
  DIAGNOSTIC_TESTS,
  TREATMENTS,
  CONSULTATIONS,
  getAffordableActions,
} from "../domains/medical/medical-actions-data";
import {
  OutcomePredictor,
  OutcomePrediction,
} from "../domains/medical/services/OutcomePredictor";
import { DiagnosticConfidence } from "../domains/medical/services/DiagnosticConfidence";
import { ContextualHelp, HELP_TIPS } from "./ContextualHelp";

interface TreatmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSelectAction: (action: MedicalAction) => void;
  executedActions: string[]; // IDs of already executed actions
  patientState?: PatientState; // For outcome prediction
  diagnosticConfidence?: DiagnosticConfidence; // For outcome prediction
  timeRemaining?: number; // For outcome prediction
  // ENHANCEMENT: Dynamic pricing support
  getDynamicPrice?: (action: MedicalAction) => number;
  getPricingExplanation?: (action: MedicalAction) => string;
}

type CategoryType = "all" | "test" | "treatment" | "consultation" | "imaging";

export const TreatmentMenu: React.FC<TreatmentMenuProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSelectAction,
  executedActions = [],
  patientState,
  diagnosticConfidence,
  timeRemaining = 300,
  getDynamicPrice,
  getPricingExplanation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [selectedAction, setSelectedAction] = useState<MedicalAction | null>(
    null
  );
  const [actionPredictions, setActionPredictions] = useState<
    Map<string, OutcomePrediction>
  >(new Map());

  // Get all actions
  const allActions = [...DIAGNOSTIC_TESTS, ...TREATMENTS, ...CONSULTATIONS];

  // Generate outcome predictions when menu opens or data changes
  useEffect(() => {
    if (isOpen && patientState && diagnosticConfidence) {
      const predictions = new Map<string, OutcomePrediction>();
      allActions.forEach((action) => {
        try {
          const prediction = OutcomePredictor.predictActionOutcome(
            action,
            patientState,
            diagnosticConfidence,
            timeRemaining
          );
          predictions.set(action.id, prediction);
        } catch (error) {
          console.warn(`Failed to predict outcome for ${action.id}:`, error);
        }
      });
      setActionPredictions(predictions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, patientState, diagnosticConfidence, timeRemaining]);

  if (!isOpen) return null;

  // Filter by category
  const filteredActions =
    selectedCategory === "all"
      ? allActions
      : allActions.filter((action) => action.category === selectedCategory);

  // Check if action is affordable
  const isAffordable = (action: MedicalAction) => action.cost <= currentBudget;

  // Check if action was already executed
  const wasExecuted = (action: MedicalAction) =>
    executedActions.includes(action.id);

  // Get prediction for action
  const getPrediction = (
    action: MedicalAction
  ): OutcomePrediction | undefined => {
    return actionPredictions.get(action.id);
  };

  // Get recommendation color
  const getRecommendationColor = (
    recommendation: OutcomePrediction["recommendation"]
  ) => {
    switch (recommendation) {
      case "strongly_recommended":
        return colors.primary.base;
      case "recommended":
        return colors.info.base;
      case "neutral":
        return colors.neutral.light;
      case "not_recommended":
        return colors.accent.base;
      case "strongly_discouraged":
        return colors.error.base;
      default:
        return colors.neutral.base;
    }
  };

  // Get risk color
  const getRiskColor = (risk: string) => {
    if (risk === "low") return colors.primary.base;
    if (risk === "medium") return colors.accent.base;
    return colors.error.base;
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      test: "🔬",
      treatment: "💊",
      consultation: "👨‍⚕️",
      imaging: "📸",
      all: "🏥",
    };
    return icons[category] || "🏥";
  };

  const styles: Record<string, React.CSSProperties> = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10001,
      fontFamily: typography.fontFamily.primary,
      animation: `fadeIn ${animation.duration.base} ${animation.easing.smooth}`,
    },
    container: {
      background: colors.background.gradient.panel,
      border: `${borders.width.base} solid ${colors.border.primary}`,
      borderRadius: borders.radius.xl,
      backdropFilter: effects.blur.lg,
      boxShadow: `${effects.shadow.xl}, ${effects.shadow.primaryGlow}`,
      maxWidth: "900px",
      width: "90%",
      maxHeight: "85vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    header: {
      padding: spacing.xl,
      borderBottom: `1px solid ${colors.border.primary}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: typography.fontSize["3xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.base,
      textShadow: effects.textShadow.sm,
    },
    closeButton: {
      width: "40px",
      height: "40px",
      borderRadius: borders.radius.full,
      background: "transparent",
      border: `${borders.width.base} solid ${colors.border.primary}`,
      color: colors.primary.base,
      fontSize: typography.fontSize.xl,
      cursor: "pointer",
      transition: `all ${animation.duration.fast}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    budgetBanner: {
      padding: spacing.md,
      background: colors.background.primaryGlow,
      borderBottom: `1px solid ${colors.border.primary}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    budgetLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.neutral.light,
    },
    budgetAmount: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.base,
      fontFamily: typography.fontFamily.monospace,
    },
    categoryNav: {
      display: "flex",
      gap: spacing.sm,
      padding: spacing.lg,
      borderBottom: `1px solid ${colors.border.primary}`,
      overflowX: "auto",
    },
    categoryButton: {
      padding: `${spacing.sm} ${spacing.lg}`,
      background: "transparent",
      border: `${borders.width.base} solid ${colors.border.primary}`,
      borderRadius: borders.radius.md,
      color: colors.neutral.light,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      cursor: "pointer",
      transition: `all ${animation.duration.fast}`,
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      gap: spacing.xs,
    },
    content: {
      flex: 1,
      overflowY: "auto",
      padding: spacing.lg,
    },
    actionGrid: {
      display: "grid",
      gap: spacing.md,
    },
    actionCard: {
      background: colors.background.gradient.primary,
      border: `${borders.width.thin} solid ${colors.border.primary}`,
      borderRadius: borders.radius.md,
      padding: spacing.md,
      cursor: "pointer",
      transition: `all ${animation.duration.base}`,
      display: "flex",
      gap: spacing.md,
    },
    actionIcon: {
      fontSize: "32px",
      filter: "drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))",
    },
    actionContent: {
      flex: 1,
    },
    actionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing.xs,
    },
    actionName: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.base,
    },
    actionCost: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      fontFamily: typography.fontFamily.monospace,
    },
    actionDescription: {
      fontSize: typography.fontSize.xs,
      color: colors.neutral.light,
      marginBottom: spacing.sm,
      lineHeight: typography.lineHeight.base,
    },
    actionMeta: {
      display: "flex",
      gap: spacing.sm,
      flexWrap: "wrap",
    },
    badge: {
      padding: `${spacing.xs} ${spacing.sm}`,
      borderRadius: borders.radius.base,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      border: `1px solid`,
    },
    detailPanel: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "400px",
      background: colors.background.gradient.panel,
      borderLeft: `${borders.width.base} solid ${colors.border.primary}`,
      padding: spacing.xl,
      overflowY: "auto",
      transform: "translateX(0)",
      transition: `transform ${animation.duration.base}`,
      boxShadow: effects.shadow.xl,
    },
    detailTitle: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.base,
      marginBottom: spacing.md,
    },
    detailSection: {
      marginBottom: spacing.lg,
    },
    detailLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.neutral.base,
      textTransform: "uppercase",
      letterSpacing: typography.letterSpacing.wide,
      marginBottom: spacing.xs,
    },
    detailText: {
      fontSize: typography.fontSize.sm,
      color: colors.neutral.lightest,
      lineHeight: typography.lineHeight.relaxed,
    },
    riskList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    riskItem: {
      padding: spacing.sm,
      background: colors.background.errorGlow,
      border: `1px solid ${colors.error.base}33`,
      borderRadius: borders.radius.base,
      marginBottom: spacing.xs,
      fontSize: typography.fontSize.xs,
      color: colors.error.light,
    },
    executeButton: {
      width: "100%",
      padding: `${spacing.md} ${spacing.xl}`,
      background: `linear-gradient(135deg, ${colors.primary.base}, ${colors.primary.dark})`,
      border: "none",
      borderRadius: borders.radius.md,
      color: colors.neutral.black,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      cursor: "pointer",
      boxShadow: effects.shadow.primaryGlow,
      transition: `all ${animation.duration.base}`,
      marginTop: spacing.xl,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <ContextualHelp tip={HELP_TIPS.treatmentMenu}>
            <h2 style={styles.title}>Medical Actions</h2>
          </ContextualHelp>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.background.primaryGlow;
              e.currentTarget.style.borderColor = colors.primary.base;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = colors.border.primary;
            }}
          >
            ✕
          </button>
        </div>

        {/* Budget Banner */}
        <div style={styles.budgetBanner}>
          <span style={styles.budgetLabel}>Available Budget:</span>
          <span style={styles.budgetAmount}>
            {currentBudget.toFixed(2)} MON
          </span>
        </div>

        {/* Category Navigation */}
        <div style={styles.categoryNav}>
          {(
            [
              "all",
              "test",
              "imaging",
              "treatment",
              "consultation",
            ] as CategoryType[]
          ).map((category) => (
            <button
              key={category}
              style={{
                ...styles.categoryButton,
                background:
                  selectedCategory === category
                    ? colors.background.primaryGlow
                    : "transparent",
                borderColor:
                  selectedCategory === category
                    ? colors.primary.base
                    : colors.border.primary,
                color:
                  selectedCategory === category
                    ? colors.primary.base
                    : colors.neutral.light,
              }}
              onClick={() => setSelectedCategory(category)}
            >
              <span>{getCategoryIcon(category)}</span>
              <span>{category.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.actionGrid}>
            {filteredActions.map((action) => {
              // ENHANCEMENT: Use dynamic pricing if available
              const dynamicPrice = getDynamicPrice
                ? getDynamicPrice(action)
                : action.cost;
              const affordable = dynamicPrice <= currentBudget;
              const executed = wasExecuted(action);

              const prediction = getPrediction(action);

              return (
                <div
                  key={action.id}
                  style={{
                    ...styles.actionCard,
                    opacity: affordable ? 1 : 0.5,
                    borderColor: executed
                      ? colors.primary.base
                      : colors.border.primary,
                  }}
                  onClick={() => affordable && setSelectedAction(action)}
                  onMouseEnter={(e) => {
                    if (affordable) {
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.borderColor = colors.primary.base;
                      e.currentTarget.style.boxShadow =
                        effects.shadow.primaryGlow;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.borderColor = executed
                      ? colors.primary.base
                      : colors.border.primary;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={styles.actionIcon}>
                    {getCategoryIcon(action.category)}
                  </div>
                  <div style={styles.actionContent}>
                    <div style={styles.actionHeader}>
                      <span style={styles.actionName}>{action.name}</span>
                      <span
                        style={{
                          ...styles.actionCost,
                          color: affordable
                            ? colors.primary.base
                            : colors.error.base,
                        }}
                      >
                        {dynamicPrice.toFixed(2)} MON
                        {dynamicPrice !== action.cost && (
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              color: colors.neutral.base,
                              textDecoration: "line-through",
                              marginLeft: spacing.xs,
                            }}
                          >
                            {action.cost.toFixed(2)}
                          </span>
                        )}
                      </span>
                    </div>
                    <p style={styles.actionDescription}>{action.description}</p>

                    {/* Outcome Preview */}
                    {prediction && (
                      <ContextualHelp tip={HELP_TIPS.outcomePreview}>
                        <div
                          style={{
                            padding: spacing.sm,
                            background: `${getRecommendationColor(
                              prediction.recommendation
                            )}11`,
                            border: `1px solid ${getRecommendationColor(
                              prediction.recommendation
                            )}33`,
                            borderRadius: borders.radius.base,
                            marginBottom: spacing.sm,
                            fontSize: typography.fontSize.xs,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: spacing.xs,
                            }}
                          >
                            <span style={{ color: colors.neutral.light }}>
                              Success Rate:
                            </span>
                            <span
                              style={{
                                color:
                                  prediction.predictedSuccess > 0.7
                                    ? colors.primary.base
                                    : prediction.predictedSuccess > 0.4
                                    ? colors.accent.base
                                    : colors.error.base,
                                fontWeight: typography.fontWeight.bold,
                              }}
                            >
                              {Math.round(prediction.predictedSuccess * 100)}%
                            </span>
                          </div>
                          {prediction.predictedHealthChange !== 0 && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: spacing.xs,
                              }}
                            >
                              <span style={{ color: colors.neutral.light }}>
                                Health Impact:
                              </span>
                              <span
                                style={{
                                  color:
                                    prediction.predictedHealthChange > 0
                                      ? colors.primary.base
                                      : colors.error.base,
                                  fontWeight: typography.fontWeight.bold,
                                }}
                              >
                                {prediction.predictedHealthChange > 0
                                  ? "+"
                                  : ""}
                                {Math.round(prediction.predictedHealthChange)}
                              </span>
                            </div>
                          )}
                          <div
                            style={{
                              color: getRecommendationColor(
                                prediction.recommendation
                              ),
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold,
                              textTransform: "uppercase" as const,
                            }}
                          >
                            {prediction.recommendation.replace(/_/g, " ")}
                          </div>
                        </div>
                      </ContextualHelp>
                    )}

                    {/* Pricing Explanation */}
                    {getPricingExplanation && dynamicPrice !== action.cost && (
                      <div
                        style={{
                          padding: spacing.xs,
                          background: colors.background.infoGlow,
                          border: `1px solid ${colors.border.info}`,
                          borderRadius: borders.radius.base,
                          marginBottom: spacing.sm,
                          fontSize: typography.fontSize.xs,
                          color: colors.info.base,
                        }}
                      >
                        {getPricingExplanation(action)}
                      </div>
                    )}

                    <div style={styles.actionMeta}>
                      <span
                        style={{
                          ...styles.badge,
                          borderColor: getRiskColor(action.riskLevel),
                          color: getRiskColor(action.riskLevel),
                          background: `${getRiskColor(action.riskLevel)}22`,
                        }}
                      >
                        Risk: {action.riskLevel}
                      </span>
                      <span
                        style={{
                          ...styles.badge,
                          borderColor: colors.info.base,
                          color: colors.info.base,
                          background: colors.background.infoGlow,
                        }}
                      >
                        Info: {action.informationGain}%
                      </span>
                      {executed && (
                        <span
                          style={{
                            ...styles.badge,
                            borderColor: colors.primary.base,
                            color: colors.primary.base,
                            background: colors.background.primaryGlow,
                          }}
                        >
                          ✓ Executed
                        </span>
                      )}
                      {!affordable && (
                        <span
                          style={{
                            ...styles.badge,
                            borderColor: colors.error.base,
                            color: colors.error.base,
                            background: colors.background.errorGlow,
                          }}
                        >
                          Insufficient Funds
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Detail Popup */}
        {selectedAction && (
          <div style={styles.overlay} onClick={() => setSelectedAction(null)}>
            <div
              style={{
                ...styles.container,
                maxWidth: "500px",
                maxHeight: "70vh",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.header}>
                <h2 style={styles.detailTitle}>{selectedAction.name}</h2>
                <button
                  style={styles.closeButton}
                  onClick={() => setSelectedAction(null)}
                >
                  ✕
                </button>
              </div>

              <div style={{ ...styles.content, padding: spacing.xl }}>
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Cost</div>
                  <div
                    style={{
                      ...styles.detailText,
                      fontSize: typography.fontSize["2xl"],
                      color: colors.primary.base,
                      fontFamily: typography.fontFamily.monospace,
                    }}
                  >
                    {/* ENHANCEMENT: Show dynamic price */}
                    {getDynamicPrice
                      ? getDynamicPrice(selectedAction).toFixed(2)
                      : selectedAction.cost.toFixed(2)}{" "}
                    MON
                    {getDynamicPrice &&
                      getDynamicPrice(selectedAction) !==
                        selectedAction.cost && (
                        <span
                          style={{
                            fontSize: typography.fontSize.lg,
                            color: colors.neutral.base,
                            textDecoration: "line-through",
                            marginLeft: spacing.sm,
                          }}
                        >
                          {selectedAction.cost.toFixed(2)}
                        </span>
                      )}
                  </div>
                  {/* ENHANCEMENT: Show pricing explanation */}
                  {getPricingExplanation &&
                    getDynamicPrice &&
                    getDynamicPrice(selectedAction) !== selectedAction.cost && (
                      <div
                        style={{
                          marginTop: spacing.sm,
                          padding: spacing.sm,
                          background: colors.background.infoGlow,
                          border: `1px solid ${colors.border.info}`,
                          borderRadius: borders.radius.base,
                          fontSize: typography.fontSize.xs,
                          color: colors.info.base,
                        }}
                      >
                        {getPricingExplanation(selectedAction)}
                      </div>
                    )}
                </div>

                {/* AI-Powered Outcome Prediction */}
                {(() => {
                  const prediction = getPrediction(selectedAction);
                  if (!prediction) return null;

                  return (
                    <div
                      style={{
                        ...styles.detailSection,
                        padding: spacing.md,
                        background: `${getRecommendationColor(
                          prediction.recommendation
                        )}11`,
                        border: `1px solid ${getRecommendationColor(
                          prediction.recommendation
                        )}`,
                        borderRadius: borders.radius.md,
                      }}
                    >
                      <div
                        style={{
                          ...styles.detailLabel,
                          marginBottom: spacing.sm,
                        }}
                      >
                        AI Outcome Analysis
                      </div>

                      <div style={{ marginBottom: spacing.md }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: spacing.xs,
                          }}
                        >
                          <span
                            style={{
                              ...styles.detailText,
                              color: colors.neutral.light,
                            }}
                          >
                            Success Rate:
                          </span>
                          <span
                            style={{
                              ...styles.detailText,
                              fontSize: typography.fontSize.lg,
                              fontWeight: typography.fontWeight.bold,
                              color:
                                prediction.predictedSuccess > 0.7
                                  ? colors.primary.base
                                  : prediction.predictedSuccess > 0.4
                                  ? colors.accent.base
                                  : colors.error.base,
                            }}
                          >
                            {Math.round(prediction.predictedSuccess * 100)}%
                          </span>
                        </div>

                        {prediction.predictedHealthChange !== 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: spacing.xs,
                            }}
                          >
                            <span
                              style={{
                                ...styles.detailText,
                                color: colors.neutral.light,
                              }}
                            >
                              Expected Health Change:
                            </span>
                            <span
                              style={{
                                ...styles.detailText,
                                fontSize: typography.fontSize.lg,
                                fontWeight: typography.fontWeight.bold,
                                color:
                                  prediction.predictedHealthChange > 0
                                    ? colors.primary.base
                                    : colors.error.base,
                              }}
                            >
                              {prediction.predictedHealthChange > 0 ? "+" : ""}
                              {Math.round(prediction.predictedHealthChange)} HP
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: spacing.sm,
                          }}
                        >
                          <span
                            style={{
                              ...styles.detailText,
                              color: colors.neutral.light,
                            }}
                          >
                            Confidence:
                          </span>
                          <span
                            style={{
                              ...styles.detailText,
                              fontWeight: typography.fontWeight.semibold,
                              color: colors.info.base,
                            }}
                          >
                            {Math.round(prediction.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: spacing.sm,
                          background: `${getRecommendationColor(
                            prediction.recommendation
                          )}22`,
                          borderRadius: borders.radius.base,
                          marginBottom: spacing.sm,
                        }}
                      >
                        <div
                          style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.bold,
                            color: getRecommendationColor(
                              prediction.recommendation
                            ),
                            textTransform: "uppercase" as const,
                            marginBottom: spacing.xs,
                          }}
                        >
                          {prediction.recommendation.replace(/_/g, " ")}
                        </div>
                        <div
                          style={{
                            ...styles.detailText,
                            fontSize: typography.fontSize.xs,
                          }}
                        >
                          {prediction.reasoning}
                        </div>
                      </div>

                      {prediction.risks.length > 0 && (
                        <div style={{ marginBottom: spacing.sm }}>
                          <div
                            style={{
                              ...styles.detailLabel,
                              fontSize: typography.fontSize.xs,
                            }}
                          >
                            Key Risks:
                          </div>
                          {prediction.risks.slice(0, 2).map((risk, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: typography.fontSize.xs,
                                color: colors.error.light,
                                marginBottom: spacing.xs,
                              }}
                            >
                              ⚠️ {risk.risk} (
                              {Math.round(risk.probability * 100)}%)
                            </div>
                          ))}
                        </div>
                      )}

                      {prediction.benefits.length > 0 && (
                        <div>
                          <div
                            style={{
                              ...styles.detailLabel,
                              fontSize: typography.fontSize.xs,
                            }}
                          >
                            Key Benefits:
                          </div>
                          {prediction.benefits.slice(0, 2).map((benefit, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: typography.fontSize.xs,
                                color: colors.primary.light,
                                marginBottom: spacing.xs,
                              }}
                            >
                              ✓ {benefit.benefit} (
                              {Math.round(benefit.probability * 100)}%)
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Expected Outcome</div>
                  <div style={styles.detailText}>
                    {selectedAction.expectedOutcome}
                  </div>
                </div>

                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Risks</div>
                  <ul style={styles.riskList}>
                    {selectedAction.risks.map((risk, i) => (
                      <li key={i} style={styles.riskItem}>
                        ⚠️ {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedAction.contraindications &&
                  selectedAction.contraindications.length > 0 && (
                    <div style={styles.detailSection}>
                      <div style={styles.detailLabel}>Contraindications</div>
                      <ul style={styles.riskList}>
                        {selectedAction.contraindications.map((contra, i) => (
                          <li key={i} style={styles.riskItem}>
                            🚫 {contra}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <button
                  style={{
                    ...styles.executeButton,
                    opacity:
                      (getDynamicPrice
                        ? getDynamicPrice(selectedAction)
                        : selectedAction.cost) <= currentBudget
                        ? 1
                        : 0.5,
                    cursor:
                      (getDynamicPrice
                        ? getDynamicPrice(selectedAction)
                        : selectedAction.cost) <= currentBudget
                        ? "pointer"
                        : "not-allowed",
                  }}
                  disabled={
                    (getDynamicPrice
                      ? getDynamicPrice(selectedAction)
                      : selectedAction.cost) > currentBudget
                  }
                  onClick={() => {
                    const price = getDynamicPrice
                      ? getDynamicPrice(selectedAction)
                      : selectedAction.cost;
                    if (price <= currentBudget) {
                      onSelectAction(selectedAction);
                      setSelectedAction(null);
                    }
                  }}
                  onMouseEnter={(e) => {
                    const price = getDynamicPrice
                      ? getDynamicPrice(selectedAction)
                      : selectedAction.cost;
                    if (price <= currentBudget) {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {(getDynamicPrice
                    ? getDynamicPrice(selectedAction)
                    : selectedAction.cost) <= currentBudget
                    ? "Execute Action"
                    : "Insufficient Funds"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
