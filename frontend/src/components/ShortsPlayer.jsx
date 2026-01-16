import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaShare, FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import FollowButton from './FollowButton';
import ShortsCommentsDrawer from './ShortsCommentsDrawer';
import Avatar from './Avatar';

const ShortsPlayer = ({ video, isActive, onNext }) => {
    const videoRef = useRef(null);
    const { user } = useAuth();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);

    const [isLiked, setIsLiked] = useState(video.isLiked);
    const [likesCount, setLikesCount] = useState(video.likesCount || 0);
    const [likeAnimation, setLikeAnimation] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // Auto-play/pause based on active state
    useEffect(() => {
        if (isActive) {
            // Slight delay to ensure smooth transition
            const timer = setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play().then(() => {
                        setIsPlaying(true);
                    }).catch(err => console.log('Autoplay blocked', err));
                }
            }, 300);
            return () => clearTimeout(timer);
        } else {
            if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(percent);
        }
    };

    const handleLike = async (e) => {
        if (e) e.stopPropagation();
        if (!user) return; // Prompt login ideally

        // Optimistic UI
        const newStatus = !isLiked;
        setIsLiked(newStatus);
        setLikesCount(prev => newStatus ? prev + 1 : prev - 1);

        if (newStatus) {
            setLikeAnimation(true);
            setTimeout(() => setLikeAnimation(false), 1000);
        }

        try {
            await api.post(`/videos/${video._id}/like`);
        } catch (error) {
            // Revert on error
            setIsLiked(!newStatus);
            setLikesCount(prev => !newStatus ? prev + 1 : prev - 1);
        }
    };

    const handleDoubleTap = (e) => {
        e.stopPropagation();
        handleLike();
    };

    // Double tap cleanup
    let lastTap = 0;
    const handleTap = (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            handleDoubleTap(e);
        } else {
            togglePlay();
        }
        lastTap = now;
    };

    return (
        <div className="relative w-full h-full bg-black flex flex-col justify-center select-none snap-start">
            {/* Video Element */}
            {/* Video Element */}
            <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                className="w-full h-full object-contain bg-black"
                loop
                muted={isMuted}
                playsInline
                onClick={handleTap}
                onTimeUpdate={handleTimeUpdate}
            />

            {/* Play/Pause Overlay Icon (Briefly visible on toggle) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                    <FaPlay className="text-white/50 text-6xl animate-pulse" />
                </div>
            )}

            {/* Like Animation Heart */}
            {likeAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FaHeart className="text-red-500 text-8xl drop-shadow-2xl animate-bounce" />
                </div>
            )}

            {/* Progress Bar (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50">
                <div
                    className="h-full bg-red-600 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Right Sidebar Actions (Overlay on video) */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10 transition-opacity">
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleLike}
                        className={`p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all ${isLiked ? 'text-red-500' : 'text-white'}`}
                    >
                        <FaHeart className="text-2xl drop-shadow-lg" />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">{likesCount}</span>
                </div>

                {/* Comment Button - Visible ONLY on Mobile */}
                <div className="flex flex-col items-center gap-1 md:hidden">
                    <button
                        onClick={() => setShowComments(true)}
                        className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all text-white"
                    >
                        <FaComment className="text-2xl drop-shadow-lg" />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">0</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all text-white">
                        <FaShare className="text-2xl drop-shadow-lg" />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                </div>

                <button onClick={toggleMute} className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all text-white mt-4">
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>

                {/* User Avatar Action */}
                <Link to={`/u/${video.user.username}`} className="mt-4 relative group">
                    <Avatar user={video.user} size="lg" className="border-2 border-white" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 rounded-full p-0.5" title="Follow">
                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-red-600 font-bold text-xs">+</div>
                    </div>
                </Link>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-4 left-4 right-16 z-10 text-white text-left pl-4 pb-4">
                <Link to={`/u/${video.user.username}`} className="font-bold text-lg hover:underline drop-shadow-md block mb-2">
                    @{video.user.username}
                </Link>
                <h3 className="text-sm md:text-base font-medium line-clamp-2 drop-shadow-md leading-relaxed pr-8">
                    {video.description}
                </h3>
            </div>

            {/* Mobile Comments Drawer (Hidden on Desktop) */}
            <div className="md:hidden">
                <ShortsCommentsDrawer
                    videoId={video._id}
                    isOpen={showComments}
                    onClose={() => setShowComments(false)}
                />
            </div>
        </div>
    );
};

export default ShortsPlayer;
