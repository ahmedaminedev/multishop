
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category, Brand, ProductColor } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';
import { useToast } from '../ToastContext'; 
import { ProductGallery } from '../ProductGallery';
import { ProductHighlights } from '../ProductHighlights';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id'>) => void;
    product: Product | null;
    categories: Category[];
    brands?: Brand[];
}

type Specification = { name: string; value: string; };

const InputField = ({ name, label, value, onChange, type = 'text', as = 'input', options = [], required = false, readOnly = false, rows = 6 }: any) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label} {required && <span className="text-brand-neon">*</span>}</label>
        {as === 'input' && <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} readOnly={readOnly} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600 disabled:opacity-50" step={type === 'number' ? 'any' : undefined} />}
        {as === 'textarea' && <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-sm py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon/50 transition-all placeholder-gray-600 custom-scrollbar" />}
    </div>
);

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, product, categories, brands = [] }) => {
    const { addToast } = useToast();
    const [step, setStep] = useState(1);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        oldPrice: 0,
        discount: 0,
        images: [] as string[],
        category: '',
        parentCategory: '',
        description: '',
        quantity: 0,
        specifications: [] as Specification[],
        colors: [] as ProductColor[],
        highlightsTitle: 'Pourquoi on l\'adore',
        highlightsImage: '',
        highlightsSections: [] as { subtitle: string; features: { title: string; description: string; }[] }[]
    });
    
    const finalPrice = useMemo(() => {
        const basePrice = formData.oldPrice || 0;
        const discount = formData.discount || 0;
        if (basePrice > 0 && discount > 0) {
            const effectiveDiscount = Math.min(discount, 100);
            return basePrice * (1 - effectiveDiscount / 100);
        }
        return basePrice;
    }, [formData.oldPrice, formData.discount]);

    const isPromo = useMemo(() => (formData.discount || 0) > 0 && (formData.oldPrice || 0) > 0, [formData.discount, formData.oldPrice]);

    useEffect(() => {
        if (product) {
            const basePrice = product.oldPrice || product.price;
            let initialImages = product.images || [];
            if (initialImages.length === 0 && product.imageUrl) {
                initialImages = [product.imageUrl];
            }

            setFormData({
                name: product.name,
                brand: product.brand,
                oldPrice: basePrice,
                discount: product.discount || 0,
                images: initialImages,
                category: product.category,
                parentCategory: product.parentCategory || '',
                description: product.description || '',
                quantity: product.quantity,
                specifications: product.specifications || [],
                colors: product.colors || [],
                highlightsTitle: product.highlights?.title || 'Pourquoi on l\'adore',
                highlightsImage: product.highlights?.imageUrl || '',
                highlightsSections: product.highlights?.sections || []
            });
        } else {
             setFormData({
                name: '', brand: '', oldPrice: 0, discount: 0, images: [],
                category: '', parentCategory: '', description: '', quantity: 0, specifications: [], colors: [],
                highlightsTitle: 'Pourquoi on l\'adore', highlightsImage: '', highlightsSections: []
            });
        }
        setStep(1);
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let processedValue: string | number = value;
        if (type === 'number') {
            processedValue = parseFloat(value) || 0;
            if (name === 'discount') processedValue = Math.max(0, processedValue);
        }
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const availableSubCategories = useMemo(() => {
        if (!formData.parentCategory) return [];
        const parent = categories.find(c => c.name === formData.parentCategory);
        if (!parent) return [];
        let subs: string[] = [];
        if (parent.subCategories) subs = [...subs, ...parent.subCategories];
        if (parent.megaMenu) {
            parent.megaMenu.forEach(group => { group.items.forEach(item => subs.push(item.name)); });
        }
        return subs;
    }, [formData.parentCategory, categories]);

    const availableBrands = useMemo(() => {
        if (!formData.category || !formData.parentCategory) return [];
        return brands.filter(b => 
            b.associatedCategories?.some(link => 
                link.parentCategory === formData.parentCategory && link.subCategory === formData.category
            )
        );
    }, [formData.category, formData.parentCategory, brands]);

    const handleParentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, parentCategory: e.target.value, category: '', brand: '' }));
    };

    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, category: e.target.value, brand: '' }));
    };

    const handleImagesChange = (newImages: string[]) => {
        setFormData(prev => ({ ...prev, images: newImages }));
    };
    
    // Specs & Colors Logic... (Identical logic, just styled below)
    const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };
    const addSpec = () => setFormData(prev => ({...prev, specifications: [...prev.specifications, {name: '', value: ''}]}));
    const removeSpec = (index: number) => setFormData(prev => ({...prev, specifications: prev.specifications.filter((_, i) => i !== index)}));
    
    const handleColorChange = (index: number, field: 'name' | 'hex', value: string) => {
        const newColors = [...formData.colors];
        newColors[index] = { ...newColors[index], [field]: value };
        setFormData(prev => ({ ...prev, colors: newColors }));
    };
    const addColor = () => setFormData(prev => ({...prev, colors: [...prev.colors, {name: 'Nouvelle Couleur', hex: '#000000'}]}));
    const removeColor = (index: number) => setFormData(prev => ({...prev, colors: prev.colors.filter((_, i) => i !== index)}));

    // Highlights Logic...
    const handleHighlightsImageChange = (val: string) => setFormData(prev => ({ ...prev, highlightsImage: val }));
    const addHighlightSection = () => setFormData(prev => ({...prev, highlightsSections: [...prev.highlightsSections, { subtitle: 'Nouveau point', features: [{ title: 'Avantage', description: '' }] }]}));
    const removeHighlightSection = (idx: number) => setFormData(prev => ({...prev, highlightsSections: prev.highlightsSections.filter((_, i) => i !== idx)}));
    const handleSectionSubtitleChange = (idx: number, val: string) => {
        const newSections = [...formData.highlightsSections];
        newSections[idx].subtitle = val;
        setFormData(prev => ({ ...prev, highlightsSections: newSections }));
    };
    const addHighlightFeature = (sectionIdx: number) => {
        const newSections = [...formData.highlightsSections];
        newSections[sectionIdx].features.push({ title: '', description: '' });
        setFormData(prev => ({ ...prev, highlightsSections: newSections }));
    };
    const removeHighlightFeature = (sectionIdx: number, featureIdx: number) => {
        const newSections = [...formData.highlightsSections];
        newSections[sectionIdx].features = newSections[sectionIdx].features.filter((_, i) => i !== featureIdx);
        setFormData(prev => ({ ...prev, highlightsSections: newSections }));
    };
    const handleHighlightFeatureChange = (sectionIdx: number, featureIdx: number, field: 'title' | 'description', val: string) => {
        const newSections = [...formData.highlightsSections];
        newSections[sectionIdx].features[featureIdx] = { ...newSections[sectionIdx].features[featureIdx], [field]: val };
        setFormData(prev => ({ ...prev, highlightsSections: newSections }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) { addToast("Le nom est obligatoire.", "error"); return false; }
        if (!formData.parentCategory) { addToast("Catégorie parente requise.", "error"); return false; }
        if (!formData.category) { addToast("Sous-catégorie requise.", "error"); return false; }
        if (formData.images.length === 0) { addToast("Image requise.", "error"); return false; }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const productData: Omit<Product, 'id'> = {
            name: formData.name,
            brand: formData.brand,
            category: formData.category,
            parentCategory: formData.parentCategory,
            description: formData.description,
            imageUrl: formData.images[0], 
            images: formData.images,
            quantity: formData.quantity,
            price: finalPrice,
            oldPrice: isPromo ? formData.oldPrice : undefined,
            discount: isPromo ? formData.discount : undefined,
            promo: isPromo,
            specifications: formData.specifications.filter(s => s.name.trim() && s.value.trim()),
            colors: formData.colors,
            highlights: {
                title: formData.highlightsTitle,
                imageUrl: formData.highlightsImage,
                sections: formData.highlightsSections
            }
        };
        onSave(productData);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true">
            <div className="relative w-[95vw] h-[90vh] bg-[#0b0c10] border border-gray-800 rounded-sm shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#0b0c10] z-20">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-wider">{product ? 'MODIFIER' : 'AJOUTER'} <span className="text-brand-neon">PRODUIT</span></h2>
                        <p className="text-xs text-gray-500 font-mono">ÉTAPE {step}/4</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><XMarkIcon className="w-8 h-8"/></button>
                </div>
                
                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    {/* LEFT: FORM */}
                    <div className="w-full lg:w-1/3 xl:w-1/4 overflow-y-auto border-r border-gray-800 p-6 bg-[#0b0c10] z-10 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ÉTAPE 1: Infos de base */}
                            {step === 1 && (
                                <>
                                    <h3 className="text-xs font-bold text-brand-neon uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Infos Générales</h3>
                                    
                                    <ImageInput label="Galerie" images={formData.images} onChange={handleImagesChange} required />

                                    <InputField name="name" label="Nom du Produit" value={formData.name} onChange={handleChange} required />
                                    
                                    {/* Hierarchy Selection */}
                                    <div className="space-y-4 p-4 bg-[#111] border border-gray-800 rounded-sm">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Catégorie Parente</label>
                                            <select value={formData.parentCategory} onChange={handleParentCategoryChange} className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-sm py-2 px-3 text-xs font-mono focus:border-brand-neon focus:outline-none">
                                                <option value="">-- SÉLECTIONNER --</option>
                                                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Sous-catégorie</label>
                                            <select value={formData.category} onChange={handleSubCategoryChange} disabled={!formData.parentCategory} className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-sm py-2 px-3 text-xs font-mono focus:border-brand-neon focus:outline-none disabled:opacity-50">
                                                <option value="">-- SÉLECTIONNER --</option>
                                                {availableSubCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Marque</label>
                                            <select name="brand" value={formData.brand} onChange={handleChange} disabled={!formData.category} className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-sm py-2 px-3 text-xs font-mono focus:border-brand-neon focus:outline-none disabled:opacity-50">
                                                <option value="">-- SÉLECTIONNER --</option>
                                                {availableBrands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField name="oldPrice" label="Prix Public (DT)" type="number" value={formData.oldPrice} onChange={handleChange} required />
                                        <InputField name="discount" label="Remise (%)" type="number" value={formData.discount} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField name="price" label="Prix Final" value={finalPrice.toFixed(3)} readOnly />
                                        <InputField name="quantity" label="Stock" type="number" value={formData.quantity} onChange={handleChange} required />
                                    </div>

                                    <InputField name="description" label="Description" value={formData.description} onChange={handleChange} as="textarea" rows={4} />
                                </>
                            )}

                            {/* ÉTAPE 2: Couleurs */}
                            {step === 2 && (
                                <div>
                                    <h3 className="text-xs font-bold text-brand-neon uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Variantes</h3>
                                    <button type="button" onClick={addColor} className="text-[10px] bg-white text-black font-black uppercase tracking-wider py-2 px-4 hover:bg-brand-neon transition-colors flex items-center gap-1 mb-4">
                                        <PlusIcon className="w-3 h-3" /> Ajouter Couleur
                                    </button>
                                    <div className="space-y-3">
                                        {formData.colors.map((color, index) => (
                                            <div key={index} className="flex gap-2 items-center bg-[#111] p-2 border border-gray-800">
                                                <div className="w-8 h-8 border border-gray-600" style={{ backgroundColor: color.hex }}></div>
                                                <div className="flex-grow space-y-1">
                                                    <input type="text" placeholder="NOM VARIATION" value={color.name} onChange={(e) => handleColorChange(index, 'name', e.target.value)} className="w-full bg-transparent border-b border-gray-700 text-xs font-mono text-white focus:border-brand-neon focus:outline-none" />
                                                    <div className="flex items-center gap-2">
                                                        <input type="color" value={color.hex} onChange={(e) => handleColorChange(index, 'hex', e.target.value)} className="h-6 w-8 bg-transparent border-0 cursor-pointer" />
                                                        <span className="text-[10px] text-gray-500 font-mono">{color.hex}</span>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeColor(index)} className="text-gray-600 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ÉTAPE 3: Specs */}
                            {step === 3 && (
                                <div>
                                    <h3 className="text-xs font-bold text-brand-neon uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Spécifications</h3>
                                    <button type="button" onClick={addSpec} className="text-[10px] bg-white text-black font-black uppercase tracking-wider py-2 px-4 hover:bg-brand-neon transition-colors mb-4">+ Ajouter Ligne</button>
                                    <div className="space-y-2">
                                        {formData.specifications.map((spec, index) => (
                                            <div key={index} className="flex gap-2 bg-[#111] p-2 border border-gray-800">
                                                <input type="text" placeholder="NOM (ex: Poids)" value={spec.name} onChange={(e) => handleSpecChange(index, 'name', e.target.value)} className="w-1/2 bg-transparent border-b border-gray-700 text-xs font-mono text-white focus:border-brand-neon focus:outline-none" />
                                                <input type="text" placeholder="VALEUR" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className="w-1/2 bg-transparent border-b border-gray-700 text-xs font-mono text-white focus:border-brand-neon focus:outline-none" />
                                                <button type="button" onClick={() => removeSpec(index)} className="text-gray-600 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ÉTAPE 4: Éditorial */}
                            {step === 4 && (
                                <div>
                                    <h3 className="text-xs font-bold text-brand-neon uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Marketing & Édito</h3>
                                    <InputField name="highlightsTitle" label="Titre bloc" value={formData.highlightsTitle} onChange={handleChange} />
                                    <ImageInput label="Image Illustration" value={formData.highlightsImage} onChange={handleHighlightsImageChange} />
                                    
                                    <button type="button" onClick={addHighlightSection} className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-800 font-bold py-2 px-4 uppercase tracking-wider mt-6 mb-4">+ Section</button>
                                    
                                    <div className="space-y-4">
                                        {formData.highlightsSections.map((section, sIdx) => (
                                            <div key={sIdx} className="border border-gray-800 p-3 bg-[#111]">
                                                <div className="flex justify-between mb-3">
                                                    <input type="text" placeholder="SOUS-TITRE SECTION" value={section.subtitle} onChange={(e) => handleSectionSubtitleChange(sIdx, e.target.value)} className="bg-transparent border-b border-gray-700 text-sm font-bold text-white w-full mr-2 focus:border-brand-neon focus:outline-none uppercase" />
                                                    <button type="button" onClick={() => removeHighlightSection(sIdx)} className="text-gray-600 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                                {section.features.map((feature, fIdx) => (
                                                    <div key={fIdx} className="ml-2 mb-3 border-l-2 border-gray-700 pl-3">
                                                        <input type="text" placeholder="TITRE POINT" value={feature.title} onChange={(e) => handleHighlightFeatureChange(sIdx, fIdx, 'title', e.target.value)} className="w-full text-xs font-bold bg-transparent border-b border-gray-800 text-brand-neon mb-1 focus:outline-none" />
                                                        <textarea placeholder="Description du point..." value={feature.description} onChange={(e) => handleHighlightFeatureChange(sIdx, fIdx, 'description', e.target.value)} className="w-full text-xs bg-transparent text-gray-400 focus:outline-none resize-none" rows={2} />
                                                        <button type="button" onClick={() => removeHighlightFeature(sIdx, fIdx)} className="text-[9px] text-red-500 hover:underline uppercase">Retirer</button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addHighlightFeature(sIdx)} className="text-[9px] text-brand-neon hover:underline uppercase font-bold">+ Ajouter Point</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-6 border-t border-gray-800 mt-4">
                                <div>{step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 border border-gray-700 hover:text-white hover:border-white transition-colors">Précédent</button>}</div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-500 border border-red-900/30 hover:bg-red-900/20 transition-colors">Annuler</button>
                                    {step < 4 ? 
                                        <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-brand-neon transition-colors skew-x-[-10deg]"><span className="skew-x-[10deg]">Suivant</span></button> 
                                        : 
                                        <button type="submit" className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-brand-neon text-black hover:bg-white transition-colors skew-x-[-10deg] shadow-[0_0_15px_rgba(204,255,0,0.4)]"><span className="skew-x-[10deg]">VALIDER</span></button>
                                    }
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT: PREVIEW */}
                    <div className="w-full lg:w-2/3 xl:w-3/4 bg-black p-4 lg:p-10 overflow-y-auto custom-scrollbar flex items-center justify-center">
                        <div className="w-full max-w-4xl h-full flex flex-col bg-[#050505] border border-gray-800 p-8 relative">
                            <div className="absolute top-0 right-0 bg-brand-neon text-black text-[10px] font-black px-4 py-1 uppercase tracking-widest">LIVE PREVIEW</div>
                            
                            {step === 1 || step === 2 || step === 3 ? (
                                <div className="flex flex-col lg:flex-row gap-12 mt-8">
                                    <div className="w-full lg:w-1/2">
                                        <ProductGallery images={formData.images} productName={formData.name || "Produit"} />
                                    </div>
                                    <div className="w-full lg:w-1/2 space-y-6">
                                        <div>
                                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">{formData.brand || "MARQUE"}</h2>
                                            <h1 className="text-4xl font-serif font-black italic text-white leading-none uppercase">{formData.name || "NOM DU PRODUIT"}</h1>
                                        </div>
                                        
                                        <div className="flex items-baseline gap-3">
                                            <div className="text-3xl font-light text-brand-neon">{finalPrice.toFixed(3)} <span className="text-sm font-bold text-white">DT</span></div>
                                            {isPromo && <div className="text-sm text-gray-500 line-through decoration-red-600">{formData.oldPrice.toFixed(3)} DT</div>}
                                        </div>
                                        
                                        {/* Color Preview */}
                                        {formData.colors.length > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sélection</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {formData.colors.map((color, idx) => (
                                                        <div key={idx} className="w-8 h-8 border border-gray-600 cursor-pointer hover:border-brand-neon transition-colors" style={{ backgroundColor: color.hex }} title={color.name}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-400 font-mono leading-relaxed border-l-2 border-gray-800 pl-4">{formData.description || "Description du produit..."}</p>
                                        
                                        {/* Fake Button */}
                                        <div className="h-12 bg-white text-black font-black uppercase flex items-center justify-center tracking-widest text-xs mt-8 skew-x-[-12deg] opacity-50">
                                            <span className="skew-x-[12deg]">AJOUTER AU PANIER</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-8">
                                    <ProductHighlights highlights={{ title: formData.highlightsTitle, imageUrl: formData.highlightsImage, sections: formData.highlightsSections }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
