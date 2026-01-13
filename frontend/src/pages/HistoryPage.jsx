import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/users/history');
                if (response.data.success) {
                    setHistory(response.data.history);
                } else {
                    setError('Failed to fetch history');
                }
            } catch (err) {
                console.error('Error fetching history:', err);
                setError('Error loading history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-[#0F172A] pb-10">
            <Navbar />
            <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Watch History</h1>

                {loading ? (
                    <div className="flex justify-center mt-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center mt-10">{error}</div>
                ) : history.length === 0 ? (
                    <div className="text-gray-400 text-center mt-10 text-lg">
                        You haven't watched any videos yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {history.map((item) => {
                            const video = item.video;
                            if (!video) return null; // Skip deleted videos

                            return (
                                <Link to={`/watch/${video._id}`} key={item._id} className="group cursor-pointer">
                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
                                            {video.duration || '00:00'}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <img
                                            src={video.user?.avatar || 'https://via.placeholder.com/40'}
                                            alt={video.user?.username}
                                            className="w-9 h-9 rounded-full object-cover"
                                        />
                                        <div>
                                            <h3 className="text-white font-bold line-clamp-2 leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                                                {video.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm hover:text-white transition-colors">
                                                {video.user?.username || 'Unknown User'}
                                            </p>
                                            <div className="flex items-center text-gray-500 text-xs mt-1">
                                                <span>{video.views} views</span>
                                                <span className="mx-1">•</span>
                                                <span>Watched on {new Date(item.viewedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
