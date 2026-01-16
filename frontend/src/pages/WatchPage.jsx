import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaThumbsUp, FaRegThumbsUp, FaShare, FaEye, FaTrash, FaLock } from 'react-icons/fa';

import Navbar from '../components/Navbar';
import CommentSection from '../components/CommentSection';
import FollowButton from '../components/FollowButton';
import VideoRecommendations from '../components/VideoRecommendations';
import { VideoPlayerSkeleton, CommentSkeleton } from '../components/LoadingSkeleton';
import Tooltip from '../components/Tooltip';

import NoteEditor from '../components/NoteEditor';
import VideoPlayer from '../components/VideoPlayer';
import Avatar from '../components/Avatar';

const WatchPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(0); // Track current time properly
    const [notes, setNotes] = useState([]); // Creator Notes active state

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
    // Note: VideoPlayer handles onProgress, but we might still want a periodic save for redundancy or just rely on onProgress (throttled).
    // Let's implement a simple throttled save in the handleProgress callback below instead of useEffect + ref approach, it's cleaner.
    const lastSaveTime = useRef(0);
    const handleProgress = async (time) => {
        setCurrentTime(time);

        // Save history every 15 seconds
        const now = Date.now();
        if (now - lastSaveTime.current > 15000 && isAuthenticated) {
            try {
                await api.post(`/users/history/${id}`, { progress: time });
                lastSaveTime.current = now;
            } catch (err) {
                // Silent fail
            }
        }
    };

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await api.get(`/videos/${id}`);
                if (response.data.success) {
                    setVideo(response.data.data);
                    setIsLiked(response.data.data.isLiked);
                    setLikesCount(response.data.data.likesCount);
                    // Subscription status is handled inside the video object now (video.user.isFollowing)
                } else {
                    setError('Failed to load video');
                }
            } catch (err) {
                console.error("Error fetching video:", err);
                if (err.response && err.response.status === 403) {
                    setError('This video is private. Only the owner can view it.');
                } else {
                    setError('Error loading video. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchNotes = async () => {
            try {
                const response = await api.get(`/videos/${id}/notes`);
                if (response.data.success) {
                    setNotes(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching notes:", err);
            }
        };

        fetchVideo();
        fetchNotes();
    }, [id]);

    // Keyboard Shortcuts - MOVED TO VideoPlayer.jsx
    // But we still need global shortcuts? VideoPlayer handles them when focused or generally attached to window.
    // VideoPlayer attaches to window, so we should remove this effect to avoid duplicates.
    // However, WatchPage logic for specific keys not in player? 
    // The player handles Space, K, F, M, Arrows.
    // We can remove this entire block.

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
            <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white p-4">
                {error && error.includes('private') ? (
                    <div className="bg-[#1E293B] p-8 rounded-2xl border border-gray-700 text-center max-w-md">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaLock className="text-3xl text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Private Video</h2>
                        <p className="text-gray-400">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                ) : (
                    <p className="text-xl text-red-400">{error || 'Video not found'}</p>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] pb-10">
            <Navbar />
            <div className="pt-0 md:pt-8 px-0 md:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-y-6 lg:gap-8">
                    {/* Left Column: Video Player & Info */}
                    <div className="lg:col-span-2">
                        {/* Video Player Container */}
                        {/* Video Player Container */}
                        <div className="w-full"> {/* Wrapper not strictly needed if Player handles sizing, but good for layout */}
                            <VideoPlayer
                                src={video.videoUrl}
                                poster={video.thumbnailUrl}
                                notes={notes}
                                initialTime={initialProgress}
                                onProgress={handleProgress}
                                ref={videoRef}
                            />
                        </div>

                        {/* Video Title & Meta */}
                        <div className="mt-4 px-4 md:px-0">
                            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">{video.title}</h1>

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

                                    {isAuthenticated && video.user && user && (String(video.user._id) === String(user._id || user.id) || video.user === (user._id || user.id)) && (
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
                                    <Link to={`/u/${video.user?.username}`}>
                                        <Avatar user={video.user} size="lg" className="border-2 border-blue-500" />
                                    </Link>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <Link to={`/u/${video.user?.username}`}>
                                                <h3 className="text-white font-bold text-lg hover:text-blue-400 transition-colors">
                                                    {video.user?.username || 'Unknown User'}
                                                </h3>
                                            </Link>
                                            <span className="text-gray-400 text-sm">
                                                {video.user?.followersCount?.toLocaleString() || 0} followers
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            {video.user && (!user || (user && String(video.user._id) !== String(user._id || user.id))) && (
                                                <FollowButton
                                                    channelId={video.user._id}
                                                    initialIsFollowing={video.user.isFollowing}
                                                    initialIsFollower={video.user.isFollower}
                                                    onToggle={(newStatus) => {
                                                        // Update local video state to reflect new follower count
                                                        setVideo(prev => ({
                                                            ...prev,
                                                            user: {
                                                                ...prev.user,
                                                                followersCount: prev.user.followersCount + (newStatus ? 1 : -1),
                                                                isFollowing: newStatus
                                                            }
                                                        }));
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <p className="text-gray-300 mt-3 whitespace-pre-wrap leading-relaxed">
                                            {video.description}
                                        </p>

                                        {/* Tags */}
                                        {video.tags && video.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {video.tags.map((tag, index) => (
                                                    <a
                                                        key={index}
                                                        href={`/search?tag=${encodeURIComponent(tag)}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            navigate(`/search?tag=${encodeURIComponent(tag)}`);
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 text-sm font-medium bg-blue-500/10 px-2 py-0.5 rounded hover:bg-blue-500/20 transition-colors"
                                                    >
                                                        #{tag}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Creator Notes Editor (Owner Only) */}
                            {isAuthenticated && video.user && user && (String(video.user._id) === String(user._id || user.id) || video.user === (user._id || user.id)) && (
                                <NoteEditor
                                    videoId={id}
                                    currentTime={currentTime}
                                    notes={notes}
                                    onNoteAdded={(newNote) => setNotes([...notes, newNote])}
                                    onNoteDeleted={(noteId) => setNotes(notes.filter(n => n._id !== noteId))}
                                />
                            )}
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

                        <CommentSection
                            videoId={id}
                            currentTime={videoRef.current?.currentTime || 0}
                            onSeek={(time) => {
                                if (videoRef.current) {
                                    videoRef.current.currentTime = time;
                                    videoRef.current.play(); // Auto play after seek
                                }
                            }}
                            isVideoOwner={isAuthenticated && video.user && user && (String(video.user._id) === String(user._id || user.id) || video.user === (user._id || user.id))}
                        />
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
