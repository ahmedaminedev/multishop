import React, { useState, useEffect, useRef } from 'react';
import type { Advertisements, Product, Pack, Category, Store, Promotion, Brand, LogoConfig } from '../../types';
import { Logo } from '../Logo';
import { Header } from '../Header';
import { NavBar } from '../NavBar';
import { HeroSection } from '../HeroSection';
import { CategoryBar } from '../CategoryBar';
import { ShopByGoalSection } from '../ShopByGoalSection';
import { ProductCard } from '../ProductCard';
import { CrossShopSynergy } from '../CrossShopSynergy';
import { TrustBadges } from '../TrustBadges';
import { Footer } from '../Footer';
import { 
    Maximize2, 
    Minimize2, 
    Monitor, 
    Tablet, 
    Smartphone, 
    GripVertical, 
    MoveHorizontal, 
    CheckCircle2, 
    Home, 
    ShoppingBag, 
    Layers, 
    Sparkles, 
    Store as StoreIcon, 
    Phone, 
    X, 
    Search, 
    SlidersHorizontal,
    ArrowRight,
    MapPin,
    Mail,
    Clock,
    Flame,
    RotateCcw
} from 'lucide-react';
import { api } from '../../utils/api';

export type SubsitePreviewPage = 'home' | 'products' | 'packs' | 'promotions' | 'stores' | 'contact';

interface SubsiteLiveFullscreenModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPage?: SubsitePreviewPage;
    products: Product[];
    categories: Category[];
    packs?: Pack[];
    promotions?: Promotion[];
    stores?: Store[];
    brands?: Brand[];
    advertisements: Advertisements;
    onUpdateLogoOffset?: (newOffset: number) => void;
    onSaveAdvertisements?: (newAds: Advertisements) => Promise<void> | void;
}

