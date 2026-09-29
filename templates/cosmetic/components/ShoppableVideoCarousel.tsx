
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppableVideo } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon, XMarkIcon } from './IconComponents';

// Icone Play (Triangle simple)
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75-.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
    </svg>
);

interface ShoppableVideoCarouselProps {
    videos: ShoppableVideo[];
    isPreview?: boolean;
}

export const ShoppableVideoCarousel: React.FC<ShoppableVideoCarouselProps> = ({ videos, isPreview = false }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [selectedVideo, setSelectedVideo] = useState<ShoppableVideo | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.7;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleVideoClick = (video: ShoppableVideo) => {
        if (isPreview) return;
        setSelectedVideo(video);
        setIsPlaying(true);
    };

    const handleCloseModal = () => {
        setSelectedVideo(null);
        setIsPlaying(false);
    };

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    // Auto-play effect when modal opens
    useEffect(() => {
        if (selectedVideo && videoRef.current) {
            videoRef.current.currentTime = 0;
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((error) => {
                        console.log("Autoplay blocked, waiting for interaction:", error);
                        setIsPlaying(false);
                    });
            }
        }
    }, [selectedVideo]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleCloseModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!videos || videos.length === 0) return null;

    return (
        <section className={`my-16 ${!isPreview ? 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8' : ''}`}>
            {!isPreview && (
                <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        GIFTS ON EVERYONE’S LIST
                    </h2>
                </div>
            )}

            <div className="relative group">
                <div 
                    ref={scrollRef} 
                    className="flex space-x-4 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {videos.map((video) => (
                        <div 
                            key={video.id} 
                            onClick={() => handleVideoClick(video)}
                            className={`flex-shrink-0 w-48 sm:w-60 md:w-72 aspect-[9/16] relative rounded-2xl overflow-hidden cursor-pointer snap-center group/card transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-xl ${isPreview ? 'pointer-events-none' : ''}`}
                        >
                            {/* Background Image/Thumbnail */}
                            <img 
                                src={video.thumbnailUrl} 
                                alt={video.description} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                            />
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>

                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover/card:scale-110 transition-transform duration-300">
                                    <PlayIcon className="w-6 h-6 text-white ml-1" />
                                </div>
                            </div>

                            {/* Shopping Bag Icon (Top Right) */}
                            <div className="absolute top-4 right-4">
                                <div className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white border border-white/20">
                                    <ShoppingBagIcon className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Content (Bottom) */}
                            <div className="absolute bottom-0 left-0 p-4 w-full text-left">
                                <p className="text-white text-sm font-bold mb-1 truncate drop-shadow-md">
                                    {video.username}
                                </p>
                                <p className="text-white/90 text-xs font-medium line-clamp-2 leading-relaxed drop-shadow-md">
                                    {video.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                {!isPreview && (
                    <>
                        <button onClick={() => scroll('left')} className="absolute top-1/2 left-0 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110 backdrop-blur-sm -ml-4">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                        </button>
                        <button onClick={() => scroll('right')} className="absolute top-1/2 right-0 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110 backdrop-blur-sm -mr-4">
                            <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                        </button>
                    </>
                )}
            </div>

            {/* Enhanced Video Modal using Portal for correct Z-Index layering */}
            {selectedVideo && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
                    
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" 
                        onClick={handleCloseModal}
                    ></div>

                    {/* Main Container */}
                    <div 
                        className="relative w-full max-w-lg h-full max-h-[85vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col z-[10000] ring-1 ring-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button - Inside container for mobile friendliness */}
                        <button 
                            onClick={handleCloseModal} 
                            className="absolute top-4 right-4 z-[10010] p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm border border-white/20 transition-all hover:rotate-90 duration-300"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        {/* Video Element */}
                        <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
                            <video 
                                ref={videoRef}
                                src={selectedVideo.videoUrl} 
                                loop
                                playsInline
                                className="w-full h-full object-contain cursor-pointer"
                                onClick={togglePlay}
                            />
                            
                            {/* Play/Pause Center Indicator */}
                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse border border-white/20">
                                        <PlayIcon className="w-10 h-10 text-white ml-1" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Overlay Info (Bottom) */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-red-500 p-[2px]">
                                    <img src={selectedVideo.thumbnailUrl} className="w-full h-full rounded-full object-cover border-2 border-black" alt={selectedVideo.username} />
                                </div>
                                <h3 className="text-white font-bold text-lg drop-shadow-md">{selectedVideo.username}</h3>
                            </div>
                            
                            <p className="text-white/90 text-sm mb-6 leading-relaxed drop-shadow-md font-medium">
                                {selectedVideo.description}
                            </p>
                            
                            {/* Product CTA Button */}
                            {selectedVideo.productIds && selectedVideo.productIds.length > 0 && (
                                <div className="pointer-events-auto transform translate-y-0 hover:-translate-y-1 transition-transform">
                                    <button className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg">
                                        <ShoppingBagIcon className="w-5 h-5" />
                                        <span>Voir les produits ({selectedVideo.productIds.length})</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};
