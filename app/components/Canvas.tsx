'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { WalletConnection } from '../../src/components/WalletConnection';
import { DelegationPanel } from '../../src/components/DelegationPanel';
import { MedicalNFTMinter } from '../../src/components/MedicalNFTMinter';
import { SmartAccountOnboarding } from '../../src/domains/web3/SmartAccountOnboarding';
import { useWeb3 } from '../../hooks/web3/useWeb3';

const CanvasComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading X-RAI...');
  const initializingRef = useRef(false);
  const canvasInstanceRef = useRef<any>(null);
  const [diagnosisCompleted, setDiagnosisCompleted] = useState(false);
  const [lastDiagnosis, setLastDiagnosis] = useState<{conditions: string[], accuracy: number} | null>(null);
  const [showDelegationPanel, setShowDelegationPanel] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const hasShownOnboarding = useRef(false);

  // Web3 integration
  const { isConnected, address: walletAddress } = useWeb3();

  // ENHANCEMENT FIRST: Show onboarding on first wallet connect (once per session)
  useEffect(() => {
    if (isConnected && walletAddress && !hasShownOnboarding.current) {
      const hasCompletedOnboarding = localStorage.getItem('xrai_onboarding_completed')
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true)
        hasShownOnboarding.current = true
      }
    }
  }, [isConnected, walletAddress])

  // Listen for diagnosis completion events
  useEffect(() => {
    const handleDiagnosisComplete = (event: CustomEvent) => {
      setDiagnosisCompleted(true);
      setLastDiagnosis({
        conditions: event.detail.conditions || [],
        accuracy: event.detail.accuracy || 0
      });
    };

    const handleShowDelegationPanel = () => {
      setShowDelegationPanel(true);
    };

    window.addEventListener('diagnosis-complete' as any, handleDiagnosisComplete);
    document.addEventListener('showDelegationPanel', handleShowDelegationPanel);
    
    return () => {
      window.removeEventListener('diagnosis-complete' as any, handleDiagnosisComplete);
      document.removeEventListener('showDelegationPanel', handleShowDelegationPanel);
    };
  }, []);

  useEffect(() => {
    let disposed = false;

    if (canvasRef.current && typeof window !== 'undefined' && !initializingRef.current) {
      initializingRef.current = true;

      import('../../src/canvas').then(({ default: Canvas }) => {
        try {
          // Global singleton guard for dev HMR and double mounts
          if (typeof window !== 'undefined' && (window as any).__XRAI_CANVAS_ACTIVE__) {
            console.warn('⚠️ Canvas already active, skipping second initialization');
            setIsLoaded(true);
            return;
          }

          console.log('🎮 Initializing Canvas...');
          setLoadingMessage('Loading 3D medical model...');
          
          if (!canvasInstanceRef.current) {
            canvasInstanceRef.current = new Canvas(canvasRef.current!);
          }
          if (typeof window !== 'undefined') {
            (window as any).__XRAI_CANVAS_ACTIVE__ = true;
          }
          console.log('✅ Canvas initialized successfully');
          
          // Show UI after canvas initialization
          setTimeout(() => {
            setLoadingMessage('🏥 Loading patient data...');
            setTimeout(() => {
              setIsLoaded(true);
            }, 1000);
          }, 1500);
        } catch (error) {
          console.error('❌ Canvas initialization failed:', error);
          initializingRef.current = false;
        }
      }).catch(error => {
        console.error('❌ Failed to import Canvas:', error);
        initializingRef.current = false;
      });
    }

    return () => {
      // Cleanup on unmount to avoid duplicate WebGL contexts and listeners
      if (canvasInstanceRef.current && typeof canvasInstanceRef.current.dispose === 'function') {
        try { canvasInstanceRef.current.dispose(); } catch {}
      }
      canvasInstanceRef.current = null;
      if (typeof window !== 'undefined') {
        (window as any).__XRAI_CANVAS_ACTIVE__ = false;
      }
      initializingRef.current = false;
      disposed = true;
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="webgl" style={{ display: isLoaded ? 'block' : 'none' }} />
      {!isLoaded && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem' }}>🏥</div>
          <div>{loadingMessage}</div>
        </div>
      )}

      {isLoaded && (
        <>
          <WalletConnection
            onConnected={() => {}} // Handled by useWeb3 hook internally
          />
          
          {/* ENHANCEMENT FIRST: Smart Account Onboarding on first connect */}
          {showOnboarding && (
            <SmartAccountOnboarding
              onComplete={() => {
                setShowOnboarding(false)
                localStorage.setItem('xrai_onboarding_completed', 'true')
                // Trigger wallet connection and show delegation panel
                setTimeout(() => setShowDelegationPanel(true), 500)
              }}
              onSkip={() => {
                setShowOnboarding(false)
                localStorage.setItem('xrai_onboarding_completed', 'true')
              }}
            />
          )}
          
          <DelegationPanel
            walletAddress={walletAddress || null}
            isVisible={showDelegationPanel}
            onClose={() => setShowDelegationPanel(false)}
          />
          {diagnosisCompleted && (
            <MedicalNFTMinter
              walletAddress={walletAddress || null}
              lastDiagnosis={lastDiagnosis}
            />
          )}
        </>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(CanvasComponent), {
  ssr: false,
});