export const SubsiteLiveFullscreenModal: React.FC<SubsiteLiveFullscreenModalProps> = ({
    isOpen,
    onClose,
    initialPage = 'home',
    products = [],
    categories = [],
    packs = [],
    promotions = [],
    stores = [],
    brands = [],
    advertisements,
    onUpdateLogoOffset,
    onSaveAdvertisements
}) => {
    const [currentPage, setCurrentPage] = useState<SubsitePreviewPage>(initialPage);
    const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isSaving, setIsSaving] = useState(false);
    const [savedNotice, setSavedNotice] = useState<string | null>(null);

    // Filter states for Products sub-page
    const [selectedCategory, setSelectedCategory] = useState<string>('Tous les produits');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [priceRange, setPriceRange] = useState<number>(3000);

    // Logo drag states
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const dragStartX = useRef(0);
    const dragStartOffset = useRef(0);
    const [localOffset, setLocalOffset] = useState<number>(advertisements?.logoConfig?.navbarOffset || 0);

    // Keep local offset in sync with props
    useEffect(() => {
        if (advertisements?.logoConfig?.navbarOffset !== undefined) {
            setLocalOffset(advertisements.logoConfig.navbarOffset);
        }
    }, [advertisements?.logoConfig?.navbarOffset]);

    // Update currentPage if initialPage changes when opening
    useEffect(() => {
        if (isOpen && initialPage) {
            setCurrentPage(initialPage);
        }
    }, [isOpen, initialPage]);

    // Handle Escape key to close fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Interactive Drag listener for navbar logo positioning
    const handleLogoDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if ('preventDefault' in e) e.preventDefault();
        e.stopPropagation();
        setIsDraggingLogo(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        dragStartX.current = clientX;
        dragStartOffset.current = localOffset;
    };

    useEffect(() => {
        if (!isDraggingLogo) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const delta = clientX - dragStartX.current;
            const newOffset = Math.max(0, Math.min(1000, Math.round(dragStartOffset.current + delta)));
            setLocalOffset(newOffset);
        };

        const handleEnd = () => {
            setIsDraggingLogo(false);
            if (onUpdateLogoOffset) {
                onUpdateLogoOffset(localOffset);
            }
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
    }, [isDraggingLogo, localOffset, onUpdateLogoOffset]);

    if (!isOpen) return null;

    const currentLogoConfig: LogoConfig = {
        ...(advertisements?.logoConfig || {}),
        navbarOffset: localOffset
    };

    const fitnessHome = advertisements?.fitnessHome || {};
    const heroConfig = fitnessHome?.hero;
    const promoConfig = fitnessHome?.promoBanner || {};

    const handleSave = async () => {
        if (!onSaveAdvertisements) return;
        setIsSaving(true);
        try {
            const updatedAds: Advertisements = {
                ...advertisements,
                logoConfig: currentLogoConfig
            };
            await onSaveAdvertisements(updatedAds);
            setSavedNotice("Modifications et position du logo enregistrées !");
            setTimeout(() => setSavedNotice(null), 3000);
        } catch (err) {
            console.error("Erreur enregistrement", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Filter products for the Products view
    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'Tous les produits' || p.category === selectedCategory;
        const matchesSearch = !searchQuery.trim() || 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesPrice = p.price <= priceRange;
        return matchesCategory && matchesSearch && matchesPrice;
    });

    const bestsellers = products.slice(0, 4);

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col font-sans select-none animate-in fade-in duration-200">
            
            {/* TOP FLOATING HUD BAR */}
            <div className="bg-[#070b13] text-white border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xl z-50">
                
                {/* Title & Live Status */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#84cc16] text-black flex items-center justify-center font-bold shadow-md shadow-[#84cc16]/20">
                        <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xs font-black uppercase tracking-wider text-white">
                                Aperçu Plein Écran Sous-Site
                            </h2>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#84cc16]/20 text-[#84cc16] text-[10px] font-black uppercase border border-[#84cc16]/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse"></span>
                                Temps Réel
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                            Naviguez dans les pages pour vérifier vos modifications en direct avant validation
                        </p>
                    </div>
                </div>

                {/* Sub-Site Page Switcher Tabs */}
                <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl overflow-x-auto max-w-full">
                    <button
                        type="button"
                        onClick={() => setCurrentPage('home')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            currentPage === 'home'
                                ? 'bg-[#84cc16] text-black shadow-xs font-black'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Home className="w-3.5 h-3.5" />
                        <span>Accueil</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCurrentPage('products')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            currentPage === 'products'
                                ? 'bg-[#84cc16] text-black shadow-xs font-black'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Boutique ({products.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCurrentPage('packs')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            currentPage === 'packs'
                                ? 'bg-[#84cc16] text-black shadow-xs font-black'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Packs ({packs.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCurrentPage('promotions')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            currentPage === 'promotions'
                                ? 'bg-[#84cc16] text-black shadow-xs font-black'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Promotions</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCurrentPage('stores')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            currentPage === 'stores'
                                ? 'bg-[#84cc16] text-black shadow-xs font-black'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <StoreIcon className="w-3.5 h-3.5" />
                        <span>Magasins ({stores.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCurrentPage('contact')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            currentPage === 'contact'
                                ? 'bg-[#84cc16] text-black shadow-xs font-black'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Contact</span>
                    </button>
                </div>

                {/* Viewport Mode Switcher */}
                <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setViewportMode('desktop')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewportMode === 'desktop' ? 'bg-[#84cc16] text-black' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Vue Écran Ordinateur (100%)"
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Bureau</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setViewportMode('tablet')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewportMode === 'tablet' ? 'bg-[#84cc16] text-black' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Vue Tablette (768px)"
                    >
                        <Tablet className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tablette</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setViewportMode('mobile')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewportMode === 'mobile' ? 'bg-[#84cc16] text-black' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Vue Mobile (420px)"
                    >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Mobile</span>
                    </button>
                </div>

                {/* Right Actions: Save & Close */}
                <div className="flex items-center gap-2">
                    {onSaveAdvertisements && (
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-3.5 py-1.5 rounded-xl bg-[#84cc16] hover:bg-[#72b012] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSaving ? 'Enregistrement...' : 'Valider'}</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Quitter le plein écran (Touche Échap)"
                    >
                        <Minimize2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Quitter</span>
                        <span className="text-[10px] text-slate-500 font-mono">[Échap]</span>
                    </button>
                </div>

            </div>

            {/* Saved Notification Toast */}
            {savedNotice && (
                <div className="absolute top-16 right-6 z-[210] p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savedNotice}</span>
                </div>
            )}

            {/* VIEWPORT SCROLL AREA */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-2 sm:p-6 flex justify-center custom-scrollbar">
                
                <div 
                    className={`bg-white dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 transition-all duration-300 shadow-2xl rounded-2xl overflow-y-auto flex flex-col ${
                        viewportMode === 'mobile' 
                            ? 'w-[420px] min-h-screen my-auto ring-8 ring-slate-800' 
                            : viewportMode === 'tablet' 
                                ? 'w-[768px] min-h-screen my-auto ring-8 ring-slate-800' 
                                : 'w-full min-h-screen'
                    }`}
                >

                    {/* REAL STORE HEADER WITH DRAGGABLE LOGO */}
                    <div className="sticky top-0 z-40 shadow-xs relative">
                        <div className="absolute top-2 right-4 z-50 px-2.5 py-1 bg-[#84cc16] text-black text-[10px] font-black uppercase rounded-lg shadow-md flex items-center gap-1.5 pointer-events-none">
                            <MoveHorizontal className="w-3 h-3" />
                            <span>Glissez le logo librement ({localOffset}px)</span>
                        </div>
                        <Header 
                            user={null}
                            onNavigateToLogin={() => {}}
                            isLoggedIn={false}
                            onLogout={() => {}}
                            onNavigateToFavorites={() => {}}
                            onNavigateToProfile={() => {}}
                            onNavigateToOrderHistory={() => {}}
                            allProducts={products}
                            allPacks={packs}
                            allCategories={categories}
                            onNavigateToCategory={(cat) => { setSelectedCategory(cat); setCurrentPage('products'); }}
                            onNavigateToProductDetail={() => {}}
                            onNavigateToCompare={() => {}}
                            advertisements={advertisements}
                            logoConfig={currentLogoConfig}
                            isDraggableLogo={true}
                            onLogoDragStart={handleLogoDragStart}
                            isDraggingLogo={isDraggingLogo}
                        />

                        {/* REAL STORE DARK NAVIGATION BAR */}
                        <NavBar 
                            onNavigateHome={() => setCurrentPage('home')}
                            onNavigateToCategory={(cat) => { setSelectedCategory(cat); setCurrentPage('products'); }}
                            onNavigateToPacks={() => setCurrentPage('packs')}
                            onNavigateToPromotions={() => setCurrentPage('promotions')}
                            onNavigateToBlog={() => {}}
                            onNavigateToNews={() => {}}
                            onNavigateToContact={() => setCurrentPage('contact')}
                        />
                    </div>

                    {/* SUB-SITE PAGE RENDERER */}
                    <div className="flex-1">
                        
                        {/* 1. ACCUEIL */}
                        {currentPage === 'home' && (
                            <div className="space-y-6">
                                <HeroSection config={heroConfig} />
                                <CategoryBar onCategoryClick={(cat) => { setSelectedCategory(cat); setCurrentPage('products'); }} />
                                <ShopByGoalSection onSelectGoal={() => setCurrentPage('products')} />

                                {/* Bestsellers & Right Promo */}
                                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                                                {fitnessHome.bestsellersKicker || 'LES PLUS VENDUS'}
                                            </span>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                {fitnessHome.bestsellersTitle || 'Nos Bestsellers'}
                                            </h2>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setCurrentPage('products')}
                                            className="text-xs font-bold text-[#84cc16] flex items-center gap-1 hover:underline cursor-pointer"
                                        >
                                            <span>Voir tout le catalogue ({products.length})</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
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

                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                                    <CrossShopSynergy />
                                </div>
                            </div>
                        )}

                        {/* 2. BOUTIQUE / TOUS LES PRODUITS */}
                        {currentPage === 'products' && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
                                
                                {/* Breadcrumb & Title */}
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                        <button onClick={() => setCurrentPage('home')} className="hover:text-white cursor-pointer">Accueil</button>
                                        <span>/</span>
                                        <span className="text-[#84cc16] font-bold">Catalogue des Produits</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white">
                                                Équipement Professionnel & Accessoires
                                            </h1>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {filteredProducts.length} articles disponibles en temps réel (incluant vos ajouts et modifications récentes)
                                            </p>
                                        </div>

                                        {/* Search & Filter Inputs */}
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Filtrer en direct..."
                                                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 pl-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                                                />
                                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Pills Bar */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                                    {['Tous les produits', ...categories.map(c => c.name)].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                                selectedCategory === cat
                                                    ? 'bg-[#84cc16] text-black shadow-xs font-black'
                                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Products Grid */}
                                {filteredProducts.length === 0 ? (
                                    <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <p className="text-sm font-bold text-slate-500">Aucun produit ne correspond à ces critères.</p>
                                        <button 
                                            onClick={() => { setSelectedCategory('Tous les produits'); setSearchQuery(''); }}
                                            className="mt-3 px-4 py-2 bg-[#84cc16] text-black text-xs font-black rounded-xl cursor-pointer"
                                        >
                                            Réinitialiser les filtres
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {filteredProducts.map((product) => (
                                            <ProductCard 
                                                key={product.id} 
                                                product={product} 
                                                onNavigateToProductDetail={() => {}} 
                                            />
                                        ))}
                                    </div>
                                )}

                            </div>
                        )}

                        {/* 3. PACKS ELITE */}
                        {currentPage === 'packs' && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
                                <div>
                                    <span className="text-xs font-black uppercase text-[#84cc16] tracking-wider">Offres Clé en Main</span>
                                    <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white">
                                        Packs Entraînement & Kits Complets
                                    </h1>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Packs optimisés avec remises groupées configurées dans votre panneau d'administration.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {packs.map((pack) => {
                                        const savings = pack.oldPrice ? Math.round(((pack.oldPrice - pack.price) / pack.oldPrice) * 100) : 0;
                                        return (
                                            <div 
                                                key={pack.id}
                                                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
                                            >
                                                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <img 
                                                        src={pack.image} 
                                                        alt={pack.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {savings > 0 && (
                                                        <span className="absolute top-3 left-3 bg-[#84cc16] text-black font-black text-xs px-2.5 py-1 rounded-xl shadow-md">
                                                            ÉCONOMISEZ {savings}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#84cc16]">Pack Complet</span>
                                                        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-snug">
                                                            {pack.name}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                                            {pack.description}
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                        <div>
                                                            {pack.oldPrice && (
                                                                <span className="text-xs text-slate-400 line-through block">
                                                                    {pack.oldPrice.toFixed(2)} DT
                                                                </span>
                                                            )}
                                                            <span className="text-xl font-black text-[#84cc16]">
                                                                {pack.price.toFixed(2)} DT
                                                            </span>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            className="px-4 py-2 bg-[#84cc16] hover:bg-[#72b012] text-black font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer"
                                                        >
                                                            Ajouter au panier
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 4. PROMOTIONS */}
                        {currentPage === 'promotions' && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
                                <div>
                                    <span className="text-xs font-black uppercase text-[#84cc16] tracking-wider">Promotions & Bonnes Affaires</span>
                                    <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white">
                                        Offres Spéciales & Réductions Immédiates
                                    </h1>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {promotions.map((promo) => (
                                        <div 
                                            key={promo.id} 
                                            className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 border border-slate-800 shadow-md flex flex-col justify-between min-h-[220px]"
                                            style={promo.image ? { backgroundImage: `url('${promo.image}')`, backgroundSize: 'cover' } : undefined}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
                                            <div className="relative z-10">
                                                <span className="px-2.5 py-1 rounded-lg bg-[#84cc16] text-black font-black text-[10px] uppercase inline-block mb-3">
                                                    {promo.badge || 'PROMOTION'}
                                                </span>
                                                <h3 className="text-2xl font-black uppercase text-white">
                                                    {promo.title}
                                                </h3>
                                                <p className="text-xs text-slate-300 mt-2 max-w-sm">
                                                    {promo.description}
                                                </p>
                                            </div>
                                            <div className="relative z-10 pt-4 flex items-center justify-between">
                                                <span className="text-2xl font-black text-[#84cc16]">
                                                    {promo.discount ? `-${promo.discount}%` : 'PRIX CHOC'}
                                                </span>
                                                <button 
                                                    onClick={() => setCurrentPage('products')}
                                                    className="px-4 py-2 bg-white text-black font-black text-xs uppercase rounded-xl hover:bg-[#84cc16] transition-colors cursor-pointer"
                                                >
                                                    En profiter
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. MAGASINS & SHOWROOMS */}
                        {currentPage === 'stores' && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
                                <div>
                                    <span className="text-xs font-black uppercase text-[#84cc16] tracking-wider">Réseau Physique</span>
                                    <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white">
                                        Nos Showrooms & Magasins en Tunisie
                                    </h1>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Venez tester notre matériel de musculation et cardio dans nos showrooms.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {stores.map((store) => (
                                        <div 
                                            key={store.id} 
                                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg transition-all space-y-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-[#84cc16]/10 text-[#84cc16] flex items-center justify-center font-bold">
                                                    <StoreIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                                                        {store.name}
                                                    </h3>
                                                    <span className="text-[11px] text-slate-400">Showroom Officiel</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-[#84cc16] shrink-0 mt-0.5" />
                                                    <span>{store.address}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-[#84cc16] shrink-0" />
                                                    <span className="font-bold">{store.phone || '+216 71 888 999'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-[#84cc16] shrink-0" />
                                                    <span>{store.hours || 'Du Lundi au Samedi: 9h - 19h'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 6. CONTACT & HOTLINE */}
                        {currentPage === 'contact' && (
                            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
                                <div>
                                    <span className="text-xs font-black uppercase text-[#84cc16] tracking-wider">Service Client & Devis</span>
                                    <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white">
                                        Contactez Nos Spécialistes Fitness
                                    </h1>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Disponible 7j/7 pour conseils techniques, aménagement de salles et suivi de commande.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                                        <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 text-[#84cc16] flex items-center justify-center font-bold">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Hotline Directe</h3>
                                        <p className="text-sm font-mono font-black text-[#84cc16]">{fitnessHome.footerPhone || '+216 71 888 999'}</p>
                                        <p className="text-[11px] text-slate-400">Lun-Sam 8h30 - 19h30</p>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                                        <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 text-[#84cc16] flex items-center justify-center font-bold">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Email Professionnel</h3>
                                        <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{fitnessHome.footerEmail || 'contact@fitnessshop.tn'}</p>
                                        <p className="text-[11px] text-slate-400">Réponse sous 2 heures ouvrées</p>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                                        <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 text-[#84cc16] flex items-center justify-center font-bold">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Showroom Central</h3>
                                        <p className="text-xs text-slate-800 dark:text-slate-200">{fitnessHome.footerAddress || 'Zone Industrielle La Charguia II, Tunis'}</p>
                                        <p className="text-[11px] text-slate-400">Parking gratuit réservé</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* DAYLIGHT TRUST BADGES & DAYLIGHT FOOTER (ON ALL SUB-SITE PAGES) */}
                    <div className="mt-12">
                        <Footer 
                            logoConfig={currentLogoConfig} 
                            advertisements={advertisements} 
                        />
                    </div>

                </div>

            </div>

        </div>
    );
};
