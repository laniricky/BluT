import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from SecureStore on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');
                const savedUser = await SecureStore.getItemAsync('user');

                if (token && savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                await SecureStore.deleteItemAsync('user');
                await SecureStore.deleteItemAsync('token');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                const { token, user } = response.data;
                await SecureStore.setItemAsync('token', token);
                await SecureStore.setItemAsync('user', JSON.stringify(user));
                setUser(user);
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
