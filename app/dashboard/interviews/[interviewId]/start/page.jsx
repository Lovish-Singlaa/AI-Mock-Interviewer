"use client"
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam';
import useSpeechToText from 'react-hook-speech-to-text';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LightbulbIcon, MicIcon, Volume2Icon, WebcamIcon, Play, Square, Sparkles, ArrowRight, CheckCircle, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

const page = () => {
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });
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

    const handleSubmit = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmEndInterview = () => {
        setShowConfirmDialog(false);
        router.push(`/dashboard/interviews/${interviewId}/feedback`);
    };

    const handleCancelEndInterview = () => {
        setShowConfirmDialog(false);
    };

    const speakQues = (text) => {
        if("speechSynthesis" in window){
            const synth = window.speechSynthesis;
            const utterThis = new SpeechSynthesisUtterance(text);
            synth.speak(utterThis);
        } else{
            alert('Your browser does not support text to speech!');
        }
    }

    const saveUserAnswer = async () => {
        if (isRecording) {
            console.log("Stopping speech-to-text...");
            
            // Capture the current transcript INCLUDING interim results BEFORE stopping
            const currentTranscript = results.map((result) => result?.transcript).join(" ");
            const interim = interimResult || "";
            const combinedTranscript = currentTranscript + (interim ? " " + interim : "");
            
            console.log("Results:", results);
            console.log("Current Transcript:", currentTranscript);
            console.log("Interim Result:", interim);
            console.log("Combined:", combinedTranscript);
            
            // Now stop the recording
            stopSpeechToText();
            
            // Wait a bit longer for any final processing
            setTimeout(async () => {
                // Get final transcripts again in case more came through
                const finalTranscript = results.map((result) => result?.transcript).join(" ");
                const finalInterim = interimResult || "";
                const allTranscripts = finalTranscript + (finalInterim ? " " + finalInterim : "");
                
                // Use whichever is longer (to capture everything)
                const bestTranscript = allTranscripts.length > combinedTranscript.length ? allTranscripts : combinedTranscript;
                const finalAnswer = (userAnswer + " " + bestTranscript).trim();
                
                console.log("=== FINAL CAPTURE ===");
                console.log("User Answer State:", userAnswer);
                console.log("Best Transcript:", bestTranscript);
                console.log("Final Answer:", finalAnswer);
                console.log("Final Answer Length:", finalAnswer.length);
                console.log("===================");
                
                if (finalAnswer.length < 10) {
                    toast.error('Please provide a longer answer (at least 10 characters)');
                    setIsSaving(false);
                    return;
                }
                
                setIsSaving(true);
                try {
                    // Use the server-side API to evaluate and save the answer
                    const response = await axios.put('/api/save-user-answer', {
                        interviewId,
                        userResponse: finalAnswer,
                        questionIndex: activeQuestion
                    });
                    
                    if(response.data.success){
                        toast.success("Answer saved successfully!");
                        setAnsweredQuestions(prev => new Set([...prev, activeQuestion]));
                        // Clear everything for next question
                        setUserAnswer('');
                        setFullTranscript('');
                        // Clear results if the function is available
                        if (typeof setResults === 'function') {
                            setResults([]);
                        }
                    } else {
                        toast.error(response.data.message || "Failed to save answer");
                    }
                } catch (error) {
                    console.log(error);
                    const errorMessage = error.response?.data?.message || "Error saving answer";
                    toast.error(errorMessage);
                } finally {
                    setIsSaving(false);
                }
            }, 1000); // Increased to 1000ms for better capture
            
        } else {
            console.log("Starting speech-to-text...");
            // Clear previous transcripts when starting new recording
            setFullTranscript('');
            setUserAnswer('');
            if (typeof setResults === 'function') {
                setResults([]);
            }
            
            try {
                startSpeechToText();
            } catch (error) {
                console.error("Error starting speech-to-text:", error);
                toast.error("Failed to start recording. Please check your microphone permissions.");
            }
        }
    }

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/find-interview-by-id', {
                params: {
                    id: interviewId
                }
            });
            setInterview(response.data);
        } catch (error) {
            console.error('Error fetching interview:', error);
        }
    }
    
    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        // Update full transcript as we receive results
        if (isRecording && results.length > 0) {
            const currentTranscript = results.map((result) => result?.transcript).join(" ");
            const interim = interimResult || "";
            setFullTranscript(currentTranscript + (interim ? " " + interim : ""));
        }
    }, [results, interimResult, isRecording])

    useEffect(()=>{ 
        // Clear answer when moving to a new question
        setUserAnswer('');
        setFullTranscript('');
        // Clear results if the function is available
        if (typeof setResults === 'function') {
            setResults([]);
        }
    },[activeQuestion, setResults])

    useEffect(() => {
        if (error) {
            console.error("Speech-to-text error:", error);
            toast.error("An error occurred with speech-to-text. Please try again.");
        }
    }, [error]);

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <h1 className="text-2xl font-bold text-gradient">Interview Session</h1>
                </div>
                <p className="text-muted-foreground">Position: {interview?.jobRole}</p>
            </div>

            <div className='w-full flex flex-col lg:flex-row gap-6'>
                {/* Questions Section */}
                <div className='w-full lg:w-[60%] bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 animate-slide-in-left'>
                    {/* Question Navigation */}
                    <div className='mb-6'>
                        <h3 className="text-lg font-semibold mb-3">Question Progress</h3>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
                            {interview?.questions?.map((question, index) => (
                                    <Button
                                        key={index}
                                        variant='outline'
                                        size="sm"
                                        className={`relative rounded-xl border-2 transition-all duration-200 hover-lift ${
                                            activeQuestion === index
                                                ? 'bg-blue-600 text-white border-transparent shadow-lg'
                                                : answeredQuestions.has(index)
                                                ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300'
                                                : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600'
                                        }`}
                                        onClick={() => setActiveQuestion(index)}
                                    >
                                    <span className="text-xs font-medium">Q{index + 1}</span>
                                    {answeredQuestions.has(index) && (
                                        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-600 dark:text-green-400" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Current Question */}
                    <div className='mb-6 animate-fade-in'>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {activeQuestion + 1}
                            </div>
                            <h2 className='font-bold text-xl md:text-2xl'>Question {activeQuestion + 1}</h2>
                        </div>
                        <div className='bg-blue-50 dark:bg-slate-700 p-6 rounded-2xl border border-blue-200 dark:border-slate-600'>
                            <div className="flex items-start justify-between gap-4">
                                <p className='text-lg leading-relaxed'>{interview?.questions[activeQuestion]?.question}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => speakQues(interview?.questions[activeQuestion]?.question)}
                                    className="hover-lift"
                                >
                                    <Volume2Icon className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Helpful Tip */}
                    <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-4 animate-fade-in' style={{ animationDelay: '0.2s' }}>
                        <div className='flex gap-3 items-start'>
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                                <LightbulbIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
                            </div>
                            <div>
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Pro Tip</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Click "Start Recording" to begin your answer. Speak clearly and take your time. 
                                    Click "Stop Recording" when you're done to save your response.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Webcam Section */}
                <div className='w-full lg:w-[40%] bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 animate-slide-in-right'>
                    <h3 className="text-lg font-semibold mb-4">Video Recording</h3>
                    
                    <div className='relative aspect-video mb-6 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-slate-600'>
                        {WebCamEnabled ? (
                            <Webcam 
                                onUserMedia={() => setWebCamEnabled(true)} 
                                onUserMediaError={() => setWebCamEnabled(false)} 
                                className='w-full h-full object-cover' 
                                mirrored={true} 
                            />
                        ) : (
                            <div className='w-full h-full bg-gray-200 dark:bg-slate-700 flex flex-col justify-center items-center'>
                                <WebcamIcon className='w-16 h-16 text-gray-400 dark:text-slate-500 mb-2' />
                                <p className="text-sm text-gray-500 dark:text-slate-400">Camera not available</p>
                            </div>
                        )}
                        
                        {/* Recording indicator */}
                        {isRecording && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                Recording
                            </div>
                        )}
                    </div>

                    {/* Real-time Transcription Display */}
                    {(isRecording || fullTranscript || results.length > 0) && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                                {isRecording ? (
                                    <>
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                        Listening...
                                    </>
                                ) : (
                                    <>📝 Your Response:</>
                                )}
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 min-h-[60px] whitespace-pre-wrap">
                                {fullTranscript || results.map((result) => result?.transcript).join(" ") || "Start speaking..."}
                                {isRecording && interimResult && (
                                    <span className="text-blue-400 dark:text-blue-500 italic"> {interimResult}</span>
                                )}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Characters: {(fullTranscript || results.map((result) => result?.transcript).join(" ")).length}
                                </p>
                                {(fullTranscript || results.map((result) => result?.transcript).join(" ")).length >= 10 && (
                                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Ready to save
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recording Controls */}
                    <div className='space-y-4'>
                        <Button 
                            variant={isRecording ? "destructive" : "default"}
                            size="lg"
                            className={`w-full h-14 text-lg font-medium btn-modern hover-glow ${
                                isRecording 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            onClick={saveUserAnswer}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                    Saving...
                                </div>
                            ) : isRecording ? (
                                <div className="flex items-center gap-2">
                                    <Square className="h-5 w-5" />
                                    Stop Recording
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Play className="h-5 w-5" />
                                    Start Recording
                                </div>
                            )}
                        </Button>

                        {/* Progress indicator */}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                {answeredQuestions.size} of {interview?.questions?.length || 0} questions answered
                            </p>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(answeredQuestions.size / (interview?.questions?.length || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button 
                    size="lg"
                    onClick={handleSubmit}
                    className="btn-modern hover-glow bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
                >
                    <ArrowRight className="mr-2 h-5 w-5" />
                    End Interview & Get Feedback
                </Button>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gradient">End Interview</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-muted-foreground mb-4">
                                Are you sure you want to end the interview? You will be redirected to the feedback page to see your results.
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <strong>Note:</strong> You can always come back to complete unanswered questions later.
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="gap-3">
                            <Button 
                                variant="outline" 
                                onClick={handleCancelEndInterview}
                                className="hover-lift"
                            >
                                Continue Interview
                            </Button>
                            <Button 
                                onClick={handleConfirmEndInterview}
                                className="btn-modern hover-glow bg-green-600 hover:bg-green-700"
                            >
                                End Interview
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default page
