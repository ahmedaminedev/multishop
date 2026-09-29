import React, { useState } from 'react';
import type { Product } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface SpecificationSliderProps {
    products: Product[];
    title?: string;
}

export const SpecificationSlider: React.FC<SpecificationSliderProps> = ({ products, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        setCurrentIndex(prev => (prev === 0 ? products.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex(prev => (prev === products.length - 1 ? 0 : prev + 1));
    };

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            {title && <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{title}</h3>}
            <div className="relative">
                <div className="overflow-hidden rounded-lg">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {products.map(product => (
                            <div key={product.id} className="w-full flex-shrink-0 px-1">
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b dark:border-gray-600">
                                    <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-contain rounded-md bg-white p-1"/>
                                    <div>
                                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{product.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>
                                    </div>
                                </div>

                                {(product.specifications && product.specifications.length > 0) ? (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <dl>
                                            {product.specifications.map((spec, index) => (
                                                <div key={index} className={`grid grid-cols-2 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800/50' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                                                    <dt className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 border-r border-dotted dark:border-gray-600">
                                                        {spec.name}
                                                    </dt>
                                                    <dd className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                        {spec.value}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucune fiche technique pour ce produit.</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {products.length > 1 && (
                    <>
                        <button onClick={goToPrevious} className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all hover:scale-110" aria-label="Précédent">
                            <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>
                        <button onClick={goToNext} className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all hover:scale-110" aria-label="Suivant">
                            <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>
                    </>
                )}
            </div>
             <div className="flex justify-center items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                {products.length > 1 && products.map((_, index) => (
                    <button 
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-red-600 scale-125' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'}`}
                        aria-label={`Aller au produit ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
