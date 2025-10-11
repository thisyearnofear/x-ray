/**
 * Enhanced Diagnostic UI
 * INTEGRATION: Extends existing DiagnosticUIFacade with enhanced features
 * SEAMLESS: Maintains backward compatibility while adding new capabilities
 * MODULAR: Clean separation between basic and enhanced functionality
 */

import { DiagnosticUIFacade, DiagnosticUIConfig } from './DiagnosticUIFacade'
import { EnhancedGameManager, GameEvent } from './EnhancedGameManager'
import { MedicalCase } from '../medical/types'
import { colors, spacing, typography, borders, effects, zIndex } from '../../styles/design-tokens'

export interface EnhancedDiagnosticUIConfig extends DiagnosticUIConfig {
  enhancedGameManager?: EnhancedGameManager
  enableEnhancedFeatures?: boolean
}

export class EnhancedDiagnosticUI extends DiagnosticUIFacade {
  private enhancedGameManager: EnhancedGameManager | null = null
  private enhancedFeaturesEnabled: boolean = false
  private enhancedUIElements: Map<string, HTMLElement> = new Map()
  private updateInterval: number | null = null

  constructor(config: EnhancedDiagnosticUIConfig) {
    super(config)
    
    this.enhancedGameManager = config.enhancedGameManager || null
    this.enhancedFeaturesEnabled = config.enableEnhancedFeatures || false
    
    if (this.enhancedFeaturesEnabled && this.enhancedGameManager) {
      this.setupEnhancedFeatures()
    }
    
    console.log('🎮 Enhanced Diagnostic UI initialized')
  }

  private setupEnhancedFeatures(): void {
    if (!this.enhancedGameManager) return

    // Listen for enhanced game events
    this.enhancedGameManager.addEventListener('revelation', (event: GameEvent) => {
      this.handleEnhancedRevelation(event)
    })

    this.enhancedGameManager.addEventListener('consultation_complete', (event: GameEvent) => {
      this.handleEnhancedConsultation(event)
    })

    this.enhancedGameManager.addEventListener('narrative_choice', (event: GameEvent) => {
      this.handleEnhancedNarrative(event)
    })

    this.enhancedGameManager.addEventListener('difficulty_adjusted', (event: GameEvent) => {
      this.handleDifficultyAdjustment(event)
    })

    // Start periodic UI updates
    this.startEnhancedUIUpdates()
  }

  /**
   * Enable enhanced features
   */
  public enableEnhancedFeatures(enhancedGameManager: EnhancedGameManager): void {
    this.enhancedGameManager = enhancedGameManager
    this.enhancedFeaturesEnabled = true
    this.setupEnhancedFeatures()
    this.createEnhancedUIElements()
    
    console.log('🎮 Enhanced features enabled')
  }

  /**
   * Disable enhanced features
   */
  public disableEnhancedFeatures(): void {
    this.enhancedFeaturesEnabled = false
    this.destroyEnhancedUIElements()
    this.stopEnhancedUIUpdates()
    
    console.log('🎮 Enhanced features disabled')
  }

  private createEnhancedUIElements(): void {
    this.createAdaptiveDifficultyPanel()
    this.createProgressiveRevelationPanel()
    this.createInvestigationPanel()
    this.createNarrativePanel()
    this.createPerformanceMetricsPanel()
  }

