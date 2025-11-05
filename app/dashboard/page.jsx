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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, FileText, Layers, LoaderCircle, Star, Plus, TrendingUp, Users, Target, Sparkles, BarChart3, Trophy, Zap, BookOpen, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

// Interview categories and difficulty levels
const interviewCategories = {
    technical: {
        name: 'Technical Interview',
        description: 'Focus on technical skills, problem-solving, and coding abilities',
        icon: '💻',
        color: 'blue'
    },
    behavioral: {
        name: 'Behavioral Interview',
        description: 'Assess soft skills, past experiences, and cultural fit',
        icon: '🤝',
        color: 'green'
    },
    leadership: {
        name: 'Leadership Interview',
        description: 'Evaluate leadership potential and management skills',
        icon: '👑',
        color: 'purple'
    },
    'case-study': {
        name: 'Case Study Interview',
        description: 'Problem-solving scenarios and business analysis',
        icon: '📊',
        color: 'orange'
    },
    'system-design': {
        name: 'System Design Interview',
        description: 'Architecture and system design challenges',
        icon: '🏗️',
        color: 'red'
    },
    coding: {
        name: 'Coding Interview',
        description: 'Programming challenges and algorithm problems',
        icon: '⚡',
        color: 'yellow'
    },
    general: {
        name: 'General Interview',
        description: 'Mixed questions covering various aspects',
        icon: '🎯',
        color: 'gray'
    }
};

const difficultyLevels = {
    beginner: {
        name: 'Beginner',
        description: 'Suitable for entry-level positions and new graduates',
        color: 'green'
    },
    intermediate: {
        name: 'Intermediate',
        description: 'For professionals with 2-5 years of experience',
        color: 'yellow'
    },
    advanced: {
        name: 'Advanced',
        description: 'For senior positions and experienced professionals',
        color: 'red'
    }
};

