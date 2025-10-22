# Comprehensive Diagnosis Submission UX/UI Plan

## Current State Analysis

### Information Sources Available (Currently Scattered):
1. **3D Scanning** - Visual discovery of anatomical conditions
2. **Patient Interview** - Verbal history and symptoms (in Nurse Amy panel)
3. **Lab Orders** - Blood work, diagnostic tests (in Nurse Amy panel)
4. **Imaging** - X-rays, CT scans (in Nurse Amy panel)
5. **Physical Exam** - Palpation, auscultation (investigation toolkit)
6. **Nurse Consultation** - AI guidance (Nurse Amy panel)

### Current Problems:
- **Information scattered across multiple panels** (left panel, Nurse Amy, 3D view)
- **No central "evidence board"** to collect findings
- **Unclear when user has "enough" information to diagnose**
- **Hidden diagnosis submission** - users don't know how to submit
- **Over-reliance on scanning** - other investigation tools underutilized
- **No visual feedback** showing progression toward diagnosis

---

## Proposed Solution: Unified Investigation & Evidence Panel

### Single Top-Center Collapsible Panel
**Purpose:** Combined investigation hub + evidence collection + diagnosis trigger

**Collapsed State (Default - Minimal):**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 INVESTIGATION PANEL      [3/6 Tools] ✨3 NEW    [▼ Expand] │
└─────────────────────────────────────────────────────────────────┘
                     ↑ Pulses when new evidence arrives
```

**Expanded State - Tab 1: Investigation Tools**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 INVESTIGATION PANEL           3/6 Complete  [▲ Collapse]    │
├─────────────────────────────────────────────────────────────────┤
│ [Investigation Tools] [Evidence Board] [Ready to Diagnose]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💬 Patient Interview        ✓ Complete                         │
│  └─ Get detailed patient history and symptoms                   │
│     [VIEW TRANSCRIPT]                                            │
│                                                                  │
│  🧪 Laboratory Tests         ⏳ Processing (45s)                │
│  └─ Order CBC, CMP, inflammatory markers                        │
│     [VIEW RESULTS]                                               │
│                                                                  │
│  📷 Medical Imaging          [ORDER IMAGING]                    │
│  └─ Request X-rays, CT, MRI scans                              │
│                                                                  │
│  🩺 Physical Examination     [EXAMINE PATIENT]                  │
│  └─ Palpation, auscultation, range of motion                   │
│                                                                  │
│  🔬 3D Body Scan            ○ In Progress                       │
│  └─ Currently viewing - hover over areas to scan               │
│                                                                  │
│  👩‍⚕️ AI Consultation         [CONSULT NURSE] 🔒 Premium         │
│  └─ Get AI-powered clinical guidance                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Expanded State - Tab 2: Evidence Board**
```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 EVIDENCE BOARD                8 Items Collected              │
├─────────────────────────────────────────────────────────────────┤
│ [Investigation Tools] [Evidence Board] [Ready to Diagnose]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 From Patient Interview (3 items)                            │
│    • Chronic jaw pain for 3 weeks, worse with chewing          │
│    • Morning stiffness and audible clicking                     │
│    • No prior history of TMJ issues                             │
│                                                                  │
│  🧪 From Laboratory Tests (2 items)                             │
│    • 🚨 ESR: 18 mm/hr (Elevated - indicates inflammation)      │
│    • 🚨 CRP: 2.8 mg/L (Elevated - acute inflammatory marker)   │
│                                                                  │
│  🔬 From 3D Body Scan (1 item)                                  │
│    • TMJ Dysfunction detected in left temporomandibular joint   │
│                                                                  │
│  💡 Pattern Recognition                                          │
│    Jaw symptoms + clicking + inflammation = TMJ Dysfunction      │
│    Confidence: ████████░░ 85%                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Expanded State - Tab 3: Ready to Diagnose**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🏥 SUBMIT DIAGNOSIS              Time Remaining: 1:45           │
├─────────────────────────────────────────────────────────────────┤
│ [Investigation Tools] [Evidence Board] [Ready to Diagnose]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Select all conditions that apply based on your investigation:  │
│                                                                  │
│  ☑ Temporomandibular Joint Dysfunction         High (85%)       │
│      Evidence: Jaw pain, clicking, elevated inflammatory        │
│      markers (ESR/CRP), localized TMJ tenderness                │
│      [View Supporting Evidence →]                                │
│                                                                  │
│  ☐ Tension Headache                            Medium (45%)     │
│      Evidence: Chronic headaches, stress correlation            │
│      Missing: No photophobia, typical tension pattern           │
│      [View Supporting Evidence →]                                │
│                                                                  │
│  ☐ Dental Abscess                              Low (15%)        │
│      Evidence: None - not supported by current findings         │
│      Missing: No localized dental pain, no fever                │
│                                                                  │
│  ────────────────────────────────────────────────────────────   │
│                                                                  │
│  [📋 Review All Evidence]        [✓ SUBMIT DIAGNOSIS]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Single panel** - no clutter on left side
- **Tabs for context switching** - Investigation → Evidence → Diagnosis
- **Collapsed by default** - doesn't block 3D view
- **Smart notifications** - pulses when new evidence arrives
- **Progress tracking** visible even when collapsed
- **Smooth animations** between tabs and states

