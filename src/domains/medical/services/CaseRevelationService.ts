/**
 * Case Revelation Service
 * MANAGES: Progressive disclosure of patient information
 * TRIGGERS: Information unlock based on investigation actions
 * INTEGRATES: With AI-generated patient cases and investigation workflows
 * GUARANTEES: Information unfolds logically and educationally
 */

import { PatientCase } from './MedicalDataService'

export interface RevelationState {
    // Core information (always available)
    chiefComplaint: boolean

    // Unlocked through patient interview
    detailedHistory: boolean
    pastMedicalHistory: boolean
    reviewOfSystems: boolean

    // Unlocked through physical examination
    vitalSigns: boolean
    generalAppearance: boolean

    // Unlocked through investigation actions
    labResults: boolean
    imagingResults: boolean
    physicalFindings: boolean

    // Unlocked through consultations
    specialistOpinion: boolean

    // Synthesis (all info collected)
    differentialDiagnosis: boolean
    diagnosisSynthesis: boolean
}

export interface InvestigationAction {
    type: 'interview' | 'lab_order' | 'imaging' | 'consultation' | 'exam'
    subtype?: string // e.g., 'CBC', 'CT_head', 'cardiology'
    timestamp: number
}

export class CaseRevelationService {
    private patientCase: PatientCase | null = null
    private revelationState: RevelationState
    private investigationHistory: InvestigationAction[] = []
    private caseStartTime: number = 0

    constructor() {
        this.revelationState = this.getInitialRevelationState()
    }

    // INITIALIZE: Load a new patient case and reset state
    loadPatientCase(patientCase: PatientCase): void {
        this.patientCase = patientCase
        this.revelationState = this.getInitialRevelationState()
        this.investigationHistory = []
        this.caseStartTime = Date.now()

        console.log('🎯 Case loaded:', patientCase.id, 'Initial revelation:', Object.keys(this.revelationState).filter(k => this.revelationState[k as keyof RevelationState]))
    }

    private getInitialRevelationState(): RevelationState {
        return {
            chiefComplaint: true, // Always revealed first
            detailedHistory: false,
            pastMedicalHistory: false,
            reviewOfSystems: false,
            vitalSigns: false,
            generalAppearance: false,
            labResults: false,
            imagingResults: false,
            physicalFindings: false,
            specialistOpinion: false,
            differentialDiagnosis: false,
            diagnosisSynthesis: false
        }
    }

    // INVESTIGATE: Perform an investigation action and unlock information
    performInvestigation(action: InvestigationAction): string[] {
        this.investigationHistory.push(action)

        const unlockedInfo: string[] = []

        switch (action.type) {
            case 'interview':
                unlockedInfo.push(...this.unlockInterviewInformation(action))
                break
            case 'exam':
                unlockedInfo.push(...this.unlockPhysicalExamination(action))
                break
            case 'lab_order':
                unlockedInfo.push(...this.unlockLabResults(action))
                break
            case 'imaging':
                unlockedInfo.push(...this.unlockImagingResults(action))
                break
            case 'consultation':
                unlockedInfo.push(...this.unlockConsultationOpinion(action))
                break
        }

        // Check if synthesis is now available
        if (this.canUnlockSynthesis()) {
            this.revelationState.differentialDiagnosis = true
            this.revelationState.diagnosisSynthesis = true
            unlockedInfo.push('differential_diagnosis', 'diagnosis_synthesis')
        }

        if (unlockedInfo.length > 0) {
            console.log('🔓 Investigation unlocked:', unlockedInfo)
        }

        return unlockedInfo
    }

    private unlockInterviewInformation(action: InvestigationAction): string[] {
        const unlocked = []

        if (!this.revelationState.detailedHistory) {
            this.revelationState.detailedHistory = true
            unlocked.push('detailed_history')
        }

        if (!this.revelationState.pastMedicalHistory && action.subtype !== 'focused') {
            this.revelationState.pastMedicalHistory = true
            unlocked.push('past_medical_history')
        }

        if (!this.revelationState.reviewOfSystems) {
            this.revelationState.reviewOfSystems = true
            unlocked.push('review_of_systems')
        }

        return unlocked
    }

    private unlockPhysicalExamination(action: InvestigationAction): string[] {
        const unlocked = []

        if (!this.revelationState.vitalSigns) {
            this.revelationState.vitalSigns = true
            unlocked.push('vital_signs')
        }

        if (!this.revelationState.generalAppearance) {
            this.revelationState.generalAppearance = true
            unlocked.push('general_appearance')
        }

        // Unlock targeted physical findings based on exam type
        if (action.subtype && this.unlocksPhysicalFindings(action.subtype)) {
            if (!this.revelationState.physicalFindings) {
                this.revelationState.physicalFindings = true
                unlocked.push('physical_findings')
            }
        }

        return unlocked
    }

    private unlocksPhysicalFindings(examType: string): boolean {
        // Physical findings unlock after examination (or sometimes through scanning)
        const findingsUnlockingExams = [
            'cardiovascular', 'respiratory', 'abdominal', 'neurological',
            'musculoskeletal', 'skin', 'head_neck'
        ]
        return findingsUnlockingExams.includes(examType)
    }

    private unlockLabResults(action: InvestigationAction): string[] {
        if (this.revelationState.labResults) return []

        // Lab results unlock immediately (but may have turn-around time in more advanced systems)
        this.revelationState.labResults = true
        return ['lab_results']
    }

    private unlockImagingResults(action: InvestigationAction): string[] {
        if (this.revelationState.imagingResults) return []

        // Imaging results unlock after ordering (but may have delays)
        this.revelationState.imagingResults = true
        return ['imaging_results']
    }

