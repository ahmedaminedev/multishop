
import React from 'react';
import { useTheme } from './ThemeContext';
import { SunIcon, MoonIcon } from './IconComponents';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex items-center h-8 w-16 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <span className="sr-only">Toggle theme</span>
            
            {/* Icons */}
            <span className="absolute inset-0 flex items-center justify-between px-2">
                <SunIcon className={`w-5 h-5 transition-colors ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
                <MoonIcon className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
            </span>
            
            {/* Slider */}
            <span
                className={`absolute left-1 top-1 h-6 w-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ease-in-out ${
                    theme === 'dark' ? 'translate-x-8' : 'translate-x-0'
                }`}
            />
        </button>
    );
};
