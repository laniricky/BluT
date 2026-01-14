import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import VideoGrid from '../components/VideoGrid';
import Navbar from '../components/Navbar';
import { FaSortAmountDown } from 'react-icons/fa';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const tag = searchParams.get('tag'); // Get tag from URL
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('relevance');
    const [uploadDate, setUploadDate] = useState('');

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query && !tag) return; // Allow if either exists

            setLoading(true);
            try {
                let url = `/videos?sortBy=${sortBy}`;
                if (query) url += `&search=${encodeURIComponent(query)}`;
                if (tag) url += `&tag=${encodeURIComponent(tag)}`;
                if (uploadDate) url += `&uploadDate=${uploadDate}`;

                const response = await api.get(url);
                if (response.data.success) {
                    setVideos(response.data.data);
                } else {
                    setError('Failed to fetch search results');
                }
            } catch (err) {
                console.error("Error searching videos:", err);
                setError('Error performing search.');
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, tag, sortBy, uploadDate]);

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-white">
                        {tag ? (
                            <>Results for tag <span className="text-blue-400">#{tag}</span></>
                        ) : (
                            <>Search results for <span className="text-blue-400">"{query}"</span></>
                        )}
                    </h1>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-3">

                        {/* Sort By */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm flex items-center gap-1"><FaSortAmountDown /> Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-[#1E293B] text-white border border-[#334155] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="createdAt">Upload Date</option>
                                <option value="views">View Count</option>
                            </select>
                        </div>

                        {/* Upload Date */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Time:</span>
                            <select
                                value={uploadDate}
                                onChange={(e) => setUploadDate(e.target.value)}
                                className="bg-[#1E293B] text-white border border-[#334155] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">All Time</option>
                                <option value="hour">Last Hour</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                    </div>
                </div>

                {!loading && videos.length === 0 && (
                    <div className="text-center py-20 bg-[#1E293B]/30 rounded-xl border border-[#334155] border-dashed">
                        <p className="text-gray-400 text-lg">No videos found matching your search.</p>
                        <p className="text-gray-500 text-sm mt-2">Try different keywords or check your spelling.</p>
                    </div>
                )}

                <VideoGrid videos={videos} isLoading={loading} error={error} />
            </main>
        </div>
    );
};

export default SearchPage;
