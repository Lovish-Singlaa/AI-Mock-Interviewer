import { NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(request) {
    try {
        if (!ELEVENLABS_API_KEY) {
            return NextResponse.json(
                { error: 'ElevenLabs API key not configured' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const audioFile = formData.get('audio');

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Forward to ElevenLabs Speech-to-Text API
        const elevenLabsForm = new FormData();
        elevenLabsForm.append('file', audioFile, 'recording.webm');
        elevenLabsForm.append('model_id', 'scribe_v1');

        const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: elevenLabsForm,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('ElevenLabs STT error:', response.status, errorBody);
            return NextResponse.json(
                { error: `STT API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ text: data.text || '' });
    } catch (error) {
        console.error('STT route error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
