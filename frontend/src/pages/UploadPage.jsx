import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaCloudUploadAlt, FaSpinner, FaImage, FaFilm, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const UploadPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [category, setCategory] = useState('Other');
    const [visibility, setVisibility] = useState('public');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [duration, setDuration] = useState('00:00');
    const [durationSec, setDurationSec] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const videoInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    const handleFileChange = (e, type) => {
        const file = e.target.files?.[0];
        processFile(file, type);
    };

    const processFile = (file, type) => {
        if (!file) return;

        if (type === 'video') {
            if (!file.type.startsWith('video/')) {
                setError('Please upload a valid video file.');
                return;
            }
            setVideoFile(file);
            // Auto-fill title if empty
            if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));

            // Extract duration
            const videoElement = document.createElement('video');
            videoElement.preload = 'metadata';
            videoElement.onloadedmetadata = function () {
                window.URL.revokeObjectURL(videoElement.src);
                const duration = videoElement.duration;
                setDurationSec(duration);
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                setDuration(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
            videoElement.src = URL.createObjectURL(file);
        } else if (type === 'thumbnail') {
            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file.');
                return;
            }
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Assume dropped file is video if no video yet, or check type
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('video/')) {
                processFile(file, 'video');
            } else if (file.type.startsWith('image/') && videoFile) {
                // If video exists and dropped image, treat as thumbnail
                processFile(file, 'thumbnail');
            } else {
                processFile(file, 'video'); // Default to trying as video
            }
        }
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
                headers: { 'Content-Type': 'multipart/form-data' },
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
        <div className="min-h-screen bg-[#0F172A] text-white pt-20 px-4 pb-12">
            <div className={`max-w-5xl mx-auto transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Creator Studio</h1>
                        <p className="text-gray-400 mt-1">Upload and manage your content</p>
                    </div>
                    {videoFile && (
                        <button
                            onClick={() => { setVideoFile(null); setThumbnailFile(null); setThumbnailPreview(null); setTitle(''); }}
                            className="text-sm text-gray-400 hover:text-white flex items-center gap-2 hover:bg-[#1E293B] px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-600"
                        >
                            <FaTimesCircle /> Cancel Upload
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <FaTimesCircle className="text-xl" /> {error}
                    </div>
                )}

                {!videoFile ? (
                    // Initial Drag & Drop State
                    <div
                        className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[400px] cursor-pointer group
                            ${dragActive ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' : 'border-gray-700 bg-[#1E293B]/30 hover:bg-[#1E293B]/50 hover:border-gray-500'}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => videoInputRef.current.click()}
                    >
                        <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'video')}
                        />

                        <div className={`w-24 h-24 rounded-full bg-[#0F172A] flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 border border-gray-700 ${dragActive ? 'border-blue-500' : ''}`}>
                            <FaCloudUploadAlt className={`text-4xl ${dragActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-white'}`} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Drag and drop video files to upload</h3>
                        <p className="text-gray-400 mb-8">Your videos will be private until you publish them.</p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                            Select Files
                        </button>
                    </div>
                ) : (
                    // Details Editor State
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Left Col: Metadata */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-[#1E293B]/50 border border-[#334155] rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                    Details
                                </h3>

                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">Title (required)</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                                            placeholder="Give your video a catchy title"
                                            required
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600 h-32 resize-none"
                                            placeholder="Tell viewers about your video..."
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="group">
                                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">Category</label>
                                            <div className="relative">
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                                >
                                                    {['Other', 'Music', 'Gaming', 'Technology', 'Education', 'Vlog', 'Entertainment'].map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">Visibility</label>
                                            <div className="relative">
                                                <select
                                                    value={visibility}
                                                    onChange={(e) => setVisibility(e.target.value)}
                                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="public">Public</option>
                                                    <option value="unlisted">Unlisted</option>
                                                    <option value="private">Private</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">Tags</label>
                                        <input
                                            type="text"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                                            placeholder="react, coding, tutorial (comma separated)"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail Section */}
                            <div className="bg-[#1E293B]/50 border border-[#334155] rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                    Thumbnail
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">Select or upload a picture that shows what your video is about.</p>

                                <div className="flex gap-4">
                                    <div
                                        onClick={() => thumbnailInputRef.current.click()}
                                        className="w-40 aspect-video border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-800 transition-all"
                                    >
                                        <FaImage className="text-2xl text-gray-500 mb-2" />
                                        <span className="text-xs text-gray-400 font-medium">Upload file</span>
                                        <input
                                            ref={thumbnailInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, 'thumbnail')}
                                        />
                                    </div>

                                    {thumbnailPreview && (
                                        <div className="relative w-40 aspect-video rounded-xl overflow-hidden border border-purple-500 ring-2 ring-purple-500/30">
                                            <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); thumbnailInputRef.current.click(); }}
                                                    className="text-xs bg-black/60 text-white px-2 py-1 rounded"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Preview & Publish */}
                        <div className="space-y-6">
                            {/* Preview Card */}
                            <div className="bg-[#1E293B] rounded-2xl overflow-hidden sticky top-24 shadow-2xl border border-[#334155]">
                                <div className="aspect-video bg-black flex items-center justify-center relative">
                                    {thumbnailPreview ? (
                                        <img src={thumbnailPreview} alt="Video preview" className="w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <div className="text-gray-600 flex flex-col items-center">
                                            <FaFilm className="text-4xl mb-2" />
                                            <span className="text-sm">Video Preview</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-mono">
                                        {duration}
                                    </div>
                                </div>
                                <div className="p-4 bg-[#0F172A]">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-white line-clamp-2">{title || "Video Title"}</h4>
                                            <p className="text-xs text-gray-400 mt-1">{visibility} • {category}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                        <span className="bg-gray-800 px-2 py-1 rounded">Processing...</span>
                                        <span>Just now</span>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-[#334155]">
                                    <button
                                        type="submit"
                                        disabled={loading || !thumbnailFile}
                                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${loading || !thumbnailFile
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] text-white'
                                            }`}
                                    >
                                        {loading ? <><FaSpinner className="animate-spin" /> Uploading...</> : 'Publish Video'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
};

export default UploadPage;
