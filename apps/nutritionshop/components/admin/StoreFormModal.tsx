
import React, { useState, useEffect } from 'react';
import type { Store } from '../../types';
import { XMarkIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';

interface StoreFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (storeData: Omit<Store, 'id'>) => void;
    store: Store | null;
}

const InputField: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; required?: boolean; as?: 'input' | 'textarea' }> = 
({ name, label, value, onChange, type = 'text', required = false, as = 'input' }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
        {as === 'input' ? (
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600" />
        ) : (
            <textarea id={name} name={name} value={value} onChange={onChange} required={required} rows={3} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600 custom-scrollbar" />
        )}
    </div>
);

export const StoreFormModal: React.FC<StoreFormModalProps> = ({ isOpen, onClose, onSave, store }) => {
    const [formData, setFormData] = useState({
        name: '', address: '', city: '', postalCode: '', phone: '', email: '', openingHours: '', imageUrl: '', mapUrl: '', isPickupPoint: true,
    });

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name, address: store.address, city: store.city, postalCode: store.postalCode, phone: store.phone, email: store.email,
                openingHours: store.openingHours, imageUrl: store.imageUrl, mapUrl: store.mapUrl || '', isPickupPoint: store.isPickupPoint,
            });
        } else {
            setFormData({ name: '', address: '', city: '', postalCode: '', phone: '', email: '', openingHours: '', imageUrl: '', mapUrl: '', isPickupPoint: true });
        }
    }, [store]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageChange = (value: string) => setFormData(prev => ({ ...prev, imageUrl: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-[#0b0c10] border border-gray-800 rounded-sm shadow-2xl max-h-[90vh] flex flex-col animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-wider">{store ? 'MODIFIER' : 'NOUVEAU'} <span className="text-brand-neon">MAGASIN</span></h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-4 custom-scrollbar">
                    <InputField name="name" label="Nom du magasin" value={formData.name} onChange={handleChange} required />
                    <InputField name="address" label="Adresse complète" value={formData.address} onChange={handleChange} required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField name="city" label="Ville" value={formData.city} onChange={handleChange} required />
                        <InputField name="postalCode" label="Code Postal" value={formData.postalCode} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField name="phone" label="Téléphone" value={formData.phone} onChange={handleChange} required />
                        <InputField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <InputField name="openingHours" label="Horaires" value={formData.openingHours} onChange={handleChange} as="textarea" required />
                    <ImageInput label="Photo Façade" value={formData.imageUrl} onChange={handleImageChange} required />
                    <InputField name="mapUrl" label="Google Maps Embed URL" value={formData.mapUrl} onChange={handleChange} />
                    
                    <div className="flex items-center mt-4 bg-[#1a1a1a] p-3 border border-gray-700">
                        <input type="checkbox" id="isPickupPoint" name="isPickupPoint" checked={formData.isPickupPoint} onChange={handleChange} className="h-4 w-4 text-brand-neon focus:ring-brand-neon border-gray-500 rounded bg-black" />
                        <label htmlFor="isPickupPoint" className="ml-3 block text-xs font-bold text-white uppercase tracking-wider cursor-pointer">Point de retrait actif</label>
                    </div>

                    <div className="flex justify-end pt-6 gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-500 border border-red-900/30 hover:bg-red-900/20 transition-colors">Annuler</button>
                        <button type="submit" className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-brand-neon text-black hover:bg-white transition-colors skew-x-[-10deg] shadow-[0_0_15px_rgba(204,255,0,0.4)]"><span className="skew-x-[10deg]">VALIDER</span></button>
                    </div>
                </form>
            </div>
        </div>
    );
};
