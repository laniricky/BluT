import React, { useRef } from 'react';
import VideoCard from './VideoCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const VideoRow = ({ title, videos, isLoading }) => {
    const rowRef = useRef(null);

    const scroll = (offset) => {
        if (rowRef.current) {
            rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    if (isLoading) return null;
    if (!videos || videos.length === 0) return null;

    return (
        <div className="mb-8 group">
            <h2 className="text-xl font-bold text-white mb-4 px-4">{title}</h2>
            <div className="relative">
                {/* Scroll Left Button */}
                <button
                    onClick={() => scroll(-300)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                >
                    <FaChevronLeft />
                </button>

                {/* Video Row */}
                <div
                    ref={rowRef}
                    className="flex overflow-x-auto gap-4 px-4 scrollbar-hide pb-4 snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {videos.map((video) => (
                        <div key={video._id || video.video?._id} className="min-w-[300px] snap-start">
                            {/* Handle nested video object from history vs flat video object */}
                            <VideoCard
                                video={video.video ? { ...video.video, progress: video.progress } : video}
                            />
                        </div>
                    ))}
                </div>

                {/* Scroll Right Button */}
                <button
                    onClick={() => scroll(300)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default VideoRow;
