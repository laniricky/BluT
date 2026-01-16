// Utility function to get the correct avatar URL
// Handles uploaded images (relative paths), external URLs, and fallback to DiceBear
export const getAvatarUrl = (user) => {
    if (!user) return 'https://via.placeholder.com/40';

    const avatar = user.avatar;

    if (!avatar) {
        // Fallback to DiceBear generated avatar
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user._id}`;
    }

    // If it's already a full HTTP URL, use it as-is
    if (avatar.startsWith('http')) {
        return avatar;
    }

    // It's a relative path from our upload, construct full URL
    // Get the base URL from the current location
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
    return `${baseUrl}${avatar}`;
};

export const getCoverPhotoUrl = (user) => {
    if (!user || !user.coverPhoto) return null;

    const coverPhoto = user.coverPhoto;

    // If it's already a full HTTP URL, use it as-is
    if (coverPhoto.startsWith('http')) {
        return coverPhoto;
    }

    // It's a relative path from our upload, construct full URL
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
    return `${baseUrl}${coverPhoto}`;
};
