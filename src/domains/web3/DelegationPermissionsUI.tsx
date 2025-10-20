'use client'

/**
 * Delegation Permissions UI Component
 * ENHANCEMENT FIRST: Simplifies existing DelegationPanel complexity
 * CLEAN: User-friendly permissions without technical jargon
 * MODULAR: Reusable permission management for AI access
 */

import React, { useState } from 'react'

interface Permission {
  id: string
  title: string
  description: string
  icon: string
  enabled: boolean
  benefit: string
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
      description: 'Allow AI assistants to provide medical advice and answer questions',
      icon: '🤖',
      enabled: false,
      benefit: 'Get instant medical guidance'
    },
    {
      id: 'case_analysis',
      title: 'Diagnostic Case Analysis',
      description: 'Let AI analyze your diagnostic cases and provide insights',
      icon: '🔍',
      enabled: false,
      benefit: 'Improve diagnostic accuracy'
    },
    {
      id: 'progress_tracking',
      title: 'Learning Progress Tracking',
      description: 'Allow tracking of your medical learning progress and achievements',
      icon: '📊',
      enabled: false,
      benefit: 'Monitor your improvement'
    },
    {
      id: 'certificate_minting',
      title: 'Achievement Certificates',
      description: 'Automatically mint certificates when you complete medical cases',
      icon: '🏆',
      enabled: false,
      benefit: 'Build verified credentials'
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
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate save
    onSavePermissions()
    setIsSaving(false)
  }

  const enabledCount = permissions.filter(p => p.enabled).length

  if (!isSmartAccountConnected) {
    return (
      <div style={{
        background: 'rgba(255, 165, 0, 0.1)',
        border: '1px solid rgba(255, 165, 0, 0.3)',
        borderRadius: '15px',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffa500' }}>
          Smart Permissions
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
          Connect your smart account to manage AI assistant permissions
        </p>
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          Secure • Granular control • Revoke anytime
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid #00d4ff',
      borderRadius: '15px',
      padding: '1.5rem',
      color: 'white',
      fontFamily: 'Segoe UI, sans-serif',
      maxWidth: '500px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#00d4ff' }}>
          AI Assistant Permissions
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
          Choose what AI assistants can help you with
        </p>
      </div>

      {/* Permissions List */}
      <div style={{ marginBottom: '1.5rem' }}>
        {permissions.map((permission) => (
          <div
            key={permission.id}
            style={{
              background: permission.enabled 
                ? 'rgba(0, 212, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${permission.enabled ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => handlePermissionToggle(permission.id)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem' }}>{permission.icon}</div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem'
                }}>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '0.95rem',
                    color: permission.enabled ? '#00d4ff' : 'white'
                  }}>
                    {permission.title}
                  </h4>
                  
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: permission.enabled ? '#00d4ff' : 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    transition: 'all 0.3s ease'
                  }}>
                    {permission.enabled ? '✓' : ''}
                  </div>
                </div>
                
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '0.8rem', 
                  opacity: 0.8,
                  lineHeight: '1.3'
                }}>
                  {permission.description}
                </p>
                
                <div style={{
                  fontSize: '0.75rem',
                  color: permission.enabled ? '#00d4ff' : '#ffa500',
                  fontWeight: 'bold'
                }}>
                  ✨ {permission.benefit}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
          <strong>{enabledCount}</strong> of {permissions.length} permissions enabled
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
          You can change these settings anytime
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSavePermissions}
        disabled={isSaving}
        style={{
          width: '100%',
          background: isSaving 
            ? 'rgba(0, 212, 255, 0.5)' 
            : 'linear-gradient(45deg, #00d4ff, #0099cc)',
          color: 'white',
          border: 'none',
          padding: '1rem',
          borderRadius: '10px',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          boxShadow: isSaving ? 'none' : '0 4px 15px rgba(0, 212, 255, 0.3)'
        }}
      >
        {isSaving ? '🔄 Saving Permissions...' : '💾 Save Permissions'}
      </button>

      {/* Footer */}
      <div style={{
        marginTop: '1rem',
        fontSize: '0.75rem',
        opacity: 0.6,
        textAlign: 'center'
      }}>
        🔒 Secured by Smart Account • Revoke anytime • No fees
      </div>
    </div>
  )
}