
import React, { useState, useEffect } from 'react';
import type { Category, SubCategoryGroup } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon, TagIcon } from '../IconComponents';

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
            if (category.megaMenu) { setMenuType('mega'); setMegaMenu(category.megaMenu); setSubCategories(''); }
            else if (category.subCategories) { setMenuType('simple'); setSubCategories(category.subCategories.join('\n')); setMegaMenu([]); }
            else { setMenuType('none'); setSubCategories(''); setMegaMenu([]); }
        } else { setName(''); setMenuType('none'); setSubCategories(''); setMegaMenu([]); }
    }, [category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let newCategory: Category = { name };
        if (menuType === 'simple') newCategory.subCategories = subCategories.split('\n').filter(s => s.trim() !== '');
        else if (menuType === 'mega') newCategory.megaMenu = megaMenu;
        onSave(newCategory);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-2xl font-serif font-black text-slate-900 uppercase tracking-tight">{category ? 'Modifier' : 'Nouveau'} <span className="text-brand-primary italic">Rayon</span></h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar space-y-8">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Intitulé thérapeutique</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-bold text-slate-900 focus:ring-2 focus:ring-brand-primary/20" placeholder="EX: DERMATOLOGIE..." required disabled={!!category} />
                    </div>
                    
                    <div className="space-y-6">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Type d'organisation</label>
                        <div className="flex gap-4">
                            {[
                                { id: 'none', label: 'Simple' },
                                { id: 'simple', label: 'Liste' },
                                { id: 'mega', label: 'Expert (Méga)' }
                            ].map(opt => (
                                <button key={opt.id} type="button" onClick={() => setMenuType(opt.id as any)} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${menuType === opt.id ? 'bg-brand-primary text-white border-brand-primary shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-brand-primary/20'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {menuType === 'simple' && (
                        <div className="animate-fadeIn">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Sous-spécialités (Une par ligne)</label>
                            <textarea value={subCategories} onChange={e => setSubCategories(e.target.value)} className="w-full bg-slate-50 border-none rounded-[2rem] p-8 h-48 font-medium text-slate-600 focus:ring-2 focus:ring-brand-primary/20 resize-none" placeholder="EX: VISAGE&#10;CORPS&#10;CHEVEUX..."></textarea>
                        </div>
                    )}

                    <div className="pt-8 border-t border-slate-50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-8 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Annuler</button>
                        <button type="submit" className="bg-brand-primary text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase tracking-widest text-[11px]">Enregistrer le rayon</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
