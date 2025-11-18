type Phase =
  | 'intro'
  | 'connect'
  | 'onboarding'
  | 'case_selection'
  | 'investigation'
  | 'evidence'
  | 'diagnosis'
  | 'outcome'
  | 'replay'

type Overlay =
  | 'none'
  | 'onboarding'
  | 'case_selection'
  | 'treatment'
  | 'crisis'
  | 'outcome'

type GuidanceSurface = 'tutorial' | 'highlight' | 'prompt'

interface State {
  phase: Phase
  overlay: Overlay
}

type Subscriber = (state: State) => void

export class ExperienceDirector {
  private state: State = { phase: 'intro', overlay: 'none' }
  private subs: Subscriber[] = []
  private burstExpiresAt: number = 0
  private burstCount: number = 0
  private burstQuietUntil: number = 0

  subscribe(fn: Subscriber) {
    this.subs.push(fn)
    fn(this.state)
    return () => {
      this.subs = this.subs.filter((s) => s !== fn)
    }
  }

  private emit() {
    for (const s of this.subs) s(this.state)
  }

  setPhase(phase: Phase) {
    this.state.phase = phase
    this.emit()
  }

  requestOverlay(overlay: Overlay) {
    this.state.overlay = overlay
    this.emit()
  }

  releaseOverlay(overlay: Overlay) {
    if (this.state.overlay === overlay) {
      this.state.overlay = 'none'
      this.emit()
    }
  }

  hasActiveOverlay() {
    return this.state.overlay !== 'none'
  }

  allowGuidance(surface: GuidanceSurface) {
    const now = Date.now()
    if (this.hasActiveOverlay()) return false
    if (!this.isPhaseGuidanceAllowed()) return false
    if (now < this.burstQuietUntil) return false

    if (now > this.burstExpiresAt) {
      this.burstExpiresAt = now + 20000
      this.burstCount = 0
    }
    if (this.burstCount >= 2) return false
    this.burstCount++
    if (this.burstCount >= 2) {
      this.burstQuietUntil = this.burstExpiresAt + 15000
    }
    return true
  }

  private isPhaseGuidanceAllowed() {
    return (
      this.state.phase === 'investigation' ||
      this.state.phase === 'evidence' ||
      this.state.phase === 'diagnosis'
    )
  }
}