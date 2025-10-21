/**
 * Advanced Condition Detection System
 * ENHANCEMENT FIRST: Advanced condition detection with AI-powered scanning
 * PREVENT BLOAT: Consolidated detection logic into single system
 * DRY: Reuse existing MedicalCondition definitions
 * CLEAN: Clear separation between detection, visualization and scoring
 * MODULAR: Independent detection module with clear interfaces
 */

import { MedicalCondition } from '../domains/medical/medical-data';
import { ScanFeedbackSystem } from './ScanFeedbackSystem';

export interface DetectionResult {
  conditionId: string;
  confidence: number;
  scanQuality: number;
  scanTime: number;
  difficultyModifier: number;
  detected: boolean;
  clues: string[];
}

export interface ScanMetrics {
  positionAccuracy: number;
  scanCoverage: number;
  timeEfficiency: number;
  focusQuality: number;
}

export class AdvancedConditionDetection {
  private scanFeedbackSystem: ScanFeedbackSystem;
  private detectionThreshold: number = 0.85; // Minimum confidence to detect
  private scanStartTime: Map<string, number> = new Map();
  
  constructor(scanFeedbackSystem: ScanFeedbackSystem) {
    this.scanFeedbackSystem = scanFeedbackSystem;
  }

  /**
   * Detects a medical condition based on scan progress and scan quality metrics
   */
  public detectCondition(
    condition: MedicalCondition, 
    scanProgress: number, 
    scanMetrics: ScanMetrics
  ): DetectionResult {
    // Calculate base confidence from scan progress
    const baseConfidence = scanProgress;
    
    // Apply scan quality modifiers
    const positionAccuracyModifier = scanMetrics.positionAccuracy * 0.2;
    const scanCoverageModifier = scanMetrics.scanCoverage * 0.3;
    const timeEfficiencyModifier = scanMetrics.timeEfficiency * 0.15;
    const focusQualityModifier = scanMetrics.focusQuality * 0.35;
    
    const totalQualityModifier = 
      positionAccuracyModifier + 
      scanCoverageModifier + 
      timeEfficiencyModifier + 
      focusQualityModifier;
    
    // Calculate detection confidence with quality modifiers
    let confidence = baseConfidence * (0.7 + totalQualityModifier * 0.3); // Range: 0.7-1.0
    
    // Apply condition-specific difficulty
    const difficultyModifier = this.getDifficultyModifier(condition.severity);
    confidence *= difficultyModifier;
    
    // Consider scan time - longer scans might indicate difficulty
    const scanDuration = Date.now() - (this.scanStartTime.get(condition.id) || Date.now());
    if (scanDuration > 15000 && scanProgress < 0.95) { // More than 15 seconds with low progress
      confidence *= 0.9; // Reduce confidence for inefficient scans
    }
    
    // Cap confidence at 0.99 to maintain some challenge
    confidence = Math.min(confidence, 0.99);
    
    // Determine if condition is detected
    const detected = confidence >= this.detectionThreshold;
    
    // Generate context-aware clues for near-misses
    const clues = this.generateClues(condition, detected, confidence, scanMetrics);
    
    return {
      conditionId: condition.id,
      confidence,
      scanQuality: totalQualityModifier,
      scanTime: scanDuration,
      difficultyModifier,
      detected,
      clues
    };
  }
  
  /**
   * Starts tracking scan for a condition
   */
  public startConditionScan(conditionId: string): void {
    this.scanStartTime.set(conditionId, Date.now());
  }
  
