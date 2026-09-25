
import React, { useState, useEffect, useMemo } from 'react';
import type { OffersPageConfig, Product } from '../../types';
import { api } from '../../utils/api';
import { useToast } from '../ToastContext';
import { SelectableWrapper } from './SelectableWrapper';
import { EditorPanel } from './EditorPanel';
import { PerformanceSpotlight, MuscleBuilders, FlashDeal } from '../PromotionsPage';
import { ProductCard } from '../ProductCard';
import { SparklesIcon, ArrowsPointingOutIcon, XMarkIcon } from '../IconComponents';

interface ManageOffersPageProps {
    allProducts: Product[];
}

export type SectionType = 'header' | 'performanceSection' | 'muscleBuilders' | 'dealOfTheDay' | 'allOffersGrid';

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
            addToast("Configuration sauvegardée !", "success");
        } catch (error) {
            console.error(error);
            addToast("Erreur lors de la sauvegarde.", "error");
        }
    };

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

    if (!config) return <div className="p-8 text-center text-gray-900 dark:text-white">Chargement...</div>;

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
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-white dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
                {renderSection('header', 'En-tête', (
                    <div className="text-center max-w-3xl mx-auto mt-12 mb-16">
                        <span className="text-black dark:text-brand-neon font-black uppercase tracking-[0.25em] text-xs mb-3 block transform -skew-x-12">Offres Limitées</span>
                        <h1 
                            className="text-4xl md:text-6xl font-serif font-black italic mb-6 text-gray-900 dark:text-white" 
                            dangerouslySetInnerHTML={{ __html: config.header.title }}
                        >
                        </h1>
                        <p 
                            className="font-mono text-gray-500 dark:text-gray-400 text-sm" 
                            dangerouslySetInnerHTML={{ __html: config.header.subtitle }}
                        >
                        </p>
                    </div>
                ), interactive)}

                <div className="space-y-16 mb-20">
                    {renderSection('performanceSection', 'Bloc Performance', (
                        <PerformanceSpotlight config={config.performanceSection} />
                    ), interactive)}
                    
                    {renderSection('muscleBuilders', 'Bloc Prise de Masse', (
                        <MuscleBuilders config={config.muscleBuilders} />
                    ), interactive)}
                </div>

                {renderSection('dealOfTheDay', 'Flash Deal', (
                    <div className={interactive ? "pointer-events-none" : ""}>
                        <FlashDeal 
                            product={dealProduct} 
                            onNavigateToProductDetail={() => {}} 
                            titleColor={config.dealOfTheDay.titleColor}
                            subtitleColor={config.dealOfTheDay.subtitleColor}
                        />
                    </div>
                ), interactive)}

                {renderSection('allOffersGrid', 'Grille Produits', (
                    <div className="mt-16">
                        <div className="flex items-baseline gap-4 mb-8">
                            <h2 
                                className="text-2xl font-serif font-black text-gray-900 dark:text-white uppercase italic" 
                                dangerouslySetInnerHTML={{ __html: config.allOffersGrid?.title || "Toutes les offres" }}
                            >
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {gridPreviewProducts.map(p => (
                                <ProductCard key={p.id} product={p} onPreview={() => {}} onNavigateToProductDetail={() => {}} />
                            ))}
                        </div>
                    </div>
                ), interactive)}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-100 dark:bg-[#050505] relative text-gray-900 dark:text-white transition-colors duration-300">
            
            {/* Top Bar */}
            <div className="bg-white dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center shadow-md z-20 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-black italic uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-black dark:text-brand-neon" />
                        Éditeur Offres
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsFullScreen(true)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors border border-gray-200 dark:border-gray-700"
                        title="Aperçu Plein Écran"
                    >
                        <ArrowsPointingOutIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={!isDirty}
                        className={`px-6 py-2 font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2 ${
                            isDirty 
                            ? 'bg-black dark:bg-brand-neon text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white skew-x-[-12deg]' 
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed skew-x-[-12deg]'
                        }`}
                    >
                        <span className="skew-x-[12deg]">{isDirty ? 'Enregistrer' : 'Sauvegardé'}</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: Preview */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-black">
                    {renderPreviewContent(true)}
                </div>

                {/* Right: Editor */}
                <div className="w-[380px] bg-white dark:bg-[#111] border-l border-gray-200 dark:border-gray-800 shadow-xl z-10 flex flex-col flex-shrink-0 transition-colors">
                    <EditorPanel 
                        section={activeSection}
                        data={config[activeSection]}
                        onChange={(data) => handleUpdateConfig(activeSection, data)}
                        allProducts={allProducts}
                    />
                </div>
            </div>

            {isFullScreen && (
                <div className="fixed inset-0 z-[9999] bg-white dark:bg-black overflow-y-auto animate-fadeIn">
                    <div className="fixed top-6 right-6 z-[10000]">
                        <button 
                            onClick={() => setIsFullScreen(false)}
                            className="flex items-center gap-2 bg-black dark:bg-brand-neon text-white dark:text-black px-5 py-3 rounded-full shadow-2xl font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-white transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                            <span>Fermer</span>
                        </button>
                    </div>
                    {renderPreviewContent(false)}
                </div>
            )}
        </div>
    );
};
