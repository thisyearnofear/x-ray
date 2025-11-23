'use client'

/**
 * Delegation Permissions UI Component
 * COMPACT: Refactored for smaller modal footprint
 * CLEAN: Removed emoji benefits, streamlined descriptions
 * MODULAR: Reusable permission management for AI access
 */

import React, { useState } from 'react'
import { MODAL_SIZES } from '../../lib/styles/modalSystem'

interface Permission {
  id: string
  title: string
  icon: string
  enabled: boolean
}

interface DelegationPermissionsUIProps {
  onPermissionChange: (permissionId: string, enabled: boolean) => void
  onSavePermissions: () => void
  isSmartAccountConnected: boolean
}

export const DelegationPermissionsUI: React.FC<DelegationPermissionsUIProps> = ({
  onPermissionChange,
  onSavePermissions,
  isSmartAccountConnected
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'ai_consultation',
      title: 'AI Medical Consultations',
      icon: '🤖',
      enabled: false
    },
    {
      id: 'case_analysis',
      title: 'Diagnostic Case Analysis',
      icon: '🔍',
      enabled: false
    },
    {
      id: 'progress_tracking',
      title: 'Learning Progress Tracking',
      icon: '📊',
      enabled: false
    },
    {
      id: 'certificate_minting',
      title: 'Achievement Certificates',
      icon: '🏆',
      enabled: false
    }
  ])

  const [isSaving, setIsSaving] = useState(false)

  const handlePermissionToggle = (permissionId: string) => {
    setPermissions(prev => prev.map(permission => 
      permission.id === permissionId 
        ? { ...permission, enabled: !permission.enabled }
        : permission
    ))
    
    const permission = permissions.find(p => p.id === permissionId)
    if (permission) {
      onPermissionChange(permissionId, !permission.enabled)
    }
  }

  const handleSavePermissions = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    onSavePermissions()
    setIsSaving(false)
  }

  const enabledCount = permissions.filter(p => p.enabled).length

  if (!isSmartAccountConnected) {
    return (
      <div style={{
        background: 'rgba(255, 165, 0, 0.1)',
        border: '1px solid rgba(255, 165, 0, 0.3)',
        borderRadius: '12px',
        padding: '1rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔐</div>
        <p style={{ margin: '0', fontSize: '0.85rem', opacity: 0.9 }}>
          Connect smart account to manage permissions
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: '12px',
      padding: MODAL_SIZES.SMALL.padding,
      color: 'white',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      {/* Permissions List - Compact */}
      <div style={{ marginBottom: '1rem' }}>
        {permissions.map((permission) => (
          <div
            key={permission.id}
            onClick={() => handlePermissionToggle(permission.id)}
            style={{
              background: permission.enabled 
                ? 'rgba(0, 212, 255, 0.12)' 
                : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${permission.enabled ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div style={{ fontSize: '1.25rem' }}>{permission.icon}</div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.9rem',
                color: permission.enabled ? '#00d4ff' : 'white',
                fontWeight: '500',
                marginBottom: '0.15rem'
              }}>
                {permission.title}
              </div>
            </div>

            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: permission.enabled ? '#00d4ff' : 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              color: permission.enabled ? '#000' : '#fff',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}>
              {permission.enabled ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        background: 'rgba(0, 212, 255, 0.08)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '8px',
        padding: '0.75rem',
        marginBottom: '1rem',
        textAlign: 'center',
        fontSize: '0.8rem'
      }}>
        <strong>{enabledCount}</strong> of {permissions.length} enabled
      </div>

      {/* Action Button */}
      <button
        onClick={handleSavePermissions}
        disabled={isSaving}
        style={{
          width: '100%',
          background: isSaving 
            ? 'rgba(0, 212, 255, 0.4)' 
            : 'linear-gradient(45deg, #00d4ff, #0099cc)',
          color: 'white',
          border: 'none',
          padding: '0.75rem',
          borderRadius: '8px',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          boxShadow: isSaving ? 'none' : '0 4px 12px rgba(0, 212, 255, 0.25)'
        }}
      >
        {isSaving ? '🔄 Saving...' : '💾 Save'}
      </button>

      {/* Footer */}
      <div style={{
        marginTop: '0.75rem',
        fontSize: '0.7rem',
        opacity: 0.5,
        textAlign: 'center'
      }}>
        🔒 Secured • Revoke anytime • No fees
      </div>
    </div>
  )
}
