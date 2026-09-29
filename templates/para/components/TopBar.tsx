import React from 'react';
import type { User } from '../types';

interface TopBarProps {
    user?: User | null;
    onNavigateToAdmin?: () => void;
    onNavigateToStores?: () => void;
}

// TopBar has been removed as requested (Point 1: Supprimer le navbar qui contient CONSEIL EXPERT / contact / Nos Pharmacies)
export const TopBar: React.FC<TopBarProps> = () => {
    return null;
};