'use client'

/**
 * Standard Modal Component
 * Enforces consistent sizing and styling across all modals
 * Use this as a wrapper for all modal content
 */

import React, { ReactNode } from 'react'
import { MODAL_SIZES, MODAL_STYLES } from '../lib/styles/modalSystem'

interface StandardModalProps {
  size?: keyof typeof MODAL_SIZES
  title?: string | ReactNode
  icon?: string
  onClose?: () => void
  children: ReactNode
  footer?: ReactNode
  isOpen?: boolean
  zIndex?: number
}

export const StandardModal: React.FC<StandardModalProps> = ({
  size = 'MEDIUM',
  title,
  icon,
  onClose,
  children,
  footer,
  isOpen = true,
  zIndex = 10000
}) => {
  if (!isOpen) return null

  return (
    <div style={MODAL_STYLES.overlay(zIndex)}>
      <div style={{
        ...MODAL_STYLES.container(size),
        animation: 'modalFadeIn 0.3s ease-out'
      }}>
        {/* Header */}
        {(title || onClose) && (
          <div style={MODAL_STYLES.header}>
            <div style={MODAL_STYLES.title(icon)}>
              {icon && <span>{icon}</span>}
              {title}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  ...MODAL_STYLES.closeButton,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255, 255, 255, 0.5)'
                }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={MODAL_STYLES.content}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={MODAL_STYLES.footer}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
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
      `}</style>
    </div>
  )
}
