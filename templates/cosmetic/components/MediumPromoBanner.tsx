
import React, { useMemo } from 'react';
import type { MediumPromoAd, Product, Pack } from '../types';
import { ArrowUpRightIcon } from './IconComponents';

interface MediumPromoBannerProps {
    banner: MediumPromoAd;
    isPreview?: boolean;
    allProducts: Product[];
    allPacks: Pack[];
    onPreview: (product: Product) => void;
}

export const MediumPromoBanner: React.FC<MediumPromoBannerProps> = ({ banner, isPreview = false, allProducts, allPacks, onPreview }) => {

    // Common content layout for both preview and live modes
    const Content = () => (
        <>
            <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 max-w-2xl">
                 <h3 
                    className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white uppercase tracking-[0.15em] leading-tight mb-6"
                    dangerouslySetInnerHTML={{ __html: banner.title }}
                 >
                 </h3>
                 
                 <div className="w-12 h-0.5 bg-black dark:bg-white mb-6"></div>

                 <p 
                    className="font-sans text-lg text-gray-700 dark:text-gray-300 mb-10 font-light leading-relaxed max-w-sm"
                    dangerouslySetInnerHTML={{ __html: banner.subtitle }}
                 >
                 </p>
                 
                 {/* Modern Button - Uses the link from LinkBuilder */}
                 <a 
                    href={banner.link || "#"}
                    className="bg-black dark:bg-white text-white dark:text-black px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold cursor-pointer transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-200 inline-block w-fit hover:-translate-y-1 shadow-md hover:shadow-lg"
                 >
                    {banner.buttonText}
                 </a>
             </div>
        </>
    );

    if (isPreview) {
         return (
            <div className="relative h-[500px] overflow-hidden group bg-gray-100">
                <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                />
                {/* Gradient mimicking a solid color card on the left blending into image */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#F0F0F0] via-[#F0F0F0]/90 to-transparent dark:from-gray-900 dark:via-gray-900/90 w-3/4 md:w-2/3"></div>
                <Content />
            </div>
        );
    }

    return (
        <div className="relative h-[500px] overflow-hidden group rounded-sm shadow-sm hover:shadow-xl transition-shadow duration-500 bg-gray-100">
             <img 
                src={banner.image} 
                alt={banner.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
            />
             {/* Gradient Overlay: Solid on left, fading to transparent on right to reveal image */}
             <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5F5] via-[#F5F5F5]/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 w-full md:w-3/4 lg:w-2/3"></div>

             <Content />
        </div>
    );
};
