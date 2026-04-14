"use client"
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam';
import useSpeechToText from 'react-hook-speech-to-text';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LightbulbIcon, MicIcon, Volume2Icon, WebcamIcon, Play, Square, Sparkles, ArrowRight, CheckCircle, LoaderCircle, BrainCircuit, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const BRAND = { violet: '#6C3FFE', pink: '#FF5E7D', cyan: '#00D4FF', green: '#00C47A', amber: '#FFAA00' }

const page = () => {
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults,
    } = useSpeechToText({ continuous: true, useLegacyResults: false });

    const { interviewId } = useParams();
    const [interview, setInterview] = useState(null);
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [WebCamEnabled, setWebCamEnabled] = useState(true);
    const [userAnswer, setUserAnswer] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [fullTranscript, setFullTranscript] = useState('');
    const router = useRouter();

    const handleConfirmEndInterview = () => {
        setShowConfirmDialog(false);
        router.push(`/dashboard/interviews/${interviewId}/feedback`);
    };

    const speakQues = (text) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterThis = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterThis);
        } else {
            alert('Your browser does not support text to speech!');
        }
    }

    const saveUserAnswer = async () => {
        if (isRecording) {
            const currentTranscript = results.map((r) => r?.transcript).join(" ");
            const interim = interimResult || "";
            const combinedTranscript = currentTranscript + (interim ? " " + interim : "");
            stopSpeechToText();

            setTimeout(async () => {
                const finalTranscript = results.map((r) => r?.transcript).join(" ");
                const finalInterim = interimResult || "";
                const allTranscripts = finalTranscript + (finalInterim ? " " + finalInterim : "");
                const bestTranscript = allTranscripts.length > combinedTranscript.length ? allTranscripts : combinedTranscript;
                const finalAnswer = (userAnswer + " " + bestTranscript).trim();

                if (finalAnswer.length < 10) {
                    toast.error('Please provide a longer answer (at least 10 characters)');
                    setIsSaving(false);
                    return;
                }
                setIsSaving(true);
                try {
                    const response = await axios.put('/api/save-user-answer', {
                        interviewId, userResponse: finalAnswer, questionIndex: activeQuestion
                    });
                    if (response.data.success) {
                        toast.success("Answer saved! ✅");
                        setAnsweredQuestions(prev => new Set([...prev, activeQuestion]));
                        setUserAnswer('');
                        setFullTranscript('');
                        if (typeof setResults === 'function') setResults([]);
                    } else {
                        toast.error(response.data.message || "Failed to save answer");
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || "Error saving answer");
                } finally {
                    setIsSaving(false);
                }
            }, 1000);
        } else {
            setFullTranscript('');
            setUserAnswer('');
            if (typeof setResults === 'function') setResults([]);
            try {
                startSpeechToText();
            } catch (error) {
                toast.error("Failed to start recording. Please check your microphone permissions.");
            }
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/find-interview-by-id', { params: { id: interviewId } });
                setInterview(response.data);
            } catch (error) {
                console.error('Error fetching interview:', error);
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (isRecording && results.length > 0) {
            const currentTranscript = results.map((r) => r?.transcript).join(" ");
            const interim = interimResult || "";
            setFullTranscript(currentTranscript + (interim ? " " + interim : ""));
        }
    }, [results, interimResult, isRecording])

    useEffect(() => {
        setUserAnswer('');
        setFullTranscript('');
        if (typeof setResults === 'function') setResults([]);
    }, [activeQuestion, setResults])

    useEffect(() => {
        if (error) toast.error("Speech-to-text error. Please try again.");
    }, [error]);

    const totalQ = interview?.questions?.length || 0
    const progress = totalQ > 0 ? (answeredQuestions.size / totalQ) * 100 : 0

    return (
        <div className="min-h-screen p-4 md:p-6" style={{ background: '#F4F4FF' }}>

            {/* ── HEADER ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
            >
                <div className="flex items-center gap-3">
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

                {/* Progress pill */}
                <div className="flex items-center gap-3">
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
                    className="w-full lg:w-[58%] rounded-3xl p-6 shadow-lg"
                    style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}
                >
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
                                        onClick={() => setActiveQuestion(index)}
                                        className="relative w-10 h-10 rounded-xl font-bold text-sm transition-all"
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
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white text-sm"
                                    style={{ background: BRAND.violet }}>
                                    {activeQuestion + 1}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.violet }}>
                                    Question {activeQuestion + 1} of {totalQ}
                                </span>
                            </div>
                            <div className="rounded-2xl p-5 mb-5 relative"
                                style={{ background: '#EEE5FF', border: '1.5px solid #6C3FFE20' }}>
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-base font-semibold leading-relaxed flex-1">
                                        {interview?.questions[activeQuestion]?.question}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => speakQues(interview?.questions[activeQuestion]?.question)}
                                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                                        style={{ background: BRAND.violet }}
                                        title="Read aloud"
                                    >
                                        <Volume2Icon className="h-4 w-4 text-white" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="rounded-2xl p-4 flex gap-3 items-start"
                                style={{ background: '#FFFBEB', border: '1.5px solid #FFAA0030' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: '#FFAA0020' }}>
                                    <LightbulbIcon className="h-4 w-4" style={{ color: BRAND.amber }} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold mb-1" style={{ color: BRAND.amber }}>Pro Tip</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Use the STAR method — Situation, Task, Action, Result. Click the speaker icon to hear the question read aloud.
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
                            disabled={activeQuestion === 0}
                            onClick={() => setActiveQuestion(q => q - 1)}
                            className="rounded-xl font-bold border-2"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={activeQuestion === totalQ - 1}
                            onClick={() => setActiveQuestion(q => q + 1)}
                            className="rounded-xl font-bold border-2"
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
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
                    <div className="rounded-3xl overflow-hidden shadow-lg"
                        style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}>
                        <div className="h-1 w-full" style={{ background: isRecording ? BRAND.pink : BRAND.violet }} />
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
                                    Video Feed
                                </p>
                                {isRecording && (
                                    <motion.div
                                        animate={{ opacity: [1, 0.4, 1] }}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                                        style={{ background: BRAND.pink }}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        REC
                                    </motion.div>
                                )}
                            </div>
                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100"
                                style={{ border: isRecording ? `2px solid ${BRAND.pink}` : '2px solid #E5E6F3' }}>
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
                        {(isRecording || fullTranscript || results.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                                className="rounded-3xl p-5 shadow-lg"
                                style={{ background: isRecording ? '#FFF0F3' : '#F0FFF7', border: `1.5px solid ${isRecording ? BRAND.pink + '40' : BRAND.green + '40'}` }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-sm font-bold"
                                        style={{ color: isRecording ? BRAND.pink : BRAND.green }}>
                                        {isRecording ? (
                                            <>
                                                <motion.span
                                                    animate={{ scale: [1, 1.4, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ background: BRAND.pink, display: 'inline-block' }}
                                                />
                                                Listening...
                                            </>
                                        ) : <><CheckCircle className="h-4 w-4" /> Your Response</>}
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: isRecording ? '#FECDD3' : '#D1FAE5',
                                            color: isRecording ? BRAND.pink : BRAND.green
                                        }}>
                                        {(fullTranscript || results.map(r => r?.transcript).join(" ")).length} chars
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-gray-700 min-h-[60px]">
                                    {fullTranscript || results.map(r => r?.transcript).join(" ") || "Start speaking…"}
                                    {isRecording && interimResult && (
                                        <span className="text-gray-400 italic"> {interimResult}</span>
                                    )}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="rounded-3xl p-5 shadow-lg"
                        style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={saveUserAnswer}
                            disabled={isSaving}
                            className="w-full h-14 rounded-2xl font-extrabold text-white text-base flex items-center justify-center gap-3 transition-all mb-3"
                            style={{
                                background: isSaving ? '#9CA3AF' : isRecording ? BRAND.pink : BRAND.violet,
                                boxShadow: isRecording ? `0 4px 20px ${BRAND.pink}50` : `0 4px 20px ${BRAND.violet}50`
                            }}
                        >
                            {isSaving ? (
                                <><LoaderCircle className="h-5 w-5 animate-spin" /> Saving…</>
                            ) : isRecording ? (
                                <><Square className="h-5 w-5" /> Stop & Save Answer</>
                            ) : (
                                <><MicIcon className="h-5 w-5" /> Start Recording</>
                            )}
                        </motion.button>

                        {/* AI note */}
                        <div className="flex items-center gap-2 justify-center">
                            <BrainCircuit className="h-4 w-4 shrink-0" style={{ color: BRAND.cyan }} />
                            <p className="text-xs text-muted-foreground">
                                AI evaluates your answer after saving
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

export default page
