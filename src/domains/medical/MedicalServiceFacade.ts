import { MedicalDataService } from './services/MedicalDataService';
import { AIAnalysisService } from './services/AIAnalysisService';
import { MedicalCase } from './types';
import { CaseAccessManager } from './CaseAccessManager';
import { AIGeneratedCaseValidator } from './services/AIGeneratedCaseValidator';
import { CaseSessionManager } from './services/CaseSessionManager';
import { CaseCacheManager } from './services/CaseCacheManager';

export class MedicalServiceFacade {
  private medicalDataService: MedicalDataService;
  private aiAnalysisService: AIAnalysisService;
  private accessManager: CaseAccessManager;

  // ENHANCED: Onchain features
  private smartAccount: any = null;
  private delegationEnabled: boolean = false;

  constructor() {
    this.medicalDataService = new MedicalDataService();
    this.aiAnalysisService = new AIAnalysisService();
    this.accessManager = CaseAccessManager.getInstance();
  }

  // ENHANCED: Configure onchain features
  public configureOnchainFeatures(smartAccount: any, delegationEnabled: boolean = false) {
    this.smartAccount = smartAccount;
    this.delegationEnabled = delegationEnabled;
  }

  // ENHANCED: Tier-aware case access
  public getCase(caseId: string): MedicalCase | undefined {
    // For static cases (like case-x487), always allow access - they're free and unlimited
    if (caseId === 'case-x487') {
      // No access check or usage recording for static cases
      return this.medicalDataService.getCase(caseId);
    }

    // For other cases, check access normally
    if (!this.accessManager.canAccessCaseType('ai_generated')) {
      throw new Error('AI case access requires premium access. Please connect your wallet and upgrade.');
    }

    // Record usage for AI-generated cases
    this.accessManager.recordCaseUsage('ai_generated');
    return this.medicalDataService.getCase(caseId);
  }

  public getAllCases(): MedicalCase[] {
    return this.medicalDataService.getAllCases();
  }

  // ENHANCED: Onchain AI analysis
  public async analyzeCondition(conditionId: string, patientContext?: any) {
    const condition = this.medicalDataService.getCondition(conditionId);
    if (!condition) {
      throw new Error(`Condition ${conditionId} not found`);
    }

    return await this.aiAnalysisService.analyzeCondition({
      condition,
      patientContext,
      analysisType: 'condition',
      smartAccount: this.smartAccount,
      delegationRequired: this.delegationEnabled,
      trackPerformance: true
    });
  }

  // ENHANCED: Check delegation status
  public isDelegationEnabled(): boolean {
    return this.delegationEnabled && !!this.smartAccount;
  }

