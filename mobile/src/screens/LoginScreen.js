import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        const result = await login(email, password);
        setIsSubmitting(false);

        if (result.success) {
            navigation.navigate('Home');
        } else {
            Alert.alert('Login Failed', result.error);
        }
    };

    return (
        <View className="flex-1 items-center justify-center bg-white px-4">
            <Text className="text-3xl font-bold text-brand-green mb-8">Login</Text>
            <View className="w-full space-y-4">
                <TextInput
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity
                    className="w-full bg-blue-600 p-3 rounded-lg items-center"
                    onPress={handleLogin}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold">Sign In</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
