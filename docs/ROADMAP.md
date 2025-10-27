# 🩻 X-RAY Cohesion Enhancement Roadmap

## Core Principles Guiding This Roadmap

**ENHANCEMENT FIRST**: Always prioritize enhancing existing components over creating new ones
**AGGRESSIVE CONSOLIDATION**: Delete unnecessary code rather than deprecating
**PREVENT BLOAT**: Systematically audit and consolidate before adding new features
**DRY**: Single source of truth for all shared logic
**CLEAN**: Clear separation of concerns with explicit dependencies
**MODULAR**: Composable, testable, independent modules
**PERFORMANT**: Adaptive loading, caching, and resource optimization
**ORGANIZED**: Predictable file structure with domain-driven design

---

## 🎯 Overall Objective

Transform the existing codebase into a cohesive medical diagnostic experience where timer, budget, and medical decisions form an integrated narrative centered on patient care.

## 📊 Progress Tracking

- **Total Phases**: 9 (4 complete, 5 remaining)
- **Estimated Duration**: 10 weeks
- **Current Phase**: [5/9] Feature Discovery (recommended next)
- **Phases Completed**: Foundation (1), GameManager (2), Patient-Centric (3), UI Consolidation (4), Medical Logic (6)
- **Last Updated**: 2025-10-26

---

## Phase 1: Foundation Audit & Consolidation (Week 1) 🔍
**Status**: [ ] In Progress  [x] Completed  [ ] Blocked

**Goals**: Apply AGGRESSIVE CONSOLIDATION and PREVENT BLOAT

### Audit Findings ✅ COMPLETED
**Event Systems (MAJOR DUPLICATION)**: ✅ **RESOLVED**
- **DOM Events**: `document.dispatchEvent()` used by EconomicEventBridge
- **GameManager Events**: `this.on/this.emit` internal system
- **Window Events**: `window.addEventListener` for globals
- **Impact**: 3 parallel event systems causing state sync issues
- **Resolution**: Consolidated EconomicEventBridge functionality into GameManager

**Achievement Systems (DUPLICATION)**: ✅ **RESOLVED**
- `AchievementSystem` exists in both `diagnostic/` and `analytics/` domains
- Different interfaces and functionality
- Both imported by GameManager - unclear which is canonical
- **Resolution**: Enhanced diagnostic AchievementSystem with analytics features, deleted duplicate

**Audio Systems (SCATTERED)**:
- `AudioManager` component in `/components`
- `EnhancedAudioManager` in `/domains/audio`
- `audio-management-system.ts` in `/domains/audio`
- Multiple audio abstractions without clear single source

**Unused/Legacy Files**: ✅ **RESOLVED**
- `instructions-panel.ts.backup` - backup file removed ✅
- `lee-perry.ts` - confirmed in use (3D model loader)
- Empty domains: `achievements/` (only has services/ subdirectory)

### Deliverables ✅ MOSTLY COMPLETE
- [x] **Codebase Audit**: Complete inventory of all components, events, and state management
- [x] **Event System Consolidation**: Merge DOM and GameManager events into single system
- [x] **Achievement System Merge**: Consolidate duplicate AchievementSystems
- [x] **Audio System DRY**: Create single AudioManager source of truth
- [x] **Bloat Removal**: Delete backup files and unused components
- [x] **PatientState Extraction**: Extract from existing MedicalCase structure

### Success Metrics ✅ ACHIEVED
- [x] Codebase size reduced by removing duplicate files
- [x] Single event system established (GameManager-centric)
- [x] No duplicate AchievementSystem implementations
- [x] Build passes without errors
- [x] All existing functionality preserved

### Key Files to Audit
- `src/domains/diagnostic/GameManager.ts`
- `src/domains/economic/EconomicEventBridge.ts`
- `src/components/Canvas.tsx`
- `src/domains/medical/`
- All UI components in `src/components/`

---

## Phase 2: GameManager Enhancement (Weeks 1-2) 🏗️
**Status**: [ ] Not Started  [ ] In Progress  [x] Completed  [ ] Blocked

**Goals**: ENHANCEMENT FIRST, SINGLE SOURCE OF TRUTH

### Deliverables
- [x] **GamePhase Enum**: Add to existing GameState interface
- [x] **GameManager Integration**: Tightly integrate BudgetManager and HospitalAdministrator
- [x] **Event Consolidation**: Merge EconomicEventBridge into GameManager
- [x] **Timer Milestone Enhancement**: Drive feature unlocks through existing system
- [x] **State Management**: Ensure GameManager is single source of truth

### Success Metrics
- [x] GameManager orchestrates all major systems
- [x] No parallel event systems
- [x] Clear game phase progression

### Key Files to Modify
- `src/domains/diagnostic/GameManager.ts`
- `src/domains/economic/EconomicEventBridge.ts`
- `src/domains/medical/BudgetManager.ts`

---

