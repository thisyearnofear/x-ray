// MODULAR: Learning analytics and progress tracking system
export interface LearningSession {
    id: string
    startTime: number
    endTime?: number
    duration: number
    conditionsStudied: string[]
    accuracy: number
    efficiency: number
    score: number
    achievements: string[]
    techniquesUsed: string[]
    difficulty: string
    specialization: string
}

export interface LearningProgress {
    conditionId: string
    timesStudied: number
    averageAccuracy: number
    bestScore: number
    lastStudied: number
    masteryLevel: number // 0-1
    timeSpent: number
    notes: string[]
}

export interface LearningAnalytics {
    totalStudyTime: number
    conditionsMastered: number
    averageAccuracy: number
    learningStreak: number
    strengths: string[]
    areasForImprovement: string[]
    studyRecommendations: string[]
}

export class LearningTracker {
    private sessions: LearningSession[] = []
    private progress: Map<string, LearningProgress> = new Map()
    private currentSession: LearningSession | null = null
    private callbacks: Map<string, Function[]> = new Map()

    constructor() {
        this.loadPersistentData()
    }

    // MODULAR: Session management
    public startSession(specialization: string, difficulty: string): string {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        this.currentSession = {
            id: sessionId,
            startTime: Date.now(),
            duration: 0,
            conditionsStudied: [],
            accuracy: 0,
            efficiency: 0,
            score: 0,
            achievements: [],
            techniquesUsed: [],
            difficulty,
            specialization
        }

        this.emit('sessionStarted', { session: this.currentSession })
        return sessionId
    }

    public endSession(finalScore: number, finalAccuracy: number, finalEfficiency: number) {
        if (!this.currentSession) return

        this.currentSession.endTime = Date.now()
        this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime
        this.currentSession.score = finalScore
        this.currentSession.accuracy = finalAccuracy
        this.currentSession.efficiency = finalEfficiency

        this.sessions.push({ ...this.currentSession })
        this.updatePersistentProgress()
        this.analyzeLearningPatterns()

        this.emit('sessionEnded', { session: this.currentSession })
        this.currentSession = null
    }

    // MODULAR: Progress tracking for individual conditions
    public updateConditionProgress(conditionId: string, accuracy: number, techniqueUsed: string) {
        const existing = this.progress.get(conditionId) || {
            conditionId,
            timesStudied: 0,
            averageAccuracy: 0,
            bestScore: 0,
            lastStudied: Date.now(),
            masteryLevel: 0,
            timeSpent: 0,
            notes: []
        }

        existing.timesStudied++
        existing.averageAccuracy = (existing.averageAccuracy * (existing.timesStudied - 1) + accuracy) / existing.timesStudied
        existing.bestScore = Math.max(existing.bestScore, accuracy * 100)
        existing.lastStudied = Date.now()
        existing.masteryLevel = this.calculateMasteryLevel(existing)

        if (this.currentSession) {
            this.currentSession.conditionsStudied.push(conditionId)
            this.currentSession.techniquesUsed.push(techniqueUsed)
        }

        this.progress.set(conditionId, existing)
        this.emit('progressUpdated', { conditionId, progress: existing })
    }

    private calculateMasteryLevel(progress: LearningProgress): number {
        // Mastery based on multiple factors
        const accuracyWeight = 0.4
        const frequencyWeight = 0.3
        const recencyWeight = 0.3

        const accuracyScore = progress.averageAccuracy
        const frequencyScore = Math.min(progress.timesStudied / 10, 1) // Normalize to 10+ studies
        const daysSinceLastStudy = (Date.now() - progress.lastStudied) / (1000 * 60 * 60 * 24)
        const recencyScore = Math.max(0, 1 - (daysSinceLastStudy / 7)) // Decay over a week

        return (accuracyScore * accuracyWeight) +
            (frequencyScore * frequencyWeight) +
            (recencyScore * recencyWeight)
    }

    // MODULAR: Learning analytics and insights
    public getLearningAnalytics(): LearningAnalytics {
        const totalTime = this.sessions.reduce((sum, session) => sum + session.duration, 0)
        const masteredConditions = Array.from(this.progress.values()).filter(p => p.masteryLevel > 0.8).length
        const avgAccuracy = this.sessions.reduce((sum, session) => sum + session.accuracy, 0) / this.sessions.length || 0

        // Calculate learning streak (consecutive days with study sessions)
        const streak = this.calculateLearningStreak()

        // Identify strengths and areas for improvement
        const { strengths, areasForImprovement } = this.identifyStrengthsAndWeaknesses()

        // Generate study recommendations
        const recommendations = this.generateStudyRecommendations()

        return {
            totalStudyTime: totalTime,
            conditionsMastered: masteredConditions,
            averageAccuracy: avgAccuracy,
            learningStreak: streak,
            strengths,
            areasForImprovement,
            studyRecommendations: recommendations
        }
    }

