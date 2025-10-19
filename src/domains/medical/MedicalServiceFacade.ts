import { MedicalDataService } from './services/MedicalDataService';
import { AIAnalysisService } from './services/AIAnalysisService';
import { MedicalCase } from './types';

export class MedicalServiceFacade {
  private medicalDataService: MedicalDataService;
  private aiAnalysisService: AIAnalysisService;

  // ENHANCED: Onchain features
  private smartAccount: any = null;
  private delegationEnabled: boolean = false;

  constructor() {
    this.medicalDataService = new MedicalDataService();
    this.aiAnalysisService = new AIAnalysisService();
  }

  // ENHANCED: Configure onchain features
  public configureOnchainFeatures(smartAccount: any, delegationEnabled: boolean = false) {
    this.smartAccount = smartAccount;
    this.delegationEnabled = delegationEnabled;
  }

  public getCase(caseId: string): MedicalCase | undefined {
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

  // ENHANCED: Get onchain performance metrics
  public getPerformanceMetrics() {
    return {
      smartAccountConnected: !!this.smartAccount,
      delegationEnabled: this.delegationEnabled,
      aiServiceConfigured: true
    };
  }
}