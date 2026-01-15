import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { FaEye, FaThumbsUp, FaUsers, FaVideo, FaChartBar, FaComments, FaArrowUp, FaArrowDown, FaFire, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'views', direction: 'desc' });

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

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedVideos = stats?.videos ? [...stats.videos].sort((a, b) => {
        const aVal = sortConfig.key === 'engagementRate' ? parseFloat(a[sortConfig.key]) : a[sortConfig.key];
        const bVal = sortConfig.key === 'engagementRate' ? parseFloat(b[sortConfig.key]) : b[sortConfig.key];

        if (sortConfig.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
    }) : [];

    const TrendIndicator = ({ value, label }) => {
        const isPositive = value >= 0;
        const isNeutral = value === 0;

        return (
            <div className={`flex items-center gap-1 text-sm ${isNeutral ? 'text-gray-400' : isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {!isNeutral && (isPositive ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />)}
                <span className="font-medium">{Math.abs(value)}%</span>
                <span className="text-xs text-gray-500">{label}</span>
            </div>
        );
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <FaSort className="text-gray-600" size={12} />;
        }
        return sortConfig.direction === 'asc'
            ? <FaSortUp className="text-blue-500" size={12} />
            : <FaSortDown className="text-blue-500" size={12} />;
    };

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
                    <div>
                        <h1 className="text-3xl font-bold text-white">Creator Analytics</h1>
                        <p className="text-gray-400 mt-1">Track your performance and grow your audience</p>
                    </div>
                    <Link
                        to="/upload"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
                    >
                        <FaVideo /> Upload New Video
                    </Link>
                </div>

                {error && <div className="text-red-500 mb-6">{error}</div>}

                {/* Enhanced Stats Cards with Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">Total Views</h3>
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                                <FaEye size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{stats?.totalViews?.toLocaleString()}</p>
                        <TrendIndicator value={stats?.viewsTrend || 0} label="vs last month" />
                    </div>

                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">Total Likes</h3>
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
                                <FaThumbsUp size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{stats?.totalLikes?.toLocaleString()}</p>
                        <TrendIndicator value={stats?.likesTrend || 0} label="vs last month" />
                    </div>

                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">Followers</h3>
                            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
                                <FaUsers size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{stats?.followersCount?.toLocaleString()}</p>
                        <TrendIndicator value={stats?.followersTrend || 0} label="vs last month" />
                    </div>

                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 font-medium">Engagement Rate</h3>
                            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                                <FaFire size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{stats?.overallEngagementRate}%</p>
                        <div className="text-sm text-gray-400">
                            {stats?.totalComments?.toLocaleString()} comments
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
                    {/* Views & Likes Chart */}
                    {stats?.chartData && stats.chartData.length > 0 && (
                        <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                            <div className="flex items-center gap-3 mb-6">
                                <FaChartBar className="text-blue-500" />
                                <h2 className="text-xl font-bold text-white">Views & Likes (Last 30 Days)</h2>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats.chartData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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

                    {/* Follower Growth Chart */}
                    {stats?.followerGrowthData && stats.followerGrowthData.length > 0 && (
                        <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                            <div className="flex items-center gap-3 mb-6">
                                <FaUsers className="text-purple-500" />
                                <h2 className="text-xl font-bold text-white">Follower Growth (Last 30 Days)</h2>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={stats.followerGrowthData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="date" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="followers"
                                            stroke="#a855f7"
                                            fillOpacity={1}
                                            fill="url(#colorFollowers)"
                                            name="Followers"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Performing Videos */}
                {stats?.topVideos && stats.topVideos.length > 0 && (
                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155] mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <FaFire className="text-orange-500" />
                            <h2 className="text-xl font-bold text-white">Top Performing Videos</h2>
                            <span className="text-sm text-gray-400">(by engagement rate)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {stats.topVideos.map((video, index) => (
                                <div key={video._id} className="bg-[#0F172A] rounded-lg overflow-hidden border border-[#334155] hover:border-blue-500 transition-colors">
                                    <div className="relative">
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            #{index + 1}
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                                            {video.engagementRate}%
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-white font-medium text-sm truncate mb-2">{video.title}</p>
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>{video.views} views</span>
                                            <span>{video.likesCount} likes</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Scenes */}
                {stats?.topScenes && stats.topScenes.length > 0 && (
                    <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155] mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <FaChartBar className="text-purple-500" />
                            <h2 className="text-xl font-bold text-white">Top Performing Chapters</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.topScenes.map((scene, index) => (
                                <div key={index} className="bg-[#0F172A] p-4 rounded-lg flex items-center justify-between border border-[#334155]">
                                    <div>
                                        <p className="font-bold text-white text-lg">#{index + 1} {scene.sceneTitle}</p>
                                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{scene.videoTitle}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-500">{scene.count}</p>
                                        <p className="text-xs text-gray-400">Clicks</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video Performance Table with Sorting */}
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaVideo className="text-blue-500" />
                    All Videos Performance
                </h2>
                <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0F172A] text-gray-400 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">Video</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th
                                        className="px-6 py-4 text-center cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('views')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Views <SortIcon columnKey="views" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-center cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('likesCount')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Likes <SortIcon columnKey="likesCount" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-center cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('commentsCount')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Comments <SortIcon columnKey="commentsCount" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-center cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('engagementRate')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Engagement <SortIcon columnKey="engagementRate" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#334155] text-gray-300">
                                {sortedVideos.map((video) => {
                                    const engagementNum = parseFloat(video.engagementRate);
                                    const engagementColor = engagementNum > 5
                                        ? 'text-green-400'
                                        : engagementNum > 2
                                            ? 'text-yellow-400'
                                            : 'text-gray-400';

                                    return (
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
                                            <td className="px-6 py-4 text-center font-mono text-red-400">
                                                {video.likesCount?.toLocaleString() || 0}
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-blue-400">
                                                {video.commentsCount?.toLocaleString() || 0}
                                            </td>
                                            <td className={`px-6 py-4 text-center font-mono font-bold ${engagementColor}`}>
                                                {video.engagementRate}%
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
                                    );
                                })}
                                {sortedVideos.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No videos uploaded yet. Upload your first video to see analytics!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
