import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { condition } = await request.json();
    
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3.1-8b',
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant. Provide structured, educational analysis in a conversational tone.'
          },
          {
            role: 'user',
            content: `Analyze ${condition}: symptoms, causes, treatment options. Be concise and educational.`
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      }),
    });

    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Medical analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', fallback: 'Please consult a medical professional.' }, 
      { status: 500 }
    );
  }
}
