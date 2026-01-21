import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../services/api';
import VideoCard from '../components/VideoCard';

export default function HomeScreen() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchVideos = async () => {
        try {
            const response = await api.get('/videos');
            if (response.data.success) {
                setVideos(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchVideos();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#00cc88" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={videos}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <VideoCard video={item} />}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center pt-20">
                        <Text className="text-gray-500">No videos found</Text>
                    </View>
                }
            />
        </View>
    );
}
