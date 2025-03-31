"use client"
import React, { useEffect, useState } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import axios from 'axios'
import { useParams } from 'next/navigation'
import { Calendar, ChevronsUpDownIcon, Clock, Download, HomeIcon, Layers, SendToBack } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const page = () => {
    const { interviewId } = useParams();
    const [interview, setInterview] = useState()

    useEffect(() => {
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
        fetchData();
    }, [])
    return (
        <div className='p-3'>
            <h1 className='text-3xl font-bold'>Interview Results</h1>
            <p className='text-gray-500 mb-4'>Completed on {formatDate(interview?.createdAt)}</p>
            <Tabs defaultValue="summary" className="w-full mx-auto">
                <TabsList className='w-[90%] md:w-[60%] mx-auto'>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className='w-[90%] md:w-[60%] mx-auto my-3'>
                    <div>
                        <h2 className='text-xl font-semibold my-3'>Overall Rating: {interview?.score}/5</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle>Interview Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Type</span>
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-muted-foreground"/>
                                        <span className="font-medium">{interview?.jobRole}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Experience</span>
                                    <span className="font-medium">{interview?.experience} years</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Duration</span>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">30 minutes</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Date</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{formatDate(interview?.createdAt)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href='/dashboard' className="w-full"><Button variant="outline" className="w-full" >
                                    <HomeIcon className="h-4 w-4 text-muted-foreground"/>
                                    Go Home
                                </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                    </div>
                </TabsContent>
                <TabsContent value="questions" className='w-[90%] md:w-[60%] mx-auto my-3'>
                    {interview?.questions.map((question, index) => (
                        <Collapsible key={index}>
                            <CollapsibleTrigger className='w-full text-left bg-secondary my-3 flex justify-between gap-2 p-1 rounded-lg'>
                                <div className='w-[94%]'>Q{index + 1}: {question.question}</div>
                                <ChevronsUpDownIcon />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className='my-1'>
                                    <p><strong>Rating: </strong>{question.rating}</p>
                                </div>
                                <div className='bg-red-200 my-1 p-2 rounded-md'>
                                    <strong>Your Answer: </strong>
                                    <p>{question.userResponse}</p>
                                </div>
                                <div className='bg-green-200 my-1 p-2 rounded-md'>
                                    <strong>Preferred Answer: </strong>
                                    <p>{question.answer}</p>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                    ))}
                </TabsContent>
            </Tabs>

        </div>
    )

    function formatDate(dateString) {
        if (!dateString) return "Invalid Date";

        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short", // Abbreviated month (e.g., Jan, Feb)
            day: "numeric", // Day of the month
            year: "numeric", // Full year
            hour: "numeric", // Hour (12-hour format)
            minute: "2-digit", // Minutes with leading zero
            hour12: true,
        }).format(date);
    }

}

export default page
