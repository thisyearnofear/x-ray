/**
 * Analytics Data Processor
 * INTELLIGENT: Processes raw game data into meaningful analytics insights
 * EFFICIENT: Optimized data aggregation and trend analysis
 * REAL-TIME: Supports live data processing and updates
 */

import { 
  LearningSession, 
  PerformanceMetric, 
  SkillProgression, 
  LearningInsight,
  AnalyticsTimeframe,
  AnalyticsSummary,
  LearningRecommendation,
  PerformanceComparison,
  ChartDataPoint
} from './types'
import { EnhancedGameState } from '../diagnostic/EnhancedGameManager'

export class AnalyticsDataProcessor {
  private sessions: LearningSession[] = []
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private skills: Map<string, SkillProgression> = new Map()
  private insights: LearningInsight[] = []
  private lastProcessedTime: number = 0

  constructor() {
    console.log('📊 Analytics Data Processor initialized')
  }

  /**
   * Process game state into analytics data
   */
  public processGameState(gameState: EnhancedGameState, sessionId: string): void {
    const currentTime = Date.now()
    
    // Create or update learning session
    this.updateLearningSession(gameState, sessionId, currentTime)
    
    // Update performance metrics
    this.updatePerformanceMetrics(gameState, currentTime)
    
    // Update skill progressions
    this.updateSkillProgressions(gameState, currentTime)
    
    // Generate insights
    this.generateInsights(gameState, currentTime)
    
    this.lastProcessedTime = currentTime
  }

  private updateLearningSession(gameState: EnhancedGameState, sessionId: string, timestamp: number): void {
    let session = this.sessions.find(s => s.id === sessionId)
    
    if (!session) {
      session = {
        id: sessionId,
        caseId: (gameState as any).currentCase?.id || 'unknown',
        startTime: gameState.sessionMetrics.startTime,
        endTime: timestamp,
        diagnosticAccuracy: gameState.performance.diagnosticAccuracy,
        timeEfficiency: gameState.performance.timeEfficiency,
        consultationUsage: gameState.performance.consultationUsage,
        ethicalChoiceAlignment: gameState.performance.ethicalChoiceAlignment,
        investigationTechniquesUsed: gameState.investigation.techniquesUsed,
        narrativeChoicesMade: gameState.narrative.ethicalChoicesMade,
        mistakeCount: gameState.sessionMetrics.mistakeCount,
        hintsUsed: 0, // Would be tracked in game state
        difficultyLevel: gameState.adaptiveDifficulty.currentLevel
      }
      this.sessions.push(session)
    } else {
      // Update existing session
      session.endTime = timestamp
      session.diagnosticAccuracy = gameState.performance.diagnosticAccuracy
      session.timeEfficiency = gameState.performance.timeEfficiency
      session.consultationUsage = gameState.performance.consultationUsage
      session.ethicalChoiceAlignment = gameState.performance.ethicalChoiceAlignment
      session.investigationTechniquesUsed = gameState.investigation.techniquesUsed
      session.narrativeChoicesMade = gameState.narrative.ethicalChoicesMade
      session.mistakeCount = gameState.sessionMetrics.mistakeCount
      session.difficultyLevel = gameState.adaptiveDifficulty.currentLevel
    }
  }

  private updatePerformanceMetrics(gameState: EnhancedGameState, timestamp: number): void {
    const metrics = [
      {
        id: 'diagnostic_accuracy',
        name: 'Diagnostic Accuracy',
        value: gameState.performance.diagnosticAccuracy,
        target: 0.8,
        unit: '%',
        category: 'diagnostic' as const
      },
      {
        id: 'time_efficiency',
        name: 'Time Efficiency',
        value: gameState.performance.timeEfficiency,
        target: 0.7,
        unit: '%',
        category: 'efficiency' as const
      },
      {
        id: 'consultation_usage',
        name: 'Consultation Usage',
        value: gameState.performance.consultationUsage,
        target: 0.6,
        unit: '%',
        category: 'technical' as const
      },
      {
        id: 'ethical_alignment',
        name: 'Ethical Alignment',
        value: gameState.performance.ethicalChoiceAlignment,
        target: 0.9,
        unit: '%',
        category: 'ethical' as const
      }
    ]

    metrics.forEach(metric => {
      const history = this.metrics.get(metric.id) || []
      
      // Calculate trend
      let trend: 'improving' | 'declining' | 'stable' = 'stable'
      if (history.length > 0) {
        const lastValue = history[history.length - 1].value
        if (metric.value > lastValue + 0.05) trend = 'improving'
        else if (metric.value < lastValue - 0.05) trend = 'declining'
      }

      const performanceMetric: PerformanceMetric = {
        ...metric,
        trend,
        timestamp
      }

      history.push(performanceMetric)
      
      // Keep only last 100 data points for performance
      if (history.length > 100) {
        history.shift()
      }
      
      this.metrics.set(metric.id, history)
    })
  }

