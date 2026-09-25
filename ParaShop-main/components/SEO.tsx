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
        category?: string;
    };
}

export const SEO: React.FC<SEOProps> = ({ 
    title, 
    description = "PharmaNature : Votre expert en micronutrition et soins naturels certifiés. Rituels bien-être et conseils pharmaceutiques personnalisés.", 
    image = "/favicon.svg", 
    url = window.location.href,
    type = 'website',
    productData
}) => {
    const siteTitle = "PharmaNature";
    const fullTitle = `${title} | ${siteTitle}`;

    // Schema.org Structured Data
    const structuredData = type === 'product' && productData ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": title,
        "image": image.startsWith('http') ? image : `${window.location.origin}${image}`,
        "description": description,
        "sku": productData.sku || `PN-${Date.now()}`,
        "brand": {
            "@type": "Brand",
            "name": productData.brand || siteTitle
        },
        "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": productData.currency || "TND",
            "price": productData.price.toFixed(3),
            "availability": `https://schema.org/${productData.availability}`,
            "itemCondition": "https://schema.org/NewCondition"
        },
        "category": productData.category
    } : {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteTitle,
        "url": window.location.origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/#/product-list?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
    };

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};