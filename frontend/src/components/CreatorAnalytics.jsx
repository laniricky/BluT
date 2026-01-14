import React, { useEffect, useState } from 'react';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import axios from '../api/axios';

const CreatorAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/analytics/creator', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
                {error}
            </div>
        );
    }

    if (!analytics) {
        return null;
    }

    // Transform data for Victory charts
    const chartData = analytics.viewsOverTime.map((item, index) => ({
        x: index,
        y: item.count,
        label: `${item._id}: ${item.count} views`
    }));

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6">
                    <div className="text-gray-400 text-sm mb-2">Total Videos</div>
                    <div className="text-3xl font-bold text-white">{analytics.totalVideos}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-6">
                    <div className="text-gray-400 text-sm mb-2">Total Views</div>
                    <div className="text-3xl font-bold text-white">{analytics.totalViews.toLocaleString()}</div>
                </div>

                <div className="bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-lg p-6">
                    <div className="text-gray-400 text-sm mb-2">Total Likes</div>
                    <div className="text-3xl font-bold text-white">{analytics.totalLikes.toLocaleString()}</div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6">
                    <div className="text-gray-400 text-sm mb-2">Followers</div>
                    <div className="text-3xl font-bold text-white">{analytics.followersCount.toLocaleString()}</div>
                </div>
            </div>

            {/* Views Over Time Chart */}
            {chartData.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Views Over Time (Last 30 Days)</h3>
                    <div className="w-full" style={{ height: '300px' }}>
                        <VictoryChart
                            theme={VictoryTheme.material}
                            containerComponent={
                                <VictoryVoronoiContainer
                                    labels={({ datum }) => datum.label}
                                    labelComponent={<VictoryTooltip style={{ fill: 'white', fontSize: 14 }} />}
                                />
                            }
                            padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
                            height={300}
                        >
                            <VictoryAxis
                                style={{
                                    axis: { stroke: '#666' },
                                    tickLabels: { fill: '#999', fontSize: 12 }
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                style={{
                                    axis: { stroke: '#666' },
                                    tickLabels: { fill: '#999', fontSize: 12 },
                                    grid: { stroke: '#333', strokeDasharray: '5,5' }
                                }}
                            />
                            <VictoryLine
                                data={chartData}
                                style={{
                                    data: { stroke: '#a855f7', strokeWidth: 3 },
                                    parent: { border: '1px solid #ccc' }
                                }}
                            />
                        </VictoryChart>
                    </div>
                </div>
            )}

            {/* Top Performing Videos */}
            {analytics.topVideos && analytics.topVideos.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Top Performing Videos</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left text-gray-400 font-medium py-3 px-4">Video</th>
                                    <th className="text-right text-gray-400 font-medium py-3 px-4">Views</th>
                                    <th className="text-right text-gray-400 font-medium py-3 px-4">Likes</th>
                                    <th className="text-right text-gray-400 font-medium py-3 px-4">Uploaded</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.topVideos.map((video, index) => (
                                    <tr key={video._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl font-bold text-purple-500">#{index + 1}</div>
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    className="w-16 h-10 object-cover rounded"
                                                />
                                                <span className="text-white">{video.title}</span>
                                            </div>
                                        </td>
                                        <td className="text-right text-white py-3 px-4">
                                            {video.views.toLocaleString()}
                                        </td>
                                        <td className="text-right text-white py-3 px-4">
                                            {video.likes.toLocaleString()}
                                        </td>
                                        <td className="text-right text-gray-400 py-3 px-4">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatorAnalytics;