  private updateSkillProgressions(gameState: EnhancedGameState, timestamp: number): void {
    // Update investigation technique skills
    gameState.investigation.techniquesUsed.forEach(technique => {
      this.updateSkill(technique, 'investigation', 10, timestamp)
    })

    // Update diagnostic skills based on accuracy
    if (gameState.performance.diagnosticAccuracy > 0.8) {
      this.updateSkill('diagnostic_reasoning', 'diagnostic', 15, timestamp)
    }

    // Update consultation skills
    if (gameState.performance.consultationUsage > 0) {
      this.updateSkill('consultation_skills', 'communication', 8, timestamp)
    }

    // Update ethical decision making
    if (gameState.narrative.ethicalChoicesMade > 0) {
      this.updateSkill('ethical_reasoning', 'ethics', 12, timestamp)
    }
  }

  private updateSkill(skillId: string, category: string, experienceGain: number, timestamp: number): void {
    let skill = this.skills.get(skillId)
    
    if (!skill) {
      skill = {
        skillId,
        skillName: this.getSkillDisplayName(skillId),
        category,
        currentLevel: 1,
        maxLevel: 10,
        experience: 0,
        experienceToNext: 100,
        masteryPercentage: 0,
        lastImprovement: timestamp,
        practiceCount: 0,
        successRate: 0
      }
    }

    // Add experience
    skill.experience += experienceGain
    skill.practiceCount += 1
    skill.lastImprovement = timestamp

    // Check for level up
    while (skill.experience >= skill.experienceToNext && skill.currentLevel < skill.maxLevel) {
      skill.currentLevel += 1
      skill.experience -= skill.experienceToNext
      skill.experienceToNext = skill.currentLevel * 100 // Increasing XP requirement
      
      // Generate level up insight
      this.insights.push({
        id: `levelup_${skillId}_${timestamp}`,
        type: 'achievement',
        title: 'Skill Level Up!',
        description: `${skill.skillName} reached level ${skill.currentLevel}`,
        actionable: false,
        priority: 'medium',
        category: 'progression',
        timestamp
      })
    }

    // Update mastery percentage
    skill.masteryPercentage = ((skill.currentLevel - 1) / (skill.maxLevel - 1)) * 100

    this.skills.set(skillId, skill)
  }

