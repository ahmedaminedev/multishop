
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
    onNavigateToProductDetail: (productId: number | string) => void;
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
    
    // Calcul dynamique des sélections (Basé sur la config Admin)
    const newArrivalProducts = useMemo(() => {
        const config = advertisements.newArrivals;
        if (config && config.productIds && config.productIds.length > 0) {
            // Filtrer les produits qui correspondent aux IDs de la config
            const selected = products.filter(p => config.productIds.includes(p.id));
            
            // Trier pour respecter l'ordre d'insertion dans la config (optionnel mais recommandé)
            selected.sort((a, b) => config.productIds.indexOf(a.id) - config.productIds.indexOf(b.id));
            
            // Appliquer la limite définie par l'admin
            return selected.slice(0, config.limit || 8);
        }
        // Fallback: Si pas de config, prendre les 8 premiers
        return products.length > 0 ? products.slice(0, 8) : [];
    }, [products, advertisements.newArrivals]);

    // Filter products for the "Accessoires" Editorial List
    const accessoryProducts = useMemo(() => {
        return products.filter(p => p.category === 'Accessoires');
    }, [products]);

    // Calcul dynamique des sélections (Basé sur la config Admin)
    const summerSelectionProducts = useMemo(() => {
        const config = advertisements.summerSelection;
        if (config && config.productIds && config.productIds.length > 0) {
             // Filtrer les produits qui correspondent aux IDs de la config
            const selected = products.filter(p => config.productIds.includes(p.id));
            
            // Trier pour respecter l'ordre d'insertion dans la config
            selected.sort((a, b) => config.productIds.indexOf(a.id) - config.productIds.indexOf(b.id));
            
            // Appliquer la limite définie par l'admin
            return selected.slice(0, config.limit || 8);
        }
        
        // Fallback: Si pas de config, logique par défaut (mot clé)
        const summerItems = products.filter(p => 
            p.category.toLowerCase().includes('climat') || 
            p.name.toLowerCase().includes('climat') || 
            p.category.toLowerCase().includes('froid') ||
            p.category.toLowerCase().includes('ventilateur')
        );
        return summerItems.length > 0 ? summerItems.slice(0, 8) : products.slice(8, 16);
    }, [products, advertisements.summerSelection]);
    
    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-8">
            <main className="flex-1 min-w-0 relative z-10">
                <HeroSection slides={advertisements.heroSlides} />
                <TrustBadges badges={advertisements.trustBadges} />
                
                {newArrivalProducts.length > 0 && (
                    <ProductCarousel 
                        title={advertisements.newArrivals?.title || "Nouvelles Arrivées"} 
                        products={newArrivalProducts} 
                        onPreview={onPreview} 
                        onNavigateToProductDetail={onNavigateToProductDetail} 
                    />
                )}
                
                <AudioPromoBanner ads={advertisements.audioPromo} />
                
                {/* Section Accessoires Style Editorial */}
                {accessoryProducts.length > 0 && (
                    <EditorialProductList 
                        title="Accessoires"
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
                
                {/* Nouveau bloc Shoppable Videos (Gifts List) */}
                <ShoppableVideoCarousel videos={advertisements.shoppableVideos || []} />
                
                {/* Remplacement des SmallPromoBanners par le nouveau bloc Masonry */}
                <EditorialMasonry items={advertisements.editorialCollage || []} />
                
                {summerSelectionProducts.length > 0 && (
                    <ProductCarousel 
                        title={advertisements.summerSelection?.title || "Sélection d'été"} 
                        products={summerSelectionProducts} 
                        onPreview={onPreview} 
                        onNavigateToProductDetail={onNavigateToProductDetail} 
                    />
                )}
                
                {/* Virtual Try-On Block moved up */}
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
