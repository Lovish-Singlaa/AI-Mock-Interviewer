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
import { Calendar, ChevronsUpDownIcon, Clock, Download, HomeIcon, Layers, SendToBack, Star, Trophy, TrendingUp, Sparkles, CheckCircle, MessageSquare, Target } from 'lucide-react'
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

    const getScoreColor = (score) => {
        if (score >= 4) return 'text-green-600 dark:text-green-400';
        if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    }

    const getScoreBg = (score) => {
        if (score >= 4) return 'bg-green-100 dark:bg-green-900/20';
        if (score >= 3) return 'bg-yellow-100 dark:bg-yellow-900/20';
        return 'bg-red-100 dark:bg-red-900/20';
    }

    const getScoreBorder = (score) => {
        if (score >= 4) return 'border-green-200 dark:border-green-700';
        if (score >= 3) return 'border-yellow-200 dark:border-yellow-700';
        return 'border-red-200 dark:border-red-700';
    }

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                        <Trophy className="h-8 w-8 text-primary" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <h1 className="text-3xl font-bold text-gradient">Interview Results</h1>
                </div>
                <p className="text-muted-foreground">Completed on {formatDate(interview?.createdAt)}</p>
            </div>

            {/* Overall Score Card */}
            {interview && (
                <div className="mb-8 animate-scale-in">
                    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Overall Performance</h2>
                                    <p className="text-muted-foreground">Your interview score and feedback</p>
                                </div>
                                <div className={`p-6 rounded-2xl ${getScoreBg(interview?.score)} ${getScoreBorder(interview?.score)} border-2`}>
                                    <div className="text-center">
                                        <div className={`text-4xl font-bold ${getScoreColor(interview?.score)}`}>
                                            {interview?.score}/5
                                        </div>
                                        <div className="flex items-center justify-center gap-1 mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`h-4 w-4 ${i < interview?.score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="summary" className="w-full mx-auto">
                <TabsList className='w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in' style={{ animationDelay: '0.2s' }}>
                    <TabsTrigger value="summary" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Target className="h-4 w-4 mr-2" />
                        Summary
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Questions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className='w-full max-w-2xl mx-auto my-6 animate-fade-in' style={{ animationDelay: '0.4s' }}>
                    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover-lift">
                            <CardHeader>
                            <CardTitle className="text-xl font-bold text-gradient">Interview Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-slate-700 rounded-xl">
                                <span className="text-sm text-muted-foreground">Position</span>
                                    <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary"/>
                                        <span className="font-medium">{interview?.jobRole}</span>
                                    </div>
                                </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-slate-700 rounded-xl">
                                <span className="text-sm text-muted-foreground">Experience Level</span>
                                    <span className="font-medium">{interview?.experience} years</span>
                                </div>
                            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-slate-700 rounded-xl">
                                    <span className="text-sm text-muted-foreground">Duration</span>
                                    <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                        <span className="font-medium">30 minutes</span>
                                    </div>
                                </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-slate-700 rounded-xl">
                                    <span className="text-sm text-muted-foreground">Date</span>
                                    <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{formatDate(interview?.createdAt)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                            <Link href='/dashboard' className="w-full">
                                <Button variant="outline" className="w-full btn-modern hover-lift">
                                    <HomeIcon className="h-4 w-4 mr-2"/>
                                    Back to Dashboard
                                </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                </TabsContent>

                <TabsContent value="questions" className='w-full max-w-4xl mx-auto my-6 animate-fade-in' style={{ animationDelay: '0.6s' }}>
                    <div className="space-y-4">
                        {interview?.questions?.map((question, index) => (
                            <Collapsible key={index} className="animate-scale-in" style={{ animationDelay: `${0.8 + index * 0.1}s` }}>
                                <CollapsibleTrigger className='w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover-lift transition-all duration-200 flex justify-between items-center gap-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className='flex-1 text-left'>
                                            <p className="font-medium line-clamp-2">{question.question}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBg(question.rating)} ${getScoreBorder(question.rating)}`}>
                                                    {question.rating}/5
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`h-3 w-3 ${i < question.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                    </div>
                                    <ChevronsUpDownIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4 space-y-4">
                                    <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4'>
                                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Your Answer
                                        </h4>
                                        <p className="text-red-700 dark:text-red-300">{question.userResponse}</p>
                                </div>
                                    <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4'>
                                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Preferred Answer
                                        </h4>
                                        <p className="text-green-700 dark:text-green-300">{question.answer}</p>
                                </div>
                                    {question.feedback && (
                                        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4'>
                                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                AI Feedback
                                            </h4>
                                            <p className="text-blue-700 dark:text-blue-300">{question.feedback}</p>
                                </div>
                                    )}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )

    function formatDate(dateString) {
        if (!dateString) return "Invalid Date";

        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    }
}

export default page
