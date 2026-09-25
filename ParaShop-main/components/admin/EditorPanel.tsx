
import React, { useMemo, useState } from 'react';
import type { Product, Category, Pack, TrustBadgeConfig } from '../../types';
import { RichTextEditor } from './RichTextEditor';
import { ImageInput } from '../ImageInput';
import { LinkBuilder } from './LinkBuilder'; 
import { CheckCircleIcon, PlusIcon, TrashIcon, SparklesIcon, SearchIcon } from '../IconComponents';

interface EditorPanelProps {
    section: string;
    data: any;
    onChange: (data: any) => void;
    allProducts: Product[];
    allCategories?: Category[];
    allPacks?: Pack[];
}

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="mb-6">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</label>
        <input type="text" value={value} onChange={onChange} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
    </div>
);

const ColorField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="mb-6">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</label>
        <div className="flex items-center gap-3">
            <input type="color" value={value || '#000000'} onChange={onChange} className="h-10 w-16 border border-slate-200 rounded-xl cursor-pointer p-1 bg-white" />
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">{value}</span>
        </div>
    </div>
);

export const EditorPanel: React.FC<EditorPanelProps> = ({ section, data, onChange, allProducts, allCategories = [], allPacks = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    const handleChange = (field: string, value: any) => onChange({ ...data, [field]: value });

    const handleArrayItemChange = (index: number, field: string, value: any) => {
        const newData = [...data];
        newData[index] = { ...newData[index], [field]: value };
        onChange(newData);
    };

    const filteredProducts = useMemo(() => 
        allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 50),
    [allProducts, searchTerm]);

    const selectedProduct = useMemo(() => allProducts.find(p => p.id === data.productId), [allProducts, data.productId]);

    const titles: {[key: string]: string} = {
        header: "En-tête des Offres",
        dealOfTheDay: "Offre Magistrale",
        allOffersGrid: "Grille des Cures",
        performanceSection: "Soin Signature",
        muscleBuilders: "Cure Vitalité",
        hero: "Carrousel Principal",
        trustBadges: "Garanties Santé",
        virtualTryOn: "Diagnostic IA"
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-brand-dark">
            <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-black/20 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-lg"><SparklesIcon className="w-5 h-5"/></div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{titles[section] || "Éditeur de Section"}</h2>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                
                {section === 'header' && (
                    <div className="animate-fadeIn">
                        <RichTextEditor label="Titre HTML (Serif)" value={data.title} onChange={(html) => handleChange('title', html)} />
                        <RichTextEditor label="Sous-titre descriptif" value={data.subtitle} onChange={(html) => handleChange('subtitle', html)} />
                    </div>
                )}

                {(section === 'performanceSection' || section === 'muscleBuilders') && (
                    <div className="space-y-8 animate-fadeIn">
                        <RichTextEditor label="Titre de la Section" value={data.title} onChange={(html) => handleChange('title', html)} />
                        <RichTextEditor label="Accroche Thérapeutique" value={data.subtitle} onChange={(html) => handleChange('subtitle', html)} />
                        <ImageInput label="Visuel de Présentation" value={data.image} onChange={(v) => handleChange('image', v)} />
                        <InputField label="Texte du bouton d'action" value={data.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} />
                        <LinkBuilder value={data.link} onChange={(url) => handleChange('link', url)} allProducts={allProducts} allCategories={allCategories} />
                    </div>
                )}

                {section === 'dealOfTheDay' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 gap-4 p-6 bg-slate-50 dark:bg-black/20 rounded-[2rem] border border-slate-100 dark:border-white/5">
                            <ColorField label="Couleur de mise en valeur" value={data.titleColor} onChange={(e) => handleChange('titleColor', e.target.value)} />
                        </div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Soin en Vedette</label>
                        {selectedProduct && (
                            <div className="p-4 bg-emerald-50 dark:bg-brand-primary/10 border border-emerald-100 dark:border-brand-primary/20 rounded-2xl flex items-center gap-4">
                                <img src={selectedProduct.imageUrl} className="w-12 h-12 object-contain bg-white rounded-lg" />
                                <div className="overflow-hidden"><p className="text-xs font-black text-emerald-800 dark:text-brand-primary truncate uppercase">{selectedProduct.name}</p></div>
                            </div>
                        )}
                        <div className="relative group">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input type="text" placeholder="CHERCHER UN PRODUIT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-brand-primary outline-none" />
                        </div>
                        <div className="max-h-64 overflow-y-auto border border-slate-100 dark:border-white/5 rounded-2xl bg-white dark:bg-black custom-scrollbar">
                            {filteredProducts.map(p => (
                                <div key={p.id} onClick={() => handleChange('productId', p.id)} className={`p-3 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-brand-primary/10 transition-colors ${data.productId === p.id ? 'bg-emerald-50 dark:bg-brand-primary/20 border-l-4 border-brand-primary' : ''}`}>
                                    <img src={p.imageUrl} className="w-10 h-10 object-contain" /><span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate uppercase">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {section === 'hero' && Array.isArray(data) && (
                    <div className="animate-fadeIn">
                        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                            {data.map((_, idx) => (
                                <button key={idx} onClick={() => setActiveSlideIndex(idx)} className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${activeSlideIndex === idx ? 'bg-brand-primary text-white border-brand-primary shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-brand-primary'}`}>SLIDE {idx+1}</button>
                            ))}
                            <button className="p-2 bg-slate-50 dark:bg-gray-800 rounded-xl hover:text-brand-primary"><PlusIcon className="w-4 h-4"/></button>
                        </div>
                        {data[activeSlideIndex] && (
                            <div className="space-y-6">
                                <RichTextEditor label="Titre Principal" value={data[activeSlideIndex].title} onChange={html => handleArrayItemChange(activeSlideIndex, 'title', html)} />
                                <InputField label="Bouton" value={data[activeSlideIndex].buttonText} onChange={e => handleArrayItemChange(activeSlideIndex, 'buttonText', e.target.value)} />
                                <ImageInput label="Visuel Immersion" value={data[activeSlideIndex].bgImage} onChange={val => handleArrayItemChange(activeSlideIndex, 'bgImage', val)} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
