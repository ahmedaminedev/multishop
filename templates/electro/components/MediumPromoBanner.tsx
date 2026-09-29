import React, { useMemo } from 'react';
import type { MediumPromoAd, Product, Pack } from '../types';
import { ChevronDownIcon } from './IconComponents';

interface MediumPromoBannerProps {
    banner: MediumPromoAd;
    isPreview?: boolean;
    allProducts: Product[];
    allPacks: Pack[];
    onPreview: (product: Product) => void;
}

const getProductsFromPack = (packId: number, allProducts: Product[], allPacks: Pack[]): Product[] => {
    const pack = allPacks.find(p => p.id === packId);
    if (!pack) return [];
    
    let productIds = new Set<number>();

    const collectProductIds = (p: Pack) => {
        p.includedProductIds.forEach(id => productIds.add(id));
        if (p.includedPackIds) {
            p.includedPackIds.forEach(subPackId => {
                const subPack = allPacks.find(sp => sp.id === subPackId);
                if (subPack) {
                    collectProductIds(subPack);
                }
            });
        }
    }
    
    collectProductIds(pack);
    
    return allProducts.filter(p => productIds.has(p.id));
};

export const MediumPromoBanner: React.FC<MediumPromoBannerProps> = ({ banner, isPreview = false, allProducts, allPacks, onPreview }) => {

    const productsToShow = useMemo(() => {
        if (banner.linkType === 'category') {
            return allProducts.filter(p => p.category === banner.linkTarget);
        }
        if (banner.linkType === 'pack') {
            const packId = parseInt(banner.linkTarget, 10);
            if (isNaN(packId)) return [];
            return getProductsFromPack(packId, allProducts, allPacks);
        }
        return [];
    }, [banner, allProducts, allPacks]);
    
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const productId = parseInt(e.target.value, 10);
        if (productId) {
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                onPreview(product);
            }
            // Reset select to default option after selection
            e.target.value = "";
        }
    };
    
    if (isPreview) {
         return (
            <div className="relative rounded-lg overflow-hidden h-64 bg-cover bg-center" style={{ backgroundImage: `url('${banner.image}')`}}>
                 <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center p-6 text-center">
                     <h3 className="text-2xl font-bold text-white mb-2">{banner.title}</h3>
                     <p className="text-white mb-4">{banner.subtitle}</p>
                     <div className="relative z-10 mt-4">
                        <div className="bg-white text-gray-800 font-bold py-2 px-6 rounded-full inline-flex items-center gap-2 cursor-not-allowed opacity-75">
                            <span>{banner.buttonText}</span>
                            <ChevronDownIcon className="w-5 h-5" />
                        </div>
                    </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-lg overflow-hidden h-64 bg-cover bg-center group" style={{ backgroundImage: `url('${banner.image}')`}}>
             <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center p-6 text-center transition-all duration-300 group-hover:bg-opacity-50">
                 <h3 className="text-2xl font-bold text-white mb-2 transition-transform duration-300 group-hover:-translate-y-1">{banner.title}</h3>
                 <p className="text-white mb-4 transition-transform duration-300 group-hover:-translate-y-1">{banner.subtitle}</p>
                 <div className="relative z-10 mt-4 transition-transform duration-300 group-hover:scale-105">
                    <select 
                        onChange={handleSelectChange}
                        className="bg-white text-gray-800 font-bold py-2 px-6 rounded-full appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white cursor-pointer shadow-lg"
                        defaultValue=""
                        aria-label={`Sélectionner un produit pour ${banner.title}`}
                    >
                        <option value="" disabled>{banner.buttonText}</option>
                        {productsToShow.length > 0 ? (
                            productsToShow.map(product => (
                                <option key={product.id} value={product.id} disabled={product.quantity === 0}>
                                    {product.name} - {product.price.toFixed(0)} DT {product.quantity === 0 ? '(Épuisé)' : ''}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>Aucun produit disponible</option>
                        )}
                    </select>
                    <ChevronDownIcon className="w-5 h-5 text-gray-800 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
             </div>
        </div>
    );
};