### Diagnosis Center (Full Screen Overlay - Final Step)
**Purpose:** Final diagnosis submission interface

**Trigger Conditions (Show when ANY of these met):**
- User has used at least 3 investigation tools
- At least 2 pieces of evidence collected
- User clicks "I'm Ready to Diagnose" button
- Timer < 60 seconds remaining
- User discovered conditions via scanning

```
┌─────────────────────────────────────────────────────┐
│           🏥 SUBMIT FINAL DIAGNOSIS                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Based on your investigation, select all conditions  │
│ that apply to this patient:                         │
│                                                      │
│ ☐ Temporomandibular Joint Dysfunction (High)        │
│   Evidence: Jaw pain, clicking, elevated CRP/ESR    │
│                                                      │
│ ☐ Tension Headache (Medium)                         │
│   Evidence: Chronic headaches, stress correlation    │
│                                                      │
│ ☐ Dental Abscess (Low)                              │
│   Not supported by current evidence                  │
│                                                      │
│ [📋 Review Evidence Again]  [✓ SUBMIT DIAGNOSIS]    │
│                                                      │
│ Confidence Level: ████████░░ 85%                    │
│ ⏱️ Time Remaining: 1:45                              │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Shows ALL possible conditions (not just discovered)
- Confidence indicator for each condition
- Evidence summary under each option
- Large, prominent SUBMIT button
- Shows time remaining
- Can review evidence before submitting

---

## Redesigned Information Flow

### Phase 1: Investigation (First 3 minutes)
```
User → Clicks Investigation Tool → Gets Results → Evidence Board Updates → Repeat
                                                         ↓
                                            "Evidence Collected" badge pulses
```

**Visual Feedback:**
- Evidence board **flashes green** when new evidence added
- Investigation tool shows **✓ Complete** after use
- Progress bar fills up (20% per tool used)

### Phase 2: Pattern Recognition (Minute 3-4)
**Nurse Amy actively guides:**
```
"👩‍⚕️ Doctor, you've collected great evidence! Notice the pattern:
jaw pain + clicking + elevated inflammatory markers = TMJ dysfunction.
Are you ready to form a diagnosis?"

[🎯 Yes, Show Diagnosis Options] [🔍 Need More Evidence]
```

### Phase 3: Diagnosis Submission (Last minute)
**Automatic trigger at 60 seconds:**
```
┌──────────────────────────────────────┐
│  ⚠️ TIME TO DIAGNOSE                │
│                                      │
│  You have 60 seconds remaining.     │
│  Please submit your diagnosis now.  │
│                                      │
│  [📋 REVIEW EVIDENCE & DIAGNOSE]    │
└──────────────────────────────────────┘
```

**Diagnosis panel slides in from center-top**
- Overlay dims background
- Can't be dismissed (must submit or let timer expire)

---

## Enhanced Investigation Tools UI

### Smart Panel Behavior:

**Auto-expand triggers:**
- First tool is used (show Investigation Tools tab)
- New evidence arrives (flash notification, switch to Evidence tab)
- 3+ pieces of evidence collected (Ready to Diagnose tab unlocks)
- Timer reaches 60 seconds (force open to Ready to Diagnose tab)

**User can:**
- Click to toggle expand/collapse anytime
- Switch between tabs freely
- See notification badge even when collapsed
- Drag panel to reposition (optional)

**Visual States:**
```
Collapsed:     Simple header bar, minimal space
Expanded:      Full panel with tabs, max-height: 60vh
Notification:  Badge pulses, gentle glow effect
Locked:        Ready to Diagnose tab disabled until conditions met
```

---

## Implementation Priority

### Phase 1 (High Priority - Immediate):
1. ✅ Create Evidence Board component (center-top)
2. ✅ Add "Ready to Diagnose" trigger button
3. ✅ Show Diagnosis Center when triggered
4. ✅ Update left panel to show tool completion status

### Phase 2 (Medium Priority - This Sprint):
5. ✅ Enhance Nurse Amy guidance for diagnosis readiness
6. ✅ Add Physical Exam button to main UI
7. ✅ Implement auto-trigger at 60 seconds
8. ✅ Add evidence categorization (by source)

### Phase 3 (Polish - Next Sprint):
9. ⬜ Add confidence meter for each diagnosis
10. ⬜ Animated transitions between phases
11. ⬜ Detailed evidence review modal
12. ⬜ Post-diagnosis feedback/scoring

---

## User Journey Example

**Minute 0-1:** User arrives, sees patient info
- Nurse Amy: "Hi Doctor! Let's start by interviewing the patient."
- User clicks "Patient Interview" → Evidence board shows 3 new items ✨
- Left panel shows "Interview ✓"

**Minute 1-2:** User explores tools
- User clicks "Lab Orders" → Results come in → Evidence board updates ✨
- User scans 3D model → Discovers TMJ condition → Added to evidence ✨
- Progress bar: 60%

**Minute 2-3:** Pattern emerges
- Nurse Amy: "Great work! Your evidence strongly suggests TMJ dysfunction. The jaw clicking + elevated inflammatory markers support this."
- Evidence board has 8 items now
- "Ready to Diagnose" button turns GREEN and pulses

**Minute 3-4:** User reviews
- User clicks "Ready to Diagnose"
- Diagnosis Center appears with all possible conditions
- TMJ shows 85% confidence with supporting evidence listed
- User checks TMJ box

**Minute 4-5:** Submission
- User clicks "SUBMIT DIAGNOSIS"
- Results screen appears with scoring
- NFT minting (if correct)

---

## Technical Components Needed

### New Components:
1. `<EvidenceBoard />` - Central evidence collection panel
2. `<DiagnosisCenter />` - Diagnosis submission interface
3. `<InvestigationProgress />` - Progress tracker widget
4. `<ReadyToDiagnoseButton />` - Trigger button with state management

### Modified Components:
5. Update `DiagnosticUIManager.ts` - Add evidence tracking
6. Update `DiagnosisSubmissionSection.ts` - Redesign layout
7. Update `AIPanel.ts` - Better trigger guidance
8. Update left panel buttons - Add status indicators

### State Management:
```typescript
interface DiagnosisState {
  evidenceCollected: Evidence[]
  investigationsCompleted: string[]
  readyToDiagnose: boolean
  diagnosisCenterVisible: boolean
  diagnosisSubmitted: boolean
  confidenceLevel: number
}

