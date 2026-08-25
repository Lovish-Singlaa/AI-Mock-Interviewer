import { useState, useCallback, useEffect, useRef } from 'react';
import { InterviewEvent } from './useInterviewState';

export function useTextToSpeech(dispatch, voiceGenerationRef) {
    const [voiceSupported, setVoiceSupported] = useState(true);
    const [voices, setVoices] = useState([]);
    
    // Store active utterance to allow cancelling
    const activeUtteranceRef = useRef(null);

    // Initialize voices
    useEffect(() => {
        if (!("speechSynthesis" in window)) {
            setVoiceSupported(false);
            return;
        }

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        loadVoices();
        
        // Handle voices being loaded asynchronously
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const stopSpeech = useCallback(() => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            activeUtteranceRef.current = null;
        }
    }, []);

    const speakText = useCallback((text, questionId, currentQuestionIdRef, onEndCallback = null) => {
        if (!voiceSupported || !text) return;

        // Cancel any ongoing speech
        stopSpeech();

        // Capture current generation guard
        const expectedGeneration = voiceGenerationRef.current;

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Select an English voice, preferably Google US English or similar
        if (voices.length > 0) {
            const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) 
                                || voices.find(v => v.lang.startsWith("en"));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
        }
        
        // Slow down slightly for clarity
        utterance.rate = 0.95;

        utterance.onstart = () => {
            // Guard: If cancelled or generation changed or question changed before starting, abort
            if (expectedGeneration !== voiceGenerationRef.current || (questionId !== null && questionId !== currentQuestionIdRef.current)) {
                stopSpeech();
                return;
            }
            if (!onEndCallback) {
                dispatch(InterviewEvent.TTS_STARTED);
            }
        };

        utterance.onend = () => {
            // Guard: Stale callback protection
            if (expectedGeneration !== voiceGenerationRef.current || (questionId !== null && questionId !== currentQuestionIdRef.current)) {
                return;
            }
            activeUtteranceRef.current = null;
            if (onEndCallback) {
                onEndCallback();
            } else {
                dispatch(InterviewEvent.TTS_FINISHED);
            }
        };

        utterance.onerror = (e) => {
            console.error("SpeechSynthesis error:", e);
            // Ignore interruption errors which happen naturally on cancel()
            if (e.error !== "interrupted" && e.error !== "canceled") {
                // Guard check
                if (expectedGeneration === voiceGenerationRef.current && (questionId === null || questionId === currentQuestionIdRef.current)) {
                    dispatch(InterviewEvent.TTS_ERROR);
                }
            }
        };

        activeUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        
    }, [voices, voiceSupported, dispatch, stopSpeech, voiceGenerationRef]);

    return {
        speakText,
        stopSpeech,
        voiceSupported
    };
}
