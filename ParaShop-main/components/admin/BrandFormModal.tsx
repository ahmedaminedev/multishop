
import React, { useState, useEffect } from 'react';
import type { Brand, Category } from '../../types';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';

interface BrandFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (brandData: Omit<Brand, 'id'>) => void;
    brand: Brand | null;
    categories: Category[];
}

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
        <input type="text" value={value} onChange={onChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600" />
    </div>
);

export const BrandFormModal: React.FC<BrandFormModalProps> = ({ isOpen, onClose, onSave, brand, categories }) => {
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [selectedLinks, setSelectedLinks] = useState<{parentCategory: string, subCategory: string}[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    useEffect(() => {
        if (brand) {
            setName(brand.name);
            setLogoUrl(brand.logoUrl);
            setSelectedLinks(brand.associatedCategories || []);
        } else {
            setName('');
            setLogoUrl('');
            setSelectedLinks([]);
        }
    }, [brand]);

    const handleToggleLink = (parent: string, sub: string) => {
        const exists = selectedLinks.some(l => l.parentCategory === parent && l.subCategory === sub);
        if (exists) {
            setSelectedLinks(prev => prev.filter(l => !(l.parentCategory === parent && l.subCategory === sub)));
        } else {
            setSelectedLinks(prev => [...prev, { parentCategory: parent, subCategory: sub }]);
        }
    };

    const toggleCategoryExpansion = (catName: string) => {
        setExpandedCategories(prev => prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, logoUrl, associatedCategories: selectedLinks });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-[#0b0c10] border border-gray-800 rounded-sm shadow-2xl max-h-[90vh] flex flex-col animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-wider">{brand ? 'MODIFIER' : 'NOUVELLE'} <span className="text-brand-neon">MARQUE</span></h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow p-8 overflow-y-auto space-y-6 custom-scrollbar">
                    <InputField label="Nom de la marque" value={name} onChange={(e) => setName(e.target.value)} />
                    <ImageInput label="Logo" value={logoUrl} onChange={setLogoUrl} />

                    <div className="border-t border-gray-800 pt-6">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Liaison Catégories</label>
                        
                        <div className="space-y-2 border border-gray-800 bg-[#111] p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {categories.map(cat => {
                                let subs: string[] = [];
                                if(cat.subCategories) subs = [...subs, ...cat.subCategories];
                                if(cat.megaMenu) cat.megaMenu.forEach(group => group.items.forEach(item => subs.push(item.name)));
                                
                                if(subs.length === 0) return null;

                                const isExpanded = expandedCategories.includes(cat.name);
                                const selectedCount = selectedLinks.filter(l => l.parentCategory === cat.name).length;

                                return (
                                    <div key={cat.name} className="border border-gray-700 bg-[#1a1a1a]">
                                        <div 
                                            className="flex justify-between items-center p-3 cursor-pointer hover:bg-[#222]"
                                            onClick={() => toggleCategoryExpansion(cat.name)}
                                        >
                                            <span className="font-bold text-sm text-white">{cat.name} <span className="text-[10px] font-normal text-gray-500 ml-2">({selectedCount})</span></span>
                                            {isExpanded ? <ChevronUpIcon className="w-4 h-4 text-brand-neon"/> : <ChevronDownIcon className="w-4 h-4 text-gray-500"/>}
                                        </div>
                                        
                                        {isExpanded && (
                                            <div className="p-3 bg-black border-t border-gray-700 grid grid-cols-2 gap-2">
                                                {subs.map(sub => {
                                                    const isChecked = selectedLinks.some(l => l.parentCategory === cat.name && l.subCategory === sub);
                                                    return (
                                                        <div key={`${cat.name}-${sub}`} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#1a1a1a] border border-transparent hover:border-gray-700" onClick={() => handleToggleLink(cat.name, sub)}>
                                                            <div className={`w-3 h-3 border flex items-center justify-center ${isChecked ? 'border-brand-neon bg-brand-neon' : 'border-gray-600'}`}>
                                                                {isChecked && <div className="w-1.5 h-1.5 bg-black"></div>}
                                                            </div>
                                                            <span className={`text-xs ${isChecked ? 'text-white font-bold' : 'text-gray-400'}`}>{sub}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </form>

                <div className="flex justify-end p-6 border-t border-gray-800 gap-3 bg-[#0a0a0a]">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-500 border border-red-900/30 hover:bg-red-900/20 transition-colors">Annuler</button>
                    <button type="button" onClick={handleSubmit} className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-brand-neon text-black hover:bg-white transition-colors skew-x-[-10deg] shadow-[0_0_15px_rgba(204,255,0,0.4)]"><span className="skew-x-[10deg]">VALIDER</span></button>
                </div>
            </div>
        </div>
    );
};
