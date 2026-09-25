
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
        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={onChange} 
            className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-sm py-2 px-3 text-xs font-mono focus:border-black dark:focus:border-brand-neon focus:ring-0 transition-all placeholder-gray-400"
        />
    </div>
);

const ColorField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">{label}</label>
        <div className="flex items-center gap-3">
            <input 
                type="color" 
                value={value || '#000000'} 
                onChange={onChange} 
                className="h-8 w-12 border border-gray-300 dark:border-gray-700 rounded-sm cursor-pointer p-0 bg-white dark:bg-black" 
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-mono uppercase">{value}</span>
        </div>
    </div>
);

export const EditorPanel: React.FC<EditorPanelProps> = ({ section, data, onChange, allProducts, allCategories = [], allPacks = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleChange = (field: string, value: any) => {
        onChange({ ...data, [field]: value });
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
        <div className="p-5 border-b border-gray-300 dark:border-gray-800 bg-[#f9fafb] dark:bg-[#111] sticky top-0 z-10 transition-colors">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{title}</h2>
            <div className="h-0.5 w-8 bg-black dark:bg-brand-neon mt-2"></div>
        </div>
    );

    const titles: {[key: string]: string} = {
        header: "En-tête de page",
        dealOfTheDay: "Flash Deal",
        allOffersGrid: "Grille des Offres",
        performanceSection: "Bloc Performance",
        muscleBuilders: "Bloc Mass Gainers",
        hero: "Carrousel Principal",
        trustBadges: "Badges Confiance",
        audioPromo: "Bannière Audio",
        promoBanner: "Bannière Promo",
        editorialCollage: "Collage Éditorial",
        shoppableVideos: "Vidéos Reels",
        newArrivals: "Nouveautés",
        summerSelection: "Sélection Été",
        virtualTryOn: "Bloc Objectif (Quiz)",
        featuredGrid: "Grille Accueil"
    };

    const displayTitle = titles[section] || "Bloc Promotionnel";

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#111] text-gray-900 dark:text-white transition-colors">
            {renderHeader(displayTitle)}
            
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-8">
                
                {/* --- HEADER --- */}
                {section === 'header' && (
                    <>
                        <RichTextEditor label="Titre Principal" value={data.title} onChange={(html) => handleChange('title', html)} className="dark" />
                        <RichTextEditor label="Sous-titre" value={data.subtitle} onChange={(html) => handleChange('subtitle', html)} className="dark" />
                    </>
                )}

                {/* --- PROMO BLOCKS (IRONFUEL) --- */}
                {(section === 'performanceSection' || section === 'muscleBuilders') && (
                    <>
                        <RichTextEditor label="Titre" value={data.title} onChange={(html) => handleChange('title', html)} className="dark" />
                        <RichTextEditor label="Sous-titre" value={data.subtitle} onChange={(html) => handleChange('subtitle', html)} className="dark" />
                        <ImageInput label="Image d'illustration" value={data.image} onChange={(v) => handleChange('image', v)} />
                        <InputField label="Texte du bouton" value={data.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} />
                        <LinkBuilder 
                            value={data.link} 
                            onChange={(url) => handleChange('link', url)} 
                            allProducts={allProducts} 
                            allCategories={allCategories || []} 
                        />
                    </>
                )}

                {/* --- TRUST BADGES --- */}
                {section === 'trustBadges' && Array.isArray(data) && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Liste</span>
                            <button 
                                type="button" 
                                onClick={() => addArrayItem({ title: 'Titre', subtitle: 'Sous-titre', id: Date.now() })}
                                className="text-[10px] bg-black dark:bg-brand-neon text-white dark:text-black px-3 py-1 font-bold uppercase hover:bg-gray-800 dark:hover:bg-white flex items-center gap-1"
                            >
                                <PlusIcon className="w-3 h-3" /> Ajouter
                            </button>
                        </div>
                        {data.map((badge: TrustBadgeConfig, index: number) => (
                            <div key={index} className="p-4 border border-gray-300 dark:border-gray-800 rounded-sm bg-gray-50 dark:bg-[#1a1a1a]">
                                <h4 className="font-bold text-xs mb-3 flex items-center justify-between text-gray-700 dark:text-gray-300">
                                    <span>BADGE {index + 1}</span>
                                    <button onClick={() => removeArrayItem(index)} className="text-red-500 hover:text-black dark:hover:text-white">
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </h4>
                                <InputField label="Titre" value={badge.title} onChange={(e) => handleArrayItemChange(index, 'title', e.target.value)} />
                                <InputField label="Sous-titre" value={badge.subtitle} onChange={(e) => handleArrayItemChange(index, 'subtitle', e.target.value)} />
                            </div>
                        ))}
                    </div>
                )}

                {/* --- FLASH DEAL --- */}
                {section === 'dealOfTheDay' && (
                    <>
                        <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-800 mb-6">
                            <ColorField label="Couleur Titre" value={data.titleColor} onChange={(e) => handleChange('titleColor', e.target.value)} />
                            <ColorField label="Couleur Sous-titre" value={data.subtitleColor} onChange={(e) => handleChange('subtitleColor', e.target.value)} />
                        </div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Produit sélectionné</label>
                        {selectedProduct && (
                            <div className="p-3 bg-green-100 dark:bg-brand-neon/10 border border-green-300 dark:border-brand-neon/30 mb-4 flex items-center gap-3">
                                <img src={selectedProduct.imageUrl} className="w-10 h-10 object-cover border border-gray-300 dark:border-gray-700" />
                                <div className="overflow-hidden"><p className="text-xs font-bold text-green-800 dark:text-brand-neon truncate uppercase">{selectedProduct.name}</p></div>
                            </div>
                        )}
                        <input type="text" placeholder="RECHERCHER ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-3 pr-3 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-xs font-mono text-gray-900 dark:text-white mb-2 focus:border-black dark:focus:border-brand-neon outline-none" />
                        <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-800 bg-white dark:bg-black custom-scrollbar">
                            {filteredProducts.map(p => (
                                <div key={p.id} onClick={() => handleChange('productId', p.id)} className={`p-2 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${data.productId === p.id ? 'bg-green-100 dark:bg-brand-neon/20 border-l-2 border-green-600 dark:border-brand-neon' : ''}`}>
                                    <img src={p.imageUrl} className="w-8 h-8 object-cover" /><span className="text-xs font-mono truncate text-gray-700 dark:text-gray-300">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* --- VIRTUAL TRY-ON (RENAMED TO OBJECTIF BLOCK) --- */}
                {section === 'virtualTryOn' && (
                    <div className="space-y-4">
                        <RichTextEditor label="Titre Principal" value={data.title} onChange={(html) => handleChange('title', html)} className="dark" />
                        <RichTextEditor label="Description" value={data.description} onChange={(html) => handleChange('description', html)} className="dark" />
                        <InputField label="Texte Bouton" value={data.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} />
                        
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Image Gauche (Athlète 1)</label>
                                <ImageInput label="" value={data.imageLeft?.url || data.imageLeft} onChange={(val) => handleChange('imageLeft', val)} />
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Image Droite (Athlète 2)</label>
                                <ImageInput label="" value={data.imageRight?.url || data.imageRight} onChange={(val) => handleChange('imageRight', val)} />
                            </div>
                        </div>

                        <LinkBuilder 
                            value={data.link} 
                            onChange={(url) => handleChange('link', url)} 
                            allProducts={allProducts} 
                            allCategories={allCategories || []} 
                        />
                    </div>
                )}

                {/* --- CAROUSELS / GRIDS --- */}
                {(section === 'newArrivals' || section === 'summerSelection' || section === 'featuredGrid' || section === 'allOffersGrid') && (
                    <div className="space-y-4">
                        <RichTextEditor label="Titre Section" value={data.title} onChange={(html) => handleChange('title', html)} className="dark" />
                        
                        {section === 'featuredGrid' && (
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-3 border border-gray-300 dark:border-gray-800 mb-4">
                                <InputField label="Texte Bouton" value={data.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} />
                                <LinkBuilder 
                                    value={data.buttonLink} 
                                    onChange={(url) => handleChange('buttonLink', url)} 
                                    allProducts={allProducts} 
                                    allCategories={allCategories || []} 
                                />
                            </div>
                        )}

                        <hr className="border-gray-300 dark:border-gray-800"/>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Sélection Produits</label>
                        
                        {/* Filter Controls */}
                        <div className="grid gap-2 mb-2">
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-xs font-mono text-gray-900 dark:text-gray-300 py-2 px-3">
                                <option value="">TOUTES CATÉGORIES</option>
                                {allCategoryNames.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <input type="text" placeholder="CHERCHER PAR NOM..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:border-black dark:focus:border-brand-neon outline-none" />
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto border border-gray-300 dark:border-gray-800 bg-white dark:bg-black custom-scrollbar">
                            {filteredProducts.map(p => {
                                const listField = section === 'allOffersGrid' ? 'manualProductIds' : 'productIds';
                                const isSelected = (data[listField] || []).includes(p.id);
                                const toggleFunc = section === 'allOffersGrid' ? toggleGridProduct : (pid: number) => toggleProductInList(pid, listField);

                                return (
                                    <div key={p.id} onClick={() => toggleFunc(p.id)} className={`p-2 flex items-center gap-3 cursor-pointer border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-100 dark:hover:bg-gray-900 ${isSelected ? 'bg-green-100 dark:bg-brand-neon/10' : ''}`}>
                                        <div className={`w-4 h-4 border flex items-center justify-center ${isSelected ? 'bg-green-600 dark:bg-brand-neon border-green-600 dark:border-brand-neon text-white dark:text-black' : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-black'}`}>{isSelected && <CheckCircleIcon className="w-3 h-3" />}</div>
                                        <img src={p.imageUrl} className="w-8 h-8 object-cover" />
                                        <div className="overflow-hidden"><p className="text-xs font-bold uppercase truncate text-gray-700 dark:text-gray-300">{p.name}</p></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- HERO SLIDES --- */}
                {section === 'hero' && Array.isArray(data) && (
                    <>
                        <div className="flex items-center gap-2 border-b border-gray-300 dark:border-gray-800 pb-2 mb-4 overflow-x-auto no-scrollbar">
                            {data.map((_, index) => (
                                <button key={index} type="button" onClick={() => setActiveSlideIndex(index)} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeSlideIndex === index ? 'bg-black dark:bg-brand-neon text-white dark:text-black' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 border border-gray-300 dark:border-gray-800'}`}>Slide {index + 1}</button>
                            ))}
                            <button type="button" onClick={() => addArrayItem({ bgImage: "https://picsum.photos/1200/600", title: "Nouveau Slide", subtitle: "Description", buttonText: "Découvrir" })} className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-800 hover:bg-green-600 hover:text-white"><PlusIcon className="w-3 h-3" /></button>
                        </div>
                        {data[activeSlideIndex] && (
                            <div className="space-y-4 animate-fadeIn">
                                <RichTextEditor label="Titre" value={data[activeSlideIndex].title} onChange={html => handleArrayItemChange(activeSlideIndex, 'title', html)} className="dark" />
                                <RichTextEditor label="Sous-titre" value={data[activeSlideIndex].subtitle} onChange={html => handleArrayItemChange(activeSlideIndex, 'subtitle', html)} className="dark" />
                                <InputField label="Texte Bouton" value={data[activeSlideIndex].buttonText} onChange={e => handleArrayItemChange(activeSlideIndex, 'buttonText', e.target.value)} />
                                <div className="mt-4 border-t border-gray-300 dark:border-gray-800 pt-4">
                                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Destination</label>
                                    <LinkBuilder value={data[activeSlideIndex].link} onChange={(url) => handleArrayItemChange(activeSlideIndex, 'link', url)} allProducts={allProducts} allCategories={allCategories || []} />
                                </div>
                                <ImageInput label="Image de fond" value={data[activeSlideIndex].bgImage} onChange={val => handleArrayItemChange(activeSlideIndex, 'bgImage', val)} />
                                <button type="button" onClick={() => removeArrayItem(activeSlideIndex)} className="text-xs text-red-600 hover:text-white border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-3 py-2 mt-4 uppercase font-bold tracking-wider w-full hover:bg-red-600 transition-colors">Supprimer Slide</button>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};
