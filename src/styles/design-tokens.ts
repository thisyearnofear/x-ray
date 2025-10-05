/**
 * X-RAI Design Tokens
 * Single source of truth for all visual styling across the application
 * 
 * CORE PRINCIPLES:
 * - DRY: All styling values defined once
 * - CLEAN: Clear categorization and naming
 * - ORGANIZED: Grouped by purpose and usage
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
    // Primary - Medical Scanner Green
    primary: {
        base: '#00ff88',
        light: '#00ffaa',
        dark: '#00cc6a',
        glow: 'rgba(0, 255, 136, 0.5)',
    },

    // Accent - Warning/Alert Orange
    accent: {
        base: '#ffaa00',
        light: '#ffcc00',
        dark: '#ff8800',
        glow: 'rgba(255, 170, 0, 0.5)',
    },

    // Info - Medical Blue
    info: {
        base: '#00d4ff',
        light: '#00e6ff',
        dark: '#00a8cc',
        glow: 'rgba(0, 212, 255, 0.5)',
    },

    // Error/Critical - Emergency Red
    error: {
        base: '#ff4444',
        light: '#ff6666',
        dark: '#cc0000',
        glow: 'rgba(255, 68, 68, 0.5)',
    },

    // Neutral - Grays for text and backgrounds
    neutral: {
        white: '#ffffff',
        lightest: '#f0f0f0',
        light: '#cccccc',
        base: '#999999',
        dark: '#666666',
        darker: '#333333',
        darkest: '#1a1a1a',
        black: '#000000',
    },

    // Background - Holographic overlays
    background: {
        // Primary panel backgrounds
        panel: 'rgba(0, 20, 40, 0.95)',
        panelLight: 'rgba(0, 20, 40, 0.85)',
        overlay: 'rgba(0, 0, 0, 0.95)',

        // Accent backgrounds
        primaryGlow: 'rgba(0, 255, 136, 0.1)',
        accentGlow: 'rgba(255, 170, 0, 0.1)',
        infoGlow: 'rgba(0, 212, 255, 0.1)',
        errorGlow: 'rgba(255, 68, 68, 0.1)',

        // Gradient backgrounds
        gradient: {
            primary: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 150, 255, 0.1) 100%)',
            accent: 'linear-gradient(135deg, rgba(255, 170, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%)',
            panel: 'linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 40, 80, 0.95) 100%)',
        },
    },

    // Border colors with opacity
    border: {
        primary: 'rgba(0, 255, 136, 0.3)',
        primaryStrong: 'rgba(0, 255, 136, 0.6)',
        accent: 'rgba(255, 170, 0, 0.3)',
        accentStrong: 'rgba(255, 170, 0, 0.6)',
        info: 'rgba(0, 212, 255, 0.3)',
        error: 'rgba(255, 68, 68, 0.3)',
        neutral: 'rgba(255, 255, 255, 0.2)',
    },
} as const

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
    // Font families
    fontFamily: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        monospace: '"Courier New", Courier, monospace',
        display: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    },

    // Font sizes
    fontSize: {
        xs: '9px',
        sm: '10px',
        base: '11px',
        md: '12px',
        lg: '14px',
        xl: '16px',
        '2xl': '18px',
        '3xl': '20px',
        '4xl': '24px',
        '5xl': '32px',
    },

    // Font weights
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    // Line heights
    lineHeight: {
        tight: '1.2',
        base: '1.4',
        relaxed: '1.6',
    },

    // Letter spacing
    letterSpacing: {
        tight: '-0.5px',
        normal: '0',
        wide: '0.5px',
        wider: '1px',
        widest: '2px',
    },
} as const

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    base: '1rem',    // 16px
    lg: '1.25rem',   // 20px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '3rem',   // 48px
    '4xl': '4rem',   // 64px
} as const

// ============================================================================
// BORDERS & RADIUS
// ============================================================================

export const borders = {
    radius: {
        sm: '4px',
        base: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
    },

    width: {
        thin: '1px',
        base: '2px',
        thick: '3px',
    },
} as const

// ============================================================================
// SHADOWS & EFFECTS
// ============================================================================

export const effects = {
    // Box shadows
    shadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
        base: '0 4px 12px rgba(0, 0, 0, 0.2)',
        md: '0 8px 20px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 30px rgba(0, 0, 0, 0.4)',
        xl: '0 20px 40px rgba(0, 0, 0, 0.5)',

        // Colored glows
        primaryGlow: '0 0 20px rgba(0, 255, 136, 0.3)',
        accentGlow: '0 0 20px rgba(255, 170, 0, 0.3)',
        errorGlow: '0 0 20px rgba(255, 68, 68, 0.3)',
    },

    // Text shadows for holographic effect
    textShadow: {
        sm: '0 0 5px rgba(0, 255, 136, 0.3)',
        base: '0 0 10px rgba(0, 255, 136, 0.5)',
        md: '0 0 15px rgba(0, 255, 136, 0.6)',
        lg: '0 0 20px rgba(0, 255, 136, 0.8)',

        accent: '0 0 10px rgba(255, 170, 0, 0.5)',
        error: '0 0 10px rgba(255, 68, 68, 0.5)',
    },

    // Backdrop blur
    blur: {
        sm: 'blur(5px)',
        base: 'blur(10px)',
        md: 'blur(15px)',
        lg: 'blur(20px)',
    },

    // Inset highlights
    inset: {
        light: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        medium: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        strong: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    },
} as const

// ============================================================================
// ANIMATIONS & TRANSITIONS
// ============================================================================

export const animation = {
    // Durations
    duration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms',
        slower: '800ms',
    },

    // Easing functions
    easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // Keyframe animations (CSS animation names)
    keyframes: {
        fadeIn: 'fadeIn',
        fadeOut: 'fadeOut',
        slideIn: 'slideIn',
        slideOut: 'slideOut',
        pulse: 'pulse',
        glow: 'glow',
        shimmer: 'shimmer',
        scan: 'scan',
    },
} as const

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const zIndex = {
    background: 0,
    canvas: 0,
    panel: 1000,
    overlay: 9999,
    modal: 10000,
    tooltip: 10001,
    notification: 10002,
} as const

// ============================================================================
// BREAKPOINTS (for responsive design)
// ============================================================================

export const breakpoints = {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
} as const

// ============================================================================
// COMPONENT PRESETS
// ============================================================================

/**
 * Pre-composed styling for common UI patterns
 * ENHANCEMENT FIRST: Reusable component styles
 */
