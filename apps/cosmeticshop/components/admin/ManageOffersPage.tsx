
import React, { useState, useEffect, useMemo } from 'react';
import type { OffersPageConfig, Product } from '../../types';
import { api } from '../../utils/api';
import { useToast } from '../ToastContext';
import { SelectableWrapper } from './SelectableWrapper';
import { EditorPanel } from './EditorPanel';
import { GlowRoutinePromo, EssentialsBanner, DealOfTheDay } from '../PromotionsPage';
import { ProductCard } from '../ProductCard';
import { SparklesIcon, ArrowsPointingOutIcon, XMarkIcon } from '../IconComponents';

interface ManageOffersPageProps {
    allProducts: Product[];
}

export type SectionType = 'header' | 'glowRoutine' | 'essentials' | 'dealOfTheDay' | 'allOffersGrid';

export const ManageOffersPage: React.FC<ManageOffersPageProps> = ({ allProducts }) => {
    const [config, setConfig] = useState<OffersPageConfig | null>(null);
    const [activeSection, setActiveSection] = useState<SectionType>('header');
    const [isDirty, setIsDirty] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        api.getOffersConfig().then(setConfig).catch(err => {
            console.error(err);
            addToast("Erreur lors du chargement de la configuration.", "error");
        });
    }, []);

    const handleUpdateConfig = (section: SectionType, data: any) => {
        if (!config) return;
        setConfig({ ...config, [section]: data });
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!config) return;
        try {
            await api.updateOffersConfig(config);
            setIsDirty(false);
            addToast("Modifications enregistrées avec succès !", "success");
        } catch (error) {
            console.error(error);
            addToast("Erreur lors de la sauvegarde.", "error");
        }
    };

    // Previews for Grid
    const gridPreviewProducts = useMemo(() => {
        if (!config || !config.allOffersGrid) return [];
        if (config.allOffersGrid.useManualSelection) {
            return allProducts.filter(p => config.allOffersGrid.manualProductIds?.includes(p.id)).slice(0, 4);
        }
        return allProducts.filter(p => p.promo).slice(0, 4);
    }, [config, allProducts]);

    const dealProduct = useMemo(() => {
        if (config && config.dealOfTheDay && config.dealOfTheDay.productId) {
            return allProducts.find(p => p.id === config.dealOfTheDay.productId) || allProducts[0];
        }
        return allProducts[0];
    }, [config, allProducts]);

    if (!config) return <div className="p-8 text-center">Chargement de l'éditeur...</div>;

    const renderSection = (section: SectionType, label: string, content: React.ReactNode, interactive: boolean) => {
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
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {renderSection('header', 'En-tête', (
                    <div className="text-center max-w-3xl mx-auto mt-12 mb-16">
                        <span className="text-rose-500 font-bold uppercase tracking-[0.25em] text-xs mb-3 block">Sélection Exclusive</span>
                        <h1 
                            className="text-4xl md:text-6xl font-serif mb-6 transition-colors duration-300" 
                            dangerouslySetInnerHTML={{ __html: config.header.title }}
                        >
                        </h1>
                        <p 
                            className="font-light text-lg leading-relaxed transition-colors duration-300" 
                            dangerouslySetInnerHTML={{ __html: config.header.subtitle }}
                        >
                        </p>
                    </div>
                ), interactive)}

                <div className="space-y-12 mb-20">
                    {renderSection('glowRoutine', 'Bloc Glow Routine', (
                        <GlowRoutinePromo config={config.glowRoutine} />
                    ), interactive)}
                    
                    {renderSection('essentials', 'Bloc Essentials', (
                        <EssentialsBanner config={config.essentials} />
                    ), interactive)}
                </div>

                {renderSection('dealOfTheDay', 'Offre du Jour', (
                    <div className={interactive ? "pointer-events-none" : ""}>
                        <DealOfTheDay 
                            product={dealProduct} 
                            onPreview={() => {}} 
                            onNavigateToProductDetail={() => {}} 
                            titleColor={config.dealOfTheDay.titleColor}
                            subtitleColor={config.dealOfTheDay.subtitleColor}
                        />
                    </div>
                ), interactive)}

                {renderSection('allOffersGrid', 'Grille des Produits', (
                    <div className="mt-12">
                        <div className="flex items-baseline gap-2 mb-6">
                            <h2 
                                className="text-xl font-serif font-bold" 
                                dangerouslySetInnerHTML={{ __html: config.allOffersGrid?.title || "Toutes les offres" }}
                            >
                            </h2>
                            {interactive && <span className="text-sm text-gray-500 font-light">(Aperçu partiel)</span>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {gridPreviewProducts.map(p => (
                                <ProductCard key={p.id} product={p} onPreview={() => {}} onNavigateToProductDetail={() => {}} />
                            ))}
                        </div>
                        {interactive && config.allOffersGrid.useManualSelection && (
                            <div className="mt-4 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded text-center font-bold">
                                Mode Sélection Manuelle Actif ({config.allOffersGrid.manualProductIds.length} produits)
                            </div>
                        )}
                    </div>
                ), interactive)}
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
                        Éditeur Visuel des Offres
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cliquez sur une section à gauche pour la modifier à droite.</p>
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
                        onClick={handleSave} 
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
                {/* Left: Live Preview Area (Standard) */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <div className="bg-[#FAFAFA] dark:bg-gray-950 rounded-xl shadow-2xl min-h-full border border-gray-200 dark:border-gray-800 pointer-events-auto">
                        {renderPreviewContent(true)}
                    </div>
                </div>

                {/* Right: Editor Panel (Sticky) */}
                <div className="w-[350px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-10 flex flex-col flex-shrink-0">
                    <EditorPanel 
                        section={activeSection}
                        data={config[activeSection]}
                        onChange={(data) => handleUpdateConfig(activeSection, data)}
                        allProducts={allProducts}
                    />
                </div>
            </div>

            {/* True Full Screen Overlay (Portal-like behavior via high z-index and fixed positioning) */}
            {isFullScreen && (
                <div className="fixed inset-0 z-[9999] bg-[#FAFAFA] dark:bg-gray-950 overflow-y-auto animate-fadeIn">
                    {/* Sticky Exit Button */}
                    <div className="fixed top-6 right-6 z-[10000]">
                        <button 
                            onClick={() => setIsFullScreen(false)}
                            className="flex items-center gap-2 bg-black/80 hover:bg-black text-white px-5 py-3 rounded-full shadow-2xl backdrop-blur-md transition-all hover:scale-105"
                        >
                            <XMarkIcon className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">Fermer l'aperçu</span>
                        </button>
                    </div>
                    
                    {/* Pure Content Render */}
                    <div className="w-full">
                        {renderPreviewContent(false)}
                    </div>
                </div>
            )}
        </div>
    );
};
