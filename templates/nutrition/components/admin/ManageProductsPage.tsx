
import React, { useState, useMemo } from 'react';
import type { Product, Category, Brand } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, SearchIcon } from '../IconComponents';
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
        <div className="bg-white dark:bg-[#1f2833] rounded-sm shadow-sm dark:shadow-md group overflow-hidden transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:border-brand-neon hover:border-black">
            {/* Image Container */}
            <div className="relative bg-gray-100 dark:bg-black p-4 border-b border-gray-100 dark:border-gray-800">
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className={`w-full h-40 object-contain transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} 
                />
                
                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={onEdit} className="bg-white dark:bg-black p-2 text-black dark:text-white hover:text-brand-neon dark:hover:text-brand-neon border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-brand-neon transition-colors shadow-sm">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={onDelete} className="bg-white dark:bg-black p-2 text-red-600 dark:text-brand-alert hover:text-white dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:bg-red-600 dark:hover:bg-red-600 hover:border-red-600 transition-colors shadow-sm">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>

                {isOutOfStock && (
                    <div className="absolute top-2 left-2 bg-red-600 dark:bg-brand-alert text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
                        RUPTURE
                    </div>
                )}
                {product.promo && !isOutOfStock && (
                    <div className="absolute top-2 left-2 bg-black dark:bg-brand-neon text-white dark:text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
                        PROMO
                    </div>
                )}
            </div>

            {/* Info Container */}
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>
                <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 flex-grow uppercase leading-tight">{product.name}</h3>
                
                <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col">
                        {product.oldPrice && (
                            <span className="text-[10px] text-gray-400 line-through decoration-red-500">{product.oldPrice.toFixed(3)}</span>
                        )}
                        <p className="text-lg font-black text-black dark:text-brand-neon">{product.price.toFixed(3)} <span className="text-[10px] font-normal">DT</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Stock</p>
                        <span className={`font-mono font-bold text-sm ${product.quantity < 5 ? 'text-red-600 dark:text-brand-alert' : 'text-gray-900 dark:text-white'}`}>
                            {product.quantity}
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
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortOption, setSortOption] = useState('name-asc');
    const [currentPage, setCurrentPage] = useState(1);
    
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
        setAlertState(prev => ({ ...prev, isOpen: false })); 
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
        <div className="p-6 bg-[#f3f4f6] dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-300 dark:border-gray-800 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider italic text-gray-900 dark:text-white">
                        Armurerie <span className="text-black dark:text-brand-neon">Produits</span>
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 uppercase tracking-widest">Gestion du catalogue global</p>
                </div>
                <button onClick={openCreateModal} className="bg-black dark:bg-brand-neon text-white dark:text-black font-bold text-xs uppercase tracking-widest py-3 px-6 hover:bg-gray-800 dark:hover:bg-white transition-colors flex items-center gap-2 shadow-lg shadow-black/10 dark:shadow-none transform hover:-translate-y-1">
                    <PlusIcon className="w-4 h-4" /> Ajouter Produit
                </button>
            </div>
            
            {/* Filters Toolbar */}
            <div className="bg-white dark:bg-[#1f2833] p-4 mb-8 flex flex-col md:flex-row gap-4 items-center border border-gray-300 dark:border-gray-700 shadow-sm dark:shadow-none rounded-sm">
                <div className="relative flex-grow w-full md:w-auto group">
                    <SearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-black dark:group-focus-within:text-brand-neon transition-colors" />
                    <input 
                        type="text" 
                        placeholder="RECHERCHER RÉFÉRENCE..." 
                        value={searchTerm} 
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                        className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 py-3 pl-10 pr-3 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider focus:outline-none focus:border-black dark:focus:border-brand-neon transition-colors placeholder-gray-500" 
                    />
                </div>
                <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="w-full md:w-auto bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 py-3 px-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider focus:outline-none focus:border-black dark:focus:border-brand-neon cursor-pointer">
                    <option value="all">Toutes Catégories</option>
                    {uniqueCategoryNames.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={sortOption} onChange={e => { setSortOption(e.target.value); setCurrentPage(1); }} className="w-full md:w-auto bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 py-3 px-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider focus:outline-none focus:border-black dark:focus:border-brand-neon cursor-pointer">
                    <option value="name-asc">Nom (A-Z)</option>
                    <option value="name-desc">Nom (Z-A)</option>
                    <option value="price-asc">Prix (Min-Max)</option>
                    <option value="price-desc">Prix (Max-Min)</option>
                </select>
            </div>

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginatedProducts.map(product => (
                        <AdminProductCard key={product.id} product={product} onEdit={() => openEditModal(product)} onDelete={() => confirmDeleteProduct(product.id)} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1f2833] border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="p-4 bg-gray-100 dark:bg-black rounded-full mb-4">
                        <SearchIcon className="w-8 h-8 text-gray-400 dark:text-gray-600"/>
                    </div>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wide">Aucun produit trouvé.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="flex justify-center items-center mt-12 space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-white dark:bg-[#1f2833] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-black hover:text-white dark:hover:border-brand-neon disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-[#1f2833] transition-colors shadow-sm">Précédent</button>
                    <span className="text-xs font-mono font-bold text-black dark:text-brand-neon mx-4 bg-white dark:bg-black px-4 py-2 border border-gray-300 dark:border-gray-800">PAGE {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-white dark:bg-[#1f2833] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-black hover:text-white dark:hover:border-brand-neon disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-[#1f2833] transition-colors shadow-sm">Suivant</button>
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
                    brands={brands}
                />
            )}

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
