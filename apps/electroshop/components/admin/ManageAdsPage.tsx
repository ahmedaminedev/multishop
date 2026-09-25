
import React, { useState, useEffect, useMemo } from 'react';
import type { Advertisements, Product, Pack, Category } from '../../types';

import { HeroSection } from '../HeroSection';
import { TrustBadges } from '../TrustBadges';
import { DestockageCarousel } from '../DestockageBanner';
import { ProductCarousel } from '../ProductCarousel';
import { AudioPromoBanner } from '../AudioPromoBanner';
import { MediumPromoBanner } from '../MediumPromoBanner';
import { SmallPromoBanners } from '../SmallPromoBanners';

import { EditableAdWrapper } from './EditableAdWrapper';
import { AdEditModal } from './AdEditModal';

interface ManageAdsPageProps {
    initialAds: Advertisements;
    onSave: (newAds: Advertisements) => void;
    allProducts: Product[];
    allPacks: Pack[];
    allCategories: Category[];
}

export type AdSlot = {
    name: string;
    type: 'hero' | 'destockage' | 'audioPromo' | 'promoBanner' | 'smallPromoBanners';
    data: any;
    index?: number; // Used for individual banners
};

export const ManageAdsPage: React.FC<ManageAdsPageProps> = ({ initialAds, onSave, allProducts, allPacks, allCategories }) => {
    const [currentAds, setCurrentAds] = useState(initialAds);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);

    useEffect(() => {
        setCurrentAds(initialAds);
    }, [initialAds]);

    const handleOpenModal = (slot: AdSlot) => {
        setEditingSlot(slot);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSlot(null);
    };

    const handleSaveFromModal = (updatedData: any) => {
        if (!editingSlot) return;

        const newAds = JSON.parse(JSON.stringify(currentAds));
        
        switch(editingSlot.type) {
            case 'hero':
                newAds.heroSlides = updatedData;
                break;
            case 'destockage':
                newAds.destockage = updatedData;
                break;
            case 'audioPromo':
                newAds.audioPromo = updatedData;
                break;
            case 'promoBanner':
                newAds.promoBanners[editingSlot.index!] = updatedData;
                break;
            case 'smallPromoBanners':
                 newAds.smallPromoBanners = updatedData;
                break;
        }

        setCurrentAds(newAds);
        onSave(newAds);
        handleCloseModal();
    };

    const newArrivalProducts = useMemo(() => allProducts.slice(3, 8), [allProducts]);
    const summerSelectionProducts = useMemo(() => allProducts.slice(8, 12), [allProducts]);
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestionnaire de Publicités Interactif</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Survolez une section publicitaire dans l'aperçu ci-dessous et cliquez sur "Modifier" pour changer son contenu.</p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto space-y-12">
                    <EditableAdWrapper slotName="Carrousel Principal" onEdit={() => handleOpenModal({ name: 'Carrousel Principal (Hero)', type: 'hero', data: currentAds.heroSlides })}>
                        <HeroSection slides={currentAds.heroSlides} />
                    </EditableAdWrapper>
                    
                    <TrustBadges />

                    <EditableAdWrapper slotName="Carrousel Destockage" onEdit={() => handleOpenModal({ name: 'Carrousel Destockage', type: 'destockage', data: currentAds.destockage })}>
                        <DestockageCarousel ads={currentAds.destockage} />
                    </EditableAdWrapper>

                    <ProductCarousel 
                        title="Nouvelles Arrivées (Aperçu non-éditable)" 
                        products={newArrivalProducts} 
                        onPreview={() => {}} 
                        onNavigateToProductDetail={() => {}}
                    />

                    <EditableAdWrapper slotName="Promo Audio" onEdit={() => handleOpenModal({ name: 'Carrousel Promo Audio', type: 'audioPromo', data: currentAds.audioPromo })}>
                        <AudioPromoBanner ads={currentAds.audioPromo} />
                    </EditableAdWrapper>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <EditableAdWrapper slotName="Bannière Moyenne 1" onEdit={() => handleOpenModal({ name: `Bannière Moyenne 1`, type: 'promoBanner', data: currentAds.promoBanners[0], index: 0 })}>
                            <MediumPromoBanner banner={currentAds.promoBanners[0]} isPreview allProducts={allProducts} allPacks={allPacks} onPreview={() => {}}/>
                        </EditableAdWrapper>
                        <EditableAdWrapper slotName="Bannière Moyenne 2" onEdit={() => handleOpenModal({ name: `Bannière Moyenne 2`, type: 'promoBanner', data: currentAds.promoBanners[1], index: 1 })}>
                            <MediumPromoBanner banner={currentAds.promoBanners[1]} isPreview allProducts={allProducts} allPacks={allPacks} onPreview={() => {}}/>
                        </EditableAdWrapper>
                    </div>
                    
                    <EditableAdWrapper slotName="Carrousel d'images promotionnelles" onEdit={() => handleOpenModal({ name: 'Carrousel d\'images', type: 'smallPromoBanners', data: currentAds.smallPromoBanners })}>
                        <SmallPromoBanners ads={currentAds.smallPromoBanners} isPreview />
                    </EditableAdWrapper>

                    <ProductCarousel 
                        title="Sélection d'été (Aperçu non-éditable)" 
                        products={summerSelectionProducts} 
                        onPreview={() => {}} 
                        onNavigateToProductDetail={() => {}}
                    />
                </div>
            </div>

            {editingSlot && (
                <AdEditModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveFromModal}
                    slot={editingSlot}
                    allCategories={allCategories}
                    allPacks={allPacks}
                />
            )}
        </div>
    );
};
