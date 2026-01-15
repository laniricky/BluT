import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaUsers } from 'react-icons/fa';

const FeedToggle = ({ activeFeed, onFeedTypeChange }) => {
    const { user } = useAuth();

    const handleToggle = (feedType) => {
        // Don't allow switching to following if not logged in
        if (feedType === 'following' && !user) {
            return;
        }
        onFeedTypeChange(feedType);
    };

    return (
        <div className="flex items-center gap-2 mb-6">
            {/* For You Tab */}
            <button
                onClick={() => handleToggle('forYou')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeFeed === 'forYou'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                        : 'bg-[#1E293B] text-gray-400 hover:text-white hover:bg-[#334155]'
                    }`}
            >
                <FaStar className={`transition-transform ${activeFeed === 'forYou' ? 'rotate-12 scale-110' : ''}`} />
                <span>For You</span>
            </button>

            {/* Following Tab */}
            <button
                onClick={() => handleToggle('following')}
                disabled={!user}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeFeed === 'following'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/50 scale-105'
                        : user
                            ? 'bg-[#1E293B] text-gray-400 hover:text-white hover:bg-[#334155]'
                            : 'bg-[#1E293B]/50 text-gray-600 cursor-not-allowed opacity-50'
                    }`}
                title={!user ? 'Login to see videos from creators you follow' : ''}
            >
                <FaUsers className={`transition-transform ${activeFeed === 'following' ? 'scale-110' : ''}`} />
                <span>Following</span>
                {!user && (
                    <span className="ml-1 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                        Login Required
                    </span>
                )}
            </button>

            {/* Indicator Line */}
            <div className="relative h-1 flex-grow bg-[#1E293B] rounded-full overflow-hidden">
                <div
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${activeFeed === 'forYou'
                            ? 'w-1/2 bg-gradient-to-r from-blue-600 to-purple-600'
                            : 'w-1/2 translate-x-full bg-gradient-to-r from-pink-600 to-rose-600'
                        }`}
                />
            </div>
        </div>
    );
};

export default FeedToggle;
