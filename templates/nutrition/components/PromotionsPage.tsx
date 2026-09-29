
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, OffersPageConfig } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { ProductCard } from './ProductCard';
import { Squares2X2Icon, Bars3Icon, ChevronDownIcon, SparklesIcon, ClockIcon, ArrowUpRightIcon } from './IconComponents';
import { ProductListItem } from './ProductListItem';
import { useCart } from './CartContext';
import { api } from '../utils/api';

interface PromotionsPageProps {
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    onPreview: (product: Product) => void;
    products: Product[];
    onNavigateToProductDetail: (productId: number) => void;
}

// Digital/Military Style Countdown
const CountdownTimer: React.FC = () => {
    const calculateTimeLeft = () => {
        const difference = +new Date("2025-12-31") - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                DAYS: Math.floor(difference / (1000 * 60 * 60 * 24)),
                HRS: Math.floor((difference / (1000 * 60 * 60)) % 24),
                MIN: Math.floor((difference / 1000 / 60) % 60),
                SEC: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const formatTime = (time: number) => String(time).padStart(2, '0');

    return (
        <div className="flex items-center gap-2 sm:gap-6 bg-gray-900 dark:bg-brand-black/90 p-4 border border-brand-neon/20 skew-x-[-6deg] w-fit mx-auto lg:mx-0 shadow-lg">
            {Object.keys(timeLeft).map((interval, index) => (
                <div key={interval} className="flex flex-col items-center skew-x-[6deg]">
                    <span className="text-3xl md:text-5xl font-black text-brand-neon font-mono tracking-tighter">
                        {formatTime(timeLeft[interval] || 0)}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                        {interval}
                    </span>
                </div>
            ))}
        </div>
    );
};

// --- SECTION 1: Performance Highlight ---
export const PerformanceSpotlight: React.FC<{ config?: any }> = ({ config }) => {
    if (!config) return null;
    return (
        <section className="relative w-full max-w-screen-2xl mx-auto my-16 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-900 group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 dark:opacity-10 pointer-events-none"></div>
            
            <div className="flex flex-col lg:flex-row h-auto lg:h-[650px] relative z-10">
                {/* Content Side (Left) */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-20 relative">
                    <div className="absolute top-0 left-0 w-24 h-1 bg-brand-neon"></div>
                    
                    <span className="text-xs font-bold text-brand-neon uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                        <span className="w-3 h-3 bg-brand-neon animate-pulse"></span>
                        {config.subtitle || "FEATURED STACK"}
                    </span>
                    
                    <h2 
                        className="text-5xl lg:text-7xl font-serif font-black text-gray-900 dark:text-white mb-8 leading-[0.85] uppercase italic tracking-tight"
                        dangerouslySetInnerHTML={{ __html: config.title }}
                    >
                    </h2>
                    
                    <div className="mb-10">
                        <a 
                            href={config.link || "#"}
                            className="inline-flex items-center justify-center px-10 py-4 bg-black dark:bg-brand-neon text-white dark:text-black font-black uppercase tracking-[0.15em] text-sm hover:bg-brand-neon hover:text-black dark:hover:bg-white transition-all duration-300 slant"
                        >
                            <span className="slant-reverse block">{config.buttonText || "ACCÉDER"}</span>
                        </a>
                    </div>
                </div>

                {/* Image Side (Right) */}
                <div className="w-full lg:w-1/2 relative h-[400px] lg:h-full overflow-hidden bg-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#0a0a0a] to-transparent z-10"></div>
                    <img 
                        src={config.image}
                        alt="Performance"
                        className="w-full h-full object-cover object-center filter grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
                    />
                </div>
            </div>
        </section>
    );
};

// --- SECTION 2: Mass/Muscle Builders ---
export const MuscleBuilders: React.FC<{ config?: any }> = ({ config }) => {
    if (!config) return null;
    return (
        <section className="relative w-full max-w-screen-2xl mx-auto my-16 bg-white dark:bg-[#111] border-l-4 border-brand-neon shadow-sm hover:shadow-xl transition-all">
            <div className="flex flex-col-reverse lg:flex-row items-center">
                
                {/* Image Side */}
                <div className="w-full lg:w-3/5 h-[400px] lg:h-[600px] relative overflow-hidden group bg-gray-200">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                    <img 
                        src={config.image} 
                        alt="Muscle Builders" 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-6 left-6 z-20">
                        <p className="text-[100px] font-black text-transparent opacity-30 leading-none select-none" style={{ WebkitTextStroke: '2px #fff' }}>GAIN</p>
                    </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-2/5 p-10 lg:p-16 bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white h-full flex flex-col justify-center relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ArrowUpRightIcon className="w-24 h-24" />
                    </div>

                    <h2 
                        className="text-4xl md:text-5xl font-serif font-black uppercase mb-4 tracking-tighter"
                        dangerouslySetInnerHTML={{ __html: config.title }}
                    >
                    </h2>
                    <div className="w-16 h-2 bg-brand-neon mb-6"></div>
                    <p 
                        className="text-lg text-gray-600 dark:text-gray-400 font-sans mb-8 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: config.subtitle }}
                    >
                    </p>
                    <a 
                        href={config.link || "#"}
                        className="inline-block border-2 border-black dark:border-white text-black dark:text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-center"
                    >
                        {config.buttonText}
                    </a>
                </div>
            </div>
        </section>
    );
};

// --- SECTION 3: Flash Deal ---
export const FlashDeal: React.FC<{ product: Product; onNavigateToProductDetail: (productId: number) => void; titleColor?: string; subtitleColor?: string; }> = ({ product, onNavigateToProductDetail, titleColor, subtitleColor }) => {
    const { addToCart, openCart } = useCart();
    
    const handleAddToCart = () => {
        addToCart(product);
        openCart();
    };

    return (
        <section className="relative my-20 max-w-screen-xl mx-auto bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 z-20">
                <div className="flex items-center gap-2 bg-brand-neon text-black px-4 py-1 font-black uppercase tracking-wider text-xs transform rotate-2">
                    <ClockIcon className="w-4 h-4" /> Flash Deal
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                
                {/* Product Image */}
                <div className="w-full lg:w-1/2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black p-10 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-200 dark:from-gray-800/30 via-transparent to-transparent opacity-50"></div>
                    
                    {/* Discount Tag */}
                    <div className="absolute top-10 left-10 w-24 h-24 bg-brand-neon flex flex-col items-center justify-center rounded-full border-4 border-white dark:border-black z-20 shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
                        <span className="text-xs font-bold uppercase text-black">Save</span>
                        <span className="text-3xl font-black leading-none text-black">
                            {Math.round(((product.oldPrice || product.price) - product.price) / (product.oldPrice || product.price) * 100)}%
                        </span>
                    </div>

                    <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="relative z-10 w-full max-w-[300px] lg:max-w-md object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 cursor-pointer" 
                        onClick={() => onNavigateToProductDetail(product.id)}
                    />
                </div>
                
                {/* Details */}
                <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-white dark:bg-brand-black">
                    <h3 
                        className="text-4xl md:text-6xl font-serif font-black uppercase italic mb-4 leading-none text-gray-900 dark:text-white tracking-tighter"
                        style={{ color: titleColor }}
                    >
                        {product.name}
                    </h3>
                    
                    <p 
                        className="text-gray-500 dark:text-gray-400 font-mono text-sm mb-8 border-l-2 border-gray-300 dark:border-gray-700 pl-4 py-1"
                        style={{ color: subtitleColor }}
                    >
                        {product.description || "Offre à durée limitée sur ce produit d'exception."}
                    </p>
                    
                    <div className="mb-10">
                        <CountdownTimer />
                    </div>

                    <div className="flex items-end gap-6 mb-8">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400 dark:text-gray-500 line-through decoration-brand-alert decoration-2 font-bold">
                                {product.oldPrice?.toFixed(3)} DT
                            </span>
                            <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                                {product.price.toFixed(3)} <span className="text-xl text-brand-neon">DT</span>
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleAddToCart} 
                        className="w-full bg-black dark:bg-brand-neon hover:bg-brand-neon hover:text-black dark:hover:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-sm py-5 px-8 transition-colors slant shadow-xl"
                    >
                        <span className="slant-reverse block">AJOUTER AU PANIER</span>
                    </button>
                </div>
            </div>
        </section>
    );
};


export const PromotionsPage: React.FC<PromotionsPageProps> = ({ onNavigateHome, onPreview, products: allProducts, onNavigateToProductDetail }) => {
    const [offersConfig, setOffersConfig] = useState<OffersPageConfig | null>(null);
    const [sortOrder, setSortOrder] = useState('discount-desc');
    const [viewMode, setViewMode] = useState('grid');
    
    useEffect(() => {
        document.title = `Offres & Deals - IronFuel`;
        api.getOffersConfig().then(setOffersConfig).catch(console.error);
    }, []);

    const displayedProducts = useMemo(() => {
        if (!offersConfig) return [];
        let baseList: Product[] = [];
        if (offersConfig.allOffersGrid?.useManualSelection) {
            baseList = allProducts.filter(p => offersConfig.allOffersGrid.manualProductIds?.includes(p.id));
        } else {
            baseList = allProducts.filter(p => p.promo || p.discount);
        }
        const sorted = [...baseList];
        sorted.sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'discount-desc': return (b.discount || 0) - (a.discount || 0);
                default: return 0;
            }
        });
        const limit = offersConfig.allOffersGrid?.limit || 12;
        return sorted.slice(0, limit);
    }, [allProducts, sortOrder, offersConfig]);

    const gridClasses = useMemo(() => {
        switch (viewMode) {
            case 'grid': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
            case 'list': return 'grid-cols-1';
            default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        }
    }, [viewMode]);

    const dealOfTheDayProduct = useMemo(() => {
        if (offersConfig && offersConfig.dealOfTheDay && offersConfig.dealOfTheDay.productId) {
            const product = allProducts.find(p => p.id === offersConfig.dealOfTheDay.productId);
            if (product) return product;
        }
        return [...allProducts].sort((a, b) => (b.discount || 0) - (a.discount || 0))[0] || allProducts[0];
    }, [allProducts, offersConfig]);

    if (!offersConfig) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-mono">LOADING DATA...</div>;

    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen text-gray-900 dark:text-gray-100 font-sans selection:bg-brand-neon selection:text-black transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Offres Spéciales' }]} />
                
                {/* Header Section */}
                <div className="text-center max-w-5xl mx-auto mt-12 mb-20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-[12vw] font-black text-black/[0.02] dark:text-white/[0.02] pointer-events-none select-none italic font-serif">OFFERS</div>
                    <span className="bg-brand-neon text-black px-4 py-1 font-black uppercase tracking-[0.25em] text-xs inline-block transform -skew-x-12 mb-6">
                        Limited Time Offers
                    </span>
                    <h1 
                        className="text-6xl md:text-8xl font-serif font-black uppercase italic mb-6 text-gray-900 dark:text-white tracking-tighter leading-none relative z-10"
                        dangerouslySetInnerHTML={{ __html: offersConfig.header.title }}
                    >
                    </h1>
                    <div className="w-24 h-1 bg-gray-200 dark:bg-gray-800 mx-auto mb-6"></div>
                    <p 
                        className="font-mono text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto relative z-10"
                        dangerouslySetInnerHTML={{ __html: offersConfig.header.subtitle }}
                    >
                    </p>
                </div>

                {/* --- SECTIONS PROMO --- */}
                <div className="space-y-16 lg:space-y-32 mb-32">
                    <PerformanceSpotlight config={offersConfig.performanceSection} />
                    <MuscleBuilders config={offersConfig.muscleBuilders} />
                </div>

                <FlashDeal 
                    product={dealOfTheDayProduct} 
                    onNavigateToProductDetail={onNavigateToProductDetail}
                    titleColor={offersConfig.dealOfTheDay.titleColor}
                    subtitleColor={offersConfig.dealOfTheDay.subtitleColor}
                />

                <main className="mt-32">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-gray-200 dark:border-gray-800 pb-6">
                        <div>
                            <h2 
                                className="text-3xl font-serif font-black text-gray-900 dark:text-white uppercase italic"
                                dangerouslySetInnerHTML={{ __html: offersConfig.allOffersGrid?.title || "Toutes les offres" }}
                            >
                            </h2>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-sm">
                                <button 
                                    onClick={() => setViewMode('grid')} 
                                    className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-black dark:bg-brand-neon text-white dark:text-black shadow-md' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                                >
                                    <Squares2X2Icon className="w-4 h-4"/>
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')} 
                                    className={`p-2 transition-all ${viewMode === 'list' ? 'bg-black dark:bg-brand-neon text-white dark:text-black shadow-md' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                                >
                                    <Bars3Icon className="w-4 h-4"/>
                                </button>
                            </div>

                            <div className="relative group">
                                <select 
                                    value={sortOrder} 
                                    onChange={(e) => setSortOrder(e.target.value)} 
                                    className="appearance-none bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer focus:border-brand-neon outline-none"
                                >
                                    <option value="discount-desc">Meilleurs Deals</option>
                                    <option value="price-asc">Prix Croissant</option>
                                    <option value="price-desc">Prix Décroissant</option>
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-brand-neon absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Products Grid/List */}
                    {displayedProducts.length > 0 ? (
                        viewMode === 'list' ? (
                            <div className="space-y-6">
                                {displayedProducts.map(product => (
                                    <ProductListItem key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                ))}
                            </div>
                        ) : (
                            <div className={`grid ${gridClasses} gap-8`}>
                                {displayedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="text-center py-32 border border-dashed border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900/50 rounded-xl">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-800">
                                <SparklesIcon className="w-8 h-8" />
                            </div>
                            <p className="text-xl font-serif font-bold text-gray-900 dark:text-white uppercase mb-2">Aucune offre active.</p>
                            <p className="text-gray-500 font-mono text-sm">Revenez plus tard pour de nouveaux drops.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