## Phase 3: Patient-Centric Enhancement (Weeks 2-3) 🏥
**Status**: [ ] Not Started  [ ] In Progress  [x] Completed  [ ] Blocked

**Goals**: CLEAN separation, MODULAR design

### Deliverables
- [x] **Patient Criticality**: Add levels to existing PatientCase structure
- [x] **Deterioration Logic**: Time-based condition progression
- [x] **Probability Tracking**: Enhance MedicalServiceFacade
- [x] **Treatment Effectiveness**: Add to medical-actions-data.ts
- [x] **Outcome Predictor**: Build on existing AI infrastructure

### Success Metrics
- [x] Patient state drives all game systems
- [x] Clear consequence communication
- [x] Medical decisions feel meaningful

### Key Files to Modify
- `src/domains/medical/types.ts`
- `src/domains/medical/MedicalServiceFacade.ts`
- `src/domains/medical/medical-actions-data.ts`
- `src/domains/voice/VoiceConsultationManager.ts`

---

## Phase 4: UI Consolidation (Weeks 3-4) 🎨
**Status**: [ ] Not Started  [ ] In Progress  [x] Completed  [ ] Blocked
**Completed**: 2025-10-26

**Goals**: DRY, ORGANIZED structure

### Deliverables
- [x] **MasterHUD**: Created comprehensive interface consolidating budget, patient state, diagnostic confidence, and phase indicators
- [x] **Phase Indicators**: Created PhaseIndicator component with 5-phase progression visualization
- [x] **Contextual Help**: Created ContextualHelp component with 8 predefined tips and wrapper system
- [x] **Decision Previews**: Enhanced TreatmentMenu with AI-powered outcome predictions
- [x] **UI Consolidation**: Deleted BudgetHUD.tsx (fully replaced by MasterHUD)

### Success Metrics ✅ ACHIEVED
- [x] Single HUD showing all critical information (MasterHUD with collapsible sections)
- [x] Clear phase progression visualization (PhaseIndicator with urgency indicators)
- [x] No duplicate UI components (BudgetHUD deleted)

### Key Files Modified/Created
- `src/components/MasterHUD.tsx` - Created (577 lines)
- `src/components/PhaseIndicator.tsx` - Created (284 lines)
- `src/components/ContextualHelp.tsx` - Created (320 lines)
- `src/components/TreatmentMenu.tsx` - Enhanced with outcome predictions
- `src/components/BudgetHUD.tsx` - ❌ Deleted (redundant)
- `app/components/Canvas.tsx` - Updated to use MasterHUD
- `docs/UI_COMPONENT_AUDIT.md` - Created
- `docs/PHASE_4_COMPLETION.md` - Created

---

## Phase 5: Feature Discovery (Weeks 4-5) 💡
**Status**: [ ] Not Started  [ ] In Progress  [ ] Completed  [ ] Blocked

**Goals**: PERFORMANT, CLEAN integration

### Deliverables
- [ ] **Milestone-Driven Tutorial**: Enhance existing TutorialFacade
- [ ] **Visual Affordances**: Extend existing button/interaction styles
- [ ] **Progressive Previews**: Add to CaseSelectionHub
- [ ] **Contextual Prompts**: Integrate with timer milestones
- [ ] **Help System Consolidation**: Merge duplicate tutorial components

### Success Metrics
- [ ] First-time users discover features naturally
- [ ] No external help needed for beginner cases
- [ ] Clear upgrade paths for premium features

### Key Files to Modify
- `src/domains/tutorial/TutorialFacade.ts`
- `src/components/CaseSelectionHub.tsx`
- `src/components/WalletConnection.tsx`
- Timer milestone system in GameManager

---

## Phase 6: Medical Logic Integration (Weeks 5-6) 🔬
**Status**: [ ] Not Started  [ ] In Progress  [x] Completed (via Phase 3)  [ ] Blocked

**Goals**: MODULAR, DRY implementation

**NOTE**: This phase was largely completed during Phase 3 with DiagnosticConfidence and OutcomePredictor

### Deliverables
- [x] **Evidence Chains**: Implemented in DiagnosticConfidence.ts
- [x] **Treatment Prerequisites**: Added to MedicalAction effectiveness system
- [x] **Diagnostic Confidence**: Full Bayesian tracking system created
- [x] **Medical Validation**: OutcomePredictor validates treatment appropriateness
- [x] **Outcome Consistency**: Risk-benefit analysis ensures logic alignment

### Success Metrics
- [x] Clear condition-treatment relationships (via requiresConditions/contraindictedConditions)
- [x] Evidence-based diagnostic confidence (Bayesian probability system)
- [x] Consistent medical outcomes (OutcomePredictor)

### Key Files to Modify
- `src/domains/medical/medical-actions-data.ts`
- `src/domains/medical/MedicalServiceFacade.ts`
- `src/domains/medical/types.ts`
- `src/canvas.ts` (for 3D model integration)

---

