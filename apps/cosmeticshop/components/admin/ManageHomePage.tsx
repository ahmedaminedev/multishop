
import React, { useState, useEffect, useMemo } from 'react';
import type { Advertisements, Product, Pack, Category } from '../../types';
import { useToast } from '../ToastContext';
import { SelectableWrapper } from './SelectableWrapper';
import { EditorPanel } from './EditorPanel';
import { SparklesIcon, ArrowsPointingOutIcon, XMarkIcon } from '../IconComponents';
import { api } from '../../utils/api'; // Import API

// Front Office Components
import { HeroSection } from '../HeroSection';
import { TrustBadges } from '../TrustBadges';
import { ProductCarousel } from '../ProductCarousel';
import { AudioPromoBanner } from '../AudioPromoBanner';
import { MediumPromoBanner } from '../MediumPromoBanner';
import { ShoppableVideoCarousel } from '../ShoppableVideoCarousel';
import { EditorialMasonry } from '../EditorialMasonry';
import { ProductGridSection } from '../ProductGridSection';
import { BrandCarousel } from '../BrandCarousel';
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
        // Automatically populate trustBadges with defaults if missing to ensure they are editable
        // This fixes the "il n'ya rien dans Badges de Confiance" issue
        if (!initialAds.trustBadges || initialAds.trustBadges.length === 0) {
            const defaultBadges = [
                { id: 1, title: 'Livraison Rapide', subtitle: 'Sur toute la Tunisie' },
                { id: 2, title: 'Paiement Sécurisé', subtitle: '100% sécurisé' },
                { id: 3, title: 'Service Client', subtitle: 'A votre écoute 7j/7' },
                { id: 4, title: 'Garantie', subtitle: 'Produits authentiques' }
            ];
            setAdsConfig(prev => ({ ...prev, trustBadges: defaultBadges }));
        } else {
            setAdsConfig(initialAds);
        }
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
            // 1. Save to Database
            await api.updateAdvertisements(adsConfig);
            
            // 2. Update Parent State (for immediate UI reflection without reload)
            onSave(adsConfig);
            
            setIsDirty(false);
            addToast("Modifications enregistrées avec succès dans la base de données !", "success");
        } catch (error) {
            console.error(error);
            addToast("Erreur lors de la sauvegarde.", "error");
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
        if (activeSection === 'newArrivals') return adsConfig.newArrivals || { title: "Nouvelles Arrivées", productIds: [] };
        if (activeSection === 'summerSelection') return adsConfig.summerSelection || { title: "Sélection d'été", productIds: [] };
        if (activeSection === 'virtualTryOn') return adsConfig.virtualTryOn || { title: "Virtual Try-On", description: "", buttonText: "Découvrir" };
        if (activeSection === 'featuredGrid') return adsConfig.featuredGrid || { title: "Nos Trésors", productIds: [], buttonText: "Voir tout", buttonLink: "#" };
        return null;
    };

    // Calculate dynamic products for carousels based on config
    const newArrivalProducts = useMemo(() => {
        if (adsConfig.newArrivals && adsConfig.newArrivals.productIds.length > 0) {
            return allProducts.filter(p => adsConfig.newArrivals!.productIds.includes(p.id));
        }
        return allProducts.slice(0, 8); // Fallback
    }, [allProducts, adsConfig.newArrivals]);

    const summerSelectionProducts = useMemo(() => {
        if (adsConfig.summerSelection && adsConfig.summerSelection.productIds.length > 0) {
            return allProducts.filter(p => adsConfig.summerSelection!.productIds.includes(p.id));
        }
        return allProducts.slice(8, 16); // Fallback
    }, [allProducts, adsConfig.summerSelection]);

    const renderSection = (section: string, label: string, content: React.ReactNode, interactive: boolean) => {
        if (interactive) {
            return (
                <SelectableWrapper
                    isActive={activeSection === section}
                    onClick={() => setActiveSection(section)}
                    label={label}
                >
                    {content}
                </SelectableWrapper>
            );
        }
        return <div>{content}</div>;
    };

    const renderPreviewContent = (interactive: boolean) => {
        return (
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-[#FAFAFA] dark:bg-gray-950 min-h-screen">
                {renderSection('hero', 'Carrousel Principal', <HeroSection slides={adsConfig.heroSlides} />, interactive)}
                
                <div className="my-8">
                    {renderSection('trustBadges', 'Badges de Confiance', <TrustBadges badges={adsConfig.trustBadges} />, interactive)}
                </div>

                <div className="my-12">
                    {renderSection('newArrivals', 'Carrousel Nouvelles Arrivées', (
                        <ProductCarousel 
                            title={adsConfig.newArrivals?.title || "Nouvelles Arrivées"} 
                            products={newArrivalProducts} 
                            onPreview={() => {}} 
                            onNavigateToProductDetail={() => {}} 
                        />
                    ), interactive)}
                </div>

                {renderSection('audioPromo', 'Bannière Audio', <AudioPromoBanner ads={adsConfig.audioPromo} />, interactive)}

                {/* Editorial Product List Placeholder - Could be made editable in future */}
                <div className="my-16 text-center text-gray-400 italic border-y py-4">
                    [Liste Produits "Accessoires" Automatique]
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                    {renderSection('promoBanner1', 'Bannière Gauche', <MediumPromoBanner banner={adsConfig.promoBanners[0]} isPreview allProducts={allProducts} allPacks={allPacks} onPreview={() => {}} />, interactive)}
                    {renderSection('promoBanner2', 'Bannière Droite', <MediumPromoBanner banner={adsConfig.promoBanners[1]} isPreview allProducts={allProducts} allPacks={allPacks} onPreview={() => {}} />, interactive)}
                </div>

                {renderSection('shoppableVideos', 'Vidéos Shopping (Reels)', <ShoppableVideoCarousel videos={adsConfig.shoppableVideos || []} isPreview />, interactive)}

                {renderSection('editorialCollage', 'Collage Éditorial', <EditorialMasonry items={adsConfig.editorialCollage || []} isPreview />, interactive)}

                <div className="my-12">
                    {renderSection('summerSelection', 'Carrousel Sélection Été', (
                        <ProductCarousel 
                            title={adsConfig.summerSelection?.title || "Sélection d'été"} 
                            products={summerSelectionProducts} 
                            onPreview={() => {}} 
                            onNavigateToProductDetail={() => {}} 
                        />
                    ), interactive)}
                </div>

                <div className="my-16">
                    {renderSection('virtualTryOn', 'Bloc Virtual Try-On', <VirtualTryOnSection config={adsConfig.virtualTryOn} />, interactive)}
                </div>

                {renderSection('featuredGrid', 'Grille Produits (Sélection)', (
                    <ProductGridSection 
                        allProducts={allProducts} 
                        onPreview={() => {}} 
                        onNavigateToProductDetail={() => {}} 
                        config={adsConfig.featuredGrid}
                    />
                ), interactive)}
                
                <div className="my-12 text-center text-gray-400 italic">
                    [Carrousel Marques Automatique]
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-100 dark:bg-gray-900 relative">
            {/* Top Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-rose-500" />
                        Éditeur Page d'Accueil
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gérez vos bannières et contenus marketing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsFullScreen(true)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                        title="Aperçu Plein Écran"
                    >
                        <ArrowsPointingOutIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleSaveClick} 
                        disabled={!isDirty}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-md flex items-center gap-2 ${
                            isDirty 
                            ? 'bg-rose-600 text-white hover:bg-rose-700 transform hover:scale-105' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isDirty ? 'Enregistrer les modifications' : 'Tout est sauvegardé'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: Live Preview */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <div className="bg-[#FAFAFA] dark:bg-gray-950 rounded-xl shadow-2xl min-h-full border border-gray-200 dark:border-gray-800 pointer-events-auto">
                        {renderPreviewContent(true)}
                    </div>
                </div>

                {/* Right: Editor Panel */}
                <div className="w-[350px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-10 flex flex-col flex-shrink-0">
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

            {/* Fullscreen Overlay */}
            {isFullScreen && (
                <div className="fixed inset-0 z-[9999] bg-[#FAFAFA] dark:bg-gray-950 overflow-y-auto animate-fadeIn">
                    <div className="fixed top-6 right-6 z-[10000]">
                        <button 
                            onClick={() => setIsFullScreen(false)}
                            className="flex items-center gap-2 bg-black/80 hover:bg-black text-white px-5 py-3 rounded-full shadow-2xl backdrop-blur-md transition-all hover:scale-105"
                        >
                            <XMarkIcon className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">Fermer l'aperçu</span>
                        </button>
                    </div>
                    <div className="w-full">
                        {renderPreviewContent(false)}
                    </div>
                </div>
            )}
        </div>
    );
};
