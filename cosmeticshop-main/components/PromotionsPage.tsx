
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, OffersPageConfig } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { ProductCard } from './ProductCard';
import { Squares2X2Icon, Bars3Icon, ChevronDownIcon, ShoppingBagIcon, SparklesIcon, ClockIcon } from './IconComponents';
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

const CountdownTimer: React.FC = () => {
    const calculateTimeLeft = () => {
        const difference = +new Date("2024-12-31") - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hrs: Math.floor((difference / (1000 * 60 * 60)) % 24),
                min: Math.floor((difference / 1000 / 60) % 60),
                sec: Math.floor((difference / 1000) % 60)
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
        <div className="flex items-baseline gap-2 md:gap-4 text-gray-900 dark:text-white font-serif">
            {Object.keys(timeLeft).map((interval, index) => (
                <div key={interval} className="flex items-baseline">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-5xl font-medium leading-none">
                            {formatTime(timeLeft[interval] || 0)}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-2 font-sans">
                            {interval}
                        </span>
                    </div>
                    {index < Object.keys(timeLeft).length - 1 && (
                        <span className="text-2xl md:text-4xl text-rose-300 mx-1 md:mx-2 font-light">:</span>
                    )}
                </div>
            ))}
        </div>
    );
};

// --- NOUVEAU BLOC 1 : GLOW ROUTINE (Split Screen) ---
export const GlowRoutinePromo: React.FC<{ config?: OffersPageConfig['glowRoutine'] }> = ({ config }) => {
    if (!config) return null;
    return (
        <section className="relative w-full max-w-screen-2xl mx-auto my-12 overflow-hidden bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row h-auto lg:h-[600px]">
                
                {/* Image Side (Left) - Product Composition */}
                <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-rose-50 to-white dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-12 order-2 lg:order-1">
                    {/* Decorative blurred circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200/40 dark:bg-rose-900/20 rounded-full blur-[80px]"></div>
                    
                    {/* Simulated Product Composition Image */}
                    <img 
                        src={config.image}
                        alt="Glow Routine Products"
                        className="relative z-10 w-full max-w-md object-contain drop-shadow-2xl transform transition-transform duration-700 hover:scale-105"
                    />
                </div>

                {/* Content Side (Right) - Text Centered */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center text-center p-12 lg:p-20 order-1 lg:order-2 bg-white dark:bg-gray-900">
                    <span 
                        className="text-sm font-sans tracking-[0.2em] uppercase mb-4"
                        dangerouslySetInnerHTML={{ __html: config.subtitle }}
                    >
                    </span>
                    
                    <h2 
                        className="text-5xl lg:text-7xl font-serif font-bold mb-8 leading-tight"
                        dangerouslySetInnerHTML={{ __html: config.title }}
                    >
                    </h2>
                    
                    <a 
                        href={config.link || "#"}
                        className="px-10 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
                        style={{ backgroundColor: config.buttonColor, color: config.buttonTextColor }}
                    >
                        {config.buttonText}
                    </a>
                </div>
            </div>
        </section>
    );
};

// --- NOUVEAU BLOC 2 : ESSENTIALS BANNER (Horizontal) ---
export const EssentialsBanner: React.FC<{ config?: OffersPageConfig['essentials'] }> = ({ config }) => {
    if (!config) return null;
    return (
        <section className="relative w-full max-w-screen-2xl mx-auto my-12 overflow-hidden bg-[#F8F9FA] dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between relative min-h-[400px]">
                
                {/* Left Content */}
                <div className="w-full md:w-5/12 p-10 md:pl-20 md:py-20 z-10 text-center md:text-left">
                    <h2 
                        className="text-4xl md:text-5xl font-sans font-bold mb-4 tracking-tight"
                        dangerouslySetInnerHTML={{ __html: config.title }}
                    >
                    </h2>
                    <p 
                        className="text-lg md:text-xl font-medium mb-10"
                        dangerouslySetInnerHTML={{ __html: config.subtitle }}
                    >
                    </p>
                    <a 
                        href={config.link || "#"}
                        className="px-12 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg inline-block"
                        style={{ backgroundColor: config.buttonColor, color: config.buttonTextColor }}
                    >
                        {config.buttonText}
                    </a>
                </div>

                {/* Center Badge (Absolute centered on desktop, static on mobile) */}
                <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20 my-6 md:my-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 flex flex-col items-center justify-center text-center p-2 shadow-xl rotate-12 transform hover:rotate-0 transition-transform duration-500">
                        <span className="text-4xl font-serif italic font-bold text-gray-900 dark:text-white">#1</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 leading-tight mt-1">
                            SPF Foundation<br/>Brand
                        </span>
                        <span className="text-[8px] font-serif italic text-rose-500 mt-1">In The World</span>
                    </div>
                </div>

                {/* Right Image (Model) */}
                <div className="w-full md:w-1/2 h-[400px] md:h-full absolute right-0 top-0 bottom-0 overflow-hidden">
                    {/* Gradient Overlay for smooth blending */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F8F9FA] via-transparent to-transparent dark:from-gray-800 z-10 w-1/3"></div>
                    
                    <img 
                        src={config.image} 
                        alt="Model applying makeup" 
                        className="w-full h-full object-cover object-top md:object-center"
                    />
                </div>
            </div>
            
            {/* Disclaimer text bottom */}
            <div className="absolute bottom-2 left-0 w-full text-center pb-2 z-20">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    *Source: Circana/U.S. Prestige Beauty Total Measured Market
                </p>
            </div>
        </section>
    );
};

export const DealOfTheDay: React.FC<{ product: Product; onPreview: (product: Product) => void; onNavigateToProductDetail: (productId: number) => void; titleColor?: string; subtitleColor?: string; }> = ({ product, onPreview, onNavigateToProductDetail, titleColor, subtitleColor }) => {
    const { addToCart, openCart } = useCart();
    
    const handleAddToCart = () => {
        addToCart(product);
        openCart();
    };

    return (
        <section className="relative my-16 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-black shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 dark:border-gray-700/50">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-200/20 dark:bg-rose-900/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center p-8 md:p-12 lg:p-20 gap-12 lg:gap-20">
                
                {/* Image Section */}
                <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-rose-200 to-transparent dark:from-rose-900/40 rounded-full filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProductDetail(product.id); }} className="block relative z-10">
                            <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-full max-w-sm md:max-w-md object-contain drop-shadow-2xl transform transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-rotate-2" 
                            />
                        </a>
                        {/* Sticker */}
                        <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl border border-gray-100 dark:border-gray-600 animate-bounce-slow z-20">
                            <span className="text-xs font-bold uppercase tracking-widest">Save</span>
                            <span className="text-2xl font-serif font-bold text-rose-500">
                                {Math.round(((product.oldPrice || product.price) - product.price) / (product.oldPrice || product.price) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Content Section */}
                <div className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                        <ClockIcon className="w-3 h-3" />
                        Offre Flash
                    </div>
                    
                    <h3 
                        className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6 leading-tight"
                        style={{ color: titleColor }}
                    >
                        {product.name}
                    </h3>
                    
                    <p 
                        className="text-lg mb-10 font-light leading-relaxed max-w-lg mx-auto lg:mx-0"
                        style={{ color: subtitleColor }}
                    >
                        {product.description || "Profitez de cette offre exclusive pour une durée limitée. L'excellence à prix privilégié."}
                    </p>
                    
                    <div className="mb-12 flex justify-center lg:justify-start">
                        <CountdownTimer />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                        <div className="text-left">
                            <span className="block text-sm text-gray-400 line-through decoration-rose-400 font-medium ml-1">
                                {product.oldPrice?.toFixed(3)} DT
                            </span>
                            <span className="block text-4xl font-serif text-gray-900 dark:text-white">
                                {product.price.toFixed(3)} <span className="text-lg font-sans font-light text-gray-500">DT</span>
                            </span>
                        </div>
                        
                        <div className="h-12 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                        <button 
                            onClick={handleAddToCart} 
                            className="group relative overflow-hidden bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-[0.15em] text-xs py-4 px-10 rounded-full hover:shadow-2xl transition-all duration-300 w-full sm:w-auto"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <ShoppingBagIcon className="w-4 h-4" />
                                Ajouter au sac
                            </span>
                            <div className="absolute inset-0 bg-rose-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                        </button>
                    </div>
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
        document.title = `Offres & Privilèges - Cosmetics Shop`;
        
        // Load configuration from API
        api.getOffersConfig().then(setOffersConfig).catch(console.error);
    }, []);

    const displayedProducts = useMemo(() => {
        if (!offersConfig) return [];

        let baseList: Product[] = [];

        // Manual Selection or Automatic
        if (offersConfig.allOffersGrid?.useManualSelection) {
            baseList = allProducts.filter(p => offersConfig.allOffersGrid.manualProductIds?.includes(p.id));
        } else {
            // Default behavior: products with promo or discount
            baseList = allProducts.filter(p => p.promo || p.discount);
        }

        // Sorting
        const sorted = [...baseList];
        sorted.sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'discount-desc': return (b.discount || 0) - (a.discount || 0);
                default: return 0;
            }
        });
        
        // Limiting (Apply limit if configured)
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
        // Fallback
        return [...allProducts].sort((a, b) => (b.discount || 0) - (a.discount || 0))[0] || allProducts[0];
    }, [allProducts, offersConfig]);

    if (!offersConfig) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <div className="bg-[#FAFAFA] dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Offres & Privilèges' }]} />
                
                {/* Header Section - Configured */}
                <div className="text-center max-w-3xl mx-auto mt-12 mb-16">
                    <span className="text-rose-500 font-bold uppercase tracking-[0.25em] text-xs mb-3 block">Sélection Exclusive</span>
                    <h1 
                        className="text-4xl md:text-6xl font-serif mb-6"
                        dangerouslySetInnerHTML={{ __html: offersConfig.header.title }}
                    >
                    </h1>
                    <p 
                        className="font-light text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: offersConfig.header.subtitle }}
                    >
                    </p>
                </div>

                {/* --- BLOCS PROMO CONFIGURABLES --- */}
                <div className="space-y-8 mb-20">
                    <GlowRoutinePromo config={offersConfig.glowRoutine} />
                    <EssentialsBanner config={offersConfig.essentials} />
                </div>

                <DealOfTheDay 
                    product={dealOfTheDayProduct} 
                    onPreview={onPreview} 
                    onNavigateToProductDetail={onNavigateToProductDetail}
                    titleColor={offersConfig.dealOfTheDay.titleColor}
                    subtitleColor={offersConfig.dealOfTheDay.subtitleColor}
                />

                <main>
                    {/* Toolbar */}
                    <div className="sticky top-20 z-20 bg-[#FAFAFA]/90 dark:bg-gray-950/90 backdrop-blur-md py-4 mb-8 border-b border-gray-200 dark:border-gray-800 transition-all">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-baseline gap-2">
                                <h2 
                                    className="text-xl font-serif font-bold"
                                    dangerouslySetInnerHTML={{ __html: offersConfig.allOffersGrid?.title || "Toutes les offres" }}
                                >
                                </h2>
                                <span className="text-sm text-gray-500 font-light">({displayedProducts.length} trésors trouvés)</span>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-white dark:bg-gray-900 rounded-full p-1 border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <button 
                                        onClick={() => setViewMode('grid')} 
                                        className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Squares2X2Icon className="w-4 h-4"/>
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')} 
                                        className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Bars3Icon className="w-4 h-4"/>
                                    </button>
                                </div>

                                <div className="relative group">
                                    <select 
                                        value={sortOrder} 
                                        onChange={(e) => setSortOrder(e.target.value)} 
                                        className="appearance-none bg-transparent pl-0 pr-8 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none border-b border-transparent hover:border-gray-300 transition-colors"
                                    >
                                        <option value="discount-desc">Meilleures remises</option>
                                        <option value="price-asc">Prix croissant</option>
                                        <option value="price-desc">Prix décroissant</option>
                                    </select>
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-rose-500 transition-colors" />
                                </div>
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
                            <div className={`grid ${gridClasses} gap-x-6 gap-y-10`}>
                                {displayedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <SparklesIcon className="w-10 h-10" />
                            </div>
                            <p className="text-xl font-serif text-gray-900 dark:text-white mb-2">Aucune offre pour le moment.</p>
                            <p className="text-gray-500 font-light">Revenez bientôt pour découvrir nos prochaines exclusivités.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};