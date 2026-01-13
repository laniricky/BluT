import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import VideoGrid from '../components/VideoGrid';
import Navbar from '../components/Navbar';
import { FaFire, FaClock, FaStar } from 'react-icons/fa';

const HomePage = () => {
    const { user, logout } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const params = {};
                if (selectedCategory !== 'All') {
                    params.category = selectedCategory;
                }
                const response = await api.get('/videos', { params });

                if (response.data.success) {
                    setVideos(response.data.data);
                } else {
                    setError('Failed to fetch videos');
                }
            } catch (err) {
                console.error("Error loading videos:", err);
                setError('Unable to load content. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [selectedCategory]);

    const categories = [
        { id: 'All', name: 'All', icon: <FaStar className="text-yellow-500" /> },
        { id: 'Music', name: 'Music', icon: <FaFire className="text-red-500" /> },
        { id: 'Gaming', name: 'Gaming', icon: <FaFire className="text-purple-500" /> },
        { id: 'Technology', name: 'Tech', icon: <FaClock className="text-blue-500" /> },
        { id: 'Education', name: 'Education', icon: <FaStar className="text-green-500" /> },
        { id: 'Vlog', name: 'Vlog', icon: <FaStar className="text-pink-500" /> },
        { id: 'Entertainment', name: 'Fun', icon: <FaFire className="text-orange-500" /> },
    ];

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">

                {/* Continue Watching Section */}
                {user && (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-4">Continue Watching</h2>
                        <ContinueWatchingRow />
                    </div>
                )}

                {/* Hero / Welcome (Only if user is new or empty state) */}
                {!videos.length && !loading && (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome to BluT</h2>
                        <p className="text-gray-400">No videos found. Be the first to upload!</p>
                    </div>
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

                {/* Video Grid */}
                <VideoGrid videos={videos} isLoading={loading} error={error} />
            </main>
        </div>
    );

};

const ContinueWatchingRow = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/users/history');
                if (response.data.success) {
                    // Filter videos with progress > 0 and < 95% completion
                    // Since we don't know duration here without populating it or storing it,
                    // we'll rely on our assumption that if progress > 10 it's "started".
                    // Real implementation would compare with video duration.
                    const unfinished = response.data.history
                        .filter(item => item.progress > 10 && item.video)
                        .slice(0, 4);
                    setVideos(unfinished);
                }
            } catch (err) {
                console.error("Failed to fetch continue watching:", err);
            }
        };
        fetchHistory();
    }, []);

    if (videos.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map(item => (
                <Link to={`/watch/${item.video._id}`} key={item._id} className="group relative block bg-[#1E293B] rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
                    <div className="aspect-video relative">
                        <img
                            src={item.video.thumbnailUrl}
                            alt={item.video.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                            {/* Mock progress bar since we don't have total duration easily available here without fetching it.
                                 If we stored 'duration' (seconds) on Video model, we could calculate percentage.
                                 For now, just showing a partial bar to indicate 'in progress'.
                             */}
                            <div className="h-full bg-red-600" style={{ width: '40%' }}></div>
                        </div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaClock className="text-white text-3xl drop-shadow-lg" />
                        </div>
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-white text-sm truncate">{item.video.title}</h3>
                        <p className="text-gray-400 text-xs mt-1">{item.video.user?.username}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default HomePage;

