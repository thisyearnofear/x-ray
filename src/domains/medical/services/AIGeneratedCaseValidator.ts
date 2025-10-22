/**
 * AI Generated Case Validator
 * CLEAN: Validates AI-generated case structure and medical consistency
 * MODULAR: Independent validation logic separate from generation
 * PERFORMANT: Efficient validation with early exits
 */

import { PatientCase } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100 quality score
}

export class AIGeneratedCaseValidator {
  // CLEAN: Required fields for a valid case
  private static readonly REQUIRED_FIELDS = [
    'patientName',
    'age',
    'gender',
    'chiefComplaint'
  ];

  // CLEAN: Required hiddenElements fields
  private static readonly REQUIRED_HIDDEN_ELEMENTS = [
    'fullHistory',
    'physicalFindings',
    'differentialDiagnosis'
  ];

  // MODULAR: Validate complete case structure
  public static validate(aiCase: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check required top-level fields
    this.REQUIRED_FIELDS.forEach(field => {
      if (!aiCase[field]) {
        errors.push(`Missing required field: ${field}`);
        score -= 20;
      }
    });

    // Validate age is reasonable
    if (aiCase.age && (aiCase.age < 0 || aiCase.age > 120)) {
      errors.push(`Invalid age: ${aiCase.age}. Must be between 0 and 120.`);
      score -= 10;
    }

    // Validate gender
    if (aiCase.gender && !['Male', 'Female', 'Non-binary', 'Other'].includes(aiCase.gender)) {
      warnings.push(`Unusual gender value: ${aiCase.gender}`);
      score -= 2;
    }

    // Check hiddenElements structure
    if (!aiCase.hiddenElements) {
      errors.push('Missing hiddenElements structure');
      score -= 30;
    } else {
      score -= this.validateHiddenElements(aiCase.hiddenElements, errors, warnings);
    }

    // Validate vital signs if present
    if (aiCase.vitalSigns || aiCase.initialPresentation?.vitalSigns) {
      const vitals = aiCase.vitalSigns || aiCase.initialPresentation?.vitalSigns;
      score -= this.validateVitalSigns(vitals, errors, warnings);
    }

    // Check case metadata
    if (!aiCase.caseComplexity) {
      warnings.push('Missing caseComplexity field');
      score -= 3;
    }

    if (!aiCase.estimatedCaseLength) {
      warnings.push('Missing estimatedCaseLength field');
      score -= 3;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      isValid: errors.length === 0 && score >= 60, // Must have no errors and score >= 60
      errors,
      warnings,
      score
    };
  }

  // MODULAR: Validate hiddenElements structure
  private static validateHiddenElements(
    hiddenElements: any,
    errors: string[],
    warnings: string[]
  ): number {
    let scoreDeduction = 0;

    // Check required fields
    this.REQUIRED_HIDDEN_ELEMENTS.forEach(field => {
      if (!hiddenElements[field]) {
        errors.push(`Missing hiddenElements.${field}`);
        scoreDeduction += 10;
      }
    });

    // Validate fullHistory is substantial
    if (hiddenElements.fullHistory && hiddenElements.fullHistory.length < 100) {
      warnings.push('fullHistory is too brief (< 100 characters)');
      scoreDeduction += 5;
    }

    // Validate physicalFindings is an array with content
    if (hiddenElements.physicalFindings) {
      if (!Array.isArray(hiddenElements.physicalFindings)) {
        errors.push('physicalFindings must be an array');
        scoreDeduction += 10;
      } else if (hiddenElements.physicalFindings.length === 0) {
        warnings.push('physicalFindings array is empty');
        scoreDeduction += 5;
      }
    }

    // Validate differentialDiagnosis structure
    if (hiddenElements.differentialDiagnosis) {
      if (!Array.isArray(hiddenElements.differentialDiagnosis)) {
        errors.push('differentialDiagnosis must be an array');
        scoreDeduction += 10;
      } else {
        scoreDeduction += this.validateDifferentialDiagnosis(
          hiddenElements.differentialDiagnosis,
          errors,
          warnings
        );
      }
    }

    // Validate labResults if present
    if (hiddenElements.labResults) {
      if (typeof hiddenElements.labResults !== 'object') {
        errors.push('labResults must be an object');
        scoreDeduction += 5;
      } else if (Object.keys(hiddenElements.labResults).length === 0) {
        warnings.push('labResults object is empty');
        scoreDeduction += 3;
      }
    }

    // Validate imagingFindings if present
    if (hiddenElements.imagingFindings) {
      if (typeof hiddenElements.imagingFindings !== 'object') {
        errors.push('imagingFindings must be an object');
        scoreDeduction += 5;
      } else if (Object.keys(hiddenElements.imagingFindings).length === 0) {
        warnings.push('imagingFindings object is empty');
        scoreDeduction += 3;
      }
    }

    return scoreDeduction;
  }