  private getSkillDisplayName(skillId: string): string {
    const displayNames: Record<string, string> = {
      'palpation': 'Palpation Technique',
      'auscultation': 'Auscultation Skills',
      'percussion': 'Percussion Examination',
      'inspection': 'Visual Inspection',
      'reflex_test': 'Reflex Testing',
      'diagnostic_reasoning': 'Diagnostic Reasoning',
      'consultation_skills': 'Consultation Skills',
      'ethical_reasoning': 'Ethical Decision Making'
    }
    
    return displayNames[skillId] || skillId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  private generateInsights(gameState: EnhancedGameState, timestamp: number): void {
    // Generate insights based on performance patterns
    const recentSessions = this.getRecentSessions(7) // Last 7 sessions
    
    if (recentSessions.length >= 3) {
      // Accuracy trend insight
      const accuracyTrend = this.calculateTrend(recentSessions.map(s => s.diagnosticAccuracy))
      if (accuracyTrend > 0.1) {
        this.addInsight({
          type: 'strength',
          title: 'Improving Diagnostic Accuracy',
          description: 'Your diagnostic accuracy has been consistently improving over recent sessions.',
          category: 'performance',
          priority: 'medium',
          timestamp
        })
      } else if (accuracyTrend < -0.1) {
        this.addInsight({
          type: 'improvement',
          title: 'Focus on Diagnostic Accuracy',
          description: 'Consider reviewing case fundamentals and taking more time with diagnoses.',
          category: 'performance',
          priority: 'high',
          timestamp
        })
      }

      // Time efficiency insight
      const efficiencyTrend = this.calculateTrend(recentSessions.map(s => s.timeEfficiency))
      if (efficiencyTrend < -0.1) {
        this.addInsight({
          type: 'recommendation',
          title: 'Time Management Opportunity',
          description: 'Try using investigation techniques more strategically to improve efficiency.',
          category: 'efficiency',
          priority: 'medium',
          timestamp
        })
      }

      // Investigation technique diversity
      const uniqueTechniques = new Set(recentSessions.flatMap(s => s.investigationTechniquesUsed))
      if (uniqueTechniques.size < 3) {
        this.addInsight({
          type: 'recommendation',
          title: 'Explore More Investigation Techniques',
          description: 'Try using different examination techniques to improve your diagnostic skills.',
          category: 'skills',
          priority: 'low',
          timestamp
        })
      }
    }

    // Skill-based insights
    this.skills.forEach(skill => {
      if (skill.masteryPercentage >= 80 && skill.masteryPercentage < 100) {
        this.addInsight({
          type: 'achievement',
          title: 'Near Mastery',
          description: `You're close to mastering ${skill.skillName}! Keep practicing.`,
          category: 'skills',
          priority: 'low',
          timestamp
        })
      }
    })
  }

  private addInsight(insight: Omit<LearningInsight, 'id' | 'actionable'>): void {
    const newInsight: LearningInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      actionable: insight.type === 'recommendation',
      ...insight
    }

    // Avoid duplicate insights
    const isDuplicate = this.insights.some(existing => 
      existing.title === newInsight.title && 
      existing.timestamp > newInsight.timestamp - 24 * 60 * 60 * 1000 // Within 24 hours
    )

    if (!isDuplicate) {
      this.insights.push(newInsight)
      
      // Keep only last 50 insights
      if (this.insights.length > 50) {
        this.insights.shift()
      }
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    return secondAvg - firstAvg
  }

  /**
   * Get analytics summary
   */
  public getAnalyticsSummary(timeframe?: AnalyticsTimeframe): AnalyticsSummary {
    const sessions = timeframe ? this.getSessionsInTimeframe(timeframe) : this.sessions
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTimeSpent: 0,
        averageAccuracy: 0,
        averageEfficiency: 0,
        casesCompleted: 0,
        skillsImproved: 0,
        achievementsEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: 0
      }
    }

    const totalTimeSpent = sessions.reduce((sum, session) => 
      sum + (session.endTime - session.startTime), 0)
    
    const averageAccuracy = sessions.reduce((sum, session) => 
      sum + session.diagnosticAccuracy, 0) / sessions.length
    
    const averageEfficiency = sessions.reduce((sum, session) => 
      sum + session.timeEfficiency, 0) / sessions.length

    const casesCompleted = new Set(sessions.map(s => s.caseId)).size
    
    const skillsImproved = Array.from(this.skills.values()).filter(skill => 
      skill.lastImprovement > (timeframe?.startDate || 0)).length

    const achievementsEarned = this.insights.filter(insight => 
      insight.type === 'achievement' && 
      insight.timestamp > (timeframe?.startDate || 0)).length

