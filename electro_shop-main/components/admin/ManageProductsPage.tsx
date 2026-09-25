
import React, { useState, useMemo } from 'react';
import type { Product, Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, SearchIcon } from '../IconComponents';
import { ProductFormModal } from './ProductFormModal';
import { api } from '../../utils/api';
import { useToast } from '../ToastContext';
import { CustomAlert } from '../CustomAlert';

interface ManageProductsPageProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    categories: Category[];
}

const AdminProductCard: React.FC<{ product: Product; onEdit: () => void; onDelete: () => void; }> = ({ product, onEdit, onDelete }) => {
    const isOutOfStock = product.quantity === 0;
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md group overflow-hidden transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1">
            <div className="relative">
                <img src={product.imageUrl} alt={product.name} className={`w-full h-40 object-cover ${isOutOfStock ? 'filter grayscale' : ''}`} />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={onEdit} className="bg-white/80 dark:bg-gray-900/80 p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 shadow-md">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onDelete} className="bg-white/80 dark:bg-gray-900/80 p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 shadow-md">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                {isOutOfStock && <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">ÉPUISÉ</div>}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 flex-grow">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.category}</p>
                <div className="flex justify-between items-end mt-2">
                    <p className="text-lg font-bold text-red-600 dark:text-red-500">{product.price.toFixed(3).replace('.', ',')} DT</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Stock: <span className="font-bold">{product.quantity}</span></p>
                </div>
            </div>
        </div>
    );
};

export const ManageProductsPage: React.FC<ManageProductsPageProps> = ({ products, setProducts, categories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortOption, setSortOption] = useState('name-asc');
    const [currentPage, setCurrentPage] = useState(1);
    
    // States for CustomAlert
    const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info'; showCancel?: boolean; onConfirm?: () => void }>({
        isOpen: false, title: '', message: '', type: 'info'
    });

    const PRODUCTS_PER_PAGE = 12;
    const { addToast } = useToast();

    const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
        try {
            const created = await api.createProduct(newProduct);
            setProducts(prev => [...prev, created]);
            setAlertState({
                isOpen: true,
                title: "Succès",
                message: "Le produit a été créé avec succès.",
                type: "success",
                onConfirm: () => setAlertState(prev => ({...prev, isOpen: false}))
            });
        } catch (e) {
            addToast("Erreur lors de la création", "error");
        }
    };

    const handleUpdateProduct = async (updatedProduct: Product) => {
        try {
            const updated = await api.updateProduct(updatedProduct.id, updatedProduct);
            setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
            setAlertState({
                isOpen: true,
                title: "Succès",
                message: "Le produit a été mis à jour.",
                type: "success",
                onConfirm: () => setAlertState(prev => ({...prev, isOpen: false}))
            });
        } catch (e) {
            addToast("Erreur lors de la mise à jour", "error");
        }
    };
    
    const confirmDeleteProduct = (productId: number) => {
        setAlertState({
            isOpen: true,
            title: "Confirmer la suppression",
            message: "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.",
            type: "warning",
            showCancel: true,
            onConfirm: () => handleDeleteProduct(productId)
        });
    };

    const handleDeleteProduct = async (productId: number) => {
        setAlertState(prev => ({ ...prev, isOpen: false })); // Close confirmation modal
        try {
            await api.deleteProduct(productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
            setAlertState({
                isOpen: true,
                title: "Supprimé",
                message: "Le produit a été supprimé avec succès.",
                type: "success",
                onConfirm: () => setAlertState(prev => ({...prev, isOpen: false}))
            });
        } catch (e) {
            addToast("Erreur lors de la suppression", "error");
        }
    };
    
    const openCreateModal = () => { setEditingProduct(null); setIsModalOpen(true); };
    const openEditModal = (product: Product) => { setEditingProduct(product); setIsModalOpen(true); };

    const processedProducts = useMemo(() => {
        let filtered = products
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(p => filterCategory === 'all' || p.category === filterCategory);

        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                default: return 0;
            }
        });
        return filtered;
    }, [products, searchTerm, filterCategory, sortOption]);

    const totalPages = Math.ceil(processedProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = processedProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

    const uniqueCategoryNames = useMemo(() => {
        const allCategoryNames = categories.flatMap(c => 
            [c.name, ...(c.subCategories || []), ...(c.megaMenu?.flatMap(m => m.items.map(i => i.name)) || [])]
        );
        return [...new Set(allCategoryNames)].sort();
    }, [categories]);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gérer les Produits</h1>
                <button onClick={openCreateModal} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-md hover:shadow-lg">
                    <PlusIcon className="w-5 h-5" /> Ajouter un produit
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full md:w-auto">
                    <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Rechercher par nom..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" />
                </div>
                <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="w-full md:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500">
                    <option value="all">Toutes les catégories</option>
                    {uniqueCategoryNames.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={sortOption} onChange={e => { setSortOption(e.target.value); setCurrentPage(1); }} className="w-full md:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500">
                    <option value="name-asc">Trier par: Nom (A-Z)</option>
                    <option value="name-desc">Trier par: Nom (Z-A)</option>
                    <option value="price-asc">Trier par: Prix (Bas-Haut)</option>
                    <option value="price-desc">Trier par: Prix (Haut-Bas)</option>
                </select>
            </div>

            {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginatedProducts.map(product => (
                        <AdminProductCard key={product.id} product={product} onEdit={() => openEditModal(product)} onDelete={() => confirmDeleteProduct(product.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-lg text-gray-600 dark:text-gray-400">Aucun produit trouvé.</p>
                </div>
            )}

            {totalPages > 1 && (
                <nav className="flex justify-center items-center mt-8 space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Précédent</button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} sur {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Suivant</button>
                </nav>
            )}

            {isModalOpen && (
                <ProductFormModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(data) => {
                        if (editingProduct) handleUpdateProduct({ ...editingProduct, ...data });
                        else handleAddProduct(data);
                    }}
                    product={editingProduct}
                    categories={categories}
                />
            )}

            {/* Global Custom Alert for Product Actions */}
            <CustomAlert 
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                showCancelButton={alertState.showCancel}
                onConfirm={alertState.onConfirm}
            />
        </div>
    );
};
