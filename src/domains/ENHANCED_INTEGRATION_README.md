# 🎮 Enhanced Medical Mystery Game Integration

## Overview

This directory contains the enhanced medical mystery game systems that extend X-RAI with adaptive difficulty, progressive revelation, investigation tools, and narrative depth. The integration maintains full backward compatibility while adding sophisticated educational features.

## 🏗️ Architecture

### Core Systems

#### 1. **Dynamic Case Adaptation** (`/adaptation`)
- **AdaptiveDifficultyEngine**: Real-time performance analysis and difficulty adjustment
- **BranchingNarrativeSystem**: Player decisions influence case progression
- **Types**: Comprehensive type definitions for adaptive systems

#### 2. **Progressive Revelation** (`/revelation`)
- **ProgressiveRevelationManager**: Granular information unlocks and red herring generation
- **Clinical Judgment**: Validates player assessment of findings

#### 3. **Investigation Toolkit** (`/investigation`)
- **InvestigationToolkit**: Specialized examination techniques and consultations
- **Realistic Timing**: Lab results and imaging delays simulation

#### 4. **Narrative Depth** (`/narrative`)
- **NarrativeManager**: Patient backstories, ethical dilemmas, and outcomes
- **Long-term Tracking**: Treatment decision consequences

#### 5. **Enhanced Integration** (`/diagnostic`)
- **EnhancedGameManager**: Central orchestration of all systems
- **EnhancedCanvasIntegration**: 3D canvas integration
- **EnhancedDiagnosticUI**: UI enhancements with real-time panels

## 🚀 Quick Start

### Basic Integration

```typescript
import XRAIEnhancedApplication from './enhanced-integration-example'

// Initialize enhanced application
const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
const app = new XRAIEnhancedApplication(canvasElement)

// Enable enhanced mode
await app.enableEnhancedMode('intermediate')

// Start enhanced case
const medicalCase = {
  id: 'case-001',
  title: 'TMJ Dysfunction',
  // ... case properties
}
await app.startEnhancedCase(medicalCase)
```

### Advanced Integration

```typescript
import { EnhancedGameManager } from './domains/diagnostic/EnhancedGameManager'
import { EnhancedCanvasIntegration } from './domains/diagnostic/EnhancedCanvasIntegration'

// Create enhanced game manager
const enhancedGameManager = new EnhancedGameManager('advanced')

// Set up event listeners
enhancedGameManager.addEventListener('revelation', (event) => {
  console.log('New revelation:', event.data)
})

enhancedGameManager.addEventListener('difficulty_adjusted', (event) => {
  console.log('Difficulty adjusted:', event.data.modification)
})

// Start enhanced case
await enhancedGameManager.startCase(medicalCase)
```

## 🎯 Features

### Adaptive Difficulty
- **Real-time Analysis**: Tracks 8 performance metrics
- **Dynamic Adjustment**: Modifies case complexity based on player skill
- **Confidence Tracking**: Builds confidence in adaptations over time
- **Profile System**: Beginner, Intermediate, Advanced profiles

### Progressive Revelation
- **Granular Unlocks**: Information tied to specific scanning progress
- **Red Herrings**: Clinically accurate false positives
- **Clinical Judgment**: Validates player assessment of findings
- **Realistic Patterns**: Based on medical investigation protocols

### Investigation Toolkit
- **8+ Techniques**: Palpation, auscultation, percussion, etc.
- **6 Specialties**: Cardiology, neurology, radiology, etc.
- **Realistic Timing**: Lab turnaround times and consultation delays
- **Progressive Unlocking**: Advanced techniques based on skill level

### Narrative Depth
- **Patient Backstories**: Personal, medical, and psychosocial factors
- **Ethical Dilemmas**: Treatment decisions with moral implications
- **Long-term Outcomes**: Track consequences over time
- **Branching Stories**: Multiple paths with meaningful consequences

## 🎨 UI Components

### Enhanced Panels
- **Adaptive Difficulty Panel**: Real-time difficulty and confidence metrics
- **Progressive Revelation Panel**: Revealed findings and red herrings
- **Investigation Panel**: Available techniques and consultation status
- **Narrative Panel**: Ethical choices and decision consequences
- **Performance Metrics Panel**: Diagnostic accuracy and efficiency

### Notifications
- **Patient Backstory**: Rich patient context on case start
- **Revelation Alerts**: New findings with significance indicators
- **Consultation Results**: Specialist recommendations and confidence
- **Difficulty Adjustments**: Performance-based modifications

## 🔧 Configuration

### Difficulty Profiles

```typescript
const profiles = {
  beginner: {
    targetPerformance: { diagnosticAccuracy: 0.6, timeEfficiency: 0.4 },
    adaptationSensitivity: 0.7,
    preferredCaseTypes: ['straightforward']
  },
  intermediate: {
    targetPerformance: { diagnosticAccuracy: 0.75, timeEfficiency: 0.6 },
    adaptationSensitivity: 0.5,
    preferredCaseTypes: ['straightforward', 'complex']
  },
  advanced: {
    targetPerformance: { diagnosticAccuracy: 0.9, timeEfficiency: 0.8 },
    adaptationSensitivity: 0.3,
    preferredCaseTypes: ['complex', 'advanced']
  }
}
```

