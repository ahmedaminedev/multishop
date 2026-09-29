
import React, { useState } from 'react';
import type { Brand, Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon } from '../IconComponents';
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
                addToast("Marque mise à jour", "success");
            } else {
                const created = await api.createBrand(brandData);
                setBrands(prev => [...prev, created]);
                addToast("Marque créée", "success");
            }
        } catch (e) {
            addToast("Erreur lors de la sauvegarde", "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Supprimer cette marque ?")) {
            try {
                await api.deleteBrand(id);
                setBrands(prev => prev.filter(b => b.id !== id));
                addToast("Marque supprimée", "success");
            } catch (e) {
                addToast("Erreur suppression", "error");
            }
        }
    };

    const openCreate = () => { setEditingBrand(null); setIsModalOpen(true); };
    const openEdit = (brand: Brand) => { setEditingBrand(brand); setIsModalOpen(true); };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gérer les Marques</h1>
                <button onClick={openCreate} className="bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-rose-700 shadow-md">
                    <PlusIcon className="w-5 h-5" /> Ajouter une marque
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {brands.map(brand => (
                    <div key={brand.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center relative group hover:shadow-md transition-all">
                        <div className="h-20 w-full flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-900 rounded-md p-2">
                            {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" /> : <span className="text-gray-400">Pas de logo</span>}
                        </div>
                        <h3 className="font-bold text-lg mb-2">{brand.name}</h3>
                        <p className="text-xs text-gray-500 mb-4 text-center">
                            {(brand.associatedCategories || []).length} sous-catégorie(s) liée(s)
                        </p>
                        
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-800/80 rounded-full p-1 shadow">
                            <button onClick={() => openEdit(brand)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(brand.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <BrandFormModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    brand={editingBrand}
                    categories={categories}
                />
            )}
        </div>
    );
};
