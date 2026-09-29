
import React from 'react';
import type { Product } from '../types';

interface ProductHighlightsProps {
    highlights: Product['highlights'];
}

export const ProductHighlights: React.FC<ProductHighlightsProps> = ({ highlights }) => {
    if (!highlights || !highlights.imageUrl) return null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 my-12">
            <div className="flex flex-col md:flex-row">
                
                {/* Text Content (Left) */}
                <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <h2 className="font-serif text-3xl text-gray-900 dark:text-white font-bold mb-8 lowercase first-letter:capitalize">
                        {highlights.title || "Pourquoi on l'adore"}
                    </h2>

                    <div className="space-y-8">
                        {highlights.sections.map((section, idx) => (
                            <div key={idx} className="animate-fadeIn" style={{ animationDelay: `${idx * 100}ms` }}>
                                {section.subtitle && (
                                    <h3 className="font-serif text-lg text-rose-400 dark:text-rose-300 font-bold mb-3 lowercase">
                                        {section.subtitle}
                                    </h3>
                                )}
                                <ul className="space-y-4">
                                    {section.features.map((feature, fIdx) => (
                                        <li key={fIdx}>
                                            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                                                {feature.title}
                                            </span>
                                            {feature.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 font-light leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Image (Right) */}
                <div className="w-full md:w-1/2 h-[400px] md:h-auto relative overflow-hidden bg-gray-50 dark:bg-gray-800">
                    <img 
                        src={highlights.imageUrl} 
                        alt="Product result" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                </div>
            </div>
        </div>
    );
};