  // ENHANCED: AI-powered case generation for premium users with session persistence
  public async generateAICase(difficulty: 'easy' | 'medium' | 'hard' = 'medium', model: string = 'head'): Promise<MedicalCase> {
    // ENHANCEMENT FIRST: Check for existing session first
    const existingSession = CaseSessionManager.retrieveCase();
    if (existingSession && existingSession.case.difficulty === difficulty) {
      console.log('📦 Resuming existing case session:', existingSession.case.id);
      return existingSession.case;
    }

    // PERFORMANT: Check cache before generating new case
    const cachedCase = CaseCacheManager.getCachedCase(difficulty, model);
    if (cachedCase) {
      console.log('⚡ Using cached case (instant load)');
      // Persist to session for consistency
      CaseSessionManager.persistCase(cachedCase, this.getCurrentGameState());
      return cachedCase;
    }

    // Check premium access
    if (!this.accessManager.canAccessCaseType('ai_generated')) {
      throw new Error('AI case generation requires premium access. Please connect your wallet and upgrade.');
    }

    // Record usage
    this.accessManager.recordCaseUsage('ai_generated');

    try {
      // PERFORMANT: Generate deterministic seed for reproducibility
      const seed = this.generateSeed(difficulty);

      const response = await fetch('/api/generate-patient-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model, // Use provided model parameter
          difficulty,
          smartAccount: this.smartAccount?.address,
          delegationEnabled: this.delegationEnabled,
          userPreferences: this.getUserPreferences(),
          sessionSeed: seed // PERFORMANT: Deterministic generation
        })
      });

      if (!response.ok) {
        throw new Error(`AI case generation failed: ${response.statusText}`);
      }

      const aiCase = await response.json();

      // MODULAR: Validate AI-generated case before accepting
      const validationResult = AIGeneratedCaseValidator.validateFully(aiCase);

      // Log validation results
      if (validationResult.warnings.length > 0 || !validationResult.isValid) {
        console.warn(AIGeneratedCaseValidator.getValidationReport(validationResult));
      } else {
        console.log(`✅ AI case validated successfully (score: ${validationResult.score}/100)`);
      }

      // If validation fails, throw error to trigger fallback
      if (!validationResult.isValid) {
        throw new Error(`AI case validation failed (score: ${validationResult.score}/100). Using fallback case.`);
      }

      // Enhance with access-aware features
      const enhancedCase: MedicalCase = {
        ...aiCase,
        id: `ai_case_${Date.now()}`,
        isAIGenerated: true,
        generatedAt: Date.now(),
        difficulty,
        smartAccountAddress: this.smartAccount?.address,
        // ENHANCEMENT FIRST: Add unique identifiers for tracking
        caseGenerationContext: {
          originalDifficulty: difficulty,
          generationTimestamp: Date.now(),
          generatedByAI: true,
          userWallet: this.smartAccount?.address,
          validationScore: validationResult.score
        }
      };

      // PERFORMANT: Cache validated case for future use
      CaseCacheManager.cacheValidatedCase(
        enhancedCase,
        difficulty,
        model,
        validationResult.score
      );

      // PERFORMANT: Persist to session storage for consistency
      CaseSessionManager.persistCase(enhancedCase, this.getCurrentGameState(), seed);

      return enhancedCase;
    } catch (error) {
      console.error('AI case generation failed - falling back to static case:', error);
      // Fallback to static case
      const staticCase = this.getCase('case-x487');
      if (!staticCase) {
        throw new Error('No fallback case available. Please try again later.');
      }

      // Log fallback details but keep title clean for user
      console.warn('Using fallback case:', {
        originalDifficulty: difficulty,
        generationFailed: true,
        userWallet: this.smartAccount?.address
      });

      // Return static case with clean title
      return {
        ...staticCase,
        id: staticCase.id, // Keep original ID for static case
        caseGenerationContext: {
          originalDifficulty: difficulty,
          generationTimestamp: Date.now(),
          generatedByAI: false,
          generationFailed: true,
          fallbackUsed: true,
          userWallet: this.smartAccount?.address
        }
      };
    }
  }

  // ENHANCED: Get appropriate case based on user tier with better error handling
  public async getRecommendedCase(): Promise<MedicalCase> {
    try {
      const userStatus = this.accessManager.getUserStatus();

      if (userStatus.currentTier === 'premium' && userStatus.canAccessAICases) {
        // Generate AI case for premium users with their preferred difficulty
        try {
          const difficulty = userStatus.preferredDifficulty || 'medium';
          const aiCase = await this.generateAICase(difficulty);
          console.log('🏥 Generated premium AI-powered case for authenticated user', {
            difficulty,
            userWallet: this.smartAccount?.address
          });
          return aiCase;
        } catch (aiError) {
          console.warn('AI case generation failed for premium user - falling back to static case:', aiError);
          // Even for premium users, fallback to static case if AI generation fails
          const staticCase = this.getCase('case-x487');
          if (!staticCase) {
            throw new Error('No fallback case available');
          }

          // Log fallback context for debugging
          console.warn('Premium user fallback context:', {
            originalDifficulty: userStatus.preferredDifficulty || 'medium',
            generationFailed: true,
            userWallet: this.smartAccount?.address
          });

          return {
            ...staticCase,
            id: staticCase.id, // Keep original static case ID
            isAIGenerated: false,
            caseGenerationContext: {
              originalDifficulty: userStatus.preferredDifficulty || 'medium',
              generationTimestamp: Date.now(),
              generatedByAI: false,
              generationFailed: true,
              fallbackUsed: true,
              userWallet: this.smartAccount?.address
            }
          };
        }
      } else {
        // Return static case for free users
        const staticCase = this.getCase('case-x487');
        if (!staticCase) {
          throw new Error('Static case not available');
        }
        console.log('🏥 Loaded standard static case for user');
        return staticCase;
      }
    } catch (error) {
      console.error('Error getting recommended case:', error);
      // Always fallback to static case if there's any error
      const staticCase = this.getCase('case-x487');
      if (!staticCase) {
        throw new Error('No cases available');
      }
      return staticCase;
    }
  }

  // ENHANCED: Update authentication status
  public updateAuthStatus(
    isAuthenticated: boolean,
    walletAddress?: string,
    preferredDifficulty?: 'easy' | 'medium' | 'hard'
  ): void {
    this.accessManager.updateAuthStatus(isAuthenticated, walletAddress, preferredDifficulty);

    // Update onchain features
    if (isAuthenticated && walletAddress) {
      this.smartAccount = { address: walletAddress };
      this.delegationEnabled = true;
    } else {
      this.smartAccount = null;
      this.delegationEnabled = false;
    }
  }

  // ENHANCED: Get user preferences for AI generation
  private getUserPreferences() {
    return {
      specialties: ['general_medicine', 'radiology'],
      complexity: 'adaptive',
      focusAreas: ['diagnostic_reasoning', 'pattern_recognition']
    };
  }

  // ENHANCED: Get access manager for UI integration
  public getAccessManager(): CaseAccessManager {
    return this.accessManager;
  }

  // ENHANCED: Get onchain performance metrics
  public getPerformanceMetrics() {
    const accessSummary = this.accessManager.getAccessSummary();

    return {
      smartAccountConnected: !!this.smartAccount,
      delegationEnabled: this.delegationEnabled,
      aiServiceConfigured: true,
      currentTier: accessSummary.tier,
      casesRemaining: accessSummary.casesRemaining,
      canAccessAI: this.accessManager.canAccessCaseType('ai_generated')
    };
  }

  // PERFORMANT: Generate deterministic seed for reproducible AI generation
  private generateSeed(difficulty: string): number {
    const walletAddress = this.smartAccount?.address || 'anonymous';
    const timestamp = Math.floor(Date.now() / 1000);
    const seedString = `${walletAddress}-${difficulty}-${timestamp}`;

    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      const char = seedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // CLEAN: Get minimal game state for session persistence
  private getCurrentGameState(): any {
    // This returns minimal state - GameManager will provide full state when available
    return {
      score: 0,
      timeRemaining: 300,
      discoveredConditions: [],
      phase: 'patient_arrival'
    };
  }
}