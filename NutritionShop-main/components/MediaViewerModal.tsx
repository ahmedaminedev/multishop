
import React, { useEffect } from 'react';
import { XMarkIcon } from './IconComponents';

interface MediaViewerModalProps {
    src: string;
    type: 'image' | 'video' | 'text';
    onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ src, type, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (type === 'text') return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
                aria-label="Fermer"
            >
                <XMarkIcon className="w-8 h-8" />
            </button>
            
            <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                {type === 'video' ? (
                    <video 
                        src={src} 
                        controls 
                        autoPlay 
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl outline-none"
                    />
                ) : (
                    <img 
                        src={src} 
                        alt="Aperçu plein écran" 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                )}
            </div>
        </div>
    );
};
