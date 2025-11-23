/**
 * Case Session Manager
 * CLEAN: Single responsibility for session-level case persistence
 * PERFORMANT: Uses sessionStorage for fast access
 * DRY: Centralized session management logic
 */

export interface SessionData {
    case: any; // MedicalCase type
    gameState: {
        score: number;
        timeRemaining: number;
        discoveredConditions: string[];
        phase: string;
        patientState?: any;
        budget?: any;
    };
    sessionId: string;
    timestamp: number;
    seed?: number; // For deterministic regeneration
}

export class CaseSessionManager {
    private static readonly SESSION_KEY = 'x-ray-active-case';
    private static readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

    /**
     * Persist case and game state to session storage
     * ENHANCEMENT FIRST: Ensures consistency across page refreshes
     */
    static persistCase(caseData: any, gameState: any, seed?: number): void {
        const sessionData: SessionData = {
            case: caseData,
            gameState: {
                score: gameState.score || 0,
                timeRemaining: gameState.timeRemaining || 300,
                discoveredConditions: Array.from(gameState.discoveredConditions || []),
                phase: gameState.phase || 'patient_arrival',
                patientState: gameState.patientState?.getState ? gameState.patientState.getState() : undefined,
                budget: gameState.budget
            },
            sessionId: this.generateSessionId(caseData),
            timestamp: Date.now(),
            seed
        };

        try {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            console.log('✅ Case session persisted:', sessionData.sessionId);
        } catch (error) {
            console.error('❌ Failed to persist case session:', error);
        }
    }

    /**
     * Retrieve case from session storage
     * CLEAN: Returns null if session is stale or invalid
     */
    static retrieveCase(): SessionData | null {
        try {
            const stored = sessionStorage.getItem(this.SESSION_KEY);
            if (!stored) return null;

            const data: SessionData = JSON.parse(stored);

            // Validate session isn't stale
            if (Date.now() - data.timestamp > this.SESSION_TIMEOUT) {
                console.warn('⚠️ Session expired, clearing stale data');
                this.clearCase();
                return null;
            }

            console.log('📦 Retrieved case session:', data.sessionId);
            return data;
        } catch (error) {
            console.error('❌ Failed to retrieve case session:', error);
            return null;
        }
    }

    /**
     * Update specific fields in the session without replacing entire case
     * PERFORMANT: Only updates changed fields
     */
    static updateGameState(updates: Partial<SessionData['gameState']>): void {
        const existing = this.retrieveCase();
        if (!existing) return;

        existing.gameState = {
            ...existing.gameState,
            ...updates
        };
        existing.timestamp = Date.now(); // Refresh timestamp

        try {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(existing));
        } catch (error) {
            console.error('❌ Failed to update game state:', error);
        }
    }

    /**
     * Clear current session
     */
    static clearCase(): void {
        sessionStorage.removeItem(this.SESSION_KEY);
        console.log('🗑️ Case session cleared');
    }

    /**
     * Generate deterministic session ID from case parameters
     * MODULAR: Consistent ID generation for same case
     */
    private static generateSessionId(caseData: any): string {
        const key = `${caseData.patientName || 'unknown'}-${caseData.chiefComplaint || 'case'}-${caseData.timestamp || Date.now()}`;
        return btoa(key).substring(0, 16);
    }

    /**
     * Check if a valid session exists
     */
    static hasActiveSession(): boolean {
        return this.retrieveCase() !== null;
    }

    /**
     * Get session age in minutes
     */
    static getSessionAge(): number {
        const session = this.retrieveCase();
        if (!session) return 0;
        return Math.floor((Date.now() - session.timestamp) / (60 * 1000));
    }
}
