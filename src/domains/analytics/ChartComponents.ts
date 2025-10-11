/**
 * Chart Components
 * VISUAL: SVG-based chart components for analytics visualization
 * RESPONSIVE: Adaptive layouts for different screen sizes
 * INTERACTIVE: Hover effects and data point interactions
 */

import { colors, spacing, typography, borders } from '../../styles/design-tokens'
import { 
  ChartConfig, 
  ChartDataPoint, 
  LineChartData, 
  BarChartData, 
  RadarChartData,
  HeatmapData,
  PieChartData 
} from './types'

export class ChartComponents {
  private container: HTMLElement
  private config: ChartConfig

  constructor(container: HTMLElement, config: ChartConfig) {
    this.container = container
    this.config = config
  }

  /**
   * Create line chart for trend visualization
   */
  public createLineChart(data: LineChartData): SVGElement {
    const { width, height } = this.config
    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const svg = this.createSVGElement(width, height)
    const chartGroup = this.createGroup(svg, margin.left, margin.top)

    // Calculate scales
    const allDataPoints = data.datasets.flatMap(dataset => dataset.data)
    const xExtent = this.getExtent(allDataPoints.map(d => d.x as number))
    const yExtent = this.getExtent(allDataPoints.map(d => d.y))

    const xScale = this.createLinearScale(xExtent, [0, chartWidth])
    const yScale = this.createLinearScale(yExtent, [chartHeight, 0])

    // Draw grid
    if (this.config.showGrid) {
      this.drawGrid(chartGroup, chartWidth, chartHeight, xScale, yScale)
    }

    // Draw axes
    this.drawXAxis(chartGroup, chartHeight, xScale, xExtent)
    this.drawYAxis(chartGroup, yScale, yExtent)

    // Draw lines
    data.datasets.forEach((dataset, index) => {
      const color = this.config.colors[index % this.config.colors.length]
      this.drawLine(chartGroup, dataset.data, xScale, yScale, color, dataset.strokeWidth || 2)
      
      // Draw data points
      this.drawDataPoints(chartGroup, dataset.data, xScale, yScale, color, dataset.label)
    })

    // Add legend
    if (this.config.showLegend) {
      this.drawLegend(svg, data.datasets, width, margin)
    }

    // Add title
    this.addTitle(svg, this.config.title, width)

    return svg
  }

