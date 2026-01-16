import React, { useState } from 'react';
import { FaTimes, FaCamera, FaImage } from 'react-icons/fa';
import api from '../api/axios';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [bio, setBio] = useState(user.bio || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar || '');
    const [coverPreview, setCoverPreview] = useState(user.coverPhoto || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
            } else {
                setCoverFile(file);
                setCoverPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('bio', bio);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            if (coverFile) {
                formData.append('coverPhoto', coverFile);
            }

            const response = await api.put('/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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
            <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg border border-[#334155] shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-black/50 p-2 rounded-full"
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
                        {/* Cover Photo Input */}
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-800 border-2 border-dashed border-gray-600 group">
                            <img
                                src={coverPreview || 'https://via.placeholder.com/800x200?text=Cover+Photo'}
                                alt="Cover Preview"
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <FaImage className="text-white text-2xl mb-1" />
                                <span className="text-xs text-gray-300">Change Cover</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'cover')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Avatar Input */}
                        <div className="flex flex-col items-center -mt-12 relative z-10">
                            <div className="relative group cursor-pointer">
                                <img
                                    src={avatarPreview || 'https://via.placeholder.com/150'}
                                    alt="Avatar Preview"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-[#1E293B] bg-[#1E293B]"
                                />
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    <FaCamera className="text-white text-xl" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                    className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                                />
                            </div>
                            <span className="text-xs text-gray-500 mt-2">Click to change avatar</span>
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
