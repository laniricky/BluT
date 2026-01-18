import { useEffect, useRef } from 'react';
import { useMessages } from '../context/MessageContext';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatWindow = ({ onBack }) => {
    const { user } = useAuth();
    const { activeConversation, messages, typingUsers } = useMessages();
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (!activeConversation) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-12 h-12 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    No conversation selected
                </h3>
                <p className="text-gray-400">
                    Choose a conversation from the list or start a new one
                </p>
            </div>
        );
    }

    const { otherUser } = activeConversation;
    const isTyping = typingUsers.size > 0;

    return (
        <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    {/* Back button for mobile */}
                    <button
                        onClick={onBack}
                        className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    <Avatar
                        src={otherUser?.avatar}
                        alt={otherUser?.username}
                        size="sm"
                    />

                    <div className="flex-1">
                        <h2 className="font-semibold text-white">
                            {otherUser?.username || 'Unknown User'}
                        </h2>
                        {otherUser?.bio && (
                            <p className="text-xs text-gray-500 truncate">
                                {otherUser.bio}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-gray-400 mb-2">No messages yet</p>
                        <p className="text-sm text-gray-500">
                            Send a message to start the conversation
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message._id}
                            message={message}
                            isOwn={message.sender._id === user.id}
                        />
                    ))
                )}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                            ></span>
                            <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.4s' }}
                            ></span>
                        </div>
                        <span>{otherUser?.username} is typing...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput />
        </div>
    );
};

export default ChatWindow;
