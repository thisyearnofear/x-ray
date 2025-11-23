'use client'

import React, { useState } from 'react'
import { useWeb3 } from '../../hooks/web3/useWeb3'

interface DelegationPanelProps {
  walletAddress: string | null
  isConnected?: boolean
  gaslessEnabled?: boolean
  defaultDelegateAddress?: string
  isVisible: boolean
  onClose: () => void
}

export const DelegationPanel: React.FC<DelegationPanelProps> = ({
  walletAddress: propWalletAddress, // Renamed to indicate it's a prop
  isConnected = false,
  gaslessEnabled = false,
  defaultDelegateAddress,
  isVisible,
  onClose
}) => {
  const {
    createMedicalConsultationDelegation,
    createDataSharingDelegation,
    error: web3Error,
    address: contextWalletAddress,
    isConnected: contextIsConnected
  } = useWeb3()

  // Use the context wallet address instead of prop to ensure consistency
  const effectiveWalletAddress = contextWalletAddress || propWalletAddress
  const effectiveIsConnected = contextIsConnected || isConnected
  const [delegateAddress, setDelegateAddress] = useState(defaultDelegateAddress || '')
  const [isDelegating, setIsDelegating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Don't render if not visible
  if (!isVisible) return null

  const handleEnableConsultationDelegation = async () => {
    if (!effectiveWalletAddress || !delegateAddress) return

    setIsDelegating(true)
    setError(null)
    setSuccess(null)

    try {
      await createMedicalConsultationDelegation(delegateAddress as `0x${string}`)
      setSuccess('🔐 Gasless consultation permissions granted! Your delegate can now assist with gasless transactions.')
      setDelegateAddress('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable delegation')
    } finally {
      setIsDelegating(false)
    }
  }

  const handleShareMedicalData = async () => {
    if (!effectiveWalletAddress || !delegateAddress) return

    setIsDelegating(true)
    setError(null)
    setSuccess(null)

    try {
      await createDataSharingDelegation(delegateAddress as `0x${string}`, ['diagnosis', 'treatment', 'progress', 'ai-insights'])
      setSuccess('📊 Data sharing permissions granted! Your delegate can now access specified medical data.')
      setDelegateAddress('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share medical data')
    } finally {
      setIsDelegating(false)
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95))',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      padding: '30px',
      borderRadius: '15px',
      color: 'white',
      fontSize: '14px',
      minWidth: '400px',
      maxWidth: '500px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 212, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#00d4ff' }}>
          🔐 Enable Gasless Mode
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      <p style={{ margin: '0 0 25px 0', fontSize: '13px', opacity: 0.8, textAlign: 'center', lineHeight: '1.4' }}>
        Activate one-click transactions and eliminate gas fees for a seamless experience.
      </p>

      {!effectiveWalletAddress && (
        <div style={{
          color: '#ff6b6b',
          fontSize: '13px',
          marginBottom: '20px',
          textAlign: 'center',
          padding: '10px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 107, 107, 0.3)'
        }}>
          🔗 Please connect your wallet first to enable onchain features
        </div>
      )}

      {error && (
        <div style={{
          color: '#ff6b6b',
          marginBottom: '20px',
          fontSize: '13px',
          textAlign: 'center',
          padding: '10px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 107, 107, 0.3)'
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          color: '#4ecdc4',
          marginBottom: '20px',
          fontSize: '13px',
          textAlign: 'center',
          padding: '10px',
          background: 'rgba(78, 205, 196, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(78, 205, 196, 0.3)'
        }}>
          ✅ {success}
        </div>
      )}

      {effectiveWalletAddress && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#00d4ff'
            }}>
              🤖 Delegate Address:
            </label>
            <input
              type="text"
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
              placeholder="0x1234...abcd"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
            <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '5px' }}>
              Address of the delegate that will perform gasless transactions
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={handleEnableConsultationDelegation}
              disabled={!effectiveWalletAddress || !delegateAddress || isDelegating}
              style={{
                flex: 1,
                background: isDelegating ? 'rgba(85, 85, 85, 0.8)' : 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                color: 'white',
                border: 'none',
                padding: '15px 20px',
                borderRadius: '8px',
                cursor: isDelegating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: isDelegating ? 'none' : '0 4px 15px rgba(78, 205, 196, 0.3)',
                opacity: (!effectiveWalletAddress || !delegateAddress) ? 0.5 : 1
              }}
            >
              {isDelegating ? '🔄 Activating...' : '⚡ Activate Gasless Mode'}
            </button>

            <button
              onClick={handleShareMedicalData}
              disabled={!effectiveWalletAddress || !delegateAddress || isDelegating}
              style={{
                flex: 1,
                background: isDelegating ? 'rgba(85, 85, 85, 0.8)' : 'linear-gradient(135deg, #f39c12, #e67e22)',
                color: 'white',
                border: 'none',
                padding: '15px 20px',
                borderRadius: '8px',
                cursor: isDelegating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: isDelegating ? 'none' : '0 4px 15px rgba(243, 156, 18, 0.3)',
                opacity: (!effectiveWalletAddress || !delegateAddress) ? 0.5 : 1
              }}
            >
              📊 Share Progress
            </button>
          </div>

          <div style={{
            marginTop: '20px',
            fontSize: '12px',
            opacity: 0.7,
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            <div style={{ marginBottom: '8px' }}>
              🎯 <strong>Zero Gas Fees:</strong> We cover the cost of all your medical actions
            </div>
            <div>
              ⚡ <strong>Instant Actions:</strong> No more signing popups for every move
            </div>
          </div>
        </>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: 'rgba(0, 212, 255, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        fontSize: '12px'
      }}>
        <strong>Why connect your wallet?</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '15px', marginBottom: 0 }}>
          <li>🏆 Earn NFT achievements for completed cases</li>
          <li>📊 Track your diagnostic skills over time</li>
          <li>🔮 Access AI-generated personalized cases</li>
          <li>💸 Gasless transactions for all medical actions</li>
        </ul>
      </div>
    </div>
  )
}
