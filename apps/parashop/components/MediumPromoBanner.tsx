
import React from 'react';
import type { MediumPromoAd, Product, Pack } from '../types';
import { ArrowUpRightIcon, SparklesIcon } from './IconComponents';

interface MediumPromoBannerProps {
    banner: MediumPromoAd;
    isPreview?: boolean;
    allProducts: Product[];
    allPacks: Pack[];
    onPreview: (product: Product) => void;
}

export const MediumPromoBanner: React.FC<MediumPromoBannerProps> = ({ banner, isPreview = false }) => {
    return (
        <div className="relative h-[450px] md:h-[550px] overflow-hidden group rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(5,150,105,0.15)]">
            
            {/* Background Texture/Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#059669 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Content Layer */}
            <div className="absolute inset-0 flex flex-col md:flex-row items-stretch">
                
                {/* Text Side */}
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center relative z-20">
                    <div className="mb-6 flex items-center gap-3">
                        <span className="h-px w-8 bg-brand-primary"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Édition Limitée</span>
                    </div>

                    <h3 
                        className="font-serif text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tighter"
                        dangerouslySetInnerHTML={{ __html: banner.title }}
                    ></h3>
                    
                    <p 
                        className="text-slate-500 dark:text-slate-400 text-base md:text-lg mb-10 font-medium leading-relaxed max-w-sm italic"
                        dangerouslySetInnerHTML={{ __html: banner.subtitle }}
                    ></p>
                    
                    <div>
                        <a 
                            href={banner.link || "#"}
                            className="inline-flex items-center gap-4 bg-brand-primary text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand-primaryHover transition-all shadow-xl shadow-brand-primary/20 hover:-translate-y-1"
                        >
                            {banner.buttonText}
                            <ArrowUpRightIcon className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Image Side - Asymmetrical & Immersive */}
                <div className="w-full md:w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50 dark:bg-white/5"></div>
                    <img 
                        src={banner.image} 
                        alt={banner.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    
                    {/* Artistic Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-900 via-transparent to-transparent hidden md:block"></div>
                    
                    {/* Floating Seal Icon */}
                    <div className="absolute bottom-8 right-8 w-24 h-24 border border-white/30 rounded-full flex items-center justify-center backdrop-blur-md animate-spin-slow">
                        <SparklesIcon className="w-10 h-10 text-white opacity-60" />
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                             <defs>
                                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                             </defs>
                             <text className="text-[8px] font-black uppercase tracking-[0.2em] fill-white opacity-40">
                                <textPath href="#circlePath">Certification Laboratoire • PharmaNature •</textPath>
                             </text>
                        </svg>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
            `}</style>
        </div>
    );
};
