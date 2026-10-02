import React, { useState, useEffect, useMemo } from 'react';
import type { Product } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { Squares2X2Icon, Bars3Icon } from './IconComponents';
import { Flame, Clock, Tag, ArrowRight, ShieldCheck } from 'lucide-react';

interface PromotionsPageProps {
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    onPreview: (product: Product) => void;
    products: Product[];
    onNavigateToProductDetail: (productId: number) => void;
}

const CountdownTimer: React.FC = () => {
    // Dynamic countdown timer set for current rolling 7 days
    const [timeLeft, setTimeLeft] = useState({
        DAYS: 4,
        HRS: 14,
        MIN: 32,
        SEC: 45
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.SEC > 0) return { ...prev, SEC: prev.SEC - 1 };
                if (prev.MIN > 0) return { ...prev, MIN: 59, SEC: 59 };
                if (prev.HRS > 0) return { ...prev, HRS: prev.HRS - 1, MIN: 59, SEC: 59 };
                if (prev.DAYS > 0) return { ...prev, DAYS: prev.DAYS - 1, HRS: 23, MIN: 59, SEC: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (time: number) => String(time).padStart(2, '0');

    return (
        <div className="flex items-center gap-2 sm:gap-3 bg-[#0a0d14] border border-white/10 p-3 sm:p-4 rounded-2xl shadow-lg">
            {Object.keys(timeLeft).map((unit) => (
                <div key={unit} className="flex flex-col items-center px-2 sm:px-3 py-1 bg-white/5 rounded-xl border border-white/5 min-w-[50px] sm:min-w-[62px]">
                    <span className="text-xl sm:text-2xl font-black text-[#84cc16] font-mono leading-none">
                        {formatTime((timeLeft as any)[unit] || 0)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {unit}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const PromotionsPage: React.FC<PromotionsPageProps> = ({
    onNavigateHome,
    onNavigateToCategory,
    onPreview,
    products,
    onNavigateToProductDetail
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<string>('discount-desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        document.title = 'Offres & Ventes Flash - Fitness Shop';
        window.scrollTo(0, 0);
    }, []);

    // Filter promo products
    const promoProducts = useMemo(() => {
        let list = products.filter(p => p.promo || p.discount || (p.oldPrice && p.oldPrice > p.price));
        if (list.length === 0) list = products.slice(0, 8); // graceful fallback

        if (selectedCategory !== 'all') {
            list = list.filter(p => p.category?.toLowerCase().includes(selectedCategory.toLowerCase()));
        }

        list.sort((a, b) => {
            const discA = a.discount || (a.oldPrice ? Math.round(((a.oldPrice - a.price) / a.oldPrice) * 100) : 0);
            const discB = b.discount || (b.oldPrice ? Math.round(((b.oldPrice - b.price) / b.oldPrice) * 100) : 0);
            if (sortOrder === 'discount-desc') return discB - discA;
            if (sortOrder === 'price-asc') return a.price - b.price;
            if (sortOrder === 'price-desc') return b.price - a.price;
            return a.name.localeCompare(b.name);
        });

        return list;
    }, [products, selectedCategory, sortOrder]);

    const promoTabs = [
        { id: 'all', label: 'Toutes les promos' },
        { id: 'musculation', label: 'Musculation' },
        { id: 'cardio', label: 'Cardio' },
        { id: 'halt', label: 'Haltères & Poids' },
        { id: 'banc', label: 'Bancs & Racks' },
        { id: 'accessoires', label: 'Accessoires' }
    ];

    return (
        <div className="w-full bg-[#f8fafc] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            
            {/* --- HERO SECTION MATCHING HOMEPAGE --- */}
            <div className="relative w-full bg-[#0a0d14] text-white overflow-hidden border-b border-white/10">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('/src/assets/images/banner_bumper_plates_promo_1790951639841.jpg')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14] via-[#0a0d14]/90 to-[#0a0d14]/75"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="max-w-2xl space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#84cc16]/20 border border-[#84cc16]/40 text-[#84cc16] text-[10px] font-black uppercase tracking-widest rounded-full">
                                    <Flame className="w-3.5 h-3.5 fill-current" />
                                    <span>Ventes Flash Limitées</span>
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
                                OFFRES & <span className="text-[#84cc16]">PROMOTIONS</span>
                            </h1>

                            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-lg">
                                Jusqu'à -40% sur une sélection exclusive de barres, disques bumper, haltères professionnels et bancs fitness.
                            </p>
                        </div>

                        {/* Flash Deal Countdown Timer */}
                        <div className="flex flex-col items-start lg:items-end gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#84cc16]" />
                                <span>Fin des offres dans :</span>
                            </span>
                            <CountdownTimer />
                        </div>
                    </div>

                    {/* Quick Category filter buttons */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
                        {promoTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSelectedCategory(tab.id)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                    selectedCategory === tab.id
                                        ? 'bg-[#84cc16] text-black shadow-md shadow-[#84cc16]/20'
                                        : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <Breadcrumb 
                    items={[
                        { name: 'Accueil', onClick: onNavigateHome }, 
                        { name: 'Fitness Shop', onClick: () => onNavigateToCategory('product-list') },
                        { name: 'Promotions' }
                    ]} 
                />
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                
                {/* Toolbar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xs">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            <strong className="text-slate-900 dark:text-white font-black">{promoProducts.length}</strong> articles en réduction immédiate
                        </span>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Trier par :</span>
                            <select 
                                value={sortOrder} 
                                onChange={(e) => setSortOrder(e.target.value)} 
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-1.5 px-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#84cc16] cursor-pointer"
                            >
                                <option value="discount-desc">Plus forte réduction</option>
                                <option value="price-asc">Prix Croissant</option>
                                <option value="price-desc">Prix Décroissant</option>
                                <option value="name-asc">Nom (A-Z)</option>
                            </select>
                        </div>

                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                            <button 
                                onClick={() => setViewMode('grid')} 
                                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-[#84cc16] shadow-xs' : 'text-slate-400'}`}
                                title="Grille"
                            >
                                <Squares2X2Icon className="w-4 h-4"/>
                            </button>
                            <button 
                                onClick={() => setViewMode('list')} 
                                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-[#84cc16] shadow-xs' : 'text-slate-400'}`}
                                title="Liste"
                            >
                                <Bars3Icon className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Promo Grid */}
                {promoProducts.length > 0 ? (
                    <div className={
                        viewMode === 'list'
                            ? 'space-y-4'
                            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'
                    }>
                        {promoProducts.map((product) => (
                            <div key={`promo-${product.id}`}>
                                {viewMode === 'list' ? (
                                    <ProductListItem 
                                        product={product} 
                                        onPreview={onPreview} 
                                        onNavigateToProductDetail={onNavigateToProductDetail}
                                    />
                                ) : (
                                    <ProductCard 
                                        product={product} 
                                        onPreview={onPreview} 
                                        onNavigateToProductDetail={onNavigateToProductDetail} 
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                        <Tag className="w-12 h-12 text-[#84cc16] mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucune offre active dans ce rayon</h3>
                        <p className="text-xs text-slate-500 mt-1">Revenez bientôt ou consultez l'ensemble de notre catalogue fitness.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export const PerformanceSpotlight: React.FC<{ config: any }> = ({ config }) => {
    if (!config) return null;
    return (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-6 sm:p-8 text-white">
            {config.image && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30" 
                    style={{ backgroundImage: `url('${config.image}')` }}
                />
            )}
            <div className="relative z-10 max-w-lg space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">Exclusivité</span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white" dangerouslySetInnerHTML={{ __html: config.title || '' }} />
                <p className="text-xs sm:text-sm text-slate-300 font-medium">{config.subtitle}</p>
                {config.buttonText && (
                    <button className="px-5 py-2.5 bg-[#84cc16] text-black font-extrabold text-xs uppercase rounded-xl hover:bg-[#72b012] transition-colors">
                        {config.buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export const MuscleBuilders: React.FC<{ config: any }> = ({ config }) => {
    if (!config) return null;
    return (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-6 sm:p-8 text-white">
            {config.image && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30" 
                    style={{ backgroundImage: `url('${config.image}')` }}
                />
            )}
            <div className="relative z-10 max-w-lg space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">Force & Volume</span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white" dangerouslySetInnerHTML={{ __html: config.title || '' }} />
                <p className="text-xs sm:text-sm text-slate-300 font-medium">{config.subtitle}</p>
                {config.buttonText && (
                    <button className="px-5 py-2.5 bg-white text-black font-extrabold text-xs uppercase rounded-xl hover:bg-slate-200 transition-colors">
                        {config.buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export const FlashDeal: React.FC<{ product?: any; onNavigateToProductDetail?: (id: number) => void; titleColor?: string; subtitleColor?: string; }> = ({
    product,
    onNavigateToProductDetail
}) => {
    if (!product) return null;
    return (
        <div className="rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-[#84cc16]/30 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-5">
                {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-contain rounded-xl bg-white/5 p-2 shrink-0" />
                )}
                <div>
                    <span className="inline-block px-2.5 py-1 bg-[#84cc16] text-black font-black text-[10px] uppercase rounded-md mb-2">Deal Flash</span>
                    <h4 className="text-lg font-black text-white uppercase">{product.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{product.description || 'Offre limitée dans le temps'}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-xl font-black text-[#84cc16] font-mono">{Number(product.price || 0).toFixed(3)} DT</span>
                        {product.oldPrice && <span className="text-xs text-slate-500 line-through font-mono">{Number(product.oldPrice).toFixed(3)} DT</span>}
                    </div>
                </div>
            </div>
            <button 
                onClick={() => onNavigateToProductDetail?.(product.id)}
                className="px-6 py-3 bg-[#84cc16] hover:bg-[#72b012] text-black font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
                Profiter du deal
            </button>
        </div>
    );
};
