'use client'

/**
 * Post-Login Onboarding Flow
 * COMPACT: Redesigned with tighter spacing and size limits
 * CLEAN: 3-step modal flow with smart account, delegation, and AI generation
 * MODULAR: Reusable onboarding for any wallet connection scenario
 */

import React, { useState, useEffect } from 'react'
import { DelegationPermissionsUI } from './DelegationPermissionsUI'
import { MODAL_SIZES, MODAL_STYLES } from '../../lib/styles/modalSystem'

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

  useEffect(() => {
    onGamePause?.(true)
    return () => onGamePause?.(false)
  }, [onGamePause])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep !== 'generation' && !isProcessing) {
        handleSkipAll()
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [currentStep, isProcessing])

  // Step 1: Welcome
  const renderWelcomeStep = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🦊</div>
      
      <h1 style={{
        color: '#00d4ff',
        fontSize: '1.75rem',
        fontWeight: 'bold',
        marginBottom: '0.75rem',
        textShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
      }}>
        Welcome to X-RAI
      </h1>
      
      <p style={{
        color: 'white',
        fontSize: '0.95rem',
        lineHeight: '1.5',
        marginBottom: '1rem',
        opacity: 0.9
      }}>
        We're setting up your smart account for gasless AI-assisted diagnosis.
      </p>

      {/* Benefits - Compact */}
      <div style={{
        background: 'rgba(0, 212, 255, 0.08)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1rem',
        textAlign: 'left',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'white' }}>
          <div>💸 Gasless transactions</div>
          <div>🤖 AI assistants with permissions</div>
          <div>🏆 NFT achievements</div>
          <div>⚡ Instant confirmations</div>
        </div>
      </div>

      {/* Account Info - Compact */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        padding: '0.75rem',
        marginBottom: '1rem',
        fontSize: '0.75rem',
        color: 'white',
        opacity: 0.7,
        lineHeight: '1.4'
      }}>
        <div>📍 Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
        <div>🏦 Account: {smartAccountAddress.slice(0, 6)}...{smartAccountAddress.slice(-4)}</div>
      </div>

      <button
        onClick={() => setCurrentStep('delegation')}
        style={{
          width: '100%',
          background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
          transition: 'all 0.2s ease'
        }}
      >
        Continue →
      </button>
    </div>
  )

  // Step 2: Permissions
  const renderDelegationStep = () => (
    <div>
      <h2 style={{
        color: '#00d4ff',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        textAlign: 'center'
      }}>
        🔐 Permissions
      </h2>
      
      <p style={{ textAlign: 'center', fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem' }}>
        Choose what AI assistants can help with
      </p>

      {/* Delegation Info - Collapsible */}
      <details style={{
        marginBottom: '1rem',
        fontSize: '0.8rem'
      }}>
        <summary style={{
          color: '#00d4ff',
          cursor: 'pointer',
          padding: '0.5rem',
          background: 'rgba(0, 212, 255, 0.08)',
          borderRadius: '6px',
          marginBottom: '0.5rem'
        }}>
          🧠 What is delegation?
        </summary>
        <p style={{
          margin: '0.5rem 0 0 0',
          fontSize: '0.75rem',
          opacity: 0.8,
          lineHeight: '1.4'
        }}>
          Delegation allows AI assistants to act on your behalf without gas fees. You control permissions and can revoke anytime.
        </p>
      </details>

      {/* Permissions Component */}
      <div style={{ marginBottom: '1rem' }}>
        <DelegationPermissionsUI
          onPermissionChange={(permissionId, enabled) => {
            setEnabledPermissions(prev => 
              enabled 
                ? [...prev, permissionId]
                : prev.filter(id => id !== permissionId)
            )
          }}
          onSavePermissions={() => setCurrentStep('generation')}
          isSmartAccountConnected={true}
        />
      </div>

      <button
        onClick={() => setCurrentStep('generation')}
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '0.75rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease'
        }}
      >
        Skip →
      </button>
    </div>
  )

  // Step 3: Generation
  const renderGenerationStep = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤖</div>
      
      <h2 style={{
        color: '#00d4ff',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem'
      }}>
        AI Case Generation
      </h2>
      
      <p style={{
        color: 'white',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        marginBottom: '1rem',
        opacity: 0.9
      }}>
        Your first case adapts to your skill and choices.
      </p>

      {/* Cost - Compact */}
      <div style={{
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '8px',
        padding: '0.75rem',
        marginBottom: '1rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Cost:</span>
          <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>0.1 $MON</span>
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
          Testnet • Gasless
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => handleComplete(true)}
          disabled={isProcessing}
          style={{
            flex: 1,
            background: isProcessing 
              ? 'rgba(0, 212, 255, 0.4)' 
              : 'linear-gradient(45deg, #00ff88, #00cc6a)',
            color: 'black',
            border: 'none',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: isProcessing ? 'none' : '0 4px 12px rgba(0, 255, 136, 0.3)'
          }}
        >
          {isProcessing ? '🔄' : '🤖'} {isProcessing ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <button
        onClick={() => handleComplete(false)}
        disabled={isProcessing}
        style={{
          width: '100%',
          marginTop: '0.75rem',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '0.75rem',
          borderRadius: '8px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
          opacity: isProcessing ? 0.5 : 1
        }}
      >
        Start Free Case
      </button>
    </div>
  )

  const handleComplete = async (generateAICase: boolean) => {
    setIsProcessing(true)
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
    <div style={MODAL_STYLES.overlay(10000)}>
      <div style={{
        ...MODAL_STYLES.container('MEDIUM'),
        maxHeight: '80vh',
        animation: 'modalSlideDown 0.3s ease-out'
      }}>
        {/* Progress Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.4rem',
          marginBottom: '1.5rem'
        }}>
          {(['welcome', 'delegation', 'generation'] as OnboardingStep[]).map((step) => (
            <div
              key={step}
              style={{
                width: currentStep === step ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentStep === step
                  ? 'linear-gradient(90deg, #00d4ff, #0099cc)'
                  : 'rgba(255, 255, 255, 0.15)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'delegation' && renderDelegationStep()}
        {currentStep === 'generation' && renderGenerationStep()}

        {/* Skip All (steps 1-2 only) */}
        {currentStep !== 'generation' && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={handleSkipAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                transition: 'color 0.2s ease'
              }}
            >
              Skip setup
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(0, 212, 255, 0.1)',
          fontSize: '0.7rem',
          opacity: 0.4,
          textAlign: 'center'
        }}>
          🔒 MetaMask Smart Accounts • ERC‑7710 • Monad Testnet
        </div>
      </div>

      <style>{`
        @keyframes modalSlideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
