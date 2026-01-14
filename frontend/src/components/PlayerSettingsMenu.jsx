import React from 'react';
import { FaCheck } from 'react-icons/fa';

const PlayerSettingsMenu = ({
    show,
    onClose,
    playbackRate,
    onPlaybackRateChange,
    settingsRef
}) => {
    if (!show) return null;

    const speeds = [0.5, 1, 1.25, 1.5, 2];

    return (
        <div
            ref={settingsRef}
            className="absolute bottom-16 right-4 bg-black/90 text-white rounded-xl overflow-hidden w-48 shadow-2xl border border-gray-700 backdrop-blur-sm z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
            <div className="p-3 border-b border-gray-700 font-bold text-sm bg-gray-800/50">
                Playback Speed
            </div>
            <div className="py-1">
                {speeds.map(speed => (
                    <button
                        key={speed}
                        onClick={() => {
                            onPlaybackRateChange(speed);
                            onClose();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center justify-between transition-colors text-sm"
                    >
                        <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                        {playbackRate === speed && <FaCheck className="text-blue-500 text-xs" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PlayerSettingsMenu;
