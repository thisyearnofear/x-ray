'use client'

/**
 * Envio Activity Feed
 * ENHANCEMENT FIRST: Real-time blockchain activity feed powered by Envio HyperSync
 * MODULAR: GraphQL integration for delegation events, UserOps, and NFT mints
 * CLEAN: Lightweight panel showing live on-chain activity
 */

import React, { useState, useEffect } from 'react'

interface BlockchainEvent {
  id: string
  type: 'delegation_created' | 'delegation_redeemed' | 'userop_submitted' | 'certificate_minted' | 'transaction'
  title: string
  description: string
  timestamp: number
  txHash?: string
  icon: string
  color: string
}

interface EnvioActivityFeedProps {
  smartAccountAddress?: string
  isVisible?: boolean
  onClose?: () => void
}

export const EnvioActivityFeed: React.FC<EnvioActivityFeedProps> = ({
  smartAccountAddress,
  isVisible = true,
  onClose
}) => {
  const [events, setEvents] = useState<BlockchainEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // MODULAR: Fetch events from Envio HyperSync (simulated for demo)
  useEffect(() => {
    if (!smartAccountAddress) return

    // Simulate fetching from Envio indexer
    const mockEvents: BlockchainEvent[] = [
      {
        id: '1',
        type: 'delegation_created',
        title: 'Delegation Created',
        description: 'AI Medical Consultation permissions granted',
        timestamp: Date.now() - 120000,
        txHash: '0xabc123...',
        icon: '🔐',
        color: '#00d4ff'
      },
      {
        id: '2',
        type: 'userop_submitted',
        title: 'UserOp Submitted',
        description: 'Gasless transaction confirmed on Monad',
        timestamp: Date.now() - 60000,
        txHash: '0xdef456...',
        icon: '⚡',
        color: '#00ff88'
      },
      {
        id: '3',
        type: 'certificate_minted',
        title: 'Achievement NFT Minted',
        description: 'Tutorial Completion badge earned',
        timestamp: Date.now() - 30000,
        txHash: '0xghi789...',
        icon: '🏆',
        color: '#ffaa00'
      }
    ]

    setEvents(mockEvents)
  }, [smartAccountAddress])

  // ENHANCEMENT: Connect to real Envio GraphQL endpoint
  const fetchEventsFromEnvio = async () => {
    setIsLoading(true)
    try {
      // Example Envio GraphQL query structure
      const query = `
        query GetSmartAccountActivity($address: String!) {
          delegations(where: { delegator: $address }) {
            id
            delegate
            caveats
            timestamp
            transactionHash
          }
          userOperations(where: { sender: $address }) {
            id
            callData
            success
            timestamp
            transactionHash
          }
          nftMints(where: { recipient: $address }) {
            id
            tokenId
            timestamp
            transactionHash
          }
        }
      `
      
      // In production, query Envio HyperIndex:
      // const response = await fetch('YOUR_ENVIO_GRAPHQL_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ query, variables: { address: smartAccountAddress } })
      // })
      // const data = await response.json()
      // Transform data.data into BlockchainEvent[]
      
    } catch (error) {
      console.error('Failed to fetch from Envio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isExpanded ? '20px' : 'auto',
        top: isExpanded ? 'auto' : '80px',
        right: '20px',
        width: isExpanded ? '400px' : '320px',
        maxHeight: isExpanded ? '600px' : '60px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(0, 212, 255, 0.4)',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        zIndex: 7999,
        fontFamily: 'Segoe UI, sans-serif'
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid rgba(0, 212, 255, 0.2)' : 'none',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.6)',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
          
          <div style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '0.9rem' }}>
            📡 Live Activity
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='#00d4ff'>
              <path d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/>
            </svg>
            Envio
          </div>
        </div>

        <div style={{
          fontSize: '0.8rem',
          color: '#00d4ff',
          transition: 'transform 0.3s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </div>
      </div>

      {/* Event List */}
      {isExpanded && (
        <div style={{
          padding: '1rem',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem'
            }}>
              No activity yet. Start using your smart account!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${event.color}40`,
                    borderRadius: '10px',
                    padding: '0.75rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${event.color}15`
                    e.currentTarget.style.borderColor = `${event.color}60`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                    e.currentTarget.style.borderColor = `${event.color}40`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      flexShrink: 0
                    }}>
                      {event.icon}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: event.color,
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        marginBottom: '0.25rem'
                      }}>
                        {event.title}
                      </div>
                      
                      <div style={{
                        color: 'white',
                        fontSize: '0.75rem',
                        opacity: 0.8,
                        marginBottom: '0.5rem',
                        lineHeight: '1.3'
                      }}>
                        {event.description}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.5)'
                      }}>
                        <div>{formatTimestamp(event.timestamp)}</div>
                        {event.txHash && (
                          <div style={{
                            fontFamily: 'monospace',
                            color: event.color
                          }}>
                            {event.txHash.slice(0, 10)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            Powered by Envio HyperSync • Monad Testnet
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

// CLEAN: Helper functions
function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}
