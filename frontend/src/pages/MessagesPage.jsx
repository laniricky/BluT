import { useEffect, useState } from 'react';
import { useMessages } from '../context/MessageContext';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import NewMessageButton from '../components/NewMessageButton';

const MessagesPage = () => {
    const { isAuthenticated } = useAuth();
    const { conversations, activeConversation, loading } = useMessages();
    const [showChat, setShowChat] = useState(false);
    const [showNewMessage, setShowNewMessage] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = '/login';
        }
    }, [isAuthenticated]);

    // Reset mobile view when conversation changes
    useEffect(() => {
        if (activeConversation) {
            setShowChat(true);
        }
    }, [activeConversation]);

    const handleBackToList = () => {
        setShowChat(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20">
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
                        <p className="text-gray-400">
                            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-250px)]">
                            {/* Conversation List - Hidden on mobile when chat is shown */}
                            <div
                                className={`${showChat ? 'hidden md:block' : 'block'
                                    } md:col-span-1 border-r border-gray-700 overflow-y-auto`}
                            >
                                <ConversationList />
                            </div>

                            {/* Chat Window - Hidden on mobile when list is shown */}
                            <div
                                className={`${showChat ? 'block' : 'hidden md:block'
                                    } md:col-span-2`}
                            >
                                <ChatWindow onBack={handleBackToList} />
                            </div>
                        </div>
                    </div>

                    {/* New Message Button */}
                    <NewMessageButton onClick={() => setShowNewMessage(true)} />

                    {/* New Message Modal */}
                    {showNewMessage && (
                        <div
                            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowNewMessage(false)}
                        >
                            <div
                                className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-bold text-white mb-4">
                                    New Message
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    Search for a user to start a conversation
                                </p>
                                <button
                                    onClick={() => setShowNewMessage(false)}
                                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
