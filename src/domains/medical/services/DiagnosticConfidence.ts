/**
 * Diagnostic Confidence Tracker
 * MODULAR: Tracks evidence chains and calculates diagnostic confidence
 * CLEAN: Single source of truth for probability tracking
 */

export interface Evidence {
  id: string;
  type: 'symptom' | 'lab' | 'imaging' | 'physical' | 'history';
  description: string;
  weight: number; // 0-1 scale, how strong is this evidence
  timestamp: number;
  supportedDiagnoses: string[]; // Which diagnoses does this support
  contradictsDiagnoses: string[]; // Which diagnoses does this contradict
}

export interface DiagnosisConfidence {
  diagnosisId: string;
  diagnosisName: string;
  confidence: number; // 0-1 scale
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  evidenceQuality: 'weak' | 'moderate' | 'strong';
  lastUpdated: number;
}

export interface EvidenceChain {
  diagnosis: string;
  evidenceIds: string[];
  totalWeight: number;
  chainStrength: number; // Combined probability
}

export class DiagnosticConfidence {
  private evidence: Map<string, Evidence> = new Map();
  private diagnoses: Map<string, DiagnosisConfidence> = new Map();
  private evidenceChains: Map<string, EvidenceChain> = new Map();
  
  /**
   * Add evidence to the diagnostic process
   */
  public trackEvidence(evidence: Evidence): void {
    this.evidence.set(evidence.id, evidence);
    
    // Update all supported diagnoses
    evidence.supportedDiagnoses.forEach(diagnosisId => {
      this.updateDiagnosisConfidence(diagnosisId, evidence, true);
    });
    
    // Update all contradicted diagnoses
    evidence.contradictsDiagnoses.forEach(diagnosisId => {
      this.updateDiagnosisConfidence(diagnosisId, evidence, false);
    });
    
    // Rebuild evidence chains
    this.rebuildEvidenceChains();
  }
  
  /**
   * Update confidence for a specific diagnosis
   */
  private updateDiagnosisConfidence(
    diagnosisId: string,
    evidence: Evidence,
    isSupporting: boolean
  ): void {
    let diagnosis = this.diagnoses.get(diagnosisId);
    
    if (!diagnosis) {
      // Initialize new diagnosis
      diagnosis = {
        diagnosisId,
        diagnosisName: diagnosisId, // Should be replaced with actual name
        confidence: 0,
        supportingEvidence: [],
        contradictingEvidence: [],
        evidenceQuality: 'weak',
        lastUpdated: Date.now()
      };
      this.diagnoses.set(diagnosisId, diagnosis);
    }
    
    // Add evidence to appropriate list
    if (isSupporting) {
      diagnosis.supportingEvidence.push(evidence);
    } else {
      diagnosis.contradictingEvidence.push(evidence);
    }
    
    // Recalculate confidence
    diagnosis.confidence = this.calculateConfidence(
      diagnosis.supportingEvidence,
      diagnosis.contradictingEvidence
    );
    
    // Update evidence quality
    diagnosis.evidenceQuality = this.assessEvidenceQuality(
      diagnosis.supportingEvidence
    );
    
    diagnosis.lastUpdated = Date.now();
  }
  
  /**
   * Calculate confidence based on supporting and contradicting evidence
   * Uses Bayesian-inspired approach
   */
  private calculateConfidence(
    supporting: Evidence[],
    contradicting: Evidence[]
  ): number {
    // Base prior probability (assume 10% for any diagnosis without evidence)
    let probability = 0.1;
    
    // Apply supporting evidence (multiplicative increase)
    supporting.forEach(ev => {
      // Each piece of evidence increases likelihood
      // Using Bayesian update: P(H|E) = P(E|H) * P(H) / P(E)
      // Simplified: increase probability by evidence weight, diminishing returns
      const increase = ev.weight * (1 - probability);
      probability += increase * 0.7; // 0.7 factor for diminishing returns
    });
    
    // Apply contradicting evidence (multiplicative decrease)
    contradicting.forEach(ev => {
      // Each contradicting evidence decreases likelihood
      const decrease = ev.weight * probability;
      probability -= decrease * 0.8; // 0.8 factor for strong negative evidence
    });
    
    // Ensure probability stays in [0, 1]
    return Math.max(0, Math.min(1, probability));
  }
  
  /**
   * Assess overall quality of evidence
   */
  private assessEvidenceQuality(evidence: Evidence[]): 'weak' | 'moderate' | 'strong' {
    if (evidence.length === 0) return 'weak';
    
    // Calculate average weight of evidence
    const averageWeight = evidence.reduce((sum, ev) => sum + ev.weight, 0) / evidence.length;
    
    // Check diversity of evidence types
    const evidenceTypes = new Set(evidence.map(ev => ev.type));
    const diversityScore = evidenceTypes.size / 5; // 5 total types
    
    // Combine weight and diversity
    const qualityScore = (averageWeight * 0.6) + (diversityScore * 0.4);
    
    if (qualityScore >= 0.7) return 'strong';
    if (qualityScore >= 0.4) return 'moderate';
    return 'weak';
  }
  
  /**
   * Rebuild evidence chains for all diagnoses
   */
  private rebuildEvidenceChains(): void {
    this.evidenceChains.clear();
    
    this.diagnoses.forEach((diagnosis, diagnosisId) => {
      const chain: EvidenceChain = {
        diagnosis: diagnosisId,
        evidenceIds: diagnosis.supportingEvidence.map(ev => ev.id),
        totalWeight: diagnosis.supportingEvidence.reduce((sum, ev) => sum + ev.weight, 0),
        chainStrength: diagnosis.confidence
      };
      
      this.evidenceChains.set(diagnosisId, chain);
    });
  }
  
