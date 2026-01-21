import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import api from '../services/api';

export default function WatchScreen() {
    const route = useRoute();
    const { videoId } = route.params;
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await api.get(`/videos/${videoId}`);
                if (response.data.success) {
                    setVideo(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching video:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoId]);

    if (loading || !video) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">Loading...</Text>
            </View>
        );
    }

    // Helper to resolve full URL
    const getVideoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        // Hack: Assuming local dev, replacing /api with nothing means we need base URL
        // But config.js API_URL includes /api. 
        // Let's assume the API_URL is http://IP:5000/api
        // We need http://IP:5000/ + url (which might be uploads/...)
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        return `${baseUrl}${url}`;
    };

    return (
        <View className="flex-1 bg-black">
            <Video
                style={styles.video}
                source={{
                    uri: getVideoUrl(video.videoUrl),
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay
            />
            <View className="p-4">
                <Text className="text-white text-lg font-bold">{video.title}</Text>
                <Text className="text-gray-400 mt-2">{video.description}</Text>
                <Text className="text-gray-500 mt-2 text-xs">
                    {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    video: {
        width: Dimensions.get('window').width,
        height: 250,
    },
});
