import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaThumbsUp, FaRegThumbsUp, FaShare, FaEye, FaTrash } from 'react-icons/fa';

import Navbar from '../components/Navbar';
import CommentSection from '../components/CommentSection';
import SubscribeButton from '../components/SubscribeButton';
import VideoRecommendations from '../components/VideoRecommendations';
import { VideoPlayerSkeleton, CommentSkeleton } from '../components/LoadingSkeleton';
import Tooltip from '../components/Tooltip';

const WatchPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    // Increment view count on mount (or specific event)
    useEffect(() => {
        const incrementView = async () => {
            try {
                await api.post(`/videos/${id}/view`);

                // Add to watch history immediately on load (without progress) to bump "last viewed"
                // Progress will be updated periodically
                if (isAuthenticated) {
                    await api.post(`/users/history/${id}`, { progress: 0 });
                }
            } catch (err) {
                console.error("Error incrementing view/history:", err);
            }
        };
        incrementView();
    }, [id, isAuthenticated]);

    // Resume Watching Logic
    const [initialProgress, setInitialProgress] = useState(0);
    const videoRef = React.useRef(null);

    useEffect(() => {
        const fetchProgress = async () => {
            if (isAuthenticated) {
                try {
                    const response = await api.get('/users/history');
                    if (response.data.success) {
                        const historyItem = response.data.history.find(item => item.video._id === id);
                        if (historyItem && historyItem.progress > 5) {
                            // Only resume if progress is substantial (> 5 seconds)
                            setInitialProgress(historyItem.progress);
                        }
                    }
                } catch (err) {
                    console.error("Error checking resume progress:", err);
                }
            }
        };
        fetchProgress();
    }, [id, isAuthenticated]);

    // Update video time when initialProgress is set
    useEffect(() => {
        if (videoRef.current && initialProgress > 0) {
            videoRef.current.currentTime = initialProgress;
        }
    }, [initialProgress]);

    // Periodic Progress Saver
    useEffect(() => {
        if (!isAuthenticated || !videoRef.current) return;

        const interval = setInterval(async () => {
            if (videoRef.current && !videoRef.current.paused) {
                const currentTime = videoRef.current.currentTime;
                const duration = videoRef.current.duration;

                // Don't save if almost finished (> 95%)
                if (duration && (currentTime / duration) > 0.95) return;

                try {
                    await api.post(`/users/history/${id}`, { progress: currentTime });
                } catch (err) {
                    // Silent fail
                }
            }
        }, 15000); // Save every 15 seconds

        return () => clearInterval(interval);
    }, [id, isAuthenticated]);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await api.get(`/videos/${id}`);
                if (response.data.success) {
                    setVideo(response.data.data);
                    setIsLiked(response.data.data.isLiked);
                    setLikesCount(response.data.data.likesCount);
                    // Subscription status is handled inside the video object now (video.user.isSubscribed)
                } else {
                    setError('Failed to load video');
                }
            } catch (err) {
                console.error("Error fetching video:", err);
                setError('Error loading video. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore shortcuts if user is typing in comments or search
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            const video = videoRef.current;
            if (!video) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    video.paused ? video.play() : video.pause();
                    break;
                case 'f':
                    e.preventDefault();
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        video.parentElement.requestFullscreen();
                    }
                    break;
                case 'm':
                    video.muted = !video.muted;
                    break;
                case 'j':
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    break;
                case 'l':
                    video.currentTime = Math.min(video.duration, video.currentTime + 10);
                    break;
                case 'arrowleft':
                    video.currentTime = Math.max(0, video.currentTime - 5);
                    break;
                case 'arrowright':
                    video.currentTime = Math.min(video.duration, video.currentTime + 5);
                    break;
                case 'arrowup':
                    e.preventDefault(); // Prevent page scroll
                    video.volume = Math.min(1, video.volume + 0.1);
                    break;
                case 'arrowdown':
                    e.preventDefault(); // Prevent page scroll
                    video.volume = Math.max(0, video.volume - 0.1);
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLike = async () => {
        if (!isAuthenticated) {
            alert("Please login to like videos!");
            return;
        }
        try {
            const response = await api.post(`/videos/${id}/like`);
            if (response.data.success) {
                setIsLiked(response.data.isLiked);
                setLikesCount(prev => response.data.isLiked ? prev + 1 : prev - 1);
            }
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;

        try {
            const response = await api.delete(`/videos/${id}`);
            if (response.data.success) {
                navigate('/');
            }
        } catch (err) {
            console.error("Error deleting video:", err);
            alert("Failed to delete video");
        }
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F172A] pb-10">
                <Navbar />
                <div className="pt-8 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <VideoPlayerSkeleton />
                            <CommentSkeleton />
                        </div>
                        <div className="hidden lg:block">
                            {/* Recommendation Skeleton */}
                            <div className="space-y-4">
                                <div className="h-6 bg-[#1E293B] rounded w-1/3 mb-4 animate-pulse"></div>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="w-40 aspect-video bg-[#1E293B] rounded-lg"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-[#1E293B] rounded w-3/4"></div>
                                            <div className="h-3 bg-[#1E293B] rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
                <p className="text-xl text-red-400">{error || 'Video not found'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] pb-10">
            <Navbar />
            <div className="pt-8 px-4 md:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Video Player & Info */}
                    <div className="lg:col-span-2">
                        {/* Video Player Container */}
                        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-[#1E293B]">
                            <video
                                ref={videoRef}
                                src={video.videoUrl}
                                poster={video.thumbnailUrl}
                                controls
                                autoPlay
                                className="w-full h-full"
                                onLoadedMetadata={(e) => {
                                    if (initialProgress > 0) {
                                        e.target.currentTime = initialProgress;
                                    }
                                }}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        {/* Video Title & Meta */}
                        <div className="mt-4">
                            <h1 className="text-2xl font-bold text-white">{video.title}</h1>

                            <div className="flex flex-col md:flex-row md:items-center justify-between mt-3 pb-4 border-b border-[#1E293B]">
                                <div className="flex items-center text-gray-400 text-sm">
                                    <span className="flex items-center">
                                        <FaEye className="mr-2" />
                                        {video.views.toLocaleString()} views
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center gap-4 mt-3 md:mt-0">
                                    <Tooltip text={isLiked ? "Unlike video" : "Like video"}>
                                        <button
                                            onClick={handleLike}
                                            className={`flex items-center gap-2 px-4 py-2 ${isLiked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1E293B] hover:bg-[#334155]'} text-white rounded-full transition-colors font-medium text-sm`}
                                        >
                                            {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                                            {likesCount > 0 ? likesCount : 'Like'}
                                        </button>
                                    </Tooltip>

                                    <Tooltip text="Share with friends">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-white rounded-full transition-colors font-medium text-sm">
                                            <FaShare /> Share
                                        </button>
                                    </Tooltip>

                                    {isAuthenticated && video.user && user && (video.user._id === user._id || video.user === user._id) && (
                                        <Tooltip text="Delete your video permanently">
                                            <button
                                                onClick={handleDelete}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-full transition-colors font-medium text-sm border border-red-600/20"
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-[#1E293B]/50 rounded-xl hover:bg-[#1E293B] transition-colors cursor-default">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={video.user?.avatar || 'https://via.placeholder.com/40'}
                                        alt={video.user?.username}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                                    />
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-white font-bold text-lg">
                                                {video.user?.username || 'Unknown User'}
                                            </h3>
                                            <span className="text-gray-400 text-sm">
                                                {video.user?.subscribersCount?.toLocaleString() || 0} subscribers
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            {video.user && (
                                                <SubscribeButton
                                                    channelId={video.user._id}
                                                    initialIsSubscribed={video.user.isSubscribed}
                                                    onToggle={(newStatus) => {
                                                        // Update local video state to reflect new subscriber count
                                                        setVideo(prev => ({
                                                            ...prev,
                                                            user: {
                                                                ...prev.user,
                                                                subscribersCount: prev.user.subscribersCount + (newStatus ? 1 : -1),
                                                                isSubscribed: newStatus
                                                            }
                                                        }));
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <p className="text-gray-300 mt-3 whitespace-pre-wrap leading-relaxed">
                                            {video.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Recommendations (Visible only on lg screens and below - wait, no, logic is: visible on mobile, hidden on desktop... wait) */}
                        {/* Actually, the sidebar recommendations are hidden on mobile. We want to show them on mobile.
                            But if we just unhide the sidebar, it will appear BELOW the comments in current grid layout if we use col-span-3? No, it's col-span-1.
                            
                            Current Layout:
                            [ Video + Info + Comments ] [ Recommendations ]
                            
                            On mobile (grid-cols-1):
                            [ Video + Info + Comments ]
                            [ Recommendations ]
                            
                            This puts Recommendations AFTER comments.
                            We want Recommendations AFTER Info but BEFORE Comments on mobile.
                            
                            So we add a block HERE for mobile recommendations.
                        */}
                        <div className="lg:hidden mt-8">
                            <VideoRecommendations currentVideoId={id} />
                        </div>

                        <CommentSection videoId={id} />
                    </div>

                    {/* Right Column: Recommended Videos (Desktop only) */}
                    <div className="hidden lg:block">
                        <VideoRecommendations currentVideoId={id} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchPage;
