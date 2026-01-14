import Scene from '../models/Scene.js';
import Video from '../models/Video.js';

// @desc    Get scenes for a video
// @route   GET /api/videos/:id/scenes
// @access  Public
export const getScenes = async (req, res) => {
    try {
        const scenes = await Scene.find({ video: req.params.id }).sort({ timestamp: 1 });
        res.json({ success: true, count: scenes.length, data: scenes });
    } catch (error) {
        console.error('Get scenes error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add a scene to a video
// @route   POST /api/videos/:id/scenes
// @access  Private (Owner only)
export const addScene = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        // Check ownership
        if (video.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to add scenes to this video' });
        }

        const scene = await Scene.create({
            video: req.params.id,
            title: req.body.title,
            timestamp: req.body.timestamp,
            description: req.body.description
        });

        res.status(201).json({ success: true, data: scene });
    } catch (error) {
        console.error('Add scene error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Scene at this timestamp already exists' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a scene
// @route   DELETE /api/videos/scenes/:sceneId
// @access  Private (Owner only)
export const deleteScene = async (req, res) => {
    try {
        const scene = await Scene.findById(req.params.sceneId);

        if (!scene) {
            return res.status(404).json({ success: false, message: 'Scene not found' });
        }

        const video = await Video.findById(scene.video);

        // Check ownership (via video owner)
        if (video.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this scene' });
        }

        await scene.deleteOne();

        res.json({ success: true, message: 'Scene removed' });
    } catch (error) {
        console.error('Delete scene error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
