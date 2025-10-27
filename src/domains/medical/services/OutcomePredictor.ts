/**
 * Outcome Predictor Service
 * MODULAR: AI-powered outcome prediction for medical decisions
 * CLEAN: Risk assessment based on evidence, time, and patient state
 */

import { PatientState, PatientStateData } from '../types';
import { DiagnosticConfidence, Evidence } from './DiagnosticConfidence';
import { MedicalAction } from '../types';

export interface OutcomePrediction {
  actionId: string;
  actionName: string;
  predictedSuccess: number; // 0-1 probability
  predictedHealthChange: number; // -100 to +100
  predictedCriticalityChange: PatientStateData['criticality'];
  risks: RiskAssessment[];
  benefits: BenefitAssessment[];
  recommendation: 'strongly_recommended' | 'recommended' | 'neutral' | 'not_recommended' | 'strongly_discouraged';
  reasoning: string;
  confidence: number; // 0-1 how confident is this prediction
}

export interface RiskAssessment {
  risk: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  mitigation?: string;
}

export interface BenefitAssessment {
  benefit: string;
  magnitude: 'minor' | 'moderate' | 'major' | 'critical';
  probability: number; // 0-1
}

export interface ScenarioOutcome {
  scenario: string;
  timeRemaining: number; // minutes
  patientHealth: number; // 0-100
  diagnosticCertainty: number; // 0-1
  survivalProbability: number; // 0-1
  expectedScore: number;
  risks: string[];
}

export class OutcomePredictor {
  /**
   * Predict outcome of a medical action
   */
  public static predictActionOutcome(
    action: MedicalAction,
    patientState: PatientState,
    diagnosticConfidence: DiagnosticConfidence,
    timeRemaining: number
  ): OutcomePrediction {
    const patientData = patientState.getState();
    const topDiagnosis = diagnosticConfidence.getTopDiagnoses(1)[0];
    
    // Calculate predicted success rate
    const predictedSuccess = this.calculateSuccessRate(action, patientData, diagnosticConfidence);
    
    // Calculate health impact
    const predictedHealthChange = this.calculateHealthImpact(action, patientData, predictedSuccess);
    
    // Predict criticality change
    const predictedCriticalityChange = this.predictCriticalityChange(
      patientData,
      predictedHealthChange
    );
    
    // Assess risks
    const risks = this.assessRisks(action, patientData, diagnosticConfidence);
    
    // Assess benefits
    const benefits = this.assessBenefits(action, patientData, diagnosticConfidence);
    
    // Generate recommendation
    const { recommendation, reasoning } = this.generateRecommendation(
      action,
      predictedSuccess,
      predictedHealthChange,
      risks,
      benefits,
      patientData,
      timeRemaining
    );
    
    // Calculate prediction confidence
    const confidence = this.calculatePredictionConfidence(
      diagnosticConfidence,
      patientData,
      action
    );
    
    return {
      actionId: action.id,
      actionName: action.name,
      predictedSuccess,
      predictedHealthChange,
      predictedCriticalityChange,
      risks,
      benefits,
      recommendation,
      reasoning,
      confidence
    };
  }
  
  /**
   * Calculate success rate based on multiple factors
   */
  private static calculateSuccessRate(
    action: MedicalAction,
    patientData: PatientStateData,
    diagnosticConfidence: DiagnosticConfidence
  ): number {
    if (!action.effectiveness) {
      // Default for actions without effectiveness data
      return 0.7;
    }
    
    // Base success rate
    let successRate = action.effectiveness.baseSuccessRate;
    
    // Adjust for patient criticality
    const criticalityModifier = action.effectiveness.effectivenessVsCriticality[patientData.criticality];
    successRate *= criticalityModifier;
    
    // Adjust for diagnostic certainty (treatments work better with correct diagnosis)
    if (action.category === 'treatment') {
      const certainty = diagnosticConfidence.getOverallCertainty().certainty;
      successRate *= (0.5 + (certainty * 0.5)); // 50-100% effectiveness based on diagnostic certainty
    }
    
    // Adjust for contraindicated conditions
    const topDiagnoses = diagnosticConfidence.getTopDiagnoses(3);
    const hasContraindication = topDiagnoses.some(d => 
      action.effectiveness?.contraindictedConditions?.includes(d.diagnosisId)
    );
    if (hasContraindication) {
      successRate *= 0.3; // Severe reduction if contraindicated
    }
    
    // Adjust for required conditions
    const hasRequiredCondition = !action.effectiveness.requiresConditions ||
      topDiagnoses.some(d => 
        action.effectiveness?.requiresConditions?.includes(d.diagnosisId)
      );
    if (!hasRequiredCondition) {
      successRate *= 0.4; // Reduced effectiveness if treating wrong condition
    }
    
    return Math.max(0, Math.min(1, successRate));
  }
  