interface Evidence {
  id: string
  source: 'interview' | 'labs' | 'imaging' | 'physical' | 'scanning'
  content: string
  abnormal: boolean
  timestamp: number
  relatedCondition?: string
}
```

---

## Visual Mockup - New Layout

**Normal View (Panel Collapsed):**
```
┌───────────────────────────────────────────────────────────────────┐
│ 🔍 INVESTIGATION  [3/6]  ✨2 NEW  [▼]     Timer: 3:15  Patient: Marcus │
└───────────────────────────────────────────────────────────────────┘


                    [3D BODY SCAN VIEWPORT]
                         Full screen view                  ┌─────────┐
                       Interactive model                    │ Nurse   │
                      User can rotate/scan                  │  Amy    │
                                                            │         │
                                                            │ "Great  │
                                                            │ work!   │
                                                            │ Review  │
                                                            │ your    │
                                                            │evidence"│
                                                            └─────────┘
```

**Expanded View (Panel Open):**
```
┌───────────────────────────────────────────────────────────────────┐
│ 🔍 INVESTIGATION PANEL          3/6 Complete          [▲ Close]   │
├───────────────────────────────────────────────────────────────────┤
│ [Investigation Tools] [Evidence Board] [Ready to Diagnose] ←Tabs  │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  💬 Patient Interview      ✓ Complete     [VIEW TRANSCRIPT]       │
│  🧪 Laboratory Tests       ⏳ Processing   [VIEW RESULTS]         │
│  📷 Medical Imaging        [ORDER IMAGING]                        │
│  🩺 Physical Exam          [EXAMINE PATIENT]                      │
│  🔬 3D Body Scan          ○ Active - Continue scanning            │
│  👩‍⚕️ AI Consultation       [CONSULT] 🔒                            │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘

                    [3D BODY SCAN VIEWPORT]
                      Slightly reduced view              ┌─────────┐
                     But still fully usable              │ Nurse   │
                                                         │  Amy    │
                                                         └─────────┘
```

---

## Success Metrics

Users should be able to:
- ✅ Clearly see what investigation tools are available
- ✅ Understand that scanning is ONE of many tools (not the only one)
- ✅ See all evidence collected in one central place
- ✅ Know when they have "enough" information to diagnose
- ✅ Easily submit their final diagnosis
- ✅ Understand what evidence supports each diagnosis option

**Target: 90%+ of users successfully submit a diagnosis without confusion**

---

## Next Steps

1. Review this plan with team
2. Prioritize which components to build first
3. Create detailed UI mockups in Figma
4. Begin implementation with Evidence Board
5. Test with users after each phase

Would you like me to proceed with implementing Phase 1 components?
