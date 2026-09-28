import React, { useState, useEffect, useMemo } from 'react';
import type { Advertisements, Product, Pack, Category } from '../../types';
import { useToast } from '../ToastContext';
import { SelectableWrapper } from './SelectableWrapper';
import { EditorPanel } from './EditorPanel';
import { SparklesIcon, ArrowsPointingOutIcon, XMarkIcon } from '../IconComponents';
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
            await api.updateAdvertisements(adsConfig);
            onSave(adsConfig);
            setIsDirty(false);
            addToast("Déploiement Front-Office réussi !", "success");
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

    const newArrivalProducts = useMemo(() => {
        if (adsConfig.newArrivals && adsConfig.newArrivals.productIds.length > 0) {
            return allProducts.filter(p => adsConfig.newArrivals!.productIds.includes(p.id));
        }
        return allProducts.slice(0, 8);
    }, [allProducts, adsConfig.newArrivals]);

    const summerSelectionProducts = useMemo(() => {
        if (adsConfig.summerSelection && adsConfig.summerSelection.productIds.length > 0) {
            return allProducts.filter(p => adsConfig.summerSelection!.productIds.includes(p.id));
        }
        return allProducts.slice(8, 16);
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
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-white dark:bg-[#050505] min-h-screen transition-colors duration-300">
                {renderSection('hero', 'Carrousel Principal', <HeroSection slides={adsConfig.heroSlides} />, interactive)}
                <div className="my-8">
                    {renderSection('trustBadges', 'Badges de Confiance', <TrustBadges badges={adsConfig.trustBadges} />, interactive)}
                </div>
                <div className="my-12">
                    {renderSection('newArrivals', 'Carrousel Nouveautés', (
                        <ProductCarousel 
                            title={adsConfig.newArrivals?.title || "Nouvelles Arrivées"} 
                            products={newArrivalProducts} 
                            onPreview={() => {}} 
                            onNavigateToProductDetail={() => {}} 
                        />
                    ), interactive)}
                </div>
                {renderSection('audioPromo', 'Bannière Audio', <AudioPromoBanner ads={adsConfig.audioPromo} />, interactive)}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                    {renderSection('promoBanner1', 'Bannière Gauche', <MediumPromoBanner banner={adsConfig.promoBanners[0]} isPreview allProducts={allProducts} allPacks={allPacks} onPreview={() => {}} />, interactive)}
                    {renderSection('promoBanner2', 'Bannière Droite', <MediumPromoBanner banner={adsConfig.promoBanners[1]} isPreview allProducts={allProducts} allPacks={allPacks} onPreview={() => {}} />, interactive)}
                </div>
                {renderSection('shoppableVideos', 'Vidéos Shopping', <ShoppableVideoCarousel videos={adsConfig.shoppableVideos || []} isPreview />, interactive)}
                {renderSection('editorialCollage', 'Collage Éditorial', <EditorialMasonry items={adsConfig.editorialCollage || []} isPreview />, interactive)}
                <div className="my-12">
                    {renderSection('summerSelection', 'Carrousel Été', (
                        <ProductCarousel title={adsConfig.summerSelection?.title || "Sélection d'été"} products={summerSelectionProducts} onPreview={() => {}} onNavigateToProductDetail={() => {}} />
                    ), interactive)}
                </div>
                <div className="my-16">
                    {renderSection('virtualTryOn', 'Bloc Interactif', <VirtualTryOnSection config={adsConfig.virtualTryOn} />, interactive)}
                </div>
                {renderSection('featuredGrid', 'Grille Produits', (
                    <ProductGridSection allProducts={allProducts} onPreview={() => {}} onNavigateToProductDetail={() => {}} config={adsConfig.featuredGrid}/>
                ), interactive)}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-100 dark:bg-[#050505] relative text-gray-900 dark:text-white transition-colors duration-300">
            <div className="bg-white dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center shadow-md z-20 flex-shrink-0 transition-colors">
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white italic uppercase tracking-wider flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-black dark:text-brand-neon" />
                        Éditeur Accueil
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsFullScreen(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors border border-gray-200 dark:border-gray-700" title="Aperçu Plein Écran"><ArrowsPointingOutIcon className="w-5 h-5" /></button>
                    <button onClick={handleSaveClick} disabled={!isDirty} className={`px-6 py-2 font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2 ${isDirty ? 'bg-black dark:bg-brand-neon text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white skew-x-[-12deg]' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed skew-x-[-12deg]'}`}><span className="skew-x-[12deg]">{isDirty ? 'DÉPLOYER' : 'SAUVEGARDÉ'}</span></button>
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-black">
                    <div className="bg-white dark:bg-[#050505] min-h-full pointer-events-auto">
                        {renderPreviewContent(true)}
                    </div>
                </div>
                <div className="w-[380px] bg-white dark:bg-[#111] border-l border-gray-200 dark:border-gray-800 shadow-xl z-10 flex flex-col flex-shrink-0 transition-colors">
                    <EditorPanel section={activeSection} data={getCurrentSectionData()} onChange={(data) => handleUpdateConfig(activeSection, data)} allProducts={allProducts} allCategories={allCategories} allPacks={allPacks} />
                </div>
            </div>
            {isFullScreen && (
                <div className="fixed inset-0 z-[9999] bg-white dark:bg-black overflow-y-auto animate-fadeIn">
                    <div className="fixed top-6 right-6 z-[10000]"><button onClick={() => setIsFullScreen(false)} className="flex items-center gap-2 bg-black dark:bg-brand-neon text-white dark:text-black px-5 py-3 rounded-full shadow-2xl font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-white transition-colors"><XMarkIcon className="w-5 h-5" /><span>Fermer</span></button></div>
                    <div className="w-full">{renderPreviewContent(false)}</div>
                </div>
            )}
        </div>
    );
};
