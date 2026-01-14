import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Optional: for anonymous views, this might be null
    },
    type: {
        type: String,
        enum: ['view', 'like'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        index: true // Important for date range queries
    }
}, {
    timestamps: true
});

// Index to quickly aggregate by video + type + date
analyticsSchema.index({ video: 1, type: 1, date: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
