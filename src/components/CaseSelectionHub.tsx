'use client';

/**
 * Case Selection Hub
 * IMMERSIVE: Gamified difficulty selection with economic preview
 * CLEAN: Clear progression from free to premium tiers
 * DESIGN: Holographic cards with your scanner aesthetic
 */

import React, { useState, useEffect } from 'react';
import { colors, typography, spacing, borders, effects, animation } from '../styles/design-tokens';
import { DIFFICULTY_CONFIGS } from '../domains/medical/BudgetManager';

interface CaseTier {
  id: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  label: string;
  description: string;
  startingBudget: number;
  maxEarnings: number;
  timeLimit: number;
  requiresWallet: boolean;
  difficulty: 'Easy' | 'Moderate' | 'Complex' | 'Expert';
  icon: string;
  color: string;
}

interface CaseSelectionHubProps {
  onSelectCase: (tier: CaseTier) => void;
  hasWallet: boolean;
  onConnectWallet: () => void;
  isVisible: boolean;
}

export const CaseSelectionHub: React.FC<CaseSelectionHubProps> = ({
  onSelectCase,
  hasWallet,
  onConnectWallet,
  isVisible
}) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  // Build case tiers from difficulty configs
  const caseTiers: CaseTier[] = [
    {
      id: 'beginner',
      label: DIFFICULTY_CONFIGS.beginner.label,
      description: DIFFICULTY_CONFIGS.beginner.description,
      startingBudget: DIFFICULTY_CONFIGS.beginner.startingBudget,
      maxEarnings: DIFFICULTY_CONFIGS.beginner.maxEarnings,
      timeLimit: DIFFICULTY_CONFIGS.beginner.timeLimit,
      requiresWallet: false,
      difficulty: 'Easy',
      icon: '🩹',
      color: colors.primary.base
    },
    {
      id: 'intermediate',
      label: DIFFICULTY_CONFIGS.intermediate.label,
      description: DIFFICULTY_CONFIGS.intermediate.description,
      startingBudget: DIFFICULTY_CONFIGS.intermediate.startingBudget,
      maxEarnings: DIFFICULTY_CONFIGS.intermediate.maxEarnings,
      timeLimit: DIFFICULTY_CONFIGS.intermediate.timeLimit,
      requiresWallet: true,
      difficulty: 'Moderate',
      icon: '💊',
      color: colors.info.base
    },
    {
      id: 'advanced',
      label: DIFFICULTY_CONFIGS.advanced.label,
      description: DIFFICULTY_CONFIGS.advanced.description,
      startingBudget: DIFFICULTY_CONFIGS.advanced.startingBudget,
      maxEarnings: DIFFICULTY_CONFIGS.advanced.maxEarnings,
      timeLimit: DIFFICULTY_CONFIGS.advanced.timeLimit,
      requiresWallet: true,
      difficulty: 'Complex',
      icon: '🏥',
      color: colors.accent.base
    },
    {
      id: 'expert',
      label: DIFFICULTY_CONFIGS.expert.label,
      description: DIFFICULTY_CONFIGS.expert.description,
      startingBudget: DIFFICULTY_CONFIGS.expert.startingBudget,
      maxEarnings: DIFFICULTY_CONFIGS.expert.maxEarnings,
      timeLimit: DIFFICULTY_CONFIGS.expert.timeLimit,
      requiresWallet: true,
      difficulty: 'Expert',
      icon: '🚑',
      color: colors.error.base
    }
  ];

  const handleSelectTier = (tier: CaseTier) => {
    if (tier.requiresWallet && !hasWallet) {
      setSelectedTier(tier.id);
      return;
    }
    onSelectCase(tier);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (!isVisible) return null;

  const styles: Record<string, React.CSSProperties> = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      fontFamily: typography.fontFamily.primary,
      animation: `fadeIn ${animation.duration.base} ${animation.easing.smooth}`
    },
    container: {
      maxWidth: '1200px',
      width: '90%',
      padding: spacing['3xl']
    },
    header: {
      textAlign: 'center',
      marginBottom: spacing['3xl']
    },
    title: {
      fontSize: typography.fontSize['5xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.base,
      textShadow: effects.textShadow.base,
      marginBottom: spacing.lg,
      fontFamily: typography.fontFamily.display
    },
    subtitle: {
      fontSize: typography.fontSize.xl,
      color: colors.neutral.light,
      lineHeight: typography.lineHeight.relaxed
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: spacing.xl,
      marginBottom: spacing['2xl']
    },
    card: {
      background: colors.background.gradient.panel,
      border: `${borders.width.base} solid ${colors.border.primary}`,
      borderRadius: borders.radius.xl,
      padding: spacing.xl,
      cursor: 'pointer',
      transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
      backdropFilter: effects.blur.lg,
      position: 'relative',
      overflow: 'hidden'
    },
    cardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'transparent',
      opacity: 0,
      transition: `opacity ${animation.duration.base}`,
      pointerEvents: 'none'
    },
    cardIcon: {
      fontSize: '48px',
      marginBottom: spacing.md,
      filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))'
    },
    cardTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.base,
      marginBottom: spacing.sm
    },
    cardDifficulty: {
      display: 'inline-block',
      padding: `${spacing.xs} ${spacing.md}`,
      background: colors.background.primaryGlow,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: borders.radius.base,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary.base,
      textTransform: 'uppercase',
      marginBottom: spacing.md
    },
    cardDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.neutral.light,
      marginBottom: spacing.lg,
      lineHeight: typography.lineHeight.relaxed
    },
    statsGrid: {
      display: 'grid',
      gap: spacing.sm,
      marginBottom: spacing.lg
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.sm,
      background: colors.background.primaryGlow,
      borderRadius: borders.radius.base,
      border: `1px solid ${colors.border.primary}`
    },
    statLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.neutral.base,
      textTransform: 'uppercase',
      letterSpacing: typography.letterSpacing.wide
    },
    statValue: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.base,
      fontFamily: typography.fontFamily.monospace
    },
    lockBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: `${spacing.sm} ${spacing.md}`,
      background: colors.background.accentGlow,
      border: `1px solid ${colors.accent.base}`,
      borderRadius: borders.radius.md,
      fontSize: typography.fontSize.sm,
      color: colors.accent.base,
      marginTop: spacing.md
    },
    connectButton: {
      width: '100%',
      padding: `${spacing.md} ${spacing.xl}`,
      background: `linear-gradient(135deg, ${colors.primary.base}, ${colors.primary.dark})`,
      border: 'none',
      borderRadius: borders.radius.md,
      color: colors.neutral.black,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      cursor: 'pointer',
      boxShadow: effects.shadow.primaryGlow,
      transition: `all ${animation.duration.base}`,
      marginTop: spacing.xl
    },
    footer: {
      textAlign: 'center',
      marginTop: spacing['2xl'],
      fontSize: typography.fontSize.sm,
      color: colors.neutral.base
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🩻 Select Medical Case</h1>
          <p style={styles.subtitle}>
            Choose your difficulty tier and budget allocation
          </p>
        </div>

        <div style={styles.grid}>
          {caseTiers.map((tier) => {
            const isLocked = tier.requiresWallet && !hasWallet;
            const isHovered = hoveredTier === tier.id;
            const isSelected = selectedTier === tier.id;

            return (
              <div
                key={tier.id}
                style={{
                  ...styles.card,
                  borderColor: isHovered ? tier.color : colors.border.primary,
                  transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
                  boxShadow: isHovered 
                    ? `${effects.shadow.lg}, 0 0 40px ${tier.color}44`
                    : effects.shadow.md,
                  opacity: isLocked ? 0.7 : 1
                }}
                onClick={() => handleSelectTier(tier)}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
              >
                <div 
                  style={{
                    ...styles.cardGlow,
                    background: `radial-gradient(circle at top, ${tier.color}22, transparent)`,
                    opacity: isHovered ? 1 : 0
                  }}
                />

                <div style={styles.cardIcon}>{tier.icon}</div>
                
                <h3 style={styles.cardTitle}>{tier.label}</h3>
                
                <div style={{
                  ...styles.cardDifficulty,
                  borderColor: tier.color,
                  color: tier.color,
                  background: `${tier.color}22`
                }}>
                  {tier.difficulty}
                </div>

                <p style={styles.cardDescription}>{tier.description}</p>

                <div style={styles.statsGrid}>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Budget</span>
                    <span style={styles.statValue}>{tier.startingBudget.toFixed(1)} MON</span>
                  </div>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Max Earnings</span>
                    <span style={{
                      ...styles.statValue,
                      color: tier.color
                    }}>
                      {tier.maxEarnings.toFixed(1)} MON
                    </span>
                  </div>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Time Limit</span>
                    <span style={styles.statValue}>{formatTime(tier.timeLimit)}</span>
                  </div>
                </div>

                {isLocked && (
                  <div style={styles.lockBadge}>
                    <span>🔒</span>
                    <span>Connect Wallet to Unlock</span>
                  </div>
                )}

                {isSelected && isLocked && (
                  <button
                    style={styles.connectButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onConnectWallet();
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = `${effects.shadow.lg}, ${effects.shadow.primaryGlow}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = effects.shadow.primaryGlow;
                    }}
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.footer}>
          <p>
            💡 Tip: Higher difficulty tiers offer greater rewards but require strategic budget management
          </p>
        </div>
      </div>
    </div>
  );
};
