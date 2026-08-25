import { useState, useCallback, useEffect, useRef } from 'react';
import { InterviewEvent } from './useInterviewState';

export function useSpeechRecognition(dispatch, voiceGenerationRef) {
    const [sttSupported, setSttSupported] = useState(true);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);

    const recognitionRef = useRef(null);
    const finalTranscriptRef = useRef(''); // Local mutable reference to prevent duplication

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSttSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
            setPermissionDenied(false);
        };

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                finalTranscriptRef.current += ' ' + final;
                setTranscript(finalTranscriptRef.current.trim());
            }
            setInterimTranscript(interim.trim());
        };

        recognition.onerror = (event) => {
            console.error("SpeechRecognition error", event.error);
            if (event.error === 'not-allowed') {
                setPermissionDenied(true);
            }
            // If it's a no-speech error, we just ignore it in continuous mode or restart.
            // But we let the state machine handle errors if needed.
            setIsRecording(false);
            dispatch(InterviewEvent.STT_ERROR);
        };

        recognition.onend = () => {
            setIsRecording(false);
            setInterimTranscript(''); // Clear interim
            dispatch(InterviewEvent.STT_STOPPED);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [dispatch]);

    const startListening = useCallback((questionId, currentQuestionIdRef) => {
        if (!sttSupported || !recognitionRef.current) return;
        
        // Stale generation guard
        const expectedGeneration = voiceGenerationRef.current;
        if (expectedGeneration !== voiceGenerationRef.current || (questionId !== null && questionId !== currentQuestionIdRef.current)) {
            return;
        }

        try {
            recognitionRef.current.start();
            dispatch(InterviewEvent.STT_STARTED);
        } catch (error) {
            console.error("Failed to start SpeechRecognition", error);
            // Ignore if it's already started (DOMException)
        }
    }, [sttSupported, dispatch, voiceGenerationRef]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setInterimTranscript('');
    }, []);
    
    const pauseListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setInterimTranscript('');
        dispatch(InterviewEvent.PAUSE);
    }, [dispatch]);

    const resumeListening = useCallback((questionId, currentQuestionIdRef) => {
        if (!sttSupported || !recognitionRef.current) return;
        try {
            recognitionRef.current.start();
            dispatch(InterviewEvent.RESUME);
        } catch (error) {
            console.error("Failed to resume SpeechRecognition", error);
        }
    }, [sttSupported, dispatch]);

    const resetTranscript = useCallback(() => {
        finalTranscriptRef.current = '';
        setTranscript('');
        setInterimTranscript('');
    }, []);

    // Explicitly ask for mic permissions
    const requestMicPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the stream tracks immediately, we just needed permission
            stream.getTracks().forEach(track => track.stop());
            setPermissionDenied(false);
            return true;
        } catch (err) {
            console.error("Mic permission denied", err);
            setPermissionDenied(true);
            return false;
        }
    };

    return {
        isRecording,
        transcript,
        interimTranscript,
        fullTranscript: (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim(),
        startListening,
        stopListening,
        pauseListening,
        resumeListening,
        resetTranscript,
        sttSupported,
        permissionDenied,
        requestMicPermission
    };
}
