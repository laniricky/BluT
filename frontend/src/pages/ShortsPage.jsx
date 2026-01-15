import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import ShortsPlayer from '../components/ShortsPlayer';
import CommentSection from '../components/CommentSection';
import { FaSpinner } from 'react-icons/fa';

const ShortsPage = () => {
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);

    const fetchShorts = async () => {
        setLoading(true);
        try {
            // Passing limit=5 for initial load
            const response = await api.get('/videos/shorts?limit=5');
            if (response.data.success) {
                // If we already have shorts, append new ones (ignoring duplicates if any, though random sample logic implies they might appear again)
                // Ideally backend handles uniqueness or we do client side
                setShorts(prev => [...prev, ...response.data.data]);
            }
        } catch (error) {
            console.error("Error fetching shorts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShorts();
    }, []);

    // Scroll Snapping Observer to auto-play/pause
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.dataset.index);
                        setActiveIndex(index);

                        // Load more when reaching near end
                        if (index >= shorts.length - 2 && !loading) {
                            fetchShorts();
                        }
                    }
                });
            },
            {
                threshold: 0.6, // Trigger when 60% visible
            }
        );

        const elements = document.querySelectorAll('.shorts-item');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [shorts.length, loading]); // Update observer when list changes

    const handleNext = () => {
        if (activeIndex < shorts.length - 1) {
            const nextIndex = activeIndex + 1;
            const nextElement = document.querySelector(`[data-index="${nextIndex}"]`);
            if (nextElement) {
                nextElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col">
            <Navbar />

            <div className="flex-1 flex overflow-hidden justify-center relative">
                {/* Left Column: Feed Container */}
                <div
                    ref={containerRef}
                    className="overflow-y-scroll snap-y snap-mandatory scrollbar-hide h-full w-full md:w-[450px] relative flex flex-col items-center flex-shrink-0"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {shorts.length === 0 && !loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-white">
                            <p className="text-xl font-bold">No Shorts Found</p>
                            <p className="text-gray-400 mt-2">Check back later for new content!</p>
                        </div>
                    ) : (
                        shorts.map((video, index) => (
                            <div
                                key={`${video._id}-${index}`}
                                data-index={index}
                                className="shorts-item w-full h-[calc(100vh-64px)] snap-start snap-always relative border-b border-gray-800 flex-shrink-0 bg-black"
                            >
                                <ShortsPlayer
                                    video={video}
                                    isActive={index === activeIndex}
                                    onNext={handleNext}
                                />
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="h-20 flex items-center justify-center w-full bg-black text-white snap-start">
                            <FaSpinner className="animate-spin text-2xl" />
                        </div>
                    )}
                </div>

                {/* Right Column: Stationary Comments (Desktop Only) */}
                <div className="hidden md:flex flex-1 max-w-[500px] flex-col bg-[#0F172A] border-l border-gray-800 h-full z-10">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700 bg-[#1E293B]">
                        <h3 className="text-white font-bold text-lg">Comments</h3>
                    </div>

                    {/* Scrollable Comments Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#0F172A]">
                        {shorts.length > 0 && shorts[activeIndex] ? (
                            <CommentSection
                                key={shorts[activeIndex]._id} // Key to force re-render/fetch on video change
                                videoId={shorts[activeIndex]._id}
                                scenes={[]}
                                onSeek={() => { }}
                                currentTime={0}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                Loading comments...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShortsPage;
