import React, { useState, useMemo } from 'react';
import type { Product, FeaturedGridConfig } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronRightIcon } from './IconComponents';

interface ProductGridSectionProps {
    allProducts: Product[];
    onPreview: (product: Product) => void;
    onNavigateToProductDetail: (productId: number) => void;
    config?: FeaturedGridConfig;
}

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({ allProducts, onPreview, onNavigateToProductDetail, config }) => {
    const [activeTab, setActiveTab] = useState('En promotion');

    const useCustomSelection = config && config.productIds && config.productIds.length > 0;

    const filteredProducts = useMemo(() => {
        if (useCustomSelection) {
            return allProducts.filter(p => config!.productIds.includes(p.id));
        }

        if (activeTab === 'En promotion') {
            return allProducts.filter(p => p.promo).slice(0, 8);
        }
        if (activeTab === 'Les plus vendus') {
            return [...allProducts].sort((a, b) => (b.discount || 0) - (a.discount || 0)).slice(0, 8);
        }
        return [...allProducts].reverse().slice(0, 8);
    }, [activeTab, allProducts, config]);

    const TABS = ['Nouveautés', 'En promotion', 'Les plus vendus'];

    return (
        <section className="py-12">
            {!useCustomSelection ? (
                <div className="flex justify-center items-center mb-12 border-b-2 border-gray-100 dark:border-gray-800">
                    {TABS.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`px-8 py-4 font-serif font-black uppercase italic tracking-wider transition-all relative ${activeTab === tab ? 'text-brand-neon' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {tab}
                            {activeTab === tab && <span className="absolute bottom-[-2px] left-0 right-0 h-1 bg-brand-neon shadow-[0_0_10px_#ccff00]"></span>}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="mb-12 text-center relative">
                     <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 dark:bg-gray-800 -z-10"></div>
                     <h2 
                        className="text-4xl md:text-6xl font-serif font-black italic text-gray-900 dark:text-white uppercase tracking-tighter inline-block px-8 bg-gray-50 dark:bg-brand-black transition-colors"
                        dangerouslySetInnerHTML={{ __html: config?.title || "Sélection Stratégique" }}
                    ></h2>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onPreview={onPreview} 
                        onNavigateToProductDetail={onNavigateToProductDetail} 
                    />
                ))}
            </div>

            <div className="mt-20 text-center">
                <a 
                    href={config?.buttonLink || "#"} 
                    className="group relative inline-flex items-center justify-center px-12 py-5 overflow-hidden bg-black dark:bg-white text-white dark:text-black font-black uppercase slant hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all duration-500"
                >
                    <span className="absolute inset-0 w-full h-full bg-brand-neon translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500"></span>
                    <span className="relative flex items-center gap-3 text-sm tracking-widest group-hover:text-black transition-colors duration-500">
                        <span className="slant-reverse block flex items-center gap-3">
                            {config?.buttonText || "VOIR TOUT LE CATALOGUE"}
                            <ChevronRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                        </span>
                    </span>
                </a>
            </div>
        </section>
    );
};