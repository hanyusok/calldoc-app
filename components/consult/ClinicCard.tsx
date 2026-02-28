"use client";

import React from 'react';
import { MapPin, Phone, Star, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface Clinic {
    id: string;
    name: string;
    address: string;
    rating: number;
    phoneNumber: string | null;
    images: string[];
}

export default function ClinicCard({ clinic }: { clinic: Clinic }) {
    const t = useTranslations('ClinicCard');

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 mb-3">
            <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                {clinic.images && clinic.images[0] ? (
                    <img
                        src={clinic.images[0]}
                        alt={clinic.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Building2 size={24} />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{clinic.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md flex-shrink-0 ml-2">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-yellow-700">{clinic.rating.toFixed(1)}</span>
                    </div>
                </div>

                <div className="mt-1 flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{clinic.address}</span>
                </div>

                {clinic.phoneNumber && (
                    <div className="mt-1 flex items-center gap-1 text-gray-500 text-sm">
                        <Phone size={14} className="flex-shrink-0" />
                        <span className="truncate">{clinic.phoneNumber}</span>
                    </div>
                )}

                {/* Future: Add "View Details" or similar button if we have a clinic detail page */}
            </div>
        </div>
    );
}
