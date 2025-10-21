'use client'

import React, { useState, useEffect } from 'react'
import { CaseAccessManager } from '../CaseAccessManager'

interface TierStatusIndicatorProps {
  onUpgradeClick?: () => void
  compact?: boolean
}

export const TierStatusIndicator: React.FC<TierStatusIndicatorProps> = ({
  onUpgradeClick,
  compact = false
}) => {
  const [accessManager] = useState(() => CaseAccessManager.getInstance())
  const [accessSummary, setAccessSummary] = useState(accessManager.getAccessSummary())
  const [userStatus, setUserStatus] = useState(accessManager.getUserStatus())

  useEffect(() => {
    const handleAccessChange = () => {
      setAccessSummary(accessManager.getAccessSummary())
      setUserStatus(accessManager.getUserStatus())
    }

    accessManager.on('accessStatusChanged', handleAccessChange)
    accessManager.on('caseUsageRecorded', handleAccessChange)
    
    return () => {
      // Note: In a real implementation, we'd want to remove the listeners
    }
  }, [accessManager])

  const getTierColor = () => {
    return accessSummary.tier === 'premium' ? '#00d4ff' : '#ffa500'
  }

  const getTierIcon = () => {
    return accessSummary.tier === 'premium' ? '👑' : '⭐'
  }

  const getCasesDisplay = () => {
    if (accessSummary.casesRemaining === 'unlimited') {
      return 'Unlimited'
    }
    return `${accessSummary.casesRemaining} left today`
  }

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: `rgba(${accessSummary.tier === 'premium' ? '0, 212, 255' : '255, 165, 0'}, 0.1)`,
        border: `1px solid rgba(${accessSummary.tier === 'premium' ? '0, 212, 255' : '255, 165, 0'}, 0.3)`,
        borderRadius: '20px',
        padding: '0.25rem 0.75rem',
        fontSize: '0.75rem',
        color: getTierColor()
      }}>
        <span>{getTierIcon()}</span>
        <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
          {accessSummary.tier}
        </span>
        {accessSummary.tier === 'free' && (
          <span style={{ opacity: 0.8 }}>
            ({getCasesDisplay()})
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.9)',
      border: `2px solid ${getTierColor()}`,
      borderRadius: '15px',
      padding: '1rem',
      color: 'white',
      fontFamily: 'Segoe UI, sans-serif',
      minWidth: '250px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{getTierIcon()}</span>
          <span style={{ 
            fontWeight: 'bold', 
            textTransform: 'capitalize',
            color: getTierColor()
          }}>
            {accessSummary.tier} Tier
          </span>
        </div>
        
        {userStatus.isAuthenticated && (
          <div style={{
            fontSize: '0.7rem',
            background: 'rgba(0, 255, 0, 0.2)',
            color: '#00ff00',
            padding: '0.25rem 0.5rem',
            borderRadius: '10px',
            border: '1px solid rgba(0, 255, 0, 0.3)'
          }}>
            ✅ Connected
          </div>
        )}
      </div>

      {/* Cases Remaining */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ 
          fontSize: '0.8rem', 
          opacity: 0.8, 
          marginBottom: '0.25rem' 
        }}>
          Cases Available:
        </div>
        <div style={{ 
          fontSize: '1rem', 
          fontWeight: 'bold',
          color: accessSummary.casesRemaining === 0 ? '#ff6b6b' : getTierColor()
        }}>
          {getCasesDisplay()}
        </div>
      </div>

      {/* Features */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ 
          fontSize: '0.8rem', 
          opacity: 0.8, 
          marginBottom: '0.5rem' 
        }}>
          Available Features:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {accessSummary.features.map((feature, index) => (
            <span
              key={index}
              style={{
                fontSize: '0.7rem',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.2rem 0.4rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {feature.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Upgrade Button */}
      {accessSummary.canUpgrade && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          style={{
            width: '100%',
            background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)'
          }}
        >
          🚀 Upgrade to Premium
        </button>
      )}

      {/* Status Messages */}
      {accessSummary.casesRemaining === 0 && accessSummary.tier === 'free' && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: '#ff6b6b',
          textAlign: 'center',
          opacity: 0.9
        }}>
          AI case limit reached. Static cases always available.
        </div>
      )}
    </div>
  )
}