
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, OffersPageConfig } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { ProductCard } from './ProductCard';
import { Squares2X2Icon, Bars3Icon, SparklesIcon, ClockIcon, ArrowUpRightIcon, CheckCircleIcon } from './IconComponents';
import { ProductListItem } from './ProductListItem';
import { useCart } from './CartContext';
import { api } from '../utils/api';
import { SEO } from './SEO';

interface PromotionsPageProps {
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    onPreview: (product: Product) => void;
    products: Product[];
    onNavigateToProductDetail: (productId: number) => void;
}

const CountdownTimer: React.FC = () => {
    const calculateTimeLeft = () => {
        const difference = +new Date("2025-12-31") - +new Date();
        let timeLeft: { [key: string]: number } = {};
        if (difference > 0) {
            timeLeft = {
                JOURS: Math.floor(difference / (1000 * 60 * 60 * 24)),
                HRS: Math.floor((difference / (1000 * 60 * 60)) % 24),
                MIN: Math.floor((difference / 1000 / 60) % 60),
                SEC: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });
    const formatTime = (time: number) => String(time).padStart(2, '0');

    return (
        <div className="flex items-center gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-brand-primary/10 shadow-soft w-fit mx-auto lg:mx-0">
            {Object.keys(timeLeft).map((interval) => (
                <div key={interval} className="flex flex-col items-center">
                    <span className="text-4xl font-serif font-black text-brand-primary tracking-tighter">
                        {formatTime(timeLeft[interval] || 0)}
                    </span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">
                        {interval}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const PerformanceSpotlight: React.FC<{ config?: any }> = ({ config }) => {
    if (!config) return null;
    return (
        <section className="relative w-full max-w-screen-2xl mx-auto my-24 bg-white dark:bg-brand-dark rounded-[4rem] border border-slate-50 dark:border-white/5 overflow-hidden shadow-soft hover:shadow-xl-brand transition-all duration-1000 group">
            <div className="flex flex-col lg:flex-row min-h-[650px]">
                <div className="w-full lg:w-1/2 flex flex-col justify-center p-12 lg:p-24 relative z-10">
                    <span className="text-brand-primary font-black uppercase tracking-[0.5em] text-[10px] mb-8 flex items-center gap-4">
                        <div className="w-8 h-px bg-brand-primary"></div>
                        EXCLUSIVITÉ LABORATOIRE
                    </span>
                    <h2 className="text-5xl lg:text-7xl font-serif font-black text-slate-900 dark:text-white mb-8 leading-[1.05]" dangerouslySetInnerHTML={{ __html: config.title }}></h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 font-medium leading-relaxed italic" dangerouslySetInnerHTML={{ __html: config.subtitle }}></p>
                    <div>
                        <a href={config.link || "#"} className="inline-flex items-center justify-center px-12 py-6 bg-brand-primary text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:bg-brand-primaryHover transition-all shadow-xl shadow-brand-primary/20">
                            {config.buttonText || "DÉCOUVRIR"} <ArrowUpRightIcon className="w-4 h-4 ml-4"/>
                        </a>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 relative min-h-[400px] overflow-hidden">
                    <img src={config.image} alt="Soin" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"/>
                    <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-brand-dark via-transparent to-transparent hidden lg:block"></div>
                </div>
            </div>
        </section>
    );
};

export const MuscleBuilders: React.FC<{ config?: any }> = ({ config }) => {
    if (!config) return null;
    return (
        <section className="relative w-full max-w-screen-2xl mx-auto my-24 bg-brand-light dark:bg-white/5 rounded-[4rem] border border-brand-primary/10 overflow-hidden group">
            <div className="flex flex-col-reverse lg:flex-row items-center">
                <div className="w-full lg:w-1/2 h-[500px] lg:h-[700px] overflow-hidden">
                    <img src={config.image} alt="Essentiels" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"/>
                </div>
                <div className="w-full lg:w-1/2 p-12 lg:p-24">
                    <span className="text-brand-secondary font-black uppercase tracking-[0.5em] text-[10px] mb-8 block">PROTOCOLE SANTÉ</span>
                    <h2 className="text-5xl md:text-6xl font-serif font-black text-slate-900 dark:text-white mb-8 leading-tight" dangerouslySetInnerHTML={{ __html: config.title }}></h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-12 italic leading-relaxed" dangerouslySetInnerHTML={{ __html: config.subtitle }}></p>
                    <a href={config.link || "#"} className="text-brand-primary font-black uppercase text-[11px] tracking-[0.3em] border-b-2 border-brand-primary/20 pb-2 hover:border-brand-primary transition-all">
                        {config.buttonText}
                    </a>
                </div>
            </div>
        </section>
    );
};

export const FlashDeal: React.FC<{ product: Product; onNavigateToProductDetail: (productId: number) => void; titleColor?: string; subtitleColor?: string; }> = ({ product, onNavigateToProductDetail, titleColor, subtitleColor }) => {
    const { addToCart, openCart } = useCart();
    return (
        <section className="relative my-32 max-w-screen-2xl mx-auto bg-white dark:bg-brand-dark border border-slate-100 dark:border-white/5 rounded-[5rem] overflow-hidden shadow-2xl transition-all hover:shadow-xl-brand duration-700">
            <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-gray-900/50 p-16 md:p-24 flex items-center justify-center relative">
                    <div className="absolute top-12 left-12 w-28 h-28 bg-brand-secondary text-white flex flex-col items-center justify-center rounded-full shadow-2xl animate-bounce-slow z-20">
                        <span className="text-[10px] font-black uppercase">OFFRE</span>
                        <span className="text-3xl font-black">{Math.round(((product.oldPrice || product.price) - product.price) / (product.oldPrice || product.price) * 100)}%</span>
                    </div>
                    <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="relative z-10 w-full max-w-[450px] object-contain drop-shadow-2xl cursor-pointer hover:scale-110 transition-transform duration-700" 
                        onClick={() => onNavigateToProductDetail(product.id)}
                    />
                </div>
                <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                        <span className="text-rose-500 font-black text-[10px] uppercase tracking-[0.4em]">SÉANCE DE VENTE LIMITÉE</span>
                    </div>
                    <h3 className="text-5xl md:text-7xl font-serif font-black text-slate-900 dark:text-white mb-10 leading-tight" style={{ color: titleColor }}>{product.name}</h3>
                    
                    <div className="mb-12">
                        <CountdownTimer />
                    </div>

                    <div className="flex items-end gap-8 mb-16">
                        <div>
                            <span className="text-lg text-slate-300 line-through font-bold">{product.oldPrice?.toFixed(3)} DT</span>
                            <span className="block text-6xl font-black text-brand-primary tracking-tighter mt-2">{product.price.toFixed(3)} <span className="text-2xl">DT</span></span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { addToCart(product); openCart(); }} 
                        className="w-full bg-brand-primary text-white font-black py-7 rounded-3xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase tracking-widest text-xs"
                    >
                        AJOUTER À MA CURE
                    </button>
                    
                    <p className="mt-8 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                        <CheckCircleIcon className="w-4 h-4 text-brand-primary" />
                        Livraison Prioritaire Incluse
                    </p>
                </div>
            </div>
        </section>
    );
};

export const PromotionsPage: React.FC<PromotionsPageProps> = ({ onNavigateHome, onPreview, products: allProducts, onNavigateToProductDetail }) => {
    const [offersConfig, setOffersConfig] = useState<OffersPageConfig | null>(null);
    const [viewMode, setViewMode] = useState('grid');
    
    useEffect(() => {
        document.title = "Offres Privilèges - PharmaNature";
        api.getOffersConfig().then(setOffersConfig).catch(console.error);
    }, []);

    const displayedProducts = useMemo(() => {
        if (!offersConfig) return [];
        let baseList = offersConfig.allOffersGrid?.useManualSelection 
            ? allProducts.filter(p => offersConfig.allOffersGrid.manualProductIds?.includes(p.id))
            : allProducts.filter(p => p.promo || p.discount);
        return baseList.slice(0, offersConfig.allOffersGrid?.limit || 12);
    }, [allProducts, offersConfig]);

    const dealOfTheDayProduct = useMemo(() => {
        if (offersConfig?.dealOfTheDay?.productId) {
            return allProducts.find(p => p.id === offersConfig.dealOfTheDay.productId) || allProducts[0];
        }
        return allProducts.filter(p => p.discount)[0] || allProducts[0];
    }, [allProducts, offersConfig]);

    if (!offersConfig) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-brand-dark"><div className="w-12 h-12 border-4 border-brand-light border-t-brand-primary rounded-full animate-spin"></div></div>;

    return (
        <div className="bg-brand-bg dark:bg-brand-dark min-h-screen font-sans transition-colors duration-500 pb-32">
            <SEO title="Offres Privilèges" description="Profitez de l'excellence de la santé naturelle au meilleur prix." />
            
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-10">
                <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Offres Privilèges' }]} />
                
                <header className="text-center max-w-4xl mx-auto mt-24 mb-40 relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
                        <SparklesIcon className="w-64 h-64 text-brand-primary" />
                    </div>
                    <span className="text-brand-primary font-black uppercase tracking-[0.5em] text-[10px] mb-8 block">PROGRAMME PRIVILÈGE</span>
                    <h1 className="text-6xl md:text-8xl font-serif font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter uppercase" dangerouslySetInnerHTML={{ __html: offersConfig.header.title }}></h1>
                    <p className="mt-10 text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed italic" dangerouslySetInnerHTML={{ __html: offersConfig.header.subtitle }}></p>
                </header>

                <div className="space-y-40">
                    <PerformanceSpotlight config={offersConfig.performanceSection} />
                    <MuscleBuilders config={offersConfig.muscleBuilders} />
                </div>

                <FlashDeal 
                    product={dealOfTheDayProduct} 
                    onNavigateToProductDetail={onNavigateToProductDetail} 
                    titleColor={offersConfig.dealOfTheDay.titleColor} 
                    subtitleColor={offersConfig.dealOfTheDay.subtitleColor} 
                />

                <main className="mt-48">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-20 border-b border-slate-100 dark:border-white/5 pb-12">
                        <h2 className="text-4xl font-serif font-black text-slate-900 dark:text-white leading-none uppercase" dangerouslySetInnerHTML={{ __html: offersConfig.allOffersGrid?.title || "Toutes les Offres" }}></h2>
                        <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-2xl shadow-soft">
                            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400'}`}><Squares2X2Icon className="w-5 h-5"/></button>
                            <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400'}`}><Bars3Icon className="w-5 h-5"/></button>
                        </div>
                    </div>
                    
                    {displayedProducts.length > 0 ? (
                        <div className={viewMode === 'list' ? 'space-y-10' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12'}>
                            {displayedProducts.map(product => (
                                viewMode === 'list' 
                                    ? <ProductListItem key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} /> 
                                    : <ProductCard key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-48 bg-white dark:bg-white/5 rounded-[5rem] border-2 border-dashed border-slate-100 dark:border-white/10">
                            <p className="font-serif italic text-2xl text-slate-300">Aucun protocole en promotion actuellement.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
