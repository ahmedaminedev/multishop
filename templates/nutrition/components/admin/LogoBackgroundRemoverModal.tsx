import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XMarkIcon } from '../IconComponents';
import { Wand2, Sliders, Check, RotateCcw, Pipette, Eye, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface LogoBackgroundRemoverModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onSaveTransparentLogo: (transparentDataUrl: string) => Promise<void>;
}

type RemovalMode = 'auto' | 'white' | 'black' | 'custom';

export const LogoBackgroundRemoverModal: React.FC<LogoBackgroundRemoverModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    onSaveTransparentLogo
}) => {
    const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [currentSrc, setCurrentSrc] = useState<string>(imageUrl);
    const [tolerance, setTolerance] = useState<number>(20); // 0 to 80
    const [feather, setFeather] = useState<number>(10); // Edge smoothing 0 to 20
    const [mode, setMode] = useState<RemovalMode>('auto');
    const [customColor, setCustomColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [previewZoom, setPreviewZoom] = useState<number>(1);
    const [isEyeDropperActive, setIsEyeDropperActive] = useState<boolean>(false);
    const [pixelStats, setPixelStats] = useState<{ removedPercent: number; origWidth: number; origHeight: number } | null>(null);

    const imageObjRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        if (imageUrl) {
            setCurrentSrc(imageUrl);
        }
    }, [imageUrl]);

    // Load initial image into memory
    useEffect(() => {
        if (!isOpen || !currentSrc) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = currentSrc;
        img.onload = () => {
            imageObjRef.current = img;
            processImage();
        };
        img.onerror = () => {
            console.error("Impossible de charger l'image source pour le détourage");
        };
    }, [isOpen, currentSrc]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
                setCurrentSrc(dataUrl);
            }
        };
        reader.readAsDataURL(file);
    };

    // Perform the background removal algorithm
    const processImage = useCallback(() => {
        const img = imageObjRef.current;
        if (!img) return;

        setIsProcessing(true);

        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // 1. Setup original canvas
        const origCanvas = originalCanvasRef.current;
        if (origCanvas) {
            origCanvas.width = width;
            origCanvas.height = height;
            const origCtx = origCanvas.getContext('2d');
            if (origCtx) {
                origCtx.clearRect(0, 0, width, height);
                origCtx.drawImage(img, 0, 0, width, height);
            }
        }

        // 2. Setup result canvas
        const resCanvas = resultCanvasRef.current;
        if (!resCanvas) {
            setIsProcessing(false);
            return;
        }

        resCanvas.width = width;
        resCanvas.height = height;
        const ctx = resCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            setIsProcessing(false);
            return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Target color detection
        let targetR = 255;
        let targetG = 255;
        let targetB = 255;

        if (mode === 'white') {
            targetR = 255; targetG = 255; targetB = 255;
        } else if (mode === 'black') {
            targetR = 0; targetG = 0; targetB = 0;
        } else if (mode === 'custom') {
            targetR = customColor.r;
            targetG = customColor.g;
            targetB = customColor.b;
        } else if (mode === 'auto') {
            // Sample corners (0,0), (w-1,0), (0, h-1), (w-1, h-1)
            const corners = [
                0,
                (width - 1) * 4,
                ((height - 1) * width) * 4,
                ((height - 1) * width + (width - 1)) * 4
            ];
            let sumR = 0, sumG = 0, sumB = 0;
            corners.forEach(idx => {
                sumR += data[idx];
                sumG += data[idx + 1];
                sumB += data[idx + 2];
            });
            targetR = Math.round(sumR / 4);
            targetG = Math.round(sumG / 4);
            targetB = Math.round(sumB / 4);
        }

        const maxDist = (tolerance / 100) * 441.67; // 441.67 = sqrt(255^2 + 255^2 + 255^2)
        const featherDist = (feather / 100) * 100;

        let removedCount = 0;
        const totalPixels = width * height;

        // Process all pixels
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a === 0) continue;

            // Euclidean color distance in RGB space
            const dr = r - targetR;
            const dg = g - targetG;
            const db = b - targetB;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);

            if (dist <= maxDist) {
                // Completely transparent
                data[i + 3] = 0;
                removedCount++;
            } else if (dist < maxDist + featherDist && featherDist > 0) {
                // Soft edge falloff (anti-aliasing)
                const alphaFactor = (dist - maxDist) / featherDist;
                data[i + 3] = Math.round(a * Math.min(1, Math.max(0, alphaFactor)));
            }
        }

        ctx.putImageData(imgData, 0, 0);

        setPixelStats({
            removedPercent: Math.round((removedCount / totalPixels) * 100),
            origWidth: width,
            origHeight: height
        });

        setIsProcessing(false);
    }, [mode, tolerance, feather, customColor]);

    useEffect(() => {
        if (isOpen && imageObjRef.current) {
            const timer = setTimeout(processImage, 50);
            return () => clearTimeout(timer);
        }
    }, [tolerance, feather, mode, customColor, isOpen, processImage]);

    // Eyedropper click handler on original image
    const handleOriginalCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isEyeDropperActive) return;
        const canvas = originalCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        const ctx = canvas.getContext('2d');
        if (ctx) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            setCustomColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
            setMode('custom');
            setIsEyeDropperActive(false);
        }
    };

    const handleApply = async () => {
        const resCanvas = resultCanvasRef.current;
        if (!resCanvas) return;

        setIsSaving(true);
        try {
            const transparentDataUrl = resCanvas.toDataURL('image/png');
            await onSaveTransparentLogo(transparentDataUrl);
            onClose();
        } catch (err) {
            console.error("Erreur enregistrement logo transparent", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#84cc16] text-black flex items-center justify-center font-black shadow-xs">
                            <Wand2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white leading-tight">
                                    Détourage & Suppression de l'Arrière-Plan du Logo
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-[#84cc16]/10 text-[#4d7c0f] text-[10px] font-black uppercase">
                                    Temps Réel
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                Supprimez instantanément les fonds blancs, noirs ou colorés pour obtenir un logo PNG transparent parfait.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/png,image/jpeg,image/svg+xml,image/webp" 
                            onChange={handleFileChange}
                            className="hidden" 
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Charger une autre image depuis votre PC"
                        >
                            <span>📁 Charger autre image</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content: Preview Grid & Controls */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
                    
                    {/* Left: Interactive Controls (4 cols on LG) */}
                    <div className="lg:col-span-4 space-y-5">
                        
                        {/* Mode Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                                1. Méthode de Détection du Fond
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMode('auto')}
                                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                                        mode === 'auto'
                                            ? 'bg-[#84cc16]/10 border-[#84cc16] text-slate-900 dark:text-white shadow-2xs'
                                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <Sparkles className="w-4 h-4 text-[#84cc16]" />
                                        {mode === 'auto' && <Check className="w-3.5 h-3.5 text-[#84cc16]" />}
                                    </div>
                                    <p className="font-black">Auto-Angles</p>
                                    <p className="text-[10px] text-slate-500 font-normal">Détecte les 4 coins</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMode('white')}
                                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                                        mode === 'white'
                                            ? 'bg-[#84cc16]/10 border-[#84cc16] text-slate-900 dark:text-white shadow-2xs'
                                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="w-4 h-4 rounded-full border border-slate-300 bg-white inline-block"></span>
                                        {mode === 'white' && <Check className="w-3.5 h-3.5 text-[#84cc16]" />}
                                    </div>
                                    <p className="font-black">Fond Blanc</p>
                                    <p className="text-[10px] text-slate-500 font-normal">Idéal captures & jpeg</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMode('black')}
                                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                                        mode === 'black'
                                            ? 'bg-[#84cc16]/10 border-[#84cc16] text-slate-900 dark:text-white shadow-2xs'
                                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="w-4 h-4 rounded-full border border-slate-700 bg-black inline-block"></span>
                                        {mode === 'black' && <Check className="w-3.5 h-3.5 text-[#84cc16]" />}
                                    </div>
                                    <p className="font-black">Fond Noir</p>
                                    <p className="text-[10px] text-slate-500 font-normal">Supprime les noirs</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('custom');
                                        setIsEyeDropperActive(true);
                                    }}
                                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                                        mode === 'custom'
                                            ? 'bg-[#84cc16]/10 border-[#84cc16] text-slate-900 dark:text-white shadow-2xs'
                                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <Pipette className={`w-4 h-4 ${isEyeDropperActive ? 'text-[#84cc16] animate-bounce' : 'text-slate-500'}`} />
                                        <div 
                                            className="w-3.5 h-3.5 rounded-full border border-slate-400"
                                            style={{ backgroundColor: `rgb(${customColor.r},${customColor.g},${customColor.b})` }}
                                        />
                                    </div>
                                    <p className="font-black">Pipette Ciblée</p>
                                    <p className="text-[10px] text-slate-500 font-normal">Cliquez sur l'image</p>
                                </button>
                            </div>
                        </div>

                        {/* Slider Tolerance */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Sliders className="w-3.5 h-3.5 text-[#84cc16]" />
                                    <span>Tolérance / Sensibilité</span>
                                </label>
                                <span className="px-2 py-0.5 rounded-md bg-[#84cc16] text-black font-mono font-black text-xs">
                                    {tolerance}%
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="75" 
                                value={tolerance} 
                                onChange={(e) => setTolerance(Number(e.target.value))}
                                className="w-full accent-[#84cc16] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>Strict (Doux)</span>
                                <span>20% (Optimal)</span>
                                <span>75% (Agressif)</span>
                            </div>
                        </div>

                        {/* Slider Contour Smoothing (Feathering) */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Wand2 className="w-3.5 h-3.5 text-[#84cc16]" />
                                    <span>Lissage des Bords</span>
                                </label>
                                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-mono font-black text-xs">
                                    {feather}%
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="30" 
                                value={feather} 
                                onChange={(e) => setFeather(Number(e.target.value))}
                                className="w-full accent-[#84cc16] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                <span>Net (0%)</span>
                                <span>Anti-aliasé (10%)</span>
                                <span>Flouté (30%)</span>
                            </div>
                        </div>

                        {/* Stats Box */}
                        {pixelStats && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs space-y-1 text-emerald-900 dark:text-emerald-200 font-medium">
                                <div className="flex justify-between items-center">
                                    <span>Pixels rendus transparents :</span>
                                    <strong className="font-mono text-[#4d7c0f] dark:text-[#84cc16] text-sm">
                                        {pixelStats.removedPercent}%
                                    </strong>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-500">
                                    <span>Résolution source :</span>
                                    <span className="font-mono">{pixelStats.origWidth} x {pixelStats.origHeight} px</span>
                                </div>
                            </div>
                        )}

                        {/* Zoom control */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                            <span>Zoom d'inspection :</span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setPreviewZoom(0.8)}
                                    className={`px-2 py-1 rounded-md text-[11px] font-bold ${previewZoom === 0.8 ? 'bg-[#84cc16] text-black' : 'bg-slate-100 dark:bg-slate-800'}`}
                                >
                                    80%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewZoom(1)}
                                    className={`px-2 py-1 rounded-md text-[11px] font-bold ${previewZoom === 1 ? 'bg-[#84cc16] text-black' : 'bg-slate-100 dark:bg-slate-800'}`}
                                >
                                    100%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewZoom(1.5)}
                                    className={`px-2 py-1 rounded-md text-[11px] font-bold ${previewZoom === 1.5 ? 'bg-[#84cc16] text-black' : 'bg-slate-100 dark:bg-slate-800'}`}
                                >
                                    150%
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right: Side-by-Side Comparison (8 cols on LG) */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        
                        {/* Checkerboard Transparent Preview Result */}
                        <div className="space-y-2 flex-1 flex flex-col">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] animate-pulse"></span>
                                    <span>Résultat Détouré (Fond Transparent)</span>
                                </label>
                                <span className="text-[10px] font-mono text-slate-400">
                                    Damier = Transparence PNG
                                </span>
                            </div>

                            {/* Canvas with checkerboard pattern */}
                            <div 
                                className="relative flex-1 min-h-[260px] max-h-[360px] rounded-3xl border-2 border-dashed border-[#84cc16]/50 p-4 flex items-center justify-center overflow-auto shadow-inner"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(45deg, #e2e8f0 25%, transparent 25%), 
                                        linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), 
                                        linear-gradient(45deg, transparent 75%, #e2e8f0 75%), 
                                        linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
                                    `,
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                }}
                            >
                                <div style={{ transform: `scale(${previewZoom})`, transition: 'transform 0.15s ease' }}>
                                    <canvas 
                                        ref={resultCanvasRef} 
                                        className="max-h-[280px] max-w-full object-contain drop-shadow-md rounded-lg"
                                    />
                                </div>

                                {isProcessing && (
                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center gap-2 text-white text-xs font-bold rounded-3xl">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#84cc16]" />
                                        <span>Détourage en cours...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Original Source with Eyedropper click */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                    <span>Image d'Origine</span>
                                    {isEyeDropperActive && (
                                        <span className="text-[#84cc16] font-bold text-[10px] animate-pulse">
                                            (Cliquez sur la couleur à supprimer)
                                        </span>
                                    )}
                                </label>
                                <span className="text-[10px] text-slate-400">
                                    Cliquez pour prélever
                                </span>
                            </div>

                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-auto max-h-[140px]">
                                <canvas 
                                    ref={originalCanvasRef} 
                                    onClick={handleOriginalCanvasClick}
                                    className={`max-h-[110px] max-w-full object-contain rounded ${isEyeDropperActive ? 'cursor-crosshair ring-2 ring-[#84cc16]' : 'cursor-default'}`}
                                    title={isEyeDropperActive ? "Cliquez sur une couleur pour la cibler" : "Image originale"}
                                />
                            </div>
                        </div>

                    </div>

                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        Annuler
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setTolerance(20);
                                setFeather(10);
                                setMode('auto');
                            }}
                            className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-bold hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Réinitialiser</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={isSaving || isProcessing}
                            className="px-6 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#72b012] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Enregistrement sur le backend...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    <span>Valider & Appliquer Logo Transparent</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
