import React, { useState, useEffect, useMemo } from 'react';
import type { Advertisements, Product, Pack, Category, LogoConfig, FitnessHomeConfig } from '../../types';
import { useToast } from '../ToastContext';
import { EditorPanel } from './EditorPanel';
import { api } from '../../utils/api';
import { Logo } from '../Logo';
import { HeroSection } from '../HeroSection';
import { CategoryBar } from '../CategoryBar';
import { ProductCard } from '../ProductCard';
import { TrustBadges } from '../TrustBadges';
import { Footer } from '../Footer';
import { Sparkles, Sliders, Layout, ArrowRight, Eye, CheckCircle2, RotateCcw } from 'lucide-react';

interface ManageHomePageProps {
    initialAds: Advertisements;
    onSave: (newAds: Advertisements) => void;
    allProducts: Product[];
    allPacks?: Pack[];
    allCategories?: Category[];
}

export const ManageHomePage: React.FC<ManageHomePageProps> = ({ 
    initialAds, 
    onSave, 
    allProducts = []
}) => {
    const { addToast } = useToast();

    // Default configuration for Fitness Shop if empty
    const defaultLogoConfig: LogoConfig = {
        logoUrl: '',
        navbarHeight: 42,
        footerHeight: 48,
        textPrimary: 'FITNESS',
        textSecondary: 'SHOP',
        tagline: 'ELITE FITNESS EQUIPMENT'
    };

    const defaultFitnessHome: FitnessHomeConfig = {
        hero: {
            badge: 'ÉQUIPEMENT DE MUSCULATION',
            title: 'ATTEINS TES',
            titleHighlight: 'OBJECTIFS',
            description: 'Matériel de sport de qualité pour un entraînement plus efficace et plus motivant.',
            buttonText: 'Découvrir la collection',
            buttonCategory: 'Musculation',
            bgImage: '/src/assets/images/hero_fitness_athlete_1790951585544.jpg',
            calligraphyTop: 'Plus fort',
            calligraphyBottom: 'chaque jour'
        },
        promoBanner: {
            tag: 'PROMOTION',
            title: "JUSQU'À",
            discountHighlight: '-20%',
            description: "SUR UNE SÉLECTION D'HALTÈRES ET DISQUES",
            buttonText: 'Voir la sélection',
            categoryTarget: 'Disques & Barres',
            bgImage: '/src/assets/images/banner_bumper_plates_promo_1790951639841.jpg'
        },
        bestsellersTitle: 'Nos Bestsellers',
        bestsellersKicker: 'LES PLUS VENDUS',
        secondaryTitle: 'Compléments, Accessoires & Nutrition',
        secondaryKicker: 'CATALOGUE COMPLET & NUTRITION'
    };

    const [adsConfig, setAdsConfig] = useState<Advertisements>(() => {
        return {
            ...initialAds,
            logoConfig: { ...defaultLogoConfig, ...(initialAds?.logoConfig || {}) },
            fitnessHome: { 
                ...defaultFitnessHome, 
                ...(initialAds?.fitnessHome || {}),
                hero: { ...defaultFitnessHome.hero, ...(initialAds?.fitnessHome?.hero || {}) },
                promoBanner: { ...defaultFitnessHome.promoBanner, ...(initialAds?.fitnessHome?.promoBanner || {}) }
            }
        };
    });

    const [activeSection, setActiveSection] = useState<'logo' | 'hero' | 'promoBanner' | 'bestsellers'>('logo');
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialAds && Object.keys(initialAds).length > 0) {
            setAdsConfig(prev => ({
                ...prev,
                ...initialAds,
                logoConfig: { ...defaultLogoConfig, ...(initialAds.logoConfig || prev.logoConfig || {}) },
                fitnessHome: {
                    ...defaultFitnessHome,
                    ...(initialAds.fitnessHome || prev.fitnessHome || {}),
                    hero: { ...defaultFitnessHome.hero, ...(initialAds.fitnessHome?.hero || prev.fitnessHome?.hero || {}) },
                    promoBanner: { ...defaultFitnessHome.promoBanner, ...(initialAds.fitnessHome?.promoBanner || prev.fitnessHome?.promoBanner || {}) }
                }
            }));
        }
    }, [initialAds]);

    const handleUpdateAdsConfig = (newAds: Advertisements) => {
        setAdsConfig(newAds);
        setIsDirty(true);
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            // Save directly to backend (/api/advertisements)
            await api.updateAdvertisements(adsConfig);

            // Save in localStorage for immediate sync across tabs/storefront
            if (adsConfig.logoConfig) {
                localStorage.setItem('multishop_fitness_logo', JSON.stringify(adsConfig.logoConfig));
            }

            // Propagate up to parent React state
            onSave(adsConfig);
            setIsDirty(false);

            // Dispatch event for any active views
            window.dispatchEvent(new CustomEvent('fitness-ads-updated', { detail: adsConfig }));

            addToast("Logo et modifications de l'accueil enregistrés avec succès dans le backend !", "success");
        } catch (error) {
            console.error("Save error:", error);
            addToast("Erreur lors de la sauvegarde sur le serveur.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Bestseller mock items for preview
    const bestsellersPreview = useMemo(() => {
        if (allProducts && allProducts.length >= 4) {
            return allProducts.slice(0, 4);
        }
        return [
            {
                id: 101,
                name: 'Haltères Hexagonaux 2x10kg',
                price: 169.000,
                oldPrice: 199.000,
                discount: 15,
                imageUrl: '/src/assets/images/category_halteres_poids_1790951598408.jpg',
                category: 'Haltères & Poids',
                quantity: 40
            },
            {
                id: 102,
                name: 'Banc Ajustable Pro',
                price: 349.000,
                oldPrice: 389.000,
                discount: 10,
                imageUrl: '/src/assets/images/category_banc_musculation_1790951610418.jpg',
                category: 'Bancs de Musculation',
                quantity: 25
            },
            {
                id: 103,
                name: 'Rack de Musculation Heavy Duty',
                price: 1249.000,
                oldPrice: 1429.000,
                discount: 12,
                imageUrl: '/src/assets/images/category_rack_station_1790951619589.jpg',
                category: 'Racks & Stations',
                quantity: 15
            },
            {
                id: 104,
                name: 'Tapis de Course 2.5HP Pro',
                price: 1299.000,
                oldPrice: 1399.000,
                discount: 8,
                imageUrl: '/src/assets/images/category_tapis_cardio_1790951629862.jpg',
                category: 'Cardio',
                quantity: 10
            }
        ];
    }, [allProducts]);

    const fitnessHome = adsConfig.fitnessHome || defaultFitnessHome;
    const heroConfig = fitnessHome.hero || defaultFitnessHome.hero;
    const promoConfig = fitnessHome.promoBanner || defaultFitnessHome.promoBanner;
    const currentLogoConfig = adsConfig.logoConfig || defaultLogoConfig;

    return (
        <div className="flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#070a12] text-slate-900 dark:text-slate-100 font-sans">
            
            {/* Top Toolbar */}
            <div className="bg-white dark:bg-[#0c1422] border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs z-20">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#84cc16] text-black flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                        <h1 className="text-base font-black uppercase text-slate-900 dark:text-white leading-none">
                            Éditeur Accueil & Logo Fitness Shop
                        </h1>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            Édition en direct du sous-site, contrôle de taille des logos et sauvegarde backend
                        </p>
                    </div>
                </div>

                {/* Section selection quick tabs */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setActiveSection('logo')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeSection === 'logo'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-[#84cc16]"></span>
                        <span>Logo & Tailles</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('hero')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeSection === 'hero'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>Bannière Hero</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('promoBanner')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeSection === 'promoBanner'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>Bannière Promo</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('bestsellers')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeSection === 'bestsellers'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>Bestsellers</span>
                    </button>
                </div>

                {/* Save button */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveClick}
                        disabled={isSaving}
                        className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                            isDirty 
                                ? 'bg-[#84cc16] hover:bg-[#72b012] text-black shadow-md shadow-[#84cc16]/25 animate-pulse'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                        }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSaving ? 'Enregistrement...' : isDirty ? 'Enregistrer & Déployer' : 'Modifications enregistrées'}</span>
                    </button>
                </div>
            </div>

            {/* Split View: Live Preview on left, Controls on right */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left: Scrollable Home Page Live Preview */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 bg-slate-200/50 dark:bg-[#05070c]">
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* Interactive Clickable Section 1: Top Navigation Bar Preview with Logo */}
                        <div 
                            onClick={() => setActiveSection('logo')}
                            className={`relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 transition-all cursor-pointer shadow-sm ${
                                activeSection === 'logo'
                                    ? 'border-[#84cc16] ring-4 ring-[#84cc16]/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                            }`}
                        >
                            <div className="absolute top-2 right-2 z-20 px-2.5 py-1 bg-[#84cc16] text-black text-[10px] font-black uppercase rounded-lg shadow-sm flex items-center gap-1">
                                <Sliders className="w-3 h-3" />
                                <span>Cliquez pour régler le logo ({currentLogoConfig.navbarHeight || 42}px)</span>
                            </div>

                            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <Logo logoConfig={currentLogoConfig} variant="navbar" />
                                <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                                    <span>Musculation</span>
                                    <span>Cardio</span>
                                    <span>Cross Training</span>
                                    <span className="text-[#84cc16] font-bold">Promotions</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Clickable Section 2: Hero Section */}
                        <div 
                            onClick={() => setActiveSection('hero')}
                            className={`relative rounded-3xl overflow-hidden border-2 transition-all cursor-pointer shadow-md ${
                                activeSection === 'hero'
                                    ? 'border-[#84cc16] ring-4 ring-[#84cc16]/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                            }`}
                        >
                            <div className="absolute top-3 right-3 z-30 px-3 py-1 bg-[#84cc16] text-black text-[10px] font-black uppercase rounded-lg shadow-md flex items-center gap-1">
                                <Layout className="w-3 h-3" />
                                <span>Éditer Bannière Hero</span>
                            </div>

                            <HeroSection config={heroConfig} />
                        </div>

                        {/* Section 3: CategoryBar */}
                        <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <CategoryBar onCategoryClick={() => {}} />
                        </div>

                        {/* Interactive Clickable Section 4: Bestsellers & Right Promo Banner */}
                        <div 
                            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                        >
                            {/* Section header click to edit titles */}
                            <div 
                                onClick={() => setActiveSection('bestsellers')}
                                className={`flex justify-between items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                                    activeSection === 'bestsellers'
                                        ? 'border-[#84cc16] bg-[#84cc16]/5'
                                        : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                            >
                                <div>
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <span className="w-4 h-1 bg-[#84cc16] rounded-full inline-block"></span>
                                        {fitnessHome.bestsellersKicker || 'LES PLUS VENDUS'}
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        {fitnessHome.bestsellersTitle || 'Nos Bestsellers'}
                                    </h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                    Modifier les titres
                                </span>
                            </div>

                            {/* Bestsellers Grid with Right Promo Banner */}
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                                {/* Left: Product cards */}
                                <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {bestsellersPreview.map((p) => (
                                        <ProductCard 
                                            key={`admin-prev-${p.id}`} 
                                            product={p as any} 
                                            onNavigateToProductDetail={() => {}} 
                                        />
                                    ))}
                                </div>

                                {/* Right: Promotional Card */}
                                <div 
                                    onClick={() => setActiveSection('promoBanner')}
                                    className={`xl:col-span-4 relative rounded-2xl overflow-hidden bg-black text-white min-h-[300px] flex flex-col justify-between p-6 shadow-sm border-2 transition-all cursor-pointer ${
                                        activeSection === 'promoBanner'
                                            ? 'border-[#84cc16] ring-4 ring-[#84cc16]/20'
                                            : 'border-transparent hover:border-slate-400'
                                    }`}
                                >
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url('${promoConfig.bgImage || '/src/assets/images/banner_bumper_plates_promo_1790951639841.jpg'}')` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
                                    </div>

                                    <div className="relative z-10">
                                        <span className="inline-block bg-[#84cc16] text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm mb-3">
                                            {promoConfig.tag || 'PROMOTION'}
                                        </span>
                                        <h3 className="text-3xl font-black uppercase leading-none tracking-tight">
                                            {promoConfig.title || "JUSQU'À"}<br />
                                            <span className="text-[#84cc16]">{promoConfig.discountHighlight || '-20%'}</span>
                                        </h3>
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2">
                                            {promoConfig.description || "SUR UNE SÉLECTION D'HALTÈRES ET DISQUES"}
                                        </p>
                                    </div>

                                    <div className="relative z-10 pt-4">
                                        <span className="px-4 py-2 border border-white text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5">
                                            <span>{promoConfig.buttonText || 'Voir la sélection'}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Clickable Section 5: Footer Preview with Footer Logo */}
                        <div 
                            onClick={() => setActiveSection('logo')}
                            className={`relative rounded-3xl overflow-hidden border-2 transition-all cursor-pointer shadow-md ${
                                activeSection === 'logo'
                                    ? 'border-[#84cc16] ring-4 ring-[#84cc16]/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                            }`}
                        >
                            <div className="absolute top-4 right-4 z-30 px-3 py-1 bg-[#84cc16] text-black text-[10px] font-black uppercase rounded-lg shadow-md flex items-center gap-1">
                                <Sliders className="w-3 h-3" />
                                <span>Logo Footer ({currentLogoConfig.footerHeight || 48}px)</span>
                            </div>

                            <Footer logoConfig={currentLogoConfig} />
                        </div>

                    </div>
                </div>

                {/* Right: Dedicated Customization Sidebar Controls */}
                <div className="w-[360px] lg:w-[400px] bg-white dark:bg-[#0c1422] border-l border-slate-200 dark:border-slate-800 shadow-xl flex flex-col shrink-0">
                    <EditorPanel 
                        section={activeSection}
                        adsConfig={adsConfig}
                        onChangeAdsConfig={handleUpdateAdsConfig}
                        allProducts={allProducts}
                    />
                </div>

            </div>

        </div>
    );
};
