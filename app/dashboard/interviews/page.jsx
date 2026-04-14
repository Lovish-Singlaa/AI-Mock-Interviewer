"use client"
import { UserContext } from '@/app/context/UserContext'
import React, { useContext, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Layers, Star, Target, Sparkles, FileText, Search, Filter, SortAsc, LoaderCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const interviewCategories = {
    all: { name: 'All Categories', icon: '📋' },
    technical: { name: 'Technical', icon: '💻', color: '#6C3FFE' },
    behavioral: { name: 'Behavioral', icon: '🤝', color: '#00C47A' },
    leadership: { name: 'Leadership', icon: '👑', color: '#FF5E7D' },
    'case-study': { name: 'Case Study', icon: '📊', color: '#FFAA00' },
    'system-design': { name: 'System Design', icon: '🏗️', color: '#00D4FF' },
    coding: { name: 'Coding', icon: '⚡', color: '#FF5E7D' },
    general: { name: 'General', icon: '🎯', color: '#6C3FFE' }
}

const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function AllInterviewsPage() {
    const { user } = useContext(UserContext)
    const [interviews, setInterviews] = useState(null)
    const [fetching, setFetching] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const router = useRouter()

    useEffect(() => {
        const getInterviews = async () => {
            try {
                setFetching(true)
                const response = await axios.get('/api/get-interviews')
                setInterviews(response.data)
            } catch (error) {
                console.error(error)
                setInterviews([])
            } finally {
                setFetching(false)
            }
        }
        if (user) getInterviews()
    }, [user])

    const filtered = (interviews || []).filter(i => {
        const matchesSearch = i.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              i.jobDescription.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === 'all' || i.category === filterCategory
        return matchesSearch && matchesCategory
    }).sort((a, b) => {
        switch (sortBy) {
            case 'newest': return new Date(b.createdAt) - new Date(a.createdAt)
            case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt)
            case 'score-high': return (b.score || 0) - (a.score || 0)
            case 'score-low': return (a.score || 0) - (b.score || 0)
            default: return 0
        }
    })

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <motion.div className="text-4xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                        📋
                    </motion.div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-primary">All Interviews</h1>
                        <p className="text-muted-foreground font-medium">Review your history and track progress</p>
                    </div>
                </div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button className="btn-modern text-white font-bold rounded-xl px-5 py-2.5 shadow-lg"
                        style={{ background: "#6C3FFE" }}
                        onClick={() => router.push('/dashboard')}>
                        <Plus className="mr-2 h-4 w-4" /> New Interview
                    </Button>
                </motion.div>
            </motion.div>

            {/* ── CONTROLS ── */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
                <div className="vibrant-card p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <Input placeholder="Search interviews..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-12 rounded-xl border-2 focus:border-primary" />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full md:w-[220px] h-12 rounded-xl border-2 focus:border-primary font-semibold">
                            <Filter className="h-4 w-4 mr-2 text-primary" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(interviewCategories).map(([k, v]) => (
                                <SelectItem key={k} value={k}>
                                    <div className="flex items-center gap-2"><span>{v.icon}</span><span>{v.name}</span></div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full md:w-[200px] h-12 rounded-xl border-2 focus:border-primary font-semibold">
                            <SortAsc className="h-4 w-4 mr-2 text-primary" />
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First 📉</SelectItem>
                            <SelectItem value="oldest">Oldest First 📈</SelectItem>
                            <SelectItem value="score-high">Highest Score ⭐</SelectItem>
                            <SelectItem value="score-low">Lowest Score</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* ── LIST ── */}
            {fetching ? (
                <div className="flex justify-center items-center py-20">
                    <div className="text-5xl animate-bounce-gentle">🔄</div>
                </div>
            ) : filtered.length > 0 ? (
                <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {filtered.map((interview) => {
                            const isPending = interview.score === 0
                            const catData = interviewCategories[interview.category] || interviewCategories.general
                            return (
                                <motion.div key={interview._id} variants={fadeUp} layout initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.9 }}
                                    className="vibrant-card overflow-hidden flex flex-col hover-lift">
                                    <div className="h-1.5 w-full" style={{ background: catData.color }} />
                                    <div className="p-5 flex flex-col gap-3 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="text-3xl">{catData.icon}</div>
                                                <div>
                                                    <h3 className="font-extrabold text-sm line-clamp-1">{interview.jobRole}</h3>
                                                    <p className="text-xs font-semibold text-muted-foreground capitalize">{interview.category}</p>
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                                                style={{ background: isPending ? "#FFF8E6" : "#E6FFF5", color: isPending ? "#FFAA00" : "#00C47A" }}>
                                                {isPending ? "⏳ Pending" : "✅ Done"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mt-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(interview.createdAt))}
                                        </div>
                                        <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {interview.jobDescription}
                                        </div>
                                        {interview.score > 0 && (
                                            <div className="flex items-center gap-1.5 mt-auto pt-2">
                                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                <span className="text-base font-extrabold">{interview.score}/5</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 pt-0 mt-auto">
                                        <Button variant={isPending ? "default" : "outline"} className={`w-full rounded-xl font-bold btn-modern ${isPending ? "text-white" : ""}`}
                                            style={isPending ? { background: "#6C3FFE" } : {}} asChild>
                                            <Link href={isPending ? `/dashboard/interviews/${interview._id}/start` : `/dashboard/interviews/${interview._id}/feedback`}>
                                                {isPending ? "▶ Start Interview" : "📊 View Results"}
                                            </Link>
                                        </Button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="vibrant-card p-16 text-center flex flex-col items-center">
                    <div className="text-7xl mb-4 animate-float">🔍</div>
                    <h3 className="text-2xl font-extrabold mb-2">No interviews found</h3>
                    <p className="text-muted-foreground">Try adjusting your search filters or start a new interview.</p>
                </motion.div>
            )}
        </div>
    )
}
