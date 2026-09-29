
import React, { useState, useEffect, useMemo } from 'react';
import type { Advertisements, Product, Pack, Category } from '../../types';
import { useToast } from '../ToastContext';
import { SelectableWrapper } from './SelectableWrapper';
import { EditorPanel } from './EditorPanel';
import { SparklesIcon, ArrowsPointingOutIcon, XMarkIcon, PencilIcon } from '../IconComponents';
import { api } from '../../utils/api';

// Front Office Components
import { HeroSection } from '../HeroSection';
import { TrustBadges } from '../TrustBadges';
import { ProductCarousel } from '../ProductCarousel';
import { AudioPromoBanner } from '../AudioPromoBanner';
import { MediumPromoBanner } from '../MediumPromoBanner';
import { ShoppableVideoCarousel } from '../ShoppableVideoCarousel';
import { EditorialMasonry } from '../EditorialMasonry';
import { ProductGridSection } from '../ProductGridSection';
import { VirtualTryOnSection } from '../VirtualTryOnSection';

interface ManageHomePageProps {
    initialAds: Advertisements;
    onSave: (newAds: Advertisements) => void;
    allProducts: Product[];
    allPacks: Pack[];
    allCategories: Category[];
}

export const ManageHomePage: React.FC<ManageHomePageProps> = ({ initialAds, onSave, allProducts, allPacks, allCategories }) => {
    const [adsConfig, setAdsConfig] = useState<Advertisements>(initialAds);
    const [activeSection, setActiveSection] = useState<string>('hero');
    const [isDirty, setIsDirty] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setAdsConfig(initialAds);
    }, [initialAds]);

    const handleUpdateConfig = (sectionKey: string, data: any) => {
        const newConfig = { ...adsConfig };
        
        if (sectionKey === 'hero') newConfig.heroSlides = data;
        else if (sectionKey === 'trustBadges') newConfig.trustBadges = data;
        else if (sectionKey === 'audioPromo') newConfig.audioPromo = data;
        else if (sectionKey === 'promoBanner1') newConfig.promoBanners[0] = data;
        else if (sectionKey === 'promoBanner2') newConfig.promoBanners[1] = data;
        else if (sectionKey === 'shoppableVideos') newConfig.shoppableVideos = data;
        else if (sectionKey === 'editorialCollage') newConfig.editorialCollage = data;
        else if (sectionKey === 'newArrivals') newConfig.newArrivals = data;
        else if (sectionKey === 'summerSelection') newConfig.summerSelection = data;
        else if (sectionKey === 'virtualTryOn') newConfig.virtualTryOn = data;
        else if (sectionKey === 'featuredGrid') newConfig.featuredGrid = data;

        setAdsConfig(newConfig);
        setIsDirty(true);
    };

    const handleSaveClick = async () => {
        try {
            await api.updateAdvertisements(adsConfig);
            onSave(adsConfig);
            setIsDirty(false);
            addToast("Boutique mise à jour avec succès !", "success");
        } catch (error) {
            console.error(error);
            addToast("Erreur de déploiement.", "error");
        }
    };

    const getCurrentSectionData = () => {
        if (activeSection === 'hero') return adsConfig.heroSlides;
        if (activeSection === 'trustBadges') return adsConfig.trustBadges || [];
        if (activeSection === 'audioPromo') return adsConfig.audioPromo;
        if (activeSection === 'promoBanner1') return adsConfig.promoBanners[0];
        if (activeSection === 'promoBanner2') return adsConfig.promoBanners[1];
        if (activeSection === 'shoppableVideos') return adsConfig.shoppableVideos;
        if (activeSection === 'editorialCollage') return adsConfig.editorialCollage;
        if (activeSection === 'newArrivals') return adsConfig.newArrivals || { title: "Nouveautés", productIds: [] };
        if (activeSection === 'summerSelection') return adsConfig.summerSelection || { title: "Sélection d'été", productIds: [] };
        if (activeSection === 'virtualTryOn') return adsConfig.virtualTryOn || { title: "Virtual Try-On", description: "", buttonText: "Découvrir" };
        if (activeSection === 'featuredGrid') return adsConfig.featuredGrid || { title: "Nos Trésors", productIds: [], buttonText: "Voir tout", buttonLink: "#" };
        return null;
    };

    const newArrivalProducts = useMemo(() => {
        if (adsConfig.newArrivals && adsConfig.newArrivals.productIds.length > 0) {
            return allProducts.filter(p => adsConfig.newArrivals!.productIds.includes(p.id));
        }
        return allProducts.slice(0, 8);
    }, [allProducts, adsConfig.newArrivals]);

    const renderSection = (section: string, label: string, content: React.ReactNode, interactive: boolean) => {
        if (interactive) {
            return (
                <div 
                    onClick={() => setActiveSection(section)}
                    className={`relative rounded-[3rem] transition-all duration-500 cursor-pointer ${activeSection === section ? 'ring-8 ring-brand-primary/20 scale-[0.99] shadow-2xl' : 'hover:scale-[1.01]'}`}
                >
                    <div className={`absolute top-10 left-10 z-50 flex items-center gap-3 px-6 py-3 bg-brand-primary text-white rounded-2xl shadow-xl transition-opacity duration-500 ${activeSection === section ? 'opacity-100' : 'opacity-0'}`}>
                        <PencilIcon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                    </div>
                    <div className="pointer-events-none">
                        {content}
                    </div>
                </div>
            );
        }
        return <div>{content}</div>;
    };

    const renderPreviewContent = (interactive: boolean) => {
        return (
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12 space-y-24 bg-white dark:bg-brand-dark transition-colors duration-500">
                {renderSection('hero', 'Hero Banner', <HeroSection slides={adsConfig.heroSlides} />, interactive)}
                {renderSection('trustBadges', 'Badges Confiance', <TrustBadges badges={adsConfig.trustBadges} />, interactive)}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {renderSection('promoBanner1', 'Bannière Gauche', <MediumPromoBanner banner={adsConfig.promoBanners[0]} isPreview allProducts={allProducts} allPacks={allPacks} onPreview={() => {}} />, interactive)}
                    {renderSection('promoBanner2', 'Bannière Droite', <MediumPromoBanner banner={adsConfig.promoBanners[1]} isPreview allProducts={allProducts} allPacks={allPacks} onPreview={() => {}} />, interactive)}
                </div>

                {renderSection('virtualTryOn', 'Section Expertise', <VirtualTryOnSection config={adsConfig.virtualTryOn} />, interactive)}
                
                {renderSection('newArrivals', 'Grille Catalogue', (
                    <ProductCarousel 
                        title={adsConfig.newArrivals?.title || "Sélection Laboratoire"} 
                        products={newArrivalProducts} 
                        onPreview={() => {}} 
                        onNavigateToProductDetail={() => {}} 
                    />
                ), interactive)}
            </div>
        );
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-brand-dark overflow-hidden font-sans">
            
            {/* Toolbar Top */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 z-[60] flex items-center justify-between px-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight">Studio Home Page</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Modification Visuelle en Direct</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                     <button 
                        onClick={() => setIsFullScreen(true)}
                        className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-brand-primary transition-all border border-transparent hover:border-brand-primary/20"
                    >
                        <ArrowsPointingOutIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={handleSaveClick} 
                        disabled={!isDirty}
                        className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl ${isDirty ? 'bg-brand-primary text-white shadow-brand-primary/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        {isDirty ? 'Déployer les Changements' : 'Tout est à jour'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 mt-24">
                {/* Visualizer Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-slate-50/50 dark:bg-black/20">
                    <div className="bg-white dark:bg-brand-dark shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-[4rem] overflow-hidden">
                        {renderPreviewContent(true)}
                    </div>
                </div>

                {/* Editor Sidebar */}
                <div className="w-[450px] bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-white/5 shadow-2xl z-50 flex flex-col flex-shrink-0 animate-slideLeft">
                    <EditorPanel 
                        section={activeSection} 
                        data={getCurrentSectionData()} 
                        onChange={(data) => handleUpdateConfig(activeSection, data)} 
                        allProducts={allProducts} 
                        allCategories={allCategories} 
                        allPacks={allPacks} 
                    />
                </div>
            </div>

            {isFullScreen && (
                <div className="fixed inset-0 z-[100] bg-white dark:bg-brand-dark overflow-y-auto animate-fadeIn">
                    <button 
                        onClick={() => setIsFullScreen(false)}
                        className="fixed top-12 right-12 z-[110] bg-brand-primary text-white p-5 rounded-3xl shadow-2xl hover:scale-110 transition-transform"
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                    {renderPreviewContent(false)}
                </div>
            )}
        </div>
    );
};
