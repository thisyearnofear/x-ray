'use client'

/**
 * Smart Account HUD Component
 * ENHANCEMENT FIRST: Persistent badge showing smart account status
 * MODULAR: Integrates with delegation management and balance display
 * CLEAN: Minimal, non-intrusive UI element for constant visibility
 */

import React, { useState, useEffect } from 'react'

interface SmartAccountHUDProps {
  smartAccountAddress?: string
  walletAddress?: string
  monBalance?: string
  activeDelegations?: number
  onManagePermissions?: () => void
  onViewActivity?: () => void
}

export const SmartAccountHUD: React.FC<SmartAccountHUDProps> = ({
  smartAccountAddress,
  walletAddress,
  monBalance = '0',
  activeDelegations = 0,
  onManagePermissions,
  onViewActivity
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const isConnected = !!smartAccountAddress

  if (!isConnected) {
    return null
  }

  return (
    <>
      {/* Main Badge */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 8000,
          fontFamily: 'Segoe UI, sans-serif'
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Collapsed Badge */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1))',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '12px',
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(0, 153, 204, 0.25))'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.2)'
            e.currentTarget.style.border = '1px solid rgba(0, 212, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1))'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.border = '1px solid rgba(0, 212, 255, 0.2)'
          }}
        >
          {/* Status Indicator */}
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.6)',
            animation: 'pulse 2s ease-in-out infinite'
          }} />

          {/* MetaMask Logo Emoji */}
          <div style={{ fontSize: '1.2rem' }}>🦊</div>

          {/* Balance */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <div style={{
              color: '#00d4ff',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Gasless Mode
            </div>
            <div style={{
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              {monBalance} $MON
            </div>
          </div>

          {/* Delegations Badge */}
          {activeDelegations > 0 && (
            <div style={{
              background: 'rgba(255, 170, 0, 0.2)',
              border: '1px solid rgba(255, 170, 0, 0.4)',
              borderRadius: '8px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              color: '#ffaa00',
              fontWeight: 'bold'
            }}>
              {activeDelegations} {activeDelegations === 1 ? 'Delegation' : 'Delegations'}
            </div>
          )}

          {/* Expand Arrow */}
          <div style={{
            fontSize: '0.8rem',
            color: '#00d4ff',
            transition: 'transform 0.3s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </div>
        </div>

        {/* Expanded Panel */}
        {isExpanded && (
          <div style={{
            marginTop: '0.5rem',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(0, 212, 255, 0.4)',
            borderRadius: '12px',
            padding: '1rem',
            width: '320px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'slideDown 0.3s ease-out'
          }}>
            {/* Account Info */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                color: '#00d4ff',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Account Details
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.7rem',
                  marginBottom: '0.25rem'
                }}>
                  EOA Wallet
                </div>
                <div style={{
                  color: 'white',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}>
                  {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem'
              }}>
                <div style={{
                  color: '#00d4ff',
                  fontSize: '0.7rem',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>Smart Account (ERC-4337)</span>
                  <span style={{
                    background: 'rgba(0, 255, 136, 0.2)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    color: '#00ff88'
                  }}>
                    Active
                  </span>
                </div>
                <div style={{
                  color: 'white',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}>
                  {smartAccountAddress?.slice(0, 8)}...{smartAccountAddress?.slice(-6)}
                </div>
              </div>
            </div>

            {/* Features */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                color: '#00d4ff',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Active Features
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ color: '#00ff88' }}>✓</span>
                  <span>Gasless Transactions</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ color: '#00ff88' }}>✓</span>
                  <span>ERC-7710 Delegations</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ color: '#00ff88' }}>✓</span>
                  <span>Monad 800ms Finality</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={onManagePermissions}
                style={{
                  width: '100%',
                  background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                  color: 'black',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                🔐 Manage Permissions
              </button>

              <button
                onClick={onViewActivity}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                📊 View Activity
              </button>
            </div>
          </div>
        )}

        {/* Tooltip */}
        {showTooltip && !isExpanded && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '0.5rem',
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(0, 212, 255, 0.4)',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.8rem',
            color: 'white',
            whiteSpace: 'nowrap',
            zIndex: 9000,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}>
            Click to view smart account details
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
