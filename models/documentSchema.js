import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    documentType: {
        type: String,
        enum: ['resume'],
        default: 'resume'
    },
    chunks: [{
        content: {
            type: String,
            required: true
        },
        embedding: {
            type: [Number],
            required: true
        },
        metadata: {
            page: { type: Number, default: 1 },
            section: {
                type: String,
                enum: ['work_experience', 'education', 'projects', 'skills', 'achievements', 'other'],
                default: 'other'
            }
        }
    }],
    rawText: {
        type: String,
        required: true
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

// Pre-save middleware to update timestamp
documentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
export default Document;
