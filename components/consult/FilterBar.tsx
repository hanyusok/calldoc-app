'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('filter');

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'available', label: 'Available Now' },
        { id: 'female', label: 'Female Doctor' },
        { id: 'rating', label: 'High Ratings' },
        // { id: 'nearest', label: 'Nearest' }, // Removed for now as mocking logic is weak
    ];

    const handleFilterClick = (filterId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (filterId === 'all') {
            params.delete('filter');
        } else {
            params.set('filter', filterId);
        }
        router.push(`/consult?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
            {filters.map((filter) => {
                const isActive = filter.id === 'all'
                    ? !currentFilter
                    : currentFilter === filter.id;

                return (
                    <button
                        key={filter.id}
                        onClick={() => handleFilterClick(filter.id)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border
                            ${isActive
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {filter.label}
                    </button>
                );
            })}
        </div>
    );
}
