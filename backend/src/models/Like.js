import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate likes from the same user on the same video
likeSchema.index({ user: 1, video: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;
