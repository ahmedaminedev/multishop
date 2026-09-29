
import React, { useState, useEffect, useMemo } from 'react';
import type { HeroSlide, ImagePromoAd, AudioPromoAd, MediumPromoAd, CollageItem, Category, Pack, ShoppableVideo } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon } from '../IconComponents';
import { ImageInput } from '../ImageInput';
import { LinkBuilder } from './LinkBuilder';
import type { AdSlot } from './ManageAdsPage';

interface AdEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedData: any) => void;
    slot: AdSlot;
    allCategories?: Category[];
    allPacks?: Pack[];
}

const FormField: React.FC<{ label: string; name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; as?: 'input' | 'textarea' }> = 
({ label, name, value, onChange, type = "text", as="input" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {as === 'input' ? (
             <input type={type} id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
        ) : (
             <textarea id={name} name={name} value={value as string} onChange={onChange} rows={3} className="mt-1 block w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
        )}
    </div>
);

const HeroForm: React.FC<{ data: HeroSlide[], onChange: (newData: HeroSlide[]) => void, allCategories: Category[] }> = ({ data, onChange, allCategories }) => {
    const [activeSlide, setActiveSlide] = useState(0);

    const handleSlideChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        const { name, value } = e.target;
        const newSlides = [...data];
        newSlides[index] = { ...newSlides[index], [name]: value };
        onChange(newSlides);
    };

    const handleImageChange = (value: string, index: number) => {
        const newSlides = [...data];
        newSlides[index] = { ...newSlides[index], bgImage: value };
        onChange(newSlides);
    };

    const handleLinkChange = (value: string, index: number) => {
        const newSlides = [...data];
        newSlides[index] = { ...newSlides[index], link: value };
        onChange(newSlides);
    };

    const addSlide = () => {
        const newSlide = { id: Date.now(), bgImage: "https://picsum.photos/id/10/1200/400", title: "Nouveau Slide", subtitle: "Description du slide", buttonText: "Découvrir", link: "#" };
        onChange([...data, newSlide]);
        setActiveSlide(data.length);
    }
    
    const removeSlide = (index: number) => {
        if (data.length <= 1) {
            alert("Il doit y avoir au moins un slide.");
            return;
        }
        onChange(data.filter((_, i) => i !== index));
        setActiveSlide(prev => Math.max(0, prev -1));
    }
    
    const currentSlideData = data[activeSlide];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 border-b dark:border-gray-600 pb-2 mb-4 flex-wrap">
                {data.map((_, index) => (
                    <button key={index} type="button" onClick={() => setActiveSlide(index)} className={`px-3 py-1 text-sm rounded-md ${activeSlide === index ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        Slide {index + 1}
                    </button>
                ))}
                <button type="button" onClick={addSlide} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><PlusIcon className="w-4 h-4" /></button>
            </div>
            {currentSlideData && (
                 <div className="space-y-4 animate-fadeIn">
                    <FormField label="Titre" name="title" value={currentSlideData.title} onChange={e => handleSlideChange(e, activeSlide)} />
                    <FormField label="Sous-titre" name="subtitle" value={currentSlideData.subtitle} onChange={e => handleSlideChange(e, activeSlide)} />
                    <FormField label="Texte du bouton" name="buttonText" value={currentSlideData.buttonText} onChange={e => handleSlideChange(e, activeSlide)} />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination du bouton</label>
                        <LinkBuilder 
                            value={currentSlideData.link || "#"} 
                            onChange={(url) => handleLinkChange(url, activeSlide)} 
                            allProducts={[]} // Not needed for general links if we rely on categories
                            allCategories={allCategories || []} 
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800 mb-2">
                        <FormField label="URL Vidéo (Optionnel)" name="videoUrl" value={currentSlideData.videoUrl || ''} onChange={e => handleSlideChange(e, activeSlide)} />
                        <p className="text-xs text-gray-500 mt-1">Lien direct .mp4 (ex: Pexels). Si rempli, la vidéo sera jouée en arrière-plan.</p>
                    </div>

                    <ImageInput label="Image de fond (ou Poster si vidéo)" value={currentSlideData.bgImage} onChange={val => handleImageChange(val, activeSlide)} />
                    
                    <button type="button" onClick={() => removeSlide(activeSlide)} className="text-sm text-red-600 hover:underline flex items-center gap-1">
                        <TrashIcon className="w-4 h-4"/> Supprimer ce slide
                    </button>
                </div>
            )}
        </div>
    );
};

const AudioPromoForm: React.FC<{ data: AudioPromoAd[], onChange: (newData: AudioPromoAd[]) => void }> = ({ data, onChange }) => {
    const [activeAd, setActiveAd] = useState(0);
    
    const handleAdChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        const { name, value, type } = e.target;
        const newAds = [...data];
        newAds[index] = { ...newAds[index], [name]: type === 'number' ? parseFloat(value) || 0 : value };
        onChange(newAds);
    };

    const handleImageChange = (value: string, index: number) => {
        const newAds = [...data];
        newAds[index] = { ...newAds[index], image: value };
        onChange(newAds);
    };

    const addAd = () => {
        const newAd = { id: Date.now(), title: "Nouveau Titre", subtitle1: "Sous-titre 1", subtitle2: "Sous-titre 2", image: "https://picsum.photos/seed/newaudio/800/400", background: "from-blue-500 to-green-500", duration: 8 };
        onChange([...data, newAd]);
        setActiveAd(data.length);
    }
    
    const removeAd = (index: number) => {
        if (data.length <= 1) {
            alert("Il doit y avoir au moins une publicité.");
            return;
        }
        onChange(data.filter((_, i) => i !== index));
        setActiveAd(prev => Math.max(0, prev - 1));
    }
    
    const currentAdData = data[activeAd];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 border-b dark:border-gray-600 pb-2 mb-4 flex-wrap">
                {data.map((_, index) => (
                    <button key={index} type="button" onClick={() => setActiveAd(index)} className={`px-3 py-1 text-sm rounded-md ${activeAd === index ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        Publicité {index + 1}
                    </button>
                ))}
                <button type="button" onClick={addAd} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><PlusIcon className="w-4 h-4" /></button>
            </div>
            {currentAdData && (
                 <div className="space-y-4 animate-fadeIn">
                    <FormField label="Titre" name="title" value={currentAdData.title} onChange={e => handleAdChange(e, activeAd)} />
                    <FormField label="Sous-titre 1" name="subtitle1" value={currentAdData.subtitle1} onChange={e => handleAdChange(e, activeAd)} />
                    <FormField label="Sous-titre 2" name="subtitle2" value={currentAdData.subtitle2} onChange={e => handleAdChange(e, activeAd)} />
                    <ImageInput label="Image" value={currentAdData.image} onChange={val => handleImageChange(val, activeAd)} />
                    <FormField label="Dégradé de fond (tailwind)" name="background" value={currentAdData.background} onChange={e => handleAdChange(e, activeAd)} />
                    <FormField label="Durée (secondes)" name="duration" type="number" value={currentAdData.duration} onChange={e => handleAdChange(e, activeAd)} />
                    <button type="button" onClick={() => removeAd(activeAd)} className="text-sm text-red-600 hover:underline flex items-center gap-1">
                        <TrashIcon className="w-4 h-4"/> Supprimer cette publicité
                    </button>
                </div>
            )}
        </div>
    );
};

const CollageForm: React.FC<{ data: CollageItem[], onChange: (newData: CollageItem[]) => void, allCategories: Category[] }> = ({ data, onChange, allCategories }) => {
    const handleAdChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target;
        const newAds = [...data];
        // @ts-ignore
        newAds[index] = { ...newAds[index], [name]: value };
        onChange(newAds);
    };

    const handleImageChange = (value: string, index: number) => {
        const newAds = [...data];
        newAds[index] = { ...newAds[index], imageUrl: value };
        onChange(newAds);
    };

    const handleLinkChange = (value: string, index: number) => {
        const newAds = [...data];
        newAds[index] = { ...newAds[index], link: value };
        onChange(newAds);
    };

    const addAd = () => {
        const newAd: CollageItem = { id: Date.now(), imageUrl: "https://picsum.photos/400/400", link: "#", size: 'small', title: 'Titre' };
        onChange([...data, newAd]);
    }
    
    const removeAd = (index: number) => {
        onChange(data.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ajoutez des images au collage. Utilisez "Taille" pour définir la structure (ex: 2x2, 1x2, 2x1).</p>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {data.map((ad, index) => (
                    <div key={ad.id} className="p-4 border rounded-md dark:border-gray-600 space-y-3 relative bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Image {index + 1}</h4>
                            <button type="button" onClick={() => removeAd(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <ImageInput label="Image" value={ad.imageUrl} onChange={val => handleImageChange(val, index)} />
                            </div>
                            <div className="space-y-3">
                                <FormField label="Titre" name="title" value={ad.title || ''} onChange={e => handleAdChange(e, index)} />
                                <FormField label="Sous-titre" name="subtitle" value={ad.subtitle || ''} onChange={e => handleAdChange(e, index)} />
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lien de destination</label>
                                    <LinkBuilder 
                                        value={ad.link} 
                                        onChange={(url) => handleLinkChange(url, index)} 
                                        allProducts={[]} 
                                        allCategories={allCategories} 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Taille / Format</label>
                                    <select 
                                        name="size" 
                                        value={ad.size} 
                                        onChange={e => handleAdChange(e, index)}
                                        className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="small">Petit Carré (1x1)</option>
                                        <option value="large">Grand Carré (2x2)</option>
                                        <option value="tall">Portrait / Haut (1x2)</option>
                                        <option value="wide">Paysage / Large (2x1)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addAd} className="w-full text-sm text-green-600 dark:text-green-400 hover:underline flex items-center justify-center gap-1 mt-2 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                <PlusIcon className="w-4 h-4" /> Ajouter une image au collage
            </button>
        </div>
    );
};

const ShoppableVideosForm: React.FC<{ data: ShoppableVideo[], onChange: (newData: ShoppableVideo[]) => void }> = ({ data, onChange }) => {
    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        const { name, value } = e.target;
        const newVideos = [...data];
        // @ts-ignore
        newVideos[index] = { ...newVideos[index], [name]: value };
        onChange(newVideos);
    };

    const handleImageChange = (value: string, index: number) => {
        const newVideos = [...data];
        newVideos[index] = { ...newVideos[index], thumbnailUrl: value };
        onChange(newVideos);
    };

    const addVideo = () => {
        const newVideo: ShoppableVideo = { 
            id: Date.now(), 
            thumbnailUrl: "https://picsum.photos/400/700", 
            videoUrl: "", 
            username: "@utilisateur", 
            description: "Description de la vidéo",
            productIds: []
        };
        onChange([...data, newVideo]);
    }
    
    const removeVideo = (index: number) => {
        onChange(data.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les vidéos verticales (style Reels/TikTok) de la page d'accueil.</p>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {data.map((video, index) => (
                    <div key={video.id} className="p-4 border rounded-md dark:border-gray-600 space-y-3 relative bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Vidéo {index + 1}</h4>
                            <button type="button" onClick={() => removeVideo(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <ImageInput label="Miniature (Poster)" value={video.thumbnailUrl} onChange={val => handleImageChange(val, index)} />
                            </div>
                            <div className="space-y-3">
                                <FormField label="Nom d'utilisateur" name="username" value={video.username} onChange={e => handleVideoChange(e, index)} />
                                <FormField label="Description / Texte" name="description" value={video.description} onChange={e => handleVideoChange(e, index)} />
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                                    <FormField label="URL Vidéo MP4" name="videoUrl" value={video.videoUrl} onChange={e => handleVideoChange(e, index)} />
                                    <p className="text-xs text-gray-500 mt-1">Lien direct vers un fichier .mp4 (ex: depuis Pexels ou votre CDN).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addVideo} className="w-full text-sm text-green-600 dark:text-green-400 hover:underline flex items-center justify-center gap-1 mt-2 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                <PlusIcon className="w-4 h-4" /> Ajouter une vidéo
            </button>
        </div>
    );
};

const PromoBannerForm: React.FC<{data: MediumPromoAd, onChange: (newData: MediumPromoAd) => void, allCategories: Category[] }> = ({ data, onChange, allCategories }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        let { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    const handleImageChange = (value: string) => {
        onChange({ ...data, image: value });
    };

    const handleLinkChange = (value: string) => {
        onChange({ ...data, link: value });
    };

    return (
        <div className="space-y-4">
            <FormField label="Titre" name="title" value={data.title} onChange={handleChange} />
            <FormField label="Sous-titre" name="subtitle" value={data.subtitle} onChange={handleChange} />
            <FormField label="Texte du bouton" name="buttonText" value={data.buttonText} onChange={handleChange} />
            <ImageInput label="Image" value={data.image} onChange={handleImageChange} />
            
            <div className="pt-4 border-t dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lien de destination</label>
                <LinkBuilder 
                    value={data.link || "#"} 
                    onChange={handleLinkChange} 
                    allProducts={[]} 
                    allCategories={allCategories || []} 
                />
            </div>
        </div>
    );
};


export const AdEditModal: React.FC<AdEditModalProps> = ({ isOpen, onClose, onSave, slot, allCategories, allPacks }) => {
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (slot) {
            // Deep copy to prevent direct mutation
            setFormData(JSON.parse(JSON.stringify(slot.data)));
        }
    }, [slot]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const renderForm = () => {
        if (!formData) return null;

        switch(slot.type) {
            case 'hero':
                return <HeroForm data={formData} onChange={setFormData} allCategories={allCategories || []} />;
            case 'audioPromo':
                return <AudioPromoForm data={formData} onChange={setFormData} />;
            case 'promoBanner':
                 return <PromoBannerForm data={formData} onChange={setFormData} allCategories={allCategories!} />;
            case 'editorialCollage':
                return <CollageForm data={formData} onChange={setFormData} allCategories={allCategories || []} />;
            case 'shoppableVideos':
                return <ShoppableVideosForm data={formData} onChange={setFormData} />;
            case 'smallPromoBanners':
                return <div>Ancien format déprécié (Small Promo Banners). Veuillez utiliser Editorial Collage.</div>;
            default:
                return <div>Type de formulaire non reconnu.</div>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">Modifier: {slot.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {renderForm()}
                </div>
                <div className="flex justify-end p-4 border-t dark:border-gray-700 gap-3 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                    <button type="button" onClick={handleSave} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Sauvegarder</button>
                </div>
            </div>
        </div>
    );
}

// Simple fade-in animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}
`;
document.head.appendChild(style);