  /**
   * Calculate scan metrics for a position and scan pattern
   */
  public calculateScanMetrics(
    conditionPosition: { x: number; y: number; z: number },
    scanPosition: { x: number; y: number; z: number },
    scanPath: Array<{x: number, y: number, z: number}>
  ): ScanMetrics {
    // Calculate position accuracy (distance between scan and condition positions)
    const distance = Math.sqrt(
      Math.pow(conditionPosition.x - scanPosition.x, 2) +
      Math.pow(conditionPosition.y - scanPosition.y, 2) +
      Math.pow(conditionPosition.z - scanPosition.z, 2)
    );
    
    // Position accuracy: closer is better (max 1.0 at distance 0)
    const positionAccuracy = Math.max(0, 1 - (distance / 0.5)); // Assume 0.5 is the maximum meaningful distance
    
    // Calculate scan coverage based on path (how much area was covered around the condition)
    let coverage = 0;
    if (scanPath.length > 1) {
      // Calculate how much of the area around the condition was scanned
      let pointsNearCondition = 0;
      scanPath.forEach(point => {
        const pointDistance = Math.sqrt(
          Math.pow(conditionPosition.x - point.x, 2) +
          Math.pow(conditionPosition.y - point.y, 2) +
          Math.pow(conditionPosition.z - point.z, 2)
        );
        if (pointDistance < 0.3) pointsNearCondition++; // Consider points within 0.3 units as "covered"
      });
      coverage = pointsNearCondition / scanPath.length;
    }
    
    // Calculate focus quality based on how steadily the scan was held near the condition
    let focusQuality = 0;
    if (scanPath.length > 5) {
      // Calculate variance in position near the condition
      let variance = 0;
      let nearPoints = scanPath.filter(point => {
        const dist = Math.sqrt(
          Math.pow(conditionPosition.x - point.x, 2) +
          Math.pow(conditionPosition.y - point.y, 2) +
          Math.pow(conditionPosition.z - point.z, 2)
        );
        return dist < 0.2;
      });
      
      if (nearPoints.length > 0) {
        // Calculate how focused the scanning was in the area
        focusQuality = nearPoints.length / scanPath.length;
      }
    }
    
    // Time efficiency (how quickly the user reached the condition)
    const maxTimeForEfficiency = 15000; // 15 seconds for max efficiency
    const scanDuration = Date.now() - (this.scanStartTime.get(conditionPosition.x.toString() + conditionPosition.y.toString() + conditionPosition.z.toString()) || Date.now());
    const timeEfficiency = Math.max(0, 1 - (scanDuration / maxTimeForEfficiency));
    
    return {
      positionAccuracy: Math.min(positionAccuracy, 1.0),
      scanCoverage: Math.min(coverage, 1.0),
      timeEfficiency: Math.min(timeEfficiency, 1.0),
      focusQuality: Math.min(focusQuality, 1.0)
    };
  }
  
  /**
   * Get difficulty modifier based on severity
   */
  private getDifficultyModifier(severity: 'low' | 'medium' | 'high'): number {
    switch (severity) {
      case 'low': return 1.2; // Easier to detect low severity conditions
      case 'medium': return 1.0; // Medium difficulty by default
      case 'high': return 0.9; // High severity might be more obvious but more critical
      default: return 1.0;
    }
  }
  
  /**
   * Generate context-aware clues for players
   */
  private generateClues(
    condition: MedicalCondition, 
    detected: boolean, 
    confidence: number, 
    scanMetrics: ScanMetrics
  ): string[] {
    const clues: string[] = [];
    
    if (!detected) {
      // Add clues if condition wasn't detected
      if (scanMetrics.positionAccuracy < 0.3) {
        clues.push(`Try focusing your scan closer to the ${this.getAnatomicalDescriptor(condition)}`);
      }
      
      if (scanMetrics.scanCoverage < 0.5) {
        clues.push(`Increase your scan coverage around the target area`);
      }
      
      if (confidence > 0.7) {
        clues.push(`You're close! The scan pattern looks promising`);
      }
      
      // Add condition-specific hint
      if (condition.symptoms) {
        const randomSymptom = condition.symptoms[Math.floor(Math.random() * condition.symptoms.length)];
        clues.push(`This condition may present with: ${randomSymptom}`);
      }
    } else {
      // Add confirmation when detected
      clues.push(`Excellent! You detected ${condition.name} with ${Math.round(confidence * 100)}% confidence`);
      
      if (confidence > 0.95) {
        clues.push(`Perfect scan technique!`);
      } else if (confidence > 0.85) {
        clues.push(`Great detection!`);
      }
    }
    
    return clues;
  }
  
  /**
   * Get anatomical descriptor for positioning hints
   */
  private getAnatomicalDescriptor(condition: MedicalCondition): string {
    if (condition.visibleIn.includes('head') || condition.visibleIn.includes('brain')) {
      return 'head region';
    } else if (condition.visibleIn.includes('chest') || condition.visibleIn.includes('heart')) {
      return 'chest area';
    } else if (condition.visibleIn.includes('abdomen') || condition.visibleIn.includes('stomach')) {
      return 'abdominal area';
    } else if (condition.visibleIn.includes('back') || condition.visibleIn.includes('spine')) {
      return 'back region';
    } else {
      return 'target area';
    }
  }
}