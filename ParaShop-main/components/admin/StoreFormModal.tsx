
import React, { useState, useEffect } from 'react';
import type { Store } from '../../types';
import { XMarkIcon, StorefrontIcon, MapPinIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';

interface StoreFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (storeData: Omit<Store, 'id'>) => void;
    store: Store | null;
}

export const StoreFormModal: React.FC<StoreFormModalProps> = ({ isOpen, onClose, onSave, store }) => {
    const [formData, setFormData] = useState({ name: '', address: '', city: '', postalCode: '', phone: '', email: '', openingHours: '', imageUrl: '', mapUrl: '', isPickupPoint: true });

    useEffect(() => {
        if (store) setFormData({ ...store, mapUrl: store.mapUrl || '' });
        else setFormData({ name: '', address: '', city: '', postalCode: '', phone: '', email: '', openingHours: '', imageUrl: '', mapUrl: '', isPickupPoint: true });
    }, [store]);

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); onClose(); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-fadeIn">
            <div className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-2xl font-serif font-black text-slate-900 uppercase tracking-tight">{store ? 'Édition' : 'Nouvelle'} <span className="text-brand-primary italic">Officine</span></h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar space-y-6">
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-bold text-slate-900" placeholder="NOM DE LA PHARMACIE" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-bold text-slate-900" placeholder="VILLE" required />
                        <input value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="w-full h-16 bg-slate-50 border-none rounded-2xl px-8 font-bold text-slate-900" placeholder="CODE POSTAL" required />
                    </div>
                    <textarea value={formData.openingHours} onChange={e => setFormData({...formData, openingHours: e.target.value})} className="w-full bg-slate-50 border-none rounded-[2rem] p-8 h-32 font-medium text-slate-600 focus:ring-2 focus:ring-brand-primary/20 resize-none" placeholder="HORAIRES D'OUVERTURE..." required></textarea>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <ImageInput label="Visuel Façade" value={formData.imageUrl} onChange={v => setFormData({...formData, imageUrl: v})} required />
                    </div>
                    <div className="flex justify-end pt-8 border-t border-slate-50 gap-4">
                        <button type="button" onClick={onClose} className="px-8 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Annuler</button>
                        <button type="submit" className="bg-brand-primary text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase tracking-widest text-[11px]">Enregistrer l'officine</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
