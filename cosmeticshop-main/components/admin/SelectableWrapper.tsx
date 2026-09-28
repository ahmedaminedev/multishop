
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
            className={`relative transition-all duration-300 group cursor-pointer rounded-xl ${
                isActive 
                ? 'ring-4 ring-rose-500 ring-offset-4 ring-offset-[#FAFAFA] dark:ring-offset-gray-950' 
                : 'hover:ring-2 hover:ring-rose-300 hover:ring-offset-2 hover:ring-offset-[#FAFAFA] dark:hover:ring-offset-gray-950'
            }`}
        >
            {/* Label Badge */}
            <div className={`absolute -top-3 left-4 z-20 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all ${
                isActive 
                ? 'bg-rose-600 text-white translate-y-0 opacity-100' 
                : 'bg-white text-gray-600 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'
            }`}>
                <div className="flex items-center gap-2">
                    <PencilIcon className="w-3 h-3" />
                    {label}
                </div>
            </div>

            {/* Content Mask (prevents internal clicks) */}
            <div className="absolute inset-0 z-10 bg-transparent"></div>

            {/* Actual Content */}
            <div className="pointer-events-none">
                {children}
            </div>
        </div>
    );
};
