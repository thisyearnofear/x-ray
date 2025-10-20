'use client'

import React, { useState } from 'react'
import { useWeb3 } from '../../hooks/web3/useWeb3'

interface MedicalCertificate {
  patientId: string
  diagnosis: string[]
  accuracy: number
  timestamp: number
  certificateId: string
}

interface MedicalNFTMinterProps {
  walletAddress: string | null
  lastDiagnosis?: {
    conditions: string[]
    accuracy: number
  } | null
}

export const MedicalNFTMinter: React.FC<MedicalNFTMinterProps> = ({
  walletAddress,
  lastDiagnosis
}) => {
  const { executeDelegatedAction, error: web3Error } = useWeb3()
  const [isMinting, setIsMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleMintCertificate = async () => {
    if (!walletAddress || !lastDiagnosis) return

    setIsMinting(true)
    setError(null)
    setSuccess(null)

    try {
      // Create certificate data
      const certificateData = {
        patientId: walletAddress,
        diagnosis: lastDiagnosis.conditions,
        accuracy: lastDiagnosis.accuracy,
        timestamp: Math.floor(Date.now() / 1000),
        certificateId: `${walletAddress}-${Date.now()}`
      }

      // Execute minting via user operation (simulated for now)
      // In production, this would call a smart contract
      const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`

      // Simulate onchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSuccess(`🏆 AI Achievement NFT minted! Certificate ID: ${certificateData.certificateId.slice(-8)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint certificate')
    } finally {
      setIsMinting(false)
    }
  }

  // Don't render if no diagnosis has been completed
  if (!lastDiagnosis) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95))',
      border: '1px solid rgba(231, 76, 60, 0.3)',
      borderRadius: '15px',
      color: 'white',
      fontSize: '14px',
      width: isCollapsed ? '60px' : '340px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 25px rgba(231, 76, 60, 0.1)',
      transition: 'width 0.3s ease, transform 0.3s ease',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header with collapse toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        borderBottom: isCollapsed ? 'none' : '1px solid rgba(231, 76, 60, 0.2)',
        cursor: 'pointer'
      }} onClick={() => setIsCollapsed(!isCollapsed)}>
        <div style={{
          fontSize: '24px',
          transition: 'transform 0.3s ease'
        }}>🏆</div>
        {!isCollapsed && (
          <h3 style={{
            margin: '0',
            fontSize: '16px',
            color: '#e74c3c',
            fontWeight: 'bold',
            flex: 1,
            marginLeft: '10px'
          }}>
            AI Certificate
          </h3>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsCollapsed(!isCollapsed)
          }}
          style={{
            background: 'rgba(231, 76, 60, 0.2)',
            color: '#e74c3c',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          {isCollapsed ? '◀' : '▶'}
        </button>
      </div>

      {/* Content - hidden when collapsed */}
      {!isCollapsed && (
        <div style={{ padding: '20px 15px 15px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{
              margin: '0',
              fontSize: '13px',
              opacity: 0.8,
              lineHeight: '1.4'
            }}>
              Mint a verifiable NFT celebrating your AI diagnostic achievements
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '13px', opacity: 0.8 }}>Diagnostic Accuracy:</span>
          <span style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: lastDiagnosis.accuracy >= 80 ? '#4ecdc4' : lastDiagnosis.accuracy >= 60 ? '#f39c12' : '#e74c3c'
          }}>
            {lastDiagnosis.accuracy}%
          </span>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7, lineHeight: '1.3' }}>
          <strong>Identified:</strong> {lastDiagnosis.conditions.join(', ')}
        </div>
      </div>

          {error && (
        <div style={{
          color: '#ff6b6b',
          marginBottom: '15px',
          fontSize: '13px',
          textAlign: 'center',
          padding: '8px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 107, 107, 0.3)'
        }}>
          ⚠️ {error}
        </div>
      )}

          {success && (
        <div style={{
          color: '#4ecdc4',
          marginBottom: '15px',
          fontSize: '13px',
          textAlign: 'center',
          padding: '8px',
          background: 'rgba(78, 205, 196, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(78, 205, 196, 0.3)'
        }}>
          ✅ {success}
        </div>
      )}

          {!walletAddress && (
        <div style={{
          color: '#ff6b6b',
          fontSize: '13px',
          marginBottom: '15px',
          textAlign: 'center',
          padding: '10px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 107, 107, 0.3)'
        }}>
          🔗 Connect wallet to save your achievement certificate
        </div>
      )}

          {walletAddress && (
        <button
          onClick={handleMintCertificate}
          disabled={isMinting}
          style={{
            width: '100%',
            background: isMinting ? 'rgba(85, 85, 85, 0.8)' : 'linear-gradient(135deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            padding: '16px 24px',
            borderRadius: '10px',
            cursor: isMinting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: isMinting ? 'none' : '0 6px 20px rgba(231, 76, 60, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {isMinting ? '🔄 Saving Certificate...' : '🏆 Save Achievement Certificate'}
        </button>
      )}

          <div style={{
            marginTop: '15px',
            fontSize: '11px',
            opacity: 0.6,
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            <div style={{ marginBottom: '4px' }}>
              🔒 <strong>Secure Verification:</strong> Permanent proof of your diagnostic skills
            </div>
            <div>
              📈 <strong>Progress Tracking:</strong> Build your medical achievement history
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
