
import React, { useState } from 'react';
import { CloudArrowUpIcon, TrashIcon, PlusIcon } from './IconComponents';

type ImageInputProps = {
    label: string;
    required?: boolean;
} & (
    | { images: string[]; value?: never; onChange: (images: string[]) => void }
    | { value: string; images?: never; onChange: (image: string) => void }
);

export const ImageInput: React.FC<ImageInputProps> = (props) => {
    const { label, required = false } = props;
    const isSingle = 'value' in props;
    const currentImages = isSingle ? (props.value ? [props.value] : []) : (props.images || []);

    const [mode, setMode] = useState<'url' | 'file'>('file');
    const [dragActive, setDragActive] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [isCompressing, setIsCompressing] = useState(false);

    // Compress Image Logic optimized for MongoDB storage
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1000; 
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (scaleSize < 1) ? MAX_WIDTH : img.width;
                    const height = (scaleSize < 1) ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const emitChange = (newImagesList: string[]) => {
        if (isSingle) {
            const val = newImagesList.length > 0 ? newImagesList[newImagesList.length - 1] : '';
            const singleOnChange = props.onChange as (val: string) => void;
            singleOnChange(val);
        } else {
            const multiOnChange = props.onChange as (vals: string[]) => void;
            multiOnChange(newImagesList);
        }
    };

    const processFiles = async (files: FileList | null) => {
        if (!files) return;
        setIsCompressing(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                if (file.type.startsWith('image/')) {
                    const compressed = await compressImage(file);
                    newImages.push(compressed);
                }
            } catch (e) {
                console.error("Error processing image", e);
            }
        }
        
        if (newImages.length > 0) {
            if (isSingle) {
                emitChange(newImages);
            } else {
                emitChange([...currentImages, ...newImages]);
            }
        }
        setIsCompressing(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
    };

    const handleAddUrl = () => {
        if (urlInput.trim()) {
            if (isSingle) {
                emitChange([urlInput.trim()]);
            } else {
                emitChange([...currentImages, urlInput.trim()]);
            }
            setUrlInput('');
        }
    };

    const removeImage = (index: number) => {
        const newImages = currentImages.filter((_, i) => i !== index);
        emitChange(newImages);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {label} {required && <span className="text-black dark:text-brand-neon">*</span>}
                </label>
                <div className="flex space-x-1 bg-gray-100 dark:bg-[#1a1a1a] p-1 border border-gray-200 dark:border-gray-700 rounded-sm">
                    <button type="button" onClick={() => setMode('file')} className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${mode === 'file' ? 'bg-black dark:bg-brand-neon text-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>PC</button>
                    <button type="button" onClick={() => setMode('url')} className={`px-3 py-1 text-[10px] font-bold uppercase transition-colors ${mode === 'url' ? 'bg-black dark:bg-brand-neon text-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>URL</button>
                </div>
            </div>

            {/* Input Zone */}
            {mode === 'file' ? (
                <div 
                    className={`relative border-2 border-dashed rounded-sm p-6 text-center transition-all ${dragActive ? 'border-black dark:border-brand-neon bg-gray-50 dark:bg-brand-neon/10' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] hover:border-gray-400 dark:hover:border-gray-500'}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                    <input type="file" multiple={!isSingle} accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-gray-400">
                        {isCompressing ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black dark:border-brand-neon"></div> : <CloudArrowUpIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />}
                        <p className="text-xs font-mono"><span className="font-bold text-black dark:text-brand-neon">Cliquez</span> ou glissez</p>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." className="flex-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-sm px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-black dark:focus:border-brand-neon outline-none" />
                    <button type="button" onClick={handleAddUrl} className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-white px-3 py-2 hover:bg-black hover:text-white dark:hover:text-brand-neon dark:hover:border-brand-neon transition-colors"><PlusIcon className="w-4 h-4"/></button>
                </div>
            )}

            {/* Gallery Grid */}
            {currentImages.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                    {currentImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button type="button" onClick={() => removeImage(idx)} className="p-2 text-white hover:text-red-400 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                            {idx === 0 && !isSingle && <span className="absolute top-0 left-0 bg-black dark:bg-brand-neon text-white dark:text-black text-[9px] font-black px-1 uppercase tracking-wider">Main</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
