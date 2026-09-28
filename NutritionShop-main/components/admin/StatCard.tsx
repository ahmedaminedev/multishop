import React from 'react';
import { ArrowUpRightIcon, ArrowDownRightIcon } from '../IconComponents';

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
    icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
                {change && (
                    <div className="flex items-center mt-2 text-xs">
                        {changeType === 'increase' && <ArrowUpRightIcon className="w-4 h-4 text-green-500" />}
                        {changeType === 'decrease' && <ArrowDownRightIcon className="w-4 h-4 text-red-500" />}
                        <span className={`ml-1 font-semibold ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
                        <span className="ml-1 text-gray-500">vs mois dernier</span>
                    </div>
                )}
            </div>
            <div className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-full">
                {icon}
            </div>
        </div>
    );
};
