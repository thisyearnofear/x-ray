/**
 * ConditionCard Component
 * Display card for medical conditions with status indicators
 * 
 * CORE PRINCIPLES:
 * - MODULAR: Reusable condition display component
 * - DRY: Uses design tokens for consistent styling
 * - CLEAN: Clear status states and interactions
 */

import React from 'react';
import { colors, borders, spacing, typography, effects, animation } from '../../styles/design-tokens';

export type ConditionStatus = 'scanning' | 'ready' | 'discovered';
export type ConditionSeverity = 'low' | 'medium' | 'high';

interface ConditionCardProps {
    name: string;
    status: ConditionStatus;
    severity?: ConditionSeverity;
    progress?: number; // 0-100
    onClick?: () => void;
    className?: string;
}

const ConditionCard: React.FC<ConditionCardProps> = ({
    name,
    status,
    severity = 'medium',
    progress = 0,
    onClick,
    className = '',
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'scanning':
                return {
                    color: colors.neutral.white,
                    symbol: '🔍',
                    background: colors.background.primaryGlow,
                    border: colors.border.neutral,
                };
            case 'ready':
                return {
                    color: colors.accent.base,
                    symbol: '⚡',
                    background: colors.background.accentGlow,
                    border: colors.border.accent,
                };
            case 'discovered':
                return {
                    color: colors.primary.base,
                    symbol: '✅',
                    background: colors.background.primaryGlow,
                    border: colors.border.primaryStrong,
                };
        }
    };

    const getSeverityLabel = () => {
        return severity.toUpperCase();
    };

    const getSeverityColor = () => {
        switch (severity) {
            case 'low':
                return colors.info.base;
            case 'medium':
                return colors.accent.base;
            case 'high':
                return colors.error.base;
        }
    };

    const statusConfig = getStatusConfig();

    const cardStyles: React.CSSProperties = {
        padding: `${spacing.sm} ${spacing.md}`,
        margin: `${spacing.xs} 0`,
        background: statusConfig.background,
        border: `${borders.width.thin} solid ${statusConfig.border}`,
        borderRadius: borders.radius.md,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
        position: 'relative',
        overflow: 'hidden',
        transform: 'translateZ(0)', // Hardware acceleration
    };

    const symbolStyles: React.CSSProperties = {
        fontSize: typography.fontSize.md,
        flexShrink: 0,
    };

    const nameStyles: React.CSSProperties = {
        flex: 1,
        color: statusConfig.color,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        letterSpacing: typography.letterSpacing.normal,
    };

    const progressStyles: React.CSSProperties = {
        color: statusConfig.color,
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.monospace,
        opacity: 0.8,
        marginRight: spacing.sm,
    };

    const severityStyles: React.CSSProperties = {
        color: getSeverityColor(),
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.wider,
        opacity: 0.9,
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) {
            e.currentTarget.style.background = `linear-gradient(135deg, ${statusConfig.background}, ${colors.background.primaryGlow})`;
            e.currentTarget.style.borderColor = statusConfig.border.replace('0.3', '0.5');
            e.currentTarget.style.boxShadow = `0 8px 25px ${statusConfig.background}`;
            e.currentTarget.style.transform = 'translateY(-1px) translateZ(0)';
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) {
            e.currentTarget.style.background = statusConfig.background;
            e.currentTarget.style.borderColor = statusConfig.border;
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0) translateZ(0)';
        }
    };

    return (
        <div
            className={`condition-card ${className}`}
            style={cardStyles}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Status Symbol */}
            <span style={symbolStyles}>{statusConfig.symbol}</span>

            {/* Condition Name */}
            <span style={nameStyles}>{name}</span>

            {/* Progress Indicator (for scanning status) */}
            {status === 'scanning' && progress > 0 && (
                <span style={progressStyles}>{Math.round(progress)}%</span>
            )}

            {/* Severity Badge (for discovered status) */}
            {status === 'discovered' && (
                <span style={severityStyles}>{getSeverityLabel()}</span>
            )}

            {/* Shimmer effect for discovered items */}
            {status === 'discovered' && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)`,
                        animation: 'shimmer 3s infinite',
                        pointerEvents: 'none',
                    }}
                />
            )}
        </div>
    );
};

export default ConditionCard;
