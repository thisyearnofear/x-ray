import { MedicalServiceFacade } from '../medical/MedicalServiceFacade';
import { PatientCase, PatientState } from '../medical/types';
import { AchievementSystem } from './AchievementSystem';
import { BudgetManager, DIFFICULTY_CONFIGS } from '../medical/BudgetManager';
import { HospitalAdministrator } from '../medical/HospitalAdministrator';
import { DynamicPricingManager } from '../medical/DynamicPricingManager';
import { EfficiencyBonusSystem } from '../medical/EfficiencyBonusSystem';
import { WalletIntegrationManager } from '../web3/WalletIntegrationManager';
import { CrisisEventSystem } from '../medical/CrisisEventSystem';
import { TimerNarrativeManager } from './TimerNarrativeManager';

// MODULAR: Game phase enumeration for clear progression tracking
export enum GamePhase {
    PATIENT_ARRIVAL = 'patient_arrival',
    INVESTIGATION = 'investigation',
    EVIDENCE_GATHERING = 'evidence_gathering',
    DIAGNOSIS = 'diagnosis',
    COMPLETED = 'completed',
    // Legacy phases for backward compatibility
    SCANNING = 'scanning',
    ANALYZING = 'analyzing',
    SOLVED = 'solved'
}

// MODULAR: Game state management and progression system
export interface GameState {
    score: number
    streak: number
    timeRemaining: number
    phase: GamePhase
    discoveredConditions: Set<string>
    sessionStartTime: number
    hintsUsed: number
    accuracy: number
    efficiency: number
    learningProgress: Map<string, number>
    achievements: Set<string>
    difficulty: 'easy' | 'medium' | 'hard'
    patientCase: PatientCase | null
    specialization: MedicalSpecialization
    unlockedTechniques: Set<string>

    // ENHANCEMENT: MON Token Economy
    budget?: {
        remaining: number
        spent: number
        startingAmount: number
        difficultyTier: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    }

    // ENHANCEMENT: Patient State - extracted criticality and deterioration logic
    patientState?: PatientState
    patientCriticality?: 'stable' | 'deteriorating' | 'critical' // DEPRECATED: Use patientState.criticality
}

export interface MedicalSpecialization {
    id: string
    name: string
    description: string
    icon: string
    requiredScore: number
    unlockedTechniques: string[]
}

export interface GameManagerConfig {
    diagnosticUIManager?: any; // DiagnosticUIManager type
}

export class GameManager {
    private gameState: GameState
    private callbacks: Map<string, Function[]> = new Map()
    private dynamicElementsInterval: number | null = null
    private dynamicTimer: number = 0
    private medicalService: MedicalServiceFacade;
    private achievementSystem: AchievementSystem;
    public diagnosticUIManager: any; // DiagnosticUIManager reference (public to allow updates)
    private smartAccount: any = null; // For wallet address tracking

    // ENHANCEMENT: MON Token Economy
    private budgetManager: BudgetManager | null = null;
    private hospitalAdmin: HospitalAdministrator | null = null;
    private dynamicPricingManager: DynamicPricingManager;
    private efficiencyBonusSystem: EfficiencyBonusSystem;
    private walletIntegrationManager: WalletIntegrationManager;

    // ENHANCEMENT: Timer Narrative System
    private timerNarrativeManager: TimerNarrativeManager | null = null;

    constructor(config?: GameManagerConfig) {
        this.medicalService = new MedicalServiceFacade();
        this.achievementSystem = new AchievementSystem();
        this.achievementSystem.on('achievementUnlocked', (data: any) => {
            // Show achievement notification when an achievement is unlocked
            this.emit('achievementUnlocked', data);
            // If we have a UI manager, show the notification
            if (this.diagnosticUIManager) {
                this.diagnosticUIManager.showAchievementNotification(data.achievement);
            }
        });
        this.gameState = this.initializeGameState()

        // Initialize new economic systems
        this.dynamicPricingManager = new DynamicPricingManager();
        this.efficiencyBonusSystem = new EfficiencyBonusSystem();
        this.walletIntegrationManager = new WalletIntegrationManager();
    }

    private initializeGameState(): GameState {
        const initialState: GameState = {
            score: 0,
            streak: 0,
            timeRemaining: 300,
            phase: GamePhase.SCANNING,
            discoveredConditions: new Set(),
            sessionStartTime: Date.now(),
            hintsUsed: 0,
            accuracy: 0,
            efficiency: 0,
            learningProgress: new Map(),
            achievements: new Set(),
            difficulty: 'medium',
            patientCase: null,
            specialization: this.getDefaultSpecialization(),
            unlockedTechniques: new Set(['basic_scan'])
        };
        this.loadCase('case-x487', initialState);
        return initialState;
    }

    public loadCase(caseId: string, gameState: GameState | null = null): void {
        const medicalCase = this.medicalService.getCase(caseId);
        if (medicalCase) {
            // Convert MedicalCase to PatientCase to fix type mismatch
            // Include comprehensive patient information for better context
            const patientCase: PatientCase = {
                id: medicalCase.id,
                patientName: medicalCase.patientInfo.patientName,
                age: medicalCase.patientInfo.age,
                gender: medicalCase.patientInfo.gender,
                chiefComplaint: medicalCase.patientInfo.chiefComplaint,
                historyOfPresentIllness: medicalCase.patientStory,
                socialHistory: medicalCase.stakes,
                initialPresentation: {
                    generalAssessment: medicalCase.initialFindings
                },
                requiredModel: medicalCase.requiredModel,
                conditions: medicalCase.conditions,
                caseComplexity: medicalCase.caseComplexity,
                estimatedCaseLength: medicalCase.estimatedCaseLength,
                caseDifficulty: medicalCase.caseDifficulty,
                difficulty: medicalCase.difficulty,
                aiGenerated: medicalCase.aiGenerated,
                estimatedStudyTime: medicalCase.estimatedStudyTime,
                timestamp: medicalCase.timestamp
            };

            const stateToUpdate = gameState || this.gameState;
            stateToUpdate.patientCase = patientCase;

            // ENHANCEMENT: Initialize PatientState from PatientCase
            stateToUpdate.patientState = new PatientState(patientCase);

            this.emit('gameStateUpdated', stateToUpdate);
        }
    }

    private getDefaultSpecialization(): MedicalSpecialization {
        return {
            id: 'general_radiology',
            name: 'General Radiology',
            description: 'Basic diagnostic imaging and interpretation',
            icon: '🏥',
            requiredScore: 0,
            unlockedTechniques: ['basic_scan', 'density_analysis']
        }
    }

    // MODULAR: Event-driven state management
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

