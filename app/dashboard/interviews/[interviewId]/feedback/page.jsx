"use client"
import React, { useEffect, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import axios from 'axios'
import { useParams } from 'next/navigation'
import {
    Calendar, ChevronsUpDown, Clock, HomeIcon, Star, Trophy,
    TrendingUp, CheckCircle, MessageSquare, Target, Sparkles,
    Brain, Zap, Award, ChevronRight, BarChart2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const BRAND = { violet: '#6C3FFE', pink: '#FF5E7D', cyan: '#00D4FF', green: '#00C47A', amber: '#FFAA00' }

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

/* ── Markdown renderer with branded styling ── */
const MarkdownContent = ({ content }) => {
    if (!content) return <span className="text-muted-foreground italic text-sm">No content provided.</span>
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-bold" style={{ color: BRAND.violet }}>{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                ul: ({ children }) => <ul className="list-none space-y-1.5 mt-2 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-none space-y-1.5 mt-2 mb-2 counter-reset-list">{children}</ol>,
                li: ({ children }) => (
                    <li className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: BRAND.violet }} />
                        <span>{children}</span>
                    </li>
                ),
                h1: ({ children }) => <h1 className="text-base font-extrabold mb-1" style={{ color: BRAND.violet }}>{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-extrabold mb-1" style={{ color: BRAND.violet }}>{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-700">{children}</h3>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 pl-3 my-2 text-sm italic text-gray-600" style={{ borderColor: BRAND.violet }}>
                        {children}
                    </blockquote>
                ),
                code: ({ children }) => (
                    <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: '#EEE5FF', color: BRAND.violet }}>
                        {children}
                    </code>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    )
}

/* ── Score ring ── */
function ScoreRing({ score, max = 5, size = 90 }) {
    const pct = score / max
    const r = (size - 10) / 2
    const circ = 2 * Math.PI * r
    const color = score >= 4 ? BRAND.green : score >= 3 ? BRAND.amber : BRAND.pink

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="absolute -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E6F3" strokeWidth={8} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - pct) }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
            </svg>
            <div className="z-10 text-center">
                <div className="text-xl font-extrabold leading-none" style={{ color }}>{score}</div>
                <div className="text-xs text-gray-400 font-medium">/{max}</div>
            </div>
        </div>
    )
}

