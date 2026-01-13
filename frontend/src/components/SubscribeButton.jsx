import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaBell } from 'react-icons/fa';

const SubscribeButton = ({ channelId, initialIsSubscribed, onToggle, large = false }) => {
    const { user } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!user) {
            // Check if login modal exists or redirect to login
            window.location.href = '/login';
            return;
        }

        // Optimistic UI update
        const newState = !isSubscribed;
        setIsSubscribed(newState);
        if (onToggle) onToggle(newState);

        setLoading(true);
        try {
            await api.post(`/users/${channelId}/subscribe`);
        } catch (error) {
            // Revert on error
            console.error('Subscribe failed:', error);
            setIsSubscribed(!newState);
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
                Start Studio
            </button>
        );
    }

    return (
        <button
            onClick={handleSubscribe}
            disabled={loading}
            className={`
                flex items-center justify-center gap-2 transition-all duration-200 rounded-full font-semibold
                ${large ? 'px-8 py-3 text-lg' : 'px-4 py-2 text-sm'}
                ${isSubscribed
                    ? 'bg-[#334155] text-gray-300 hover:bg-[#475569] border border-gray-600'
                    : 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10'
                }
            `}
        >
            {isSubscribed ? (
                <>
                    <FaBell className="text-gray-400" />
                    Subscribed
                </>
            ) : (
                'Subscribe'
            )}
        </button>
    );
};

export default SubscribeButton;
