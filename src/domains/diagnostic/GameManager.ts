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

    constructor() {
        this.gameState = this.initializeGameState()
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

}