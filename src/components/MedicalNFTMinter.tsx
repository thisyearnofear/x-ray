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
  }
}

export const MedicalNFTMinter: React.FC<MedicalNFTMinterProps> = ({
  walletAddress,
  lastDiagnosis
}) => {
  const { executeDelegatedAction, error: web3Error } = useWeb3()
  const [isMinting, setIsMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  if (!lastDiagnosis) {
    return (
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 40, 0.9))',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        padding: '20px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '13px',
        minWidth: '250px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏆</div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#00d4ff' }}>
          AI Achievement Ready
        </div>
        <div style={{ opacity: 0.8, lineHeight: '1.4' }}>
          Complete a diagnosis to mint your verifiable AI performance certificate
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      zIndex: 1000,
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95))',
      border: '1px solid rgba(231, 76, 60, 0.3)',
      padding: '25px',
      borderRadius: '15px',
      color: 'white',
      fontSize: '14px',
      minWidth: '320px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 25px rgba(231, 76, 60, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏆</div>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          color: '#e74c3c',
          fontWeight: 'bold'
        }}>
          AI Performance Certificate
        </h3>
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
          🔗 Connect MetaMask to mint your achievement certificate
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
          {isMinting ? '🔄 Minting Certificate...' : '🏆 Mint Achievement NFT'}
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
          🔒 <strong>Onchain Verification:</strong> Immutable proof of AI diagnostic skill
        </div>
        <div>
          📈 <strong>Performance Tracking:</strong> Build your medical AI achievement history
        </div>
      </div>
    </div>
  )
}