    return {
      totalSessions: sessions.length,
      totalTimeSpent,
      averageAccuracy,
      averageEfficiency,
      casesCompleted,
      skillsImproved,
      achievementsEarned,
      currentStreak: this.calculateCurrentStreak(),
      longestStreak: this.calculateLongestStreak(),
      lastActivity: Math.max(...sessions.map(s => s.endTime))
    }
  }

  /**
   * Get performance metrics for charts
   */
  public getPerformanceMetricsForChart(metricId: string, timeframe?: AnalyticsTimeframe): ChartDataPoint[] {
    const metrics = this.metrics.get(metricId) || []
    
    let filteredMetrics = metrics
    if (timeframe) {
      filteredMetrics = metrics.filter(m => 
        m.timestamp >= timeframe.startDate && m.timestamp <= timeframe.endDate)
    }

    return filteredMetrics.map(metric => ({
      x: metric.timestamp,
      y: metric.value,
      label: new Date(metric.timestamp).toLocaleDateString()
    }))
  }

  /**
   * Get skill progression data
   */
  public getSkillProgressions(): SkillProgression[] {
    return Array.from(this.skills.values()).sort((a, b) => b.masteryPercentage - a.masteryPercentage)
  }

  /**
   * Get recent insights
   */
  public getRecentInsights(limit: number = 10): LearningInsight[] {
    return this.insights
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * Generate learning recommendations
   */
  public generateRecommendations(): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = []
    const summary = this.getAnalyticsSummary()

    // Accuracy-based recommendations
    if (summary.averageAccuracy < 0.7) {
      recommendations.push({
        id: 'improve_accuracy',
        type: 'skill',
        title: 'Focus on Diagnostic Accuracy',
        description: 'Practice with easier cases to build confidence in diagnostic reasoning',
        reasoning: 'Your diagnostic accuracy is below the recommended threshold',
        difficulty: 'beginner',
        estimatedTime: 30,
        priority: 9,
        prerequisites: [],
        expectedBenefit: 'Improved diagnostic confidence and accuracy'
      })
    }

    // Efficiency recommendations
    if (summary.averageEfficiency < 0.6) {
      recommendations.push({
        id: 'improve_efficiency',
        type: 'technique',
        title: 'Time Management Training',
        description: 'Learn to prioritize investigation techniques for faster diagnosis',
        reasoning: 'Your time efficiency could be improved',
        difficulty: 'intermediate',
        estimatedTime: 20,
        priority: 7,
        prerequisites: ['basic_investigation'],
        expectedBenefit: 'Faster case completion without sacrificing accuracy'
      })
    }

    // Skill diversity recommendations
    const skillCount = this.skills.size
    if (skillCount < 5) {
      recommendations.push({
        id: 'expand_skills',
        type: 'skill',
        title: 'Expand Your Skill Set',
        description: 'Try different investigation techniques to become more well-rounded',
        reasoning: 'Limited variety in investigation techniques used',
        difficulty: 'beginner',
        estimatedTime: 15,
        priority: 5,
        prerequisites: [],
        expectedBenefit: 'More comprehensive diagnostic capabilities'
      })
    }

    return recommendations.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Helper methods
   */
  private getRecentSessions(count: number): LearningSession[] {
    return this.sessions
      .sort((a, b) => b.endTime - a.endTime)
      .slice(0, count)
  }

  private getSessionsInTimeframe(timeframe: AnalyticsTimeframe): LearningSession[] {
    return this.sessions.filter(session => 
      session.startTime >= timeframe.startDate && 
      session.endTime <= timeframe.endDate)
  }

  private calculateCurrentStreak(): number {
    // Calculate consecutive days with activity
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streak = 0
    let currentDate = new Date(today)
    
    while (true) {
      const dayStart = currentDate.getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000
      
      const hasActivity = this.sessions.some(session => 
        session.startTime >= dayStart && session.startTime < dayEnd)
      
      if (hasActivity) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  private calculateLongestStreak(): number {
    // This would require more sophisticated date tracking
    // For now, return current streak as placeholder
    return this.calculateCurrentStreak()
  }

  /**
   * Export analytics data
   */
  public exportData(timeframe?: AnalyticsTimeframe): any {
    return {
      summary: this.getAnalyticsSummary(timeframe),
      sessions: timeframe ? this.getSessionsInTimeframe(timeframe) : this.sessions,
      skills: this.getSkillProgressions(),
      insights: this.getRecentInsights(50),
      recommendations: this.generateRecommendations(),
      exportTimestamp: Date.now()
    }
  }

  /**
   * Clear old data
   */
  public clearOldData(retentionDays: number = 90): void {
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)
    
    // Clear old sessions
    this.sessions = this.sessions.filter(session => session.endTime > cutoffTime)
    
    // Clear old metrics
    this.metrics.forEach((metricHistory, key) => {
      const filteredHistory = metricHistory.filter(metric => metric.timestamp > cutoffTime)
      this.metrics.set(key, filteredHistory)
    })
    
    // Clear old insights
    this.insights = this.insights.filter(insight => insight.timestamp > cutoffTime)
    
    console.log(`📊 Cleared analytics data older than ${retentionDays} days`)
  }
}