  private createAdaptiveDifficultyPanel(): void {
    const panel = document.createElement('div')
    panel.id = 'adaptive-difficulty-panel'
    panel.style.cssText = `
      position: fixed;
      top: ${spacing.lg};
      right: ${spacing.lg};
      width: 280px;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.accent};
      border-radius: ${borders.radius.xl};
      padding: ${spacing.md};
      color: ${colors.neutral.light};
      font-family: ${typography.fontFamily.primary};
      z-index: ${zIndex.panel};
      box-shadow: ${effects.shadow.lg}, ${effects.shadow.accentGlow};
      backdrop-filter: ${effects.blur.lg};
      ${effects.inset.medium}
    `

    panel.innerHTML = `
      <div style="
        color: ${colors.accent.base};
        font-size: ${typography.fontSize.sm};
        font-weight: ${typography.fontWeight.bold};
        margin-bottom: ${spacing.sm};
        text-transform: uppercase;
        letter-spacing: ${typography.letterSpacing.wider};
      ">🎯 ADAPTIVE DIFFICULTY</div>
      
      <div id="difficulty-content">
        <div style="margin-bottom: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Current Level</div>
          <div style="display: flex; align-items: center; gap: ${spacing.sm}; margin-top: ${spacing.xs};">
            <div style="flex: 1; height: 6px; background: ${colors.background.primaryGlow}; border-radius: ${borders.radius.full};">
              <div id="difficulty-progress" style="width: 50%; height: 100%; background: ${colors.accent.base}; border-radius: ${borders.radius.full};"></div>
            </div>
            <div id="difficulty-percentage" style="font-size: ${typography.fontSize.xs}; color: ${colors.accent.base};">50%</div>
          </div>
        </div>
        
        <div style="margin-bottom: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Confidence</div>
          <div style="display: flex; align-items: center; gap: ${spacing.sm}; margin-top: ${spacing.xs};">
            <div style="flex: 1; height: 6px; background: ${colors.background.primaryGlow}; border-radius: ${borders.radius.full};">
              <div id="confidence-progress" style="width: 30%; height: 100%; background: ${colors.primary.base}; border-radius: ${borders.radius.full};"></div>
            </div>
            <div id="confidence-percentage" style="font-size: ${typography.fontSize.xs}; color: ${colors.primary.base};">30%</div>
          </div>
        </div>
        
        <div id="difficulty-status" style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.light};">Monitoring performance...</div>
      </div>
    `

    document.body.appendChild(panel)
    this.enhancedUIElements.set('adaptive-difficulty', panel)
  }

  private createProgressiveRevelationPanel(): void {
    const panel = document.createElement('div')
    panel.id = 'progressive-revelation-panel'
    panel.style.cssText = `
      position: fixed;
      top: calc(${spacing.lg} + 320px);
      right: ${spacing.lg};
      width: 280px;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.info};
      border-radius: ${borders.radius.xl};
      padding: ${spacing.md};
      color: ${colors.neutral.light};
      font-family: ${typography.fontFamily.primary};
      z-index: ${zIndex.panel};
      box-shadow: ${effects.shadow.lg}, 0 0 20px rgba(0, 212, 255, 0.3);
      backdrop-filter: ${effects.blur.lg};
      ${effects.inset.medium}
    `

    panel.innerHTML = `
      <div style="
        color: ${colors.info.base};
        font-size: ${typography.fontSize.sm};
        font-weight: ${typography.fontWeight.bold};
        margin-bottom: ${spacing.sm};
        text-transform: uppercase;
        letter-spacing: ${typography.letterSpacing.wider};
      ">🔍 PROGRESSIVE REVELATION</div>
      
      <div id="revelation-content">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${spacing.sm}; margin-bottom: ${spacing.sm};">
          <div style="text-align: center;">
            <div id="revealed-count" style="font-size: ${typography.fontSize.lg}; color: ${colors.info.base}; font-weight: ${typography.fontWeight.bold};">0</div>
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Revealed</div>
          </div>
          <div style="text-align: center;">
            <div id="red-herrings-count" style="font-size: ${typography.fontSize.lg}; color: ${colors.error.base}; font-weight: ${typography.fontWeight.bold};">0</div>
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Red Herrings</div>
          </div>
        </div>
        
        <div style="margin-bottom: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Clinical Judgment Accuracy</div>
          <div style="display: flex; align-items: center; gap: ${spacing.sm}; margin-top: ${spacing.xs};">
            <div style="flex: 1; height: 6px; background: ${colors.background.primaryGlow}; border-radius: ${borders.radius.full};">
              <div id="judgment-progress" style="width: 50%; height: 100%; background: ${colors.info.base}; border-radius: ${borders.radius.full};"></div>
            </div>
            <div id="judgment-percentage" style="font-size: ${typography.fontSize.xs}; color: ${colors.info.base};">50%</div>
          </div>
        </div>
        
        <div id="revelation-status" style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.light};">Scanning for findings...</div>
      </div>
    `

    document.body.appendChild(panel)
    this.enhancedUIElements.set('progressive-revelation', panel)
  }

