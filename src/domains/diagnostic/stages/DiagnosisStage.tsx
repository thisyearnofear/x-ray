"use client";

/**
 * DiagnosisStage Component
 * CLEAN: Single responsibility for treatment planning
 * ENHANCEMENT FIRST: Builds on existing TreatmentMenu patterns
 * MODULAR: Independent component focused on treatment decisions
 */

import React, { useState, useEffect } from "react";
import { TreatmentMenu } from "../../../components/TreatmentMenu";
import { OutcomePredictor } from "../../medical/services/OutcomePredictor";
import { DiagnosticConfidence } from "../../medical/services/DiagnosticConfidence";
import { PatientState } from "../../medical/types";
import { MedicalAction } from "../../medical/types";
import { TREATMENTS } from "../../medical/medical-actions-data";
import { colors, spacing, typography, borders, effects } from "../../../styles/design-tokens";

interface DiagnosisStageProps {
  patientCase: any;
  budget: {
    remaining: number;
    spent: number;
    startingAmount: number;
  };
  timeRemaining: number;
  gameManager: any;
  onComplete: (diagnosis: any) => void;
}

interface DiagnosisData {
  condition: string;
  treatment: MedicalAction | null;
  notes: string;
  predictedOutcome: any;
}

export const DiagnosisStage: React.FC<DiagnosisStageProps> = ({
  patientCase,
  budget,
  timeRemaining,
  gameManager,
  onComplete
}) => {
  const [selectedTreatment, setSelectedTreatment] = useState<MedicalAction | null>(null);
  const [outcomePrediction, setOutcomePrediction] = useState<any>(null);
  const [finalDiagnosis, setFinalDiagnosis] = useState<string>("");
  const [treatmentNotes, setTreatmentNotes] = useState<string>("");
  const [showTreatmentMenu, setShowTreatmentMenu] = useState(false);

  // Mock patient state - in a real implementation this would come from the patient case
  // const mockPatientState = new PatientState(patientCase);

  // Mock diagnostic confidence - in a real implementation this would come from analysis stage
  const mockDiagnosticConfidence = new DiagnosticConfidence();

  // Initialize with outcome prediction
  useEffect(() => {
    // Mock outcome prediction - in a real implementation this would use OutcomePredictor service
    setOutcomePrediction({
      successProbability: 0.85,
      recoveryTime: "2-3 days",
      complicationsRisk: 0.15,
      cost: 125.50
    });
  }, []);

  const handleTreatmentSelect = (treatment: MedicalAction) => {
    setSelectedTreatment(treatment);
    
    // Mock updated outcome prediction based on treatment selection
    setOutcomePrediction({
      successProbability: treatment.id === "appendectomy" ? 0.95 : 0.85,
      recoveryTime: treatment.id === "appendectomy" ? "1-2 days" : "2-3 days",
      complicationsRisk: treatment.id === "appendectomy" ? 0.10 : 0.15,
      cost: treatment.cost
    });
  };

  const handleSubmitDiagnosis = () => {
    const diagnosis: DiagnosisData = {
      condition: "appendicitis",
      treatment: selectedTreatment,
      notes: treatmentNotes,
      predictedOutcome: outcomePrediction
    };
    
    onComplete(diagnosis);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      {/* Stage Header */}
      <div style={{
        marginBottom: spacing.md
      }}>
        <h2 style={{
          color: colors.neutral.white,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
          margin: 0,
          marginBottom: spacing.xs
        }}>
          Treatment Plan
        </h2>
        <p style={{
          color: colors.neutral.light,
          margin: 0,
          lineHeight: 1.5
        }}>
          Select the most appropriate treatment based on your diagnosis and review predicted outcomes.
        </p>
      </div>

      {/* Case Summary */}
      <div style={{
        background: colors.background.gradient.panel,
        border: `${borders.width.thin} solid ${colors.border.neutral}`,
        borderRadius: borders.radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        boxShadow: effects.shadow.sm
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
          <div>
            <h3 style={{
              color: colors.neutral.white,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.xs
            }}>
              {patientCase.patientName}, {patientCase.age} • {patientCase.gender}
            </h3>
            <div style={{
              color: colors.accent.base,
              fontWeight: typography.fontWeight.bold
            }}>
              {patientCase.chiefComplaint}
            </div>
          </div>
          <div style={{
            textAlign: "right"
          }}>
            <div style={{
              color: colors.neutral.base,
              fontSize: typography.fontSize.sm
            }}>
              Primary Diagnosis
            </div>
            <div style={{
              color: colors.neutral.white,
              fontWeight: typography.fontWeight.bold,
              fontSize: typography.fontSize.md
            }}>
              Appendicitis
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: "flex",
        gap: spacing.md,
        overflow: "hidden"
      }}>
        {/* Treatment Selection */}
        <div style={{
          width: "60%",
          display: "flex",
          flexDirection: "column",
          gap: spacing.md
        }}>
          {/* Treatment Menu */}
          <div style={{
            background: colors.background.gradient.panel,
            border: `${borders.width.thin} solid ${colors.border.neutral}`,
            borderRadius: borders.radius.lg,
            padding: spacing.md,
            boxShadow: effects.shadow.sm,
            flex: 1,
            overflow: "auto"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.md
            }}>
              <h3 style={{
                color: colors.neutral.white,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.bold,
                margin: 0
              }}>
                Treatment Options
              </h3>
              <button
                onClick={() => setShowTreatmentMenu(true)}
                style={{
                  background: colors.primary.base,
                  color: colors.neutral.dark,
                  border: "none",
                  borderRadius: borders.radius.full,
                  padding: `${spacing.xs} ${spacing.md}`,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.bold,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = colors.primary.light}
                onMouseOut={(e) => e.currentTarget.style.background = colors.primary.base}
              >
                Browse All Treatments
              </button>
            </div>
            
            {/* Quick Treatment Options */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.md
            }}>
              {TREATMENTS.slice(0, 4).map((treatment) => (
                <div
                  key={treatment.id}
                  onClick={() => handleTreatmentSelect(treatment)}
                  style={{
                    background: selectedTreatment?.id === treatment.id ? 
                      `${colors.primary.base}20` : `${colors.neutral.dark}80`,
                    border: `${borders.width.thin} solid ${
                      selectedTreatment?.id === treatment.id ? 
                        colors.primary.base : colors.neutral.dark
                    }`,
                    borderRadius: borders.radius.md,
                    padding: spacing.md,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = selectedTreatment?.id === treatment.id ? 
                      `${colors.primary.base}30` : `${colors.neutral.dark}A0`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = selectedTreatment?.id === treatment.id ? 
                      `${colors.primary.base}20` : `${colors.neutral.dark}80`;
                  }}
                >
                  <div style={{
                    color: colors.neutral.white,
                    fontWeight: typography.fontWeight.bold,
                    textAlign: "center",
                    marginBottom: spacing.xs
                  }}>
                    {treatment.name}
                  </div>
                  <div style={{
                    color: colors.neutral.light,
                    fontSize: typography.fontSize.sm,
                    textAlign: "center",
                    marginBottom: spacing.sm,
                    minHeight: 40
                  }}>
                    {treatment.description}
                  </div>
                  <div style={{
                    color: colors.accent.base,
                    fontWeight: typography.fontWeight.bold,
                    textAlign: "center"
                  }}>
                    {treatment.cost.toFixed(2)} MON
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment Notes */}
          <div style={{
            background: colors.background.gradient.panel,
            border: `${borders.width.thin} solid ${colors.border.neutral}`,
            borderRadius: borders.radius.lg,
            padding: spacing.md,
            boxShadow: effects.shadow.sm
          }}>
            <h3 style={{
              color: colors.neutral.white,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.sm
            }}>
              Treatment Notes
            </h3>
            <textarea
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              placeholder="Add any additional notes about your treatment selection..."
              style={{
                width: "100%",
                minHeight: 100,
                background: colors.neutral.dark,
                border: `${borders.width.thin} solid ${colors.border.neutral}`,
                borderRadius: borders.radius.md,
                padding: spacing.md,
                color: colors.neutral.light,
                fontFamily: "inherit",
                fontSize: typography.fontSize.sm,
                resize: "vertical"
              }}
            />
          </div>
        </div>

        {/* Outcome Prediction */}
        <div style={{
          width: "40%",
          display: "flex",
          flexDirection: "column",
          gap: spacing.md
        }}>
          {/* Outcome Prediction Panel */}
          <div style={{
            background: colors.background.gradient.panel,
            border: `${borders.width.thin} solid ${colors.border.neutral}`,
            borderRadius: borders.radius.lg,
            padding: spacing.md,
            boxShadow: effects.shadow.sm,
            flex: 1
          }}>
            <h3 style={{
              color: colors.neutral.white,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.md
            }}>
              Predicted Outcome
            </h3>
            
            {outcomePrediction ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.md
              }}>
                {/* Success Probability */}
                <div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: spacing.xs
                  }}>
                    <div style={{
                      color: colors.neutral.base,
                      fontSize: typography.fontSize.sm
                    }}>
                      Success Probability
                    </div>
                    <div style={{
                      color: colors.neutral.white,
                      fontWeight: typography.fontWeight.bold
                    }}>
                      {Math.round(outcomePrediction.successProbability * 100)}%
                    </div>
                  </div>
                  <div style={{
                    height: 10,
                    background: colors.neutral.dark,
                    borderRadius: borders.radius.full,
                    overflow: "hidden"
                  }}>
                    <div 
                      style={{
                        height: "100%",
                        width: `${outcomePrediction.successProbability * 100}%`,
                        background: `linear-gradient(90deg, ${colors.accent.base}, ${colors.primary.base})`,
                        borderRadius: borders.radius.full
                      }}
                    />
                  </div>
                </div>
                
                {/* Recovery Time */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: spacing.sm,
                  background: `${colors.info.base}20`,
                  borderRadius: borders.radius.md,
                  border: `${borders.width.thin} solid ${colors.info.base}40`
                }}>
                  <div style={{
                    color: colors.neutral.base
                  }}>
                    Expected Recovery
                  </div>
                  <div style={{
                    color: colors.neutral.white,
                    fontWeight: typography.fontWeight.bold
                  }}>
                    {outcomePrediction.recoveryTime}
                  </div>
                </div>
                
                {/* Complications Risk */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: spacing.sm,
                  background: `${colors.error.base}20`,
                  borderRadius: borders.radius.md,
                  border: `${borders.width.thin} solid ${colors.error.base}40`
                }}>
                  <div style={{
                    color: colors.neutral.base
                  }}>
                    Complications Risk
                  </div>
                  <div style={{
                    color: outcomePrediction.complicationsRisk > 0.2 ? colors.error.base : colors.neutral.white,
                    fontWeight: typography.fontWeight.bold
                  }}>
                    {Math.round(outcomePrediction.complicationsRisk * 100)}%
                  </div>
                </div>
                
                {/* Cost */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: spacing.sm,
                  background: `${colors.accent.base}20`,
                  borderRadius: borders.radius.md,
                  border: `${borders.width.thin} solid ${colors.accent.base}40`
                }}>
                  <div style={{
                    color: colors.neutral.base
                  }}>
                    Treatment Cost
                  </div>
                  <div style={{
                    color: colors.neutral.white,
                    fontWeight: typography.fontWeight.bold
                  }}>
                    {outcomePrediction.cost.toFixed(2)} MON
                  </div>
                </div>
                
                {/* Budget Impact */}
                <div style={{
                  padding: spacing.sm,
                  background: `${colors.neutral.dark}80`,
                  borderRadius: borders.radius.md,
                  border: `${borders.width.thin} solid ${colors.neutral.dark}`
                }}>
                  <div style={{
                    color: colors.neutral.base,
                    fontSize: typography.fontSize.sm,
                    marginBottom: spacing.xs
                  }}>
                    Budget Impact
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{
                        color: colors.neutral.white,
                        fontWeight: typography.fontWeight.bold
                      }}>
                        {budget.remaining.toFixed(2)} MON remaining
                      </div>
                      <div style={{
                        color: budget.remaining > outcomePrediction.cost ? 
                          colors.primary.base : colors.error.base,
                        fontSize: typography.fontSize.sm
                      }}>
                        {budget.remaining > outcomePrediction.cost ? 
                          "Sufficient funds" : "Insufficient funds"}
                      </div>
                    </div>
                    <div style={{
                      color: budget.remaining > outcomePrediction.cost ? 
                        colors.primary.base : colors.error.base,
                      fontSize: typography.fontSize.xl
                    }}>
                      {budget.remaining > outcomePrediction.cost ? "✓" : "⚠️"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                color: colors.neutral.base,
                fontStyle: "italic",
                textAlign: "center",
                padding: spacing.xl
              }}>
                Select a treatment to see predicted outcomes
              </div>
            )}
          </div>

          {/* Final Diagnosis Confirmation */}
          <div style={{
            background: colors.background.gradient.panel,
            border: `${borders.width.thin} solid ${colors.border.neutral}`,
            borderRadius: borders.radius.lg,
            padding: spacing.md,
            boxShadow: effects.shadow.sm
          }}>
            <h3 style={{
              color: colors.neutral.white,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.sm
            }}>
              Confirm Diagnosis
            </h3>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
              marginBottom: spacing.md
            }}>
              <input
                type="checkbox"
                id="diagnosisConfirmation"
                style={{
                  width: 18,
                  height: 18,
                  accentColor: colors.primary.base
                }}
              />
              <label 
                htmlFor="diagnosisConfirmation"
                style={{
                  color: colors.neutral.light,
                  lineHeight: 1.4
                }}
              >
                I confirm my diagnosis of <strong>appendicitis</strong> and selected treatment plan
              </label>
            </div>
            
            <button
              onClick={handleSubmitDiagnosis}
              disabled={!selectedTreatment}
              style={{
                width: "100%",
                background: selectedTreatment ? colors.primary.base : colors.neutral.dark,
                color: selectedTreatment ? colors.neutral.dark : colors.neutral.base,
                border: "none",
                borderRadius: borders.radius.full,
                padding: spacing.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.bold,
                cursor: selectedTreatment ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                boxShadow: effects.shadow.md,
              }}
              onMouseOver={(e) => {
                if (selectedTreatment) {
                  e.currentTarget.style.background = colors.primary.light;
                }
              }}
              onMouseOut={(e) => {
                if (selectedTreatment) {
                  e.currentTarget.style.background = colors.primary.base;
                }
              }}
            >
              Submit Final Diagnosis
            </button>
          </div>
        </div>
      </div>

      {/* Treatment Menu Modal */}
      {showTreatmentMenu && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            width: "90%",
            height: "90%",
            background: colors.background.panel,
            border: `${borders.width.thin} solid ${colors.border.neutral}`,
            borderRadius: borders.radius.lg,
            boxShadow: effects.shadow.xl,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{
              padding: spacing.md,
              borderBottom: `${borders.width.thin} solid ${colors.border.neutral}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h2 style={{
                color: colors.neutral.white,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                margin: 0
              }}>
                All Treatment Options
              </h2>
              <button
                onClick={() => setShowTreatmentMenu(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: colors.neutral.base,
                  fontSize: typography.fontSize.xl,
                  cursor: "pointer",
                  padding: spacing.sm,
                  borderRadius: borders.radius.full
                }}
                onMouseOver={(e) => e.currentTarget.style.background = `${colors.neutral.dark}80`}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                ×
              </button>
            </div>
            <div style={{
              flex: 1,
              overflow: "auto"
            }}>
              <TreatmentMenu
                isOpen={true}
                onClose={() => setShowTreatmentMenu(false)}
                currentBudget={budget.remaining}
                onSelectAction={(action) => {
                  handleTreatmentSelect(action);
                  setShowTreatmentMenu(false);
                }}
                executedActions={[]}
                diagnosticConfidence={mockDiagnosticConfidence}
                timeRemaining={timeRemaining}
                getDynamicPrice={gameManager?.getDynamicPrice}
                getPricingExplanation={gameManager?.getPricingExplanation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};