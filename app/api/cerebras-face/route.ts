import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageData, prompt } = body;

        if (!imageData) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.CEREBRAS_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Cerebras API key not configured' },
                { status: 500 }
            );
        }

        console.log('🤖 Processing face with Cerebras API...');

        // Call Cerebras API securely on server-side
        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-4-scout-17b-16e-instruct',
                messages: [{
                    role: 'user',
                    content: prompt || `For face swapping, suggest optimal face region coordinates. Return only JSON: {"x": 0.5, "y": 0.4, "width": 0.7, "height": 0.8} where values are 0-1 representing center-crop percentages for a typical portrait photo.`
                }],
                max_tokens: 100,
                temperature: 0
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cerebras API error:', response.status, errorText);
            throw new Error(`Cerebras API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const analysis = data.choices?.[0]?.message?.content;

        console.log('✅ Cerebras face analysis completed');

        return NextResponse.json({
            success: true,
            analysis,
            faceData: analysis ? JSON.parse(analysis) : null
        });

    } catch (error) {
        console.error('❌ Cerebras face processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to process face', details: errorMessage },
            { status: 500 }
        );
    }
}