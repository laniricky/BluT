import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CommentItem = ({ comment, onDelete }) => {
    const { user } = useAuth();
    const canDelete = user && comment.user && user._id === comment.user._id;

    return (
        <div className="flex gap-4 p-4 hover:bg-[#1E293B]/30 rounded-xl transition-colors group">
            <Link to={`/u/${comment.user?.username}`} className="flex-shrink-0">
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
            </Link>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/u/${comment.user?.username}`}
                            className="font-semibold text-white text-sm hover:text-blue-400 transition-colors"
                        >
                            @{comment.user?.username || 'Unknown'}
                        </Link>
                        <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(comment._id)}
                            className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                            title="Delete comment"
                        >
                            <FaTrash size={12} />
                        </button>
                    )}
                </div>
                <p className="text-gray-300 text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
            </div>
        </div>
    );
};

export default CommentItem;
