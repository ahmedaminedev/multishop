import React from 'react';

export const Logo: React.FC = () => (
    <div className="flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 24 24" className="text-red-600" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C11.45 2 11 2.45 11 3V4.09C6.89 4.55 4 7.92 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.92 17.11 4.55 13 4.09V3C13 2.45 12.55 2 12 2ZM12.5 14H11V18L9.5 15.5L8.09 16.91L11.09 19.91C11.28 20.1 11.53 20.21 11.79 20.21C11.82 20.21 11.84 20.21 11.86 20.21C12.15 20.18 12.4 20.01 12.55 19.77L15.25 15.77L13.96 14.86L12.5 17.03V14ZM12 6C13.66 6 15 7.34 15 9C15 10.3 14.18 11.35 13 11.82V13H11V11.82C9.82 11.35 9 10.3 9 9C9 7.34 10.34 6 12 6Z"/>
        </svg>
        <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            Electro Shop
        </span>
    </div>
);
