import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Link as LinkIcon, Check } from 'lucide-react';

interface ImageUploadInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label = "Image",
  value = "",
  onChange,
  placeholder = "https://...",
  required = false,
  helperText
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP, etc.).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="block text-slate-700 font-semibold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Masquer URL web' : 'Ou saisir URL web'}</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview and Upload Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-2xl p-3.5 transition-all flex flex-col sm:flex-row items-center gap-3.5 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
            : value 
            ? 'border-slate-200 bg-slate-50/60' 
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
        }`}
      >
        {/* Thumbnail Preview */}
        {value ? (
          <div className="relative group shrink-0">
            <img
              src={value}
              alt="Aperçu"
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs bg-white"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
              title="Supprimer l'image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
            <ImageIcon className="w-7 h-7 stroke-[1.5]" />
          </div>
        )}

        {/* Action Controls */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{value ? 'Changer l’image depuis le PC' : 'Importer depuis votre ordinateur (PC)'}</span>
            </button>

            {value && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Image chargée</span>
              </span>
            )}
          </div>

          <p className="text-[10px] text-slate-400">
            Glissez-déposez un fichier image ici, ou cliquez pour parcourir vos fichiers locaux (PNG, JPG, WebP)
          </p>
        </div>
      </div>

      {/* Alternative URL Input */}
      {showUrlInput && (
        <div className="pt-1.5 animate-fadeIn">
          <input
            type="url"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[10px] text-slate-400 mt-0.5">
            Lien web externe direct vers une image
          </p>
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-slate-500 italic mt-0.5">{helperText}</p>
      )}
    </div>
  );
};