    // ENHANCED: Timer system with urgency feedback and patient state progression
    public startTimer(): void {
        const timerInterval = setInterval(() => {
            this.gameState.timeRemaining -= 1

            // ENHANCEMENT: Update patient state (1 second = 1/60 minute)
            if (this.gameState.patientState) {
                this.gameState.patientState.update(1 / 60);
            }

            // Update gameState criticality from patientState
            if (this.gameState.patientState) {
                const patientStateData = this.gameState.patientState.getState();
                // Keep the old property for backward compatibility
                this.gameState.patientCriticality = patientStateData.criticality as any;

                // ENHANCEMENT: Check for narrative events
                this.checkForNarrativeEvents();
            }

            // Emit timer events for UI updates
            const timerEvent = {
                timeRemaining: this.gameState.timeRemaining,
                urgency: this.getTimerUrgency(),
                percentage: this.getTimePercentage(),
                // ENHANCEMENT: Include patient state for real-time monitor
                patientState: this.gameState.patientState?.getState()
            };

            this.emit('timer_update', timerEvent)

            // ENHANCED: Rich milestone events for immersive drama experience
            const milestone = this.getTimerMilestone(this.gameState.timeRemaining);
            if (milestone) {
                this.emit('timer_milestone', {
                    milestone: milestone.id,
                    timeRemaining: this.gameState.timeRemaining,
                    urgency: milestone.urgency,
                    title: milestone.title,
                    description: milestone.description,
                    actions: milestone.actions,
                    visualEffects: milestone.visualEffects,
                    audioCue: milestone.audioCue,
                    patientContext: this.getPatientContextForMilestone(milestone),
                    gameState: {
                        conditionsFound: this.gameState.discoveredConditions.size,
                        investigationsUsed: this.getInvestigationCount(),
                        accuracy: this.gameState.accuracy,
                        phase: this.gameState.phase
                    }
                });

                // Legacy compatibility - emit old events for existing listeners
                this.emitLegacyTimerEvents(milestone, this.gameState.timeRemaining);
            }

            if (this.gameState.timeRemaining <= 0) {
                clearInterval(timerInterval)
                this.emit('timer_expired', {
                    finalScore: this.gameState.score,
                    message: '⏰ Time\'s up! Great effort!'
                })
            }
        }, 1000)
    }

    // ENHANCEMENT: Check for narrative events
    private checkForNarrativeEvents(): void {
        if (!this.timerNarrativeManager || !this.gameState.patientState || !this.gameState.patientCase) {
            return;
        }

        const narrativeEvent = this.timerNarrativeManager.checkForNarrativeEvents(
            this.gameState.timeRemaining,
            this.gameState,
            this.gameState.phase
        );

        if (narrativeEvent) {
            // Emit the narrative event
            this.emit('narrative_event', {
                event: narrativeEvent.milestone,
                type: narrativeEvent.type,
                timestamp: narrativeEvent.triggeredAt
            });
        }
    }

    private getTimerUrgency(): 'normal' | 'warning' | 'critical' {
        if (this.gameState.timeRemaining <= 30) return 'critical'
        if (this.gameState.timeRemaining <= 60) return 'warning'
        return 'normal'
    }

    private getTimePercentage(): number {
        const initialTime = this.gameState.patientCase?.estimatedCaseLength || 300; // Default to 5 mins
        return Math.max(0, (this.gameState.timeRemaining / initialTime) * 100);
    }

    // ENHANCED: Rich milestone system for immersive timer drama
    private getTimerMilestone(timeRemaining: number): any {
        const milestones = {
            240: { // 4:00 - Patient Arrival Drama
                id: 'patient_arrival',
                urgency: 'normal',
                title: 'Patient Assessment Begins',
                description: 'Patient has arrived and is ready for initial evaluation',
                actions: ['unlock_patient_interview'],
                visualEffects: ['panel_highlight', 'patient_info_glow'],
                audioCue: 'patient_arrival'
            },
            225: { // 3:45 - Investigation Opportunity
                id: 'investigation_unlock',
                urgency: 'normal',
                title: 'Investigation Tools Available',
                description: 'Standard diagnostic investigations are now available',
                actions: ['unlock_lab_orders', 'unlock_patient_interview'],
                visualEffects: ['tool_unlock_animation', 'panel_expand'],
                audioCue: 'tool_unlock'
            },
            210: { // 3:30 - Lab Results Reveal
                id: 'lab_results_ready',
                urgency: 'normal',
                title: 'Laboratory Results Available',
                description: 'Initial lab work has been processed and results are ready',
                actions: ['show_lab_results', 'unlock_imaging'],
                visualEffects: ['result_highlight', 'data_stream'],
                audioCue: 'lab_results'
            },
            195: { // 3:15 - Imaging Findings
                id: 'imaging_complete',
                urgency: 'moderate',
                title: 'Imaging Study Complete',
                description: 'Radiological imaging has been reviewed and findings are available',
                actions: ['show_imaging_results', 'unlock_consultation'],
                visualEffects: ['discovery_spotlight', 'film_viewer_open'],
                audioCue: 'imaging_complete'
            },
            165: { // 2:45 - Nurse Consult Escalation
                id: 'consultation_escalation',
                urgency: 'moderate',
                title: 'Nurse Consultation Recommended',
                description: 'Consider consulting with nursing staff for additional insights',
                actions: ['unlock_nurse_consult', 'show_family_concerns'],
                visualEffects: ['urgent_highlight', 'nurse_badge_glow'],
                audioCue: 'consultation_alert'
            },
            150: { // 2:30 - Complication Discovery
                id: 'complication_alert',
                urgency: 'high',
                title: 'Potential Complications Identified',
                description: 'Additional findings suggest possible secondary conditions',
                actions: ['show_complications', 'unlock_advanced_tools'],
                visualEffects: ['warning_pulse', 'complexity_indicator'],
                audioCue: 'complication_discovery'
            },
            120: { // 2:00 - Critical Decision Point
                id: 'decision_critical',
                urgency: 'high',
                title: 'Critical Decision Required',
                description: 'Time to formulate working diagnosis and treatment plan',
                actions: ['show_decision_options', 'unlock_emergency_consult'],
                visualEffects: ['decision_highlight', 'timer_emphasis'],
                audioCue: 'decision_urgent'
            },
            90: { // 1:30 - Evidence Synthesis
                id: 'evidence_synthesis',
                urgency: 'high',
                title: 'Evidence Synthesis Phase',
                description: 'Correlate all findings and prepare comprehensive assessment',
                actions: ['show_evidence_summary', 'unlock_final_tools'],
                visualEffects: ['synthesis_animation', 'evidence_highlight'],
                audioCue: 'evidence_ready'
            },
            60: { // 1:00 - Diagnosis Preparation
                id: 'diagnosis_preparation',
                urgency: 'critical',
                title: 'Final Diagnosis Preparation',
                description: 'Prepare comprehensive diagnosis for patient and family',
                actions: ['show_diagnosis_options', 'unlock_family_brief'],
                visualEffects: ['final_countdown', 'diagnosis_highlight'],
                audioCue: 'diagnosis_urgent'
            },
            30: { // 0:30 - Emergency Escalation
                id: 'emergency_escalation',
                urgency: 'critical',
                title: 'Emergency Escalation Required',
                description: 'Immediate action required - patient condition may deteriorate',
                actions: ['show_emergency_options', 'unlock_critical_care'],
                visualEffects: ['emergency_pulse', 'crisis_indicators'],
                audioCue: 'emergency_alert'
            }
        };

        return (milestones as any)[timeRemaining] || null;
    }

