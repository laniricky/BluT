import React from 'react';
import VideoCard from './VideoCard';

const VideoGrid = ({ videos, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4'>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className='flex flex-col gap-2 animate-pulse'>
                        <div className='bg-slate-700 aspect-video rounded-xl'></div>
                        <div className='flex gap-2'>
                            <div className='w-9 h-9 rounded-full bg-slate-700'></div>
                            <div className='flex flex-col gap-2 flex-1'>
                                <div className='h-4 bg-slate-700 w-3/4 rounded'></div>
                                <div className='h-3 bg-slate-700 w-1/2 rounded'></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className='text-red-500 text-center p-10'>Error loading videos: {error}</div>;
    }

    if (!videos || videos.length === 0) {
        return <div className='text-white text-center p-10'>No videos found.</div>;
    }

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 p-4'>
            {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
            ))}
        </div>
    );
};

export default VideoGrid;