  /**
   * Get confidence score for a specific diagnosis
   */
  public getConfidenceScore(diagnosisId: string): number {
    const diagnosis = this.diagnoses.get(diagnosisId);
    return diagnosis ? diagnosis.confidence : 0;
  }
  
  /**
   * Get detailed confidence for a diagnosis
   */
  public getDiagnosisConfidence(diagnosisId: string): DiagnosisConfidence | undefined {
    return this.diagnoses.get(diagnosisId);
  }
  
  /**
   * Get all diagnoses ranked by confidence
   */
  public getRankedDiagnoses(): DiagnosisConfidence[] {
    return Array.from(this.diagnoses.values())
      .sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Get top N most likely diagnoses
   */
  public getTopDiagnoses(n: number = 3): DiagnosisConfidence[] {
    return this.getRankedDiagnoses().slice(0, n);
  }
  
  /**
   * Get evidence chain for a diagnosis
   */
  public getEvidenceChain(diagnosisId: string): EvidenceChain | undefined {
    return this.evidenceChains.get(diagnosisId);
  }
  
  /**
   * Get all evidence collected so far
   */
  public getAllEvidence(): Evidence[] {
    return Array.from(this.evidence.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Get evidence by type
   */
  public getEvidenceByType(type: Evidence['type']): Evidence[] {
    return this.getAllEvidence()
      .filter(ev => ev.type === type);
  }
  
  /**
   * Calculate overall diagnostic certainty
   * How confident are we in ANY diagnosis?
   */
  public getOverallCertainty(): {
    certainty: number; // 0-1 scale
    topConfidence: number;
    evidenceCount: number;
    diagnosisCount: number;
  } {
    const topDiagnosis = this.getRankedDiagnoses()[0];
    const evidenceCount = this.evidence.size;
    const diagnosisCount = this.diagnoses.size;
    
    // Certainty is high if:
    // 1. Top diagnosis has high confidence
    // 2. We have sufficient evidence
    // 3. There's separation between top diagnoses
    
    const topConfidence = topDiagnosis?.confidence || 0;
    const secondConfidence = this.getRankedDiagnoses()[1]?.confidence || 0;
    const separation = topConfidence - secondConfidence;
    
    // Evidence sufficiency (diminishing returns after 10 pieces)
    const evidenceFactor = Math.min(1, evidenceCount / 10);
    
    // Separation factor (clearer picture if top diagnosis is clearly ahead)
    const separationFactor = Math.min(1, separation / 0.3);
    
    // Combined certainty
    const certainty = topConfidence * 0.5 + evidenceFactor * 0.25 + separationFactor * 0.25;
    
    return {
      certainty: Math.min(1, certainty),
      topConfidence,
      evidenceCount,
      diagnosisCount
    };
  }
  
  /**
   * Get diagnostic recommendation
   */
  public getRecommendation(): {
    action: 'investigate_more' | 'consult_specialist' | 'diagnose' | 'emergency';
    reasoning: string;
    suggestedTests?: string[];
  } {
    const { certainty, topConfidence, evidenceCount } = this.getOverallCertainty();
    const topDiagnosis = this.getRankedDiagnoses()[0];
    
    // Emergency if patient critical and confident diagnosis
    if (topDiagnosis?.diagnosisName.toLowerCase().includes('critical') && topConfidence > 0.6) {
      return {
        action: 'emergency',
        reasoning: 'Critical condition identified with high confidence - immediate intervention required'
      };
    }
    
    // Ready to diagnose if high certainty
    if (certainty >= 0.75 && topConfidence >= 0.70) {
      return {
        action: 'diagnose',
        reasoning: `Strong evidence supports diagnosis of ${topDiagnosis?.diagnosisName} (${Math.round(topConfidence * 100)}% confidence)`
      };
    }
    
    // Consult specialist if moderate certainty but complex case
    if (certainty >= 0.5 && topConfidence >= 0.5 && evidenceCount >= 5) {
      return {
        action: 'consult_specialist',
        reasoning: 'Moderate confidence with sufficient evidence - specialist consultation recommended'
      };
    }
    
    // Need more evidence
    const missingTypes = this.getMissingEvidenceTypes();
    return {
      action: 'investigate_more',
      reasoning: `Insufficient evidence for confident diagnosis (${Math.round(certainty * 100)}% certainty)`,
      suggestedTests: missingTypes
    };
  }
  
  /**
   * Identify what types of evidence are missing
   */
  private getMissingEvidenceTypes(): string[] {
    const presentTypes = new Set(this.getAllEvidence().map(ev => ev.type));
    const allTypes: Evidence['type'][] = ['symptom', 'lab', 'imaging', 'physical', 'history'];
    
    return allTypes
      .filter(type => !presentTypes.has(type))
      .map(type => {
        switch (type) {
          case 'lab': return 'Laboratory tests';
          case 'imaging': return 'Imaging studies';
          case 'physical': return 'Physical examination';
          case 'history': return 'Detailed patient history';
          case 'symptom': return 'Symptom documentation';
          default: return type;
        }
      });
  }
  
  /**
   * Reset all tracked data
   */
  public reset(): void {
    this.evidence.clear();
    this.diagnoses.clear();
    this.evidenceChains.clear();
  }
  
  /**
   * Export diagnostic summary for storage/review
   */
  public exportSummary() {
    return {
      timestamp: Date.now(),
      diagnoses: this.getRankedDiagnoses(),
      evidence: this.getAllEvidence(),
      certainty: this.getOverallCertainty(),
      recommendation: this.getRecommendation()
    };
  }
}
