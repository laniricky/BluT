import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

const FollowButton = ({ channelId, initialIsFollowing, initialIsFollower, onToggle, large = false }) => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isFollower, setIsFollower] = useState(initialIsFollower);
    const [loading, setLoading] = useState(false);

    const handleFollow = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }

        const newState = !isFollowing;
        setIsFollowing(newState);
        if (onToggle) onToggle(newState);

        setLoading(true);
        try {
            await api.post(`/users/${channelId}/follow`);
            // Note: isFollower state doesn't change here, it's about whether THEY follow YOU
        } catch (error) {
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

    let buttonText = 'Follow';
    let ButtonIcon = FaUserPlus;
    let buttonStyle = 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10';

    if (isFollowing) {
        if (isFollower) {
            buttonText = 'Friends';
            ButtonIcon = FaUserCheck; // Or a friends icon
            buttonStyle = 'bg-[#334155] text-gray-300 hover:bg-[#475569] border border-gray-600';
        } else {
            buttonText = 'Following';
            ButtonIcon = FaUserCheck;
            buttonStyle = 'bg-[#334155] text-gray-300 hover:bg-[#475569] border border-gray-600';
        }
    } else {
        if (isFollower) {
            buttonText = 'Follow Back';
            ButtonIcon = FaUserPlus;
            buttonStyle = 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20';
        }
    }

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`
                flex items-center justify-center gap-2 transition-all duration-200 rounded-full font-semibold
                ${large ? 'px-8 py-3 text-lg' : 'px-4 py-2 text-sm'}
                ${buttonStyle}
            `}
        >
            <ButtonIcon className={isFollowing ? "text-gray-400" : ""} />
            {buttonText}
        </button>
    );
};

export default FollowButton;
