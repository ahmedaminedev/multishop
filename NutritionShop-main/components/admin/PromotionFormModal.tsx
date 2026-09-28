
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
    <div className="mb-4">
        <label htmlFor={name} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600" />
    </div>
);

const SelectItem: React.FC<{ item: Product | Pack; isSelected: boolean; onSelect: () => void; type?: 'product' | 'pack'; }> = ({ item, isSelected, onSelect, type = 'product' }) => (
    <div className={`flex items-center gap-3 p-3 border-b border-gray-800 cursor-pointer transition-colors ${isSelected ? 'bg-brand-neon/10' : 'hover:bg-[#1f2833]'}`} onClick={onSelect}>
        <div className={`w-4 h-4 border flex items-center justify-center ${isSelected ? 'border-brand-neon bg-brand-neon' : 'border-gray-600 bg-black'}`}>
            {isSelected && <div className="w-2 h-2 bg-black"></div>}
        </div>
        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover border border-gray-700" />
        <div className="flex-grow min-w-0">
            <p className={`text-xs font-bold uppercase truncate ${isSelected ? 'text-white' : 'text-gray-400'}`}>{item.name}</p>
        </div>
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
        if (!selectedProductIds.includes(productId)) { 
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
        if (!selectedPackIds.includes(packId)) { 
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

    const filteredProducts = useMemo(() => allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())), [allProducts, productSearch]);
    const filteredPacks = useMemo(() => allPacks.filter(p => p.name.toLowerCase().includes(packSearch.toLowerCase())), [allPacks, packSearch]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-4xl bg-[#0b0c10] border border-gray-800 rounded-sm shadow-2xl max-h-[90vh] flex flex-col animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-wider">{promotion ? 'MODIFIER CAMPAGNE' : 'NOUVELLE CAMPAGNE'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col md:flex-row p-8 overflow-hidden gap-8">
                    {/* Left */}
                    <div className="w-full md:w-1/2 space-y-4">
                        <InputField name="name" label="Nom de la campagne" value={name} onChange={e => setName(e.target.value)} required />
                        <InputField name="discountPercentage" label="Remise (%)" type="number" value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value))} required />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField name="startDate" label="Début" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                            <InputField name="endDate" label="Fin" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </div>
                    </div>

                    {/* Right */}
                    <div className="w-full md:w-1/2 flex flex-col border border-gray-800 bg-[#111] rounded-sm">
                        <div className="flex border-b border-gray-800 bg-[#0a0a0a]">
                            <button type="button" onClick={() => setActiveTab('products')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'products' ? 'border-brand-neon text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                Produits ({selectedProductIds.length})
                            </button>
                            <button type="button" onClick={() => setActiveTab('packs')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'packs' ? 'border-brand-neon text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                Packs ({selectedPackIds.length})
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                            {activeTab === 'products' && (
                                <>
                                    <div className="relative mb-4">
                                        <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="text" placeholder="CHERCHER..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-2 pl-10 pr-3 text-xs font-bold text-white uppercase focus:border-brand-neon outline-none"/>
                                    </div>
                                    <div className="space-y-1">
                                        {filteredProducts.map(product => (
                                            <SelectItem key={product.id} item={product} isSelected={selectedProductIds.includes(product.id)} onSelect={() => handleProductSelect(product.id)} type="product" />
                                        ))}
                                    </div>
                                </>
                            )}
                             {activeTab === 'packs' && (
                                <>
                                    <div className="relative mb-4">
                                        <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="text" placeholder="CHERCHER..." value={packSearch} onChange={e => setPackSearch(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-2 pl-10 pr-3 text-xs font-bold text-white uppercase focus:border-brand-neon outline-none"/>
                                    </div>
                                    <div className="space-y-1">
                                        {filteredPacks.map(pack => (
                                            <SelectItem key={pack.id} item={pack} isSelected={selectedPackIds.includes(pack.id)} onSelect={() => handlePackSelect(pack.id)} type="pack" />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </form>
                 <div className="flex justify-end p-6 border-t border-gray-800 gap-3 flex-shrink-0 bg-[#0a0a0a]">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-500 border border-red-900/30 hover:bg-red-900/20 transition-colors">Annuler</button>
                    <button type="submit" onClick={handleSubmit} className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-brand-neon text-black hover:bg-white transition-colors skew-x-[-10deg] shadow-[0_0_15px_rgba(204,255,0,0.4)]"><span className="skew-x-[10deg]">VALIDER</span></button>
                </div>
            </div>
        </div>
    );
};
