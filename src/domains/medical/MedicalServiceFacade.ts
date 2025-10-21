import { MedicalDataService } from './services/MedicalDataService';
import { AIAnalysisService } from './services/AIAnalysisService';
import { MedicalCase } from './types';
import { CaseAccessManager } from './CaseAccessManager';

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

  // ENHANCED: AI-powered case generation for premium users
  public async generateAICase(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<MedicalCase> {
    // Check premium access
    if (!this.accessManager.canAccessCaseType('ai_generated')) {
      throw new Error('AI case generation requires premium access. Please connect your wallet and upgrade.');
    }

    // Record usage
    this.accessManager.recordCaseUsage('ai_generated');

    try {
      const response = await fetch('/api/generate-patient-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty,
          smartAccount: this.smartAccount?.address,
          delegationEnabled: this.delegationEnabled,
          userPreferences: this.getUserPreferences()
        })
      });

      if (!response.ok) {
        throw new Error(`AI case generation failed: ${response.statusText}`);
      }

      const aiCase = await response.json();
      
      // Enhance with access-aware features
      const enhancedCase: MedicalCase = {
        ...aiCase,
        id: `ai_case_${Date.now()}`,
        isAIGenerated: true,
        generatedAt: Date.now(),
        difficulty,
        smartAccountAddress: this.smartAccount?.address
      };

      return enhancedCase;
    } catch (error) {
      console.error('AI case generation failed:', error);
      // Fallback to static case with upgrade prompt
      throw new Error('AI case generation temporarily unavailable. Please try again or use the free static case.');
    }
  }

  // ENHANCED: Get appropriate case based on user tier
  public async getRecommendedCase(): Promise<MedicalCase> {
    const userStatus = this.accessManager.getUserStatus();
    
    if (userStatus.currentTier === 'premium' && userStatus.canAccessAICases) {
      // Generate AI case for premium users
      return await this.generateAICase();
    } else {
      // Return static case for free users
      const staticCase = this.getCase('case-x487');
      if (!staticCase) {
        throw new Error('Static case not available');
      }
      return staticCase;
    }
  }

  // ENHANCED: Update authentication status
  public updateAuthStatus(isAuthenticated: boolean, walletAddress?: string): void {
    this.accessManager.updateAuthStatus(isAuthenticated, walletAddress);
    
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
}