  /**
   * Calculate predicted health impact
   */
  private static calculateHealthImpact(
    action: MedicalAction,
    patientData: PatientStateData,
    successRate: number
  ): number {
    if (!action.effectiveness) {
      return 0;
    }
    
    // Base health impact
    const baseImpact = action.effectiveness.healthImpact;
    
    // Success factor (full impact on success, negative on failure)
    const successImpact = successRate * baseImpact;
    const failureImpact = (1 - successRate) * (-baseImpact * 0.3); // Failure causes some harm
    
    const expectedImpact = successImpact + failureImpact;
    
    // Diminishing returns for already healthy patients
    if (patientData.currentHealth > 80 && expectedImpact > 0) {
      return expectedImpact * 0.5;
    }
    
    // More critical patients benefit more from successful treatment
    if (patientData.currentHealth < 40 && expectedImpact > 0) {
      return expectedImpact * 1.3;
    }
    
    return expectedImpact;
  }
  
  /**
   * Predict how criticality will change
   */
  private static predictCriticalityChange(
    patientData: PatientStateData,
    healthChange: number
  ): PatientStateData['criticality'] {
    const projectedHealth = patientData.currentHealth + healthChange;
    
    if (projectedHealth <= 20) return 'terminal';
    if (projectedHealth <= 40) return 'critical';
    if (projectedHealth <= 70) return 'deteriorating';
    return 'stable';
  }
  
  /**
   * Assess risks of an action
   */
  private static assessRisks(
    action: MedicalAction,
    patientData: PatientStateData,
    diagnosticConfidence: DiagnosticConfidence
  ): RiskAssessment[] {
    const risks: RiskAssessment[] = [];
    
    // Convert action risks to assessments
    action.risks.forEach(riskText => {
      const severity = this.assessRiskSeverity(riskText, action.riskLevel);
      const probability = this.assessRiskProbability(riskText, action.riskLevel, patientData);
      
      risks.push({
        risk: riskText,
        severity,
        probability,
        mitigation: this.suggestMitigation(riskText)
      });
    });
    
    // Add criticality-based risks
    if (patientData.criticality === 'critical' || patientData.criticality === 'terminal') {
      risks.push({
        risk: 'Patient too unstable for intervention',
        severity: 'critical',
        probability: 0.6,
        mitigation: 'Stabilize patient first'
      });
    }
    
    // Add diagnostic uncertainty risk
    const certainty = diagnosticConfidence.getOverallCertainty().certainty;
    if (certainty < 0.5 && action.category === 'treatment') {
      risks.push({
        risk: 'Treating without confident diagnosis',
        severity: 'medium',
        probability: 0.7,
        mitigation: 'Gather more evidence before treatment'
      });
    }
    
    return risks;
  }
  