export const presets = {
    // Holographic panel
    panel: {
        background: colors.background.gradient.panel,
        border: `${borders.width.base} solid ${colors.border.primary}`,
        borderRadius: borders.radius.xl,
        backdropFilter: effects.blur.lg,
        boxShadow: `${effects.shadow.md}, ${effects.shadow.primaryGlow}`,
        padding: spacing.xl,
    },

    // Holographic button (primary)
    buttonPrimary: {
        background: `linear-gradient(135deg, ${colors.primary.base} 0%, ${colors.primary.dark} 100%)`,
        color: colors.neutral.black,
        border: 'none',
        borderRadius: borders.radius.md,
        padding: `${spacing.md} ${spacing.xl}`,
        fontWeight: typography.fontWeight.bold,
        boxShadow: `${effects.shadow.base}, ${effects.shadow.primaryGlow}, ${effects.inset.medium}`,
        cursor: 'pointer',
        transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
    },

    // Holographic button (secondary)
    buttonSecondary: {
        background: 'transparent',
        color: colors.primary.base,
        border: `${borders.width.base} solid ${colors.border.primary}`,
        borderRadius: borders.radius.md,
        padding: `${spacing.md} ${spacing.xl}`,
        fontWeight: typography.fontWeight.bold,
        cursor: 'pointer',
        transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
    },

    // Text glow effect
    textGlow: {
        textShadow: effects.textShadow.base,
    },

    // Scan line effect
    scanLine: {
        background: `linear-gradient(90deg, transparent, ${colors.primary.base}, transparent)`,
        height: '2px',
        animation: `${animation.keyframes.scan} 3s ${animation.easing.linear} infinite`,
    },

    // Progress bar
    progressBar: {
        background: colors.background.primaryGlow,
        border: `${borders.width.thin} solid ${colors.border.primary}`,
        borderRadius: borders.radius.full,
        height: '4px',
        overflow: 'hidden',
    },

    // Card/condition item
    card: {
        background: colors.background.gradient.primary,
        border: `${borders.width.thin} solid ${colors.border.primary}`,
        borderRadius: borders.radius.md,
        padding: `${spacing.sm} ${spacing.md}`,
        transition: `all ${animation.duration.base} ${animation.easing.smooth}`,
    },
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get responsive value based on screen size
 */
export const responsive = {
    mobile: (styles: string) => `@media (max-width: ${breakpoints.tablet}) { ${styles} }`,
    tablet: (styles: string) => `@media (min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.desktop}) { ${styles} }`,
    desktop: (styles: string) => `@media (min-width: ${breakpoints.desktop}) { ${styles} }`,
}

/**
 * Combine multiple box shadows
 */
export const combineShadows = (...shadows: string[]) => shadows.join(', ')

/**
 * Create a glow effect with custom color
 */
export const createGlow = (color: string, intensity: number = 0.5) =>
    `0 0 20px rgba(${color}, ${intensity})`

/**
 * Generate hover state styles
 */
export const hover = {
    lift: {
        transform: 'translateY(-2px)',
        boxShadow: combineShadows(effects.shadow.md, effects.shadow.primaryGlow),
    },
    glow: {
        boxShadow: combineShadows(effects.shadow.base, effects.shadow.primaryGlow, effects.inset.medium),
    },
    brighten: {
        filter: 'brightness(1.1)',
    },
}

// ============================================================================
// KEYFRAME ANIMATIONS (to be added to CSS)
// ============================================================================

export const keyframeCSS = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(20px); opacity: 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 136, 0.3); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.6); }
}

@keyframes shimmer {
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}

@keyframes scan {
  0% { left: -100%; }
  100% { left: 100%; }
}
`

// ============================================================================
// TYPE EXPORTS for TypeScript
// ============================================================================

export type ColorToken = typeof colors
export type TypographyToken = typeof typography
export type SpacingToken = typeof spacing
export type BorderToken = typeof borders
export type EffectToken = typeof effects
export type AnimationToken = typeof animation
export type ZIndexToken = typeof zIndex
export type PresetToken = typeof presets