const page = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [jobRole, setJobRole] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [jobExp, setJobExp] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
    const [questionCount, setQuestionCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [interviews, setInterviews] = useState(null)
    const [fetching, setFetching] = useState(false)
    const [analytics, setAnalytics] = useState(null)

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
                
                // Calculate analytics
                if (response.data && response.data.length > 0) {
                    const completedInterviews = response.data.filter(interview => interview.score > 0);
                    const totalScores = completedInterviews.reduce((sum, interview) => sum + interview.score, 0);
                    const averageScore = completedInterviews.length > 0 ? totalScores / completedInterviews.length : 0;
                    const bestScore = Math.max(...completedInterviews.map(i => i.score), 0);
                    
                    setAnalytics({
                        totalInterviews: response.data.length,
                        completedInterviews: completedInterviews.length,
                        averageScore: Math.round(averageScore * 10) / 10,
                        bestScore,
                        totalPracticeTime: response.data.length * 30,
                        improvementRate: calculateImprovementRate(completedInterviews)
                    });
                }
            } catch (error) {
                console.error('Error fetching interviews:', error);
                setInterviews([]);
            } finally {
                setFetching(false);
            }
        }
        if (user) getInterviews();
    }, [user])

    const calculateImprovementRate = (interviews) => {
        if (interviews.length < 2) return 0;
        const sortedInterviews = interviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const firstHalf = sortedInterviews.slice(0, Math.ceil(sortedInterviews.length / 2));
        const secondHalf = sortedInterviews.slice(Math.ceil(sortedInterviews.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, i) => sum + i.score, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, i) => sum + i.score, 0) / secondHalf.length;
        
        return Math.round((secondHalfAvg - firstHalfAvg) * 10) / 10;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Call the server-side API to generate questions
            const questionResponse = await axios.post('/api/generate-questions', {
                jobRole,
                jobDesc,
                jobExp,
                selectedCategory,
                selectedDifficulty,
                questionCount
            });

            if (!questionResponse.data.success) {
                throw new Error(questionResponse.data.message || 'Failed to generate questions');
            }

            const enhancedQuestions = questionResponse.data.questions;

            // Create the interview with the generated questions
            const response = await axios.post('/api/interviews', {
                jobRole,
                jobDesc,
                jobExp,
                category: selectedCategory,
                difficulty: selectedDifficulty,
                questions: enhancedQuestions,
                userId: user?._id
            });
            
            const interviewId = response.data.interviewId;
            toast.success('Interview generated successfully!');
            router.push(`/dashboard/interviews/${interviewId}/start`)
            setOpenDialog(false);
            setLoading(false);
        } catch (error) {
            console.error('Error details:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to generate interview. Please try again.';
            toast.error(errorMessage);
            setLoading(false);
        }
    }

    const getCategoryIcon = (category) => {
        return interviewCategories[category]?.icon || '🎯';
    }

    const getCategoryColor = (category) => {
        const colors = {
            technical: 'bg-blue-600',
            behavioral: 'bg-green-600',
            leadership: 'bg-purple-600',
            'case-study': 'bg-orange-600',
            'system-design': 'bg-red-600',
            coding: 'bg-yellow-600',
            general: 'bg-gray-600'
        };
        return colors[category] || colors.general;
    }

    return (
        <div className='p-4 md:p-6 lg:p-8'>
            {/* Header */}
            <div className='flex justify-between items-center mb-8 animate-fade-in'>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Sparkles className="h-8 w-8 text-primary" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className='text-3xl font-bold text-gradient'>Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}!</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        className="btn-modern hover-glow bg-blue-600 hover:bg-blue-700 cursor-pointer" 
                        onClick={() => setOpenDialog(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Interview
                    </Button>
                </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="hover-lift animate-slide-in-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <FileText className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gradient">{analytics?.totalInterviews || 0}</div>
                        <p className="text-xs text-muted-foreground">+2 from last week</p>
                    </CardContent>
                </Card>

                <Card className="hover-lift animate-slide-in-top bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg" style={{ animationDelay: '0.1s' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <div className="p-2 bg-green-600 rounded-lg">
                            <Star className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gradient">{analytics?.averageScore || 0}/5</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics?.improvementRate > 0 ? '+' : ''}{analytics?.improvementRate || 0} from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover-lift animate-slide-in-top bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg" style={{ animationDelay: '0.2s' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
                        <div className="p-2 bg-orange-600 rounded-lg">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gradient">{analytics?.totalPracticeTime || 0}m</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>

                <Card className="hover-lift animate-slide-in-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg" style={{ animationDelay: '0.3s' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                        <div className="p-2 bg-purple-600 rounded-lg">
                            <Trophy className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gradient">{analytics?.bestScore || 0}/5</div>
                        <p className="text-xs text-muted-foreground">Personal best</p>
                    </CardContent>
                </Card>
            </div>

            {/* Interview Templates */}
            <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <h2 className='text-2xl font-bold'>Quick Start Templates</h2>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(interviewCategories).map(([key, category]) => (
                        <Card key={key} className="hover-lift bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg cursor-pointer" onClick={() => {
                            setSelectedCategory(key);
                            setOpenDialog(true);
                        }}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 ${getCategoryColor(key)} rounded-xl flex items-center justify-center text-2xl`}>
                                        {getCategoryIcon(key)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{category.name}</CardTitle>
                                        <CardDescription className="text-sm">{category.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Zap className="h-4 w-4" />
                                    <span>Click to start</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Interviews */}
            <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2 mb-6">
                    <Target className="h-6 w-6 text-primary" />
                    <h2 className='text-2xl font-bold'>Your Interviews</h2>
                    </div>
                
                {fetching ? (
                    <div className='flex justify-center items-center py-12'>
                        <div className="flex items-center gap-3">
                            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-muted-foreground">Loading interviews...</span>
                        </div>
                    </div>
                ) : interviews && interviews.length > 0 ? (
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {interviews.slice(0, 3).map((interview, index) => (
                            <Card key={index} className="hover-lift bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg animate-scale-in" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                                <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold">{interview.jobRole}</CardTitle>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            interview.score === 0 
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                            {interview.score === 0 ? 'Pending' : 'Completed'}
                                        </div>
                                            </div>
                                    <CardDescription className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(interview.createdAt)}
                                    </CardDescription>
                                        </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <Layers className="h-4 w-4" />
                                                <span>
                                            {interview.jobDescription.length>75 ? `${interview.jobDescription.slice(0,75)}...` : interview.jobDescription} • {interview.experience} years
                                                </span>
                                            </div>
                                    {interview.category && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-6 h-6 ${getCategoryColor(interview.category)} rounded-lg flex items-center justify-center text-xs text-white`}>
                                                {getCategoryIcon(interview.category)}
                                            </div>
                                            <span className="text-xs font-medium capitalize">{interview.category}</span>
                                        </div>
                                    )}
                                    {interview.score > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-medium">{interview.score}/5</span>
                                        </div>
                                    )}
                                        </CardContent>
                                        <CardFooter>
                                    <Button 
                                        variant={interview.score === 0 ? "default" : "outline"} 
                                        size="sm" 
                                        className="w-full btn-modern" 
                                        asChild
                                    >
                                        <Link href={interview.score === 0 ? `/dashboard/interviews/${interview._id}/start` : `/dashboard/interviews/${interview._id}/feedback`}>
                                                    {interview.score === 0 ? "Start Interview" : "View Results"}
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                        ))}
                                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-white" />
                                    </div>
                        <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
                        <p className="text-muted-foreground mb-6">Start your first interview to begin improving your skills</p>
                        <Button 
                            onClick={() => setOpenDialog(true)}
                            className="btn-modern hover-glow bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Interview
                                        </Button>
                                    </div>
                )}
            </div>

            {/* Show More Button */}
            {interviews?.length > 3 && (
                <div className='flex justify-center animate-fade-in' style={{ animationDelay: '0.8s' }}>
                    <Link href="/dashboard/interviews">
                        <Button variant='outline' className="btn-modern hover-lift">
                            View All Interviews
                        </Button>
                    </Link>
                </div>
            )}

            {/* Enhanced New Interview Dialog */}
            {openDialog && (
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gradient">Create New Interview</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Configure your interview settings and generate personalized questions.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jobRole" className="text-sm font-medium">Job Title</Label>
                                    <Input 
                                        id="jobRole"
                                        value={jobRole} 
                                        onChange={(e) => setJobRole(e.target.value)} 
                                        placeholder="Ex. Frontend Developer" 
                                        className="h-11 border-2 focus:border-primary transition-colors duration-200"
                                        required 
                                    />
            </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jobExp" className="text-sm font-medium">Years of Experience</Label>
                                    <Input 
                                        id="jobExp"
                                        value={jobExp} 
                                        onChange={(e) => setJobExp(e.target.value)} 
                                        placeholder="2" 
                                        type="number" 
                                        className="h-11 border-2 focus:border-primary transition-colors duration-200"
                                        required 
                                    />
            </div>
        </div>

                            <div className="space-y-2">
                                <Label htmlFor="jobDesc" className="text-sm font-medium">Job Description</Label>
                                <Textarea 
                                    id="jobDesc"
                                    value={jobDesc} 
                                    onChange={(e) => setJobDesc(e.target.value)} 
                                    placeholder="Brief description of the role and responsibilities..."
                                    className="min-h-[80px] border-2 focus:border-primary transition-colors duration-200"
                                    required 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-medium">Interview Category</Label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="h-11 border-2 focus:border-primary">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(interviewCategories).map(([key, category]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{category.icon}</span>
                                                        <span>{category.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty Level</Label>
                                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                        <SelectTrigger className="h-11 border-2 focus:border-primary">
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(difficultyLevels).map(([key, level]) => (
                                                <SelectItem key={key} value={key}>
                                                    {level.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="questionCount" className="text-sm font-medium">Number of Questions</Label>
                                    <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                                        <SelectTrigger className="h-11 border-2 focus:border-primary">
                                            <SelectValue placeholder="Select count" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[3, 5, 7, 10].map(count => (
                                                <SelectItem key={count} value={count.toString()}>
                                                    {count} questions
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setOpenDialog(false)}
                                    className="hover-lift"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn-modern hover-glow bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </div>
                                    ) : (
                                        "Create Interview"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default page