  private createInvestigationPanel(): void {
    const panel = document.createElement('div')
    panel.id = 'investigation-panel'
    panel.style.cssText = `
      position: fixed;
      bottom: ${spacing.lg};
      left: ${spacing.lg};
      width: 320px;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.primary};
      border-radius: ${borders.radius.xl};
      padding: ${spacing.md};
      color: ${colors.neutral.light};
      font-family: ${typography.fontFamily.primary};
      z-index: ${zIndex.panel};
      box-shadow: ${effects.shadow.lg}, ${effects.shadow.primaryGlow};
      backdrop-filter: ${effects.blur.lg};
      ${effects.inset.medium}
    `

    panel.innerHTML = `
      <div style="
        color: ${colors.primary.base};
        font-size: ${typography.fontSize.sm};
        font-weight: ${typography.fontWeight.bold};
        margin-bottom: ${spacing.sm};
        text-transform: uppercase;
        letter-spacing: ${typography.letterSpacing.wider};
      ">🔬 INVESTIGATION TOOLKIT</div>
      
      <div id="investigation-content">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: ${spacing.xs}; margin-bottom: ${spacing.sm};">
          <div style="text-align: center;">
            <div id="techniques-used" style="font-size: ${typography.fontSize.md}; color: ${colors.primary.base}; font-weight: ${typography.fontWeight.bold};">0</div>
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Techniques</div>
          </div>
          <div style="text-align: center;">
            <div id="consultations-requested" style="font-size: ${typography.fontSize.md}; color: ${colors.accent.base}; font-weight: ${typography.fontWeight.bold};">0</div>
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Consults</div>
          </div>
          <div style="text-align: center;">
            <div id="pending-results" style="font-size: ${typography.fontSize.md}; color: ${colors.error.base}; font-weight: ${typography.fontWeight.bold};">0</div>
            <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Pending</div>
          </div>
        </div>
        
        <div id="investigation-techniques" style="margin-bottom: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base}; margin-bottom: ${spacing.xs};">Available Techniques</div>
          <div style="display: flex; flex-wrap: wrap; gap: ${spacing.xs};">
            <button class="technique-btn" data-technique="palpation" style="
              background: ${colors.background.primaryGlow};
              color: ${colors.primary.base};
              border: ${borders.width.thin} solid ${colors.border.primary};
              padding: ${spacing.xs} ${spacing.sm};
              border-radius: ${borders.radius.md};
              cursor: pointer;
              font-size: ${typography.fontSize.xs};
              transition: all 0.3s ease;
            ">Palpation</button>
            <button class="technique-btn" data-technique="auscultation" style="
              background: ${colors.background.primaryGlow};
              color: ${colors.primary.base};
              border: ${borders.width.thin} solid ${colors.border.primary};
              padding: ${spacing.xs} ${spacing.sm};
              border-radius: ${borders.radius.md};
              cursor: pointer;
              font-size: ${typography.fontSize.xs};
              transition: all 0.3s ease;
            ">Auscultation</button>
            <button class="technique-btn" data-technique="percussion" style="
              background: ${colors.background.primaryGlow};
              color: ${colors.primary.base};
              border: ${borders.width.thin} solid ${colors.border.primary};
              padding: ${spacing.xs} ${spacing.sm};
              border-radius: ${borders.radius.md};
              cursor: pointer;
              font-size: ${typography.fontSize.xs};
              transition: all 0.3s ease;
            ">Percussion</button>
          </div>
        </div>
        
        <div id="investigation-status" style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.light};">Ready for investigation...</div>
      </div>
    `

    // Add event listeners for technique buttons
    panel.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('technique-btn')) {
        const technique = target.getAttribute('data-technique')
        if (technique) {
          this.performInvestigationTechnique(technique)
        }
      }
    })

    document.body.appendChild(panel)
    this.enhancedUIElements.set('investigation', panel)
  }

  private createNarrativePanel(): void {
    const panel = document.createElement('div')
    panel.id = 'narrative-panel'
    panel.style.cssText = `
      position: fixed;
      bottom: ${spacing.lg};
      right: ${spacing.lg};
      width: 300px;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.accent};
      border-radius: ${borders.radius.xl};
      padding: ${spacing.md};
      color: ${colors.neutral.light};
      font-family: ${typography.fontFamily.primary};
      z-index: ${zIndex.panel};
      box-shadow: ${effects.shadow.lg}, ${effects.shadow.accentGlow};
      backdrop-filter: ${effects.blur.lg};
      ${effects.inset.medium};
      display: none;
    `

    panel.innerHTML = `
      <div style="
        color: ${colors.accent.base};
        font-size: ${typography.fontSize.sm};
        font-weight: ${typography.fontWeight.bold};
        margin-bottom: ${spacing.sm};
        text-transform: uppercase;
        letter-spacing: ${typography.letterSpacing.wider};
      ">📚 NARRATIVE CHOICES</div>
      
      <div id="narrative-content">
        <!-- Dynamic content will be inserted here -->
      </div>
    `

    document.body.appendChild(panel)
    this.enhancedUIElements.set('narrative', panel)
  }

  private createPerformanceMetricsPanel(): void {
    const panel = document.createElement('div')
    panel.id = 'performance-metrics-panel'
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: ${spacing.lg};
      transform: translateY(-50%);
      width: 250px;
      background: ${colors.background.gradient.panel};
      border: ${borders.width.base} solid ${colors.border.neutral};
      border-radius: ${borders.radius.xl};
      padding: ${spacing.md};
      color: ${colors.neutral.light};
      font-family: ${typography.fontFamily.primary};
      z-index: ${zIndex.panel};
      box-shadow: ${effects.shadow.lg};
      backdrop-filter: ${effects.blur.lg};
      ${effects.inset.medium}
    `

    panel.innerHTML = `
      <div style="
        color: ${colors.neutral.base};
        font-size: ${typography.fontSize.sm};
        font-weight: ${typography.fontWeight.bold};
        margin-bottom: ${spacing.sm};
        text-transform: uppercase;
        letter-spacing: ${typography.letterSpacing.wider};
      ">📊 PERFORMANCE METRICS</div>
      
      <div id="performance-content">
        <div style="margin-bottom: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Diagnostic Accuracy</div>
          <div style="display: flex; align-items: center; gap: ${spacing.sm}; margin-top: ${spacing.xs};">
            <div style="flex: 1; height: 6px; background: ${colors.background.primaryGlow}; border-radius: ${borders.radius.full};">
              <div id="accuracy-progress" style="width: 50%; height: 100%; background: ${colors.primary.base}; border-radius: ${borders.radius.full};"></div>
            </div>
            <div id="accuracy-percentage" style="font-size: ${typography.fontSize.xs}; color: ${colors.primary.base};">50%</div>
          </div>
        </div>
        
        <div style="margin-bottom: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Time Efficiency</div>
          <div style="display: flex; align-items: center; gap: ${spacing.sm}; margin-top: ${spacing.xs};">
            <div style="flex: 1; height: 6px; background: ${colors.background.primaryGlow}; border-radius: ${borders.radius.full};">
              <div id="efficiency-progress" style="width: 50%; height: 100%; background: ${colors.info.base}; border-radius: ${borders.radius.full};"></div>
            </div>
            <div id="efficiency-percentage" style="font-size: ${typography.fontSize.xs}; color: ${colors.info.base};">50%</div>
          </div>
        </div>
        
        <div style="margin-bottom: ${spacing.sm};">
          <div style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.base};">Ethical Alignment</div>
          <div style="display: flex; align-items: center; gap: ${spacing.sm}; margin-top: ${spacing.xs};">
            <div style="flex: 1; height: 6px; background: ${colors.background.primaryGlow}; border-radius: ${borders.radius.full};">
              <div id="ethical-progress" style="width: 50%; height: 100%; background: ${colors.accent.base}; border-radius: ${borders.radius.full};"></div>
            </div>
            <div id="ethical-percentage" style="font-size: ${typography.fontSize.xs}; color: ${colors.accent.base};">50%</div>
          </div>
        </div>
        
        <div id="performance-summary" style="font-size: ${typography.fontSize.xs}; color: ${colors.neutral.light}; text-align: center; padding-top: ${spacing.sm}; border-top: ${borders.width.thin} solid ${colors.border.neutral};">Overall: Developing</div>
      </div>
    `

    document.body.appendChild(panel)
    this.enhancedUIElements.set('performance', panel)
  }

  private startEnhancedUIUpdates(): void {
    this.updateInterval = window.setInterval(() => {
      this.updateEnhancedUI()
    }, 1000) // Update every second
  }

  private stopEnhancedUIUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  private updateEnhancedUI(): void {
    if (!this.enhancedFeaturesEnabled || !this.enhancedGameManager) return

    const gameState = this.enhancedGameManager.getGameState()
    
    this.updateAdaptiveDifficultyPanel(gameState)
    this.updateProgressiveRevelationPanel(gameState)
    this.updateInvestigationPanel(gameState)
    this.updatePerformanceMetricsPanel(gameState)
  }

  private updateAdaptiveDifficultyPanel(gameState: any): void {
    const difficultyProgress = document.getElementById('difficulty-progress')
    const difficultyPercentage = document.getElementById('difficulty-percentage')
    const confidenceProgress = document.getElementById('confidence-progress')
    const confidencePercentage = document.getElementById('confidence-percentage')
    const difficultyStatus = document.getElementById('difficulty-status')

    if (difficultyProgress && difficultyPercentage) {
      const level = Math.round(gameState.adaptiveDifficulty.currentLevel * 100)
      difficultyProgress.style.width = `${level}%`
      difficultyPercentage.textContent = `${level}%`
    }

    if (confidenceProgress && confidencePercentage) {
      const confidence = Math.round(gameState.adaptiveDifficulty.confidence * 100)
      confidenceProgress.style.width = `${confidence}%`
      confidencePercentage.textContent = `${confidence}%`
    }

    if (difficultyStatus) {
      const level = gameState.adaptiveDifficulty.currentLevel
      if (level < 0.3) {
        difficultyStatus.textContent = 'Difficulty: Beginner level'
      } else if (level < 0.7) {
        difficultyStatus.textContent = 'Difficulty: Intermediate level'
      } else {
        difficultyStatus.textContent = 'Difficulty: Advanced level'
      }
    }
  }

  private updateProgressiveRevelationPanel(gameState: any): void {
    const revealedCount = document.getElementById('revealed-count')
    const redHerringsCount = document.getElementById('red-herrings-count')
    const judgmentProgress = document.getElementById('judgment-progress')
    const judgmentPercentage = document.getElementById('judgment-percentage')
    const revelationStatus = document.getElementById('revelation-status')

    if (revealedCount) {
      revealedCount.textContent = gameState.revelation.totalRevealed.toString()
    }

    if (redHerringsCount) {
      redHerringsCount.textContent = gameState.revelation.redHerringsEncountered.toString()
    }

    if (judgmentProgress && judgmentPercentage) {
      const accuracy = Math.round(gameState.revelation.clinicalJudgmentAccuracy * 100)
      judgmentProgress.style.width = `${accuracy}%`
      judgmentPercentage.textContent = `${accuracy}%`
    }

    if (revelationStatus) {
      if (gameState.revelation.totalRevealed === 0) {
        revelationStatus.textContent = 'Scanning for findings...'
      } else if (gameState.revelation.redHerringsEncountered > 0) {
        revelationStatus.textContent = 'Red herrings detected - use clinical judgment'
      } else {
        revelationStatus.textContent = `${gameState.revelation.totalRevealed} findings revealed`
      }
    }
  }

  private updateInvestigationPanel(gameState: any): void {
    const techniquesUsed = document.getElementById('techniques-used')
    const consultationsRequested = document.getElementById('consultations-requested')
    const pendingResults = document.getElementById('pending-results')
    const investigationStatus = document.getElementById('investigation-status')

    if (techniquesUsed) {
      techniquesUsed.textContent = gameState.investigation.techniquesUsed.length.toString()
    }

    if (consultationsRequested) {
      consultationsRequested.textContent = gameState.investigation.consultationsRequested.length.toString()
    }

    if (pendingResults) {
      pendingResults.textContent = gameState.investigation.pendingResults.toString()
    }

    if (investigationStatus) {
      if (gameState.investigation.pendingResults > 0) {
        investigationStatus.textContent = `${gameState.investigation.pendingResults} results pending...`
      } else if (gameState.investigation.techniquesUsed.length === 0) {
        investigationStatus.textContent = 'Ready for investigation...'
      } else {
        investigationStatus.textContent = `${gameState.investigation.techniquesUsed.length} techniques completed`
      }
    }
  }

  private updatePerformanceMetricsPanel(gameState: any): void {
    const accuracyProgress = document.getElementById('accuracy-progress')
    const accuracyPercentage = document.getElementById('accuracy-percentage')
    const efficiencyProgress = document.getElementById('efficiency-progress')
    const efficiencyPercentage = document.getElementById('efficiency-percentage')
    const ethicalProgress = document.getElementById('ethical-progress')
    const ethicalPercentage = document.getElementById('ethical-percentage')
    const performanceSummary = document.getElementById('performance-summary')

    if (accuracyProgress && accuracyPercentage) {
      const accuracy = Math.round(gameState.performance.diagnosticAccuracy * 100)
      accuracyProgress.style.width = `${accuracy}%`
      accuracyPercentage.textContent = `${accuracy}%`
    }

    if (efficiencyProgress && efficiencyPercentage) {
      const efficiency = Math.round(gameState.performance.timeEfficiency * 100)
      efficiencyProgress.style.width = `${efficiency}%`
      efficiencyPercentage.textContent = `${efficiency}%`
    }

    if (ethicalProgress && ethicalPercentage) {
      const ethical = Math.round(gameState.performance.ethicalChoiceAlignment * 100)
      ethicalProgress.style.width = `${ethical}%`
      ethicalPercentage.textContent = `${ethical}%`
    }

    if (performanceSummary) {
      const overall = (gameState.performance.diagnosticAccuracy + 
                      gameState.performance.timeEfficiency + 
                      gameState.performance.ethicalChoiceAlignment) / 3
      
      if (overall < 0.4) {
        performanceSummary.textContent = 'Overall: Developing'
      } else if (overall < 0.7) {
        performanceSummary.textContent = 'Overall: Competent'
      } else {
        performanceSummary.textContent = 'Overall: Expert'
      }
    }
  }

  /**
   * Enhanced event handlers
   */
  private handleEnhancedRevelation(event: GameEvent): void {
    if (event.data.type === 'case_started') {
      this.showPatientBackstoryNotification(event.data.backstory)
    } else if (event.data.revealed) {
      this.showRevelationNotification(event.data.region, event.data.revealed)
    }
  }

  private handleEnhancedConsultation(event: GameEvent): void {
    if (event.data.consultation) {
      this.showConsultationNotification(event.data.consultation)
    }
  }

  private handleEnhancedNarrative(event: GameEvent): void {
    if (event.data.choices) {
      this.showNarrativeChoices(event.data.choices)
    }
  }

  private handleDifficultyAdjustment(event: GameEvent): void {
    this.showDifficultyAdjustmentNotification(event.data.modification)
  }

  private showPatientBackstoryNotification(backstory: any): void {
    this.showEnhancedNotification('Patient Background', `
      Occupation: ${backstory.personalBackground.occupation}
      Stress Level: ${Math.round(backstory.psychosocialFactors.stressLevel * 100)}%
      Quality of Life: ${backstory.presentingContext.qualityOfLifeScore}/10
    `, 'info')
  }

  private showRevelationNotification(region: string, revealed: any[]): void {
    revealed.forEach(data => {
      this.showEnhancedNotification(`New Finding - ${region}`, `
        ${data.content}
        Significance: ${data.significance}
      `, data.significance === 'critical' ? 'error' : 'info')
    })
  }

  private showConsultationNotification(consultation: any): void {
    this.showEnhancedNotification('Consultation Complete', `
      ${consultation.specialist} (${consultation.specialty})
      Confidence: ${Math.round(consultation.confidence * 100)}%
      Recommendations: ${consultation.recommendations.slice(0, 2).join(', ')}
    `, 'success')
  }

  private showDifficultyAdjustmentNotification(modification: any): void {
    const direction = modification.difficultyAdjustment > 0 ? 'increased' : 'decreased'
    this.showEnhancedNotification('Difficulty Adjusted', `
      Difficulty ${direction} based on your performance
      Time allowance: ${Math.round(modification.timeAllowanceMultiplier * 100)}%
      Hints: ${modification.hintAvailability}
    `, 'warning')
  }

  private showNarrativeChoices(choices: any[]): void {
    const panel = this.enhancedUIElements.get('narrative')
    if (!panel) return

    const content = panel.querySelector('#narrative-content')
    if (!content) return

    panel.style.display = 'block'
    
    content.innerHTML = choices.map(choice => `
      <div style="margin-bottom: ${spacing.md}; padding: ${spacing.sm}; border: ${borders.width.thin} solid ${colors.border.accent}; border-radius: ${borders.radius.md};">
        <div style="font-weight: ${typography.fontWeight.bold}; margin-bottom: ${spacing.sm}; color: ${colors.accent.base};">${choice.prompt}</div>
        ${choice.options.map((option: any) => `
          <button onclick="window.enhancedDiagnosticUI.makeNarrativeChoice('${choice.id}', '${option.id}')" style="
            display: block;
            width: 100%;
            margin: ${spacing.xs} 0;
            padding: ${spacing.sm};
            background: ${colors.background.accentGlow};
            color: ${colors.accent.base};
            border: ${borders.width.thin} solid ${colors.border.accent};
            border-radius: ${borders.radius.md};
            cursor: pointer;
            font-size: ${typography.fontSize.xs};
            transition: all 0.3s ease;
          ">${option.text}</button>
        `).join('')}
      </div>
    `).join('')

    // Make this instance globally accessible for button clicks
    ;(window as any).enhancedDiagnosticUI = this
  }

  private showEnhancedNotification(title: string, content: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const colorMap = {
      info: colors.info.base,
      success: colors.primary.base,
      warning: colors.accent.base,
      error: colors.error.base
    }

    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors.background.gradient.panel};
      color: ${colors.neutral.light};
      padding: ${spacing.md};
      border-radius: ${borders.radius.lg};
      border: ${borders.width.base} solid ${colorMap[type]};
      box-shadow: ${effects.shadow.lg};
      z-index: ${zIndex.notification};
      max-width: 400px;
      backdrop-filter: ${effects.blur.lg};
      animation: slideDown 0.3s ease-out;
    `

    notification.innerHTML = `
      <div style="font-weight: ${typography.fontWeight.bold}; color: ${colorMap[type]}; margin-bottom: ${spacing.xs};">${title}</div>
      <div style="font-size: ${typography.fontSize.sm}; white-space: pre-line;">${content}</div>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideUp 0.3s ease-in'
        setTimeout(() => {
          notification.parentNode?.removeChild(notification)
        }, 300)
      }
    }, 5000)
  }

  private async performInvestigationTechnique(technique: string): Promise<void> {
    if (!this.enhancedGameManager) return

    try {
      const events = await this.enhancedGameManager.processAction({
        type: 'investigate',
        data: { technique, region: 'general' },
        timestamp: Date.now(),
        technique
      })

      events.forEach(event => {
        if (event.type === 'revelation' && event.data.type === 'examination_result') {
          this.showEnhancedNotification('Investigation Result', `
            Technique: ${event.data.result.techniqueId}
            Findings: ${event.data.result.findings.join(', ')}
            Significance: ${Math.round(event.data.result.clinicalSignificance * 100)}%
          `, 'success')
        }
      })
    } catch (error) {
      console.error('Failed to perform investigation technique:', error)
      this.showEnhancedNotification('Investigation Error', 'Failed to perform technique', 'error')
    }
  }

  public async makeNarrativeChoice(choiceId: string, optionId: string): Promise<void> {
    if (!this.enhancedGameManager) return

    try {
      await this.enhancedGameManager.processAction({
        type: 'decide',
        data: { choiceId, optionId, reasoning: 'Player choice' },
        timestamp: Date.now()
      })

      // Hide narrative panel
      const panel = this.enhancedUIElements.get('narrative')
      if (panel) {
        panel.style.display = 'none'
      }

      this.showEnhancedNotification('Choice Made', 'Your decision has been recorded', 'success')
    } catch (error) {
      console.error('Failed to process narrative choice:', error)
      this.showEnhancedNotification('Choice Error', 'Failed to process decision', 'error')
    }
  }

  private destroyEnhancedUIElements(): void {
    this.enhancedUIElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    this.enhancedUIElements.clear()

    // Clean up global reference
    if ((window as any).enhancedDiagnosticUI === this) {
      delete (window as any).enhancedDiagnosticUI
    }
  }

  /**
   * Override destroy method to clean up enhanced features
   */
  public destroy(): void {
    this.disableEnhancedFeatures()
    super.destroy()
  }

  /**
   * Public interface for enhanced features
   */
  public getEnhancedGameManager(): EnhancedGameManager | null {
    return this.enhancedGameManager
  }

  public isEnhancedFeaturesEnabled(): boolean {
    return this.enhancedFeaturesEnabled
  }

  public getEnhancedGameState(): any {
    return this.enhancedGameManager?.getGameState()
  }

  public exportEnhancedAnalytics(): any {
    return this.enhancedGameManager?.getAnalyticsData()
  }
}