'use client'

import React, { useState, useEffect } from 'react'
import { CaseAccessManager } from '../CaseAccessManager'

interface UpgradePromptProps {
  onUpgrade: () => void
  onDismiss: () => void
  trigger: 'daily_limit' | 'ai_access' | 'feature_locked'
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  onUpgrade,
  onDismiss,
  trigger
}) => {
  const [accessManager] = useState(() => CaseAccessManager.getInstance())
  const [upgradeInfo, setUpgradeInfo] = useState(accessManager.getUpgradeInfo())
  const [userStatus, setUserStatus] = useState(accessManager.getUserStatus())

  useEffect(() => {
    const handleAccessChange = () => {
      setUpgradeInfo(accessManager.getUpgradeInfo())
      setUserStatus(accessManager.getUserStatus())
    }

    accessManager.on('accessStatusChanged', handleAccessChange)
    return () => {
      // Note: In a real implementation, we'd want to remove the listener
    }
  }, [accessManager])

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'daily_limit':
        return `You've used all ${accessManager.getTierConfig('free').maxCasesPerDay} free cases today`
      case 'ai_access':
        return 'AI-generated cases require premium access'
      case 'feature_locked':
        return 'This feature is available in premium'
      default:
        return 'Upgrade to unlock premium features'
    }
  }

  const getTriggerIcon = () => {
    switch (trigger) {
      case 'daily_limit': return '📊'
      case 'ai_access': return '🤖'
      case 'feature_locked': return '🔒'
      default: return '⭐'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid #00d4ff',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        color: 'white',
        fontFamily: 'Segoe UI, sans-serif',
        boxShadow: '0 20px 40px rgba(0, 212, 255, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            {getTriggerIcon()}
          </div>
          <h2 style={{ 
            margin: 0, 
            color: '#00d4ff', 
            fontSize: '1.5rem',
            marginBottom: '0.5rem'
          }}>
            Upgrade to Premium
          </h2>
          <p style={{ 
            margin: 0, 
            opacity: 0.8, 
            fontSize: '0.9rem' 
          }}>
            {getTriggerMessage()}
          </p>
        </div>

        {/* Current Status */}
        <div style={{
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#ff6b6b' }}>
            Current Limitations:
          </h4>
          {upgradeInfo.currentLimitations.map((limitation, index) => (
            <div key={index} style={{ 
              fontSize: '0.85rem', 
              marginBottom: '0.25rem',
              opacity: 0.9
            }}>
              {limitation}
            </div>
          ))}
        </div>

        {/* Premium Benefits */}
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#00d4ff' }}>
            Premium Benefits:
          </h4>
          {upgradeInfo.benefits.map((benefit, index) => (
            <div key={index} style={{ 
              fontSize: '0.85rem', 
              marginBottom: '0.25rem',
              opacity: 0.9
            }}>
              {benefit}
            </div>
          ))}
        </div>

        {/* Cost Information */}
        <div style={{
          background: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
            AI Case Generation Cost:
          </div>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            color: '#00d4ff' 
          }}>
            {upgradeInfo.cost} ETH per case
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
            Covers AI inference costs
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={onDismiss}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            Maybe Later
          </button>
          
          <button
            onClick={onUpgrade}
            style={{
              background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)'
            }}
          >
            🔗 Connect Wallet & Upgrade
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          fontSize: '0.75rem',
          opacity: 0.6
        }}>
          Secure payments via MetaMask • Instant access • Cancel anytime
        </div>
      </div>
    </div>
  )
}