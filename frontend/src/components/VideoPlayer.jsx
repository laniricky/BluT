import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute,
    FaExpand, FaCompress, FaCog
} from 'react-icons/fa';
import VideoNoteOverlay from './VideoNoteOverlay';

const VideoPlayer = React.forwardRef(({
    src,
    poster,
    notes = [],
    scenes = [],
    initialTime = 0,
    onProgress,
    onEnded
}, ref) => {
    // Use internal ref if external not provided, or merge them?
    // Easier: Expect external ref (from WatchPage) to be assigned to the video tag.
    // But WatchPage uses `ref.current` to access video API.
    // So if we attach `ref` to `<video>`, it works.
    // But we also use `videoRef` internally for our controls.
    // We need to merge refs.
    const internalVideoRef = useRef(null);

    // Better merge approach:
    useEffect(() => {
        if (!ref) return;
        if (typeof ref === 'function') {
            ref(internalVideoRef.current);
        } else {
            ref.current = internalVideoRef.current;
        }
    }, [ref]);

    // Now uses internalVideoRef exclusively for internal logic
    const playerRef = useRef(null);
    const timelineRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isHoveringTimestamp, setIsHoveringTimestamp] = useState(null);

    // Initial setup
    useEffect(() => {
        if (internalVideoRef.current) {
            internalVideoRef.current.currentTime = initialTime;
            setVolume(internalVideoRef.current.volume);
        }
    }, [initialTime]);

    // Handle Time Update
    const checkTime = () => {
        if (internalVideoRef.current) {
            const time = internalVideoRef.current.currentTime;
            setCurrentTime(time);
            if (onProgress) onProgress(time);
        }
    };

    // Format time helper
    const formatTime = (time) => {
        if (!time && time !== 0) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Controls Logic
    const togglePlay = useCallback(() => {
        if (internalVideoRef.current) {
            if (isPlaying) {
                internalVideoRef.current.pause();
            } else {
                internalVideoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (internalVideoRef.current) {
            internalVideoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (internalVideoRef.current) {
            const newMuted = !isMuted;
            internalVideoRef.current.muted = newMuted;
            setIsMuted(newMuted);
            if (newMuted) {
                setVolume(0);
            } else {
                setVolume(1);
                internalVideoRef.current.volume = 1;
            }
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            playerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleTimelineClick = (e) => {
        const rect = timelineRef.current.getBoundingClientRect();
        const percent = Math.min(Math.max(0, e.clientX - rect.left), rect.width) / rect.width;
        if (internalVideoRef.current && duration) {
            internalVideoRef.current.currentTime = percent * duration;
            setCurrentTime(percent * duration);
        }
    };

    // Auto-hide controls
    useEffect(() => {
        let timeout;
        const resetTimer = () => {
            setShowControls(true);
            clearTimeout(timeout);
            if (isPlaying) {
                timeout = setTimeout(() => setShowControls(false), 3000);
            }
        };

        const player = playerRef.current;
        if (player) {
            player.addEventListener('mousemove', resetTimer);
            player.addEventListener('click', resetTimer);
        }

        return () => {
            if (player) {
                player.removeEventListener('mousemove', resetTimer);
                player.removeEventListener('click', resetTimer);
            }
            clearTimeout(timeout);
        };
    }, [isPlaying]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
            // Prevent default scrolling for Space/Arrows if focus is on body
            if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    togglePlay();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'm':
                    toggleMute();
                    break;
                case 'arrowleft':
                    if (internalVideoRef.current) internalVideoRef.current.currentTime -= 5;
                    break;
                case 'arrowright':
                    if (internalVideoRef.current) internalVideoRef.current.currentTime += 5;
                    break;
                case 'arrowup':
                    if (internalVideoRef.current) {
                        const newVol = Math.min(1, internalVideoRef.current.volume + 0.1);
                        internalVideoRef.current.volume = newVol;
                        setVolume(newVol);
                    }
                    break;
                case 'arrowdown':
                    if (internalVideoRef.current) {
                        const newVol = Math.max(0, internalVideoRef.current.volume - 0.1);
                        internalVideoRef.current.volume = newVol;
                        setVolume(newVol);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay]); // Include other dependencies if needed, but togglePlay is the main one requiring updated state if not using functional updates, but here we use ref for video so stable? 
    // Actually togglePlay depends on isPlaying state. Better to use ref for video manipulation and state only for UI sync.

    return (
        <div
            ref={playerRef}
            className="group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-[#1E293B] select-none"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Video Element */}
            <video
                ref={internalVideoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                onTimeUpdate={checkTime}
                onLoadedMetadata={() => setDuration(internalVideoRef.current.duration)}
                onEnded={() => {
                    setIsPlaying(false);
                    if (onEnded) onEnded();
                }}
            />

            {/* Overlays (Notes) */}
            <VideoNoteOverlay notes={notes} currentTime={currentTime} />

            {/* Big Play Button Animation */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white scale-100 hover:scale-110 transition-transform">
                        <FaPlay size={24} className="ml-1" />
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>

                {/* Timeline */}
                <div
                    className="relative h-1.5 bg-gray-600 rounded-full cursor-pointer mb-4 group/timeline"
                    ref={timelineRef}
                    onClick={handleTimelineClick}
                    onMouseMove={(e) => {
                        const rect = timelineRef.current.getBoundingClientRect();
                        const percent = ((e.clientX - rect.left) / rect.width);
                        setIsHoveringTimestamp(percent * duration);
                    }}
                    onMouseLeave={() => setIsHoveringTimestamp(null)}
                >
                    {/* Progress Fill */}
                    <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />

                    {/* Scene Markers */}
                    {scenes.map(scene => (
                        <div
                            key={scene._id}
                            className="absolute top-0 w-0.5 h-full bg-white/50 z-10"
                            style={{ left: `${(scene.timestamp / duration) * 100}%` }}
                            title={scene.title}
                        />
                    ))}

                    {/* Hover Timestamp */}
                    {isHoveringTimestamp !== null && (
                        <div
                            className="absolute -top-8 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded"
                            style={{ left: `${(isHoveringTimestamp / duration) * 100}%` }}
                        >
                            {formatTime(isHoveringTimestamp)}
                        </div>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                            {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                                {isMuted || volume === 0 ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                            </button>
                            <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 accent-blue-500 cursor-pointer"
                                />
                            </div>
                        </div>

                        <span className="text-white text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Settings placeholder */}
                        <button className="text-gray-300 hover:text-white transition-colors">
                            <FaCog size={18} />
                        </button>

                        <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
                            {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default VideoPlayer;
