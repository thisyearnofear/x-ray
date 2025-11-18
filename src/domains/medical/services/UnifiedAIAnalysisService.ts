export type UnifiedAnalysisInput = {
  patientState: any
  actions: any[]
  timeRemaining: number
  budget: { remaining: number; spent: number; startingAmount: number }
  caseId: string
  onchain?: any
}

export type UnifiedAnalysisResult = {
  differential: Array<{ condition: string; score?: number }>
  confidence: number
  next_actions: Array<{ id?: string; label: string; risk?: string }>
  rationale: string
  citations: string[]
}

export async function unifiedAnalyze(input: UnifiedAnalysisInput): Promise<UnifiedAnalysisResult> {
  const res = await fetch('/api/unified-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Unified AI analysis failed')
  return (await res.json()) as UnifiedAnalysisResult
}

export type UnifiedStreamEvent = { type: 'start' | 'final' | 'error'; data?: UnifiedAnalysisResult; error?: string }

export async function unifiedAnalyzeStream(input: UnifiedAnalysisInput, onEvent: (e: UnifiedStreamEvent) => void): Promise<void> {
  const res = await fetch('/api/unified-analysis?stream=1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok || !res.body) {
    onEvent({ type: 'error', error: 'Unified AI analysis stream failed' })
    return
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const parts = buf.split('\n')
    buf = parts.pop() || ''
    for (const line of parts) {
      if (!line.trim()) continue
      try {
        const obj = JSON.parse(line)
        onEvent(obj as UnifiedStreamEvent)
      } catch {}
    }
  }
}