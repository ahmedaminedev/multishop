
import React from 'react';
import type { SmallPromoAd, DiscountPromoAd, PriceStartPromoAd, FlashSalePromoAd } from '../types';

const DiscountBanner: React.FC<{ banner: DiscountPromoAd, isPreview?: boolean }> = ({ banner, isPreview }) => {
    const WrapperComponent = isPreview ? 'div' : 'a';
    const wrapperProps = isPreview ? {} : { href: "#" };
    
    return (
        <WrapperComponent {...wrapperProps} className={`relative rounded-lg overflow-hidden group block bg-gradient-to-br ${banner.bgGradient} p-6 flex flex-col justify-between h-64 md:h-auto md:aspect-square shadow-lg ${!isPreview ? 'hover:shadow-2xl transition-shadow duration-300' : ''}`}>
            <div className="relative z-10">
                <div className="bg-yellow-400 text-blue-900 font-bold px-4 py-1 inline-block rounded-md shadow">{banner.promoText}</div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mt-2">{banner.title}</h3>
                <p className="text-5xl lg:text-6xl font-extrabold text-white leading-none mt-1">{banner.discount}</p>
            </div>
            <img
                src={banner.image}
                alt={banner.title}
                className={`absolute bottom-0 right-0 w-3/4 object-contain drop-shadow-2xl ${!isPreview ? 'transition-transform duration-500 ease-in-out group-hover:scale-110' : ''}`}
            />
        </WrapperComponent>
    );
};

const PriceStartBanner: React.FC<{ banner: PriceStartPromoAd, isPreview?: boolean }> = ({ banner, isPreview }) => {
    const WrapperComponent = isPreview ? 'div' : 'a';
    const wrapperProps = isPreview ? {} : { href: "#" };

    return (
        <WrapperComponent {...wrapperProps} className={`relative rounded-lg overflow-hidden group block bg-gradient-to-br ${banner.bgGradient} p-6 flex flex-col justify-between h-64 md:h-auto md:aspect-square shadow-lg ${!isPreview ? 'hover:shadow-2xl transition-shadow duration-300' : ''}`}>
            <div className="relative z-10">
                <h3 className="text-2xl lg:text-3xl font-bold text-white">{banner.title}</h3>
                <ul className="text-white mt-2 list-disc list-inside space-y-1">
                    {banner.features?.map(feature => <li key={feature}>{feature}</li>)}
                </ul>
            </div>
            <img
                src={banner.image}
                alt={banner.title}
                className={`absolute -bottom-4 right-0 w-full object-contain drop-shadow-2xl ${!isPreview ? 'transition-transform duration-500 ease-in-out group-hover:scale-105' : ''}`}
            />
            <div className="relative z-10 mt-auto self-start">
                <p className="text-lg text-white">{banner.priceStartText}</p>
                <div className="bg-yellow-400 text-blue-900 font-bold px-4 py-2 inline-block rounded-md text-2xl shadow">{banner.price}<sup className="text-sm align-super">{banner.priceUnit}</sup></div>
            </div>
        </WrapperComponent>
    );
};

const FlashSaleBanner: React.FC<{ banner: FlashSalePromoAd, isPreview?: boolean }> = ({ banner, isPreview }) => {
    const WrapperComponent = isPreview ? 'div' : 'a';
    const wrapperProps = isPreview ? {} : { href: "#" };

    return (
        <WrapperComponent {...wrapperProps} className={`relative rounded-lg overflow-hidden group block bg-gradient-to-br ${banner.bgGradient} p-6 flex flex-col justify-end h-64 md:h-auto md:aspect-square shadow-lg ${!isPreview ? 'hover:shadow-2xl transition-shadow duration-300' : ''}`}>
            <img
                src={banner.image}
                alt={banner.title || banner.flashTitle}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-3/4 object-contain drop-shadow-2xl ${!isPreview ? 'transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:rotate-6' : ''}`}
            />
            <div className="relative z-10 text-gray-900 text-center">
                <h3 className="text-xl font-bold">{banner.flashTitle}</h3>
                <p className="text-4xl lg:text-5xl font-extrabold my-1" dangerouslySetInnerHTML={{ __html: banner.discountText || '' }}></p>
                <p className="font-semibold text-sm">{banner.flashSubtitle}</p>
                <div className="mt-2 inline-block bg-red-600 text-white font-bold px-3 py-1 text-xs rounded-full shadow-md">
                    {banner.notice}
                </div>
            </div>
        </WrapperComponent>
    );
};

export const SmallPromoBanner: React.FC<{ banner: SmallPromoAd, isPreview?: boolean }> = ({ banner, isPreview }) => {
    switch (banner.type) {
        case 'discount':
            return <DiscountBanner banner={banner} isPreview={isPreview} />;
        case 'price_start':
            return <PriceStartBanner banner={banner} isPreview={isPreview} />;
        case 'flash_sale':
            return <FlashSaleBanner banner={banner} isPreview={isPreview} />;
        default:
            return null;
    }
};
