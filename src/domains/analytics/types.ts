/**
 * Analytics Domain Types
 * COMPREHENSIVE: Type definitions for learning analytics and performance tracking
 * EXTENSIBLE: Designed to support future analytics features and metrics
 */

export interface PerformanceMetric {
  id: string
  name: string
  value: number
  trend: 'improving' | 'declining' | 'stable'
  target: number
  unit: string
  category: 'diagnostic' | 'efficiency' | 'ethical' | 'technical'
  timestamp: number
}

export interface LearningSession {
  id: string
  caseId: string
  startTime: number
  endTime: number
  diagnosticAccuracy: number
  timeEfficiency: number
  consultationUsage: number
  ethicalChoiceAlignment: number
  investigationTechniquesUsed: string[]
  narrativeChoicesMade: number
  mistakeCount: number
  hintsUsed: number
  difficultyLevel: number
}

export interface SkillProgression {
  skillId: string
  skillName: string
  category: string
  currentLevel: number
  maxLevel: number
  experience: number
  experienceToNext: number
  masteryPercentage: number
  lastImprovement: number
  practiceCount: number
  successRate: number
}

export interface LearningInsight {
  id: string
  type: 'strength' | 'improvement' | 'recommendation' | 'achievement'
  title: string
  description: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  data?: any
  timestamp: number
}

export interface AnalyticsTimeframe {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all'
  startDate: number
  endDate: number
}

export interface ChartDataPoint {
  x: number | string
  y: number
  label?: string
  category?: string
  metadata?: any
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'radar' | 'heatmap' | 'pie' | 'scatter'
  title: string
  xAxisLabel?: string
  yAxisLabel?: string
  showLegend: boolean
  showGrid: boolean
  colors: string[]
  width: number
  height: number
  responsive: boolean
}

export interface PerformanceComparison {
  metric: string
  userValue: number
  averageValue: number
  topPercentileValue: number
  rank: number
  totalUsers: number
  percentile: number
}

export interface LearningGoal {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  deadline?: number
  category: string
  priority: 'low' | 'medium' | 'high'
  isCompleted: boolean
  milestones: LearningMilestone[]
}

export interface LearningMilestone {
  id: string
  title: string
  description: string
  targetValue: number
  isCompleted: boolean
  completedAt?: number
  reward?: string
}

export interface AnalyticsFilter {
  timeframe: AnalyticsTimeframe
  caseTypes: string[]
  difficultyLevels: number[]
  specialties: string[]
  includeIncomplete: boolean
}

export interface AnalyticsSummary {
  totalSessions: number
  totalTimeSpent: number
  averageAccuracy: number
  averageEfficiency: number
  casesCompleted: number
  skillsImproved: number
  achievementsEarned: number
  currentStreak: number
  longestStreak: number
  lastActivity: number
}

export interface LearningRecommendation {
  id: string
  type: 'case' | 'skill' | 'technique' | 'specialty'
  title: string
  description: string
  reasoning: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  priority: number
  prerequisites: string[]
  expectedBenefit: string
}

export interface AnalyticsExport {
  userId: string
  exportDate: number
  timeframe: AnalyticsTimeframe
  summary: AnalyticsSummary
  sessions: LearningSession[]
  skills: SkillProgression[]
  insights: LearningInsight[]
  goals: LearningGoal[]
  format: 'json' | 'csv' | 'pdf'
}

export interface AnalyticsEvent {
  type: string
  data: any
  timestamp: number
  sessionId?: string
  userId?: string
}

export interface AnalyticsConfig {
  enableRealTimeUpdates: boolean
  updateInterval: number
  retentionPeriod: number
  enableComparisons: boolean
  enableRecommendations: boolean
  enableExports: boolean
  privacyMode: boolean
}

// Chart-specific types
export interface LineChartData {
  datasets: {
    label: string
    data: ChartDataPoint[]
    color: string
    strokeWidth?: number
  }[]
}

export interface BarChartData {
  categories: string[]
  series: {
    name: string
    data: number[]
    color: string
  }[]
}

export interface RadarChartData {
  categories: string[]
  datasets: {
    label: string
    data: number[]
    color: string
    fillOpacity?: number
  }[]
}

export interface HeatmapData {
  xLabels: string[]
  yLabels: string[]
  data: number[][]
  colorScale: {
    min: string
    max: string
  }
}

export interface PieChartData {
  segments: {
    label: string
    value: number
    color: string
    percentage: number
  }[]
}