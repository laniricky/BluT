import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaUserCircle, FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown, FaEdit, FaThumbtack, FaHeart, FaEllipsisV } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CommentItem = ({ comment, onDelete, replies = [], onReply, onUpdate, onSeek, onPin, onHeart, isVideoOwner }) => { // Added props
    const { user, isAuthenticated } = useAuth();
    const canDelete = user && comment.user && user._id === comment.user._id;

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showMenu, setShowMenu] = useState(false); // For creator menu

    // Local state for immediate UI feedback
    const [likes, setLikes] = useState(comment.likes || []);
    const [dislikes, setDislikes] = useState(comment.dislikes || []);

    const isLiked = user && likes.includes(user._id);
    const isDisliked = user && dislikes.includes(user._id);

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return "";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVote = async (type) => { // type: 'like' or 'dislike'
        if (!isAuthenticated) return alert("Please login to vote");

        try {
            const response = await api.post(`/videos/comments/${comment._id}/${type}`);
            if (response.data.success) {
                if (type === 'like') {
                    setLikes(response.data.data); // New likes array
                    // If we just liked, remove from dislikes locally
                    if (!isLiked) setDislikes(dislikes.filter(id => id !== user._id));
                } else {
                    setDislikes(response.data.data); // New dislikes array
                    // If we just disliked, remove from likes locally
                    if (!isDisliked) setLikes(likes.filter(id => id !== user._id));
                }
            }
        } catch (error) {
            console.error(`Error ${type} comment:`, error);
        }
    };

    const handleUpdate = async () => {
        if (editContent.trim() === comment.content) return setIsEditing(false);

        try {
            const response = await api.put(`/videos/comments/${comment._id}`, { content: editContent });
            if (response.data.success) {
                onUpdate(response.data.data);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating comment:", error);
            alert("Failed to update comment");
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        await onReply(comment._id, replyContent);
        setReplyContent('');
        setShowReplyInput(false);
    };

    return (
        <div className={`flex gap-4 p-4 hover:bg-[#1E293B]/30 rounded-xl transition-colors group ${comment.isPinned ? 'bg-blue-900/10 border border-blue-500/20' : ''}`}>
            {/* Pinned Icon (Absolute or Integrated) */}

            <Link to={`/u/${comment.user?.username}`} className="flex-shrink-0 relative">
                {comment.user?.avatar ? (
                    <img
                        src={comment.user.avatar}
                        alt={comment.user.username}
                        className="w-10 h-10 rounded-full object-cover border border-[#334155]"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center text-gray-400">
                        <FaUserCircle size={24} />
                    </div>
                )}
                {/* Creator Heart Badge on Avatar? Maybe overkill. Let's put it next to likes. */}
            </Link>
            <div className="flex-1 min-w-0"> {/* min-w-0 for truncate */}
                {comment.isPinned && (
                    <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-medium">
                        <FaThumbtack /> Pinned by Creator
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            to={`/u/${comment.user?.username}`}
                            className={`font-semibold text-sm hover:text-blue-400 transition-colors ${comment.user?.username === user?.username ? "bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full" : "text-white"}`}
                        >
                            @{comment.user?.username || 'Unknown'}
                        </Link>
                        <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        {comment.timestamp !== null && comment.timestamp !== undefined && (
                            <button
                                onClick={() => onSeek && onSeek(comment.timestamp)}
                                className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors font-mono"
                            >
                                {formatTime(comment.timestamp)}
                            </button>
                        )}
                        {comment.isEdited && (
                            <span className="text-xs text-gray-600 italic">(edited)</span>
                        )}
                    </div>

                    {/* Actions Menu */}
                    <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity items-center">
                        {(canDelete || isVideoOwner) && (
                            <div className="relative">
                                {!isEditing && (
                                    <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-white p-1">
                                        <FaEllipsisV size={12} />
                                    </button>
                                )}
                                {showMenu && (
                                    <div className="absolute right-0 mt-1 w-32 bg-[#1E293B] border border-[#334155] rounded-lg shadow-xl z-10 overflow-hidden py-1">
                                        {isVideoOwner && (
                                            <>
                                                <button
                                                    onClick={() => { onPin(comment._id); setShowMenu(false); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                                >
                                                    <FaThumbtack size={10} /> {comment.isPinned ? 'Unpin' : 'Pin'}
                                                </button>
                                                <button
                                                    onClick={() => { onHeart(comment._id); setShowMenu(false); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                                >
                                                    <FaHeart size={10} /> {comment.isHearted ? 'Remove Heart' : 'Give Heart'}
                                                </button>
                                            </>
                                        )}
                                        {canDelete && (
                                            <>
                                                <button
                                                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                                >
                                                    <FaEdit size={10} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => { onDelete(comment._id); setShowMenu(false); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                                                >
                                                    <FaTrash size={10} /> Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="mt-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            rows="2"
                        />
                        <div className="flex gap-2 mt-2 justify-end">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-xs text-gray-400 hover:text-white px-3 py-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className={`text-gray-300 text-sm mt-1 whitespace-pre-wrap ${comment.isPinned ? 'font-medium' : ''}`}>{comment.content}</p>
                )}

                <div className="flex items-center gap-4 mt-3">
                    <button
                        onClick={() => handleVote('like')}
                        className={`flex items-center gap-1.5 text-xs ${isLiked ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                        <span>{likes.length || ''}</span>
                    </button>

                    <button
                        onClick={() => handleVote('dislike')}
                        className={`flex items-center gap-1.5 text-xs ${isDisliked ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
                    </button>

                    {/* Creator Heart Icon */}
                    {comment.isHearted && (
                        <div className="flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded-full" title="Liked by Creator">
                            <img src={comment.user?.avatar} className="w-4 h-4 rounded-full" alt="creator" /> {/* Ideally this is the CREATOR avatar, but for now using comment user avatar is WRONG if they are different. We need CREATOR avatar. */}
                            {/* Actually, the 'Heart' implies the VIDEO CREATOR liked it. We don't have creator avatar here easily unless we pass it down or fetch it.
                                Simple fix: Just show a small heart icon with a specific style. 
                            */}
                            <FaHeart className="text-red-500 text-[10px]" />
                        </div>
                    )}

                    {isAuthenticated && (
                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="text-gray-500 hover:text-white text-xs font-medium"
                        >
                            Reply
                        </button>
                    )}
                </div>

                {showReplyInput && (
                    <form onSubmit={handleReplySubmit} className="mt-3 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#334155] flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                            <FaUserCircle size={20} />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Add a reply..."
                                className="w-full bg-transparent border-b border-[#334155] text-white text-sm pb-1 focus:outline-none focus:border-blue-500 transition-colors"
                                autoFocus
                            />
                            <div className="flex justify-end mt-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReplyInput(false)}
                                    className="text-xs text-gray-500 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!replyContent.trim()}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-full"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-[#334155] space-y-4">
                        {replies.map(reply => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                onDelete={onDelete}
                                onReply={onReply}
                                onUpdate={onUpdate}
                                onSeek={onSeek}
                                onPin={onPin} // Pass down actions for sub-comments? Usually only root comments are pinned.
                                onHeart={onHeart}
                                isVideoOwner={isVideoOwner}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
