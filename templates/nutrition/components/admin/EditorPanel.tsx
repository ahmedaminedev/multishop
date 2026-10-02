import React, { useState } from 'react';
import type { Product, Category, Pack, Advertisements, LogoConfig, FitnessHomeConfig } from '../../types';
import { Logo } from '../Logo';
import { Upload, RotateCcw, Sliders, Image, Sparkles, Check, ArrowRight } from 'lucide-react';

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

    // Handle file upload for logo
    const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setUploadError("L'image ne doit pas dépasser 2 Mo.");
            return;
        }

        setUploadError(null);
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
                updateLogoConfig({ logoUrl: dataUrl });
            }
        };
        reader.readAsDataURL(file);
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
                        Changer l'image du Logo
                    </label>

                    {/* Upload File Input */}
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#84cc16] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-white dark:bg-slate-900">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                        />
                        <div className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 pointer-events-none">
                            <Upload className="w-6 h-6 text-[#84cc16]" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Téléverser une image de logo
                            </span>
                            <span className="text-[10px] text-slate-400">PNG, SVG, WEBP ou JPEG (Max 2 Mo)</span>
                        </div>
                    </div>

                    {uploadError && (
                        <p className="text-xs text-rose-500 font-bold">{uploadError}</p>
                    )}

                    {/* Or URL input */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Ou coller l'URL d'une image
                        </label>
                        <input 
                            type="text"
                            placeholder="https://..."
                            value={logoConfig.logoUrl || ''}
                            onChange={(e) => updateLogoConfig({ logoUrl: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#84cc16]"
                        />
                    </div>

                    {/* Reset to Capture Emblem button */}
                    {logoConfig.logoUrl && (
                        <button
                            type="button"
                            onClick={() => updateLogoConfig({ logoUrl: '' })}
                            className="w-full py-2.5 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-[#84cc16]" />
                            <span>Rétablir l'emblème officiel (Capture)</span>
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
