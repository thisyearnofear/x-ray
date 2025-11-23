/**
 * Deterioration Profile Configuration
 * CLEAN: Single source of truth for patient deterioration mechanics
 * MODULAR: Separate configuration from generation logic
 */

export interface DeteriorationProfile {
    timeLimit: number; // seconds
    deteriorationRate: number; // health points per minute
    initialHealth: number;
    initialCriticality: 'stable' | 'deteriorating' | 'critical' | 'terminal';
    complexity: 'straightforward' | 'complex' | 'advanced';
    severity: 'low' | 'medium' | 'high';
}

export interface VitalSignRanges {
    temperature: string;
    heartRate: string;
    bloodPressure: string;
    respiratoryRate: string;
    oxygenSaturation: string;
}

export class DeteriorationProfileManager {
    /**
     * Get deterioration profile based on difficulty
     * ENHANCEMENT FIRST: Aligns AI generation with game mechanics
     */
    static getProfile(difficulty: 'easy' | 'medium' | 'hard'): DeteriorationProfile {
        const profiles: Record<string, DeteriorationProfile> = {
            easy: {
                timeLimit: 300, // 5 minutes
                deteriorationRate: 0.5,
                initialHealth: 100,
                initialCriticality: 'stable',
                complexity: 'straightforward',
                severity: 'low'
            },
            medium: {
                timeLimit: 600, // 10 minutes
                deteriorationRate: 1.0,
                initialHealth: 100,
                initialCriticality: 'deteriorating',
                complexity: 'complex',
                severity: 'medium'
            },
            hard: {
                timeLimit: 900, // 15 minutes
                deteriorationRate: 2.0,
                initialHealth: 100,
                initialCriticality: 'critical',
                complexity: 'advanced',
                severity: 'high'
            }
        };

        return profiles[difficulty] || profiles.medium;
    }

    /**
     * Get vital sign ranges for a given criticality level
     * CLEAN: Ensures AI-generated vitals match patient state
     */
    static getVitalRanges(criticality: string): VitalSignRanges {
        const ranges: Record<string, VitalSignRanges> = {
            stable: {
                temperature: '98.0-98.8°F',
                heartRate: '60-80 bpm',
                bloodPressure: '110/70-130/85 mmHg',
                respiratoryRate: '12-18 breaths/min',
                oxygenSaturation: '97-100%'
            },
            deteriorating: {
                temperature: '99.0-100.5°F',
                heartRate: '85-105 bpm',
                bloodPressure: '105/65-140/90 mmHg',
                respiratoryRate: '18-24 breaths/min',
                oxygenSaturation: '94-97%'
            },
            critical: {
                temperature: '100.6-103.0°F',
                heartRate: '106-130 bpm',
                bloodPressure: '85/55-160/100 mmHg',
                respiratoryRate: '24-32 breaths/min',
                oxygenSaturation: '88-94%'
            },
            terminal: {
                temperature: '95.0-97.0°F or >103.5°F',
                heartRate: '40-60 or >140 bpm',
                bloodPressure: '<80/50 or >180/110 mmHg',
                respiratoryRate: '<8 or >35 breaths/min',
                oxygenSaturation: '<88%'
            }
        };

        return ranges[criticality] || ranges.stable;
    }

    /**
     * Generate enhanced prompt section for deterioration mechanics
     * MODULAR: Reusable prompt enhancement
     */
    static generatePromptSection(difficulty: 'easy' | 'medium' | 'hard'): string {
        const profile = this.getProfile(difficulty);
        const vitalRanges = this.getVitalRanges(profile.initialCriticality);

        return `
**CRITICAL: Patient Deterioration Mechanics**
This case will be played over ${profile.timeLimit} seconds (${profile.timeLimit / 60} minutes).
The patient will deteriorate at a rate of ${profile.deteriorationRate} health points per minute.

**Required Consistency:**
1. **Initial Presentation**: Patient should start at ${profile.initialHealth} health
2. **Criticality Level**: Initial state is "${profile.initialCriticality}"
3. **Vital Signs Alignment**: Must match the following ranges for ${profile.initialCriticality} state:
   - Temperature: ${vitalRanges.temperature}
   - Heart Rate: ${vitalRanges.heartRate}
   - Blood Pressure: ${vitalRanges.bloodPressure}
   - Respiratory Rate: ${vitalRanges.respiratoryRate}
   - Oxygen Saturation: ${vitalRanges.oxygenSaturation}
4. **Progression Logic**: Symptoms should logically worsen if untreated for ${profile.timeLimit / 60} minutes
5. **Diagnosis Urgency**: The correct diagnosis should be discoverable within the time limit
6. **Treatment Effectiveness**: Include treatments that can slow/reverse deterioration

**Deterioration Thresholds:**
- 80 health: Mild deterioration signs (patient shows early discomfort)
- 60 health: Moderate worsening (vital signs become concerning)
- 40 health: Critical threshold (immediate intervention required)
- 20 health: Terminal risk (life-threatening without treatment)

**Medical Consistency Requirements:**
- Chief complaint MUST justify the "${profile.initialCriticality}" criticality level
- Vital signs MUST fall within the ranges specified above
- Differential diagnoses MUST explain the deterioration pattern
- Physical findings MUST correlate with the vital signs
- Lab/imaging results MUST support the differential diagnoses
`;
    }

    /**
     * Validate that generated case matches deterioration profile
     * CLEAN: Post-generation validation
     */
    static validateCaseAlignment(caseData: any, difficulty: 'easy' | 'medium' | 'hard'): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const profile = this.getProfile(difficulty);
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check case complexity matches
        if (caseData.caseComplexity !== profile.complexity) {
            warnings.push(`Case complexity "${caseData.caseComplexity}" doesn't match expected "${profile.complexity}"`);
        }

        // Check estimated case length
        if (caseData.estimatedCaseLength !== profile.timeLimit) {
            errors.push(`Case length ${caseData.estimatedCaseLength}s doesn't match profile ${profile.timeLimit}s`);
        }

        // Check vital signs are present
        const vitals = caseData.initialPresentation?.vitalSigns;
        if (!vitals) {
            errors.push('Missing initial vital signs');
        } else {
            // Validate vital signs are within expected ranges
            const ranges = this.getVitalRanges(profile.initialCriticality);

            if (vitals.heartRate) {
                const hrRange = ranges.heartRate.match(/(\d+)-(\d+)/);
                if (hrRange) {
                    const [_, min, max] = hrRange.map(Number);
                    if (vitals.heartRate < min || vitals.heartRate > max) {
                        warnings.push(`Heart rate ${vitals.heartRate} outside expected range ${ranges.heartRate}`);
                    }
                }
            }

            if (vitals.oxygenSaturation) {
                const spo2Range = ranges.oxygenSaturation.match(/(\d+)-(\d+)/);
                if (spo2Range) {
                    const [_, min, max] = spo2Range.map(Number);
                    if (vitals.oxygenSaturation < min || vitals.oxygenSaturation > max) {
                        warnings.push(`O2 saturation ${vitals.oxygenSaturation}% outside expected range ${ranges.oxygenSaturation}`);
                    }
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}
