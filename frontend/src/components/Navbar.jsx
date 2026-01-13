import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCloudUploadAlt, FaSearch } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="bg-[#1E293B]/80 backdrop-blur-md border-b border-[#334155] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
                        B
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        BluT
                    </span>
                </Link>

                {/* Search Bar */}
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

                {/* Right Side: Auth & Upload */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to={`/u/${user.username}`} className="hidden lg:flex flex-col items-end hover:text-blue-400 transition-colors cursor-pointer">
                                <span className="text-sm font-medium text-white">{user.username}</span>
                                <span className="text-xs text-gray-400">{user.email}</span>
                            </Link>

                            {/* New Links */}
                            <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors" title="Dashboard">
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                            <Link to="/history" className="text-gray-300 hover:text-white transition-colors" title="History">
                                <span className="text-sm font-medium">History</span>
                            </Link>
                            {/* End New Links */}

                            <Link to="/upload" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20">
                                <FaCloudUploadAlt /> <span className="hidden sm:inline">Upload</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="text-sm bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg transition-colors border border-gray-600"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm font-bold">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
