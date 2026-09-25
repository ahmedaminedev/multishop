
import React from 'react';
import { SparklesIcon } from './IconComponents';
import type { VirtualTryOnConfig, VirtualTryOnImage } from '../types';

interface VirtualTryOnSectionProps {
    config?: VirtualTryOnConfig;
}

export const VirtualTryOnSection: React.FC<VirtualTryOnSectionProps> = ({ config }) => {
    const title = config?.title || "Virtual Try-On";
    const description = config?.description || "Essayez rouges à lèvres, fards à joues et plus encore pour découvrir votre nouvelle teinte préférée.";
    const buttonText = config?.buttonText || "Découvrir maintenant";
    const link = config?.link || "#";
    
    // Background Configuration
    const bgType = config?.backgroundType || 'color';
    const bgColor = config?.backgroundColor || '#FFFFFF'; // Default white
    const bgImage = config?.backgroundImage || '';
    const textColor = config?.textColor || '#111827'; // Default gray-900

    // Styles for container - Added quotes around url() to handle complex base64 strings correctly
    const containerStyle: React.CSSProperties = bgType === 'image' && bgImage
        ? { backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: bgColor };

    // Helper to normalize image config (handles legacy string vs new object)
    const normalizeImageConfig = (img?: VirtualTryOnImage | string): VirtualTryOnImage => {
        if (!img) return { url: '', scale: 100, top: 0, rotation: 0 };
        if (typeof img === 'string') return { url: img, scale: 100, top: 0, rotation: 0 };
        return img;
    };

    const leftImg = normalizeImageConfig(config?.imageLeft);
    const rightImg = normalizeImageConfig(config?.imageRight);

    // Default fallbacks for images if URL is empty
    const leftUrl = leftImg.url || "https://images.unsplash.com/photo-1625093742435-09869634721c?q=80&w=600&auto=format&fit=crop";
    const rightUrl = rightImg.url || "https://images.unsplash.com/photo-1591360236480-943049ceab63?q=80&w=600&auto=format&fit=crop";

    return (
        <section 
            className="relative w-full py-16 md:py-24 overflow-hidden my-16 border-t border-gray-100 dark:border-gray-800"
            style={containerStyle}
        >
            {/* Overlay if image background to ensure readability - optional tint */}
            {bgType === 'image' && (
                <div className="absolute inset-0 bg-white/10 dark:bg-black/10 pointer-events-none mix-blend-overlay"></div>
            )}

            {/* Decorative Images (Floating Tubes Effect) */}
            {/* Left Image */}
            <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 md:w-1/4 h-full max-w-[300px] pointer-events-none opacity-90 transition-transform duration-500"
                style={{
                    transform: `translateY(calc(-50% + ${leftImg.top || 0}%))`
                }}
            >
                 <img
                    src={leftUrl}
                    alt="Left Decorative Element"
                    className="w-full h-full object-contain object-left transform transition-transform duration-[10s] hover:scale-105"
                    style={{
                        transform: `scale(${leftImg.scale ? leftImg.scale / 100 : 1}) rotate(${leftImg.rotation || 0}deg)`
                    }}
                />
            </div>
            
            {/* Right Image */}
            <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 md:w-1/4 h-full max-w-[300px] pointer-events-none opacity-90 transition-transform duration-500"
                style={{
                    transform: `translateY(calc(-50% + ${rightImg.top || 0}%))`
                }}
            >
                <img
                    src={rightUrl}
                    alt="Right Decorative Element"
                    className="w-full h-full object-contain object-right transform transition-transform duration-[10s] hover:scale-105"
                    style={{
                        transform: `scale(${rightImg.scale ? rightImg.scale / 100 : 1}) rotate(${rightImg.rotation || 0}deg)`
                    }}
                />
            </div>

            {/* Centered Content */}
            <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
                <h2 
                    className="text-4xl md:text-6xl font-serif font-bold mb-6 uppercase tracking-widest drop-shadow-sm transition-colors duration-300"
                    style={{ color: textColor }}
                    dangerouslySetInnerHTML={{ __html: title }}
                >
                </h2>
                <div 
                    className="text-lg md:text-xl mb-10 font-light leading-relaxed transition-colors duration-300"
                    style={{ color: textColor, opacity: 0.9 }}
                    dangerouslySetInnerHTML={{ __html: description }}
                >
                </div>
                
                <a 
                    href={link}
                    className="group relative inline-flex items-center gap-3 px-10 py-5 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.6)] hover:-translate-y-1 border border-white/40 backdrop-blur-sm"
                >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-500 to-pink-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Shine Effect Animation */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out skew-x-[-20deg]"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center gap-3 text-white">
                        <span className="font-bold uppercase tracking-[0.2em] text-xs">{buttonText}</span>
                        <SparklesIcon className="w-5 h-5 transition-transform duration-700 group-hover:rotate-180 group-hover:scale-110" />
                    </div>
                </a>
            </div>
        </section>
    );
};
