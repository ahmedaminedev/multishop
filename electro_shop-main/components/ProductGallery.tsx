
import React, { useState, useRef } from 'react';
import { PhotoIcon } from './IconComponents';

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showZoom, setShowZoom] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const imgWrapperRef = useRef<HTMLDivElement>(null);

    // Filter valid images to avoid empty strings
    const validImages = Array.isArray(images) ? images.filter(img => img && img.trim() !== '') : [];
    const activeImage = validImages[selectedImageIndex] || validImages[0];
    const hasMultipleImages = validImages.length > 1;

    // Handle Mouse Move for Internal Zoom
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imgWrapperRef.current) return;
        const { left, top, width, height } = imgWrapperRef.current.getBoundingClientRect();
        
        // Calculate position in percentage (0 to 100)
        let x = ((e.clientX - left) / width) * 100;
        let y = ((e.clientY - top) / height) * 100;

        // Clamp values to prevent edge glitches
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        setCursorPos({ x, y });
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Main Image Area - Fixed Size Frame */}
            <div className="w-full">
                <div 
                    ref={imgWrapperRef}
                    className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white cursor-crosshair group shadow-sm flex items-center justify-center"
                    onMouseEnter={() => setShowZoom(true)}
                    onMouseLeave={() => setShowZoom(false)}
                    onMouseMove={handleMouseMove}
                >
                    {/* 
                        w-full h-full: Force image to take full dimensions of the container.
                        absolute inset-0: Ensures it fits the container exactly.
                    */}
                    {activeImage ? (
                        <>
                            <img 
                                src={activeImage} 
                                alt={productName} 
                                className="absolute inset-0 w-full h-full"
                            />
                            
                            {/* Internal Zoom Lens Effect */}
                            {showZoom && (
                                <div 
                                    className="absolute inset-0 z-20 pointer-events-none"
                                    style={{
                                        backgroundImage: `url(${activeImage})`,
                                        backgroundPosition: `${cursorPos.x}% ${cursorPos.y}%`,
                                        backgroundSize: '200%', // Zoom level
                                        backgroundRepeat: 'no-repeat',
                                        backgroundColor: 'white',
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 transition-colors">
                            <PhotoIcon className="w-32 h-32 opacity-50" />
                            <span className="mt-4 text-sm font-medium uppercase tracking-wider opacity-70">Aperçu indisponible</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnails - Hidden if only 1 image */}
            {hasMultipleImages && (
                <div className="flex flex-row gap-3 overflow-x-auto no-scrollbar py-2 justify-center w-full px-4">
                    {validImages.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 border rounded-md overflow-hidden transition-all bg-white ${selectedImageIndex === idx ? 'border-red-600 opacity-100 ring-2 ring-red-600 ring-opacity-30' : 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100 hover:border-gray-400'}`}
                        >
                            <img src={img} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
