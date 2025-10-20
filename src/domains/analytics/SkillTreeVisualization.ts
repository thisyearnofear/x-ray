/**
 * Skill Tree Visualization
 * INTERACTIVE: Zoomable, pannable skill tree with smooth animations
 * EDUCATIONAL: Clear visual representation of medical skill progression
 * RESPONSIVE: Adapts to different screen sizes and touch interactions
 */

import { SkillTreeData, SkillNode, SkillCategory, SkillConnection, SkillTreeConfig } from './SkillTreeData'
import { SkillProgression } from './types'
import { colors, spacing, typography, borders, effects } from '../../styles/design-tokens'

export interface SkillTreeVisualizationConfig {
  container: HTMLElement
  width: number
  height: number
  enableZoom: boolean
  enablePan: boolean
  enableAnimations: boolean
  showTooltips: boolean
  onSkillClick?: (skill: SkillNode) => void
  onSkillHover?: (skill: SkillNode | null) => void
}

export class SkillTreeVisualization {
  private container: HTMLElement
  private svg!: SVGElement
  private skillTreeData: SkillTreeData
  private config: SkillTreeVisualizationConfig
  private currentZoom: number = 1
  private currentPan: { x: number; y: number } = { x: 0, y: 0 }
  private isDragging: boolean = false
  private lastMousePosition: { x: number; y: number } = { x: 0, y: 0 }
  private skillElements: Map<string, SVGElement> = new Map()
  private connectionElements: SVGElement[] = []
  private tooltip: HTMLElement | null = null

  constructor(config: SkillTreeVisualizationConfig) {
    this.config = config
    this.container = config.container
    this.skillTreeData = new SkillTreeData()
    
    this.initializeVisualization()
    this.setupEventListeners()
    
    console.log('🌳 Skill Tree Visualization initialized')
  }

  private initializeVisualization(): void {
    // Create SVG container
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svg.setAttribute('width', this.config.width.toString())
    this.svg.setAttribute('height', this.config.height.toString())
    this.svg.setAttribute('viewBox', `0 0 ${this.config.width} ${this.config.height}`)
    this.svg.style.cssText = `
      background: ${colors.background.gradient.panel};
      border-radius: ${borders.radius.lg};
      cursor: grab;
      user-select: none;
    `

    // Create main group for zoom/pan transformations
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    mainGroup.id = 'skill-tree-main'
    this.svg.appendChild(mainGroup)

    // Create layers
    const connectionsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    connectionsLayer.id = 'connections-layer'
    mainGroup.appendChild(connectionsLayer)

    const skillsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    skillsLayer.id = 'skills-layer'
    mainGroup.appendChild(skillsLayer)

    const categoriesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    categoriesLayer.id = 'categories-layer'
    mainGroup.appendChild(categoriesLayer)

    this.container.appendChild(this.svg)

    // Render the skill tree
    this.renderSkillTree()
  }

  private renderSkillTree(): void {
    this.renderConnections()
    this.renderCategories()
    this.renderSkills()
  }

  private renderConnections(): void {
    const connectionsLayer = this.svg.querySelector('#connections-layer') as SVGGElement
    connectionsLayer.innerHTML = '' // Clear existing connections

    const connections = this.skillTreeData.getConnections()
    
    connections.forEach(connection => {
      const fromSkill = this.skillTreeData.getSkill(connection.from)
      const toSkill = this.skillTreeData.getSkill(connection.to)
      
      if (!fromSkill || !toSkill) return

      const line = this.createConnectionLine(fromSkill, toSkill, connection)
      connectionsLayer.appendChild(line)
      this.connectionElements.push(line)
    })
  }

  private createConnectionLine(fromSkill: SkillNode, toSkill: SkillNode, connection: SkillConnection): SVGElement {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    
    line.setAttribute('x1', fromSkill.position.x.toString())
    line.setAttribute('y1', fromSkill.position.y.toString())
    line.setAttribute('x2', toSkill.position.x.toString())
    line.setAttribute('y2', toSkill.position.y.toString())
    
    // Style based on connection type
    const connectionStyles = {
      prerequisite: {
        stroke: colors.border.primary,
        strokeWidth: '2',
        strokeDasharray: 'none',
        opacity: '0.8'
      },
      progression: {
        stroke: colors.primary.base,
        strokeWidth: '3',
        strokeDasharray: 'none',
        opacity: '0.9'
      },
      related: {
        stroke: colors.neutral.base,
        strokeWidth: '1',
        strokeDasharray: '5,5',
        opacity: '0.5'
      }
    }

    const style = connectionStyles[connection.type]
    Object.entries(style).forEach(([key, value]) => {
      line.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value)
    })

