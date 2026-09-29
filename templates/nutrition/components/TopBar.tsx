
import React from 'react';
import type { User } from '../types';

interface TopBarProps {
    user?: User | null;
    onNavigateToAdmin?: () => void;
    onNavigateToStores?: () => void;
}

export const TopBar: React.FC<TopBarProps> = () => {
    return null;
};
