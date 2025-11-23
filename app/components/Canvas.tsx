"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WalletConnection } from "../../src/components/WalletConnection";
import { DelegationPanel } from "../../src/components/DelegationPanel";
import { MedicalNFTMinter } from "../../src/components/MedicalNFTMinter";
import { PostLoginOnboardingFlow } from "../../src/domains/web3/PostLoginOnboardingFlow";
import { useWeb3 } from "../../hooks/web3/useWeb3";

// ENHANCEMENT: MON Token Economy Components
import { MasterHUD } from "../../src/components/MasterHUD";
import { CaseSelectionHub } from "../../src/components/CaseSelectionHub";
import { TreatmentMenu } from "../../src/components/TreatmentMenu";
import { SmartAccountHUD } from "../../src/domains/web3/SmartAccountHUD";
import { StagedDiagnosticView } from "../../src/domains/diagnostic/stages/StagedDiagnosticView";

// ENHANCEMENT: Feature Discovery Components
import { TutorialSystem } from "../../src/components/TutorialSystem";
import { FeatureHighlightManager } from "../../src/components/FeatureHighlight";
import {
  ContextualPromptManager,
  DEFAULT_PROMPTS,
} from "../../src/components/ContextualPrompt";

import { CrisisEventDisplay } from "../../src/components/CrisisEventDisplay";
import { ExperienceDirector } from "../../src/domains/experience/ExperienceDirector";
import { VitalsMonitor } from "../../src/domains/medical/ui/VitalsMonitor";

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading X-RAI...");
  const initializingRef = useRef(false);
  const canvasInstanceRef = useRef<any>(null);
  const [diagnosisCompleted, setDiagnosisCompleted] = useState(false);
  const [lastDiagnosis, setLastDiagnosis] = useState<{
    conditions: string[];
    accuracy: number;
  } | null>(null);
  const [showDelegationPanel, setShowDelegationPanel] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );
  const hasShownOnboarding = useRef(false);

  const directorRef = useRef<ExperienceDirector | null>(null);

  // ENHANCEMENT: MON Token Economy State
  const [showCaseSelection, setShowCaseSelection] = useState(false);
  const [showTreatmentMenu, setShowTreatmentMenu] = useState(false);
  const [budgetState, setBudgetState] = useState({
    remaining: 0,
    spent: 0,
    startingAmount: 0,
    difficultyTier: "beginner" as
      | "beginner"
      | "intermediate"
      | "advanced"
      | "expert",
  });
  const [adminMessage, setAdminMessage] = useState<
    | {
      message: string;
      urgency: "normal" | "warning" | "critical";
    }
    | undefined
  >(undefined);
  const [executedActions, setExecutedActions] = useState<string[]>([]);

  // ENHANCEMENT: Game state for contextual prompts
  const [gameState, setGameState] = useState({
    timeRemaining: 300, // 5 minutes default
    budgetRemaining: 0,
    health: 100,
    evidenceCount: 0,
  });

  // Staged diagnostic interface state
  const [showStagedDiagnostic, setShowStagedDiagnostic] = useState(false);
  const [currentGamePhase, setCurrentGamePhase] = useState<any>(null);

  // Web3 integration
  const {
    isConnected,
    address: walletAddress,
    web3Facade,
    getMonBalance,
    isConnecting
  } = useWeb3();

  // State for MON balance
  const [monBalance, setMonBalance] = useState<string>("0.00");

  // ENHANCEMENT: Pause timer when wallet is connecting or delegation panel is open
  useEffect(() => {
    if (gameManagerRef.current) {
      if (isConnecting || showDelegationPanel) {
        gameManagerRef.current.pauseTimer();
      } else {
        gameManagerRef.current.resumeTimer();
      }
    }
  }, [isConnecting, showDelegationPanel]);

  // ENHANCEMENT FIRST: Get smart account address when wallet connects
  useEffect(() => {
    if (isConnected && walletAddress) {
      // Get smart account address from web3Facade
      const smartAccount = web3Facade?.getState().smartAccount;
      if (smartAccount?.address) {
        setSmartAccountAddress(smartAccount.address);
      }

      // Fetch MON balance when wallet is connected
      getMonBalance()
        .then((balance) => setMonBalance(balance.toFixed(4)))
        .catch(() => setMonBalance("0.00"));
    }
  }, [isConnected, walletAddress, web3Facade, getMonBalance]);

  // Effect to handle game phase changes and show staged interface
  useEffect(() => {
    const handleGamePhaseChanged = (event: CustomEvent) => {
      const { newPhase } = event.detail;
      setCurrentGamePhase(newPhase);
      directorRef.current?.setPhase(newPhase);

      // Show staged diagnostic interface for diagnostic phases
      const diagnosticPhases = [
        'patient_arrival',
        'investigation',
        'evidence_gathering',
        'diagnosis',
        'completed'
      ];

      if (diagnosticPhases.includes(newPhase)) {
        setShowStagedDiagnostic(true);
      }
    };

    const handleCaseSelected = (event: CustomEvent) => {
      // Show staged diagnostic interface when a case is selected
      setShowStagedDiagnostic(true);
      directorRef.current?.releaseOverlay("case_selection");
      directorRef.current?.setPhase("investigation");
    };

    // Add event listeners
    document.addEventListener('gamePhaseChanged', handleGamePhaseChanged as EventListener);
    document.addEventListener('caseSelected', handleCaseSelected as EventListener);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('gamePhaseChanged', handleGamePhaseChanged as EventListener);
      document.removeEventListener('caseSelected', handleCaseSelected as EventListener);
    };
  }, []);

  // ENHANCEMENT FIRST: Show onboarding on first wallet connect (once per session)
  useEffect(() => {
    if (!directorRef.current) {
      directorRef.current = new ExperienceDirector();
      directorRef.current.setPhase("intro");
    }
    if (
      isConnected &&
      walletAddress &&
      smartAccountAddress &&
      !hasShownOnboarding.current
    ) {
      const hasCompletedOnboarding = localStorage.getItem(
        "xrai_onboarding_completed"
      );
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
        hasShownOnboarding.current = true;
        directorRef.current?.requestOverlay("onboarding");
      }
    }
  }, [isConnected, walletAddress, smartAccountAddress]);

  // Listen for diagnosis completion events
  useEffect(() => {
    const handleDiagnosisComplete = (event: CustomEvent) => {
      setDiagnosisCompleted(true);
      directorRef.current?.requestOverlay("outcome");
      setLastDiagnosis({
        conditions: event.detail.conditions || [],
        accuracy: event.detail.accuracy || 0,
      });
    };

    const handleShowDelegationPanel = () => {
      setShowDelegationPanel(true);
    };

    // ENHANCEMENT: Economic system events
    const handleShowCaseSelection = () => {
      setShowCaseSelection(true);
      directorRef.current?.requestOverlay("case_selection");
    };

    const handleShowTreatmentMenu = () => {
      setShowTreatmentMenu(true);
      directorRef.current?.requestOverlay("treatment");
    };

    const handleShowTreatmentMenuWithState = (event: CustomEvent) => {
      // Update the patient state and diagnostic confidence if provided
      if (event.detail.patientState) {
        setPatientState(event.detail.patientState);
      }
      if (event.detail.diagnosticConfidence) {
        setDiagnosticConfidence(event.detail.diagnosticConfidence);
      }
      setShowTreatmentMenu(true);
    };

    const handleBudgetUpdate = (event: CustomEvent) => {
      setBudgetState(event.detail);
      // Update game state for contextual prompts
      setGameState((prev) => ({
        ...prev,
        budgetRemaining: event.detail.remaining,
      }));
    };

    const handleAdminMessage = (event: CustomEvent) => {
      setAdminMessage(event.detail);
    };

    const handleActionExecuted = (event: CustomEvent) => {
      setExecutedActions((prev) => [...prev, event.detail.actionId]);
      // Update evidence count for contextual prompts
      setGameState((prev) => ({
        ...prev,
        evidenceCount: prev.evidenceCount + 1,
      }));
    };

    const handleTimerUpdate = (event: CustomEvent) => {
      setGameState((prev) => ({
        ...prev,
        timeRemaining: event.detail.timeRemaining,
        health: event.detail.health,
      }));

      // ENHANCEMENT: Sync patient state for VitalsMonitor
      if (event.detail.patientState) {
        setPatientState(event.detail.patientState);
      }
    };

    window.addEventListener(
      "diagnosis-complete" as any,
      handleDiagnosisComplete
    );
    document.addEventListener("showDelegationPanel", handleShowDelegationPanel);
    document.addEventListener("showCaseSelection", handleShowCaseSelection);
    document.addEventListener("showTreatmentMenu", handleShowTreatmentMenu);
    document.addEventListener(
      "showTreatmentMenuWithState",
      handleShowTreatmentMenuWithState as any
    );
    document.addEventListener("budgetUpdated", handleBudgetUpdate as any);
    document.addEventListener(
      "administratorMessage",
      handleAdminMessage as any
    );
    document.addEventListener("actionExecuted", handleActionExecuted as any);
    document.addEventListener("timerUpdate", handleTimerUpdate as any);
    const handleRequestDelegated = () => {
      document.dispatchEvent(new CustomEvent("showDelegationPanel"));
    };
    document.addEventListener("requestDelegatedAction", handleRequestDelegated as EventListener);

    return () => {
      window.removeEventListener(
        "diagnosis-complete" as any,
        handleDiagnosisComplete
      );
      document.removeEventListener(
        "showDelegationPanel",
        handleShowDelegationPanel
      );
      document.removeEventListener(
        "showCaseSelection",
        handleShowCaseSelection
      );
      document.removeEventListener(
        "showTreatmentMenu",
        handleShowTreatmentMenu
      );
      document.removeEventListener(
        "showTreatmentMenuWithState",
        handleShowTreatmentMenuWithState as any
      );
      document.removeEventListener("budgetUpdated", handleBudgetUpdate as any);
      document.removeEventListener(
        "administratorMessage",
        handleAdminMessage as any
      );
      document.removeEventListener(
        "actionExecuted",
        handleActionExecuted as any
      );
      document.removeEventListener("timerUpdate", handleTimerUpdate as any);
      document.removeEventListener("requestDelegatedAction", handleRequestDelegated as EventListener);
    };
  }, []);

  // Add state for patient state and diagnostic confidence
  const [patientState, setPatientState] = useState<any>(null);
  const [diagnosticConfidence, setDiagnosticConfidence] = useState<any>(null);

  useEffect(() => {
    let disposed = false;

    if (
      canvasRef.current &&
      typeof window !== "undefined" &&
      !initializingRef.current
    ) {
      initializingRef.current = true;

      import("../../src/canvas")
        .then(({ XRayCanvas }) => {
          const CanvasClass = XRayCanvas as any;
          try {
            // Global singleton guard for dev HMR and double mounts
            if (
              typeof window !== "undefined" &&
              (window as any).__XRAI_CANVAS_ACTIVE__
            ) {
              console.warn(
                "⚠️ Canvas already active, skipping second initialization"
              );
              setIsLoaded(true);
              return;
            }

            console.log("🎮 Initializing Canvas...");
            setLoadingMessage("Loading 3D medical model...");

            if (!canvasInstanceRef.current) {
              canvasInstanceRef.current = new CanvasClass(canvasRef.current!);
              // Store reference to game manager if available
              if (canvasInstanceRef.current.gameManager) {
                gameManagerRef.current = canvasInstanceRef.current.gameManager;
              }
            }
            if (typeof window !== "undefined") {
              (window as any).__XRAI_CANVAS_ACTIVE__ = true;
            }
            console.log("✅ Canvas initialized successfully");

            // Show UI after canvas initialization
            setTimeout(() => {
              setLoadingMessage("🏥 Loading patient data...");
              setTimeout(() => {
                setIsLoaded(true);
              }, 1000);
            }, 1500);
          } catch (error) {
            console.error("❌ Canvas initialization failed:", error);
            initializingRef.current = false;
          }
        })
        .catch((error) => {
          console.error("❌ Failed to import Canvas:", error);
          initializingRef.current = false;
        });
    }

    return () => {
      // Cleanup on unmount to avoid duplicate WebGL contexts and listeners
      if (
        canvasInstanceRef.current &&
        typeof canvasInstanceRef.current.dispose === "function"
      ) {
        try {
          canvasInstanceRef.current.dispose();
        } catch { }
      }
      canvasInstanceRef.current = null;
      if (typeof window !== "undefined") {
        (window as any).__XRAI_CANVAS_ACTIVE__ = false;
      }
      initializingRef.current = false;
      disposed = true;
    };
  }, []);

  // ENHANCEMENT: Feature highlights configuration
  const featureHighlights = [
    {
      featureId: "investigation-panel",
      targetElement: "#investigation-panel",
      title: "Investigation Panel",
      description:
        "Use this panel to gather medical evidence through various diagnostic tools.",
      showOnce: true,
      position: "top" as const,
      delay: 2000,
    },
    {
      featureId: "treatment-menu",
      targetElement: '[data-tool-id="treatment"]',
      title: "Treatment Options",
      description:
        "Access treatment options with AI-powered outcome predictions.",
      showOnce: true,
      position: "bottom" as const,
      delay: 5000,
    },
    {
      featureId: "budget-hud",
      targetElement: ".master-hud",
      title: "Budget Monitor",
      description:
        "Keep track of your MON token budget. Each action costs resources.",
      showOnce: true,
      position: "right" as const,
      delay: 3000,
    },
  ];

  // ENHANCEMENT: Reference to GameManager for dynamic pricing
  const gameManagerRef = useRef<any>(null);

  // ENHANCEMENT: Crisis event state
  const [activeCrises, setActiveCrises] = useState<any[]>([]);

  // ENHANCEMENT: Handle crisis events
  useEffect(() => {
    const handleCrisisEvent = (event: CustomEvent) => {
      const crisis = event.detail;
      setActiveCrises((prev) => [...prev, crisis]);
      directorRef.current?.requestOverlay("crisis");
    };

    const handleCrisisResolved = (event: CustomEvent) => {
      const { eventId } = event.detail;
      setActiveCrises((prev) => prev.filter((crisis) => crisis.id !== eventId));
      if (activeCrises.length <= 1) directorRef.current?.releaseOverlay("crisis");
    };

    const handleCrisisIgnored = (event: CustomEvent) => {
      const { eventId } = event.detail;
      setActiveCrises((prev) => prev.filter((crisis) => crisis.id !== eventId));
      if (activeCrises.length <= 1) directorRef.current?.releaseOverlay("crisis");
    };

    // ENHANCEMENT: Handle narrative events
    const handleNarrativeEvent = (event: CustomEvent) => {
      // This could trigger specific UI responses based on narrative events
      console.log("Narrative event triggered:", event.detail);
    };

    // Add event listeners
    document.addEventListener(
      "crisisEventTriggered",
      handleCrisisEvent as EventListener
    );
    document.addEventListener(
      "crisisResolved",
      handleCrisisResolved as EventListener
    );
    document.addEventListener(
      "crisisIgnored",
      handleCrisisIgnored as EventListener
    );
    document.addEventListener(
      "narrativeEventTriggered",
      handleNarrativeEvent as EventListener
    );

    return () => {
      // Clean up event listeners
      document.removeEventListener(
        "crisisEventTriggered",
        handleCrisisEvent as EventListener
      );
      document.removeEventListener(
        "crisisResolved",
        handleCrisisResolved as EventListener
      );
      document.removeEventListener(
        "crisisIgnored",
        handleCrisisIgnored as EventListener
      );
      document.removeEventListener(
        "narrativeEventTriggered",
        handleNarrativeEvent as EventListener
      );
    };
  }, []);

  // ENHANCEMENT: Handle crisis response
  const handleCrisisResponse = (eventId: string) => {
    // In a real implementation, this would show treatment options
    // For now, we'll just simulate a successful response
    setTimeout(() => {
      // Emit event to resolve crisis
      document.dispatchEvent(
        new CustomEvent("crisisResolved", {
          detail: { eventId, success: true },
        })
      );

      // Remove from active crises
      setActiveCrises((prev) => prev.filter((crisis) => crisis.id !== eventId));
    }, 1000);
  };

  // ENHANCEMENT: Handle crisis dismiss
  const handleCrisisDismiss = (eventId: string) => {
    // Emit event to mark crisis as ignored
    document.dispatchEvent(
      new CustomEvent("crisisIgnored", {
        detail: { eventId },
      })
    );

    // Remove from active crises
    setActiveCrises((prev) => prev.filter((crisis) => crisis.id !== eventId));
  };

  // ENHANCEMENT: Handle crisis timeout
  const handleCrisisTimeout = (eventId: string) => {
    // Emit event to mark crisis as ignored due to timeout
    document.dispatchEvent(
      new CustomEvent("crisisIgnored", {
        detail: { eventId },
      })
    );

    // Remove from active crises
    setActiveCrises((prev) => prev.filter((crisis) => crisis.id !== eventId));
  };

  // Staged diagnostic interface handlers
  const handleGamePhaseChange = (newPhase: any) => {
    setCurrentGamePhase(newPhase);
    // Emit event to update game manager
    document.dispatchEvent(
      new CustomEvent("gamePhaseChanged", {
        detail: { newPhase },
      })
    );
  };

  const handleEvidenceCollected = (evidence: any) => {
    // Emit event to update game state
    document.dispatchEvent(
      new CustomEvent("evidenceCollected", {
        detail: { evidence },
      })
    );
  };

  const handleDiagnosisSubmitted = (diagnosis: any) => {
    // Emit event to submit diagnosis
    document.dispatchEvent(
      new CustomEvent("diagnosisSubmitted", {
        detail: { diagnosis },
      })
    );
  };

  const hasActiveOverlay = directorRef.current?.hasActiveOverlay() || false;

  return (
    <div>
      <canvas
        ref={canvasRef}
        id="webgl"
        style={{ display: isLoaded ? "block" : "none" }}
      />
      {!isLoaded && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "18px",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>🏥</div>
          <div>{loadingMessage}</div>
        </div>
      )}

      {isLoaded && (
        <>
          {/* ENHANCEMENT: Economic System UI - MasterHUD */}
          {/* Only show MasterHUD if Staged View is NOT active to prevent UI clutter */}
          {budgetState.startingAmount > 0 && !showStagedDiagnostic && (
            <MasterHUD
              budget={{
                remaining: budgetState.remaining,
                spent: budgetState.spent,
                startingAmount: budgetState.startingAmount,
                difficultyTier: budgetState.difficultyTier,
              }}
              administratorMessage={adminMessage}
              onRequestFunds={() => {
                // Trigger negotiation dialog
                document.dispatchEvent(
                  new CustomEvent("requestAdditionalFunds")
                );
              }}
              onContributeFunds={() => {
                // Trigger personal contribution dialog
                document.dispatchEvent(
                  new CustomEvent("contributePersonalFunds")
                );
              }}
              hasWallet={isConnected}
            />
          )}

          {/* ENHANCEMENT: Patient Vitals Monitor (Infirmary Integrated Style) */}
          {patientState && patientState.vitalSigns && (
            <div className="fixed top-20 right-4 z-40 w-80 pointer-events-none">
              <VitalsMonitor
                vitalSigns={patientState.vitalSigns}
                criticality={patientState.criticality || 'stable'}
              />
            </div>
          )}

          <CaseSelectionHub
            isVisible={showCaseSelection}
            hasWallet={isConnected}
            onConnectWallet={() => {
              // Trigger wallet connection
              const connectBtn = document.querySelector(
                "[data-wallet-connect]"
              );
              if (connectBtn instanceof HTMLElement) {
                connectBtn.click();
              }
            }}
            onSelectCase={(tier) => {
              setShowCaseSelection(false);
              // Dispatch event to GameManager to initialize budget
              document.dispatchEvent(
                new CustomEvent("caseSelected", {
                  detail: {
                    difficultyTier: tier.id,
                    startingBudget: tier.startingBudget,
                    maxEarnings: tier.maxEarnings,
                    timeLimit: tier.timeLimit,
                  },
                })
              );
            }}
          />

          <TreatmentMenu
            isOpen={showTreatmentMenu}
            onClose={() => {
              setShowTreatmentMenu(false)
              directorRef.current?.releaseOverlay("treatment")
            }}
            currentBudget={budgetState.remaining}
            executedActions={executedActions}
            patientState={patientState}
            diagnosticConfidence={diagnosticConfidence}
            onSelectAction={(action) => {
              // Dispatch event to GameManager to execute action
              document.dispatchEvent(
                new CustomEvent("executeAction", {
                  detail: { action },
                })
              );
              setShowTreatmentMenu(false);
            }}
            // ENHANCEMENT: Pass dynamic pricing functions
            getDynamicPrice={
              gameManagerRef.current
                ? (action: any) =>
                  gameManagerRef.current.getDynamicPrice(action)
                : undefined
            }
            getPricingExplanation={
              gameManagerRef.current
                ? (action: any) =>
                  gameManagerRef.current.getPricingExplanation(action)
                : undefined
            }
          />

          <WalletConnection
            onConnected={() => { }} // Handled by useWeb3 hook internally
          />

          {/* ENHANCEMENT FIRST: Smart Account HUD showing persistent status and balance */}
          <SmartAccountHUD
            smartAccountAddress={smartAccountAddress || undefined}
            walletAddress={walletAddress || undefined}
            monBalance={monBalance}
            activeDelegations={0} // TODO: Implement delegation count
            onManagePermissions={() => {
              // Trigger delegation panel to open
              document.dispatchEvent(new CustomEvent("showDelegationPanel"));
            }}
            onViewActivity={() => {
              // TODO: Implement activity view
              console.log("Viewing activity...");
            }}
          />

          {/* ENHANCEMENT FIRST: Post-Login Onboarding with AI case choice */}
          {showOnboarding && smartAccountAddress && walletAddress && (
            <PostLoginOnboardingFlow
              smartAccountAddress={smartAccountAddress}
              walletAddress={walletAddress}
              onComplete={(config) => {
                setShowOnboarding(false);
                localStorage.setItem("xrai_onboarding_completed", "true");
                directorRef.current?.releaseOverlay("onboarding");
                directorRef.current?.setPhase("case_selection");

                // Dispatch event with user's choice
                document.dispatchEvent(
                  new CustomEvent("onboardingComplete", {
                    detail: {
                      generateAICase: config.generateAICase,
                      delegationsEnabled: config.delegationsEnabled,
                      chargeTestnetMON: config.chargeTestnetMON,
                    },
                  })
                );

                setShowCaseSelection(true);
              }}
              onSkip={() => {
                setShowOnboarding(false);
                localStorage.setItem("xrai_onboarding_completed", "true");
                directorRef.current?.releaseOverlay("onboarding");
              }}
            />
          )}

          <DelegationPanel
            walletAddress={walletAddress || null}
            isConnected={isConnected}
            gaslessEnabled={true} // Since we know the smart account is active as shown in SmartAccountHUD
            defaultDelegateAddress={
              process.env.NEXT_PUBLIC_AI_DELEGATE_ADDRESS || undefined
            }
            isVisible={showDelegationPanel}
            onClose={() => setShowDelegationPanel(false)}
          />
          {diagnosisCompleted && (
            <MedicalNFTMinter
              walletAddress={walletAddress || null}
              lastDiagnosis={lastDiagnosis}
            />
          )}

          {/* ENHANCEMENT: Feature Discovery System */}
          {!hasActiveOverlay && (
            <>
              {directorRef.current?.allowGuidance("tutorial") && (
                <TutorialSystem
                  currentMilestone={{
                    type: "time",
                    value: Math.floor((300 - gameState.timeRemaining) / 60),
                  }}
                  onComplete={(stepId) => {
                    console.log(`Tutorial step completed: ${stepId}`);
                  }}
                  onSkip={() => {
                    console.log("Tutorial skipped");
                  }}
                />
              )}

              {directorRef.current?.allowGuidance("highlight") && (
                <FeatureHighlightManager highlights={featureHighlights} />
              )}

              {directorRef.current?.allowGuidance("prompt") && (
                <ContextualPromptManager
                  prompts={DEFAULT_PROMPTS}
                  gameState={gameState}
                />
              )}
            </>
          )}

          {/* ENHANCEMENT: Crisis Event Display */}
          <CrisisEventDisplay
            activeCrises={activeCrises}
            onRespond={handleCrisisResponse}
            onDismiss={handleCrisisDismiss}
            onTimeout={handleCrisisTimeout}
          />

          {/* Staged Diagnostic Interface */}
          {showStagedDiagnostic && currentGamePhase && canvasInstanceRef.current && (
            <StagedDiagnosticView
              gameManager={canvasInstanceRef.current.getGameManager()}
              diagnosticUIManager={canvasInstanceRef.current.getDiagnosticUIManager()}
              currentGamePhase={currentGamePhase}
              onGamePhaseChange={handleGamePhaseChange}
              patientCase={patientState}
              budget={{
                remaining: budgetState.remaining,
                spent: budgetState.spent,
                startingAmount: budgetState.startingAmount,
              }}
              timeRemaining={gameState.timeRemaining}
              onEvidenceCollected={handleEvidenceCollected}
              onDiagnosisSubmitted={handleDiagnosisSubmitted}
              nurseAmyNudges={canvasInstanceRef.current.nurseAmyNudges}
            />
          )}
        </>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Canvas), {
  ssr: false,
});
