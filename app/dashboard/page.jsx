"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, FileText, Layers, LoaderCircle, Star, Plus, TrendingUp, Trophy, Zap, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const interviewCategories = {
    technical: { name: 'Technical', description: 'Problem-solving & coding skills', icon: '💻', color: '#6C3FFE' },
    behavioral: { name: 'Behavioral', description: 'Soft skills & cultural fit', icon: '🤝', color: '#00C47A' },
    leadership: { name: 'Leadership', description: 'Management & leadership', icon: '👑', color: '#FF5E7D' },
    'case-study': { name: 'Case Study', description: 'Business analysis', icon: '📊', color: '#FFAA00' },
    'system-design': { name: 'System Design', description: 'Architecture challenges', icon: '🏗️', color: '#00D4FF' },
    coding: { name: 'Coding', description: 'Algorithm problems', icon: '⚡', color: '#FF5E7D' },
    general: { name: 'General', description: 'Mixed questions', icon: '🎯', color: '#6C3FFE' },
}

const difficultyLevels = {
    beginner: { name: 'Beginner 🌱', description: 'Entry-level positions' },
    intermediate: { name: 'Intermediate ⚡', description: '2-5 years experience' },
    advanced: { name: 'Advanced 🔥', description: 'Senior positions' },
}

const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

function StatCard({ icon, emoji, value, label, bg, delay }) {
    const [hovered, setHovered] = useState(false)
    return (
        <motion.div
            variants={fadeUp}
            className="stat-card p-5 rounded-2xl"
            style={{ animationDelay: `${delay}s` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="flex items-start justify-between mb-3">
                <motion.div
                    className="text-3xl"
                    animate={hovered ? { scale: 1.3, rotate: 15 } : { y: [0, -6, 0] }}
                    transition={hovered ? { type: "spring", stiffness: 400, damping: 10 } : { duration: 2.5, repeat: Infinity }}
                >
                    {emoji}
                </motion.div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: bg }}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-extrabold mb-0.5" style={{ color: bg }}>{value}</div>
            <div className="text-xs font-semibold text-muted-foreground">{label}</div>
        </motion.div>
    )
}

function CategoryCard({ category, data, onClick }) {
    const [hovered, setHovered] = useState(false)
    return (
        <motion.div
            variants={fadeUp}
            className="vibrant-card p-5 cursor-pointer flex flex-col gap-3"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="flex items-center gap-3">
                <motion.div
                    className="text-3xl"
                    animate={hovered ? { scale: 1.35, rotate: 12 } : { y: [0, -6, 0] }}
                    transition={hovered ? { type: "spring", stiffness: 350, damping: 12 } : { duration: 3, repeat: Infinity }}
                >
                    {data.icon}
                </motion.div>
                <div>
                    <div className="font-bold text-sm">{data.name}</div>
                    <div className="text-xs text-muted-foreground">{data.description}</div>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: data.color }}>
                <Zap className="h-3 w-3" /> Click to start
            </div>
        </motion.div>
    )
}

function InterviewCard({ interview, index }) {
    const [hovered, setHovered] = useState(false)
    function formatDate(dateString) {
        return new Intl.DateTimeFormat("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit",
        }).format(new Date(dateString))
    }
    const categoryData = interviewCategories[interview.category] || interviewCategories.general
    const isPending = interview.score === 0

    return (
        <motion.div
            variants={fadeUp}
            className="vibrant-card overflow-hidden flex flex-col"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Color top bar */}
            <div className="h-1 w-full" style={{ background: categoryData.color }} />
            <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <motion.div
                            className="text-2xl shrink-0"
                            animate={hovered ? { scale: 1.3, rotate: 12 } : {}}
                            transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        >
                            {categoryData.icon}
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-sm leading-tight">{interview.jobRole}</h3>
                            <p className="text-xs text-muted-foreground capitalize">{interview.category}</p>
                        </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                            background: isPending ? "#FFF8E6" : "#E6FFF5",
                            color: isPending ? "#FFAA00" : "#00C47A",
                            border: `1.5px solid ${isPending ? "#FFAA0040" : "#00C47A40"}`
                        }}>
                        {isPending ? "⏳ Pending" : "✅ Done"}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(interview.createdAt)}
                </div>

                <div className="text-xs text-muted-foreground line-clamp-2">
                    {interview.jobDescription.length > 80
                        ? `${interview.jobDescription.slice(0, 80)}...`
                        : interview.jobDescription}
                    {" • "}{interview.experience} yrs
                </div>

                {interview.score > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">{interview.score}/5</span>
                    </div>
                )}
            </div>

            <div className="px-5 pb-5">
                <Button
                    variant={isPending ? "default" : "outline"}
                    size="sm"
                    className={`w-full rounded-xl font-bold text-sm btn-modern ${isPending ? "text-white" : ""}`}
                    style={isPending ? { background: "#6C3FFE" } : {}}
                    asChild
                >
                    <Link href={isPending
                        ? `/dashboard/interviews/${interview._id}/start`
                        : `/dashboard/interviews/${interview._id}/feedback`
                    }>
                        {isPending ? "▶ Start Interview" : "📊 View Results"}
                    </Link>
                </Button>
            </div>
        </motion.div>
    )
}

