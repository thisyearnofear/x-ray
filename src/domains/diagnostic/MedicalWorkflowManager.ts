// MODULAR: Realistic medical diagnostic workflow with AI integration
export interface PatientCase {
    id: string
    patientName: string
    age: number
    gender: string
    chiefComplaint: string
    historyOfPresentIllness: string
    pastMedicalHistory: string[]
    medications: string[]
    allergies: string[]
    vitalSigns: VitalSigns
    symptoms: string[]
    physicalExamFindings: string[]
    diagnosticHypothesis: string[]
    differentialDiagnosis: DifferentialDiagnosis[]
    requiredModel: string
    conditions: string[]
    difficulty: 'easy' | 'medium' | 'hard'
    aiGenerated: boolean
    estimatedStudyTime: number
}

export interface VitalSigns {
    bloodPressure: string
    heartRate: number
    respiratoryRate: number
    temperature: number
    oxygenSaturation: number
    painLevel: number
}

export interface DifferentialDiagnosis {
    condition: string
    likelihood: 'high' | 'medium' | 'low'
    reasoning: string
    supportingFindings: string[]
    contradictoryFindings: string[]
}

export interface DiagnosticStep {
    id: string
    name: string
    description: string
    type: 'history' | 'physical_exam' | 'imaging' | 'lab' | 'diagnosis' | 'treatment'
    completed: boolean
    required: boolean
    aiGuidance?: string
    findings?: string[]
}

export class MedicalWorkflowManager {
    private cerebrasService: any
    private currentCase: PatientCase | null = null
    private workflowSteps: DiagnosticStep[] = []
    private callbacks: Map<string, Function[]> = new Map()

    constructor(cerebrasService: any) {
        this.cerebrasService = cerebrasService
    }

    // MODULAR: AI-powered case generation
    public async generatePatientCase(anatomicalModel: string, difficulty: string = 'medium'): Promise<PatientCase> {
        try {
            console.log(`🏥 Generating realistic medical case for ${anatomicalModel}...`)

            // Generate case using Cerebras AI
            const caseData = await this.cerebrasService.generateMedicalCase(anatomicalModel, difficulty)

            this.currentCase = {
                id: `case_${Date.now()}`,
                patientName: caseData.patientName || `Patient ${Math.floor(Math.random() * 1000)}`,
                age: caseData.age || 25 + Math.floor(Math.random() * 50),
                gender: caseData.gender || (Math.random() > 0.5 ? 'Male' : 'Female'),
                chiefComplaint: caseData.chiefComplaint || 'Patient requires diagnostic evaluation',
                historyOfPresentIllness: await this.generateHistoryOfPresentIllness(anatomicalModel),
                pastMedicalHistory: await this.generatePastMedicalHistory(),
                medications: await this.generateCurrentMedications(),
                allergies: await this.generateAllergies(),
                vitalSigns: this.generateVitalSigns(anatomicalModel),
                symptoms: await this.generateSymptoms(anatomicalModel),
                physicalExamFindings: await this.generatePhysicalExamFindings(anatomicalModel),
                diagnosticHypothesis: [],
                differentialDiagnosis: [],
                requiredModel: anatomicalModel,
                conditions: caseData.conditions || [],
                difficulty: difficulty as 'easy' | 'medium' | 'hard',
                aiGenerated: true,
                estimatedStudyTime: caseData.timeLimit || 300
            }

            // Generate differential diagnosis using AI
            await this.generateAIDifferentialDiagnosis()

            // Initialize workflow steps
            this.initializeWorkflowSteps()

            this.emit('caseGenerated', { patientCase: this.currentCase })
            return this.currentCase

        } catch (error) {
            console.warn('AI case generation failed, using fallback:', error)
            return this.generateFallbackCase(anatomicalModel, difficulty)
        }
    }