    // Add arrow marker for prerequisites
    if (connection.type === 'prerequisite') {
      line.setAttribute('marker-end', 'url(#arrowhead)')
    }

    return line
  }

  private renderCategories(): void {
    const categoriesLayer = this.svg.querySelector('#categories-layer') as SVGGElement
    categoriesLayer.innerHTML = '' // Clear existing categories

    const categories = this.skillTreeData.getCategories()
    
    categories.forEach(category => {
      const categoryGroup = this.createCategoryGroup(category)
      categoriesLayer.appendChild(categoryGroup)
    })
  }

  private createCategoryGroup(category: SkillCategory): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('class', 'category-group')
    
    // Category background circle
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    background.setAttribute('cx', category.position.x.toString())
    background.setAttribute('cy', category.position.y.toString())
    background.setAttribute('r', '80')
    background.setAttribute('fill', `${category.color}20`)
    background.setAttribute('stroke', category.color)
    background.setAttribute('stroke-width', '2')
    background.setAttribute('stroke-dasharray', '10,5')
    background.setAttribute('opacity', '0.3')
    group.appendChild(background)

    // Category label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('x', category.position.x.toString())
    label.setAttribute('y', (category.position.y - 90).toString())
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('fill', category.color)
    label.setAttribute('font-size', typography.fontSize.sm)
    label.setAttribute('font-weight', typography.fontWeight.bold)
    label.textContent = `${category.icon} ${category.name}`
    group.appendChild(label)

    return group
  }

  private renderSkills(): void {
    const skillsLayer = this.svg.querySelector('#skills-layer') as SVGGElement
    skillsLayer.innerHTML = '' // Clear existing skills

    const skills = this.skillTreeData.getAllSkills()
    
    skills.forEach(skill => {
      const skillElement = this.createSkillNode(skill)
      skillsLayer.appendChild(skillElement)
      this.skillElements.set(skill.id, skillElement)
    })

    // Create arrow marker definition
    this.createArrowMarker()
  }

  private createSkillNode(skill: SkillNode): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('class', 'skill-node')
    group.setAttribute('data-skill-id', skill.id)
    group.style.cursor = 'pointer'

    // Skill state styling
    const isLocked = !skill.isUnlocked
    const isCompleted = skill.isCompleted
    const isInProgress = skill.isUnlocked && !skill.isCompleted && skill.level > 1

    // Node circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', skill.position.x.toString())
    circle.setAttribute('cy', skill.position.y.toString())
    circle.setAttribute('r', '25')
    
    if (isLocked) {
      circle.setAttribute('fill', colors.background.panel)
      circle.setAttribute('stroke', colors.border.neutral)
      circle.setAttribute('opacity', '0.5')
    } else if (isCompleted) {
      circle.setAttribute('fill', colors.primary.base)
      circle.setAttribute('stroke', colors.primary.light)
      circle.setAttribute('opacity', '1')
    } else if (isInProgress) {
      circle.setAttribute('fill', colors.background.primaryGlow)
      circle.setAttribute('stroke', colors.primary.base)
      circle.setAttribute('opacity', '0.8')
    } else {
      circle.setAttribute('fill', colors.background.infoGlow)
      circle.setAttribute('stroke', colors.info.base)
      circle.setAttribute('opacity', '0.7')
    }
    
    circle.setAttribute('stroke-width', '3')
    group.appendChild(circle)

    // Progress ring
    if (!isLocked && skill.masteryPercentage > 0) {
      const progressRing = this.createProgressRing(skill)
      group.appendChild(progressRing)
    }

    // Skill icon
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    icon.setAttribute('x', skill.position.x.toString())
    icon.setAttribute('y', (skill.position.y + 5).toString())
    icon.setAttribute('text-anchor', 'middle')
    icon.setAttribute('font-size', '20')
    icon.setAttribute('opacity', isLocked ? '0.5' : '1')
    icon.textContent = skill.icon
    group.appendChild(icon)

    // Skill level badge
    if (!isLocked && skill.level > 1) {
      const levelBadge = this.createLevelBadge(skill)
      group.appendChild(levelBadge)
    }

    // Lock icon for locked skills
    if (isLocked) {
      const lockIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      lockIcon.setAttribute('x', (skill.position.x + 15).toString())
      lockIcon.setAttribute('y', (skill.position.y - 15).toString())
      lockIcon.setAttribute('text-anchor', 'middle')
      lockIcon.setAttribute('font-size', '12')
      lockIcon.setAttribute('fill', colors.neutral.light)
      lockIcon.textContent = '🔒'
      group.appendChild(lockIcon)
    }

    // Skill name
    const name = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    name.setAttribute('x', skill.position.x.toString())
    name.setAttribute('y', (skill.position.y + 45).toString())
    name.setAttribute('text-anchor', 'middle')
    name.setAttribute('fill', isLocked ? colors.neutral.light : colors.neutral.white)
    name.setAttribute('font-size', typography.fontSize.xs)
    name.setAttribute('font-weight', typography.fontWeight.bold)
    name.textContent = skill.name
    group.appendChild(name)

    // Add event listeners
    group.addEventListener('click', () => this.handleSkillClick(skill))
    group.addEventListener('mouseenter', () => this.handleSkillHover(skill))
    group.addEventListener('mouseleave', () => this.handleSkillHover(null))

    // Add hover effects
    group.addEventListener('mouseenter', () => {
      circle.setAttribute('stroke-width', '4')
      if (this.config.enableAnimations) {
        circle.style.transition = 'all 0.2s ease'
      }
    })

    group.addEventListener('mouseleave', () => {
      circle.setAttribute('stroke-width', '3')
    })

    return group
  }

  private createProgressRing(skill: SkillNode): SVGElement {
    const radius = 30
    const circumference = 2 * Math.PI * radius
    const progress = skill.masteryPercentage / 100
    const strokeDasharray = `${circumference * progress} ${circumference}`

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', skill.position.x.toString())
    circle.setAttribute('cy', skill.position.y.toString())
    circle.setAttribute('r', radius.toString())
    circle.setAttribute('fill', 'none')
    circle.setAttribute('stroke', skill.color)
    circle.setAttribute('stroke-width', '3')
    circle.setAttribute('stroke-dasharray', strokeDasharray)
    circle.setAttribute('stroke-linecap', 'round')
    circle.setAttribute('transform', `rotate(-90 ${skill.position.x} ${skill.position.y})`)
    circle.setAttribute('opacity', '0.8')

    return circle
  }

  private createLevelBadge(skill: SkillNode): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    
    const badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    badge.setAttribute('cx', (skill.position.x + 20).toString())
    badge.setAttribute('cy', (skill.position.y - 20).toString())
    badge.setAttribute('r', '10')
    badge.setAttribute('fill', colors.accent.base)
    badge.setAttribute('stroke', colors.background.panel)
    badge.setAttribute('stroke-width', '2')
    group.appendChild(badge)

    const level = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    level.setAttribute('x', (skill.position.x + 20).toString())
    level.setAttribute('y', (skill.position.y - 16).toString())
    level.setAttribute('text-anchor', 'middle')
    level.setAttribute('fill', colors.neutral.black)
    level.setAttribute('font-size', '10')
    level.setAttribute('font-weight', typography.fontWeight.bold)
    level.textContent = skill.level.toString()
    group.appendChild(level)

    return group
  }

  private createArrowMarker(): void {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
    
    marker.setAttribute('id', 'arrowhead')
    marker.setAttribute('markerWidth', '10')
    marker.setAttribute('markerHeight', '7')
    marker.setAttribute('refX', '9')
    marker.setAttribute('refY', '3.5')
    marker.setAttribute('orient', 'auto')

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7')
    polygon.setAttribute('fill', colors.border.primary)
    
    marker.appendChild(polygon)
    defs.appendChild(marker)
    this.svg.appendChild(defs)
  }

  private setupEventListeners(): void {
    if (this.config.enablePan) {
      this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this))
      this.svg.addEventListener('mousemove', this.handleMouseMove.bind(this))
      this.svg.addEventListener('mouseup', this.handleMouseUp.bind(this))
      this.svg.addEventListener('mouseleave', this.handleMouseUp.bind(this))
    }

    if (this.config.enableZoom) {
      this.svg.addEventListener('wheel', this.handleWheel.bind(this))
    }

    // Touch events for mobile
    this.svg.addEventListener('touchstart', this.handleTouchStart.bind(this))
    this.svg.addEventListener('touchmove', this.handleTouchMove.bind(this))
    this.svg.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  private handleMouseDown(event: MouseEvent): void {
    this.isDragging = true
    this.lastMousePosition = { x: event.clientX, y: event.clientY }
    this.svg.style.cursor = 'grabbing'
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return

    const deltaX = event.clientX - this.lastMousePosition.x
    const deltaY = event.clientY - this.lastMousePosition.y

    this.currentPan.x += deltaX
    this.currentPan.y += deltaY

    this.updateTransform()
    this.lastMousePosition = { x: event.clientX, y: event.clientY }
  }

  private handleMouseUp(): void {
    this.isDragging = false
    this.svg.style.cursor = 'grab'
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault()
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.5, Math.min(3, this.currentZoom * zoomFactor))
    
    if (newZoom !== this.currentZoom) {
      this.currentZoom = newZoom
      this.updateTransform()
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      this.lastMousePosition = { x: touch.clientX, y: touch.clientY }
      this.isDragging = true
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault()
    
    if (event.touches.length === 1 && this.isDragging) {
      const touch = event.touches[0]
      const deltaX = touch.clientX - this.lastMousePosition.x
      const deltaY = touch.clientY - this.lastMousePosition.y

      this.currentPan.x += deltaX
      this.currentPan.y += deltaY

      this.updateTransform()
      this.lastMousePosition = { x: touch.clientX, y: touch.clientY }
    }
  }

  private handleTouchEnd(): void {
    this.isDragging = false
  }

  private updateTransform(): void {
    const mainGroup = this.svg.querySelector('#skill-tree-main') as SVGGElement
    if (mainGroup) {
      mainGroup.setAttribute('transform', 
        `translate(${this.currentPan.x}, ${this.currentPan.y}) scale(${this.currentZoom})`
      )
    }
  }

  private handleSkillClick(skill: SkillNode): void {
    if (this.config.onSkillClick) {
      this.config.onSkillClick(skill)
    }
    
    // Show detailed skill information
    this.showSkillDetails(skill)
  }

  private handleSkillHover(skill: SkillNode | null): void {
    if (this.config.onSkillHover) {
      this.config.onSkillHover(skill)
    }

    if (this.config.showTooltips) {
      if (skill) {
        this.showTooltip(skill)
      } else {
        this.hideTooltip()
      }
    }
  }

  private showTooltip(skill: SkillNode): void {
    this.hideTooltip() // Remove existing tooltip

    this.tooltip = document.createElement('div')
    this.tooltip.style.cssText = `
      position: absolute;
      background: ${colors.background.panel};
      color: ${colors.neutral.light};
      padding: ${spacing.md};
      border-radius: ${borders.radius.md};
      border: 1px solid ${colors.border.primary};
      font-size: ${typography.fontSize.sm};
      max-width: 300px;
      z-index: 1000;
      pointer-events: none;
      box-shadow: ${effects.shadow.lg};
    `

    const statusText = skill.isCompleted ? 'Mastered' : 
                      skill.isUnlocked ? `Level ${skill.level}` : 'Locked'
    
    const statusColor = skill.isCompleted ? colors.primary.base :
                       skill.isUnlocked ? colors.info.base : colors.neutral.base

    this.tooltip.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: ${spacing.sm};
        margin-bottom: ${spacing.sm};
      ">
        <span style="font-size: 20px;">${skill.icon}</span>
        <div>
          <div style="
            font-weight: ${typography.fontWeight.bold};
            color: ${colors.neutral.light};
          ">${skill.name}</div>
          <div style="
            font-size: ${typography.fontSize.xs};
            color: ${statusColor};
          ">${statusText}</div>
        </div>
      </div>
      <div style="
        color: ${colors.neutral.base};
        margin-bottom: ${spacing.sm};
        line-height: ${typography.lineHeight.relaxed};
      ">${skill.description}</div>
      ${skill.isUnlocked ? `
        <div style="margin-bottom: ${spacing.sm};">
          <div style="
            display: flex;
            justify-content: space-between;
            font-size: ${typography.fontSize.xs};
            color: ${colors.neutral.base};
            margin-bottom: ${spacing.xs};
          ">
            <span>Progress</span>
            <span>${skill.masteryPercentage.toFixed(0)}%</span>
          </div>
          <div style="
            width: 100%;
            height: 4px;
            background: ${colors.background.panel};
            border-radius: 2px;
            overflow: hidden;
          ">
            <div style="
              width: ${skill.masteryPercentage}%;
              height: 100%;
              background: ${skill.color};
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>
      ` : ''}
      <div style="
        font-size: ${typography.fontSize.xs};
        color: ${colors.neutral.base};
      ">
        <div>⏱️ Practice time: ${skill.estimatedPracticeTime} minutes</div>
        <div>🎯 Difficulty: ${skill.difficulty}</div>
        ${skill.specialty ? `<div>🏥 Specialty: ${skill.specialty}</div>` : ''}
      </div>
    `

    document.body.appendChild(this.tooltip)

    // Position tooltip near the skill node
    const skillElement = this.skillElements.get(skill.id)
    if (skillElement) {
      const rect = skillElement.getBoundingClientRect()
      this.tooltip.style.left = `${rect.right + 10}px`
      this.tooltip.style.top = `${rect.top}px`
    }
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.remove()
      this.tooltip = null
    }
  }

  private showSkillDetails(skill: SkillNode): void {
    // Create detailed skill information modal
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${colors.background.gradient.panel};
      color: ${colors.neutral.light};
      padding: ${spacing.xl};
      border-radius: ${borders.radius.lg};
      border: 2px solid ${colors.border.primary};
      max-width: 500px;
      width: 90vw;
      z-index: 10000;
      box-shadow: ${effects.shadow.xl};
      backdrop-filter: ${effects.blur.lg};
    `

    const prerequisites = this.skillTreeData.getPrerequisites(skill.id)
    const dependents = this.skillTreeData.getDependents(skill.id)

    modal.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${spacing.lg};
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: ${spacing.md};
        ">
          <span style="font-size: 32px;">${skill.icon}</span>
          <div>
            <h2 style="
              margin: 0;
              color: ${colors.primary.base};
              font-size: ${typography.fontSize.xl};
            ">${skill.name}</h2>
            <p style="
              margin: ${spacing.xs} 0 0 0;
              color: ${colors.neutral.base};
            ">${skill.category} • ${skill.difficulty}</p>
          </div>
        </div>
        <button id="close-skill-details" style="
          background: transparent;
          color: ${colors.neutral.base};
          border: 1px solid ${colors.border.neutral};
          border-radius: ${borders.radius.md};
          padding: ${spacing.sm};
          cursor: pointer;
          font-size: ${typography.fontSize.lg};
        ">✕</button>
      </div>

      <div style="margin-bottom: ${spacing.lg};">
        <p style="
          color: ${colors.neutral.light};
          line-height: ${typography.lineHeight.relaxed};
          margin: 0;
        ">${skill.description}</p>
      </div>

      ${skill.isUnlocked ? `
        <div style="margin-bottom: ${spacing.lg};">
          <h3 style="
            margin: 0 0 ${spacing.md} 0;
            color: ${colors.info.base};
            font-size: ${typography.fontSize.md};
          ">Progress</h3>
          <div style="
            display: flex;
            justify-content: space-between;
            margin-bottom: ${spacing.sm};
          ">
            <span>Level ${skill.level} / ${skill.maxLevel}</span>
            <span>${skill.masteryPercentage.toFixed(1)}% Mastery</span>
          </div>
          <div style="
            width: 100%;
            height: 8px;
            background: ${colors.background.panel};
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: ${spacing.sm};
          ">
            <div style="
              width: ${skill.masteryPercentage}%;
              height: 100%;
              background: linear-gradient(90deg, ${skill.color}, ${colors.primary.light});
              transition: width 0.3s ease;
            "></div>
          </div>
          <div style="
            font-size: ${typography.fontSize.sm};
            color: ${colors.neutral.base};
          ">
            Experience: ${skill.experience} / ${skill.experienceToNext}
          </div>
        </div>
      ` : ''}

      <div style="margin-bottom: ${spacing.lg};">
        <h3 style="
          margin: 0 0 ${spacing.md} 0;
          color: ${colors.accent.base};
          font-size: ${typography.fontSize.md};
        ">Real-World Application</h3>
        <p style="
          color: ${colors.neutral.light};
          margin: 0;
          line-height: ${typography.lineHeight.relaxed};
        ">${skill.realWorldApplication}</p>
      </div>

      ${prerequisites.length > 0 ? `
        <div style="margin-bottom: ${spacing.lg};">
          <h3 style="
            margin: 0 0 ${spacing.md} 0;
            color: ${colors.neutral.light};
            font-size: ${typography.fontSize.md};
          ">Prerequisites</h3>
          <div style="display: flex; flex-wrap: wrap; gap: ${spacing.sm};">
            ${prerequisites.map(prereq => `
              <span style="
                background: ${colors.background.primaryGlow};
                color: ${colors.primary.base};
                padding: ${spacing.xs} ${spacing.sm};
                border-radius: ${borders.radius.md};
                font-size: ${typography.fontSize.xs};
              ">${prereq.icon} ${prereq.name}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${dependents.length > 0 ? `
        <div style="margin-bottom: ${spacing.lg};">
          <h3 style="
            margin: 0 0 ${spacing.md} 0;
            color: ${colors.neutral.light};
            font-size: ${typography.fontSize.md};
          ">Unlocks</h3>
          <div style="display: flex; flex-wrap: wrap; gap: ${spacing.sm};">
            ${dependents.map(dependent => `
              <span style="
                background: ${colors.background.infoGlow};
                color: ${colors.info.base};
                padding: ${spacing.xs} ${spacing.sm};
                border-radius: ${borders.radius.md};
                font-size: ${typography.fontSize.xs};
              ">${dependent.icon} ${dependent.name}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: ${spacing.md};
        border-top: 1px solid ${colors.border.primary};
      ">
        <div style="
          font-size: ${typography.fontSize.sm};
          color: ${colors.neutral.base};
        ">
          ⏱️ ${skill.estimatedPracticeTime} min practice time
        </div>
        ${skill.isUnlocked && !skill.isCompleted ? `
          <button style="
            background: ${colors.primary.base};
            color: ${colors.neutral.black};
            border: none;
            border-radius: ${borders.radius.md};
            padding: ${spacing.sm} ${spacing.lg};
            cursor: pointer;
            font-weight: ${typography.fontWeight.bold};
          ">Practice This Skill</button>
        ` : ''}
      </div>
    `

    // Add close functionality
    const closeButton = modal.querySelector('#close-skill-details') as HTMLButtonElement
    closeButton.addEventListener('click', () => {
      modal.remove()
    })

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })

    document.body.appendChild(modal)
  }

  /**
   * Public API methods
   */
  public updateSkillProgress(skillProgressions: SkillProgression[]): void {
    skillProgressions.forEach(progression => {
      const skill = this.skillTreeData.getSkill(progression.skillId)
      if (skill) {
        skill.level = progression.currentLevel
        skill.experience = progression.experience
        skill.masteryPercentage = progression.masteryPercentage
        skill.isUnlocked = true
        skill.isCompleted = progression.masteryPercentage >= 100
      }
    })

    // Check for newly unlocked skills
    const newlyUnlocked = this.skillTreeData.checkSkillUnlocks()
    
    // Re-render the skill tree
    this.renderSkillTree()

    // Animate newly unlocked skills
    if (this.config.enableAnimations && newlyUnlocked.length > 0) {
      this.animateSkillUnlocks(newlyUnlocked)
    }
  }

  public focusOnSkill(skillId: string): void {
    const skill = this.skillTreeData.getSkill(skillId)
    if (!skill) return

    // Center the view on the skill
    const centerX = this.config.width / 2
    const centerY = this.config.height / 2
    
    this.currentPan.x = centerX - skill.position.x * this.currentZoom
    this.currentPan.y = centerY - skill.position.y * this.currentZoom
    
    this.updateTransform()

    // Highlight the skill
    const skillElement = this.skillElements.get(skillId)
    if (skillElement && this.config.enableAnimations) {
      skillElement.style.animation = 'pulse 1s ease-in-out 3'
    }
  }

  public resetView(): void {
    this.currentZoom = 1
    this.currentPan = { x: 0, y: 0 }
    this.updateTransform()
  }

  public exportImage(): string {
    // Create a copy of the SVG for export
    const svgCopy = this.svg.cloneNode(true) as SVGElement
    svgCopy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    
    const svgData = new XMLSerializer().serializeToString(svgCopy)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    
    return URL.createObjectURL(svgBlob)
  }

  private animateSkillUnlocks(skillIds: string[]): void {
    skillIds.forEach((skillId, index) => {
      setTimeout(() => {
        const skillElement = this.skillElements.get(skillId)
        if (skillElement) {
          skillElement.style.animation = 'skillUnlock 0.8s ease-out'
        }
      }, index * 200) // Stagger animations
    })
  }

  public destroy(): void {
    this.hideTooltip()
    
    // Remove event listeners
    this.svg.removeEventListener('mousedown', this.handleMouseDown)
    this.svg.removeEventListener('mousemove', this.handleMouseMove)
    this.svg.removeEventListener('mouseup', this.handleMouseUp)
    this.svg.removeEventListener('wheel', this.handleWheel)
    
    // Clear the container
    this.container.innerHTML = ''
    
    console.log('🌳 Skill Tree Visualization destroyed')
  }
}