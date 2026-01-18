import Avatar from './Avatar';

const MessageBubble = ({ message, isOwn }) => {
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar for received messages */}
            {!isOwn && (
                <div className="flex-shrink-0">
                    <Avatar
                        src={message.sender?.avatar}
                        alt={message.sender?.username}
                        size="sm"
                    />
                </div>
            )}

            {/* Message Content */}
            <div
                className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'
                    }`}
            >
                {/* Sender name for received messages */}
                {!isOwn && (
                    <span className="text-xs text-gray-500 mb-1 ml-2">
                        {message.sender?.username}
                    </span>
                )}

                {/* Message Bubble */}
                <div
                    className={`px-4 py-2 rounded-2xl ${isOwn
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-sm'
                            : 'bg-gray-700 text-white rounded-bl-sm'
                        }`}
                >
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                </div>

                {/* Timestamp and Read Status */}
                <div
                    className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwn ? 'flex-row-reverse' : 'flex-row'
                        }`}
                >
                    <span>{formatTime(message.createdAt)}</span>

                    {/* Read receipts for own messages */}
                    {isOwn && (
                        <span>
                            {message.read ? (
                                <svg
                                    className="w-4 h-4 text-blue-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        d="M14.707 5.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
