import React, { useState, useEffect } from 'react';
import type { Category, SubCategoryGroup, SubCategoryItem } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon } from '../IconComponents';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (categoryData: Category) => void;
    category: Category | null;
}

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
            // Reset for new category
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

    // Mega Menu handlers
    const addMegaMenuGroup = () => {
        setMegaMenu([...megaMenu, { title: 'Nouveau Groupe', items: [{ name: 'Nouvel élément' }] }]);
    };
    const removeMegaMenuGroup = (groupIndex: number) => {
        setMegaMenu(megaMenu.filter((_, i) => i !== groupIndex));
    };
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    <InputField name="name" label="Nom de la catégorie" value={name} onChange={e => setName(e.target.value)} required disabled={!!category} />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de sous-menu</label>
                        <div className="flex gap-4">
                            <RadioOption id="none" label="Aucun" checked={menuType === 'none'} onChange={() => setMenuType('none')} />
                            <RadioOption id="simple" label="Liste Simple" checked={menuType === 'simple'} onChange={() => setMenuType('simple')} />
                            <RadioOption id="mega" label="Méga Menu" checked={menuType === 'mega'} onChange={() => setMenuType('mega')} />
                        </div>
                    </div>

                    {menuType === 'simple' && (
                        <InputField name="subCategories" label="Sous-catégories (une par ligne)" value={subCategories} onChange={e => setSubCategories(e.target.value)} as="textarea" />
                    )}

                    {menuType === 'mega' && (
                        <div className="space-y-4 p-4 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                            <h3 className="font-semibold">Constructeur de Méga Menu</h3>
                            {megaMenu.map((group, groupIndex) => (
                                <div key={groupIndex} className="p-3 border rounded-md dark:border-gray-600 space-y-2 bg-white dark:bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={group.title} onChange={(e) => handleMegaMenuGroupChange(groupIndex, e.target.value)} className="flex-grow font-semibold bg-transparent border-b dark:border-gray-500 focus:outline-none" />
                                        <button type="button" onClick={() => removeMegaMenuGroup(groupIndex)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                    {group.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-center gap-2 pl-4">
                                            <input type="text" value={item.name} onChange={(e) => handleMegaMenuItemChange(groupIndex, itemIndex, e.target.value)} className="flex-grow bg-transparent border-b dark:border-gray-600 text-sm focus:outline-none" />
                                            <button type="button" onClick={() => removeMegaMenuItem(groupIndex, itemIndex)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addMegaMenuItem(groupIndex)} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2">
                                        <PlusIcon className="w-4 h-4" /> Ajouter un élément
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addMegaMenuGroup} className="w-full text-sm text-green-600 hover:underline flex items-center justify-center gap-1 mt-2 p-2 border-2 border-dashed rounded-md">
                                <PlusIcon className="w-4 h-4" /> Ajouter un groupe
                            </button>
                        </div>
                    )}
                    
                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                        <button type="submit" className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ name, label, value, onChange, as = 'input', disabled = false, required = false }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {as === 'input' ? 
            <input type="text" id={name} name={name} value={value} onChange={onChange} required={required} disabled={disabled} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-200 dark:disabled:bg-gray-600" />
            :
            <textarea id={name} name={name} value={value} onChange={onChange} rows={4} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" />
        }
    </div>
);

const RadioOption = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: () => void }) => (
    <div className="flex items-center">
        <input type="radio" id={id} name="menuType" checked={checked} onChange={onChange} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300" />
        <label htmlFor={id} className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-100">{label}</label>
    </div>
);