const page = () => {
    const [openDialog, setOpenDialog] = useState(false)
    const [jobRole, setJobRole] = useState('')
    const [jobDesc, setJobDesc] = useState('')
    const [jobExp, setJobExp] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('general')
    const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate')
    const [questionCount, setQuestionCount] = useState(5)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [interviews, setInterviews] = useState(null)
    const [fetching, setFetching] = useState(false)
    const [analytics, setAnalytics] = useState(null)

    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const response = await axios.get('/api/user')
            setUser(response.data.user)
        }
        getUser()
    }, [])

    useEffect(() => {
        const getInterviews = async () => {
            try {
                setFetching(true)
                const response = await axios.get('/api/get-interviews', {})
                setInterviews(response.data)
                if (response.data && response.data.length > 0) {
                    const completed = response.data.filter(i => i.score > 0)
                    const avgScore = completed.length > 0
                        ? completed.reduce((s, i) => s + i.score, 0) / completed.length : 0
                    const best = Math.max(...completed.map(i => i.score), 0)
                    setAnalytics({
                        totalInterviews: response.data.length,
                        completedInterviews: completed.length,
                        averageScore: Math.round(avgScore * 10) / 10,
                        bestScore: best,
                        totalPracticeTime: response.data.length * 30,
                        improvementRate: (() => {
                            if (completed.length < 2) return 0
                            const sorted = completed.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                            const half = Math.ceil(sorted.length / 2)
                            const a1 = sorted.slice(0, half).reduce((s, i) => s + i.score, 0) / half
                            const a2 = sorted.slice(half).reduce((s, i) => s + i.score, 0) / (sorted.length - half)
                            return Math.round((a2 - a1) * 10) / 10
                        })()
                    })
                }
            } catch {
                setInterviews([])
            } finally {
                setFetching(false)
            }
        }
        if (user) getInterviews()
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const qRes = await axios.post('/api/generate-questions', {
                jobRole, jobDesc, jobExp, selectedCategory, selectedDifficulty, questionCount
            })
            if (!qRes.data.success) throw new Error(qRes.data.message || 'Failed to generate')
            const response = await axios.post('/api/interviews', {
                jobRole, jobDesc, jobExp,
                category: selectedCategory,
                difficulty: selectedDifficulty,
                questions: qRes.data.questions,
                userId: user?._id
            })
            const interviewId = response.data.interviewId
            toast.success('Interview ready! Let\'s go 🚀')
            router.push(`/dashboard/interviews/${interviewId}/start`)
            setOpenDialog(false)
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">

            {/* ── HEADER ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center mb-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl">👋</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
                            Dashboard
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium">
                        Welcome back, <span className="text-primary font-bold">{user?.name?.split(" ")[0] || "Champ"}</span>! Ready to practice?
                    </p>
                </div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button
                        className="btn-modern text-white font-bold rounded-xl px-5 py-2.5 shadow-lg"
                        style={{ background: "#6C3FFE" }}
                        onClick={() => setOpenDialog(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Interview
                    </Button>
                </motion.div>
            </motion.div>

            {/* ── STATS ── */}
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8"
            >
                <StatCard emoji="📋" icon={<FileText className="h-4 w-4" />} value={analytics?.totalInterviews || 0} label="Total Interviews" bg="#6C3FFE" delay={0} />
                <StatCard emoji="⭐" icon={<Star className="h-4 w-4" />} value={`${analytics?.averageScore || 0}/5`} label="Avg Score" bg="#FF5E7D" delay={0.1} />
                <StatCard emoji="⏱️" icon={<Clock className="h-4 w-4" />} value={`${analytics?.totalPracticeTime || 0}m`} label="Practice Time" bg="#FFAA00" delay={0.2} />
                <StatCard emoji="🏆" icon={<Trophy className="h-4 w-4" />} value={`${analytics?.bestScore || 0}/5`} label="Best Score" bg="#00C47A" delay={0.3} />
            </motion.div>

            {/* ── QUICK START ── */}
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="mb-10"
            >
                <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-5">
                    <span className="text-2xl">⚡</span>
                    <h2 className="text-xl font-extrabold">Quick Start</h2>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: "#EEE5FF", color: "#6C3FFE" }}>
                        Choose a category
                    </span>
                </motion.div>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Object.entries(interviewCategories).map(([key, cat]) => (
                        <CategoryCard key={key} category={key} data={cat}
                            onClick={() => { setSelectedCategory(key); setOpenDialog(true) }} />
                    ))}
                </div>
            </motion.div>

            {/* ── RECENT INTERVIEWS ── */}
            <motion.div variants={stagger} initial="hidden" animate="show">
                <motion.div variants={fadeUp} className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🎯</span>
                        <h2 className="text-xl font-extrabold">Your Interviews</h2>
                    </div>
                    {interviews?.length > 3 && (
                        <Link href="/dashboard/interviews">
                            <Button variant="outline" size="sm" className="rounded-xl font-bold border-2 hover:border-primary">
                                View All →
                            </Button>
                        </Link>
                    )}
                </motion.div>

                {fetching ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="flex flex-col items-center gap-3">
                            <div className="text-5xl animate-bounce-gentle">🔄</div>
                            <p className="text-muted-foreground font-semibold">Loading interviews...</p>
                        </div>
                    </div>
                ) : interviews && interviews.length > 0 ? (
                    <motion.div
                        variants={stagger}
                        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {interviews.slice(0, 3).map((interview, index) => (
                            <InterviewCard key={interview._id} interview={interview} index={index} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div variants={fadeUp}
                        className="vibrant-card p-12 text-center flex flex-col items-center gap-4">
                        <motion.div
                            className="text-7xl"
                            animate={{ y: [0, -16, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            🎤
                        </motion.div>
                        <h3 className="text-xl font-extrabold">No interviews yet!</h3>
                        <p className="text-muted-foreground max-w-xs">
                            Start your first AI-powered interview session and begin your journey to your dream job.
                        </p>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Button
                                onClick={() => setOpenDialog(true)}
                                className="btn-modern text-white font-bold rounded-xl px-6 py-3"
                                style={{ background: "#6C3FFE" }}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Create First Interview
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>

            {/* ── NEW INTERVIEW DIALOG ── */}
            <AnimatePresence>
                {openDialog && (
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogContent className="sm:max-w-2xl rounded-3xl overflow-hidden p-0"
                            style={{ background: "#FFFFFF", border: "1.5px solid #E5E6F3" }}>
                            {/* Rainbow top strip */}
                            <div className="h-1.5 w-full" style={{ background: "#6C3FFE" }} />
                            <div className="p-6 md:p-8">
                                <DialogHeader className="mb-6">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-3xl">🎯</span>
                                        <DialogTitle className="text-2xl font-extrabold text-primary">
                                            Create New Interview
                                        </DialogTitle>
                                    </div>
                                    <DialogDescription className="text-muted-foreground">
                                        Configure your session — our AI will generate personalized questions instantly.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="jobRole" className="text-sm font-bold">Job Title</Label>
                                            <Input
                                                id="jobRole" value={jobRole}
                                                onChange={(e) => setJobRole(e.target.value)}
                                                placeholder="e.g. Frontend Developer"
                                                className="h-11 rounded-xl border-2 focus:border-primary" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="jobExp" className="text-sm font-bold">Years of Experience</Label>
                                            <Input
                                                id="jobExp" value={jobExp}
                                                onChange={(e) => setJobExp(e.target.value)}
                                                placeholder="e.g. 3" type="number"
                                                className="h-11 rounded-xl border-2 focus:border-primary" required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="jobDesc" className="text-sm font-bold">Job Description</Label>
                                        <Textarea
                                            id="jobDesc" value={jobDesc}
                                            onChange={(e) => setJobDesc(e.target.value)}
                                            placeholder="Brief description of the role and responsibilities..."
                                            className="min-h-[80px] rounded-xl border-2 focus:border-primary" required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Interview Category</Label>
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger className="h-11 rounded-xl border-2 focus:border-primary">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(interviewCategories).map(([key, cat]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <div className="flex items-center gap-2">
                                                                <span>{cat.icon}</span>
                                                                <span>{cat.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Difficulty</Label>
                                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                                <SelectTrigger className="h-11 rounded-xl border-2 focus:border-primary">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(difficultyLevels).map(([key, lvl]) => (
                                                        <SelectItem key={key} value={key}>{lvl.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">No. of Questions</Label>
                                            <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                                                <SelectTrigger className="h-11 rounded-xl border-2 focus:border-primary">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[3, 5, 7, 10].map(c => (
                                                        <SelectItem key={c} value={c.toString()}>{c} questions</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}
                                            className="rounded-xl font-bold border-2">
                                            Cancel
                                        </Button>
                                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                            <Button
                                                type="submit" disabled={loading}
                                                className="btn-modern text-white font-bold rounded-xl px-7"
                                                style={{ background: "#6C3FFE" }}
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spinner" />
                                                        Generating...
                                                    </div>
                                                ) : "🚀 Create Interview"}
                                            </Button>
                                        </motion.div>
                                    </div>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    )
}

export default page
