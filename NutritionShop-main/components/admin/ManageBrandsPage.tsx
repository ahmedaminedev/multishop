
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
        <div className="p-6 bg-gray-100 dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider italic">Partenaires & <span className="text-black dark:text-brand-neon">Marques</span></h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Gestion des fournisseurs</p>
                </div>
                <button onClick={openCreate} className="bg-black dark:bg-brand-neon text-white dark:text-black font-bold text-xs uppercase tracking-widest py-3 px-6 hover:bg-gray-800 dark:hover:bg-white transition-colors flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" /> Ajouter
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {brands.map(brand => (
                    <div key={brand.id} className="bg-white dark:bg-[#1f2833] border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-brand-neon transition-all p-6 flex flex-col items-center relative group shadow-sm dark:shadow-none">
                        <div className="h-24 w-full flex items-center justify-center mb-6 bg-gray-50 dark:bg-black rounded-sm p-4 border border-gray-100 dark:border-gray-800">
                            {brand.logoUrl ? (
                                <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                            ) : (
                                <span className="text-gray-400 dark:text-gray-600 font-mono text-xs">NO LOGO</span>
                            )}
                        </div>
                        
                        <div className="text-center w-full">
                            <h3 className="font-black text-xl uppercase italic mb-2 text-gray-900 dark:text-white">{brand.name}</h3>
                            <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black/50 py-1 px-3 rounded-full border border-gray-200 dark:border-gray-700">
                                <StarIcon className="w-3 h-3 text-black dark:text-brand-neon" />
                                {(brand.associatedCategories || []).length} Catégories
                            </div>
                        </div>
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(brand)} className="p-2 bg-gray-100 dark:bg-black text-gray-600 dark:text-white hover:text-black dark:hover:text-brand-neon border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-brand-neon transition-colors">
                                <PencilIcon className="w-4 h-4"/>
                            </button>
                            <button onClick={() => handleDelete(brand.id)} className="p-2 bg-gray-100 dark:bg-black text-red-500 hover:text-white border border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-500 transition-colors">
                                <TrashIcon className="w-4 h-4"/>
                            </button>
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
