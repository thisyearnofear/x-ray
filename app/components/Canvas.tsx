'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { WalletConnection } from '../../src/components/WalletConnection';
import { DelegationPanel } from '../../src/components/DelegationPanel';
import { MedicalNFTMinter } from '../../src/components/MedicalNFTMinter';
import { PostLoginOnboardingFlow } from '../../src/domains/web3/PostLoginOnboardingFlow';
import { useWeb3 } from '../../hooks/web3/useWeb3';

// ENHANCEMENT: MON Token Economy Components
import { BudgetHUD } from '../../src/components/BudgetHUD';
import { CaseSelectionHub } from '../../src/components/CaseSelectionHub';
import { TreatmentMenu } from '../../src/components/TreatmentMenu';
import { SmartAccountHUD } from '../../src/domains/web3/SmartAccountHUD';

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
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const hasShownOnboarding = useRef(false);

  // ENHANCEMENT: MON Token Economy State
  const [showCaseSelection, setShowCaseSelection] = useState(false);
  const [showTreatmentMenu, setShowTreatmentMenu] = useState(false);
  const [budgetState, setBudgetState] = useState({
    remaining: 0,
    spent: 0,
    startingAmount: 0,
    difficultyTier: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert'
  });
  const [adminMessage, setAdminMessage] = useState<{
    message: string;
    urgency: 'normal' | 'warning' | 'critical';
  } | undefined>(undefined);
  const [executedActions, setExecutedActions] = useState<string[]>([]);

  // Web3 integration
  const { isConnected, address: walletAddress, web3Facade, getMonBalance } = useWeb3();
  
  // State for MON balance
  const [monBalance, setMonBalance] = useState<string>('0.00');

  // ENHANCEMENT FIRST: Get smart account address when wallet connects
  useEffect(() => {
    if (isConnected && walletAddress) {
      // Get smart account address from web3Facade
      const smartAccount = web3Facade?.getState().smartAccount
      if (smartAccount?.address) {
        setSmartAccountAddress(smartAccount.address)
      }
      
      // Fetch MON balance when wallet is connected
      getMonBalance()
        .then(balance => setMonBalance(balance.toFixed(4)))
        .catch(() => setMonBalance('0.00'))
    }
  }, [isConnected, walletAddress, web3Facade, getMonBalance])

  // ENHANCEMENT FIRST: Show onboarding on first wallet connect (once per session)
  useEffect(() => {
    if (isConnected && walletAddress && smartAccountAddress && !hasShownOnboarding.current) {
      const hasCompletedOnboarding = localStorage.getItem('xrai_onboarding_completed')
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true)
        hasShownOnboarding.current = true
      }
    }
  }, [isConnected, walletAddress, smartAccountAddress])

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

    // ENHANCEMENT: Economic system events
    const handleShowCaseSelection = () => {
      setShowCaseSelection(true);
    };

    const handleShowTreatmentMenu = () => {
      setShowTreatmentMenu(true);
    };

    const handleBudgetUpdate = (event: CustomEvent) => {
      setBudgetState(event.detail);
    };

    const handleAdminMessage = (event: CustomEvent) => {
      setAdminMessage(event.detail);
    };

    const handleActionExecuted = (event: CustomEvent) => {
      setExecutedActions(prev => [...prev, event.detail.actionId]);
    };

    window.addEventListener('diagnosis-complete' as any, handleDiagnosisComplete);
    document.addEventListener('showDelegationPanel', handleShowDelegationPanel);
    document.addEventListener('showCaseSelection', handleShowCaseSelection);
    document.addEventListener('showTreatmentMenu', handleShowTreatmentMenu);
    document.addEventListener('budgetUpdated', handleBudgetUpdate as any);
    document.addEventListener('administratorMessage', handleAdminMessage as any);
    document.addEventListener('actionExecuted', handleActionExecuted as any);
    
    return () => {
      window.removeEventListener('diagnosis-complete' as any, handleDiagnosisComplete);
      document.removeEventListener('showDelegationPanel', handleShowDelegationPanel);
      document.removeEventListener('showCaseSelection', handleShowCaseSelection);
      document.removeEventListener('showTreatmentMenu', handleShowTreatmentMenu);
      document.removeEventListener('budgetUpdated', handleBudgetUpdate as any);
      document.removeEventListener('administratorMessage', handleAdminMessage as any);
      document.removeEventListener('actionExecuted', handleActionExecuted as any);
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
          {/* ENHANCEMENT: Economic System UI */}
          {budgetState.startingAmount > 0 && (
            <BudgetHUD
              remaining={budgetState.remaining}
              spent={budgetState.spent}
              startingAmount={budgetState.startingAmount}
              difficultyTier={budgetState.difficultyTier}
              administratorMessage={adminMessage}
              onRequestFunds={() => {
                // Trigger negotiation dialog
                document.dispatchEvent(new CustomEvent('requestAdditionalFunds'));
              }}
              onContributeFunds={() => {
                // Trigger personal contribution dialog
                document.dispatchEvent(new CustomEvent('contributePersonalFunds'));
              }}
              hasWallet={isConnected}
            />
          )}

          <CaseSelectionHub
            isVisible={showCaseSelection}
            hasWallet={isConnected}
            onConnectWallet={() => {
              // Trigger wallet connection
              const connectBtn = document.querySelector('[data-wallet-connect]');
              if (connectBtn instanceof HTMLElement) {
                connectBtn.click();
              }
            }}
            onSelectCase={(tier) => {
              setShowCaseSelection(false);
              // Dispatch event to GameManager to initialize budget
              document.dispatchEvent(new CustomEvent('caseSelected', {
                detail: {
                  difficultyTier: tier.id,
                  startingBudget: tier.startingBudget,
                  maxEarnings: tier.maxEarnings,
                  timeLimit: tier.timeLimit
                }
              }));
            }}
          />

          <TreatmentMenu
            isOpen={showTreatmentMenu}
            onClose={() => setShowTreatmentMenu(false)}
            currentBudget={budgetState.remaining}
            executedActions={executedActions}
            onSelectAction={(action) => {
              // Dispatch event to GameManager to execute action
              document.dispatchEvent(new CustomEvent('executeAction', {
                detail: { action }
              }));
              setShowTreatmentMenu(false);
            }}
          />

          <WalletConnection
            onConnected={() => {}} // Handled by useWeb3 hook internally
          />
          
          {/* ENHANCEMENT FIRST: Smart Account HUD showing persistent status and balance */}
          <SmartAccountHUD 
            smartAccountAddress={smartAccountAddress || undefined}
            walletAddress={walletAddress || undefined}
            monBalance={monBalance}
            activeDelegations={0} // TODO: Implement delegation count
            onManagePermissions={() => {
              // Trigger delegation panel to open
              document.dispatchEvent(new CustomEvent('showDelegationPanel'));
            }}
            onViewActivity={() => {
              // TODO: Implement activity view
              console.log('Viewing activity...');
            }}
          />
          
          {/* ENHANCEMENT FIRST: Post-Login Onboarding with AI case choice */}
          {showOnboarding && smartAccountAddress && walletAddress && (
            <PostLoginOnboardingFlow
              smartAccountAddress={smartAccountAddress}
              walletAddress={walletAddress}
              onComplete={(config) => {
                setShowOnboarding(false)
                localStorage.setItem('xrai_onboarding_completed', 'true')
                
                // Dispatch event with user's choice
                document.dispatchEvent(new CustomEvent('onboardingComplete', {
                  detail: {
                    generateAICase: config.generateAICase,
                    delegationsEnabled: config.delegationsEnabled,
                    chargeTestnetMON: config.chargeTestnetMON
                  }
                }))
              }}
              onSkip={() => {
                setShowOnboarding(false)
                localStorage.setItem('xrai_onboarding_completed', 'true')
              }}
            />
          )}
          
          <DelegationPanel
            walletAddress={walletAddress || null}
            isConnected={isConnected}
            gaslessEnabled={true} // Since we know the smart account is active as shown in SmartAccountHUD
            defaultDelegateAddress={process.env.NEXT_PUBLIC_AI_DELEGATE_ADDRESS || undefined}
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
