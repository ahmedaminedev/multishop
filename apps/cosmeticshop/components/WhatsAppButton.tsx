import React from 'react';
import { WhatsAppIcon } from './IconComponents';

export const WhatsAppButton: React.FC = () => {
    return (
        <a 
            href="https://wa.me/21655263522"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors duration-300 z-50"
            aria-label="Contacter sur WhatsApp"
        >
            <WhatsAppIcon className="w-8 h-8" />
        </a>
    );
};
