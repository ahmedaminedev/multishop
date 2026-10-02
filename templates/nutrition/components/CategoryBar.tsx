import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CategoryBarProps {
    categories?: any[];
    onCategoryClick: (categoryName: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ onCategoryClick }) => {
    // 7 Category cards matching screenshot exactly
    const fitnessCategories = [
        {
            id: 'halteres',
            title: 'Haltères & Poids',
            image: '/src/assets/images/category_halteres_poids_1790951598408.jpg',
            query: 'Haltères & Poids'
        },
        {
            id: 'bancs',
            title: 'Bancs de Musculation',
            image: '/src/assets/images/category_banc_musculation_1790951610418.jpg',
            query: 'Bancs de Musculation'
        },
        {
            id: 'racks',
            title: 'Racks & Stations',
            image: '/src/assets/images/category_rack_station_1790951619589.jpg',
            query: 'Racks & Stations'
        },
        {
            id: 'cardio',
            title: 'Cardio',
            image: '/src/assets/images/category_tapis_cardio_1790951629862.jpg',
            query: 'Cardio'
        },
        {
            id: 'disques',
            title: 'Disques & Barres',
            image: '/src/assets/images/banner_bumper_plates_promo_1790951639841.jpg',
            query: 'Disques & Barres'
        },
        {
            id: 'kettlebells',
            title: 'Kettlebells',
            image: '/src/assets/images/category_halteres_poids_1790951598408.jpg',
            query: 'Cross Training'
        },
        {
            id: 'yoga',
            title: 'Fitness & Yoga',
            image: '/src/assets/images/category_banc_musculation_1790951610418.jpg',
            query: 'Fitness & Yoga'
        }
    ];

    return (
        <section className="w-full bg-slate-50/70 dark:bg-slate-900/50 py-6 sm:py-8 border-b border-slate-200/80 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
                    {fitnessCategories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onCategoryClick(cat.query)}
                            className="group bg-white dark:bg-slate-800/90 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
                        >
                            {/* Product silhouette / studio photo */}
                            <div className="aspect-[4/3] w-full flex items-center justify-center p-1.5 overflow-hidden mb-2">
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    loading="lazy"
                                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Label + arrow */}
                            <div className="flex items-center justify-between pt-1 gap-1">
                                <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#84cc16] transition-colors line-clamp-1 leading-tight">
                                    {cat.title}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#84cc16] group-hover:translate-x-0.5 transition-all shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
