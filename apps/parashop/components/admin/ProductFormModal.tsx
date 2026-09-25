
import React, { useState, useEffect } from 'react';
import type { Product, Category, Brand } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';
import { useToast } from '../ToastContext'; 

export const ProductFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (d: Omit<Product, 'id'>) => void; product: Product | null; categories: Category[]; brands?: Brand[] }> = ({ isOpen, onClose, onSave, product, categories, brands = [] }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({ name: '', brand: '', oldPrice: 0, discount: 0, images: [] as string[], category: '', description: '', quantity: 0, specifications: [] as {name:string, value:string}[] });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                brand: product.brand || '',
                oldPrice: product.oldPrice || product.price || 0,
                discount: product.discount || 0,
                images: product.images || [],
                category: product.category || '',
                description: product.description || '',
                quantity: product.quantity || 0,
                specifications: product.specifications || []
            });
        }
        else setFormData({ name: '', brand: '', oldPrice: 0, discount: 0, images: [], category: '', description: '', quantity: 0, specifications: [] });
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category) return addToast("Champs requis manquants", "error");
        onSave({ ...formData, imageUrl: formData.images[0] || '', price: formData.oldPrice * (1 - (formData.discount/100)) });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-fadeIn">
            <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-3xl font-serif font-black text-slate-900 uppercase tracking-tight">{product ? 'Édition' : 'Enregistrement'} <span className="text-brand-primary italic">Soin</span></h2>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Base de données pharmaceutique</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl shadow-sm transition-all text-slate-400 hover:text-brand-primary"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-5 space-y-8">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <ImageInput label="Galerie Officielle" images={formData.images} onChange={(imgs) => setFormData({...formData, images: imgs})} />
                            </div>
                        </div>
                        
                        <div className="lg:col-span-7 space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Appellation du soin</label>
                                    <input name="name" value={formData.name} onChange={handleChange} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-bold text-slate-900 focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder-slate-300" placeholder="EX: SÉRUM VITAMINE C..." required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Rayon Expert</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-brand-primary/20">
                                        <option value="">SÉLECTIONNER...</option>
                                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Laboratoire</label>
                                    <input name="brand" value={formData.brand} onChange={handleChange} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-bold text-slate-900" placeholder="NOM DU LABO" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Prix Public (DT)</label>
                                    <input name="oldPrice" type="number" value={formData.oldPrice} onChange={handleChange} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-bold text-slate-900" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Remise (%)</label>
                                    <input name="discount" type="number" value={formData.discount} onChange={handleChange} className="w-full h-16 bg-brand-primary/5 text-brand-primary border-none rounded-2xl px-8 font-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Unités Stock</label>
                                    <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-bold text-slate-900" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">Protocole d'utilisation & Composition</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="DÉTAILLER LES ACTIFS ET BIENFAITS..." className="w-full bg-slate-50 border-none rounded-[2rem] p-8 h-48 font-medium text-slate-600 focus:ring-2 focus:ring-brand-primary/20 resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex justify-end gap-6">
                        <button type="button" onClick={onClose} className="px-10 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">Annuler</button>
                        <button type="submit" className="bg-brand-primary text-white font-black px-16 py-5 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase tracking-widest text-[11px]">Enregistrer le soin</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
