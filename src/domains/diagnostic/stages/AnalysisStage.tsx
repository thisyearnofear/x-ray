"use client";

/**
 * AnalysisStage Component
 * CLEAN: Single responsibility for evidence analysis
 * ENHANCEMENT FIRST: Builds on existing diagnostic patterns
 * MODULAR: Independent component focused on pattern recognition
 */

import React, { useState, useEffect } from "react";
import { DiagnosticConfidence } from "../../medical/services/DiagnosticConfidence";
import { OutcomePredictor } from "../../medical/services/OutcomePredictor";
import { colors, spacing, typography, borders, effects } from "../../../styles/design-tokens";

interface AnalysisStageProps {
  patientCase: any;
  budget: {
    remaining: number;
    spent: number;
    startingAmount: number;
  };
  timeRemaining: number;
  onComplete: () => void;
}

export const AnalysisStage: React.FC<AnalysisStageProps> = ({
  patientCase,
  budget,
  timeRemaining,
  onComplete
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<Set<string>>(new Set());
  const [diagnosticConfidence, setDiagnosticConfidence] = useState<any>(null);
  const [differentialDiagnoses, setDifferentialDiagnoses] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Mock evidence data - in a real implementation this would come from the investigation stage
  const mockEvidence = [
    { id: "e1", source: "interview", content: "Patient reports worsening abdominal pain over 48 hours" },
    { id: "e2", source: "labs", content: "Elevated white blood cell count and inflammatory markers" },
    { id: "e3", source: "imaging", content: "Abnormal density in lower left quadrant on X-ray" },
    { id: "e4", source: "physical", content: "Tenderness and positive rebound sign in left lower quadrant" },
    { id: "e5", source: "scanning", content: "Increased density pattern consistent with inflammatory process" }
  ];

  // Initialize with mock diagnostic data
  useEffect(() => {
    // Mock diagnostic confidence - in a real implementation this would use DiagnosticConfidence service
    setDiagnosticConfidence({
      overall: 0.75,
      byCondition: {
        "appendicitis": 0.85,
        "diverticulitis": 0.65,
        "ovarian_cyst": 0.45
      }
    });
    
    // Mock differential diagnoses
    setDifferentialDiagnoses([
      { 
        condition: "appendicitis", 
        confidence: 0.85, 
        evidence: ["e1", "e2", "e3", "e4", "e5"],
        reasoning: "Classic presentation with migratory pain, elevated inflammatory markers, and imaging findings"
      },
      { 
        condition: "diverticulitis", 
        confidence: 0.65, 
        evidence: ["e1", "e2", "e3"],
        reasoning: "Similar inflammatory presentation but typically in older patients"
      },
      { 
        condition: "ovarian_cyst", 
        confidence: 0.45, 
        evidence: ["e1", "e3"],
        reasoning: "Possible in female patients but less likely given age and other findings"
      }
    ]);
    
    // Mock AI suggestions
    setAiSuggestions([
      "Consider CT scan for definitive diagnosis",
      "Appendectomy consultation may be warranted",
      "Monitor vital signs closely for deterioration"
    ]);
  }, []);

  const toggleEvidenceSelection = (evidenceId: string) => {
    setSelectedEvidence(prev => {
      const newSet = new Set(prev);
      if (newSet.has(evidenceId)) {
        newSet.delete(evidenceId);
      } else {
        newSet.add(evidenceId);
      }
      return newSet;
    });
  };

  const handleContinue = () => {
    onComplete();
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
          Evidence Analysis
        </h2>
        <p style={{
          color: colors.neutral.light,
          margin: 0,
          lineHeight: 1.5
        }}>
          Review collected evidence and identify patterns to form your differential diagnosis.
        </p>
      </div>

      {/* Confidence Meter */}
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
          alignItems: "center",
          marginBottom: spacing.sm
        }}>
          <h3 style={{
            color: colors.neutral.white,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.bold,
            margin: 0
          }}>
            Diagnostic Confidence
          </h3>
          <div style={{
            color: colors.neutral.light,
            fontSize: typography.fontSize.sm
          }}>
            {Math.round((diagnosticConfidence?.overall || 0) * 100)}% Overall
          </div>
        </div>
        
        <div style={{
          height: 12,
          background: colors.neutral.dark,
          borderRadius: borders.radius.full,
          overflow: "hidden"
        }}>
          <div 
            style={{
              height: "100%",
              width: `${(diagnosticConfidence?.overall || 0) * 100}%`,
              background: `linear-gradient(90deg, ${colors.accent.base}, ${colors.primary.base})`,
              borderRadius: borders.radius.full,
              transition: "width 0.5s ease"
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: "flex",
        gap: spacing.md,
        overflow: "hidden"
      }}>
        {/* Evidence Review Panel */}
        <div style={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
          gap: spacing.md
        }}>
          {/* Evidence List */}
          <div style={{
            background: colors.background.gradient.panel,
            border: `${borders.width.thin} solid ${colors.border.neutral}`,
            borderRadius: borders.radius.lg,
            padding: spacing.md,
            boxShadow: effects.shadow.sm,
            flex: 1,
            overflow: "auto"
          }}>
            <h3 style={{
              color: colors.neutral.white,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.sm
            }}>
              Collected Evidence
            </h3>
            
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.xs
            }}>
              {mockEvidence.map((evidence) => (
                <div
                  key={evidence.id}
                  onClick={() => toggleEvidenceSelection(evidence.id)}
                  style={{
                    background: selectedEvidence.has(evidence.id) ? 
                      `${colors.primary.base}20` : `${colors.neutral.dark}80`,
                    border: `${borders.width.thin} solid ${
                      selectedEvidence.has(evidence.id) ? 
                        colors.primary.base : colors.neutral.dark
                    }`,
                    borderRadius: borders.radius.sm,
                    padding: spacing.sm,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = selectedEvidence.has(evidence.id) ? 
                      `${colors.primary.base}30` : `${colors.neutral.dark}A0`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = selectedEvidence.has(evidence.id) ? 
                      `${colors.primary.base}20` : `${colors.neutral.dark}80`;
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start"
                  }}>
                    <div>
                      <div style={{
                        color: colors.neutral.base,
                        fontSize: typography.fontSize.xs,
                        textTransform: "uppercase",
                        marginBottom: spacing.xs
                      }}>
                        {evidence.source}
                      </div>
                      <div style={{
                        color: colors.neutral.light,
                        lineHeight: 1.4
                      }}>
                        {evidence.content}
                      </div>
                    </div>
                    {selectedEvidence.has(evidence.id) && (
                      <div style={{
                        color: colors.primary.base,
                        fontWeight: typography.fontWeight.bold
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
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
              AI Assistant Recommendations
            </h3>
            
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.xs
            }}>
              {aiSuggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  style={{
                    background: `${colors.info.base}20`,
                    border: `${borders.width.thin} solid ${colors.info.base}40`,
                    borderRadius: borders.radius.sm,
                    padding: spacing.sm,
                    color: colors.neutral.light,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: spacing.xs
                  }}
                >
                  <div style={{
                    color: colors.info.base,
                    marginTop: 2
                  }}>
                    💡
                  </div>
                  <div>
                    {suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Differential Diagnosis Panel */}
        <div style={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
          gap: spacing.md
        }}>
          {/* Differential Diagnoses */}
          <div style={{
            background: colors.background.gradient.panel,
            border: `${borders.width.thin} solid ${colors.border.neutral}`,
            borderRadius: borders.radius.lg,
            padding: spacing.md,
            boxShadow: effects.shadow.sm,
            flex: 1,
            overflow: "auto"
          }}>
            <h3 style={{
              color: colors.neutral.white,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.sm
            }}>
              Differential Diagnoses
            </h3>
            
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm
            }}>
              {differentialDiagnoses.map((diagnosis) => (
                <div
                  key={diagnosis.condition}
                  style={{
                    background: `${colors.neutral.dark}80`,
                    border: `${borders.width.thin} solid ${colors.neutral.dark}`,
                    borderRadius: borders.radius.md,
                    padding: spacing.md
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing.sm
                  }}>
                    <div style={{
                      color: colors.neutral.white,
                      fontWeight: typography.fontWeight.bold,
                      fontSize: typography.fontSize.md
                    }}>
                      {diagnosis.condition}
                    </div>
                    <div style={{
                      color: diagnosis.confidence > 0.7 ? colors.primary.base : 
                        diagnosis.confidence > 0.5 ? colors.accent.base : colors.error.base,
                      fontWeight: typography.fontWeight.bold
                    }}>
                      {Math.round(diagnosis.confidence * 100)}%
                    </div>
                  </div>
                  
                  <div style={{
                    height: 6,
                    background: colors.neutral.dark,
                    borderRadius: borders.radius.full,
                    overflow: "hidden",
                    marginBottom: spacing.sm
                  }}>
                    <div 
                      style={{
                        height: "100%",
                        width: `${diagnosis.confidence * 100}%`,
                        background: diagnosis.confidence > 0.7 ? colors.primary.base : 
                          diagnosis.confidence > 0.5 ? colors.accent.base : colors.error.base,
                        borderRadius: borders.radius.full
                      }}
                    />
                  </div>
                  
                  <div style={{
                    color: colors.neutral.light,
                    fontSize: typography.fontSize.sm,
                    lineHeight: 1.4,
                    marginBottom: spacing.sm
                  }}>
                    {diagnosis.reasoning}
                  </div>
                  
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: spacing.xs
                  }}>
                    {diagnosis.evidence.map((evidenceId: string) => (
                      <div
                        key={evidenceId}
                        style={{
                          background: selectedEvidence.has(evidenceId) ? 
                            colors.primary.base : colors.neutral.dark,
                          color: selectedEvidence.has(evidenceId) ? 
                            colors.neutral.dark : colors.neutral.base,
                          borderRadius: borders.radius.full,
                          padding: `2px ${spacing.xs}`,
                          fontSize: typography.fontSize.xs
                        }}
                      >
                        E{evidenceId.replace('e', '')}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pattern Recognition Tips */}
          <div style={{
            background: `${colors.accent.base}10`,
            border: `${borders.width.thin} solid ${colors.accent.base}30`,
            borderRadius: borders.radius.lg,
            padding: spacing.md
          }}>
            <h4 style={{
              color: colors.neutral.white,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.xs
            }}>
              Pattern Recognition Tip
            </h4>
            <p style={{
              color: colors.neutral.light,
              margin: 0,
              fontSize: typography.fontSize.sm,
              lineHeight: 1.4
            }}>
              Look for clustering of evidence that supports specific conditions. 
              The combination of migratory pain, elevated inflammatory markers, 
              and imaging findings strongly suggests appendicitis.
            </p>
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
          Plan Treatment →
        </button>
      </div>
    </div>
  );
};