
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={onChange} 
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
        />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">{brand ? 'Modifier la marque' : 'Ajouter une marque'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-6">
                    <InputField label="Nom de la marque" value={name} onChange={(e) => setName(e.target.value)} />
                    <ImageInput label="Logo de la marque" value={logoUrl} onChange={setLogoUrl} />

                    <div className="border-t dark:border-gray-700 pt-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Lier aux Sous-Catégories</label>
                        <p className="text-xs text-gray-500 mb-4">Cochez les sous-catégories où cette marque doit apparaître.</p>
                        
                        <div className="space-y-2 border rounded-md dark:border-gray-600 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {categories.map(cat => {
                                // Extract all subs from simple list or mega menu
                                let subs: string[] = [];
                                if(cat.subCategories) subs = [...subs, ...cat.subCategories];
                                if(cat.megaMenu) {
                                    cat.megaMenu.forEach(group => {
                                        group.items.forEach(item => subs.push(item.name));
                                    });
                                }
                                
                                if(subs.length === 0) return null;

                                const isExpanded = expandedCategories.includes(cat.name);
                                const selectedCount = selectedLinks.filter(l => l.parentCategory === cat.name).length;

                                return (
                                    <div key={cat.name} className="border rounded dark:border-gray-700">
                                        <div 
                                            className="flex justify-between items-center p-3 cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100"
                                            onClick={() => toggleCategoryExpansion(cat.name)}
                                        >
                                            <span className="font-semibold text-sm">{cat.name} <span className="text-xs font-normal text-gray-500">({selectedCount} sélectionné(s))</span></span>
                                            {isExpanded ? <ChevronUpIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4"/>}
                                        </div>
                                        
                                        {isExpanded && (
                                            <div className="p-3 bg-white dark:bg-gray-800 grid grid-cols-2 gap-2">
                                                {subs.map(sub => {
                                                    const isChecked = selectedLinks.some(l => l.parentCategory === cat.name && l.subCategory === sub);
                                                    return (
                                                        <label key={`${cat.name}-${sub}`} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isChecked} 
                                                                onChange={() => handleToggleLink(cat.name, sub)}
                                                                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-gray-300"
                                                            />
                                                            <span className="text-sm">{sub}</span>
                                                        </label>
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

                <div className="flex justify-end p-4 border-t dark:border-gray-700 gap-3 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                    <button type="button" onClick={handleSubmit} className="bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-700">Sauvegarder</button>
                </div>
            </div>
        </div>
    );
};
