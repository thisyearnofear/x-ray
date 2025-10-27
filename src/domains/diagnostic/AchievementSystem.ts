// ENHANCEMENT: Consolidated Achievement and progression management system
export interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    category: 'discovery' | 'analysis' | 'efficiency' | 'learning' | 'specialization'
    points: number
    requirements: AchievementRequirement
    reward?: AchievementReward
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface PlayerAchievement {
    achievementId: string
    unlockedAt: number
    progress: number
    isCompleted: boolean
    timesCompleted: number
    lastProgressUpdate: number
    metadata?: any
}

export interface AchievementStats {
    totalAchievements: number
    unlockedAchievements: number
    completedAchievements: number
    totalPoints: number
    earnedPoints: number
    completionPercentage: number
    rareAchievements: number
    recentUnlocks: PlayerAchievement[]
}

export interface AchievementRequirement {
    type: 'score' | 'streak' | 'conditions_discovered' | 'accuracy' | 'efficiency' | 'time' | 'specialization' | 'first_scan' | 'tutorial_complete'
    target: number
    condition?: string
}

export interface AchievementReward {
    type: 'technique' | 'specialization' | 'cosmetic' | 'multiplier'
    value: string
    permanent?: boolean
}

export class AchievementSystem {
    private achievements: Map<string, Achievement> = new Map()
    private unlockedAchievements: Set<string> = new Set()
    private playerAchievements: Map<string, PlayerAchievement> = new Map()
    private callbacks: Map<string, Function[]> = new Map()

    constructor() {
        this.initializeAchievements()
        this.initializePlayerAchievements()
    }

    private initializeAchievements() {
        const achievementDefinitions: Achievement[] = [
            // Discovery Achievements
            {
                id: 'first_scan',
                name: 'First Scan',
                description: 'Perform your first scan',
                icon: '🔬',
                category: 'discovery',
                points: 50,
                requirements: { type: 'first_scan', target: 1 },
                rarity: 'common'
            },
            {
                id: 'first_discovery',
                name: 'First Discovery',
                description: 'Discover your first medical condition',
                icon: '🔍',
                category: 'discovery',
                points: 100,
                requirements: { type: 'conditions_discovered', target: 1 },
                rarity: 'common'
            },
            {
                id: 'tutorial_complete',
                name: 'Tutorial Complete',
                description: 'Complete the tutorial',
                icon: '🎓',
                category: 'learning',
                points: 75,
                requirements: { type: 'tutorial_complete', target: 1 },
                rarity: 'common'
            },
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Discover a condition within the first 30% of time',
                icon: '⚡',
                category: 'efficiency',
                points: 150,
                requirements: { type: 'time', target: 30 },
                rarity: 'rare'
            },
            {
                id: 'perfectionist',
                name: 'Perfectionist',
                description: 'Achieve 90% accuracy in condition analysis',
                icon: '💎',
                category: 'analysis',
                points: 200,
                requirements: { type: 'accuracy', target: 90 },
                rarity: 'epic'
            },
            {
                id: 'streak_master',
                name: 'Streak Master',
                description: 'Achieve a 5-condition discovery streak',
                icon: '🔥',
                category: 'discovery',
                points: 250,
                requirements: { type: 'streak', target: 5 },
                rarity: 'rare'
            },
            {
                id: 'learning_enthusiast',
                name: 'Learning Enthusiast',
                description: 'Study 3 different medical conditions',
                icon: '📚',
                category: 'learning',
                points: 180,
                requirements: { type: 'conditions_discovered', target: 3 },
                rarity: 'common'
            },
            {
                id: 'efficiency_expert',
                name: 'Efficiency Expert',
                description: 'Achieve 80% efficiency in condition discovery',
                icon: '🎖️',
                category: 'efficiency',
                points: 300,
                requirements: { type: 'efficiency', target: 80 },
                rarity: 'epic'
            },

            // Specialization Achievements
            {
                id: 'cardiology_initiate',
                name: 'Cardiology Initiate',
                description: 'Unlock the Cardiology specialization',
                icon: '❤️',
                category: 'specialization',
                points: 400,
                requirements: { type: 'specialization', target: 1, condition: 'cardiology' },
                rarity: 'rare'
            },
            {
                id: 'neurology_adept',
                name: 'Neurology Adept',
                description: 'Unlock the Neurology specialization',
                icon: '🧠',
                category: 'specialization',
                points: 600,
                requirements: { type: 'specialization', target: 1, condition: 'neurology' },
                rarity: 'epic'
            },

            // Advanced Achievements
            {
                id: 'diagnostic_master',
                name: 'Diagnostic Master',
                description: 'Achieve 1000 total diagnostic score',
                icon: '🏆',
                category: 'analysis',
                points: 500,
                requirements: { type: 'score', target: 1000 },
                rarity: 'legendary'
            },
            {
                id: 'time_trial_champion',
                name: 'Time Trial Champion',
                description: 'Complete 5 diagnoses in under 4 minutes each',
                icon: '⏱️',
                category: 'efficiency',
                points: 350,
                requirements: { type: 'time', target: 5 },
                rarity: 'epic'
            }
        ]

