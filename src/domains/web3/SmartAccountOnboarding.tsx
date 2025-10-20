'use client'

/**
 * Smart Account Onboarding Component
 * ENHANCEMENT FIRST: Leverages existing WalletConnection patterns
 * CLEAN: Simple UX without technical jargon
 * MODULAR: Reusable onboarding flow for MetaMask Smart Accounts
 */

import React, { useState } from 'react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: string
  benefit: string
}

interface SmartAccountOnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

export const SmartAccountOnboarding: React.FC<SmartAccountOnboardingProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)

  // CLEAN: Simple, benefit-focused steps without technical jargon
  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Smart Medical Accounts',
      description: 'Get free AI medical consultations without any transaction fees',
      icon: '🏥',
      benefit: 'No fees for medical advice'
    },
    {
      id: 'gasless',
      title: 'Free AI Consultations',
      description: 'Ask our AI medical assistant questions without paying gas fees',
      icon: '🤖',
      benefit: 'Unlimited free consultations'
    },
    {
      id: 'permissions',
      title: 'Smart Permissions',
      description: 'Grant AI assistants permission to help with your medical cases',
      icon: '🔐',
      benefit: 'Secure, controlled access'
    },
    {
      id: 'achievements',
      title: 'Earn Medical Certificates',
      description: 'Complete cases and earn verified medical achievement certificates',
      icon: '🏆',
      benefit: 'Build your medical portfolio'
    }
  ]

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleConnect()
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    // Trigger wallet connection through existing system
    setTimeout(() => {
      onComplete()
    }, 2000) // Simulate connection time
  }

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
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
        boxShadow: '0 20px 40px rgba(0, 212, 255, 0.3)',
        textAlign: 'center'
      }}>
        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          gap: '0.5rem'
        }}>
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: index <= currentStep ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Step Content */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {currentStepData.icon}
          </div>
          
          <h2 style={{
            margin: '0 0 1rem 0',
            color: '#00d4ff',
            fontSize: '1.5rem'
          }}>
            {currentStepData.title}
          </h2>
          
          <p style={{
            margin: '0 0 1rem 0',
            fontSize: '1rem',
            lineHeight: '1.5',
            opacity: 0.9
          }}>
            {currentStepData.description}
          </p>

          {/* Benefit Highlight */}
          <div style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: '#00d4ff'
            }}>
              ✨ {currentStepData.benefit}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={onSkip}
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
          >
            Skip Setup
          </button>
          
          <button
            onClick={handleNext}
            disabled={isConnecting}
            style={{
              background: isConnecting 
                ? 'rgba(0, 212, 255, 0.5)' 
                : 'linear-gradient(45deg, #00d4ff, #0099cc)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '10px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: isConnecting ? 'none' : '0 4px 15px rgba(0, 212, 255, 0.3)'
            }}
          >
            {isConnecting ? (
              '🔄 Setting up your account...'
            ) : isLastStep ? (
              '🚀 Set Up Smart Account'
            ) : (
              'Next'
            )}
          </button>
        </div>

        {/* Footer */}
        {isLastStep && (
          <div style={{
            marginTop: '1rem',
            fontSize: '0.75rem',
            opacity: 0.6
          }}>
            Secure • Free • No technical knowledge required
          </div>
        )}
      </div>
    </div>
  )
}