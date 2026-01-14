import Note from '../models/Note.js';
import Video from '../models/Video.js';

// @desc    Get notes for a video
// @route   GET /api/videos/:id/notes
// @access  Public
export const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ video: req.params.id }).sort({ timestamp: 1 });
        res.json({ success: true, count: notes.length, data: notes });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add a note to a video
// @route   POST /api/videos/:id/notes
// @access  Private (Owner only)
export const addNote = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        // Check ownership
        if (video.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to add notes to this video' });
        }

        const note = await Note.create({
            video: req.params.id,
            content: req.body.content,
            timestamp: req.body.timestamp,
            duration: req.body.duration || 5
        });

        res.status(201).json({ success: true, data: note });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a note
// @route   DELETE /api/videos/notes/:noteId
// @access  Private (Owner only)
export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        const video = await Video.findById(note.video);

        // Check ownership (via video owner)
        if (video.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this note' });
        }

        await note.deleteOne();

        res.json({ success: true, message: 'Note removed' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