  /**
   * Create bar chart for categorical data
   */
  public createBarChart(data: BarChartData): SVGElement {
    const { width, height } = this.config
    const margin = { top: 20, right: 30, bottom: 60, left: 50 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const svg = this.createSVGElement(width, height)
    const chartGroup = this.createGroup(svg, margin.left, margin.top)

    // Calculate scales
    const maxValue = Math.max(...data.series.flatMap(s => s.data))
    const barWidth = chartWidth / data.categories.length
    const groupWidth = barWidth * 0.8
    const barGroupWidth = groupWidth / data.series.length

    const yScale = this.createLinearScale([0, maxValue], [chartHeight, 0])

    // Draw grid
    if (this.config.showGrid) {
      this.drawHorizontalGrid(chartGroup, chartWidth, chartHeight, yScale, [0, maxValue])
    }

    // Draw axes
    this.drawCategoricalXAxis(chartGroup, chartHeight, data.categories, barWidth)
    this.drawYAxis(chartGroup, yScale, [0, maxValue])

    // Draw bars
    data.series.forEach((series, seriesIndex) => {
      series.data.forEach((value, categoryIndex) => {
        const x = categoryIndex * barWidth + (barWidth - groupWidth) / 2 + seriesIndex * barGroupWidth
        const y = yScale(value)
        const barHeight = chartHeight - y

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', x.toString())
        rect.setAttribute('y', y.toString())
        rect.setAttribute('width', (barGroupWidth * 0.9).toString())
        rect.setAttribute('height', barHeight.toString())
        rect.setAttribute('fill', series.color)
        rect.setAttribute('opacity', '0.8')
        
        // Add hover effects
        rect.addEventListener('mouseenter', () => {
          rect.setAttribute('opacity', '1')
          this.showTooltip(`${series.name}: ${value}`, rect)
        })
        rect.addEventListener('mouseleave', () => {
          rect.setAttribute('opacity', '0.8')
          this.hideTooltip()
        })

        chartGroup.appendChild(rect)
      })
    })

    // Add legend
    if (this.config.showLegend) {
      this.drawLegend(svg, data.series.map(s => ({ label: s.name, color: s.color })), width, margin)
    }

    // Add title
    this.addTitle(svg, this.config.title, width)

    return svg
  }

  /**
   * Create radar chart for skill visualization
   */
  public createRadarChart(data: RadarChartData): SVGElement {
    const { width, height } = this.config
    const size = Math.min(width, height)
    const margin = 40
    const radius = (size - margin * 2) / 2
    const centerX = width / 2
    const centerY = height / 2

    const svg = this.createSVGElement(width, height)

    // Draw background circles
    for (let i = 1; i <= 5; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', centerX.toString())
      circle.setAttribute('cy', centerY.toString())
      circle.setAttribute('r', (radius * i / 5).toString())
      circle.setAttribute('fill', 'none')
      circle.setAttribute('stroke', colors.border.neutral)
      circle.setAttribute('stroke-width', '1')
      circle.setAttribute('opacity', '0.3')
      svg.appendChild(circle)
    }

    // Draw axes
    const angleStep = (2 * Math.PI) / data.categories.length
    data.categories.forEach((category, index) => {
      const angle = index * angleStep - Math.PI / 2
      const x2 = centerX + Math.cos(angle) * radius
      const y2 = centerY + Math.sin(angle) * radius

      // Draw axis line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', centerX.toString())
      line.setAttribute('y1', centerY.toString())
      line.setAttribute('x2', x2.toString())
      line.setAttribute('y2', y2.toString())
      line.setAttribute('stroke', colors.border.neutral)
      line.setAttribute('stroke-width', '1')
      line.setAttribute('opacity', '0.3')
      svg.appendChild(line)

      // Draw category label
      const labelX = centerX + Math.cos(angle) * (radius + 20)
      const labelY = centerY + Math.sin(angle) * (radius + 20)
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', labelX.toString())
      text.setAttribute('y', labelY.toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'middle')
      text.setAttribute('fill', colors.neutral.light)
      text.setAttribute('font-size', typography.fontSize.xs)
      text.textContent = category
      svg.appendChild(text)
    })

    // Draw data
    data.datasets.forEach((dataset, datasetIndex) => {
      const points: string[] = []
      
      dataset.data.forEach((value, index) => {
        const angle = index * angleStep - Math.PI / 2
        const normalizedValue = Math.max(0, Math.min(1, value)) // Normalize to 0-1
        const pointRadius = radius * normalizedValue
        const x = centerX + Math.cos(angle) * pointRadius
        const y = centerY + Math.sin(angle) * pointRadius
        points.push(`${x},${y}`)
      })

      // Draw filled area
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      polygon.setAttribute('points', points.join(' '))
      polygon.setAttribute('fill', dataset.color)
      polygon.setAttribute('opacity', (dataset.fillOpacity || 0.3).toString())
      polygon.setAttribute('stroke', dataset.color)
      polygon.setAttribute('stroke-width', '2')
      svg.appendChild(polygon)

      // Draw data points
      dataset.data.forEach((value, index) => {
        const angle = index * angleStep - Math.PI / 2
        const normalizedValue = Math.max(0, Math.min(1, value))
        const pointRadius = radius * normalizedValue
        const x = centerX + Math.cos(angle) * pointRadius
        const y = centerY + Math.sin(angle) * pointRadius

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', x.toString())
        circle.setAttribute('cy', y.toString())
        circle.setAttribute('r', '4')
        circle.setAttribute('fill', dataset.color)
        circle.setAttribute('stroke', colors.background.panel)
        circle.setAttribute('stroke-width', '2')
        
        // Add hover effect
        circle.addEventListener('mouseenter', () => {
          circle.setAttribute('r', '6')
          this.showTooltip(`${data.categories[index]}: ${(value * 100).toFixed(1)}%`, circle)
        })
        circle.addEventListener('mouseleave', () => {
          circle.setAttribute('r', '4')
          this.hideTooltip()
        })

        svg.appendChild(circle)
      })
    })

    // Add title
    this.addTitle(svg, this.config.title, width)

    return svg
  }

  /**
   * Create pie chart for proportional data
   */
  public createPieChart(data: PieChartData): SVGElement {
    const { width, height } = this.config
    const size = Math.min(width, height)
    const radius = (size - 80) / 2
    const centerX = width / 2
    const centerY = height / 2

    const svg = this.createSVGElement(width, height)

    let currentAngle = 0
    const total = data.segments.reduce((sum, segment) => sum + segment.value, 0)

    data.segments.forEach((segment, index) => {
      const angle = (segment.value / total) * 2 * Math.PI
      const endAngle = currentAngle + angle

      // Create arc path
      const largeArcFlag = angle > Math.PI ? 1 : 0
      const x1 = centerX + Math.cos(currentAngle) * radius
      const y1 = centerY + Math.sin(currentAngle) * radius
      const x2 = centerX + Math.cos(endAngle) * radius
      const y2 = centerY + Math.sin(endAngle) * radius

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', pathData)
      path.setAttribute('fill', segment.color)
      path.setAttribute('stroke', colors.background.panel)
      path.setAttribute('stroke-width', '2')
      
      // Add hover effects
      path.addEventListener('mouseenter', () => {
        path.setAttribute('opacity', '0.8')
        this.showTooltip(`${segment.label}: ${segment.percentage.toFixed(1)}%`, path)
      })
      path.addEventListener('mouseleave', () => {
        path.setAttribute('opacity', '1')
        this.hideTooltip()
      })

      svg.appendChild(path)

      // Add label
      const labelAngle = currentAngle + angle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      if (segment.percentage > 5) { // Only show label if segment is large enough
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', labelX.toString())
        text.setAttribute('y', labelY.toString())
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('fill', colors.neutral.white)
        text.setAttribute('font-size', typography.fontSize.xs)
        text.setAttribute('font-weight', typography.fontWeight.bold)
        text.textContent = `${segment.percentage.toFixed(0)}%`
        svg.appendChild(text)
      }

      currentAngle = endAngle
    })

    // Add legend
    if (this.config.showLegend) {
      this.drawPieLegend(svg, data.segments, width, height)
    }

    // Add title
    this.addTitle(svg, this.config.title, width)

    return svg
  }

  /**
   * Helper methods for SVG creation
   */
  private createSVGElement(width: number, height: number): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', width.toString())
    svg.setAttribute('height', height.toString())
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.style.background = 'transparent'
    return svg
  }

