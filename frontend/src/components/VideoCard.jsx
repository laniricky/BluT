import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaLink } from 'react-icons/fa';

const VideoCard = ({ video }) => {
    return (
        <div className='flex flex-col gap-2'>
            <Link to={`/watch/${video._id}`} className='relative aspect-video rounded-xl overflow-hidden hover:rounded-none transition-all duration-300'>
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-200'
                />
                <div className='absolute bottom-1 right-1 bg-black/80 px-1 text-xs text-white rounded'>
                    {video.duration || '12:00'}
                </div>
                {video.visibility && video.visibility !== 'public' && (
                    <div className='absolute top-2 left-2 flex items-center gap-1 bg-black/80 px-2 py-1 text-xs text-white rounded'>
                        {video.visibility === 'private' ? <FaLock /> : <FaLink />}
                        <span>{video.visibility === 'private' ? 'Private' : 'Unlisted'}</span>
                    </div>
                )}
                {/* Progress Bar for Resume Watching */}
                {video.progress > 0 && video.durationSec > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                        <div
                            className="h-full bg-red-600"
                            style={{
                                width: `${Math.min((video.progress / video.durationSec) * 100, 100)}%`
                            }}
                        ></div>
                    </div>
                )}
            </Link>
            <div className='flex gap-2'>
                <Link to={`/u/${video.user?.username}`} className='flex-shrink-0'>
                    <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden">
                        {/* Placeholder for user avatar if not present in popular video object for now */}
                        <img src={video.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.user?.username || 'user'}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                </Link>
                <div className='flex flex-col'>
                    <Link to={`/watch/${video._id}`}>
                        <h3 className='font-bold text-white text-sm line-clamp-2 leading-tight'>
                            {video.title}
                        </h3>
                    </Link>
                    <Link to={`/u/${video.user?.username}`} className='text-zinc-400 text-xs mt-1 hover:text-white'>
                        {video.user?.username || 'Unknown User'}
                    </Link>
                    <div className='text-zinc-400 text-xs'>
                        {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                    {/* Tags Display */}
                    {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {video.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-[10px] bg-slate-700/50 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
