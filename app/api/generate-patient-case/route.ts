/**
 * AI Patient Case Generation API
 * ENHANCEMENT FIRST: Leverages existing medical-analysis API patterns
 * MONETIZABLE: Premium-only endpoint for AI case generation
 * PERFORMANT: Efficient AI inference with cost tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { DeteriorationProfileManager } from '@/src/domains/medical/services/DeteriorationProfileManager';
import { AIGeneratedCaseValidator } from '@/src/domains/medical/services/AIGeneratedCaseValidator';

interface GeneratedPatientCase {
    patientName: string;
    age: number;
    gender: string;
    occupation: string;
    socialHistory: string;
    chiefComplaint: string;
    initialPresentation: {
        vitalSigns: {
            temperature: number;
            heartRate: number;
            bloodPressure: string;
            respiratoryRate: number;
            oxygenSaturation: number;
        };
        generalAssessment: string;
    };
    hiddenElements: {
        fullHistory: string;
        pastMedicalHistory: string;
        physicalFindings: string[];
        labResults: { [key: string]: string };
        imagingFindings: { [key: string]: string };
        differentialDiagnosis: Array<{
            condition: string;
            likelihood: string;
            reasoning: string;
        }>;
    };
    underlyingConditions: Array<{
        condition: string;
        diagnosis: string;
        severity: 'low' | 'medium' | 'high';
        requiredModel: 'head' | 'chest' | 'torso' | 'abdomen' | 'fullbody';
        symptoms: string[];
    }>;
    caseComplexity: 'straightforward' | 'complex' | 'advanced';
    estimatedCaseLength: number;
    timestamp: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            model,
            difficulty = 'medium',
            specialty,
            caseNumber = 1,
            smartAccount,
            delegationEnabled,
            userPreferences,
            sessionSeed // PERFORMANT: Deterministic seed for reproducibility
        } = body;

        // MONETIZABLE: Verify this is a premium request
        if (!smartAccount) {
            return NextResponse.json(
                { error: 'Smart account required for AI case generation' },
                { status: 401 }
            );
        }

        if (!model) {
            return NextResponse.json(
                { error: 'Model parameter is required (head, torso, fullbody)' },
                { status: 400 }
            );
        }

        // PERFORMANT: Get deterioration profile for medical consistency
        const deteriorationProfile = DeteriorationProfileManager.getProfile(difficulty);

        // CLEAN: Create base prompt
        const basePrompt = createPatientGenerationPrompt(model, difficulty, specialty, caseNumber);

        // ENHANCEMENT FIRST: Add deterioration mechanics to prompt
        const deteriorationSection = DeteriorationProfileManager.generatePromptSection(difficulty);

        // PERFORMANT: Retry logic with validation feedback
        const MAX_RETRIES = 2;
        let attempt = 0;
        let lastValidationResult: any = null;
        let generatedCase: GeneratedPatientCase | null = null;

        while (attempt < MAX_RETRIES && !generatedCase) {
            attempt++;
            console.log(`🔄 Generation attempt ${attempt}/${MAX_RETRIES}`);

            // CLEAN: Build prompt with validation feedback if retrying
            let currentPrompt = basePrompt + '\n\n' + deteriorationSection;

            if (lastValidationResult && !lastValidationResult.isValid) {
                // PERFORMANT: Add validation feedback to prompt
                currentPrompt += '\n\n**CRITICAL CORRECTIONS REQUIRED:**\n';
                currentPrompt += 'The previous attempt had the following issues:\n\n';

                if (lastValidationResult.errors.length > 0) {
                    currentPrompt += '**ERRORS (must fix):**\n';
                    lastValidationResult.errors.forEach((err: string) => {
                        currentPrompt += `- ${err}\n`;
                    });
                }

                if (lastValidationResult.warnings.length > 0) {
                    currentPrompt += '\n**WARNINGS (should improve):**\n';
                    lastValidationResult.warnings.forEach((warn: string) => {
                        currentPrompt += `- ${warn}\n`;
                    });
                }

                currentPrompt += '\nPlease generate a NEW case that addresses all the above issues.\n';
            }

            let generatedCaseRaw: string | undefined;

            try {
                // PERFORMANT: Try Venice AI first (most reliable, privacy-first, uncensored)
                if (process.env.VENICE_API_KEY) {
                    console.log('🔒 Attempting Venice AI (primary, privacy-first)...');
                    try {
                        generatedCaseRaw = await generateCaseWithVenice(currentPrompt, sessionSeed ? sessionSeed + attempt : undefined);
                        console.log('✅ Venice AI succeeded');
                    } catch (veniceError) {
                        console.warn('⚠️ Venice AI failed, trying Cerebras:', veniceError);
                        // Continue to Cerebras fallback
                    }
                }

                // Fallback to Cerebras if Venice failed or not configured
                if (!generatedCaseRaw && process.env.CEREBRAS_API_KEY) {
                    console.log('🧠 Attempting Cerebras AI (secondary)...');
                    const cerebrasResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
                        },
                        body: JSON.stringify({
                            model: 'llama3.1-70b',
                            messages: [
                                {
                                    role: 'system',
                                    content: `You are an expert medical educator creating realistic, unpredictable patient cases for emergency medicine training.

CRITICAL: Generate ENTIRELY UNPREDICTABLE cases that cannot be guessed from symptoms or initial presentation. Include rare conditions, atypical presentations, and complex multi-system pathology.

Focus on EMERGENCY MEDICINE scenarios appropriate for a PGY-2 resident level. Include time-sensitive decisions, complications, and realistic clinical judgment calls.

Structure your response as valid JSON matching the GeneratedPatientCase interface. Ensure all fields are populated with medically accurate, varied content.

**MOST IMPORTANT**: Ensure the case aligns with the deterioration mechanics specified in the user prompt. Vital signs MUST match the criticality level, and the diagnosis MUST be discoverable within the time limit.`
                                },
                                {
                                    role: 'user',
                                    content: currentPrompt // PERFORMANT: Use prompt with validation feedback
                                }
                            ],
                            temperature: 0.7, // PERFORMANT: Reduced from 0.8 for more consistency
                            max_tokens: 1500, // PERFORMANT: Increased for complete cases
                            top_p: 0.85, // PERFORMANT: Reduced from 0.9
                            seed: sessionSeed ? sessionSeed + attempt : undefined, // PERFORMANT: Vary seed on retry
                            response_format: { type: "json_object" }
                        }),
                    });

                    if (!cerebrasResponse.ok) {
                        console.error(`Cerebras API error: ${cerebrasResponse.status}`, await cerebrasResponse.text());
                        throw new Error(`Cerebras API error: ${cerebrasResponse.status}`);
                    }

                    const cerebrasData = await cerebrasResponse.json();
                    generatedCaseRaw = cerebrasData.choices[0]?.message?.content;

                    if (!generatedCaseRaw) {
                        throw new Error('No content received from Cerebras API');
                    }
                    console.log('✅ Cerebras AI succeeded');
                }
            } catch (primaryError) {
                console.error('Primary AI providers failed, attempting Gemini fallback:', primaryError);

                // Fallback to Gemini if both Venice and Cerebras failed
                try {
                    console.log('🔮 Attempting Gemini AI (tertiary fallback)...');
                    generatedCaseRaw = await generateCaseWithGemini(currentPrompt); // CLEAN: Use current prompt
                    console.log('✅ Gemini AI succeeded');
                } catch (geminiError) {
                    console.error('Gemini API also failed:', geminiError);

                    // If this is the last attempt, throw error
                    if (attempt >= MAX_RETRIES) {
                        throw new Error('All AI providers failed (Venice, Cerebras, Gemini)');
                    }

                    // Otherwise, continue to next attempt
                    continue;
                }
            }

            console.log('Raw AI response:', generatedCaseRaw);

            // CLEAN: Ensure we have a response before parsing
            if (!generatedCaseRaw) {
                console.error('No AI response received');
                if (attempt >= MAX_RETRIES) {
                    return NextResponse.json(
                        { error: 'No AI response after retries', fallback: getFallbackCase() },
                        { status: 500 }
                    );
                }
                continue;
            }

            try {
                // Extract JSON from the response - the AI might include markdown or extra text
                const jsonMatch = generatedCaseRaw.match(/```json\n([\s\S]*?)\n```/) ||
                    generatedCaseRaw.match(/\{[\s\S]*\}/);

                const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : generatedCaseRaw;
                const parsedCase = JSON.parse(jsonString.trim());

                // Validate required fields
                if (!parsedCase.patientName || !parsedCase.chiefComplaint) {
                    throw new Error('Invalid case structure - missing required fields');
                }

                parsedCase.timestamp = Date.now();

                // PERFORMANT: Validate with AIGeneratedCaseValidator
                const validationResult = AIGeneratedCaseValidator.validateFully(parsedCase);
                lastValidationResult = validationResult;

                // Log validation results
                if (validationResult.warnings.length > 0 || !validationResult.isValid) {
                    console.warn(`⚠️ Attempt ${attempt} validation (score: ${validationResult.score}/100):`);
                    console.warn(AIGeneratedCaseValidator.getValidationReport(validationResult));
                } else {
                    console.log(`✅ Attempt ${attempt} validated successfully (score: ${validationResult.score}/100)`);
                }

                // PERFORMANT: Accept case if valid or if this is the last attempt
                if (validationResult.isValid || attempt >= MAX_RETRIES) {
                    // CLEAN: Validate alignment with deterioration profile
                    const alignmentValidation = DeteriorationProfileManager.validateCaseAlignment(parsedCase, difficulty);

                    if (!alignmentValidation.isValid) {
                        console.warn('⚠️ Case does not align with deterioration profile:', alignmentValidation.errors);
                    }

                    if (alignmentValidation.warnings.length > 0) {
                        console.warn('⚠️ Case alignment warnings:', alignmentValidation.warnings);
                    }

                    // PERFORMANT: Ensure case has deterioration metadata
                    parsedCase.estimatedCaseLength = deteriorationProfile.timeLimit;
                    parsedCase.caseComplexity = deteriorationProfile.complexity;

                    generatedCase = parsedCase;

                    if (attempt > 1) {
                        console.log(`✅ Case accepted after ${attempt} attempts`);
                    }
                } else {
                    console.log(`🔄 Validation failed on attempt ${attempt}, retrying...`);
                }

            } catch (parseError) {
                console.error(`JSON parsing error on attempt ${attempt}:`, parseError);
                console.error('Raw response:', generatedCaseRaw);

                // If this is the last attempt, return error
                if (attempt >= MAX_RETRIES) {
                    return NextResponse.json(
                        { error: 'Failed to parse AI-generated case after retries', raw: generatedCaseRaw },
                        { status: 500 }
                    );
                }

                // Otherwise, continue to next attempt
                continue;
            }
        }

        // If we still don't have a valid case, return fallback
        if (!generatedCase) {
            console.error('❌ All validation attempts failed, using fallback');
            return NextResponse.json(
                { error: 'Validation failed after retries', fallback: getFallbackCase() },
                { status: 500 }
            );
        }

        return NextResponse.json(generatedCase);

    } catch (error) {
        console.error('Patient case generation error:', error);
        return NextResponse.json(
            { error: 'Case generation failed', fallback: getFallbackCase() },
            { status: 500 }
        );
    }
}

function createPatientGenerationPrompt(
    model: string,
    difficulty: string,
    specialty?: string,
    caseNumber: number = 1
): string {
    const specialties = ['Emergency Medicine', 'Internal Medicine', 'Surgery', 'Pediatrics', 'Obstetrics/Gynecology'];

    return `Generate a complex Emergency Medicine patient case for ${model} scanning.

**Scenario Parameters:**
- Scan Model: ${model}
- Difficulty: ${difficulty}
- Specialty Training: ${specialty || specialties[caseNumber % specialties.length]}
- Case Number: ${caseNumber}

**Requirements:**
1. **MAKE IT UNPREDICTABLE:** Use rare conditions, atypical presentations, unusual symptom combinations, or complex multi-system disease
2. **Emergency Medicine Focus:** Time-sensitive decisions, complications, rapid assessment needs
3. **Progressive Revelation:** Structure information to unlock gradually through actions
4. **Educational Value:** Include learning points, critical actions, and realistic outcomes
5. **Varied Demographics:** Equal distribution across age/gender/ethnic backgrounds

**Structure Required:**
{
  "patientName": "Authentic male name (ethnic diversity)",
  "age": number (18-85, varied distribution),
  "gender": "Male",
  "occupation": "Realistic occupation affecting presentation",
  "socialHistory": "Brief relevant social factors",
  "chiefComplaint": "Concise primary complaint",
  "initialPresentation": {
    "vitalSigns": {
      "temperature": ${getTemperatureRange()},
      "heartRate": ${getHeartRateRange()},
      "bloodPressure": "${getBloodPressureRange(difficulty)}",
      "respiratoryRate": ${getRespiratoryRateRange()},
      "oxygenSaturation": ${getOxygenSatRange()}
    },
    "generalAssessment": "Brief general appearance assessment"
  },
  "hiddenElements": {
    "fullHistory": "Complete detailed history - HPI, PMH, medications, allergies, social history",
    "physicalFindings": ["Array of physical exam findings revealed after focused exam"],
    "labResults": {"tests": "results", "CBC": "normal", "BMP": "shows metabolic acidosis"},
    "imagingFindings": {"${model} XR": "findings description"},
    "differentialDiagnosis": [
      {"condition": "Most likely diagnosis", "likelihood": "High", "reasoning": "Key features matching"},
      {"condition": "Alternative diagnosis", "likelihood": "Medium", "reasoning": "Similar but less likely"}
    ]
  },
  "underlyingConditions": [
    {
      "condition": "${getComplexConditions(model, difficulty)}",
      "diagnosis": "Actual final diagnosis",
      "severity": "low/medium/high",
      "requiredModel": "${model}",
      "symptoms": ["Key presenting symptoms"]
    }
  ],
  "caseComplexity": "${difficulty === 'easy' ? 'straightforward' : difficulty === 'hard' ? 'advanced' : 'complex'}",
  "estimatedCaseLength": ${difficulty === 'easy' ? 300 : difficulty === 'hard' ? 900 : 600}
}

**Key Innovation:** Make each case require INVESTIGATION - symptoms alone should never reveal the diagnosis. Include red herrings, confounding factors, and unexpected twists.`;
}

function getTemperatureRange(): string {
    const ranges = ['96.8-98.6 normal', '100.4-104.0 febrile', '95.0-96.7 hypothermic'];
    return ranges[Math.floor(Math.random() * ranges.length)];
}

function getHeartRateRange(): string {
    const ranges = ['60-100 normal', '40-59 bradycardia', '101-140 tachycardia', '141-180 severe tachycardia'];
    return ranges[Math.floor(Math.random() * ranges.length)];
}

function getBloodPressureRange(difficulty: string): string {
    if (difficulty === 'hard') {
        const critical = ['80/50 hypotension', '200/120 hypertensive emergency', '90/60 compensated shock'];
        return critical[Math.floor(Math.random() * critical.length)];
    }
    return '110/70 - 140/90 normal to elevated';
}

function getRespiratoryRateRange(): string {
    const ranges = ['12-20 normal', '8-11 bradypnea', '21-30 tachypnea', '30-40 severe distress'];
    return ranges[Math.floor(Math.random() * ranges.length)];
}

function getOxygenSatRange(): string {
    const ranges = ['96-100 normal', '91-95 hypoxemic', '85-90 significant hypoxia'];
    return ranges[Math.floor(Math.random() * ranges.length)];
}

function getComplexConditions(model: string, difficulty: string): string {
    const conditions = {
        head: difficulty === 'hard'
            ? ['Cerebral Venous Sinus Thrombosis', 'Reversible Cerebral Vasoconstriction Syndrome', 'Hashimoto Encephalopathy']
            : ['Complex Migraine with Aura', 'Vestibular Neuritis', 'Temporal Arteritis'],
        torso: difficulty === 'hard'
            ? ['Eosinophilic Granuloma with Polyangiitis', 'Mesenteric Ischemia', 'Spontaneous Coronary Artery Dissection']
            : ['Dressler Syndrome', 'Acute Pancreatitis', 'Pericardial Effusion'],
        fullbody: difficulty === 'hard'
            ? ['Systemic Capillary Leak Syndrome', 'Hereditary Hemorrhagic Telangiectasia', 'Adult-onset Still Disease']
            : ['Seronegative Spondyloarthropathy', 'Hyperthyroidism', 'Hypothyroidism']
    };

    return conditions[model as keyof typeof conditions][Math.floor(Math.random() * 3)] || 'Unusual Presentation';
}

function getFallbackCase(): GeneratedPatientCase {
    return {
        patientName: "Marcus Chen",
        age: 34,
        gender: "Male",
        occupation: "Software Engineer",
        socialHistory: "Non-smoker, occasional alcohol, regular exercise",
        chiefComplaint: "Chest pain and shortness of breath",
        initialPresentation: {
            vitalSigns: {
                temperature: 98.6,
                heartRate: 110,
                bloodPressure: "140/90",
                respiratoryRate: 24,
                oxygenSaturation: 95
            },
            generalAssessment: "Patient appears anxious, sitting upright, using accessory muscles for breathing"
        },
        hiddenElements: {
            fullHistory: "34-year-old software engineer presents with acute onset chest pain and dyspnea. Pain started 2 hours ago while at work, sharp, 8/10, radiates to left arm. No prior cardiac history but family history of early MI. Denies smoking, occasional stress-related drinking.",
            pastMedicalHistory: "No significant PMH. Remote history of reactive airway disease as child.",
            physicalFindings: [
                "Heart: Regular tachycardia, no murmurs",
                "Lungs: Clear bilaterally, no wheezes",
                "Abdomen: Soft, non-tender"
            ],
            labResults: {
                "Troponin": "0.08 ng/mL (elevated)",
                "ECG": "Sinus tachycardia, ST elevations in anterior leads"
            },
            imagingFindings: {
                "Chest X-ray": "Clear, no acute findings"
            },
            differentialDiagnosis: [
                {
                    condition: "Acute Myocardial Infarction",
                    likelihood: "High",
                    reasoning: "Elevated troponin, ECG changes, classic chest pain with radiation"
                },
                {
                    condition: "Pulmonary Embolism",
                    likelihood: "Medium",
                    reasoning: "Risk factors for thrombosis, dyspnea present"
                }
            ]
        },
        underlyingConditions: [
            {
                condition: "Anterior STEMI",
                diagnosis: "ST-Elevation Myocardial Infarction - Anterior Wall",
                severity: "high",
                requiredModel: "torso",
                symptoms: ["Chest pain", "Dyspnea", "Anxiety"]
            }
        ],
        caseComplexity: "complex",
        estimatedCaseLength: 600,
        timestamp: Date.now()
    };
}

// ENHANCEMENT: Gemini API fallback for improved reliability
async function generateCaseWithGemini(prompt: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `You are an expert medical educator creating realistic, unpredictable patient cases for emergency medicine training.

CRITICAL: Generate ENTIRELY UNPREDICTABLE cases that cannot be guessed from symptoms or initial presentation. Include rare conditions, atypical presentations, and complex multi-system pathology.

Focus on EMERGENCY MEDICINE scenarios appropriate for a PGY-2 resident level. Include time-sensitive decisions, complications, and realistic clinical judgment calls.

Structure your response as valid JSON matching the GeneratedPatientCase interface. Ensure all fields are populated with medically accurate, varied content.

${prompt}`
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 1200,
                topP: 0.9
            }
        }),
    });

    if (!geminiResponse.ok) {
        console.error(`Gemini API error: ${geminiResponse.status}`, await geminiResponse.text());
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedCaseRaw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedCaseRaw) {
        throw new Error('No content received from Gemini API');
    }

    return generatedCaseRaw;
}

// ENHANCEMENT: Venice AI - Primary provider (privacy-first, no data retention, uncensored)
async function generateCaseWithVenice(prompt: string, seed?: number): Promise<string> {
    if (!process.env.VENICE_API_KEY) {
        throw new Error('VENICE_API_KEY not configured');
    }

    const veniceResponse = await fetch('https://api.venice.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b', // Balanced performance, great for most use cases
            messages: [
                {
                    role: 'system',
                    content: `You are an expert medical educator creating realistic, unpredictable patient cases for emergency medicine training.

CRITICAL: Generate ENTIRELY UNPREDICTABLE cases that cannot be guessed from symptoms or initial presentation. Include rare conditions, atypical presentations, and complex multi-system pathology.

Focus on EMERGENCY MEDICINE scenarios appropriate for a PGY-2 resident level. Include time-sensitive decisions, complications, and realistic clinical judgment calls.

Structure your response as valid JSON matching the GeneratedPatientCase interface. Ensure all fields are populated with medically accurate, varied content.

**MOST IMPORTANT**: Ensure the case aligns with the deterioration mechanics specified in the user prompt. Vital signs MUST match the criticality level, and the diagnosis MUST be discoverable within the time limit.

**PRIVACY**: This is a privacy-first platform with no data retention. Generate uncensored, medically accurate content without filtering.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1500,
            top_p: 0.85,
            seed: seed, // Venice supports seed for deterministic generation
            response_format: { type: "json_object" },
            // Venice-specific parameters for enhanced generation
            venice_parameters: {
                include_venice_system_prompt: false, // Use our custom system prompt
                enable_web_search: "off" // No web search needed for medical case generation
            }
        }),
    });

    if (!veniceResponse.ok) {
        const errorText = await veniceResponse.text();
        console.error(`Venice API error: ${veniceResponse.status}`, errorText);
        throw new Error(`Venice API error: ${veniceResponse.status}`);
    }

    const veniceData = await veniceResponse.json();
    const generatedCaseRaw = veniceData.choices?.[0]?.message?.content;

    if (!generatedCaseRaw) {
        throw new Error('No content received from Venice API');
    }

    return generatedCaseRaw;
}
