"use client"
import { UserContext } from '@/app/context/UserContext'
import React, { useContext, useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { 
    Layers, 
    Calendar, 
    Clock, 
    Star, 
    Target, 
    Sparkles, 
    FileText, 
    Search,
    Filter,
    SortAsc,
    LoaderCircle,
    Plus,
    ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const page = () => {
    const { user, setUser } = useContext(UserContext)
    const [interviews, setInterviews] = useState(null)
    const [fetching, setFetching] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const router = useRouter()

    // Interview categories for filtering
    const interviewCategories = {
        all: { name: 'All Categories', icon: '📋' },
        technical: { name: 'Technical', icon: '💻' },
        behavioral: { name: 'Behavioral', icon: '🤝' },
        leadership: { name: 'Leadership', icon: '👑' },
        'case-study': { name: 'Case Study', icon: '📊' },
        'system-design': { name: 'System Design', icon: '🏗️' },
        coding: { name: 'Coding', icon: '⚡' },
        general: { name: 'General', icon: '🎯' }
    };

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

    const getCategoryIcon = (category) => {
        return interviewCategories[category]?.icon || '🎯';
    }

    const getCategoryColor = (category) => {
        const colors = {
            technical: 'from-blue-500 to-blue-600',
            behavioral: 'from-green-500 to-green-600',
            leadership: 'from-purple-500 to-purple-600',
            'case-study': 'from-orange-500 to-orange-600',
            'system-design': 'from-red-500 to-red-600',
            coding: 'from-yellow-500 to-yellow-600',
            general: 'from-gray-500 to-gray-600'
        };
        return colors[category] || colors.general;
    }

    const getScoreColor = (score) => {
        if (score >= 4) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
        if (score >= 3) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
    }

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

    // Filter and sort interviews
    const filteredAndSortedInterviews = interviews ? interviews
        .filter(interview => {
            const matchesSearch = interview.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                interview.jobDescription.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'all' || interview.category === filterCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'score-high':
                    return (b.score || 0) - (a.score || 0);
                case 'score-low':
                    return (a.score || 0) - (b.score || 0);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        }) : [];

    const completedInterviews = interviews ? interviews.filter(i => i.score > 0) : [];
    const pendingInterviews = interviews ? interviews.filter(i => i.score === 0) : [];
    const averageScore = completedInterviews.length > 0 
        ? (completedInterviews.reduce((sum, i) => sum + i.score, 0) / completedInterviews.length).toFixed(1)
        : 0;

    return (
        <div className='p-4 md:p-6 lg:p-8'>
            {/* Header */}
            <div className='flex justify-between items-center mb-8 animate-fade-in'>
                <div className="flex items-center gap-3">
                    {/* <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.back()}
                        className="hover-lift"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button> */}
                    <div className="relative">
                        <Sparkles className="h-8 w-8 text-primary" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className='text-3xl font-bold text-gradient'>All Interviews</h1>
                        <p className="text-muted-foreground">Manage and review your interview sessions</p>
                    </div>
                </div>
                <Button 
                    className="btn-modern hover-glow bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => router.push('/dashboard')}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Interview
                </Button>
            </div>

            {/* Stats Overview */}
            {/* <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card className="hover-lift animate-slide-in-left bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                                <p className="text-2xl font-bold text-gradient">{interviews?.length || 0}</p>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <FileText className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover-lift animate-slide-in-top bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg" style={{ animationDelay: '0.1s' }}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-gradient">{completedInterviews.length}</p>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                                <Target className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover-lift animate-slide-in-top bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg" style={{ animationDelay: '0.2s' }}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-gradient">{pendingInterviews.length}</p>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                                <Clock className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover-lift animate-slide-in-right bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg" style={{ animationDelay: '0.3s' }}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
        <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                                <p className="text-2xl font-bold text-gradient">{averageScore}/5</p>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <Star className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div> */}

            {/* Filters and Search */}
            <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search interviews..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-10 border-2 focus:border-primary"
                                />
                            </div>
                            
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="h-10 border-2 focus:border-primary">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter by category" />
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

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="h-10 border-2 focus:border-primary">
                                    <SortAsc className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="score-high">Highest Score</SelectItem>
                                    <SelectItem value="score-low">Lowest Score</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Interviews Grid */}
            <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                {fetching ? (
                    <div className='flex justify-center items-center py-12'>
                        <div className="flex items-center gap-3">
                            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-muted-foreground">Loading interviews...</span>
                        </div>
                    </div>
                ) : filteredAndSortedInterviews.length > 0 ? (
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {filteredAndSortedInterviews.map((interview, index) => (
                            <Card key={interview._id} className="hover-lift bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg animate-scale-in" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold line-clamp-1">{interview.jobRole}</CardTitle>
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
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                        <Layers className="h-4 w-4" />
                                        <span className="line-clamp-2">
                                            {interview.jobDescription.length > 75 ? `${interview.jobDescription.slice(0, 75)}...` : interview.jobDescription} • {interview.experience} years
                                        </span>
                                    </div>
                                    
                                    {interview.category && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-6 h-6 bg-gradient-to-br ${getCategoryColor(interview.category)} rounded-lg flex items-center justify-center text-xs text-white`}>
                                                {getCategoryIcon(interview.category)}
                                            </div>
                                            <span className="text-xs font-medium capitalize">{interview.category}</span>
                                        </div>
                                    )}
                                    
                                    {interview.score > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${getScoreColor(interview.score)}`}>
                                                {interview.score}/5
                                        </span>
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
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            {searchTerm || filterCategory !== 'all' ? 'No matching interviews' : 'No interviews yet'}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {searchTerm || filterCategory !== 'all' 
                                ? 'Try adjusting your search or filter criteria' 
                                : 'Start your first interview to begin improving your skills'
                            }
                        </p>
                        {!searchTerm && filterCategory === 'all' && (
                            <Button 
                                onClick={() => router.push('/dashboard')}
                                className="btn-modern hover-glow bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Interview
                            </Button>
                        )}
                    </div>
                )}
                        </div>
        </div>
    )
}

export default page
