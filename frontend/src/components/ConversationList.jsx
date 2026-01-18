import { useMessages } from '../context/MessageContext';
import Avatar from './Avatar';

const ConversationList = () => {
    const { conversations, activeConversation, selectConversation, loading } =
        useMessages();

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-400">
                Loading conversations...
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">No conversations yet</div>
                <p className="text-sm text-gray-500">
                    Start a new conversation to connect with others
                </p>
            </div>
        );
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const truncateMessage = (text, maxLength = 40) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="divide-y divide-gray-700">
            {conversations.map((conversation) => {
                const isActive = activeConversation?._id === conversation._id;
                const { otherUser, lastMessage, unreadCount, updatedAt } =
                    conversation;

                return (
                    <div
                        key={conversation._id}
                        onClick={() => selectConversation(conversation)}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-700/50 ${isActive ? 'bg-purple-900/30 border-l-4 border-purple-500' : ''
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <Avatar
                                    src={otherUser?.avatar}
                                    alt={otherUser?.username}
                                    size="md"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3
                                        className={`font-semibold truncate ${unreadCount > 0
                                                ? 'text-white'
                                                : 'text-gray-300'
                                            }`}
                                    >
                                        {otherUser?.username || 'Unknown User'}
                                    </h3>
                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                        {formatTime(updatedAt)}
                                    </span>
                                </div>

                                {/* Last Message */}
                                <div className="flex items-center justify-between">
                                    <p
                                        className={`text-sm truncate ${unreadCount > 0
                                                ? 'text-gray-300 font-medium'
                                                : 'text-gray-500'
                                            }`}
                                    >
                                        {lastMessage
                                            ? truncateMessage(lastMessage.content)
                                            : 'No messages yet'}
                                    </p>

                                    {/* Unread Badge */}
                                    {unreadCount > 0 && (
                                        <span className="ml-2 flex-shrink-0 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;