  private createGroup(parent: SVGElement, x: number, y: number): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('transform', `translate(${x}, ${y})`)
    parent.appendChild(group)
    return group
  }

  private createLinearScale(domain: [number, number], range: [number, number]): (value: number) => number {
    const [domainMin, domainMax] = domain
    const [rangeMin, rangeMax] = range
    const scale = (rangeMax - rangeMin) / (domainMax - domainMin)
    
    return (value: number) => rangeMin + (value - domainMin) * scale
  }

  private getExtent(values: number[]): [number, number] {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1
    return [min - padding, max + padding]
  }

  private drawGrid(group: SVGGElement, width: number, height: number, xScale: Function, yScale: Function): void {
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', x.toString())
      line.setAttribute('y1', '0')
      line.setAttribute('x2', x.toString())
      line.setAttribute('y2', height.toString())
      line.setAttribute('stroke', colors.border.neutral)
      line.setAttribute('stroke-width', '1')
      line.setAttribute('opacity', '0.2')
      group.appendChild(line)
    }

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', '0')
      line.setAttribute('y1', y.toString())
      line.setAttribute('x2', width.toString())
      line.setAttribute('y2', y.toString())
      line.setAttribute('stroke', colors.border.neutral)
      line.setAttribute('stroke-width', '1')
      line.setAttribute('opacity', '0.2')
      group.appendChild(line)
    }
  }

  private drawHorizontalGrid(group: SVGGElement, width: number, height: number, yScale: Function, domain: [number, number]): void {
    const [min, max] = domain
    for (let i = 0; i <= 5; i++) {
      const value = min + (max - min) * (i / 5)
      const y = yScale(value)
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', '0')
      line.setAttribute('y1', y.toString())
      line.setAttribute('x2', width.toString())
      line.setAttribute('y2', y.toString())
      line.setAttribute('stroke', colors.border.neutral)
      line.setAttribute('stroke-width', '1')
      line.setAttribute('opacity', '0.2')
      group.appendChild(line)
    }
  }

  private drawXAxis(group: SVGGElement, height: number, xScale: Function, domain: [number, number]): void {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', '0')
    line.setAttribute('y1', height.toString())
    line.setAttribute('x2', '100%')
    line.setAttribute('y2', height.toString())
    line.setAttribute('stroke', colors.border.primary)
    line.setAttribute('stroke-width', '2')
    group.appendChild(line)
  }

  private drawYAxis(group: SVGGElement, yScale: Function, domain: [number, number]): void {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', '0')
    line.setAttribute('y1', '0')
    line.setAttribute('x2', '0')
    line.setAttribute('y2', '100%')
    line.setAttribute('stroke', colors.border.primary)
    line.setAttribute('stroke-width', '2')
    group.appendChild(line)
  }

  private drawCategoricalXAxis(group: SVGGElement, height: number, categories: string[], barWidth: number): void {
    // Draw axis line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', '0')
    line.setAttribute('y1', height.toString())
    line.setAttribute('x2', '100%')
    line.setAttribute('y2', height.toString())
    line.setAttribute('stroke', colors.border.primary)
    line.setAttribute('stroke-width', '2')
    group.appendChild(line)

    // Draw category labels
    categories.forEach((category, index) => {
      const x = index * barWidth + barWidth / 2
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', x.toString())
      text.setAttribute('y', (height + 20).toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('fill', colors.neutral.light)
      text.setAttribute('font-size', typography.fontSize.xs)
      text.textContent = category
      group.appendChild(text)
    })
  }

  private drawLine(group: SVGGElement, data: ChartDataPoint[], xScale: Function, yScale: Function, color: string, strokeWidth: number): void {
    if (data.length < 2) return

    const pathData = data.map((point, index) => {
      const x = xScale(point.x)
      const y = yScale(point.y)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', pathData)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', color)
    path.setAttribute('stroke-width', strokeWidth.toString())
    group.appendChild(path)
  }

  private drawDataPoints(group: SVGGElement, data: ChartDataPoint[], xScale: Function, yScale: Function, color: string, label: string): void {
    data.forEach(point => {
      const x = xScale(point.x)
      const y = yScale(point.y)

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', x.toString())
      circle.setAttribute('cy', y.toString())
      circle.setAttribute('r', '4')
      circle.setAttribute('fill', color)
      circle.setAttribute('stroke', colors.background.panel)
      circle.setAttribute('stroke-width', '2')
      
      // Add hover effect
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('r', '6')
        this.showTooltip(`${label}: ${point.y.toFixed(2)}`, circle)
      })
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', '4')
        this.hideTooltip()
      })

      group.appendChild(circle)
    })
  }

  private drawLegend(svg: SVGElement, datasets: any[], width: number, margin: any): void {
    const legendGroup = this.createGroup(svg, width - 150, margin.top)
    
    datasets.forEach((dataset, index) => {
      const y = index * 20
      
      // Legend color box
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '0')
      rect.setAttribute('y', y.toString())
      rect.setAttribute('width', '12')
      rect.setAttribute('height', '12')
      rect.setAttribute('fill', dataset.color)
      legendGroup.appendChild(rect)
      
      // Legend text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', '18')
      text.setAttribute('y', (y + 9).toString())
      text.setAttribute('fill', colors.neutral.light)
      text.setAttribute('font-size', typography.fontSize.xs)
      text.textContent = dataset.label || dataset.name
      legendGroup.appendChild(text)
    })
  }

  private drawPieLegend(svg: SVGElement, segments: any[], width: number, height: number): void {
    const legendGroup = this.createGroup(svg, width - 150, 50)
    
    segments.forEach((segment, index) => {
      const y = index * 20
      
      // Legend color box
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '0')
      rect.setAttribute('y', y.toString())
      rect.setAttribute('width', '12')
      rect.setAttribute('height', '12')
      rect.setAttribute('fill', segment.color)
      legendGroup.appendChild(rect)
      
      // Legend text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', '18')
      text.setAttribute('y', (y + 9).toString())
      text.setAttribute('fill', colors.neutral.light)
      text.setAttribute('font-size', typography.fontSize.xs)
      text.textContent = `${segment.label} (${segment.percentage.toFixed(1)}%)`
      legendGroup.appendChild(text)
    })
  }

  private addTitle(svg: SVGElement, title: string, width: number): void {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', (width / 2).toString())
    text.setAttribute('y', '20')
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('fill', colors.primary.base)
    text.setAttribute('font-size', typography.fontSize.lg)
    text.setAttribute('font-weight', typography.fontWeight.bold)
    text.textContent = title
    svg.appendChild(text)
  }

  private showTooltip(content: string, element: SVGElement): void {
    // Create tooltip element
    const tooltip = document.createElement('div')
    tooltip.id = 'chart-tooltip'
    tooltip.style.cssText = `
      position: absolute;
      background: ${colors.background.panel};
      color: ${colors.neutral.light};
      padding: ${spacing.sm};
      border-radius: ${borders.radius.md};
      border: 1px solid ${colors.border.primary};
      font-size: ${typography.fontSize.xs};
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    `
    tooltip.textContent = content

    document.body.appendChild(tooltip)

    // Position tooltip near the element
    const rect = element.getBoundingClientRect()
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`
  }

  private hideTooltip(): void {
    const tooltip = document.getElementById('chart-tooltip')
    if (tooltip) {
      tooltip.remove()
    }
  }
}