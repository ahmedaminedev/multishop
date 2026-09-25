
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

const InputField = ({ name, label, value, onChange, type = 'text', as = 'input', required = false, rows = 3 }: any) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label} {required && <span className="text-brand-neon">*</span>}</label>
        {as === 'input' ?
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600" step={type === 'number' ? 'any' : undefined} />
            :
            <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600 custom-scrollbar" />
        }
    </div>
);

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
    <button type="button" onClick={onClick} className={`py-3 px-6 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${isActive ? 'border-brand-neon text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
        {title}
    </button>
);

const SelectItem: React.FC<{ item: Product | Pack; isSelected: boolean; onSelect: () => void; type?: 'product' | 'pack'; }> = ({ item, isSelected, onSelect, type = 'product' }) => (
    <div className={`flex items-center gap-3 p-3 border-b border-gray-800 cursor-pointer transition-colors ${isSelected ? 'bg-brand-neon/10' : 'hover:bg-[#1f2833]'}`} onClick={onSelect}>
        <div className={`w-4 h-4 border flex items-center justify-center ${isSelected ? 'border-brand-neon bg-brand-neon' : 'border-gray-600 bg-black'}`}>
            {isSelected && <div className="w-2 h-2 bg-black"></div>}
        </div>
        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover border border-gray-700" />
        <div className="flex-grow min-w-0">
            <p className={`text-xs font-bold uppercase truncate ${isSelected ? 'text-white' : 'text-gray-400'}`}>{item.name}</p>
            {type === 'product' && <p className="text-[10px] text-gray-600 font-mono">{(item as Product).price.toFixed(3)} DT</p>}
        </div>
    </div>
);

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
            setFormData({ name: '', description: '', imageUrl: '', discount: 0 });
            setSelectedProductIds([]);
            setSelectedPackIds([]);
        }
        setSelectedMainCategory('');
        setSelectedSubCategory('');
        setProductSearchTerm('');
        setExpandedPacks([]);
    }, [pack]);

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
        setExpandedPacks(prev => prev.includes(packId) ? prev.filter(id => id !== packId) : [...prev, packId]);
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
            p.quantity > 0
        );
    }, [allProducts, selectedSubCategory, productSearchTerm]);
    
    const availableSubPacks = useMemo(() => {
        return allPacks.filter(p => (!p.includedPackIds || p.includedPackIds.length === 0) && p.id !== pack?.id);
    }, [allPacks, pack]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-6xl bg-[#0b0c10] border border-gray-800 rounded-sm shadow-2xl max-h-[90vh] flex flex-col animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800 flex-shrink-0">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-wider">{pack ? 'MODIFIER PACK' : 'NOUVEAU PACK'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col md:flex-row p-8 overflow-hidden gap-8">
                    {/* Left Side */}
                    <div className="w-full md:w-2/5 space-y-6 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                        <InputField name="name" label="Nom du pack" value={formData.name} onChange={handleChange} required />
                        <ImageInput label="Image Visuelle" value={formData.imageUrl} onChange={handleImageChange} required />
                        <InputField name="description" label="Description Commerciale" value={formData.description} onChange={handleChange} as="textarea" rows={4} />
                        
                        <div className="p-6 border border-gray-800 bg-[#111] space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Valeur Réelle</label>
                                <div className="text-lg text-gray-400 line-through font-mono">{basePrice.toFixed(3)} DT</div>
                            </div>
                            <InputField name="discount" label="Remise (%)" type="number" value={formData.discount} onChange={handleChange} />
                            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                                <label className="block text-sm font-bold text-brand-neon uppercase tracking-wider">Prix Final</label>
                                <div className="font-black text-3xl text-white font-mono">{finalPrice.toFixed(3)} DT</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="w-full md:w-3/5 flex flex-col border border-gray-800 bg-[#111] rounded-sm">
                        <div className="flex border-b border-gray-800 mb-4 bg-[#0a0a0a]">
                            <TabButton title={`Produits (${selectedProductIds.length})`} isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                            <TabButton title={`Sous-Packs (${selectedPackIds.length})`} isActive={activeTab === 'packs'} onClick={() => setActiveTab('packs')} />
                        </div>
                        
                        <div className="flex-grow overflow-y-auto px-4 pb-4 custom-scrollbar">
                            {activeTab === 'products' && (
                                <div className="flex flex-col h-full">
                                    <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
                                        <select value={selectedMainCategory} onChange={e => { setSelectedMainCategory(e.target.value); setSelectedSubCategory(''); }} className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-sm py-2 px-3 text-xs font-mono focus:border-brand-neon focus:outline-none">
                                            <option value="">-- CATÉGORIE --</option>
                                            {allCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                        <select value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} disabled={!selectedMainCategory} className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-sm py-2 px-3 text-xs font-mono focus:border-brand-neon focus:outline-none disabled:opacity-50">
                                            <option value="">-- SOUS-CATÉGORIE --</option>
                                            {subCategoriesForSelected.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative mb-4 flex-shrink-0">
                                        <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="text" placeholder="RECHERCHER..." value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} disabled={!selectedSubCategory} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-2 pl-10 pr-3 text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-brand-neon disabled:opacity-50"/>
                                    </div>
                                    <div className="flex-grow overflow-y-auto space-y-1 custom-scrollbar border border-gray-800 bg-[#0a0a0a]">
                                        {filteredProducts.map(product => (
                                            <SelectItem key={product.id} item={product} isSelected={selectedProductIds.includes(product.id)} onSelect={() => handleProductSelect(product.id)} />
                                        ))}
                                        {filteredProducts.length === 0 && selectedSubCategory && <p className="text-xs text-gray-500 text-center py-4">Aucun produit trouvé.</p>}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'packs' && (
                                <div className="space-y-2 h-full">
                                    {availableSubPacks.length > 0 ? (
                                        availableSubPacks.map(p => {
                                            const isExpanded = expandedPacks.includes(p.id);
                                            const includedProductsDetails = p.includedProductIds.map(id => allProducts.find(prod => prod.id === id)).filter((pr): pr is Product => Boolean(pr));

                                            return (
                                                <div key={p.id} className="bg-[#1a1a1a] border border-gray-800">
                                                    <div className="flex items-center gap-3 p-3">
                                                        <div onClick={() => handlePackSelect(p.id)} className={`w-4 h-4 border flex items-center justify-center cursor-pointer ${selectedPackIds.includes(p.id) ? 'border-brand-neon bg-brand-neon' : 'border-gray-600 bg-black'}`}>
                                                            {selectedPackIds.includes(p.id) && <div className="w-2 h-2 bg-black"></div>}
                                                        </div>
                                                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover border border-gray-700" />
                                                        <span className="text-xs font-bold text-white uppercase flex-grow cursor-pointer" onClick={() => handlePackSelect(p.id)}>{p.name}</span>
                                                        <button type="button" onClick={() => togglePackExpansion(p.id)} className="text-gray-500 hover:text-white"><ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="p-3 bg-black border-t border-gray-800">
                                                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-2">Contenu :</p>
                                                            {includedProductsDetails.map(prod => (
                                                                <div key={prod.id} className="flex items-center gap-2 mb-1 pl-2 border-l border-gray-800">
                                                                    <span className="text-[10px] text-gray-400">{prod.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-500 text-center py-4">Aucun autre pack disponible.</p>
                                    )}
                                </div>
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
