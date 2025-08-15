import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    jobRole: {
        type: String,
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
    },
    
    // Interview Configuration
    category: {
        type: String,
        enum: ['technical', 'behavioral', 'leadership', 'case-study', 'system-design', 'coding', 'general'],
        default: 'general'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    template: {
        type: String,
        default: 'standard'
    },
    
    // Timing and Progress
    duration: {
        type: Number,
        default: 30 // minutes
    },
    timeSpent: {
        type: Number,
        default: 0 // minutes
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    
    // Questions with enhanced structure
    questions: [{
        question: {
            type: String,
            required: true,
        },
        answer: {
            type: String,
            required: true,
        },
        userResponse: {
            type: String,
            default: ''
        },
        feedback: {
            type: String,
            default: ''
        },
        rating: {
            type: Number,
            default: 0
        },
        timeSpent: {
            type: Number,
            default: 0 // seconds
        },
        category: {
            type: String,
            enum: ['technical', 'behavioral', 'leadership', 'problem-solving', 'communication'],
            default: 'general'
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },
        hints: [{
            type: String
        }],
        keywords: [{
            type: String
        }],
        expectedDuration: {
            type: Number,
            default: 180 // seconds
        }
    }],
    
    // Enhanced Scoring
    score: {
        type: Number,
        default: -1,
        required: true
    },
    detailedScores: {
        technical: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        problemSolving: { type: Number, default: 0 },
        confidence: { type: Number, default: 0 },
        overall: { type: Number, default: 0 }
    },
    
    // Analytics
    analytics: {
        totalQuestions: { type: Number, default: 0 },
        answeredQuestions: { type: Number, default: 0 },
        averageTimePerQuestion: { type: Number, default: 0 },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        improvementAreas: [{ type: String }],
        confidenceLevel: { type: Number, default: 0 }, // 0-100
        stressLevel: { type: Number, default: 0 }, // 0-100
        engagementScore: { type: Number, default: 0 } // 0-100
    },
    
    // User and Metadata
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String
    }],
    notes: {
        type: String,
        default: ''
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to calculate scores and analytics
interviewSchema.pre('save', function (next) {
    console.log("Calculating score and analytics...");
    
    // Update timestamps
    this.updatedAt = new Date();
    
    if (this.questions && this.questions.length > 0) {
        // Calculate overall score
        const totalRating = this.questions.reduce((sum, question) => {
            return sum + (question.rating || 0);
        }, 0);
        this.score = Math.round(totalRating / this.questions.length);
        
        // Calculate detailed scores
        const technicalQuestions = this.questions.filter(q => q.category === 'technical');
        const behavioralQuestions = this.questions.filter(q => q.category === 'behavioral');
        const communicationQuestions = this.questions.filter(q => q.category === 'communication');
        
        this.detailedScores.technical = technicalQuestions.length > 0 
            ? Math.round(technicalQuestions.reduce((sum, q) => sum + (q.rating || 0), 0) / technicalQuestions.length)
            : 0;
        this.detailedScores.communication = communicationQuestions.length > 0
            ? Math.round(communicationQuestions.reduce((sum, q) => sum + (q.rating || 0), 0) / communicationQuestions.length)
            : 0;
        this.detailedScores.overall = this.score;
        
        // Calculate analytics
        this.analytics.totalQuestions = this.questions.length;
        this.analytics.answeredQuestions = this.questions.filter(q => q.userResponse && q.userResponse.length > 0).length;
        
        const totalTimeSpent = this.questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
        this.analytics.averageTimePerQuestion = this.analytics.answeredQuestions > 0 
            ? Math.round(totalTimeSpent / this.analytics.answeredQuestions)
            : 0;
        
        // Determine strengths and weaknesses
        const highScoringQuestions = this.questions.filter(q => q.rating >= 4);
        const lowScoringQuestions = this.questions.filter(q => q.rating <= 2);
        
        this.analytics.strengths = [...new Set(highScoringQuestions.map(q => q.category))];
        this.analytics.weaknesses = [...new Set(lowScoringQuestions.map(q => q.category))];
        
        // Calculate confidence level based on response quality and time
        const confidenceFactors = this.questions.map(q => {
            if (!q.userResponse) return 0;
            const responseLength = q.userResponse.length;
            const timeEfficiency = q.timeSpent > 0 ? Math.min(100, (q.expectedDuration / q.timeSpent) * 100) : 50;
            const scoreFactor = (q.rating / 5) * 100;
            return (responseLength > 50 ? 20 : 10) + (timeEfficiency * 0.3) + (scoreFactor * 0.5);
        });
        
        this.analytics.confidenceLevel = Math.round(
            confidenceFactors.reduce((sum, factor) => sum + factor, 0) / confidenceFactors.length
        );
    } else {
        this.score = -1;
    }
    
    next();
});

// Instance method to calculate improvement suggestions
interviewSchema.methods.getImprovementSuggestions = function() {
    const suggestions = [];
    
    if (this.analytics.weaknesses.includes('technical')) {
        suggestions.push('Focus on technical concepts and problem-solving skills');
    }
    if (this.analytics.weaknesses.includes('communication')) {
        suggestions.push('Practice clear and concise communication');
    }
    if (this.analytics.weaknesses.includes('behavioral')) {
        suggestions.push('Prepare STAR method responses for behavioral questions');
    }
    if (this.analytics.averageTimePerQuestion > 300) {
        suggestions.push('Work on answering questions more efficiently');
    }
    if (this.analytics.confidenceLevel < 60) {
        suggestions.push('Build confidence through more practice sessions');
    }
    
    return suggestions;
};

// Static method to get interview templates
interviewSchema.statics.getTemplates = function() {
    return [
        {
            name: 'Technical Interview',
            category: 'technical',
            difficulty: 'intermediate',
            questionCount: 5,
            duration: 30
        },
        {
            name: 'Behavioral Interview',
            category: 'behavioral',
            difficulty: 'intermediate',
            questionCount: 5,
            duration: 25
        },
        {
            name: 'Leadership Interview',
            category: 'leadership',
            difficulty: 'advanced',
            questionCount: 5,
            duration: 35
        },
        {
            name: 'System Design Interview',
            category: 'system-design',
            difficulty: 'advanced',
            questionCount: 3,
            duration: 45
        },
        {
            name: 'Coding Interview',
            category: 'coding',
            difficulty: 'intermediate',
            questionCount: 4,
            duration: 40
        }
    ];
};

const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
export default Interview;