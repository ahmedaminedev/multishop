
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
            addToast("Déploiement réussi !", "success");
        } catch (error) {
            console.error(error);
            addToast("Erreur de sauvegarde.", "error");
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

    if (!config) return <div className="p-12 text-center text-brand-primary animate-pulse font-bold">CHARGEMENT DU STUDIO...</div>;

    const renderPreviewContent = (interactive: boolean) => {
        return (
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12 bg-brand-bg dark:bg-brand-dark min-h-screen text-slate-900 dark:text-white transition-colors duration-500">
                
                {interactive ? (
                    <SelectableWrapper isActive={activeSection === 'header'} onClick={() => setActiveSection('header')} label="EN-TÊTE">
                        <header className="text-center max-w-4xl mx-auto mb-32">
                            <span className="text-brand-primary font-black uppercase tracking-[0.5em] text-[10px] mb-8 block">STUDIO APERÇU</span>
                            <h1 className="text-5xl md:text-7xl font-serif font-black leading-none uppercase" dangerouslySetInnerHTML={{ __html: config.header.title }}></h1>
                            <p className="mt-8 text-slate-500 text-lg md:text-xl italic font-medium" dangerouslySetInnerHTML={{ __html: config.header.subtitle }}></p>
                        </header>
                    </SelectableWrapper>
                ) : (
                    <header className="text-center max-w-4xl mx-auto mb-32">
                         <h1 className="text-5xl md:text-7xl font-serif font-black leading-none uppercase" dangerouslySetInnerHTML={{ __html: config.header.title }}></h1>
                    </header>
                )}

                <div className="space-y-32 mb-32">
                    {interactive ? (
                        <>
                            <SelectableWrapper isActive={activeSection === 'performanceSection'} onClick={() => setActiveSection('performanceSection')} label="SOIN SIGNATURE">
                                <PerformanceSpotlight config={config.performanceSection} />
                            </SelectableWrapper>
                            <SelectableWrapper isActive={activeSection === 'muscleBuilders'} onClick={() => setActiveSection('muscleBuilders')} label="CURE VITALITÉ">
                                <MuscleBuilders config={config.muscleBuilders} />
                            </SelectableWrapper>
                        </>
                    ) : (
                        <>
                            <PerformanceSpotlight config={config.performanceSection} />
                            <MuscleBuilders config={config.muscleBuilders} />
                        </>
                    )}
                </div>

                {interactive ? (
                    <SelectableWrapper isActive={activeSection === 'dealOfTheDay'} onClick={() => setActiveSection('dealOfTheDay')} label="OFFRE MAGISTRALE">
                        <FlashDeal 
                            product={dealProduct} 
                            onNavigateToProductDetail={() => {}} 
                            titleColor={config.dealOfTheDay.titleColor}
                            subtitleColor={config.dealOfTheDay.subtitleColor}
                        />
                    </SelectableWrapper>
                ) : (
                    <FlashDeal product={dealProduct} onNavigateToProductDetail={() => {}} />
                )}

                {interactive ? (
                    <SelectableWrapper isActive={activeSection === 'allOffersGrid'} onClick={() => setActiveSection('allOffersGrid')} label="GRILLE CATALOGUE">
                        <div className="mt-32">
                            <h2 className="text-4xl font-serif font-black mb-12 uppercase" dangerouslySetInnerHTML={{ __html: config.allOffersGrid?.title || "Sélection" }}></h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                {gridPreviewProducts.map(p => (
                                    <ProductCard key={p.id} product={p} onPreview={() => {}} onNavigateToProductDetail={() => {}} />
                                ))}
                            </div>
                        </div>
                    </SelectableWrapper>
                ) : (
                    <div className="mt-32">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {gridPreviewProducts.map(p => (
                                <ProductCard key={p.id} product={p} onPreview={() => {}} onNavigateToProductDetail={() => {}} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-brand-dark overflow-hidden font-sans">
            <div className="h-20 bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-10 z-[60] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-lg"><SparklesIcon className="w-5 h-5"/></div>
                    <div>
                        <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Éditeur <span className="text-brand-primary">Offres</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration Visuelle PharmaNature</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => setIsFullScreen(true)} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-brand-primary transition-all"><ArrowsPointingOutIcon className="w-5 h-5"/></button>
                    <button 
                        onClick={handleSave} 
                        disabled={!isDirty}
                        className={`px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDirty ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'bg-slate-100 text-slate-300'}`}
                    >
                        DÉPLOYER LES MODIFS
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-slate-100/50 dark:bg-black/20">
                    <div className="bg-white dark:bg-brand-dark shadow-2xl rounded-[4rem] overflow-hidden border border-slate-100 dark:border-white/5">
                        {renderPreviewContent(true)}
                    </div>
                </div>

                <div className="w-[450px] bg-white dark:bg-gray-900 border-l border-slate-100 dark:border-white/5 shadow-2xl z-50 flex flex-col flex-shrink-0">
                    <EditorPanel 
                        section={activeSection}
                        data={config[activeSection]}
                        onChange={(data) => handleUpdateConfig(activeSection, data)}
                        allProducts={allProducts}
                    />
                </div>
            </div>

            {isFullScreen && (
                <div className="fixed inset-0 z-[100] bg-brand-bg dark:bg-brand-dark overflow-y-auto animate-fadeIn">
                    <button onClick={() => setIsFullScreen(false)} className="fixed top-12 right-12 z-[110] bg-brand-primary text-white p-5 rounded-3xl shadow-2xl hover:scale-110 transition-transform"><XMarkIcon className="w-8 h-8"/></button>
                    {renderPreviewContent(false)}
                </div>
            )}
        </div>
    );
};
