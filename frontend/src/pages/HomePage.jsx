import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import VideoGrid from '../components/VideoGrid';
import VideoRow from '../components/VideoRow';
import Navbar from '../components/Navbar';
import FeedToggle from '../components/FeedToggle';
import { FaFire, FaClock, FaStar } from 'react-icons/fa';

const HomePage = () => {
    const { user, logout } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Feed type state - persist in localStorage
    const [activeFeed, setActiveFeed] = useState(() => {
        return localStorage.getItem('bluT_feedType') || 'forYou';
    });

    const [continueWatching, setContinueWatching] = useState([]);
    const [recentVideos, setRecentVideos] = useState([]);

    // Handle feed type change and persist to localStorage
    const handleFeedTypeChange = (feedType) => {
        setActiveFeed(feedType);
        localStorage.setItem('bluT_feedType', feedType);
    };

    // Fetch main feed based on active feed type and category
    useEffect(() => {
        const fetchMainFeed = async () => {
            setLoading(true);
            setError(null);
            try {
                let endpoint = '/videos'; // Default fallback
                const params = {};

                // Add category filter if not 'All'
                if (selectedCategory !== 'All') {
                    params.category = selectedCategory;
                }

                // Choose endpoint based on feed type
                if (activeFeed === 'forYou') {
                    endpoint = '/videos/feed/algorithmic';
                } else if (activeFeed === 'following') {
                    endpoint = '/videos/feed/following';
                }

                const videosRes = await api.get(endpoint, { params });

                if (videosRes.data.success) {
                    setVideos(videosRes.data.data);
                }
            } catch (err) {
                console.error("Error loading videos:", err);
                setError('Unable to load content.');
            } finally {
                setLoading(false);
            }
        };
        fetchMainFeed();
    }, [selectedCategory, activeFeed]);

    // Separate effect for Feeds (Recent & Continue Watching) - runs once
    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                // Fetch Recent Videos
                const recentRes = await api.get('/videos?sortBy=createdAt&limit=10');
                if (recentRes.data.success) {
                    setRecentVideos(recentRes.data.data);
                }

                // Fetch Continue Watching (if logged in)
                if (user) {
                    const historyRes = await api.get('/users/history');
                    if (historyRes.data.success) {
                        // Filter unfinished videos (progress > 10s and < 95%)
                        const unfinished = historyRes.data.history.filter(item => {
                            if (!item.video) return false;
                            const progress = item.progress || 0;
                            const duration = item.video.durationSec || 0;
                            const percentage = duration > 0 ? (progress / duration) : 0;
                            return progress > 10 && percentage < 0.95;
                        });
                        setContinueWatching(unfinished);
                    }
                }
            } catch (err) {
                console.error("Error fetching feeds:", err);
            }
        };
        fetchFeeds();
    }, [user]);

    const categories = [
        { id: 'All', name: 'All', icon: <FaStar className="text-yellow-500" /> },
        { id: 'Music', name: 'Music', icon: <FaFire className="text-red-500" /> },
        { id: 'Gaming', name: 'Gaming', icon: <FaFire className="text-purple-500" /> },
        { id: 'Technology', name: 'Tech', icon: <FaClock className="text-blue-500" /> },
        { id: 'Education', name: 'Education', icon: <FaStar className="text-green-500" /> },
        { id: 'Vlog', name: 'Vlog', icon: <FaStar className="text-pink-500" /> },
        { id: 'Entertainment', name: 'Fun', icon: <FaFire className="text-orange-500" /> },
    ];

    // Determine main grid title based on active feed
    const getMainGridTitle = () => {
        if (activeFeed === 'following') {
            return selectedCategory === 'All' ? 'Following' : `Following - ${selectedCategory}`;
        }
        return selectedCategory === 'All' ? 'For You' : `${selectedCategory} Videos`;
    };

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">

                {/* Feed Toggle */}
                <FeedToggle
                    activeFeed={activeFeed}
                    onFeedTypeChange={handleFeedTypeChange}
                />

                {/* Feeds Section (Only show on 'For You' feed and 'All' category) */}
                {activeFeed === 'forYou' && selectedCategory === 'All' && (
                    <>
                        {/* Continue Watching Section */}
                        {user && continueWatching.length > 0 && (
                            <VideoRow title="Continue Watching" videos={continueWatching} />
                        )}

                        {/* recently Uploaded Section */}
                        {recentVideos.length > 0 && (
                            <VideoRow title="Recently Uploaded" videos={recentVideos} />
                        )}
                    </>
                )}

                {/* Categories Scroll */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-2 border rounded-full transition-all whitespace-nowrap group ${selectedCategory === cat.id
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-[#1E293B] border-[#334155] text-gray-300 hover:text-white hover:border-blue-500 hover:bg-[#334155]'
                                }`}
                        >
                            <span className="group-hover:scale-110 transition-transform">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Main Video Grid */}
                <h2 className="text-xl font-bold text-white mb-4 px-2">
                    {getMainGridTitle()}
                </h2>

                {!videos.length && !loading && (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {activeFeed === 'following' ? 'No Videos from Followed Creators' : 'Welcome to BluT'}
                        </h2>
                        <p className="text-gray-400">
                            {activeFeed === 'following'
                                ? 'Follow creators to see their videos here!'
                                : 'No videos found. Be the first to upload!'}
                        </p>
                    </div>
                )}

                <VideoGrid videos={videos} isLoading={loading} error={error} />
            </main>
        </div>
    );
};

export default HomePage;
