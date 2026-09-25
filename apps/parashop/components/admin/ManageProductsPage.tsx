
import React, { useState, useMemo } from 'react';
import type { Product, Category, Brand } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, SearchIcon, SparklesIcon } from '../IconComponents';
import { ProductFormModal } from './ProductFormModal';
import { api } from '../../utils/api';
import { useToast } from '../ToastContext';
import { CustomAlert } from '../CustomAlert';

interface ManageProductsPageProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    categories: Category[];
    brands: Brand[];
}

const AdminProductCard: React.FC<{ product: Product; onEdit: () => void; onDelete: () => void; }> = ({ product, onEdit, onDelete }) => {
    const isOutOfStock = product.quantity === 0;
    return (
        <div className="bg-white dark:bg-brand-dark rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 group overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-brand-primary/20">
            <div className="relative bg-slate-50 dark:bg-gray-900 p-8 h-64 flex items-center justify-center">
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className={`max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`} 
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="bg-white dark:bg-gray-800 p-3 text-slate-600 dark:text-white hover:text-brand-primary rounded-2xl shadow-lg transition-all"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={onDelete} className="bg-white dark:bg-gray-800 p-3 text-rose-500 rounded-2xl shadow-lg transition-all hover:bg-rose-500 hover:text-white"><TrashIcon className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="p-8">
                <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2">{product.brand}</p>
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white line-clamp-2 h-14 leading-tight mb-6">{product.name}</h3>
                <div className="flex justify-between items-end border-t border-slate-50 dark:border-white/5 pt-6">
                    <div>
                        <p className="text-2xl font-black text-brand-primary">{product.price.toFixed(3)} <span className="text-xs">DT</span></p>
                        {product.oldPrice && <span className="text-[10px] text-slate-300 line-through">{product.oldPrice.toFixed(3)}</span>}
                    </div>
                    <div className="text-right">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isOutOfStock ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                            Stock: {product.quantity}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ManageProductsPage: React.FC<ManageProductsPageProps> = ({ products, setProducts, categories, brands }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [alertState, setAlertState] = useState<any>({ isOpen: false });
    const { addToast } = useToast();

    const handleUpdateProduct = async (updatedProduct: Product) => {
        try {
            const updated = await api.updateProduct(updatedProduct.id, updatedProduct);
            setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
            addToast("Soin mis à jour", "success");
        } catch (e) { addToast("Erreur", "error"); }
    };

    const confirmDeleteProduct = (productId: number) => {
        setAlertState({
            isOpen: true, title: "Suppression", message: "Supprimer ce soin du catalogue ?", type: "warning", showCancel: true,
            onConfirm: async () => {
                await api.deleteProduct(productId);
                setProducts(prev => prev.filter(p => p.id !== productId));
                setAlertState({ isOpen: false });
                addToast("Produit supprimé", "success");
            }
        });
    };

    const processedProducts = useMemo(() => 
        products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]);

    return (
        <div className="p-8 bg-slate-50/50 dark:bg-brand-dark min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight">Catalogue <span className="text-brand-primary italic">Officine</span></h1>
                    <p className="text-slate-400 font-medium mt-2">Gestion des actifs et soins pharmaceutiques</p>
                </div>
                <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-brand-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
                    <PlusIcon className="w-5 h-5" /> Ajouter un Soin
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] mb-12 flex items-center gap-4 shadow-sm border border-slate-100 dark:border-white/5">
                <SearchIcon className="w-6 h-6 text-slate-300 ml-4" />
                <input type="text" placeholder="RECHERCHER RÉFÉRENCE..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow bg-transparent border-none text-sm font-bold placeholder-slate-300 focus:ring-0" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {processedProducts.map(product => (
                    <AdminProductCard key={product.id} product={product} onEdit={() => { setEditingProduct(product); setIsModalOpen(true); }} onDelete={() => confirmDeleteProduct(product.id)} />
                ))}
            </div>

            {isModalOpen && (
                <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={async (data) => editingProduct ? handleUpdateProduct({ ...editingProduct, ...data }) : (async () => { const c = await api.createProduct(data); setProducts([...products, c]); addToast("Soin créé", "success"); })()} product={editingProduct} categories={categories} brands={brands} />
            )}

            <CustomAlert {...alertState} onClose={() => setAlertState({ isOpen: false })} />
        </div>
    );
};
