
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
            <ol className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && <ChevronRightIcon className="w-4 h-4 mx-1 text-gray-400" />}
                        {item.href || item.onClick ? (
                            <a
                                href={item.href || '#'}
                                onClick={(e) => {
                                    if (item.onClick) {
                                        e.preventDefault();
                                        item.onClick();
                                    }
                                }}
                                className="hover:text-red-600 hover:underline transition-colors"
                            >
                                {item.name}
                            </a>
                        ) : (
                            <span className="font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};