import { useState, useCallback, useRef } from 'react';
import { InterviewEvent } from './useInterviewState';

export function useTextToSpeech(dispatch, voiceGenerationRef) {
    // ElevenLabs is always "supported" since it's server-side
    const [voiceSupported] = useState(true);

    // Store active Audio element to allow cancelling
    const activeAudioRef = useRef(null);
    // Store the current blob URL so we can revoke it on cleanup
    const activeBlobUrlRef = useRef(null);

    const cleanupAudio = useCallback(() => {
        if (activeAudioRef.current) {
            activeAudioRef.current.pause();
            activeAudioRef.current.onended = null;
            activeAudioRef.current.onerror = null;
            activeAudioRef.current.onplay = null;
            activeAudioRef.current = null;
        }
        if (activeBlobUrlRef.current) {
            URL.revokeObjectURL(activeBlobUrlRef.current);
            activeBlobUrlRef.current = null;
        }
    }, []);

    const stopSpeech = useCallback(() => {
        cleanupAudio();
    }, [cleanupAudio]);

    const speakText = useCallback(async (text, questionId, currentQuestionIdRef, onEndCallback = null) => {
        if (!text) return;

        // Cancel any ongoing speech
        stopSpeech();

        // Capture current generation guard
        const expectedGeneration = voiceGenerationRef.current;

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            // Guard: Check if cancelled while waiting for the API response
            if (expectedGeneration !== voiceGenerationRef.current || 
                (questionId !== null && questionId !== currentQuestionIdRef.current)) {
                return;
            }

            if (!response.ok) {
                console.error('TTS API error:', response.status);
                dispatch(InterviewEvent.TTS_ERROR);
                return;
            }

            const audioBlob = await response.blob();

            // Guard again after blob conversion
            if (expectedGeneration !== voiceGenerationRef.current || 
                (questionId !== null && questionId !== currentQuestionIdRef.current)) {
                return;
            }

            const blobUrl = URL.createObjectURL(audioBlob);
            activeBlobUrlRef.current = blobUrl;

            const audio = new Audio(blobUrl);
            activeAudioRef.current = audio;

            audio.onplay = () => {
                // Guard: If cancelled or generation changed before playing, abort
                if (expectedGeneration !== voiceGenerationRef.current || 
                    (questionId !== null && questionId !== currentQuestionIdRef.current)) {
                    stopSpeech();
                    return;
                }
                if (!onEndCallback) {
                    dispatch(InterviewEvent.TTS_STARTED);
                }
            };

            audio.onended = () => {
                // Guard: Stale callback protection
                if (expectedGeneration !== voiceGenerationRef.current || 
                    (questionId !== null && questionId !== currentQuestionIdRef.current)) {
                    cleanupAudio();
                    return;
                }
                cleanupAudio();
                if (onEndCallback) {
                    onEndCallback();
                } else {
                    dispatch(InterviewEvent.TTS_FINISHED);
                }
            };

            audio.onerror = (e) => {
                console.error('Audio playback error:', e);
                cleanupAudio();
                if (expectedGeneration === voiceGenerationRef.current && 
                    (questionId === null || questionId === currentQuestionIdRef.current)) {
                    dispatch(InterviewEvent.TTS_ERROR);
                }
            };

            await audio.play();

        } catch (error) {
            console.error('TTS fetch error:', error);
            // Guard check before dispatching error
            if (expectedGeneration === voiceGenerationRef.current && 
                (questionId === null || questionId === currentQuestionIdRef.current)) {
                dispatch(InterviewEvent.TTS_ERROR);
            }
        }
    }, [dispatch, stopSpeech, cleanupAudio, voiceGenerationRef]);

    return {
        speakText,
        stopSpeech,
        voiceSupported
    };
}