    private unlockConsultationOpinion(action: InvestigationAction): string[] {
        if (this.revelationState.specialistOpinion) return []

        this.revelationState.specialistOpinion = true
        return ['specialist_opinion']
    }

    private canUnlockSynthesis(): boolean {
        // Synthesis available when substantial investigation completed
        const requiredStates = [
            'detailedHistory', 'pastMedicalHistory', 'vitalSigns', 'physicalFindings'
        ]

        const completedActions = requiredStates.filter(key => this.revelationState[key as keyof RevelationState])
        const optionalStates = ['labResults', 'imagingResults', 'specialistOpinion']
        const optionalCompleted = optionalStates.filter(key => this.revelationState[key as keyof RevelationState])

        // Need at least 3 of 4 required + 1 of 3 optional, or all required
        return completedActions.length >= 3 && (optionalCompleted.length >= 1 || completedActions.length === 4)
    }

    // GET STATE: Access current revelation state
    getRevelationState(): RevelationState {
        return { ...this.revelationState }
    }

    isRevealed(informationType: keyof RevelationState): boolean {
        return this.revelationState[informationType]
    }

    // GET REVEALED INFO: Get accessible patient information
    getRevealedPatientInfo(): Partial<PatientCase> {
        if (!this.patientCase) return {}

        const revealed: any = {
            id: this.patientCase.id,
            patientName: this.patientCase.patientName,
            age: this.patientCase.age,
            gender: this.patientCase.gender,
            occupation: this.patientCase.occupation,
            socialHistory: this.patientCase.socialHistory,
            chiefComplaint: this.patientCase.chiefComplaint,
            requiredModel: this.patientCase.requiredModel,
            symptoms: this.patientCase.symptoms,
            caseComplexity: this.patientCase.caseComplexity,
            estimatedCaseLength: this.patientCase.estimatedCaseLength
        }

        // Add progressively revealed information
        if (this.revelationState.detailedHistory) {
            revealed.historyOfPresentIllness = this.patientCase.historyOfPresentIllness
        }

        if (this.revelationState.vitalSigns && this.patientCase.initialPresentation?.vitalSigns) {
            revealed.initialPresentation = { vitalSigns: this.patientCase.initialPresentation.vitalSigns }
        }

        if (this.revelationState.generalAppearance && this.patientCase.initialPresentation?.generalAssessment) {
            revealed.initialPresentation = {
                ...revealed.initialPresentation,
                generalAssessment: this.patientCase.initialPresentation.generalAssessment
            }
        }

        if (this.revelationState.labResults && this.patientCase.hiddenElements?.labResults) {
            revealed.labResults = this.patientCase.hiddenElements.labResults
        }

        if (this.revelationState.imagingResults && this.patientCase.hiddenElements?.imagingFindings) {
            revealed.imagingFindings = this.patientCase.hiddenElements.imagingFindings
        }

        if (this.revelationState.physicalFindings && this.patientCase.hiddenElements?.physicalFindings) {
            revealed.physicalFindings = this.patientCase.hiddenElements.physicalFindings
        }

        if (this.revelationState.differentialDiagnosis && this.patientCase.hiddenElements?.differentialDiagnosis) {
            revealed.differentialDiagnosis = this.patientCase.hiddenElements.differentialDiagnosis
        }

        return revealed as Partial<PatientCase>
    }

    // PROGRESS: Get case progress metrics
    getCaseProgress(): {
        completionPercentage: number
        investigationsCompleted: number
        remainingActions: string[]
        timeElapsed: number
    } {
        const totalPossibleRevelations = Object.keys(this.revelationState).length
        const revealedCount = Object.values(this.revelationState).filter(Boolean).length
        const completionPercentage = Math.round((revealedCount / totalPossibleRevelations) * 100)

        const remainingKeys = Object.keys(this.revelationState).filter(
            key => !this.revelationState[key as keyof RevelationState]
        ) as (keyof RevelationState)[]

        const remainingActions = remainingKeys.map(key => {
            const actionMap: Record<keyof RevelationState, string> = {
                chiefComplaint: 'Case presentation',
                detailedHistory: 'Patient interview',
                pastMedicalHistory: 'Patient interview',
                reviewOfSystems: 'Patient interview',
                vitalSigns: 'Physical examination',
                generalAppearance: 'Physical examination',
                physicalFindings: 'Focused physical examination or scanning',
                labResults: 'Laboratory orders',
                imagingResults: 'Imaging studies',
                specialistOpinion: 'Specialty consultation',
                differentialDiagnosis: 'Complete investigation workup',
                diagnosisSynthesis: 'All required investigations'
            }
            return actionMap[key] || key
        })

        const timeElapsed = Date.now() - this.caseStartTime

        return {
            completionPercentage,
            investigationsCompleted: this.investigationHistory.length,
            remainingActions: [...new Set(remainingActions)],
            timeElapsed
        }
    }

    // UTILITIES: Investigation history and case analytics
    getInvestigationHistory(): InvestigationAction[] {
        return [...this.investigationHistory]
    }

    resetCase(): void {
        this.patientCase = null
        this.revelationState = this.getInitialRevelationState()
        this.investigationHistory = []
        this.caseStartTime = 0
    }

    // VALIDATE: Ensure revelation state consistency
    validateRevelationState(): { valid: boolean, issues: string[] } {
        const issues: string[] = []

        // Chief complaint should always be revealed
        if (!this.revelationState.chiefComplaint) {
            issues.push('Chief complaint must always be revealed')
        }

        // Synthesis should only be available after sufficient investigation
        if (this.revelationState.diagnosisSynthesis && !this.canUnlockSynthesis()) {
            issues.push('Diagnosis synthesis unlocked without sufficient investigation')
        }

        return { valid: issues.length === 0, issues }
    }
}
