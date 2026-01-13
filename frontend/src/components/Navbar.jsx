import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCloudUploadAlt, FaSearch } from 'react-icons/fa';
import Tooltip from './Tooltip';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
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
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-gray-300 hover:text-white p-2"
                        >
                            <div className="space-y-1.5">
                                <span className={`block w-6 h-0.5 bg-current transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`block w-6 h-0.5 bg-current transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block w-6 h-0.5 bg-current transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar (Expandable) */}
                {isSearchOpen && (
                    <form onSubmit={handleSearch} className="md:hidden mt-3 pb-2">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0F172A] border border-[#334155] text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                                autoFocus
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </form>
                )}

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-[#334155] flex flex-col gap-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-2 py-2 bg-[#0F172A] rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{user.username}</p>
                                        <p className="text-gray-400 text-xs">{user.email}</p>
                                    </div>
                                </div>
                                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white py-2">Dashboard</Link>
                                <Link to={`/u/${user.username}`} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white py-2">My Channel</Link>
                                <Link to="/history" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white py-2">Watch History</Link>
                                <NotificationBell />
                                <Tooltip text="Upload Video">
                                    <Link to="/upload" className="text-white hover:text-blue-400 transition-colors">
                                        <FaCloudUploadAlt className="text-xl" />
                                    </Link>
                                </Tooltip>    <button onClick={logout} className="text-left text-red-400 hover:text-red-300 py-2">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white py-2">Login</Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="bg-blue-600 text-center text-white py-2 rounded-lg font-bold">Get Started</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
