'use client';

/**
 * Contextual Help Component
 * ENHANCEMENT: Integrated help tooltips for UI elements
 * CLEAN: Works with existing TooltipManager for consistency
 * DESIGN: Follows X-RAY holographic aesthetic
 */

import React, { useState, useEffect, useRef } from 'react';
import { colors, typography, spacing, borders, effects, zIndex } from '../styles/design-tokens';

export interface HelpTip {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  icon?: string;
  category?: 'gameplay' | 'medical' | 'economy' | 'technical';
  showOnce?: boolean; // Only show once per session
}

interface ContextualHelpProps {
  tip: HelpTip;
  children: React.ReactElement;
  disabled?: boolean;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  tip,
  children,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if tip has been shown before
    if (tip.showOnce) {
      const shown = sessionStorage.getItem(`help-tip-${tip.id}`);
      if (shown) {
        setHasBeenShown(true);
      }
    }
  }, [tip.id, tip.showOnce]);

  const handleMouseEnter = () => {
    if (disabled || (tip.showOnce && hasBeenShown)) return;
    setIsVisible(true);
    
    if (tip.showOnce) {
      sessionStorage.setItem(`help-tip-${tip.id}`, 'true');
      setHasBeenShown(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const getCategoryColor = (category: HelpTip['category']) => {
    switch (category) {
      case 'gameplay': return colors.primary.base;
      case 'medical': return colors.error.light;
      case 'economy': return colors.accent.base;
      case 'technical': return colors.info.base;
      default: return colors.primary.base;
    }
  };

  const getCategoryIcon = (category: HelpTip['category']) => {
    switch (category) {
      case 'gameplay': return '🎮';
      case 'medical': return '⚕️';
      case 'economy': return '💰';
      case 'technical': return '⚙️';
      default: return '💡';
    }
  };

  const getTooltipPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const position = tip.position || 'top';

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 10;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 10;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 10;
        break;
    }

    // Keep tooltip within viewport
    const margin = 10;
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

    return { top: `${top}px`, left: `${left}px` };
  };

  const categoryColor = getCategoryColor(tip.category);

  const styles: Record<string, React.CSSProperties> = {
    wrapper: {
      display: 'inline-block',
      position: 'relative'
    },
    trigger: {
      display: 'inline-block'
    },
    tooltip: {
      position: 'fixed',
      zIndex: zIndex.tooltip,
      maxWidth: '320px',
      background: colors.background.gradient.panel,
      border: `${borders.width.base} solid ${categoryColor}`,
      borderRadius: borders.radius.xl,
      backdropFilter: effects.blur.lg,
      boxShadow: `${effects.shadow.xl}, 0 0 20px ${categoryColor}44`,
      padding: spacing.lg,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'scale(1)' : 'scale(0.95)',
      transition: 'all 300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      pointerEvents: isVisible ? 'auto' : 'none',
      fontFamily: typography.fontFamily.primary,
      ...getTooltipPosition()
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottom: `1px solid ${categoryColor}33`
    },
    icon: {
      fontSize: typography.fontSize['2xl'],
      filter: `drop-shadow(0 0 8px ${categoryColor})`
    },
    categoryBadge: {
      fontSize: typography.fontSize['2xl'],
      filter: `drop-shadow(0 0 8px ${categoryColor})`
    },
    title: {
      flex: 1,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: categoryColor,
      textShadow: effects.textShadow.sm
    },
    content: {
      fontSize: typography.fontSize.sm,
      color: colors.neutral.lightest,
      lineHeight: typography.lineHeight.relaxed
    },
    helpIndicator: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      width: '12px',
      height: '12px',
      background: categoryColor,
      borderRadius: borders.radius.full,
      boxShadow: `0 0 8px ${categoryColor}`,
      animation: 'pulse 2s ease-in-out infinite',
      pointerEvents: 'none'
    }
  };

  return (
    <div style={styles.wrapper}>
      <div
        ref={triggerRef}
        style={styles.trigger}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {!disabled && !(tip.showOnce && hasBeenShown) && (
          <div style={styles.helpIndicator} />
        )}
      </div>

      {isVisible && (
        <div ref={tooltipRef} style={styles.tooltip}>
          <div style={styles.header}>
            <span style={styles.categoryBadge}>
              {tip.icon || getCategoryIcon(tip.category)}
            </span>
            <span style={styles.title}>{tip.title}</span>
          </div>
          <div style={styles.content}>{tip.content}</div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

/**
 * Predefined help tips for common UI elements
 */
export const HELP_TIPS: Record<string, HelpTip> = {
  budget: {
    id: 'budget-help',
    title: 'Budget Management',
    content: 'Manage your MON tokens wisely. Tests and treatments cost resources. Run out and you may need to negotiate with the administrator or contribute personal funds.',
    category: 'economy',
    position: 'bottom',
    showOnce: true
  },
  patientHealth: {
    id: 'patient-health-help',
    title: 'Patient Health',
    content: 'Monitor patient health closely. It deteriorates over time. Critical status requires immediate intervention. Watch for milestone warnings.',
    category: 'medical',
    position: 'left'
  },
  diagnosticConfidence: {
    id: 'diagnostic-confidence-help',
    title: 'Diagnostic Confidence',
    content: 'Track your diagnostic certainty. Higher confidence means more accurate diagnosis. Gather evidence through tests and examinations.',
    category: 'medical',
    position: 'left'
  },
  treatmentMenu: {
    id: 'treatment-menu-help',
    title: 'Medical Actions',
    content: 'Choose tests and treatments carefully. AI predictions show success rates and risks. Actions with high recommendation scores are safer.',
    category: 'gameplay',
    position: 'top'
  },
  phaseIndicator: {
    id: 'phase-indicator-help',
    title: 'Game Phases',
    content: 'Progress through diagnostic phases: Patient Arrival → Investigation → Evidence Gathering → Diagnosis → Completed. Each phase unlocks new actions.',
    category: 'gameplay',
    position: 'bottom',
    showOnce: true
  },
  outcomePreview: {
    id: 'outcome-preview-help',
    title: 'Outcome Predictions',
    content: 'AI-powered predictions show expected outcomes. Success rate, health impact, and recommendations help you make informed decisions.',
    category: 'technical',
    position: 'top'
  },
  timeRemaining: {
    id: 'time-remaining-help',
    title: 'Time Management',
    content: 'Time is limited. Patient health deteriorates as time passes. Balance thorough investigation with timely treatment.',
    category: 'gameplay',
    position: 'bottom'
  },
  walletConnection: {
    id: 'wallet-connection-help',
    title: 'Wallet Features',
    content: 'Connect your wallet to unlock premium features: Additional budget requests, personal fund contributions, and on-chain case generation.',
    category: 'economy',
    position: 'bottom'
  }
};

/**
 * Hook for programmatic tooltip control
 */
export const useContextualHelp = () => {
  const [activeTip, setActiveTip] = useState<string | null>(null);

  const showTip = (tipId: string) => {
    setActiveTip(tipId);
  };

  const hideTip = () => {
    setActiveTip(null);
  };

  const resetTip = (tipId: string) => {
    sessionStorage.removeItem(`help-tip-${tipId}`);
  };

  const resetAllTips = () => {
    Object.keys(HELP_TIPS).forEach(tipId => {
      sessionStorage.removeItem(`help-tip-${tipId}`);
    });
  };

  return {
    activeTip,
    showTip,
    hideTip,
    resetTip,
    resetAllTips
  };
};
