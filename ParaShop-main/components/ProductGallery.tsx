
import React, { useState, useRef } from 'react';
import { PhotoIcon } from './IconComponents';

interface ProductGalleryProps {
    images: string[];
    productName: string;
    isHeroMode?: boolean;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName, isHeroMode = false }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showZoom, setShowZoom] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const imgWrapperRef = useRef<HTMLDivElement>(null);

    const validImages = Array.isArray(images) ? images.filter(img => img && img.trim() !== '') : [];
    const activeImage = validImages[selectedImageIndex] || validImages[0];
    const hasMultipleImages = validImages.length > 1;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imgWrapperRef.current) return;
        const { left, top, width, height } = imgWrapperRef.current.getBoundingClientRect();
        let x = ((e.clientX - left) / width) * 100;
        let y = ((e.clientY - top) / height) * 100;
        setCursorPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* CADRE FIXE - Empêche les décalages de mise en page */}
            <div className="w-full">
                <div 
                    ref={imgWrapperRef}
                    className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white cursor-crosshair group shadow-sm flex items-center justify-center"
                    onMouseEnter={() => setShowZoom(true)}
                    onMouseLeave={() => setShowZoom(false)}
                    onMouseMove={handleMouseMove}
                >
                    {activeImage ? (
                        <>
                            <img 
                                src={activeImage} 
                                alt={productName} 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {showZoom && (
                                <div 
                                    className="absolute inset-0 z-20 pointer-events-none"
                                    style={{
                                        backgroundImage: `url(${activeImage})`,
                                        backgroundPosition: `${cursorPos.x}% ${cursorPos.y}%`,
                                        backgroundSize: '250%',
                                        backgroundRepeat: 'no-repeat',
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 text-slate-200">
                            <PhotoIcon className="w-20 h-20 opacity-50" />
                        </div>
                    )}
                </div>
            </div>

            {hasMultipleImages && (
                <div className="flex flex-row gap-3 overflow-x-auto no-scrollbar py-2 justify-center w-full px-4">
                    {validImages.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative w-16 h-16 flex-shrink-0 border-2 rounded-2xl overflow-hidden transition-all ${selectedImageIndex === idx ? 'border-brand-primary' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                        >
                            <img src={img} alt="Miniature" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
