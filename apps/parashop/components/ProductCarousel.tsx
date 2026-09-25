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
        <section className="relative">
            <div className="flex justify-between items-end mb-10 border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                <h2 
                    className="text-3xl md:text-5xl font-serif font-black italic uppercase tracking-tighter text-gray-900 dark:text-white"
                    dangerouslySetInnerHTML={{ __html: title }}
                ></h2>
                <div className="flex items-center space-x-4 mb-1">
                    <button onClick={() => scroll('left')} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:border-brand-neon hover:text-brand-neon transition-all" aria-label="Scroll left">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => scroll('right')} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:border-brand-neon hover:text-brand-neon transition-all" aria-label="Scroll right">
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <div ref={scrollRef} className="flex space-x-6 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory">
                {products.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-64 sm:w-72 snap-start">
                         <ProductCard 
                            product={product} 
                            onPreview={onPreview} 
                            onNavigateToProductDetail={onNavigateToProductDetail} 
                         />
                    </div>
                ))}
            </div>
        </section>
    );
};