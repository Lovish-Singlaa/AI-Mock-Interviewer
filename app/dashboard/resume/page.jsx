"use client"
import React, { useEffect, useState, useRef, useContext } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { UserContext } from '../../context/UserContext'

const BRAND = { violet: '#6C3FFE', pink: '#FF5E7D', green: '#00C47A', amber: '#FFAA00' }

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } } }

export default function ResumePage() {
    const [documents, setDocuments] = useState([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef(null)
    const { user } = useContext(UserContext)

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/documents')
            if (response.data.success) {
                setDocuments(response.data.documents)
            }
        } catch (error) {
            console.error('Error fetching documents:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    const handleUpload = async (file) => {
        if (!file) return

        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are supported')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be under 5MB')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await axios.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.data.success) {
                toast.success(`Resume processed! ${response.data.document.chunksCount} sections extracted.`)
                fetchDocuments()
            } else {
                toast.error(response.data.message || 'Upload failed')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload resume')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (docId) => {
        try {
            const response = await axios.delete(`/api/documents?id=${docId}`)
            if (response.data.success) {
                toast.success('Resume deleted')
                fetchDocuments()
            }
        } catch (error) {
            toast.error('Failed to delete resume')
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleUpload(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = () => setDragOver(false)

    const hasResume = documents.length > 0

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-4xl"
                >📄</motion.div>
                <div>
                    <h1 className="text-3xl font-extrabold text-primary">My Resume</h1>
                    <p className="text-muted-foreground text-sm">
                        Upload your resume for AI-personalized interview questions
                    </p>
                </div>
            </motion.div>

            {/* How it works */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-2xl p-5 mb-6 flex items-start gap-3"
                style={{ background: '#EEE5FF', border: '1.5px solid #6C3FFE20' }}
            >
                <span className="text-2xl">🧠</span>
                <div>
                    <p className="text-sm font-bold text-primary mb-1">How RAG Works</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Your resume is split into sections and converted into embeddings.
                        When you create an interview, we find the most relevant sections from your resume
                        and use them to generate personalized questions about <strong>your actual experience</strong> —
                        not just generic role-based questions.
                    </p>
                </div>
            </motion.div>

            {/* Upload zone */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.1 }}
            >
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="rounded-3xl p-10 text-center cursor-pointer transition-all duration-300"
                    style={{
                        background: dragOver ? '#EEE5FF' : '#FFFFFF',
                        border: dragOver ? `2.5px dashed ${BRAND.violet}` : '2px dashed #E5E6F3',
                        boxShadow: dragOver ? `0 4px 24px ${BRAND.violet}20` : '0 1px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files[0])}
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-12 w-12 animate-spin" style={{ color: BRAND.violet }} />
                            <p className="font-bold text-primary">Processing your resume...</p>
                            <p className="text-xs text-muted-foreground">Extracting text, chunking, and generating embeddings</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            >
                                <Upload className="h-12 w-12" style={{ color: BRAND.violet }} />
                            </motion.div>
                            <p className="font-bold text-primary">
                                {hasResume ? 'Replace Resume' : 'Upload Your Resume'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Drag & drop a PDF here, or click to browse • Max 5MB
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Current resume */}
            <AnimatePresence>
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center items-center py-12"
                    >
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </motion.div>
                ) : hasResume ? (
                    documents.map((doc) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-6 rounded-3xl overflow-hidden shadow-lg"
                            style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}
                        >
                            <div className="h-1.5 w-full" style={{ background: BRAND.green }} />
                            <div className="p-6">
                                {/* File header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: '#E6FFF5' }}>
                                            <CheckCircle className="h-5 w-5" style={{ color: BRAND.green }} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{doc.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Uploaded {new Intl.DateTimeFormat('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                }).format(new Date(doc.createdAt))}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(doc.id)}
                                        className="rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                </div>

                                {/* Resume text preview */}
                                <div className="rounded-2xl p-4 max-h-80 overflow-y-auto"
                                    style={{ background: '#F4F4FF', border: '1.5px solid #E5E6F3' }}>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                        Extracted Content Preview
                                    </p>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                        {doc.rawText?.length > 2000
                                            ? doc.rawText.slice(0, 2000) + '...'
                                            : doc.rawText}
                                    </p>
                                </div>

                                {/* Status badge */}
                                <div className="mt-4 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-full w-fit"
                                    style={{ background: '#E6FFF5', color: BRAND.green }}>
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Ready for personalized interviews
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 rounded-3xl p-8 text-center"
                        style={{ background: '#FFFFFF', border: '1.5px solid #E5E6F3' }}
                    >
                        <div className="text-5xl mb-3">📋</div>
                        <p className="font-bold text-sm mb-1">No resume uploaded yet</p>
                        <p className="text-xs text-muted-foreground">
                            Upload your resume to get personalized interview questions based on your experience
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
