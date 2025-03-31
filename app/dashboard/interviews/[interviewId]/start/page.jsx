"use client"
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam';
import useSpeechToText from 'react-hook-speech-to-text';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LightbulbIcon, MicIcon, Volume2Icon, WebcamIcon } from 'lucide-react';
import { toast } from 'sonner';
import { chatSession } from '@/utils/GeminiAIModal';

const page = () => {
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
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

    const router = useRouter();

    const handleSubmit = () => {
        setShowConfirmDialog(true); // Show confirmation dialog
    };

    const handleConfirmEndInterview = () => {
        setShowConfirmDialog(false); // Close the dialog
        router.push(`/dashboard/interviews/${interviewId}/feedback`); // Redirect to feedback page
    };

    const handleCancelEndInterview = () => {
        setShowConfirmDialog(false); // Close the dialog
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
            stopSpeechToText();
            const latestAnswer = userAnswer + results.map((result) => result?.transcript).join("");
            if (latestAnswer.length < 10) {
                toast.error('Error while saving your answer');
                return;
            }
            // Save the answer
            const feedbackPrompt = `Question: ${interview?.questions[activeQuestion]?.question}, Answer: ${latestAnswer}. Based on given question and answer, what feedback would you like to give to the candidate in 3 to 5 lines and also give rating out of 5. Give feedback and rating in JSON format.`;
            const result = await chatSession.sendMessage(feedbackPrompt);
            const cleanFeedback = (await result.response.text()).replace('```json', '').replace('```', '');
            const feedback = JSON.parse(cleanFeedback);
            console.log(feedback);
            try {
                const response = await axios.post('/api/save-user-answer',{
                    interviewId,
                    userResponse: latestAnswer,
                    feedback,
                    questionIndex: activeQuestion
                })
                if(response.data.status === 200){
                    toast.success("Answer saved succesfully!")
                }
            } catch (error) {
                console.log(error);                
                toast.error("Error: ",error)
            }
        } else {
            console.log("Starting speech-to-text...");
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
        results.map((result) => {
            setUserAnswer(prevAns=>prevAns+result?.transcript);
        }
    )}, [results])

    useEffect(()=>{ 
        setUserAnswer('');
    },[activeQuestion])

    useEffect(() => {
        if (error) {
            console.error("Speech-to-text error:", error);
            toast.error("An error occurred with speech-to-text. Please try again.");
        }
    }, [error]);

    return (
        <>
        <div className='w-full p-4 md:px-16 flex flex-col md:flex-row gap-6 overflow-x-hidden'>
            {/* Questions Section */}
            <div className='w-full md:w-[60%] border rounded-xl p-4'>
                {/* Question Navigation */}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:flex gap-2 sm:gap-4 flex-wrap mb-4'>
                    {interview?.questions?.map((question, index) => (
                        <div key={index} className='w-full sm:w-auto'>
                            <Button
                                variant='outline'
                                className={`w-full sm:w-auto rounded-xl border-2 border-black text-sm sm:text-base
                                    ${activeQuestion === index
                                        ? 'bg-purple-700 text-white hover:bg-purple-600 hover:text-white border-white'
                                        : ''
                                    }`
                                }
                                onClick={() => setActiveQuestion(index)}
                            >
                                Question #{index + 1}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Current Question */}
                <div className='mt-4'>
                    <h1 className='font-bold text-xl md:text-3xl mb-4'>Question {activeQuestion + 1}</h1>
                    <div className='border border-gray-300 p-3 md:p-4 rounded-xl md:text-lg'>
                        <p className='break-words'><strong>Question:</strong> {interview?.questions[activeQuestion]?.question}</p>
                    <Volume2Icon className='cursor-pointer' onClick={()=>speakQues(interview?.questions[activeQuestion]?.question)}/>
                    </div>
                </div>

                {/* Helpful Tip */}
                <div className='my-4 bg-blue-200 text-blue-500 rounded-xl border border-black p-4 '>
                    <div className='flex gap-2'>
                    <LightbulbIcon/>
                    <strong>Helpful Tip!</strong>
                    </div>
                    <div>Tap on Record Answer to record the answer of given question. After recording, stop the recording to save the answer. End the interview to get the feedback of the answered questions.</div>
                </div>
            </div>

            {/* Webcam Section */}
            <div className=' w-full md:w-[40%] h-auto md:min-h-[95%] border border-gray-300 p-4 rounded-xl'>
                <div className='relative aspect-video mb-4'>
                    {(WebCamEnabled) ? (
                        <Webcam onUserMedia={()=>setWebCamEnabled(true)} onUserMediaError={()=>setWebCamEnabled(false)} className='rounded-xl w-full h-full object-cover' mirrored={true} />
                    ) : (<div className='w-full h-full bg-gray-300 rounded-xl flex justify-center items-center'>
                        <WebcamIcon className='w-20 h-20 md:w-40 md:h-40' /></div>)}
                </div>
                <div className='flex justify-center mt-4'>
                    <Button variant="outline"
                        className="w-full sm:w-2/3 md:w-1/3 bg-purple-700 text-white hover:bg-purple-600 hover:text-white"
                        onClick={saveUserAnswer}
                    >
                        {isRecording ? <div className='flex justify-center items-center gap-1'><MicIcon/>Stop Recording</div> : 'Start Recording'}
                    </Button>
                </div>
                
            </div>
        </div>
        <Button className='mx-auto w-20' onClick={handleSubmit}>Submit</Button>
        {showConfirmDialog && (
                <Dialog open={showConfirmDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>End Interview</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to end the interview? You will be redirected to the feedback page.</p>
                        <DialogFooter>
                            <Button variant="destructive" onClick={handleCancelEndInterview}>Cancel</Button>
                            <Button onClick={handleConfirmEndInterview}>Confirm</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

export default page
