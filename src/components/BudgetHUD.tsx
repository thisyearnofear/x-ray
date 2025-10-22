'use client';

/**
 * Budget HUD Component
 * IMMERSIVE: Holographic budget display with administrator messages
 * CLEAN: Real-time updates via GameManager events
 * DESIGN: Follows existing X-RAY design tokens
 */

import React, { useState, useEffect } from 'react';
import { colors, typography, spacing, borders, effects, zIndex } from '../styles/design-tokens';

interface BudgetHUDProps {
  remaining: number;
  spent: number;
  startingAmount: number;
  difficultyTier: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  administratorMessage?: {
    message: string;
    urgency: 'normal' | 'warning' | 'critical';
  };
  onRequestFunds?: () => void;
  onContributeFunds?: () => void;
  hasWallet: boolean;
}

export const BudgetHUD: React.FC<BudgetHUDProps> = ({
  remaining,
  spent,
  startingAmount,
  difficultyTier,
  administratorMessage,
  onRequestFunds,
  onContributeFunds,
  hasWallet
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdminMessage, setShowAdminMessage] = useState(false);

  // Calculate percentage and urgency
  const percentage = (remaining / startingAmount) * 100;
  const isCritical = percentage < 20;
  const isLow = percentage < 40 && !isCritical;

  // Get urgency color
  const getUrgencyColor = () => {
    if (isCritical) return colors.error.base;
    if (isLow) return colors.accent.base;
    return colors.primary.base;
  };

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

  const styles: Record<string, React.CSSProperties> = {
    container: {
      position: 'fixed',
      top: spacing.xl,
      right: spacing.xl,
      zIndex: zIndex.panel,
      fontFamily: typography.fontFamily.primary
    },
    mainPanel: {
      background: colors.background.gradient.panel,
      border: `${borders.width.base} solid ${getUrgencyColor()}`,
      borderRadius: borders.radius.xl,
      backdropFilter: effects.blur.lg,
      boxShadow: `${effects.shadow.md}, 0 0 20px ${getUrgencyColor()}33`,
      padding: spacing.lg,
      minWidth: '200px',
      transition: `all 300ms ease`,
      cursor: 'pointer'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm
    },
    title: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.neutral.light,
      textTransform: 'uppercase',
      letterSpacing: typography.letterSpacing.wider
    },
    icon: {
      fontSize: typography.fontSize.xl,
      filter: `drop-shadow(0 0 8px ${getUrgencyColor()})`
    },
    budgetAmount: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      color: getUrgencyColor(),
      textShadow: `0 0 10px ${getUrgencyColor()}66`,
      marginBottom: spacing.xs,
      fontFamily: typography.fontFamily.monospace
    },
    monLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.neutral.base,
      marginLeft: spacing.xs
    },
    progressBar: {
      height: '6px',
      background: colors.background.primaryGlow,
      borderRadius: borders.radius.full,
      overflow: 'hidden',
      marginBottom: spacing.sm,
      border: `1px solid ${colors.border.primary}`
    },
    progressFill: {
      height: '100%',
      background: `linear-gradient(90deg, ${getUrgencyColor()}, ${getUrgencyColor()}aa)`,
      boxShadow: `0 0 10px ${getUrgencyColor()}`,
      width: `${percentage}%`,
      transition: 'width 300ms ease'
    },
    stats: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: typography.fontSize.xs,
      color: colors.neutral.light,
      marginBottom: spacing.sm
    },
    tierBadge: {
      display: 'inline-block',
      padding: `${spacing.xs} ${spacing.sm}`,
      background: colors.background.primaryGlow,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: borders.radius.base,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary.base,
      textTransform: 'uppercase'
    },
    actionButtons: {
      display: 'flex',
      gap: spacing.sm,
      marginTop: spacing.md
    },
    button: {
      flex: 1,
      padding: `${spacing.sm} ${spacing.md}`,
      background: 'transparent',
      border: `${borders.width.base} solid ${colors.border.primary}`,
      borderRadius: borders.radius.md,
      color: colors.primary.base,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
      transition: 'all 200ms ease',
      backdropFilter: effects.blur.sm
    },
    adminMessageContainer: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: spacing.md,
      maxWidth: '300px',
      opacity: showAdminMessage ? 1 : 0,
      transform: showAdminMessage ? 'translateY(0)' : 'translateY(-10px)',
      transition: 'all 300ms ease',
      pointerEvents: showAdminMessage ? 'auto' : 'none'
    },
    adminMessage: {
      background: colors.background.gradient.panel,
      border: `${borders.width.base} solid ${
        administratorMessage?.urgency === 'critical' ? colors.error.base :
        administratorMessage?.urgency === 'warning' ? colors.accent.base :
        colors.info.base
      }`,
      borderRadius: borders.radius.xl,
      backdropFilter: effects.blur.lg,
      padding: spacing.lg,
      boxShadow: effects.shadow.md,
      fontSize: typography.fontSize.sm,
      color: colors.neutral.lightest,
      lineHeight: typography.lineHeight.relaxed
    }
  };

  return (
    <div style={styles.container}>
      <div 
        style={styles.mainPanel}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `${effects.shadow.lg}, 0 0 30px ${getUrgencyColor()}44`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `${effects.shadow.md}, 0 0 20px ${getUrgencyColor()}33`;
        }}
      >
        <div style={styles.header}>
          <div style={styles.title}>Budget</div>
          <div style={styles.icon}>💰</div>
        </div>

        <div style={styles.budgetAmount}>
          {remaining.toFixed(2)}
          <span style={styles.monLabel}>MON</span>
        </div>

        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>

        {isExpanded && (
          <>
            <div style={styles.stats}>
              <span>Starting:</span>
              <span>{startingAmount.toFixed(2)} MON</span>
            </div>
            <div style={styles.stats}>
              <span>Spent:</span>
              <span>{spent.toFixed(2)} MON</span>
            </div>
            <div style={styles.stats}>
              <span>Efficiency:</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>

            <div style={{ marginTop: spacing.md }}>
              <div style={styles.tierBadge}>
                {difficultyTier}
              </div>
            </div>

            {hasWallet && (
              <div style={styles.actionButtons}>
                <button
                  style={styles.button}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestFunds?.();
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.background.primaryGlow;
                    e.currentTarget.style.borderColor = colors.primary.base;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = colors.border.primary;
                  }}
                >
                  Request
                </button>
                <button
                  style={styles.button}
                  onClick={(e) => {
                    e.stopPropagation();
                    onContributeFunds?.();
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.background.primaryGlow;
                    e.currentTarget.style.borderColor = colors.primary.base;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = colors.border.primary;
                  }}
                >
                  Contribute
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {administratorMessage && (
        <div style={styles.adminMessageContainer}>
          <div style={styles.adminMessage}>
            {administratorMessage.message}
          </div>
        </div>
      )}
    </div>
  );
};
