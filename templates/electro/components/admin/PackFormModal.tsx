
import React, { useState, useEffect, useMemo } from 'react';
import type { Pack, Product, Category } from '../../types';
import { XMarkIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';

interface PackFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (packData: Omit<Pack, 'id'>) => void;
    pack: Pack | null;
    allProducts: Product[];
    allPacks: Pack[];
    allCategories: Category[];
}

export const PackFormModal: React.FC<PackFormModalProps> = ({ isOpen, onClose, onSave, pack, allProducts, allPacks, allCategories }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        discount: 0,
    });
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [selectedPackIds, setSelectedPackIds] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'packs'>('products');
    
    // State for product selector
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [expandedPacks, setExpandedPacks] = useState<number[]>([]);

    useEffect(() => {
        if (pack) {
            setFormData({
                name: pack.name,
                description: pack.description,
                imageUrl: pack.imageUrl,
                discount: pack.discount || 0,
            });
            setSelectedProductIds(pack.includedProductIds);
            setSelectedPackIds(pack.includedPackIds || []);
        } else {
            // Reset for new pack
            setFormData({ name: '', description: '', imageUrl: '', discount: 0 });
            setSelectedProductIds([]);
            setSelectedPackIds([]);
        }
        setSelectedMainCategory('');
        setSelectedSubCategory('');
        setProductSearchTerm('');
        setExpandedPacks([]);
    }, [pack]);

    // Dynamic price calculation
    const basePrice = useMemo(() => {
        const productsPrice = selectedProductIds.reduce((sum, id) => {
            const product = allProducts.find(p => p.id === id);
            return sum + (product?.oldPrice || product?.price || 0);
        }, 0);
        const packsPrice = selectedPackIds.reduce((sum, id) => {
            const subPack = allPacks.find(p => p.id === id);
            return sum + (subPack?.oldPrice || 0);
        }, 0);
        return productsPrice + packsPrice;
    }, [selectedProductIds, selectedPackIds, allProducts, allPacks]);

    const finalPrice = useMemo(() => {
        return basePrice * (1 - (formData.discount || 0) / 100);
    }, [basePrice, formData.discount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleImageChange = (value: string) => {
        setFormData(prev => ({ ...prev, imageUrl: value }));
    };

    const handleProductSelect = (productId: number) => {
        setSelectedProductIds(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const handlePackSelect = (packId: number) => {
        setSelectedPackIds(prev =>
            prev.includes(packId) ? prev.filter(id => id !== packId) : [...prev, packId]
        );
    };

    const togglePackExpansion = (packId: number) => {
        setExpandedPacks(prev =>
            prev.includes(packId)
                ? prev.filter(id => id !== packId)
                : [...prev, packId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const includedProducts = allProducts.filter(p => selectedProductIds.includes(p.id));
        const includedPacks = allPacks.filter(p => selectedPackIds.includes(p.id));
        
        const packData: Omit<Pack, 'id'> = {
            name: formData.name,
            description: formData.description,
            imageUrl: formData.imageUrl,
            discount: formData.discount,
            price: finalPrice,
            oldPrice: basePrice,
            includedItems: [
                ...includedPacks.map(p => p.name), 
                ...includedProducts.map(p => p.name)
            ],
            includedProductIds: selectedProductIds,
            includedPackIds: selectedPackIds,
        };
        onSave(packData);
        onClose();
    };

    const subCategoriesForSelected = useMemo(() => {
        if (!selectedMainCategory) return [];
        const category = allCategories.find(c => c.name === selectedMainCategory);
        if (!category) return [];
        if (category.subCategories) return category.subCategories;
        if (category.megaMenu) return category.megaMenu.flatMap(group => group.items.map(item => item.name));
        return [];
    }, [selectedMainCategory, allCategories]);

    const filteredProducts = useMemo(() => {
        if (!selectedSubCategory) return [];
        return allProducts.filter(p => 
            p.category === selectedSubCategory && 
            p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) &&
            p.quantity > 0 // Only show products in stock
        );
    }, [allProducts, selectedSubCategory, productSearchTerm]);
    
    const availableSubPacks = useMemo(() => {
        // Filter for packs that ONLY contain products (no sub-packs)
        // And exclude the pack being currently edited
        return allPacks.filter(p =>
            (!p.includedPackIds || p.includedPackIds.length === 0) &&
            p.id !== pack?.id
        );
    }, [allPacks, pack]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">{pack ? 'Modifier le pack' : 'Ajouter un pack'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col md:flex-row p-8 overflow-hidden gap-8">
                    {/* Left Side: Form Fields */}
                    <div className="w-full md:w-2/5 space-y-4 overflow-y-auto pr-4 -mr-2">
                        <InputField name="name" label="Nom du pack" value={formData.name} onChange={handleChange} required />
                        <InputField name="description" label="Description" value={formData.description} onChange={handleChange} as="textarea" rows={4} />
                        <ImageInput label="Image du pack" value={formData.imageUrl} onChange={handleImageChange} required />
                        
                        <div className="p-4 border rounded-md dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prix de base (calculé)</label>
                                <div className="p-2 text-lg text-gray-500 dark:text-gray-400 line-through font-semibold">{basePrice.toFixed(3).replace('.', ',')} DT</div>
                            </div>
                            <InputField name="discount" label="Remise (%)" type="number" value={formData.discount} onChange={handleChange} />
                            <div className="flex justify-between items-center pt-3 border-t dark:border-gray-600">
                                <label className="block text-base font-bold text-gray-800 dark:text-gray-100">Prix final</label>
                                <div className="font-bold text-2xl text-red-600">{finalPrice.toFixed(3).replace('.', ',')} DT</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Item Selector */}
                    <div className="w-full md:w-3/5 flex flex-col border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex border-b border-gray-200 dark:border-gray-600 mb-2 flex-shrink-0">
                            <TabButton title={`Produits (${selectedProductIds.length})`} isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                            <TabButton title={`Sous-Packs (${selectedPackIds.length})`} isActive={activeTab === 'packs'} onClick={() => setActiveTab('packs')} />
                        </div>
                        
                        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                            {activeTab === 'products' && (
                                <div className="flex flex-col h-full">
                                    <div className="grid grid-cols-2 gap-2 mb-2 flex-shrink-0">
                                        <select value={selectedMainCategory} onChange={e => { setSelectedMainCategory(e.target.value); setSelectedSubCategory(''); }} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm">
                                            <option value="">-- Catégorie --</option>
                                            {allCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                        <select value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} disabled={!selectedMainCategory} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm disabled:bg-gray-100 disabled:text-gray-400">
                                            <option value="">-- Sous-catégorie --</option>
                                            {subCategoriesForSelected.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative mb-2 flex-shrink-0">
                                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="text" placeholder="Rechercher des produits..." value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} disabled={!selectedSubCategory} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm disabled:bg-gray-100"/>
                                    </div>
                                    <div className="flex-grow overflow-y-auto space-y-2">
                                        {filteredProducts.map(product => (
                                            <SelectItem key={product.id} item={product} isSelected={selectedProductIds.includes(product.id)} onSelect={() => handleProductSelect(product.id)} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'packs' && (
                                <div className="h-full">
                                    {availableSubPacks.length > 0 ? (
                                        <div className="space-y-2">
                                            {availableSubPacks.map(p => {
                                                const isExpanded = expandedPacks.includes(p.id);
                                                const includedProductsDetails = p.includedProductIds.map(id => allProducts.find(prod => prod.id === id)).filter((pr): pr is Product => Boolean(pr));

                                                return (
                                                    <div key={p.id} className="bg-white dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700/50 transition-shadow hover:shadow-md">
                                                        <div className="flex items-center gap-3 p-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`pack-${p.id}`}
                                                                checked={selectedPackIds.includes(p.id)}
                                                                onChange={() => handlePackSelect(p.id)}
                                                                className="h-4 w-4 rounded text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-500 flex-shrink-0"
                                                            />
                                                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded flex-shrink-0" />
                                                            <label htmlFor={`pack-${p.id}`} className="text-sm cursor-pointer flex-grow">{p.name}</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePackExpansion(p.id)}
                                                                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex-shrink-0"
                                                                aria-label="Voir les produits"
                                                                aria-expanded={isExpanded}
                                                            >
                                                                {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                        {isExpanded && (
                                                            <div className="pl-10 pr-4 pb-3">
                                                                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-3">
                                                                    <h4 className="text-xs font-semibold mb-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produits inclus</h4>
                                                                    {includedProductsDetails.length > 0 ? (
                                                                        <ul className="space-y-2">
                                                                            {includedProductsDetails.map(prod => (
                                                                                <li key={prod.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                                                    <img src={prod.imageUrl} alt={prod.name} className="w-8 h-8 object-cover rounded-sm" />
                                                                                    <span>{prod.name}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <p className="text-xs text-gray-500">Ce pack ne contient aucun produit directement.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center p-4">Aucun sous-pack (contenant uniquement des produits) n'est disponible pour la sélection.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
                <div className="flex justify-end p-4 border-t dark:border-gray-700 gap-3 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                    <button type="submit" onClick={handleSubmit} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Sauvegarder</button>
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
    <button type="button" onClick={onClick} className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
        {title}
    </button>
);

const SelectItem: React.FC<{ item: Product | Pack; isSelected: boolean; onSelect: () => void; type?: 'product' | 'pack'; }> = ({ item, isSelected, onSelect, type = 'product' }) => (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50">
        <input
            type="checkbox"
            id={`${type}-${item.id}`}
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
        />
        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded" />
        <label htmlFor={`${type}-${item.id}`} className="text-sm cursor-pointer">{item.name}</label>
    </div>
);


const InputField = ({ name, label, value, onChange, type = 'text', as = 'input', required = false, rows = 3 }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {as === 'input' ?
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" step={type === 'number' ? 'any' : undefined} />
            :
            <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" />
        }
    </div>
);
