
import React, { useState, useEffect, useMemo } from 'react';
import type { Pack, Product, Category } from '../../types';
import { XMarkIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon, CubeIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';

interface PackFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (packData: Omit<Pack, 'id'>) => void;
    pack: Pack | null;
    allProducts: Product[];
    allPacks: Pack[];
    allCategories: Category[];
}

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
    <button type="button" onClick={onClick} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${isActive ? 'border-brand-primary text-brand-primary bg-brand-primary/5' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
        {title}
    </button>
);

export const PackFormModal: React.FC<PackFormModalProps> = ({ isOpen, onClose, onSave, pack, allProducts, allPacks, allCategories }) => {
    const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '', discount: 0 });
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'packs'>('products');
    const [productSearchTerm, setProductSearchTerm] = useState('');

    useEffect(() => {
        if (pack) {
            setFormData({ name: pack.name, description: pack.description, imageUrl: pack.imageUrl, discount: pack.discount || 0 });
            setSelectedProductIds(pack.includedProductIds);
        } else {
            setFormData({ name: '', description: '', imageUrl: '', discount: 0 });
            setSelectedProductIds([]);
        }
    }, [pack]);

    const basePrice = useMemo(() => selectedProductIds.reduce((sum, id) => sum + (allProducts.find(p => p.id === id)?.price || 0), 0), [selectedProductIds, allProducts]);
    const finalPrice = useMemo(() => basePrice * (1 - (formData.discount || 0) / 100), [basePrice, formData.discount]);

    const handleProductToggle = (id: number) => setSelectedProductIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, price: finalPrice, oldPrice: basePrice, includedProductIds: selectedProductIds, includedItems: allProducts.filter(p => selectedProductIds.includes(p.id)).map(p => p.name) });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-fadeIn">
            <div className="relative w-full max-w-6xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div>
                        <h2 className="text-3xl font-serif font-black text-slate-900 uppercase tracking-tight">Configuration <span className="text-brand-primary italic">Rituel</span></h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Assemblage thérapeutique de cures</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl shadow-sm text-slate-400"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col lg:flex-row p-10 overflow-hidden gap-12">
                    <div className="w-full lg:w-1/2 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                        <div className="space-y-6">
                            <input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-black text-xl text-slate-900 placeholder-slate-300" placeholder="NOM DU RITUEL..." required />
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <ImageInput label="Visuel Signature" value={formData.imageUrl} onChange={v => setFormData({...formData, imageUrl: v})} />
                            </div>
                            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="ARGUMENTAIRE BIEN-ÊTRE..." className="w-full bg-slate-50 border-none rounded-[2rem] p-8 h-40 text-slate-600 font-medium resize-none"></textarea>
                        </div>
                        
                        <div className="p-10 bg-brand-dark text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><CubeIcon className="w-32 h-32"/></div>
                            <div className="flex justify-between items-end mb-8">
                                <div><p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Valeur cumulée</p><p className="text-2xl font-mono opacity-40 line-through">{basePrice.toFixed(3)} DT</p></div>
                                <div className="w-32"><label className="block text-[9px] font-black uppercase text-slate-400 mb-2">Remise Rituel (%)</label><input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-full bg-white/10 border-none rounded-xl px-4 py-2 font-black text-brand-primary" /></div>
                            </div>
                            <div className="border-t border-white/5 pt-8 flex justify-between items-end">
                                <p className="text-xs font-black uppercase tracking-widest">Investissement Client</p>
                                <p className="text-5xl font-serif font-black text-brand-primary">{finalPrice.toFixed(3)} <span className="text-sm font-sans">DT</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                        <div className="flex bg-white border-b border-slate-100">
                            <TabButton title="Actifs du catalogue" isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                        </div>
                        
                        <div className="p-6 flex-grow flex flex-col overflow-hidden">
                            <div className="relative mb-6">
                                <SearchIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input placeholder="RECHERCHER UN SOIN..." value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} className="w-full h-14 bg-white border-none rounded-2xl pl-14 pr-6 text-xs font-bold uppercase tracking-widest shadow-sm" />
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                {allProducts.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase())).map(p => (
                                    <div key={p.id} onClick={() => handleProductToggle(p.id)} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${selectedProductIds.includes(p.id) ? 'bg-brand-primary/10 border-brand-primary shadow-sm' : 'bg-white border-transparent hover:border-slate-200'}`}>
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedProductIds.includes(p.id) ? 'bg-brand-primary border-brand-primary' : 'bg-white border-slate-200'}`}>{selectedProductIds.includes(p.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}</div>
                                        <img src={p.imageUrl} className="w-10 h-10 object-contain" />
                                        <span className={`text-xs font-bold uppercase ${selectedProductIds.includes(p.id) ? 'text-brand-primary' : 'text-slate-600'}`}>{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>
                <div className="p-10 border-t border-slate-50 flex justify-end gap-4 bg-slate-50/30">
                    <button type="button" onClick={onClose} className="px-10 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">Annuler</button>
                    <button type="submit" onClick={handleSubmit} className="bg-brand-primary text-white font-black px-16 py-5 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase tracking-widest text-[11px]">Déployer le rituel</button>
                </div>
            </div>
        </div>
    );
};
