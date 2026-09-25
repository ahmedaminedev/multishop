
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
        <div className={`relative group border-2 border-transparent hover:border-red-500 hover:border-dashed rounded-lg transition-all duration-300 pointer-events-auto ${className}`}>
            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none z-10"></div>
            {children}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all"
                    aria-label={`Modifier ${slotName}`}
                >
                    <PencilIcon className="w-4 h-4" />
                    <span>Modifier</span>
                </button>
            </div>
        </div>
    );
};
