
import React, { useState, useRef, useEffect } from 'react';
import type { DestockageAd } from '../types';

interface DestockageCarouselProps {
    ads: DestockageAd[];
}

export const DestockageCarousel: React.FC<DestockageCarouselProps> = ({ ads }) => {
    // We only take the first ad since it's a feature video block
    const ad = ads && ads.length > 0 ? ads[0] : null;
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState("00:00");
    const [duration, setDuration] = useState("00:00");

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => {
            const current = video.currentTime;
            const dur = video.duration;
            
            if (dur > 0) {
                setProgress((current / dur) * 100);
            }
            
            setCurrentTime(formatTime(current));
            setDuration(formatTime(dur));
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        
        // Auto play attempting
        video.play().catch(e => console.log("Autoplay blocked, user interaction needed"));

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [ad]);

    const formatTime = (timeInSeconds: number) => {
        if(isNaN(timeInSeconds)) return "00:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        videoRef.current.currentTime = percentage * videoRef.current.duration;
    };

    if (!ad) return null;

    return (
        <section className="my-20 relative w-full h-[600px] md:h-[700px] overflow-hidden group mx-auto">
            {/* Video Background */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                src={ad.videoUrl}
                poster={ad.coverImage}
                loop
                muted={false} 
                playsInline
            />

            {/* Dark Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

            {/* Center Play Button (Visible on Pause or Hover) */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <button 
                    onClick={togglePlay}
                    className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 text-white hover:scale-110 transition-transform duration-300 pointer-events-auto"
                >
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-8 h-8" viewBox="0 0 16 16">
                            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-8 h-8 ml-1" viewBox="0 0 16 16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                        </svg>
                    )}
                </button>
            </div>

            {/* Bottom Controls & Info */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 pointer-events-none">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 pointer-events-auto">
                    
                    {/* Text Content */}
                    <div className="max-w-xl text-left animate-fade-in-up">
                        <h2 className="font-serif text-4xl md:text-6xl text-white font-bold mb-4 tracking-tight drop-shadow-lg">
                            {ad.title}
                        </h2>
                        <p className="font-sans text-lg md:text-xl text-white/90 font-light leading-relaxed mb-8">
                            {ad.description}
                        </p>
                        <button className="bg-white text-black px-10 py-4 uppercase text-xs font-bold tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-colors duration-300">
                            {ad.buttonText}
                        </button>
                    </div>

                    {/* Minimalist Player Controls */}
                    <div className="w-full md:w-1/3 mb-2">
                        <div className="flex justify-between text-xs font-bold text-white mb-2 tracking-widest">
                            <span>{currentTime}</span>
                            <span>{duration}</span>
                        </div>
                        {/* Custom Progress Bar */}
                        <div 
                            className="w-full h-1 bg-white/30 cursor-pointer group/progress relative"
                            onClick={handleProgressClick}
                        >
                            <div 
                                className="h-full bg-white relative transition-all duration-100 ease-linear" 
                                style={{ width: `${progress}%` }}
                            >
                                {/* Scrubber dot */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-sm transition-opacity"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