### Investigation Techniques

```typescript
const techniques = [
  {
    id: 'tmj_palpation',
    name: 'TMJ Palpation',
    category: 'palpation',
    skillLevel: 'intermediate',
    timeRequired: 60,
    applicableRegions: ['head_neck']
  }
  // ... more techniques
]
```

### Medical Specialties

```typescript
const specialties = [
  {
    id: 'oral_maxillofacial',
    name: 'Oral and Maxillofacial Surgery',
    expertise: ['tmj_disorders', 'facial_trauma'],
    consultationTime: 30,
    availability: 'scheduled'
  }
  // ... more specialties
]
```

## 📊 Analytics

### Performance Tracking
```typescript
const analytics = app.exportEnhancedAnalytics()
console.log('Performance metrics:', analytics.enhancedGameManager.performance)
console.log('Adaptation history:', analytics.enhancedGameManager.adaptationHistory)
console.log('Narrative decisions:', analytics.enhancedGameManager.narrativeHistory)
```

### Event Monitoring
```typescript
enhancedGameManager.addEventListener('all', (event) => {
  // Track all events for analytics
  analytics.trackEvent(event.type, event.data)
})
```

## 🎮 Keyboard Shortcuts

### Enhanced Mode Shortcuts
- **I**: Show investigation menu
- **N**: Show narrative choices
- **D**: Toggle difficulty info
- **R**: Show revelation status
- **P**: Pause enhanced game

### Investigation Shortcuts
- **C**: Toggle condition markers
- **E**: Expand X-ray view
- **V**: Voice consultation
- **H**: Show hints

## 🔄 Event System

### Core Events
- `revelation`: New findings revealed
- `consultation_complete`: Specialist consultation finished
- `narrative_choice`: Ethical decision points
- `difficulty_adjusted`: Performance-based adjustments
- `lab_result`: Laboratory test results

### Event Handling
```typescript
enhancedGameManager.addEventListener('revelation', (event) => {
  if (event.data.type === 'case_started') {
    showPatientBackstory(event.data.backstory)
  } else if (event.data.revealed) {
    updateProgressiveRevelation(event.data.region, event.data.revealed)
  }
})
```

## 🧪 Testing

### Unit Tests
```bash
npm test -- --testPathPattern=enhanced
```

### Integration Tests
```bash
npm run test:integration -- enhanced
```

### Performance Tests
```bash
npm run test:performance -- enhanced
```

## 🚀 Performance

### Optimization Features
- **Throttled Updates**: UI updates limited to 60fps
- **Event Batching**: Multiple events processed together
- **Memory Management**: Automatic cleanup of old data
- **GPU Acceleration**: CSS animations use transform/opacity

### Performance Metrics
- **Load Time**: <3 seconds for enhanced features
- **Memory Usage**: <500MB peak with all features
- **Frame Rate**: 60fps maintained during interactions
- **Event Processing**: <16ms per action

## 🔧 Troubleshooting

### Common Issues

#### Enhanced Mode Not Activating
```typescript
// Check if enhanced mode is properly enabled
if (!app.isEnhancedMode()) {
  console.error('Enhanced mode failed to activate')
  // Check console for initialization errors
}
```

#### Performance Issues
```typescript
// Disable non-essential features
enhancedGameManager.pause()
enhancedDiagnosticUI.disableEnhancedFeatures()
```

#### Memory Leaks
```typescript
// Ensure proper cleanup
app.destroy() // Cleans up all enhanced systems
```

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('xrai_debug_enhanced', 'true')
```

## 📚 API Reference

### EnhancedGameManager
- `startCase(medicalCase)`: Start enhanced case
- `processAction(action)`: Process player action
- `getGameState()`: Get current state
- `getAnalyticsData()`: Export analytics

### EnhancedCanvasIntegration
- `enableEnhancedMode(medicalCase)`: Enable enhanced features
- `handleScanAction(region, progress)`: Process scanning
- `performInvestigationTechnique(technique)`: Execute technique

### EnhancedDiagnosticUI
- `enableEnhancedFeatures(gameManager)`: Activate enhanced UI
- `showNarrativeChoices(choices)`: Display ethical choices
- `updatePerformanceMetrics(metrics)`: Update performance display

## 🤝 Contributing

### Adding New Features
1. Create feature in appropriate domain directory
2. Add types to domain types file
3. Integrate with EnhancedGameManager
4. Add UI components to EnhancedDiagnosticUI
5. Update integration example

### Code Style
- Follow existing TypeScript patterns
- Use design tokens for styling
- Add comprehensive JSDoc comments
- Include unit tests for new features

## 📄 License

Same as main X-RAI project license.

## 🔗 Related Documentation

- [Main X-RAI README](../../README.md)
- [Design Tokens](../styles/design-tokens.ts)
- [Medical Types](./medical/types.ts)
- [Diagnostic UI](./diagnostic/README.md)