import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    // Poll for notifications every 30 seconds
    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, link) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            setIsOpen(false); // Close on click
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all read:', err);
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
                title="Notifications"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-[#334155]">
                        <h3 className="text-white font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-blue-400 text-xs hover:text-blue-300"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-gray-400 text-center py-8 text-sm">No notifications</p>
                        ) : (
                            notifications.map(notification => (
                                <Link
                                    key={notification._id}
                                    to={notification.video ? `/watch/${notification.video._id}` : `/u/${notification.sender.username}`}
                                    onClick={() => handleMarkAsRead(notification._id)}
                                    className={`flex gap-3 p-3 hover:bg-[#334155]/50 transition-colors ${!notification.read ? 'bg-blue-500/10' : ''}`}
                                >
                                    <img
                                        src={notification.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.sender.username}`}
                                        alt="avatar"
                                        className="w-8 h-8 rounded-full object-cover mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-300 text-sm">
                                            <span className="font-semibold text-white">{notification.sender.username}</span>
                                            {notification.type === 'like' && ' liked your video'}
                                            {notification.type === 'comment' && ' commented on your video'}
                                            {notification.type === 'follow' && ' followed you'}
                                        </p>
                                        {notification.video && (
                                            <p className="text-gray-500 text-xs truncate mt-0.5">
                                                {notification.video.title}
                                            </p>
                                        )}
                                        <p className="text-gray-500 text-[10px] mt-1">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
