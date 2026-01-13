import React from 'react';

export const VideoCardSkeleton = () => {
    return (
        <div className="bg-[#1E293B] rounded-xl overflow-hidden border border-[#334155] animate-pulse">
            <div className="aspect-video bg-[#334155]"></div>
            <div className="p-4 space-y-3">
                <div className="h-4 bg-[#334155] rounded w-3/4"></div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#334155]"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-3 bg-[#334155] rounded w-1/2"></div>
                        <div className="h-3 bg-[#334155] rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const VideoPlayerSkeleton = () => {
    return (
        <div className="animate-pulse">
            <div className="w-full aspect-video bg-[#1E293B] rounded-xl mb-4"></div>
            <div className="h-8 bg-[#1E293B] rounded w-3/4 mb-4"></div>
            <div className="flex justify-between items-center pb-4 border-b border-[#1E293B] mb-4">
                <div className="h-4 bg-[#1E293B] rounded w-1/3"></div>
                <div className="flex gap-2">
                    <div className="w-20 h-8 bg-[#1E293B] rounded-full"></div>
                    <div className="w-20 h-8 bg-[#1E293B] rounded-full"></div>
                </div>
            </div>
            <div className="p-4 bg-[#1E293B] rounded-xl">
                <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#334155]"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-[#334155] rounded w-32"></div>
                        <div className="h-3 bg-[#334155] rounded w-24"></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-[#334155] rounded w-full"></div>
                    <div className="h-3 bg-[#334155] rounded w-full"></div>
                    <div className="h-3 bg-[#334155] rounded w-2/3"></div>
                </div>
            </div>
        </div>
    );
};

export const CommentSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse mt-6">
            <div className="h-6 bg-[#1E293B] rounded w-40 mb-6"></div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E293B] flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#1E293B] rounded w-32"></div>
                        <div className="h-3 bg-[#1E293B] rounded w-full"></div>
                        <div className="h-3 bg-[#1E293B] rounded w-2/3"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
