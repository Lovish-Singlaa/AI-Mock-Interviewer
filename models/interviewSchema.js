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
        }
    }],
    score:{
        type: Number,
        default: -1,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

interviewSchema.pre('save', function (next) {
    console.log("Calculating score...");
    if (this.questions && this.questions.length > 0) {
        const totalRating = this.questions.reduce((sum, question) => {
            return sum + (question.rating || 0);
        }, 0);
        this.score = Math.round(totalRating / this.questions.length);
    } else {
        this.score = -1;
    }
    next();
}); 

const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
export default Interview;