import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
            required: true
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            trim: true,
            maxlength: [100, 'Note cannot be more than 100 characters']
        },
        timestamp: {
            type: Number, // Seconds where the note appears
            required: true
        },
        duration: {
            type: Number, // How long it stays visible
            default: 5
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Note', noteSchema);
