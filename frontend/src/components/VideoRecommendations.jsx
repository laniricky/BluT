import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaEye } from 'react-icons/fa';

const VideoRecommendations = ({ currentVideoId }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!currentVideoId) return;

            setLoading(true);
            try {
                const response = await api.get(`/videos/${currentVideoId}/recommendations`);
                if (response.data.success) {
                    setVideos(response.data.data);
                }
            } catch (err) {
                console.error("Error loading recommendations:", err);
                setError("Failed to load recommendations");
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [currentVideoId]);

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-white font-bold text-lg mb-4">Up Next</h3>
                {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex gap-3 cursor-pointer group">
                        <div className="w-40 aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                            <div className="absolute inset-0 bg-gray-700 animate-pulse"></div>
                        </div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!videos.length) {
        return null;
    }

    return (
        <div>
            <h3 className="text-white font-bold text-lg mb-4">Up Next</h3>
            <div className="space-y-4">
                {videos.map((video) => (
                    <Link to={`/watch/${video._id}`} key={video._id} className="flex gap-3 group">
                        <div className="w-40 aspect-video bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                            <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                {/* Duration would go here */}
                                00:00
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                                {video.title}
                            </h4>
                            <div className="text-gray-400 text-xs mt-1">
                                <p>{video.user?.username}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span>{video.views?.toLocaleString()} views</span>
                                    <span>•</span>
                                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default VideoRecommendations;
