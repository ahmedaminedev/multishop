import React from 'react';
import { PencilIcon } from '../IconComponents';

interface EditableAdWrapperProps {
    children: React.ReactNode;
    slotName: string;
    onEdit: () => void;
    className?: string;
}

export const EditableAdWrapper: React.FC<EditableAdWrapperProps> = ({ children, slotName, onEdit, className }) => {
    return (
        <div className={`relative group border-2 border-transparent hover:border-brand-neon hover:border-dashed rounded-none transition-all duration-300 pointer-events-auto ${className}`}>
            <div className="absolute inset-0 bg-brand-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
            {children}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="bg-black text-brand-neon font-black py-2 px-4 rounded-none slant flex items-center gap-2 shadow-lg hover:bg-brand-neon hover:text-black transform hover:scale-105 transition-all border border-brand-neon"
                    aria-label={`Modifier ${slotName}`}
                >
                    <span className="slant-reverse flex items-center gap-2">
                        <PencilIcon className="w-4 h-4" />
                        <span>CONFIGURER</span>
                    </span>
                </button>
            </div>
        </div>
    );
};
