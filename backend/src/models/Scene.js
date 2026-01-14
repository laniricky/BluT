import mongoose from 'mongoose';

const sceneSchema = new mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
            required: true
        },
        title: {
            type: String,
            required: [true, 'Scene title is required'],
            trim: true,
            maxlength: [50, 'Title cannot be more than 50 characters']
        },
        timestamp: {
            type: Number, // Seconds where the scene starts
            required: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot be more than 200 characters']
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate scenes at exact same timestamp for same video
sceneSchema.index({ video: 1, timestamp: 1 }, { unique: true });

export default mongoose.model('Scene', sceneSchema);
