/**
 * ProgressBar Component
 * Reusable progress indicator with holographic styling
 * 
 * CORE PRINCIPLES:
 * - MODULAR: Independent progress visualization
 * - DRY: Uses design tokens
 * - PERFORMANT: Hardware accelerated animations
 */

import React from 'react';
import { colors, borders, spacing, typography, effects, animation } from '../../styles/design-tokens';

interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    variant?: 'primary' | 'accent' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    glow?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    label,
    showPercentage = true,
    variant = 'primary',
    size = 'md',
    animated = true,
    glow = true,
}) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    const getVariantColors = () => {
        switch (variant) {
            case 'primary':
                return {
                    background: colors.background.primaryGlow,
                    fill: colors.primary.base,
                    border: colors.border.primary,
                    glow: colors.primary.glow,
                };
            case 'accent':
                return {
                    background: colors.background.accentGlow,
                    fill: colors.accent.base,
                    border: colors.border.accent,
                    glow: colors.accent.glow,
                };
            case 'error':
                return {
                    background: colors.background.errorGlow,
                    fill: colors.error.base,
                    border: colors.border.error,
                    glow: colors.error.glow,
                };
            case 'info':
                return {
                    background: colors.background.infoGlow,
                    fill: colors.info.base,
                    border: colors.border.info,
                    glow: colors.info.glow,
                };
        }
    };

    const getSizeHeight = () => {
        switch (size) {
            case 'sm':
                return '4px';
            case 'md':
                return '6px';
            case 'lg':
                return '8px';
        }
    };

    const variantColors = getVariantColors();

    const containerStyles: React.CSSProperties = {
        width: '100%',
        marginBottom: label || showPercentage ? spacing.sm : 0,
    };

    const headerStyles: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
        color: colors.neutral.light,
        fontSize: typography.fontSize.xs,
    };

    const labelStyles: React.CSSProperties = {
        fontWeight: typography.fontWeight.medium,
        letterSpacing: typography.letterSpacing.wide,
    };

    const percentageStyles: React.CSSProperties = {
        fontFamily: typography.fontFamily.monospace,
        color: variantColors.fill,
        fontWeight: typography.fontWeight.bold,
    };

    const barBackgroundStyles: React.CSSProperties = {
        width: '100%',
        height: getSizeHeight(),
        background: variantColors.background,
        border: `${borders.width.thin} solid ${variantColors.border}`,
        borderRadius: borders.radius.full,
        overflow: 'hidden',
        position: 'relative',
        transform: 'translateZ(0)', // Hardware acceleration
    };

    const barFillStyles: React.CSSProperties = {
        height: '100%',
        width: `${clampedProgress}%`,
        background: `linear-gradient(90deg, ${variantColors.fill}, ${variantColors.fill}dd)`,
        borderRadius: borders.radius.full,
        transition: animated
            ? `width ${animation.duration.slow} ${animation.easing.smooth}`
            : 'none',
        boxShadow: glow ? `0 0 10px ${variantColors.glow}` : 'none',
        position: 'relative',
        overflow: 'hidden',
    };

    const shimmerStyles: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)`,
        backgroundSize: '200% 100%',
        animation: animated ? 'shimmer 2s infinite' : 'none',
    };

    return (
        <div style={containerStyles}>
            {(label || showPercentage) && (
                <div style={headerStyles}>
                    {label && <span style={labelStyles}>{label}</span>}
                    {showPercentage && (
                        <span style={percentageStyles}>{Math.round(clampedProgress)}%</span>
                    )}
                </div>
            )}
            <div style={barBackgroundStyles}>
                <div style={barFillStyles}>
                    {animated && <div style={shimmerStyles} />}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
