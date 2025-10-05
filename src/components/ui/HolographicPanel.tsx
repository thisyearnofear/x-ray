/**
 * HolographicPanel Component
 * Reusable panel with holographic styling and optional header
 * 
 * CORE PRINCIPLES:
 * - MODULAR: Independent, composable component
 * - DRY: Uses design tokens for all styling
 * - CLEAN: Clear props interface with sensible defaults
 */

import React from 'react';
import { colors, borders, spacing, typography, effects, zIndex } from '../../styles/design-tokens';

interface HolographicPanelProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onClose?: () => void;
    transparent?: boolean;
    blur?: boolean;
    glow?: boolean;
    padding?: keyof typeof spacing;
    className?: string;
    style?: React.CSSProperties;
}

const HolographicPanel: React.FC<HolographicPanelProps> = ({
    children,
    title,
    subtitle,
    icon,
    onClose,
    transparent = false,
    blur = true,
    glow = true,
    padding = 'xl',
    className = '',
    style = {},
}) => {
    const panelStyles: React.CSSProperties = {
        background: transparent
            ? colors.background.panelLight
            : colors.background.gradient.panel,
        border: `${borders.width.base} solid ${colors.border.primary}`,
        borderRadius: borders.radius.xl,
        backdropFilter: blur ? effects.blur.lg : 'none',
        boxShadow: glow
            ? `${effects.shadow.md}, ${effects.shadow.primaryGlow}`
            : effects.shadow.md,
        padding: spacing[padding],
        position: 'relative' as const,
        overflow: 'hidden' as const,
        transform: 'translateZ(0)', // Hardware acceleration
        ...style,
    };

    const headerStyles: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.base,
        paddingBottom: spacing.md,
        borderBottom: `1px solid ${colors.border.primary}`,
    };

    const titleContainerStyles: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
    };

    const titleStyles: React.CSSProperties = {
        color: colors.primary.base,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.wider,
        textShadow: effects.textShadow.sm,
        margin: 0,
    };

    const subtitleStyles: React.CSSProperties = {
        color: colors.neutral.light,
        fontSize: typography.fontSize.sm,
        letterSpacing: typography.letterSpacing.wide,
        margin: 0,
        marginTop: spacing.xs,
    };

    const closeButtonStyles: React.CSSProperties = {
        background: 'transparent',
        border: 'none',
        color: colors.primary.base,
        fontSize: typography.fontSize.lg,
        cursor: 'pointer',
        padding: spacing.sm,
        borderRadius: borders.radius.base,
        transition: 'all 300ms ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <div className={`holographic-panel ${className}`} style={panelStyles}>
            {/* Animated scan line effect */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${colors.primary.base}, transparent)`,
                    animation: 'scan 3s linear infinite',
                    pointerEvents: 'none',
                }}
            />

            {/* Header with title and optional close button */}
            {(title || subtitle || onClose) && (
                <div style={headerStyles}>
                    <div style={titleContainerStyles}>
                        {icon && <span style={{ fontSize: typography.fontSize.xl }}>{icon}</span>}
                        <div>
                            {title && <h3 style={titleStyles}>{title}</h3>}
                            {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            style={closeButtonStyles}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.background.primaryGlow;
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            )}

            {/* Panel content */}
            <div className="panel-content">{children}</div>
        </div>
    );
};

export default HolographicPanel;
