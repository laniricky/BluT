import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import VideoGrid from '../components/VideoGrid';
import Navbar from '../components/Navbar';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;

            setLoading(true);
            try {
                const response = await api.get(`/videos?search=${encodeURIComponent(query)}`);
                if (response.data.success) {
                    setVideos(response.data.data);
                    // If no videos found, we can handle it in UI
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
    }, [query]);

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-white mb-6">
                    Search results for <span className="text-blue-400">"{query}"</span>
                </h1>

                {!loading && videos.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No videos found matching your search.</p>
                    </div>
                )}

                <VideoGrid videos={videos} isLoading={loading} error={error} />
            </main>
        </div>
    );
};

export default SearchPage;
