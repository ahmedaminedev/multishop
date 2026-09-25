
import React from 'react';

// Ce composant a été vidé suite à la suppression des fonctionnalités IA.
// Il ne rend rien pour éviter de casser les imports existants.

interface ProductImageGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (base64Image: string) => void;
    initialImage?: string; 
    productName?: string;
    productCategory?: string;
}

export const ProductImageGeneratorModal: React.FC<ProductImageGeneratorModalProps> = () => {
    return null;
};