    // ENHANCED: Provide patient-specific context for milestones
    private getPatientContextForMilestone(milestone: any): any {
        if (!this.gameState.patientCase) return {};

        const patient = this.gameState.patientCase;
        const contextMap = {
            patient_arrival: {
                greeting: `Dr. [Player], meet ${patient.patientName || 'the patient'}`,
                concern: `${patient.patientName || 'The patient'} is anxious about their ${patient.chiefComplaint || 'symptoms'}`,
                background: patient.patientName ? `${patient.patientName} works in ${this.inferOccupation(patient)}` : ''
            },
            investigation_unlock: {
                tools: ['Patient interview', 'Lab orders', 'Vital signs'],
                rationale: `Given ${patient.patientName || 'the patient'}'s ${patient.chiefComplaint || 'presentation'}, these investigations will help clarify the diagnosis`
            },
            lab_results_ready: {
                expected: this.predictLabFindings(milestone),
                correlation: `These results ${this.correlateWithSymptoms(milestone) ? 'support' : 'contradict'} the initial presentation`
            },
            imaging_complete: {
                modality: this.suggestImagingModality(milestone),
                findings: this.generateImagingFindings(milestone),
                clinical_impact: this.assessImagingImpact(milestone)
            }
            // Additional milestone contexts can be added here
        };

        return (contextMap as any)[milestone.id] || {};
    }

    // Helper methods for contextual intelligence
    private inferOccupation(patient: any): string {
        // Simple inference based on available data
        if (patient.patientName?.toLowerCase().includes('dr') || patient.patientName?.toLowerCase().includes('nurse')) {
            return 'healthcare';
        }
        if (patient.patientStory?.toLowerCase().includes('work') || patient.patientStory?.toLowerCase().includes('job')) {
            return 'professional work';
        }
        return 'daily activities'; // Default
    }

    private predictLabFindings(milestone: any): string[] {
        // Context-aware lab prediction based on case type
        const caseType = this.gameState.patientCase?.id || '';
        if (caseType.includes('tmj') || caseType.includes('headache')) {
            return ['CBC: Normal', 'ESR: Elevated', 'CRP: Mildly elevated'];
        }
        return ['Basic metabolic panel', 'Inflammatory markers'];
    }

    private correlateWithSymptoms(milestone: any): boolean {
        // Simple correlation logic
        return this.gameState.discoveredConditions.size > 0;
    }

    private suggestImagingModality(milestone: any): string {
        const caseType = this.gameState.patientCase?.id || '';
        if (caseType.includes('tmj') || caseType.includes('head') || caseType.includes('facial')) {
            return 'Panoramic X-ray with TMJ views';
        }
        return 'Chest X-ray'; // Default
    }

    private generateImagingFindings(milestone: any): string[] {
        // Generate contextually appropriate findings
        const conditions = Array.from(this.gameState.discoveredConditions);
        if (conditions.length > 0) {
            return [`Evidence of ${conditions[0]}`, 'Joint space narrowing', 'Soft tissue changes'];
        }
        return ['No acute abnormalities', 'Consider additional views'];
    }

    private assessImagingImpact(milestone: any): string {
        const conditions = this.gameState.discoveredConditions.size;
        if (conditions > 1) {
            return 'Multiple findings support complex diagnosis';
        } else if (conditions === 1) {
            return 'Key finding confirms working diagnosis';
        }
        return 'Further investigation recommended';
    }

    // Track investigation usage for milestone context
    private getInvestigationCount(): number {
        // This would be tracked by the UI system
        // For now, return a simple count based on conditions found
        return Math.max(1, this.gameState.discoveredConditions.size);
    }

    // Legacy compatibility for existing timer event listeners
    private emitLegacyTimerEvents(milestone: any, timeRemaining: number): void {
        switch (milestone.id) {
            case 'diagnosis_preparation':
                this.emit('timer_warning', {
                    message: '⚠️ 1 minute remaining!',
                    urgency: 'warning',
                    audio: 'warning_beep'
                });
                break;
            case 'emergency_escalation':
                this.emit('timer_critical', {
                    message: '🚨 30 seconds left!',
                    urgency: 'critical',
                    audio: 'urgent_beep'
                });
                break;
            default:
                // No legacy event for other milestones
                break;
        }

        if (timeRemaining <= 10 && timeRemaining > 0) {
            this.emit('timer_final_seconds', {
                seconds: timeRemaining,
                audio: 'countdown_beep'
            });
        }
    }

    // MODULAR: Sophisticated scoring system
    public awardPoints(points: number, reason: string, metadata?: any) {
        const timeBonus = this.calculateTimeBonus()
        const streakMultiplier = this.gameState.streak * 0.1 + 1
        const specializationBonus = this.getSpecializationBonus()
        const totalPoints = Math.floor((points + timeBonus) * streakMultiplier * specializationBonus)

        this.gameState.score += totalPoints
        this.gameState.streak++

        // Update efficiency metrics
        this.updateEfficiencyMetrics()

        this.emit('pointsAwarded', { points: totalPoints, reason, metadata })
        this.emit('gameStateUpdated', this.gameState)

        // PERFORMANT: Persist state change to session
        this.updateSession()

        return totalPoints
    }

    private calculateTimeBonus(): number {
        const elapsedTime = (Date.now() - this.gameState.sessionStartTime) / 1000
        const timeRatio = elapsedTime / this.gameState.timeRemaining

        if (timeRatio < 0.3) return 50 // Speed bonus
        if (timeRatio < 0.6) return 25
        return 0
    }

    private getSpecializationBonus(): number {
        const bonuses = {
            'general_radiology': 1.0,
            'cardiology': 1.2,
            'neurology': 1.3,
            'orthopedics': 1.1
        }
        return bonuses[this.gameState.specialization.id as keyof typeof bonuses] || 1.0
    }

