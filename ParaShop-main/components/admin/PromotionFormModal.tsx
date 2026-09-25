
import React, { useState, useEffect, useMemo } from 'react';
import type { Promotion, Product, Pack, Category } from '../../types';
import { XMarkIcon, SearchIcon, TagIcon } from '../IconComponents';

interface PromotionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (promoData: Omit<Promotion, 'id'>) => void;
    promotion: Promotion | null;
    allProducts: Product[];
    allPacks: Pack[];
    allCategories: Category[];
}

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
    <button type="button" onClick={onClick} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${isActive ? 'border-brand-primary text-brand-primary bg-brand-primary/5' : 'border-transparent text-slate-400'}`}>
        {title}
    </button>
);

export const PromotionFormModal: React.FC<PromotionFormModalProps> = ({ isOpen, onClose, onSave, promotion, allProducts, allPacks, allCategories }) => {
    const [name, setName] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'packs'>('products');
    const [search, setSearch] = useState('');
    
    useEffect(() => {
        if (promotion) {
            setName(promotion.name);
            setDiscountPercentage(promotion.discountPercentage);
            setStartDate(promotion.startDate);
            setEndDate(promotion.endDate);
            setSelectedProductIds(promotion.productIds);
        } else {
            setName(''); setDiscountPercentage(0);
            const today = new Date().toISOString().split('T')[0];
            setStartDate(today); setEndDate(today);
            setSelectedProductIds([]);
        }
    }, [promotion]);

    const handleToggle = (id: number) => setSelectedProductIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, discountPercentage, startDate, endDate, productIds: selectedProductIds, packIds: [] });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-fadeIn">
            <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-2xl font-serif font-black text-slate-900 uppercase tracking-tight">{promotion ? 'Édition' : 'Nouvelle'} <span className="text-brand-primary italic">Campagne</span></h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col md:flex-row p-10 overflow-hidden gap-10">
                    <div className="w-full md:w-1/2 space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Nom de l'offre</label>
                            <input value={name} onChange={e => setName(e.target.value)} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-bold text-slate-900" placeholder="EX: CURE PRINTEMPS..." required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Début</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-bold" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Fin</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-bold" required />
                            </div>
                        </div>
                        <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-4 ml-2">Avantage Patient (%)</label>
                            <input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value))} className="w-full h-20 bg-white border-none rounded-2xl px-8 text-4xl font-black text-rose-600 shadow-sm" required />
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                        <div className="flex bg-white border-b border-slate-100">
                            <TabButton title={`Sélection (${selectedProductIds.length})`} isActive={true} onClick={() => {}} />
                        </div>
                        <div className="p-6 flex-grow flex flex-col overflow-hidden">
                            <div className="relative mb-6">
                                <SearchIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="FILTRER LE CATALOGUE..." className="w-full h-14 bg-white border-none rounded-2xl pl-14 pr-6 text-[10px] font-black uppercase tracking-[0.2em]" />
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar">
                                {allProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                                    <div key={p.id} onClick={() => handleToggle(p.id)} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${selectedProductIds.includes(p.id) ? 'bg-brand-primary/10 border-brand-primary' : 'bg-white border-transparent'}`}>
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedProductIds.includes(p.id) ? 'bg-brand-primary border-brand-primary' : 'border-slate-200'}`}>{selectedProductIds.includes(p.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}</div>
                                        <span className="text-xs font-bold uppercase truncate">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>
                 <div className="p-10 border-t border-slate-50 flex justify-end gap-4 bg-slate-50/30">
                    <button type="button" onClick={onClose} className="px-10 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">Annuler</button>
                    <button type="submit" onClick={handleSubmit} className="bg-brand-primary text-white font-black px-16 py-5 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase tracking-widest text-[11px]">Déployer la campagne</button>
                </div>
            </div>
        </div>
    );
};
