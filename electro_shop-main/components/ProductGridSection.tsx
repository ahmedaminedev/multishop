

import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridSectionProps {
    allProducts: Product[];
    onPreview: (product: Product) => void;
    onNavigateToProductDetail: (productId: number) => void;
}

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({ allProducts, onPreview, onNavigateToProductDetail }) => {
    const [activeTab, setActiveTab] = useState('En promotion');

    const filteredProducts = useMemo(() => {
        if (activeTab === 'En promotion') {
            return allProducts.filter(p => p.promo).slice(0, 8);
        }
        if (activeTab === 'Les plus vendus') {
            // Faking "best selling" by sorting by discount
            return [...allProducts].sort((a, b) => (b.discount || 0) - (a.discount || 0)).slice(0, 8);
        }
        // Faking "newest" by reversing the array
        return [...allProducts].reverse().slice(0, 8);
    }, [activeTab, allProducts]);

    const TABS = ['Nouveautés', 'En promotion', 'Les plus vendus'];

    return (
        <section className="my-12">
            <div className="flex justify-center items-center mb-8 border-b dark:border-gray-700">
                {TABS.map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`px-6 py-3 font-semibold text-lg relative transition-colors ${activeTab === tab ? 'text-red-600' : 'text-gray-600 dark:text-gray-400 hover:text-red-500'}`}
                    >
                        {tab}
                        {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                ))}
            </div>

            <div className="mt-12 text-center">
                <a href="#" className="bg-red-600 text-white font-bold py-3 px-12 rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105">
                    Voir tous les produits
                </a>
            </div>
        </section>
    );
};