  /**
   * Assess benefits of an action
   */
  private static assessBenefits(
    action: MedicalAction,
    patientData: PatientStateData,
    diagnosticConfidence: DiagnosticConfidence
  ): BenefitAssessment[] {
    const benefits: BenefitAssessment[] = [];
    
    // Information gain benefit
    if (action.informationGain > 50) {
      benefits.push({
        benefit: 'Significant diagnostic information',
        magnitude: action.informationGain > 80 ? 'major' : 'moderate',
        probability: 0.9
      });
    }
    
    // Treatment benefit
    if (action.effectiveness) {
      const healthImpact = action.effectiveness.healthImpact;
      if (healthImpact > 20) {
        benefits.push({
          benefit: 'Substantial health improvement',
          magnitude: healthImpact > 35 ? 'critical' : 'major',
          probability: action.effectiveness.baseSuccessRate
        });
      }
      
      if (action.effectiveness.deteriorationReduction > 0.3) {
        benefits.push({
          benefit: 'Slows disease progression',
          magnitude: 'moderate',
          probability: action.effectiveness.baseSuccessRate
        });
      }
    }
    
    // Time-sensitive benefit
    if (patientData.currentHealth < 50 && action.category === 'treatment') {
      benefits.push({
        benefit: 'Urgent intervention for deteriorating patient',
        magnitude: 'critical',
        probability: 0.7
      });
    }
    
    return benefits;
  }
  
  /**
   * Generate action recommendation
   */
  private static generateRecommendation(
    action: MedicalAction,
    predictedSuccess: number,
    healthChange: number,
    risks: RiskAssessment[],
    benefits: BenefitAssessment[],
    patientData: PatientStateData,
    timeRemaining: number
  ): { recommendation: OutcomePrediction['recommendation']; reasoning: string } {
    // Calculate risk score
    const riskScore = risks.reduce((sum, r) => {
      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 }[r.severity];
      return sum + (r.probability * severityWeight);
    }, 0) / Math.max(1, risks.length);
    
    // Calculate benefit score
    const benefitScore = benefits.reduce((sum, b) => {
      const magnitudeWeight = { minor: 1, moderate: 2, major: 3, critical: 4 }[b.magnitude];
      return sum + (b.probability * magnitudeWeight);
    }, 0) / Math.max(1, benefits.length);
    
    // Decision logic
    const netScore = benefitScore - riskScore;
    
    // Emergency override
    if (patientData.criticality === 'terminal' && action.category === 'treatment') {
      if (predictedSuccess > 0.4) {
        return {
          recommendation: 'strongly_recommended',
          reasoning: `Patient in terminal condition - immediate intervention required despite ${Math.round((1-predictedSuccess)*100)}% risk`
        };
      }
    }
    
    // High confidence recommendation
    if (predictedSuccess > 0.75 && healthChange > 15 && netScore > 2) {
      return {
        recommendation: 'strongly_recommended',
        reasoning: `High success rate (${Math.round(predictedSuccess*100)}%), significant benefit (+${Math.round(healthChange)} health), acceptable risk`
      };
    }
    
    // Good recommendation
    if (predictedSuccess > 0.6 && netScore > 1) {
      return {
        recommendation: 'recommended',
        reasoning: `Good success rate (${Math.round(predictedSuccess*100)}%), benefits outweigh risks`
      };
    }
    
    // Neutral
    if (netScore > -0.5 && netScore < 1) {
      return {
        recommendation: 'neutral',
        reasoning: `Balanced risk-benefit profile - clinical judgment required`
      };
    }
    
    // Not recommended
    if (predictedSuccess < 0.4 || netScore < -1) {
      return {
        recommendation: 'not_recommended',
        reasoning: `Low success rate (${Math.round(predictedSuccess*100)}%) or risks outweigh benefits`
      };
    }
    
    // Strongly discouraged
    if (riskScore > 3 || (patientData.criticality === 'critical' && predictedSuccess < 0.3)) {
      return {
        recommendation: 'strongly_discouraged',
        reasoning: `High risk of complications with low success probability - seek alternatives`
      };
    }
    
