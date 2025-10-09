
import { PatientInfo } from '@/types/types';

export interface MedicalCase {
  id: string;
  title: string;
  presentingComplaint: string;
  patientStory: string;
  initialFindings: string;
  mission: string;
  stakes: string;
  patientInfo: PatientInfo;
}
