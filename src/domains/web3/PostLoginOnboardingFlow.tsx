'use client'

/**
 * Post-Login Onboarding Flow
 * ENHANCEMENT FIRST: Guides users through Web3 setup after MetaMask connection
 * CLEAN: 3-step modal flow with smart account, delegation, and AI generation
 * MODULAR: Reusable onboarding for any wallet connection scenario
 */

import React, { useState, useEffect } from 'react'
import { DelegationPermissionsUI } from './DelegationPermissionsUI'

type OnboardingStep = 'welcome' | 'delegation' | 'generation'

interface PostLoginOnboardingFlowProps {
  smartAccountAddress: string
  walletAddress: string
  onComplete: (config: OnboardingResult) => void
  onSkip?: () => void
  onGamePause?: (paused: boolean) => void
}

interface OnboardingResult {
  delegationsEnabled: string[]
  generateAICase: boolean
  chargeTestnetMON: boolean
  skipOnboarding: boolean
}

export const PostLoginOnboardingFlow: React.FC<PostLoginOnboardingFlowProps> = ({
  smartAccountAddress,
  walletAddress,
  onComplete,
  onSkip,
  onGamePause
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [isProcessing, setIsProcessing] = useState(false)
  const [enabledPermissions, setEnabledPermissions] = useState<string[]>([])
  const [generateAI, setGenerateAI] = useState(true)

  // CLEAN: Pause game on mount, resume on unmount
  useEffect(() => {
    onGamePause?.(true)
    document.body.style.pointerEvents = 'none'
    
    // Allow interaction only with modal
    setTimeout(() => {
      const modal = document.querySelector('.onboarding-flow-modal')
      if (modal) {
        (modal as HTMLElement).style.pointerEvents = 'auto'
      }
    }, 100)

    return () => {
      onGamePause?.(false)
      document.body.style.pointerEvents = 'auto'
    }
  }, [onGamePause])

  // ACCESSIBILITY: Handle ESC key to close (only on step 1-2, not during generation)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep !== 'generation' && !isProcessing) {
        onSkip?.()
        onComplete({
          delegationsEnabled: [],
          generateAICase: false,
          chargeTestnetMON: false,
          skipOnboarding: true
        })
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [currentStep, isProcessing, onSkip, onComplete])

  // Step 1: Welcome & Smart Account Setup
  const renderWelcomeStep = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'pulse 2s ease-in-out infinite' }}>
        🦊
      </div>
      
      <h1 style={{
        color: '#00d4ff',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
      }}>
        Welcome to X-Ray AI!
      </h1>
      
      <p style={{
        color: 'white',
        fontSize: '1.2rem',
        lineHeight: '1.6',
        marginBottom: '2rem',
        opacity: 0.9
      }}>
        We&apos;re setting up your Smart Account for gasless transactions and AI-powered features.
      </p>

      <div style={{
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '2rem',
        textAlign: 'left'
      }}>
        <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
          ✨ Your Smart Account Benefits
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💸</span>
            <span>Gasless transactions - no fees for medical actions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <span>AI assistants with controlled permissions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏆</span>
            <span>NFT achievements for your accomplishments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <span>Instant confirmations on Monad testnet</span>
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '2rem',
        fontSize: '0.85rem',
        color: 'white',
        opacity: 0.7
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Your Wallet:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
        <div>
          <strong>Smart Account:</strong> {smartAccountAddress.slice(0, 6)}...{smartAccountAddress.slice(-4)}
        </div>
      </div>

      {/* ENHANCEMENT: Passkey (Hybrid) teaser */}
      <div style={{
        background: 'rgba(255, 170, 0, 0.1)',
        border: '1px solid rgba(255, 170, 0, 0.3)',
        borderRadius: '15px',
        padding: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ color: '#ffaa00', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          🔑 Optional: Upgrade to Passkey (Hybrid Account)
        </div>
        <p style={{ color: 'white', fontSize: '0.85rem', margin: '0 0 0.75rem 0', opacity: 0.9, lineHeight: '1.4' }}>
          Next time, use your fingerprint or Face ID for gasless logins—no private keys needed.
        </p>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Powered by WebAuthn + ERC-4337 Hybrid Smart Accounts
        </div>
      </div>

      <button
        onClick={() => setCurrentStep('delegation')}
        style={{
          width: '100%',
          background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
          color: 'black',
          border: 'none',
          padding: '1.25rem 2rem',
          borderRadius: '15px',
          cursor: 'pointer',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 212, 255, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 212, 255, 0.4)'
        }}
      >
        Continue to Setup →
      </button>
    </div>
  )

  // Step 2: Delegation Permissions
  const renderDelegationStep = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔐</div>
        <h2 style={{
          color: '#00d4ff',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          Configure AI Permissions
        </h2>
        <p style={{ color: 'white', opacity: 0.8, fontSize: '1rem' }}>
          Choose what AI assistants can help you with
        </p>
      </div>

      <div style={{
        background: 'rgba(0, 212, 255, 0.05)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '0.75rem' }}>
          🧠 What is Delegation?
        </div>
        <p style={{ color: 'white', fontSize: '0.9rem', lineHeight: '1.5', margin: 0, opacity: 0.9 }}>
          Delegation allows AI assistants to act on your behalf—like providing medical consultations or analyzing cases—without you paying gas fees each time. You stay in control and can revoke access anytime.
        </p>
      </div>

      {/* ENHANCEMENT: Visual delegation flow diagram (ERC-7710) */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
          📊 Delegation Flow (ERC-7710)
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          color: 'white',
          fontSize: '0.8rem'
        }}>
          {/* You (Delegator) */}
          <div style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.75rem',
            background: 'rgba(0, 255, 136, 0.1)',
            border: '2px solid rgba(0, 255, 136, 0.4)',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>👤</div>
            <div style={{ fontWeight: 'bold', color: '#00ff88', fontSize: '0.85rem' }}>You</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '0.15rem' }}>Delegator</div>
          </div>

          {/* Arrow */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.15rem'
          }}>
            <div style={{ fontSize: '1.2rem' }}>→</div>
            <div style={{ fontSize: '0.65rem', color: '#00d4ff', whiteSpace: 'nowrap' }}>Grant</div>
          </div>

          {/* Smart Account */}
          <div style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.75rem',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '2px solid rgba(0, 212, 255, 0.4)',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🏦</div>
            <div style={{ fontWeight: 'bold', color: '#00d4ff', fontSize: '0.85rem' }}>Smart Account</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '0.15rem' }}>ERC-4337</div>
          </div>

          {/* Arrow */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.15rem'
          }}>
            <div style={{ fontSize: '1.2rem' }}>→</div>
            <div style={{ fontSize: '0.65rem', color: '#ffaa00', whiteSpace: 'nowrap' }}>Redeem</div>
          </div>

          {/* AI Assistant */}
          <div style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.75rem',
            background: 'rgba(255, 170, 0, 0.1)',
            border: '2px solid rgba(255, 170, 0, 0.4)',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🤖</div>
            <div style={{ fontWeight: 'bold', color: '#ffaa00', fontSize: '0.85rem' }}>AI Assistant</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '0.15rem' }}>Delegate</div>
          </div>
        </div>

        {/* Benefits below diagram */}
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem',
          background: 'rgba(0, 255, 136, 0.05)',
          borderRadius: '8px',
          fontSize: '0.7rem',
          color: 'white',
          textAlign: 'center'
        }}>
          ✓ Gasless transactions • ✓ Granular permissions • ✓ Revoke anytime
        </div>
      </div>

      {/* Reuse existing DelegationPermissionsUI component */}
      <div style={{ marginBottom: '1.5rem' }}>
        <DelegationPermissionsUI
          onPermissionChange={(permissionId, enabled) => {
            setEnabledPermissions(prev => 
              enabled 
                ? [...prev, permissionId]
                : prev.filter(id => id !== permissionId)
            )
          }}
          onSavePermissions={() => {
            // Permissions saved, continue to next step
            setCurrentStep('generation')
          }}
          isSmartAccountConnected={true}
        />
      </div>

      <button
        onClick={() => setCurrentStep('generation')}
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '0.75rem',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        Skip for Now →
      </button>
    </div>
  )

  // Step 3: AI Case Generation
  const renderGenerationStep = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🤖</div>
      
      <h2 style={{
        color: '#00d4ff',
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        AI-Powered Case Generation
      </h2>
      
      <p style={{
        color: 'white',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        marginBottom: '2rem',
        opacity: 0.9
      }}>
        Your first AI-generated patient case is ready! Each case is uniquely created to match your skill level.
      </p>

      <div style={{
        background: 'rgba(0, 255, 136, 0.1)',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        textAlign: 'left'
      }}>
        <div style={{ color: '#00ff88', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
          ✨ AI Case Features
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'white' }}>
          <div>📊 Adaptive difficulty based on your performance</div>
          <div>🎯 Unique patient scenarios every time</div>
          <div>🔄 Dynamic symptoms and conditions</div>
          <div>📈 Better learning progression</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ color: 'white', fontWeight: 'bold' }}>Cost:</span>
          <span style={{ color: '#00d4ff', fontSize: '1.5rem', fontWeight: 'bold' }}>10 $MON</span>
        </div>
        <div style={{ color: 'white', fontSize: '0.85rem', opacity: 0.7 }}>
          Testnet tokens • Balance: 1000 $MON
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={() => handleComplete(true)}
          disabled={isProcessing}
          style={{
            flex: 1,
            background: isProcessing 
              ? 'rgba(0, 212, 255, 0.5)' 
              : 'linear-gradient(45deg, #00ff88, #00cc6a)',
            color: 'black',
            border: 'none',
            padding: '1.25rem 1.5rem',
            borderRadius: '15px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: isProcessing ? 'none' : '0 8px 25px rgba(0, 255, 136, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 255, 136, 0.6)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.4)'
            }
          }}
        >
          {isProcessing ? '🔄 Generating...' : '🤖 Generate AI Case'}
        </button>
      </div>

      <button
        onClick={() => handleComplete(false)}
        disabled={isProcessing}
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '1rem',
          borderRadius: '10px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          fontSize: '0.95rem',
          transition: 'all 0.3s ease',
          opacity: isProcessing ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (!isProcessing) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isProcessing) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        Use Free Static Case
      </button>

      <div style={{
        marginTop: '1.5rem',
        fontSize: '0.8rem',
        opacity: 0.6,
        color: 'white'
      }}>
        💡 You can switch between AI and static cases anytime
      </div>
    </div>
  )

  const handleComplete = async (generateAICase: boolean) => {
    setIsProcessing(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    onComplete({
      delegationsEnabled: enabledPermissions,
      generateAICase,
      chargeTestnetMON: generateAICase,
      skipOnboarding: false
    })
    
    setIsProcessing(false)
  }

  const handleSkipAll = () => {
    onSkip?.()
    onComplete({
      delegationsEnabled: [],
      generateAICase: false,
      chargeTestnetMON: false,
      skipOnboarding: true
    })
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div className="onboarding-flow-modal" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid #00d4ff',
        borderRadius: '20px',
        padding: '2.5rem',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: 'white',
        fontFamily: 'Segoe UI, sans-serif',
        boxShadow: '0 20px 60px rgba(0, 212, 255, 0.4)',
        position: 'relative'
      }}>
        {/* Progress Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {(['welcome', 'delegation', 'generation'] as OnboardingStep[]).map((step, index) => (
            <div
              key={step}
              style={{
                width: currentStep === step ? '40px' : '12px',
                height: '12px',
                borderRadius: '6px',
                background: currentStep === step
                  ? 'linear-gradient(90deg, #00d4ff, #0099cc)'
                  : 'rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'delegation' && renderDelegationStep()}
        {currentStep === 'generation' && renderGenerationStep()}

        {/* Skip All Option (only on first two steps) */}
        {currentStep !== 'generation' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={handleSkipAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
              }}
            >
              Skip Setup (use basic features)
            </button>
          </div>
        )}

        {/* Footer Info */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.75rem',
          opacity: 0.5,
          textAlign: 'center',
          color: 'white'
        }}>
          🔒 Secured by MetaMask Smart Accounts • Powered by ERC-7710 Delegation • Monad Testnet
        </div>
      </div>
    </div>
  )
}
