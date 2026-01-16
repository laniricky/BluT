import React from 'react';

/**
 * Reusable Avatar component that displays user profile pictures
 * Falls back to displaying user's initial with a gradient background
 */
const Avatar = ({ user, size = 'md', className = '' }) => {
    // Size variants
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-2xl',
        '2xl': 'w-20 h-20 text-3xl'
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    // Get avatar URL if it exists
    const getAvatarUrl = () => {
        if (!user?.avatar) return null;

        // If it's already a full HTTP URL, use it as-is
        if (user.avatar.startsWith('http')) {
            return user.avatar;
        }

        // It's a relative path from our upload, construct full URL
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
        return `${baseUrl}${user.avatar}`;
    };

    // Get user's initial
    const getInitial = () => {
        if (!user) return '?';
        return (user.username || user.email || '?')[0].toUpperCase();
    };

    // Generate consistent color based on username
    const getGradientColors = () => {
        if (!user?.username) {
            return 'from-gray-500 to-gray-600';
        }

        // Generate a hash from username for consistent colors
        let hash = 0;
        for (let i = 0; i < user.username.length; i++) {
            hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Define color gradients
        const gradients = [
            'from-blue-500 to-purple-600',
            'from-purple-500 to-pink-600',
            'from-pink-500 to-rose-600',
            'from-rose-500 to-orange-600',
            'from-orange-500 to-amber-600',
            'from-amber-500 to-yellow-600',
            'from-green-500 to-emerald-600',
            'from-emerald-500 to-teal-600',
            'from-teal-500 to-cyan-600',
            'from-cyan-500 to-blue-600',
            'from-indigo-500 to-purple-600',
            'from-violet-500 to-purple-600',
        ];

        return gradients[Math.abs(hash) % gradients.length];
    };

    const avatarUrl = getAvatarUrl();

    if (avatarUrl) {
        // Show uploaded/external avatar image
        return (
            <img
                src={avatarUrl}
                alt={user?.username || 'User'}
                className={`${sizeClass} rounded-full object-cover ${className}`}
            />
        );
    }

    // Show initial with gradient background
    return (
        <div
            className={`${sizeClass} rounded-full bg-gradient-to-br ${getGradientColors()} flex items-center justify-center text-white font-bold ${className}`}
        >
            {getInitial()}
        </div>
    );
};

export default Avatar;
