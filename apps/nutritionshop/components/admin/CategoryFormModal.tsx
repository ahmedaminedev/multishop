
import React, { useState, useEffect } from 'react';
import type { Category, SubCategoryGroup, SubCategoryItem } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon } from '../IconComponents';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (categoryData: Category) => void;
    category: Category | null;
}

const InputField = ({ name, label, value, onChange, as = 'input', disabled = false, required = false }: any) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
        {as === 'input' ? 
            <input type="text" id={name} name={name} value={value} onChange={onChange} required={required} disabled={disabled} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600 disabled:opacity-50" />
            :
            <textarea id={name} name={name} value={value} onChange={onChange} rows={4} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600 custom-scrollbar" />
        }
    </div>
);

const RadioOption = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: () => void }) => (
    <div className="flex items-center cursor-pointer" onClick={onChange}>
        <div className={`w-4 h-4 border flex items-center justify-center mr-2 ${checked ? 'border-brand-neon' : 'border-gray-600'}`}>
            {checked && <div className="w-2 h-2 bg-brand-neon"></div>}
        </div>
        <label className={`text-xs font-bold uppercase tracking-wider cursor-pointer ${checked ? 'text-white' : 'text-gray-500'}`}>{label}</label>
    </div>
);

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSave, category }) => {
    const [name, setName] = useState('');
    const [menuType, setMenuType] = useState<'none' | 'simple' | 'mega'>('none');
    const [subCategories, setSubCategories] = useState('');
    const [megaMenu, setMegaMenu] = useState<SubCategoryGroup[]>([]);

    useEffect(() => {
        if (category) {
            setName(category.name);
            if (category.megaMenu) {
                setMenuType('mega');
                setMegaMenu(category.megaMenu);
                setSubCategories('');
            } else if (category.subCategories) {
                setMenuType('simple');
                setSubCategories(category.subCategories.join('\n'));
                setMegaMenu([]);
            } else {
                setMenuType('none');
                setSubCategories('');
                setMegaMenu([]);
            }
        } else {
            setName('');
            setMenuType('none');
            setSubCategories('');
            setMegaMenu([]);
        }
    }, [category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let newCategory: Category = { name };
        if (menuType === 'simple') {
            newCategory.subCategories = subCategories.split('\n').filter(s => s.trim() !== '');
        } else if (menuType === 'mega') {
            newCategory.megaMenu = megaMenu;
        }
        onSave(newCategory);
        onClose();
    };

    const addMegaMenuGroup = () => setMegaMenu([...megaMenu, { title: 'Nouveau Groupe', items: [{ name: 'Nouvel élément' }] }]);
    const removeMegaMenuGroup = (groupIndex: number) => setMegaMenu(megaMenu.filter((_, i) => i !== groupIndex));
    const handleMegaMenuGroupChange = (groupIndex: number, newTitle: string) => {
        const newMegaMenu = [...megaMenu];
        newMegaMenu[groupIndex].title = newTitle;
        setMegaMenu(newMegaMenu);
    };
    const addMegaMenuItem = (groupIndex: number) => {
        const newMegaMenu = [...megaMenu];
        newMegaMenu[groupIndex].items.push({ name: 'Nouvel élément' });
        setMegaMenu(newMegaMenu);
    };
    const removeMegaMenuItem = (groupIndex: number, itemIndex: number) => {
        const newMegaMenu = [...megaMenu];
        newMegaMenu[groupIndex].items = newMegaMenu[groupIndex].items.filter((_, i) => i !== itemIndex);
        setMegaMenu(newMegaMenu);
    };
     const handleMegaMenuItemChange = (groupIndex: number, itemIndex: number, newName: string) => {
        const newMegaMenu = [...megaMenu];
        newMegaMenu[groupIndex].items[itemIndex].name = newName;
        setMegaMenu(newMegaMenu);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-3xl bg-[#0b0c10] border border-gray-800 rounded-sm shadow-2xl max-h-[90vh] flex flex-col animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-wider">{category ? 'MODIFIER' : 'AJOUTER'} <span className="text-brand-neon">CATÉGORIE</span></h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                    <InputField name="name" label="Nom" value={name} onChange={e => setName(e.target.value)} required disabled={!!category} />
                    
                    <div className="border-t border-gray-800 pt-6">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Structure du Menu</label>
                        <div className="flex gap-6 mb-6">
                            <RadioOption id="none" label="Aucun" checked={menuType === 'none'} onChange={() => setMenuType('none')} />
                            <RadioOption id="simple" label="Liste Simple" checked={menuType === 'simple'} onChange={() => setMenuType('simple')} />
                            <RadioOption id="mega" label="Méga Menu" checked={menuType === 'mega'} onChange={() => setMenuType('mega')} />
                        </div>
                    </div>

                    {menuType === 'simple' && (
                        <div className="animate-fadeIn">
                            <InputField name="subCategories" label="Sous-catégories (une par ligne)" value={subCategories} onChange={e => setSubCategories(e.target.value)} as="textarea" />
                        </div>
                    )}

                    {menuType === 'mega' && (
                        <div className="space-y-4 p-4 border border-gray-800 bg-[#111] animate-fadeIn">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Structure Méga Menu</h3>
                            {megaMenu.map((group, groupIndex) => (
                                <div key={groupIndex} className="p-4 border border-gray-700 bg-[#1a1a1a] space-y-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <input type="text" value={group.title} onChange={(e) => handleMegaMenuGroupChange(groupIndex, e.target.value)} className="flex-grow font-bold bg-transparent border-b border-gray-600 text-brand-neon focus:outline-none text-sm uppercase" placeholder="TITRE GROUPE" />
                                        <button type="button" onClick={() => removeMegaMenuGroup(groupIndex)} className="text-gray-600 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                    {group.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-center gap-3 pl-4 border-l border-gray-700">
                                            <input type="text" value={item.name} onChange={(e) => handleMegaMenuItemChange(groupIndex, itemIndex, e.target.value)} className="flex-grow bg-transparent border-b border-gray-800 text-gray-300 text-xs focus:outline-none" placeholder="Nom lien" />
                                            <button type="button" onClick={() => removeMegaMenuItem(groupIndex, itemIndex)} className="text-gray-600 hover:text-red-500"><TrashIcon className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addMegaMenuItem(groupIndex)} className="text-[10px] text-blue-400 hover:text-white uppercase font-bold flex items-center gap-1 mt-2">
                                        <PlusIcon className="w-3 h-3" /> Ajouter lien
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addMegaMenuGroup} className="w-full text-xs text-green-500 hover:text-white hover:bg-green-900/20 font-bold uppercase flex items-center justify-center gap-2 mt-4 p-3 border border-dashed border-gray-700 hover:border-green-500 transition-colors">
                                <PlusIcon className="w-4 h-4" /> Nouveau Groupe
                            </button>
                        </div>
                    )}
                    
                    <div className="flex justify-end pt-6 border-t border-gray-800 gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-500 border border-red-900/30 hover:bg-red-900/20 transition-colors">Annuler</button>
                        <button type="submit" className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-brand-neon text-black hover:bg-white transition-colors skew-x-[-10deg] shadow-[0_0_15px_rgba(204,255,0,0.4)]"><span className="skew-x-[10deg]">SAUVEGARDER</span></button>
                    </div>
                </form>
            </div>
        </div>
    );
};
