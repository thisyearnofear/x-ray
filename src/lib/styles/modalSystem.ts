/**
 * Modal Design System
 * UNIFIED: Consistent sizing, spacing, and styling across all modals
 * COMPACT: Optimized for viewport and UX
 */

export const MODAL_SIZES = {
  // Small modals: alerts, confirmations, quick actions
  SMALL: {
    maxWidth: '380px',
    maxHeight: '60vh',
    padding: '1.25rem'
  },
  // Medium modals: forms, settings, permissions
  MEDIUM: {
    maxWidth: '500px',
    maxHeight: '75vh',
    padding: '1.5rem'
  },
  // Large modals: complex flows, multi-section content
  LARGE: {
    maxWidth: '650px',
    maxHeight: '85vh',
    padding: '1.75rem'
  },
  // XL modals: full-page-like experiences, multiple sections
  XL: {
    maxWidth: '800px',
    maxHeight: '90vh',
    padding: '2rem'
  }
} as const

export const MODAL_STYLES = {
  // Overlay (fullscreen backdrop)
  overlay: (zIndex = 10000) => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex,
    backdropFilter: 'blur(8px)'
  }),

  // Container (the modal box itself)
  container: (size: keyof typeof MODAL_SIZES = 'MEDIUM') => ({
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '2px solid #00d4ff',
    borderRadius: '16px',
    padding: MODAL_SIZES[size].padding,
    maxWidth: MODAL_SIZES[size].maxWidth,
    width: '90%',
    maxHeight: MODAL_SIZES[size].maxHeight,
    overflowY: 'auto' as const,
    color: 'white',
    fontFamily: 'Segoe UI, sans-serif',
    boxShadow: '0 20px 60px rgba(0, 212, 255, 0.3)',
    position: 'relative' as const
  }),

  // Header (title section)
  header: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(0, 212, 255, 0.2)'
  },

  // Title
  title: (icon = '') => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.75rem',
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 'bold' as const,
    color: '#00d4ff',
    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
  }),

  // Close button
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    transition: 'color 0.2s ease',
    ':hover': {
      color: 'white'
    }
  },

  // Tab container
  tabContainer: {
    display: 'flex' as const,
    gap: '0.5rem',
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
    overflow: 'auto' as const
  },

  // Tab button
  tabButton: (isActive: boolean) => ({
    background: 'transparent',
    border: 'none',
    borderBottom: isActive ? '2px solid #00d4ff' : '2px solid transparent',
    color: isActive ? '#00d4ff' : 'rgba(255, 255, 255, 0.6)',
    padding: '0.75rem 1rem',
    cursor: 'pointer' as const,
    fontSize: '0.9rem',
    fontWeight: isActive ? 'bold' as const : 'normal' as const,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const
  }),

  // Content area
  content: {
    marginBottom: '1.5rem',
    minHeight: '100px'
  },

  // Section/Card
  section: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.15)',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1rem'
  },

  // Primary button
  primaryButton: {
    background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold' as const,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0, 212, 255, 0.4)'
    }
  },

  // Secondary button
  secondaryButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.15)'
    }
  },

  // Compact permission/permission item (removed emoji benefits)
  permissionItem: (isEnabled: boolean) => ({
    background: isEnabled ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
    border: `1px solid ${isEnabled ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '8px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.75rem'
  }),

  // Footer (summary/info)
  footer: {
    fontSize: '0.75rem',
    opacity: 0.6,
    textAlign: 'center' as const,
    paddingTop: '1rem',
    borderTop: '1px solid rgba(0, 212, 255, 0.2)'
  }
} as const

/**
 * Responsive adjustments
 */
export const MODAL_RESPONSIVE = {
  mobile: {
    padding: '1rem',
    width: '95%',
    maxHeight: '95vh'
  },
  tablet: {
    padding: '1.25rem',
    width: '85%'
  }
} as const

/**
 * Animation keyframes (for use with CSS)
 */
export const MODAL_ANIMATIONS = `
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes modalSlideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
` as const
