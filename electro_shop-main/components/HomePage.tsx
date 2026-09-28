
import React, { useMemo } from 'react';
import type { Product, Pack, Advertisements, Category, Brand } from '../types';
import { VerticalNav } from './VerticalNav';
import { HeroSection } from './HeroSection';
import { TrustBadges } from './TrustBadges';
import { DestockageCarousel } from './DestockageBanner';
import { ProductCarousel } from './ProductCarousel';
import { AudioPromoBanner } from './AudioPromoBanner';
import { PromoBanners } from './PromoBanners';
import { SmallPromoBanners } from './SmallPromoBanners';
import { ProductGridSection } from './ProductGridSection';
import { BrandCarousel } from './BrandCarousel';

interface HomePageProps {
    onNavigate: (categoryName: string) => void;
    isNavCollapsed: boolean;
    onToggleNav: () => void;
    onPreview: (product: Product) => void;
    onNavigateToPacks: () => void;
    products: Product[];
    packs: Pack[];
    advertisements: Advertisements;
    onNavigateToProductDetail: (productId: number | string) => void;
    categories: Category[];
    brands: Brand[];
}

export const HomePage: React.FC<HomePageProps> = ({ 
    onNavigate, 
    isNavCollapsed, 
    onToggleNav, 
    onPreview, 
    onNavigateToPacks, 
    products, 
    packs, 
    advertisements, 
    onNavigateToProductDetail, 
    categories, 
    brands 
}) => {
    
    // Calcul dynamique des sélections (Nouveautés = derniers produits)
    const newArrivalProducts = useMemo(() => {
        return products.length > 0 ? products.slice(0, 8) : [];
    }, [products]);

    // Calcul dynamique des sélections (Été = produits avec mots clés spécifiques)
    const summerSelectionProducts = useMemo(() => {
        const summerItems = products.filter(p => 
            p.category.toLowerCase().includes('climat') || 
            p.name.toLowerCase().includes('climat') || 
            p.category.toLowerCase().includes('froid') ||
            p.category.toLowerCase().includes('ventilateur')
        );
        return summerItems.length > 0 ? summerItems.slice(0, 8) : products.slice(8, 16);
    }, [products]);
    
    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Sidebar - Visible on Mobile too, controlled by isNavCollapsed inside VerticalNav */}
                <aside className={`relative z-20 shrink-0 transition-all duration-300 w-full ${isNavCollapsed ? 'lg:w-20' : 'lg:w-1/4 xl:w-1/5'}`}>
                    <VerticalNav
                        categories={categories}
                        isCollapsed={isNavCollapsed}
                        onToggleCollapse={onToggleNav}
                        onCategoryClick={onNavigate}
                        onNavigateToPacks={onNavigateToPacks}
                    />
                </aside>
                
                <main className="flex-1 min-w-0 relative z-10">
                    <HeroSection slides={advertisements.heroSlides} />
                    <TrustBadges />
                    <DestockageCarousel ads={advertisements.destockage} />
                    
                    {newArrivalProducts.length > 0 && (
                        <ProductCarousel 
                            title="Nouvelles Arrivées" 
                            products={newArrivalProducts} 
                            onPreview={onPreview} 
                            onNavigateToProductDetail={onNavigateToProductDetail} 
                        />
                    )}
                    
                    <AudioPromoBanner ads={advertisements.audioPromo} />
                    
                    <PromoBanners 
                        banners={advertisements.promoBanners}
                        allProducts={products}
                        allPacks={packs}
                        onPreview={onPreview}
                    />
                    
                    <SmallPromoBanners ads={advertisements.smallPromoBanners} />
                    
                    {summerSelectionProducts.length > 0 && (
                        <ProductCarousel 
                            title="Sélection d'été" 
                            products={summerSelectionProducts} 
                            onPreview={onPreview} 
                            onNavigateToProductDetail={onNavigateToProductDetail} 
                        />
                    )}
                    
                    <ProductGridSection allProducts={products} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                    <BrandCarousel brands={brands} />
                </main>
            </div>
        </div>
    );
};
