import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommentItem from './CommentItem';
import { FaUserCircle } from 'react-icons/fa';
import { CommentSkeleton } from './LoadingSkeleton';

const CommentSection = ({ videoId }) => {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

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

    // Group comments by parentId
    const rootComments = useMemo(() => {
        return comments.filter(c => !c.parentId);
    }, [comments]);

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
                content: newComment
            });

            if (response.data.success) {
                setComments([response.data.data, ...comments]);
                setNewComment('');
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
            <h3 className="text-xl font-bold text-white mb-6">
                {comments.length} Comments
            </h3>

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
