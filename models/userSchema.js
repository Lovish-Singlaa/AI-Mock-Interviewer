import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    interviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    }],
    
    // Analytics and Progress Tracking
    analytics: {
        totalInterviews: { type: Number, default: 0 },
        completedInterviews: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        totalPracticeTime: { type: Number, default: 0 }, // in minutes
        streakDays: { type: Number, default: 0 },
        lastPracticeDate: { type: Date },
        bestScore: { type: Number, default: 0 },
        improvementRate: { type: Number, default: 0 },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        preferredCategories: [{ type: String }]
    },
    
    // User Preferences
    preferences: {
        interviewDuration: { type: Number, default: 30 }, // minutes
        questionCount: { type: Number, default: 5 },
        difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
        enableVideo: { type: Boolean, default: true },
        enableAudio: { type: Boolean, default: true },
        autoSave: { type: Boolean, default: true },
        notifications: { type: Boolean, default: true },
        theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' }
    },
    
    // Learning Path
    learningPath: {
        currentLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        completedModules: [{ type: String }],
        currentModule: { type: String },
        progress: { type: Number, default: 0 }, // percentage
        goals: [{
            title: String,
            targetScore: Number,
            targetDate: Date,
            completed: { type: Boolean, default: false }
        }]
    },
    
    // Subscription and Usage
    subscription: {
        plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
        startDate: { type: Date },
        endDate: { type: Date },
        interviewsRemaining: { type: Number, default: 3 },
        features: [{ type: String }]
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update analytics when user data changes
userSchema.methods.updateAnalytics = async function() {
    const Interview = mongoose.model('Interview');
    const userInterviews = await Interview.find({ userId: this._id });
    
    const completedInterviews = userInterviews.filter(interview => interview.score > 0);
    const totalScores = completedInterviews.reduce((sum, interview) => sum + interview.score, 0);
    
    this.analytics.totalInterviews = userInterviews.length;
    this.analytics.completedInterviews = completedInterviews.length;
    this.analytics.averageScore = completedInterviews.length > 0 ? totalScores / completedInterviews.length : 0;
    this.analytics.bestScore = Math.max(...completedInterviews.map(i => i.score), 0);
    
    // Calculate improvement rate
    if (completedInterviews.length > 1) {
        const sortedInterviews = completedInterviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const firstHalf = sortedInterviews.slice(0, Math.ceil(sortedInterviews.length / 2));
        const secondHalf = sortedInterviews.slice(Math.ceil(sortedInterviews.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, i) => sum + i.score, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, i) => sum + i.score, 0) / secondHalf.length;
        
        this.analytics.improvementRate = secondHalfAvg - firstHalfAvg;
    }
    
    await this.save();
};

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;