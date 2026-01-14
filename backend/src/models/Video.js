import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            index: true, // For search
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        videoUrl: {
            type: String,
            required: [true, 'Video URL is required'],
        },
        thumbnailUrl: {
            type: String,
            required: [true, 'Thumbnail URL is required'],
        },
        views: {
            type: Number,
            default: 0,
        },
        duration: {
            type: String, // e.g., "10:30"
            required: true,
        },
        durationSec: {
            type: Number,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tags: {
            type: [String],
            default: [],
            index: true
        },
        category: {
            type: String,
            default: 'Other',
            enum: ['Music', 'Gaming', 'Technology', 'Education', 'Vlog', 'Entertainment', 'Other'],
            index: true
        },
        visibility: {
            type: String,
            enum: ['public', 'private', 'unlisted'],
            default: 'public',
            index: true
        },
    },
    {
        timestamps: true,
    }
);

// Add text index for search
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Video = mongoose.model('Video', videoSchema);

export default Video;
