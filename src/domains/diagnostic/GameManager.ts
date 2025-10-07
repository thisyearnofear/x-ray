// MODULAR: Game state management and progression system
export interface GameState {
    score: number
    streak: number
    timeRemaining: number
    phase: 'scanning' | 'analyzing' | 'solved'
    discoveredConditions: Set<string>
    sessionStartTime: number
    hintsUsed: number
    accuracy: number
    efficiency: number
    learningProgress: Map<string, number>
    achievements: Set<string>
    difficulty: 'easy' | 'medium' | 'hard'
    patientCase: any
    specialization: MedicalSpecialization
    unlockedTechniques: Set<string>
}

export interface MedicalSpecialization {
    id: string
    name: string
    description: string
    icon: string
    requiredScore: number
    unlockedTechniques: string[]
}

export class GameManager {
    private gameState: GameState
    private callbacks: Map<string, Function[]> = new Map()
    private dynamicElementsInterval: number | null = null
    private dynamicTimer: number = 0

    constructor() {
        this.gameState = this.initializeGameState()
        this.startDynamicElementsSystem()
    }

    private initializeGameState(): GameState {
        return {
            score: 0,
            streak: 0,
            timeRemaining: 300,
            phase: 'scanning',
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

    // ENHANCED: Timer system with urgency feedback
    public startTimer(): void {
        const timerInterval = setInterval(() => {
            this.gameState.timeRemaining -= 1
            
            // Emit timer events for UI updates
            this.emit('timer_update', {
                timeRemaining: this.gameState.timeRemaining,
                urgency: this.getTimerUrgency()
            })
            
            // Critical time warnings
            if (this.gameState.timeRemaining === 60) {
                this.emit('timer_warning', { message: '⚠️ 1 minute remaining!' })
            } else if (this.gameState.timeRemaining === 30) {
                this.emit('timer_critical', { message: '🚨 30 seconds left!' })
            }
            
            if (this.gameState.timeRemaining <= 0) {
                clearInterval(timerInterval)
                this.emit('timer_expired', { finalScore: this.gameState.score })
            }
        }, 1000)
    }

    private getTimerUrgency(): 'normal' | 'warning' | 'critical' {
        if (this.gameState.timeRemaining <= 30) return 'critical'
        if (this.gameState.timeRemaining <= 60) return 'warning'
        return 'normal'
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

    // MODULAR: Dynamic difficulty adaptation
    public adaptDifficulty(): void {
        const performanceScore = (this.gameState.accuracy + this.gameState.efficiency) / 2

        if (performanceScore > 0.8 && this.gameState.difficulty === 'medium') {
            this.gameState.difficulty = 'hard'
            this.gameState.timeRemaining = 240
            this.emit('difficultyIncreased', { newDifficulty: 'hard' })
        } else if (performanceScore < 0.4 && this.gameState.difficulty === 'medium') {
            this.gameState.difficulty = 'easy'
            this.gameState.timeRemaining = 420
            this.emit('difficultyDecreased', { newDifficulty: 'easy' })
        }
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

    public updatePhase(newPhase: 'scanning' | 'analyzing' | 'solved') {
        this.gameState.phase = newPhase;
        this.emit('gameStateUpdated', this.gameState);
    }

    // AGGRESSIVE CONSOLIDATION: Single updateState method for all state changes
    public updateState(updates: Partial<GameState>) {
        this.gameState = { ...this.gameState, ...updates };
        this.emit('gameStateUpdated', this.gameState);
    }

    // Reset the game state to initial values
    public resetGameState(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
        const timeMap: Record<string, number> = { 'easy': 420, 'medium': 300, 'hard': 240 };
        this.gameState = {
            ...this.initializeGameState(),
            timeRemaining: timeMap[difficulty] || 300,
            difficulty: difficulty
        };
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

}