import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration, type } = await request.json();
    
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    console.log(`🎵 Generating ${type} audio: "${prompt.substring(0, 100)}..."`);

    // Generate music using ElevenLabs Music API
    const response = await fetch('https://api.elevenlabs.io/v1/music/compose', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        music_length_ms: duration,
        // Optimize for medical/ambient audio
        composition_plan: {
          positiveGlobalStyles: [
            'ambient',
            'medical',
            'subtle',
            'professional',
            'calming',
            'hospital atmosphere',
            'instrumental'
          ],
          negativeGlobalStyles: [
            'loud',
            'aggressive',
            'distorted',
            'rock',
            'pop',
            'vocals',
            'lyrics',
            'singing'
          ]
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API error:', errorData);
      
      // Check for copyrighted material error and use suggestion
      if (errorData.detail?.status === 'bad_prompt' && errorData.detail?.data?.prompt_suggestion) {
        console.log('🔄 Using suggested prompt:', errorData.detail.data.prompt_suggestion);
        
        // Retry with suggested prompt
        const retryResponse = await fetch('https://api.elevenlabs.io/v1/music/compose', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: errorData.detail.data.prompt_suggestion,
            music_length_ms: duration,
          })
        });
        
        if (retryResponse.ok) {
          const audioBuffer = await retryResponse.arrayBuffer();
          console.log('✅ Generated audio with suggested prompt');
          return new NextResponse(audioBuffer, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
          });
        }
      }
      
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`✅ Generated ${type} audio: ${audioBuffer.byteLength} bytes`);
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('❌ Audio generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error.message },
      { status: 500 }
    );
  }
}
