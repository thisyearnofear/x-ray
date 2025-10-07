/**
 * MODULAR: Scan progress tracking section
 * CLEAN: Single responsibility - scan progress visualization
 * DRY: Reusable progress display logic
 */

import { colors, spacing, typography, borders } from '../../../styles/design-tokens'
import { MEDICAL_CONDITIONS } from '../../medical/medical-data'

export interface ScanProgressData {
  conditionId: string
  progress: number
  isDiscovered: boolean
}

export class ScanProgressSection {
  private element: HTMLElement | null = null
  private progressData: Map<string, ScanProgressData> = new Map()

  create(): HTMLElement {
    this.element = document.createElement('div')
    this.element.className = 'scan-progress-section'
    this.element.id = 'scan-progress'
    
    this.element.innerHTML = `
      <div style="color: ${colors.primary.base}; font-size: ${typography.fontSize.sm}; margin-bottom: ${spacing.base}; text-align: center; letter-spacing: ${typography.letterSpacing.wider};">
        🔍 SCANNING PROGRESS
      </div>
      <div id="progress-list" style="display: flex; flex-direction: column; gap: ${spacing.sm};"></div>
    `
    
    return this.element
  }

  updateProgress(conditionId: string, progress: number, isDiscovered: boolean = false): void {
    this.progressData.set(conditionId, { conditionId, progress, isDiscovered })
    this.render()
  }

  removeProgress(conditionId: string): void {
    this.progressData.delete(conditionId)
    this.render()
  }

  clear(): void {
    this.progressData.clear()
    this.render()
  }

  private render(): void {
    if (!this.element) return

    const progressList = this.element.querySelector('#progress-list') as HTMLElement
    if (!progressList) return

    const entries = Array.from(this.progressData.values())
    
    if (entries.length === 0) {
      progressList.innerHTML = this.getEmptyState()
      return
    }

    const progressHTML = entries
      .map(data => this.createProgressCard(data))
      .join('')

    progressList.innerHTML = progressHTML
  }

  private createProgressCard(data: ScanProgressData): string {
    const condition = Object.values(MEDICAL_CONDITIONS).find(c => c.id === data.conditionId)
    const percentage = Math.round(data.progress * 100)
    
    const status = this.getProgressStatus(data)
    const config = this.getStatusConfig(status)

    return `
      <div class="condition-card" style="
        padding: ${spacing.sm} ${spacing.md}; 
        margin: ${spacing.xs} 0; 
        background: ${config.bg}; 
        border: ${borders.width.thin} solid ${config.color}33; 
        border-radius: ${borders.radius.md}; 
        display: flex; 
        align-items: center; 
        gap: ${spacing.sm};
        transition: all 0.3s ease;
      ">
        <span style="font-size: ${typography.fontSize.sm};">${config.symbol}</span>
        <span style="
          flex: 1; 
          color: ${config.color}; 
          font-size: ${typography.fontSize.xs}; 
          font-weight: ${typography.fontWeight.medium};
        ">
          ${condition?.name || data.conditionId}
        </span>
        <span style="
          color: ${config.color}; 
          font-size: ${typography.fontSize.xs}; 
          opacity: 0.8; 
          font-family: ${typography.fontFamily.monospace};
        ">
          ${percentage}%
        </span>
      </div>
    `
  }

  private getProgressStatus(data: ScanProgressData): 'scanning' | 'ready' | 'discovered' {
    if (data.isDiscovered) return 'discovered'
    if (data.progress >= 1.0) return 'ready'
    return 'scanning'
  }

  private getStatusConfig(status: string): { color: string; symbol: string; bg: string } {
    const configs = {
      'scanning': { 
        color: colors.neutral.white, 
        symbol: '🔍', 
        bg: 'rgba(255,255,255,0.05)' 
      },
      'ready': { 
        color: colors.accent.base, 
        symbol: '⚡', 
        bg: 'rgba(255,170,0,0.1)' 
      },
      'discovered': { 
        color: colors.primary.base, 
        symbol: '✅', 
        bg: 'rgba(0,255,136,0.1)' 
      }
    }
    
    return configs[status as keyof typeof configs] || configs['scanning']
  }

  private getEmptyState(): string {
    return `
      <div style="
        opacity: 0.6; 
        font-style: italic; 
        text-align: center; 
        padding: ${spacing.base}; 
        color: ${colors.neutral.light};
        font-size: ${typography.fontSize.sm};
      ">
        No active scans
      </div>
    `
  }

  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.progressData.clear()
    this.element = null
  }
}