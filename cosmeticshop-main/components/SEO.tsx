
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    productData?: {
        price: number;
        currency: string;
        availability: 'InStock' | 'OutOfStock' | 'PreOrder';
        brand?: string;
        sku?: string;
    };
}

export const SEO: React.FC<SEOProps> = ({ 
    title, 
    description = "Votre destination beauté ultime. Découvrez nos gammes de maquillage, soins de la peau et parfums de luxe.", 
    image = "/favicon.svg", 
    url = window.location.href,
    type = 'website',
    productData
}) => {
    const siteTitle = "Cosmetics Shop";
    const fullTitle = `${title} | ${siteTitle}`;

    const structuredData = type === 'product' && productData ? {
        "@context": "http://schema.org",
        "@type": "Product",
        "name": title,
        "description": description,
        "image": image,
        "sku": productData.sku || `SKU-${Date.now()}`,
        "brand": {
            "@type": "Brand",
            "name": productData.brand || siteTitle
        },
        "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": productData.currency || "TND",
            "price": productData.price,
            "availability": `http://schema.org/${productData.availability}`,
            "itemCondition": "http://schema.org/NewCondition"
        }
    } : {
        "@context": "http://schema.org",
        "@type": "WebSite",
        "name": siteTitle,
        "url": window.location.origin
    };

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
            
            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};