    private async generateHistoryOfPresentIllness(anatomicalModel: string): Promise<string> {
        try {
            const response = await fetch('/api/medical-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    condition: `Generate a realistic history of present illness for a patient with ${anatomicalModel}-related symptoms. Include onset, duration, character, location, radiation, associated symptoms, timing, exacerbating/relieving factors, and severity.`
                })
            })

            if (response.ok) {
                const data = await response.json()
                return data.choices?.[0]?.message?.content || 'Patient reports symptoms requiring evaluation.'
            }
        } catch (error) {
            console.warn('Failed to generate HPI:', error)
        }

        return 'Patient presents with symptoms requiring diagnostic imaging evaluation.'
    }

    private async generatePastMedicalHistory(): Promise<string[]> {
        const commonConditions = [
            'Hypertension', 'Diabetes Mellitus Type 2', 'Hyperlipidemia', 'GERD',
            'Depression', 'Anxiety', 'Hypothyroidism', 'Osteoarthritis', 'None'
        ]
        return [commonConditions[Math.floor(Math.random() * commonConditions.length)]]
    }

    private async generateCurrentMedications(): Promise<string[]> {
        const commonMeds = [
            'Lisinopril 10mg daily', 'Metformin 500mg twice daily', 'Atorvastatin 20mg daily',
            'Omeprazole 20mg daily', 'Levothyroxine 50mcg daily', 'None'
        ]
        return [commonMeds[Math.floor(Math.random() * commonMeds.length)]]
    }

    private async generateAllergies(): Promise<string[]> {
        const commonAllergies = [
            'Penicillin', 'Sulfa drugs', 'Latex', 'Shellfish', 'None known'
        ]
        return [commonAllergies[Math.floor(Math.random() * commonAllergies.length)]]
    }

    private generateVitalSigns(anatomicalModel: string): VitalSigns {
        const baseVitals = {
            bloodPressure: '120/80',
            heartRate: 72,
            respiratoryRate: 16,
            temperature: 98.6,
            oxygenSaturation: 98,
            painLevel: 3
        }

        // Adjust vitals based on anatomical region and potential conditions
        if (anatomicalModel.includes('heart') || anatomicalModel.includes('chest')) {
            return {
                ...baseVitals,
                heartRate: 85,
                bloodPressure: '135/88',
                painLevel: 6
            }
        }

        if (anatomicalModel.includes('head') || anatomicalModel.includes('brain')) {
            return {
                ...baseVitals,
                bloodPressure: '128/85',
                painLevel: 7
            }
        }

        return baseVitals
    }

    private async generateSymptoms(anatomicalModel: string): Promise<string[]> {
        try {
            const response = await fetch('/api/medical-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    condition: `Generate 4-6 realistic symptoms for a patient with ${anatomicalModel}-related pathology. Make them clinically accurate and specific.`
                })
            })

            if (response.ok) {
                const data = await response.json()
                const content = data.choices?.[0]?.message?.content || ''
                return content.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0).slice(0, 6)
            }
        } catch (error) {
            console.warn('Failed to generate symptoms:', error)
        }

        // Fallback symptoms based on anatomical region
        const fallbackSymptoms: Record<string, string[]> = {
            'head': ['Headache', 'Dizziness', 'Visual disturbances', 'Nausea'],
            'torso': ['Chest pain', 'Shortness of breath', 'Fatigue', 'Palpitations'],
            'fullbody': ['Joint pain', 'Muscle weakness', 'Fatigue', 'Numbness']
        }

        return fallbackSymptoms[anatomicalModel] || ['Pain', 'Discomfort', 'Limited mobility']
    }

    private async generatePhysicalExamFindings(anatomicalModel: string): Promise<string[]> {
        try {
            const response = await fetch('/api/medical-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    condition: `Generate 3-5 realistic physical examination findings for a patient with ${anatomicalModel}-related issues. Include inspection, palpation, and auscultation findings.`
                })
            })

            if (response.ok) {
                const data = await response.json()
                const content = data.choices?.[0]?.message?.content || ''
                return content.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0).slice(0, 5)
            }
        } catch (error) {
            console.warn('Failed to generate physical exam findings:', error)
        }

        return ['Normal inspection', 'Tenderness on palpation', 'Normal range of motion']
    }

    private async generateAIDifferentialDiagnosis() {
        if (!this.currentCase) return

        try {
            const symptoms = this.currentCase.symptoms.join(', ')
            const findings = this.currentCase.physicalExamFindings.join(', ')

            const response = await fetch('/api/medical-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    condition: `Generate a differential diagnosis for a patient with symptoms: ${symptoms} and physical findings: ${findings}. Provide 3-4 most likely diagnoses with likelihood ratings and clinical reasoning.`
                })
            })

            if (response.ok) {
                const data = await response.json()
                const content = data.choices?.[0]?.message?.content || ''

                // Parse AI response into structured differential diagnosis
                this.currentCase.differentialDiagnosis = this.parseDifferentialDiagnosis(content)
            }
        } catch (error) {
            console.warn('Failed to generate differential diagnosis:', error)
        }
    }

    private parseDifferentialDiagnosis(content: string): DifferentialDiagnosis[] {
        // Simple parsing of AI response - in production, use more sophisticated NLP
        const diagnoses: DifferentialDiagnosis[] = []

        // Look for numbered or bulleted lists in the response
        const lines = content.split('\n')
        lines.forEach(line => {
            if (line.match(/^\d+\.|^-|^\*/) && line.length > 10) {
                const diagnosis = line.replace(/^\d+\.|^-|^\*/, '').trim()
                if (diagnosis.length > 0) {
                    diagnoses.push({
                        condition: diagnosis,
                        likelihood: diagnoses.length === 0 ? 'high' : diagnoses.length === 1 ? 'medium' : 'low',
                        reasoning: 'Based on clinical presentation and examination findings',
                        supportingFindings: ['Clinical correlation needed'],
                        contradictoryFindings: []
                    })
                }
            }
        })

        return diagnoses.length > 0 ? diagnoses : [{
            condition: 'Further clinical evaluation needed',
            likelihood: 'medium',
            reasoning: 'Additional diagnostic workup required',
            supportingFindings: ['Clinical presentation'],
            contradictoryFindings: []
        }]
    }

    private initializeWorkflowSteps() {
        if (!this.currentCase) return

        this.workflowSteps = [
            {
                id: 'patient_history',
                name: 'Patient History',
                description: 'Review patient history and chief complaint',
                type: 'history',
                completed: false,
                required: true,
                aiGuidance: `Patient presents with: ${this.currentCase.chiefComplaint}. History reveals: ${this.currentCase.historyOfPresentIllness}`
            },
            {
                id: 'vital_signs',
                name: 'Vital Signs Assessment',
                description: 'Review vital signs and basic measurements',
                type: 'physical_exam',
                completed: false,
                required: true,
                aiGuidance: `Vital signs: BP ${this.currentCase.vitalSigns.bloodPressure}, HR ${this.currentCase.vitalSigns.heartRate}, RR ${this.currentCase.vitalSigns.respiratoryRate}`
            },
            {
                id: 'physical_exam',
                name: 'Physical Examination',
                description: 'Perform systematic physical examination',
                type: 'physical_exam',
                completed: false,
                required: true,
                aiGuidance: `Key findings: ${this.currentCase.physicalExamFindings.join(', ')}`
            },
            {
                id: 'imaging_study',
                name: 'X-Ray Imaging Study',
                description: `Perform ${this.currentCase?.requiredModel || 'general'} X-ray examination`,
                type: 'imaging',
                completed: false,
                required: true,
                aiGuidance: `Focus on ${this.currentCase?.requiredModel || 'target'} region. Look for anatomical abnormalities and pathological findings.`
            },
            {
                id: 'differential_diagnosis',
                name: 'Differential Diagnosis',
                description: 'Develop comprehensive differential diagnosis',
                type: 'diagnosis',
                completed: false,
                required: true,
                aiGuidance: `Consider: ${this.currentCase.differentialDiagnosis.map(d => d.condition).join(', ')}`
            },
            {
                id: 'final_diagnosis',
                name: 'Final Diagnosis',
                description: 'Synthesize findings into final diagnosis',
                type: 'diagnosis',
                completed: false,
                required: true
            }
        ]
    }

    private generateFallbackCase(anatomicalModel: string, difficulty: string): PatientCase {
        return {
            id: `fallback_${Date.now()}`,
            patientName: `Patient ${Math.floor(Math.random() * 1000)}`,
            age: 35,
            gender: 'Unknown',
            chiefComplaint: 'Diagnostic imaging evaluation needed',
            historyOfPresentIllness: 'Patient requires comprehensive diagnostic assessment.',
            pastMedicalHistory: ['Not available'],
            medications: ['Not available'],
            allergies: ['Unknown'],
            vitalSigns: {
                bloodPressure: '120/80',
                heartRate: 75,
                respiratoryRate: 16,
                temperature: 98.6,
                oxygenSaturation: 97,
                painLevel: 4
            },
            symptoms: ['Requires evaluation'],
            physicalExamFindings: ['Normal examination'],
            diagnosticHypothesis: [],
            differentialDiagnosis: [],
            requiredModel: anatomicalModel,
            conditions: [],
            difficulty: difficulty as 'easy' | 'medium' | 'hard',
            aiGenerated: false,
            estimatedStudyTime: 300
        }
    }

    // MODULAR: Workflow progression
    public completeWorkflowStep(stepId: string, findings?: string[]): boolean {
        const step = this.workflowSteps.find(s => s.id === stepId)
        if (!step) return false

        step.completed = true
        if (findings) {
            step.findings = findings
        }

        this.emit('stepCompleted', { step, findings })
        return true
    }

    public getNextRequiredStep(): DiagnosticStep | null {
        return this.workflowSteps.find(step => step.required && !step.completed) || null
    }

    public isWorkflowComplete(): boolean {
        return this.workflowSteps.every(step => step.required ? step.completed : true)
    }

    // MODULAR: AI-powered diagnostic guidance
    public async getAIDiagnosticGuidance(stepId: string): Promise<string> {
        const step = this.workflowSteps.find(s => s.id === stepId)
        if (!step) return 'Step not found'

        if (step.aiGuidance) return step.aiGuidance

        try {
            const response = await fetch('/api/medical-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    condition: `Provide clinical guidance for ${step.name} in the context of ${this.currentCase?.requiredModel} imaging. Include key points to consider and potential findings.`
                })
            })

            if (response.ok) {
                const data = await response.json()
                const guidance = data.choices?.[0]?.message?.content || ''
                step.aiGuidance = guidance
                return guidance
            }
        } catch (error) {
            console.warn('Failed to get AI guidance:', error)
        }

        return 'Clinical correlation and systematic approach recommended.'
    }

    // Public API
    public getCurrentCase(): PatientCase | null {
        return this.currentCase
    }

    public getWorkflowSteps(): DiagnosticStep[] {
        return [...this.workflowSteps]
    }

    public getDifferentialDiagnosis(): DifferentialDiagnosis[] {
        return this.currentCase?.differentialDiagnosis || []
    }

    // MODULAR: Public access to Cerebras service for AI integration
    public getCerebrasService(): any {
        return this.cerebrasService
    }

    public on(event: string, callback: Function) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, [])
        }
        this.callbacks.get(event)!.push(callback)
    }

    private emit(event: string, data?: any) {
        const callbacks = this.callbacks.get(event) || []
        callbacks.forEach(callback => callback(data))
    }
}