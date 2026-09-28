
import React, { useState } from 'react';
import type { Brand, Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, StarIcon } from '../IconComponents';
import { BrandFormModal } from './BrandFormModal';
import { api } from '../../utils/api';
import { useToast } from '../ToastContext';

interface ManageBrandsPageProps {
    brands: Brand[];
    setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
    categories: Category[];
}

export const ManageBrandsPage: React.FC<ManageBrandsPageProps> = ({ brands, setBrands, categories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const { addToast } = useToast();

    const handleSave = async (brandData: Omit<Brand, 'id'>) => {
        try {
            if (editingBrand) {
                const updated = await api.updateBrand(editingBrand.id, brandData);
                setBrands(prev => prev.map(b => b.id === updated.id ? updated : b));
                addToast("Laboratoire mis à jour", "success");
            } else {
                const created = await api.createBrand(brandData);
                setBrands(prev => [...prev, created]);
                addToast("Laboratoire ajouté", "success");
            }
        } catch (e) {
            addToast("Erreur de sauvegarde", "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Supprimer ce laboratoire ?")) {
            try {
                await api.deleteBrand(id);
                setBrands(prev => prev.filter(b => b.id !== id));
                addToast("Laboratoire retiré", "success");
            } catch (e) { addToast("Erreur", "error"); }
        }
    };

    return (
        <div className="p-8 bg-gray-50 dark:bg-brand-dark min-h-screen">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-3xl font-serif font-black uppercase text-gray-900 dark:text-white">Nos <span className="text-brand-primary">Laboratoires</span></h1>
                    <p className="text-gray-500 font-medium mt-1">Gestion des partenaires scientifiques</p>
                </div>
                <button 
                    onClick={() => { setEditingBrand(null); setIsModalOpen(true); }}
                    className="bg-brand-primary text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" /> Ajouter un Labo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {brands.map(brand => (
                    <div key={brand.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center group relative shadow-sm hover:shadow-xl transition-all">
                        <div className="w-24 h-24 mb-6 bg-brand-light dark:bg-gray-900 rounded-2xl flex items-center justify-center p-4">
                            {brand.logoUrl ? (
                                <img src={brand.logoUrl} className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all" alt="" />
                            ) : (
                                <StarIcon className="w-8 h-8 text-brand-primary opacity-30" />
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center uppercase tracking-tight">{brand.name}</h3>
                        <p className="text-[10px] font-black text-brand-primary uppercase bg-brand-primary/10 px-3 py-1 rounded-full">Partenaire Officiel</p>
                        
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingBrand(brand); setIsModalOpen(true); }} className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-brand-primary transition-colors rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(brand.id)} className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-rose-500 transition-colors rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <BrandFormModal 
                    isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                    onSave={handleSave} brand={editingBrand} categories={categories}
                />
            )}
        </div>
    );
};
