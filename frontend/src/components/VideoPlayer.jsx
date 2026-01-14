import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    FaPlay, FaPause, FaVolumeUp, FaVolumeMute,
    FaExpand, FaCompress, FaCog, FaSpinner, FaExternalLinkAlt, FaForward, FaBackward,
    FaStepForward, FaStepBackward
} from 'react-icons/fa';
import VideoNoteOverlay from './VideoNoteOverlay';
import PlayerSettingsMenu from './PlayerSettingsMenu';

const VideoPlayer = React.forwardRef(({
    src,
    poster,
    notes = [],
    scenes = [],
    initialTime = 0,
    onProgress,
    onEnded
}, ref) => {
    const internalVideoRef = useRef(null);

    useEffect(() => {
        if (!ref) return;
        if (typeof ref === 'function') {
            ref(internalVideoRef.current);
        } else {
            ref.current = internalVideoRef.current;
        }
    }, [ref]);

    const playerRef = useRef(null);
    const timelineRef = useRef(null);
    const settingsRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isHoveringTimestamp, setIsHoveringTimestamp] = useState(null);
    const [isBuffering, setIsBuffering] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [doubleClickAnimation, setDoubleClickAnimation] = useState({ type: null, id: 0 }); // 'forward' or 'backward'

    // Initial setup
    useEffect(() => {
        if (internalVideoRef.current) {
            internalVideoRef.current.currentTime = initialTime;
            setVolume(internalVideoRef.current.volume);
        }
    }, [initialTime]);

    // Close settings when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target) &&
                !event.target.closest('button[data-settings-trigger="true"]')) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const checkTime = () => {
        if (internalVideoRef.current) {
            const time = internalVideoRef.current.currentTime;
            setCurrentTime(time);
            if (onProgress) onProgress(time);
        }
    };

    const formatTime = (time) => {
        if (!time && time !== 0) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlay = useCallback(() => {
        if (internalVideoRef.current) {
            if (isPlaying) {
                internalVideoRef.current.pause();
                // Ensure buffering is false when paused
                setIsBuffering(false);
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

    const togglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (internalVideoRef.current) {
                await internalVideoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error("PiP error:", error);
        }
    };

    const handlePlaybackRateChange = (speed) => {
        if (internalVideoRef.current) {
            internalVideoRef.current.playbackRate = speed;
            setPlaybackRate(speed);
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

    const handleDoubleClick = (e) => {
        // Only trigger if click is on video area directly (not controls)
        // Actually, easiest way is to overlay invisible divs left/right
        // But for main area logic:
        const rect = playerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x < width * 0.3) {
            // Seek backward 10s
            handleSeekRel(-10);
            setDoubleClickAnimation({ type: 'backward', id: Date.now() });
        } else if (x > width * 0.7) {
            // Seek forward 10s
            handleSeekRel(10);
            setDoubleClickAnimation({ type: 'forward', id: Date.now() });
        } else {
            toggleFullscreen(); // Middle double click 
        }
    };

    const handleSeekRel = (seconds) => {
        if (internalVideoRef.current) {
            internalVideoRef.current.currentTime += seconds;
        }
    };

    const handlePrevScene = () => {
        if (!scenes || scenes.length === 0 || !internalVideoRef.current) return;

        const currentT = internalVideoRef.current.currentTime;
        // Sort scenes by timestamp
        const sortedScenes = [...scenes].sort((a, b) => a.timestamp - b.timestamp);

        // Find current active scene index
        // A scene is active if currentTime >= scene.timestamp
        // We want to find the LAST scene that meets this criteria
        let currentIndex = -1;
        for (let i = 0; i < sortedScenes.length; i++) {
            if (currentT >= sortedScenes[i].timestamp) {
                currentIndex = i;
            } else {
                break;
            }
        }

        if (currentIndex !== -1) {
            const currentScene = sortedScenes[currentIndex];
            const timeSinceStart = currentT - currentScene.timestamp;

            // Logic: If we are more than 3 seconds into the scene, jump to START of current scene.
            // If we are less than 3 seconds in, jump to START of PREVIOUS scene.
            if (timeSinceStart > 3) {
                internalVideoRef.current.currentTime = currentScene.timestamp;
                setCurrentTime(currentScene.timestamp);
            } else {
                if (currentIndex > 0) {
                    const prevScene = sortedScenes[currentIndex - 1];
                    internalVideoRef.current.currentTime = prevScene.timestamp;
                    setCurrentTime(prevScene.timestamp);
                } else {
                    // At first scene start, just go to 0
                    internalVideoRef.current.currentTime = 0;
                    setCurrentTime(0);
                }
            }
        } else {
            // Before any scenes, go to 0
            internalVideoRef.current.currentTime = 0;
            setCurrentTime(0);
        }
    };

    const handleNextScene = () => {
        if (!scenes || scenes.length === 0 || !internalVideoRef.current) return;

        const currentT = internalVideoRef.current.currentTime;
        const sortedScenes = [...scenes].sort((a, b) => a.timestamp - b.timestamp);

        // Find first scene that is AFTER current time (with small buffer)
        const nextScene = sortedScenes.find(s => s.timestamp > currentT + 1);

        if (nextScene) {
            internalVideoRef.current.currentTime = nextScene.timestamp;
            setCurrentTime(nextScene.timestamp);
        }
    };

    // Auto-hide controls
    useEffect(() => {
        let timeout;
        const resetTimer = () => {
            setShowControls(true);
            clearTimeout(timeout);
            if (isPlaying && !isHoveringTimestamp) { // Don't hide if hovering timeline
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
    }, [isPlaying, isHoveringTimestamp]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
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
                    setDoubleClickAnimation({ type: 'backward', id: Date.now() }); // Reuse animation for feedback
                    break;
                case 'arrowright':
                    if (internalVideoRef.current) internalVideoRef.current.currentTime += 5;
                    setDoubleClickAnimation({ type: 'forward', id: Date.now() });
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
    }, [togglePlay]); // togglePlay ref is stable from useCallback

    return (
        <div
            ref={playerRef}
            className="group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-[#1E293B] select-none"
            onContextMenu={(e) => e.preventDefault()}
            onDoubleClick={handleDoubleClick}
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
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onEnded={() => {
                    setIsPlaying(false);
                    if (onEnded) onEnded();
                }}
            />

            {/* Overlays (Notes) */}
            <VideoNoteOverlay notes={notes} currentTime={currentTime} />

            {/* Buffering Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FaSpinner className="text-white text-5xl animate-spin drop-shadow-lg" />
                </div>
            )}

            {/* Double Click Animations */}
            {doubleClickAnimation.type && (
                <div key={doubleClickAnimation.id} className={`absolute top-1/2 -translate-y-1/2 ${doubleClickAnimation.type === 'forward' ? 'right-1/4' : 'left-1/4'} flex flex-col items-center justify-center text-white/80 animate-ping-once pointer-events-none`}>
                    {doubleClickAnimation.type === 'forward' ? <FaForward size={30} /> : <FaBackward size={30} />}
                    <span className="text-xs font-bold mt-1">10s</span>
                </div>
            )}

            {/* Big Play Button Animation (Center) */}
            {!isPlaying && !isBuffering && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer z-10"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent toggling controls when clicking play button directly
                        togglePlay();
                    }}
                >
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-100 hover:scale-110 active:scale-95 transition-all shadow-xl group-hover:bg-blue-600/80 border border-white/10">
                        <FaPlay size={32} className="ml-2" />
                    </div>
                </div>
            )}

            {/* Tap Overlay to Toggle Controls (Mobile Friendly) */}
            <div
                className="absolute inset-0 z-0"
                onClick={() => setShowControls(!showControls)}
            ></div>

            {/* Controls Bar */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-20 transition-opacity duration-300 z-20 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()} // Prevent clicks on controls from toggling visibility
            >

                {/* Timeline */}
                <div
                    className="relative h-1.5 bg-gray-600/50 rounded-full cursor-pointer mb-4 group/timeline hover:h-2.5 transition-all duration-200"
                    ref={timelineRef}
                    onClick={handleTimelineClick}
                    onMouseMove={(e) => {
                        const rect = timelineRef.current.getBoundingClientRect();
                        const percent = ((e.clientX - rect.left) / rect.width);
                        setIsHoveringTimestamp(Math.max(0, Math.min(1, percent)) * duration);
                    }}
                    onMouseLeave={() => setIsHoveringTimestamp(null)}
                >
                    {/* Hover Preview Bar */}
                    {isHoveringTimestamp !== null && (
                        <div
                            className="absolute top-0 left-0 h-full bg-white/30 rounded-full pointer-events-none"
                            style={{ width: `${(isHoveringTimestamp / duration) * 100}%` }}
                        ></div>
                    )}

                    {/* Progress Fill */}
                    <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                        {/* Drag Handle */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/timeline:scale-100 transition-transform shadow"></div>
                    </div>

                    {/* Scene Markers */}
                    {scenes.map(scene => (
                        <div
                            key={scene._id}
                            className="absolute top-0 w-0.5 h-full bg-white/70 z-10"
                            style={{ left: `${(scene.timestamp / duration) * 100}%` }}
                        />
                    ))}

                    {/* Hover Timestamp */}
                    {isHoveringTimestamp !== null && (
                        <div
                            className="absolute -top-10 transform -translate-x-1/2 bg-black/90 border border-gray-700 text-white text-xs font-bold px-2 py-1 rounded shadow-lg"
                            style={{ left: `${(isHoveringTimestamp / duration) * 100}%` }}
                        >
                            {formatTime(isHoveringTimestamp)}
                        </div>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4">
                            {scenes && scenes.length > 0 && (
                                <button onClick={handlePrevScene} className="text-white/70 hover:text-white transition-colors focus:outline-none" title="Previous Scene">
                                    <FaStepBackward size={14} />
                                </button>
                            )}

                            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors focus:outline-none">
                                {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
                            </button>

                            {scenes && scenes.length > 0 && (
                                <button onClick={handleNextScene} className="text-white/70 hover:text-white transition-colors focus:outline-none" title="Next Scene">
                                    <FaStepForward size={14} />
                                </button>
                            )}

                            <div className="flex items-center gap-2 group/volume">
                                <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors focus:outline-none">
                                    {isMuted || volume === 0 ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
                                </button>
                                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-16 h-1 accent-blue-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <span className="text-white text-xs font-medium tracking-wide">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 relative">
                            {/* Settings Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    data-settings-trigger="true"
                                    className={`text-white hover:text-blue-400 transition-colors focus:outline-none ${showSettings ? 'text-blue-400 rotate-45' : ''} transform transition-transform duration-300`}
                                >
                                    <FaCog size={18} />
                                </button>
                                {/* Settings Menu Popup */}
                                <PlayerSettingsMenu
                                    show={showSettings}
                                    onClose={() => setShowSettings(false)}
                                    playbackRate={playbackRate}
                                    onPlaybackRateChange={handlePlaybackRateChange}
                                    settingsRef={settingsRef}
                                />
                            </div>

                            {/* PiP Button */}
                            <button
                                onClick={togglePiP}
                                className="text-white hover:text-blue-400 transition-colors focus:outline-none hidden sm:block"
                                title="Picture in Picture"
                            >
                                <FaExternalLinkAlt size={16} />
                            </button>

                            <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors focus:outline-none">
                                {isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default VideoPlayer;
