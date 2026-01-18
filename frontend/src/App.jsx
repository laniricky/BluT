import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MessageProvider } from './context/MessageContext';
import { FaSpinner } from 'react-icons/fa';

// Lazy Load Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const WatchPage = lazy(() => import('./pages/WatchPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ShortsPage = lazy(() => import('./pages/ShortsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <MessageProvider>
                    <div className="bg-[#0F172A] min-h-screen text-white">
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/shorts" element={<ShortsPage />} />
                                <Route path="/search" element={<SearchPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/watch/:id" element={<WatchPage />} />
                                <Route path="/u/:username" element={<ProfilePage />} />
                                <Route
                                    path="/upload"
                                    element={
                                        <ProtectedRoute>
                                            <UploadPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/history"
                                    element={
                                        <ProtectedRoute>
                                            <HistoryPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/messages"
                                    element={
                                        <ProtectedRoute>
                                            <MessagesPage />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </Suspense>
                    </div>
                </MessageProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
