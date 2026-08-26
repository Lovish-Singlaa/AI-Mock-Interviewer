import { useState, useCallback, useRef } from 'react';
import { InterviewEvent } from './useInterviewState';

export function useSpeechRecognition(dispatch, voiceGenerationRef) {
    // ElevenLabs STT is server-side, so always "supported"
    const [sttSupported] = useState(true);
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    // Start recording audio from the microphone
    const startListening = useCallback(async (questionId, currentQuestionIdRef) => {
        // Stale generation guard
        if (voiceGenerationRef.current !== voiceGenerationRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm'
            });
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(250); // Collect chunks every 250ms
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setPermissionDenied(false);
            dispatch(InterviewEvent.STT_STARTED);
        } catch (err) {
            console.error('Failed to start MediaRecorder:', err);
            setPermissionDenied(true);
            dispatch(InterviewEvent.STT_ERROR);
        }
    }, [dispatch, voiceGenerationRef]);

    // Stop recording without transcribing (cleanup, mode toggle, etc.)
    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        mediaRecorderRef.current = null;
        setIsRecording(false);
    }, []);

    // Stop recording AND transcribe the audio via ElevenLabs STT
    // Returns a promise that resolves to the full accumulated transcript
    const stopAndTranscribe = useCallback(async () => {
        return new Promise((resolve) => {
            const doTranscribe = async () => {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(t => t.stop());
                    streamRef.current = null;
                }
                setIsRecording(false);

                if (audioChunksRef.current.length === 0) {
                    resolve(transcript); // Return existing transcript if no new audio
                    return;
                }

                setIsTranscribing(true);

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    audioChunksRef.current = [];

                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');

                    const response = await fetch('/api/stt', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        console.error('STT API error:', response.status);
                        setIsTranscribing(false);
                        dispatch(InterviewEvent.STT_ERROR);
                        resolve(transcript);
                        return;
                    }

                    const data = await response.json();
                    const newText = data.text || '';
                    const accumulated = (transcript + ' ' + newText).trim();
                    setTranscript(accumulated);
                    setIsTranscribing(false);
                    resolve(accumulated);
                } catch (err) {
                    console.error('STT transcription error:', err);
                    setIsTranscribing(false);
                    dispatch(InterviewEvent.STT_ERROR);
                    resolve(transcript);
                }
            };

            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.onstop = doTranscribe;
                mediaRecorderRef.current.stop();
            } else {
                doTranscribe();
            }
        });
    }, [transcript, dispatch]);

    // Pause/resume stubs (pause button was removed from UI, kept for compatibility)
    const pauseListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
        }
        setIsRecording(false);
        dispatch(InterviewEvent.PAUSE);
    }, [dispatch]);

    const resumeListening = useCallback((questionId, currentQuestionIdRef) => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsRecording(true);
            dispatch(InterviewEvent.RESUME);
        }
    }, [dispatch]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        audioChunksRef.current = [];
    }, []);

    // Explicitly ask for mic permissions
    const requestMicPermission = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setPermissionDenied(false);
            return true;
        } catch (err) {
            console.error('Mic permission denied:', err);
            setPermissionDenied(true);
            return false;
        }
    }, []);

    return {
        isRecording,
        isTranscribing,
        transcript,
        interimTranscript: '', // No longer applicable with server-side STT
        fullTranscript: transcript,
        startListening,
        stopListening,
        stopAndTranscribe,
        pauseListening,
        resumeListening,
        resetTranscript,
        sttSupported,
        permissionDenied,
        requestMicPermission
    };
}
