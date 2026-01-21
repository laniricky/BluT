import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config';

export default function VideoCard({ video }) {
    const navigation = useNavigation();

    // Helper to resolve full URL if relative
    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/320x180';
        if (url.startsWith('http')) return url;
        // Remove /api from API_URL to get Base URL, assuming images are hosted relatively
        const baseUrl = API_URL.replace('/api', '');
        return `${baseUrl}${url}`;
    };

    return (
        <TouchableOpacity
            className="mb-4 bg-white dark:bg-slate-900"
            onPress={() => navigation.navigate('Watch', { videoId: video._id })}
        >
            {/* Thumbnail */}
            <View className="relative">
                <Image
                    source={{ uri: getImageUrl(video.thumbnailUrl) }}
                    className="w-full h-56 bg-gray-200"
                    resizeMode="cover"
                />
                <View className="absolute bottom-2 right-2 bg-black/80 px-1 rounded">
                    <Text className="text-white text-xs">{video.duration || '00:00'}</Text>
                </View>
            </View>

            {/* Info */}
            <View className="flex-row p-3">
                {/* Avatar Placeholder or real avatar */}
                <View className="mr-3">
                    <Image
                        source={{ uri: getImageUrl(video.user?.avatar) }}
                        className="w-10 h-10 rounded-full bg-gray-300"
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 line-clamp-2" numberOfLines={2}>
                        {video.title}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                        {video.user?.username || 'Unknown'} • {video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
