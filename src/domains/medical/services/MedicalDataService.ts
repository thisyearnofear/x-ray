import { MedicalCase } from '../types';

const sampleCase: MedicalCase = {
  id: 'case-x487',
  title: 'Chronic Headaches with Jaw Pain',
  presentingComplaint: 'A 3-week history of persistent headaches, localized to the temples and radiating to the jaw.',
  patientStory: 'The patient is a 34-year-old administrative assistant who reports increased stress at work. The headaches are worse in the morning and are associated with a clicking sound when opening and closing the mouth.',
  initialFindings: 'Tenderness on palpation of the temporomandibular joint (TMJ) and masseter muscles. Audible clicking on jaw movement.',
  mission: 'Your mission is to establish a definitive diagnosis within the next 15 minutes and recommend an initial management plan.',
  stakes: 'The patient\'s quality of life is significantly impacted. A misdiagnosis could lead to unnecessary procedures or a worsening of the underlying condition.',
  patientInfo: {
    patientName: 'Sarah Johnson',
    age: 34,
    gender: 'Female',
    chiefComplaint: 'Chronic headaches with jaw pain'
  }
};

export class MedicalDataService {
  public getCase(caseId: string): MedicalCase | undefined {
    // In a real application, this would fetch from a database or API
    if (caseId === 'case-x487') {
      return sampleCase;
    }
    return undefined;
  }

  public getAllCases(): MedicalCase[] {
    return [sampleCase];
  }
}
