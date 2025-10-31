"use client";

/**
 * InvestigationStage Component
 * CLEAN: Single responsibility for investigation tools
 * ENHANCEMENT FIRST: Builds on existing InvestigationPanel patterns
 * MODULAR: Independent component focused on diagnostic tools
 */

import React, { useState, useEffect, useRef } from "react";
import { Evidence } from "../ui/InvestigationPanel";
import { ScanFeedbackSystem } from "../../../components/ScanFeedbackSystem";
import { AudioManager, SoundType } from "../../../components/AudioManager";
import { colors, spacing, typography, borders, effects } from "../../../styles/design-tokens";

interface InvestigationStageProps {
  patientCase: any;
  budget: {
    remaining: number;
    spent: number;
    startingAmount: number;
  };
  timeRemaining: number;
  onComplete: () => void;
  onEvidenceCollected?: (evidence: Evidence) => void;
}

export const InvestigationStage: React.FC<InvestigationStageProps> = ({
  patientCase,
  budget,
  timeRemaining,
  onComplete,
  onEvidenceCollected
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [collectedEvidence, setCollectedEvidence] = useState<Evidence[]>([]);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const investigationPanelRef = useRef<any>(null);

  // Initialize InvestigationPanel
  useEffect(() => {
    if (panelRef.current && !investigationPanelRef.current) {
      // We'll create the InvestigationPanel dynamically when needed
    }
  }, []);

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    
    // Generate proper evidence based on tool selection
    let evidenceContent = "";
    switch (toolId) {
      case 'interview':
        evidenceContent = "Patient reports worsening symptoms over the past 48 hours. Family history of similar conditions.";
        setScanFeedback("Patient reports worsening symptoms over the past 48 hours. Family history of similar conditions.");
        break;
      case 'labs':
        evidenceContent = "CBC shows elevated white blood cell count. Inflammatory markers are elevated.";
        setScanFeedback("CBC shows elevated white blood cell count. Inflammatory markers are elevated.");
        break;
      case 'imaging':
        evidenceContent = "X-ray reveals abnormal density in the lower left quadrant. Further imaging recommended.";
        setScanFeedback("X-ray reveals abnormal density in the lower left quadrant. Further imaging recommended.");
        break;
      case 'physical':
        evidenceContent = "Tenderness noted in the left lower quadrant. Positive rebound tenderness.";
        setScanFeedback("Tenderness noted in the left lower quadrant. Positive rebound tenderness.");
        break;
      case 'scanning':
        evidenceContent = "3D scan shows increased density in the target region. Pattern suggests inflammatory process.";
        setScanFeedback("3D scan shows increased density in the target region. Pattern suggests inflammatory process.");
        break;
      default:
        evidenceContent = "Diagnostic tool activated. Gathering relevant information...";
        setScanFeedback("Diagnostic tool activated. Gathering relevant information...");
    }
    
    // Create proper evidence object
    const newEvidence: Evidence = {
      id: `${toolId}-${Date.now()}`,
      source: toolId as any, // Type assertion for now
      content: evidenceContent,
      abnormal: true, // Most diagnostic findings are abnormal
      timestamp: Date.now()
    };
    
    setCollectedEvidence(prev => [...prev, newEvidence]);
    if (onEvidenceCollected) {
      onEvidenceCollected(newEvidence);
    }
  };

  // Handle scan completion
  const handleScanComplete = () => {
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
          Investigation Tools
        </h2>
        <p style={{
          color: colors.neutral.light,
          margin: 0,
          lineHeight: 1.5
        }}>
          Select diagnostic tools to gather evidence about {patientCase.patientName}'s condition.
        </p>
      </div>

      {/* Budget and Time Indicators */}
      <div style={{
        display: "flex",
        gap: spacing.sm,
        marginBottom: spacing.md
      }}>
        <div style={{
          background: `${colors.accent.base}20`,
          border: `${borders.width.thin} solid ${colors.accent.base}40`,
          borderRadius: borders.radius.md,
          padding: spacing.sm,
          flex: 1
        }}>
          <div style={{
            color: colors.neutral.base,
            fontSize: typography.fontSize.xs,
            textTransform: "uppercase",
            letterSpacing: typography.letterSpacing.wider,
            marginBottom: spacing.xs
          }}>
            Budget Remaining
          </div>
          <div style={{
            color: colors.neutral.white,
            fontWeight: typography.fontWeight.bold,
            fontSize: typography.fontSize.md
          }}>
            {budget.remaining.toFixed(2)} MON
          </div>
        </div>
        
        <div style={{
          background: `${colors.info.base}20`,
          border: `${borders.width.thin} solid ${colors.info.base}40`,
          borderRadius: borders.radius.md,
          padding: spacing.sm,
          flex: 1
        }}>
          <div style={{
            color: colors.neutral.base,
            fontSize: typography.fontSize.xs,
            textTransform: "uppercase",
            letterSpacing: typography.letterSpacing.wider,
            marginBottom: spacing.xs
          }}>
            Time Remaining
          </div>
          <div style={{
            color: colors.neutral.white,
            fontWeight: typography.fontWeight.bold,
            fontSize: typography.fontSize.md
          }}>
            {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Investigation Tools */}
      <div style={{
        flex: 1,
        display: "flex",
        gap: spacing.md,
        overflow: "hidden"
      }}>
        {/* Tool Selection Panel */}
        <div style={{
          width: "40%",
          background: colors.background.gradient.panel,
          border: `${borders.width.thin} solid ${colors.border.neutral}`,
          borderRadius: borders.radius.lg,
          padding: spacing.md,
          boxShadow: effects.shadow.sm,
          overflow: "auto"
        }}>
          <h3 style={{
            color: colors.neutral.white,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.bold,
            margin: 0,
            marginBottom: spacing.md
          }}>
            Diagnostic Tools
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: spacing.sm
          }}>
            {[
              { id: 'interview', name: 'Patient Interview', icon: '💬', description: 'Get detailed patient history and symptoms' },
              { id: 'labs', name: 'Laboratory Tests', icon: '🧪', description: 'Order CBC, CMP, inflammatory markers' },
              { id: 'imaging', name: 'Medical Imaging', icon: '📷', description: 'Request X-rays, CT, MRI scans' },
              { id: 'physical', name: 'Physical Examination', icon: '🩺', description: 'Palpation, auscultation, range of motion' },
              { id: 'scanning', name: '3D Body Scan', icon: '🔬', description: 'Advanced medical imaging technology' }
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                style={{
                  background: activeTool === tool.id ? 
                    `${colors.primary.base}20` : `${colors.neutral.dark}80`,
                  border: `${borders.width.thin} solid ${
                    activeTool === tool.id ? 
                      colors.primary.base : colors.neutral.dark
                  }`,
                  borderRadius: borders.radius.md,
                  padding: spacing.md,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  color: colors.neutral.light,
                  textAlign: "center"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = activeTool === tool.id ? 
                    `${colors.primary.base}30` : `${colors.neutral.dark}A0`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = activeTool === tool.id ? 
                    `${colors.primary.base}20` : `${colors.neutral.dark}80`;
                }}
              >
                <div style={{
                  fontSize: typography.fontSize.xl,
                  marginBottom: spacing.xs
                }}>
                  {tool.icon}
                </div>
                <div style={{
                  color: colors.neutral.white,
                  fontWeight: typography.fontWeight.bold,
                  fontSize: typography.fontSize.sm,
                  marginBottom: spacing.xs
                }}>
                  {tool.name}
                </div>
                <div style={{
                  color: colors.neutral.base,
                  fontSize: typography.fontSize.xs
                }}>
                  {tool.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Scan Feedback Area */}
        <div style={{
          width: "60%",
          display: "flex",
          flexDirection: "column",
          gap: spacing.md
        }}>
          {/* Real-time Scan Feedback */}
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
              Diagnostic Feedback
            </h3>
            
            {scanFeedback ? (
              <div style={{
                background: `${colors.primary.base}10`,
                border: `${borders.width.thin} solid ${colors.primary.base}30`,
                borderRadius: borders.radius.md,
                padding: spacing.md,
                color: colors.neutral.light,
                lineHeight: 1.6
              }}>
                {scanFeedback}
              </div>
            ) : (
              <div style={{
                color: colors.neutral.base,
                fontStyle: "italic",
                textAlign: "center",
                padding: spacing.xl
              }}>
                Select a diagnostic tool to begin gathering evidence
              </div>
            )}
          </div>

          {/* Evidence Collection */}
          <div style={{
            background: colors.background.gradient.panel,
            border: `${borders.width.thin} solid ${colors.border.neutral}`,
            borderRadius: borders.radius.lg,
            padding: spacing.md,
            boxShadow: effects.shadow.sm,
            maxHeight: 200,
            overflow: "auto"
          }}>
            <h3 style={{
              color: colors.neutral.white,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.sm
            }}>
              Collected Evidence ({collectedEvidence.length})
            </h3>
            
            {collectedEvidence.length > 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.xs
              }}>
                {collectedEvidence.map((evidence) => (
                  <div 
                    key={evidence.id}
                    style={{
                      background: `${colors.neutral.dark}80`,
                      borderRadius: borders.radius.sm,
                      padding: spacing.xs,
                      fontSize: typography.fontSize.sm,
                      color: colors.neutral.light
                    }}
                  >
                    <span style={{ color: colors.primary.base }}>•</span> {evidence.source}: {evidence.content}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                color: colors.neutral.base,
                fontStyle: "italic",
                textAlign: "center",
                padding: spacing.md
              }}>
                No evidence collected yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div style={{
        marginTop: spacing.md,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{
          color: colors.neutral.base,
          fontSize: typography.fontSize.sm
        }}>
          Collected {collectedEvidence.length} pieces of evidence
        </div>
        <button
          onClick={handleScanComplete}
          disabled={collectedEvidence.length === 0}
          style={{
            background: collectedEvidence.length > 0 ? colors.primary.base : colors.neutral.dark,
            color: collectedEvidence.length > 0 ? colors.neutral.dark : colors.neutral.base,
            border: "none",
            borderRadius: borders.radius.full,
            padding: `${spacing.sm} ${spacing.lg}`,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.bold,
            cursor: collectedEvidence.length > 0 ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow: effects.shadow.md,
          }}
          onMouseOver={(e) => {
            if (collectedEvidence.length > 0) {
              e.currentTarget.style.background = colors.primary.light;
            }
          }}
          onMouseOut={(e) => {
            if (collectedEvidence.length > 0) {
              e.currentTarget.style.background = colors.primary.base;
            }
          }}
        >
          Analyze Evidence →
        </button>
      </div>
    </div>
  );
};