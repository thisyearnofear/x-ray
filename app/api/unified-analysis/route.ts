import { NextResponse } from 'next/server'

const CEREBRAS_URL = 'https://api.cerebras.ai/v1/chat/completions'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const stream = url.searchParams.get('stream') === '1'
  if (stream) {
    return handleStream(req)
  }
  try {
    const body = await req.json()
    const {
      patientState = {},
      actions = [],
      timeRemaining,
      budget,
      caseId,
      onchain = {},
    } = body || {}

    const apiKey = process.env.CEREBRAS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing CEREBRAS_API_KEY' }, { status: 500 })
    }

    const systemPrompt = `You are a clinical decision support system assisting in an immersive medical mystery. Provide structured, concise outputs with clinical objectivity. Use Nurse Amy’s voice only for surface-level guidance messages. Output strictly in JSON with fields: differential, confidence, next_actions, rationale, citations.`

    const userContent = { patientState, actions, timeRemaining, budget, caseId, onchain }

    const res = await fetch(CEREBRAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama3.1-70b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userContent) },
        ],
        temperature: 0.2,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text || 'AI request failed' }, { status: 500 })
    }

    const json = await res.json()
    const content = json?.choices?.[0]?.message?.content || '{}'

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {}

    const safe = {
      differential: parsed?.differential ?? [],
      confidence: parsed?.confidence ?? 0,
      next_actions: parsed?.next_actions ?? [],
      rationale: parsed?.rationale ?? '',
      citations: parsed?.citations ?? [],
    }

    return NextResponse.json(safe)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

async function handleStream(req: Request) {
  try {
    const body = await req.json()
    const {
      patientState = {},
      actions = [],
      timeRemaining,
      budget,
      caseId,
      onchain = {},
    } = body || {}

    const apiKey = process.env.CEREBRAS_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ type: 'error', error: 'Missing CEREBRAS_API_KEY' }) + '\n', {
        status: 500,
        headers: { 'Content-Type': 'application/x-ndjson' },
      })
    }

    const systemPrompt = `You are a clinical decision support system assisting in an immersive medical mystery. Provide structured, concise outputs with clinical objectivity. Use Nurse Amy’s voice only for surface-level guidance messages. Output strictly in JSON with fields: differential, confidence, next_actions, rationale, citations.`

    const userContent = { patientState, actions, timeRemaining, budget, caseId, onchain }

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: 'start' }) + '\n'))
        try {
          const res = await fetch(CEREBRAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: 'llama3.1-70b',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(userContent) },
              ],
              temperature: 0.2,
            }),
          })
          const text = await res.text()
          let safe
          try {
            const json = JSON.parse(text)
            const content = json?.choices?.[0]?.message?.content || '{}'
            let parsed
            try { parsed = JSON.parse(content) } catch {}
            safe = {
              differential: parsed?.differential ?? [],
              confidence: parsed?.confidence ?? 0,
              next_actions: parsed?.next_actions ?? [],
              rationale: parsed?.rationale ?? '',
              citations: parsed?.citations ?? [],
            }
          } catch {
            safe = { differential: [], confidence: 0, next_actions: [], rationale: '', citations: [] }
          }
          controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: 'final', data: safe }) + '\n'))
        } catch (err: any) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: 'error', error: err?.message || 'AI request failed' }) + '\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ type: 'error', error: e?.message || 'Unexpected error' }) + '\n', {
      status: 500,
      headers: { 'Content-Type': 'application/x-ndjson' },
    })
  }
}