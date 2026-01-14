import React, { useState } from 'react';
import { FaPlus, FaTimes, FaBookmark, FaTrash } from 'react-icons/fa';
import api from '../api/axios';

const SceneList = ({ videoId, currentTime, scenes, onSceneAdded, onSceneDeleted, onSeek }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAddScene = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            const response = await api.post(`/videos/${videoId}/scenes`, {
                title,
                timestamp: Math.floor(currentTime)
            });

            if (response.data.success) {
                onSceneAdded(response.data.data);
                setTitle('');
                setIsAddMode(false);
            }
        } catch (error) {
            console.error('Error adding scene:', error);
            alert('Failed to add scene. It might duplicate a timestamp.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, sceneId) => {
        e.stopPropagation();
        if (!window.confirm('Delete this chapter?')) return;

        try {
            await api.delete(`/videos/scenes/${sceneId}`);
            onSceneDeleted(sceneId);
        } catch (error) {
            console.error('Error deleting scene:', error);
            alert('Failed to delete scene');
        }
    };

    // Determine current scene
    const currentSceneId = scenes.length > 0
        ? [...scenes].reverse().find(s => currentTime >= s.timestamp)?._id
        : null;

    if (scenes.length === 0 && !isAddMode) {
        return (
            <div className="mt-6">
                <button
                    onClick={() => setIsAddMode(true)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400 font-medium text-sm transition-colors"
                >
                    <FaPlus /> Add Chapter Markers
                </button>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-[#1E293B] rounded-xl overflow-hidden border border-[#334155]">
            <div className="p-4 bg-[#0F172A] border-b border-[#334155] flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <FaBookmark className="text-blue-500" />
                    Chapters
                </h3>
                <button
                    onClick={() => setIsAddMode(!isAddMode)}
                    className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                    {isAddMode ? <FaTimes /> : <FaPlus />}
                    {isAddMode ? 'Cancel' : 'Add Chapter'}
                </button>
            </div>

            {isAddMode && (
                <form onSubmit={handleAddScene} className="p-4 border-b border-[#334155] bg-[#1E293B]">
                    <p className="text-gray-400 text-xs mb-2">Adding chapter at <span className="text-white font-mono">{formatTime(currentTime)}</span></p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={50}
                            placeholder="Chapter Title (e.g. Introduction)"
                            className="flex-1 bg-[#0F172A] border border-[#334155] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!title.trim() || loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            )}

            <div className="max-h-64 overflow-y-auto">
                {scenes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">No chapters added yet.</p>
                ) : (
                    <div className="divide-y divide-[#334155]">
                        {scenes.map(scene => (
                            <div
                                key={scene._id}
                                onClick={() => onSeek(scene.timestamp)}
                                className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between group ${currentSceneId === scene._id
                                        ? 'bg-blue-900/20 hover:bg-blue-900/30 border-l-4 border-blue-500'
                                        : 'hover:bg-[#334155]/50 border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${currentSceneId === scene._id ? 'bg-blue-500 text-white' : 'bg-[#334155] text-gray-400'
                                        }`}>
                                        {formatTime(scene.timestamp)}
                                    </span>
                                    <span className={`text-sm font-medium ${currentSceneId === scene._id ? 'text-blue-400' : 'text-gray-300'
                                        }`}>
                                        {scene.title}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, scene._id)}
                                    className="text-gray-500 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Chapter"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SceneList;
