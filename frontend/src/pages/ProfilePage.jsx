import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import VideoGrid from '../components/VideoGrid';
import FollowButton from '../components/FollowButton';
import EditProfileModal from '../components/EditProfileModal';
import { FaUserEdit, FaCalendarAlt } from 'react-icons/fa';

const ProfilePage = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('videos');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchProfileData = async () => {
        try {
            // Get Profile Info
            const profileRes = await api.get(`/users/${username}`);
            if (profileRes.data.success) {
                setProfile(profileRes.data.user);

                // Get User Videos (using the ID from the profile we just fetched)
                // Note: userController.getUserVideos expects :id, not :username
                const videosRes = await api.get(`/users/${profileRes.data.user._id}/videos`);
                if (videosRes.data.success) {
                    setVideos(videosRes.data.videos);
                }
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError(err.response?.status === 404 ? 'User not found' : 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchProfileData();
    }, [username]);

    // Handle follower count update from child component
    const handleSubscribeToggle = (newIsFollowing) => {
        setProfile(prev => ({
            ...prev,
            isFollowing: newIsFollowing,
            followersCount: prev.followersCount + (newIsFollowing ? 1 : -1)
        }));
    };

    const handleProfileUpdate = (updatedUser) => {
        setProfile(prev => ({ ...prev, ...updatedUser }));
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0F172A]">
            <Navbar />
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        </div>
    );

    if (error || !profile) return (
        <div className="min-h-screen bg-[#0F172A]">
            <Navbar />
            <div className="flex items-center justify-center h-[calc(100vh-64px)] text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        </div>
    );

    const isOwnProfile = currentUser && currentUser._id === profile._id;

    return (
        <div className="min-h-screen bg-[#0F172A] pb-10">
            <Navbar />

            {/* Banner Area */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-blue-900 via-purple-900 to-slate-900 w-full relative">
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Profile Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 pb-6 border-b border-[#334155]">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                            alt={profile.username}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0F172A] bg-[#1E293B] shadow-xl object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 w-full md:w-auto mt-2 md:mt-0 md:mb-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white leading-tight">{profile.username}</h1>
                            {/* <span className="bg-blue-600 text-xs px-2 py-0.5 rounded text-white font-bold">CREATOR</span> */}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                            <span>@{profile.username}</span>
                            <span>•</span>
                            <span>{profile.followersCount.toLocaleString()} followers</span>
                            <span>•</span>
                            <span>{profile.videosCount} videos</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <FaCalendarAlt />
                            Joined {new Date(profile.createdAt).toLocaleDateString()}
                        </div>
                        {profile.bio && (
                            <p className="text-gray-300 mt-4 max-w-2xl line-clamp-2 md:line-clamp-none">
                                {profile.bio}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 md:mt-0 flex gap-3">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-full font-medium transition-colors border border-gray-600 shadow-lg"
                            >
                                <FaUserEdit />
                                Edit Profile
                            </button>
                        ) : (
                            <FollowButton
                                channelId={profile._id}
                                initialIsFollowing={profile.isFollowing}
                                initialIsFollower={profile.isFollower}
                                onToggle={handleSubscribeToggle}
                                large
                            />
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mt-6 border-b border-[#334155]">
                    {['Videos', 'About'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${activeTab === tab.toLowerCase()
                                ? 'text-blue-400'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase() && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="py-8">
                    {activeTab === 'videos' && (
                        <VideoGrid videos={videos} isLoading={false} />
                    )}

                    {activeTab === 'about' && (
                        <div className="max-w-2xl text-gray-300 leading-relaxed bg-[#1E293B] p-6 rounded-2xl border border-[#334155]">
                            <h3 className="text-white font-bold text-lg mb-4">About {profile.username}</h3>
                            <p>{profile.bio || "No bio available."}</p>

                            <div className="mt-8 pt-6 border-t border-[#334155] grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-sm text-gray-500">Joined</span>
                                    <span className="text-white">{new Date(profile.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="block text-sm text-gray-500">Total Views</span>
                                    <span className="text-white">Coming soon</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isEditModalOpen && (
                <EditProfileModal
                    user={profile}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default ProfilePage;
