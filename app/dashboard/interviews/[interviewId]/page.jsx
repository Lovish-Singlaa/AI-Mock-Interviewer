"use client"
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { LightbulbIcon, WebcamIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Webcam from 'react-webcam';

const page = () => {
    const { interviewId } = useParams();
    const [interview, setInterview] = useState(null);
    const [WebCamEnabled, setWebCamEnabled] = useState(false);
    const router = useRouter();
    const fetchData = async () => {
        try {
            const response = await axios.get('/api/find-interview-by-id', {
                params: {
                    id: interviewId
                }
            });
            setInterview(response.data);
            console.log(interview);
        } catch (error) {
            console.error('Error fetching interview:', error);
        }
    }
    useEffect(() => {
        fetchData();
    }, [])

    return (
        <div className='p-4 md:px-20 overflow-x-hidden overflow-y-auto'>
            <h1 className='font-bold text-2xl md:text-3xl'>Let's Start the Interview</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-4 w-full'>
                <div className='w-full'>
                    <h2 className='font-bold text-lg md:text-xl mb-3'>Interview Details</h2>
                    <div className='border border-gray-300 p-4 rounded-2xl md:text-lg'>
                        <p><strong>Job Role:</strong> {interview?.jobRole}</p>
                        <p><strong>Job Description:</strong> {interview?.jobDescription}</p>
                        <p><strong>Experience:</strong> {interview?.experience}</p>
                    </div>
                    <div className='mt-4 w-full border border-black rounded-2xl bg-yellow-100 p-4 text-yellow-500'>
                        <span className='flex items-center gap-2'>
                            <LightbulbIcon />
                            <strong className='font-bold'>Information!</strong>
                        </span>
                        <div className='font-semibold'>Enable Web Cam and Microphone to start your AI Generated Mock Interview. It has 5 questions and at the last, you will get feedback report on the basis of your responses.<br/> <span className='font-bold'>NOTE:</span> For Best Experience, use Chrome Browser</div>
                    </div>
                </div>
                <div className='grid-cols-1 w-full md:w-[450px]'>
                    {(WebCamEnabled) ? (
                        <>
                            <Webcam onUserMedia={() => setWebCamEnabled(true)} onUserMediaError={() => setWebCamEnabled(false)} className='w-full h-auto max-w-full rounded-2xl' />
                            <div className='mt-3 flex w-full justify-center items-center gap-3'>
                                <Button className='w-1/2 md:w-1/3' onClick={() => setWebCamEnabled(false)}>Disable WebCam</Button>
                                <Button className='w-1/2 md:w-1/3' onClick={()=>router.push(`/dashboard/interviews/${interviewId}/start`)}>Start Interview</Button>
                            </div>
                        </>
                    ) : (
                        <div className='w-full'>
                            <div className='w-full h-60 bg-gray-300 rounded-2xl flex justify-center items-center'>
                                <WebcamIcon className='w-20 h-20 md:w-40 md:h-40' />
                            </div>
                            <div><Button className='w-full mx-auto mt-4' onClick={() => setWebCamEnabled(true)}>Enable WebCam and Microphone</Button></div>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    )
}

export default page
