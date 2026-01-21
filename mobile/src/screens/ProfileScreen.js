import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import { API_URL } from '../config';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigation.navigate('Login');
            return;
        }

        const fetchUserVideos = async () => {
            try {
                const response = await api.get(`/users/${user.username}`);
                if (response.data.success) {
                    setVideos(response.data.data.videos); // Adjust based on actual API response structure
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserVideos();
    }, [user]);

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/150';
        if (url.startsWith('http')) return url;
        const baseUrl = API_URL.replace('/api', '');
        return `${baseUrl}${url}`;
    };

    if (loading) return <ActivityIndicator className="flex-1 bg-white" color="#00cc88" />;

    if (!user) return null;

    return (
        <View className="flex-1 bg-white">
            <View className="p-6 items-center border-b border-gray-200">
                <Image
                    source={{ uri: getImageUrl(user.avatar) }}
                    className="w-24 h-24 rounded-full bg-gray-300 mb-4"
                />
                <Text className="text-2xl font-bold text-gray-900">{user.username}</Text>
                <Text className="text-gray-500 mb-4">{user.email}</Text>

                <TouchableOpacity
                    className="bg-red-500 px-6 py-2 rounded-full"
                    onPress={logout}
                >
                    <Text className="text-white font-bold">Log Out</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={videos}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <VideoCard video={item} />}
                contentContainerStyle={{ padding: 16 }}
                ListHeaderComponent={() => (
                    <Text className="text-lg font-bold mb-4">My Videos</Text>
                )}
                ListEmptyComponent={() => (
                    <Text className="text-gray-500 text-center mt-10">No videos uploaded yet.</Text>
                )}
            />
        </View>
    );
}
