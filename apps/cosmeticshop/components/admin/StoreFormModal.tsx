
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
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {as === 'input' ? (
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" />
        ) : (
            <textarea id={name} name={name} value={value} onChange={onChange} required={required} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" />
        )}
    </div>
);

export const StoreFormModal: React.FC<StoreFormModalProps> = ({ isOpen, onClose, onSave, store }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        email: '',
        openingHours: '',
        imageUrl: '',
        mapUrl: '',
        isPickupPoint: true,
    });

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name,
                address: store.address,
                city: store.city,
                postalCode: store.postalCode,
                phone: store.phone,
                email: store.email,
                openingHours: store.openingHours,
                imageUrl: store.imageUrl,
                mapUrl: store.mapUrl || '',
                isPickupPoint: store.isPickupPoint,
            });
        } else {
            setFormData({
                name: '', address: '', city: '', postalCode: '', phone: '', email: '', openingHours: '', imageUrl: '', mapUrl: '', isPickupPoint: true,
            });
        }
    }, [store]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageChange = (value: string) => {
        setFormData(prev => ({ ...prev, imageUrl: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">{store ? 'Modifier le magasin' : 'Ajouter un magasin'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
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
                    <InputField name="openingHours" label="Horaires d'ouverture" value={formData.openingHours} onChange={handleChange} as="textarea" required />
                    <ImageInput label="Image du magasin" value={formData.imageUrl} onChange={handleImageChange} required />
                    <InputField name="mapUrl" label="URL Google Maps Embed (src)" value={formData.mapUrl} onChange={handleChange} />
                    
                    <div className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            id="isPickupPoint"
                            name="isPickupPoint"
                            checked={formData.isPickupPoint}
                            onChange={handleChange}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPickupPoint" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Disponible pour le retrait en magasin (Checkout)
                        </label>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                        <button type="submit" className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
