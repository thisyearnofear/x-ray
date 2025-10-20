'use client'

import React from 'react'
import { useWeb3 } from '../../hooks/web3/useWeb3'

interface WalletConnectionProps {
  onConnected: (address: string) => void
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnected
}) => {
  const {
    isConnected,
    address,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet
  } = useWeb3()

  React.useEffect(() => {
    if (isConnected && address) {
      onConnected(address)
      
      // ENHANCEMENT FIRST: Dispatch wallet connection event for tier system
      const event = new CustomEvent('walletConnected', {
        detail: { address, isConnected: true }
      })
      document.dispatchEvent(event)
    } else if (!isConnected) {
      // Dispatch disconnection event
      const event = new CustomEvent('walletDisconnected', {
        detail: { isConnected: false }
      })
      document.dispatchEvent(event)
    }
  }, [isConnected, address, onConnected])

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '20px',
      borderRadius: '10px',
      color: 'white',
      fontSize: '14px',
      minWidth: '280px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🔐 Wallet
        {isConnected && <span style={{ color: '#4ecdc4', fontSize: '12px' }}>●</span>}
      </h3>

      {error && (
        <div style={{
          color: '#ff6b6b',
          marginBottom: '15px',
          fontSize: '12px',
          padding: '8px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '5px',
          border: '1px solid rgba(255, 107, 107, 0.3)'
        }}>
          {error}
        </div>
      )}

      {isConnected && address ? (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px' }}>Smart Account Active</div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              background: 'rgba(78, 205, 196, 0.1)',
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid rgba(78, 205, 196, 0.3)'
            }}>
              {address.slice(0, 8)}...{address.slice(-6)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={disconnectWallet}
              style={{
                flex: 1,
                background: '#ff4757',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Disconnect
            </button>

            <div style={{
              flex: 1,
              background: '#2d3748',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              Monad Testnet
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          style={{
            background: isConnecting ? '#555' : 'linear-gradient(135deg, #4ecdc4, #44a08d)',
            color: 'white',
            border: 'none',
            padding: '15px',
            borderRadius: '8px',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            width: '100%',
            transition: 'all 0.3s ease',
            boxShadow: isConnecting ? 'none' : '0 4px 15px rgba(78, 205, 196, 0.3)'
          }}
        >
          {isConnecting ? '🔄 Connecting...' : '🔗 Connect'}
        </button>
      )}

      <div style={{ marginTop: '15px', fontSize: '11px', opacity: 0.7, lineHeight: '1.4' }}>
        {isConnected
          ? 'Connected - Free AI consultations enabled! No transaction fees required.'
          : 'Connect to unlock free AI medical consultations (no gas fees)'
        }
      </div>
    </div>
  )
}
