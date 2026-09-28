
import React from 'react';
import { useTheme } from './ThemeContext';
import { SunIcon, MoonIcon } from './IconComponents';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="group relative inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-neon transition-colors"
            title={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
        >
            <div className="relative w-6 h-6 overflow-hidden">
                <div className={`absolute inset-0 transition-transform duration-500 ${theme === 'dark' ? 'translate-y-0' : 'translate-y-full'}`}>
                    <MoonIcon className="w-6 h-6 text-brand-neon" />
                </div>
                <div className={`absolute inset-0 transition-transform duration-500 ${theme === 'light' ? 'translate-y-0' : '-translate-y-full'}`}>
                    <SunIcon className="w-6 h-6 text-orange-500" />
                </div>
            </div>
        </button>
    );
};