/* ── Question accordion ── */
function QuestionCard({ question, index, total }) {
    const [open, setOpen] = useState(false)
    const score = question.rating || 0
    const scoreColor = score >= 4 ? BRAND.green : score >= 3 ? BRAND.amber : BRAND.pink
    const scoreBg = score >= 4 ? '#E6FFF5' : score >= 3 ? '#FFF8E6' : '#FFF0F3'

    return (
        <motion.div variants={fadeUp}>
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                    <motion.div
                        whileHover={{ scale: 1.005 }}
                        className="w-full text-left rounded-2xl p-5 cursor-pointer transition-all"
                        style={{
                            background: open ? '#FAFAFA' : '#FFFFFF',
                            border: open ? `2px solid ${BRAND.violet}30` : '1.5px solid #E5E6F3',
                            boxShadow: open ? `0 4px 24px ${BRAND.violet}12` : '0 1px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div className="flex items-center gap-4">
                            {/* Number badge */}
                            <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white text-sm"
                                style={{ background: BRAND.violet }}>
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-snug line-clamp-2 mb-1.5">
                                    {question.question}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Score pill */}
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: scoreBg, color: scoreColor }}>
                                        {score > 0 ? `${score}/5` : 'Pending'}
                                    </span>
                                    {/* Stars */}
                                    {score > 0 && (
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-3 w-3 ${i < score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    )}
                                    {question.userResponse && (
                                        <span className="text-xs text-muted-foreground">
                                            {question.userResponse.split(' ').length} words
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="shrink-0">
                                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                    <ChevronsUpDown className="h-5 w-5 text-muted-foreground" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </CollapsibleTrigger>

                <AnimatePresence>
                    {open && (
                        <CollapsibleContent forceMount asChild>
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 space-y-3">
                                    {/* Your answer */}
                                    {question.userResponse && (
                                        <div className="rounded-2xl p-5"
                                            style={{ background: '#FFF0F3', border: `1.5px solid ${BRAND.pink}25` }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <MessageSquare className="h-4 w-4" style={{ color: BRAND.pink }} />
                                                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: BRAND.pink }}>
                                                    Your Answer
                                                </span>
                                            </div>
                                            <div className="text-gray-700">
                                                <MarkdownContent content={question.userResponse} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Ideal answer */}
                                    {question.answer && (
                                        <div className="rounded-2xl p-5"
                                            style={{ background: '#E6FFF5', border: `1.5px solid ${BRAND.green}25` }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle className="h-4 w-4" style={{ color: BRAND.green }} />
                                                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: BRAND.green }}>
                                                    Ideal Answer
                                                </span>
                                            </div>
                                            <div className="text-gray-700">
                                                <MarkdownContent content={question.answer} />
                                            </div>
                                        </div>
                                    )}

                                    {/* AI feedback */}
                                    {question.feedback && (
                                        <div className="rounded-2xl p-5"
                                            style={{ background: '#EEE5FF', border: `1.5px solid ${BRAND.violet}25` }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Brain className="h-4 w-4" style={{ color: BRAND.violet }} />
                                                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: BRAND.violet }}>
                                                    AI Feedback
                                                </span>
                                            </div>
                                            <div className="text-gray-700">
                                                <MarkdownContent content={question.feedback} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </CollapsibleContent>
                    )}
                </AnimatePresence>
            </Collapsible>
        </motion.div>
    )
}

/* ── Main page ── */
const page = () => {
    const { interviewId } = useParams()
    const [interview, setInterview] = useState()
    const [activeTab, setActiveTab] = useState('questions')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/find-interview-by-id', { params: { id: interviewId } })
                setInterview(response.data)
            } catch (error) {
                console.error('Error fetching interview:', error)
            }
        }
        fetchData()
    }, [])

    const score = interview?.score || 0
    const questions = interview?.questions || []
    const answered = questions.filter(q => q.userResponse && q.userResponse.length > 0).length
    const scoreColor = score >= 4 ? BRAND.green : score >= 3 ? BRAND.amber : BRAND.pink
    const scoreBg = score >= 4 ? '#E6FFF5' : score >= 3 ? '#FFF8E6' : '#FFF0F3'

    function formatDate(dateString) {
        if (!dateString) return "—"
        return new Intl.DateTimeFormat("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit", hour12: true,
        }).format(new Date(dateString))
    }

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto" style={{ background: '#F4F4FF' }}>

            {/* ── HEADER ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-1">
                    <motion.div
                        animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-4xl"
                    >🏆</motion.div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-primary">Interview Results</h1>
                        <p className="text-muted-foreground text-sm">
                            {interview?.jobRole} · Completed {formatDate(interview?.createdAt)}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── SCORE HERO CARD ── */}
            {interview && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-3xl p-6 md:p-8 mb-6 shadow-lg"
                    style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}
                >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Score ring */}
                        <div className="flex flex-col items-center gap-3">
                            <ScoreRing score={score} size={110} />
                            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: scoreBg, color: scoreColor }}>
                                {score >= 4 ? '🌟 Excellent' : score >= 3 ? '⚡ Good' : '💪 Keep Practicing'}
                            </span>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-xl font-extrabold mb-1">Overall Performance</h2>
                            <p className="text-muted-foreground text-sm mb-5">
                                Based on {answered} answered questions
                            </p>
                            {/* Stat grid */}
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {[
                                    { emoji: '📋', label: 'Questions', value: questions.length, color: BRAND.violet, bg: '#EEE5FF' },
                                    { emoji: '✅', label: 'Answered', value: answered, color: BRAND.green, bg: '#E6FFF5' },
                                    { emoji: '⭐', label: 'Score', value: `${score}/5`, color: BRAND.amber, bg: '#FFF8E6' },
                                    { emoji: '⏱️', label: 'Est. Time', value: `${questions.length * 5}m`, color: BRAND.pink, bg: '#FFF0F3' },
                                ].map(({ emoji, label, value, color, bg }) => (
                                    <div key={label} className="rounded-2xl p-3 text-center" style={{ background: bg }}>
                                        <div className="text-xl mb-0.5">{emoji}</div>
                                        <div className="text-lg font-extrabold" style={{ color }}>{value}</div>
                                        <div className="text-xs text-muted-foreground font-medium">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Star bar */}
                    <div className="mt-6 pt-5" style={{ borderTop: '1.5px solid #E5E6F3' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Score Breakdown</span>
                            <span className="text-xs font-bold" style={{ color: scoreColor }}>{Math.round((score / 5) * 100)}%</span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: '#E5E6F3' }}>
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: scoreColor }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(score / 5) * 100}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── TAB BAR ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2 mb-6 p-1.5 rounded-2xl"
                style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3', width: 'fit-content' }}
            >
                {[
                    { id: 'questions', icon: <MessageSquare className="h-4 w-4" />, label: 'Q&A Review' },
                    { id: 'details', icon: <BarChart2 className="h-4 w-4" />, label: 'Session Details' },
                ].map(tab => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                        style={{
                            background: activeTab === tab.id ? BRAND.violet : 'transparent',
                            color: activeTab === tab.id ? '#fff' : '#6B7280'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </motion.button>
                ))}
            </motion.div>

            {/* ── Q&A REVIEW ── */}
            <AnimatePresence mode="wait">
                {activeTab === 'questions' && (
                    <motion.div
                        key="questions"
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {/* Expand tip */}
                        <motion.div variants={fadeUp}
                            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold"
                            style={{ background: '#EEE5FF', color: BRAND.violet }}>
                            <Zap className="h-4 w-4" />
                            Click any question to expand your answer, the ideal answer, and AI feedback.
                        </motion.div>

                        {questions.length > 0 ? (
                            questions.map((q, i) => (
                                <QuestionCard key={i} question={q} index={i} total={questions.length} />
                            ))
                        ) : (
                            <motion.div variants={fadeUp} className="text-center py-16 rounded-3xl"
                                style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}>
                                <div className="text-6xl mb-4">🤔</div>
                                <h3 className="font-extrabold text-lg mb-1">No questions yet</h3>
                                <p className="text-muted-foreground text-sm">Complete the interview session first.</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'details' && (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-3xl p-6 shadow-lg"
                        style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}
                    >
                        <h2 className="text-lg font-extrabold mb-5 text-primary">Session Details</h2>
                        <div className="space-y-3">
                            {[
                                { icon: <Target className="h-4 w-4" />, label: 'Job Role', value: interview?.jobRole, color: BRAND.violet, bg: '#EEE5FF' },
                                { icon: <TrendingUp className="h-4 w-4" />, label: 'Experience', value: `${interview?.experience} years`, color: BRAND.green, bg: '#E6FFF5' },
                                { icon: <Sparkles className="h-4 w-4" />, label: 'Category', value: interview?.category || 'General', color: BRAND.cyan, bg: '#E6FAFF' },
                                { icon: <Clock className="h-4 w-4" />, label: 'Duration', value: `~${questions.length * 5} minutes`, color: BRAND.amber, bg: '#FFF8E6' },
                                { icon: <Calendar className="h-4 w-4" />, label: 'Date', value: formatDate(interview?.createdAt), color: BRAND.pink, bg: '#FFF0F3' },
                            ].map(({ icon, label, value, color, bg }) => (
                                <div key={label} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: bg }}>
                                    <div className="flex items-center gap-2.5" style={{ color }}>
                                        {icon}
                                        <span className="text-sm font-bold">{label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">{value || '—'}</span>
                                </div>
                            ))}
                        </div>

                        {interview?.jobDescription && (
                            <div className="mt-5 p-4 rounded-2xl" style={{ background: '#F4F4FF', border: '1.5px solid #E5E6F3' }}>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Job Description</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{interview.jobDescription}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── CTA FOOTER ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 mt-8"
            >
                <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full rounded-xl font-bold border-2 h-12">
                        <HomeIcon className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full h-12 rounded-xl font-extrabold text-white flex items-center justify-center gap-2"
                        style={{ background: BRAND.violet, boxShadow: `0 4px 20px ${BRAND.violet}50` }}
                    >
                        <Zap className="h-4 w-4" /> Start New Interview
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    )
}

export default page
