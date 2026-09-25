

import React from 'react';
import type { Product } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
    title: string;
    products: Product[];
    onPreview: (product: Product) => void;
    onNavigateToProductDetail: (productId: number) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products, onPreview, onNavigateToProductDetail }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="my-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{title}</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label="Scroll left">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label="Scroll right">
                        <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>
            </div>
            <div ref={scrollRef} className="flex space-x-6 overflow-x-auto pb-4 no-scrollbar">
                {products.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-60 sm:w-64">
                         <ProductCard product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                    </div>
                ))}
            </div>
        </section>
    );
};