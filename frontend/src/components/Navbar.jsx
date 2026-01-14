import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { FaCloudUploadAlt, FaSearch, FaBars, FaTimes, FaHome, FaHistory, FaTv } from 'react-icons/fa';
import Tooltip from './Tooltip';
import NotificationBell from './NotificationBell';
import api from '../api/axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);

    // Debounce Search Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) { // Only search if > 1 char
                try {
                    const response = await api.get(`/videos?search=${encodeURIComponent(searchQuery)}&limit=5`);
                    if (response.data.success) {
                        setSearchSuggestions(response.data.data.slice(0, 5));
                    }
                } catch (err) {
                    console.error("Instant search error:", err);
                }
            } else {
                setSearchSuggestions([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false); // Close mobile search after submit
        }
    };

    return (
        <nav className="bg-[#1E293B]/80 backdrop-blur-md border-b border-[#334155] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex justify-between items-center h-10">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
                            B
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            BluT
                        </span>
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
                        <form onSubmit={handleSearch} className="w-full relative z-10">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search videos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-[#334155] text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500"
                                />
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </form>

                        {/* Instant Search Dropdown */}
                        {searchSuggestions.length > 0 && searchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                {searchSuggestions.map(video => (
                                    <Link
                                        key={video._id}
                                        to={`/watch/${video._id}`}
                                        className="flex items-center gap-3 p-3 hover:bg-[#334155] transition-colors group/item"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSearchSuggestions([]);
                                        }}
                                    >
                                        <img src={video.thumbnailUrl} alt="" className="w-12 h-8 object-cover rounded bg-gray-700" />
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="text-white text-sm font-medium truncate group-hover/item:text-blue-400 transition-colors">{video.title}</h4>
                                            <p className="text-gray-400 text-xs truncate">{video.user?.username}</p>
                                        </div>
                                    </Link>
                                ))}
                                <button
                                    onClick={(e) => handleSearch(e)}
                                    className="w-full text-center py-2 text-xs text-blue-400 hover:text-blue-300 bg-[#0F172A]/50 border-t border-[#334155]"
                                >
                                    View all results for "{searchQuery}"
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Auth & Mobile Toggles */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="md:hidden text-gray-300 hover:text-white p-2"
                        >
                            <FaSearch size={20} />
                        </button>

                        {/* Auth Links (Desktop) */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <>
                                    <Link to={`/u/${user.username}`} className="flex flex-col items-end hover:text-blue-400 transition-colors cursor-pointer">
                                        <span className="text-sm font-medium text-white">{user.username}</span>
                                    </Link>
                                    {/* New Links */}
                                    <Tooltip text="Creator Dashboard" position="bottom">
                                        <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-1" aria-label="Dashboard">
                                            <span className="text-sm font-medium">Dashboard</span>
                                        </Link>
                                    </Tooltip>

                                    <Tooltip text="Watch History" position="bottom">
                                        <Link to="/history" className="text-gray-300 hover:text-white transition-colors p-1" aria-label="History">
                                            <span className="text-sm font-medium">History</span>
                                        </Link>
                                    </Tooltip>
                                    {/* End New Links */}

                                    <Tooltip text="Upload a new video" position="bottom">
                                        <Link to="/upload" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20">
                                            <FaCloudUploadAlt /> <span className="hidden sm:inline">Upload</span>
                                        </Link>
                                    </Tooltip>
                                    <button
                                        onClick={logout}
                                        className="text-sm bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg transition-colors border border-gray-600"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Login</Link>
                                    <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm font-bold">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger Menu Logic needed here - simplified for snippet */}
                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="md:hidden text-gray-300 hover:text-white p-2"
                        >
                            <FaBars size={24} />
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar (Expandable) */}
                {isSearchOpen && (
                    <form onSubmit={handleSearch} className="md:hidden mt-3 pb-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0F172A] border border-[#334155] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                                autoFocus
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </form>
                )}

                {/* Mobile Menu Overlay & Drawer - Portalled to body to avoid clipping */}
                {isMenuOpen && createPortal(
                    <div className="fixed inset-0 z-[100] md:hidden flex justify-end">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                            onClick={() => setIsMenuOpen(false)}
                        ></div>

                        {/* Drawer */}
                        <div className="relative w-[300px] h-full bg-[#0F172A] border-l border-[#1E293B] shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-white">Menu</h2>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:text-white bg-[#1E293B] rounded-full transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-6">
                                {user ? (
                                    <>
                                        {/* User Profile Summary */}
                                        <div className="flex items-center gap-4 p-4 bg-[#1E293B]/50 rounded-2xl border border-[#334155]">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-white font-bold truncate">{user.username}</p>
                                                <p className="text-gray-400 text-xs truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-[#1E293B] px-4 py-3 rounded-xl transition-all">
                                                <FaHome className="text-blue-500" /> Home
                                            </Link>
                                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-[#1E293B] px-4 py-3 rounded-xl transition-all">
                                                <FaTv className="text-purple-500" /> Dashboard
                                            </Link>
                                            <Link to={`/u/${user.username}`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-[#1E293B] px-4 py-3 rounded-xl transition-all">
                                                <div className="w-4 h-4 rounded-full border border-current"></div> My Channel
                                            </Link>
                                            <Link to="/history" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-[#1E293B] px-4 py-3 rounded-xl transition-all">
                                                <FaHistory className="text-orange-500" /> Watch History
                                            </Link>
                                        </div>

                                        <div className="h-px bg-[#334155] my-2"></div>

                                        <div className="space-y-4">
                                            <div className="px-4">
                                                <NotificationBell />
                                            </div>

                                            <Link to="/upload" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white w-full py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                                                <FaCloudUploadAlt size={20} /> Upload Video
                                            </Link>

                                            <button
                                                onClick={() => { logout(); setIsMenuOpen(false); }}
                                                className="w-full py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-medium transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-4 mt-4">
                                        <div className="text-center mb-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-3xl shadow-xl mx-auto mb-4">
                                                B
                                            </div>
                                            <h3 className="text-white font-bold text-xl">Welcome to BluT</h3>
                                            <p className="text-gray-400 text-sm mt-2">Join the next generation viewing experience.</p>
                                        </div>
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-3 text-center text-gray-300 hover:text-white bg-[#1E293B] hover:bg-[#334155] rounded-xl font-medium transition-colors">
                                            Login
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full py-3 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-colors">
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </nav>
    );
};

export default Navbar;
