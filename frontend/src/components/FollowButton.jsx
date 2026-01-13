import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

const FollowButton = ({ channelId, initialIsFollowing, onToggle, large = false }) => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);

    const handleFollow = async () => {
        if (!user) {
            // Check if login modal exists or redirect to login
            window.location.href = '/login';
            return;
        }

        // Optimistic UI update
        const newState = !isFollowing;
        setIsFollowing(newState);
        if (onToggle) onToggle(newState);

        setLoading(true);
        try {
            await api.post(`/users/${channelId}/follow`);
        } catch (error) {
            // Revert on error
            console.error('Follow failed:', error);
            setIsFollowing(!newState);
            if (onToggle) onToggle(!newState);
        } finally {
            setLoading(false);
        }
    };

    if (user && user._id === channelId) {
        return (
            <button
                className={`bg-gray-700 text-gray-300 cursor-default px-4 rounded-full font-medium ${large ? 'py-3 text-base' : 'py-2 text-sm'}`}
                disabled
            >
                You
            </button>
        );
    }

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`
                flex items-center justify-center gap-2 transition-all duration-200 rounded-full font-semibold
                ${large ? 'px-8 py-3 text-lg' : 'px-4 py-2 text-sm'}
                ${isFollowing
                    ? 'bg-[#334155] text-gray-300 hover:bg-[#475569] border border-gray-600'
                    : 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10'
                }
            `}
        >
            {isFollowing ? (
                <>
                    <FaUserCheck className="text-gray-400" />
                    Following
                </>
            ) : (
                <>
                    <FaUserPlus />
                    Follow
                </>
            )}
        </button>
    );
};

export default FollowButton;
