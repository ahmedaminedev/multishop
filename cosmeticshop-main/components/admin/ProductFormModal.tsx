
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
    brands?: Brand[]; // Optional to avoid breaking other calls if not passed immediately, but logic relies on it
}

type Specification = { name: string; value: string; };

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
        category: '', // This corresponds to SUB-CATEGORY
        parentCategory: '', // New Field: MAIN CATEGORY
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
                category: product.category, // Sub-Category
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
            if (name === 'discount') {
                processedValue = Math.max(0, processedValue);
            }
        }
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    // Cascade Logic
    // 1. Available Sub-Categories based on Parent Selection
    const availableSubCategories = useMemo(() => {
        if (!formData.parentCategory) return [];
        const parent = categories.find(c => c.name === formData.parentCategory);
        if (!parent) return [];
        
        let subs: string[] = [];
        if (parent.subCategories) subs = [...subs, ...parent.subCategories];
        if (parent.megaMenu) {
            parent.megaMenu.forEach(group => {
                group.items.forEach(item => subs.push(item.name));
            });
        }
        return subs;
    }, [formData.parentCategory, categories]);

    // 2. Available Brands based on Sub-Category Selection
    const availableBrands = useMemo(() => {
        if (!formData.category || !formData.parentCategory) return [];
        return brands.filter(b => 
            b.associatedCategories?.some(link => 
                link.parentCategory === formData.parentCategory && link.subCategory === formData.category
            )
        );
    }, [formData.category, formData.parentCategory, brands]);

    // Reset dependent fields when parent changes
    const handleParentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, parentCategory: e.target.value, category: '', brand: '' }));
    };

    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, category: e.target.value, brand: '' }));
    };

    const handleImagesChange = (newImages: string[]) => {
        setFormData(prev => ({ ...prev, images: newImages }));
    };
    
    // --- Specs & Highlights Logic ---
    const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };
    const addSpec = () => setFormData(prev => ({...prev, specifications: [...prev.specifications, {name: '', value: ''}]}));
    const removeSpec = (index: number) => setFormData(prev => ({...prev, specifications: prev.specifications.filter((_, i) => i !== index)}));
    
    // --- Colors Logic ---
    const handleColorChange = (index: number, field: 'name' | 'hex', value: string) => {
        const newColors = [...formData.colors];
        newColors[index] = { ...newColors[index], [field]: value };
        setFormData(prev => ({ ...prev, colors: newColors }));
    };
    const addColor = () => setFormData(prev => ({...prev, colors: [...prev.colors, {name: 'Nouvelle Couleur', hex: '#000000'}]}));
    const removeColor = (index: number) => setFormData(prev => ({...prev, colors: prev.colors.filter((_, i) => i !== index)}));

    // --- Highlights Logic ---
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
        if (!formData.brand) { addToast("Marque requise.", "error"); return false; }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="relative w-[95vw] h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 z-20">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{product ? 'Modifier' : 'Ajouter'} Produit - Étape {step}/4</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    {/* LEFT: FORM */}
                    <div className="w-full lg:w-1/3 xl:w-1/4 overflow-y-auto border-r dark:border-gray-700 p-6 bg-white dark:bg-gray-800 z-10 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ÉTAPE 1: Infos de base */}
                            {step === 1 && (
                                <>
                                    <h3 className="font-bold text-gray-900 dark:text-white border-b pb-2 mb-4">Infos de base</h3>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Images</label>
                                        </div>
                                        <ImageInput label="" images={formData.images} onChange={handleImagesChange} required />
                                    </div>

                                    <InputField name="name" label="Nom" value={formData.name} onChange={handleChange} required />
                                    
                                    {/* Hierarchy Selection */}
                                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Catégorie Parente</label>
                                            <select value={formData.parentCategory} onChange={handleParentCategoryChange} className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-500">
                                                <option value="">-- Sélectionner --</option>
                                                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Sous-catégorie</label>
                                            <select value={formData.category} onChange={handleSubCategoryChange} disabled={!formData.parentCategory} className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-500 disabled:opacity-50">
                                                <option value="">-- Sélectionner --</option>
                                                {availableSubCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Marque</label>
                                            <select name="brand" value={formData.brand} onChange={handleChange} disabled={!formData.category} className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-500 disabled:opacity-50">
                                                <option value="">-- Sélectionner --</option>
                                                {availableBrands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                            </select>
                                            {formData.category && availableBrands.length === 0 && (
                                                <p className="text-xs text-red-500 mt-1">Aucune marque liée à cette sous-catégorie.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField name="oldPrice" label="Prix Original" type="number" value={formData.oldPrice} onChange={handleChange} required />
                                        <InputField name="discount" label="Remise (%)" type="number" value={formData.discount} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField name="price" label="Prix Final" value={finalPrice.toFixed(3)} readOnly />
                                        <InputField name="quantity" label="Stock" type="number" value={formData.quantity} onChange={handleChange} required />
                                    </div>

                                    <InputField name="description" label="Description" value={formData.description} onChange={handleChange} as="textarea" rows={4} />
                                </>
                            )}

                            {/* ÉTAPE 2: Couleurs (NOUVEAU) */}
                            {step === 2 && (
                                <div>
                                    <h3 className="font-bold border-b pb-2 mb-4 text-gray-900 dark:text-white">Variantes de Couleurs</h3>
                                    <button type="button" onClick={addColor} className="text-xs bg-rose-100 text-rose-700 font-bold py-1 px-3 rounded mb-4 flex items-center gap-1">
                                        <PlusIcon className="w-3 h-3" /> Ajouter une couleur
                                    </button>
                                    <div className="space-y-3">
                                        {formData.colors.map((color, index) => (
                                            <div key={index} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded border dark:border-gray-600">
                                                <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: color.hex }}></div>
                                                <div className="flex-grow space-y-1">
                                                    <input type="text" placeholder="Nom (ex: Rouge Passion)" value={color.name} onChange={(e) => handleColorChange(index, 'name', e.target.value)} className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700" />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">Hex:</span>
                                                        <input type="color" value={color.hex} onChange={(e) => handleColorChange(index, 'hex', e.target.value)} className="h-6 w-10 p-0 border-0 rounded cursor-pointer" />
                                                        <input type="text" value={color.hex} onChange={(e) => handleColorChange(index, 'hex', e.target.value)} className="w-20 border rounded px-2 py-0.5 text-xs dark:bg-gray-700 uppercase" />
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeColor(index)} className="text-red-500 hover:bg-red-100 p-1 rounded"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    {formData.colors.length === 0 && (
                                        <p className="text-sm text-gray-500 italic">Aucune couleur définie. Cliquez sur ajouter si le produit a des variantes.</p>
                                    )}
                                </div>
                            )}

                            {/* ÉTAPE 3: Ingrédients / Specs */}
                            {step === 3 && (
                                <div>
                                    <h3 className="font-bold border-b pb-2 mb-4 text-gray-900 dark:text-white">Ingrédients & Spécifications</h3>
                                    <button type="button" onClick={addSpec} className="text-xs bg-green-100 text-green-700 font-bold py-1 px-2 rounded mb-4">+ Ajouter</button>
                                    <div className="space-y-2">
                                        {formData.specifications.map((spec, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input type="text" placeholder="Nom (ex: Contenance)" value={spec.name} onChange={(e) => handleSpecChange(index, 'name', e.target.value)} className="w-1/2 border rounded px-2 py-1 text-sm dark:bg-gray-700" />
                                                <input type="text" placeholder="Valeur (ex: 50ml)" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className="w-1/2 border rounded px-2 py-1 text-sm dark:bg-gray-700" />
                                                <button type="button" onClick={() => removeSpec(index)} className="text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ÉTAPE 4: Éditorial */}
                            {step === 4 && (
                                <div>
                                    <h3 className="font-bold border-b pb-2 mb-4 text-gray-900 dark:text-white">Éditorial "Pourquoi on l'adore"</h3>
                                    <InputField name="highlightsTitle" label="Titre bloc" value={formData.highlightsTitle} onChange={handleChange} />
                                    <ImageInput label="Image Illus." value={formData.highlightsImage} onChange={handleHighlightsImageChange} />
                                    <button type="button" onClick={addHighlightSection} className="text-xs bg-blue-100 text-blue-700 font-bold py-1 px-2 rounded mt-4">+ Section</button>
                                    <div className="space-y-4 mt-4">
                                        {formData.highlightsSections.map((section, sIdx) => (
                                            <div key={sIdx} className="border p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                                                <div className="flex justify-between mb-2">
                                                    <input type="text" placeholder="Sous-titre" value={section.subtitle} onChange={(e) => handleSectionSubtitleChange(sIdx, e.target.value)} className="border-b bg-transparent font-bold text-sm w-full mr-2" />
                                                    <button type="button" onClick={() => removeHighlightSection(sIdx)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                                {section.features.map((feature, fIdx) => (
                                                    <div key={fIdx} className="ml-2 mb-2 border-l-2 pl-2">
                                                        <input type="text" placeholder="Titre" value={feature.title} onChange={(e) => handleHighlightFeatureChange(sIdx, fIdx, 'title', e.target.value)} className="w-full text-xs font-bold bg-transparent border-b mb-1" />
                                                        <textarea placeholder="Desc" value={feature.description} onChange={(e) => handleHighlightFeatureChange(sIdx, fIdx, 'description', e.target.value)} className="w-full text-xs bg-transparent border rounded p-1" />
                                                        <button type="button" onClick={() => removeHighlightFeature(sIdx, fIdx)} className="text-xs text-red-500 hover:underline">Retirer point</button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addHighlightFeature(sIdx)} className="text-xs text-blue-500 hover:underline ml-2">+ Point</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-6 border-t dark:border-gray-700 mt-4">
                                <div>{step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700">Précédent</button>}</div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700">Annuler</button>
                                    {step < 4 ? <button type="button" onClick={() => setStep(step + 1)} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Suivant</button> : <button type="submit" className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">Sauvegarder</button>}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT: PREVIEW */}
                    <div className="w-full lg:w-2/3 xl:w-3/4 bg-gray-100 dark:bg-gray-900 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
                        <div className="max-w-screen-xl mx-auto h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-6">Aperçu Front Office</h3>
                            {step === 1 || step === 2 || step === 3 ? (
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="w-full lg:w-1/2">
                                        <ProductGallery images={formData.images} productName={formData.name || "Produit"} />
                                    </div>
                                    <div className="w-full lg:w-1/2 space-y-4">
                                        <h2 className="text-xs font-bold text-rose-500 uppercase">{formData.brand || "MARQUE"}</h2>
                                        <h1 className="text-3xl font-serif">{formData.name || "Nom du produit"}</h1>
                                        <div className="text-2xl font-light">{finalPrice.toFixed(3)} TND</div>
                                        
                                        {/* Color Preview */}
                                        {formData.colors.length > 0 && (
                                            <div className="space-y-2 mt-4">
                                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Couleurs ({formData.colors.length})</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {formData.colors.map((color, idx) => (
                                                        <div key={idx} className="group relative">
                                                            <div 
                                                                className="w-8 h-8 rounded-full border border-gray-200 shadow-sm cursor-help"
                                                                style={{ backgroundColor: color.hex }}
                                                                title={color.name}
                                                            ></div>
                                                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                                {color.name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-600 mt-4">{formData.description || "Description..."}</p>
                                    </div>
                                </div>
                            ) : (
                                <ProductHighlights highlights={{ title: formData.highlightsTitle, imageUrl: formData.highlightsImage, sections: formData.highlightsSections }} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ name, label, value, onChange, type = 'text', as = 'input', options = [], required = false, readOnly = false }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {as === 'input' && <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} readOnly={readOnly} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" />}
        {as === 'textarea' && <textarea id={name} name={name} value={value} onChange={onChange} rows={6} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500" />}
    </div>
);
