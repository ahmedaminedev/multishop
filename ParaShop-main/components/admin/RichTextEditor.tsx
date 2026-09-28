
import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    label?: string;
    className?: string;
}

// Palette PharmaNature + Accents
const BRAND_COLORS = [
    '#1e293b', // Slate 800 (Titre par défaut)
    '#008b5e', // Vert PharmaNature
    '#f43f5e', // Rose Promotion
    '#f59e0b', // Ambre Alerte
    '#64748b', // Slate 500 (Sous-titre)
    '#ffffff', // Blanc
    '#000000', // Noir
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
        <div className={`w-full ${className} mb-6`}>
            {label && <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{label}</label>}
            
            <div className="rounded-3xl overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm bg-white dark:bg-brand-dark transition-all duration-300">
                {/* Toolbar Style "Capture" */}
                <div className="flex flex-wrap items-center gap-2 p-3 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => execCmd('bold')} className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-white/10 font-bold text-xs flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">B</button>
                        <button type="button" onClick={() => execCmd('italic')} className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-white/10 italic text-xs flex items-center justify-center font-serif text-slate-600 dark:text-slate-300 transition-colors">I</button>
                        <button type="button" onClick={() => execCmd('underline')} className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-white/10 underline text-xs flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">U</button>
                    </div>
                    
                    <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>
                    
                    {/* Cercles de couleurs */}
                    <div className="flex items-center gap-2">
                        {BRAND_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => execCmd('foreColor', color)}
                                className="w-6 h-6 rounded-full border border-slate-200 dark:border-white/10 hover:scale-110 transition-transform shadow-sm"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>

                    <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

                    {/* Gradient Color Picker (comme sur l'image) */}
                    <div 
                        className="relative w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 cursor-pointer overflow-hidden group shadow-sm transition-transform hover:scale-110" 
                        onClick={() => colorInputRef.current?.click()}
                        title="Couleur personnalisée"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#008b5e,#84cc16,#f43f5e,#f59e0b)] opacity-100"></div>
                        <input 
                            ref={colorInputRef}
                            type="color" 
                            className="absolute opacity-0 w-full h-full cursor-pointer"
                            onChange={handleColorChange}
                        />
                    </div>
                </div>

                {/* Zone d'édition qui change de couleur selon le mode */}
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onBlur={handleInput}
                    className="p-6 min-h-[80px] max-h-[250px] overflow-y-auto outline-none text-base font-bold text-slate-800 dark:text-white bg-white dark:bg-black/40 transition-colors"
                    style={{ whiteSpace: 'pre-wrap' }}
                />
            </div>
        </div>
    );
};