## Phase 7: Economic Balance (Weeks 6-7) 💰
**Status**: [ ] Not Started  [ ] In Progress  [ ] Completed  [ ] Blocked

**Goals**: CLEAN dependencies, ORGANIZED domains

### Deliverables
- [ ] **Dynamic Pricing**: Enhance BudgetManager with time/patient factors
- [ ] **Efficiency Bonuses**: Add to existing reward system
- [ ] **Strategic Prompts**: Integrate with existing UI components
- [ ] **Wallet Integration**: Clear upgrade paths
- [ ] **Event Deduplication**: Consolidate economic event handling

### Success Metrics
- [ ] Budget decisions feel meaningful
- [ ] Clear incentives for efficiency
- [ ] Premium features have obvious value

### Key Files to Modify
- `src/domains/medical/BudgetManager.ts`
- `src/domains/medical/HospitalAdministrator.ts`
- `src/components/BudgetHUD.tsx`
- `src/domains/web3/` components

---

## Phase 8: Timer Narrative (Weeks 7-8) ⏱️
**Status**: [ ] Not Started  [ ] In Progress  [ ] Completed  [ ] Blocked

**Goals**: PERFORMANT integration, MODULAR design

### Deliverables
- [ ] **Patient-Specific Milestones**: Enhance existing timer system
- [ ] **Dramatic Tension**: Extend ScanFeedbackSystem
- [ ] **Emergency Mode**: Build on existing budget negotiation
- [ ] **Strategic Pacing**: Time management mechanics
- [ ] **Time Logic Consolidation**: Single system in GameManager

### Success Metrics
- [ ] Timer creates narrative tension
- [ ] Emergency situations feel impactful
- [ ] Time management is engaging, not punitive

### Key Files to Modify
- `src/domains/diagnostic/GameManager.ts` (timer system)
- `src/components/ScanFeedbackSystem.ts`
- `src/components/AudioManager.ts`
- `src/domains/medical/HospitalAdministrator.ts`

---

## Phase 9: Validation & Polish (Weeks 8-10) ✅
**Status**: [ ] Not Started  [ ] In Progress  [ ] Completed  [ ] Blocked

**Goals**: ORGANIZED testing, CLEAN metrics

### Deliverables
- [ ] **Cohesion Playtests**: First-time user sessions
- [ ] **Analytics Enhancement**: Add cohesion tracking
- [ ] **Accessibility Improvements**: Build on existing design system
- [ ] **Performance Monitoring**: Integrate with existing structure
- [ ] **A/B Testing Framework**: Use existing component variants
- [ ] **Final Consolidation**: Remove unused features

### Success Metrics
- [ ] 80% of test users report cohesion
- [ ] Analytics show improved feature discovery
- [ ] Performance maintained or improved
- [ ] Accessibility score improved

### Key Activities
- [ ] User testing sessions
- [ ] Analytics dashboard setup
- [ ] Performance benchmarking
- [ ] Accessibility audit

---

## 📈 Weekly Checkpoints

### Week 1: Foundation Assessment
- Complete codebase audit
- Identify consolidation opportunities
- Begin GameManager enhancement

### Week 3: Core Systems Integration
- Patient-centric mechanics working
- UI consolidation started
- Feature discovery flow outlined

### Week 5: Medical Logic Cohesion
- Evidence chains implemented
- Economic balance tuned
- Feature discovery validated

### Week 7: Narrative Integration
- Timer drives story
- Emergency systems functional
- Polish pass begun

### Week 10: Launch Ready
- All systems cohesive
- User testing complete
- Performance optimized

---

## 🚨 Risk Mitigation

### Technical Risks
- **Big Refactor**: Weekly check-ins, feature flags for rollback
- **Performance**: Continuous monitoring, optimization sprints
- **Testing**: Automated tests for each enhancement

### Product Risks
- **Scope Creep**: Strict weekly deliverables with go/no-go decisions
- **User Impact**: A/B testing for all major changes
- **Timeline Slip**: Parallel workstreams where possible

### Contingency Plans
- **Blocker Resolution**: Daily standups, escalation paths
- **Quality Gates**: Code review requirements, automated testing
- **Rollback Strategy**: Feature flags for all major changes

---

## 📋 Phase Completion Criteria

Each phase is complete when:
1. **Code Quality**: Passes all automated tests
2. **Functionality**: All deliverables implemented and working
3. **Integration**: Systems work together cohesively
4. **User Testing**: Positive feedback from 3+ test users
5. **Documentation**: Code and ROADMAP updated
6. **Performance**: No degradation from baseline metrics

---

## 🔗 Related Documentation

- [CORE_CONCEPTS.md](CORE_CONCEPTS.md) - Technical architecture
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - User workflows
- [WEB3_IMPLEMENTATION.md](WEB3_IMPLEMENTATION.md) - Blockchain integration

---

*This roadmap follows our Core Principles: Enhancement First, Aggressive Consolidation, Prevent Bloat, DRY, Clean, Modular, Performant, and Organized.*
