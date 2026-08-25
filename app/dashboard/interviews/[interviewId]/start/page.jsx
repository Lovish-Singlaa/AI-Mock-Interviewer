"use client"
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LightbulbIcon, MicIcon, Volume2Icon, WebcamIcon, Square, ArrowRight, CheckCircle, LoaderCircle, BrainCircuit, ChevronLeft, ChevronRight, Flag, PauseIcon, PlayIcon, ToggleLeft, ToggleRight, MicOffIcon, AlertTriangleIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { useInterviewState, InterviewState, InterviewEvent } from '@/hooks/useInterviewState';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const BRAND = { violet: '#6C3FFE', pink: '#FF5E7D', cyan: '#00D4FF', green: '#00C47A', amber: '#FFAA00' }

const ACKNOWLEDGEMENTS = [
    "Got it. Let's move to the next question.",
    "Thanks for your answer. Let's continue.",
    "Understood. Here's the next question.",
    "Okay, moving on."
];

export default function InterviewSession() {
    const { interviewId } = useParams();
    const router = useRouter();

    // 1. Core State
    const [interview, setInterview] = useState(null);
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [WebCamEnabled, setWebCamEnabled] = useState(true);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
    
    // Voice Mode State
    const [isConversationalMode, setIsConversationalMode] = useState(true);

    // Refs for guards
    const currentQuestionIdRef = useRef(0);
    const voiceGenerationRef = useRef(0);
    const hasStartedRef = useRef(false);

    // 2. State Machine Hooks
    const { state, dispatch, getState } = useInterviewState();
    
    // TTS
    const { speakText, stopSpeech, voiceSupported } = useTextToSpeech(dispatch, voiceGenerationRef);
    
    // STT
    const { 
        isRecording, 
        transcript, 
        interimTranscript, 
        fullTranscript, 
        startListening, 
        stopListening, 
        pauseListening, 
        resumeListening, 
        resetTranscript, 
        sttSupported,
        permissionDenied,
        requestMicPermission
    } = useSpeechRecognition(dispatch, voiceGenerationRef);

    // Track active question ref
    useEffect(() => {
        currentQuestionIdRef.current = activeQuestion;
    }, [activeQuestion]);

    // 3. Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/find-interview-by-id', { params: { id: interviewId } });
                setInterview(response.data);
                
                // Disable conversational mode automatically if voice is NOT supported
                if (!window.speechSynthesis || (!window.SpeechRecognition && !window.webkitSpeechRecognition)) {
                    setIsConversationalMode(false);
                } else {
                    hasStartedRef.current = true;
                    dispatch(InterviewEvent.START_INTERVIEW);
                }
            } catch (error) {
                console.error('Error fetching interview:', error);
                toast.error("Failed to load interview");
            }
        }
        fetchData();
        
        // Cleanup on unmount
        return () => {
            voiceGenerationRef.current++;
            stopSpeech();
            stopListening();
        };
    }, [interviewId, stopSpeech, stopListening]);

    const totalQ = interview?.questions?.length || 0;
    const progress = totalQ > 0 ? (answeredQuestions.size / totalQ) * 100 : 0;

    // 4. Mode Toggle Handler
    const handleToggleMode = (checked) => {
        if (checked && (!voiceSupported || !sttSupported)) {
            toast.error("Voice interaction isn't supported in this browser. You can continue using text mode.");
            return;
        }
        
        setIsConversationalMode(checked);
        
        if (!checked) {
            // Turning OFF: Increment generation to invalidate pending voice callbacks
            voiceGenerationRef.current++;
            
            // Stop active operations cleanly based on current state
            const currentState = getState();
            if (currentState === InterviewState.SPEAKING || currentState === InterviewState.TRANSITIONING) {
                stopSpeech();
                dispatch(InterviewEvent.TTS_FINISHED);
            } else if (currentState === InterviewState.LISTENING || currentState === InterviewState.PAUSED) {
                stopListening(); // Preserve transcript
                dispatch(InterviewEvent.STT_STOPPED);
            }
        }
    };

    // 6. Next Question Advancement (Single Authoritative Source)
    const advanceToNextQuestion = useCallback(() => {
        const currentQ = currentQuestionIdRef.current;
        if (currentQ < totalQ - 1) {
            setActiveQuestion(currentQ + 1);
            resetTranscript();
            if (getState() === InterviewState.TRANSITIONING) {
                dispatch(InterviewEvent.NEXT_QUESTION);
            } else {
                dispatch(InterviewEvent.QUESTION_READY); 
            }
        } else {
            dispatch(InterviewEvent.INTERVIEW_COMPLETE);
        }
    }, [totalQ, resetTranscript, dispatch, getState]);

    // 5. Conversational Loop Orchestration (Side-effects driven by State Machine)
    useEffect(() => {
        if (!isConversationalMode || !interview?.questions) return;
        
        const qId = currentQuestionIdRef.current;
        
        switch (state) {
            case InterviewState.PREPARING:
                // Small delay for natural pacing before speaking
                const prepTimer = setTimeout(() => {
                    const questionText = interview.questions[qId]?.question;
                    if (questionText && getState() === InterviewState.PREPARING) {
                        speakText(questionText, qId, currentQuestionIdRef, false);
                    }
                }, 500);
                return () => clearTimeout(prepTimer);
                
            case InterviewState.IDLE:
                // If we just finished speaking (transitioned from SPEAKING -> IDLE), auto-start mic
                // But only if we are still on the same question and hasn't answered
                if (hasStartedRef.current && !answeredQuestions.has(qId)) {
                    const idleTimer = setTimeout(async () => {
                        if (getState() === InterviewState.IDLE) {
                            if (!permissionDenied) {
                                const hasMic = await requestMicPermission();
                                if (hasMic && getState() === InterviewState.IDLE) {
                                    startListening(qId, currentQuestionIdRef);
                                }
                            }
                        }
                    }, 300);
                    return () => clearTimeout(idleTimer);
                }
                break;
                
            case InterviewState.TRANSITIONING:
                // Play acknowledgment
                if (qId < totalQ - 1) {
                    const ackText = ACKNOWLEDGEMENTS[Math.floor(Math.random() * ACKNOWLEDGEMENTS.length)];
                    speakText(ackText, qId, currentQuestionIdRef, () => {
                        advanceToNextQuestion();
                    });
                } else {
                    const finalAckText = "Great job! That was the last question. You can now submit the interview.";
                    speakText(finalAckText, qId, currentQuestionIdRef, () => {
                        dispatch(InterviewEvent.INTERVIEW_COMPLETE);
                    });
                }
                break;
                
            case InterviewState.COMPLETED:
                break;
        }
    }, [state, isConversationalMode, interview, speakText, startListening, permissionDenied, requestMicPermission, answeredQuestions, getState, totalQ, advanceToNextQuestion, dispatch]);



    // Listen for NEXT_QUESTION to trigger advancement in conversational mode
    useEffect(() => {
        if (state === InterviewState.PREPARING && getState() === InterviewState.PREPARING && isConversationalMode) {
           // We just advanced, loop handles PREPARING -> SPEAKING
        }
    }, [state, isConversationalMode, getState]);

    // Manual navigation overrides
    const handleManualNext = () => {
        if (activeQuestion < totalQ - 1) {
            voiceGenerationRef.current++;
            stopSpeech();
            stopListening();
            resetTranscript();
            setActiveQuestion(q => q + 1);
            dispatch(InterviewEvent.QUESTION_READY);
        }
    };
    
    const handleManualPrev = () => {
        if (activeQuestion > 0) {
            voiceGenerationRef.current++;
            stopSpeech();
            stopListening();
            resetTranscript();
            setActiveQuestion(q => q - 1);
            dispatch(InterviewEvent.QUESTION_READY);
        }
    };

    const handleManualQuestionSelect = (index) => {
        if (activeQuestion !== index) {
            voiceGenerationRef.current++;
            stopSpeech();
            stopListening();
            resetTranscript();
            setActiveQuestion(index);
            dispatch(InterviewEvent.QUESTION_READY);
        }
    };

    const handleConfirmEndInterview = () => {
        voiceGenerationRef.current++;
        stopSpeech();
        stopListening();
        setShowConfirmDialog(false);
        router.push(`/dashboard/interviews/${interviewId}/feedback`);
    };

    // 7. Manual Start / Stop Answer
    const handleStartRecording = async () => {
        if (!sttSupported) {
            toast.error("Speech recognition is not supported in this browser.");
            return;
        }
        
        hasStartedRef.current = true;
        
        // Stop any ongoing AI speech
        voiceGenerationRef.current++;
        stopSpeech();
        if (getState() === InterviewState.SPEAKING) {
            dispatch(InterviewEvent.TTS_FINISHED);
        }
        
        const hasMic = await requestMicPermission();
        if (hasMic) {
            startListening(currentQuestionIdRef.current, currentQuestionIdRef);
        }
    };

    const saveUserAnswer = async () => {
        // Prevent empty submissions
        if (fullTranscript.length < 10) {
            toast.error('Please provide a longer answer (at least 10 characters)');
            if (isConversationalMode) {
                resumeListening(currentQuestionIdRef.current, currentQuestionIdRef);
            }
            return;
        }

        // Transition to EVALUATING (disables duplicate submits)
        dispatch(InterviewEvent.STOP_ANSWER);
        stopListening();
        
        try {
            const response = await axios.put('/api/save-user-answer', {
                interviewId, 
                userResponse: fullTranscript, 
                questionIndex: activeQuestion,
                inputMode: 'voice' // Explicitly tracking this was a voice answer
            });
            
            if (response.data.success) {
                toast.success("Answer saved! ✅");
                setAnsweredQuestions(prev => new Set([...prev, activeQuestion]));
                
                dispatch(InterviewEvent.EVALUATION_SUCCESS);
                
                // If not conversational mode, we must manually advance or let user click Next
                if (!isConversationalMode) {
                    if (activeQuestion < totalQ - 1) {
                        advanceToNextQuestion();
                    } else {
                        dispatch(InterviewEvent.INTERVIEW_COMPLETE);
                    }
                }
            } else {
                toast.error(response.data.message || "Failed to save answer");
                dispatch(InterviewEvent.EVALUATION_ERROR); // Fallback to IDLE
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error saving answer");
            dispatch(InterviewEvent.EVALUATION_ERROR); // Fallback to IDLE
        }
    };

    // 8. Start the interview
    const handleStartInterview = () => {
        hasStartedRef.current = true;
        dispatch(InterviewEvent.START_INTERVIEW); // Starts the state machine PREPARING -> SPEAKING
    };

    // Helpers to render UI state
    const getStatusIndicator = () => {
        switch (state) {
            case InterviewState.PREPARING: return <><LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" /> <span className="text-muted-foreground">Preparing...</span></>;
            case InterviewState.SPEAKING: return <><Volume2Icon className="h-4 w-4 text-violet-600 animate-pulse" /> <span className="text-violet-600 font-bold">AI is speaking...</span></>;
            case InterviewState.LISTENING: return <><MicIcon className="h-4 w-4 text-pink-500 animate-pulse" /> <span className="text-pink-500 font-bold">Listening...</span></>;
            case InterviewState.PAUSED: return <><PauseIcon className="h-4 w-4 text-amber-500" /> <span className="text-amber-500 font-bold">Paused</span></>;
            case InterviewState.EVALUATING: return <><BrainCircuit className="h-4 w-4 text-cyan-500 animate-pulse" /> <span className="text-cyan-500 font-bold">Evaluating your answer...</span></>;
            case InterviewState.TRANSITIONING: return <><Sparkles className="h-4 w-4 text-green-500 animate-pulse" /> <span className="text-green-500 font-bold">Preparing next question...</span></>;
            case InterviewState.COMPLETED: return <><CheckCircle className="h-4 w-4 text-green-600" /> <span className="text-green-600 font-bold">Interview completed</span></>;
            case InterviewState.ERROR: return <><AlertTriangleIcon className="h-4 w-4 text-red-500" /> <span className="text-red-500 font-bold">Voice interaction unavailable</span></>;
            default: return <><div className="w-2 h-2 rounded-full bg-gray-300" /> <span className="text-gray-500 font-medium">Ready</span></>;
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-6" style={{ background: '#F4F4FF' }}>

            {/* ── HEADER ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6"
            >
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-3xl"
                    >🎙️</motion.div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-primary">Interview Session</h1>
                        <p className="text-sm text-muted-foreground">
                            {interview?.jobRole} · {interview?.category || 'General'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                    
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm">
                        {getStatusIndicator()}
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                        <Label htmlFor="conversational-mode" className="text-sm font-bold text-gray-700 cursor-pointer">
                            Conversational Mode
                        </Label>
                        <Switch 
                            id="conversational-mode" 
                            checked={isConversationalMode}
                            onCheckedChange={handleToggleMode}
                            disabled={!voiceSupported || !sttSupported}
                            className="data-[state=checked]:bg-violet-600"
                        />
                    </div>

                    {/* Progress pill */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                        style={{ background: '#EEE5FF', color: BRAND.violet }}>
                        <CheckCircle className="h-4 w-4" />
                        {answeredQuestions.size}/{totalQ} done
                    </div>

                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                        <Button
                            onClick={() => setShowConfirmDialog(true)}
                            className="font-bold rounded-xl text-white btn-modern"
                            style={{ background: BRAND.green }}
                        >
                            <Flag className="mr-2 h-4 w-4" /> End Interview
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── PERMISSION WARNING ── */}
            <AnimatePresence>
                {permissionDenied && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl"
                    >
                        <div className="flex items-center gap-2">
                            <MicOffIcon className="h-5 w-5 text-red-500" />
                            <p className="text-sm font-semibold text-red-700">
                                Microphone permission denied. Conversational mode requires microphone access. You can continue using text mode, or allow access and try again.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── PROGRESS BAR ── */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="h-2 rounded-full mb-6 overflow-hidden"
                style={{ background: '#E5E6F3', transformOrigin: 'left' }}
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: BRAND.violet }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* ── LEFT: QUESTIONS ── */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full lg:w-[58%] rounded-3xl p-6 shadow-lg relative overflow-hidden"
                    style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}
                >
                    {/* Ambient State Glow */}
                    <div className="absolute top-0 left-0 w-full h-1" 
                        style={{ 
                            background: state === InterviewState.SPEAKING ? BRAND.violet 
                                    : state === InterviewState.LISTENING ? BRAND.pink 
                                    : state === InterviewState.EVALUATING ? BRAND.cyan 
                                    : 'transparent',
                            opacity: 0.5
                        }} 
                    />

                    {/* Question bubbles */}
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Questions</p>
                        <div className="flex flex-wrap gap-2">
                            {interview?.questions?.map((_, index) => {
                                const isAnswered = answeredQuestions.has(index)
                                const isActive = activeQuestion === index
                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.94 }}
                                        onClick={() => handleManualQuestionSelect(index)}
                                        disabled={state === InterviewState.EVALUATING || state === InterviewState.TRANSITIONING || index > answeredQuestions.size}
                                        className="relative w-10 h-10 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                                        style={{
                                            background: isActive ? BRAND.violet : isAnswered ? '#00C47A' : '#F4F4FF',
                                            color: isActive || isAnswered ? '#fff' : '#6B7280',
                                            border: isActive ? 'none' : isAnswered ? 'none' : '1.5px solid #E5E6F3',
                                            boxShadow: isActive ? `0 4px 14px ${BRAND.violet}50` : 'none'
                                        }}
                                    >
                                        {isAnswered && !isActive
                                            ? <CheckCircle className="h-4 w-4 mx-auto" />
                                            : <span>{index + 1}</span>
                                        }
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="h-px mb-5" style={{ background: '#E5E6F3' }} />

                    {/* Active Question */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeQuestion}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white text-sm shadow-sm"
                                    style={{ background: BRAND.violet }}>
                                    {activeQuestion + 1}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.violet }}>
                                    Question {activeQuestion + 1} of {totalQ}
                                </span>
                            </div>
                            
                            <div className="rounded-2xl p-5 mb-5 relative overflow-hidden"
                                style={{ background: '#EEE5FF', border: '1.5px solid #6C3FFE20' }}>
                                <div className="flex items-start justify-between gap-3 relative z-10">
                                    <p className="text-base font-semibold leading-relaxed flex-1 text-gray-800">
                                        {interview?.questions[activeQuestion]?.question}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            if (!hasStartedRef.current) handleStartInterview();
                                            else speakText(interview?.questions[activeQuestion]?.question, currentQuestionIdRef.current, currentQuestionIdRef, null);
                                        }}
                                        disabled={state === InterviewState.SPEAKING || state === InterviewState.TRANSITIONING}
                                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
                                        style={{ background: state === InterviewState.SPEAKING ? '#9CA3AF' : BRAND.violet }}
                                        title="Read aloud"
                                    >
                                        {state === InterviewState.SPEAKING ? <Volume2Icon className="h-4 w-4 text-white animate-pulse" /> : <Volume2Icon className="h-4 w-4 text-white" />}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="rounded-2xl p-4 flex gap-3 items-start shadow-sm"
                                style={{ background: '#FFFBEB', border: '1.5px solid #FFAA0030' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: '#FFAA0020' }}>
                                    <LightbulbIcon className="h-4 w-4" style={{ color: BRAND.amber }} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold mb-1" style={{ color: BRAND.amber }}>Pro Tip</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Use the STAR method — Situation, Task, Action, Result. Take your time to think; the microphone will not cut you off.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Nav arrows */}
                    <div className="flex items-center justify-between mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={activeQuestion === 0 || state === InterviewState.EVALUATING || state === InterviewState.TRANSITIONING}
                            onClick={handleManualPrev}
                            className="rounded-xl font-bold border-2"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>

                        {!hasStartedRef.current ? (
                             <Button
                                size="sm"
                                onClick={handleStartInterview}
                                className="rounded-xl font-bold shadow-md"
                                style={{ background: BRAND.violet }}
                            >
                                <PlayIcon className="h-4 w-4 mr-1" /> Start Session
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={activeQuestion === totalQ - 1 || state === InterviewState.EVALUATING || state === InterviewState.TRANSITIONING || !answeredQuestions.has(activeQuestion)}
                                onClick={handleManualNext}
                                className="rounded-xl font-bold border-2"
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* ── RIGHT: WEBCAM + MIC ── */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full lg:w-[42%] flex flex-col gap-4"
                >
                    {/* Webcam card */}
                    <div className="rounded-3xl overflow-hidden shadow-lg relative"
                        style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}>
                        <div className="h-1 w-full absolute top-0 left-0 z-10 transition-colors duration-300" 
                             style={{ background: state === InterviewState.LISTENING ? BRAND.pink : state === InterviewState.SPEAKING ? BRAND.violet : '#E5E6F3' }} 
                        />
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-3 mt-1">
                                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
                                    Video Feed
                                </p>
                                {state === InterviewState.LISTENING && (
                                    <motion.div
                                        animate={{ opacity: [1, 0.4, 1] }}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                                        style={{ background: BRAND.pink }}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        REC
                                    </motion.div>
                                )}
                            </div>
                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100"
                                style={{ border: state === InterviewState.LISTENING ? `2px solid ${BRAND.pink}` : '2px solid #E5E6F3' }}>
                                {WebCamEnabled ? (
                                    <Webcam
                                        onUserMedia={() => setWebCamEnabled(true)}
                                        onUserMediaError={() => setWebCamEnabled(false)}
                                        className="w-full h-full object-cover"
                                        mirrored={true}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                        <WebcamIcon className="w-12 h-12 text-gray-300" />
                                        <p className="text-xs text-gray-400 font-medium">Camera unavailable</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Transcript card */}
                    <AnimatePresence>
                        {(state === InterviewState.LISTENING || state === InterviewState.PAUSED || fullTranscript) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                                className="rounded-3xl p-5 shadow-lg"
                                style={{ 
                                    background: state === InterviewState.LISTENING ? '#FFF0F3' : '#F0FFF7', 
                                    border: `1.5px solid ${state === InterviewState.LISTENING ? BRAND.pink + '40' : BRAND.green + '40'}` 
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-sm font-bold"
                                        style={{ color: state === InterviewState.LISTENING ? BRAND.pink : BRAND.green }}>
                                        {state === InterviewState.LISTENING ? (
                                            <>
                                                <motion.span
                                                    animate={{ scale: [1, 1.4, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ background: BRAND.pink, display: 'inline-block' }}
                                                />
                                                Listening...
                                            </>
                                        ) : state === InterviewState.PAUSED ? (
                                            <><PauseIcon className="h-4 w-4" /> Paused</>
                                        ) : <><CheckCircle className="h-4 w-4" /> Your Response</>}
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: state === InterviewState.LISTENING ? '#FECDD3' : '#D1FAE5',
                                            color: state === InterviewState.LISTENING ? BRAND.pink : BRAND.green
                                        }}>
                                        {fullTranscript.length} chars
                                    </span>
                                </div>
                                <div className="text-sm leading-relaxed text-gray-700 min-h-[60px] max-h-[200px] overflow-y-auto">
                                    {fullTranscript || "Start speaking…"}
                                    {state === InterviewState.LISTENING && interimTranscript && (
                                        <span className="text-gray-400 italic"> {interimTranscript}</span>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="rounded-3xl p-5 shadow-lg"
                        style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}>
                        
                        <div className="flex gap-2 mb-3">
                            {/* Record Button */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleStartRecording}
                                disabled={state === InterviewState.LISTENING || state === InterviewState.EVALUATING || state === InterviewState.TRANSITIONING || state === InterviewState.COMPLETED}
                                className="flex-1 h-14 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
                                style={{ background: state === InterviewState.LISTENING ? BRAND.pink : BRAND.violet }}
                            >
                                <MicIcon className="h-5 w-5" /> {state === InterviewState.LISTENING ? "Recording..." : fullTranscript ? "Record More" : "Start Recording"}
                            </motion.button>

                            {/* Stop & Save Button */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={saveUserAnswer}
                                disabled={state === InterviewState.EVALUATING || state === InterviewState.TRANSITIONING || state === InterviewState.COMPLETED || fullTranscript.length === 0}
                                className="flex-1 h-14 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
                                style={{
                                    background: state === InterviewState.EVALUATING ? '#9CA3AF' : (state === InterviewState.LISTENING || state === InterviewState.PAUSED) ? BRAND.pink : BRAND.green
                                }}
                            >
                                {state === InterviewState.EVALUATING ? (
                                    <><LoaderCircle className="h-5 w-5 animate-spin" /> Saving…</>
                                ) : (
                                    <><Square className="h-5 w-5" /> Stop & Save</>
                                )}
                            </motion.button>
                        </div>

                        {/* AI note */}
                        <div className="flex items-center gap-2 justify-center">
                            <BrainCircuit className="h-4 w-4 shrink-0" style={{ color: BRAND.cyan }} />
                            <p className="text-xs text-muted-foreground">
                                {isConversationalMode 
                                    ? "AI will acknowledge your answer and advance automatically." 
                                    : "AI evaluates your answer securely in the cloud."}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── CONFIRM DIALOG ── */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="rounded-3xl overflow-hidden p-0" style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}>
                    <div className="h-1.5 w-full" style={{ background: BRAND.green }} />
                    <div className="p-8">
                        <DialogHeader className="mb-4">
                            <div className="text-5xl mb-3 text-center">🏁</div>
                            <DialogTitle className="text-xl font-extrabold text-center text-primary">End Interview?</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground text-center text-sm mb-5">
                            You've answered <strong>{answeredQuestions.size}</strong> of <strong>{totalQ}</strong> questions.
                            You'll be taken to your personalized feedback report.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 rounded-xl font-bold border-2"
                            >
                                Keep Going
                            </Button>
                            <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Button
                                    onClick={handleConfirmEndInterview}
                                    className="w-full btn-modern text-white font-bold rounded-xl"
                                    style={{ background: BRAND.green }}
                                >
                                    <ArrowRight className="mr-2 h-4 w-4" /> View Results
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
