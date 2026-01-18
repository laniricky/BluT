import { useState, useRef, useEffect } from 'react';
import { useMessages } from '../context/MessageContext';

const MessageInput = () => {
    const { activeConversation, sendMessage, startTyping, stopTyping } =
        useMessages();
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const handleChange = (e) => {
        setMessage(e.target.value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        // Emit typing indicator
        if (activeConversation && e.target.value.length > 0) {
            startTyping(
                activeConversation._id,
                activeConversation.otherUser._id
            );

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 3 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                stopTyping(
                    activeConversation._id,
                    activeConversation.otherUser._id
                );
            }, 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim() || !activeConversation || sending) return;

        setSending(true);

        // Stop typing indicator
        stopTyping(activeConversation._id, activeConversation.otherUser._id);

        try {
            await sendMessage(activeConversation.otherUser._id, message.trim());
            setMessage('');

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        // Send on Enter, new line on Shift+Enter
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    if (!activeConversation) return null;

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
            <div className="flex items-end gap-2">
                {/* Text Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none resize-none max-h-32 placeholder-gray-500"
                        disabled={sending}
                    />

                    {/* Character count */}
                    {message.length > 1800 && (
                        <span
                            className={`absolute bottom-2 right-3 text-xs ${message.length > 2000
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                                }`}
                        >
                            {message.length}/2000
                        </span>
                    )}
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!message.trim() || sending || message.length > 2000}
                    className={`p-3 rounded-xl transition-all duration-200 ${message.trim() && !sending && message.length <= 2000
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {sending ? (
                        <svg
                            className="w-5 h-5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {/* Hint text */}
            <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
            </p>
        </form>
    );
};

export default MessageInput;
