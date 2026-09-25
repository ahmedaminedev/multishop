import React, { useMemo } from 'react';
import type { Product, Pack, Advertisements, Category, Brand } from '../types';
import { HeroSection } from './HeroSection';
import { TrustBadges } from './TrustBadges';
import { ProductCarousel } from './ProductCarousel';
import { AudioPromoBanner } from './AudioPromoBanner';
import { PromoBanners } from './PromoBanners';
import { EditorialMasonry } from './EditorialMasonry';
import { ProductGridSection } from './ProductGridSection';
import { BrandCarousel } from './BrandCarousel';
import { EditorialProductList } from './EditorialProductList';
import { ShoppableVideoCarousel } from './ShoppableVideoCarousel';
import { VirtualTryOnSection } from './VirtualTryOnSection';

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
    onPreview, 
    onNavigateToPacks, 
    products, 
    packs, 
    advertisements, 
    onNavigateToProductDetail, 
    categories, 
    brands 
}) => {
    
    const newArrivalProducts = useMemo(() => {
        const config = advertisements.newArrivals;
        if (config && config.productIds && config.productIds.length > 0) {
            const selected = products.filter(p => config.productIds.includes(p.id));
            selected.sort((a, b) => config.productIds.indexOf(a.id) - config.productIds.indexOf(b.id));
            return selected.slice(0, config.limit || 8);
        }
        return products.length > 0 ? products.slice(0, 8) : [];
    }, [products, advertisements.newArrivals]);

    const accessoryProducts = useMemo(() => {
        return products.filter(p => p.category === 'Accessoires');
    }, [products]);

    const summerSelectionProducts = useMemo(() => {
        const config = advertisements.summerSelection;
        if (config && config.productIds && config.productIds.length > 0) {
            const selected = products.filter(p => config.productIds.includes(p.id));
            selected.sort((a, b) => config.productIds.indexOf(a.id) - config.productIds.indexOf(b.id));
            return selected.slice(0, config.limit || 8);
        }
        return products.slice(8, 16);
    }, [products, advertisements.summerSelection]);
    
    return (
        <div className="bg-gray-50 dark:bg-brand-black transition-colors duration-300">
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-20">
                <HeroSection slides={advertisements.heroSlides} />
                
                <TrustBadges badges={advertisements.trustBadges} />
                
                {newArrivalProducts.length > 0 && (
                    <ProductCarousel 
                        title="Nouveaux <span class='text-brand-neon'>Renforts</span>" 
                        products={newArrivalProducts} 
                        onPreview={onPreview} 
                        onNavigateToProductDetail={onNavigateToProductDetail} 
                    />
                )}
                
                <AudioPromoBanner ads={advertisements.audioPromo} />
                
                {accessoryProducts.length > 0 && (
                    <EditorialProductList 
                        title="Équipement Tactique"
                        products={accessoryProducts} 
                        onPreview={onPreview}
                        onNavigateToProductDetail={onNavigateToProductDetail}
                    />
                )}
                
                <PromoBanners 
                    banners={advertisements.promoBanners}
                    allProducts={products}
                    allPacks={packs}
                    onPreview={onPreview}
                />
                
                <ShoppableVideoCarousel videos={advertisements.shoppableVideos || []} />
                
                <EditorialMasonry items={advertisements.editorialCollage || []} />
                
                {summerSelectionProducts.length > 0 && (
                    <ProductCarousel 
                        title="Objectif <span class='text-brand-neon'>Sèche Absolue</span>" 
                        products={summerSelectionProducts} 
                        onPreview={onPreview} 
                        onNavigateToProductDetail={onNavigateToProductDetail} 
                    />
                )}
                
                <VirtualTryOnSection config={advertisements.virtualTryOn} />

                <ProductGridSection 
                    allProducts={products} 
                    onPreview={onPreview} 
                    onNavigateToProductDetail={onNavigateToProductDetail}
                    config={advertisements.featuredGrid}
                />
                
                <BrandCarousel brands={brands} />
            </main>
        </div>
    );
};