"use client";

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

const filters = ["nearest", "top_rated", "available_now", "female_doctor", "price"];

const FilterBar = () => {
    const t = useTranslations('FilterBar');

    return (
        <div className="sticky top-[52px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-2 px-4 flex gap-2 overflow-x-auto no-scrollbar items-center">
            <button className="p-2 border border-gray-200 rounded-full flex-shrink-0 text-gray-600 hover:bg-gray-50">
                <SlidersHorizontal size={16} />
            </button>
            {filters.map((filterKey, index) => (
                <button
                    key={index}
                    className="whitespace-nowrap px-3.5 py-1.5 border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-100 transition-colors"
                >
                    {t(filterKey)}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
