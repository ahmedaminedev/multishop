
import React, { useState } from 'react';
import { LinkIcon, CloudArrowUpIcon, TrashIcon, PlusIcon } from './IconComponents';

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

    // Compress Image Logic
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200; 
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (scaleSize < 1) ? MAX_WIDTH : img.width;
                    const height = (scaleSize < 1) ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
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
            // Cast props to allow specific onChange signature for single value
            const singleOnChange = props.onChange as (val: string) => void;
            singleOnChange(val);
        } else {
            // Cast props for array signature
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

    const moveImage = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index === 0) return;
        if (direction === 'right' && index === currentImages.length - 1) return;
        
        const newImages = [...currentImages];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
        emitChange(newImages);
    };

    // Drag and Drop
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {required && <span className="text-red-500">*</span>} <span className="text-xs font-normal text-gray-500">({currentImages.length} image{currentImages.length > 1 ? 's' : ''})</span>
                </label>
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                    <button type="button" onClick={() => setMode('file')} className={`px-3 py-1 text-xs rounded-md ${mode === 'file' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}>PC</button>
                    <button type="button" onClick={() => setMode('url')} className={`px-3 py-1 text-xs rounded-md ${mode === 'url' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}>URL</button>
                </div>
            </div>

            {/* Input Zone */}
            {mode === 'file' ? (
                <div 
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                    <input type="file" multiple={!isSingle} accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center space-y-1 text-gray-500">
                        {isCompressing ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div> : <CloudArrowUpIcon className="w-8 h-8" />}
                        <p className="text-sm"><span className="font-semibold text-red-600">Cliquez</span> ou glissez vos images ici</p>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm" />
                    <button type="button" onClick={handleAddUrl} className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"><PlusIcon className="w-5 h-5"/></button>
                </div>
            )}

            {/* Gallery Grid */}
            {currentImages.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                    {currentImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-white">
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                            {idx === 0 && !isSingle && <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">Principale</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
