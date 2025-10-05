/**
 * HolographicButton Component
 * Reusable button with holographic styling
 * 
 * CORE PRINCIPLES:
 * - MODULAR: Independent, reusable component
 * - DRY: Uses design tokens for all styling
 * - CLEAN: Clear props interface
 */

import React from 'react';
import { colors, borders, spacing, typography, animation, effects, presets, hover } from '../../styles/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'error';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface HolographicButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

const HolographicButton: React.FC<HolographicButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    icon,
    className = '',
}) => {
    const getVariantStyles = (): React.CSSProperties => {
        switch (variant) {
            case 'primary':
                return {
                    background: `linear-gradient(135deg, ${colors.primary.base} 0%, ${colors.primary.dark} 100%)`,
                    color: colors.neutral.black,
                    border: 'none',
                    boxShadow: `${effects.shadow.base}, ${effects.shadow.primaryGlow}, ${effects.inset.medium}`,
                };
            case 'secondary':
                return {
                    background: 'transparent',
                    color: colors.primary.base,
                    border: `${borders.width.base} solid ${colors.border.primary}`,
                    boxShadow: 'none',
                };
            case 'accent':
                return {
                    background: `linear-gradient(135deg, ${colors.accent.base} 0%, ${colors.accent.dark} 100%)`,
                    color: colors.neutral.black,
                    border: 'none',
                    boxShadow: `${effects.shadow.base}, ${effects.shadow.accentGlow}, ${effects.inset.medium}`,
                };
            case 'error':
                return {
                    background: `linear-gradient(135deg, ${colors.error.base} 0%, ${colors.error.dark} 100%)`,
                    color: colors.neutral.white,
                    border: 'none',
                    boxShadow: `${effects.shadow.base}, ${effects.shadow.errorGlow}, ${effects.inset.medium}`,
                };
        }
    };

    const getSizeStyles = (): React.CSSProperties => {
        switch (size) {
            case 'sm':
                return {
                    padding: `${spacing.sm} ${spacing.md}`,
                    fontSize: typography.fontSize.sm,
                };
            case 'md':
                return {
                    padding: `${spacing.md} ${spacing.xl}`,
                    fontSize: typography.fontSize.md,
                };
            case 'lg':
                return {
                    padding: `${spacing.base} ${spacing['2xl']}`,
                    fontSize: typography.fontSize.lg,
                };
        }
    };

    const baseStyles: React.CSSProperties = {
        borderRadius: borders.radius.md,
        fontWeight: typography.fontWeight.bold,
        fontFamily: typography.fontFamily.primary,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        letterSpacing: typography.letterSpacing.wide,
        textTransform: 'uppercase' as const,
        position: 'relative' as const,
        overflow: 'hidden' as const,
        transform: 'translateZ(0)', // Hardware acceleration
        willChange: 'transform, box-shadow',
    };

    const handleClick = () => {
        if (!disabled && onClick) {
            onClick();
        }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
            e.currentTarget.style.transform = hover.lift.transform;
            e.currentTarget.style.boxShadow = hover.lift.boxShadow;
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
            e.currentTarget.style.transform = 'translateZ(0)';
            const variantStyles = getVariantStyles();
            e.currentTarget.style.boxShadow = variantStyles.boxShadow || 'none';
        }
    };

    return (
        <button
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={`holographic-button ${className}`}
            style={{
                ...baseStyles,
                ...getVariantStyles(),
                ...getSizeStyles(),
            }}
        >
            {icon && <span className="button-icon">{icon}</span>}
            <span className="button-text">{children}</span>
        </button>
    );
};

export default HolographicButton;
