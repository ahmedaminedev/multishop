import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { ShopByGoalSection } from '../ShopByGoalSection';
import { CrossShopSynergy } from '../CrossShopSynergy';
import { Sparkles, Sliders, Layout, ArrowRight, Eye, CheckCircle2, RotateCcw, Maximize2, Minimize2, MoveHorizontal, Monitor, Tablet, Smartphone, GripVertical } from 'lucide-react';

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

    const [activeSection, setActiveSection] = useState<'logo' | 'hero' | 'promoBanner' | 'bestsellers' | 'delivery' | 'footer'>('logo');
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fullscreen Preview states
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    // Drag-to-position Logo states
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const dragStartX = useRef(0);
    const dragStartOffset = useRef(0);

    // Escape key listener to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Interactive Drag listener for navbar logo positioning
    const handleLogoDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        setIsDraggingLogo(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        dragStartX.current = clientX;
        dragStartOffset.current = adsConfig.logoConfig?.navbarOffset || 0;
    };

    useEffect(() => {
        if (!isDraggingLogo) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const delta = clientX - dragStartX.current;
            const newOffset = Math.max(-20, Math.min(350, Math.round(dragStartOffset.current + delta)));
            
            setAdsConfig(prev => ({
                ...prev,
                logoConfig: {
                    ...(prev.logoConfig || {}),
                    navbarOffset: newOffset,
                    navbarPosition: 'custom'
                }
            }));
            setIsDirty(true);
        };

        const handleEnd = () => {
            setIsDraggingLogo(false);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDraggingLogo]);

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

                    <button
                        type="button"
                        onClick={() => setActiveSection('delivery')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeSection === 'delivery'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>Fret Lourd</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('footer')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeSection === 'footer'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>Footer Jour</span>
                    </button>
                </div>

                {/* Save and Fullscreen buttons */}
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(true)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                        title="Voir la page en plein écran en temps réel avant d'enregistrer"
                    >
                        <Maximize2 className="w-4 h-4 text-[#84cc16]" />
                        <span>Aperçu Plein Écran</span>
                    </button>

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
                            <div className="absolute top-2 right-2 z-20 px-2.5 py-1 bg-[#84cc16] text-black text-[10px] font-black uppercase rounded-lg shadow-sm flex items-center gap-1.5">
                                <MoveHorizontal className="w-3 h-3" />
                                <span>Glissez le logo pour fixer sa position ({currentLogoConfig.navbarOffset || 0}px)</span>
                            </div>

                            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between select-none">
                                {/* Interactive Draggable Logo Container */}
                                <div 
                                    onMouseDown={handleLogoDragStart}
                                    onTouchStart={handleLogoDragStart}
                                    style={{
                                        transform: `translateX(${currentLogoConfig.navbarOffset || 0}px)`,
                                        cursor: isDraggingLogo ? 'grabbing' : 'grab'
                                    }}
                                    className={`relative flex items-center p-1 rounded-xl transition-shadow ${
                                        isDraggingLogo 
                                            ? 'ring-2 ring-[#84cc16] bg-[#84cc16]/15 shadow-md' 
                                            : 'hover:ring-1 hover:ring-[#84cc16]/60'
                                    }`}
                                    title="Glissez horizontalement pour fixer la position du logo dans la Navbar"
                                >
                                    <div className="mr-1 text-slate-400 hover:text-[#84cc16] opacity-60 hover:opacity-100 cursor-grab">
                                        <GripVertical className="w-4 h-4" />
                                    </div>

                                    <Logo logoConfig={currentLogoConfig} variant="navbar" />

                                    {/* Floating position indicator */}
                                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white font-mono text-[9px] whitespace-nowrap pointer-events-none transition-opacity ${
                                        isDraggingLogo ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                                    }`}>
                                        Position: {currentLogoConfig.navbarOffset || 0}px
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold pointer-events-none">
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

            {/* Fullscreen Live Preview Modal / HUD */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex flex-col font-sans animate-in fade-in duration-200">
                    
                    {/* Top Floating HUD Bar */}
                    <div className="bg-slate-950/95 text-white border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xl z-30">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#84cc16] text-black flex items-center justify-center font-bold">
                                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xs font-black uppercase tracking-wider text-white">
                                        Aperçu Plein Écran en Temps Réel
                                    </h2>
                                    <span className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse"></span>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    Visualisez le sous-site exactement comme les clients avant d'enregistrer
                                </p>
                            </div>
                        </div>

                        {/* Viewport Switcher */}
                        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setViewportMode('desktop')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewportMode === 'desktop' ? 'bg-[#84cc16] text-black shadow-xs' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Monitor className="w-3.5 h-3.5" />
                                <span>Bureau (100%)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewportMode('tablet')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewportMode === 'tablet' ? 'bg-[#84cc16] text-black shadow-xs' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Tablet className="w-3.5 h-3.5" />
                                <span>Tablette (768px)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewportMode('mobile')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewportMode === 'mobile' ? 'bg-[#84cc16] text-black shadow-xs' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Mobile (420px)</span>
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleSaveClick}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-xl bg-[#84cc16] hover:bg-[#72b012] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsFullscreen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Quitter le plein écran (Échap)"
                            >
                                <Minimize2 className="w-4 h-4" />
                                <span>Quitter (Échap)</span>
                            </button>
                        </div>
                    </div>

                    {/* Viewport Container */}
                    <div className="flex-1 overflow-y-auto bg-slate-950 p-2 sm:p-6 flex justify-center custom-scrollbar">
                        <div 
                            className={`bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-all duration-300 shadow-2xl rounded-2xl overflow-y-auto flex flex-col ${
                                viewportMode === 'mobile' 
                                    ? 'w-[420px] min-h-screen my-auto' 
                                    : viewportMode === 'tablet' 
                                        ? 'w-[768px] min-h-screen my-auto' 
                                        : 'w-full min-h-screen'
                            }`}
                        >
                            {/* Live Navbar with Logo */}
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-xs">
                                <div 
                                    className="flex items-center transition-transform"
                                    style={{ transform: currentLogoConfig.navbarOffset ? `translateX(${currentLogoConfig.navbarOffset}px)` : undefined }}
                                >
                                    <Logo logoConfig={currentLogoConfig} variant="navbar" />
                                </div>
                                <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
                                    <span>Musculation</span>
                                    <span>Cardio</span>
                                    <span>Cross Training</span>
                                    <span>Haltères</span>
                                    <span className="text-[#84cc16] font-black">Promotions</span>
                                </div>
                            </div>

                            {/* Hero */}
                            <HeroSection config={heroConfig} />

                            {/* Category bar */}
                            <CategoryBar onCategoryClick={() => {}} />

                            {/* Goals */}
                            <ShopByGoalSection onSelectGoal={() => {}} />

                            {/* Bestsellers & Right Promo */}
                            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                                            {fitnessHome.bestsellersKicker || 'LES PLUS VENDUS'}
                                        </span>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            {fitnessHome.bestsellersTitle || 'Nos Bestsellers'}
                                        </h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                                    <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {bestsellers.map((product: any) => (
                                            <ProductCard key={product.id} product={product} onNavigateToProductDetail={() => {}} />
                                        ))}
                                    </div>
                                    <div className="xl:col-span-4 relative rounded-2xl overflow-hidden bg-black text-white p-6 shadow-sm min-h-[300px] flex flex-col justify-between"
                                        style={{ backgroundImage: `url('${promoConfig.bgImage || '/src/assets/images/banner_bumper_plates_promo_1790951639841.jpg'}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
                                        <div className="relative z-10">
                                            <span className="inline-block bg-[#84cc16] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded mb-3">
                                                {promoConfig.tag || 'PROMOTION'}
                                            </span>
                                            <h3 className="text-3xl font-black uppercase leading-none">
                                                {promoConfig.title || "JUSQU'À"}<br />
                                                <span className="text-[#84cc16]">{promoConfig.discountHighlight || '-20%'}</span>
                                            </h3>
                                            <p className="text-xs font-bold text-slate-300 uppercase mt-2">
                                                {promoConfig.description || "SUR UNE SÉLECTION D'HALTÈRES ET DISQUES"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* TrustBadges & Daylight Footer */}
                            <Footer logoConfig={currentLogoConfig} advertisements={adsConfig} />
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
};
