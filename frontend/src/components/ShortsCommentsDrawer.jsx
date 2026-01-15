import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import CommentSection from './CommentSection';

const ShortsCommentsDrawer = ({ videoId, onClose, isOpen }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300); // Wait for animation
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`absolute inset-0 z-50 flex flex-col justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            {/* Drawer */}
            <div
                className={`relative w-full bg-[#0F172A] rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h3 className="text-white font-bold">Comments</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* Reuse existing CommentSection but hide scenes since shorts don't use them typically */}
                    <CommentSection
                        videoId={videoId}
                        scenes={[]}
                        onSeek={() => { }} // No seek for shorts MVP
                        currentTime={0}
                    />
                </div>
            </div>
        </div>
    );
};

export default ShortsCommentsDrawer;
