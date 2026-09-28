
import React, { useMemo } from 'react';
import type { Product, Pack, Advertisements, Category, Brand } from '../types';
import { HeroSection } from './HeroSection';
import { TrustBadges } from './TrustBadges';
import { ProductCarousel } from './ProductCarousel';
import { PromoBanners } from './PromoBanners';
import { ProductGridSection } from './ProductGridSection';
import { BrandCarousel } from './BrandCarousel';
import { VirtualTryOnSection } from './VirtualTryOnSection';
import { SEO } from './SEO';
import { CheckCircleIcon, ArrowUpRightIcon } from './IconComponents';

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
    onPreview, 
    products, 
    packs, 
    advertisements, 
    onNavigateToProductDetail, 
    brands 
}) => {
    
    const favorites = useMemo(() => products.filter(p => p.promo).slice(0, 8), [products]);
    const rituals = useMemo(() => packs.slice(0, 3), [packs]);
    
    return (
        <div className="bg-brand-bg dark:bg-brand-dark transition-colors duration-500 overflow-hidden">
            <SEO title="ACCUEIL" description="Bienvenue chez PharmaNature, votre parapharmacie d'excellence pour vos cures de santé naturelle." />
            
            {/* Espacement compact pour éviter le vide inutile */}
            <main className="max-w-screen-2xl mx-auto px-6 lg:px-12 space-y-12 lg:space-y-16 pb-24">
                
                <section aria-label="Bannière d'accueil" className="pt-4">
                    <HeroSection slides={advertisements.heroSlides} />
                </section>
                
                <div className="relative -mt-10 z-20">
                    <TrustBadges badges={advertisements.trustBadges} />
                </div>
                
                <section className="relative scroll-mt-24" id="rituels">
                    <div className="text-center mb-8 relative z-10">
                        <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[9px] mb-2 block">CURES SPÉCIALISÉES</span>
                        <h2 className="text-3xl md:text-5xl font-serif font-black text-gray-900 dark:text-white tracking-tight uppercase">
                            NOS <span className="text-brand-primary italic">PACKS</span> DE SOIN
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        {rituals.map(pack => (
                            <article key={pack.id} className="group cursor-pointer bg-white dark:bg-white/5 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 overflow-hidden">
                                <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl mb-4 flex items-center justify-center shadow-lg">
                                    <CheckCircleIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2 uppercase">{pack.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed line-clamp-2 italic">{pack.description}</p>
                                <button className="text-brand-primary font-black uppercase text-[8px] tracking-[0.2em] border-b-2 border-brand-primary/20 pb-1 group-hover:border-brand-primary transition-all inline-flex items-center gap-2">
                                    DÉCOUVRIR LE PACK <ArrowUpRightIcon className="w-3 h-3"/>
                                </button>
                            </article>
                        ))}
                    </div>
                </section>

                <section aria-label="Nos produits phares">
                    <ProductCarousel 
                        title="LES <span class='text-brand-primary'>INCONTOURNABLES</span> SANTÉ" 
                        products={favorites} 
                        onPreview={onPreview} 
                        onNavigateToProductDetail={onNavigateToProductDetail} 
                    />
                </section>
                
                <section aria-label="Expertise médicale">
                    <VirtualTryOnSection config={advertisements.virtualTryOn} />
                </section>

                <section aria-label="Promotions exclusives">
                    <PromoBanners 
                        banners={advertisements.promoBanners}
                        allProducts={products}
                        allPacks={packs}
                        onPreview={onPreview}
                    />
                </section>
                
                <section aria-label="Laboratoires partenaires" className="pb-8">
                    <BrandCarousel brands={brands} />
                </section>
            </main>
        </div>
    );
};
