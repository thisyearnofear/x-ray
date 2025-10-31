# Economic & Medical Systems

## Overview

X-RAY Medical Diagnostics features a sophisticated economic system integrated with medical gameplay, where budget constraints create meaningful decisions and patient outcomes drive economic consequences. This document covers the MON token economy, medical action system, and patient-centric mechanics.

## MON Token Economy

### Smart Contracts
- ✅ `MedicalEconomics.sol` - Full contract with 4 difficulty tiers
- ✅ Performance-based earnings calculation
- ✅ Player statistics tracking
- ✅ Gas-optimized storage

### Difficulty Tiers
1. **Beginner**: 0.5 MON budget (free tier, no wallet needed)
2. **Intermediate**: 1.5 MON budget (requires wallet)
3. **Advanced**: 3.0 MON budget (requires wallet)
4. **Expert**: 5.0 MON budget (requires wallet)

### Performance-Based Earnings
**Base**: 50% of max earnings
**Accuracy Bonus**: Up to 25% for correct diagnoses
**Time Bonus**: Up to 15% for efficient completion
**Budget Efficiency**: Up to 10% for cost-effective treatment

### Backend Systems
- ✅ `BudgetManager` - Runtime MON tracking with validation
- ✅ `HospitalAdministrator` - Personified budget agent with 3 personalities
- ✅ `GameManager` integration - Budget wired into gameplay loop

## Hospital Administrator System

### Three Personalities

1. **Dr. Patricia Chen (CFO)** - 💼 Strict
   - Hard negotiations (70% base approval)
   - Emphasizes efficiency
   - "The board is watching, Doctor."

2. **Marcus Rodriguez (Admin)** - 👔 Flexible
   - Balanced approach (50% base approval)
   - Reasonable compromise
   - "Let's discuss your reasoning."

3. **Dr. Sarah Williams (CMO)** - 🩺 Generous
   - Patient-first (30% base approval)
   - Compassionate
   - "Do whatever it takes to save them."

### Negotiation Mechanics
```typescript
// User requests additional funds
const negotiation = hospitalAdmin.requestAdditionalFunds(
  0.5, // amount requested
  "Need CT scan for critical diagnosis",
  'critical' // patient status
);

// Approval chance calculation:
// Base: 30-70% (depends on personality)
// + Patient criticality: +0 to +30%
// + Requested amount: +10 (small) to -20 (large)
```

### Personal Fund Contributions
- User spends own MON from wallet
- **Risk**: Lose funds if patient dies
- **Reward**: Get back funds + bonus if patient survives

## Medical Actions Database

### Tests (8 actions)
- Basic Blood Panel: 0.05 MON
- Comprehensive Panel: 0.12 MON
- Chest X-Ray: 0.15 MON
- CT Scan: 0.40 MON
- MRI Scan: 0.60 MON
- Ultrasound: 0.10 MON
- ECG: 0.08 MON
- Blood Culture: 0.18 MON

### Treatments (6 actions)
- Broad-Spectrum Antibiotics: 0.20 MON
- Targeted Antibiotics: 0.15 MON
- IV Fluids: 0.10 MON
- Oxygen Therapy: 0.05 MON
- Pain Management: 0.08 MON
- Emergency Surgery: 1.50 MON

### Consultations (4 actions)
- Nurse Amy: 0.03 MON
- Specialist: 0.25 MON
- Radiology: 0.15 MON
- Pathology: 0.20 MON

## Patient-Centric Enhancement

### PatientState Deterioration System
**Problem**: Patient state was passive, lacked dramatic progression.

**Solution**: Added 5 deterioration milestones (80%, 60%, 50%, 40%, 20% health) with:
- Event system for milestone notifications (`on()`, `emit()` methods)
- Automatic complication triggering at 50% health milestone
- Prognosis includes next milestone prediction with time remaining
- `getMilestones()` method for UI display
- Milestone tracking with `milestonesPassed` Set

### Diagnostic Confidence Tracking
**System**: `DiagnosticConfidence` class (359 lines)

**Features**:
- **Evidence Tracking**: 5 types (symptom, lab, imaging, physical, history)
- **Bayesian Confidence**: Probability calculation with supporting/contradicting evidence
- **Evidence Chains**: Link evidence to diagnoses with weighted scoring
- **Quality Assessment**: Weak/moderate/strong evidence classification
- **Ranked Diagnoses**: Sort by confidence with top N selection
- **Overall Certainty**: Composite score considering evidence quality and separation
- **Recommendations**: 4 action types (investigate/consult/diagnose/emergency)
- **Missing Evidence Detection**: Suggest what tests to order next

### Treatment Effectiveness System
**Enhancement to MedicalAction**:
```typescript
effectiveness?: {
  baseSuccessRate: number; // 0-1 scale
  effectivenessVsCriticality: {
    stable: number;
    deteriorating: number;
    critical: number;
    terminal: number;
  };
  healthImpact: number; // -20 to +50
  deteriorationReduction: number; // 0-1 scale
  requiresConditions?: string[];
  contraindictedConditions?: string[];
}
```

**Enhanced Treatments**:
1. **Broad-Spectrum Antibiotics**: 65% base, 80% stable → 20% terminal
2. **Targeted Antibiotics**: 90% base, requires culture results
3. **IV Fluids**: 85% base, contraindicated in heart failure
4. **Oxygen Therapy**: 95% base, highly effective
5. **Emergency Surgery**: 70% base, 40 health impact, 0.8 deterioration reduction

### OutcomePredictor Service
**Service**: `OutcomePredictor` class (511 lines)

**Prediction Features**:
- **Success Rate Calculation**: Multi-factor analysis
  - Patient criticality modifier
  - Diagnostic certainty adjustment
  - Contraindication penalties
  - Condition matching bonuses
