/**
 * Analytics Domain
 * Exports for learning analytics, performance tracking, skill trees, and insights
 */

export { AnalyticsDashboard } from './AnalyticsDashboard'
export { AnalyticsDataProcessor } from './AnalyticsDataProcessor'
export { ChartComponents } from './ChartComponents'
export { SkillTreeData } from './SkillTreeData'
export { SkillTreeVisualization } from './SkillTreeVisualization'
export { SkillTreeManager } from './SkillTreeManager'
export { AchievementDefinitions } from './AchievementDefinitions'
export { AchievementSystem } from './AchievementSystem'
export { AchievementUI } from './AchievementUI'
export { PerformanceComparison } from './PerformanceComparison'

export type {
  PerformanceMetric as AnalyticsPerformanceMetric,
  LearningSession,
  SkillProgression,
  LearningInsight,
  AnalyticsTimeframe,
  ChartDataPoint,
  ChartConfig,
  PerformanceComparison as AnalyticsPerformanceComparison,
  LearningGoal,
  LearningMilestone,
  AnalyticsFilter,
  AnalyticsSummary,
  LearningRecommendation,
  AnalyticsExport,
  AnalyticsEvent,
  AnalyticsConfig,
  LineChartData,
  BarChartData,
  RadarChartData,
  HeatmapData,
  PieChartData
} from './types'

export type {
  SkillNode,
  SkillCategory,
  SkillConnection,
  SkillTreeConfig,
  UnlockCondition
} from './SkillTreeData'

export type {
  SkillTreeVisualizationConfig
} from './SkillTreeVisualization'

export type {
  SkillTreeManagerConfig,
  SkillUnlockEvent,
  SkillRecommendation
} from './SkillTreeManager'

export type {
  Achievement,
  AchievementCondition,
  AchievementReward,
  AchievementCategory,
  AchievementType,
  AchievementRarity
} from './AchievementDefinitions'

export type {
  PlayerAchievement,
  AchievementProgress,
  AchievementNotification,
  AchievementStats
} from './AchievementSystem'

export type {
  AchievementUIConfig
} from './AchievementUI'

export type {
  PerformanceMetric as ComparisonPerformanceMetric,
  LeaderboardEntry,
  ComparisonData,
  SocialStats
} from './PerformanceComparison'