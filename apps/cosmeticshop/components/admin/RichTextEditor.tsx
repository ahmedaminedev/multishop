
import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    label?: string;
    className?: string;
}

// Exact Brand Palette
const BRAND_COLORS = [
    '#111827', // Gray 900 (Default Title)
    '#e11d48', // Rose 600 (Primary)
    '#f43f5e', // Rose 500
    '#d4af37', // Gold (Luxury)
    '#4b5563', // Gray 600 (Subtitle)
    '#ffffff', // White
    '#000000', // Black
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label, className }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        handleInput();
        if (editorRef.current) editorRef.current.focus();
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        execCmd('foreColor', e.target.value);
    };

    return (
        <div className={`w-full ${className} mb-4`}>
            {label && <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</label>}
            
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm focus-within:ring-2 focus-within:ring-rose-500 transition-all">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button type="button" onClick={() => execCmd('bold')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-xs w-7 h-7 flex items-center justify-center text-gray-700 dark:text-gray-300">B</button>
                    <button type="button" onClick={() => execCmd('italic')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 italic text-xs w-7 h-7 flex items-center justify-center font-serif text-gray-700 dark:text-gray-300">I</button>
                    <button type="button" onClick={() => execCmd('underline')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 underline text-xs w-7 h-7 flex items-center justify-center text-gray-700 dark:text-gray-300">U</button>
                    
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                    
                    {/* Brand Colors Presets */}
                    <div className="flex items-center gap-1.5">
                        {BRAND_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => execCmd('foreColor', color)}
                                className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>

                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

                    {/* Custom Color Picker */}
                    <div className="relative group cursor-pointer p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => colorInputRef.current?.click()} title="Couleur personnalisée">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 border border-gray-300"></div>
                        <input 
                            ref={colorInputRef}
                            type="color" 
                            className="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0"
                            onChange={handleColorChange}
                        />
                    </div>
                </div>

                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onBlur={handleInput}
                    className="p-3 min-h-[40px] max-h-[150px] overflow-y-auto outline-none text-sm text-gray-800 dark:text-white font-sans"
                    style={{ whiteSpace: 'pre-wrap' }}
                />
            </div>
        </div>
    );
};
