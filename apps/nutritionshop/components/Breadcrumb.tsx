
import React from 'react';
import { ChevronRightIcon } from './IconComponents';

interface BreadcrumbItem {
    name: string;
    href?: string;
    onClick?: () => void;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav aria-label="breadcrumb">
            <ol className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && <ChevronRightIcon className="w-3 h-3 mx-2 text-gray-600" />}
                        {item.href || item.onClick ? (
                            <a
                                href={item.href || '#'}
                                onClick={(e) => {
                                    if (item.onClick) {
                                        e.preventDefault();
                                        item.onClick();
                                    }
                                }}
                                className="hover:text-brand-neon transition-colors"
                            >
                                {item.name}
                            </a>
                        ) : (
                            <span className="text-black dark:text-white">{item.name}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};
