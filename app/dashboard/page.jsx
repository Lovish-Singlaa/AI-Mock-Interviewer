"use client"
import React, { useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/GeminiAIModal'
import { Calendar, Clock, FileText, Layers, LoaderCircle, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Router } from 'next/router'
import { toast } from 'sonner'
import Link from 'next/link'

const page = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [jobRole, setJobRole] = useState();
    const [jobDesc, setJobDesc] = useState();
    const [jobExp, setJobExp] = useState();
    const [loading, setLoading] = useState(false);
    const [jsonResponse, setJsonResponse] = useState();
    const [user, setUser] = useState(null);
    const [interviews, setInterviews] = useState(null)
    const [fetching, setFetching] = useState(false)

    const router = useRouter()

    function formatDate(dateString) {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date)
    }

    useEffect(() => {
        const getUser = async () => {
            const response = await axios.get('/api/user')
            setUser(response.data.user);
        }
        getUser();
    }, []);

    useEffect(() => {

        const getInterviews = async () => {
            try {
                setFetching(true);
                const response = await axios.get('/api/get-interviews', {})
                setInterviews(response.data);
            } catch (error) {
                console.error('Error fetching interviews:', error);
                setInterviews([]);
            } finally {
                setFetching(false);
            }
        }
        if (user) getInterviews();
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const inputResp = "Job Position:" + jobRole + ",Job Description:" + jobDesc + ", Job Experience:" + jobExp + " years based on the given information generate " + process.env.NEXT_PUBLIC_NUMBER_QUESTIONS + " interview questions with their answers in json format"
            const result = await chatSession.sendMessage(inputResp);
            let responseText = result.response.text();
            const cleanText = responseText.replace('```json', '').replace('```', '').trim();

            const jsonResp = JSON.parse(cleanText);

            const response = await axios.post('/api/interviews', {
                jobRole,
                jobDesc,
                jobExp,
                questions: jsonResp,
                userId: user?._id
            });
            const interviewId = response.data.interviewId;
            toast.success('Interview generated successfully!');
            router.push(`/dashboard/interviews/${interviewId}`)
            setOpenDialog(false);
            setLoading(false);
        } catch (error) {
            console.error('Error details:', error);
            setLoading(false);
        }
    }
    return (
        <div className='p-2 md:p-4 lg:p-8'>
            <div className='flex justify-between items-center mb-5'>
                <h1 className='text-3xl font-bold'>Dashboard</h1>
                <Button className="" onClick={() => setOpenDialog(true)}>+ New Interview</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews?.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallRating()}/5</div>
            <p className="text-xs text-muted-foreground">+0.5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews?.length*30}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
      </div>

            <h1 className='text-2xl mt-4'>Your Interviews</h1>
            {
                fetching ? (
                    <div className='flex justify-center items-center mt-4'>
                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) :
                    interviews && interviews.length > 0 ? (

                        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4'>
                            {interviews.map((interview, index) => (
                                <div key={index}>
                                    <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{interview.jobRole}</CardTitle>
                                        </div>
                                        <CardDescription>{formatDate(interview.createdAt)}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Layers className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {interview.jobDescription} • {interview.experience} years
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant={interview.score === 0 ? "" : "outline"} size="sm" className="w-full" asChild>
                                            <Link href={interview.score === 0 ? `/dashboard/interviews/${interview._id}` : `/dashboard/interviews/${interview._id}/feedback`}>
                                                {interview.score === 0 ? "Start Interview" : "View Results"}
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                                </div>

                            ))}
                        </div>)
                        :
                        <p className='text-gray-600 mt-4 my-2 text-xl w-full mx-auto'>No interviews found</p>
            }
            <div>
                {openDialog && <Dialog open={openDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tell us more about the Job you are interviewing</DialogTitle>
                            <DialogDescription className="p-2 text-black">
                                <form onSubmit={handleSubmit}>
                                    <div className='mb-2'>
                                        <Label className="mb-1 text-md">Job Title</Label>
                                        <Input onChange={(e) => setJobRole(e.target.value)} value={jobRole} placeholder="Ex. Frontend Developer" required />
                                    </div>
                                    <div className='mb-2'>
                                        <Label className="mb-1 text-md">Describe the Job Role (in Short)</Label>
                                        <Textarea onChange={(e) => setJobDesc(e.target.value)} value={jobDesc} placeholder="" required />
                                    </div>
                                    <div className='mb-2'>
                                        <Label className="mb-1 text-md">Years of Experience</Label>
                                        <Input onChange={(e) => setJobExp(e.target.value)} value={jobExp} placeholder="2" type="number" required />
                                    </div>
                                    <div className='flex justify-end gap-4'>
                                        <Button variant="destructive" onClick={() => setOpenDialog(false)}>Close</Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? <><LoaderCircle className="animate-spin" /> Generating</> : "Start Interview"}
                                        </Button>
                                    </div>
                                </form>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                }

            </div>
        </div>

        
)

function overallRating() {
    if (!interviews || interviews.length === 0) {
        return 0;
    }

    const totalScore = interviews.reduce((sum, interview) => {
        return sum + (interview.score || 0);
    }, 0);

    const averageScore = totalScore / interviews.length;

    return Math.round(averageScore);
}

}

export default page