    return {
      recommendation: 'neutral',
      reasoning: 'Insufficient data for strong recommendation'
    };
  }
  
  /**
   * Calculate prediction confidence
   */
  private static calculatePredictionConfidence(
    diagnosticConfidence: DiagnosticConfidence,
    patientData: PatientStateData,
    action: MedicalAction
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence with better diagnostic certainty
    const certainty = diagnosticConfidence.getOverallCertainty().certainty;
    confidence += certainty * 0.3;
    
    // Higher confidence with effectiveness data
    if (action.effectiveness) {
      confidence += 0.2;
    }
    
    // Lower confidence for critical patients (more unpredictable)
    if (patientData.criticality === 'critical' || patientData.criticality === 'terminal') {
      confidence *= 0.7;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Predict multiple scenarios
   */
  public static predictScenarios(
    patientState: PatientState,
    diagnosticConfidence: DiagnosticConfidence,
    timeRemaining: number,
    possibleActions: MedicalAction[]
  ): ScenarioOutcome[] {
    const scenarios: ScenarioOutcome[] = [];
    const patientData = patientState.getState();
    
    // Scenario 1: Do nothing
    const doNothingHealth = this.projectHealth(patientData, timeRemaining, 0);
    scenarios.push({
      scenario: 'No intervention',
      timeRemaining,
      patientHealth: doNothingHealth,
      diagnosticCertainty: diagnosticConfidence.getOverallCertainty().certainty,
      survivalProbability: doNothingHealth / 100,
      expectedScore: doNothingHealth * 0.5,
      risks: ['Continued deterioration', 'Missed treatment window']
    });
    
    // Scenario 2-N: Each possible action
    possibleActions.forEach(action => {
      const prediction = this.predictActionOutcome(action, patientState, diagnosticConfidence, timeRemaining);
      const projectedHealth = patientData.currentHealth + prediction.predictedHealthChange;
      
      scenarios.push({
        scenario: `${action.name}`,
        timeRemaining: timeRemaining - (action.timeRequired || 0),
        patientHealth: projectedHealth,
        diagnosticCertainty: diagnosticConfidence.getOverallCertainty().certainty,
        survivalProbability: prediction.predictedSuccess * (projectedHealth / 100),
        expectedScore: (projectedHealth * 0.5) + (prediction.predictedSuccess * 50),
        risks: prediction.risks.map(r => r.risk)
      });
    });
    
    return scenarios.sort((a, b) => b.expectedScore - a.expectedScore);
  }
  
  /**
   * Project health over time without intervention
   */
  private static projectHealth(
    patientData: PatientStateData,
    timeMinutes: number,
    interventionEffect: number
  ): number {
    const deterioration = patientData.deteriorationRate * timeMinutes;
    return Math.max(0, patientData.currentHealth - deterioration + interventionEffect);
  }
  
  // Helper methods
  private static assessRiskSeverity(riskText: string, actionRiskLevel: string): RiskAssessment['severity'] {
    const criticalKeywords = ['death', 'fatal', 'anesthesia complications'];
    const highKeywords = ['bleeding', 'infection', 'respiratory'];
    
    if (criticalKeywords.some(k => riskText.toLowerCase().includes(k))) return 'critical';
    if (highKeywords.some(k => riskText.toLowerCase().includes(k))) return 'high';
    if (actionRiskLevel === 'high') return 'high';
    if (actionRiskLevel === 'medium') return 'medium';
    return 'low';
  }
  
  private static assessRiskProbability(riskText: string, actionRiskLevel: string, patientData: PatientStateData): number {
    let probability = 0.1; // Base probability
    
    if (actionRiskLevel === 'high') probability = 0.3;
    if (actionRiskLevel === 'medium') probability = 0.15;
    
    // Increase probability for critical patients
    if (patientData.criticality === 'critical') probability *= 1.5;
    if (patientData.criticality === 'terminal') probability *= 2;
    
    return Math.min(1, probability);
  }
  
  private static suggestMitigation(riskText: string): string | undefined {
    const mitigations: Record<string, string> = {
      'allergic reaction': 'Premedicate with antihistamines',
      'bleeding': 'Check coagulation profile first',
      'infection': 'Sterile technique and prophylactic antibiotics',
      'respiratory depression': 'Monitor oxygen saturation closely',
      'radiation exposure': 'Justify with diagnostic benefit'
    };
    
    for (const [risk, mitigation] of Object.entries(mitigations)) {
      if (riskText.toLowerCase().includes(risk)) {
        return mitigation;
      }
    }
    
    return undefined;
  }
}
