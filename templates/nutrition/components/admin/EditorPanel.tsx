import React, { useState } from 'react';
import type { Product, Category, Pack, Advertisements, LogoConfig, FitnessHomeConfig } from '../../types';
import { Logo } from '../Logo';
import { Upload, RotateCcw, Sliders, Image, Sparkles, Check, ArrowRight, Loader2, CheckCircle2, Box, Truck, ShieldCheck, Phone, Mail, MapPin, Wand2, MoveHorizontal } from 'lucide-react';
import { api } from '../../utils/api';
import { LogoBackgroundRemoverModal } from './LogoBackgroundRemoverModal';

interface EditorPanelProps {
    section: string;
    adsConfig: Advertisements;
    onChangeAdsConfig: (newAds: Advertisements) => void;
    allProducts: Product[];
    allCategories?: Category[];
    allPacks?: Pack[];
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
    section, 
    adsConfig, 
    onChangeAdsConfig,
    allProducts
}) => {
    const logoConfig: LogoConfig = adsConfig.logoConfig || {};
    const fitnessHome: FitnessHomeConfig = adsConfig.fitnessHome || {};
    const heroConfig = fitnessHome.hero || {};
    const promoConfig = fitnessHome.promoBanner || {};

    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isBgRemoverOpen, setIsBgRemoverOpen] = useState(false);

    // Helpers to update adsConfig sub-trees
    const updateLogoConfig = (partial: Partial<LogoConfig>) => {
        const updatedLogo: LogoConfig = { ...logoConfig, ...partial };
        onChangeAdsConfig({
            ...adsConfig,
            logoConfig: updatedLogo
        });
        // Also persist in localStorage for immediate sub-site synchronicity
        try {
            localStorage.setItem('multishop_fitness_logo', JSON.stringify(updatedLogo));
        } catch {
            // ignore
        }
    };

    const handleSaveTransparentLogo = async (transparentDataUrl: string) => {
        setIsUploading(true);
        try {
            const res = await api.uploadLogo(transparentDataUrl, {
                navbarHeight: logoConfig.navbarHeight || 42,
                footerHeight: logoConfig.footerHeight || 48
            });
            if (res && res.url) {
                updateLogoConfig({ logoUrl: res.url });
                setUploadSuccessMsg("Arrière-plan supprimé avec succès ! Logo transparent sauvegardé sur le serveur.");
            } else {
                updateLogoConfig({ logoUrl: transparentDataUrl });
                setUploadSuccessMsg("Arrière-plan supprimé et logo transparent appliqué !");
            }
        } catch (err) {
            console.error("Erreur sauvegarde logo transparent:", err);
            updateLogoConfig({ logoUrl: transparentDataUrl });
            setUploadSuccessMsg("Arrière-plan supprimé en local. Pensez à enregistrer.");
        } finally {
            setIsUploading(false);
        }
    };

    const updateHeroConfig = (partial: any) => {
        onChangeAdsConfig({
            ...adsConfig,
            fitnessHome: {
                ...fitnessHome,
                hero: {
                    ...heroConfig,
                    ...partial
                }
            }
        });
    };

    const updatePromoConfig = (partial: any) => {
        onChangeAdsConfig({
            ...adsConfig,
            fitnessHome: {
                ...fitnessHome,
                promoBanner: {
                    ...promoConfig,
                    ...partial
                }
            }
        });
    };

    const updateGeneralConfig = (field: string, val: string) => {
        onChangeAdsConfig({
            ...adsConfig,
            fitnessHome: {
                ...fitnessHome,
                [field]: val
            }
        });
    };

    // Handle file upload for logo from PC directly to Backend
    const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setUploadError("L'image ne doit pas dépasser 5 Mo.");
            return;
        }

        setUploadError(null);
        setUploadSuccessMsg(null);
        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const dataUrl = event.target?.result as string;
            if (!dataUrl) {
                setIsUploading(false);
                return;
            }

            try {
                // Upload and persist directly to backend server
                const res = await api.uploadLogo(dataUrl, {
                    navbarHeight: logoConfig.navbarHeight || 42,
                    footerHeight: logoConfig.footerHeight || 48
                });

                if (res && res.url) {
                    updateLogoConfig({ logoUrl: res.url });
                    setUploadSuccessMsg(`Logo importé avec succès depuis votre PC et stocké sur le serveur (${res.url})`);
                } else {
                    updateLogoConfig({ logoUrl: dataUrl });
                    setUploadSuccessMsg("Logo appliqué avec succès !");
                }
            } catch (err: any) {
                console.error("Erreur téléversement backend:", err);
                updateLogoConfig({ logoUrl: dataUrl });
                setUploadError("Image appliquée localement. Sauvegardez pour synchroniser.");
            } finally {
                setIsUploading(false);
            }
        };

        reader.onerror = () => {
            setUploadError("Impossible de lire le fichier sélectionné.");
            setIsUploading(false);
        };

        reader.readAsDataURL(file);
    };

    const handleResetLogo = async () => {
        setIsUploading(true);
        try {
            await api.resetLogo();
        } catch {
            // ignore
        } finally {
            setIsUploading(false);
            updateLogoConfig({ logoUrl: '' });
            setUploadSuccessMsg("Logo réinitialisé avec succès vers l'emblème vectoriel officiel.");
            setUploadError(null);
        }
    };

    // SECTION 1: LOGO & VISUAL IDENTITY
    if (section === 'logo') {
        const currentNavHeight = logoConfig.navbarHeight || 42;
        const currentFooterHeight = logoConfig.footerHeight || 48;

        return (
            <div className="p-5 space-y-6 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                
                {/* Section Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
                        Identité Graphique
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Logo & Tailles
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Personnalisez le logo de Fitness Shop et contrôlez indépendamment ses dimensions dans la barre de navigation et le pied de page.
                    </p>
                </div>

                {/* Live Logo Preview Box */}
                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Aperçu en Direct du Logo
                    </label>
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="p-2 bg-slate-950/80 rounded-xl border border-white/5 w-full flex items-center justify-center min-h-[90px]">
                            <Logo logoConfig={logoConfig} variant="navbar" />
                        </div>
                        <span className="text-[10px] font-mono text-[#84cc16] uppercase tracking-wider">
                            {logoConfig.logoUrl ? "Image personnalisée chargée" : "Logo vectoriel officiel (Capture)"}
                        </span>
                    </div>
                </div>

                {/* Controls: Slider Navbar Logo Height */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#84cc16]" />
                            <span>Taille Navbar (Hauteur)</span>
                        </label>
                        <span className="px-2 py-0.5 bg-[#84cc16] text-black font-mono font-black text-xs rounded-md">
                            {currentNavHeight} px
                        </span>
                    </div>
                    <input 
                        type="range"
                        min="24"
                        max="100"
                        value={currentNavHeight}
                        onChange={(e) => updateLogoConfig({ navbarHeight: Number(e.target.value) })}
                        className="w-full accent-[#84cc16] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>24 px (Compact)</span>
                        <span>42 px (Recommandé)</span>
                        <span>100 px (Max)</span>
                    </div>
                </div>

                {/* Controls: Slider Footer Logo Height */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#84cc16]" />
                            <span>Taille Footer (Hauteur)</span>
                        </label>
                        <span className="px-2 py-0.5 bg-[#84cc16] text-black font-mono font-black text-xs rounded-md">
                            {currentFooterHeight} px
                        </span>
                    </div>
                    <input 
                        type="range"
                        min="24"
                        max="120"
                        value={currentFooterHeight}
                        onChange={(e) => updateLogoConfig({ footerHeight: Number(e.target.value) })}
                        className="w-full accent-[#84cc16] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>24 px (Discret)</span>
                        <span>48 px (Standard)</span>
                        <span>120 px (Grand)</span>
                    </div>
                </div>

                {/* Upload or Link Logo Image */}
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
                        Importer le Logo depuis votre PC
                    </label>

                    {/* Upload File Input */}
                    <div className={`relative border-2 border-dashed ${isUploading ? 'border-[#84cc16] bg-[#84cc16]/5' : 'border-slate-300 dark:border-slate-700 hover:border-[#84cc16] bg-white dark:bg-slate-900'} rounded-2xl p-5 text-center cursor-pointer transition-all`}>
                        <input 
                            type="file" 
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            onChange={handleLogoFileUpload}
                            disabled={isUploading}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed" 
                        />
                        <div className="flex flex-col items-center gap-1.5 text-slate-600 dark:text-slate-400 pointer-events-none">
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-7 h-7 text-[#84cc16] animate-spin" />
                                    <span className="text-xs font-black text-[#84cc16]">
                                        Téléversement et stockage dans le backend...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16] mb-1">
                                        <Upload className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                                        Sélectionner un fichier image sur votre PC
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        Formats acceptés : PNG, SVG, WEBP, JPG (Enregistré sur /uploads/)
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {uploadSuccessMsg && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{uploadSuccessMsg}</span>
                        </div>
                    )}

                    {uploadError && (
                        <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                            {uploadError}
                        </p>
                    )}

                    {/* Action 1: Real Background Remover Tool */}
                    {logoConfig.logoUrl ? (
                        <div className="space-y-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsBgRemoverOpen(true)}
                                className="w-full py-3 px-4 bg-gradient-to-r from-[#84cc16]/15 to-[#84cc16]/25 hover:from-[#84cc16]/25 hover:to-[#84cc16]/40 text-slate-900 dark:text-white border-2 border-[#84cc16] rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer group"
                            >
                                <Wand2 className="w-4 h-4 text-[#4d7c0f] dark:text-[#84cc16] group-hover:rotate-12 transition-transform" />
                                <span>🪄 Enlever l'Arrière-Plan (Rendre Transparent)</span>
                            </button>
                            <p className="text-[11px] text-slate-500 text-center">
                                Détecte les fonds blancs/noirs et élimine les bordures pour un rendu propre dans la barre.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 pt-1">
                            <label className="w-full py-3 px-4 bg-gradient-to-r from-[#84cc16]/10 to-[#84cc16]/20 hover:from-[#84cc16]/20 hover:to-[#84cc16]/30 text-slate-900 dark:text-white border-2 border-dashed border-[#84cc16] rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer group">
                                <input 
                                    type="file" 
                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (evt) => {
                                            const dataUrl = evt.target?.result as string;
                                            if (dataUrl) {
                                                updateLogoConfig({ logoUrl: dataUrl });
                                                setIsBgRemoverOpen(true);
                                            }
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                    className="hidden" 
                                />
                                <Wand2 className="w-4 h-4 text-[#4d7c0f] dark:text-[#84cc16] group-hover:rotate-12 transition-transform" />
                                <span>🪄 Choisir une image & Enlever son Fond</span>
                            </label>
                            <p className="text-[11px] text-slate-500 text-center">
                                Chargez une image depuis votre PC pour supprimer son fond et la rendre transparente en temps réel.
                            </p>
                        </div>
                    )}

                    {/* Backend URL info */}
                    {logoConfig.logoUrl && (
                        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Fichier stocké dans le backend :
                            </span>
                            <p className="text-xs font-mono text-[#84cc16] break-all">
                                {logoConfig.logoUrl}
                            </p>
                        </div>
                    )}

                    {/* Or URL input */}
                    <div className="space-y-1 pt-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Ou URL directe d'image (ex: /uploads/... ou https://...)
                        </label>
                        <input 
                            type="text"
                            placeholder="Ex: /uploads/logo_fitness.png ou https://..."
                            value={logoConfig.logoUrl || ''}
                            onChange={(e) => updateLogoConfig({ logoUrl: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    {/* Controls: Navbar Position Slider & Drag Controls */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3 pt-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <MoveHorizontal className="w-3.5 h-3.5 text-[#84cc16]" />
                                <span>Position Navbar (Glisser pour fixer)</span>
                            </label>
                            <span className="px-2 py-0.5 bg-[#84cc16] text-black font-mono font-black text-xs rounded-md">
                                {logoConfig.navbarOffset || 0} px
                            </span>
                        </div>

                        {/* Presets */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => updateLogoConfig({ navbarOffset: 0, navbarPosition: 'left' })}
                                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                    (logoConfig.navbarOffset || 0) === 0
                                        ? 'bg-[#84cc16] text-black border-[#84cc16]'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                ◀ Gauche (0px)
                            </button>
                            <button
                                type="button"
                                onClick={() => updateLogoConfig({ navbarOffset: 350, navbarPosition: 'custom' })}
                                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                    (logoConfig.navbarOffset || 0) === 350
                                        ? 'bg-[#84cc16] text-black border-[#84cc16]'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                ⏺ Centre (+350px)
                            </button>
                            <button
                                type="button"
                                onClick={() => updateLogoConfig({ navbarOffset: 700, navbarPosition: 'custom' })}
                                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                    (logoConfig.navbarOffset || 0) === 700
                                        ? 'bg-[#84cc16] text-black border-[#84cc16]'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                ▶ Droite (+700px)
                            </button>
                        </div>

                        <input 
                            type="range"
                            min="0"
                            max="1000"
                            value={logoConfig.navbarOffset || 0}
                            onChange={(e) => updateLogoConfig({ navbarOffset: Number(e.target.value), navbarPosition: 'custom' })}
                            className="w-full accent-[#84cc16] cursor-pointer"
                        />

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            💡 <strong>Glissement libre :</strong> Glissez directement le logo à la souris dans l'aperçu ou en plein écran, ou ajustez ce curseur (de 0 à 1000px).
                        </p>
                    </div>

                    {/* Reset to Official Emblem button */}
                    {logoConfig.logoUrl && (
                        <button
                            type="button"
                            onClick={handleResetLogo}
                            disabled={isUploading}
                            className="w-full py-2.5 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-[#84cc16]" />
                            <span>Supprimer le logo personnalisé et rétablir l'emblème</span>
                        </button>
                    )}
                </div>

                {/* Text customization if using the emblem */}
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
                        Textes du Logo Emblème
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold block mb-1">Texte 1 (Sombre)</span>
                            <input 
                                type="text"
                                value={logoConfig.textPrimary || 'FITNESS'}
                                onChange={(e) => updateLogoConfig({ textPrimary: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>

                        <div>
                            <span className="text-[10px] text-slate-400 font-bold block mb-1">Texte 2 (Vert Fluo)</span>
                            <input 
                                type="text"
                                value={logoConfig.textSecondary || 'SHOP'}
                                onChange={(e) => updateLogoConfig({ textSecondary: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>
                    </div>

                    <div>
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">Sous-titre / Slogan</span>
                        <input 
                            type="text"
                            value={logoConfig.tagline || 'ELITE FITNESS EQUIPMENT'}
                            onChange={(e) => updateLogoConfig({ tagline: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>
                </div>

                {/* Real Background Remover Modal */}
                {isBgRemoverOpen && logoConfig.logoUrl && (
                    <LogoBackgroundRemoverModal
                        isOpen={isBgRemoverOpen}
                        onClose={() => setIsBgRemoverOpen(false)}
                        imageUrl={logoConfig.logoUrl}
                        onSaveTransparentLogo={handleSaveTransparentLogo}
                    />
                )}

            </div>
        );
    }

    // SECTION 2: HERO BANNER
    if (section === 'hero') {
        return (
            <div className="p-5 space-y-5 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
                        Hero Bannière
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Section Principale Accueil
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Badge Supérieur</label>
                        <input 
                            type="text" 
                            value={heroConfig.badge || 'ÉQUIPEMENT DE MUSCULATION'} 
                            onChange={(e) => updateHeroConfig({ badge: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Titre Blanc</label>
                            <input 
                                type="text" 
                                value={heroConfig.title || 'ATTEINS TES'} 
                                onChange={(e) => updateHeroConfig({ title: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Mot Clé Fluo</label>
                            <input 
                                type="text" 
                                value={heroConfig.titleHighlight || 'OBJECTIFS'} 
                                onChange={(e) => updateHeroConfig({ titleHighlight: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-[#84cc16] focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                        <textarea 
                            rows={3}
                            value={heroConfig.description || 'Matériel de sport de qualité pour un entraînement plus efficace et plus motivant.'} 
                            onChange={(e) => updateHeroConfig({ description: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Texte Bouton</label>
                            <input 
                                type="text" 
                                value={heroConfig.buttonText || 'Découvrir la collection'} 
                                onChange={(e) => updateHeroConfig({ buttonText: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Catégorie Cible</label>
                            <input 
                                type="text" 
                                value={heroConfig.buttonCategory || 'Musculation'} 
                                onChange={(e) => updateHeroConfig({ buttonCategory: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Image de Fond (Athlète)</label>
                        <input 
                            type="text" 
                            value={heroConfig.bgImage || '/src/assets/images/hero_fitness_athlete_1790951585544.jpg'} 
                            onChange={(e) => updateHeroConfig({ bgImage: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div>
                            <label className="text-[10px] text-slate-400 font-bold block mb-1">Slogan Italique Ligne 1</label>
                            <input 
                                type="text" 
                                value={heroConfig.calligraphyTop || 'Plus fort'} 
                                onChange={(e) => updateHeroConfig({ calligraphyTop: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 font-bold block mb-1">Slogan Italique Ligne 2</label>
                            <input 
                                type="text" 
                                value={heroConfig.calligraphyBottom || 'chaque jour'} 
                                onChange={(e) => updateHeroConfig({ calligraphyBottom: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // SECTION 3: PROMO BANNER DROITE
    if (section === 'promoBanner') {
        return (
            <div className="p-5 space-y-5 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
                        Bannière Droite
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Offre Spéciale Bestsellers
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tag Fluo</label>
                        <input 
                            type="text" 
                            value={promoConfig.tag || 'PROMOTION'} 
                            onChange={(e) => updatePromoConfig({ tag: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Titre</label>
                            <input 
                                type="text" 
                                value={promoConfig.title || "JUSQU'À"} 
                                onChange={(e) => updatePromoConfig({ title: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Remise Fluo</label>
                            <input 
                                type="text" 
                                value={promoConfig.discountHighlight || '-20%'} 
                                onChange={(e) => updatePromoConfig({ discountHighlight: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-[#84cc16] focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description de la sélection</label>
                        <input 
                            type="text" 
                            value={promoConfig.description || "SUR UNE SÉLECTION D'HALTÈRES ET DISQUES"} 
                            onChange={(e) => updatePromoConfig({ description: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Texte Bouton</label>
                            <input 
                                type="text" 
                                value={promoConfig.buttonText || 'Voir la sélection'} 
                                onChange={(e) => updatePromoConfig({ buttonText: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Lien / Rayon Cible</label>
                            <input 
                                type="text" 
                                value={promoConfig.categoryTarget || 'Disques & Barres'} 
                                onChange={(e) => updatePromoConfig({ categoryTarget: e.target.value })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Image de fond (Disques / Haltères)</label>
                        <input 
                            type="text" 
                            value={promoConfig.bgImage || '/src/assets/images/banner_bumper_plates_promo_1790951639841.jpg'} 
                            onChange={(e) => updatePromoConfig({ bgImage: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // SECTION 4: BESTSELLERS & SECONDARY TITLES
    if (section === 'bestsellers') {
        return (
            <div className="p-5 space-y-5 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
                        Grille Produits
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Titres des Sélections
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Kicker Bestsellers</label>
                        <input 
                            type="text" 
                            value={fitnessHome.bestsellersKicker || 'LES PLUS VENDUS'} 
                            onChange={(e) => updateGeneralConfig('bestsellersKicker', e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Titre Bestsellers</label>
                        <input 
                            type="text" 
                            value={fitnessHome.bestsellersTitle || 'Nos Bestsellers'} 
                            onChange={(e) => updateGeneralConfig('bestsellersTitle', e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Kicker Catalogue Complémentaire</label>
                        <input 
                            type="text" 
                            value={fitnessHome.secondaryKicker || 'CATALOGUE COMPLET & NUTRITION'} 
                            onChange={(e) => updateGeneralConfig('secondaryKicker', e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Titre Catalogue Complémentaire</label>
                        <input 
                            type="text" 
                            value={fitnessHome.secondaryTitle || 'Compléments, Accessoires & Nutrition'} 
                            onChange={(e) => updateGeneralConfig('secondaryTitle', e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // SECTION 5: STUDIO 3D CONFIGURATION
    if (section === 'interactive3d') {
        return (
            <div className="p-5 space-y-5 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
                        Rendu 3D Interactif
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Box className="w-5 h-5 text-[#84cc16]" />
                        <span>Studio 3D & Simulateur Gym</span>
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={fitnessHome.enable3DStudio !== false}
                                onChange={(e) => onChangeAdsConfig({
                                    ...adsConfig,
                                    fitnessHome: {
                                        ...fitnessHome,
                                        enable3DStudio: e.target.checked
                                    }
                                })}
                                className="w-4 h-4 accent-[#84cc16] rounded"
                            />
                            <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                    Afficher le Studio 3D sur la page d'accueil
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    Simulateur 3D interactif avec chargement de disques olympiques et inclinaison du banc
                                </span>
                            </div>
                        </label>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Mode 3D Initial par défaut
                        </label>
                        <select
                            value={fitnessHome.studioDefaultMode || 'gym'}
                            onChange={(e) => onChangeAdsConfig({
                                ...adsConfig,
                                fitnessHome: {
                                    ...fitnessHome,
                                    studioDefaultMode: e.target.value as any
                                }
                            })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        >
                            <option value="gym">Home Gym Complet (Rack + Banc + Barre olympique)</option>
                            <option value="barbell">Barre & Disques Olympiques Isolés</option>
                            <option value="exploded">Vue Éclatée Mécanique & Acier</option>
                        </select>
                    </div>

                    <div className="p-3 bg-[#84cc16]/10 border border-[#84cc16]/30 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">
                            ✨ Spécifications 3D Canvas
                        </span>
                        Le studio 3D tourne en temps réel à 60 FPS sans dépendance lourde externe, supporte l'orbite 360°, le zoom molette, le calcul de tonnage en KG et le dimensionnement au sol m².
                    </div>
                </div>
            </div>
        );
    }

    // SECTION 6: LIVRAISON & FRET LOURD
    if (section === 'delivery') {
        return (
            <div className="p-5 space-y-5 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
                        Logistique Équipement
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[#84cc16]" />
                        <span>Fret Matériel Lourd & Tarifs</span>
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Seuil Livraison Gratuite (TND)
                        </label>
                        <input 
                            type="number" 
                            value={fitnessHome.deliveryFreeThreshold || 300} 
                            onChange={(e) => onChangeAdsConfig({
                                ...adsConfig,
                                fitnessHome: {
                                    ...fitnessHome,
                                    deliveryFreeThreshold: Number(e.target.value)
                                }
                            })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Au-delà de ce montant, la livraison classique est offerte.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Fret Grand Tunis (TND)
                            </label>
                            <input 
                                type="number" 
                                value={fitnessHome.deliveryTunisCost || 7} 
                                onChange={(e) => onChangeAdsConfig({
                                    ...adsConfig,
                                    fitnessHome: {
                                        ...fitnessHome,
                                        deliveryTunisCost: Number(e.target.value)
                                    }
                                })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Fret Autres Gouvernorats (TND)
                            </label>
                            <input 
                                type="number" 
                                value={fitnessHome.deliveryRegionsCost || 12} 
                                onChange={(e) => onChangeAdsConfig({
                                    ...adsConfig,
                                    fitnessHome: {
                                        ...fitnessHome,
                                        deliveryRegionsCost: Number(e.target.value)
                                    }
                                })}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // SECTION 7: FOOTER & COORDONNÉES JOUR
    if (section === 'footer') {
        return (
            <div className="p-5 space-y-5 text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
                        Pied de Page
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#84cc16]" />
                        <span>Footer Clair & Coordonnées</span>
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Téléphone Service Client & Hotline
                        </label>
                        <input 
                            type="text" 
                            value={fitnessHome.footerPhone || '+216 71 888 999'} 
                            onChange={(e) => onChangeAdsConfig({
                                ...adsConfig,
                                fitnessHome: {
                                    ...fitnessHome,
                                    footerPhone: e.target.value
                                }
                            })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Email Contact & Support
                        </label>
                        <input 
                            type="text" 
                            value={fitnessHome.footerEmail || 'contact@fitnessshop.tn'} 
                            onChange={(e) => onChangeAdsConfig({
                                ...adsConfig,
                                fitnessHome: {
                                    ...fitnessHome,
                                    footerEmail: e.target.value
                                }
                            })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Adresse Showroom Fitness
                        </label>
                        <input 
                            type="text" 
                            value={fitnessHome.footerAddress || 'Zone Industrielle La Charguia II, 2035 Tunis, Tunisie'} 
                            onChange={(e) => onChangeAdsConfig({
                                ...adsConfig,
                                fitnessHome: {
                                    ...fitnessHome,
                                    footerAddress: e.target.value
                                }
                            })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200">
                        <span className="font-bold block mb-0.5">☀️ Thème Jour Vérifié</span>
                        Le pied de page s'affiche avec un fond blanc/ardoise lumineux, bordures fines et typographie contrastée sans assombrir la page.
                    </div>
                </div>
            </div>
        );
    }

    // Default overview
    return (
        <div className="p-5 space-y-4 text-slate-800 dark:text-slate-100">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
                    Éditeur Visuel
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Accueil Fitness Shop
                </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
                Cliquez directement sur une section dans l'aperçu ou choisissez un module ci-contre pour modifier le logo, les bannières et les textes.
            </p>
        </div>
    );
};
