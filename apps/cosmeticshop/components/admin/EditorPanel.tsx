
import React, { useMemo, useState } from 'react';
import type { Product, Category, Pack, TrustBadgeConfig, VirtualTryOnImage } from '../../types';
import { RichTextEditor } from './RichTextEditor';
import { ImageInput } from '../ImageInput';
import { LinkBuilder } from './LinkBuilder'; 
import { CheckCircleIcon, PlusIcon, TrashIcon } from '../IconComponents';

interface EditorPanelProps {
    section: string; // Handle generic sections
    data: any;
    onChange: (data: any) => void;
    allProducts: Product[];
    allCategories?: Category[];
    allPacks?: Pack[];
}

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={onChange} 
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
        />
    </div>
);

const ColorField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</label>
        <div className="flex items-center gap-3">
            <input 
                type="color" 
                value={value || '#000000'} 
                onChange={onChange} 
                className="h-10 w-14 border border-gray-300 dark:border-gray-600 rounded cursor-pointer p-0.5 bg-white dark:bg-gray-700" 
            />
            <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{value}</span>
        </div>
    </div>
);

const RangeSlider: React.FC<{ label: string; value: number; min: number; max: number; onChange: (val: number) => void }> = ({ label, value, min, max, onChange }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
            <span className="text-xs text-gray-700 font-mono">{value}</span>
        </div>
        <input 
            type="range" 
            min={min} 
            max={max} 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value))} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
        />
    </div>
);

// Advanced Image Control Component
const AdvancedImageControl: React.FC<{ label: string; imageConfig: VirtualTryOnImage | string; onChange: (newConfig: VirtualTryOnImage) => void }> = ({ label, imageConfig, onChange }) => {
    // Normalize string config to object
    const config: VirtualTryOnImage = typeof imageConfig === 'string' 
        ? { url: imageConfig, scale: 100, top: 0, rotation: 0 } 
        : (imageConfig || { url: '', scale: 100, top: 0, rotation: 0 });

    const handleUpdate = (field: keyof VirtualTryOnImage, val: any) => {
        onChange({ ...config, [field]: val });
    };

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-3 border-b dark:border-gray-600 pb-2">{label}</h4>
            <ImageInput label="Fichier Image" value={config.url} onChange={(v) => handleUpdate('url', v)} />
            <div className="mt-4 space-y-2">
                <RangeSlider label="Taille (Scale %)" value={config.scale || 100} min={10} max={400} onChange={(v) => handleUpdate('scale', v)} />
                <RangeSlider label="Position Verticale (%)" value={config.top || 0} min={-100} max={100} onChange={(v) => handleUpdate('top', v)} />
                <RangeSlider label="Rotation (deg)" value={config.rotation || 0} min={-180} max={180} onChange={(v) => handleUpdate('rotation', v)} />
            </div>
        </div>
    );
};

