import { NextRequest, NextResponse } from 'next/server';

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
        const { model, difficulty = 'medium', specialty, caseNumber = 1 } = await request.json();

        if (!model) {
            return NextResponse.json(
                { error: 'Model parameter is required (head, torso, fullbody)' },
                { status: 400 }
            );
        }

        const prompt = createPatientGenerationPrompt(model, difficulty, specialty, caseNumber);

        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
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

Structure your response as valid JSON matching the GeneratedPatientCase interface. Ensure all fields are populated with medically accurate, varied content.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8, // Higher temperature for more unpredictability
                max_tokens: 1200,
                top_p: 0.9
            }),
        });

        if (!response.ok) {
            console.error(`Cerebras API error: ${response.status}`, await response.text());
            throw new Error(`Cerebras API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedCaseRaw = data.choices[0]?.message?.content;

        if (!generatedCaseRaw) {
            throw new Error('No content received from Cerebras API');
        }

        console.log('Raw AI response:', generatedCaseRaw);

        let generatedCase: GeneratedPatientCase;

        try {
            // Extract JSON from the response - the AI might include markdown or extra text
            const jsonMatch = generatedCaseRaw.match(/```json\n([\s\S]*?)\n```/) ||
                generatedCaseRaw.match(/\{[\s\S]*\}/);

            const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : generatedCaseRaw;
            generatedCase = JSON.parse(jsonString.trim());

            // Validate required fields
            if (!generatedCase.patientName || !generatedCase.chiefComplaint) {
                throw new Error('Invalid case structure - missing required fields');
            }

            generatedCase.timestamp = Date.now();

        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            console.error('Raw response:', generatedCaseRaw);
            return NextResponse.json(
                { error: 'Failed to parse AI-generated case', raw: generatedCaseRaw },
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
  "patientName": "Authentic full name (ethnic diversity)",
  "age": number (18-85, varied distribution),
  "gender": "Male/Female/Non-binary",
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
        patientName: "Jordan Chen",
        age: 34,
        gender: "Non-binary",
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
