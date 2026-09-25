
import React, { useRef } from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon, ArrowLongLeftIcon } from './IconComponents';

interface EditorialProductListProps {
    title: string;
    products: Product[];
    onPreview: (product: Product) => void;
    onNavigateToProductDetail: (productId: number) => void;
}

export const EditorialProductList: React.FC<EditorialProductListProps> = ({ title, products, onPreview, onNavigateToProductDetail }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.75;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="my-20 relative px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
            {/* Header: Title Centered, Navigation Right */}
            <div className="relative flex items-center justify-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white text-center">
                    {title}
                </h2>
                
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4">
                    <button 
                        onClick={() => scroll('left')} 
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2"
                        aria-label="Previous items"
                    >
                        <ChevronLeftIcon className="w-8 h-8 font-light" />
                    </button>
                    <button 
                        onClick={() => scroll('right')} 
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2"
                        aria-label="Next items"
                    >
                        <ChevronRightIcon className="w-8 h-8 font-light" />
                    </button>
                </div>
            </div>

            {/* Scrollable List */}
            <div 
                ref={scrollRef} 
                className="flex space-x-6 overflow-x-auto pb-8 no-scrollbar snap-x snap-mandatory"
                style={{ scrollBehavior: 'smooth' }}
            >
                {products.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start">
                         <ProductCard product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                    </div>
                ))}
            </div>
        </section>
    );
};