// Helper pour générer des Data URI SVG propres et robustes en BASE64
const generateSvgDataUrl = (svgContent: string) => {
    const cleanSvg = svgContent.trim().replace(/\s+/g, ' ');
    // Encodage Base64 pour une compatibilité CSS maximale
    if (typeof window !== 'undefined') {
        return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(cleanSvg)))}`;
    }
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
};

// Templates générés via SVG complexes
const VTO_TEMPLATES = [
    { 
        label: "Pivoines & Soie", 
        url: generateSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="800" viewBox="0 0 1920 800" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <radialGradient id="roseGradient" cx="20%" cy="30%" r="80%">
                        <stop offset="0%" stop-color="#fce7f3"/>
                        <stop offset="60%" stop-color="#fbcfe8"/>
                        <stop offset="100%" stop-color="#f472b6"/>
                    </radialGradient>
                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="15" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                    <filter id="particleGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#roseGradient)"/>
                <circle cx="200" cy="100" r="300" fill="#fdf2f8" opacity="0.4" filter="url(#softGlow)"/>
                <circle cx="1600" cy="700" r="400" fill="#fce7f3" opacity="0.3" filter="url(#softGlow)"/>
                <circle cx="900" cy="400" r="200" fill="#fff" opacity="0.15" filter="url(#softGlow)"/>
                <g fill="#ec4899" opacity="0.8">
                    <path d="M100,200 Q150,150 200,200 T300,250 Q250,300 200,250 T100,200" fill="#fbcfe8" transform="rotate(20 150 200)"/>
                    <path d="M50,500 Q100,450 150,500 T250,550 Q200,600 150,550 T50,500" fill="#f9a8d4" transform="rotate(-15 100 500) scale(1.5)"/>
                    <path d="M300,600 Q350,550 400,600 T500,650 Q450,700 400,650 T300,600" fill="#fbcfe8" opacity="0.6" transform="rotate(45 350 600)"/>
                    <path d="M-50,700 Q50,600 150,750 T50,900" fill="#db2777" opacity="0.4" filter="url(#softGlow)" transform="scale(2)"/>
                </g>
                <g fill="#fff" filter="url(#particleGlow)">
                    <circle cx="150" cy="300" r="2" opacity="0.8"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/></circle>
                    <circle cx="400" cy="100" r="3" opacity="0.6"><animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite"/></circle>
                    <circle cx="300" cy="500" r="2" opacity="0.9"/>
                    <circle cx="500" cy="200" r="1.5" opacity="0.5"/>
                    <path d="M200,400 L202,410 L200,420 L198,410 Z" fill="#fff" opacity="0.8" transform="rotate(15 200 400)"/>
                </g>
                <path d="M0,800 C400,600 600,900 1920,500 V800 H0 Z" fill="url(#roseGradient)" opacity="0.3" style="mix-blend-mode: overlay;"/>
            </svg>
        `),
        textColor: '#831843', 
        previewColor: '#fbcfe8',
        category: "Floral"
    },
    { 
        label: "Luxe Or", 
        url: generateSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="800" viewBox="0 0 1920 800" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#b45309" />
                        <stop offset="25%" stop-color="#d97706" />
                        <stop offset="50%" stop-color="#fcd34d" />
                        <stop offset="75%" stop-color="#b45309" />
                        <stop offset="100%" stop-color="#78350f" />
                    </linearGradient>
                    <filter id="goldDust">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"/>
                        <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
                    </filter>
                    <filter id="glowStar">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#goldGradient)"/>
                <rect width="100%" height="100%" filter="url(#goldDust)" style="mix-blend-mode: overlay;" opacity="0.4"/>
                <g fill="#fff" filter="url(#glowStar)">
                    <path d="M400,200 L405,230 L410,200 L440,195 L410,190 L405,160 L400,190 L370,195 Z" opacity="0.8"/>
                    <path d="M1500,600 L1505,630 L1510,600 L1540,595 L1510,590 L1505,560 L1500,590 L1470,595 Z" opacity="0.9"/>
                    <circle cx="800" cy="400" r="2" opacity="0.6"/>
                    <circle cx="200" cy="700" r="3" opacity="0.5"/>
                    <circle cx="1200" cy="100" r="2" opacity="0.7"/>
                </g>
                <path d="M-100,800 Q900,400 2000,800" stroke="#fff" stroke-width="1" fill="none" opacity="0.2"/>
            </svg>
        `),
        textColor: '#FFFFFF', 
        previewColor: '#b45309',
        category: "Luxe"
    },
    { 
        label: "Texture Nude", 
        url: generateSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="800" viewBox="0 0 1920 800" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id="nudeBase" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#f5ebe0"/>
                        <stop offset="100%" stop-color="#d6ccc2"/>
                    </linearGradient>
                    <filter id="creamTexture">
                        <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence"/>
                        <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="20" xChannelSelector="R" yChannelSelector="G"/>
                        <feGaussianBlur stdDeviation="5"/>
                    </filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#nudeBase)"/>
                <g fill="#e3d5ca" opacity="0.6" filter="url(#creamTexture)">
                    <path d="M0,400 C400,300 600,500 1000,400 S1600,300 1920,400 V800 H0 Z" />
                    <path d="M0,600 C600,500 1000,700 1920,600 V800 H0 Z" fill="#d5bdaf" />
                </g>
            </svg>
        `),
        textColor: '#3f2e26', 
        previewColor: '#e3d5ca',
        category: "Organique"
    },
    { 
        label: "Eau Fraîche", 
        url: generateSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="800" viewBox="0 0 1920 800" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <radialGradient id="waterDeep" cx="50%" cy="100%" r="100%">
                        <stop offset="0%" stop-color="#0284c7"/>
                        <stop offset="100%" stop-color="#bae6fd"/>
                    </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#waterDeep)"/>
                <g fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2">
                    <circle cx="300" cy="500" r="50" fill="rgba(255,255,255,0.1)"/>
                    <path d="M280,480 Q290,470 300,470" stroke="#fff" stroke-width="3" opacity="0.8" />
                    <circle cx="1500" cy="200" r="80" fill="rgba(255,255,255,0.15)"/>
                    <path d="M1470,170 Q1490,150 1510,150" stroke="#fff" stroke-width="4" opacity="0.9" />
                    <circle cx="1000" cy="700" r="30" fill="rgba(255,255,255,0.1)"/>
                    <circle cx="600" cy="300" r="10" fill="rgba(255,255,255,0.3)"/>
                    <circle cx="1200" cy="500" r="15" fill="rgba(255,255,255,0.3)"/>
                    <circle cx="100" cy="100" r="8" fill="rgba(255,255,255,0.3)"/>
                    <circle cx="1800" cy="600" r="12" fill="rgba(255,255,255,0.3)"/>
                </g>
                <path d="M0,0 L600,800 L800,800 L400,0 Z" fill="white" opacity="0.05"/>
                <path d="M1200,0 L1400,800 L1500,800 L1400,0 Z" fill="white" opacity="0.05"/>
            </svg>
        `),
        textColor: '#0f172a', 
        previewColor: '#0ea5e9',
        category: "Nature"
    },
    { 
        label: "Botanique", 
        url: generateSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="800" viewBox="0 0 1920 800" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id="deepGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#14532d"/>
                        <stop offset="100%" stop-color="#064e3b"/>
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#deepGreen)"/>
                <path d="M0,800 Q400,400 960,600 Q1500,800 1920,600 V800 H0 Z" fill="#166534" opacity="0.6"/>
                <g fill="#22c55e" opacity="0.2">
                    <path d="M200,200 Q300,100 400,200 Q300,300 200,200" stroke="#fff" stroke-width="1" transform="rotate(45 300 200) scale(1.5)"/>
                    <path d="M1600,500 Q1700,400 1800,500 Q1700,600 1600,500" stroke="#fff" stroke-width="1" transform="rotate(-30 1700 500) scale(2)"/>
                </g>
            </svg>
        `),
        textColor: '#FFFFFF', 
        previewColor: '#064e3b',
        category: "Nature"
    },
    { 
        label: "Bulles Pastel", 
        url: generateSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="800" viewBox="0 0 1920 800" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id="softBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#8b5cf6"/>
                        <stop offset="100%" stop-color="#6366f1"/>
                    </linearGradient>
                    <filter id="softBlur"><feGaussianBlur stdDeviation="40"/></filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#softBg)"/>
                <circle cx="1600" cy="600" r="300" fill="#c4b5fd" opacity="0.5" filter="url(#softBlur)"/>
                <circle cx="300" cy="200" r="200" fill="#818cf8" opacity="0.5" filter="url(#softBlur)"/>
                <circle cx="960" cy="400" r="100" fill="white" opacity="0.2" filter="url(#softBlur)"/>
            </svg>
        `),
        textColor: '#FFFFFF', 
        previewColor: '#8b5cf6',
        category: "Moderne"
    }
];

export const EditorPanel: React.FC<EditorPanelProps> = ({ section, data, onChange, allProducts, allCategories = [], allPacks = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleChange = (field: string, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleTemplateClick = (template: typeof VTO_TEMPLATES[0]) => {
        onChange({
            ...data,
            backgroundType: 'image',
            backgroundImage: template.url,
            textColor: template.textColor
        });
    };

    const handleGalleryImageAdd = (newImage: string) => {
        if (!newImage) return;
        const currentGallery = data.backgroundGallery || [];
        const updatedGallery = [...currentGallery, newImage];
        onChange({ 
            ...data, 
            backgroundGallery: updatedGallery,
            backgroundImage: newImage, 
            backgroundType: 'image'
        });
    };

    const handleGalleryImageRemove = (imgToRemove: string) => {
        const currentGallery = data.backgroundGallery || [];
        const updatedGallery = currentGallery.filter((img: string) => img !== imgToRemove);
        onChange({ ...data, backgroundGallery: updatedGallery });
    };

    const handleGalleryImageSelect = (imgUrl: string) => {
        onChange({ ...data, backgroundImage: imgUrl, backgroundType: 'image' });
    };

    const handleArrayItemChange = (index: number, field: string, value: any) => {
        const newData = [...data];
        newData[index] = { ...newData[index], [field]: value };
        onChange(newData);
    };

    const addArrayItem = (template: any) => {
        onChange([...data, { ...template, id: Date.now() }]);
        setActiveSlideIndex(data.length);
    };

    const removeArrayItem = (index: number) => {
        if (section !== 'trustBadges' && data.length <= 1) {
            alert("Il doit y avoir au moins un élément.");
            return;
        }
        onChange(data.filter((_: any, i: number) => i !== index));
        setActiveSlideIndex(Math.max(0, index - 1));
    };

    const toggleProductInList = (productId: number, listField: string = 'productIds') => {
        const currentIds = data[listField] || [];
        if (currentIds.includes(productId)) {
            handleChange(listField, currentIds.filter((id: number) => id !== productId));
        } else {
            handleChange(listField, [...currentIds, productId]);
        }
    };

    const toggleGridProduct = (productId: number) => {
        const currentIds = data.manualProductIds || [];
        if (currentIds.includes(productId)) {
            handleChange('manualProductIds', currentIds.filter((id: number) => id !== productId));
        } else {
            handleChange('manualProductIds', [...currentIds, productId]);
        }
    };

    const filteredProducts = useMemo(() => {
        let filtered = allProducts;
        if (searchTerm) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        return filtered.slice(0, 50);
    }, [allProducts, searchTerm, selectedCategory]);

    const selectedProduct = useMemo(() => 
        allProducts.find(p => p.id === data.productId), 
    [allProducts, data.productId]);

    const allCategoryNames = useMemo(() => {
         const names = allCategories.flatMap(c => 
            [c.name, ...(c.subCategories || []), ...(c.megaMenu?.flatMap(m => m.items.map(i => i.name)) || [])]
        );
        return [...new Set(names)].sort();
    }, [allCategories]);

    const renderHeader = (title: string) => (
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-xs text-gray-500">Modifiez le contenu et le style ci-dessous.</p>
        </div>
    );

    const titles: {[key: string]: string} = {
        header: "En-tête de page",
        dealOfTheDay: "Offre du Jour",
        allOffersGrid: "Grille des Offres",
        glowRoutine: "Bloc Glow Routine",
        essentials: "Bloc Essentials",
        hero: "Carrousel Principal (Hero)",
        trustBadges: "Badges de Confiance",
        audioPromo: "Publicités Audio",
        promoBanner: "Bannière Promotionnelle",
        editorialCollage: "Collage Éditorial (Masonry)",
        shoppableVideos: "Vidéos Shopping (Reels)",
        newArrivals: "Carrousel Nouvelles Arrivées",
        summerSelection: "Carrousel Sélection Été",
        virtualTryOn: "Bloc Virtual Try-On",
        featuredGrid: "Grille de Produits (Accueil)"
    };

    const displayTitle = titles[section] || (section.startsWith('promoBanner') ? "Bannière Promotionnelle" : "Bloc Promotionnel");

    const bgPresets = [
        { label: 'Soft Rose', value: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' },
        { label: 'Midnight', value: 'linear-gradient(to right, #111827, #1f2937)' },
        { label: 'Pure White', value: '#FFFFFF' },
        { label: 'Golden Hour', value: 'linear-gradient(to right, #fbf5e6, #fff1f2)' } 
    ];

    const customGallery = data.backgroundGallery || [];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {renderHeader(displayTitle)}
            
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                
                {section === 'header' && (
                    <>
                        <RichTextEditor label="Titre Principal" value={data.title} onChange={(html) => handleChange('title', html)} />
                        <hr className="dark:border-gray-700"/>
                        <RichTextEditor label="Sous-titre" value={data.subtitle} onChange={(html) => handleChange('subtitle', html)} />
                    </>
                )}

                {(section === 'glowRoutine' || section === 'essentials') && (
                    <>
                        <RichTextEditor label="Titre" value={data.title} onChange={(html) => handleChange('title', html)} />
                        <RichTextEditor label="Sous-titre" value={data.subtitle} onChange={(html) => handleChange('subtitle', html)} />
                        <hr className="dark:border-gray-700"/>
                        <ImageInput label="Image d'illustration" value={data.image} onChange={(v) => handleChange('image', v)} />
                        <hr className="dark:border-gray-700"/>
                        <InputField label="Texte du bouton" value={data.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} />
                        <LinkBuilder 
                            value={data.link} 
                            onChange={(url) => handleChange('link', url)} 
                            allProducts={allProducts} 
                            allCategories={allCategories || []} 
                        />
                    </>
                )}

                {section === 'trustBadges' && Array.isArray(data) && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-gray-500 uppercase">Liste des badges</span>
                            <button 
                                type="button" 
                                onClick={() => addArrayItem({ title: 'Titre', subtitle: 'Sous-titre', id: Date.now() })}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200 flex items-center gap-1"
                            >
                                <PlusIcon className="w-3 h-3" /> Ajouter
                            </button>
                        </div>
                        {data.map((badge: TrustBadgeConfig, index: number) => (
                            <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                                <h4 className="font-bold text-sm mb-3 flex items-center justify-between">
                                    <span>Badge {index + 1}</span>
                                    <button onClick={() => removeArrayItem(index)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded">
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </h4>
                                <RichTextEditor label="Titre" value={badge.title} onChange={(html) => handleArrayItemChange(index, 'title', html)} />
                                <RichTextEditor label="Sous-titre" value={badge.subtitle} onChange={(html) => handleArrayItemChange(index, 'subtitle', html)} />
                                
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Icône Personnalisée (URL)</label>
                                    </div>
                                    {/* AI Generation button removed per user request */}
                                    <ImageInput label="" value={badge.iconUrl || ''} onChange={(val) => handleArrayItemChange(index, 'iconUrl', val)} />
                                    {badge.iconUrl && (
                                        <div className="mt-2 p-2 bg-gray-200 dark:bg-gray-800 rounded flex justify-center">
                                            <img src={badge.iconUrl} alt="Preview" className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {section === 'virtualTryOn' && (
                    <div className="space-y-4">
                        <RichTextEditor label="Titre" value={data.title} onChange={(html) => handleChange('title', html)} />
                        <RichTextEditor label="Description" value={data.description} onChange={(html) => handleChange('description', html)} />
                        
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h4 className="text-xs font-bold uppercase mb-3 text-rose-600 dark:text-rose-300">Style du Fond & Texte</h4>
                            
                            <div className="flex gap-2 mb-4">
                                <button 
                                    onClick={() => handleChange('backgroundType', 'color')} 
                                    className={`flex-1 py-2 text-xs font-bold rounded border ${data.backgroundType === 'color' ? 'bg-white border-rose-500 text-rose-600 shadow-sm' : 'border-gray-300 text-gray-500'}`}
                                >
                                    Couleur
                                </button>
                                <button 
                                    onClick={() => handleChange('backgroundType', 'image')} 
                                    className={`flex-1 py-2 text-xs font-bold rounded border ${data.backgroundType === 'image' ? 'bg-white border-rose-500 text-rose-600 shadow-sm' : 'border-gray-300 text-gray-500'}`}
                                >
                                    Thème Artistique
                                </button>
                            </div>

                            {data.backgroundType === 'image' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Thèmes Graphiques (SVG)</label>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            {VTO_TEMPLATES.map((template) => {
                                                const isActive = data.backgroundImage === template.url;
                                                return (
                                                    <button
                                                        key={template.label}
                                                        onClick={() => handleTemplateClick(template)}
                                                        className={`relative h-24 rounded-xl overflow-hidden transition-all group ${isActive ? 'ring-4 ring-rose-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : 'border border-gray-200 hover:border-rose-300'}`}
                                                        style={{ backgroundColor: template.previewColor }}
                                                    >
                                                        <img src={template.url} alt={template.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors p-2">
                                                            <span className="text-[10px] text-white font-bold uppercase text-center leading-tight drop-shadow-md tracking-wider">{template.label}</span>
                                                            <span className="text-[8px] text-white/90 bg-black/40 px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm">{template.category}</span>
                                                        </div>
                                                        {isActive && (
                                                            <div className="absolute top-1 right-1 bg-green-500 text-white p-0.5 rounded-full">
                                                                <CheckCircleIcon className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="border-t dark:border-gray-600 pt-4">
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Mes Arrière-plans importés</label>
                                        {customGallery.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2 mb-4">
                                                {customGallery.map((imgUrl: string, idx: number) => {
                                                    const isActive = data.backgroundImage === imgUrl;
                                                    return (
                                                        <div key={idx} className="relative group aspect-square">
                                                            <button
                                                                onClick={() => handleGalleryImageSelect(imgUrl)}
                                                                className={`relative w-full h-full rounded-lg overflow-hidden transition-all border ${isActive ? 'border-2 border-rose-500 shadow-md' : 'border-gray-200 hover:border-rose-300'}`}
                                                            >
                                                                <img src={imgUrl} alt={`Custom ${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                                                                {isActive && (
                                                                    <div className="absolute top-0 right-0 bg-green-500 text-white p-0.5 rounded-bl-lg z-10">
                                                                        <CheckCircleIcon className="w-3 h-3" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleGalleryImageRemove(imgUrl)}
                                                                className="absolute bottom-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-700 shadow-sm"
                                                                title="Supprimer de la galerie"
                                                            >
                                                                <TrashIcon className="w-2.5 h-2.5" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                                            <p className="text-xs text-gray-500 mb-2 text-center">Ajouter une image à votre galerie</p>
                                            <ImageInput label="" value="" onChange={handleGalleryImageAdd} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Presets Dégradés</label>
                                    <div className="flex gap-2 mb-3">
                                        {bgPresets.map(preset => (
                                            <button 
                                                key={preset.label}
                                                onClick={() => handleChange('backgroundColor', preset.value)}
                                                className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                                                style={{ background: preset.value.startsWith('url') ? '#eee' : preset.value }}
                                                title={preset.label}
                                            />
                                        ))}
                                    </div>
                                    <InputField label="Code Couleur / Gradient (CSS)" value={data.backgroundColor} onChange={(e) => handleChange('backgroundColor', e.target.value)} />
                                </div>
                            )}
                            <div className="mt-4">
                                <ColorField label="Couleur du Texte" value={data.textColor} onChange={(e) => handleChange('textColor', e.target.value)} />
                            </div>
                        </div>

                        <hr className="dark:border-gray-700"/>
                        <AdvancedImageControl label="Image Décorative Gauche" imageConfig={data.imageLeft} onChange={(newConfig) => handleChange('imageLeft', newConfig)} />
                        <AdvancedImageControl label="Image Décorative Droite" imageConfig={data.imageRight} onChange={(newConfig) => handleChange('imageRight', newConfig)} />
                        <hr className="dark:border-gray-700"/>
                        <InputField label="Texte du bouton" value={data.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} />
                        
                        <LinkBuilder 
                            value={data.link} 
                            onChange={(url) => handleChange('link', url)} 
                            allProducts={allProducts} 
                            allCategories={allCategories || []} 
                        />
                    </div>
                )}

                {(section === 'newArrivals' || section === 'summerSelection' || section === 'featuredGrid') && (
                    <div className="space-y-4">
                        <RichTextEditor label="Titre du bloc" value={data.title} onChange={(html) => handleChange('title', html)} />
                        
                        {section === 'featuredGrid' && (
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
                                <InputField label="Texte Bouton Bas" value={data.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} />
                                <LinkBuilder 
                                    value={data.buttonLink} 
                                    onChange={(url) => handleChange('buttonLink', url)} 
                                    allProducts={allProducts} 
                                    allCategories={allCategories || []} 
                                />
                            </div>
                        )}

                        {section !== 'featuredGrid' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Limite produits</label>
                                <input type="number" value={data.limit || 8} onChange={(e) => handleChange('limit', parseInt(e.target.value))} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm" />
                            </div>
                        )}

                        <hr className="dark:border-gray-700"/>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sélection des produits</label>
                        <div className="grid gap-2 mb-2">
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm">
                                <option value="">Toutes les catégories</option>
                                {allCategoryNames.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <input type="text" placeholder="Chercher par nom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-3 pr-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="max-h-80 overflow-y-auto border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-900 custom-scrollbar">
                            {filteredProducts.map(p => {
                                const isSelected = (data.productIds || []).includes(p.id);
                                return (
                                    <div key={p.id} onClick={() => toggleProductInList(p.id, 'productIds')} className={`p-2 flex items-center gap-3 cursor-pointer border-b last:border-0 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 ${isSelected ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>{isSelected && <CheckCircleIcon className="w-3.5 h-3.5" />}</div>
                                        <img src={p.imageUrl} className="w-8 h-8 rounded object-cover" />
                                        <div className="overflow-hidden"><p className="text-xs font-medium truncate">{p.name}</p><p className="text-[10px] text-gray-500">{p.price} DT</p></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {section === 'dealOfTheDay' && (
                    <>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 mb-6">
                            <h4 className="text-xs font-bold uppercase mb-3 text-gray-500">Couleurs du texte dynamique</h4>
                            <ColorField label="Couleur du Titre (Nom Produit)" value={data.titleColor} onChange={(e) => handleChange('titleColor', e.target.value)} />
                            <ColorField label="Couleur du Sous-titre (Description)" value={data.subtitleColor} onChange={(e) => handleChange('subtitleColor', e.target.value)} />
                        </div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Produit mis en avant</label>
                        {selectedProduct && (
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900 rounded-lg mb-4 flex items-center gap-3">
                                <img src={selectedProduct.imageUrl} className="w-10 h-10 rounded bg-white object-cover" />
                                <div className="overflow-hidden"><p className="text-sm font-bold text-rose-700 dark:text-rose-300 truncate">{selectedProduct.name}</p><p className="text-xs text-rose-500">{selectedProduct.price} DT</p></div>
                            </div>
                        )}
                        <input type="text" placeholder="Rechercher un produit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-3 pr-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 mb-2" />
                        <div className="max-h-60 overflow-y-auto border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-900 custom-scrollbar">
                            {filteredProducts.map(p => (
                                <div key={p.id} onClick={() => handleChange('productId', p.id)} className={`p-2 flex items-center gap-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${data.productId === p.id ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                                    <img src={p.imageUrl} className="w-8 h-8 rounded object-cover" /><span className="text-xs truncate">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {section === 'hero' && Array.isArray(data) && (
                    <>
                        <div className="flex items-center gap-2 border-b dark:border-gray-600 pb-2 mb-4 overflow-x-auto no-scrollbar">
                            {data.map((_, index) => (
                                <button key={index} type="button" onClick={() => setActiveSlideIndex(index)} className={`px-3 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${activeSlideIndex === index ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Slide {index + 1}</button>
                            ))}
                            <button type="button" onClick={() => addArrayItem({ bgImage: "https://picsum.photos/1200/600", title: "Nouveau Slide", subtitle: "Description", buttonText: "Découvrir" })} className="p-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><PlusIcon className="w-4 h-4" /></button>
                        </div>
                        {data[activeSlideIndex] && (
                            <div className="space-y-4 animate-fadeIn">
                                <RichTextEditor label="Titre" value={data[activeSlideIndex].title} onChange={html => handleArrayItemChange(activeSlideIndex, 'title', html)} />
                                <RichTextEditor label="Sous-titre" value={data[activeSlideIndex].subtitle} onChange={html => handleArrayItemChange(activeSlideIndex, 'subtitle', html)} />
                                <InputField label="Texte du bouton" value={data[activeSlideIndex].buttonText} onChange={e => handleArrayItemChange(activeSlideIndex, 'buttonText', e.target.value)} />
                                
                                <div className="mt-4 border-t dark:border-gray-700 pt-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Destination</label>
                                    <LinkBuilder
                                        value={data[activeSlideIndex].link}
                                        onChange={(url) => handleArrayItemChange(activeSlideIndex, 'link', url)}
                                        allProducts={allProducts}
                                        allCategories={allCategories || []}
                                    />
                                </div>

                                <ImageInput label="Image de fond" value={data[activeSlideIndex].bgImage} onChange={val => handleArrayItemChange(activeSlideIndex, 'bgImage', val)} />
                                <button type="button" onClick={() => removeArrayItem(activeSlideIndex)} className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-2"><TrashIcon className="w-3 h-3"/> Supprimer</button>
                            </div>
                        )}
                    </>
                )}

                {section.startsWith('promoBanner') && (
                    <div className="space-y-4">
                        <RichTextEditor label="Titre" value={data.title} onChange={html => handleChange('title', html)} />
                        <RichTextEditor label="Sous-titre" value={data.subtitle} onChange={html => handleChange('subtitle', html)} />
                        <InputField label="Texte du bouton" value={data.buttonText} onChange={e => handleChange('buttonText', e.target.value)} />
                        <ImageInput label="Image" value={data.image} onChange={val => handleChange('image', val)} />
                        <div className="pt-4 border-t dark:border-gray-700">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lien de destination</label>
                            <LinkBuilder 
                                value={data.link} 
                                onChange={(url) => handleChange('link', url)} 
                                allProducts={allProducts} 
                                allCategories={allCategories || []} 
                            />
                        </div>
                    </div>
                )}

                {section === 'audioPromo' && Array.isArray(data) && (
                    <>
                        <div className="flex items-center gap-2 border-b dark:border-gray-600 pb-2 mb-4 overflow-x-auto no-scrollbar">
                            {data.map((_, index) => <button key={index} type="button" onClick={() => setActiveSlideIndex(index)} className={`px-3 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${activeSlideIndex === index ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Pub {index + 1}</button>)}
                            <button type="button" onClick={() => addArrayItem({ title: "Titre", subtitle1: "Sous-titre", subtitle2: "Sous-titre 2", image: "https://picsum.photos/800/400", duration: 8 })} className="p-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><PlusIcon className="w-4 h-4" /></button>
                        </div>
                        {data[activeSlideIndex] && (
                            <div className="space-y-4 animate-fadeIn">
                                <RichTextEditor label="Titre" value={data[activeSlideIndex].title} onChange={html => handleArrayItemChange(activeSlideIndex, 'title', html)} />
                                <RichTextEditor label="Sous-titre 1" value={data[activeSlideIndex].subtitle1} onChange={html => handleArrayItemChange(activeSlideIndex, 'subtitle1', html)} />
                                <RichTextEditor label="Sous-titre 2" value={data[activeSlideIndex].subtitle2} onChange={html => handleArrayItemChange(activeSlideIndex, 'subtitle2', html)} />
                                <ImageInput label="Image" value={data[activeSlideIndex].image} onChange={val => handleArrayItemChange(activeSlideIndex, 'image', val)} />
                                <InputField label="Durée (sec)" value={data[activeSlideIndex].duration} onChange={e => handleArrayItemChange(activeSlideIndex, 'duration', parseInt(e.target.value))} />
                                <button type="button" onClick={() => removeArrayItem(activeSlideIndex)} className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-2"><TrashIcon className="w-3 h-3"/> Supprimer</button>
                            </div>
                        )}
                    </>
                )}

                {section === 'editorialCollage' && Array.isArray(data) && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center"><span className="text-xs text-gray-500 uppercase font-bold">{data.length} éléments</span><button type="button" onClick={() => addArrayItem({ imageUrl: "https://picsum.photos/400/400", link: "#", size: 'small', title: 'Titre' })} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200">+ Ajouter</button></div>
                        <div className="space-y-4">
                            {data.map((item: any, index: number) => (
                                <div key={item.id || index} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold">Image {index + 1}</span><button onClick={() => removeArrayItem(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button></div>
                                    <ImageInput label="" value={item.imageUrl} onChange={val => handleArrayItemChange(index, 'imageUrl', val)} />
                                    <div className="mt-2">
                                        <RichTextEditor label="Titre" value={item.title || ''} onChange={html => handleArrayItemChange(index, 'title', html)} />
                                        <RichTextEditor label="Sous-titre" value={item.subtitle || ''} onChange={html => handleArrayItemChange(index, 'subtitle', html)} />
                                        <select value={item.size} onChange={e => handleArrayItemChange(index, 'size', e.target.value)} className="w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"><option value="small">Carré (1x1)</option><option value="large">Grand (2x2)</option><option value="tall">Haut (1x2)</option><option value="wide">Large (2x1)</option></select>
                                        <div className="mt-2">
                                            <LinkBuilder 
                                                value={item.link} 
                                                onChange={(url) => handleArrayItemChange(index, 'link', url)} 
                                                allProducts={allProducts} 
                                                allCategories={allCategories || []} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {section === 'shoppableVideos' && Array.isArray(data) && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center"><span className="text-xs text-gray-500 uppercase font-bold">{data.length} vidéos</span><button type="button" onClick={() => addArrayItem({ thumbnailUrl: "https://picsum.photos/400/700", videoUrl: "", username: "@user", description: "Desc", productIds: [] })} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200">+ Ajouter</button></div>
                        <div className="space-y-4">
                            {data.map((item: any, index: number) => (
                                <div key={item.id || index} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold">Vidéo {index + 1}</span><button onClick={() => removeArrayItem(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button></div>
                                    <ImageInput label="Miniature" value={item.thumbnailUrl} onChange={val => handleArrayItemChange(index, 'thumbnailUrl', val)} />
                                    <InputField label="URL Vidéo" value={item.videoUrl} onChange={e => handleArrayItemChange(index, 'videoUrl', e.target.value)} />
                                    <InputField label="User" value={item.username} onChange={e => handleArrayItemChange(index, 'username', e.target.value)} />
                                    <InputField label="Description" value={item.description} onChange={e => handleArrayItemChange(index, 'description', e.target.value)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {section === 'allOffersGrid' && (
                    <>
                        <RichTextEditor label="En-tête de section" value={data.title} onChange={(html) => handleChange('title', html)} />
                        <hr className="dark:border-gray-700"/>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-4">Configuration de la Grille</label>
                        <div className="flex items-center justify-between mb-4"><span className="text-sm font-medium">Nombre limite</span><input type="number" value={data.limit} onChange={(e) => handleChange('limit', parseInt(e.target.value))} className="w-20 p-1 border rounded text-center dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"><input type="checkbox" id="manualMode" checked={data.useManualSelection} onChange={(e) => handleChange('useManualSelection', e.target.checked)} className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500" /><label htmlFor="manualMode" className="text-sm font-bold cursor-pointer select-none">Sélection Manuelle</label></div>
                        {data.useManualSelection && (
                            <div>
                                <div className="grid gap-2 mb-2">
                                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"><option value="">Toutes les catégories</option>{allCategoryNames.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
                                    <input type="text" placeholder="Chercher pour ajouter..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div className="max-h-80 overflow-y-auto border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-900 custom-scrollbar">{filteredProducts.map(p => (<div key={p.id} onClick={() => toggleGridProduct(p.id)} className={`p-2 flex items-center gap-3 cursor-pointer border-b last:border-0 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 ${(data.manualProductIds || []).includes(p.id) ? 'bg-green-50 dark:bg-green-900/10' : ''}`}><div className={`w-5 h-5 rounded border flex items-center justify-center ${(data.manualProductIds || []).includes(p.id) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>{ (data.manualProductIds || []).includes(p.id) && <CheckCircleIcon className="w-3.5 h-3.5" />}</div><img src={p.imageUrl} className="w-8 h-8 rounded object-cover" /><div className="overflow-hidden"><p className="text-xs font-medium truncate">{p.name}</p></div></div>))}</div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
