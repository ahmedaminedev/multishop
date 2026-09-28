
import React, { useState, useMemo } from 'react';
import type { Pack, Product, Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, CubeIcon, CheckCircleIcon, SparklesIcon } from '../IconComponents';
import { PackFormModal } from './PackFormModal';

interface ManagePacksPageProps {
    packs: Pack[];
    setPacks: React.Dispatch<React.SetStateAction<Pack[]>>;
    allProducts: Product[];
    allCategories: Category[];
}

const isPackAvailable = (pack: Pack, allProducts: Product[], allPacks: Pack[]): boolean => {
    for (const productId of pack.includedProductIds) {
        const product = allProducts.find(p => p.id === productId);
        if (!product || product.quantity === 0) return false;
    }
    return true;
};

const PackAdminCard: React.FC<{ pack: Pack; onEdit: () => void; onDelete: () => void; available: boolean }> = ({ pack, onEdit, onDelete, available }) => (
    <div className="bg-white dark:bg-brand-dark rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
        <div className="relative h-48 bg-slate-50 dark:bg-gray-900 rounded-[2rem] overflow-hidden mb-6">
            <img src={pack.imageUrl} alt={pack.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-3 bg-white dark:bg-gray-800 text-brand-primary rounded-xl shadow-lg hover:scale-110 transition-all"><PencilIcon className="w-5 h-5"/></button>
                <button onClick={onDelete} className="p-3 bg-white dark:bg-gray-800 text-rose-500 rounded-xl shadow-lg hover:bg-rose-500 hover:text-white transition-all"><TrashIcon className="w-5 h-5"/></button>
            </div>
            <div className="absolute bottom-4 left-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${available ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {available ? 'Actif' : 'Indisponible'}
                </span>
            </div>
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{pack.name}</h3>
        <div className="flex justify-between items-end mt-6 pt-6 border-t border-slate-50 dark:border-white/5">
            <div>
                <p className="text-2xl font-black text-brand-primary">{pack.price.toFixed(3)} <span className="text-xs">DT</span></p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{pack.includedProductIds.length} actifs inclus</p>
            </div>
            <div className="w-10 h-10 bg-brand-light dark:bg-white/5 rounded-xl flex items-center justify-center text-brand-primary">
                <CubeIcon className="w-5 h-5" />
            </div>
        </div>
    </div>
);

export const ManagePacksPage: React.FC<ManagePacksPageProps> = ({ packs, setPacks, allProducts, allCategories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPack, setEditingPack] = useState<Pack | null>(null);

    return (
        <div className="p-8 bg-slate-50/50 dark:bg-brand-dark min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight">Rituels de <span className="text-brand-primary italic">Soin</span></h1>
                    <p className="text-slate-400 font-medium mt-2">Gestion des synergies et packs thérapeutiques</p>
                </div>
                <button onClick={() => { setEditingPack(null); setIsModalOpen(true); }} className="bg-brand-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
                    <PlusIcon className="w-5 h-5" /> Créer un Rituel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {packs.map(pack => (
                    <PackAdminCard 
                        key={pack.id} 
                        pack={pack} 
                        onEdit={() => { setEditingPack(pack); setIsModalOpen(true); }} 
                        onDelete={() => setPacks(prev => prev.filter(p => p.id !== pack.id))}
                        available={isPackAvailable(pack, allProducts, packs)}
                    />
                ))}
            </div>

            {isModalOpen && (
                <PackFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(d) => editingPack ? setPacks(prev => prev.map(p => p.id === editingPack.id ? {...d, id: p.id} : p)) : setPacks(prev => [...prev, {...d, id: Date.now()}])} pack={editingPack} allProducts={allProducts} allPacks={packs} allCategories={allCategories} />
            )}
        </div>
    );
};
