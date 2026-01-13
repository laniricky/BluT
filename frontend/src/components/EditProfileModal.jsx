import React, { useState } from 'react';
import { FaTimes, FaCamera } from 'react-icons/fa';
import api from '../api/axios';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [bio, setBio] = useState(user.bio || '');
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.put('/users/profile', { bio, avatar });
            if (response.data.success) {
                onUpdate(response.data.user);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg border border-[#334155] shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Preview/Input */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <img
                                    src={avatar || 'https://via.placeholder.com/150'}
                                    alt="Avatar Preview"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-[#334155]"
                                />
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaCamera className="text-white text-xl" />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Avatar URL</label>
                                <input
                                    type="text"
                                    value={avatar}
                                    onChange={(e) => setAvatar(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">Paste an image URL (uploading coming soon)</p>
                            </div>
                        </div>

                        {/* Bio Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="4"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                placeholder="Tell us about yourself..."
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