        achievementDefinitions.forEach(achievement => {
            this.achievements.set(achievement.id, achievement)
        })
    }

    /**
     * ENHANCEMENT: Initialize player achievements with zero progress
     */
    private initializePlayerAchievements(): void {
        this.achievements.forEach(achievement => {
            if (!this.playerAchievements.has(achievement.id)) {
                this.playerAchievements.set(achievement.id, {
                    achievementId: achievement.id,
                    unlockedAt: 0,
                    progress: 0,
                    isCompleted: false,
                    timesCompleted: 0,
                    lastProgressUpdate: Date.now(),
                    metadata: {}
                })
            }
        })
    }

    // MODULAR: Event-driven achievement checking
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

    // MODULAR: Comprehensive achievement checking
    public checkAchievements(gameState: any, eventData?: any): Achievement[] {
        const newlyUnlocked: Achievement[] = []

        this.achievements.forEach(achievement => {
            if (this.unlockedAchievements.has(achievement.id)) return

            if (this.checkAchievement(achievement, gameState, eventData)) {
                this.unlockAchievement(achievement)
                newlyUnlocked.push(achievement)
            }
        })

        return newlyUnlocked
    }

    private checkAchievement(achievement: Achievement, gameState: any, eventData?: any): boolean {
        const req = achievement.requirements

        switch (req.type) {
            case 'score':
                return gameState.score >= req.target

            case 'streak':
                return gameState.streak >= req.target

            case 'first_scan':
                return eventData?.type === 'first_scan'

            case 'tutorial_complete':
                return eventData?.type === 'tutorial_complete'

            case 'conditions_discovered':
                return gameState.discoveredConditions.size >= req.target

            case 'accuracy':
                return gameState.accuracy * 100 >= req.target

            case 'efficiency':
                return gameState.efficiency * 100 >= req.target

            case 'time':
                if (eventData?.reason === 'discovery') {
                    const elapsedTime = (Date.now() - gameState.sessionStartTime) / 1000
                    const timeRatio = (elapsedTime / gameState.timeRemaining) * 100
                    return timeRatio <= req.target
                }
                return false

            case 'specialization':
                return gameState.specialization.id === req.condition

            default:
                return false
        }
    }

    private unlockAchievement(achievement: Achievement) {
        this.unlockedAchievements.add(achievement.id)

        // ENHANCEMENT: Update player achievement record
        const playerAchievement = this.playerAchievements.get(achievement.id)
        if (playerAchievement) {
            playerAchievement.unlockedAt = Date.now()
            playerAchievement.isCompleted = true
            playerAchievement.timesCompleted++
            playerAchievement.progress = 100
            playerAchievement.lastProgressUpdate = Date.now()
        }

        // Apply rewards
        if (achievement.reward) {
            this.applyReward(achievement.reward)
        }

        this.emit('achievementUnlocked', { achievement })
    }

    private applyReward(reward: AchievementReward) {
        switch (reward.type) {
            case 'technique':
                this.emit('techniqueReward', { techniqueId: reward.value })
                break

            case 'specialization':
                this.emit('specializationReward', { specializationId: reward.value })
                break

            case 'multiplier':
                this.emit('multiplierReward', { multiplier: reward.value })
                break
        }
    }

    // MODULAR: Basic achievement statistics
    public getBasicStats() {
        const total = this.achievements.size
        const unlocked = this.unlockedAchievements.size
        const completionRate = (unlocked / total) * 100

        const byCategory = this.getAchievementsByCategory()
        const byRarity = this.getAchievementsByRarity()

        return {
            total,
            unlocked,
            completionRate: Math.round(completionRate),
            byCategory,
            byRarity,
            recentUnlocks: this.getRecentUnlocks(5)
        }
    }

    private getAchievementsByCategory(): Record<string, { total: number, unlocked: number }> {
        const categories = ['discovery', 'analysis', 'efficiency', 'learning', 'specialization']
        const result: Record<string, { total: number, unlocked: number }> = {}

        categories.forEach(category => {
            const categoryAchievements = Array.from(this.achievements.values())
                .filter(a => a.category === category)

            const unlockedInCategory = categoryAchievements.filter(a =>
                this.unlockedAchievements.has(a.id)
            ).length

            result[category] = {
                total: categoryAchievements.length,
                unlocked: unlockedInCategory
            }
        })

        return result
    }

    private getAchievementsByRarity(): Record<string, { total: number, unlocked: number }> {
        const rarities = ['common', 'rare', 'epic', 'legendary']
        const result: Record<string, { total: number, unlocked: number }> = {}

        rarities.forEach(rarity => {
            const rarityAchievements = Array.from(this.achievements.values())
                .filter(a => a.rarity === rarity)

            const unlockedInRarity = rarityAchievements.filter(a =>
                this.unlockedAchievements.has(a.id)
            ).length

            result[rarity] = {
                total: rarityAchievements.length,
                unlocked: unlockedInRarity
            }
        })

        return result
    }

    private getRecentUnlocks(limit: number): Achievement[] {
        // In a real implementation, you'd track unlock timestamps
        // For now, return the most recently unlocked achievements
        return Array.from(this.unlockedAchievements)
            .slice(-limit)
            .map(id => this.achievements.get(id)!)
            .filter(Boolean)
    }

    // Public API
    public getAllAchievements(): Achievement[] {
        return Array.from(this.achievements.values())
    }

    public getUnlockedAchievements(): Achievement[] {
        return Array.from(this.unlockedAchievements)
            .map(id => this.achievements.get(id)!)
            .filter(Boolean)
    }

    public isAchievementUnlocked(achievementId: string): boolean {
        return this.unlockedAchievements.has(achievementId)
    }

    public getAchievement(achievementId: string): Achievement | undefined {
        return this.achievements.get(achievementId)
    }

    public getCompletionRate(): number {
        return (this.unlockedAchievements.size / this.achievements.size) * 100
    }

    /**
     * ENHANCEMENT: Get player achievement data
     */
    public getPlayerAchievement(achievementId: string): PlayerAchievement | null {
        return this.playerAchievements.get(achievementId) || null
    }

    /**
     * ENHANCEMENT: Export achievement data for analytics
     */
    public exportAchievementData(): any {
        return {
            achievements: Array.from(this.achievements.entries()),
            playerAchievements: Array.from(this.playerAchievements.entries()),
            unlockedAchievements: Array.from(this.unlockedAchievements),
            stats: this.getAchievementStats(),
            exportTime: Date.now()
        }
    }

    /**
     * ENHANCEMENT: Get achievement progress for UI display
     */
    public getAchievementProgress(achievementId: string): { currentProgress: number, maxProgress: number, progressPercentage: number } {
        const playerAchievement = this.playerAchievements.get(achievementId)
        if (!playerAchievement) {
            return { currentProgress: 0, maxProgress: 100, progressPercentage: 0 }
        }

        return {
            currentProgress: playerAchievement.progress,
            maxProgress: 100,
            progressPercentage: playerAchievement.progress
        }
    }

    /**
     * ENHANCEMENT: Get comprehensive achievement statistics
     */
    public getAchievementStats(): AchievementStats {
        const totalAchievements = this.achievements.size
        const unlockedAchievements = this.unlockedAchievements.size
        const completedAchievements = this.unlockedAchievements.size // All unlocked are completed for now

        const totalPoints = Array.from(this.achievements.values())
            .reduce((sum, achievement) => sum + achievement.points, 0)

        const earnedPoints = Array.from(this.unlockedAchievements)
            .map(id => this.achievements.get(id)?.points || 0)
            .reduce((sum, points) => sum + points, 0)

        const completionPercentage = (completedAchievements / totalAchievements) * 100

        const rareAchievements = Array.from(this.unlockedAchievements)
            .filter(id => {
                const achievement = this.achievements.get(id)
                return achievement && ['rare', 'epic', 'legendary'].includes(achievement.rarity)
            }).length

        const recentUnlocks = Array.from(this.playerAchievements.values())
            .filter(pa => pa.isCompleted)
            .sort((a, b) => b.unlockedAt - a.unlockedAt)
            .slice(0, 5)

        return {
            totalAchievements,
            unlockedAchievements,
            completedAchievements,
            totalPoints,
            earnedPoints,
            completionPercentage,
            rareAchievements,
            recentUnlocks
        }
    }
}