    private calculateLearningStreak(): number {
        if (this.sessions.length === 0) return 0

        // Group sessions by day
        const sessionsByDay = new Map<string, LearningSession[]>()
        this.sessions.forEach(session => {
            const day = new Date(session.startTime).toDateString()
            if (!sessionsByDay.has(day)) {
                sessionsByDay.set(day, [])
            }
            sessionsByDay.get(day)!.push(session)
        })

        const sortedDays = Array.from(sessionsByDay.keys()).sort()
        let streak = 0
        const today = new Date().toDateString()
        let checkDay = today

        for (let i = 0; i < 30; i++) { // Check last 30 days
            if (sessionsByDay.has(checkDay)) {
                streak++
                const dayDate = new Date(checkDay)
                dayDate.setDate(dayDate.getDate() - 1)
                checkDay = dayDate.toDateString()
            } else {
                break
            }
        }

        return streak
    }

    private identifyStrengthsAndWeaknesses(): { strengths: string[], areasForImprovement: string[] } {
        const strengths: string[] = []
        const areasForImprovement: string[] = []

        // Analyze accuracy by condition category
        const conditionCategories = this.categorizeConditions()
        conditionCategories.forEach((conditions, category) => {
            const avgAccuracy = conditions.reduce((sum, condId) => {
                const progress = this.progress.get(condId)
                return sum + (progress?.averageAccuracy || 0)
            }, 0) / conditions.length

            if (avgAccuracy > 0.8) {
                strengths.push(`${category} (${Math.round(avgAccuracy * 100)}% accuracy)`)
            } else if (avgAccuracy < 0.6) {
                areasForImprovement.push(`${category} needs more practice`)
            }
        })

        // Analyze study patterns
        const recentSessions = this.sessions.slice(-10)
        const avgSessionTime = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length

        if (avgSessionTime > 300000) { // 5 minutes average
            strengths.push('Dedicated study sessions')
        } else if (avgSessionTime < 120000) { // 2 minutes average
            areasForImprovement.push('Increase study session duration')
        }

        return { strengths, areasForImprovement }
    }

    private categorizeConditions(): Map<string, string[]> {
        const categories = new Map<string, string[]>()

        this.progress.forEach((progress, conditionId) => {
            // Simple categorization based on condition ID patterns
            let category = 'General'
            if (conditionId.includes('cardiac') || conditionId.includes('heart')) {
                category = 'Cardiology'
            } else if (conditionId.includes('brain') || conditionId.includes('neuro')) {
                category = 'Neurology'
            } else if (conditionId.includes('bone') || conditionId.includes('joint')) {
                category = 'Orthopedics'
            }

            if (!categories.has(category)) {
                categories.set(category, [])
            }
            categories.get(category)!.push(conditionId)
        })

        return categories
    }

    private generateStudyRecommendations(): string[] {
        const recommendations: string[] = []
        const analytics = this.getLearningAnalytics()

        if (analytics.averageAccuracy < 0.7) {
            recommendations.push('Focus on fundamental scanning techniques')
            recommendations.push('Review anatomical landmarks more carefully')
        }

        if (analytics.conditionsMastered < 3) {
            recommendations.push('Study a variety of medical conditions')
            recommendations.push('Practice with different anatomical regions')
        }

        if (analytics.learningStreak === 0) {
            recommendations.push('Establish a regular study routine')
        }

        analytics.areasForImprovement.forEach(area => {
            if (area.includes('Cardiology')) {
                recommendations.push('Practice cardiac imaging techniques')
            } else if (area.includes('Neurology')) {
                recommendations.push('Study brain anatomy and pathology')
            }
        })

        return recommendations.slice(0, 3) // Limit to top 3 recommendations
    }

    // MODULAR: Persistent data management
    private loadPersistentData() {
        try {
            const stored = localStorage.getItem('xrai_learning_progress')
            if (stored) {
                const data = JSON.parse(stored)
                this.sessions = data.sessions || []
                this.progress = new Map(data.progress || [])
            }
        } catch (error) {
            console.warn('Failed to load learning progress:', error)
        }
    }

    private updatePersistentProgress() {
        try {
            const data = {
                sessions: this.sessions,
                progress: Array.from(this.progress.entries())
            }
            localStorage.setItem('xrai_learning_progress', JSON.stringify(data))
        } catch (error) {
            console.warn('Failed to save learning progress:', error)
        }
    }

    private analyzeLearningPatterns() {
        // Analyze learning patterns and emit insights
        const analytics = this.getLearningAnalytics()

        if (analytics.averageAccuracy > 0.9) {
            this.emit('highPerformance', { analytics })
        }

        if (analytics.conditionsMastered >= 5) {
            this.emit('masteryAchieved', { conditionsMastered: analytics.conditionsMastered })
        }
    }

    // MODULAR: Event system for learning insights
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

    // Public API
    public getAllSessions(): LearningSession[] {
        return [...this.sessions]
    }

    public getConditionProgress(conditionId: string): LearningProgress | undefined {
        return this.progress.get(conditionId)
    }

    public getAllProgress(): Map<string, LearningProgress> {
        return new Map(this.progress)
    }

    public getCurrentSession(): LearningSession | null {
        return this.currentSession ? { ...this.currentSession } : null
    }

    public exportData() {
        return {
            sessions: this.sessions,
            progress: Array.from(this.progress.entries()),
            analytics: this.getLearningAnalytics(),
            exportDate: new Date().toISOString()
        }
    }
}