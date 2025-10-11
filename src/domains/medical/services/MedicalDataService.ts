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
    name: 'Sarah Johnson',
    age: 34,
    gender: 'Female',
    bloodType: 'A+',
    allergies: 'Penicillin',
    medications: 'Ibuprofen as needed for pain',
    medicalHistory: 'History of migraines, currently well-controlled.',
    conditionName: 'Temporomandibular Joint Dysfunction',
    conditionDescription: 'Pain and compromised movement of the jaw joint and the surrounding muscles.',
    conditionLocation: 'Temporomandibular Joint',
    hpi: '34-year-old female with a 3-week history of chronic headaches and jaw pain, with associated clicking of the jaw. Symptoms are worse in the morning and exacerbated by stress. She reports taking ibuprofen with partial relief. No history of recent trauma.',
    vitalSigns: {
      bp: '120/80',
      hr: '72',
      rr: '16',
      temp: '98.6',
      o2sat: '99%',
      pain: '6/10'
    }
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
