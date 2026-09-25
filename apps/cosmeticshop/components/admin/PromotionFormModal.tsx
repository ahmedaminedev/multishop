import React, { useState, useEffect, useMemo } from 'react';
import type { Promotion, Product, Pack, Category } from '../../types';
import { XMarkIcon, SearchIcon } from '../IconComponents';

interface PromotionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (promoData: Omit<Promotion, 'id'>) => void;
    promotion: Promotion | null;
    allProducts: Product[];
    allPacks: Pack[];
    allCategories: Category[];
}

const InputField: React.FC<{ name: string; label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }> = 
({ name, label, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" />
    </div>
);

const SelectItem: React.FC<{ item: Product | Pack; isSelected: boolean; onSelect: () => void; type?: 'product' | 'pack'; }> = ({ item, isSelected, onSelect, type = 'product' }) => (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50">
        <input
            type="checkbox"
            id={`${type}-${item.id}`}
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 rounded text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-500"
        />
        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded" />
        <label htmlFor={`${type}-${item.id}`} className="text-sm cursor-pointer">{item.name}</label>
    </div>
);

const getAllProductIdsFromPack = (packId: number, allPacks: Pack[]): Set<number> => {
    const pack = allPacks.find(p => p.id === packId);
    if (!pack) return new Set();

    const productIds = new Set(pack.includedProductIds);

    if (pack.includedPackIds) {
        for (const subPackId of pack.includedPackIds) {
            const subPackProductIds = getAllProductIdsFromPack(subPackId, allPacks);
            subPackProductIds.forEach(id => productIds.add(id));
        }
    }
    return productIds;
};


export const PromotionFormModal: React.FC<PromotionFormModalProps> = ({ isOpen, onClose, onSave, promotion, allProducts, allPacks, allCategories }) => {
    const [name, setName] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [selectedPackIds, setSelectedPackIds] = useState<number[]>([]);
    
    const [activeTab, setActiveTab] = useState<'products' | 'packs'>('products');
    const [productSearch, setProductSearch] = useState('');
    const [packSearch, setPackSearch] = useState('');
    
    useEffect(() => {
        if (promotion) {
            setName(promotion.name);
            setDiscountPercentage(promotion.discountPercentage);
            setStartDate(promotion.startDate);
            setEndDate(promotion.endDate);
            setSelectedProductIds(promotion.productIds);
            setSelectedPackIds(promotion.packIds);
        } else {
            setName('');
            setDiscountPercentage(0);
            const today = new Date().toISOString().split('T')[0];
            setStartDate(today);
            setEndDate(today);
            setSelectedProductIds([]);
            setSelectedPackIds([]);
        }
    }, [promotion]);

    const handleProductSelect = (productId: number) => {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        if (!selectedProductIds.includes(productId)) { // Check only when adding
            for (const packId of selectedPackIds) {
                const pack = allPacks.find(p => p.id === packId);
                if (pack) {
                    const productIdsInPack = getAllProductIdsFromPack(pack.id, allPacks);
                    if (productIdsInPack.has(productId)) {
                        alert(`Attention : Le produit "${product.name}" est déjà inclus dans le pack sélectionné "${pack.name}".`);
                        return;
                    }
                }
            }
        }
        setSelectedProductIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
    };

    const handlePackSelect = (packId: number) => {
        const pack = allPacks.find(p => p.id === packId);
        if (!pack) return;

        if (!selectedPackIds.includes(packId)) { // Check only when adding
            const productIdsInPack = getAllProductIdsFromPack(packId, allPacks);
            for (const productId of productIdsInPack) {
                if (selectedProductIds.includes(productId)) {
                    const product = allProducts.find(p => p.id === productId);
                    alert(`Attention : Le pack "${pack.name}" contient le produit "${product?.name}", qui est déjà sélectionné individuellement.`);
                    return;
                }
            }
        }
        setSelectedPackIds(prev => prev.includes(packId) ? prev.filter(id => id !== packId) : [...prev, packId]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, discountPercentage, startDate, endDate, productIds: selectedProductIds, packIds: selectedPackIds });
        onClose();
    };

    const filteredProducts = useMemo(() => 
        allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())),
        [allProducts, productSearch]
    );

    const filteredPacks = useMemo(() =>
        allPacks.filter(p => p.name.toLowerCase().includes(packSearch.toLowerCase())),
        [allPacks, packSearch]
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">{promotion ? 'Modifier la promotion' : 'Ajouter une promotion'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col md:flex-row p-8 overflow-hidden gap-8">
                    {/* Left Side: Form Fields */}
                    <div className="w-full md:w-1/2 space-y-4">
                        <InputField name="name" label="Nom de la promotion" value={name} onChange={e => setName(e.target.value)} required />
                        <InputField name="discountPercentage" label="Pourcentage de remise (%)" type="number" value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value))} required />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField name="startDate" label="Date de début" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                            <InputField name="endDate" label="Date de fin" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </div>
                    </div>

                    {/* Right Side: Item Selector */}
                    <div className="w-full md:w-1/2 flex flex-col border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex border-b border-gray-200 dark:border-gray-600 mb-2 flex-shrink-0">
                            <button type="button" onClick={() => setActiveTab('products')} className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'products' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                Produits ({selectedProductIds.length})
                            </button>
                            <button type="button" onClick={() => setActiveTab('packs')} className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'packs' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                Packs ({selectedPackIds.length})
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                            {activeTab === 'products' && (
                                <>
                                    <div className="relative mb-2 flex-shrink-0">
                                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="text" placeholder="Rechercher des produits..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm"/>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredProducts.map(product => (
                                            <SelectItem key={product.id} item={product} isSelected={selectedProductIds.includes(product.id)} onSelect={() => handleProductSelect(product.id)} type="product" />
                                        ))}
                                    </div>
                                </>
                            )}
                             {activeTab === 'packs' && (
                                <>
                                    <div className="relative mb-2 flex-shrink-0">
                                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="text" placeholder="Rechercher des packs..." value={packSearch} onChange={e => setPackSearch(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm"/>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredPacks.map(pack => (
                                            <SelectItem key={pack.id} item={pack} isSelected={selectedPackIds.includes(pack.id)} onSelect={() => handlePackSelect(pack.id)} type="pack" />
                                        ))}
                                    </div>
                                </>
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
