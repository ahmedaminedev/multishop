import React from 'react';
import { PencilIcon } from '../IconComponents';

interface SelectableWrapperProps {
    children: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    label: string;
}

export const SelectableWrapper: React.FC<SelectableWrapperProps> = ({ children, isActive, onClick, label }) => {
    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`relative transition-all duration-300 group cursor-pointer rounded-none ${
                isActive 
                ? 'ring-4 ring-brand-neon ring-offset-4 ring-offset-white dark:ring-offset-[#050505]' 
                : 'hover:ring-2 hover:ring-brand-neon/50 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-[#050505]'
            }`}
        >
            <div className={`absolute -top-3 left-4 z-20 px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all slant ${
                isActive 
                ? 'bg-brand-neon text-black translate-y-0 opacity-100 shadow-lg' 
                : 'bg-black text-white translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'
            }`}>
                <div className="slant-reverse flex items-center gap-2">
                    <PencilIcon className="w-3 h-3" />
                    {label}
                </div>
            </div>

            <div className="absolute inset-0 z-10 bg-transparent"></div>

            <div className="pointer-events-none">
                {children}
            </div>
        </div>
    );
};