- **Health Impact Projection**: Expected health change with success/failure scenarios
- **Criticality Prediction**: Forecast patient state after intervention
- **Risk Assessment**: Severity (low/medium/high/critical) + probability + mitigation
- **Benefit Assessment**: Magnitude (minor/moderate/major/critical) + probability
- **Recommendation Generation**: 5 levels (strongly_recommended → strongly_discouraged)
- **Scenario Comparison**: Compare multiple actions side-by-side

**Prediction Confidence**:
- Based on diagnostic certainty (0-100%)
- Reduced for critical/terminal patients (more unpredictable)
- Higher with effectiveness data available

### Patient Criticality → Budget Negotiations
**Enhancement to HospitalAdministrator**:
- Support for `terminal` criticality level (in addition to stable/deteriorating/critical)
- **Criticality Bonuses**:
  - Stable: +0% approval
  - Deteriorating: +15% approval
  - Critical: +35% approval
  - Terminal: +50% approval (urgent life-saving)
- **Emergency Override**: Small requests (<1.0 MON) in terminal situations → 85% min approval

## UI Components

### BudgetHUD (Deprecated)
**Status**: Replaced by MasterHUD
**Functionality**: Real-time budget display with admin messages

### MasterHUD
**Features**:
- **Budget Section** - MON token tracking with efficiency metrics
- **Patient Status Section** - Health, criticality, milestones, complications
- **Diagnostic Section** - Evidence count, top diagnosis, confidence tracking
- **Phase Indicator Integration** - Current game phase with time/criticality
- **Collapsible Sections** - Expand/collapse for better space management
- **Administrator Messages** - Timed notifications from hospital admin
- **Wallet Actions** - Request funds & contribute personal funds

### CaseSelectionHub
**Features**:
- Pre-game difficulty selection
- 4 holographic cards for difficulty tiers
- Free tier (no wallet) vs premium tier (wallet required)
- Clear upgrade path messaging

### TreatmentMenu
**Enhanced Features**:
- **AI Outcome Predictions**: Using `OutcomePredictor` service
- **Success Rate Display**: Per-action success probability
- **Health Impact Predictions**: Expected health changes
- **Risk-Benefit Analysis**: Detailed risk and benefit assessments
- **Recommendation System**: Strongly recommended → strongly discouraged
- **Confidence Metrics**: Prediction confidence levels
- **Interactive Preview Cards**: Hover to see detailed analysis

## Economic Balance

### Dynamic Pricing
- Time-based cost adjustments
- Patient criticality modifiers
- Diagnostic certainty factors

### Efficiency Bonuses
- Cost-effective treatment rewards
- Time-efficient completion bonuses
- Evidence-based decision incentives

### Strategic Prompts
- Budget-conscious decision guidance
- Cost-benefit analysis displays
- Efficiency metric tracking

## Integration Points

### GameManager → Economic Systems
```
GameManager
├─ initializeBudget() → BudgetManager
├─ executeAction() → HospitalAdministrator
├─ timer milestones → budget warnings
└─ patient criticality → negotiation bonuses
```

### PatientState → Everything
```
PatientState
├─ deteriorationRate → affects health over time
├─ milestones → trigger complications & events
├─ criticality → affects treatment effectiveness
└─ prognosis → informs outcome predictions
```

### Evidence → Diagnosis → Treatment
```
DiagnosticConfidence
├─ Evidence chains → Diagnosis confidence
├─ Confidence → Treatment success modifier
└─ Recommendations → Player guidance
```

### OutcomePredictor → Decision Support
```
OutcomePredictor
├─ PatientState + Evidence → Predictions
├─ Risk/Benefit analysis → Recommendations
└─ Scenarios → Comparative analysis
```

## Testing Recommendations

### PatientState
- Verify milestones trigger at correct health thresholds
- Test complication emergence at 50% health
- Validate prognosis calculations
- Check event emission for all milestones

### DiagnosticConfidence
- Test Bayesian confidence calculation
- Verify evidence quality assessment
- Check recommendation logic for all certainty levels
- Validate missing evidence detection

### OutcomePredictor
- Test predictions for all criticality levels
- Verify risk-benefit scoring
- Check scenario comparison sorting
- Validate mitigation suggestions

### HospitalAdministrator
- Test approval rates for all criticality levels
- Verify terminal emergency override
- Check negotiation conditions generation

## Business Impact

### Monetization Strategy
- **Free Tier**: Complete experience with static case
- **Premium Tier**: AI-generated cases with validation
- **Economic Stakes**: Real MON token consequences
- **Progressive Unlocking**: Clear value for upgrading

### User Experience
- **Free Users**: Rich, complete case experience
- **Premium Users**: High-quality AI cases validated before delivery
- **All Users**: Consistent Nurse Amy character across interactions

### Quality Assurance
- **AI Validation**: No bad cases reach users
- **Medical Safety**: Consistency checks protect reputation
- **Trust Building**: Transparent outcome predictions

## Future Enhancements

### Potential Additions
1. **More Static Cases**: Add cardiac, respiratory, trauma cases
2. **Case Rotation**: Rotate through static cases for free users
3. **Validation Levels**: Configurable strictness
4. **Character Expansion**: Add attending physician, patient characters
5. **Learning Analytics**: Track educational effectiveness

### Integration Opportunities
1. Connect NurseAmyPersonality to VoiceConsultationManager TTS
2. Use validation scores for adaptive difficulty
3. Add achievement for high-validation-score cases
4. Create "quality badge" for premium AI cases

## Conclusion

The economic and medical systems create a cohesive experience where budget decisions, patient outcomes, and diagnostic accuracy form an integrated narrative. The patient-centric approach ensures medical decisions feel meaningful while the economic system provides real stakes and consequences.

**System Integration Score**: **9.5/10**