    private updateEfficiencyMetrics() {
        const elapsedTime = (Date.now() - this.gameState.sessionStartTime) / 1000
        const conditionsFound = this.gameState.discoveredConditions.size

        this.gameState.efficiency = Math.min((conditionsFound / (elapsedTime / 60)) / 2, 1.0)

        if (conditionsFound > 0) {
            let totalProgress = 0
            this.gameState.discoveredConditions.forEach(conditionId => {
                totalProgress += this.gameState.learningProgress.get(conditionId) || 0
            })
            this.gameState.accuracy = totalProgress / conditionsFound
        }

        // ENHANCEMENT: Update efficiency bonus system
        if (this.gameState.patientState && this.efficiencyBonusSystem) {
            // Update time elapsed
            const config = DIFFICULTY_CONFIGS[this.gameState.budget?.difficultyTier || 'beginner'];
            const timeElapsed = config.timeLimit - this.gameState.timeRemaining;
            this.efficiencyBonusSystem.updateTimeElapsed(timeElapsed);

            // Update efficiency bonus system with current metrics
            const efficiencyData = this.efficiencyBonusSystem.getEfficiencySummary();

            // Emit efficiency update event
            this.emit('efficiencyUpdated', efficiencyData);

            if (typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent('efficiencyUpdated', {
                    detail: efficiencyData
                }));
            }
        }
    }

    // MODULAR: Technique unlocking system
    public unlockTechnique(techniqueId: string): boolean {
        if (this.gameState.unlockedTechniques.has(techniqueId)) return false

        this.gameState.unlockedTechniques.add(techniqueId)
        this.emit('techniqueUnlocked', { techniqueId })
        return true
    }

    public hasTechnique(techniqueId: string): boolean {
        return this.gameState.unlockedTechniques.has(techniqueId)
    }

    // MODULAR: Specialization progression
    public canUnlockSpecialization(specializationId: string): boolean {
        const specializations = this.getAvailableSpecializations()
        const specialization = specializations.find(s => s.id === specializationId)
        return specialization ? this.gameState.score >= specialization.requiredScore : false
    }

    public unlockSpecialization(specializationId: string): boolean {
        if (!this.canUnlockSpecialization(specializationId)) return false

        const specializations = this.getAvailableSpecializations()
        const specialization = specializations.find(s => s.id === specializationId)
        if (specialization) {
            this.gameState.specialization = specialization
            this.emit('specializationUnlocked', { specialization })
            return true
        }
        return false
    }

    private getAvailableSpecializations(): MedicalSpecialization[] {
        return [
            this.getDefaultSpecialization(),
            {
                id: 'cardiology',
                name: 'Cardiology',
                description: 'Advanced cardiac imaging and diagnosis',
                icon: '❤️',
                requiredScore: 500,
                unlockedTechniques: ['cardiac_mapping', 'blood_flow_analysis', 'heart_3d_reconstruction']
            },
            {
                id: 'neurology',
                name: 'Neurology',
                description: 'Brain and nervous system imaging',
                icon: '🧠',
                requiredScore: 800,
                unlockedTechniques: ['brain_mapping', 'neural_pathway_tracing', 'cognitive_function_analysis']
            },
            {
                id: 'orthopedics',
                name: 'Orthopedics',
                description: 'Musculoskeletal system diagnosis',
                icon: '🦴',
                requiredScore: 300,
                unlockedTechniques: ['bone_density_analysis', 'joint_mechanics', 'fracture_detection']
            }
        ]
    }


    // ============================================================================
    // ENHANCEMENT: BUDGET MANAGEMENT INTEGRATION
    // ============================================================================

    /**
     * Initialize budget system for a case
     * MODULAR: Creates BudgetManager and HospitalAdministrator
     */
    public initializeBudget(
        difficultyTier: 'beginner' | 'intermediate' | 'advanced' | 'expert',
        adminStyle: 'strict' | 'flexible' | 'generous' = 'flexible',
        hasWallet: boolean = false
    ): void {
        const config = DIFFICULTY_CONFIGS[difficultyTier];

        // Create budget manager
        this.budgetManager = new BudgetManager(config.startingBudget, difficultyTier);

        // Create hospital administrator
        this.hospitalAdmin = new HospitalAdministrator(
            this.budgetManager,
            adminStyle,
            hasWallet
        );

        // Update game state
        this.gameState.budget = {
            remaining: config.startingBudget,
            spent: 0,
            startingAmount: config.startingBudget,
            difficultyTier
        };
        this.gameState.timeRemaining = config.timeLimit;

        // ENHANCEMENT: Set initial criticality from PatientState
        if (this.gameState.patientState) {
            const patientStateData = this.gameState.patientState.getState();
            this.gameState.patientCriticality = patientStateData.criticality as any;

            // ENHANCEMENT: Initialize timer narrative manager
            if (this.gameState.patientCase) {
                this.timerNarrativeManager = new TimerNarrativeManager(
                    this.gameState.patientState,
                    this.gameState.patientCase
                );

                // Set up narrative event listeners
                this.setupNarrativeEventListeners();
            }
        } else {
            this.gameState.patientCriticality = 'stable'; // fallback
        }

        // Initialize efficiency bonus system
        if (this.gameState.patientState) {
            this.efficiencyBonusSystem.initialize(
                this.budgetManager,
                this.gameState.patientState,
                config.timeLimit
            );
        }

        // Set wallet status in pricing manager
        this.dynamicPricingManager.setDelegationStatus(hasWallet);

        // Wire budget events
        this.budgetManager.on('budgetUpdated', (budgetState: any) => {
            this.gameState.budget = {
                remaining: budgetState.remainingBudget,
                spent: budgetState.totalSpent,
                startingAmount: budgetState.startingBudget,
                difficultyTier: budgetState.difficultyTier
            };
            this.emit('gameStateUpdated', this.gameState);
            this.emit('budgetUpdated', this.gameState.budget);

            // ENHANCEMENT: Forward to DOM for React components (consolidating EconomicEventBridge)
            if (typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent('budgetUpdated', {
                    detail: this.gameState.budget
                }));
            }
        });

        this.budgetManager.on('insufficientFunds', (data: any) => {
            this.emit('insufficientFunds', data);

            // ENHANCEMENT: Forward to DOM for React components (consolidating EconomicEventBridge)
            if (typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent('insufficientFunds', {
                    detail: data
                }));
            }

            // Trigger hospital admin warning
            if (this.hospitalAdmin) {
                const status = this.hospitalAdmin.checkBudgetStatus();
                this.emit('administratorMessage', status);

                // ENHANCEMENT: Forward to DOM for React components (consolidating EconomicEventBridge)
                if (typeof document !== 'undefined') {
                    document.dispatchEvent(new CustomEvent('administratorMessage', {
                        detail: status
                    }));
                }
            }
        });

        console.log(`💰 Budget initialized: ${config.startingBudget} MON for ${difficultyTier} case`);
    }

    /**
     * ENHANCEMENT: Setup UI event listeners (consolidating EconomicEventBridge)
     * CLEAN: Single place for UI-to-game event handling
     */
    private setupUIEventListeners(): void {
        if (typeof document === 'undefined') return; // SSR guard

        // Case selected from CaseSelectionHub
        document.addEventListener('caseSelected', ((event: CustomEvent) => {
            const { difficultyTier } = event.detail;

            // Initialize budget in GameManager
            const budgetManager = this.getBudgetManager();
            const hospitalAdmin = this.getHospitalAdministrator();

            if (!budgetManager || !hospitalAdmin) {
                // Initialize if not already done
                this.initializeBudget(
                    difficultyTier,
                    'flexible', // Default personality
                    this.isWalletConnected()
                );
            }
        }) as EventListener);

        // Execute medical action
        document.addEventListener('executeAction', ((event: CustomEvent) => {
            const { action } = event.detail as { action: any };

            const budgetManager = this.getBudgetManager();
            if (!budgetManager) {
                console.error('BudgetManager not initialized');
                return;
            }

            // Execute action through budget manager
            const result = budgetManager.executeAction(
                action,
                [`Performed ${action.name}`],
                true
            );

            if (result) {
                console.log(`✅ Executed: ${action.name} for ${action.cost} MON`);
                // BudgetManager internally handles emitting events through GameManager
            }
        }) as EventListener);

        // Request additional funds
        document.addEventListener('requestAdditionalFunds', (() => {
            const hospitalAdmin = this.getHospitalAdministrator();
            if (!hospitalAdmin) return;

            const gameState = this.getGameState();
            const criticality = gameState.patientCriticality || 'stable';

            // Request 0.5 MON (can be made dynamic later)
            const negotiation = hospitalAdmin.requestAdditionalFunds(
                0.5,
                'Additional tests needed for accurate diagnosis',
                criticality
            );

            // Show negotiation dialog
            document.dispatchEvent(new CustomEvent('showNegotiationDialog', {
                detail: { negotiation }
            }));
        }) as EventListener);

        // Contribute personal funds
        document.addEventListener('contributePersonalFunds', (() => {
            const hospitalAdmin = this.getHospitalAdministrator();
            if (!hospitalAdmin) return;

            // Show contribution dialog
            document.dispatchEvent(new CustomEvent('showContributionDialog', {
                detail: { maxAmount: 5.0 } // Max 5 MON personal contribution
            }));
        }) as EventListener);
    }

    /**
     * Check if wallet is connected
     */
    private isWalletConnected(): boolean {
        return typeof window !== 'undefined' &&
            (window as any).ethereum?.selectedAddress != null;
    }

    /**
     * Get budget manager instance
     */
    public getBudgetManager(): BudgetManager | null {
        return this.budgetManager;
    }

    /**
     * Get hospital administrator instance
     */
    public getHospitalAdministrator(): HospitalAdministrator | null {
        return this.hospitalAdmin;
    }

    /**
     * Update patient criticality (affects budget negotiation)
     */
    public updatePatientCriticality(criticality: 'stable' | 'deteriorating' | 'critical'): void {
        this.gameState.patientCriticality = criticality;

        if (criticality === 'critical' && this.hospitalAdmin) {
            const emergencyMessage = this.hospitalAdmin.getEmergencyDialogue();
            this.emit('administratorMessage', {
                message: emergencyMessage,
                urgency: 'critical'
            });
        }

        this.emit('gameStateUpdated', this.gameState);
    }

    // Getters for game state
    public getGameState(): GameState {
        return { ...this.gameState }
    }

    public getScore(): number {
        return this.gameState.score
    }

    public getStreak(): number {
        return this.gameState.streak
    }

    public getTimeRemaining(): number {
        return this.gameState.timeRemaining
    }

    public getSpecialization(): MedicalSpecialization {
        return this.gameState.specialization
    }

    public getUnlockedTechniques(): Set<string> {
        return new Set(this.gameState.unlockedTechniques)
    }

    public updateTimeRemaining(newTime: number) {
        this.gameState.timeRemaining = newTime;
        this.emit('gameStateUpdated', this.gameState);
    }

    public updatePhase(newPhase: GamePhase) {
        const oldPhase = this.gameState.phase;
        this.gameState.phase = newPhase;

        // If phase changed to 'solved' or 'completed' (game completed), record session completion and high score
        const completedPhases = [GamePhase.SOLVED, GamePhase.COMPLETED];
        if (!completedPhases.includes(oldPhase) && completedPhases.includes(newPhase)) {
            this.recordSessionCompletion();
            this.recordHighScore();
        }

        this.emit('gameStateUpdated', this.gameState);
    }

    // AGGRESSIVE CONSOLIDATION: Single updateState method for all state changes
    public updateState(updates: Partial<GameState>) {
        const oldPhase = this.gameState.phase;
        this.gameState = { ...this.gameState, ...updates };

        // If phase changed to 'solved' or 'completed' (game completed), record session completion
        const completedPhases = [GamePhase.SOLVED, GamePhase.COMPLETED];
        if (!completedPhases.includes(oldPhase) && completedPhases.includes(this.gameState.phase)) {
            this.recordSessionCompletion();
            this.recordHighScore(); // Also record high score
        }

        this.emit('gameStateUpdated', this.gameState);
    }

    // ENHANCED: Adaptive difficulty based on performance
    public evaluatePerformance(): void {
        // Calculate various performance metrics
        const efficiency = this.gameState.efficiency;
        const accuracy = this.gameState.accuracy;
        const discoveryRate = this.gameState.discoveredConditions.size /
            (this.gameState.timeRemaining > 0 ? this.gameState.timeRemaining : 1);
        const currentScore = this.gameState.score;

        // Create performance profile
        const performanceMetrics = {
            efficiency,
            accuracy,
            discoveryRate,
            currentScore,
            discoveredConditions: this.gameState.discoveredConditions.size,
            timeRemaining: this.gameState.timeRemaining,
            hintsUsed: this.gameState.hintsUsed,
            learningProgress: this.gameState.learningProgress
        };

        // Adjust difficulty based on performance
        this.adaptDifficulty(performanceMetrics);
    }

    // ENHANCED: Advanced difficulty adaptation algorithm
    private adaptDifficulty(metrics: any): void {
        // Calculate performance score (0-1 scale)
        const performanceScore = (metrics.efficiency + metrics.accuracy) / 2;

        // Define thresholds for difficulty adjustment
        const HIGH_PERFORMANCE_THRESHOLD = 0.75;
        const LOW_PERFORMANCE_THRESHOLD = 0.35;

        // Logic for difficulty adjustment
        if (performanceScore >= HIGH_PERFORMANCE_THRESHOLD &&
            this.gameState.difficulty !== 'hard' &&
            metrics.discoveredConditions >= 3) {
            // Player is excelling, increase difficulty
            this.increaseDifficulty();
        } else if (performanceScore <= LOW_PERFORMANCE_THRESHOLD &&
            this.gameState.difficulty !== 'easy' &&
            metrics.hintsUsed >= 2) {
            // Player is struggling, decrease difficulty
            this.decreaseDifficulty();
        }

        // Additionally adjust based on discovery rate and learning progress
        this.adaptBasedOnLearning(metrics);
    }

    // Increase game difficulty
    private increaseDifficulty(): void {
        if (this.gameState.difficulty === 'medium') {
            this.gameState.difficulty = 'hard';
            this.gameState.timeRemaining = Math.max(180, this.gameState.timeRemaining * 0.8); // Reduce time by 20%

            this.emit('difficultyIncreased', {
                newDifficulty: 'hard',
                message: 'Difficulty increased to Hard! Scanning conditions are now more subtle.',
                timeRemaining: this.gameState.timeRemaining
            });
        } else if (this.gameState.difficulty === 'easy') {
            this.gameState.difficulty = 'medium';
            this.gameState.timeRemaining = Math.max(240, this.gameState.timeRemaining * 0.9); // Reduce time by 10%

            this.emit('difficultyIncreased', {
                newDifficulty: 'medium',
                message: 'Difficulty increased to Medium! Conditions are becoming more challenging to identify.',
                timeRemaining: this.gameState.timeRemaining
            });
        }

        this.emit('gameStateUpdated', this.gameState);
    }

    // Decrease game difficulty
    private decreaseDifficulty(): void {
        if (this.gameState.difficulty === 'hard') {
            this.gameState.difficulty = 'medium';
            this.gameState.timeRemaining = Math.min(420, this.gameState.timeRemaining * 1.25); // Increase time by 25%

            this.emit('difficultyDecreased', {
                newDifficulty: 'medium',
                message: 'Difficulty decreased to Medium. Conditions are more apparent now.',
                timeRemaining: this.gameState.timeRemaining
            });
        } else if (this.gameState.difficulty === 'medium') {
            this.gameState.difficulty = 'easy';
            this.gameState.timeRemaining = Math.min(480, this.gameState.timeRemaining * 1.5); // Increase time by 50%

            this.emit('difficultyDecreased', {
                newDifficulty: 'easy',
                message: 'Difficulty decreased to Easy. Conditions are now more obvious and scanning is easier.',
                timeRemaining: this.gameState.timeRemaining
            });
        }

        this.emit('gameStateUpdated', this.gameState);
    }

    // Adapt based on learning progress and condition mastery
    private adaptBasedOnLearning(metrics: any): void {
        // Check if user is mastering specific conditions
        let masteredConditions = 0;
        metrics.learningProgress.forEach((progress: number) => {
            if (progress >= 0.9) masteredConditions++;
        });

        // If user is mastering many conditions, add more complex cases
        if (masteredConditions >= 3) {
            this.emit('learningMilestoneReached', {
                masteredConditions,
                message: 'You\'re mastering these conditions! Expect more complex cases ahead.',
                suggestion: 'Try switching to a different anatomical region or increasing scan complexity.'
            });
        }

        // If user is struggling with specific conditions, provide targeted help
        let strugglingConditions = 0;
        metrics.learningProgress.forEach((progress: number) => {
            if (progress <= 0.2) strugglingConditions++;
        });

        if (strugglingConditions >= 2) {
            this.emit('strugglingDetected', {
                strugglingConditions,
                message: 'Some conditions are proving challenging. Would you like targeted practice?',
                suggestion: 'Focus on the conditions you\'re finding most difficult.'
            });
        }
    }

    // Get current performance metrics
    public getPerformanceMetrics(): any {
        return {
            efficiency: this.gameState.efficiency,
            accuracy: this.gameState.accuracy,
            score: this.gameState.score,
            discoveredConditions: this.gameState.discoveredConditions.size,
            timeRemaining: this.gameState.timeRemaining,
            hintsUsed: this.gameState.hintsUsed,
            difficulty: this.gameState.difficulty,
            learningProgress: Array.from(this.gameState.learningProgress.entries())
        };
    }

    // ENHANCED: Spaced repetition system for long-term retention
    public recordConditionPractice(conditionId: string, success: boolean): void {
        const now = Date.now();

        // Update learning progress based on performance
        const currentProgress = this.gameState.learningProgress.get(conditionId) || 0;
        let newProgress = success ?
            Math.min(1.0, currentProgress + 0.1) :
            Math.max(0, currentProgress - 0.15);

        this.gameState.learningProgress.set(conditionId, newProgress);

        // Record the practice session
        const practiceRecord = {
            timestamp: now,
            success,
            progress: newProgress
        };

        this.emit('conditionPracticed', {
            conditionId,
            practiceRecord,
            message: success ?
                `${conditionId} practiced successfully!` :
                `${conditionId} needs more practice.`
        });

        // Update game state
        this.emit('gameStateUpdated', this.gameState);
    }

    // Determine which conditions to review based on spaced repetition algorithm
    public getConditionsForReview(): string[] {
        const now = Date.now();
        const reviewConditions: string[] = [];

        // Define spaced intervals (in milliseconds)
        const intervals = {
            'new': 1000 * 60 * 5,      // 5 minutes for new items
            'early': 1000 * 60 * 25,   // 25 minutes 
            'intermediate': 1000 * 60 * 60 * 8,      // 8 hours
            'advanced': 1000 * 60 * 60 * 24,        // 24 hours
            'mastery': 1000 * 60 * 60 * 24 * 7      // 7 days
        };

        // TODO: This would require storing practice history
        // For now, return conditions that have been discovered but not recently practiced
        this.gameState.learningProgress.forEach((progress, conditionId) => {
            // If progress is high but condition was discovered early in the session
            // or if progress is low, add to review list
            if (progress < 0.6 || this.gameState.discoveredConditions.has(conditionId)) {
                reviewConditions.push(conditionId);
            }
        });

        // Limit to 3 conditions for review to avoid overwhelming the player
        return reviewConditions.slice(0, 3);
    }

    // Get conditions that are due for review based on spaced repetition intervals
    public getReviewRecommendations(): any[] {
        const recommendations: any[] = [];
        const now = Date.now();

        // Sample implementation - in a real system, we would track last review times
        this.gameState.learningProgress.forEach((progress, conditionId) => {
            // If the condition is not well-learned (progress < 0.8), recommend for review
            if (progress < 0.8) {
                recommendations.push({
                    conditionId,
                    progress,
                    priority: 1 - progress, // Higher priority for lower progress
                    recommendation: `Review ${conditionId} to improve retention`
                });
            }
        });

        // Sort by priority (highest first)
        recommendations.sort((a, b) => b.priority - a.priority);

        return recommendations;
    }

    // Record a session completion to support spaced repetition
    public recordSessionCompletion(): void {
        // Store session data for spaced repetition algorithm
        const sessionData = {
            timestamp: Date.now(),
            score: this.gameState.score,
            discoveredConditions: Array.from(this.gameState.discoveredConditions),
            accuracy: this.gameState.accuracy,
            efficiency: this.gameState.efficiency,
            timeSpent: Date.now() - this.gameState.sessionStartTime
        };

        this.emit('sessionCompleted', sessionData);

        this.saveSessionData(sessionData);
    }

    // Save session data for spaced repetition scheduling
    private saveSessionData(sessionData: any): void {
        // In a real implementation, this would save to localStorage or a database
        // For now, we'll just emit an event indicating data was saved
        const savedData = {
            ...sessionData,
            learningProgress: Array.from(this.gameState.learningProgress.entries())
        };

        this.emit('sessionDataSaved', savedData);

        // Store in localStorage as backup
        if (typeof window !== 'undefined') {
            localStorage.setItem('xray-session-data', JSON.stringify(savedData));
        }
    }

    // Load previous session data to support spaced repetition
    public loadPreviousSessionData(): void {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem('xray-session-data');
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    // Restore learning progress
                    if (parsedData.learningProgress) {
                        this.gameState.learningProgress = new Map(parsedData.learningProgress);
                    }

                    this.emit('sessionDataLoaded', parsedData);
                } catch (e) {
                    console.error('Failed to load session data:', e);
                }
            }
        }
    }

    // MODULAR: Enhanced leaderboard and competitive elements
    public recordHighScore(): void {
        const currentScore = this.gameState.score;
        const currentCase = this.gameState.patientCase?.id || 'unknown';
        // Use chiefComplaint as the title since PatientCase doesn't have a title field
        const currentCaseTitle = this.gameState.patientCase?.chiefComplaint || 'Unknown Case';
        const sessionTime = Date.now() - this.gameState.sessionStartTime;
        const conditionsFound = this.gameState.discoveredConditions.size;
        const timeRemaining = this.gameState.timeRemaining;

        // Enhanced entry with more competitive metrics
        const newEntry = {
            score: currentScore,
            caseId: currentCase,
            caseTitle: currentCaseTitle,
            time: sessionTime,
            timeRemaining: timeRemaining,
            conditionsFound,
            discoveredConditions: Array.from(this.gameState.discoveredConditions),
            date: new Date().toISOString(),
            accuracy: this.gameState.accuracy,
            efficiency: this.gameState.efficiency,
            streak: this.gameState.streak,
            hintsUsed: this.gameState.hintsUsed,
            difficulty: this.gameState.difficulty,
            isAICase: this.gameState.patientCase?.aiGenerated || false,
            walletAddress: this.smartAccount?.address || null
        };

        // Get existing high scores
        const highScores = this.getHighScores();
        highScores.push(newEntry);

        // Sort by score (primary), then by time remaining (secondary) for tie-breaking
        highScores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.timeRemaining - a.timeRemaining; // More time remaining = better
        });

        const topScores = highScores.slice(0, 15); // Increased to top 15 for more engagement

        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('xray-high-scores', JSON.stringify(topScores));
        }

        // Emit detailed high score event
        const rank = highScores.findIndex(entry =>
            entry.score === newEntry.score &&
            entry.timeRemaining === newEntry.timeRemaining
        ) + 1;

        const isPersonalBest = this.isPersonalBest(newEntry);
        const isNewRecord = rank === 1;

        this.emit('highScoreRecorded', {
            entry: newEntry,
            rank,
            isNewRecord,
            isPersonalBest,
            totalScores: highScores.length
        });

        // Additionally emit competitive events for UI engagement
        if (isNewRecord) {
            this.emit('newGlobalRecord', {
                score: currentScore,
                message: `🏆 New Global Record! You're #1 on the leaderboard!`
            });
        } else if (rank <= 5) {
            this.emit('top5Achievement', {
                rank,
                message: `🎉 Top ${rank}! Excellent performance!`
            });
        }
    }

    // ENHANCED: Personal best tracking
    private isPersonalBest(newEntry: any): boolean {
        const walletAddress = this.smartAccount?.address;
        if (!walletAddress) return false; // Can't determine without wallet

        const userScores = this.getUserScores(walletAddress);
        if (userScores.length === 0) return true;

        return newEntry.score > Math.max(...userScores.map((s: any) => s.score));
    }

    // ENHANCED: Get scores for a specific user
    private getUserScores(walletAddress: string): any[] {
        const allScores = this.getHighScores();
        return allScores.filter((score: any) => score.walletAddress === walletAddress);
    }

    public getHighScores(): any[] {
        if (typeof window !== 'undefined') {
            const scoresStr = localStorage.getItem('xray-high-scores');
            if (scoresStr) {
                try {
                    return JSON.parse(scoresStr);
                } catch (e) {
                    console.error('Failed to parse high scores:', e);
                    return [];
                }
            }
        }
        return [];
    }

    // ENHANCEMENT: Handle player response to crisis events
    public handleCrisisResponse(eventId: string, action: string, success: boolean): void {
        if (this.timerNarrativeManager) {
            this.timerNarrativeManager.handleCrisisResponse(eventId, action, success);
        }
    }

    // ENHANCEMENT: Resolve crisis without player response
    public resolveCrisisWithoutResponse(eventId: string): void {
        if (this.timerNarrativeManager) {
            this.timerNarrativeManager.resolveCrisisWithoutResponse(eventId);
        }
    }

    // ENHANCEMENT: Set up narrative event listeners
    private setupNarrativeEventListeners(): void {
        if (!this.timerNarrativeManager) return;

        // Listen for narrative events
        this.timerNarrativeManager.on('narrative_event_triggered', (event: any) => {
            this.emit('narrative_event_triggered', event);

            // Forward to DOM for React components
            if (typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent('narrativeEventTriggered', {
                    detail: event
                }));
            }
        });

        // Listen for crisis events
        this.timerNarrativeManager.on('crisis_event_triggered', (event: any) => {
            this.emit('crisis_event_triggered', event);

            // Forward to DOM for React components
            if (typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent('crisisEventTriggered', {
                    detail: event
                }));
            }
        });

        // Listen for health change requests
        this.timerNarrativeManager.on('health_change_requested', (data: any) => {
            // Apply health change to patient state
            if (this.gameState.patientState) {
                // This would require a method in PatientState to adjust health directly
                // For now, we'll emit an event for the canvas to handle
                this.emit('patient_health_change', data);

                if (typeof document !== 'undefined') {
                    document.dispatchEvent(new CustomEvent('patientHealthChange', {
                        detail: data
                    }));
                }
            }
        });

        // Listen for other crisis consequences
        this.timerNarrativeManager.on('deterioration_rate_change_requested', (data: any) => {
            this.emit('patient_deterioration_rate_change', data);
        });

        this.timerNarrativeManager.on('time_adjustment_requested', (data: any) => {
            this.emit('timer_adjustment_requested', data);
        });

        this.timerNarrativeManager.on('budget_adjustment_requested', (data: any) => {
            if (this.budgetManager) {
                // This would require a method to adjust budget
                this.emit('budget_adjustment_requested', data);
            }
        });

        this.timerNarrativeManager.on('symptom_added', (data: any) => {
            this.emit('patient_symptom_added', data);
        });

        this.timerNarrativeManager.on('complication_added', (data: any) => {
            this.emit('patient_complication_added', data);
        });

        this.timerNarrativeManager.on('crisis_resolved', (data: any) => {
            this.emit('crisis_resolved', data);
        });

        this.timerNarrativeManager.on('crisis_ignored', (data: any) => {
            this.emit('crisis_ignored', data);
        });
    }

    // Public method to check achievements
    public checkAchievements(gameState: GameState, event: any) {
        this.achievementSystem?.checkAchievements(gameState, event);
    }

    // Reset the game state to initial values
    public resetGameState(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
        // Record current session before resetting and potentially store high score
        const completedPhases = [GamePhase.SOLVED, GamePhase.COMPLETED];
        if (completedPhases.includes(this.gameState.phase)) {
            this.recordSessionCompletion();
            this.recordHighScore(); // Record high score when game is completed
        }

        const timeMap: Record<string, number> = { 'easy': 420, 'medium': 300, 'hard': 240 };
        this.gameState = {
            ...this.initializeGameState(),
            timeRemaining: timeMap[difficulty] || 300,
            difficulty: difficulty
        };
        this.loadCase('case-x487');
        this.emit('gameStateUpdated', this.gameState);
    }

    // DYNAMIC: Start the dynamic elements system that periodically adds clues and hints
    private startDynamicElementsSystem() {
        // Run the dynamic elements update every 30 seconds
        this.dynamicElementsInterval = window.setInterval(() => {
            this.updateDynamicElements();
        }, 30000); // 30 seconds
    }

    // DYNAMIC: Update dynamic game elements
    private updateDynamicElements() {
        // Increment the timer to track when to show dynamic elements
        this.dynamicTimer++;

        const timeRemaining = this.gameState.timeRemaining;
        const conditionsFound = this.gameState.discoveredConditions.size;

        // Every 30 seconds, provide a hint or clue based on game state
        if (timeRemaining > 0) {
            this.provideDynamicHint();
        }

        // Every 45 seconds, evaluate player performance for adaptive difficulty
        if (this.dynamicTimer % 3 === 0) { // Every 90 seconds
            this.evaluatePerformance();
        }

        // Sometimes reveal a new possible condition after some time has passed
        if (this.dynamicTimer % 2 === 0 && conditionsFound > 0) { // Every 60 seconds if conditions found
            this.maybeRevealNewClue();
        }
    }

    // DYNAMIC: Provide contextual hints based on game progress
    private provideDynamicHint() {
        const conditionsFound = this.gameState.discoveredConditions.size;
        const timeRemaining = this.gameState.timeRemaining;
        const hints: string[] = [];

        if (conditionsFound === 0) {
            hints.push("🔍 Remember to scan systematically. Start with the center of the image.");
            hints.push("💡 Look for areas that appear different from the surrounding anatomy.");
            hints.push("🔍 X-ray findings often appear as changes in density or shape.");
        } else if (conditionsFound === 1) {
            hints.push("🎯 Great start! Continue exploring the image for additional findings.");
            hints.push("💡 Remember that some conditions might be subtle or located in less obvious areas.");
        } else if (conditionsFound >= 2) {
            hints.push("🚀 Excellent progress! You're developing diagnostic skills.");
            hints.push("💡 Try to correlate your findings with the patient's symptoms.");
        }

        if (timeRemaining < 60) {
            hints.push("⏰ Time is running out! Focus on areas you haven't examined thoroughly.");
        } else if (timeRemaining < 120) {
            hints.push("⏳ Consider the most critical anatomical regions next.");
        }

        // Select a random hint if available
        if (hints.length > 0) {
            const randomHint = hints[Math.floor(Math.random() * hints.length)];
            this.emit('dynamicHintReceived', { hint: randomHint });
        }
    }

    // DYNAMIC: Maybe reveal a new clue based on game state
    private maybeRevealNewClue() {
        // 30% chance to reveal a contextual clue
        if (Math.random() < 0.3) {
            const clues = [
                "🔎 There's an interesting density difference in the upper quadrant",
                "💡 Pay attention to the symmetry of anatomical structures",
                "🔍 Notice any unusual opacities or lucencies",
                "💡 Check the borders of organs and structures",
                "🔎 Look for any unexpected calcifications",
                "💡 The pathology might be subtle - examine margins carefully"
            ];

            const randomClue = clues[Math.floor(Math.random() * clues.length)];
            this.emit('dynamicClueReceived', { clue: randomClue });
        }
    }

    // DYNAMIC: Add a new condition discovery opportunity (advanced feature)
    public triggerRandomConditionDiscovery() {
        // This could potentially reveal a new possible condition
        // In a real implementation, this might highlight an area or provide an audio cue
        const conditionDiscoveryMessages = [
            "🌟 New discovery opportunity detected!",
            "💡 Potential finding identified in a different region",
            "🔬 Scanning reveals additional area of interest"
        ];

        const randomMessage = conditionDiscoveryMessages[Math.floor(Math.random() * conditionDiscoveryMessages.length)];
        this.emit('conditionDiscoveryOpportunity', { message: randomMessage });

        return randomMessage;
    }

    // DYNAMIC: Get a relevant educational tip based on current game state
    public getEducationalTip(): string {
        const tips = [
            "💡 In radiology, always check for 'normal' first before looking for 'abnormal'",
            "🔍 The key to radiology is systematic evaluation: Bones, Airways, Breathing, Circulation",
            "💡 Remember: A finding is only significant if it's different from the patient's previous studies or the normal population",
            "💡 Always correlate imaging findings with clinical symptoms",
            "🔍 Look for the 'sunset sign' in chest X-rays - indicates pneumothorax",
            "💡 'Air bronchograms' are air-filled bronchi seen in consolidated lung tissue",
            "💡 The 'bat wing' pattern is associated with pulmonary edema",
            "💡 Always look for foreign bodies, especially in trauma cases"
        ];

        return tips[Math.floor(Math.random() * tips.length)];
    }

    // DYNAMIC: Clean up the dynamic elements system
    public destroy() {
        if (this.dynamicElementsInterval) {
            clearInterval(this.dynamicElementsInterval);
            this.dynamicElementsInterval = null;
        }
    }

    /**
     * Get dynamic price for a medical action
     * ENHANCEMENT: Time and patient state-based pricing
     */
    public getDynamicPrice(action: any): number {
        if (!this.budgetManager || !this.gameState.patientState) {
            return action.cost; // Fallback to base cost
        }

        const config = DIFFICULTY_CONFIGS[this.gameState.budget?.difficultyTier || 'beginner'];
        const budgetEfficiency = this.budgetManager.getBudgetEfficiency();

        return this.dynamicPricingManager.calculateDynamicPrice(
            action,
            this.gameState.timeRemaining,
            config.timeLimit,
            this.gameState.patientState,
            budgetEfficiency
        );
    }

    /**
     * Get pricing explanation for an action
     * ENHANCEMENT: Transparent pricing feedback
     */
    public getPricingExplanation(action: any): string {
        if (!this.budgetManager || !this.gameState.patientState) {
            return "Standard pricing";
        }

        const config = DIFFICULTY_CONFIGS[this.gameState.budget?.difficultyTier || 'beginner'];
        const budgetEfficiency = this.budgetManager.getBudgetEfficiency();

        return this.dynamicPricingManager.getPricingExplanation(
            action,
            this.gameState.timeRemaining,
            config.timeLimit,
            this.gameState.patientState,
            budgetEfficiency
        );
    }

    /**
     * Calculate efficiency bonuses for case completion
     * ENHANCEMENT: Reward system for budget-conscious play
     */
    public calculateEfficiencyBonuses(): number {
        return this.efficiencyBonusSystem.calculateTotalBonus();
    }

    /**
     * Get wallet integration benefits
     * ENHANCEMENT: Premium features for wallet users
     */
    public getWalletBenefits(): any {
        return this.walletIntegrationManager.getWalletBenefits();
    }

    /**
     * Connect wallet
     * ENHANCEMENT: Wallet integration
     */
    public async connectWallet(): Promise<boolean> {
        const success = await this.walletIntegrationManager.connectWallet();
        if (success) {
            this.smartAccount = this.walletIntegrationManager.getWalletAddress();
            // Update pricing manager with delegation status
            this.dynamicPricingManager.setDelegationStatus(true);
        }
        return success;
    }

    /**
     * Check wallet achievements
     * ENHANCEMENT: Progression system
     */
    public checkWalletAchievements(): any[] {
        return this.walletIntegrationManager.checkAchievements();
    }

    /**
     * PERFORMANT: Update session storage with current game state
     * CLEAN: Ensures case consistency across page refreshes
     */
    private updateSession(): void {
        if (!this.gameState.patientCase) return;

        // Import CaseSessionManager dynamically to avoid circular dependencies
        import('../medical/services/CaseSessionManager').then(({ CaseSessionManager }) => {
            CaseSessionManager.updateGameState({
                score: this.gameState.score,
                timeRemaining: this.gameState.timeRemaining,
                discoveredConditions: Array.from(this.gameState.discoveredConditions),
                phase: this.gameState.phase,
                patientState: this.gameState.patientState?.getState(),
                budget: this.gameState.budget
            });
        });
    }

    /**
     * PERFORMANT: Clear session when game ends
     */
    public endGame(): void {
        // Import CaseSessionManager dynamically
        import('../medical/services/CaseSessionManager').then(({ CaseSessionManager }) => {
            CaseSessionManager.clearCase();
            console.log('🎮 Game ended, session cleared');
        });
    }

}
