import { MedicalDataService } from './services/MedicalDataService';
import { MedicalCase } from './types';

export class MedicalServiceFacade {
  private medicalDataService: MedicalDataService;

  constructor() {
    this.medicalDataService = new MedicalDataService();
  }

  public getCase(caseId: string): MedicalCase | undefined {
    return this.medicalDataService.getCase(caseId);
  }

  public getAllCases(): MedicalCase[] {
    return this.medicalDataService.getAllCases();
  }
}