  // MODULAR: Validate differential diagnosis structure
  private static validateDifferentialDiagnosis(
    differentials: any[],
    errors: string[],
    warnings: string[]
  ): number {
    let scoreDeduction = 0;

    if (differentials.length === 0) {
      warnings.push('differentialDiagnosis array is empty');
      scoreDeduction += 10;
      return scoreDeduction;
    }

    // Validate each differential
    differentials.forEach((diff, index) => {
      if (!diff.condition) {
        errors.push(`differentialDiagnosis[${index}] missing condition field`);
        scoreDeduction += 3;
      }

      if (!diff.likelihood) {
        warnings.push(`differentialDiagnosis[${index}] missing likelihood field`);
        scoreDeduction += 2;
      } else if (!['high', 'medium', 'low'].includes(diff.likelihood.toLowerCase())) {
        warnings.push(`differentialDiagnosis[${index}] has unusual likelihood: ${diff.likelihood}`);
        scoreDeduction += 1;
      }

      if (!diff.reasoning) {
        warnings.push(`differentialDiagnosis[${index}] missing reasoning field`);
        scoreDeduction += 2;
      } else if (diff.reasoning.length < 20) {
        warnings.push(`differentialDiagnosis[${index}] reasoning is too brief`);
        scoreDeduction += 1;
      }
    });

    // Check for at least one high likelihood diagnosis
    const hasHighLikelihood = differentials.some(
      (d: any) => d.likelihood && d.likelihood.toLowerCase() === 'high'
    );
    if (!hasHighLikelihood) {
      warnings.push('No high likelihood diagnosis in differential');
      scoreDeduction += 3;
    }

    return scoreDeduction;
  }

  // MODULAR: Validate vital signs are within reasonable ranges
  private static validateVitalSigns(
    vitals: any,
    errors: string[],
    warnings: string[]
  ): number {
    let scoreDeduction = 0;

    // Temperature validation (Fahrenheit)
    if (vitals.temperature) {
      if (vitals.temperature < 90 || vitals.temperature > 110) {
        warnings.push(`Unusual temperature: ${vitals.temperature}°F`);
        scoreDeduction += 2;
      }
    }

    // Heart rate validation
    if (vitals.heartRate) {
      if (vitals.heartRate < 30 || vitals.heartRate > 250) {
        warnings.push(`Unusual heart rate: ${vitals.heartRate} bpm`);
        scoreDeduction += 2;
      }
    }

    // Respiratory rate validation
    if (vitals.respiratoryRate) {
      if (vitals.respiratoryRate < 6 || vitals.respiratoryRate > 60) {
        warnings.push(`Unusual respiratory rate: ${vitals.respiratoryRate} breaths/min`);
        scoreDeduction += 2;
      }
    }

    // Oxygen saturation validation
    if (vitals.oxygenSaturation) {
      if (vitals.oxygenSaturation < 50 || vitals.oxygenSaturation > 100) {
        warnings.push(`Invalid oxygen saturation: ${vitals.oxygenSaturation}%`);
        scoreDeduction += 2;
      }
    }

    // Blood pressure validation
    if (vitals.bloodPressure) {
      const bpMatch = vitals.bloodPressure.match(/(\d+)\/(\d+)/);
      if (bpMatch) {
        const systolic = parseInt(bpMatch[1]);
        const diastolic = parseInt(bpMatch[2]);
        
        if (systolic < 60 || systolic > 250) {
          warnings.push(`Unusual systolic BP: ${systolic}`);
          scoreDeduction += 2;
        }
        
        if (diastolic < 30 || diastolic > 150) {
          warnings.push(`Unusual diastolic BP: ${diastolic}`);
          scoreDeduction += 2;
        }

        if (systolic <= diastolic) {
          errors.push(`Invalid BP: systolic (${systolic}) must be > diastolic (${diastolic})`);
          scoreDeduction += 5;
        }
      }
    }

    return scoreDeduction;
  }

