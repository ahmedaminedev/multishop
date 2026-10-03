import React, { useMemo, useState } from 'react';
import type { Product, Pack, Advertisements, Category, Brand } from '../types';
import { HeroSection } from './HeroSection';
import { CategoryBar } from './CategoryBar';
import { ProductCard } from './ProductCard';
import { ShopByGoalSection } from './ShopByGoalSection';
import { CrossShopSynergy } from './CrossShopSynergy';
import { ArrowRight, Box, ShieldCheck, Truck, Wrench, Sparkles } from 'lucide-react';

interface HomePageProps {
    onNavigate: (categoryName: string) => void;
    onPreview: (product: Product) => void;
    onNavigateToPacks: () => void;
    products: Product[];
    packs: Pack[];
    advertisements: Advertisements;
    onNavigateToProductDetail: (productId: number) => void;
    categories: Category[];
    brands: Brand[];
}

export const HomePage: React.FC<HomePageProps> = ({ 
    onNavigate, 
    onNavigateToProductDetail,
    products,
    advertisements
}) => {
    const fitnessHome = advertisements?.fitnessHome;
    const heroConfig = fitnessHome?.hero;
    const promoConfig = fitnessHome?.promoBanner;

    const bestsellersTitle = fitnessHome?.bestsellersTitle || 'Nos Bestsellers';
    const bestsellersKicker = fitnessHome?.bestsellersKicker || 'LES PLUS VENDUS';
    const secondaryTitle = fitnessHome?.secondaryTitle || 'Compléments, Accessoires & Nutrition';
    const secondaryKicker = fitnessHome?.secondaryKicker || 'CATALOGUE COMPLET & NUTRITION';

    const promoTag = promoConfig?.tag || 'PROMOTION';
    const promoTitle = promoConfig?.title || "JUSQU'À";
    const promoDiscount = promoConfig?.discountHighlight || '-20%';
    const promoDesc = promoConfig?.description || "SUR UNE SÉLECTION D'HALTÈRES ET DISQUES";
    const promoButton = promoConfig?.buttonText || 'Voir la sélection';
    const promoCategory = promoConfig?.categoryTarget || 'Disques & Barres';
    const promoBg = promoConfig?.bgImage || '/src/assets/images/banner_bumper_plates_promo_1790951639841.jpg';

    // Curated bestsellers matching the screenshot with real backend data fallback
    const bestsellers = useMemo(() => {
        // Prioritize fitness equipment items
        const fitnessItems = products.filter(p => 
            p.category?.includes('Musculation') || 
            p.category?.includes('Haltères') || 
            p.category?.includes('Banc') || 
            p.category?.includes('Rack') || 
            p.category?.includes('Cardio') ||
            p.name?.toLowerCase().includes('haltère') ||
            p.name?.toLowerCase().includes('banc') ||
            p.name?.toLowerCase().includes('rack') ||
            p.name?.toLowerCase().includes('tapis')
        );

        if (fitnessItems.length >= 4) {
            return fitnessItems.slice(0, 4);
        }

        // Default mock matching capture if specific products not yet in state
        return [
            {
                id: 101,
                name: 'Haltères Hexagonaux 2x10kg',
                price: 169.000,
                oldPrice: 199.000,
                discount: 15,
                rating: 5,
                reviewsCount: 124,
                imageUrl: '/src/assets/images/category_halteres_poids_1790951598408.jpg',
                category: 'Haltères & Poids',
                quantity: 40
            },
            {
                id: 102,
                name: 'Banc Ajustable Pro',
                price: 349.000,
                oldPrice: 389.000,
                discount: 10,
                rating: 5,
                reviewsCount: 86,
                imageUrl: '/src/assets/images/category_banc_musculation_1790951610418.jpg',
                category: 'Bancs de Musculation',
                quantity: 25
            },
            {
                id: 103,
                name: 'Rack de Musculation',
                price: 1249.000,
                oldPrice: 1429.000,
                discount: 12,
                rating: 5,
                reviewsCount: 72,
                imageUrl: '/src/assets/images/category_rack_station_1790951619589.jpg',
                category: 'Racks & Stations',
                quantity: 15
            },
            {
                id: 104,
                name: 'Tapis de Course 2.5HP',
                price: 1299.000,
                oldPrice: 1399.000,
                discount: 8,
                rating: 5,
                reviewsCount: 66,
                imageUrl: '/src/assets/images/category_tapis_cardio_1790951629862.jpg',
                category: 'Cardio',
                quantity: 10
            }
        ];
    }, [products]);

    // Secondary collection: cardio & nutrition equipment
    const secondaryProducts = useMemo(() => {
        return products.slice(0, 8);
    }, [products]);

    return (
        <div className="w-full bg-[#f8fafc] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 flex flex-col">
            
            {/* 1. Hero Section matching screenshot */}
            <HeroSection 
                config={heroConfig}
                onExplore={() => onNavigate(heroConfig?.buttonCategory || 'Musculation')} 
            />

            {/* 2. Horizontal 7-Category Bar matching screenshot */}
            <CategoryBar onCategoryClick={onNavigate} />

            {/* 2.1 Tunisia Live Metrics Bar */}
            <div className="bg-slate-900 border-y border-slate-800 py-3.5 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                        <Truck className="w-4 h-4 text-[#84cc16] shrink-0" />
                        <span className="text-[11px] font-bold text-slate-300">
                            <strong className="text-white">+140 Tonnes</strong> livrées en Tunisie
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                        <ShieldCheck className="w-4 h-4 text-[#84cc16] shrink-0" />
                        <span className="text-[11px] font-bold text-slate-300">
                            Garantie <strong className="text-white">36 Mois</strong> châssis acier
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                        <Wrench className="w-4 h-4 text-[#84cc16] shrink-0" />
                        <span className="text-[11px] font-bold text-slate-300">
                            Service <strong className="text-white">Montage Pro</strong> disponible
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                        <Sparkles className="w-4 h-4 text-[#84cc16] shrink-0" />
                        <span className="text-[11px] font-bold text-slate-300">
                            Conseil coach <strong className="text-white">7j/7 gratuit</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* 2.3 Shop By Goal Section */}
            <ShopByGoalSection onSelectGoal={onNavigate} />

            {/* 3. Main Section: Bestsellers & Right Promo Banner matching screenshot */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-1 bg-[#84cc16] rounded-full inline-block"></span>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {bestsellersKicker}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {bestsellersTitle}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => onNavigate('product-list')}
                        className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-[#84cc16] flex items-center gap-1.5 transition-colors cursor-pointer group"
                    >
                        <span>Voir tous les produits</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Bestsellers Grid with Right Promo Banner */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                    
                    {/* Left: 4 Product Cards Grid (8 cols on XL) */}
                    <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {bestsellers.map((product: any) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onNavigateToProductDetail={onNavigateToProductDetail}
                            />
                        ))}
                    </div>

                    {/* Right: Promotional Card matching screenshot (4 cols on XL) */}
                    <div className="xl:col-span-4 relative rounded-2xl overflow-hidden bg-black text-white min-h-[320px] flex flex-col justify-between p-6 sm:p-8 shadow-sm">
                        
                        {/* Background photo of bumper plates */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                            style={{ 
                                backgroundImage: `url('${promoBg}')`
                            }}
                        >
                            {/* Dark gradient for text legibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <span className="inline-block bg-[#84cc16] text-black text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-sm tracking-wider mb-4">
                                {promoTag}
                            </span>

                            <h3 className="text-3xl sm:text-4xl font-black uppercase leading-none tracking-tight">
                                {promoTitle}<br />
                                <span className="text-[#84cc16]">{promoDiscount}</span>
                            </h3>

                            <p className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mt-3 max-w-[240px]">
                                {promoDesc}
                            </p>
                        </div>

                        <div className="relative z-10 pt-6">
                            <button
                                type="button"
                                onClick={() => onNavigate(promoCategory)}
                                className="px-5 py-2.5 border border-white/80 hover:border-[#84cc16] hover:bg-[#84cc16] hover:text-black text-white text-xs font-bold rounded-lg inline-flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <span>{promoButton}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                    </div>

                </div>

            </section>

            {/* 4. Secondary Catalog Section for Nutrition & Additional Fitness Products */}
            {secondaryProducts.length > 4 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full border-t border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                                {secondaryKicker}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {secondaryTitle}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigate('product-list')}
                            className="text-xs font-bold text-[#84cc16] hover:underline flex items-center gap-1"
                        >
                            Explorer tout le catalogue →
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {secondaryProducts.map((product: any) => (
                            <ProductCard
                                key={`sec-${product.id}`}
                                product={product}
                                onNavigateToProductDetail={onNavigateToProductDetail}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* 4.1 Cross-Shop Synergy with other filiales */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
                <CrossShopSynergy />
            </div>

        </div>
    );
};
