import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';

const UploadPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [category, setCategory] = useState('Other');
    const [visibility, setVisibility] = useState('public');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [duration, setDuration] = useState('00:00');
    const [durationSec, setDurationSec] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'video') {
            setVideoFile(file);
            // Extract duration
            const videoElement = document.createElement('video');
            videoElement.preload = 'metadata';
            videoElement.onloadedmetadata = function () {
                window.URL.revokeObjectURL(videoElement.src);
                const duration = videoElement.duration;
                setDurationSec(duration);

                // Format duration
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                setDuration(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
            videoElement.src = URL.createObjectURL(file);
        }
        else setThumbnailFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!videoFile || !thumbnailFile) {
            setError('Please select both a video and a thumbnail.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('tags', tags);
        formData.append('category', category);
        formData.append('visibility', visibility);
        formData.append('video', videoFile);
        formData.append('thumbnail', thumbnailFile);
        formData.append('duration', duration);
        formData.append('durationSec', durationSec);

        try {
            const response = await api.post('/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                navigate('/');
            } else {
                setError('Upload failed. Please try again.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Error uploading video.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] pt-20 px-4">
            <div className="max-w-2xl mx-auto bg-[#1E293B] p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <FaCloudUploadAlt className="text-blue-500" /> Upload Video
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 mb-2 font-medium">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Video Title"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2 font-medium">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-32 resize-none"
                            placeholder="Tell viewers about your video..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-300 mb-2 font-medium">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                {['Other', 'Music', 'Gaming', 'Technology', 'Education', 'Vlog', 'Entertainment'].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 font-medium">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="react, coding, tutorial"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2 font-medium">Visibility</label>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <p className="text-gray-500 text-xs mt-1">
                            Private videos are only visible to you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-300 mb-2 font-medium">Video File</label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileChange(e, 'video')}
                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 font-medium">Thumbnail</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'thumbnail')}
                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${loading
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] shadow-lg shadow-blue-500/30 text-white'
                            }`}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" /> Uploading...
                            </>
                        ) : (
                            'Upload Video'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadPage;