  // MODULAR: Validate medical consistency (basic checks)
  public static validateMedicalConsistency(aiCase: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check if chief complaint aligns with differential diagnoses
    if (aiCase.chiefComplaint && aiCase.hiddenElements?.differentialDiagnosis) {
      const complaint = aiCase.chiefComplaint.toLowerCase();
      const diagnoses = aiCase.hiddenElements.differentialDiagnosis.map(
        (d: any) => d.condition.toLowerCase()
      );

      // Basic consistency checks
      if (complaint.includes('chest pain') || complaint.includes('cardiac')) {
        const hasCardiacDx = diagnoses.some((d: string) => 
          d.includes('cardiac') || d.includes('heart') || d.includes('mi') || 
          d.includes('angina') || d.includes('coronary')
        );
        if (!hasCardiacDx) {
          warnings.push('Chief complaint mentions cardiac/chest pain but no cardiac diagnoses listed');
          score -= 5;
        }
      }

      if (complaint.includes('headache') || complaint.includes('head pain')) {
        const hasHeadacheDx = diagnoses.some((d: string) => 
          d.includes('headache') || d.includes('migraine') || d.includes('tension')
        );
        if (!hasHeadacheDx) {
          warnings.push('Chief complaint mentions headache but no headache diagnoses listed');
          score -= 5;
        }
      }
    }

    // Check if vital signs align with complaint severity
    if (aiCase.initialPresentation?.vitalSigns) {
      const vitals = aiCase.initialPresentation.vitalSigns;
      
      // Check for critical vital signs
      if (vitals.oxygenSaturation && vitals.oxygenSaturation < 90) {
        if (!aiCase.chiefComplaint?.toLowerCase().includes('breath') &&
            !aiCase.chiefComplaint?.toLowerCase().includes('respiratory')) {
          warnings.push('Critically low oxygen saturation without respiratory complaint');
          score -= 5;
        }
      }

      if (vitals.heartRate && vitals.heartRate > 150) {
        warnings.push('Severe tachycardia should be addressed in chief complaint or history');
        score -= 3;
      }
    }

    return {
      isValid: errors.length === 0 && score >= 70,
      errors,
      warnings,
      score
    };
  }

  // MODULAR: Full validation pipeline
  public static validateFully(aiCase: any): ValidationResult {
    const structuralValidation = this.validate(aiCase);
    const medicalValidation = this.validateMedicalConsistency(aiCase);

    // Combine results
    const combinedErrors = [...structuralValidation.errors, ...medicalValidation.errors];
    const combinedWarnings = [...structuralValidation.warnings, ...medicalValidation.warnings];
    const averageScore = Math.round((structuralValidation.score + medicalValidation.score) / 2);

    return {
      isValid: structuralValidation.isValid && medicalValidation.isValid,
      errors: combinedErrors,
      warnings: combinedWarnings,
      score: averageScore
    };
  }

  // MODULAR: Get human-readable validation report
  public static getValidationReport(result: ValidationResult): string {
    let report = `\n=== AI Case Validation Report ===\n`;
    report += `Overall Score: ${result.score}/100\n`;
    report += `Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;

    if (result.errors.length > 0) {
      report += `Errors (${result.errors.length}):\n`;
      result.errors.forEach(error => report += `  ❌ ${error}\n`);
      report += '\n';
    }

    if (result.warnings.length > 0) {
      report += `Warnings (${result.warnings.length}):\n`;
      result.warnings.forEach(warning => report += `  ⚠️  ${warning}\n`);
      report += '\n';
    }

    if (result.isValid) {
      report += '✅ Case is ready to use!\n';
    } else {
      report += '❌ Case requires fixes before use. Falling back to static case.\n';
    }

    return report;
  }
}
