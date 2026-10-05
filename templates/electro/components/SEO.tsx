import React, { useEffect } from 'react';
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
    description = "Electro Shop : High-Tech, Électroménager, TV, Smartphones et Objets Connectés aux meilleurs prix en Tunisie.", 
    image = "/favicon.svg", 
    url = typeof window !== 'undefined' ? window.location.href : 'https://multishop.tn/#/store/electro',
    type = 'website',
    productData
}) => {
    const siteTitle = "Electro Shop";
    const fullTitle = `${title} | ${siteTitle}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://multishop.tn';

    // Schema.org Structured Data
    const structuredData = type === 'product' && productData ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": title,
        "image": image.startsWith('http') ? image : `${origin}${image}`,
        "description": description,
        "sku": productData.sku || `EL-${Date.now()}`,
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
        "url": origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${origin}/#/product-list?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
    };

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.title = fullTitle;
        }
    }, [fullTitle]);

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image.startsWith('http') ? image : `${origin}${image}`} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image.startsWith('http') ? image : `${origin}${image}`} />

            {/* Structured Data JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
