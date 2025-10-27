'use client';

/**
 * Phase Indicator Component
 * IMMERSIVE: Visual progression through medical diagnostic phases
 * CLEAN: Clear communication of current game phase and next steps
 * DESIGN: Holographic progress bar following X-RAY aesthetic
 */

import React from 'react';
import { colors, typography, spacing, borders, effects, animation } from '../styles/design-tokens';
import { GamePhase } from '../domains/diagnostic/GameManager';

interface PhaseIndicatorProps {
  currentPhase: GamePhase;
  timeRemaining?: number;
  patientCriticality?: 'stable' | 'deteriorating' | 'critical' | 'terminal';
  compact?: boolean; // Smaller version for HUD
}

interface PhaseDefinition {
  phase: GamePhase;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const PHASE_DEFINITIONS: PhaseDefinition[] = [
  {
    phase: GamePhase.PATIENT_ARRIVAL,
    label: 'Patient Arrival',
    icon: '🚑',
    description: 'Initial assessment and triage',
    color: colors.info.base
  },
  {
    phase: GamePhase.INVESTIGATION,
    label: 'Investigation',
    icon: '🔍',
    description: 'Gather symptoms and history',
    color: colors.accent.base
  },
  {
    phase: GamePhase.EVIDENCE_GATHERING,
    label: 'Evidence',
    icon: '🧪',
    description: 'Tests and imaging',
    color: colors.primary.base
  },
  {
    phase: GamePhase.DIAGNOSIS,
    label: 'Diagnosis',
    icon: '💊',
    description: 'Treatment and outcome',
    color: colors.primary.light
  },
  {
    phase: GamePhase.COMPLETED,
    label: 'Completed',
    icon: '✓',
    description: 'Case resolved',
    color: colors.primary.base
  }
];

// Legacy phase mapping
const LEGACY_PHASE_MAP: Record<string, GamePhase> = {
  [GamePhase.SCANNING]: GamePhase.INVESTIGATION,
  [GamePhase.ANALYZING]: GamePhase.EVIDENCE_GATHERING,
  [GamePhase.SOLVED]: GamePhase.COMPLETED
};

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  currentPhase,
  timeRemaining,
  patientCriticality,
  compact = false
}) => {
  // Map legacy phases to new phases
  const normalizedPhase = LEGACY_PHASE_MAP[currentPhase] || currentPhase;
  
  // Find current phase index
  const currentIndex = PHASE_DEFINITIONS.findIndex(p => p.phase === normalizedPhase);
  const currentPhaseInfo = PHASE_DEFINITIONS[currentIndex] || PHASE_DEFINITIONS[0];
  
  // Calculate progress percentage
  const progress = ((currentIndex + 1) / PHASE_DEFINITIONS.length) * 100;
  
  // Get urgency color based on time and criticality
  const getUrgencyColor = (): string => {
    if (patientCriticality === 'terminal') return colors.error.base;
    if (patientCriticality === 'critical') return colors.error.light;
    if (timeRemaining && timeRemaining < 60) return colors.accent.base;
    return colors.primary.base;
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      background: colors.background.gradient.panel,
      border: `${borders.width.thin} solid ${colors.border.primary}`,
      borderRadius: borders.radius.md,
      padding: compact ? spacing.sm : spacing.md,
      backdropFilter: effects.blur.md,
      boxShadow: effects.shadow.md
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: compact ? spacing.xs : spacing.sm
    },
    currentPhase: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs
    },
    phaseIcon: {
      fontSize: compact ? typography.fontSize.lg : typography.fontSize['2xl'],
      filter: `drop-shadow(0 0 8px ${currentPhaseInfo.color})`
    },
    phaseLabel: {
      fontSize: compact ? typography.fontSize.sm : typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: currentPhaseInfo.color,
      textShadow: effects.textShadow.sm
    },
    urgencyBadge: {
      padding: `${spacing.xs} ${spacing.sm}`,
      background: `${getUrgencyColor()}22`,
      border: `1px solid ${getUrgencyColor()}`,
      borderRadius: borders.radius.base,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: getUrgencyColor(),
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs
    },
    progressBar: {
      width: '100%',
      height: compact ? '4px' : '8px',
      background: colors.background.primaryGlow,
      borderRadius: borders.radius.full,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: `inset 0 1px 3px ${colors.neutral.darkest}`
    },
    progressFill: {
      height: '100%',
      width: `${progress}%`,
      background: `linear-gradient(90deg, ${currentPhaseInfo.color}, ${currentPhaseInfo.color}aa)`,
      boxShadow: `0 0 10px ${currentPhaseInfo.color}`,
      transition: `width ${animation.duration.base} ${animation.easing.smooth}`,
      borderRadius: borders.radius.full
    },
    phaseList: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: compact ? spacing.xs : spacing.sm,
      gap: spacing.xs
    },
    phaseStep: {
      flex: 1,
      textAlign: 'center',
      fontSize: typography.fontSize.xs,
      color: colors.neutral.base,
      transition: `all ${animation.duration.fast}`
    },
    phaseStepActive: {
      color: currentPhaseInfo.color,
      fontWeight: typography.fontWeight.semibold
    },
    phaseStepCompleted: {
      color: colors.primary.base,
      opacity: 0.6
    },
    phaseStepIcon: {
      display: 'block',
      marginBottom: spacing.xs,
      fontSize: typography.fontSize.md,
      opacity: 0.5
    },
    phaseStepIconActive: {
      opacity: 1,
      transform: 'scale(1.2)'
    },
    description: {
      fontSize: typography.fontSize.xs,
      color: colors.neutral.light,
      marginTop: spacing.sm,
      fontStyle: 'italic'
    }
  };

  if (compact) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.currentPhase}>
            <span style={styles.phaseIcon}>{currentPhaseInfo.icon}</span>
            <span style={styles.phaseLabel}>{currentPhaseInfo.label}</span>
          </div>
          {(timeRemaining !== undefined || patientCriticality) && (
            <div style={styles.urgencyBadge}>
              {patientCriticality === 'terminal' && '🚨'}
              {patientCriticality === 'critical' && '⚠️'}
              {timeRemaining !== undefined && `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}`}
            </div>
          )}
        </div>
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.currentPhase}>
          <span style={styles.phaseIcon}>{currentPhaseInfo.icon}</span>
          <span style={styles.phaseLabel}>{currentPhaseInfo.label}</span>
        </div>
        {(timeRemaining !== undefined || patientCriticality) && (
          <div style={styles.urgencyBadge}>
            {patientCriticality && (
              <>
                {patientCriticality === 'terminal' && '🚨 TERMINAL'}
                {patientCriticality === 'critical' && '⚠️ CRITICAL'}
                {patientCriticality === 'deteriorating' && '⚠️ DETERIORATING'}
                {patientCriticality === 'stable' && '✓ STABLE'}
              </>
            )}
            {timeRemaining !== undefined && (
              <span style={{ marginLeft: spacing.xs }}>
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </span>
            )}
          </div>
        )}
      </div>

      <div style={styles.progressBar}>
        <div style={styles.progressFill} />
      </div>

      <div style={styles.phaseList}>
        {PHASE_DEFINITIONS.map((phase, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div
              key={phase.phase}
              style={{
                ...styles.phaseStep,
                ...(isActive ? styles.phaseStepActive : {}),
                ...(isCompleted ? styles.phaseStepCompleted : {})
              }}
            >
              <span
                style={{
                  ...styles.phaseStepIcon,
                  ...(isActive ? styles.phaseStepIconActive : {})
                }}
              >
                {isCompleted ? '✓' : phase.icon}
              </span>
              <div>{phase.label}</div>
            </div>
          );
        })}
      </div>

      {!compact && (
        <div style={styles.description}>
          {currentPhaseInfo.description}
        </div>
      )}
    </div>
  );
};
