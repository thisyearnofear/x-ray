"use client";

/**
 * PatientPresentationStage Component
 * CLEAN: Single responsibility for patient presentation
 * ENHANCEMENT FIRST: Builds on existing PatientInfoSection patterns
 * MODULAR: Independent component focused on initial case context
 */

import React, { useState, useEffect } from "react";
import { PatientInfoSection } from "../ui/PatientInfoSection";
import { NurseAmyNudgeSystem } from "../NurseAmyNudgeSystem";
import { colors, spacing, typography, borders, effects } from "../../../styles/design-tokens";

interface PatientPresentationStageProps {
  patientCase: any; // This should be PatientCase type
  onComplete: () => void;
  timeRemaining: number;
  budget: {
    remaining: number;
    spent: number;
    startingAmount: number;
  };
  nurseAmyNudges?: any; // Nurse Amy nudge system
}

export const PatientPresentationStage: React.FC<PatientPresentationStageProps> = ({
  patientCase,
  onComplete,
  timeRemaining,
  budget,
  nurseAmyNudges
}) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [nurseAmyMessage, setNurseAmyMessage] = useState<string | null>(null);

  // Initialize with Nurse Amy introduction
  useEffect(() => {
    if (nurseAmyNudges) {
      // Get real introduction from Nurse Amy
      const introduction = nurseAmyNudges.getCaseIntroduction(patientCase);
      setNurseAmyMessage(introduction);
    } else {
      // Fallback to mock message
      setNurseAmyMessage(`Hello! I'm Nurse Amy. This is an interesting case - ${patientCase.patientName} presents with ${patientCase.chiefComplaint}. Let's gather some initial information before we begin our investigation.`);
    }
  }, [patientCase, nurseAmyNudges]);

  const handleContinue = () => {
    onComplete();
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      {/* Nurse Amy Introduction */}
      {nurseAmyMessage && (
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
            alignItems: "flex-start",
            gap: spacing.sm
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: colors.primary.base,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: typography.fontSize.lg,
              flexShrink: 0
            }}>
              👩‍⚕️
            </div>
            <div>
              <div style={{
                color: colors.neutral.white,
                fontWeight: typography.fontWeight.bold,
                marginBottom: spacing.xs
              }}>
                Nurse Amy
              </div>
              <div style={{
                color: colors.neutral.light,
                lineHeight: 1.4
              }}>
                {nurseAmyMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Information */}
      <div style={{
        flex: 1,
        overflow: "auto"
      }}>
        <div style={{
          background: colors.background.gradient.panel,
          border: `${borders.width.thin} solid ${colors.border.neutral}`,
          borderRadius: borders.radius.lg,
          padding: spacing.md,
          marginBottom: spacing.md,
          boxShadow: effects.shadow.sm
        }}>
          <h3 style={{
            color: colors.neutral.white,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.bold,
            margin: 0,
            marginBottom: spacing.sm
          }}>
            Patient Information
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: spacing.md,
            marginBottom: spacing.md
          }}>
            <div>
              <div style={{
                color: colors.neutral.base,
                fontSize: typography.fontSize.xs,
                textTransform: "uppercase",
                letterSpacing: typography.letterSpacing.wider,
                marginBottom: spacing.xs
              }}>
                Name
              </div>
              <div style={{
                color: colors.neutral.white,
                fontWeight: typography.fontWeight.bold
              }}>
                {patientCase.patientName}
              </div>
            </div>
            
            <div>
              <div style={{
                color: colors.neutral.base,
                fontSize: typography.fontSize.xs,
                textTransform: "uppercase",
                letterSpacing: typography.letterSpacing.wider,
                marginBottom: spacing.xs
              }}>
                Age | Gender
              </div>
              <div style={{
                color: colors.neutral.white
              }}>
                {patientCase.age} | {patientCase.gender}
              </div>
            </div>
          </div>
          
          <div>
            <div style={{
              color: colors.neutral.base,
              fontSize: typography.fontSize.xs,
              textTransform: "uppercase",
              letterSpacing: typography.letterSpacing.wider,
              marginBottom: spacing.xs
            }}>
              Chief Complaint
            </div>
            <div style={{
              color: colors.accent.base,
              fontWeight: typography.fontWeight.bold
            }}>
              {patientCase.chiefComplaint}
            </div>
          </div>
        </div>
        
        {patientCase.historyOfPresentIllness && (
          <div style={{
            background: colors.background.gradient.panel,
            border: `${borders.width.thin} solid ${colors.border.neutral}`,
            borderRadius: borders.radius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
            boxShadow: effects.shadow.sm
          }}>
            <h3 style={{
              color: colors.neutral.white,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.sm
            }}>
              History of Present Illness
            </h3>
            <div style={{
              color: colors.neutral.light,
              lineHeight: 1.6
            }}>
              {patientCase.historyOfPresentIllness}
            </div>
          </div>
        )}
        
        {(patientCase.pastMedicalHistory || patientCase.medications || patientCase.allergies) && (
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
              Medical History
            </h3>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: spacing.md
            }}>
              {patientCase.pastMedicalHistory && (
                <div>
                  <div style={{
                    color: colors.neutral.base,
                    fontSize: typography.fontSize.xs,
                    textTransform: "uppercase",
                    letterSpacing: typography.letterSpacing.wider,
                    marginBottom: spacing.xs
                  }}>
                    Past Medical History
                  </div>
                  <div style={{
                    color: colors.neutral.light,
                    fontSize: typography.fontSize.sm
                  }}>
                    {patientCase.pastMedicalHistory.join(', ')}
                  </div>
                </div>
              )}
              
              {patientCase.medications && (
                <div>
                  <div style={{
                    color: colors.neutral.base,
                    fontSize: typography.fontSize.xs,
                    textTransform: "uppercase",
                    letterSpacing: typography.letterSpacing.wider,
                    marginBottom: spacing.xs
                  }}>
                    Current Medications
                  </div>
                  <div style={{
                    color: colors.neutral.light,
                    fontSize: typography.fontSize.sm
                  }}>
                    {patientCase.medications.join(', ')}
                  </div>
                </div>
              )}
              
              {patientCase.allergies && (
                <div>
                  <div style={{
                    color: colors.neutral.base,
                    fontSize: typography.fontSize.xs,
                    textTransform: "uppercase",
                    letterSpacing: typography.letterSpacing.wider,
                    marginBottom: spacing.xs
                  }}>
                    Allergies
                  </div>
                  <div style={{
                    color: colors.neutral.light,
                    fontSize: typography.fontSize.sm
                  }}>
                    {patientCase.allergies.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Case Context and Stakes */}
      <div style={{
        background: colors.background.gradient.panel,
        border: `${borders.width.thin} solid ${colors.border.neutral}`,
        borderRadius: borders.radius.lg,
        padding: spacing.md,
        marginTop: spacing.md,
        boxShadow: effects.shadow.sm
      }}>
        <h3 style={{
          color: colors.neutral.white,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.bold,
          marginBottom: spacing.sm,
          marginTop: 0
        }}>
          Case Context
        </h3>
        
        <div style={{
          color: colors.neutral.light,
          lineHeight: 1.5,
          marginBottom: spacing.md
        }}>
          {patientCase.stakes || "This case requires careful diagnostic reasoning to identify the underlying condition and determine appropriate treatment."}
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: spacing.sm,
          marginBottom: spacing.md
        }}>
          <div style={{
            background: `${colors.info.base}20`,
            border: `${borders.width.thin} solid ${colors.info.base}40`,
            borderRadius: borders.radius.md,
            padding: spacing.sm
          }}>
            <div style={{
              color: colors.neutral.base,
              fontSize: typography.fontSize.xs,
              textTransform: "uppercase",
              letterSpacing: typography.letterSpacing.wider,
              marginBottom: spacing.xs
            }}>
              Estimated Case Length
            </div>
            <div style={{
              color: colors.neutral.white,
              fontWeight: typography.fontWeight.bold
            }}>
              {patientCase.estimatedCaseLength || "15-20 minutes"}
            </div>
          </div>
          
          <div style={{
            background: `${colors.accent.base}20`,
            border: `${borders.width.thin} solid ${colors.accent.base}40`,
            borderRadius: borders.radius.md,
            padding: spacing.sm
          }}>
            <div style={{
              color: colors.neutral.base,
              fontSize: typography.fontSize.xs,
              textTransform: "uppercase",
              letterSpacing: typography.letterSpacing.wider,
              marginBottom: spacing.xs
            }}>
              Case Complexity
            </div>
            <div style={{
              color: colors.neutral.white,
              fontWeight: typography.fontWeight.bold
            }}>
              {patientCase.caseComplexity || "Moderate"}
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div style={{
        marginTop: spacing.md,
        display: "flex",
        justifyContent: "flex-end"
      }}>
        <button
          onClick={handleContinue}
          style={{
            background: colors.primary.base,
            color: colors.neutral.dark,
            border: "none",
            borderRadius: borders.radius.full,
            padding: `${spacing.sm} ${spacing.lg}`,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.bold,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: effects.shadow.md,
          }}
          onMouseOver={(e) => e.currentTarget.style.background = colors.primary.light}
          onMouseOut={(e) => e.currentTarget.style.background = colors.primary.base}
        >
          Begin Investigation →
        </button>
      </div>
    </div>
  );
};