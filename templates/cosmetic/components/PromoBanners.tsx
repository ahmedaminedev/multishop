import React from 'react';
import type { MediumPromoAd, Product, Pack } from '../types';
import { MediumPromoBanner } from './MediumPromoBanner';

interface PromoBannersProps {
    banners: [MediumPromoAd, MediumPromoAd];
    allProducts: Product[];
    allPacks: Pack[];
    onPreview: (product: Product) => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({ banners, allProducts, allPacks, onPreview }) => {
    return (
        <section className="my-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {banners.map(banner => (
                <MediumPromoBanner 
                    key={banner.id} 
                    banner={banner} 
                    allProducts={allProducts}
                    allPacks={allPacks}
                    onPreview={onPreview}
                />
            ))}
        </section>
    );
};