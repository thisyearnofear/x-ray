'use client'

/**
 * Smart Account Showcase Component
 * ENHANCEMENT FIRST: Highlights MetaMask Smart Accounts features for hackathon demo
 * CLEAN: Simple explanations without technical jargon
 * MODULAR: Reusable showcase for different demo scenarios
 */

import React, { useState, useEffect } from 'react'

interface ShowcaseStep {
  id: string
  title: string
  description: string
  icon: string
  demoAction: string
  benefit: string
  technical: string
}

interface SmartAccountShowcaseProps {
  onDemoComplete: () => void
  autoPlay?: boolean
}

export const SmartAccountShowcase: React.FC<SmartAccountShowcaseProps> = ({
  onDemoComplete,
  autoPlay = false
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // CLEAN: Hackathon-focused showcase steps
  const showcaseSteps: ShowcaseStep[] = [
    {
      id: 'gasless_consultations',
      title: 'Gasless AI Medical Consultations',
      description: 'Get medical advice without paying transaction fees',
      icon: '🤖',
      demoAction: 'Request AI consultation → No gas fees charged',
      benefit: 'Free medical consultations for everyone',
      technical: 'ERC-4337 Account Abstraction with paymaster sponsorship'
    },
    {
      id: 'smart_permissions',
      title: 'Advanced Permission Sharing',
      description: 'Grant AI assistants specific medical consultation permissions',
      icon: '🔐',
      demoAction: 'Set AI permissions → Secure, granular control',
      benefit: 'Safe AI access with user control',
      technical: 'ERC-7710 Delegation for programmable permissions'
    },
    {
      id: 'seamless_onboarding',
      title: 'Frictionless Medical Onboarding',
      description: 'Start using medical AI without Web3 complexity',
      icon: '🏥',
      demoAction: 'One-click setup → Immediate medical access',
      benefit: 'No crypto knowledge required',
      technical: 'Smart Account abstraction hides blockchain complexity'
    },
    {
      id: 'instant_achievements',
      title: 'Instant Medical Certificates',
      description: 'Earn verified achievements with fast finality',
      icon: '🏆',
      demoAction: 'Complete case → Certificate minted instantly',
      benefit: 'Build verified medical portfolio',
      technical: 'Monad 800ms finality for instant confirmations'
    }
  ]

  useEffect(() => {
    if (isPlaying && currentStep < showcaseSteps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, currentStep]))
        if (currentStep < showcaseSteps.length - 1) {
          setCurrentStep(currentStep + 1)
        } else {
          setIsPlaying(false)
          onDemoComplete()
        }
      }, 4000) // 4 seconds per step

      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, showcaseSteps.length, onDemoComplete])

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const currentStepData = showcaseSteps[currentStep]

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
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid #00d4ff',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '800px',
        width: '90%',
        color: 'white',
        fontFamily: 'Segoe UI, sans-serif',
        boxShadow: '0 20px 40px rgba(0, 212, 255, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦊</div>
          <h1 style={{ 
            margin: '0 0 0.5rem 0', 
            color: '#00d4ff', 
            fontSize: '2rem' 
          }}>
            MetaMask Smart Accounts Demo
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '1.1rem', 
            opacity: 0.8 
          }}>
            Next-generation medical Web3 experience powered by account abstraction
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {showcaseSteps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(index)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: index === currentStep 
                  ? 'linear-gradient(45deg, #00d4ff, #0099cc)'
                  : completedSteps.has(index)
                  ? 'rgba(0, 255, 0, 0.2)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${
                  index === currentStep 
                    ? '#00d4ff'
                    : completedSteps.has(index)
                    ? '#00ff00'
                    : 'rgba(255, 255, 255, 0.3)'
                }`,
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              {step.icon} {step.title}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
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
            margin: '0 0 1.5rem 0', 
            fontSize: '1.1rem', 
            lineHeight: '1.5' 
          }}>
            {currentStepData.description}
          </p>

          {/* Demo Action */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: 'bold', 
              color: '#00ff00',
              marginBottom: '0.5rem'
            }}>
              🎬 Demo Action:
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              {currentStepData.demoAction}
            </div>
          </div>

          {/* User Benefit */}
          <div style={{
            background: 'rgba(0, 255, 0, 0.1)',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: 'bold', 
              color: '#00ff00',
              marginBottom: '0.5rem'
            }}>
              ✨ User Benefit:
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              {currentStepData.benefit}
            </div>
          </div>

          {/* Technical Implementation */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            padding: '1rem'
          }}>
            <div style={{ 
              fontSize: '0.8rem', 
              fontWeight: 'bold', 
              color: '#ffa500',
              marginBottom: '0.5rem'
            }}>
              🔧 Technical Implementation:
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              {currentStepData.technical}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              opacity: currentStep === 0 ? 0.5 : 1
            }}
          >
            ← Previous
          </button>

          <button
            onClick={handlePlayPause}
            style={{
              background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
            }}
          >
            {isPlaying ? '⏸️ Pause Demo' : '▶️ Play Demo'}
          </button>

          <button
            onClick={() => setCurrentStep(Math.min(showcaseSteps.length - 1, currentStep + 1))}
            disabled={currentStep === showcaseSteps.length - 1}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              cursor: currentStep === showcaseSteps.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              opacity: currentStep === showcaseSteps.length - 1 ? 0.5 : 1
            }}
          >
            Next →
          </button>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          opacity: 0.6
        }}>
          MetaMask Smart Accounts Hackathon • Monad Testnet • Envio Analytics
        </div>
      </div>
    </div>
  )
}