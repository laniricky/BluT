import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { FaEye, FaThumbsUp, FaUsers, FaVideo, FaChartBar } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/users/dashboard/stats');
                if (response.data.success) {
                    setStats(response.data.stats);
                } else {
                    setError('Failed to fetch stats');
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError('Error loading dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] pb-10">
            <Navbar />
            <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
                    <Link
                        to="/upload"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
                    >
                        <FaVideo /> Upload New Video
                    </Link>
                </div>

                {error && <div className="text-red-500 mb-6">{error}</div>}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">Total Views</h3>
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                                <FaEye size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.totalViews.toLocaleString()}</p>
                    </div>

                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">Total Likes</h3>
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
                                <FaThumbsUp size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.totalLikes.toLocaleString()}</p>
                    </div>

                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">Total Followers</h3>
                            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
                                <FaUsers size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.followersCount.toLocaleString()}</p>
                    </div>
                </div>


                {/* Main Analytics Chart */}
                {stats?.chartData && stats.chartData.length > 0 && (
                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155] mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <FaChartBar className="text-blue-500" />
                            <h2 className="text-xl font-bold text-white">Channel Analytics (Last 30 Days)</h2>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.chartData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="date" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', color: '#fff' }}
                                        cursor={{ fill: '#334155', opacity: 0.2 }}
                                    />
                                    <Legend />
                                    <Bar dataKey="views" fill="#3b82f6" name="Views" />
                                    <Bar dataKey="likes" fill="#ef4444" name="Likes" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Video Performance Table */}
                <h2 className="text-xl font-bold text-white mb-6">Video Performance</h2>
                <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0F172A] text-gray-400 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">Video</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-center">Views</th>
                                    <th className="px-6 py-4 text-center">Likes</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#334155] text-gray-300">
                                {stats?.videos.map((video) => (
                                    <tr key={video._id} className="hover:bg-[#334155]/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    className="w-16 h-9 object-cover rounded"
                                                />
                                                <span className="font-medium text-white truncate max-w-xs">{video.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono">
                                            {video.views.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-green-400">
                                            {video.likesCount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${video.visibility === 'private'
                                                ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                : 'bg-green-500/10 text-green-500 border-green-500/20'
                                                }`}>
                                                {video.visibility === 'private' ? 'Private' : 'Public'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {stats?.videos.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No videos uploaded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default DashboardPage;
