import { MedicalServiceFacade } from '../medical/MedicalServiceFacade';
import { PatientCase } from '../medical/types';
import { AchievementSystem } from './AchievementSystem';

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
    patientCase: PatientCase | null
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
        this.startDynamicElementsSystem()

        // Initialize spaced repetition system with previous data
        this.loadPreviousSessionData();

        // Store UI manager reference if provided
        if (config?.diagnosticUIManager) {
            this.diagnosticUIManager = config.diagnosticUIManager;
        }
    }

    private initializeGameState(): GameState {
        const initialState: GameState = {
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

    // ENHANCED: Timer system with urgency feedback
    public startTimer(): void {
        const timerInterval = setInterval(() => {
            this.gameState.timeRemaining -= 1

            // Emit timer events for UI updates
            const timerEvent = {
                timeRemaining: this.gameState.timeRemaining,
                urgency: this.getTimerUrgency(),
                percentage: this.getTimePercentage()
            };
            
            this.emit('timer_update', timerEvent)

            // Critical time warnings with enhanced feedback
            if (this.gameState.timeRemaining === 60) {
                this.emit('timer_warning', { 
                    message: '⚠️ 1 minute remaining!', 
                    urgency: 'warning',
                    audio: 'warning_beep'
                })
                
                // Show visual feedback for warning
                if (this.diagnosticUIManager) {
                    this.diagnosticUIManager.showTimerWarning(60);
                }
            } else if (this.gameState.timeRemaining === 30) {
                this.emit('timer_critical', { 
                    message: '🚨 30 seconds left!', 
                    urgency: 'critical',
                    audio: 'urgent_beep'
                })
                
                // Show enhanced visual feedback for critical time
                if (this.diagnosticUIManager) {
                    this.diagnosticUIManager.showTimerCritical(30);
                }
            } else if (this.gameState.timeRemaining <= 10 && this.gameState.timeRemaining > 0) {
                // Visual and audio feedback for last 10 seconds
                this.emit('timer_final_seconds', { 
                    seconds: this.gameState.timeRemaining,
                    audio: 'countdown_beep'
                })
                
                if (this.diagnosticUIManager) {
                    this.diagnosticUIManager.showTimerFinalSeconds(this.gameState.timeRemaining);
                }
            }

            if (this.gameState.timeRemaining <= 0) {
                clearInterval(timerInterval)
                this.emit('timer_expired', { 
                    finalScore: this.gameState.score,
                    message: '⏰ Time\'s up! Great effort!'
                })
                
                if (this.diagnosticUIManager) {
                    this.diagnosticUIManager.showTimerExpired();
                }
            }
        }, 1000)
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
        const oldPhase = this.gameState.phase;
        this.gameState.phase = newPhase;

        // If phase changed to 'solved' (game completed), record session completion and high score
        if (oldPhase !== 'solved' && newPhase === 'solved') {
            this.recordSessionCompletion();
            this.recordHighScore();
        }

        this.emit('gameStateUpdated', this.gameState);
    }

    // AGGRESSIVE CONSOLIDATION: Single updateState method for all state changes
    public updateState(updates: Partial<GameState>) {
        const oldPhase = this.gameState.phase;
        this.gameState = { ...this.gameState, ...updates };

        // If phase changed to 'solved' (game completed), record session completion
        if (oldPhase !== 'solved' && this.gameState.phase === 'solved') {
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

        // Save session data for future spaced repetition scheduling
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

    // Public method to check achievements
    public checkAchievements(gameState: GameState, event: any) {
        this.achievementSystem?.checkAchievements(gameState, event);
    }

    // Reset the game state to initial values
    public resetGameState(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
        // Record current session before resetting and potentially store high score
        if (this.gameState.phase === 'solved') {
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

}
