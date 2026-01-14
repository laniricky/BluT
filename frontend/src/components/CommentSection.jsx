import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommentItem from './CommentItem';
import { FaUserCircle } from 'react-icons/fa';
import { CommentSkeleton } from './LoadingSkeleton';

const CommentSection = ({ videoId, currentTime, onSeek, scenes = [], isVideoOwner }) => { // Accepted isVideoOwner prop
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [includeTimestamp, setIncludeTimestamp] = useState(false);
    const [filterMode, setFilterMode] = useState('all'); // 'all' | 'scene'

    const handlePin = async (commentId) => {
        try {
            const response = await api.post(`/videos/comments/${commentId}/pin`);
            if (response.data.success) {
                // Update local state:
                // 1. Unpin all others (if strictly one pin allowed, backend logic does this, frontend should reflect)
                // 2. Toggle pin on target
                const newPinnedStatus = response.data.data.isPinned;

                setComments(prevComments => prevComments.map(c => {
                    if (c._id === commentId) {
                        return { ...c, isPinned: newPinnedStatus };
                    }
                    // If new status is true, unpin others (assuming single pin policy)
                    if (newPinnedStatus && c.isPinned) {
                        return { ...c, isPinned: false };
                    }
                    return c;
                }));
            }
        } catch (error) {
            console.error('Error toggling pin:', error);
            alert('Failed to pin comment.');
        }
    };

    const handleHeart = async (commentId) => {
        try {
            const response = await api.post(`/videos/comments/${commentId}/heart`);
            if (response.data.success) {
                setComments(prevComments => prevComments.map(c =>
                    c._id === commentId ? { ...c, isHearted: response.data.data.isHearted } : c
                ));
            }
        } catch (error) {
            console.error('Error toggling heart:', error);
        }
    };

    // Determine current scene
    const currentScene = useMemo(() => {
        if (!scenes || scenes.length === 0) return null;
        // scenes must be sorted by timestamp
        // Find the scene that starts before or at currentTime
        const active = [...scenes].reverse().find(s => currentTime >= s.timestamp);

        if (!active) return null;

        // Determine end time (timestamp of next scene or end of video - just next scene for now)
        const activeIndex = scenes.findIndex(s => s._id === active._id);
        const nextScene = scenes[activeIndex + 1];

        return {
            ...active,
            endTime: nextScene ? nextScene.timestamp : Infinity
        };
    }, [currentTime, scenes]);

    // Count comments for current scene
    const sceneCommentsCount = useMemo(() => {
        if (!currentScene) return 0;
        return comments.filter(c =>
            c.timestamp !== null &&
            c.timestamp >= currentScene.timestamp &&
            c.timestamp < currentScene.endTime
        ).length;
    }, [comments, currentScene]);

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await api.get(`/videos/${videoId}/comments`);
                if (response.data.success) {
                    setComments(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoading(false);
            }
        };

        if (videoId) fetchComments();
    }, [videoId]);

    // Group comments by parentId and apply filter
    const rootComments = useMemo(() => {
        let filtered = comments.filter(c => !c.parentId);

        if (filterMode === 'scene' && currentScene) {
            filtered = filtered.filter(c =>
                c.timestamp !== null &&
                c.timestamp >= currentScene.timestamp &&
                c.timestamp < currentScene.endTime
            );
        }

        // Sort: Pinned first, then Newest
        filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return filtered;
    }, [comments, filterMode, currentScene]);

    const getReplies = (commentId) => {
        return comments.filter(c => c.parentId === commentId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first for replies
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitLoading(true);
        try {
            const response = await api.post(`/videos/${videoId}/comments`, {
                content: newComment,
                timestamp: includeTimestamp ? Math.floor(currentTime) : null
            });

            if (response.data.success) {
                setComments([response.data.data, ...comments]);
                setNewComment('');
                setIncludeTimestamp(false);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to post comment.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleReply = async (parentId, content) => {
        try {
            const response = await api.post(`/videos/${videoId}/comments`, {
                content,
                parentId
            });

            if (response.data.success) {
                setComments([...comments, response.data.data]);
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            alert('Failed to post reply.');
        }
    };

    const handleUpdateLocal = (updatedComment) => {
        setComments(comments.map(c => c._id === updatedComment._id ? updatedComment : c));
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            const response = await api.delete(`/videos/comments/${commentId}`);
            if (response.data.success) {
                // Remove comment and any potential replies locally 
                // (Backend handles actual data, filtered list updates UI)
                setComments(comments.filter(c => c._id !== commentId && c.parentId !== commentId));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment.');
        }
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                    {comments.length} Comments
                </h3>

                {/* Filter Tabs */}
                {scenes.length > 0 && (
                    <div className="flex bg-[#1E293B] rounded-lg p-1">
                        <button
                            onClick={() => setFilterMode('all')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterMode === 'all'
                                ? 'bg-[#334155] text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            All Comments
                        </button>
                        <button
                            onClick={() => setFilterMode('scene')}
                            disabled={!currentScene}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 ${filterMode === 'scene'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            Current Scene
                            {sceneCommentsCount > 0 && (
                                <span className="bg-blue-500/20 text-blue-200 text-[10px] px-1.5 rounded-full">
                                    {sceneCommentsCount}
                                </span>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Input - Only if logged in */}
            {isAuthenticated ? (
                <div className="flex gap-4 mb-8">
                    <div className="flex-shrink-0">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-10 h-10 rounded-full object-cover border border-[#334155]"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center text-gray-400">
                                <FaUserCircle size={24} />
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleAddComment} className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full bg-[#0F172A] border-b border-[#334155] text-white px-2 py-2 focus:outline-none focus:border-blue-500 transition-colors pb-2"
                            />
                            {/* Timestamp Toggle */}
                            <div className="flex items-center gap-2 mt-2">
                                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={includeTimestamp}
                                        onChange={(e) => setIncludeTimestamp(e.target.checked)}
                                        className="rounded border-gray-600 bg-[#334155] text-blue-600 focus:ring-offset-[#0F172A]"
                                    />
                                    <span>Timestamp at {formatTime(currentTime)}</span>
                                </label>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || submitLoading}
                                    className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${newComment.trim() && !submitLoading
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-[#1E293B] text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Comment
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mb-8 p-4 bg-[#1E293B]/50 rounded-xl text-center">
                    <p className="text-gray-400">
                        Please <a href="/login" className="text-blue-400 hover:underline">login</a> to comment.
                    </p>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <CommentSkeleton />
            ) : (
                <div className="space-y-2">
                    {rootComments.map(comment => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            onDelete={handleDeleteComment}
                            onReply={handleReply}
                            onUpdate={handleUpdateLocal}
                            replies={getReplies(comment._id)}
                            onSeek={onSeek}
                        />
                    ))}
                    {comments.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
